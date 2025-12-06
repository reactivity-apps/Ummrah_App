import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsLayout() {
    const router = useRouter();

    return (
        // <Stack
        //     screenOptions={{
        //         headerShown: true,
        //         headerStyle: {
        //             backgroundColor: "#fff",
        //         },
        //         headerTintColor: "#000",
        //         headerTitleStyle: {
        //             fontWeight: "600",
        //         },
        //         headerLeft: () => (
        //             <TouchableOpacity
        //                 onPress={() => router.back()}
        //                 className="ml-2"
        //             >
        //                 <Ionicons name="arrow-back" size={24} color="#000" />
        //             </TouchableOpacity>
        //         ),
        //     }}
        // >
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="personal-info"
                options={{ title: "Personal Information" }}
            />
            <Stack.Screen
                name="emergency-contact"
                options={{ title: "Emergency Contact" }}
            />
            <Stack.Screen
                name="trip-history"
                options={{ title: "Trip History" }}
            />
            <Stack.Screen
                name="notifications"
                options={{ title: "Notifications" }}
            />
            <Stack.Screen
                name="privacy-security"
                options={{ title: "Privacy & Security" }}
            />
            <Stack.Screen
                name="group-details"
                options={{ title: "Group Details" }}
            />
            <Stack.Screen
                name="app-settings"
                options={{ title: "App Settings" }}
            />
        </Stack>
    );
}
