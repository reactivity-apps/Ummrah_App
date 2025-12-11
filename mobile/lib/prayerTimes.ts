/**
 * Prayer Times Service
 * 
 * Handles fetching and processing prayer times from the Aladhan API
 * Provides utility functions for prayer time calculations and formatting
 */

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
    days: number;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays?: string[];
}

export interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      timestamp: string;
      hijri: HijriDate;
      gregorian: GregorianDate;
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
    };
  };
}

export interface ProcessedPrayerTime {
  name: string;
  time: string;
  isPassed: boolean;
  isNext: boolean;
  timeInMinutes: number;
}

const API_BASE_URL = 'https://api.aladhan.com/v1';

/**
 * Converts 24-hour time to 12-hour format with AM/PM
 */
export function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate time remaining until a prayer
 */
export function getTimeUntilPrayer(prayerTime: string): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerMinutes = timeToMinutes(prayerTime);
  
  let diff = prayerMinutes - currentMinutes;
  
  // If prayer time has passed today, it's tomorrow
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Process raw prayer timings into a structured format with status
 */
export function processPrayerTimes(timings: PrayerTimings, currentTime: Date = new Date()): ProcessedPrayerTime[] {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Sunrise', time: timings.Sunrise },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha },
  ];
  
  let nextPrayerFound = false;
  
  return prayers.map((prayer) => {
    const timeInMinutes = timeToMinutes(prayer.time);
    const isPassed = currentMinutes > timeInMinutes;
    const isNext = !isPassed && !nextPrayerFound && prayer.name !== 'Sunrise';
    
    if (isNext) nextPrayerFound = true;
    
    return {
      name: prayer.name,
      time: formatTimeTo12Hour(prayer.time),
      isPassed,
      isNext,
      timeInMinutes,
    };
  });
}

/**
 * Fetch prayer times for a specific address and date
 */
export async function fetchPrayerTimesByAddress(
  address: string,
  date?: string, // DD-MM-YYYY format
  method: number = 3 // Default: Muslim World League
): Promise<PrayerTimesResponse> {
  try {
    // Format date if not provided
    const dateStr = date || formatDateForAPI(new Date());
    
    const params = new URLSearchParams({
      address,
      method: method.toString(),
    });
    
    const url = `${API_BASE_URL}/timingsByAddress/${dateStr}?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: PrayerTimesResponse = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`API returned error: ${data.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
}

/**
 * Fetch prayer times by coordinates (latitude/longitude)
 */
export async function fetchPrayerTimesByCoordinates(
  latitude: number,
  longitude: number,
  date?: string,
  method: number = 3
): Promise<PrayerTimesResponse> {
  try {
    const dateStr = date || formatDateForAPI(new Date());
    
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      method: method.toString(),
    });
    
    const url = `${API_BASE_URL}/timings/${dateStr}?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: PrayerTimesResponse = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`API returned error: ${data.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
}

/**
 * Format Date object to DD-MM-YYYY for API
 */
export function formatDateForAPI(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format Hijri date for display
 */
export function formatHijriDate(hijriDate: HijriDate): string {
  return `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year}`;
}
