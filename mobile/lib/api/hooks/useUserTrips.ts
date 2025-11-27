/**
 * useUserTrips Hook
 * 
 * Fetches all trips where the current user is a member,
 * along with their role and membership details.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';

export interface UserTrip {
    trip_id: string;
    trip_name: string;
    role: 'group_owner' | 'user';
    start_date: string | null;
    end_date: string | null;
    joined_at: string;
    left_at: string | null;
    // group_code removed, not present in DB
}

export interface UseUserTripsReturn {
    trips: UserTrip[];
    adminTrips: UserTrip[];
    currentTrip: UserTrip | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useUserTrips(): UseUserTripsReturn {
    const [trips, setTrips] = useState<UserTrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrips = useCallback(async () => {
        try {
            console.log('[useUserTrips] Step 1: Start fetching trips');
            setLoading(true);
            setError(null);

            // Step 2: Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log('[useUserTrips] Step 2: Current signed-in user:', user);

            if (userError || !user) {
                console.log('[useUserTrips] Step 2.1: User not authenticated or error:', userError);
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            console.log('[useUserTrips] Step 3: Fetching memberships for user_id:', user.id);

            // Step 4: Fetch all trips where user is a member
            const { data: memberships, error: membershipError } = await supabase
                .from('trip_memberships')
                .select(`
                    trip_id,
                    role,
                    joined_at,
                    left_at,
                    trip:trips(id, name, start_date, end_date)
                `)
                .eq('user_id', user.id)
                .is('left_at', null) // Only active memberships
                .order('joined_at', { ascending: false });

            if (membershipError) {
                console.log('[useUserTrips] Step 4.1: Error fetching memberships:', membershipError);
                setError(`Failed to fetch trips: ${membershipError.message}`);
                setLoading(false);
                return;
            }

            console.log('[useUserTrips] Step 5: Found memberships:', memberships?.length || 0, memberships);

            // Step 6: Transform the data
            const userTrips: UserTrip[] = (memberships || []).flatMap((membership: any, idx: number) => {
                console.log(`[useUserTrips] Step 6.${idx}: Membership row`, membership);
                if (!membership.trip) {
                    console.warn(`[useUserTrips] Step 6.${idx}: No trip data for membership`, membership);
                    return [];
                }
                return [{
                    trip_id: membership.trip_id,
                    trip_name: membership.trip.name,
                    role: membership.role,
                    start_date: membership.trip.start_date,
                    end_date: membership.trip.end_date,
                    joined_at: membership.joined_at,
                    left_at: membership.left_at,
                }];
            });

            console.log('[useUserTrips] Step 7: Final userTrips array:', userTrips);
            setTrips(userTrips);
            setLoading(false);
        } catch (err) {
            console.log('[useUserTrips] Step ERROR: Unexpected error:', err);
            setError(`Unexpected error: ${err}`);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);


    // Filter admin trips (group_owner role only, matches DB)
    const adminTrips = trips.filter(
        (trip) => trip.role === 'group_owner'
    );

    // Get current trip (just use the first admin trip, or first trip)
    const currentTrip = adminTrips.length > 0
        ? adminTrips[0]
        : trips[0] || null;

    return {
        trips,
        adminTrips,
        currentTrip,
        loading,
        error,
        refresh: fetchTrips,
    };
}
