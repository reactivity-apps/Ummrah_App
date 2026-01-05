import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';

interface UseTripJoinCodeReturn {
    joinCode: string | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTripJoinCode(tripId: string | undefined): UseTripJoinCodeReturn {
    const [joinCode, setJoinCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJoinCode = async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: joinCodeData, error: codeError } = await supabase
                .from('trip_join_codes')
                .select('code')
                .eq('trip_id', tripId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (codeError) {
                setError(codeError.message);
            } else if (joinCodeData) {
                setJoinCode(joinCodeData.code);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJoinCode();
    }, [tripId]);

    return {
        joinCode,
        loading,
        error,
        refetch: fetchJoinCode,
    };
}
