import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/context/AuthContext';

/**
 * Reset Password Screen - Fallback/Legacy
 * 
 * This screen is now primarily a fallback for old magic link flows.
 * The main password reset flow is now handled through the OTP-based forgot-password screen.
 * This redirects users to the proper forgot-password flow.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAndRedirect();
  }, [session]);

  const checkAndRedirect = async () => {
    // If user came here via an old magic link, redirect to forgot-password
    console.log('[ResetPassword] Redirecting to OTP-based forgot password flow');
    setTimeout(() => {
      router.replace('/auth/forgot-password');
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <ActivityIndicator size="large" color="#4A6741" />
          <Text className="text-muted-foreground mt-4 text-center">
            Redirecting to password reset...
          </Text>
        </View>

        <View className="bg-sand-50 border border-sand-200 rounded-xl p-4 mb-6">
          <Text className="text-sm text-muted-foreground text-center">
            We're now using a more secure verification code system
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/auth/forgot-password')}
          className="bg-primary rounded-xl p-4 items-center flex-row justify-center"
        >
          <Text className="text-primary-foreground font-bold text-base mr-2">
            Continue to Reset Password
          </Text>
          <ArrowRight size={20} color="hsl(140 80% 95%)" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
