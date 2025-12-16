import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="join-trip" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="login-verify-email" />
      <Stack.Screen name="verify-email-callback" />
      <Stack.Screen name="join-trip-steps" />
    </Stack>
  );
}
