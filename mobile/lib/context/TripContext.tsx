/**
 * Trip Context
 * 
 * Manages the currently selected trip across the app.
 * Provides trip selection, switching, and creation functionality.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripRow } from '../../types/db';
import { getUserTrips, createTrip, TripInput, getTripWithMembership } from '../api/services/trip.service';

interface TripContextType {
    currentTrip: TripRow | null;
    currentTripRole: 'super_admin' | 'group_owner' | 'user' | null;
    allTrips: TripRow[];
    loading: boolean;
    error: string | null;
    setCurrentTrip: (tripId: string) => Promise<void>;
    createNewTrip: (input: TripInput) => Promise<{ success: boolean; error?: string }>;
    refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const CURRENT_TRIP_KEY = '@ummrah_current_trip_id';

export function TripProvider({ children }: { children: ReactNode }) {
    const [currentTrip, setCurrentTripState] = useState<TripRow | null>(null);
    const [currentTripRole, setCurrentTripRole] = useState<'super_admin' | 'group_owner' | 'user' | null>(null);
    const [allTrips, setAllTrips] = useState<TripRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load trips on mount
    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all user trips
            const { success, trips, error: fetchError } = await getUserTrips();

            if (!success || !trips) {
                setError(fetchError || 'Failed to load trips');
                setLoading(false);
                return;
            }

            setAllTrips(trips);

            // Try to load previously selected trip from storage
            const savedTripId = await AsyncStorage.getItem(CURRENT_TRIP_KEY);

            if (savedTripId && trips.find(t => t.id === savedTripId)) {
                // Load the saved trip
                await loadCurrentTrip(savedTripId);
            } else if (trips.length > 0) {
                // Default to first trip
                await loadCurrentTrip(trips[0].id!);
            }
        } catch (err) {
            console.error('Error loading trips:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const loadCurrentTrip = async (tripId: string) => {
        try {
            const { success, trip, role, error } = await getTripWithMembership(tripId);

            if (success && trip) {
                setCurrentTripState(trip);
                setCurrentTripRole(role || null);
                // Save to storage
                await AsyncStorage.setItem(CURRENT_TRIP_KEY, tripId);
            } else {
                console.error('Error loading current trip:', error);
            }
        } catch (err) {
            console.error('Error in loadCurrentTrip:', err);
        }
    };

    const setCurrentTrip = async (tripId: string) => {
        await loadCurrentTrip(tripId);
    };

    const createNewTrip = async (input: TripInput): Promise<{ success: boolean; error?: string }> => {
        const { success, trip, error } = await createTrip(input);

        if (success && trip) {
            // Add to trips list
            setAllTrips(prev => [...prev, trip]);
            // Set as current trip
            await loadCurrentTrip(trip.id!);
            return { success: true };
        }

        return { success: false, error };
    };

    const refreshTrips = async () => {
        await loadTrips();
    };

    return (
        <TripContext.Provider
            value={{
                currentTrip,
                currentTripRole,
                allTrips,
                loading,
                error,
                setCurrentTrip,
                createNewTrip,
                refreshTrips,
            }}
        >
            {children}
        </TripContext.Provider>
    );
}

export function useTrip() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
}
