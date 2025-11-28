import { View, Text, TouchableOpacity, ScrollView, Alert, Animated, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Settings, LogOut, ChevronRight, CreditCard, Bell, Shield, Calendar, Phone, ArrowLeft, MapPin, Crown, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { Profile, TripMembershipRow, TripRow } from "../../types/db";
import { useTrip } from "../../lib/context/TripContext";

export default function ProfileScreen() {
    const router = useRouter();
    const fadeInStyle = useFadeIn(0);
    const { currentTrip } = useTrip();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [participatedTrips, setParticipatedTrips] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) {
                setLoading(true);
            }
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.replace('/login');
                return;
            }

            // Get profile data from auth user and profiles table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('emergency_name, emergency_phone, emergency_notes, role')
                .eq('user_id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
            }
            
            // Combine auth user data with profile data
            const combinedProfile: Profile = {
                user_id: user.id,
                name: user.user_metadata?.full_name || 'No name',
                email: user.email || '',
                phone: user.user_metadata?.phone || '',
                emergency_name: profileData?.emergency_name || null,
                emergency_phone: profileData?.emergency_phone || null,
                emergency_notes: profileData?.emergency_notes || null,
                role: profileData?.role || 'user',
                created_at: user.created_at,
                updated_at: new Date().toISOString(),
            };

            setProfile(combinedProfile);

            // Get trip memberships count
            const { count, error: membershipError } = await supabase
                .from('trip_memberships')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (!membershipError && count !== null) {
                setParticipatedTrips(count);
            }

        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            if (!isRefreshing) {
                setLoading(false);
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfileData(true);
        setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.warn('Logout error', error);
                Alert.alert('Logout failed', error.message ?? 'Unable to logout');
                return;
            }
            router.replace('/join-trip');
        } catch (e: any) {
            console.warn('Logout exception', e);
            Alert.alert('Logout failed', e?.message ?? 'Unable to logout');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4A6741" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <Animated.ScrollView 
                style={fadeInStyle} 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 35 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A6741"
                        colors={["#4A6741"]}
                    />
                }
            >
                <View className="bg-card pb-6 pt-2 border-b border-sand-200">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="px-4 py-2 -ml-2 mb-2"
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <View className="h-24 w-24 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                            <Text className="text-primary font-bold text-3xl">
                                {profile?.name?.charAt(0) || 'U'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-bold text-foreground">{profile?.name}</Text>
                            {profile?.role === 'group_owner' && (
                                <View className="ml-2 bg-amber-100 px-2 py-1 rounded-full flex-row items-center">
                                    <Crown size={12} color="#D97706" />
                                    <Text className="text-amber-700 text-xs font-semibold ml-1">Owner</Text>
                                </View>
                            )}
                            {profile?.role === 'super_admin' && (
                                <View className="ml-2 bg-purple-100 px-2 py-1 rounded-full flex-row items-center">
                                    <Shield size={12} color="#7C3AED" />
                                    <Text className="text-purple-700 text-xs font-semibold ml-1">Admin</Text>
                                </View>
                            )}
                        </View>
                        {profile?.email && <Text className="text-muted-foreground mt-1">{profile.email}</Text>}
                    </View>

                    <View className="flex-row justify-around mt-6 px-4">
                        <View className="items-center px-4">
                            <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Text className="text-2xl font-bold text-primary">{participatedTrips}</Text>
                            </View>
                            <Text className="text-muted-foreground text-sm">Umrahs</Text>
                        </View>
                        <View className="h-16 w-[1px] bg-border" />
                        <View className="items-center px-4">
                            <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Text className="text-2xl font-bold text-primary">0</Text>
                            </View>
                            <Text className="text-muted-foreground text-sm">Hajj</Text>
                        </View>
                        <View className="h-16 w-[1px] bg-border" />
                        <View className="items-center px-4">
                            <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Calendar size={20} color="#4A6741" />
                            </View>
                            <Text className="text-muted-foreground text-sm">Next Trip</Text>
                        </View>
                    </View>

                    {currentTrip && (
                        <View className="mx-4 mt-4 p-3 bg-sand-50 rounded-lg border border-sand-100">
                            <Text className="text-xs text-muted-foreground font-medium mb-1">CURRENT TRIP</Text>
                            <Text className="text-foreground font-semibold">{currentTrip.name}</Text>
                            {currentTrip.base_city && (
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    📍 {currentTrip.base_city}
                                </Text>
                            )}
                            {currentTrip.start_date && currentTrip.end_date && (
                                <Text className="text-xs text-muted-foreground mt-1">
                                    {new Date(currentTrip.start_date).toLocaleDateString()} - {new Date(currentTrip.end_date).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                <View className="mt-6 px-4">
                     {currentTrip && (
                        <>
                            <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Group</Text>

                            <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                                <ProfileMenuItem 
                                    icon={Users} 
                                    title="Group Details" 
                                    subtitle="View group information & stats" 
                                    onPress={() => router.push('/settings/group-details')}
                                    last 
                                />
                            </View>
                        </>
                    )}

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Account</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem 
                            icon={User} 
                            title="Personal Information" 
                            subtitle={profile?.email || 'Update your details'} 
                            onPress={() => router.push('/settings/personal-info')}
                        />
                        <ProfileMenuItem 
                            icon={Phone} 
                            title="Emergency Contact" 
                            subtitle={profile?.emergency_name || 'Add emergency contact'} 
                            onPress={() => router.push('/settings/emergency-contact')}
                        />
                        <ProfileMenuItem 
                            icon={Calendar} 
                            title="Trip History" 
                            subtitle={`${participatedTrips} participated`} 
                            onPress={() => router.push('/settings/trip-history')}
                            last 
                        />
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Preferences</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem 
                            icon={Bell} 
                            title="Notifications" 
                            subtitle="Prayer times & reminders" 
                            onPress={() => router.push('/settings/notifications')}
                        />
                        <ProfileMenuItem 
                            icon={Shield} 
                            title="Privacy & Security" 
                            subtitle="Manage your data" 
                            onPress={() => router.push('/settings/privacy-security')}
                            last 
                        />
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Other</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        {/* <ProfileMenuItem icon={CreditCard} title="Payment Methods" subtitle="Manage cards" /> */}
                        <ProfileMenuItem 
                            icon={Settings} 
                            title="App Settings" 
                            subtitle="Version 1.0.0" 
                            onPress={() => router.push('/settings/app-settings')}
                            last 
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-2 bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-center justify-center mb-8"
                    >
                        <LogOut size={20} color="hsl(0 84% 60%)" />
                        <Text className="text-red-600 font-semibold ml-2">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

function ProfileMenuItem({
    icon: Icon,
    title,
    subtitle,
    last,
    onPress
}: {
    icon: any;
    title: string;
    subtitle?: string;
    last?: boolean;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-sand-100' : ''}`}
            onPress={onPress}
            disabled={!onPress}
        >
            <View className="flex-row items-center flex-1">
                <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                    <Icon size={18} color="#4A6741" />
                </View>
                <View className="flex-1">
                    <Text className="text-foreground font-medium">{title}</Text>
                    {subtitle && (
                        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
                    )}
                </View>
            </View>
            <ChevronRight size={18} color="hsl(40 5% 70%)" />
        </TouchableOpacity>
    );
}