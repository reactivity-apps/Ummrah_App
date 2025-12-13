/**
 * Announcement Service
 * 
 * PURPOSE: Manage trip announcements with push notifications
 * WHAT IT DOES: CRUD operations for announcements, scheduling, permission checks, push notification triggers
 * USED BY: Admin dashboard, announcements screen, push notification system
 */

import { supabase } from '../../supabase';
import type { AnnouncementRow } from '../../../types/db';
import { verifyAdminPermission } from '../utils/helpers';
import { getCachedUser } from '../utils/authCache';
import { sendAnnouncementPushNotifications } from './pushNotification.service';

export interface AnnouncementInput {
    trip_id: string;
    title: string;
    body: string;
    link_url?: string | null;
    media_reference?: string | null;
    is_high_priority?: boolean;
    scheduled_for?: string | null; // ISO timestamp
}

export type AnnouncementStatus = 'scheduled' | 'sent' | 'draft';

/**
 * Get announcement status based on timestamps
 */
export function getAnnouncementStatus(announcement: AnnouncementRow): AnnouncementStatus {
    if (announcement.sent_at) return 'sent';
    if (announcement.scheduled_for) {
        const scheduledTime = new Date(announcement.scheduled_for).getTime();
        const now = Date.now();
        if (scheduledTime > now) return 'scheduled';
    }
    return 'sent'; // Immediate delivery if no scheduling
}

/**
 * Fetch all announcements for a trip (admin view)
 */
export async function getAnnouncementsForTrip(tripId: string): Promise<{
    data?: AnnouncementRow[];
    error?: string;
}> {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: false });

        if (error) return { error: `Failed to fetch announcements: ${error.message}` };
        return { data: data || [] };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

/**
 * Fetch announcements for a trip that user can see (user view)
 * Only returns sent announcements or scheduled ones that have passed
 */
export async function getVisibleAnnouncementsForTrip(tripId: string): Promise<{
    data?: AnnouncementRow[];
    error?: string;
}> {
    try {
        // Verify user is a member of this trip
        const user = await getCachedUser();
        if (!user) return { error: 'Not authenticated' };

        const { data: membership, error: membershipError } = await supabase
            .from('trip_memberships')
            .select('trip_id')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .is('left_at', null)
            .maybeSingle();

        if (membershipError || !membership) {
            return { error: 'You are not a member of this trip' };
        }

        // Fetch sent announcements
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('trip_id', tripId)
            .not('sent_at', 'is', null)
            .order('sent_at', { ascending: false });

        if (error) return { error: `Failed to fetch announcements: ${error.message}` };
        return { data: data || [] };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

/**
 * Create a new announcement
 * Triggers immediate push notification if not scheduled
 */
export async function createAnnouncement(input: AnnouncementInput): Promise<{
    data?: AnnouncementRow;
    error?: string;
}> {
    const permission = await verifyAdminPermission(input.trip_id);
    if (!permission.hasPermission) return { error: permission.error || 'Permission denied' };

    try {
        // Determine if this should send immediately or be scheduled
        const shouldSendNow = !input.scheduled_for;
        const sent_at = shouldSendNow ? new Date().toISOString() : null;

        const { data, error } = await supabase
            .from('announcements')
            .insert({
                trip_id: input.trip_id,
                title: input.title,
                body: input.body,
                link_url: input.link_url,
                media_reference: input.media_reference,
                is_high_priority: input.is_high_priority || false,
                scheduled_for: input.scheduled_for,
                sent_at,
                created_by: permission.userId,
            })
            .select()
            .single();

        if (error) return { error: `Failed to create announcement: ${error.message}` };

        // Send push notifications if immediate delivery
        if (shouldSendNow && data) {
            await sendAnnouncementPushNotifications(data);
        }

        return { data };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
    announcementId: string,
    updates: Partial<AnnouncementInput>
): Promise<{
    data?: AnnouncementRow;
    error?: string;
}> {
    try {
        // Fetch announcement to verify trip_id
        const { data: existing, error: fetchError } = await supabase
            .from('announcements')
            .select('trip_id, sent_at')
            .eq('id', announcementId)
            .maybeSingle();

        if (fetchError || !existing) return { error: 'Announcement not found' };

        // Verify permissions
        const permission = await verifyAdminPermission(existing.trip_id);
        if (!permission.hasPermission) return { error: permission.error || 'Permission denied' };

        // Don't allow editing already sent announcements
        if (existing.sent_at) {
            return { error: 'Cannot edit announcements that have already been sent' };
        }

        const { data, error } = await supabase
            .from('announcements')
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.body !== undefined && { body: updates.body }),
                ...(updates.link_url !== undefined && { link_url: updates.link_url }),
                ...(updates.media_reference !== undefined && { media_reference: updates.media_reference }),
                ...(updates.is_high_priority !== undefined && { is_high_priority: updates.is_high_priority }),
                ...(updates.scheduled_for !== undefined && { scheduled_for: updates.scheduled_for }),
            })
            .eq('id', announcementId)
            .select()
            .single();

        if (error) return { error: `Failed to update announcement: ${error.message}` };
        return { data };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

/**
 * Delete an announcement (admin only)
 */
export async function deleteAnnouncement(announcementId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Fetch announcement to verify trip_id
        const { data: existing, error: fetchError } = await supabase
            .from('announcements')
            .select('trip_id')
            .eq('id', announcementId)
            .maybeSingle();

        if (fetchError || !existing) return { success: false, error: 'Announcement not found' };

        const permission = await verifyAdminPermission(existing.trip_id);
        if (!permission.hasPermission) return { success: false, error: permission.error || 'Permission denied' };

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);

        if (error) return { success: false, error: `Failed to delete announcement: ${error.message}` };
        return { success: true };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

/**
 * Manually trigger a scheduled announcement to be sent immediately
 */
export async function sendScheduledAnnouncement(announcementId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Fetch announcement
        const { data: announcement, error: fetchError } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', announcementId)
            .maybeSingle();

        if (fetchError || !announcement) return { success: false, error: 'Announcement not found' };

        // Verify permissions
        const permission = await verifyAdminPermission(announcement.trip_id);
        if (!permission.hasPermission) return { success: false, error: permission.error || 'Permission denied' };

        // Don't send if already sent
        if (announcement.sent_at) {
            return { success: false, error: 'Announcement already sent' };
        }

        // Update sent_at
        const { data: updated, error: updateError } = await supabase
            .from('announcements')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', announcementId)
            .select()
            .single();

        if (updateError) return { success: false, error: `Failed to send announcement: ${updateError.message}` };

        // Send push notifications
        if (updated) {
            await sendAnnouncementPushNotifications(updated);
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

/**
 * Check for scheduled announcements that need to be sent
 * Should be called periodically by a background job
 */
export async function processScheduledAnnouncements(): Promise<{
    sent: number;
    errors: string[];
}> {
    try {
        const now = new Date().toISOString();

        // Fetch announcements that are scheduled and past their scheduled time
        const { data: scheduledAnnouncements, error } = await supabase
            .from('announcements')
            .select('*')
            .is('sent_at', null)
            .not('scheduled_for', 'is', null)
            .lte('scheduled_for', now);

        if (error) {
            console.error('Error fetching scheduled announcements:', error);
            return { sent: 0, errors: [error.message] };
        }

        const errors: string[] = [];
        let sent = 0;

        for (const announcement of scheduledAnnouncements || []) {
            // Update sent_at
            const { error: updateError } = await supabase
                .from('announcements')
                .update({ sent_at: now })
                .eq('id', announcement.id);

            if (updateError) {
                errors.push(`Failed to update announcement ${announcement.id}: ${updateError.message}`);
                continue;
            }

            // Send push notifications
            try {
                await sendAnnouncementPushNotifications({ ...announcement, sent_at: now });
                sent++;
            } catch (pushError) {
                errors.push(`Failed to send push for announcement ${announcement.id}: ${pushError}`);
            }
        }

        return { sent, errors };
    } catch (err) {
        return { sent: 0, errors: [`Unexpected error: ${err}`] };
    }
}

/**
 * Subscribe to real-time announcement changes for a trip
 */
export function subscribeToAnnouncementChanges(
    tripId: string,
    onUpdate: (payload: any) => void,
    onError?: (error: any) => void
): () => void {
    const channel = supabase
        .channel(`announcements:${tripId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'announcements', filter: `trip_id=eq.${tripId}` },
            onUpdate
        )
        .subscribe((status, err) => {
            if (status === 'CHANNEL_ERROR' && onError) {
                onError(err || new Error('Failed to subscribe'));
            }
        });

    return () => supabase.removeChannel(channel);
}
