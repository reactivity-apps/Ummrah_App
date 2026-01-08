import { View } from "react-native";
import { AnnouncementsManager } from "../AnnouncementsManager";
import { AnnouncementRow } from "../../types/db";

interface CommunicationTabProps {
    tripId?: string;
    announcements: AnnouncementRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    createItem: (input: any) => Promise<boolean>;
    updateItem: (id: string, input: any) => Promise<boolean>;
    deleteItem: (id: string) => Promise<boolean>;
    sendNow: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function CommunicationTab({
    tripId,
    announcements,
    loading,
    error,
    isAdmin,
    createItem,
    updateItem,
    deleteItem,
    sendNow,
    refresh
}: CommunicationTabProps) {
    // Show AnnouncementsManager if we have a trip ID
    if (tripId) {
        return (
            <AnnouncementsManager
                tripId={tripId}
                announcements={announcements}
                loading={loading}
                error={error}
                isAdmin={isAdmin}
                createItem={createItem}
                updateItem={updateItem}
                deleteItem={deleteItem}
                sendNow={sendNow}
                refresh={refresh}
            />
        );
    }

    // Fallback if no trip
    return null;
}
