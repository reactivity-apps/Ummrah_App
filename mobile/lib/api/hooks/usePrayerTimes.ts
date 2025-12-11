/**
 * usePrayerTimes Hook
 * 
 * Custom hook for managing prayer times state and logic
 * Provides automatic fetching, caching, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPrayerTimesByAddress,
  fetchPrayerTimesByCoordinates,
  processPrayerTimes,
  getTimeUntilPrayer,
  formatHijriDate,
  type PrayerTimesResponse,
  type ProcessedPrayerTime,
  type HijriDate,
} from '../../prayerTimes';

interface UsePrayerTimesOptions {
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  method?: number; // Calculation method (default: 3 - Muslim World League)
  autoRefresh?: boolean; // Auto-refresh every minute
}

interface UsePrayerTimesResult {
  prayers: ProcessedPrayerTime[];
  nextPrayer: ProcessedPrayerTime | null;
  timeUntilNext: string;
  hijriDate: string;
  location: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePrayerTimes(options: UsePrayerTimesOptions): UsePrayerTimesResult {
  const {
    address = 'Makkah, Saudi Arabia',
    coordinates,
    method = 3,
    autoRefresh = true,
  } = options;

  const [prayers, setPrayers] = useState<ProcessedPrayerTime[]>([]);
  const [rawData, setRawData] = useState<PrayerTimesResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prayer times from API
  const fetchPrayerTimes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data: PrayerTimesResponse;

      if (coordinates) {
        data = await fetchPrayerTimesByCoordinates(
          coordinates.latitude,
          coordinates.longitude,
          undefined,
          method
        );
      } else {
        data = await fetchPrayerTimesByAddress(address, undefined, method);
      }

      setRawData(data);
      const processed = processPrayerTimes(data.data.timings, currentTime);
      setPrayers(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');
      console.error('Prayer times fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, coordinates, method, currentTime]);

  // Initial fetch
  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Auto-refresh current time and recalculate prayer statuses
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Recalculate prayer statuses based on current time
      if (rawData) {
        const processed = processPrayerTimes(rawData.data.timings, now);
        setPrayers(processed);
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [autoRefresh, rawData]);

  // Find next prayer
  const nextPrayer = prayers.find(p => p.isNext) || null;

  // Calculate time until next prayer
  const timeUntilNext = nextPrayer
    ? getTimeUntilPrayer(nextPrayer.time.split(' ')[0]) // Remove AM/PM for calculation
    : '';

  // Format Hijri date
  const hijriDate = rawData
    ? formatHijriDate(rawData.data.date.hijri)
    : '';

  // Get location from API response or use provided address
  const location = address;

  return {
    prayers,
    nextPrayer,
    timeUntilNext,
    hijriDate,
    location,
    isLoading,
    error,
    refresh: fetchPrayerTimes,
  };
}

/**
 * Hook for getting only essential prayer data (lighter weight)
 */
export function usePrayerWidget(options: UsePrayerTimesOptions) {
  const { prayers, nextPrayer, timeUntilNext, location, isLoading, error } = usePrayerTimes(options);

  // Filter out Sunrise for the widget
  const widgetPrayers = prayers.filter(p => p.name !== 'Sunrise');

  return {
    prayers: widgetPrayers,
    nextPrayer,
    timeUntilNext,
    location,
    isLoading,
    error,
  };
}
