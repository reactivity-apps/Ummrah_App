import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get token_hash and type from URL params
      const { token_hash, type } = params;

      if (token_hash && type) {
        // Verify the email using the token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: type as any,
        });

        if (verifyError) {
          console.error('Error verifying email', verifyError);
          router.replace('/login?error=verification_failed');
          return;
        }

        if (data.session) {
          // Successfully verified and logged in
          router.replace('/(tabs)');
          return;
        } else if (data.user && data.user.email_confirmed_at) {
          // Email verified but no active session - redirect to login with success message
          router.replace('/login?verified=success');
          return;
        }
      }

      // Fallback: Check if we already have a session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session after verification', error);
        router.replace('/login?error=verification_failed');
        return;
      }

      if (session) {
        // User is verified and logged in, redirect to tabs
        router.replace('/(tabs)');
      } else {
        // No session - check if email was at least verified
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          // Email verified, redirect to login
          router.replace('/login?verified=success');
        } else {
          // Verification failed, redirect to login with error
          router.replace('/login?error=verification_failed');
        }
      }
    } catch (error) {
      console.error('Callback error', error);
      router.replace('/join-trip');
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#4A6741" />
      <Text className="text-foreground mt-4">Verifying your email...</Text>
    </View>
  );
}
