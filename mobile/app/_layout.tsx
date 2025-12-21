import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service";
import { AuthProvider, useAuth } from "../lib/context/AuthContext";
import { TripProvider, useTrip } from "../lib/context/TripContext";
import { PrayerLocationProvider } from "../lib/context/PrayerLocationContext";

function AppContent() {
    const { loading: authLoading } = useAuth();
    
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
            <Stack
                screenOptions={{
                    headerShown: false,
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    headerTintColor: '#4A6741',
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="itinerary" options={{ headerShown: false }} />
                <Stack.Screen name="itinerary-builder" options={{ headerShown: false }} />
                <Stack.Screen name="announcements" options={{ headerShown: false }} />
                <Stack.Screen name="prayers" options={{ headerShown: false }} />
                <Stack.Screen name="duas" options={{ headerShown: false }} />
                <Stack.Screen name="umrah-guide" options={{ headerShown: false }} />
                <Stack.Screen name="umrah-guide/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="guide/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="map/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}

export default function RootLayout() {
    useEffect(() => {
        // Initialize notification configuration only (don't request permissions yet)
        async function initNotifications() {
            try {
                await configureNotifications();
                console.log("Notification handler configured");
            } catch (err) {
                console.error("Notification configuration failed:", err);
            }
        }
        initNotifications();
    }, []);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <TripProvider>
                    <PrayerLocationProvider>
                        <AppContent />
                    </PrayerLocationProvider>
                </TripProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
