import { View, Text } from "react-native";
import { ListTodo } from "lucide-react-native";
import ItineraryManager from "../ItineraryManager";

interface ItineraryTabProps {
    tripId: string;
    tripName: string;
}

export function ItineraryTab({ tripId, tripName }: ItineraryTabProps) {
    // Safety check: Don't render ItineraryManager if no valid tripId
    if (!tripId) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ListTodo size={64} color="#CBD5E0" />
                <Text className="text-foreground font-semibold text-lg mt-4 text-center">
                    No Active Trip
                </Text>
                <Text className="text-muted-foreground text-center mt-2">
                    Create or join a trip to manage itinerary items
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <ItineraryManager tripId={tripId} tripName={tripName} />
        </View>
    );
}
