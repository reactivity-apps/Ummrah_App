import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, MapPin, Users, Clock } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useTrip } from "../../lib/context/TripContext";

interface TripWithDetails {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    base_city: string | null;
    status: string;
    joined_at: string;
    role: string;
}

export default function TripHistoryScreen() {
    const router = useRouter();
    const { currentTrip } = useTrip();
    const [loading, setLoading] = useState(false);
    const [trips, setTrips] = useState<TripWithDetails[]>([]);

    useEffect(() => {
        // loadTrips();
        setLoading(false);
    }, []);

    const loadTrips = async () => {
        /* 
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.replace('/login');
                return;
            }

            // TODO: Fix issue - Currently only returns active memberships (where left_at is null)
            // Need to include ALL trip memberships (including left trips) for complete history
            // Consider adding: .is('left_at', null) to explicitly show only active, or remove the filter
            // to show all historical trips including ones the user has left
            
            // Get all trip memberships with trip details
            const { data: memberships, error } = await supabase
                .from('trip_memberships')
                .select(`
                    joined_at,
                    role,
                    trips!inner (
                        id,
                        name,
                        start_date,
                        end_date,
                        base_city,
                        status
                    )
                `)
                .eq('user_id', user.id)
                .order('joined_at', { ascending: false });

            if (error) {
                console.error('Error fetching trips:', error);
            } else if (memberships) {
                // Transform data
                const tripsData: TripWithDetails[] = memberships.map((m: any) => ({
                    id: m.trips.id,
                    name: m.trips.name,
                    start_date: m.trips.start_date,
                    end_date: m.trips.end_date,
                    base_city: m.trips.base_city,
                    status: m.trips.status,
                    joined_at: m.joined_at,
                    role: m.role
                }));

                setTrips(tripsData);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
        */
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            'super_admin': 'bg-red-100 text-red-700',
            'group_owner': 'bg-primary/20 text-primary',
            'user': 'bg-sand-200 text-muted-foreground'
        };
        
        return colors[role] || colors['user'];
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#4A6741" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Header */}
                <View className="px-5 py-4 border-b border-sand-200">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mb-4"
                    >
                        <ArrowLeft size={24} color="#4A6741" />
                        <Text className="text-primary font-medium ml-2">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-foreground">Trip History</Text>
                    <Text className="text-muted-foreground mt-1">
                        {currentTrip ? '1 trip' : 'No trips'}
                    </Text>
                </View>

                {/* Info Notice */}
                <View className="px-5 mt-4">
                    <View className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <Text className="text-sm text-foreground font-medium mb-1">
                            Currently Showing: Active Trip Only
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            Feature coming soon: View all your previous trips and their details
                        </Text>
                    </View>
                </View>

                {/* Current Trip */}
                {currentTrip && (
                    <View className="px-5 mt-6">
                        <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                            Current Trip
                        </Text>
                        <TripCard trip={{
                            id: currentTrip.id || '',
                            name: currentTrip.name,
                            start_date: currentTrip.start_date || null,
                            end_date: currentTrip.end_date || null,
                            base_city: currentTrip.base_city || null,
                            status: currentTrip.status || 'active',
                            joined_at: currentTrip.created_at || new Date().toISOString(),
                            role: 'user'
                        }} />
                    </View>
                )}

                {/* Mock Previous Trips */}
                <View className="px-5 mt-8">
                    <Text className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                        Previous Trips (Mock Data)
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-3 italic">
                        These are placeholder trips for demonstration purposes
                    </Text>
                    
                    <TripCard trip={{
                        id: 'mock-1',
                        name: 'Ramadan Umrah 2024',
                        start_date: '2024-03-15',
                        end_date: '2024-03-25',
                        base_city: 'Makkah',
                        status: 'completed',
                        joined_at: '2024-02-01',
                        role: 'user'
                    }} />
                    
                    <TripCard trip={{
                        id: 'mock-2',
                        name: 'Winter Journey',
                        start_date: '2023-12-10',
                        end_date: '2023-12-20',
                        base_city: 'Madinah',
                        status: 'completed',
                        joined_at: '2023-11-05',
                        role: 'user'
                    }} />
                </View>

                {/* Empty State */}
                {!currentTrip && (
                    <View className="px-5 mt-16 items-center">
                        <View className="h-24 w-24 bg-sand-100 rounded-full items-center justify-center mb-4">
                            <Calendar size={40} color="#C5A059" />
                        </View>
                        <Text className="text-xl font-semibold text-foreground mb-2">No Trips Yet</Text>
                        <Text className="text-muted-foreground text-center">
                            Join a trip using a group code to get started
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function TripCard({ trip }: { trip: TripWithDetails }) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getRoleBadge = (role: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            'super_admin': { bg: 'bg-red-100', text: 'text-red-700', label: 'Admin' },
            'group_owner': { bg: 'bg-primary/20', text: 'text-primary', label: 'Owner' },
            'user': { bg: 'bg-sand-200', text: 'text-muted-foreground', label: 'Member' }
        };
        
        return config[role] || config['user'];
    };

    const roleConfig = getRoleBadge(trip.role);

    return (
        <View className="bg-card rounded-xl p-4 border border-sand-200 mb-3">
            <View className="flex-row items-start justify-between mb-3">
                <Text className="text-lg font-semibold text-foreground flex-1">{trip.name}</Text>
                <View className={`${roleConfig.bg} px-2 py-1 rounded-md ml-2`}>
                    <Text className={`${roleConfig.text} text-xs font-medium`}>{roleConfig.label}</Text>
                </View>
            </View>

            {trip.base_city && (
                <View className="flex-row items-center mb-2">
                    <MapPin size={16} color="hsl(40 5% 55%)" />
                    <Text className="text-sm text-muted-foreground ml-2">{trip.base_city}</Text>
                </View>
            )}

            {(trip.start_date || trip.end_date) && (
                <View className="flex-row items-center mb-2">
                    <Calendar size={16} color="hsl(40 5% 55%)" />
                    <Text className="text-sm text-muted-foreground ml-2">
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </Text>
                </View>
            )}

            <View className="flex-row items-center">
                <Clock size={16} color="hsl(40 5% 55%)" />
                <Text className="text-sm text-muted-foreground ml-2">
                    Joined {formatDate(trip.joined_at)}
                </Text>
            </View>
        </View>
    );
}
