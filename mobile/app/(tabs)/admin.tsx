import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Shield, AlertCircle, Plus, Lock, RefreshCw } from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { useTrip } from "../../lib/context/TripContext";
import { getOrCreateDefaultGroup } from "../../lib/api/services/group.service";
import { useTripMembers } from "../../lib/api/hooks/admin/useTripMembers";
import { useTripJoinCode } from "../../lib/api/hooks/admin/useTripJoinCode";

// Import admin components
import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminTabButton } from "../../components/admin/AdminTabButton";
import { AdminModals } from "../../components/admin/AdminModals";
import { OverviewTab } from "../../components/admin/OverviewTab";
import { MembersTab } from "../../components/admin/MembersTab";
import { ItineraryTab } from "../../components/admin/ItineraryTab";
import { CommunicationTab } from "../../components/admin/CommunicationTab";
import { TripDetailsTab } from "../../components/admin/TripDetailsTab";
import { useActivity } from "../../lib/api/hooks/useActivity";

export default function AdminScreen() {
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'communication' | 'trip' | 'itinerary'>('overview');
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showCreateTripModal, setShowCreateTripModal] = useState(false);
    const [showTripSwitcher, setShowTripSwitcher] = useState(false);
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [newMemberFirstName, setNewMemberFirstName] = useState('');
    const [newMemberLastName, setNewMemberLastName] = useState('');
    const [newTripName, setNewTripName] = useState('');
    const [newTripStartDate, setNewTripStartDate] = useState<Date | null>(null);
    const [newTripEndDate, setNewTripEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [newTripCity, setNewTripCity] = useState('');
    const [creatingTrip, setCreatingTrip] = useState(false);
    const fadeInStyle = useFadeIn(0);

    // Use trip context
    const {
        currentTrip,
        isGroupAdmin,
        allTrips,
        loading,
        error,
        setCurrentTrip,
        createNewTrip,
        refreshTrips,
    } = useTrip();

    // Fetch member and join code data
    const {
        members,
        memberCount,
        adminCount,
        loading: membersLoading,
        refetch: refetchMembers,
    } = useTripMembers(currentTrip?.id);

    const {
        joinCode,
        loading: joinCodeLoading,
        refetch: refetchJoinCode,
    } = useTripJoinCode(currentTrip?.id);

    // Fetch activity data with trip ID
    const { activities, loading: activitiesLoading } = useActivity({
        tripId: currentTrip?.id || '',
        limit: 10,
        enableRealtime: true,
    });

    // Show unauthorized screen if not admin
    if (!loading && !isGroupAdmin) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center">
                        <Lock size={48} color="#DC2626" />
                        <Text className="text-xl font-bold text-red-900 mt-4 text-center">
                            Admin Access Required
                        </Text>
                        <Text className="text-red-700 mt-2 text-center">
                            You don't have permission to access the admin panel. Please contact your group administrator.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // TODO: should be invite user, no func yet, comment out for now
    const handleAddMember = () => {
        if (!newMemberPhone.trim() || !newMemberFirstName.trim() || !newMemberLastName.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        Alert.alert('Success', `Invitation sent to ${newMemberFirstName} ${newMemberLastName} at ${newMemberPhone}`);

        setNewMemberPhone('');
        setNewMemberFirstName('');
        setNewMemberLastName('');
        setShowAddMemberModal(false);
    };

    const handleCreateTrip = async () => {
        if (!newTripName.trim()) {
            Alert.alert('Error', 'Please enter a trip name');
            return;
        }

        setCreatingTrip(true);

        try {
            const { success: groupSuccess, group, error: groupError } = await getOrCreateDefaultGroup();

            if (!groupSuccess || !group) {
                Alert.alert('Error', groupError || 'Failed to get group');
                return;
            }

            const { success, error } = await createNewTrip({
                group_id: group.id!,
                name: newTripName,
                start_date: newTripStartDate ? newTripStartDate.toISOString().split('T')[0] : null,
                end_date: newTripEndDate ? newTripEndDate.toISOString().split('T')[0] : null,
                base_city: newTripCity || null,
                visibility: 'draft',
            });

            if (success) {
                Alert.alert('Success', `Trip "${newTripName}" created successfully`);
                setNewTripName('');
                setNewTripStartDate(null);
                setNewTripEndDate(null);
                setNewTripCity('');
                setShowCreateTripModal(false);
            } else {
                Alert.alert('Error', error || 'Failed to create trip');
            }
        } finally {
            setCreatingTrip(false);
        }
    };

    const handleSwitchTrip = async (tripId: string) => {
        await setCurrentTrip(tripId);
        setShowTripSwitcher(false);
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A6741" />
                    <Text className="text-muted-foreground mt-4">Loading your trips...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="flex-1 items-center justify-center p-8">
                    <AlertCircle size={64} color="#EF4444" />
                    <Text className="text-foreground font-semibold text-lg mt-4">Error Loading Trips</Text>
                    <Text className="text-muted-foreground text-center mt-2">{error}</Text>
                    <TouchableOpacity
                        onPress={refreshTrips}
                        className="flex-row items-center justify-center bg-red-50 px-6 py-3 rounded-lg border border-red-300 mt-6"
                    >
                        <RefreshCw size={16} color="#DC2626" />
                        <Text className="text-red-600 font-medium ml-2">Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // No admin trips or current trip
    if (!currentTrip) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <View className="px-4 py-4 bg-card border-b border-[#C5A059]/20">
                    <View className="flex-row items-center gap-2">
                        <Shield size={24} color="#C5A059" />
                        <Text className="text-2xl font-bold text-foreground">Group Admin</Text>
                    </View>
                </View>
                <View className="flex-1 items-center justify-center p-8">
                    <Shield size={64} color="#CBD5E0" />
                    <Text className="text-foreground font-semibold text-lg mt-4">No Trips Yet</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Create your first trip to get started managing your Umrah group.
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowCreateTripModal(true)}
                        className="bg-[#4A6741] px-6 py-3 rounded-lg mt-6 flex-row items-center"
                    >
                        <Plus size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Create Trip</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
   
    // Refetch function for pull-to-refresh
    const handleRefresh = async () => {
        await Promise.all([refetchMembers(), refetchJoinCode()]);
    };

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['top']}>
            <AdminModals
                showAddMemberModal={showAddMemberModal}
                setShowAddMemberModal={setShowAddMemberModal}
                newMemberPhone={newMemberPhone}
                setNewMemberPhone={setNewMemberPhone}
                newMemberFirstName={newMemberFirstName}
                setNewMemberFirstName={setNewMemberFirstName}
                newMemberLastName={newMemberLastName}
                setNewMemberLastName={setNewMemberLastName}
                handleAddMember={handleAddMember}
                showCreateTripModal={showCreateTripModal}
                setShowCreateTripModal={setShowCreateTripModal}
                newTripName={newTripName}
                setNewTripName={setNewTripName}
                newTripStartDate={newTripStartDate}
                setNewTripStartDate={setNewTripStartDate}
                newTripEndDate={newTripEndDate}
                setNewTripEndDate={setNewTripEndDate}
                showStartDatePicker={showStartDatePicker}
                setShowStartDatePicker={setShowStartDatePicker}
                showEndDatePicker={showEndDatePicker}
                setShowEndDatePicker={setShowEndDatePicker}
                newTripCity={newTripCity}
                setNewTripCity={setNewTripCity}
                creatingTrip={creatingTrip}
                handleCreateTrip={handleCreateTrip}
                showTripSwitcher={showTripSwitcher}
                setShowTripSwitcher={setShowTripSwitcher}
                allTrips={allTrips}
                currentTripId={currentTrip?.id}
                handleSwitchTrip={handleSwitchTrip}
            />

            <AdminHeader
                currentTripName={currentTrip.name}
                currentTripStartDate={currentTrip.start_date}
                currentTripEndDate={currentTrip.end_date}
                onTripSelectorPress={() => setShowTripSwitcher(true)}
            />

            {/* Tab Navigation */}
            <View className="px-4 py-3 bg-card border-b border-sand-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        <AdminTabButton
                            active={activeTab === 'overview'}
                            onPress={() => setActiveTab('overview')}
                            label="Overview"
                        />
                        <AdminTabButton
                            active={activeTab === 'members'}
                            onPress={() => setActiveTab('members')}
                            label="Members"
                        />
                        <AdminTabButton
                            active={activeTab === 'itinerary'}
                            onPress={() => setActiveTab('itinerary')}
                            label="Itinerary"
                        />
                        <AdminTabButton
                            active={activeTab === 'communication'}
                            onPress={() => setActiveTab('communication')}
                            label="Communication"
                        />
                        <AdminTabButton
                            active={activeTab === 'trip'}
                            onPress={() => setActiveTab('trip')}
                            label="Trip Details"
                        />
                    </View>
                </ScrollView>
            </View>

            <Animated.ScrollView style={fadeInStyle} className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
                {activeTab === 'overview' && (
                    <OverviewTab
                        tripData={currentTrip}
                        onNavigate={setActiveTab}
                        memberCount={memberCount}
                        adminCount={adminCount}
                        joinCode={joinCode}
                        loading={membersLoading || joinCodeLoading}
                        onRefresh={handleRefresh}
                        activities={activities}
                        activitiesLoading={activitiesLoading}
                    />
                )}
                {activeTab === 'members' && <MembersTab tripId={currentTrip.id} />}
                {activeTab === 'itinerary' && <ItineraryTab tripId={currentTrip.id} tripName={currentTrip.name} />}
                {activeTab === 'communication' && <CommunicationTab tripId={currentTrip?.id} />}
                {activeTab === 'trip' && <TripDetailsTab trip={currentTrip} onNavigateToItinerary={() => setActiveTab('itinerary')} />}
            </Animated.ScrollView>
        </SafeAreaView>
    );
}
