import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, AlertCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginVerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(60); // Start with 60 second cooldown
  const timerStarted = useRef(false);

  // Start cooldown only once when component mounts
  useEffect(() => {
    if (timerStarted.current) return;
    
    timerStarted.current = true;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!email || resending || cooldown > 0) return;
    
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Error resending verification email', error);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 3000);
        
        // Start 60 second cooldown
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (e) {
      console.error('Resend exception', e);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <View className="flex-1 items-center justify-center">
          <View className="h-24 w-24 rounded-full bg-green-50 items-center justify-center mb-6 border-2 border-green-200">
            <Mail size={48} color="#059669" />
          </View>
          
          <Text className="text-2xl font-bold text-foreground mb-3 text-center">
            Please verify your email
          </Text>
          
          <Text className="text-center text-muted-foreground mb-2">
            We sent a verification link to
          </Text>
          
          <Text className="text-center text-green-700 font-semibold mb-6">
            {email ?? 'your email'}
          </Text>
          
          <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#059669" style={{ marginTop: 2, marginRight: 8 }} />
              <View className="flex-1">
                <Text className="text-sm text-green-900 font-semibold mb-1">
                  Email not verified
                </Text>
                <Text className="text-xs text-green-800">
                  You need to verify your email before you can log in. Check your inbox and click the verification link.
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-center text-sm text-muted-foreground mb-8">
            Click the link in the email to verify your account. Once verified, return to the login screen.
          </Text>

          <View className="w-full px-6">
            <TouchableOpacity 
              onPress={handleResendEmail}
              disabled={resending || resent || cooldown > 0}
              className={`w-full py-4 rounded-xl items-center mb-3 ${
                resent ? 'bg-green-50 border-2 border-green-500' : 
                cooldown > 0 ? 'bg-gray-100 border-2 border-gray-300' :
                'bg-primary'
              }`}
            >
              <Text className={`font-semibold text-base ${
                resent ? 'text-green-700' : 
                cooldown > 0 ? 'text-gray-500' :
                'text-primary-foreground'
              }`}>
                {resending ? 'Sending...' : 
                 resent ? '✓ Email Sent!' : 
                 cooldown > 0 ? `Resend in ${cooldown}s` :
                 'Resend Verification Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/login')}
              className="w-full py-4 rounded-xl items-center bg-sand-100 border border-sand-200 mb-3"
            >
              <Text className="font-semibold text-base text-foreground">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 mx-6">
            <Text className="text-center text-sm text-blue-700 mb-2">
              <Text className="font-semibold">Still having trouble?</Text>
            </Text>
            <Text className="text-center text-xs text-blue-600 mb-2">
              Check your spam folder or try resending the verification email.
            </Text>
            <Text className="text-center text-xs text-blue-600">
              If you continue to experience issues, contact support at:{'\n'}
              <Text className="font-semibold">support@ummrahapp.com</Text>
            </Text>
          </View>

          <Text className="text-center text-xs text-muted-foreground mt-6 px-6">
            Make sure to check all email folders including spam and promotions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
