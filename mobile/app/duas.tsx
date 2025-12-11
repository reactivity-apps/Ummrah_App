import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { DUAS } from "../data/mock";
import { Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { DuasSkeleton } from "../components/SkeletonLoader";

export default function DuasScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const categories = ["All", "Tawaf", "Sa'i", "Morning", "Evening", "Mosque", "Kaaba", "General"];

    // Prevent white flash during navigation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    const filteredDuas = selectedCategory === "All"
        ? DUAS
        : DUAS.filter(dua => dua.category === selectedCategory);

    // Show skeleton while loading
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <DuasSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <Text className="text-stone-500 text-base mb-4">Supplications for your journey</Text>
                <View className="flex-row items-center bg-sand-50 rounded-xl px-4 py-3 border border-sand-200">
                    <Search size={20} color="hsl(40 5% 55%)" />
                    <TextInput
                        placeholder="Search for a dua..."
                        placeholderTextColor="hsl(40 5% 55%)"
                        className="ml-2 flex-1 text-foreground"
                    />
                </View>
            </View>

            {/* Category Pills */}
            <View className="py-3 px-4 border-b border-sand-200 bg-card">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item)}
                            className={`mr-2 px-4 py-2 rounded-full border ${selectedCategory === item
                                ? 'bg-primary border-primary'
                                : 'bg-card border-sand-200'
                                }`}
                        >
                            <Text className={selectedCategory === item ? 'text-primary-foreground font-medium' : 'text-muted-foreground'}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filteredDuas}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
                renderItem={({ item }) => (
                    <View className="bg-card p-5 rounded-xl border border-sand-200 mb-4 shadow-sm">
                        <View className="flex-row justify-between items-start mb-3">
                            <Text className="text-lg font-bold text-foreground flex-1">{item.title}</Text>
                            <View className="bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                                <Text className="text-xs text-primary font-medium">{item.category}</Text>
                            </View>
                        </View>
                        <View className="bg-sand-50 p-4 rounded-lg mb-3 border border-sand-100">
                            <Text className="text-right text-xl font-medium text-foreground leading-10" style={{ fontFamily: 'System' }}>
                                {item.arabic}
                            </Text>
                        </View>
                        <Text className="text-muted-foreground italic mb-2 text-sm">{item.transliteration}</Text>
                        <Text className="text-foreground/90">{item.translation}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-12">
                        <Text className="text-muted-foreground">No duas found in this category</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}