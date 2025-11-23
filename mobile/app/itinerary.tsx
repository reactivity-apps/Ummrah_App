import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SCHEDULE } from "../data/mock";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Utensils, Plane, Hotel, Church } from "lucide-react-native";

export default function ItineraryScreen() {
    const ActivityIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'travel':
                return <Plane size={16} color="hsl(140 40% 45%)" />;
            case 'accommodation':
                return <Hotel size={16} color="hsl(140 40% 45%)" />;
            case 'prayer':
                return <Church size={16} color="hsl(140 40% 45%)" />;
            case 'meal':
                return <Utensils size={16} color="hsl(140 40% 45%)" />;
            case 'group':
                return <Users size={16} color="hsl(140 40% 45%)" />;
            case 'ziyarat':
                return <MapPin size={16} color="hsl(140 40% 45%)" />;
            default:
                return <Clock size={16} color="hsl(140 40% 45%)" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'travel':
                return 'bg-blue-50 border-blue-200';
            case 'accommodation':
                return 'bg-purple-50 border-purple-200';
            case 'prayer':
                return 'bg-primary/10 border-primary/20';
            case 'meal':
                return 'bg-orange-50 border-orange-200';
            case 'group':
                return 'bg-amber-50 border-amber-200';
            case 'ziyarat':
                return 'bg-emerald-50 border-emerald-200';
            default:
                return 'bg-sand-50 border-sand-200';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="px-4 py-3 bg-card border-b border-sand-200">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ArrowLeft size={24} color="hsl(40 5% 15%)" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-foreground">Trip Itinerary</Text>
                        <Text className="text-sm text-muted-foreground">Umrah February 2025</Text>
                    </View>
                </View>

                {/* Trip Overview */}
                <View className="flex-row gap-2 mt-2">
                    <View className="flex-1 bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <Text className="text-xs text-muted-foreground font-medium mb-1">DURATION</Text>
                        <Text className="text-foreground font-semibold">10 Days</Text>
                    </View>
                    <View className="flex-1 bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <Text className="text-xs text-muted-foreground font-medium mb-1">CITIES</Text>
                        <Text className="text-foreground font-semibold">Madinah, Makkah</Text>
                    </View>
                    <View className="flex-1 bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <Text className="text-xs text-muted-foreground font-medium mb-1">CURRENT</Text>
                        <Text className="text-primary font-semibold">Day 3</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {SCHEDULE.map((day, dayIndex) => (
                    <View key={day.id} className="mb-6">
                        {/* Day Header */}
                        <View className="flex-row items-center mb-3">
                            <View className={`px-3 py-1.5 rounded-full mr-3 ${dayIndex === 2 ? 'bg-primary' : 'bg-sand-200'}`}>
                                <Text className={`font-bold text-sm ${dayIndex === 2 ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {day.day}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-semibold">
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Text>
                                <View className="flex-row items-center mt-0.5">
                                    <MapPin size={12} color="hsl(40 5% 55%)" />
                                    <Text className="text-xs text-muted-foreground ml-1">{day.location}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Activities */}
                        <View className="ml-6 border-l-2 border-sand-200">
                            {day.activities.map((activity, actIndex) => (
                                <View key={actIndex} className="relative pl-6 pb-4">
                                    {/* Timeline Dot */}
                                    <View
                                        className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${dayIndex === 2 && actIndex === day.activities.length - 1
                                            ? 'bg-primary border-primary'
                                            : 'bg-card border-sand-300'
                                            }`}
                                        style={{ transform: [{ translateX: -7 }] }}
                                    />

                                    {/* Activity Card */}
                                    <View className={`bg-card rounded-xl p-3.5 border ${getActivityColor(activity.type)}`}>
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-row items-center flex-1">
                                                <View className="mr-2">
                                                    <ActivityIcon type={activity.type} />
                                                </View>
                                                <Text className="text-xs text-muted-foreground font-semibold">
                                                    {activity.time}
                                                </Text>
                                            </View>
                                            <View className={`px-2 py-0.5 rounded-full ${activity.type === 'prayer' ? 'bg-primary/20' :
                                                activity.type === 'meal' ? 'bg-orange-100' :
                                                    activity.type === 'ziyarat' ? 'bg-emerald-100' :
                                                        'bg-sand-100'
                                                }`}>
                                                <Text className="text-[10px] font-medium text-foreground capitalize">
                                                    {activity.type}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-foreground font-semibold leading-5">
                                            {activity.title}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Future Days Placeholder */}
                <View className="bg-card rounded-xl p-6 border border-sand-200 border-dashed mb-8">
                    <View className="items-center">
                        <Calendar size={32} color="hsl(40 5% 70%)" />
                        <Text className="text-muted-foreground font-medium mt-2">Days 4-10</Text>
                        <Text className="text-sm text-muted-foreground mt-1 text-center">
                            Full itinerary will be revealed as your journey progresses
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
