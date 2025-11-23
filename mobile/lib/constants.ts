// App constants and configuration

export const APP_NAME = 'Umrah Guide';
export const APP_VERSION = '1.0.0';

// Prayer times
export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// Dua categories
export const DUA_CATEGORIES = [
    'All',
    'Tawaf',
    "Sa'i",
    'Morning',
    'Evening',
    'Mosque',
    'Kaaba',
    'General',
] as const;

// Activity types
export const ACTIVITY_TYPES = {
    TRAVEL: 'travel',
    ACCOMMODATION: 'accommodation',
    PRAYER: 'prayer',
    MEAL: 'meal',
    GROUP: 'group',
    ZIYARAT: 'ziyarat',
    FREE: 'free',
} as const;

// Activity colors
export const ACTIVITY_COLORS = {
    travel: 'bg-blue-50 border-blue-200',
    accommodation: 'bg-purple-50 border-purple-200',
    prayer: 'bg-primary/10 border-primary/20',
    meal: 'bg-orange-50 border-orange-200',
    group: 'bg-amber-50 border-amber-200',
    ziyarat: 'bg-emerald-50 border-emerald-200',
    free: 'bg-sand-50 border-sand-200',
} as const;

// Quick action items
export const QUICK_ACTIONS = [
    { label: 'Duas', icon: 'Book', href: '/duas', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ziyarat', icon: 'Compass', href: '/map', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Guide', icon: 'Info', href: '/guide', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Documents', icon: 'FileText', href: '/profile', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Emergency', icon: 'Phone', href: '/profile', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Favorites', icon: 'Heart', href: '/profile', color: 'text-pink-600', bg: 'bg-pink-50' },
] as const;
