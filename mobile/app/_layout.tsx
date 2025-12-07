import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service";
import { AuthProvider, useAuth } from "../lib/context/AuthContext";
import { TripProvider, useTrip } from "../lib/context/TripContext";

function AppContent() {
    const { isAuthenticated, userName, userEmail, loading: authLoading } = useAuth();
    
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
                <Stack.Screen name="join-trip" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="itinerary" />
                <Stack.Screen name="announcements" />
                <Stack.Screen name="prayers" />
                <Stack.Screen name="guide/[id]" />
                <Stack.Screen name="map/[id]" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="auth" />
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
