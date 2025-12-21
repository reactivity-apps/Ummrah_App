/**
 * Trip Management Service
 * 
 * Handles CRUD operations for trips including:
 * - Creating new trips
 * - Updating trip details
 * - Deleting trips
 * - Fetching user's trips
 * - Permission verification
 */

import { supabase } from '../../supabase';
import { TripRow } from '../../../types/db';
import { getCachedUser } from '../utils/authCache';

export interface TripInput {
    group_id: string;
    name: string;
    start_date?: string | null;
    end_date?: string | null;
    base_city?: string | null;
    visibility?: 'draft' | 'published' | 'active';
}

export interface TripUpdateInput {
    name?: string;
    start_date?: string | null;
    end_date?: string | null;
    base_city?: string | null;
    visibility?: 'draft' | 'published' | 'active';
}

/**
 * Create a new trip and automatically add creator as member
 */
export async function createTrip(input: TripInput): Promise<{ success: boolean; trip?: TripRow; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Create the trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .insert({
                group_id: input.group_id,
                name: input.name,
                start_date: input.start_date,
                end_date: input.end_date,
                cities: [],
                visibility: input.visibility || 'draft',
                status: 'active',
                group_size: 0,
            })
            .select()
            .single();

        if (tripError) {
            console.error('Error creating trip:', tripError);
            return { success: false, error: tripError.message };
        }

        // Add creator as trip member
        const { error: membershipError } = await supabase
            .from('trip_memberships')
            .insert({
                trip_id: trip.id!,
                user_id: user.id,
            });

        if (membershipError) {
            console.error('Error creating trip membership:', membershipError);
            return { success: false, error: `Trip created but failed to add membership: ${membershipError.message}` };
        }

        return { success: true, trip };
    } catch (err) {
        console.error('Error in createTrip:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Update an existing trip
 * Only group admins can update trips
 */
export async function updateTrip(
    tripId: string,
    input: TripUpdateInput
): Promise<{ success: boolean; trip?: TripRow; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify user is group admin
        const hasPermission = await verifyGroupAdmin(tripId, user.id);
        if (!hasPermission) {
            return { success: false, error: 'Only group admins can update trips' };
        }

        const { data: trip, error } = await supabase
            .from('trips')
            .update(input)
            .eq('id', tripId)
            .select()
            .single();

        if (error) {
            console.error('Error updating trip:', error);
            return { success: false, error: error.message };
        }

        return { success: true, trip };
    } catch (err) {
        console.error('Error in updateTrip:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Delete a trip
 * Only group admins can delete trips
 */
export async function deleteTrip(tripId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user is group admin
        const isAdmin = await verifyGroupAdmin(tripId, user.id);

        if (!isAdmin) {
            return { success: false, error: 'Only group admins can delete trips' };
        }

        const { error } = await supabase
            .from('trips')
            .delete()
            .eq('id', tripId);

        if (error) {
            console.error('Error deleting trip:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Error in deleteTrip:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Get all trips for the current user
 */
export async function getUserTrips(): Promise<{ success: boolean; trips?: TripRow[]; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get trips where user is a member
        const { data: memberships, error: membershipError } = await supabase
            .from('trip_memberships')
            .select('trip_id, trip:trips(*)')
            .eq('user_id', user.id)
            .is('left_at', null);

        if (membershipError) {
            console.error('Error fetching user trips:', membershipError);
            return { success: false, error: membershipError.message };
        }

        const trips = memberships?.map((m: any) => m.trip).filter(Boolean) || [];

        return { success: true, trips };
    } catch (err) {
        console.error('Error in getUserTrips:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Get a single trip by ID
 */
export async function getTrip(tripId: string): Promise<{ success: boolean; trip?: TripRow; error?: string }> {
    try {
        const { data: trip, error } = await supabase
            .from('trips')
            .select('*')
            .eq('id', tripId)
            .single();

        if (error) {
            console.error('Error fetching trip:', error);
            return { success: false, error: error.message };
        }

        return { success: true, trip };
    } catch (err) {
        console.error('Error in getTrip:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Verify if user is a group admin for a trip's group
 */
export async function verifyGroupAdmin(tripId: string, userId?: string): Promise<boolean> {
    try {
        let uid = userId;

        if (!uid) {
            const user = await getCachedUser();
            if (!user) return false;
            uid = user.id;
        }

        // Get the trip's group_id
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('group_id')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            console.error('Trip not found for admin check:', tripError);
            return false;
        }

        console.log('Checking group admin for:', { tripId, groupId: trip.group_id, userId: uid });

        // Check if user is in group_memberships for this group
        const { data: membership, error } = await supabase
            .from('group_memberships')
            .select('id')
            .eq('group_id', trip.group_id)
            .eq('user_id', uid)
            .single();

        console.log('Group membership check result:', { membership, error, hasError: !!error });

        return !error && !!membership;
    } catch (err) {
        console.error('Error verifying group admin:', err);
        return false;
    }
}

/**
 * Get trip with membership details for current user
 * Optimized with a single joined query instead of 6 separate queries
 */
export async function getTripWithMembership(tripId: string): Promise<{
    success: boolean;
    trip?: TripRow;
    isGroupAdmin?: boolean;
    error?: string;
    errorCode?: 'AUTH_MISSING' | 'TRIP_NOT_FOUND' | 'NOT_MEMBER' | 'ADMIN_CHECK_FAILED';
}> {
    try {
        // Validate auth session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.error('[getTripWithMembership] No active session');
            return { success: false, error: 'Not authenticated', errorCode: 'AUTH_MISSING' };
        }

        const user = await getCachedUser();

        if (!user) {
            console.error('[getTripWithMembership] No user found');
            return { success: false, error: 'Not authenticated', errorCode: 'AUTH_MISSING' };
        }

        console.log('[getTripWithMembership] Getting trip with membership for user:', user.id, 'tripId:', tripId);

        // Single optimized query with joins to get trip, verify membership, and check admin status
        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                trip_membership:trip_memberships!inner(id),
                group:groups!inner(
                    id,
                    group_admins:group_memberships(user_id)
                )
            `)
            .eq('id', tripId)
            .eq('trip_memberships.user_id', user.id)
            .is('trip_memberships.left_at', null)
            .single();

        if (error || !data) {
            console.error('[getTripWithMembership] Error:', error);
            if (error?.code === 'PGRST116') {
                return { success: false, error: 'Not a member of this trip', errorCode: 'NOT_MEMBER' };
            }
            return { success: false, error: 'Trip not found', errorCode: 'TRIP_NOT_FOUND' };
        }

        console.log('[getTripWithMembership] Trip found:', { tripId: data.id, groupId: data.group_id });

        // Check if user is a group admin from the joined data
        const isGroupAdmin = Array.isArray(data.group.group_admins) && 
            data.group.group_admins.some((admin: any) => admin.user_id === user.id);

        console.log('[getTripWithMembership] Final result:', { isGroupAdmin });

        // Clean up the response - remove the joined data that's not needed
        const { trip_membership, group, ...trip } = data;

        return {
            success: true,
            trip: trip as TripRow,
            isGroupAdmin,
        };
    } catch (err) {
        console.error('[getTripWithMembership] Error:', err);
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error',
            errorCode: 'ADMIN_CHECK_FAILED'
        };
    }
}

/**
 * Remove a member from a trip
 * Only group admins can remove members
 */
export async function removeTripMember(
    tripId: string,
    userIdToRemove: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify current user is group admin
        const hasPermission = await verifyGroupAdmin(tripId, user.id);
        if (!hasPermission) {
            return { success: false, error: 'Only group admins can remove members' };
        }

        // Don't allow removing yourself
        if (user.id === userIdToRemove) {
            return { success: false, error: 'Cannot remove yourself from the trip' };
        }

        // Set left_at timestamp instead of deleting
        const { error } = await supabase
            .from('trip_memberships')
            .update({ left_at: new Date().toISOString() })
            .eq('trip_id', tripId)
            .eq('user_id', userIdToRemove)
            .is('left_at', null);

        if (error) {
            console.error('Error removing member:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Error in removeTripMember:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Get all members of a trip
 */
export async function getTripMembers(tripId: string): Promise<{
    success: boolean;
    members?: Array<{
        id: string;
        user_id: string;
        name: string;
        isGroupAdmin: boolean;
        joined_at: string;
    }>;
    error?: string;
}> {
    try {
        // Get trip to find group_id
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('group_id')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            return { success: false, error: 'Trip not found' };
        }

        const { data: memberships, error } = await supabase
            .from('trip_memberships')
            .select('id, user_id, joined_at')
            .eq('trip_id', tripId)
            .is('left_at', null)
            .order('joined_at', { ascending: true });

        if (error) {
            console.error('Error fetching trip members:', error);
            return { success: false, error: error.message };
        }

        if (!memberships || memberships.length === 0) {
            return { success: true, members: [] };
        }

        // Get user IDs
        const userIds = memberships.map(m => m.user_id);

        // Fetch user emails from auth.users (via profiles which should have email)
        // Note: If profiles.name doesn't exist in DB, we'll use email as identifier
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, email')
            .in('user_id', userIds);

        // Create a map of user_id to email (or extract name from email)
        const profileMap = new Map(
            profiles?.map(p => [
                p.user_id, 
                p.email ? p.email.split('@')[0] : 'User'
            ]) || []
        );

        // Get group admins for this trip's group
        const { data: groupAdmins } = await supabase
            .from('group_memberships')
            .select('user_id')
            .eq('group_id', trip.group_id);

        const adminUserIds = new Set(groupAdmins?.map(g => g.user_id) || []);

        const members = memberships.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            name: profileMap.get(m.user_id) || 'Unknown',
            isGroupAdmin: adminUserIds.has(m.user_id),
            joined_at: m.joined_at,
        }));

        return { success: true, members };
    } catch (err) {
        console.error('Error in getTripMembers:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}
