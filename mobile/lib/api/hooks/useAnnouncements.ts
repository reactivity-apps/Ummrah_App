/**
 * useAnnouncements Hook
 * 
 * PURPOSE: React hook for managing announcements with real-time updates
 * WHAT IT DOES: Provides announcement list with sorting (unread/priority first), CRUD operations for admins
 * USED BY: Admin dashboard, announcements screen
 */

import { useState, useEffect, useCallback } from 'react';
import { AnnouncementRow } from '../../../types/db';
import { verifyAdminPermission } from '../utils/helpers';
import {
    getAnnouncementsForTrip,
    getVisibleAnnouncementsForTrip,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendScheduledAnnouncement,
    subscribeToAnnouncementChanges,
    AnnouncementInput,
    getAnnouncementStatus,
} from '../services/announcement.service';

export interface UseAnnouncementsOptions {
    tripId: string;
    adminView?: boolean; // If true, shows all announcements including drafts/scheduled
    enableRealtime?: boolean;
    onError?: (error: string) => void;
}

export interface UseAnnouncementsReturn {
    announcements: AnnouncementRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    createItem: (input: AnnouncementInput) => Promise<boolean>;
    updateItem: (id: string, updates: Partial<AnnouncementInput>) => Promise<boolean>;
    deleteItem: (id: string) => Promise<boolean>;
    sendNow: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
}

/**
 * Sort announcements: unread/high priority first, then by sent_at (most recent first)
 */
function sortAnnouncements(announcements: AnnouncementRow[]): AnnouncementRow[] {
    return [...announcements].sort((a, b) => {
        // High priority first
        if (a.is_high_priority && !b.is_high_priority) return -1;
        if (!a.is_high_priority && b.is_high_priority) return 1;

        // Then by sent_at (most recent first)
        const aTime = new Date(a.sent_at || a.created_at!).getTime();
        const bTime = new Date(b.sent_at || b.created_at!).getTime();
        return bTime - aTime;
    });
}

export function useAnnouncements({
    tripId,
    adminView = false,
    enableRealtime = true,
    onError,
}: UseAnnouncementsOptions): UseAnnouncementsReturn {
    const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    const fetchAnnouncements = useCallback(async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const result = adminView
            ? await getAnnouncementsForTrip(tripId)
            : await getVisibleAnnouncementsForTrip(tripId);

        if (result.error) {
            setError(result.error);
            onError?.(result.error);
        } else {
            setAnnouncements(sortAnnouncements(result.data || []));
        }

        setLoading(false);
    }, [tripId, adminView, onError]);

    useEffect(() => {
        if (!tripId) {
            setLoading(false);
            return;
        }

        let mounted = true;

        const initialize = async () => {
            // Check permissions
            const perm = await verifyAdminPermission(tripId);
            if (mounted) {
                setIsAdmin(perm.hasPermission);
            }

            // Fetch announcements
            await fetchAnnouncements();
        };

        initialize();

        // Real-time subscription
        if (enableRealtime) {
            const unsubscribe = subscribeToAnnouncementChanges(tripId, (payload) => {
                if (!mounted) return;

                if (payload.eventType === 'INSERT') {
                    setAnnouncements(prev => {
                        if (prev.some(a => a.id === payload.new.id)) return prev;
                        return sortAnnouncements([...prev, payload.new]);
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setAnnouncements(prev =>
                        sortAnnouncements(
                            prev.map(a => a.id === payload.new.id ? payload.new : a)
                        )
                    );
                } else if (payload.eventType === 'DELETE') {
                    setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
                }
            });

            return () => {
                mounted = false;
                unsubscribe();
            };
        }

        return () => { mounted = false; };
    }, [tripId, enableRealtime, fetchAnnouncements]);

    // =========================================================================
    // CRUD OPERATIONS
    // =========================================================================

    const createItem = useCallback(async (input: AnnouncementInput): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can create announcements';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await createAnnouncement(input);
        if (result.error) {
            setError(result.error);
            onError?.(result.error);
            return false;
        }

        if (result.data) {
            setAnnouncements(prev => sortAnnouncements([...prev, result.data!]));
        }
        return true;
    }, [isAdmin, onError]);

    const updateItem = useCallback(async (
        id: string,
        updates: Partial<AnnouncementInput>
    ): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can update announcements';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await updateAnnouncement(id, updates);
        if (result.error) {
            setError(result.error);
            onError?.(result.error);
            return false;
        }

        if (result.data) {
            setAnnouncements(prev =>
                sortAnnouncements(
                    prev.map(a => a.id === id ? result.data! : a)
                )
            );
        }
        return true;
    }, [isAdmin, onError]);

    const deleteItem = useCallback(async (id: string): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can delete announcements';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await deleteAnnouncement(id);
        if (!result.success) {
            setError(result.error || 'Delete failed');
            onError?.(result.error || 'Delete failed');
            return false;
        }

        setAnnouncements(prev => prev.filter(a => a.id !== id));
        return true;
    }, [isAdmin, onError]);

    const sendNow = useCallback(async (id: string): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can send announcements';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await sendScheduledAnnouncement(id);
        if (!result.success) {
            setError(result.error || 'Send failed');
            onError?.(result.error || 'Send failed');
            return false;
        }

        // Refresh to get updated sent_at
        await fetchAnnouncements();
        return true;
    }, [isAdmin, onError, fetchAnnouncements]);

    return {
        announcements,
        loading,
        error,
        isAdmin,
        createItem,
        updateItem,
        deleteItem,
        sendNow,
        refresh: fetchAnnouncements,
    };
}
