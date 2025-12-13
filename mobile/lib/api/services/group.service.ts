/**
 * Group Management Service
 * 
 * Handles group-related operations
 */

import { supabase } from '../../supabase';
import { GroupRow } from '../../../types/db';
import { getCachedUser } from '../utils/authCache';

/**
 * Get or create a default group for the current user
 * This ensures every user has at least one group to create trips under
 */
export async function getOrCreateDefaultGroup(): Promise<{ success: boolean; group?: GroupRow; error?: string }> {
    try {
        const user = await getCachedUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user has any groups they created
        const { data: existingGroups, error: fetchError } = await supabase
            .from('groups')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: true });

        if (fetchError) {
            console.error('Error fetching groups:', fetchError);
            return { success: false, error: fetchError.message };
        }

        // If user has at least one group, return the first one
        if (existingGroups && existingGroups.length > 0) {
            return { success: true, group: existingGroups[0] };
        }

        // Create a default group for this user
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', user.id)
            .single();

        const groupName = profile?.name ? `${profile.name}'s Group` : 'My Group';

        const { data: newGroup, error: createError } = await supabase
            .from('groups')
            .insert({
                name: groupName,
                created_by: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating default group:', createError);
            return { success: false, error: createError.message };
        }

        return { success: true, group: newGroup };
    } catch (err) {
        console.error('Error in getOrCreateDefaultGroup:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}
