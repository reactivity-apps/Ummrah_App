import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Mail, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

type Props = {
  email?: string;
  setStep: (n: number) => void;
};

export default function EmailOtpStep({ email, setStep }: Props) {
  const router = useRouter();
  const [otpChars, setOtpChars] = useState<string[]>(Array(6).fill(''));
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(60);
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

  const handleOtpChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '');
    const newChars = [...otpChars];
    if (digits.length === 0) {
      newChars[index] = '';
      setOtpChars(newChars);
      return;
    }
    for (let i = 0; i < digits.length && index + i < newChars.length; i++) {
      newChars[index + i] = digits[i];
    }
    setOtpChars(newChars);

    const nextIndex = newChars.findIndex((c, i) => i > index && !c);
    const target = nextIndex === -1 ? Math.min(index + digits.length, newChars.length - 1) : nextIndex;
    if (target <= newChars.length - 1) {
      otpInputRefs.current[target]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newChars = [...otpChars];
      if (newChars[index]) {
        newChars[index] = '';
        setOtpChars(newChars);
      } else if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        const prev = [...otpChars];
        prev[index - 1] = '';
        setOtpChars(prev);
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const otpCode = otpChars.join('').trim();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    if (!email) {
      setError('Email address is missing.');
      return;
    }

    try {
      setLoading(true);
      
      // Verify email OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: 'email',
      });

      if (verifyError) {
        console.error('OTP verify error', verifyError);
        setError('Invalid verification code. Please try again.');
        return;
      }

      if (data.session) {
        // Successfully verified and logged in
        // Wait for TripContext to initialize with the new session
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.replace('/(tabs)');
      } else {
        setError('Verification succeeded but no session was created. Please try logging in.');
      }
    } catch (e: any) {
      console.error('Verify OTP exception', e);
      setError(e?.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resending || cooldown > 0) return;
    
    setError(null);
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Error resending verification code', error);
        setError('Unable to resend code. Please try again.');
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
      setError('An error occurred while resending.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setStep(3)} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="#4A6741" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-8 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Mail size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Check your email</Text>
        <Text className="text-muted-foreground text-center mb-2">
          We sent a 6-digit verification code to
        </Text>
        <Text className="text-center text-foreground font-semibold mb-3">
          {email ?? 'your email'}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          Enter the code below to verify your account
        </Text>
      </View>

      {loading && (
        <View className="mb-6 items-center">
          <ActivityIndicator size="small" color="#4A6741" />
        </View>
      )}

      {error && (
        <View className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2 text-center">Verification Code</Text>
          <View className="flex-row items-center justify-center gap-3">
            {otpChars.map((ch, idx) => (
              <View 
                key={idx} 
                className="w-10 h-14 bg-card rounded-lg border-2 items-center justify-center" 
                style={{ borderColor: ch ? '#4A6741' : 'hsl(40 15% 85%)' }}
              >
                <TextInput 
                  ref={(ref) => { otpInputRefs.current[idx] = ref; }} 
                  value={ch} 
                  onChangeText={(t) => handleOtpChange(t, idx)} 
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)} 
                  className="w-full h-full text-center text-foreground font-bold text-xl" 
                  maxLength={1} 
                  keyboardType="numeric" 
                  selectTextOnFocus 
                />
              </View>
            ))}
          </View>
        </View>

        <View className="items-center">
          <TouchableOpacity 
            onPress={handleVerifyOtp} 
            disabled={otpChars.join('').trim().length < 6 || loading} 
            className={`w-full rounded-xl p-4 items-center ${
              otpChars.join('').trim().length >= 6 && !loading ? 'bg-primary' : 'bg-sand-200'
            }`}
          >
            <Text className={`font-bold text-base ${
              otpChars.join('').trim().length >= 6 && !loading ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleResendOtp} 
            disabled={resending || resent || cooldown > 0}
            className={`rounded-xl p-3 mt-3 ${
              resent ? 'bg-green-50' : cooldown === 0 ? 'bg-card' : 'bg-sand-50'
            }`}
          >
            <Text className={`text-sm ${
              resent ? 'text-green-700' : cooldown > 0 ? 'text-muted-foreground' : 'text-primary'
            }`}>
              {resending ? 'Sending...' : 
               resent ? '✓ Code Sent!' : 
               cooldown > 0 ? `Resend in ${cooldown}s` : 
               'Resend Code'}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-xs text-muted-foreground mt-4">
            Didn't receive the code? Check your spam folder
          </Text>
        </View>
      </View>
    </>
  );
}
