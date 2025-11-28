import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Users, Calendar, Clock, MapPin, Crown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTrip } from "../../lib/context/TripContext";
import { supabase } from "../../lib/supabase";
import { GroupRow, TripRow, TripMembershipRow } from "../../types/db";

interface GroupStats {
    totalTrips: number;
    activeTrips: number;
    totalMembers: number;
    createdAt: string;
}

export default function GroupDetailsScreen() {
    const router = useRouter();
    const { currentTrip } = useTrip();
    const [group, setGroup] = useState<GroupRow | null>(null);
    const [stats, setStats] = useState<GroupStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadGroupDetails();
    }, [currentTrip]);

    const loadGroupDetails = async (isRefreshing = false) => {
        if (!currentTrip?.group_id) {
            setLoading(false);
            return;
        }

        try {
            if (!isRefreshing) {
                setLoading(true);
            }

            // Fetch group details
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', currentTrip.group_id)
                .single();

            if (groupError) {
                console.error('Error fetching group:', groupError);
            } else {
                setGroup(groupData);
            }

            // Fetch total trips count for this group
            const { count: totalTripsCount, error: tripsError } = await supabase
                .from('trips')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', currentTrip.group_id);

            // Fetch active trips count
            const { count: activeTripsCount, error: activeTripsError } = await supabase
                .from('trips')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', currentTrip.group_id)
                .eq('status', 'active');

            // First, fetch all trip IDs for this group
            const { data: groupTrips, error: groupTripsError } = await supabase
                .from('trips')
                .select('id')
                .eq('group_id', currentTrip.group_id);

            const tripIds = groupTrips?.map(t => t.id) || [];

            // Fetch unique members count across all trips in this group
            let uniqueMembers = 0;
            if (tripIds.length > 0) {
                const { data: memberships, error: membershipsError } = await supabase
                    .from('trip_memberships')
                    .select('user_id, trip_id')
                    .in('trip_id', tripIds);

                // Count unique users
                uniqueMembers = new Set(memberships?.map(m => m.user_id) || []).size;
            }

            setStats({
                totalTrips: totalTripsCount || 0,
                activeTrips: activeTripsCount || 0,
                totalMembers: uniqueMembers,
                createdAt: groupData?.created_at || new Date().toISOString(),
            });

        } catch (error) {
            console.error('Error loading group details:', error);
        } finally {
            if (!isRefreshing) {
                setLoading(false);
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadGroupDetails(true);
        setRefreshing(false);
    };

    const calculateTimeOnApp = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
        
        if (diffInMonths < 1) {
            const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return diffInDays === 1 ? '1 day' : `${diffInDays} days`;
        } else if (diffInMonths < 12) {
            return diffInMonths === 1 ? '1 month' : `${diffInMonths} months`;
        } else {
            const years = Math.floor(diffInMonths / 12);
            return years === 1 ? '1 year' : `${years} years`;
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4A6741" />
            </SafeAreaView>
        );
    }

    if (!currentTrip) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="p-4">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>
                    <Text className="text-center text-muted-foreground mt-8">
                        No trip selected. Please join or create a trip first.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A6741"
                        colors={["#4A6741"]}
                    />
                }
            >
                {/* Header */}
                <View className="p-4 pb-6 bg-card border-b border-sand-200">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-foreground">Group Details</Text>
                    <Text className="text-muted-foreground mt-1">
                        Information about your travel group
                    </Text>
                </View>

                {/* Group Info Card */}
                <View className="px-4 mt-4">
                    <View className="bg-card p-6 rounded-xl border border-sand-200 items-center">
                        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                            {group?.logo_url ? (
                                <Text className="text-primary font-bold text-2xl">
                                    {group.name.charAt(0)}
                                </Text>
                            ) : (
                                <Users size={32} color="#4A6741" />
                            )}
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-bold text-foreground text-center">
                                {group?.name || 'Group Name'}
                            </Text>
                            <View className="ml-2 bg-amber-100 px-2 py-1 rounded-full flex-row items-center">
                                <Crown size={12} color="#D97706" />
                                <Text className="text-amber-700 text-xs font-semibold ml-1">Group</Text>
                            </View>
                        </View>
                        {stats && (
                            <Text className="text-muted-foreground mt-2">
                                Active since {new Date(stats.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Stats Grid */}
                {stats && (
                    <View className="px-4 mt-4">
                        <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                            <View className="p-4 border-b border-sand-100">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                            <Calendar size={20} color="#4A6741" />
                                        </View>
                                        <View>
                                            <Text className="text-sm text-muted-foreground">Total Trips</Text>
                                            <Text className="text-2xl font-bold text-foreground">{stats.totalTrips}</Text>
                                        </View>
                                    </View>
                                    {stats.activeTrips > 0 && (
                                        <View className="bg-green-100 px-3 py-1 rounded-full">
                                            <Text className="text-green-700 text-xs font-semibold">
                                                {stats.activeTrips} Active
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View className="p-4 border-b border-sand-100">
                                <View className="flex-row items-center">
                                    <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                        <Users size={20} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-sm text-muted-foreground">Total Members</Text>
                                        <Text className="text-2xl font-bold text-foreground">{stats.totalMembers}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="p-4">
                                <View className="flex-row items-center">
                                    <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                        <Clock size={20} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-sm text-muted-foreground">Time on App</Text>
                                        <Text className="text-2xl font-bold text-foreground">
                                            {calculateTimeOnApp(stats.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Current Trip Info */}
                {currentTrip && (
                    <View className="px-4 mt-4">
                        <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                            Current Trip
                        </Text>
                        <View className="bg-card p-4 rounded-xl border border-sand-200">
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-foreground">
                                        {currentTrip.name}
                                    </Text>
                                    {currentTrip.base_city && (
                                        <View className="flex-row items-center mt-1">
                                            <MapPin size={14} color="#9CA3AF" />
                                            <Text className="text-sm text-muted-foreground ml-1">
                                                {currentTrip.base_city}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {currentTrip.status === 'active' && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-green-700 text-xs font-semibold">Active</Text>
                                    </View>
                                )}
                            </View>
                            {currentTrip.start_date && currentTrip.end_date && (
                                <View className="mt-2 pt-2 border-t border-sand-100">
                                    <Text className="text-xs text-muted-foreground">
                                        {new Date(currentTrip.start_date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} - {new Date(currentTrip.end_date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* WhatsApp Link */}
                {group?.whatsapp_link && (
                    <View className="px-4 mt-4">
                        <TouchableOpacity className="bg-[#25D366] p-4 rounded-xl flex-row items-center justify-center">
                            <Text className="text-white font-semibold">Join Group WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
