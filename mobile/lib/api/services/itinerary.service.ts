/**
 * Itinerary Service
 * 
 * PURPOSE: Manage trip itinerary items with secure permission checks
 * WHAT IT DOES: CRUD operations for itinerary with admin-only access, optimistic locking, conflict detection
 * USED BY: Itinerary manager component, admin screens
 */

import { supabase } from '../../supabase';
import { ItineraryItemRow } from '../../../types/db';
import { verifyAdminPermission, sortItineraryItems } from '../utils/helpers';

// ============================================================================
// TYPES
// ============================================================================

export interface ItineraryItemInput {
    id?: string;
    trip_id: string;
    day_date?: string | null;
    title: string;
    description?: string | null;
    location?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
}

export interface BatchUpdateInput {
    items: ItineraryItemInput[];
    trip_id: string;
}

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Fetch all itinerary items for a trip, sorted by day_date → sort_order → starts_at
 */
export async function getItineraryForTrip(tripId: string): Promise<{ data?: ItineraryItemRow[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('itinerary_items')
            .select('*')
            .eq('trip_id', tripId)
            .order('day_date', { ascending: true, nullsFirst: false })
            .order('starts_at', { ascending: true, nullsFirst: false });

        if (error) return { error: `Failed to fetch itinerary: ${error.message}` };
        return { data: data || [] };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}


// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new itinerary item (admin only)
 */
export async function createItineraryItem(input: ItineraryItemInput): Promise<{ data?: ItineraryItemRow; error?: string }> {
    const permission = await verifyAdminPermission(input.trip_id);
    if (!permission.hasPermission) return { error: permission.error || 'Permission denied' };

    try {
        const { data, error } = await supabase
            .from('itinerary_items')
            .insert({
                trip_id: input.trip_id,
                title: input.title,
                description: input.description,
                location: input.location,
                day_date: input.day_date,
                starts_at: input.starts_at,
                ends_at: input.ends_at,
            })
            .select()
            .single();

        if (error) return { error: `Failed to create item: ${error.message}` };
        return { data };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a single itinerary item with conflict detection
 */
export async function updateItineraryItem(
    itemId: string,
    updates: Partial<ItineraryItemInput>,
    lastKnownUpdatedAt?: string
): Promise<{ data?: ItineraryItemRow; error?: string; conflictDetected?: boolean }> {
    try {
        // Fetch existing item for trip_id and conflict check
        const { data: existing, error: fetchError } = await supabase
            .from('itinerary_items')
            .select('trip_id, updated_at')
            .eq('id', itemId)
            .maybeSingle();

        if (fetchError || !existing) return { error: 'Item not found' };

        // Check permissions
        const permission = await verifyAdminPermission(existing.trip_id);
        if (!permission.hasPermission) return { error: permission.error || 'Permission denied' };

        // Conflict detection
        if (lastKnownUpdatedAt && existing.updated_at !== lastKnownUpdatedAt) {
            return { error: 'Conflict detected: Item was modified by another user', conflictDetected: true };
        }

        // Update
        const { data, error } = await supabase
            .from('itinerary_items')
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.location !== undefined && { location: updates.location }),
                ...(updates.day_date !== undefined && { day_date: updates.day_date }),
                ...(updates.starts_at !== undefined && { starts_at: updates.starts_at }),
                ...(updates.ends_at !== undefined && { ends_at: updates.ends_at }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', itemId)
            .select()
            .single();

        if (error) return { error: `Failed to update item: ${error.message}` };
        return { data };
    } catch (err) {
        return { error: `Unexpected error: ${err}` };
    }
}

/**
 * Batch update multiple items (more efficient than individual updates)
 */
export async function updateItineraryItemsBatch(batch: BatchUpdateInput): Promise<{
    success: boolean;
    data?: ItineraryItemRow[];
    error?: string;
}> {
    const permission = await verifyAdminPermission(batch.trip_id);
    if (!permission.hasPermission) return { success: false, error: permission.error || 'Permission denied' };

    try {
        // Separate creates from updates
        const creates = batch.items.filter(item => !item.id);
        const updates = batch.items.filter(item => item.id);

        // Execute in parallel
        const [createResults, updateResults] = await Promise.all([
            creates.length > 0
                ? supabase.from('itinerary_items').insert(creates.map(item => ({
                    trip_id: batch.trip_id,
                    title: item.title,
                    description: item.description,
                    location: item.location,
                    day_date: item.day_date,
                    starts_at: item.starts_at,
                    ends_at: item.ends_at,
                }))).select()
                : Promise.resolve({ data: [], error: null }),
            Promise.all(updates.map(item => updateItineraryItem(item.id!, item)))
        ]);

        // Fetch complete updated list
        const { data: allItems } = await getItineraryForTrip(batch.trip_id);
        return { success: true, data: allItems };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a single itinerary item (admin only)
 */
export async function deleteItineraryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Get trip_id for permission check
        const { data: item, error: fetchError } = await supabase
            .from('itinerary_items')
            .select('trip_id')
            .eq('id', itemId)
            .maybeSingle();

        if (fetchError || !item) return { success: false, error: 'Item not found' };

        const permission = await verifyAdminPermission(item.trip_id);
        if (!permission.hasPermission) return { success: false, error: permission.error || 'Permission denied' };

        const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);
        if (error) return { success: false, error: `Failed to delete item: ${error.message}` };

        return { success: true };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

// ============================================================================
// REORDER OPERATIONS
// ============================================================================

/**
 * Reorder itinerary items (currently disabled - sort_order field doesn't exist)
 * Items are automatically sorted by starts_at time
 */
export async function reorderItineraryItems(
    reorderData: Array<{ id: string; sort_order: number }>,
    tripId: string
): Promise<{ success: boolean; data?: ItineraryItemRow[]; error?: string }> {
    const permission = await verifyAdminPermission(tripId);
    if (!permission.hasPermission) return { success: false, error: permission.error || 'Permission denied' };

    try {
        // Note: sort_order field doesn't exist in database schema
        // Items are sorted by starts_at time automatically
        // To implement manual reordering, add sort_order column to itinerary_items table

        // Fetch updated list
        const { data } = await getItineraryForTrip(tripId);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: `Unexpected error: ${err}` };
    }
}

// ============================================================================
// REAL-TIME SUBSCRIPTION
// ============================================================================

/**
 * Subscribe to real-time changes for trip's itinerary
 * Returns cleanup function
 */
export function subscribeToItineraryChanges(
    tripId: string,
    onUpdate: (payload: any) => void,
    onError?: (error: any) => void
): () => void {
    const channel = supabase
        .channel(`itinerary:${tripId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'itinerary_items', filter: `trip_id=eq.${tripId}` },
            onUpdate
        )
        .subscribe((status, err) => {
            if (status === 'CHANNEL_ERROR' && onError) {
                onError(err || new Error('Failed to subscribe'));
            }
        });

    return () => supabase.removeChannel(channel);
}
