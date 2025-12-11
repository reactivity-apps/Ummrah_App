import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { contentContainerConfig } from '../../lib/navigationConfig';
import { getRedirectUrl } from '../../lib/utils';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot Password Screen
 * 
 * Sends password reset email to any valid email address.
 * Note: We don't check if the account is active here for security reasons.
 * Inactive accounts will be blocked at login even after resetting their password.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEmailValid = (e: string) => emailRegex.test(e.trim());

  const handleResetPassword = async () => {
    setError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isEmailValid(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      console.log('[ForgotPassword] Sending reset email to:', trimmedEmail);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getRedirectUrl('auth/reset-password'),
      });

      if (resetError) {
        console.error('[ForgotPassword] Reset error:', resetError);
        setError(resetError.message || 'Unable to send reset email. Please try again.');
        return;
      }

      console.log('[ForgotPassword] Reset email sent successfully');
      setSuccess(true);
    } catch (e) {
      console.error('Exception during password reset', e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
              <Mail size={40} color="#4A6741" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">Check your email</Text>
            <Text className="text-muted-foreground text-center">
              We've sent password reset instructions to {email}
            </Text>
          </View>

          <View className="bg-sand-50 border border-sand-200 rounded-xl p-4 mb-6">
            <Text className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or try again with a different email address.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-xl p-4 items-center flex-row justify-center"
          >
            <Text className="text-primary-foreground font-bold text-base mr-2">
              Back to Login
            </Text>
            <ArrowRight size={20} color="hsl(140 80% 95%)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="items-center mt-4"
          >
            <Text className="text-sm text-primary font-medium">Try different email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={contentContainerConfig}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1">
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-8">
              <ArrowLeft size={24} color="#4A6741" />
              <Text className="text-primary font-medium ml-1">Back</Text>
            </TouchableOpacity>

            <View className="items-center mb-12">
              <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                <Mail size={40} color="#4A6741" />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">Reset password</Text>
              <Text className="text-muted-foreground text-center">
                Enter your email and we'll send you instructions to reset your password
              </Text>
            </View>

            <View className="space-y-4">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 w-full mb-4">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              <View className="mb-6">
                <Text className="text-sm font-medium text-foreground mb-2">Email Address</Text>
                <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                  <Mail size={20} color="hsl(40 5% 55%)" />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={email}
                    onChangeText={setEmail}
                    className="ml-3 flex-1 text-foreground"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={!isEmailValid(email) || loading}
                className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                  isEmailValid(email) ? 'bg-primary' : 'bg-sand-200'
                }`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : null}
                <Text
                  className={`font-bold text-base mr-2 ${
                    isEmailValid(email) ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Text>
                {!loading && (
                  <ArrowRight
                    size={20}
                    color={isEmailValid(email) ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <Text className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Text onPress={() => router.back()} className="text-primary font-medium">
                  Sign in
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
