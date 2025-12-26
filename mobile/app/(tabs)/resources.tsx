import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { BookOpen, ScrollText, MapPin, FileText, MessageCircle, Clock, ChevronRight } from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";

export default function ResourcesScreen() {
    const fadeInStyle = useFadeIn(0);

    const resources = [
        {
            id: 'prayers',
            title: 'Prayer Times',
            subtitle: 'Daily salah schedule',
            icon: <Clock size={20} color="#4A6741" />,
            route: '/prayers',
            color: 'bg-[#4A6741]/5',
            borderColor: 'border-[#4A6741]/20'
        },
        {
            id: 'duas',
            title: 'Duas',
            subtitle: 'Supplications',
            icon: <ScrollText size={20} color="#4A6741" />,
            route: '/duas',
            color: 'bg-[#4A6741]/5',
            borderColor: 'border-[#4A6741]/20'
        },
        {
            id: 'murshid-chat',
            title: 'Murshid Chat',
            subtitle: 'Ask for guidance',
            icon: <MessageCircle size={20} color="#C5A059" />,
            route: '/(tabs)/murshid',
            color: 'bg-[#C5A059]/5',
            borderColor: 'border-[#C5A059]/20'
        },
        {
            id: 'ziyarat',
            title: 'Ziyarat',
            subtitle: 'Historical Sites',
            icon: <MapPin size={20} color="#C5A059" />,
            route: '/(tabs)/map',
            color: 'bg-[#C5A059]/5',
            borderColor: 'border-[#C5A059]/20'
        },
        {
            id: 'guide',
            title: 'Umrah Guide',
            subtitle: 'Step by Step',
            icon: <BookOpen size={20} color="#4A6741" />,
            route: '/umrah-guide',
            color: 'bg-[#4A6741]/5',
            borderColor: 'border-[#4A6741]/20'
        },
        {
            id: 'profile',
            title: 'Profile',
            subtitle: 'Account & Settings',
            icon: <FileText size={20} color="#4A6741" />,
            route: '/(tabs)/profile',
            color: 'bg-sand-50',
            borderColor: 'border-sand-200'
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-card" edges={['top']}>
            <View className="flex-1">
                <View className="px-4 pt-6 pb-4 bg-card border-b border-sand-200">
                    <View className="flex-row items-center mb-2">
                        <View className="h-10 w-10 rounded-full border-2 border-[#4A6741]/30 bg-[#4A6741]/10 items-center justify-center mr-3">
                            <BookOpen size={20} color="#4A6741" />
                        </View>
                        <Text className="text-3xl font-bold text-stone-800">Resources</Text>
                    </View>
                    <Text className="text-stone-500 text-base">Everything you need for your journey</Text>
                </View>

                <Animated.ScrollView style={fadeInStyle} className="bg-background" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
                    {/* Resource List */}
                    <View>
                        {resources.map((item) => (
                            <Link key={item.id} href={item.route as any} asChild>
                                <TouchableOpacity
                                    className={`flex-row items-center p-4 rounded-xl border ${item.borderColor} ${item.color} shadow-sm mb-3`}
                                >
                                    <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
                                        {item.icon}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-foreground">{item.title}</Text>
                                        <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#C5A059" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>

                    {/* Featured / Quick Access */}
                    <View className="mt-6 bg-card rounded-2xl p-5 border border-sand-200 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-foreground">Quick Access</Text>
                        </View>

                        <Link href="/duas?category=Morning" asChild>
                            <TouchableOpacity className="flex-row items-center py-3 border-b border-sand-100">
                                <Text className="text-2xl mr-4">🤲</Text>
                                <View className="flex-1">
                                    <Text className="text-base font-medium text-foreground">Morning Adhkar</Text>
                                    <Text className="text-xs text-muted-foreground">Recommended for now</Text>
                                </View>
                                <ChevronRight size={20} color="#C5A059" />
                            </TouchableOpacity>
                        </Link>

                        <Link href="/umrah-guide/2" asChild>
                            <TouchableOpacity className="flex-row items-center py-3 pt-4">
                                <Text className="text-2xl mr-4">🕋</Text>
                                <View className="flex-1">
                                    <Text className="text-base font-medium text-foreground">Tawaf Guide</Text>
                                    <Text className="text-xs text-muted-foreground">Steps of Umrah</Text>
                                </View>
                                <ChevronRight size={20} color="#C5A059" />
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.ScrollView>
            </View>
        </SafeAreaView>
    );
}
