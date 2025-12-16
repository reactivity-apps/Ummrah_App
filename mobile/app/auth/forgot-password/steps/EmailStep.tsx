import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  setStep: (n: number) => void;
  setEmail: (e: string) => void;
  email: string;
};

export default function EmailStep({ setStep, setEmail, email }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = (e: string) => emailRegex.test(e.trim());

  const handleSendOtp = async () => {
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
      console.log('[ForgotPassword] Sending OTP to:', trimmedEmail);

      // Use resetPasswordForEmail to send OTP code
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

      if (resetError) {
        console.error('[ForgotPassword] Reset error:', resetError);
        setError(resetError.message || 'Unable to send verification code. Please try again.');
        return;
      }

      console.log('[ForgotPassword] OTP sent successfully');
      setEmail(trimmedEmail);
      setStep(2); // Move to OTP verification step
    } catch (e) {
      console.error('Exception during password reset', e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View className="items-center mb-12">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Mail size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Reset password</Text>
        <Text className="text-muted-foreground text-center">
          Enter your email and we'll send you a verification code
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
          onPress={handleSendOtp}
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
            {loading ? 'Sending...' : 'Send verification code'}
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
    </>
  );
}
