import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import RadialMenu from "../../components/RadialMenu";
import { useAuth } from "../../lib/context/AuthContext";

export default function TabLayout() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        // Redirect to join-trip if not authenticated
        if (!loading && !isAuthenticated) {
            router.replace('/join-trip');
        }
    }, [isAuthenticated, loading]);

    // Don't render tabs until auth check is complete
    if (loading) {
        return null;
    }

    // Don't render if not authenticated (redirect is in progress)
    if (!isAuthenticated) {
        return null;
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