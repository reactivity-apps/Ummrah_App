import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Users, UserPlus, UserMinus } from "lucide-react-native";
import { Alert } from "react-native";

interface Member {
    id: string;
    name: string;
    role: string;
    status: string;
    joinedAt: string;
}

interface MembersTabProps {
    members: Member[];
    groupCode: string;
    onAddMember: () => void;
}

export function MembersTab({ members, groupCode, onAddMember }: MembersTabProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Add Member Button */}
            <TouchableOpacity
                onPress={onAddMember}
                className="bg-[#4A6741] rounded-xl p-4 mb-4 flex-row items-center justify-center"
            >
                <UserPlus size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Add New Member</Text>
            </TouchableOpacity>

            {/* Members List */}
            <View className="bg-card rounded-xl border border-[#C5A059]/20 overflow-hidden">
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
                                        <View className="bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/30">
                                            <Text className="text-[#C5A059] text-xs font-medium">ADMIN</Text>
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
                                onPress={() => handleRemoveMember(member.id, member.name)}
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
                        <Text className="text-2xl font-bold text-[#4A6741]">{members.filter(m => m.status === 'active').length}</Text>
                        <Text className="text-xs text-muted-foreground">Active</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-amber-600">{members.filter(m => m.status === 'pending').length}</Text>
                        <Text className="text-xs text-muted-foreground">Pending</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-[#C5A059]">{members.filter(m => m.role === 'group_admin').length}</Text>
                        <Text className="text-xs text-muted-foreground">Admins</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
