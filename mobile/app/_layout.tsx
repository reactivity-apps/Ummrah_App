import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="itinerary" options={{ headerShown: false }} />
                <Stack.Screen name="guide/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="map/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}
