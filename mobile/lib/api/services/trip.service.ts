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
 * Create a new trip and automatically add creator as admin
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
                base_city: input.base_city,
                visibility: input.visibility || 'draft',
                created_by: user.id,
            })
            .select()
            .single();

        if (tripError) {
            console.error('Error creating trip:', tripError);
            return { success: false, error: tripError.message };
        }

        // Add creator as group_owner in trip_memberships
        const { error: membershipError } = await supabase
            .from('trip_memberships')
            .insert({
                trip_id: trip.id!,
                user_id: user.id,
                role: 'group_owner',
            });

        if (membershipError) {
            console.error('Error creating trip membership:', membershipError);
            console.error('Membership error details:', JSON.stringify(membershipError, null, 2));
            // Trip was created but membership failed - might want to rollback
            return { success: false, error: `Trip created but failed to add admin membership: ${membershipError.message}` };
        }

        return { success: true, trip };
    } catch (err) {
        console.error('Error in createTrip:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Update an existing trip
 * Only admins can update trips
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

        // Verify user is admin
        const hasPermission = await verifyTripAdmin(tripId, user.id);
        if (!hasPermission) {
            return { success: false, error: 'Only admins can update trips' };
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
 * Only the creator or group owner can delete trips
 */
export async function deleteTrip(tripId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get trip to check creator
        const { data: trip, error: fetchError } = await supabase
            .from('trips')
            .select('created_by')
            .eq('id', tripId)
            .single();

        if (fetchError || !trip) {
            return { success: false, error: 'Trip not found' };
        }

        // Check if user is creator or admin
        const isCreator = trip.created_by === user.id;
        const isAdmin = await verifyTripAdmin(tripId, user.id);

        if (!isCreator && !isAdmin) {
            return { success: false, error: 'Only the creator or admins can delete trips' };
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
            .select('trip_id, role, trip:trips(*)')
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
 * Verify if user is an admin for a trip
 */
export async function verifyTripAdmin(tripId: string, userId?: string): Promise<boolean> {
    try {
        let uid = userId;

        if (!uid) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;
            uid = user.id;
        }

        const { data: membership, error } = await supabase
            .from('trip_memberships')
            .select('role')
            .eq('trip_id', tripId)
            .eq('user_id', uid)
            .is('left_at', null)
            .single();

        if (error || !membership) {
            return false;
        }

        return membership.role === 'group_owner' || membership.role === 'super_admin';
    } catch (err) {
        console.error('Error verifying trip admin:', err);
        return false;
    }
}

/**
 * Get trip with membership details for current user
 */
export async function getTripWithMembership(tripId: string): Promise<{
    success: boolean;
    trip?: TripRow;
    role?: 'super_admin' | 'group_owner' | 'user';
    error?: string;
}> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            return { success: false, error: 'Trip not found' };
        }

        // Get user's membership
        const { data: membership, error: membershipError } = await supabase
            .from('trip_memberships')
            .select('role')
            .eq('trip_id', tripId)
            .eq('user_id', user.id)
            .is('left_at', null)
            .single();

        if (membershipError) {
            console.error('Error fetching membership:', membershipError);
            return { success: false, error: 'Not a member of this trip' };
        }

        return {
            success: true,
            trip,
            role: membership.role,
        };
    } catch (err) {
        console.error('Error in getTripWithMembership:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}
