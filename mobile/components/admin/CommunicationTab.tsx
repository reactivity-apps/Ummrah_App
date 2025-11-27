import { View } from "react-native";
import { AnnouncementsManager } from "../AnnouncementsManager";

interface CommunicationTabProps {
    tripId?: string;
}

export function CommunicationTab({ tripId }: CommunicationTabProps) {
    // Show AnnouncementsManager if we have a trip ID
    if (tripId) {
        return (
            <View className="p-4">
                <AnnouncementsManager tripId={tripId} />
            </View>
        );
    }

    // Fallback if no trip
    return null;
}
