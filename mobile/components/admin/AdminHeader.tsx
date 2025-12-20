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
        <View className="px-4 pt-4 pb-3 bg-card border-b border-sand-200">
            <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                    <View className="h-8 w-8 rounded-full border-2 border-[#C5A059]/30 bg-[#C5A059]/10 items-center justify-center mr-2.5">
                        <Shield size={16} color="#C5A059" />
                    </View>
                    <Text className="text-2xl font-bold text-stone-800">Group Admin</Text>
                </View>
                <View className="bg-[#C5A059]/10 px-2.5 py-1 rounded-full border border-[#C5A059]/30">
                    <Text className="text-[#C5A059] text-[10px] font-semibold">ADMIN</Text>
                </View>
            </View>
            <Text className="text-stone-500 text-sm mb-3">Manage your Umrah group</Text>

            {/* Current Trip Selector */}
            <TouchableOpacity
                onPress={onTripSelectorPress}
                className="bg-sand-50 border border-sand-200 rounded-lg p-2.5 flex-row items-center justify-between"
            >
                <View className="flex-1">
                    <Text className="text-[10px] text-muted-foreground font-semibold mb-0.5">CURRENT TRIP</Text>
                    <Text className="text-sm font-bold text-foreground">{currentTripName}</Text>
                    {currentTripStartDate && currentTripEndDate && (
                        <Text className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(currentTripStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentTripEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    )}
                </View>
                <ChevronDown size={16} color="#4A6741" />
            </TouchableOpacity>
        </View>
    );
}
