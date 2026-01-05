import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import {
    Calendar,
    Users,
    Bell,
    UserPlus,
    UserMinus,
    Clock,
    ListTodo,
    AlertCircle,
    RefreshCw,
} from "lucide-react-native";
import { QuickActionItem } from "./QuickActionItem";
import { GroupCodeCard } from "./GroupCodeCard";
import { ActivityItem } from "../../lib/api/services/activity.service";
import { TripRow } from "../../types/db";

interface OverviewTabProps {
    tripData: TripRow;
    onNavigate: (tab: 'overview' | 'members' | 'communication' | 'trip' | 'itinerary') => void;
    memberCount: number;
    adminCount: number;
    joinCode: string | null;
    loading: boolean;
    onRefresh: () => Promise<void>;
    activities: ActivityItem[];
    activitiesLoading: boolean;
}

export function OverviewTab({
    tripData,
    onNavigate,
    memberCount,
    adminCount,
    joinCode,
    loading,
    onRefresh,
    activities,
    activitiesLoading,
}: OverviewTabProps) {
    return (
        <ScrollView className="flex-1">
            <View className="p-4">
            {/* Current Trip Status */}
            <View className="bg-card rounded-xl p-4 border border-[#C5A059]/20 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Current Trip</Text>
                    <View className="bg-[#4A6741]/10 px-2.5 py-1 rounded-md">
                        <Text className="text-[#4A6741] text-xs font-semibold uppercase">{tripData.status}</Text>
                    </View>
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">{tripData.name}</Text>
                <View className="flex-row items-center gap-2 mb-4">
                    <Calendar size={14} color="#C5A059" />
                    <Text className="text-sm text-muted-foreground">
                        {tripData.start_date && tripData.end_date ? (
                            `${new Date(tripData.start_date).toLocaleDateString()} - ${new Date(tripData.end_date).toLocaleDateString()}`
                        ) : (
                            'Dates not set'
                        )}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-2">
                    <View className="flex-1 bg-[#4A6741]/5 p-3 rounded-lg border border-[#4A6741]/20">
                        <View className="flex-row items-center mb-1">
                            <Users size={14} color="#4A6741" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">MEMBER(S)</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            {loading ? '...' : memberCount}
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#C5A059]/5 p-3 rounded-lg border border-[#C5A059]/20">
                        <View className="flex-row items-center mb-1">
                            <UserPlus size={14} color="#C5A059" />
                            <Text className="text-xs text-muted-foreground ml-1 font-medium">ADMIN(S)</Text>
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            {loading ? '...' : adminCount}
                        </Text>
                    </View>
                </View>

                {/* Refresh Button */}
                <TouchableOpacity
                    onPress={onRefresh}
                    className="mt-3 flex-row items-center justify-center bg-[#C5A059]/10 p-3 rounded-lg border border-[#C5A059]/30"
                    disabled={loading}
                >
                    <RefreshCw size={16} color="#C5A059" />
                    <Text className="text-[#C5A059] font-medium ml-2">Refresh Data</Text>
                </TouchableOpacity>
            </View>

            {/* Group Code Card */}
            <GroupCodeCard code={joinCode} loading={loading} />

            {/* Quick Actions */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Quick Actions</Text>
                <View className="bg-card rounded-xl border border-[#C5A059]/20 overflow-hidden">
                    {/* <QuickActionItem
                        icon={MessageSquare}
                        title="Group Chat"
                        subtitle={`${data.unreadMessages} unread messages`}
                        onPress={() => onNavigate('communication')}
                    /> */}
                    <QuickActionItem
                        icon={Bell}
                        title="Send Announcement"
                        subtitle="Notify all members"
                        onPress={() => onNavigate('communication')}
                    />
                    {/* <QuickActionItem
                        icon={UserPlus}
                        title="Add Member"
                        subtitle="Invite new travelers"
                        onPress={onAddMember}
                        last
                    /> */}
                </View>
            </View>

            {/* Recent Activity */}
            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-foreground">Recent Activity</Text>
                    {(activitiesLoading || loading) && <ActivityIndicator size="small" color="#4A6741" />}
                </View>
                <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => {
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
                                    className={`p-4 flex-row items-start ${index !== activities.length - 1 ? 'border-b border-sand-100' : ''}`}
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
            {/* <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
                <View className="flex-row items-center mb-3">
                    <BarChart3 size={20} color="#4A6741" />
                    <Text className="text-lg font-bold text-foreground ml-2">Group Health</Text>
                </View>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-[#4A6741]">
                            {loadingMembers ? '...' : `${memberCount}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Total Member(s)</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#C5A059]">
                            {loadingMembers ? '...' : `${adminCount}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Admin(s)</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#4A6741]">
                            {activitiesLoading ? '...' : `${activities.length}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground">Recent Activity</Text>
                    </View>
                </View>
            </View> */}
        </View>
        </ScrollView>
    );
}
