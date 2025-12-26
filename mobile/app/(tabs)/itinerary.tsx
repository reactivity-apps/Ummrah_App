import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Calendar, MapPin, Clock, Users, Utensils, Plane, Hotel, AlertCircle } from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import Svg, { Path, Rect } from "react-native-svg";
import { useItinerary } from "../../lib/api/hooks/useItinerary";
import { useTrip } from "../../lib/context/TripContext";
import { useTripStatus } from "../../lib/api/hooks/useTripStatus";
import { ItineraryItemRow } from "../../types/db";

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
    const fadeStyle = useFadeIn(0);

    // Get current trip from context
    const { currentTrip, loading: tripsLoading } = useTrip();

    // Get itinerary items for current trip
    const {
        items,
        loading,
        error,
    } = useItinerary({
        tripId: currentTrip?.id || '',
        enableRealtime: true,
    });

    // Calculate trip status using centralized hook
    const tripStatus = useTripStatus(currentTrip);

    const ActivityIcon = ({ title }: { title: string }) => {
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

    const getActivityColor = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('prayer') || lowerTitle.includes('salah') || lowerTitle.includes('group') || lowerTitle.includes('orientation')) {
            return 'bg-[#4A6741]/10 border-[#4A6741]/20';
        }
        return 'bg-[#C5A059]/10 border-[#C5A059]/30';
    };

    const getActivityType = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('prayer') || lowerTitle.includes('salah')) return 'Prayer';
        if (lowerTitle.includes('meal') || lowerTitle.includes('breakfast') || lowerTitle.includes('lunch') || lowerTitle.includes('dinner')) return 'Meal';
        if (lowerTitle.includes('hotel') || lowerTitle.includes('accommodation')) return 'Accommodation';
        if (lowerTitle.includes('airport') || lowerTitle.includes('flight')) return 'Travel';
        if (lowerTitle.includes('group') || lowerTitle.includes('orientation')) return 'Group';
        if (lowerTitle.includes('ziyarat') || lowerTitle.includes('visit')) return 'Ziyarat';
        return 'Activity';
    };

    // Group items by day
    const groupedItems = items.reduce((acc, item) => {
        const day = item.day_date || 'No Date';
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(item);
        return acc;
    }, {} as Record<string, ItineraryItemRow[]>);

    const sortedDays = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return a.localeCompare(b);
    });

    // Get trip info
    const tripName = currentTrip?.name || 'Your Trip';

    if (tripsLoading || loading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A6741" />
                    <Text className="text-muted-foreground mt-4">Loading itinerary...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center p-8">
                    <AlertCircle size={64} color="#EF4444" />
                    <Text className="text-foreground font-semibold text-lg mt-4">Error Loading Itinerary</Text>
                    <Text className="text-muted-foreground text-center mt-2">{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentTrip) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center p-8">
                    <Calendar size={64} color="#CBD5E0" />
                    <Text className="text-foreground font-semibold text-lg mt-4">No Active Trip</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Join or create a trip to view the itinerary
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['top']}>
            <View className="px-4 py-3 bg-card border-b border-[#C5A059]/20">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <Calendar size={20} color="#C5A059" className="mr-2" />
                        <Text className="text-lg font-bold text-foreground">{tripName}</Text>
                    </View>
                    {tripStatus.type && (
                        <View className={`px-3 py-1 rounded-full ${
                            tripStatus.type === 'active' ? 'bg-[#4A6741]/10 border border-[#4A6741]/20' :
                            tripStatus.type === 'upcoming' ? 'bg-[#C5A059]/10 border border-[#C5A059]/20' :
                            'bg-gray-100 border border-gray-200'
                        }`}>
                            <Text className={`text-xs font-medium ${
                                tripStatus.type === 'active' ? 'text-primary' :
                                tripStatus.type === 'upcoming' ? 'text-[#C5A059]' :
                                'text-muted-foreground'
                            }`}>
                                {tripStatus.type === 'active' ? 'Active' :
                                 tripStatus.type === 'upcoming' ? 'Upcoming' :
                                 'Completed'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Trip Overview */}
                <View className="flex-row gap-2">
                    {tripStatus.totalDays && (
                        <View className="flex-1 bg-[#C5A059]/10 p-2 rounded-lg border border-[#C5A059]/20">
                            <Text className="text-[10px] text-[#C5A059] font-medium mb-0.5">DURATION</Text>
                            <Text className="text-foreground font-semibold text-sm">{tripStatus.totalDays} Days</Text>
                        </View>
                    )}
                    <View className="flex-1 bg-[#C5A059]/10 p-2 rounded-lg border border-[#C5A059]/20">
                        <Text className="text-[10px] text-[#C5A059] font-medium mb-0.5">ACTIVITIES</Text>
                        <Text className="text-foreground font-semibold text-sm">{items.length} Items</Text>
                    </View>
                    {tripStatus.currentDay && tripStatus.totalDays && tripStatus.currentDay <= tripStatus.totalDays && (
                        <View className="flex-1 bg-[#4A6741]/10 p-2 rounded-lg border border-[#4A6741]/20">
                            <Text className="text-[10px] text-primary font-medium mb-0.5">CURRENT</Text>
                            <Text className="text-primary font-semibold text-sm">Day {tripStatus.currentDay}</Text>
                        </View>
                    )}
                    {tripStatus.daysUntilStart && (
                        <View className="flex-1 bg-[#C5A059]/10 p-2 rounded-lg border border-[#C5A059]/20">
                            <Text className="text-[10px] text-[#C5A059] font-medium mb-0.5">STARTS IN</Text>
                            <Text className="text-foreground font-semibold text-sm">{tripStatus.daysUntilStart} {tripStatus.daysUntilStart === 1 ? 'Day' : 'Days'}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Animated content */}
            <Animated.ScrollView style={fadeStyle} className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}>
                {items.length === 0 ? (
                    <View className="bg-card rounded-xl p-8 border border-sand-200 border-dashed">
                        <View className="items-center">
                            <Calendar size={48} color="hsl(40 5% 70%)" />
                            <Text className="text-foreground font-semibold mt-4">No Activities Yet</Text>
                            <Text className="text-sm text-muted-foreground mt-2 text-center">
                                Your itinerary will appear here once your admin adds activities
                            </Text>
                        </View>
                    </View>
                ) : (
                    sortedDays.map((day, dayIndex) => (
                        <View key={day} className="mb-6">
                            {/* Day Header */}
                            <View className="flex-row items-center mb-3">
                                <View className="px-3 py-1.5 rounded-full mr-3 bg-sand-200">
                                    <Text className="font-bold text-sm text-foreground">
                                        {day === 'No Date' ? 'Unscheduled' : new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-muted-foreground">
                                        {groupedItems[day].length} {groupedItems[day].length === 1 ? 'activity' : 'activities'}
                                    </Text>
                                </View>
                            </View>

                            {/* Activities */}
                            <View className="ml-6 border-l-2 border-sand-200">
                                {groupedItems[day].map((activity, actIndex) => (
                                    <View key={activity.id} className="relative pl-6 pb-4">
                                        {/* Timeline Dot */}
                                        <View
                                            className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 bg-card border-sand-300"
                                            style={{ transform: [{ translateX: -7 }] }}
                                        />

                                        {/* Activity Card */}
                                        <View className={`bg-card rounded-xl p-3.5 border ${getActivityColor(activity.title)}`}>
                                            <View className="flex-row items-start justify-between mb-2">
                                                <View className="flex-row items-center flex-1">
                                                    <View className="mr-2">
                                                        <ActivityIcon title={activity.title} />
                                                    </View>
                                                    {activity.starts_at && (
                                                        <Text className="text-xs text-muted-foreground font-semibold">
                                                            {new Date(activity.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        </Text>
                                                    )}
                                                </View>
                                                <View className="px-2 py-0.5 rounded-full bg-sand-100">
                                                    <Text className="text-[10px] font-medium text-foreground">
                                                        {getActivityType(activity.title)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-foreground font-semibold leading-5 mb-1">
                                                {activity.title}
                                            </Text>
                                            {activity.description && (
                                                <Text className="text-xs text-muted-foreground mt-1">
                                                    {activity.description}
                                                </Text>
                                            )}
                                            {activity.location && (
                                                <View className="flex-row items-center mt-2">
                                                    <MapPin size={12} color="hsl(40 5% 55%)" />
                                                    <Text className="text-xs text-muted-foreground ml-1">{activity.location}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    );
}
