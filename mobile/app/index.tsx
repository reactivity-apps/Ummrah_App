import { useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        // Wait for auth to finish loading before redirecting
        if (loading) return;

        if (isAuthenticated) {
            router.replace('/(tabs)');
        } else {
            router.replace('/join-trip');
        }
    }, [isAuthenticated, loading]);

    // Show loading while checking auth status
    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4A6741" />
                <Text style={{ marginTop: 12 }}>Checking authentication…</Text>
            </View>
        </SafeAreaView>
    );
}