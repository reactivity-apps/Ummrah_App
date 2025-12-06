import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Mail } from 'lucide-react-native';
import { Link } from 'expo-router';
import { supabase } from '../../../lib/supabase';

type Props = {
  email?: string;
};

export default function AccountCreatedStep({ email }: Props) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(60); // Start with 60 second cooldown
  const timerStarted = useRef(false); // Track if timer has already started

  // Start cooldown only once when component mounts
  useEffect(() => {
    if (timerStarted.current) return; // Don't start timer again if already started
    
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
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-24 w-24 rounded-full bg-green-50 items-center justify-center mb-6">
        <Mail size={48} color="#047857" />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-3">Check your email</Text>
      <Text className="text-center text-muted-foreground mb-2">
        We sent a verification link to
      </Text>
      <Text className="text-center text-foreground font-semibold mb-6">
        {email ?? 'your email'}
      </Text>
      <Text className="text-center text-sm text-muted-foreground mb-8">
        Click the link in the email to verify your account and complete your trip registration. Once verified, you'll be automatically added to your trip.
      </Text>

      <TouchableOpacity 
        onPress={handleResendEmail}
        disabled={resending || resent || cooldown > 0}
        className={`w-full py-4 rounded-lg items-center mb-3 ${
          resent ? 'bg-green-50 border-2 border-green-500' : 
          cooldown > 0 ? 'bg-gray-100 border-2 border-gray-300' :
          'bg-sand-100 border-2 border-sand-200'
        }`}
      >
        <Text className={`font-semibold text-base ${
          resent ? 'text-green-700' : 
          cooldown > 0 ? 'text-gray-500' :
          'text-foreground'
        }`}>
          {resending ? 'Sending...' : 
           resent ? '✓ Email Sent!' : 
           cooldown > 0 ? `Resend in ${cooldown}s` :
           'Resend Verification Email'}
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-xs text-muted-foreground mt-4">
        Didn't receive the email? Check your spam folder or try resending.
      </Text>
    </View>
  );
}
