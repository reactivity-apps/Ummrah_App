import { View, Text, FlatList, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { GUIDES } from "../data/mock";
import { ChevronRight, BookOpen } from "lucide-react-native";
import { useStaggeredFadeIn, usePressScale } from "../lib/sharedElementTransitions";

// Animated guide card
function GuideCard({ item, index }: { item: typeof GUIDES[0]; index: number }) {
    const staggerStyle = useStaggeredFadeIn(index, GUIDES.length);
    const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale();

    return (
        <Link href={`/umrah-guide/${item.id}`} asChild>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.95}
            >
                <Animated.View
                    style={[staggerStyle, pressStyle]}
                    className="bg-card rounded-xl border border-sand-200 mb-4 shadow-sm"
                >
                    <View className="p-4 flex-row items-center">
                        <View className="relative mr-4">
                            <View className="w-16 h-16 rounded-lg bg-primary/10 items-center justify-center border border-primary/20">
                                <BookOpen size={28} color="#4A6741" />
                            </View>
                            <View className="absolute -bottom-1 -right-1 bg-primary rounded-full w-6 h-6 items-center justify-center border-2 border-white">
                                <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                        </View>

                        <View className="flex-1">
                            <Text className="text-base font-semibold text-foreground mb-1">{item.title}</Text>
                            <Text className="text-sm text-muted-foreground" numberOfLines={2}>{item.description}</Text>
                        </View>

                        <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );
}

export default function GuideScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center justify-between">
                    <Text className="text-stone-500 text-base">Step-by-step instructions</Text>
                    <View className="bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                        <Text className="text-primary font-semibold text-sm">{GUIDES.length} Steps</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={GUIDES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                renderItem={({ item, index }) => (
                    <GuideCard item={item} index={index} />
                )}
                // Performance optimizations
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
            />
        </SafeAreaView>
    );
}