import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Bell, Book, Compass, Info, FileText, Phone, Heart, MapPin, Clock, ChevronRight, CalendarDays, Quote } from "lucide-react-native";
import { PROFILE } from "../../data/mock";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-4 py-4">
                {/* Mobile Header */}
                <View className="flex-row items-center justify-between py-2 mb-6">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 rounded-full border-2 border-primary/20 bg-primary/10 items-center justify-center">
                            <Text className="text-primary font-bold text-base">AH</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-muted-foreground">Assalamu Alaykum,</Text>
                            <Text className="text-lg font-bold text-foreground">Ahmed Hassan</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="relative p-2">
                        <Bell size={24} color="hsl(140 60% 15%)" />
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
                    <PrayerTimesWidget />
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
            </ScrollView>
        </SafeAreaView>
    );
}

function TripStatus() {
    return (
        <View className="bg-card rounded-xl p-4 shadow-sm border border-sand-200">
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <View className="bg-primary/10 border border-primary/20 px-2 py-1 rounded-md mb-2 self-start">
                        <Text className="text-primary text-xs font-medium">Current Trip</Text>
                    </View>
                    <Text className="font-bold text-foreground">Umrah February 2025</Text>
                </View>
                <View>
                    <Text className="text-xs text-muted-foreground text-right">Day 3 of 10</Text>
                    <Text className="font-semibold text-primary text-right">Makkah</Text>
                </View>
            </View>

            <View className="p-3 bg-sand-50 rounded-lg border border-sand-100 mb-3">
                <View className="flex-row items-center">
                    <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                        <Text className="text-primary font-bold text-sm">08</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-muted-foreground font-medium uppercase">Next Activity • 08:30 PM</Text>
                        <Text className="text-sm font-semibold text-foreground">Group Dinner at Hotel</Text>
                    </View>
                </View>
            </View>

            <Link href="/itinerary" asChild>
                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-sand-200 rounded-lg bg-transparent">
                    <View className="flex-row items-center gap-2">
                        <CalendarDays size={16} color="hsl(140 40% 45%)" />
                        <Text className="text-primary font-medium">View Full Itinerary</Text>
                    </View>
                    <ChevronRight size={16} color="hsl(140 40% 45%)" />
                </TouchableOpacity>
            </Link>
        </View>
    );
}

function PrayerTimesWidget() {
    const prayers = [
        { name: "Fajr", time: "05:10", done: true },
        { name: "Dhuhr", time: "12:30", done: true },
        { name: "Asr", time: "15:45", done: false, next: true },
        { name: "Maghrib", time: "18:20", done: false },
        { name: "Isha", time: "19:50", done: false },
    ];

    return (
        <View className="bg-gradient-to-br from-primary to-emerald-900 rounded-xl p-5 overflow-hidden relative shadow-lg">
            {/* Decorative circle - positioned to encapsulate the "Asr" text */}
            <View className="absolute opacity-10" style={{ top: -30, right: -30 }}>
                <View className="w-32 h-32 rounded-full border-8 border-white" />
            </View>

            <View className="flex-row justify-between items-start mb-6 z-10">
                <View className="flex-row items-center gap-1.5 bg-emerald-800/50 px-2.5 py-1.5 rounded-full">
                    <MapPin size={12} color="rgba(255,255,255,0.9)" />
                    <Text className="text-primary-foreground/90 text-xs font-medium">Makkah, KSA</Text>
                </View>
                <View className="items-end relative z-20">
                    <Text className="text-primary-foreground/70 text-xs">Next Prayer</Text>
                    <Text className="text-primary-foreground text-2xl font-bold">Asr</Text>
                </View>
            </View>

            <View className="flex-row items-end justify-between mb-6">
                <View className="flex-row items-center gap-2">
                    <Clock size={20} color="rgba(255,255,255,0.8)" />
                    <Text className="text-primary-foreground text-4xl font-bold">15:45</Text>
                </View>
                <Text className="text-primary-foreground/70 text-sm pb-1">in 45 mins</Text>
            </View>

            <View className="flex-row justify-between gap-0.5 mt-2">
                {prayers.map((p) => (
                    <View key={p.name} className={`flex-1 items-center gap-1 ${p.next ? 'opacity-100' : 'opacity-60'}`}>
                        <View className={`h-1.5 w-full rounded-full ${p.done ? 'bg-emerald-400' : p.next ? 'bg-white' : 'bg-emerald-800'}`} />
                        <Text className="text-primary-foreground text-[10px] font-medium mt-1" numberOfLines={1}>{p.name}</Text>
                        <Text className="text-primary-foreground text-[10px]" numberOfLines={1}>{p.time}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function QuickActions() {
    const actions = [
        { label: "Duas", icon: Book, href: "/duas", color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Ziyarat", icon: Compass, href: "/map", color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Guide", icon: Info, href: "/guide", color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Documents", icon: FileText, href: "/profile", color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Emergency", icon: Phone, href: "/profile", color: "text-red-600", bg: "bg-red-50" },
        { label: "Favorites", icon: Heart, href: "/profile", color: "text-pink-600", bg: "bg-pink-50" },
    ];

    return (
        <View className="flex-row flex-wrap gap-3">
            {actions.map((action) => (
                <Link key={action.label} href={action.href} asChild>
                    <TouchableOpacity className="w-[31%] bg-card rounded-lg p-3 h-24 items-center justify-center border-none shadow-sm">
                        <View className={`p-2 rounded-full ${action.bg} mb-2`}>
                            <action.icon size={20} color={action.color === "text-blue-600" ? "#2563eb" : action.color === "text-emerald-600" ? "#059669" : action.color === "text-amber-600" ? "#d97706" : action.color === "text-purple-600" ? "#9333ea" : action.color === "text-red-600" ? "#dc2626" : "#ec4899"} />
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
        <View className="bg-sand-100 rounded-xl p-5 relative shadow-none">
            <Quote size={32} color="hsl(40 20% 75%)" style={{ position: 'absolute', top: 16, left: 16, opacity: 0.5, zIndex: -10 }} />
            <View className="items-center gap-3">
                <Text className="text-foreground font-medium italic leading-relaxed text-center">
                    "The best of you are those who are best to their families, and I am the best to my family."
                </Text>
                <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    — Prophet Muhammad ﷺ
                </Text>
            </View>
        </View>
    );
}