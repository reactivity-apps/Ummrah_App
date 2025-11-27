import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getStackScreenOptions } from "../lib/navigationConfig";
export default function RootLayout() {

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