import { createClient } from '../supabase/server';
import { ProfileRow } from '@/types/db';

export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

export async function getUserProfile(userId: string): Promise<ProfileRow | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as ProfileRow;
}

export async function isAdmin(userId: string): Promise<boolean> {
    const profile = await getUserProfile(userId);

    if (!profile) {
        return false;
    }

    // Check if user has super_admin role
    if (profile.auth_role === 'super_admin') {
        return true;
    }

    // Check if user is a group admin (has group_memberships)
    const supabase = await createClient();
    const { data: groupMemberships } = await supabase
        .from('group_memberships')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

    return (groupMemberships?.length ?? 0) > 0;
}

export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        return { authorized: false, user: null, profile: null };
    }

    const profile = await getUserProfile(user.id);
    const adminCheck = await isAdmin(user.id);

    if (!adminCheck) {
        return { authorized: false, user, profile };
    }

    return { authorized: true, user, profile };
}
