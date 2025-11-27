import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useRouter, Link } from 'expo-router';
import { contentContainerConfig } from '../lib/navigationConfig';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = (e: string) => emailRegex.test(e.trim());
  const isPasswordValid = (p: string) => p.length >= 8;

  const handleLogin = async () => {
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
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (signInError) {
        console.error('Login error', signInError);
        
        // Provide user-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(signInError.message || 'Unable to sign in. Please try again.');
        }
        return;
      }

      if (!data.user) {
        setError('Unable to sign in. Please try again.');
        return;
      }

      // Success - navigate to main tabs
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Exception during login', e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <View className="flex-1 bg">
          {/* <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4">
            <ChevronLeft size={24} color="#4A6741" />
            <Text className="text-primary font-medium ml-1">Back</Text>
          </TouchableOpacity> */}

          <View className="items-center mb-12">
              <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                <Lock size={40} color="#4A6741" />
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">Welcome back</Text>
              <Text className="text-muted-foreground text-center">Sign in to your account</Text>
            </View>

            <View className="space-y-4">
              <View className="mb-4">
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

              <View className="mb-6">
                <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
                <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                  <Lock size={20} color="hsl(40 5% 55%)" />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="hsl(40 5% 55%)"
                    value={password}
                    onChangeText={setPassword}
                    className="ml-3 flex-1 text-foreground"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {error && (
                <View className="mb-1 bg-red-50 border border-red-200 rounded-xl p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={!(isEmailValid(email) && isPasswordValid(password)) || loading}
                className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                  (isEmailValid(email) && password.length > 0) ? 'bg-primary' : 'bg-sand-200'
                }`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : null}
                <Text
                  className={`font-bold text-base mr-2 ${
                    (isEmailValid(email) && password.length > 0) ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Text>
                {!loading && (
                  <ArrowRight
                    size={20}
                    color={(isEmailValid(email) && password.length > 0) ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"}
                  />
                )}
              </TouchableOpacity>

              {/* Forgot password link - optional */}
              <TouchableOpacity className="items-center mt-4">
                <Text className="text-sm text-primary font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <View className="items-center mt-6">
              <Text className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/join-trip" className="text-primary font-medium">
                  Join a trip
                </Link>
              </Text>
            </View>

            {/* Footer */}
            <View className="mt-5">
              <Text className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{'\n'}
                <Text className="text-primary">Terms of Service</Text> and{' '}
                <Text className="text-primary">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
