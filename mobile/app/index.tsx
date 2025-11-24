import { Redirect } from "expo-router";

export default function Index() {
    // TODO: Check if user is authenticated (check Supabase session)
    const isAuthenticated = false; // Will connect to Supabase later

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/join-trip" />;
}
