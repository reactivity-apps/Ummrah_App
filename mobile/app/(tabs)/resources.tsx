import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BookOpen, ScrollText, MapPin, FileText, MessageCircle, Clock, ChevronRight, ArrowLeft } from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";

export default function ResourcesScreen() {
    const router = useRouter();
    const fadeInStyle = useFadeIn(0);

    const resources = [
        {
            id: 'prayers',
            title: 'Prayer Times',
            subtitle: 'Daily salah schedule',
            icon: <Clock size={20} color="#4A6741" />,
            route: '/prayers',
            color: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        },
        {
            id: 'duas',
            title: 'Duas',
            subtitle: 'Supplications',
            icon: <ScrollText size={20} color="#4A6741" />,
            route: '/(tabs)/duas',
            color: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        },
        {
            id: 'murshid-chat',
            title: 'Murshid Chat',
            subtitle: 'Ask for guidance',
            icon: <MessageCircle size={20} color="#C5A059" />,
            route: '/(tabs)/murshid',
            color: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            id: 'ziyarat',
            title: 'Ziyarat',
            subtitle: 'Historical Sites',
            icon: <MapPin size={20} color="#C5A059" />,
            route: '/(tabs)/map',
            color: 'bg-amber-50',
            borderColor: 'border-amber-100'
        },
        {
            id: 'guide',
            title: 'Umrah Guide',
            subtitle: 'Step by Step',
            icon: <BookOpen size={20} color="#4A6741" />,
            route: '/(tabs)/guide',
            color: 'bg-stone-50',
            borderColor: 'border-stone-200'
        },
        {
            id: 'documents',
            title: 'Documents',
            subtitle: 'Travel Docs',
            icon: <FileText size={20} color="#718096" />,
            route: '/(tabs)/profile',
            color: 'bg-blue-50',
            borderColor: 'border-blue-100'
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]" edges={['top']}>
            <View className="flex-1">
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center mb-2">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="mr-3 p-2 -ml-2"
                        >
                            <ArrowLeft size={24} color="#4A6741" />
                        </TouchableOpacity>
                        <Text className="text-3xl font-bold text-stone-800">Resources</Text>
                    </View>
                    <Text className="text-stone-500 text-base ml-11">Everything you need for your journey</Text>
                </View>

                <Animated.ScrollView style={fadeInStyle} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
                    {/* Resource List */}
                    <View className="space-y-3">
                        {resources.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push(item.route as any)}
                                className={`flex-row items-center p-4 rounded-xl border ${item.borderColor} ${item.color} shadow-sm`}
                            >
                                <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
                                    {item.icon}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-stone-800">{item.title}</Text>
                                    <Text className="text-xs text-stone-500">{item.subtitle}</Text>
                                </View>
                                <ChevronRight size={20} color="#CBD5E0" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Featured / Quick Access */}
                    <View className="mt-6 bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-stone-800">Quick Access</Text>
                        </View>

                        <TouchableOpacity onPress={() => router.push('/(tabs)/duas')} className="flex-row items-center py-3 border-b border-stone-100">
                            <Text className="text-2xl mr-4">🤲</Text>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-stone-800">Morning Adhkar</Text>
                                <Text className="text-xs text-stone-500">Recommended for now</Text>
                            </View>
                            <ChevronRight size={20} color="#CBD5E0" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/(tabs)/guide')} className="flex-row items-center py-3 pt-4">
                            <Text className="text-2xl mr-4">🕋</Text>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-stone-800">Tawaf Guide</Text>
                                <Text className="text-xs text-stone-500">Step 3 of Umrah</Text>
                            </View>
                            <ChevronRight size={20} color="#CBD5E0" />
                        </TouchableOpacity>
                    </View>
                </Animated.ScrollView>
            </View>
        </SafeAreaView>
    );
}
