import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestPushNotificationPermissions, configureNotifications } from "../lib/api/services/pushNotification.service";
import { TripProvider } from "../lib/context/TripContext";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
    const [userInfo, setUserInfo] = useState<{ email?: string; name?: string } | null>(null);

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

        // Check for current user
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try to get user's name from user_metadata or profiles table
                const name = user.user_metadata?.name || user.user_metadata?.full_name;
                setUserInfo({ 
                    email: user.email, 
                    name: name 
                });
            } else {
                setUserInfo(null);
            }
        }
        checkUser();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const name = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
                setUserInfo({ 
                    email: session.user.email, 
                    name: name 
                });
            } else {
                setUserInfo(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <TripProvider>
                {userInfo && (
                    <View className="bg-green-100 border-b border-green-300 px-4 py-2">
                        <Text className="text-xs text-green-800 text-center">
                            🟢 Logged in: {userInfo.name ? `${userInfo.name} (${userInfo.email})` : userInfo.email}
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
                    <Stack.Screen name="settings/personal-info" />
                    <Stack.Screen name="settings/emergency-contact" />
                    <Stack.Screen name="settings/trip-history" />
                    <Stack.Screen name="settings/notifications" />
                    <Stack.Screen name="settings/privacy-security" />
                    <Stack.Screen name="settings/group-details" />
                    <Stack.Screen name="settings/app-settings" />
                    <Stack.Screen name="auth" />
                </Stack>
                <StatusBar style="auto" />
            </TripProvider>
        </SafeAreaProvider>
    );
}
