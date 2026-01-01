import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Shield, Copy, Share2, RefreshCw } from "lucide-react-native";

interface GroupCodeCardProps {
    code: string;
}

export function GroupCodeCard({ code }: GroupCodeCardProps) {
    const handleCopy = () => {
        Alert.alert('Copied!', `Group code "${code}" copied to clipboard`);
    };

    const handleShare = () => {
        Alert.alert('Share Code', `Share group code: ${code}`);
    };

    return (
        <View className="bg-card rounded-xl p-4 border border-[#C5A059]/20 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-foreground">Group Join Code</Text>
            </View>

            <View className="bg-[#4A6741]/5 p-4 rounded-lg border border-[#4A6741]/20 mb-3">
                <Text className="text-center text-3xl font-bold text-[#4A6741] tracking-wider">{code}</Text>
            </View>

            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={handleCopy}
                    className="flex-1 flex-row items-center justify-center bg-[#4A6741]/10 p-3 rounded-lg border border-[#4A6741]/20"
                >
                    <Copy size={16} color="#4A6741" />
                    <Text className="text-[#4A6741] font-medium ml-2">Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-1 flex-row items-center justify-center bg-[#C5A059]/10 p-3 rounded-lg border border-[#C5A059]/30"
                >
                    <Share2 size={16} color="#C5A059" />
                    <Text className="text-[#C5A059] font-medium ml-2">Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
