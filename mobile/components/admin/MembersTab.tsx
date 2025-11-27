import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Users, UserMinus } from "lucide-react-native";
import { Alert } from "react-native";
import { getTripMembers, removeTripMember } from "../../lib/api/services/trip.service";
import { TripMemberRole } from "../../types/db";

interface Member {
    id: string;
    user_id: string;
    name: string;
    role: TripMemberRole;
    joined_at: string;
}

interface MembersTabProps {
    tripId: string;
}

export function MembersTab({ tripId }: MembersTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMembers();
    }, [tripId]);

    const loadMembers = async () => {
        setLoading(true);
        const result = await getTripMembers(tripId);
        if (result.success && result.members) {
            setMembers(result.members);
        } else {
            Alert.alert('Error', result.error || 'Failed to load members');
        }
        setLoading(false);
        setRefreshing(false);
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveMember = (userId: string, name: string) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${name} from the group?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await removeTripMember(tripId, userId);
                        if (result.success) {
                            Alert.alert('Success', `${name} has been removed from the group`);
                            loadMembers(); // Refresh the list
                        } else {
                            Alert.alert('Error', result.error || 'Failed to remove member');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#4A6741" />
            </View>
        );
    }

    return (
        <View className="p-4">
            {/* Search */}
            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-[#C5A059]/20 mb-4">
                <Users size={20} color="#C5A059" />
                <TextInput
                    placeholder="Search members..."
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="ml-2 flex-1 text-foreground"
                />
            </View>

            {/* Members List */}
            <View className="bg-card rounded-xl border border-[#C5A059]/20 overflow-hidden mb-4">
                {filteredMembers.map((member, index) => (
                    <View
                        key={member.id}
                        className={`p-4 ${index !== filteredMembers.length - 1 ? 'border-b border-sand-100' : ''}`}
                    >
                        <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="text-foreground font-semibold text-base">{member.name}</Text>
                                    {member.role === 'group_owner' && (
                                        <View className="bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/30">
                                            <Text className="text-[#C5A059] text-xs font-medium">ADMIN</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-xs text-muted-foreground">
                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row gap-2 mt-2">
                            <TouchableOpacity
                                onPress={() => handleRemoveMember(member.user_id, member.name)}
                                className="flex-1 flex-row items-center justify-center bg-red-50 p-2 rounded-lg border border-red-200"
                            >
                                <UserMinus size={14} color="hsl(0 84% 60%)" />
                                <Text className="text-red-600 text-xs font-medium ml-1">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Member Stats */}
            <View className="mt-4 p-4 bg-sand-50 rounded-xl border border-[#C5A059]/20">
                <Text className="text-sm font-semibold text-foreground mb-2">Member Statistics</Text>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-[#4A6741]">{members.length}</Text>
                        <Text className="text-xs text-muted-foreground">Total</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#C5A059]">{members.filter(m => m.role === 'group_owner').length}</Text>
                        <Text className="text-xs text-muted-foreground">Admins</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
