/**
 * PrayerTimesWidget Component
 * 
 * A reusable widget displaying the next prayer time with a visual timeline.
 * Features:
 * - Gradient background matching app theme
 * - Displays next prayer name and time
 * - Shows countdown until next prayer
 * - Visual timeline of all prayers
 * - Decorative circle design element
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type React from 'react';

interface Prayer {
    name: string;
    time: string;
    done?: boolean;
    isPassed?: boolean;
    next?: boolean;
    isNext?: boolean;
}

interface PrayerTimesWidgetProps {
    prayers: Prayer[];
    nextPrayer: Prayer;
    location?: string;
    timeUntil?: string;
    onPress?: () => void;
    clickable?: boolean;
    themeColors?: string[]; // Gradient colors for location theming
}

export default function PrayerTimesWidget({
    prayers,
    nextPrayer,
    location = 'Makkah, Saudi Arabia',
    timeUntil = '45 mins',
    onPress,
    clickable = true,
    themeColors = ['#4A6741', '#3A5234', '#2A3E28'], // Default: Makkah green
}: PrayerTimesWidgetProps) {
    const router = useRouter();

    const handlePress = () => {
        if (clickable && onPress) {
            onPress();
        } else if (clickable) {
            router.push('/prayers');
        }
    };

    // Validation checks - detect missing or invalid data
    const hasValidPrayers = prayers && prayers.length > 0;
    const hasValidNextPrayer = nextPrayer && nextPrayer.name && nextPrayer.time;

    // Error state: Critical data is missing (likely API failure)
    if (!hasValidNextPrayer || !hasValidPrayers) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <AlertCircle size={24} color="#DC2626" />
                    </View>
                    <Text style={styles.errorTitle}>Unable to load prayer times</Text>
                    <Text style={styles.errorMessage}>
                        {!hasValidPrayers 
                            ? 'Prayer times are currently unavailable'
                            : 'Next prayer information is missing'}
                    </Text>
                </View>
            </View>
        );
    }

    const content = (
        // @ts-ignore - LinearGradient type compatibility issue with React 19
        <LinearGradient
            colors={themeColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            <View style={styles.header}>
                <View style={styles.locationBadge}>
                    <MapPin size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
                <View style={styles.nextPrayerContainer}>
                    <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
                    <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                </View>
            </View>

            <View style={styles.timeContainer}>
                <View style={styles.timeRow}>
                    <Clock size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.timeText}>{nextPrayer.time}</Text>
                </View>
                <Text style={styles.countdownText}>in {timeUntil}</Text>
            </View>

            <View style={styles.prayersRow}>
                {prayers.map((p) => {
                    const isNext = p.next || p.isNext;
                    const isDone = p.done || p.isPassed;

                    return (
                        <View key={p.name} style={[styles.prayerItem, { opacity: isNext ? 1 : 0.6 }]}>
                            <View style={[
                                styles.prayerBar,
                                { backgroundColor: isDone ? '#34D399' : isNext ? '#FFFFFF' : '#065F46' }
                            ]} />
                            <Text style={styles.prayerName} numberOfLines={1} adjustsFontSizeToFit>{p.name}</Text>
                            <Text style={styles.prayerTime} numberOfLines={1} adjustsFontSizeToFit>{p.time}</Text>
                        </View>
                    );
                })}
            </View>
        </LinearGradient>
    );

    if (clickable) {
        return (
            <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.container}>
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
    container: {
        // Shadow removed for cleaner appearance
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
    },
    errorIconContainer: {
        marginBottom: 12,
    },
    errorTitle: {
        color: '#991B1B',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    errorMessage: {
        color: '#DC2626',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    gradient: {
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        zIndex: 10,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    locationText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: '500',
    },
    nextPrayerContainer: {
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 20,
    },
    nextPrayerLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    nextPrayerName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    countdownText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        paddingBottom: 4,
    },
    prayersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        marginTop: 8,
    },
    prayerItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    prayerBar: {
        height: 6,
        width: '100%',
        borderRadius: 3,
    },
    prayerName: {
        color: 'white',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 4,
    },
    prayerTime: {
        color: 'white',
        fontSize: 9,
    },
});
