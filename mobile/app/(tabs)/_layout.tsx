import { Tabs, useRouter } from "expo-router";
import { View, Text } from "react-native";
import RadialMenu from "../../components/RadialMenu";
import { useAuth } from "../../lib/context/AuthContext";

export default function TabLayout() {
    const { isAuthenticated, loading } = useAuth();

    // Don't render tabs until auth check is complete
    if (loading) {
        return null;
    }

    // Show not authenticated message instead of redirecting
    if (!isAuthenticated) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-foreground text-lg">Not Authenticated</Text>
            </View>
        );
    }

    return (
        <>
            {/* 
                Tab Navigator with minimal, fast transitions
                - Hidden tab bar (using RadialMenu instead)
                - Smooth transitions between tabs
                - Performance optimized with detached screens
            */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                    // Fast fade animation for tab switches
                    animation: 'fade',
                }}
            >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="resources" />
                <Tabs.Screen name="duas" />
                <Tabs.Screen name="guide" />
                <Tabs.Screen name="map" />
                <Tabs.Screen name="profile" />
                <Tabs.Screen name="murshid" />
                <Tabs.Screen name="admin" />
            </Tabs>

            <RadialMenu />
        </>
    );
}