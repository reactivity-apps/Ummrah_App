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
        const { data: { user } } = await supabase.auth.getUser();

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
        const { data: { user } } = await supabase.auth.getUser();

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
        const { data: { user } } = await supabase.auth.getUser();

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
        const { data: { user } } = await supabase.auth.getUser();

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
            const { data: { user } } = await supabase.auth.getUser();
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('[getTripWithMembership] No user found');
            return { success: false, error: 'Not authenticated', errorCode: 'AUTH_MISSING' };
        }

        console.log('[getTripWithMembership] Getting trip with membership for user:', user.id, 'tripId:', tripId);

        // Get trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            console.error('[getTripWithMembership] Trip fetch error:', tripError);
            return { success: false, error: 'Trip not found', errorCode: 'TRIP_NOT_FOUND' };
        }

        console.log('[getTripWithMembership] Trip found:', { tripId: trip.id, groupId: trip.group_id });

        // Check if user is a member of this trip
        const { data: tripMembership, error: membershipError } = await supabase
            .from('trip_memberships')
            .select('id')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .is('left_at', null)
            .single();

        if (membershipError) {
            console.error('[getTripWithMembership] Error fetching trip membership:', membershipError);
            return { success: false, error: 'Not a member of this trip', errorCode: 'NOT_MEMBER' };
        }

        console.log('[getTripWithMembership] Trip membership found:', tripMembership);

        // Check if user is a group admin
        const isGroupAdmin = await verifyGroupAdmin(tripId, user.id);

        console.log('[getTripWithMembership] Final result:', { isGroupAdmin });

        return {
            success: true,
            trip,
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
        const { data: { user } } = await supabase.auth.getUser();

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
            .select(`
                id,
                user_id,
                joined_at,
                profile:profiles(name)
            `)
            .eq('trip_id', tripId)
            .is('left_at', null)
            .order('joined_at', { ascending: true });

        if (error) {
            console.error('Error fetching trip members:', error);
            return { success: false, error: error.message };
        }

        // Get group admins for this trip's group
        const { data: groupAdmins } = await supabase
            .from('group_memberships')
            .select('user_id')
            .eq('group_id', trip.group_id);

        const adminUserIds = new Set(groupAdmins?.map(g => g.user_id) || []);

        const members = memberships?.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            name: m.profile?.name || 'Unknown',
            isGroupAdmin: adminUserIds.has(m.user_id),
            joined_at: m.joined_at,
        })) || [];

        return { success: true, members };
    } catch (err) {
        console.error('Error in getTripMembers:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}
