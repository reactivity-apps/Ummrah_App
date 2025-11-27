import { View, Text, TouchableOpacity } from "react-native";
import { Shield, ChevronDown } from "lucide-react-native";

interface AdminHeaderProps {
    currentTripName: string;
    currentTripStartDate?: string | null;
    currentTripEndDate?: string | null;
    onTripSelectorPress: () => void;
}

export function AdminHeader({
    currentTripName,
    currentTripStartDate,
    currentTripEndDate,
    onTripSelectorPress,
}: AdminHeaderProps) {
    return (
        <View className="px-4 py-4 bg-card border-b border-[#C5A059]/20">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Shield size={24} color="#C5A059" />
                    <View>
                        <Text className="text-2xl font-bold text-foreground">Group Admin</Text>
                        <Text className="text-sm text-muted-foreground mt-1">Manage your Umrah group</Text>
                    </View>
                </View>
                <View className="bg-[#C5A059]/10 px-3 py-1.5 rounded-full border border-[#C5A059]/30">
                    <Text className="text-[#C5A059] text-xs font-semibold">ADMIN</Text>
                </View>
            </View>

            {/* Current Trip Selector */}
            <TouchableOpacity
                onPress={onTripSelectorPress}
                className="bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-xl p-3 flex-row items-center justify-between"
            >
                <View className="flex-1">
                    <Text className="text-xs text-[#4A6741] font-semibold mb-1">CURRENT TRIP</Text>
                    <Text className="text-base font-bold text-foreground">{currentTripName}</Text>
                    {currentTripStartDate && currentTripEndDate && (
                        <Text className="text-xs text-muted-foreground mt-1">
                            {new Date(currentTripStartDate).toLocaleDateString()} - {new Date(currentTripEndDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>
                <ChevronDown size={20} color="#4A6741" />
            </TouchableOpacity>
        </View>
    );
}
