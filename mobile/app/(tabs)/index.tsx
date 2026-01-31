import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Bell, Book, Compass, Info, FileText, User, MessageCircle, MapPin, Clock, ChevronRight, CalendarDays, Quote, Moon } from "lucide-react-native";
import PrayerTimesWidget from "../../components/PrayerTimesWidget";
import Svg, { Path, Rect } from "react-native-svg";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { useTrip } from "../../lib/context/TripContext";
import { useAuth } from "../../lib/context/AuthContext";
import { usePrayerLocation } from "../../lib/context/PrayerLocationContext";
import { TripStatus } from "../../components";
import { usePrayerWidget } from "../../lib/api/hooks/usePrayerTimes";

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
    const { locationAddress, selectedLocation } = usePrayerLocation();

    // Fetch real-time prayer data
    const { prayers, nextPrayer, timeUntilNext, location, isLoading: prayerLoading } = usePrayerWidget({
        address: locationAddress,
        autoRefresh: true,
    });

    // Theme colors based on selected location
    const themeColors: [string, string, ...string[]] = selectedLocation === 'Makkah'
        ? ['#4A6741', '#3A5234', '#2A3E28']  // Green for Makkah
        : ['#C5A059', '#B8904D', '#A67F42']; // Gold for Madina

    return (
        <SafeAreaView className="flex-1 bg-card" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-6 pb-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 rounded-full border-2 border-[#C5A059]/30 bg-[#C5A059]/10 items-center justify-center mr-3">
                            <KaabaIcon size={20} color="#C5A059" />
                        </View>
                        <Text className="text-3xl font-bold text-stone-800">Home</Text>
                    </View>
                    <TouchableOpacity
                        className="relative p-2"
                        onPress={() => router.push('/announcements')}
                    >
                        <Bell size={24} color="#C5A059" />
                        <View className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-stone-500 text-base ml-13">Assalamu Alaykum, {userName}</Text>
            </View>

            <Animated.ScrollView
                style={fadeInStyle}
                className="flex-1 bg-background"
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
            >
                {/* Trip Status */}
                <View className="mb-4">
                    <TripStatus />
                </View>

                {/* Prayer Times */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold text-foreground mb-2">Prayer Times</Text>
                    {prayerLoading ? (
                        <View className="bg-[#4A6741] rounded-2xl p-6 items-center justify-center" style={{ minHeight: 200 }}>
                            <ActivityIndicator size="large" color="#C5A059" />
                            <Text className="text-white/70 mt-2">Loading prayer times...</Text>
                        </View>
                    ) : (
                        <PrayerTimesWidget
                            prayers={prayers}
                            nextPrayer={nextPrayer}
                            location={location}
                            timeUntil={timeUntilNext}
                            clickable={true}
                            themeColors={themeColors}
                        />
                    )}
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
        { label: "Duas", icon: Book, href: "/duas", color: "#4A6741" },
        { label: "Ziyarat", icon: Compass, href: "/(tabs)/map", color: "#C5A059" },
        { label: "Guide", icon: Info, href: "/umrah-guide", color: "#4A6741" },
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
    // 14 different quotes that cycle every day (2 weeks cycle)
    const quotes = [
        {
            text: "The best of you are those who are best to their families, and I am the best to my family.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "A kind word is a form of charity.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "The believer does not slander, curse, or speak in an obscene or foul manner.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "The most beloved deed to Allah is the most regular and constant even if it were little.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "None of you truly believes until he loves for his brother what he loves for himself.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "Kindness is a mark of faith, and whoever is not kind has no faith.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "The best among you are those who have the best manners and character.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "When you see a person who has been given more than you in money and beauty, look to those who have been given less.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "Feed the hungry, visit the sick, and set free the captives.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "Make things easy and do not make them difficult, cheer the people up and do not rebuke them.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will have mercy upon you.",
            source: "Prophet Muhammad ﷺ"
        },
        {
            text: "Verily, Allah is more pleased with the repentance of His slave than a person who lost his camel in the desert and then finds it unexpectedly.",
            source: "Prophet Muhammad ﷺ"
        }
    ];

    // Get day of year to cycle through quotes (changes daily)
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    const dailyQuote = quotes[quoteIndex];

    return (
        <View className="bg-gradient-to-br from-[#C5A059]/10 to-[#C5A059]/5 rounded-xl p-5 relative shadow-none border border-[#C5A059]/20">
            <Moon size={32} color="#C5A059" style={{ position: 'absolute', top: 16, left: 16, opacity: 0.3 }} />
            <View className="items-center gap-3">
                <Text className="text-foreground font-medium italic leading-relaxed text-center">
                    "{dailyQuote.text}"
                </Text>
                <Text className="text-xs text-[#C5A059] font-semibold uppercase tracking-wider">
                    — {dailyQuote.source}
                </Text>
            </View>
        </View>
    );
}