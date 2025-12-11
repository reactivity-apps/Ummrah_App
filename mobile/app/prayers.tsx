import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Bell, Clock, ChevronRight, Sunrise, Sun, Cloud, Sunset, Moon } from 'lucide-react-native';
import RadialMenu from '../components/RadialMenu';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import { useFadeIn } from '../lib/sharedElementTransitions';
import { usePrayerTimes } from '../lib/api/hooks/usePrayerTimes';
import { usePrayerLocation } from '../lib/context/PrayerLocationContext';
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

export default function PrayersScreen() {
    const router = useRouter();
    const { locationAddress, selectedLocation, setLocation } = usePrayerLocation();

    // Smooth entrance animation
    const fadeInStyle = useFadeIn(0);

    // Fetch prayer times from API
    const {
        prayers: prayerTimes,
        nextPrayer,
        timeUntilNext,
        hijriDate,
        location,
        isLoading,
        error,
        refresh,
    } = usePrayerTimes({
        address: locationAddress,
        autoRefresh: true,
    });

    // Theme colors based on selected location
    const themeColors = selectedLocation === 'Makkah' 
        ? ['#4A6741', '#3A5234', '#2A3E28']  // Green for Makkah
        : ['#C5A059', '#B8904D', '#A67F42']; // Gold for Madina

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]" edges={['bottom']}>
            <View className="px-6 py-4 border-b border-[#C5A059]/20">
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={() => setLocation('Makkah')}
                        className={`px-3 py-1.5 rounded-lg ${selectedLocation === 'Makkah' ? 'bg-[#4A6741]' : 'bg-stone-100'}`}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-xs font-semibold ${selectedLocation === 'Makkah' ? 'text-white' : 'text-stone-600'}`}>
                            Makkah
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setLocation('Madina')}
                        className={`px-3 py-1.5 rounded-lg ${selectedLocation === 'Madina' ? 'bg-[#C5A059]' : 'bg-stone-100'}`}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-xs font-semibold ${selectedLocation === 'Madina' ? 'text-white' : 'text-stone-600'}`}>
                            Madina
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Animated content */}
            <Animated.ScrollView
                style={fadeInStyle}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 120 }}
            >
                {/* Loading State */}
                {isLoading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#C5A059" />
                        <Text className="text-stone-500 mt-4">Loading prayer times...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <View className="bg-red-50 rounded-2xl p-5 mb-6 border border-red-100">
                        <Text className="text-red-800 font-semibold mb-2">Unable to load prayer times</Text>
                        <Text className="text-red-600 text-sm mb-3">{error}</Text>
                        <TouchableOpacity
                            onPress={refresh}
                            className="bg-red-600 rounded-lg py-2 px-4 self-start"
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Next Prayer Widget - Similar to home */}
                {!isLoading && nextPrayer && (
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
                            timeUntil={timeUntilNext}
                            clickable={false}
                            themeColors={themeColors}
                        />
                    </View>
                )}

                {/* All Prayer Times */}
                {!isLoading && prayerTimes.length > 0 && (
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
                                                {timeUntilNext}
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
                )}

                {/* Qibla Direction */}
                {!isLoading && (
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
                )}

                {/* Islamic Date */}
                {!isLoading && (
                <View className="mb-6 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm text-amber-800/60 uppercase tracking-widest mb-1">Islamic Date</Text>
                            <Text className="text-lg font-semibold text-amber-900">{hijriDate || 'Loading...'}</Text>
                        </View>
                        <Text className="text-4xl">📅</Text>
                    </View>
                </View>
                )}
            </Animated.ScrollView>

            <RadialMenu />
        </SafeAreaView>
    );
}
