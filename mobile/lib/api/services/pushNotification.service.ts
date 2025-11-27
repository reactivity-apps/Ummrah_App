/**
 * Push Notification Service
 * 
 * PURPOSE: Send push notifications to trip members for announcements
 * WHAT IT DOES: Manages device tokens, batches notifications, handles errors, creates deep links
 * USED BY: Announcement service, notification settings
 */

import { supabase } from '../../supabase';
import { AnnouncementRow } from '../../../types/db';
import * as Notifications from 'expo-notifications';

/**
 * Store or update a user's push notification token
 */
export async function registerPushToken(userId: string, pushToken: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Upsert token (insert or update if exists)
        const { error } = await supabase
            .from('push_tokens')
            .upsert({
                user_id: userId,
                push_token: pushToken,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id',
            });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

/**
 * Remove a user's push token (on logout or token invalidation)
 */
export async function unregisterPushToken(userId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const { error } = await supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', userId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

/**
 * Get all push tokens for trip members
 */
async function getTripMemberTokens(tripId: string): Promise<{
    userId: string;
    pushToken: string;
    name?: string;
}[]> {
    try {
        // Get all active trip members
        const { data: memberships, error: membershipError } = await supabase
            .from('trip_memberships')
            .select(`
                user_id,
                profiles:user_id (name)
            `)
            .eq('trip_id', tripId)
            .is('left_at', null);

        if (membershipError || !memberships) {
            console.error('Error fetching trip members:', membershipError);
            return [];
        }

        // Get push tokens for these users
        const userIds = memberships.map(m => m.user_id);
        const { data: tokens, error: tokensError } = await supabase
            .from('push_tokens')
            .select('user_id, push_token')
            .in('user_id', userIds);

        if (tokensError || !tokens) {
            console.error('Error fetching push tokens:', tokensError);
            return [];
        }

        // Combine data
        return tokens.map(token => ({
            userId: token.user_id,
            pushToken: token.push_token,
            name: (memberships.find(m => m.user_id === token.user_id)?.profiles as any)?.name
        }));
    } catch (err) {
        console.error('Error in getTripMemberTokens:', err);
        return [];
    }
}

/**
 * Send push notification to a single device
 */
async function sendPushNotificationToDevice(
    pushToken: string,
    announcement: AnnouncementRow
): Promise<{ success: boolean; error?: string }> {
    try {
        // Prepare notification payload
        const message = {
            to: pushToken,
            sound: 'default',
            title: announcement.title,
            body: announcement.body.substring(0, 120) + (announcement.body.length > 120 ? '...' : ''),
            data: {
                type: 'announcement',
                announcementId: announcement.id,
                tripId: announcement.trip_id,
                deepLink: `ummrah://announcements/${announcement.id}`,
            },
            priority: announcement.is_high_priority ? 'high' : 'normal',
            badge: 1,
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        // Check for errors
        if (result.data?.status === 'error') {
            return { success: false, error: result.data.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: `Push send error: ${err}` };
    }
}

/**
 * Clean up invalid push tokens from database
 */
async function cleanupInvalidToken(userId: string): Promise<void> {
    try {
        await supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', userId);

        console.log(`Cleaned up invalid token for user ${userId}`);
    } catch (err) {
        console.error('Error cleaning up token:', err);
    }
}

/**
 * Send push notifications for an announcement to all trip members
 * Batches requests for efficiency and handles errors
 */
export async function sendAnnouncementPushNotifications(
    announcement: AnnouncementRow
): Promise<{
    sent: number;
    failed: number;
    errors: string[];
}> {
    const results = {
        sent: 0,
        failed: 0,
        errors: [] as string[],
    };

    try {
        // Get all trip member tokens
        const memberTokens = await getTripMemberTokens(announcement.trip_id);

        if (memberTokens.length === 0) {
            console.log('No push tokens found for trip members');
            return results;
        }

        console.log(`Sending push notifications to ${memberTokens.length} members`);

        // Send in batches of 100 to avoid overwhelming the push service
        const BATCH_SIZE = 100;
        const batches = [];

        for (let i = 0; i < memberTokens.length; i += BATCH_SIZE) {
            batches.push(memberTokens.slice(i, i + BATCH_SIZE));
        }

        // Process each batch
        for (const batch of batches) {
            const promises = batch.map(async ({ userId, pushToken, name }) => {
                const result = await sendPushNotificationToDevice(pushToken, announcement);

                if (result.success) {
                    results.sent++;
                    console.log(`✓ Sent notification to ${name || userId}`);
                } else {
                    results.failed++;
                    results.errors.push(`Failed for ${name || userId}: ${result.error}`);

                    // Clean up invalid tokens
                    if (result.error?.includes('DeviceNotRegistered') ||
                        result.error?.includes('InvalidToken')) {
                        await cleanupInvalidToken(userId);
                    }
                }
            });

            // Wait for batch to complete before moving to next
            await Promise.all(promises);

            // Small delay between batches to avoid rate limiting
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`Push notification summary: ${results.sent} sent, ${results.failed} failed`);
        return results;
    } catch (err) {
        console.error('Error sending push notifications:', err);
        results.errors.push(`Unexpected error: ${err}`);
        return results;
    }
}

/**
 * Request push notification permissions and get token
 * Should be called during app initialization or settings
 */
export async function requestPushNotificationPermissions(): Promise<{
    success: boolean;
    token?: string;
    error?: string;
}> {
    try {
        // Check if we have permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permission if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return { success: false, error: 'Permission not granted' };
        }

        // Get push token
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;

        // Register token with our backend
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await registerPushToken(user.id, token);
        }

        return { success: true, token };
    } catch (err) {
        return { success: false, error: `Failed to get push token: ${err}` };
    }
}

/**
 * Configure notification behavior for the app
 */
export function configureNotifications(): void {
    Notifications.setNotificationHandler({
        handleNotification: async () => {
            return {
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            };
        },
    });
}
