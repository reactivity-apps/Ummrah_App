import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { getStackScreenOptions, getModalScreenOptions } from "../lib/navigationConfig";

export default function RootLayout() {
    // Temporary check if supabase connection works
    const [status, setStatus] = useState<"ok" | "bad" | null>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                const { data, error } = await supabase.from("profiles").select("user_id");
                if (error) throw error;
                setStatus("ok");
            } catch (err) {
                console.error("Supabase connection failed:", err);
                setStatus("bad");
            }
        }
        testConnection();
    }, []);

    return (
        <SafeAreaProvider>
            <View style={styles.bannerWrapper}>
                {status && (
                    <View style={[styles.banner, status === "ok" ? styles.ok : styles.bad]}>
                        <Text style={styles.bannerText}>
                            {status === "ok" ? "Connected to Supabase" : "Connection Failed"}
                        </Text>
                    </View>
                )}
            </View>
            {/* 
                Stack Navigator with calm, spiritual transitions
                - 220ms duration for smooth but not sluggish feel
                - Platform-native animations (iOS slide, Android fade)
                - GPU-accelerated for 60 FPS performance
            */}
            <Stack screenOptions={getStackScreenOptions()}>
                {/* Modal presentation for join trip flow */}
                <Stack.Screen
                    name="join-trip"
                    options={getModalScreenOptions()}
                />

                {/* Main tab navigation with default transitions */}
                <Stack.Screen name="(tabs)" />

                {/* Detail screens with smooth slide transitions */}
                <Stack.Screen name="itinerary" />
                <Stack.Screen name="prayers" />
                <Stack.Screen name="guide/[id]" />
                <Stack.Screen name="map/[id]" />
            </Stack>
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );


}

const styles = StyleSheet.create({
    bannerWrapper: {
        position: "absolute",
        top: 8,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
    },
    banner: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 2,
    },
    bannerText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    ok: {
        backgroundColor: "#16a34a", // green
    },
    bad: {
        backgroundColor: "#dc2626", // red
    },
});
