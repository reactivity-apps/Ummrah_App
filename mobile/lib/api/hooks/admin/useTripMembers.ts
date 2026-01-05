import { useState, useEffect } from 'react';
import { getTripMembers } from '../../services/trip.service';
import { supabase } from '../../../supabase';

interface Member {
    id: string;
    user_id: string;
    name: string;
    isGroupAdmin: boolean;
    joined_at: string;
}

interface UseTripMembersReturn {
    members: Member[];
    memberCount: number;
    adminCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTripMembers(tripId: string | undefined): UseTripMembersReturn {
    const [members, setMembers] = useState<Member[]>([]);
    const [memberCount, setMemberCount] = useState(0);
    const [adminCount, setAdminCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get trip members (regular users)
            const result = await getTripMembers(tripId);
            if (result.success && result.members) {
                setMembers(result.members);
                setMemberCount(result.members.length);
            } else {
                setError(result.error || 'Failed to load members');
            }

            // Get group admins (users in group_memberships)
            const { data: trip } = await supabase
                .from('trips')
                .select('group_id')
                .eq('id', tripId)
                .single();

            if (trip?.group_id) {
                const { data: groupMemberships, error: adminError } = await supabase
                    .from('group_memberships')
                    .select('id')
                    .eq('group_id', trip.group_id);

                if (!adminError && groupMemberships) {
                    setAdminCount(groupMemberships.length);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [tripId]);

    return {
        members,
        memberCount,
        adminCount,
        loading,
        error,
        refetch: fetchMembers,
    };
}
