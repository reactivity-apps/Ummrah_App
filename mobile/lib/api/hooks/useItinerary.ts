/**
 * useItinerary Hook
 * 
 * PURPOSE: React hook for managing itinerary with real-time updates
 * WHAT IT DOES: Provides CRUD operations, optimistic updates, permission checks, real-time sync
 * USED BY: ItineraryManager component, admin screens
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ItineraryItemRow } from '../../../types/db';
import { sortItineraryItems } from '../utils/helpers';
import {
    getItineraryForTrip,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
    reorderItineraryItems,
    subscribeToItineraryChanges,
    ItineraryItemInput,
    BatchUpdateInput,
    updateItineraryItemsBatch,
} from '../services/itinerary.service';
import { verifyAdminPermission } from '../utils/helpers';

export interface UseItineraryOptions {
    tripId: string;
    enableRealtime?: boolean;
    onError?: (error: string) => void;
    onConflict?: (item: ItineraryItemRow) => void;
}

export interface UseItineraryReturn {
    items: ItineraryItemRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    checkingPermissions: boolean;
    createItem: (input: ItineraryItemInput) => Promise<boolean>;
    updateItem: (itemId: string, updates: Partial<ItineraryItemInput>, optimistic?: boolean) => Promise<boolean>;
    deleteItem: (itemId: string, optimistic?: boolean) => Promise<boolean>;
    reorderItems: (reorderData: Array<{ id: string; sort_order: number }>) => Promise<boolean>;
    batchUpdate: (batch: BatchUpdateInput) => Promise<boolean>;
    refresh: () => Promise<void>;
    getItemById: (itemId: string) => ItineraryItemRow | undefined;
}

export function useItinerary({ tripId, enableRealtime = true, onError, onConflict }: UseItineraryOptions): UseItineraryReturn {
    const [items, setItems] = useState<ItineraryItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingPermissions, setCheckingPermissions] = useState(true);

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    useEffect(() => {
        if (!tripId) {
            setLoading(false);
            setCheckingPermissions(false);
            return;
        }

        let mounted = true;

        const initialize = async () => {
            // Check permissions
            setCheckingPermissions(true);
            const perm = await verifyAdminPermission(tripId);
            if (mounted) {
                setIsAdmin(perm.hasPermission);
                setCheckingPermissions(false);
                if (!perm.hasPermission && perm.error) setError(perm.error);
            }

            // Fetch items
            setLoading(true);
            const result = await getItineraryForTrip(tripId);
            if (mounted) {
                if (result.error) {
                    setError(result.error);
                    onError?.(result.error);
                } else {
                    setItems(result.data || []);
                }
                setLoading(false);
            }
        };

        initialize();

        // Real-time subscription
        if (enableRealtime) {
            const unsubscribe = subscribeToItineraryChanges(tripId, (payload) => {
                if (!mounted) return;

                if (payload.eventType === 'INSERT') {
                    setItems(prev => {
                        if (prev.some(i => i.id === payload.new.id)) return prev;
                        return sortItineraryItems([...prev, payload.new]);
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setItems(prev => sortItineraryItems(
                        prev.map(i => i.id === payload.new.id ? payload.new : i)
                    ));
                } else if (payload.eventType === 'DELETE') {
                    setItems(prev => prev.filter(i => i.id !== payload.old.id));
                }
            });

            return () => {
                mounted = false;
                unsubscribe();
            };
        }

        return () => { mounted = false; };
    }, [tripId, enableRealtime]);

    // =========================================================================
    // CRUD OPERATIONS
    // =========================================================================

    const createItem = useCallback(async (input: ItineraryItemInput): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can create itinerary items';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await createItineraryItem(input);
        if (result.error) {
            setError(result.error);
            onError?.(result.error);
            return false;
        }

        if (result.data) {
            setItems(prev => {
                if (prev.some(i => i.id === result.data!.id)) return prev;
                return sortItineraryItems([...prev, result.data!]);
            });
        }
        return true;
    }, [isAdmin, onError]);

    const updateItem = useCallback(async (
        itemId: string,
        updates: Partial<ItineraryItemInput>,
        optimistic = true
    ): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can update itinerary items';
            setError(err);
            onError?.(err);
            return false;
        }

        const currentItem = items.find(i => i.id === itemId);
        if (!currentItem) {
            setError('Item not found');
            return false;
        }

        // Optimistic update
        if (optimistic) {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i));
        }

        const result = await updateItineraryItem(itemId, updates, currentItem.updated_at);

        if (result.error) {
            if (optimistic) {
                setItems(prev => prev.map(i => i.id === itemId ? currentItem : i));
            }
            if (result.conflictDetected) onConflict?.(currentItem);
            setError(result.error);
            onError?.(result.error);
            return false;
        }

        if (result.data) {
            setItems(prev => prev.map(i => i.id === itemId ? result.data! : i));
        }
        return true;
    }, [isAdmin, items, onError, onConflict]);

    const deleteItem = useCallback(async (itemId: string, optimistic = true): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can delete itinerary items';
            setError(err);
            onError?.(err);
            return false;
        }

        const currentItem = items.find(i => i.id === itemId);
        if (!currentItem) {
            setError('Item not found');
            return false;
        }

        if (optimistic) {
            setItems(prev => prev.filter(i => i.id !== itemId));
        }

        const result = await deleteItineraryItem(itemId);

        if (!result.success) {
            if (optimistic) {
                setItems(prev => sortItineraryItems([...prev, currentItem]));
            }
            setError(result.error || 'Delete failed');
            onError?.(result.error || 'Delete failed');
            return false;
        }
        return true;
    }, [isAdmin, items, onError]);

    const reorderItems = useCallback(async (
        reorderData: Array<{ id: string; sort_order: number }>
    ): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can reorder itinerary items';
            setError(err);
            onError?.(err);
            return false;
        }

        const previousItems = [...items];
        const reorderMap = new Map(reorderData.map(item => [item.id, item.sort_order]));

        setItems(prev => sortItineraryItems(
            prev.map(i => ({ ...i, sort_order: reorderMap.get(i.id!) ?? i.sort_order ?? 0 }))
        ));

        const result = await reorderItineraryItems(reorderData, tripId);

        if (!result.success) {
            setItems(previousItems);
            setError(result.error || 'Reorder failed');
            onError?.(result.error || 'Reorder failed');
            return false;
        }

        if (result.data) setItems(result.data);
        return true;
    }, [isAdmin, items, tripId, onError]);

    const batchUpdate = useCallback(async (batch: BatchUpdateInput): Promise<boolean> => {
        if (!isAdmin) {
            const err = 'Only admins can batch update itinerary items';
            setError(err);
            onError?.(err);
            return false;
        }

        const result = await updateItineraryItemsBatch(batch);

        if (!result.success) {
            setError(result.error || 'Batch update failed');
            onError?.(result.error || 'Batch update failed');
            return false;
        }

        if (result.data) setItems(result.data);
        return true;
    }, [isAdmin, onError]);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await getItineraryForTrip(tripId);
        if (result.error) {
            setError(result.error);
            onError?.(result.error);
        } else {
            setItems(result.data || []);
        }
        setLoading(false);
    }, [tripId, onError]);

    const getItemById = useCallback((itemId: string) => items.find(i => i.id === itemId), [items]);

    return {
        items,
        loading,
        error,
        isAdmin,
        checkingPermissions,
        createItem,
        updateItem,
        deleteItem,
        reorderItems,
        batchUpdate,
        refresh,
        getItemById,
    };
}
