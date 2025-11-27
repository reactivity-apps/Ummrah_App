import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Calendar, Users, Eye, Edit } from "lucide-react-native";
import { QuickActionItem } from "./QuickActionItem";

interface TripDetailsTabProps {
    trip: {
        id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
    };
}

export function TripDetailsTab({ trip }: TripDetailsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tripName, setTripName] = useState(trip.name);

    const handleSaveTrip = () => {
        Alert.alert('Trip Updated', 'Trip details have been saved successfully');
        setIsEditing(false);
    };

    const handleEditItinerary = () => {
        Alert.alert('Edit Itinerary', 'Opening itinerary editor...');
    };

    return (
        <View className="p-4">
            {/* Trip Name */}
            <View className="bg-card rounded-xl p-4 border border-sand-200 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Trip Details</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Edit size={18} color="#4A6741" />
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <>
                        <Text className="text-sm text-muted-foreground mb-2">Trip Name</Text>
                        <TextInput
                            value={tripName}
                            onChangeText={setTripName}
                            className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground mb-3"
                        />

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                className="flex-1 bg-sand-100 p-3 rounded-lg"
                            >
                                <Text className="text-muted-foreground font-medium text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveTrip}
                                className="flex-1 bg-primary p-3 rounded-lg"
                            >
                                <Text className="text-primary-foreground font-semibold text-center">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text className="text-2xl font-bold text-foreground mb-3">{tripName}</Text>
                        <View className="flex-row items-center gap-2">
                            <Calendar size={16} color="hsl(40 5% 55%)" />
                            <Text className="text-sm text-muted-foreground">
                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* Quick Edit Options */}
            <View className="bg-card rounded-xl border border-sand-200 overflow-hidden mb-4">
                <QuickActionItem
                    icon={Calendar}
                    title="Edit Itinerary"
                    subtitle="Manage daily activities"
                    onPress={handleEditItinerary}
                />
                <QuickActionItem
                    icon={Users}
                    title="Update Dates"
                    subtitle="Change trip duration"
                    onPress={() => Alert.alert('Update Dates', 'Opening date picker...')}
                />
                <QuickActionItem
                    icon={Eye}
                    title="Trip Visibility"
                    subtitle="Currently: Active"
                    onPress={() => Alert.alert('Trip Visibility', 'Change trip status (Active, Draft, Completed)')}
                    last
                />
            </View>

            {/* Itinerary Summary */}
            <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                <Text className="text-lg font-bold text-foreground mb-3">Itinerary Summary</Text>
                <View className="space-y-2">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-muted-foreground">Total Days</Text>
                        <Text className="text-foreground font-semibold">10 days</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-muted-foreground">Cities</Text>
                        <Text className="text-foreground font-semibold">Madinah, Makkah</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-muted-foreground">Total Activities</Text>
                        <Text className="text-foreground font-semibold">42 activities</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-muted-foreground">Last Updated</Text>
                        <Text className="text-foreground font-semibold">2 days ago</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
