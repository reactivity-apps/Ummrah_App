import { Tabs } from "expo-router";
import { View, Text } from "react-native";
// import RadialMenu from "../../components/RadialMenu";
import { useAuth } from "../../lib/context/AuthContext";
import { useTrip } from "../../lib/context/TripContext";
import { Home, BookOpen, Calendar, User, Shield, MessageCircle } from "lucide-react-native";

export default function TabLayout() {
    const { isAuthenticated, loading } = useAuth();
    const { isGroupAdmin } = useTrip();

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
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#4A6741',
                    tabBarInactiveTintColor: '#9CA3AF',
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopColor: '#E5E7EB',
                        height: 85,
                        paddingBottom: 30,
                        paddingTop: 5,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="itinerary"
                    options={{
                        title: 'Itinerary',
                        tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                    }}
                />
                 <Tabs.Screen
                    name="resources"
                    options={{
                        title: 'Resources',
                        tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="murshid"
                    options={{
                        title: 'Murshid',
                        tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: 'Admin',
                        tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
                        href: isGroupAdmin ? '/admin' : null, // Only show if user is group admin
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        href: null, // Hide from tabs
                    }}
                />
            </Tabs>

            {/* <RadialMenu /> */}
        </>
    );
}