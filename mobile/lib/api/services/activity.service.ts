/**
 * Activity Service
 * 
 * PURPOSE: Track and display real-time trip activity feed
 * WHAT IT DOES: Aggregates member joins, itinerary changes, and announcements into a unified activity stream
 * USED BY: Admin dashboard overview tab, activity feeds
 */

import { supabase } from '../../supabase';
import { TripMembershipRow, ItineraryItemRow, AnnouncementRow } from '../../../types/db';
import { formatTimeAgo } from '../utils/helpers';

export interface ActivityItem {
    type: 'member_joined' | 'itinerary_created' | 'itinerary_updated' | 'announcement';
    message: string;
    time: string;
    timestamp: string;
    metadata?: any;
}

const THIRTY_DAYS_AGO = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
};

/**
 * Get recent activity for a trip (last 30 days)
 */
export async function getTripActivity(tripId: string, limit = 20): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    try {
        // Fetch all activity types in parallel
        const [memberships, itineraryItems, announcements] = await Promise.all([
            fetchMemberJoins(tripId),
            fetchItineraryChanges(tripId),
            fetchAnnouncements(tripId)
        ]);

        activities.push(...memberships, ...itineraryItems, ...announcements);

        // Sort by most recent first and limit
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching trip activity:', error);
        return [];
    }
}

async function fetchMemberJoins(tripId: string): Promise<ActivityItem[]> {
    const { data } = await supabase
        .from('trip_memberships')
        .select('*, profiles:user_id(name)')
        .eq('trip_id', tripId)
        .gte('joined_at', THIRTY_DAYS_AGO())
        .order('joined_at', { ascending: false })
        .limit(10);

    return (data || []).map(m => ({
        type: 'member_joined' as const,
        message: `${(m.profiles as any)?.name || 'Unknown User'} joined the trip`,
        time: formatTimeAgo(m.joined_at!),
        timestamp: m.joined_at!,
        metadata: { userId: m.user_id }
    }));
}

async function fetchItineraryChanges(tripId: string): Promise<ActivityItem[]> {
    const { data } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .gte('created_at', THIRTY_DAYS_AGO())
        .order('created_at', { ascending: false })
        .limit(10);

    return (data || []).map(item => {
        const isNew = new Date(item.updated_at!).getTime() - new Date(item.created_at!).getTime() < 60000;
        const type: 'itinerary_created' | 'itinerary_updated' = isNew ? 'itinerary_created' : 'itinerary_updated';
        return {
            type,
            message: `${isNew ? 'New activity added' : 'Activity updated'}: "${item.title}"`,
            time: formatTimeAgo(item.updated_at!),
            timestamp: item.updated_at!,
            metadata: { itemId: item.id, title: item.title }
        };
    });
}

async function fetchAnnouncements(tripId: string): Promise<ActivityItem[]> {
    const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(5);

    const recipientCount = await getActiveMemberCount(tripId);

    return (data || []).map(a => ({
        type: 'announcement' as const,
        message: a.sent_at
            ? `Announcement sent: "${a.title}" to ${recipientCount} members`
            : `Announcement scheduled: "${a.title}"`,
        time: formatTimeAgo(a.sent_at || a.created_at!),
        timestamp: a.sent_at || a.created_at!,
        metadata: { announcementId: a.id, title: a.title, isPriority: a.is_high_priority }
    }));
}

async function getActiveMemberCount(tripId: string): Promise<number> {
    const { count } = await supabase
        .from('trip_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .is('left_at', null);
    return count || 0;
}


/**
 * Subscribe to real-time activity updates for a trip
 * Returns unsubscribe function for cleanup
 */
export function subscribeToTripActivity(
    tripId: string,
    onActivity: (activity: ActivityItem) => void
) {
    const channels = [
        // Member joins
        supabase.channel(`memberships-${tripId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'trip_memberships', filter: `trip_id=eq.${tripId}` },
                async (payload) => {
                    const m = payload.new as TripMembershipRow;
                    const { data: profile } = await supabase.from('profiles').select('name').eq('user_id', m.user_id).single();
                    onActivity({
                        type: 'member_joined',
                        message: `${profile?.name || 'Unknown User'} joined the trip`,
                        time: 'Just now',
                        timestamp: m.joined_at!,
                        metadata: { userId: m.user_id }
                    });
                }
            )
            .subscribe(),

        // Itinerary changes
        supabase.channel(`itinerary-${tripId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'itinerary_items', filter: `trip_id=eq.${tripId}` },
                (payload) => {
                    const item = payload.new as ItineraryItemRow;
                    const type = payload.eventType === 'INSERT' ? 'itinerary_created' : 'itinerary_updated';
                    onActivity({
                        type,
                        message: `${type === 'itinerary_created' ? 'New activity added' : 'Activity updated'}: "${item.title}"`,
                        time: 'Just now',
                        timestamp: item.updated_at || item.created_at!,
                        metadata: { itemId: item.id, title: item.title }
                    });
                }
            )
            .subscribe(),

        // Announcements
        supabase.channel(`announcements-${tripId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'announcements', filter: `trip_id=eq.${tripId}` },
                async (payload) => {
                    const a = payload.new as AnnouncementRow;
                    const count = await getActiveMemberCount(tripId);
                    onActivity({
                        type: 'announcement',
                        message: a.sent_at ? `Announcement sent: "${a.title}" to ${count} members` : `Announcement scheduled: "${a.title}"`,
                        time: 'Just now',
                        timestamp: a.sent_at || a.created_at!,
                        metadata: { announcementId: a.id, title: a.title }
                    });
                }
            )
            .subscribe()
    ];

    return () => channels.forEach(c => c.unsubscribe());
}
