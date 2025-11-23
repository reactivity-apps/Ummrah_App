// Type definitions for the Umrah App

export interface Dua {
    id: string;
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    category: 'Mosque' | 'Kaaba' | 'General' | 'Tawaf' | "Sa'i" | 'Morning' | 'Evening';
}

export interface GuideStep {
    title: string;
    description: string;
    details: string;
}

export interface Guide {
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
    image: any; // React Native image source
    steps: GuideStep[];
}

export interface Ziyarat {
    id: string;
    title: string;
    description: string;
    location: 'Madinah' | 'Makkah';
    image: any; // React Native image source
    distance: string;
    visitTime: string;
    significance: string;
    tips: string[];
}

export interface Activity {
    time: string;
    title: string;
    type: 'travel' | 'accommodation' | 'prayer' | 'meal' | 'group' | 'ziyarat' | 'free';
}

export interface ScheduleDay {
    id: string;
    date: string;
    day: string;
    location: string;
    activities: Activity[];
}

export interface Document {
    id: string;
    title: string;
    description: string;
    status: 'verified' | 'pending' | 'expired';
    category: 'Travel' | 'Accommodation' | 'Insurance' | 'Health';
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface UserPreferences {
    language: string;
    notifications: boolean;
    prayerReminders: boolean;
}

export interface Profile {
    name: string;
    email: string;
    phone: string;
    completedUmrahs: number;
    nextTrip: string;
    emergencyContact: EmergencyContact;
    preferences: UserPreferences;
}
