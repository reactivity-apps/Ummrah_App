import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { contentContainerConfig } from '../../lib/navigationConfig';
import { useAuth } from '../../lib/context/AuthContext';

/**
 * Reset Password Screen
 * 
 * Allows users to set a new password after clicking the reset link in their email.
 * This screen is accessed via the magic link with an access token.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession();
  }, [session]);

  const checkSession = async () => {
    if (!session) {
      console.error('[ResetPassword] No session found - invalid or expired link');
      setError('This password reset link is invalid or has expired. Please request a new one.');
      setChecking(false);
      return;
    }

    console.log('[ResetPassword] Valid session found, ready to reset password');
    setChecking(false);
  };

  const isPasswordValid = (p: string) => p.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid(password) && passwordsMatch;

  const handleResetPassword = async () => {
    setError(null);

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      console.log('[ResetPassword] Updating password');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('[ResetPassword] Update error:', updateError);
        setError(updateError.message || 'Unable to reset password. Please try again.');
        return;
      }

      console.log('[ResetPassword] Password updated successfully');
      setSuccess(true);

      // Sign out after 2 seconds and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace('/auth/login');
      }, 2000);
    } catch (e) {
      console.error('Exception during password reset', e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A6741" />
          <Text className="text-muted-foreground mt-4">Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="h-20 w-20 bg-green-100 rounded-full items-center justify-center mb-4 border-2 border-green-200">
              <CheckCircle size={40} color="#22C55E" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">Password reset!</Text>
            <Text className="text-muted-foreground text-center">
              Your password has been successfully updated.
            </Text>
          </View>

          <View className="bg-sand-50 border border-sand-200 rounded-xl p-4 mb-6">
            <Text className="text-sm text-muted-foreground text-center">
              Redirecting you to login...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error && checking === false && !password) {
    // Invalid/expired link
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="h-20 w-20 bg-red-50 rounded-full items-center justify-center mb-4 border-2 border-red-200">
              <Lock size={40} color="#EF4444" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">Link expired</Text>
            <Text className="text-muted-foreground text-center">
              This password reset link is invalid or has expired.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/auth/forgot-password')}
            className="bg-primary rounded-xl p-4 items-center flex-row justify-center"
          >
            <Text className="text-primary-foreground font-bold text-base mr-2">
              Request new link
            </Text>
            <ArrowRight size={20} color="hsl(140 80% 95%)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/auth/login')}
            className="items-center mt-4"
          >
            <Text className="text-sm text-primary font-medium">Back to login</Text>
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
            <View className="items-center mb-12">
              <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                <Lock size={40} color="#4A6741" />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">Set new password</Text>
              <Text className="text-muted-foreground text-center">
                Enter your new password below
              </Text>
            </View>

            <View className="space-y-4">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 w-full mb-4">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">New Password</Text>
                <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                  <Lock size={20} color="hsl(40 5% 55%)" />
                  <TextInput
                    placeholder="At least 8 characters"
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={password}
                    onChangeText={setPassword}
                    className="ml-3 flex-1 text-foreground"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {password && !isPasswordValid(password) && (
                  <Text className="text-xs text-red-600 mt-1">Password must be at least 8 characters</Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-foreground mb-2">Confirm Password</Text>
                <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                  <Lock size={20} color="hsl(40 5% 55%)" />
                  <TextInput
                    placeholder="Re-enter your password"
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="ml-3 flex-1 text-foreground"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {confirmPassword && !passwordsMatch && (
                  <Text className="text-xs text-red-600 mt-1">Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={!isFormValid || loading}
                className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                  isFormValid ? 'bg-primary' : 'bg-sand-200'
                }`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : null}
                <Text
                  className={`font-bold text-base mr-2 ${
                    isFormValid ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </Text>
                {!loading && (
                  <ArrowRight
                    size={20}
                    color={isFormValid ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
