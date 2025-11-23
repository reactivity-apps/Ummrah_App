import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
    Calendar,
    Users,
    Share2,
    MessageSquare,
    Bell,
    ChevronRight,
    Copy,
    RefreshCw,
    UserPlus,
    UserMinus,
    Eye,
    Edit,
    Send,
    BarChart3,
    Shield,
    Clock
} from "lucide-react-native";

// Mock data for admin
const MOCK_ADMIN_DATA = {
    currentTrip: {
        id: '1',
        name: 'Umrah February 2025',
        status: 'active',
        startDate: '2025-02-08',
        endDate: '2025-02-18',
        totalMembers: 45,
        joinedMembers: 42,
        pendingMembers: 3,
    },
    groupCode: 'UMR2025FEB',
    members: [
        { id: '1', name: 'Ahmed Hassan', role: 'group_admin', status: 'active', joinedAt: '2024-11-15' },
        { id: '2', name: 'Fatima Khan', role: 'traveler', status: 'active', joinedAt: '2024-11-18' },
        { id: '3', name: 'Omar Ali', role: 'traveler', status: 'active', joinedAt: '2024-11-20' },
        { id: '4', name: 'Aisha Mohamed', role: 'traveler', status: 'pending', joinedAt: '2024-11-22' },
    ],
    recentActivity: [
        { type: 'member_joined', message: 'Aisha Mohamed joined the group', time: '2 hours ago' },
        { type: 'announcement', message: 'New announcement sent to 42 members', time: '5 hours ago' },
        { type: 'trip_updated', message: 'Trip itinerary updated', time: '1 day ago' },
    ],
    unreadMessages: 8,
};

export default function AdminScreen() {
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'communication' | 'trip'>('overview');

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="px-4 py-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center justify-between mb-2">
                    <View>
                        <Text className="text-2xl font-bold text-foreground">Group Admin</Text>
                        <Text className="text-sm text-muted-foreground mt-1">Manage your Umrah group</Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <Text className="text-primary text-xs font-semibold">ADMIN</Text>
                    </View>
                </View>
            </View>

            {/* Tab Navigation */}
            <View className="px-4 py-3 bg-card border-b border-sand-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        <TabButton
                            active={activeTab === 'overview'}
                            onPress={() => setActiveTab('overview')}
                            label="Overview"
                        />
                        <TabButton
                            active={activeTab === 'members'}
                            onPress={() => setActiveTab('members')}
                            label="Members"
                        />
                        <TabButton
                            active={activeTab === 'communication'}
                            onPress={() => setActiveTab('communication')}
                            label="Communication"
                        />
                        <TabButton
                            active={activeTab === 'trip'}
                            onPress={() => setActiveTab('trip')}
                            label="Trip Details"
                        />
                    </View>
                </ScrollView>
            </View>

            <ScrollView className="flex-1">
                {activeTab === 'overview' && <OverviewTab data={MOCK_ADMIN_DATA} />}
                {activeTab === 'members' && <MembersTab members={MOCK_ADMIN_DATA.members} groupCode={MOCK_ADMIN_DATA.groupCode} />}
                {activeTab === 'communication' && <CommunicationTab unreadMessages={MOCK_ADMIN_DATA.unreadMessages} />}
                {activeTab === 'trip' && <TripDetailsTab trip={MOCK_ADMIN_DATA.currentTrip} />}
            </ScrollView>
        </SafeAreaView>
    );
}

function TabButton({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-card border-sand-200'
                }`}
        >
            <Text className={`font-medium ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function OverviewTab({ data }: { data: typeof MOCK_ADMIN_DATA }) {
    return (
        <View className="p-4">
            {/* Current Trip Status */}
            <View className="bg-card rounded-xl p-4 border border-sand-200 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Current Trip</Text>
                    <View className="bg-primary/10 px-2.5 py-1 rounded-md">
                        <Text className="text-primary text-xs font-semibold uppercase">{data.currentTrip.status}</Text>
                    </View>
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">{data.currentTrip.name}</Text>
                <View className="flex-row items-center gap-2 mb-4">
                    <Calendar size={14} color="hsl(40 5% 55%)" />
                    <Text className="text-sm text-muted-foreground">
                        {new Date(data.currentTrip.startDate).toLocaleDateString()} - {new Date(data.currentTrip.endDate).toLocaleDateString()}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-2">
                    <View className="flex-1 bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <View className="flex-row items-center mb-1">
                            <Users size={14} color="hsl(140 40% 45%)" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">JOINED</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">{data.currentTrip.joinedMembers}/{data.currentTrip.totalMembers}</Text>
                    </View>
                    <View className="flex-1 bg-sand-50 p-3 rounded-lg border border-sand-100">
                        <View className="flex-row items-center mb-1">
                            <Clock size={14} color="hsl(40 30% 50%)" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">PENDING</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">{data.currentTrip.pendingMembers}</Text>
                    </View>
                </View>
            </View>

            {/* Group Code Card */}
            <GroupCodeCard code={data.groupCode} />

            {/* Quick Actions */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Quick Actions</Text>
                <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                    <QuickActionItem
                        icon={MessageSquare}
                        title="Group Chat"
                        subtitle={`${data.unreadMessages} unread messages`}
                        onPress={() => Alert.alert('Group Chat', 'Opening group chat...')}
                    />
                    <QuickActionItem
                        icon={Bell}
                        title="Send Announcement"
                        subtitle="Notify all members"
                        onPress={() => Alert.alert('Announcement', 'Opening announcement composer...')}
                    />
                    <QuickActionItem
                        icon={UserPlus}
                        title="Add Member"
                        subtitle="Invite new travelers"
                        onPress={() => Alert.alert('Add Member', 'Opening member invite...')}
                        last
                    />
                </View>
            </View>

            {/* Recent Activity */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Recent Activity</Text>
                <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                    {data.recentActivity.map((activity, index) => (
                        <View
                            key={index}
                            className={`p-4 ${index !== data.recentActivity.length - 1 ? 'border-b border-sand-100' : ''}`}
                        >
                            <Text className="text-foreground font-medium mb-1">{activity.message}</Text>
                            <Text className="text-xs text-muted-foreground">{activity.time}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Stats Overview */}
            <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
                <View className="flex-row items-center mb-3">
                    <BarChart3 size={20} color="hsl(140 40% 45%)" />
                    <Text className="text-lg font-bold text-foreground ml-2">Group Health</Text>
                </View>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-primary">93%</Text>
                        <Text className="text-xs text-muted-foreground">Join Rate</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-primary">98%</Text>
                        <Text className="text-xs text-muted-foreground">Active Users</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-primary">24h</Text>
                        <Text className="text-xs text-muted-foreground">Avg Response</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

function GroupCodeCard({ code }: { code: string }) {
    const handleCopy = () => {
        Alert.alert('Copied!', `Group code "${code}" copied to clipboard`);
    };

    const handleShare = () => {
        Alert.alert('Share Code', `Share group code: ${code}`);
    };

    const handleRegenerate = () => {
        Alert.alert(
            'Regenerate Code',
            'This will invalidate the current code. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Regenerate', style: 'destructive', onPress: () => Alert.alert('Code Regenerated', 'New code: UMR2025MAR') }
            ]
        );
    };

    return (
        <View className="bg-card rounded-xl p-4 border border-sand-200 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-foreground">Group Join Code</Text>
                <Shield size={18} color="hsl(140 40% 45%)" />
            </View>

            <View className="bg-sand-50 p-4 rounded-lg border border-sand-200 mb-3">
                <Text className="text-center text-3xl font-bold text-primary tracking-wider">{code}</Text>
            </View>

            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={handleCopy}
                    className="flex-1 flex-row items-center justify-center bg-sand-100 p-3 rounded-lg border border-sand-200"
                >
                    <Copy size={16} color="hsl(140 40% 45%)" />
                    <Text className="text-primary font-medium ml-2">Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-1 flex-row items-center justify-center bg-primary/10 p-3 rounded-lg border border-primary/20"
                >
                    <Share2 size={16} color="hsl(140 40% 45%)" />
                    <Text className="text-primary font-medium ml-2">Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-row items-center justify-center bg-sand-100 p-3 rounded-lg border border-sand-200"
                >
                    <RefreshCw size={16} color="hsl(40 5% 55%)" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function MembersTab({ members, groupCode }: { members: typeof MOCK_ADMIN_DATA.members; groupCode: string }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddMember = () => {
        Alert.alert('Add Member', 'Share this code with new members:\n\n' + groupCode);
    };

    const handleChangeRole = (memberId: string, currentRole: string) => {
        Alert.alert(
            'Change Role',
            'Select new role:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Traveler', onPress: () => Alert.alert('Role Updated', 'Member is now a Traveler') },
                { text: 'Group Admin', onPress: () => Alert.alert('Role Updated', 'Member is now a Group Admin') },
            ]
        );
    };

    const handleRemoveMember = (memberId: string, name: string) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${name} from the group?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => Alert.alert('Member Removed', `${name} has been removed from the group`)
                }
            ]
        );
    };

    return (
        <View className="p-4">
            {/* Search */}
            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200 mb-4">
                <Users size={20} color="hsl(40 5% 55%)" />
                <TextInput
                    placeholder="Search members..."
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="ml-2 flex-1 text-foreground"
                />
            </View>

            {/* Add Member Button */}
            <TouchableOpacity
                onPress={handleAddMember}
                className="bg-primary rounded-xl p-4 mb-4 flex-row items-center justify-center"
            >
                <UserPlus size={20} color="white" />
                <Text className="text-primary-foreground font-semibold ml-2">Add New Member</Text>
            </TouchableOpacity>

            {/* Members List */}
            <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                {filteredMembers.map((member, index) => (
                    <View
                        key={member.id}
                        className={`p-4 ${index !== filteredMembers.length - 1 ? 'border-b border-sand-100' : ''}`}
                    >
                        <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="text-foreground font-semibold text-base">{member.name}</Text>
                                    {member.role === 'group_admin' && (
                                        <View className="bg-primary/10 px-2 py-0.5 rounded">
                                            <Text className="text-primary text-xs font-medium">ADMIN</Text>
                                        </View>
                                    )}
                                    {member.status === 'pending' && (
                                        <View className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                            <Text className="text-amber-700 text-xs font-medium">PENDING</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-xs text-muted-foreground">
                                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row gap-2 mt-2">
                            <TouchableOpacity
                                onPress={() => handleChangeRole(member.id, member.role)}
                                className="flex-1 flex-row items-center justify-center bg-sand-100 p-2 rounded-lg"
                            >
                                <Shield size={14} color="hsl(140 40% 45%)" />
                                <Text className="text-primary text-xs font-medium ml-1">Change Role</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleRemoveMember(member.id, member.name)}
                                className="flex-row items-center justify-center bg-red-50 p-2 rounded-lg border border-red-200"
                            >
                                <UserMinus size={14} color="hsl(0 84% 60%)" />
                                <Text className="text-red-600 text-xs font-medium ml-1">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Member Stats */}
            <View className="mt-4 p-4 bg-sand-50 rounded-xl border border-sand-200">
                <Text className="text-sm font-semibold text-foreground mb-2">Member Statistics</Text>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-primary">{members.filter(m => m.status === 'active').length}</Text>
                        <Text className="text-xs text-muted-foreground">Active</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-amber-600">{members.filter(m => m.status === 'pending').length}</Text>
                        <Text className="text-xs text-muted-foreground">Pending</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-foreground">{members.filter(m => m.role === 'group_admin').length}</Text>
                        <Text className="text-xs text-muted-foreground">Admins</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

function CommunicationTab({ unreadMessages }: { unreadMessages: number }) {
    const [announcementText, setAnnouncementText] = useState('');
    const [isPriority, setIsPriority] = useState(false);

    const handleSendAnnouncement = () => {
        if (!announcementText.trim()) {
            Alert.alert('Error', 'Please enter an announcement message');
            return;
        }
        Alert.alert(
            'Send Announcement',
            `Send this announcement to all members?${isPriority ? '\n\n⚠️ This is a priority message.' : ''}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: () => {
                        Alert.alert('Sent!', 'Announcement sent to 42 members');
                        setAnnouncementText('');
                        setIsPriority(false);
                    }
                }
            ]
        );
    };

    const handleOpenChat = () => {
        Alert.alert('Group Chat', 'Opening group chat with 8 unread messages...');
    };

    return (
        <View className="p-4">
            {/* Group Chat Card */}
            <TouchableOpacity
                onPress={handleOpenChat}
                className="bg-card rounded-xl p-4 border border-sand-200 mb-4 shadow-sm"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                            <MessageSquare size={20} color="hsl(140 40% 45%)" />
                            <Text className="text-lg font-bold text-foreground">Group Chat</Text>
                        </View>
                        <Text className="text-sm text-muted-foreground">
                            Two-way communication with all members
                        </Text>
                    </View>
                    {unreadMessages > 0 && (
                        <View className="bg-red-500 rounded-full w-8 h-8 items-center justify-center ml-3">
                            <Text className="text-white text-xs font-bold">{unreadMessages}</Text>
                        </View>
                    )}
                    <ChevronRight size={20} color="hsl(40 5% 70%)" className="ml-2" />
                </View>
            </TouchableOpacity>

            {/* Send Announcement */}
            <View className="bg-card rounded-xl p-4 border border-sand-200 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                    <Bell size={20} color="hsl(140 40% 45%)" />
                    <Text className="text-lg font-bold text-foreground">Send Announcement</Text>
                </View>

                <TextInput
                    placeholder="Write your announcement..."
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={announcementText}
                    onChangeText={setAnnouncementText}
                    multiline
                    numberOfLines={4}
                    className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground mb-3"
                    style={{ minHeight: 100, textAlignVertical: 'top' }}
                />

                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <Text className="text-sm text-foreground font-medium mr-2">Priority Message</Text>
                        <Text className="text-xs text-muted-foreground">(Send push notification)</Text>
                    </View>
                    <Switch
                        value={isPriority}
                        onValueChange={setIsPriority}
                        trackColor={{ false: '#e0d8cc', true: 'hsl(140 40% 75%)' }}
                        thumbColor={isPriority ? 'hsl(140 40% 45%)' : '#f4f3f1'}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSendAnnouncement}
                    className="bg-primary rounded-lg p-4 flex-row items-center justify-center"
                >
                    <Send size={18} color="white" />
                    <Text className="text-primary-foreground font-semibold ml-2">Send to All Members</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Announcements */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Recent Announcements</Text>
                <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                    {[
                        { title: 'Important: Passport Check', message: 'Please ensure your passport is valid for at least 6 months', time: '2 hours ago', opens: 38 },
                        { title: 'Welcome to the Group!', message: 'Assalamu Alaykum everyone! Welcome to our Umrah group.', time: '1 day ago', opens: 42 },
                        { title: 'Meeting Reminder', message: 'Pre-trip orientation meeting tomorrow at 7 PM', time: '3 days ago', opens: 40 },
                    ].map((announcement, index) => (
                        <View
                            key={index}
                            className={`p-4 ${index !== 2 ? 'border-b border-sand-100' : ''}`}
                        >
                            <Text className="text-foreground font-semibold mb-1">{announcement.title}</Text>
                            <Text className="text-sm text-muted-foreground mb-2">{announcement.message}</Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xs text-muted-foreground">{announcement.time}</Text>
                                <View className="flex-row items-center gap-1">
                                    <Eye size={12} color="hsl(140 40% 45%)" />
                                    <Text className="text-xs text-primary font-medium">{announcement.opens} opened</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

function TripDetailsTab({ trip }: { trip: typeof MOCK_ADMIN_DATA.currentTrip }) {
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
                        <Edit size={18} color="hsl(140 40% 45%)" />
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

function QuickActionItem({
    icon: Icon,
    title,
    subtitle,
    onPress,
    last = false
}: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    last?: boolean;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-sand-100' : ''}`}
        >
            <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 bg-sand-100 rounded-full items-center justify-center mr-3">
                    <Icon size={18} color="hsl(140 40% 45%)" />
                </View>
                <View className="flex-1">
                    <Text className="text-foreground font-medium">{title}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
                </View>
            </View>
            <ChevronRight size={18} color="hsl(40 5% 70%)" />
        </TouchableOpacity>
    );
}
