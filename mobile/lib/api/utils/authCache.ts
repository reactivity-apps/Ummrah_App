import { User } from '@supabase/supabase-js';
import { supabase } from '../../supabase';

/**
 * Auth Cache Utility
 * 
 * Reduces excessive auth.getUser() calls by caching the authenticated user
 * for a short duration. This prevents redundant auth API calls when multiple
 * service functions need user information in quick succession.
 * 
 * Cache duration: 60 seconds
 * - Short enough to stay reasonably fresh
 * - Long enough to eliminate duplicate calls within a request cycle
 */

let cachedUser: User | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get the authenticated user with caching
 * 
 * Returns cached user if available and not expired, otherwise fetches fresh
 * data from Supabase auth and updates the cache.
 * 
 * @returns Promise resolving to User object or null if not authenticated
 */
export async function getCachedUser(): Promise<User | null> {
    const now = Date.now();
    
    // Return cached user if still valid
    if (cachedUser && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedUser;
    }
    
    // Fetch fresh user data
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('[authCache] Error fetching user:', error);
        return null;
    }
    
    // Update cache
    cachedUser = user;
    cacheTimestamp = now;
    
    return user;
}

/**
 * Clear the cached user
 * 
 * Should be called when:
 * - User logs out
 * - User logs in (to refresh with new user data)
 * - Auth state changes
 * - User profile is updated
 */
export function clearUserCache(): void {
    cachedUser = null;
    cacheTimestamp = 0;
}

/**
 * Get cache status (for debugging)
 */
export function getCacheStatus(): {
    hasCachedUser: boolean;
    cacheAge: number;
    isExpired: boolean;
} {
    const now = Date.now();
    const age = cacheTimestamp > 0 ? now - cacheTimestamp : -1;
    
    return {
        hasCachedUser: cachedUser !== null,
        cacheAge: age,
        isExpired: age >= CACHE_DURATION || age < 0
    };
}
