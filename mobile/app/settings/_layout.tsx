import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack 
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#4A6741',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="personal-info"
                options={{ title: "Personal Information" }}
            />
            <Stack.Screen
                name="emergency-contact"
                options={{ title: "Emergency Contact" }}
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
                name="change-password"
                options={{ title: "Change Password" }}
            />
            <Stack.Screen
                name="delete-account"
                options={{ title: "Delete Account" }}
            />
            <Stack.Screen
                name="group-details"
                options={{ title: "Group Details" }}
            />
            <Stack.Screen
                name="app-settings"
                options={{ title: "App Settings" }}
            />
            <Stack.Screen
                name="terms"
                options={{ title: "Terms of Service" }}
            />
        </Stack>
    );
}
