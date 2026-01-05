import { View, Text } from "react-native";
import { ListTodo } from "lucide-react-native";
import ItineraryManager from "../itinerary/ItineraryManager";
import { ItineraryItemRow } from "../../types/db";
import { ItineraryItemInput } from "../../lib/api/services/itinerary.service";

interface ItineraryTabProps {
    tripId: string;
    tripName: string;
    items: ItineraryItemRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    checkingPermissions: boolean;
    createItem: (input: ItineraryItemInput) => Promise<boolean>;
    updateItem: (itemId: string, updates: Partial<ItineraryItemInput>, optimistic?: boolean) => Promise<boolean>;
    deleteItem: (itemId: string, optimistic?: boolean) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function ItineraryTab({
    tripId,
    tripName,
    items,
    loading,
    error,
    isAdmin,
    checkingPermissions,
    createItem,
    updateItem,
    deleteItem,
    refresh,
}: ItineraryTabProps) {
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
            <ItineraryManager
                tripId={tripId}
                tripName={tripName}
                items={items}
                loading={loading}
                error={error}
                isAdmin={isAdmin}
                checkingPermissions={checkingPermissions}
                createItem={createItem}
                updateItem={updateItem}
                deleteItem={deleteItem}
                refresh={refresh}
            />
        </View>
    );
}
