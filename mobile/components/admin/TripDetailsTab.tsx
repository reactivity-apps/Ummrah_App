import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Platform } from "react-native";
import { useState } from "react";
import { Calendar, Edit, X } from "lucide-react-native";
import { QuickActionItem } from "./QuickActionItem";
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateTrip } from "../../lib/api/services/trip.service";
import { TripRow } from "../../types/db";

interface TripDetailsTabProps {
    trip: TripRow;
    onNavigateToItinerary?: () => void;
}

export function TripDetailsTab({ trip, onNavigateToItinerary }: TripDetailsTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tripName, setTripName] = useState(trip.name);
    const [showDateModal, setShowDateModal] = useState(false);
    const [startDate, setStartDate] = useState(trip.start_date ? new Date(trip.start_date) : new Date());
    const [endDate, setEndDate] = useState(trip.end_date ? new Date(trip.end_date) : new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleSaveTrip = async () => {
        const result = await updateTrip(trip.id, { name: tripName });
        if (result.success) {
            Alert.alert('Success', 'Trip name updated successfully');
            setIsEditing(false);
        } else {
            Alert.alert('Error', result.error || 'Failed to update trip name');
        }
    };

    const handleEditItinerary = () => {
        if (onNavigateToItinerary) {
            onNavigateToItinerary();
        }
    };

    const handleSaveDates = async () => {
        const result = await updateTrip(trip.id, {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
        });

        if (result.success) {
            Alert.alert('Success', 'Trip dates updated successfully');
            setShowDateModal(false);
        } else {
            Alert.alert('Error', result.error || 'Failed to update dates');
        }
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
                                {trip.start_date && trip.end_date ? (
                                    `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                                ) : (
                                    'Dates not set'
                                )}
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
                    icon={Calendar}
                    title="Update Dates"
                    subtitle="Change trip duration"
                    onPress={() => setShowDateModal(true)}
                    last
                />
            </View>

            {/* Itinerary Summary */}
            <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                <Text className="text-lg font-bold text-foreground mb-3">Itinerary Summary</Text>
                <View className="space-y-2">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-muted-foreground">Total Days</Text>
                        <Text className="text-foreground font-semibold">
                            {trip.start_date && trip.end_date ? (
                                `${Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                            ) : (
                                'N/A'
                            )}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-muted-foreground">Start Date</Text>
                        <Text className="text-foreground font-semibold">
                            {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Not set'}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-muted-foreground">End Date</Text>
                        <Text className="text-foreground font-semibold">
                            {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'Not set'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Date Picker Modal */}
            <Modal
                visible={showDateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <View className="bg-card rounded-xl p-6 w-full max-w-md border border-sand-200">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-foreground">Update Trip Dates</Text>
                            <TouchableOpacity onPress={() => setShowDateModal(false)}>
                                <X size={24} color="hsl(40 5% 55%)" />
                            </TouchableOpacity>
                        </View>

                        {/* Start Date */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">Start Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                className="bg-sand-50 p-3 rounded-lg border border-sand-200"
                            >
                                <Text className="text-foreground">{startDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowStartPicker(Platform.OS === 'ios');
                                        if (selectedDate) {
                                            setStartDate(selectedDate);
                                            if (selectedDate > endDate) {
                                                setEndDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
                                            }
                                        }
                                    }}
                                />
                            )}
                        </View>

                        {/* End Date */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-foreground mb-2">End Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                className="bg-sand-50 p-3 rounded-lg border border-sand-200"
                            >
                                <Text className="text-foreground">{endDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showEndPicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    minimumDate={startDate}
                                    onChange={(event, selectedDate) => {
                                        setShowEndPicker(Platform.OS === 'ios');
                                        if (selectedDate) {
                                            setEndDate(selectedDate);
                                        }
                                    }}
                                />
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                                className="flex-1 bg-sand-100 p-3 rounded-lg"
                            >
                                <Text className="text-muted-foreground font-medium text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveDates}
                                className="flex-1 bg-[#4A6741] p-3 rounded-lg"
                            >
                                <Text className="text-white font-semibold text-center">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
