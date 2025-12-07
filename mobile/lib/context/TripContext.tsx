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
import { useAuth } from './AuthContext';

interface TripContextType {
    currentTrip: TripRow | null;
    isGroupAdmin: boolean;
    allTrips: TripRow[];
    loading: boolean;
    error: string | null;
    setCurrentTrip: (tripId: string) => Promise<void>;
    createNewTrip: (input: TripInput) => Promise<{ success: boolean; error?: string }>;
    refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const CURRENT_TRIP_KEY = '@ummrah_current_trip_id';
const ADMIN_STATUS_KEY = '@ummrah_admin_status_';

export function TripProvider({ children }: { children: ReactNode }) {
    const [currentTrip, setCurrentTripState] = useState<TripRow | null>(null);
    const [isGroupAdmin, setIsGroupAdmin] = useState<boolean>(false);
    const [allTrips, setAllTrips] = useState<TripRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { isAuthenticated, shouldReloadData, lastAuthEvent } = useAuth();

    // Effect 1: Initialize trips when auth becomes ready
    useEffect(() => {
        if (!isAuthenticated) {
            // User logged out - clear everything
            setCurrentTripState(null);
            setIsGroupAdmin(false);
            setAllTrips([]);
            setInitialized(false);
            setLoading(false);
            
            // Clear AsyncStorage trip data
            AsyncStorage.removeItem(CURRENT_TRIP_KEY).catch(console.error);
            // Note: We don't clear individual admin status keys here since they're trip-specific
            // and will be overwritten when that trip is loaded again
            
            return;
        }

        // User is authenticated - load trips if not already loaded
        if (!initialized) {
            loadTrips();
        }
    }, [isAuthenticated, initialized]);

    // Effect 2: React to auth events that require reload
    useEffect(() => {
        if (isAuthenticated && shouldReloadData && initialized) {
            console.log('[TripContext] Reloading due to auth event:', lastAuthEvent);
            loadTrips();
        }
    }, [shouldReloadData, lastAuthEvent]);

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
            
            setInitialized(true);
        } catch (err) {
            console.error('Error loading trips:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const loadCurrentTrip = async (tripId: string) => {
        try {
            // Load cached admin status immediately
            const cachedAdminStatus = await AsyncStorage.getItem(`${ADMIN_STATUS_KEY}${tripId}`);
            if (cachedAdminStatus !== null) {
                setIsGroupAdmin(cachedAdminStatus === 'true');
                console.log('[TripContext] Loaded cached admin status:', cachedAdminStatus);
            }

            const { success, trip, isGroupAdmin: admin, error: fetchError } = await getTripWithMembership(tripId);

            if (success && trip) {
                setCurrentTripState(trip);
                
                // Update admin status with fresh data
                if (admin !== undefined) {
                    setIsGroupAdmin(admin);
                    // Cache the admin status
                    await AsyncStorage.setItem(`${ADMIN_STATUS_KEY}${tripId}`, String(admin));
                    console.log('[TripContext] Cached admin status:', admin);
                } else {
                    console.error('[TripContext] Admin status is undefined');
                    setError('Failed to determine admin status');
                }
                
                // Save to storage
                await AsyncStorage.setItem(CURRENT_TRIP_KEY, tripId);
            } else {
                console.error('[TripContext] Error loading current trip:', fetchError);
                setError(fetchError || 'Failed to load trip');
            }
        } catch (err) {
            console.error('[TripContext] Error in loadCurrentTrip:', err);
            setError(err instanceof Error ? err.message : 'Unknown error loading trip');
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
                isGroupAdmin,
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
