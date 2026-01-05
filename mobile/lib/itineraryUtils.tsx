import React from 'react';
import { Clock, Users, Utensils, Plane, Hotel, MapPin } from 'lucide-react-native';
import Svg, { Path, Rect } from 'react-native-svg';

// Kaaba Icon Component
export const KaabaIcon = ({ size = 16, color = "#C5A059" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="5" width="16" height="15" rx="2" fill={color} />
        <Path d="M4 9H20" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
        <Path d="M7 5V9" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
        <Path d="M12 14H16" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    </Svg>
);

export const ActivityIcon = ({ title }: { title: string }) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('prayer') || lowerTitle.includes('salah') || lowerTitle.includes('fajr') || lowerTitle.includes('dhuhr') || lowerTitle.includes('asr') || lowerTitle.includes('maghrib') || lowerTitle.includes('isha')) {
        return <KaabaIcon size={16} color="#C5A059" />;
    } else if (lowerTitle.includes('meal') || lowerTitle.includes('breakfast') || lowerTitle.includes('lunch') || lowerTitle.includes('dinner')) {
        return <Utensils size={16} color="#C5A059" />;
    } else if (lowerTitle.includes('hotel') || lowerTitle.includes('check-in') || lowerTitle.includes('accommodation')) {
        return <Hotel size={16} color="#C5A059" />;
    } else if (lowerTitle.includes('airport') || lowerTitle.includes('flight') || lowerTitle.includes('arrival') || lowerTitle.includes('departure')) {
        return <Plane size={16} color="#C5A059" />;
    } else if (lowerTitle.includes('group') || lowerTitle.includes('orientation') || lowerTitle.includes('session')) {
        return <Users size={16} color="#C5A059" />;
    } else if (lowerTitle.includes('ziyarat') || lowerTitle.includes('visit')) {
        return <MapPin size={16} color="#C5A059" />;
    }
    return <Clock size={16} color="#C5A059" />;
};

export const getActivityColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('prayer') || lowerTitle.includes('salah') || lowerTitle.includes('group') || lowerTitle.includes('orientation')) {
        return 'bg-[#4A6741]/10 border-[#4A6741]/20';
    }
    return 'bg-[#C5A059]/10 border-[#C5A059]/30';
};

export const getActivityType = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('prayer') || lowerTitle.includes('salah')) return 'Prayer';
    if (lowerTitle.includes('meal') || lowerTitle.includes('breakfast') || lowerTitle.includes('lunch') || lowerTitle.includes('dinner')) return 'Meal';
    if (lowerTitle.includes('hotel') || lowerTitle.includes('accommodation')) return 'Accommodation';
    if (lowerTitle.includes('airport') || lowerTitle.includes('flight')) return 'Travel';
    if (lowerTitle.includes('group') || lowerTitle.includes('orientation')) return 'Group';
    if (lowerTitle.includes('ziyarat') || lowerTitle.includes('visit')) return 'Ziyarat';
    return 'Activity';
};