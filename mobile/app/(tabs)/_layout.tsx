import { Tabs } from "expo-router";
import { View } from "react-native";
import RadialMenu from "../../components/RadialMenu";

export default function TabLayout() {
    return (
        <View style={{ flex: 1 }}>
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
        </View>
    );
}