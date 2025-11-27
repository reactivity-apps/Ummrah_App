/**
 * useActivity Hook
 * 
 * Fetches and subscribes to real-time activity updates for a trip
 */

import { useState, useEffect } from 'react';
import { getTripActivity, subscribeToTripActivity, ActivityItem } from '../services/activity.service';

interface UseActivityOptions {
    tripId: string;
    limit?: number;
    enableRealtime?: boolean;
}

interface UseActivityResult {
    activities: ActivityItem[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useActivity({
    tripId,
    limit = 20,
    enableRealtime = true,
}: UseActivityOptions): UseActivityResult {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTripActivity(tripId, limit);
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
            setError('Failed to load recent activity');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!tripId) return;

        loadActivities();

        // Subscribe to real-time updates
        if (enableRealtime) {
            const unsubscribe = subscribeToTripActivity(tripId, (newActivity) => {
                setActivities((prev) => {
                    // Add new activity to the top and remove duplicates
                    const filtered = prev.filter(a =>
                        !(a.type === newActivity.type && a.timestamp === newActivity.timestamp)
                    );
                    return [newActivity, ...filtered].slice(0, limit);
                });
            });

            return () => {
                unsubscribe();
            };
        }
    }, [tripId, limit, enableRealtime]);

    return {
        activities,
        loading,
        error,
        refresh: loadActivities,
    };
}
