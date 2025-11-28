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
                    <Stack.Screen name="settings/personal-info" />
                    <Stack.Screen name="settings/emergency-contact" />
                    <Stack.Screen name="settings/trip-history" />
                    <Stack.Screen name="settings/notifications" />
                    <Stack.Screen name="settings/privacy-security" />
                </Stack>
                <StatusBar style="auto" />
            </TripProvider>
        </SafeAreaProvider>
    );
}
