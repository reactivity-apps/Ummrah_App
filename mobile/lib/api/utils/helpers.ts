/**
 * Shared API Utilities
 * 
 * Common helpers for services and hooks to reduce code duplication
 */

import { supabase } from '../../supabase';
import { getCachedUser } from './authCache';

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Get current authenticated user
 * Returns null if not authenticated
 * Uses cached auth to reduce redundant API calls
 */
export async function getCurrentUser() {
    const user = await getCachedUser();
    if (!user) return null;
    return user;
}

/**
 * Require authenticated user, throw if not found
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return user;
}

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if user has admin permission for a trip
 * Admin = user exists in group_memberships for the trip's group
 */
export async function hasAdminPermission(tripId: string, userId?: string): Promise<boolean> {
    try {
        const uid = userId || (await getCurrentUser())?.id;
        if (!uid) return false;

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

        // Check if user is in group_memberships for this group
        const { data: membership, error: membershipError } = await supabase
            .from('group_memberships')
            .select('id')
            .eq('group_id', trip.group_id)
            .eq('user_id', uid)
            .maybeSingle();

        return !membershipError && !!membership;
    } catch (err) {
        console.error('Error checking admin permission:', err);
        return false;
    }
}

/**
 * Verify admin permission, return detailed result
 */
export async function verifyAdminPermission(tripId: string) {
    const user = await getCurrentUser();

    if (!user) {
        return { hasPermission: false, error: 'User not authenticated' };
    }

    const hasPermission = await hasAdminPermission(tripId, user.id);

    return {
        hasPermission,
        userId: user.id,
        error: hasPermission ? undefined : 'User does not have admin privileges'
    };
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format timestamp to human-readable "time ago" format
 */
export function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// SORTING HELPERS
// ============================================================================

/**
 * Standard sort function for itinerary items
 * Sorts by: day_date → sort_order → starts_at
 */
export function sortItineraryItems<T extends {
    day_date?: string | null;
    sort_order?: number | null;
    starts_at?: string | null
}>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        // First by day_date
        if (a.day_date && b.day_date && a.day_date !== b.day_date) {
            return a.day_date < b.day_date ? -1 : 1;
        }
        // Then by sort_order
        if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) {
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        }
        // Finally by starts_at
        if (a.starts_at && b.starts_at) {
            return a.starts_at < b.starts_at ? -1 : 1;
        }
        return 0;
    });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Standardized error response format
 */
export interface ApiResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Create success response
 */
export function success<T>(data: T): ApiResult<T> {
    return { success: true, data };
}

/**
 * Create error response
 */
export function error(message: string): ApiResult<never> {
    return { success: false, error: message };
}

/**
 * Wrap async operations with error handling
 */
export async function handleAsync<T>(
    operation: () => Promise<T>,
    errorMessage = 'Operation failed'
): Promise<ApiResult<T>> {
    try {
        const data = await operation();
        return success(data);
    } catch (err) {
        console.error(errorMessage, err);
        const msg = err instanceof Error ? err.message : errorMessage;
        return error(msg);
    }
}
