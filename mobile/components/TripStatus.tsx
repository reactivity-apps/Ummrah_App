/**
 * TripStatus Component
 * 
 * Displays current trip information including:
 * - Trip name and cities
 * - Current day progress
 * - Next scheduled activity
 * - Link to full itinerary
 */

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { CalendarDays, ChevronRight, Moon } from "lucide-react-native";
import { useTrip } from "../lib/context/TripContext";
import { useItinerary } from "../lib/api/hooks/useItinerary";

export default function TripStatus() {
    const { currentTrip, loading } = useTrip();

    // Get next activity
    const { items, loading: itemsLoading } = useItinerary({
        tripId: currentTrip?.id || '',
        enableRealtime: false,
    });

    if (loading || itemsLoading) {
        return (
            <View className="bg-card rounded-xl p-4 shadow-sm border border-[#C5A059]/20">
                <ActivityIndicator size="small" color="#C5A059" />
            </View>
        );
    }

    if (!currentTrip) {
        return (
            <View className="bg-card rounded-xl p-4 shadow-sm border border-[#C5A059]/20">
                <Text className="text-muted-foreground text-center">No active trip</Text>
            </View>
        );
    }

    // Calculate current day and trip status
    const startDate = currentTrip.start_date ? new Date(currentTrip.start_date) : null;
    const endDate = currentTrip.end_date ? new Date(currentTrip.end_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    let tripStatus: { type: 'upcoming' | 'active' | 'completed', message: string } | null = null;
    let currentDay: number | null = null;
    let totalDays: number | null = null;

    if (startDate && endDate) {
        const normalizedStart = new Date(startDate);
        normalizedStart.setHours(0, 0, 0, 0);
        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(0, 0, 0, 0);
        
        totalDays = Math.ceil((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (today < normalizedStart) {
            // Trip hasn't started yet
            const daysUntilStart = Math.ceil((normalizedStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            tripStatus = {
                type: 'upcoming',
                message: daysUntilStart === 1 ? 'Starts tomorrow' : `Starts in ${daysUntilStart} days`
            };
        } else if (today > normalizedEnd) {
            // Trip has ended
            tripStatus = {
                type: 'completed',
                message: 'Trip completed'
            };
        } else {
            // Trip is active
            currentDay = Math.ceil((today.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            tripStatus = {
                type: 'active',
                message: `Day ${currentDay} of ${totalDays}`
            };
        }
    }

    // Find next activity
    const now = new Date();
    const upcomingItems = items
        .filter(item => item.starts_at && new Date(item.starts_at) > now)
        .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime());
    const nextActivity = upcomingItems[0];

    // Format cities display
    const citiesDisplay = currentTrip.cities?.length > 0 
        ? currentTrip.cities.join(', ') 
        : 'No cities specified';

    return (
        <View className="bg-card rounded-xl p-4 shadow-sm border border-[#C5A059]/20">
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <View className="bg-[#C5A059]/10 border border-[#C5A059]/30 px-2 py-1 rounded-md mb-2 self-start flex-row items-center gap-1.5">
                        <Moon size={12} color="#C5A059" />
                        <Text className="text-[#C5A059] text-xs font-medium">Current Trip</Text>
                    </View>
                    <Text className="font-bold text-foreground">{currentTrip.name}</Text>
                </View>
                <View>
                    {tripStatus && (
                        <Text className="text-xs text-muted-foreground text-right">{tripStatus.message}</Text>
                    )}
                    <Text className="font-semibold text-[#C5A059] text-right">{citiesDisplay}</Text>
                </View>
            </View>

            {nextActivity && (
                <View className="p-3 bg-sand-50 rounded-lg border border-[#C5A059]/20 mb-3">
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 rounded-full bg-[#C5A059]/10 items-center justify-center mr-3 border border-[#C5A059]/20">
                            <Text className="text-[#C5A059] font-bold text-sm">
                                {new Date(nextActivity.starts_at!).getHours().toString().padStart(2, '0')}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-muted-foreground font-medium uppercase">
                                Next Activity • {new Date(nextActivity.starts_at!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text className="text-sm font-semibold text-foreground">{nextActivity.title}</Text>
                        </View>
                    </View>
                </View>
            )}

            <Link href="/itinerary" asChild>
                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-sand-200 rounded-lg bg-transparent">
                    <View className="flex-row items-center gap-2">
                        <CalendarDays size={16} color="#4A6741" />
                        <Text className="text-[#4A6741] font-medium">View Full Itinerary</Text>
                    </View>
                    <ChevronRight size={16} color="#4A6741" />
                </TouchableOpacity>
            </Link>
        </View>
    );
}
