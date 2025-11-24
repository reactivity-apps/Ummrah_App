import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Bell, Clock, ChevronRight, Sunrise, Sun, Cloud, Sunset, Moon } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import RadialMenu from '../components/RadialMenu';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import { useFadeIn } from '../lib/sharedElementTransitions';
import Svg, { Path, Circle } from 'react-native-svg';

// Crescent Icon Component
const CrescentIcon = ({ size = 20, color = "#C5A059" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill={color}
        />
    </Svg>
);

interface PrayerTime {
    name: string;
    time: string;
    isPassed: boolean;
    isNext: boolean;
}

export default function PrayersScreen() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location] = useState('Makkah, Saudi Arabia');

    // Smooth entrance animation
    const fadeInStyle = useFadeIn(0);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Mock prayer times - in production, this would come from an API
    const getPrayerTimes = (): PrayerTime[] => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const prayers = [
            { name: 'Fajr', time: '05:15 AM', timeInMinutes: 5 * 60 + 15 },
            { name: 'Sunrise', time: '06:35 AM', timeInMinutes: 6 * 60 + 35 },
            { name: 'Dhuhr', time: '12:30 PM', timeInMinutes: 12 * 60 + 30 },
            { name: 'Asr', time: '03:45 PM', timeInMinutes: 15 * 60 + 45 },
            { name: 'Maghrib', time: '06:10 PM', timeInMinutes: 18 * 60 + 10 },
            { name: 'Isha', time: '07:40 PM', timeInMinutes: 19 * 60 + 40 },
        ];

        let nextPrayerFound = false;
        return prayers.map((prayer) => {
            const isPassed = currentTimeInMinutes > prayer.timeInMinutes;
            const isNext = !isPassed && !nextPrayerFound;
            if (isNext) nextPrayerFound = true;
            return {
                name: prayer.name,
                time: prayer.time,
                isPassed,
                isNext: isNext && prayer.name !== 'Sunrise',
            };
        });
    };

    const prayerTimes = getPrayerTimes();
    const nextPrayer = prayerTimes.find(p => p.isNext);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTimeUntilPrayer = (prayerTime: string): string => {
        // Simple calculation - in production, use proper time library
        const [time, period] = prayerTime.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let targetHour = hours;
        if (period === 'PM' && hours !== 12) targetHour += 12;
        if (period === 'AM' && hours === 12) targetHour = 0;

        const now = new Date();
        const target = new Date();
        target.setHours(targetHour, minutes, 0, 0);

        if (target < now) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hoursLeft > 0) {
            return `${hoursLeft}h ${minutesLeft}m`;
        }
        return `${minutesLeft}m`;
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-[#C5A059]/20">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2" activeOpacity={0.7}>
                    <ArrowLeft size={24} color="#4A6741" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center gap-2">
                    <CrescentIcon size={24} color="#C5A059" />
                    <Text className="text-2xl font-bold text-stone-800">Prayer Times</Text>
                </View>
            </View>

            {/* Animated content */}
            <Animated.ScrollView
                style={fadeInStyle}
                className="flex-1 px-6 py-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Next Prayer Widget - Similar to home */}
                {nextPrayer && (
                    <View className="mb-6">
                        <PrayerTimesWidget
                            prayers={prayerTimes.filter(p => p.name !== 'Sunrise').map(p => ({
                                name: p.name,
                                time: p.time,
                                isPassed: p.isPassed,
                                isNext: p.isNext
                            }))}
                            nextPrayer={{ name: nextPrayer.name, time: nextPrayer.time }}
                            location={location}
                            timeUntil={getTimeUntilPrayer(nextPrayer.time)}
                            clickable={false}
                        />
                    </View>
                )}

                {/* All Prayer Times */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-stone-800 mb-4">Today's Schedule</Text>
                    <View className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm overflow-hidden">
                        {prayerTimes.map((prayer, index) => (
                            <View key={prayer.name}>
                                <View className={`flex-row items-center justify-between px-5 py-4 ${prayer.isNext ? 'bg-[#C5A059]/10' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-12 h-12 rounded-full items-center justify-center ${prayer.isNext ? 'bg-[#C5A059]' :
                                            prayer.isPassed ? 'bg-stone-100' : 'bg-[#C5A059]/10'
                                            }`}>
                                            {prayer.name === 'Fajr' && <Sunrise size={20} color={prayer.isNext ? 'white' : prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                            {prayer.name === 'Sunrise' && <Sunrise size={20} color={prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                            {prayer.name === 'Dhuhr' && <Sun size={20} color={prayer.isNext ? 'white' : prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                            {prayer.name === 'Asr' && <Cloud size={20} color={prayer.isNext ? 'white' : prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                            {prayer.name === 'Maghrib' && <Sunset size={20} color={prayer.isNext ? 'white' : prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                            {prayer.name === 'Isha' && <Moon size={20} color={prayer.isNext ? 'white' : prayer.isPassed ? '#A0AEC0' : '#C5A059'} />}
                                        </View>
                                        <View className="ml-4">
                                            <Text className={`text-base font-semibold ${prayer.isNext ? 'text-[#C5A059]' :
                                                prayer.isPassed ? 'text-stone-400' : 'text-stone-800'
                                                }`}>
                                                {prayer.name}
                                            </Text>
                                            {prayer.isNext && (
                                                <Text className="text-xs text-emerald-600 font-medium">Up next</Text>
                                            )}
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`text-lg font-semibold ${prayer.isNext ? 'text-[#4A6741]' :
                                            prayer.isPassed ? 'text-stone-400' : 'text-stone-700'
                                            }`}>
                                            {prayer.time}
                                        </Text>
                                        {prayer.isNext && (
                                            <Text className="text-xs text-emerald-600 font-medium">
                                                {getTimeUntilPrayer(prayer.time)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {index < prayerTimes.length - 1 && (
                                    <View className="h-px bg-stone-100 mx-5" />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Qibla Direction */}
                <View className="mb-6">
                    <TouchableOpacity className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-[#4A6741] rounded-full items-center justify-center">
                                <Text className="text-white text-xl">🧭</Text>
                            </View>
                            <View className="ml-4">
                                <Text className="text-base font-semibold text-stone-800">Qibla Direction</Text>
                                <Text className="text-xs text-stone-500">Find the direction to Kaaba</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#CBD5E0" />
                    </TouchableOpacity>
                </View>

                {/* Islamic Date */}
                <View className="mb-6 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm text-amber-800/60 uppercase tracking-widest mb-1">Islamic Date</Text>
                            <Text className="text-lg font-semibold text-amber-900">15 Rajab 1447</Text>
                        </View>
                        <Text className="text-4xl">📅</Text>
                    </View>
                </View>
            </Animated.ScrollView>

            <RadialMenu />
        </SafeAreaView>
    );
}
