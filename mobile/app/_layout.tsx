import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getStackScreenOptions } from "../lib/navigationConfig";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service";
import { TripProvider } from "../lib/context/TripContext";

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
            <TripProvider>
                <Stack screenOptions={getStackScreenOptions}>
                    <Stack.Screen name="join-trip" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />

                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    <Stack.Screen name="itinerary" options={{ headerShown: false }} />
                    <Stack.Screen name="announcements" options={{ headerShown: false }} />
                    <Stack.Screen name="prayers" options={{ headerShown: false }} />
                    <Stack.Screen name="guide/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="map/[id]" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
            </TripProvider>
        </SafeAreaProvider>
    );
}
