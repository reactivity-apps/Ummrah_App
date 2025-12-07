import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Bell, Book, Compass, Info, FileText, User, MessageCircle, MapPin, Clock, ChevronRight, CalendarDays, Quote, Moon } from "lucide-react-native";
import PrayerTimesWidget from "../../components/PrayerTimesWidget";
import Svg, { Path, Rect } from "react-native-svg";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { useTrip } from "../../lib/context/TripContext";
import { useAuth } from "../../lib/context/AuthContext";
import { TripStatus } from "../../components";

// Kaaba Icon Component
const KaabaIcon = ({ size = 24, color = "#4A6741" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="5" width="16" height="15" rx="2" fill={color} />
        <Path d="M4 9H20" stroke={color === "#4A6741" ? "#C5A059" : "white"} strokeWidth="2" strokeOpacity="0.6" />
        <Path d="M7 5V9" stroke={color === "#4A6741" ? "#C5A059" : "white"} strokeWidth="1.5" strokeOpacity="0.4" />
        <Path d="M12 14H16" stroke={color === "#4A6741" ? "#C5A059" : "white"} strokeWidth="1.5" strokeOpacity="0.4" />
    </Svg>
);

export default function HomeScreen() {
    const fadeInStyle = useFadeIn(0);
    const router = useRouter();
    const { currentTrip } = useTrip();
    const { userName, loading: authLoading } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Animated.ScrollView
                style={fadeInStyle}
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
            >
                {/* Mobile Header */}
                <View className="flex-row items-center justify-between py-2 mb-6">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 rounded-full border-2 border-[#C5A059]/30 bg-[#C5A059]/10 items-center justify-center">
                            <KaabaIcon size={20} color="#C5A059" />
                        </View>
                        <View>
                            <Text className="text-xs text-muted-foreground">Assalamu Alaykum,</Text>
                            {authLoading ? (
                                <View className="h-7 w-32 bg-muted-foreground/20 rounded-md" />
                            ) : (
                                <Text className="text-lg font-bold text-foreground">{userName}</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        className="relative p-2"
                        onPress={() => router.push('/announcements')}
                    >
                        <Bell size={24} color="#C5A059" />
                        <View className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Trip Status */}
                <View className="mb-4">
                    <TripStatus />
                </View>

                {/* Prayer Times */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold text-foreground mb-2">Prayer Times</Text>
                    <PrayerTimesWidget
                        prayers={[
                            { name: "Fajr", time: "05:10", done: true },
                            { name: "Dhuhr", time: "12:30", done: true },
                            { name: "Asr", time: "15:45", next: true },
                            { name: "Maghrib", time: "18:20" },
                            { name: "Isha", time: "19:50" },
                        ]}
                        nextPrayer={{ name: "Asr", time: "15:45" }}
                        location="Makkah, KSA"
                        timeUntil="45 mins"
                        clickable={true}
                    />
                </View>

                {/* Quick Access */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold text-foreground mb-2">Quick Access</Text>
                    <QuickActions />
                </View>

                {/* Daily Inspiration */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold text-foreground mb-2">Daily Inspiration</Text>
                    <DailyQuote />
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

function QuickActions() {
    const actions = [
        { label: "Duas", icon: Book, href: "/(tabs)/duas", color: "#4A6741" },
        { label: "Ziyarat", icon: Compass, href: "/(tabs)/map", color: "#C5A059" },
        { label: "Guide", icon: Info, href: "/(tabs)/guide", color: "#4A6741" },
        { label: "Documents", icon: FileText, href: "/(tabs)/resources", color: "#C5A059" },
        { label: "Profile", icon: User, href: "/(tabs)/profile", color: "#4A6741" },
        { label: "Murshid", icon: MessageCircle, href: "/(tabs)/murshid", color: "#C5A059" },
    ];

    return (
        <View className="flex-row flex-wrap gap-3 justify-center">
            {actions.map((action) => (
                <Link key={action.label} href={action.href} asChild>
                    <TouchableOpacity className="w-[31%] bg-card rounded-lg p-3 h-24 items-center justify-center border-none shadow-sm">
                        <View className="p-2 rounded-full mb-2" style={{ backgroundColor: `${action.color}15` }}>
                            <action.icon size={20} color={action.color} />
                        </View>
                        <Text className="text-xs font-medium text-muted-foreground">{action.label}</Text>
                    </TouchableOpacity>
                </Link>
            ))}
        </View>
    );
}

function DailyQuote() {
    return (
        <View className="bg-gradient-to-br from-[#C5A059]/10 to-[#C5A059]/5 rounded-xl p-5 relative shadow-none border border-[#C5A059]/20">
            <Moon size={32} color="#C5A059" style={{ position: 'absolute', top: 16, left: 16, opacity: 0.3 }} />
            <View className="items-center gap-3">
                <Text className="text-foreground font-medium italic leading-relaxed text-center">
                    "The best of you are those who are best to their families, and I am the best to my family."
                </Text>
                <Text className="text-xs text-[#C5A059] font-semibold uppercase tracking-wider">
                    — Prophet Muhammad ﷺ
                </Text>
            </View>
        </View>
    );
}