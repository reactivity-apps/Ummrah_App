/**
 * Shared API Utilities
 * 
 * Common helpers for services and hooks to reduce code duplication
 */

import { supabase } from '../../supabase';

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
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
 * Admin = group_owner or super_admin role
 */
export async function hasAdminPermission(tripId: string, userId?: string): Promise<boolean> {
    try {
        const uid = userId || (await getCurrentUser())?.id;
        if (!uid) return false;

        const { data, error } = await supabase
            .from('trip_memberships')
            .select('role')
            .eq('trip_id', tripId)
            .eq('user_id', uid)
            .is('left_at', null)
            .maybeSingle();

        if (error || !data) return false;
        return data.role === 'group_owner' || data.role === 'super_admin';
    } catch {
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
