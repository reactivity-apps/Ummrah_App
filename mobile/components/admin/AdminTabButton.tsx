import { TouchableOpacity, Text } from "react-native";

interface AdminTabButtonProps {
    active: boolean;
    onPress: () => void;
    label: string;
}

export function AdminTabButton({ active, onPress, label }: AdminTabButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full border ${active ? 'bg-[#4A6741] border-[#4A6741]' : 'bg-card border-sand-200'
                }`}
        >
            <Text className={`font-medium ${active ? 'text-white' : 'text-muted-foreground'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
