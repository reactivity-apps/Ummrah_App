import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import Animated from "react-native-reanimated";
import { SCHEDULE } from "../data/mock";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Utensils, Plane, Hotel, Church, Moon } from "lucide-react-native";
import RadialMenu from "../components/RadialMenu";
import { ItinerarySkeleton } from "../components/SkeletonLoader";
import { useFadeIn } from "../lib/sharedElementTransitions";
import Svg, { Path, Rect } from "react-native-svg";

// Kaaba Icon Component
const KaabaIcon = ({ size = 16, color = "#C5A059" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="5" width="16" height="15" rx="2" fill={color} />
        <Path d="M4 9H20" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
        <Path d="M7 5V9" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
        <Path d="M12 14H16" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    </Svg>
);

export default function ItineraryScreen() {
    // Loading state to show skeleton during initial render
    // This prevents white flash during navigation
    const [isLoading, setIsLoading] = useState(true);

    // Smooth entrance animation
    const fadeStyle = useFadeIn(0);

    useEffect(() => {
        // Simulate data loading - replace with actual API call
        // Short delay ensures smooth transition from skeleton to content
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    const ActivityIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'travel':
                return <Plane size={16} color="#C5A059" />;
            case 'accommodation':
                return <Hotel size={16} color="#C5A059" />;
            case 'prayer':
                return <KaabaIcon size={16} color="#C5A059" />;
            case 'meal':
                return <Utensils size={16} color="#C5A059" />;
            case 'group':
                return <Users size={16} color="#C5A059" />;
            case 'ziyarat':
                return <MapPin size={16} color="#C5A059" />;
            default:
                return <Clock size={16} color="#C5A059" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'travel':
                return 'bg-[#C5A059]/10 border-[#C5A059]/30';
            case 'accommodation':
                return 'bg-[#C5A059]/10 border-[#C5A059]/30';
            case 'prayer':
                return 'bg-[#4A6741]/10 border-[#4A6741]/20';
            case 'meal':
                return 'bg-[#C5A059]/10 border-[#C5A059]/30';
            case 'group':
                return 'bg-[#4A6741]/10 border-[#4A6741]/20';
            case 'ziyarat':
                return 'bg-[#C5A059]/10 border-[#C5A059]/30';
            default:
                return 'bg-sand-50 border-sand-200';
        }
    };

    // Show skeleton while loading to prevent white flash
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <ItinerarySkeleton />
                <RadialMenu />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="px-4 py-3 bg-card border-b border-[#C5A059]/20">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.push('/(tabs)')} className="mr-3 p-2 -ml-2" activeOpacity={0.7}>
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center gap-2">
                        <Calendar size={24} color="#C5A059" />
                        <View>
                            <Text className="text-2xl font-bold text-foreground">Trip Itinerary</Text>
                            <Text className="text-sm text-[#C5A059]">Umrah February 2025</Text>
                        </View>
                    </View>
                </View>

                {/* Trip Overview */}
                <View className="flex-row gap-2 mt-2">
                    <View className="flex-1 bg-[#C5A059]/10 p-3 rounded-lg border border-[#C5A059]/20">
                        <Text className="text-xs text-[#C5A059] font-medium mb-1">DURATION</Text>
                        <Text className="text-foreground font-semibold">10 Days</Text>
                    </View>
                    <View className="flex-1 bg-[#C5A059]/10 p-3 rounded-lg border border-[#C5A059]/20">
                        <Text className="text-xs text-[#C5A059] font-medium mb-1">CITIES</Text>
                        <Text className="text-foreground font-semibold">Madinah, Makkah</Text>
                    </View>
                    <View className="flex-1 bg-[#4A6741]/10 p-3 rounded-lg border border-[#4A6741]/20">
                        <Text className="text-xs text-primary font-medium mb-1">CURRENT</Text>
                        <Text className="text-primary font-semibold">Day 3</Text>
                    </View>
                </View>
            </View>

            {/* Animated content */}
            <Animated.ScrollView style={fadeStyle} className="flex-1 px-4 py-4">
                {SCHEDULE.map((day, dayIndex) => (
                    <View key={day.id} className="mb-6">
                        {/* Day Header */}
                        <View className="flex-row items-center mb-3">
                            <View className={`px-3 py-1.5 rounded-full mr-3 ${dayIndex === 2 ? 'bg-primary' : 'bg-sand-200'}`}>
                                <Text className={`font-bold text-sm ${dayIndex === 2 ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {day.day}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-semibold">
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Text>
                                <View className="flex-row items-center mt-0.5">
                                    <MapPin size={12} color="hsl(40 5% 55%)" />
                                    <Text className="text-xs text-muted-foreground ml-1">{day.location}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Activities */}
                        <View className="ml-6 border-l-2 border-sand-200">
                            {day.activities.map((activity, actIndex) => (
                                <View key={actIndex} className="relative pl-6 pb-4">
                                    {/* Timeline Dot */}
                                    <View
                                        className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${dayIndex === 2 && actIndex === day.activities.length - 1
                                            ? 'bg-primary border-primary'
                                            : 'bg-card border-sand-300'
                                            }`}
                                        style={{ transform: [{ translateX: -7 }] }}
                                    />

                                    {/* Activity Card */}
                                    <View className={`bg-card rounded-xl p-3.5 border ${getActivityColor(activity.type)}`}>
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-row items-center flex-1">
                                                <View className="mr-2">
                                                    <ActivityIcon type={activity.type} />
                                                </View>
                                                <Text className="text-xs text-muted-foreground font-semibold">
                                                    {activity.time}
                                                </Text>
                                            </View>
                                            <View className={`px-2 py-0.5 rounded-full ${activity.type === 'prayer' ? 'bg-primary/20' :
                                                activity.type === 'meal' ? 'bg-orange-100' :
                                                    activity.type === 'ziyarat' ? 'bg-emerald-100' :
                                                        'bg-sand-100'
                                                }`}>
                                                <Text className="text-[10px] font-medium text-foreground capitalize">
                                                    {activity.type}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-foreground font-semibold leading-5">
                                            {activity.title}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Future Days Placeholder */}
                <View className="bg-card rounded-xl p-6 border border-sand-200 border-dashed mb-8">
                    <View className="items-center">
                        <Calendar size={32} color="hsl(40 5% 70%)" />
                        <Text className="text-muted-foreground font-medium mt-2">Days 4-10</Text>
                        <Text className="text-sm text-muted-foreground mt-1 text-center">
                            Full itinerary will be revealed as your journey progresses
                        </Text>
                    </View>
                </View>
            </Animated.ScrollView>

            <RadialMenu />
        </SafeAreaView>
    );
}
