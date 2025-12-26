import { View, Text, TouchableOpacity, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut, ChevronRight, Bell, Shield, Phone, Crown, Users, Lock, Trash2 } from "lucide-react-native";
import { useRouter, Link } from "expo-router";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { supabase } from "../../lib/supabase";
import { useTrip } from "../../lib/context/TripContext";
import { useAuth } from "../../lib/context/AuthContext";

export default function ProfileScreen() {
    const router = useRouter();
    const fadeInStyle = useFadeIn(0);
    const { currentTrip, isGroupAdmin } = useTrip();
    const { userName, userEmail } = useAuth();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.replace('/auth/join-trip');
        } catch (e: any) {
            console.warn('Logout error', e);
            Alert.alert('Logout failed', e?.message ?? 'Unable to logout. Please try again');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-card" edges={["top"]}>
            <View className="px-4 pt-4 pb-3 bg-card border-b border-sand-200">
                <View className="flex-row items-center mb-1">
                    <View className="h-8 w-8 rounded-full border-2 border-[#4A6741]/30 bg-[#4A6741]/10 items-center justify-center mr-2.5">
                        <User size={16} color="#4A6741" />
                    </View>
                    <Text className="text-2xl font-bold text-stone-800">Profile</Text>
                </View>
                <Text className="text-stone-500 text-sm">Manage your account</Text>
            </View>

            <Animated.ScrollView 
                style={fadeInStyle} 
                className="flex-1 bg-background" 
            >
                <View className="bg-card pb-4 pt-3">
                    <View className="items-center">
                        <View className="h-16 w-16 bg-primary/10 rounded-full items-center justify-center mb-3 border-2 border-primary/20">
                            <Text className="text-primary font-bold text-xl">
                                {userName?.charAt(0) || 'U'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xl font-bold text-foreground">{userName}</Text>
                            {isGroupAdmin && (
                                <View className="ml-2 bg-amber-100 px-2 py-0.5 rounded-full flex-row items-center">
                                    <Crown size={10} color="#D97706" />
                                    <Text className="text-amber-700 text-[10px] font-semibold ml-1">Admin</Text>
                                </View>
                            )}
                        </View>
                        {userEmail && <Text className="text-muted-foreground text-sm mt-1">{userEmail}</Text>}
                    </View>

                    {currentTrip && (
                        <View className="mx-4 mt-3 p-2.5 bg-sand-50 rounded-lg border border-sand-100">
                            <Text className="text-[10px] text-muted-foreground font-medium mb-0.5">CURRENT TRIP</Text>
                            <Text className="text-foreground font-semibold text-sm">{currentTrip.name}</Text>
                            {currentTrip.start_date && currentTrip.end_date && (
                                <Text className="text-[10px] text-muted-foreground mt-0.5">
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
                                    href="/settings/group-details"
                                    last 
                                />
                            </View>
                        </>
                    )}

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Account</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem 
                            icon={User} 
                            title="Edit Personal Information" 
                            subtitle="Update your details"
                            href="/settings/personal-info"
                        />
                        <ProfileMenuItem 
                            icon={Phone} 
                            title="Edit Emergency Contact" 
                            subtitle="Add emergency contact" 
                            href="/settings/emergency-contact"
                        />
                          <ProfileMenuItem 
                            icon={Lock} 
                            title="Change Password" 
                            subtitle="Update your password" 
                            href="/settings/change-password"
                        />
                        <ProfileMenuItem 
                            icon={Trash2} 
                            title="Delete Account" 
                            subtitle="Permanently remove your account" 
                            href="/settings/delete-account"
                            last 
                        />
                       
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Preferences</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem 
                            icon={Bell} 
                            title="Notifications" 
                            subtitle="Prayer times & reminders" 
                            href="/settings/notifications"
                        />
                       
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Other</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem 
                            icon={Shield} 
                            title="Terms of Service" 
                            subtitle="App usage guidelines & agreement" 
                            href="/settings/terms"
                        />
                        <ProfileMenuItem 
                            icon={Shield} 
                            title="Privacy Policy" 
                            subtitle="How we protect your data" 
                            href="/settings/privacy-security"
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
    href
}: {
    icon: any;
    title: string;
    subtitle?: string;
    last?: boolean;
    href?: string;
}) {
    if (!href) {
        return (
            <View className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-sand-100' : ''}`}>
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
            </View>
        );
    }

    return (
        <Link href={href} asChild>
            <TouchableOpacity
                className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-sand-100' : ''}`}
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
        </Link>
    );
}