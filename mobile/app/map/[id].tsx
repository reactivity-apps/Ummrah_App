import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ZIYARAT } from "../../data/mock";
import { ArrowLeft, MapPin, Clock, Info, Navigation, Bookmark } from "lucide-react-native";

export default function ZiyaratDetailScreen() {
    const { id } = useLocalSearchParams();
    const location = ZIYARAT.find(z => z.id === id);

    if (!location) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <Text className="text-muted-foreground">Location not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="px-4 py-3 bg-card border-b border-sand-200 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ArrowLeft size={24} color="hsl(40 5% 15%)" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-foreground flex-1" numberOfLines={1}>
                        {location.title}
                    </Text>
                </View>
                <TouchableOpacity className="ml-2 p-2">
                    <Bookmark size={22} color="hsl(140 40% 45%)" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Hero Section */}
                <View className="w-full h-64 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center">
                    <MapPin size={100} color="hsl(40 30% 50%)" opacity={0.2} />
                    <View className="absolute bottom-4 right-4 bg-card/90 backdrop-blur px-3 py-2 rounded-full flex-row items-center border border-sand-200">
                        <MapPin size={16} color="hsl(140 40% 45%)" />
                        <Text className="text-primary text-sm font-semibold ml-1">{location.location}</Text>
                    </View>
                </View>

                <View className="px-4 py-6">
                    {/* Quick Info */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-card p-4 rounded-xl border border-sand-200">
                            <View className="flex-row items-center mb-2">
                                <MapPin size={18} color="hsl(140 40% 45%)" />
                                <Text className="text-xs text-muted-foreground ml-2 font-medium">DISTANCE</Text>
                            </View>
                            <Text className="text-foreground font-semibold">{location.distance}</Text>
                        </View>
                        <View className="flex-1 bg-card p-4 rounded-xl border border-sand-200">
                            <View className="flex-row items-center mb-2">
                                <Clock size={18} color="hsl(140 40% 45%)" />
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
                                <Info size={20} color="hsl(140 40% 45%)" className="mt-0.5" />
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

                    {/* Action Buttons */}
                    <View className="gap-3 mb-8">
                        <TouchableOpacity className="bg-primary p-4 rounded-xl flex-row items-center justify-center">
                            <Navigation size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold ml-2 text-base">Get Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-card p-4 rounded-xl flex-row items-center justify-center border border-sand-200">
                            <Info size={20} color="hsl(140 40% 45%)" />
                            <Text className="text-primary font-semibold ml-2 text-base">More Information</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
