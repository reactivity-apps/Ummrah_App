import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ZIYARAT } from "../../data/mock";
import { MapPin, Clock, Info, Bookmark } from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { DetailSkeleton } from "../../components/SkeletonLoader";
import { useState, useEffect } from "react";

export default function ZiyaratDetailScreen() {
    const { id } = useLocalSearchParams();
    const location = ZIYARAT.find(z => z.id === id);
    const [isLoading, setIsLoading] = useState(true);

    // Smooth entrance animations
    const heroStyle = useFadeIn(0);
    const contentStyle = useFadeIn(100);

    // Prevent flash during navigation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    if (!location) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <Text className="text-muted-foreground">Location not found</Text>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <DetailSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['top']}>
            <View className="px-4 py-3 bg-card border-b border-sand-200">
                <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                    {location.title}
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Hero Section - Animated entrance */}
                <Animated.View
                    style={heroStyle}
                    className="w-full h-64 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center"
                >
                    <MapPin size={100} color="hsl(40 30% 50%)" opacity={0.2} />
                    <View className="absolute bottom-4 right-4 bg-card/90 backdrop-blur px-3 py-2 rounded-full flex-row items-center border border-sand-200">
                        <MapPin size={16} color="#4A6741" />
                        <Text className="text-primary text-sm font-semibold ml-1">{location.location}</Text>
                    </View>
                </Animated.View>

                {/* Content - Fades in after hero */}
                <Animated.View style={contentStyle} className="px-4 py-6">
                    {/* Quick Info */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-card p-4 rounded-xl border border-sand-200">
                            <View className="flex-row items-center mb-2">
                                <MapPin size={18} color="#4A6741" />
                                <Text className="text-xs text-muted-foreground ml-2 font-medium">DISTANCE</Text>
                            </View>
                            <Text className="text-foreground font-semibold">{location.distance}</Text>
                        </View>
                        <View className="flex-1 bg-card p-4 rounded-xl border border-sand-200">
                            <View className="flex-row items-center mb-2">
                                <Clock size={18} color="#4A6741" />
                                <Text className="text-xs text-muted-foreground ml-2 font-medium">DURATION</Text>
                            </View>
                            <Text className="text-foreground font-semibold">{location.visitTime}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-foreground mb-3">About</Text>
                        <View className="bg-card p-4 rounded-xl border border-sand-200">
                            <Text className="text-foreground/90 leading-6">{location.description}</Text>
                        </View>
                    </View>

                    {/* Significance */}
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-foreground mb-3">Significance</Text>
                        <View className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <View className="flex-row items-start">
                                <Info size={20} color="#4A6741" className="mt-0.5" />
                                <Text className="text-foreground/90 leading-6 ml-3 flex-1">
                                    {location.significance}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Tips */}
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-foreground mb-3">Visitor Tips</Text>
                        <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                            {location.tips.map((tip, index) => (
                                <View
                                    key={index}
                                    className={`p-4 flex-row items-start ${index !== location.tips.length - 1 ? 'border-b border-sand-100' : ''}`}
                                >
                                    <View className="h-6 w-6 bg-primary/10 rounded-full items-center justify-center mr-3 mt-0.5">
                                        <Text className="text-primary text-xs font-bold">✓</Text>
                                    </View>
                                    <Text className="text-foreground/90 flex-1 leading-5">{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
