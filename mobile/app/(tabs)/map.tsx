import { View, Text, FlatList, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { ZIYARAT } from "../../data/mock";
import { MapPin, Clock, Info, ArrowLeft } from "lucide-react-native";
import { useStaggeredFadeIn, usePressScale } from "../../lib/sharedElementTransitions";

// Animated card with staggered entrance and press feedback
function ZiyaratCard({ item, index }: { item: typeof ZIYARAT[0]; index: number }) {
    const staggerStyle = useStaggeredFadeIn(index, ZIYARAT.length);
    const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale();

    return (
        <Link href={`/map/${item.id}`} asChild>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.95}
            >
                <Animated.View
                    style={[staggerStyle, pressStyle]}
                    className="bg-card rounded-xl border border-sand-200 mb-4 shadow-sm overflow-hidden"
                >
                    <View className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center relative">
                        <MapPin size={64} color="hsl(40 30% 50%)" opacity={0.2} />
                        <View className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2.5 py-1.5 rounded-full flex-row items-center border border-sand-200">
                            <MapPin size={12} color="#4A6741" />
                            <Text className="text-primary text-xs font-medium ml-1">{item.location}</Text>
                        </View>
                    </View>
                    <View className="p-4">
                        <Text className="text-xl font-bold text-foreground mb-2">{item.title}</Text>
                        <Text className="text-foreground/80 mb-3 leading-5">{item.description}</Text>

                        <View className="flex-row gap-2 mb-2">
                            <View className="flex-1 bg-sand-50 p-2.5 rounded-lg border border-sand-100">
                                <View className="flex-row items-center mb-1">
                                    <MapPin size={14} color="hsl(40 5% 55%)" />
                                    <Text className="text-xs text-muted-foreground ml-1 font-medium">Distance</Text>
                                </View>
                                <Text className="text-foreground text-sm font-semibold">{item.distance}</Text>
                            </View>
                            <View className="flex-1 bg-sand-50 p-2.5 rounded-lg border border-sand-100">
                                <View className="flex-row items-center mb-1">
                                    <Clock size={14} color="hsl(40 5% 55%)" />
                                    <Text className="text-xs text-muted-foreground ml-1 font-medium">Visit Time</Text>
                                </View>
                                <Text className="text-foreground text-sm font-semibold">{item.visitTime}</Text>
                            </View>
                        </View>

                        <View className="mt-2 flex-row items-center justify-center py-2.5 bg-primary/5 rounded-lg border border-primary/20">
                            <Info size={16} color="#4A6741" />
                            <Text className="text-primary font-medium ml-2">View Details</Text>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );
}

export default function MapScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="mr-3 p-2 -ml-2"
                    >
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-foreground">Ziyarat Locations</Text>
                    </View>
                </View>
                <Text className="text-muted-foreground ml-11">Historical sites to visit</Text>
            </View>

            <FlatList
                data={ZIYARAT}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                renderItem={({ item, index }) => (
                    <ZiyaratCard item={item} index={index} />
                )}
                // Performance optimization: Only render visible items
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
            />
        </SafeAreaView>
    );
}