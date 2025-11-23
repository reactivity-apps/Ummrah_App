import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { GUIDES } from "../../data/mock";
import { ArrowLeft, CheckCircle2, BookOpen } from "lucide-react-native";

export default function GuideDetailScreen() {
    const { id } = useLocalSearchParams();
    const guide = GUIDES.find(g => g.id === id);

    if (!guide) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <Text className="text-muted-foreground">Guide not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="px-4 py-3 bg-card border-b border-sand-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="hsl(40 5% 15%)" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-foreground">{guide.title}</Text>
                    <Text className="text-sm text-muted-foreground">{guide.description}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Hero Section */}
                <View className="w-full h-56 bg-primary/10 rounded-xl mb-6 items-center justify-center">
                    <BookOpen size={80} color="hsl(40 30% 50%)" opacity={0.3} />
                </View>
                {/* Status Badge */}
                <View className="mb-6">
                    <View className={`self-start px-4 py-2 rounded-full border ${guide.status === 'completed'
                        ? 'bg-primary/10 border-primary/20'
                        : guide.status === 'current'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-sand-100 border-sand-200'
                        }`}>
                        <Text className={`font-semibold text-sm ${guide.status === 'completed'
                            ? 'text-primary'
                            : guide.status === 'current'
                                ? 'text-amber-700'
                                : 'text-muted-foreground'
                            }`}>
                            {guide.status === 'completed' ? '✓ Completed' : guide.status === 'current' ? 'Current Step' : 'Upcoming'}
                        </Text>
                    </View>
                </View>

                {/* Steps */}
                <View className="mb-6">
                    <Text className="text-xl font-bold text-foreground mb-4">Steps to Follow</Text>
                    {guide.steps.map((step, index) => (
                        <View key={index} className="mb-4">
                            <View className="bg-card rounded-xl p-4 border border-sand-200 shadow-sm">
                                <View className="flex-row items-start mb-3">
                                    <View className="h-8 w-8 bg-primary/10 rounded-full items-center justify-center mr-3 mt-0.5">
                                        <Text className="text-primary font-bold">{index + 1}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-foreground mb-1">
                                            {step.title}
                                        </Text>
                                        <Text className="text-foreground/80 mb-2">{step.description}</Text>
                                        <View className="bg-sand-50 p-3 rounded-lg border border-sand-100">
                                            <Text className="text-sm text-muted-foreground leading-5">{step.details}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Button */}
                {guide.status === 'current' && (
                    <TouchableOpacity className="bg-primary p-4 rounded-xl flex-row items-center justify-center mb-8">
                        <CheckCircle2 size={20} color="white" />
                        <Text className="text-primary-foreground font-semibold ml-2 text-base">Mark as Complete</Text>
                    </TouchableOpacity>
                )}

                {guide.status === 'upcoming' && (
                    <View className="bg-sand-100 p-4 rounded-xl mb-8">
                        <Text className="text-center text-muted-foreground">
                            Complete previous steps to unlock this section
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
