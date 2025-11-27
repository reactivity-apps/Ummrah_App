import { View, Text, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import {
    Calendar,
    Users,
    MessageSquare,
    Bell,
    UserPlus,
    UserMinus,
    Clock,
    ListTodo,
    AlertCircle,
    BarChart3,
} from "lucide-react-native";
import { useActivity } from "../../lib/api/hooks/useActivity";
import { getTripMembers } from "../../lib/api/services/trip.service";
import { QuickActionItem } from "./QuickActionItem";
import { GroupCodeCard } from "./GroupCodeCard";

interface OverviewTabProps {
    data: {
        currentTrip: {
            id: string;
            name: string;
            status: string;
            startDate: string;
            endDate: string;
            totalMembers: number;
            joinedMembers: number;
            pendingMembers: number;
        };
        groupCode: string;
        recentActivity: Array<{
            type: string;
            message: string;
            time: string;
        }>;
        unreadMessages: number;
    };
    onNavigate: (tab: 'overview' | 'members' | 'communication' | 'trip' | 'itinerary') => void;
    onAddMember: () => void;
    tripId?: string;
}

export function OverviewTab({
    data,
    onNavigate,
    onAddMember,
    tripId
}: OverviewTabProps) {
    const [memberCount, setMemberCount] = useState(0);
    const [adminCount, setAdminCount] = useState(0);
    const [loadingMembers, setLoadingMembers] = useState(true);

    // Fetch real activity data if we have a trip ID
    const { activities, loading: activitiesLoading } = useActivity({
        tripId: tripId || '',
        limit: 10,
        enableRealtime: true,
    });

    // Fetch real member stats
    useEffect(() => {
        if (!tripId) {
            setLoadingMembers(false);
            return;
        }

        async function loadMemberStats() {
            const result = await getTripMembers(tripId!);
            if (result.success && result.members) {
                setMemberCount(result.members.length);
                setAdminCount(result.members.filter(m => m.role === 'group_owner' || m.role === 'super_admin').length);
            }
            setLoadingMembers(false);
        }

        loadMemberStats();
    }, [tripId]);

    // Use real activities if available, otherwise fallback to mock data
    const displayActivities = tripId && activities.length > 0 ? activities : data.recentActivity;

    return (
        <View className="p-4">
            {/* Current Trip Status */}
            <View className="bg-card rounded-xl p-4 border border-[#C5A059]/20 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Current Trip</Text>
                    <View className="bg-[#4A6741]/10 px-2.5 py-1 rounded-md">
                        <Text className="text-[#4A6741] text-xs font-semibold uppercase">{data.currentTrip.status}</Text>
                    </View>
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">{data.currentTrip.name}</Text>
                <View className="flex-row items-center gap-2 mb-4">
                    <Calendar size={14} color="#C5A059" />
                    <Text className="text-sm text-muted-foreground">
                        {new Date(data.currentTrip.startDate).toLocaleDateString()} - {new Date(data.currentTrip.endDate).toLocaleDateString()}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-2">
                    <View className="flex-1 bg-[#4A6741]/5 p-3 rounded-lg border border-[#4A6741]/20">
                        <View className="flex-row items-center mb-1">
                            <Users size={14} color="#4A6741" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">MEMBERS</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            {loadingMembers ? '...' : memberCount}
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#C5A059]/5 p-3 rounded-lg border border-[#C5A059]/20">
                        <View className="flex-row items-center mb-1">
                            <UserPlus size={14} color="#C5A059" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">ADMINS</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            {loadingMembers ? '...' : adminCount}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Group Code Card */}
            <GroupCodeCard code={data.groupCode} />

            {/* Quick Actions */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Quick Actions</Text>
                <View className="bg-card rounded-xl border border-[#C5A059]/20 overflow-hidden">
                    <QuickActionItem
                        icon={MessageSquare}
                        title="Group Chat"
                        subtitle={`${data.unreadMessages} unread messages`}
                        onPress={() => onNavigate('communication')}
                    />
                    <QuickActionItem
                        icon={Bell}
                        title="Send Announcement"
                        subtitle="Notify all members"
                        onPress={() => onNavigate('communication')}
                    />
                    <QuickActionItem
                        icon={UserPlus}
                        title="Add Member"
                        subtitle="Invite new travelers"
                        onPress={onAddMember}
                        last
                    />
                </View>
            </View>

            {/* Recent Activity */}
            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Recent Activity</Text>
                    {activitiesLoading && <ActivityIndicator size="small" color="#4A6741" />}
                </View>
                <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                    {displayActivities.length > 0 ? (
                        displayActivities.map((activity, index) => {
                            // Determine icon based on activity type
                            let ActivityIcon = Clock;
                            let iconColor = "#9CA3AF";

                            if (activity.type === 'member_joined') {
                                ActivityIcon = UserPlus;
                                iconColor = "#4A6741";
                            } else if (activity.type === 'member_left') {
                                ActivityIcon = UserMinus;
                                iconColor = "#EF4444";
                            } else if (activity.type === 'announcement') {
                                ActivityIcon = Bell;
                                iconColor = "#C5A059";
                            } else if (activity.type === 'itinerary_created' || activity.type === 'itinerary_updated') {
                                ActivityIcon = ListTodo;
                                iconColor = "#0EA5E9";
                            } else if (activity.type === 'itinerary_deleted') {
                                ActivityIcon = AlertCircle;
                                iconColor = "#EF4444";
                            }

                            return (
                                <View
                                    key={index}
                                    className={`p-4 flex-row items-start ${index !== displayActivities.length - 1 ? 'border-b border-sand-100' : ''}`}
                                >
                                    <View className="mr-3 mt-0.5">
                                        <ActivityIcon size={18} color={iconColor} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-medium mb-1">{activity.message}</Text>
                                        <Text className="text-xs text-muted-foreground">{activity.time}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="p-6 items-center">
                            <Clock size={32} color="#CBD5E0" />
                            <Text className="text-muted-foreground text-sm mt-2">No recent activity</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Stats Overview */}
            <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
                <View className="flex-row items-center mb-3">
                    <BarChart3 size={20} color="#4A6741" />
                    <Text className="text-lg font-bold text-foreground ml-2">Group Health</Text>
                </View>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-[#4A6741]">
                            {loadingMembers ? '...' : `${memberCount}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Total Members</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#C5A059]">
                            {loadingMembers ? '...' : `${adminCount}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Admins</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#4A6741]">
                            {activitiesLoading ? '...' : `${activities.length}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Recent Activity</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
