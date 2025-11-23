import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { GUIDES } from "../../data/mock";
import { ChevronRight, CheckCircle2, Circle, BookOpen } from "lucide-react-native";

export default function GuideScreen() {
    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <View className="px-4 py-4 bg-card border-b border-sand-200 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-foreground">Umrah Guide</Text>
                    <Text className="text-muted-foreground mt-1">Step-by-step instructions</Text>
                </View>
                <View className="bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                    <Text className="text-primary font-semibold text-sm">Step 2 of 4</Text>
                </View>
            </View>

            <FlatList
                data={GUIDES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item, index }) => {
                    const statusIcon = item.status === 'completed'
                        ? <CheckCircle2 size={24} color="hsl(140 40% 45%)" fill="hsl(140 40% 95%)" />
                        : item.status === 'current'
                            ? <View className="w-6 h-6 rounded-full border-4 border-primary bg-white" />
                            : <Circle size={24} color="hsl(40 5% 70%)" />;

                    return (
                        <Link href={`/guide/${item.id}`} asChild>
                            <TouchableOpacity
                                className={`bg-card rounded-xl border mb-4 shadow-sm ${item.status === 'current' ? 'border-primary border-2' : 'border-sand-200'
                                    }`}
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
                                                <Text className="text-sand-700 text-xs font-medium">Step {index + 1}</Text>
                                            </View>
                                        </View>
                                        <Text className={`text-lg font-bold mb-1 ${item.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'
                                            }`}>
                                            {item.title}
                                        </Text>
                                        <Text className="text-sm text-muted-foreground">{item.description}</Text>
                                    </View>

                                    <ChevronRight size={20} color="hsl(40 5% 70%)" />
                                </View>
                            </TouchableOpacity>
                        </Link>
                    );
                }}
            />
        </SafeAreaView>
    );
}