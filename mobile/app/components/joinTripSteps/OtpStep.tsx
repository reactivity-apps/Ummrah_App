import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Phone, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

type Props = {
  setStep: (n: number) => void;
  groupCodeText: string;
  phoneDisplay: string;
};

export default function OtpStep({ setStep, groupCodeText, phoneDisplay }: Props) {
  const [otpChars, setOtpChars] = useState<string[]>(Array(6).fill(''));
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const resendInterval = useRef<number | null>(null);

  const startResendCountdown = (seconds: number) => {
    if (resendInterval.current) {
      clearInterval(resendInterval.current);
    }
    setResendTimer(seconds);
    resendInterval.current = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          if (resendInterval.current) {
            clearInterval(resendInterval.current);
            resendInterval.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;
  };

  useEffect(() => {
    // when this component mounts it's because an OTP was just sent — start cooldown
    startResendCountdown(60);
    return () => {
      if (resendInterval.current) {
        clearInterval(resendInterval.current);
        resendInterval.current = null;
      }
    };
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
    setLocalError(null);
    const otpCode = otpChars.join('').trim();
    if (!otpCode) {
      setLocalError('Please enter the verification code.');
      return;
    }

    try {
      setLoadingLocal(true);
      const { data, error } = await supabase.auth.verifyOtp({ phone: phoneDisplay, token: otpCode, type: 'sms' });
      if (error) {
        console.error('OTP verify error', error);
        setLocalError('Invalid verification code.');
        return;
      }

      const { data: userResult } = await supabase.auth.getUser();
      if (!userResult?.user) {
        console.error('No authenticated user after verifyOtp');
        setLocalError('Verification succeeded but we could not establish your account locally. Please close and try signing in again.');
        return;
      }

  // advance to name step
  setStep(4);
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    if (resendTimer > 0) return;
    try {
      setLoadingLocal(true);
      const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneDisplay });
      if (error) {
        console.error('Resend OTP error', error);
        setLocalError('Unable to resend code. Please try again later.');
        return;
      }
      startResendCountdown(60);
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setStep(2)} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="#4A6741" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-10 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Phone size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Enter Verification Code</Text>
        <Text className="text-muted-foreground text-center">Enter the code we sent via SMS to {phoneDisplay}</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>


      {loadingLocal && (<View className="mb-6 items-center"><ActivityIndicator size="small" color="#4A6741" /></View>)}

      {localError && (<View className="mb-6 d bg-red-50 border border-red-200 rounded-xl p-3"><Text className="text-sm text-red-700">{localError}</Text></View>)}

      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2 text-center">Verification Code</Text>
          <View className="flex-row items-center justify-center gap-3">
            {otpChars.map((ch, idx) => (
              <View key={idx} className="w-10 h-14 bg-card rounded-lg border-2 items-center justify-center" style={{ borderColor: ch ? '#4A6741' : 'hsl(40 15% 85%)' }}>
                <TextInput ref={(ref) => { otpInputRefs.current[idx] = ref; }} value={ch} onChangeText={(t) => handleOtpChange(t, idx)} onKeyPress={(e) => handleOtpKeyPress(e, idx)} className="w-full h-full text-center text-foreground font-bold text-xl" maxLength={1} keyboardType="numeric" autoFocus={idx === 0} selectTextOnFocus />
              </View>
            ))}
          </View>
        </View>

        {/* Centered actions: verify button and resend button stacked and centered */}
        <View className="items-center">
          <TouchableOpacity onPress={handleVerifyOtp} disabled={otpChars.join('').trim().length < 6} className={`rounded-xl p-4 items-center ${otpChars.join('').trim().length >= 6 ? 'bg-primary' : 'bg-sand-200'}`}>
            <Text className={`font-bold text-base ${otpChars.join('').trim().length >= 6 ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Verify Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0} className={`rounded-xl p-3 mt-3 ${resendTimer === 0 ? 'bg-card' : 'bg-sand-50'}`}>
            <Text className="text-sm text-primary">{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
