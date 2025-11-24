import { View, Text, TouchableOpacity, ScrollView, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PROFILE } from "../../data/mock";
import { User, Settings, LogOut, ChevronRight, CreditCard, Bell, Shield, Calendar, Phone, Globe, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFadeIn } from "../../lib/sharedElementTransitions";

export default function ProfileScreen() {
    const router = useRouter();
    const fadeInStyle = useFadeIn(0);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => console.log("Logged out") }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <Animated.ScrollView style={fadeInStyle} className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
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
                                {PROFILE.name.charAt(0)}
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-foreground">{PROFILE.name}</Text>
                        <Text className="text-muted-foreground mt-1">{PROFILE.email}</Text>
                        <Text className="text-sm text-muted-foreground mt-0.5">{PROFILE.phone}</Text>
                    </View>

                    <View className="flex-row justify-around mt-6 px-4">
                        <View className="items-center px-4">
                            <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Text className="text-2xl font-bold text-primary">{PROFILE.completedUmrahs}</Text>
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

                    <View className="mx-4 mt-4 p-3 bg-sand-50 rounded-lg border border-sand-100">
                        <Text className="text-xs text-muted-foreground font-medium mb-1">UPCOMING TRIP</Text>
                        <Text className="text-foreground font-semibold">{PROFILE.nextTrip}</Text>
                    </View>
                </View>

                <View className="mt-6 px-4">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Account</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem icon={User} title="Personal Information" subtitle={PROFILE.email} />
                        <ProfileMenuItem icon={Phone} title="Emergency Contact" subtitle={PROFILE.emergencyContact.name} />
                        <ProfileMenuItem icon={Calendar} title="Trip History" subtitle={`${PROFILE.completedUmrahs} completed`} last />
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Preferences</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem icon={Bell} title="Notifications" subtitle="Prayer times & reminders" />
                        <ProfileMenuItem icon={Globe} title="Language" subtitle={PROFILE.preferences.language} />
                        <ProfileMenuItem icon={Shield} title="Privacy & Security" subtitle="Manage your data" last />
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Other</Text>

                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                        <ProfileMenuItem icon={CreditCard} title="Payment Methods" subtitle="Manage cards" />
                        <ProfileMenuItem icon={Settings} title="App Settings" subtitle="Theme, language & more" last />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-2 bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-center justify-center mb-8"
                    >
                        <LogOut size={20} color="hsl(0 84% 60%)" />
                        <Text className="text-red-600 font-semibold ml-2">Log Out</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-xs text-muted-foreground mb-8">
                        Version 1.0.0
                    </Text>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

function ProfileMenuItem({
    icon: Icon,
    title,
    subtitle,
    last
}: {
    icon: any;
    title: string;
    subtitle?: string;
    last?: boolean;
}) {
    return (
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
    );
}