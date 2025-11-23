import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { ZIYARAT } from "../../data/mock";
import { MapPin, Clock, Info } from "lucide-react-native";

export default function MapScreen() {
    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <Text className="text-2xl font-bold text-foreground">Ziyarat Locations</Text>
                <Text className="text-muted-foreground mt-1">Historical sites to visit</Text>
            </View>

            <FlatList
                data={ZIYARAT}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <Link href={`/map/${item.id}`} asChild>
                        <TouchableOpacity className="bg-card rounded-xl border border-sand-200 mb-4 shadow-sm overflow-hidden">
                            <View className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center relative">
                                <MapPin size={64} color="hsl(40 30% 50%)" opacity={0.2} />
                                <View className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2.5 py-1.5 rounded-full flex-row items-center border border-sand-200">
                                    <MapPin size={12} color="hsl(140 40% 45%)" />
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

                                <TouchableOpacity className="mt-2 flex-row items-center justify-center py-2.5 bg-primary/5 rounded-lg border border-primary/20">
                                    <Info size={16} color="hsl(140 40% 45%)" />
                                    <Text className="text-primary font-medium ml-2">View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Link>
                )}
            />
        </SafeAreaView>
    );
}