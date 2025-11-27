import { View, TouchableOpacity, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface QuickActionItemProps {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    last?: boolean;
}

export function QuickActionItem({
    icon: Icon,
    title,
    subtitle,
    onPress,
    last = false
}: QuickActionItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center justify-between p-4 ${!last ? 'border-b border-sand-100' : ''}`}
        >
            <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 bg-sand-100 rounded-full items-center justify-center mr-3">
                    <Icon size={18} color="#4A6741" />
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
