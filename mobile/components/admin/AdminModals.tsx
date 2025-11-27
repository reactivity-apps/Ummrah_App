import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Platform, Alert } from "react-native";
import { UserPlus, Plus, X, Calendar, ChevronDown } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

interface AdminModalsProps {
    // Add Member Modal
    showAddMemberModal: boolean;
    setShowAddMemberModal: (show: boolean) => void;
    newMemberPhone: string;
    setNewMemberPhone: (phone: string) => void;
    newMemberFirstName: string;
    setNewMemberFirstName: (name: string) => void;
    newMemberLastName: string;
    setNewMemberLastName: (name: string) => void;
    handleAddMember: () => void;

    // Create Trip Modal
    showCreateTripModal: boolean;
    setShowCreateTripModal: (show: boolean) => void;
    newTripName: string;
    setNewTripName: (name: string) => void;
    newTripStartDate: Date | null;
    setNewTripStartDate: (date: Date | null) => void;
    newTripEndDate: Date | null;
    setNewTripEndDate: (date: Date | null) => void;
    showStartDatePicker: boolean;
    setShowStartDatePicker: (show: boolean) => void;
    showEndDatePicker: boolean;
    setShowEndDatePicker: (show: boolean) => void;
    newTripCity: string;
    setNewTripCity: (city: string) => void;
    creatingTrip: boolean;
    handleCreateTrip: () => void;

    // Trip Switcher Modal
    showTripSwitcher: boolean;
    setShowTripSwitcher: (show: boolean) => void;
    allTrips: any[];
    currentTripId?: string;
    handleSwitchTrip: (tripId: string) => void;
}

export function AdminModals({
    showAddMemberModal,
    setShowAddMemberModal,
    newMemberPhone,
    setNewMemberPhone,
    newMemberFirstName,
    setNewMemberFirstName,
    newMemberLastName,
    setNewMemberLastName,
    handleAddMember,
    showCreateTripModal,
    setShowCreateTripModal,
    newTripName,
    setNewTripName,
    newTripStartDate,
    setNewTripStartDate,
    newTripEndDate,
    setNewTripEndDate,
    showStartDatePicker,
    setShowStartDatePicker,
    showEndDatePicker,
    setShowEndDatePicker,
    newTripCity,
    setNewTripCity,
    creatingTrip,
    handleCreateTrip,
    showTripSwitcher,
    setShowTripSwitcher,
    allTrips,
    currentTripId,
    handleSwitchTrip,
}: AdminModalsProps) {
    return (
        <>
            {/* Add Member Modal */}
            <Modal
                visible={showAddMemberModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAddMemberModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-card rounded-2xl w-full max-w-md p-6 border border-[#C5A059]/20">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <UserPlus size={24} color="#4A6741" />
                                <Text className="text-xl font-bold text-foreground">Add New Member</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAddMemberModal(false)} className="p-1">
                                <X size={24} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm text-muted-foreground mb-4">
                            Enter member details to send them an invitation
                        </Text>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">Phone Number</Text>
                            <TextInput
                                placeholder="+1 555-123-4567"
                                placeholderTextColor="#A0AEC0"
                                value={newMemberPhone}
                                onChangeText={setNewMemberPhone}
                                className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-foreground"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">First Name</Text>
                            <TextInput
                                placeholder="Ahmed"
                                placeholderTextColor="#A0AEC0"
                                value={newMemberFirstName}
                                onChangeText={setNewMemberFirstName}
                                className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-foreground"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium text-foreground mb-2">Last Name</Text>
                            <TextInput
                                placeholder="Hassan"
                                placeholderTextColor="#A0AEC0"
                                value={newMemberLastName}
                                onChangeText={setNewMemberLastName}
                                className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-foreground"
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowAddMemberModal(false)}
                                className="flex-1 bg-sand-100 rounded-xl p-4"
                            >
                                <Text className="text-muted-foreground font-semibold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddMember}
                                className="flex-1 bg-[#4A6741] rounded-xl p-4"
                            >
                                <Text className="text-white font-semibold text-center">Send Invite</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Trip Modal */}
            <Modal
                visible={showCreateTripModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCreateTripModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-card rounded-t-3xl p-6 border-t border-[#C5A059]/20">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <Plus size={24} color="#4A6741" />
                                <Text className="text-xl font-bold text-foreground">Create New Trip</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowCreateTripModal(false)} className="p-1">
                                <X size={24} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-foreground mb-2">Trip Name *</Text>
                                <TextInput
                                    placeholder="Umrah February 2025"
                                    placeholderTextColor="#A0AEC0"
                                    value={newTripName}
                                    onChangeText={setNewTripName}
                                    className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-foreground"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-foreground mb-2">Start Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowStartDatePicker(true)}
                                    className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3"
                                >
                                    <Text className={newTripStartDate ? "text-foreground" : "text-muted-foreground"}>
                                        {newTripStartDate ? newTripStartDate.toLocaleDateString() : "Select start date"}
                                    </Text>
                                </TouchableOpacity>
                                {showStartDatePicker && (
                                    <DateTimePicker
                                        value={newTripStartDate || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(_event: any, selectedDate?: Date) => {
                                            setShowStartDatePicker(Platform.OS === 'ios');
                                            if (selectedDate) {
                                                setNewTripStartDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-foreground mb-2">End Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowEndDatePicker(true)}
                                    className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3"
                                >
                                    <Text className={newTripEndDate ? "text-foreground" : "text-muted-foreground"}>
                                        {newTripEndDate ? newTripEndDate.toLocaleDateString() : "Select end date"}
                                    </Text>
                                </TouchableOpacity>
                                {showEndDatePicker && (
                                    <DateTimePicker
                                        value={newTripEndDate || newTripStartDate || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={newTripStartDate || undefined}
                                        onChange={(_event: any, selectedDate?: Date) => {
                                            setShowEndDatePicker(Platform.OS === 'ios');
                                            if (selectedDate) {
                                                setNewTripEndDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm font-medium text-foreground mb-2">Base City</Text>
                                <TextInput
                                    placeholder="Makkah"
                                    placeholderTextColor="#A0AEC0"
                                    value={newTripCity}
                                    onChangeText={setNewTripCity}
                                    className="bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-foreground"
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setShowCreateTripModal(false)}
                                    disabled={creatingTrip}
                                    className="flex-1 bg-sand-100 rounded-xl p-4"
                                >
                                    <Text className="text-muted-foreground font-semibold text-center">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCreateTrip}
                                    disabled={creatingTrip}
                                    className="flex-1 bg-[#4A6741] rounded-xl p-4"
                                >
                                    {creatingTrip ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text className="text-white font-semibold text-center">Create Trip</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Trip Switcher Modal */}
            <Modal
                visible={showTripSwitcher}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTripSwitcher(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-card rounded-t-3xl p-6 border-t border-[#C5A059]/20" style={{ maxHeight: '70%' }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-foreground">Select Trip</Text>
                            <TouchableOpacity onPress={() => setShowTripSwitcher(false)} className="p-1">
                                <X size={24} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {allTrips.map((trip) => (
                                <TouchableOpacity
                                    key={trip.id}
                                    onPress={() => handleSwitchTrip(trip.id!)}
                                    className={`p-4 rounded-xl mb-3 border ${trip.id === currentTripId
                                        ? 'bg-[#4A6741]/10 border-[#4A6741]'
                                        : 'bg-sand-50 border-sand-200'
                                        }`}
                                >
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1">
                                            <Text className={`font-bold text-lg ${trip.id === currentTripId ? 'text-[#4A6741]' : 'text-foreground'
                                                }`}>
                                                {trip.name}
                                            </Text>
                                            {trip.start_date && trip.end_date && (
                                                <View className="flex-row items-center mt-2">
                                                    <Calendar size={14} color="#9CA3AF" />
                                                    <Text className="text-sm text-muted-foreground ml-1">
                                                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            )}
                                            {trip.base_city && (
                                                <Text className="text-sm text-muted-foreground mt-1">{trip.base_city}</Text>
                                            )}
                                        </View>
                                        {trip.id === currentTripId && (
                                            <View className="bg-[#4A6741] px-2 py-1 rounded-full">
                                                <Text className="text-white text-xs font-semibold">ACTIVE</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                onPress={() => {
                                    setShowTripSwitcher(false);
                                    setShowCreateTripModal(true);
                                }}
                                className="p-4 rounded-xl border-2 border-dashed border-[#4A6741] bg-[#4A6741]/5 flex-row items-center justify-center mt-2"
                            >
                                <Plus size={20} color="#4A6741" />
                                <Text className="text-[#4A6741] font-semibold ml-2">Create New Trip</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
