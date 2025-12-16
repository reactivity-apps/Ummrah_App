import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentContainerConfig } from '../../../lib/navigationConfig';
import EmailStep from './steps/EmailStep';
import VerifyOtpStep from './steps/VerifyOtpStep';
import ResetPasswordStep from './steps/ResetPasswordStep';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Forgot Password Screen - OTP Flow
 * 
 * Step 1: Enter email
 * Step 2: Verify OTP code sent to email
 * Step 3: Set new password
 */
export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
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
              
            
            {step === 1 ? (
              <EmailStep setStep={setStep} setEmail={setEmail} email={email} />
            ) : step === 2 ? (
              <VerifyOtpStep email={email} setStep={setStep} />
            ) : (
              <ResetPasswordStep email={email} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
