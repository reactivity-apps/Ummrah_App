import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service";
import { AuthProvider, useAuth } from "../lib/context/AuthContext";
import { TripProvider, useTrip } from "../lib/context/TripContext";
import * as Linking from 'expo-linking';
import { supabase } from "../lib/supabase";

function AppContent() {
    const router = useRouter();
    const { isAuthenticated, userName, userEmail, loading: authLoading } = useAuth();
    
    // Handle deep links for password reset
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const url = event.url;
            console.log('[DeepLink] Received:', url);
            
            // Check if this is a password reset link
            if (url.includes('access_token') && url.includes('type=recovery')) {
                console.log('[DeepLink] Password reset link detected');
                
                // Extract the hash portion
                const hashIndex = url.indexOf('#');
                if (hashIndex !== -1) {
                    const hash = url.substring(hashIndex + 1);
                    const params = new URLSearchParams(hash);
                    
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');
                    const type = params.get('type');
                    
                    if (accessToken && type === 'recovery') {
                        console.log('[DeepLink] Setting session from recovery link');
                        
                        // Set the session using the tokens
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });
                        
                        if (error) {
                            console.error('[DeepLink] Error setting session:', error);
                        } else {
                            console.log('[DeepLink] Session set, navigating to reset password');
                            // Navigate to reset password screen
                            router.replace('/auth/reset-password');
                        }
                    }
                }
            }
        };

        // Get the initial URL (app opened from link)
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        // Listen for deep links while app is open
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);
    
    // Only show loading during initial auth check (app startup)
    // Trip loading happens in background and doesn't block UI
    if (authLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-sand-50">
                <ActivityIndicator size="large" color="#4A6741" />
                <Text className="mt-4 text-foreground font-medium">Initializing...</Text>
            </View>
        );
    }

    return (
        <>
            {isAuthenticated && (
                <View className="bg-green-100 border-b border-green-300 px-4 py-2">
                    <Text className="text-xs text-green-800 text-center">
                        🟢 Logged in: {userName} ({userEmail})
                    </Text>
                </View>
            )}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="itinerary" />
                <Stack.Screen name="announcements" />
                <Stack.Screen name="prayers" />
                <Stack.Screen name="guide/[id]" />
                <Stack.Screen name="map/[id]" />
                <Stack.Screen name="settings" />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}

export default function RootLayout() {
    useEffect(() => {
        // Initialize push notifications
        async function initPushNotifications() {
            try {
                await configureNotifications();
                await requestPushNotificationPermissions();
            } catch (err) {
                console.error("Push notification setup failed:", err);
            }
        }
        initPushNotifications();
    }, []);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <TripProvider>
                    <AppContent />
                </TripProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
