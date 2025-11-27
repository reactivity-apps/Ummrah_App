/**
 * Pre-made Activity Templates
 * Makes it easier for admins to quickly add common itinerary items
 */

import { ItineraryItemInput } from '../lib/api/services/itinerary.service';

export interface ActivityTemplate {
    id: string;
    category: 'prayer' | 'meal' | 'travel' | 'accommodation' | 'ziyarat' | 'group';
    title: string;
    description: string;
    icon: string;
    defaultDuration?: number; // in minutes
    suggestedTimes?: string[];
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
    // Prayer Templates
    {
        id: 'fajr',
        category: 'prayer',
        title: 'Fajr Prayer at Masjid Nabawi',
        description: 'Morning prayer at the Prophet\'s Mosque',
        icon: '🕌',
        defaultDuration: 60,
        suggestedTimes: ['05:00'],
    },
    {
        id: 'dhuhr',
        category: 'prayer',
        title: 'Dhuhr Prayer at Masjid al-Haram',
        description: 'Noon prayer at the Grand Mosque',
        icon: '🕌',
        defaultDuration: 60,
        suggestedTimes: ['13:00'],
    },
    {
        id: 'asr',
        category: 'prayer',
        title: 'Asr Prayer',
        description: 'Afternoon prayer',
        icon: '🕌',
        defaultDuration: 45,
        suggestedTimes: ['16:00'],
    },
    {
        id: 'maghrib',
        category: 'prayer',
        title: 'Maghrib Prayer',
        description: 'Sunset prayer',
        icon: '🕌',
        defaultDuration: 45,
        suggestedTimes: ['18:30'],
    },
    {
        id: 'isha',
        category: 'prayer',
        title: 'Isha Prayer',
        description: 'Night prayer',
        icon: '🕌',
        defaultDuration: 60,
        suggestedTimes: ['20:00'],
    },

    // Meal Templates
    {
        id: 'breakfast',
        category: 'meal',
        title: 'Breakfast',
        description: 'Morning meal at hotel restaurant',
        icon: '🍳',
        defaultDuration: 60,
        suggestedTimes: ['07:00', '08:00'],
    },
    {
        id: 'lunch',
        category: 'meal',
        title: 'Lunch',
        description: 'Afternoon meal',
        icon: '🍽️',
        defaultDuration: 60,
        suggestedTimes: ['13:00', '14:00'],
    },
    {
        id: 'dinner',
        category: 'meal',
        title: 'Group Dinner',
        description: 'Evening meal with the group',
        icon: '🍽️',
        defaultDuration: 90,
        suggestedTimes: ['20:00', '21:00'],
    },

    // Travel Templates
    {
        id: 'airport-arrival',
        category: 'travel',
        title: 'Arrival at Airport',
        description: 'Group arrival and airport procedures',
        icon: '✈️',
        defaultDuration: 120,
    },
    {
        id: 'airport-departure',
        category: 'travel',
        title: 'Departure from Airport',
        description: 'Check-in and departure procedures',
        icon: '✈️',
        defaultDuration: 180,
    },
    {
        id: 'madinah-makkah-travel',
        category: 'travel',
        title: 'Travel from Madinah to Makkah',
        description: 'Bus journey to Makkah',
        icon: '🚌',
        defaultDuration: 240,
    },

    // Accommodation Templates
    {
        id: 'hotel-checkin',
        category: 'accommodation',
        title: 'Check-in at Hotel',
        description: 'Hotel check-in and room allocation',
        icon: '🏨',
        defaultDuration: 60,
    },
    {
        id: 'hotel-checkout',
        category: 'accommodation',
        title: 'Check-out from Hotel',
        description: 'Hotel checkout and luggage collection',
        icon: '🏨',
        defaultDuration: 60,
    },

    // Ziyarat Templates
    {
        id: 'ziyarat-quba',
        category: 'ziyarat',
        title: 'Visit to Masjid Quba',
        description: 'Visit the first mosque built in Islam',
        icon: '📍',
        defaultDuration: 90,
    },
    {
        id: 'ziyarat-qiblatain',
        category: 'ziyarat',
        title: 'Visit to Masjid al-Qiblatain',
        description: 'Visit the mosque of two qiblas',
        icon: '📍',
        defaultDuration: 60,
    },
    {
        id: 'ziyarat-uhud',
        category: 'ziyarat',
        title: 'Visit to Mount Uhud',
        description: 'Visit the historic battlefield',
        icon: '⛰️',
        defaultDuration: 120,
    },
    {
        id: 'ziyarat-jannatul-baqi',
        category: 'ziyarat',
        title: 'Visit to Jannatul Baqi',
        description: 'Visit the historic cemetery',
        icon: '📍',
        defaultDuration: 45,
    },
    {
        id: 'ziyarat-cave-hira',
        category: 'ziyarat',
        title: 'Visit to Cave of Hira',
        description: 'Visit where revelation began',
        icon: '⛰️',
        defaultDuration: 180,
    },

    // Group Activities
    {
        id: 'orientation',
        category: 'group',
        title: 'Orientation Session',
        description: 'Welcome and trip overview',
        icon: '👥',
        defaultDuration: 90,
    },
    {
        id: 'lecture',
        category: 'group',
        title: 'Islamic Lecture',
        description: 'Educational session',
        icon: '📚',
        defaultDuration: 60,
    },
    {
        id: 'group-meeting',
        category: 'group',
        title: 'Group Meeting',
        description: 'Team discussion and coordination',
        icon: '👥',
        defaultDuration: 45,
    },
];

export const TEMPLATE_CATEGORIES = [
    { id: 'prayer', name: 'Prayers', icon: '🕌', color: '#4A6741' },
    { id: 'meal', name: 'Meals', icon: '🍽️', color: '#C5A059' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#3B82F6' },
    { id: 'accommodation', name: 'Hotels', icon: '🏨', color: '#8B5CF6' },
    { id: 'ziyarat', name: 'Ziyarat', icon: '📍', color: '#10B981' },
    { id: 'group', name: 'Group Activities', icon: '👥', color: '#F59E0B' },
];

/**
 * Convert a template to an itinerary item input
 */
export function templateToItineraryItem(
    template: ActivityTemplate,
    tripId: string,
    dayDate?: string,
    startTime?: string
): ItineraryItemInput {
    return {
        trip_id: tripId,
        title: template.title,
        description: template.description,
        day_date: dayDate || null,
        starts_at: startTime || (template.suggestedTimes ? template.suggestedTimes[0] : null),
        ends_at: startTime && template.defaultDuration
            ? calculateEndTime(startTime, template.defaultDuration)
            : null,
    };
}

/**
 * Calculate end time given start time and duration in minutes
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
}
