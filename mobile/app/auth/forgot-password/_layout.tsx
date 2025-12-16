import { Stack } from 'expo-router';

export default function ForgotPasswordlayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="steps" />
    </Stack>
  );
}
