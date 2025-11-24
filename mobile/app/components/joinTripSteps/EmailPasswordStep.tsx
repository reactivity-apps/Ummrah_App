import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, ArrowRight, ChevronLeft, Check } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

type Props = {
  // optional parent storage of the email; if provided, we'll call it on success
  onEmailEntered?: (email: string) => void;
  // advance navigation
  setStep: (n: number) => void;
  // call parent's join handler to finalize signup/membership
  handleSignUp?: (setError: (m: string | null) => void, setLoading: (b: boolean) => void, creds?: { email?: string; password?: string }) => Promise<void>;
  groupCodeText?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailPasswordStep({ onEmailEntered, setStep, handleSignUp, groupCodeText }: Props) {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const isPasswordValid = (p: string) => p.length >= 8;

  const isEmailValid = (e: string) => {
    return emailRegex.test(e.trim());
  };

  const handleContinue = async () => {
    setLocalError(null);
    const candidate = (email || '').trim();
    if (!candidate) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!isEmailValid(candidate)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid(password)) {
      setLocalError('Please enter a password of at least 8 characters.');
      return;
    }

    try {
      setLocalLoading(true);

      // Check existing profile by email
      const { data: existing, error: existingErr } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', candidate)
        .maybeSingle();

      if (existingErr) {
        console.warn('Error checking existing email', existingErr);
      } else if (existing) {
        setLocalError('An account already exists for this email. Please sign in instead.');
        return;
      }

      // Optionally notify parent
      if (onEmailEntered) onEmailEntered(candidate);

      // If parent provided handleSignUp, call it here to finalize signup and join
      if (handleSignUp) {
        await handleSignUp(setLocalError, setLocalLoading, { email: candidate, password });
        return;
      }

      // Otherwise advance to next step
      setStep(3);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setStep(1)} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="#4A6741" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-12 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Mail size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Enter your email and a password</Text>
        <Text className="text-muted-foreground text-center">We'll use this to create your account</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>

      <View className="space-y-4">
        <View className="mb-1">
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
              autoFocus
            />
          </View>
        </View>

        <View className="mb-6 space-y-2">
          <View className="flex-row items-center">
            <View className={`rounded-full p-1 mr-2 ${isEmailValid(email) ? 'bg-green-50' : 'bg-transparent'}`}>
              <Check size={14} color={isEmailValid(email) ? '#047857' : '#9CA3AF'} />
            </View>
            <Text className={`${isEmailValid(email) ? 'text-green-700' : 'text-muted-foreground'} text-sm`}>Valid email format (e.g. you@example.com)</Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
          <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
            {/* simple lock placeholder using Mail icon due to existing imports */}
            <Mail size={20} color="hsl(40 5% 55%)" />
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
        </View>

        {/* Rules / hints */}
        <View className="mb-6 mt-2 space-y-2">
          <View className="flex-row items-center">
            <View className={`rounded-full p-1 mr-2 ${isPasswordValid(password) ? 'bg-green-50' : 'bg-transparent'}`}>
              <Check size={14} color={isPasswordValid(password) ? '#047857' : '#9CA3AF'} />
            </View>
            <Text className={`${isPasswordValid(password) ? 'text-green-700' : 'text-muted-foreground'} text-sm`}>Password at least 8 characters</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleContinue} disabled={!(isEmailValid(email) && isPasswordValid(password)) || localLoading} className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${(isEmailValid(email) && isPasswordValid(password)) ? 'bg-primary' : 'bg-sand-200'}`}>
          {localLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : null}
          <Text className={`font-bold text-base mr-2 ${(isEmailValid(email) && isPasswordValid(password)) ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{localLoading ? 'Please wait' : 'Create your account'}</Text>
          {!localLoading && <ArrowRight size={20} color={(isEmailValid(email) && isPasswordValid(password)) ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"} />}
        </TouchableOpacity>

        {localError && (<View className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3"><Text className="text-sm text-red-700">{localError}</Text></View>)}
      </View>
    </>
  );
}
