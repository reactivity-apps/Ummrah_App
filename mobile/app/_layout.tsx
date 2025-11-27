import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getStackScreenOptions } from "../lib/navigationConfig";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service.js";

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
            <Stack screenOptions={getStackScreenOptions}>
                <Stack.Screen name="join-trip" />
                <Stack.Screen name="login" />

                <Stack.Screen name="(tabs)" />

                <Stack.Screen name="itinerary" />
                <Stack.Screen name="prayers" />
                <Stack.Screen name="guide/[id]" />
                <Stack.Screen name="map/[id]" />
            </Stack>
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}
