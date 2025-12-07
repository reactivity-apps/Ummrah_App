// Utility functions for the Umrah App

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
}

/**
 * Get activity icon color
 */
export function getActivityColor(type: string): string {
    const colors: Record<string, string> = {
        travel: 'bg-blue-50 border-blue-200',
        accommodation: 'bg-purple-50 border-purple-200',
        prayer: 'bg-primary/10 border-primary/20',
        meal: 'bg-orange-50 border-orange-200',
        group: 'bg-amber-50 border-amber-200',
        ziyarat: 'bg-emerald-50 border-emerald-200',
        free: 'bg-sand-50 border-sand-200',
    };

    return colors[type] || 'bg-sand-50 border-sand-200';
}

/**
 * Calculate time remaining until a specific time
 */
export function getTimeRemaining(targetTime: string): string {
    // This is a mock implementation
    // In a real app, you would calculate the actual time difference
    return '45 mins';
}

/**
 * Check if a prayer time has passed
 */
export function isPrayerDone(prayerTime: string): boolean {
    // Mock implementation
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;

    return currentTime > prayerMinutes;
}

/**
 * Cache utility functions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedData<T> {
    data: T;
    timestamp: number;
}

/**
 * Load data from cache if it's still fresh
 */
export async function loadFromCache<T>(
    cacheKey: string,
    cacheDuration: number,
    keyName: string = 'Cache'
): Promise<T | null> {
    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        const cachedData: CachedData<T> = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;
        
        // Return cached data if it's fresh
        if (age < cacheDuration) {
            console.log(`[${keyName}] Using cached data, age:`, Math.round(age / 1000), 'seconds');
            return cachedData.data;
        }
        
        return null;
    } catch (error) {
        console.error(`[${keyName}] Error loading from cache:`, error);
        return null;
    }
}

/**
 * Save data to cache with timestamp
 */
export async function saveToCache<T>(
    cacheKey: string,
    data: T,
    keyName: string = 'Cache'
): Promise<void> {
    try {
        const cachedData: CachedData<T> = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
        console.log(`[${keyName}] Cached data successfully`);
    } catch (error) {
        console.error(`[${keyName}] Error saving to cache:`, error);
    }
}
