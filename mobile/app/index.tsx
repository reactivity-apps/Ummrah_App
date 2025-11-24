import { useEffect, useState } from 'react';
import { SafeAreaView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Index() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Check current session once on mount
        const checkSession = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const session = data?.session ?? null;
                if (!mounted) return;

                if (session?.user) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/join-trip');
                }
            } catch (err) {
                console.warn('[auth] session check failed', err);
                if (mounted) router.replace('/join-trip');
            } finally {
                if (mounted) setChecking(false);
            }
        };

        checkSession();

        // Subscribe to auth state changes so this route reacts to login/logout while visible
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                router.replace('/(tabs)');
            } else {
                // if user signed out, ensure they land on join screen
                router.replace('/join-trip');
            }
        });

        return () => {
            mounted = false;
            try {
                // cleanup subscription
                (listener as any)?.subscription?.unsubscribe?.();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // Show a minimal loading view while we check auth status to avoid flashing routes
    if (checking) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 12 }}>Checking authentication…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // While the redirect happens in effect, render nothing (router.replace will change route)
    return null;
}
