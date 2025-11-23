import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
    // Temporary check if supabase connection works
  const [status, setStatus] = useState<"ok" | "bad" | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from("faqs").select("id");
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
