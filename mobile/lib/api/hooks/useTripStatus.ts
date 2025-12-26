/**
 * useTripStatus Hook
 * 
 * Centralized logic for calculating trip status, current day, and duration
 * Provides consistent trip status information across all components
 */

import { useMemo } from 'react';
import { TripRow } from '../../../types/db';

export interface TripStatus {
    type: 'upcoming' | 'active' | 'completed' | null;
    message: string | null;
    currentDay: number | null;
    totalDays: number | null;
    daysUntilStart: number | null;
}

export function useTripStatus(trip: TripRow | null): TripStatus {
    return useMemo(() => {
        // Return null status if trip or dates are missing
        if (!trip?.start_date || !trip?.end_date) {
            return {
                type: null,
                message: null,
                currentDay: null,
                totalDays: null,
                daysUntilStart: null,
            };
        }

        // Normalize dates to start of day for accurate comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(trip.start_date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(trip.end_date);
        endDate.setHours(0, 0, 0, 0);

        // Calculate total trip duration
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Trip hasn't started yet
        if (today < startDate) {
            const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
                type: 'upcoming',
                message: daysUntilStart === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilStart} days`,
                currentDay: null,
                totalDays,
                daysUntilStart,
            };
        }

        // Trip has ended
        if (today > endDate) {
            return {
                type: 'completed',
                message: 'Trip completed',
                currentDay: null,
                totalDays,
                daysUntilStart: null,
            };
        }

        // Trip is active (Day 1 = start date)
        const currentDay = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return {
            type: 'active',
            message: `Day ${currentDay} of ${totalDays}`,
            currentDay,
            totalDays,
            daysUntilStart: null,
        };
    }, [trip?.start_date, trip?.end_date]);
}
