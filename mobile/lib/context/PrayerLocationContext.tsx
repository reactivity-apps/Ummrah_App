/**
 * Prayer Location Context
 * 
 * Manages the user's selected prayer location (Makkah or Madina)
 * Provides location switching with persistent storage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerLocation = 'Makkah' | 'Madina';

interface PrayerLocationContextType {
    selectedLocation: PrayerLocation;
    setLocation: (location: PrayerLocation) => void;
    locationAddress: string;
    isLoading: boolean;
}

const PrayerLocationContext = createContext<PrayerLocationContextType | undefined>(undefined);

const STORAGE_KEY = '@ummrah_prayer_location';

const LOCATION_MAP: Record<PrayerLocation, string> = {
    'Makkah': 'Makkah, Saudi Arabia',
    'Madina': 'Medina, Saudi Arabia',
};

export function PrayerLocationProvider({ children }: { children: ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<PrayerLocation>('Makkah');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved location on mount
    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved && (saved === 'Makkah' || saved === 'Madina')) {
                setSelectedLocation(saved as PrayerLocation);
                console.log('[PrayerLocation] Loaded saved location:', saved);
            }
        } catch (error) {
            console.error('[PrayerLocation] Error loading saved location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setLocation = async (location: PrayerLocation) => {
        try {
            setSelectedLocation(location);
            await AsyncStorage.setItem(STORAGE_KEY, location);
            console.log('[PrayerLocation] Saved location:', location);
        } catch (error) {
            console.error('[PrayerLocation] Error saving location:', error);
        }
    };

    const locationAddress = LOCATION_MAP[selectedLocation];

    return (
        <PrayerLocationContext.Provider
            value={{
                selectedLocation,
                setLocation,
                locationAddress,
                isLoading,
            }}
        >
            {children}
        </PrayerLocationContext.Provider>
    );
}

export function usePrayerLocation() {
    const context = useContext(PrayerLocationContext);
    if (context === undefined) {
        throw new Error('usePrayerLocation must be used within a PrayerLocationProvider');
    }
    return context;
}
