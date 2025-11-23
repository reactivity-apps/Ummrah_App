import { Tabs } from "expo-router";
import { Home, BookOpen, Map, User, ScrollText, Settings } from "lucide-react-native";
import { View } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "hsl(40 20% 98%)", // background
                    borderTopWidth: 1,
                    borderTopColor: "hsl(40 10% 90%)", // border
                },
                tabBarActiveTintColor: "hsl(140 40% 45%)", // primary
                tabBarInactiveTintColor: "hsl(40 5% 15%)", // foreground (muted)
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="duas"
                options={{
                    title: "Duas",
                    tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="guide"
                options={{
                    title: "Guide",
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: "Map",
                    tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="admin"
                options={{
                    title: "Admin",
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}