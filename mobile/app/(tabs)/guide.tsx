import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { GUIDES } from "../../data/mock";
import { ChevronRight, CheckCircle2, Circle, BookOpen, ArrowLeft } from "lucide-react-native";
import { useStaggeredFadeIn, usePressScale } from "../../lib/sharedElementTransitions";

// Animated guide card
function GuideCard({ item, index }: { item: typeof GUIDES[0]; index: number }) {
    const staggerStyle = useStaggeredFadeIn(index, GUIDES.length);
    const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale();

    const statusIcon = item.status === 'completed'
        ? <CheckCircle2 size={24} color="#4A6741" fill="hsl(140 40% 95%)" />
        : item.status === 'current'
            ? <View className="w-6 h-6 rounded-full border-4 border-primary bg-white" />
            : <Circle size={24} color="hsl(40 5% 70%)" />;

    return (
        <Link href={`/guide/${item.id}`} asChild>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.95}
            >
                <Animated.View
                    style={[staggerStyle, pressStyle]}
                    className={`bg-card rounded-xl border mb-4 shadow-sm ${item.status === 'current' ? 'border-primary border-2' : 'border-sand-200'}`}
                >
                    <View className="p-4 flex-row items-center">
                        <View className="relative mr-4">
                            <View className="w-16 h-16 rounded-lg bg-primary/10 items-center justify-center">
                                <BookOpen size={28} color="hsl(40 30% 50%)" />
                            </View>
                            <View className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-sm">
                                {statusIcon}
                            </View>
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className="bg-sand-100 px-2 py-0.5 rounded">
                                    <Text className="text-xs font-medium text-muted-foreground">Step {index + 1}</Text>
                                </View>
                            </View>
                            <Text className="text-base font-semibold text-foreground mb-1">{item.title}</Text>
                            <Text className="text-sm text-muted-foreground" numberOfLines={2}>{item.description}</Text>
                        </View>

                        <ChevronRight size={20} color="hsl(40 5% 70%)" />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );
}

export default function GuideScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="mr-3 p-2 -ml-2"
                        >
                            <ArrowLeft size={24} color="#4A6741" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-foreground">Umrah Guide</Text>
                            <Text className="text-muted-foreground mt-1">Step-by-step instructions</Text>
                        </View>
                    </View>
                    <View className="bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                        <Text className="text-primary font-semibold text-sm">Step 2 of 4</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={GUIDES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
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