import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Phone, ChevronLeft } from 'lucide-react-native';

type Props = {
  otpChars: string[];
  otpInputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (text: string, index: number) => void;
  handleOtpKeyPress: (e: any, index: number) => void;
  handleVerifyOtp: () => Promise<void>;
  handleResendOtp: () => Promise<void>;
  resendTimer: number;
  loading: boolean;
  errorMessage: string | null;
  goToStep: (n: number) => void;
  groupCodeText: string;
  phoneDisplay: string;
};

export default function OtpStep({ otpChars, otpInputRefs, handleOtpChange, handleOtpKeyPress, handleVerifyOtp, handleResendOtp, resendTimer, loading, errorMessage, goToStep, groupCodeText, phoneDisplay }: Props) {
  return (
    <>
      <TouchableOpacity onPress={() => goToStep(2)} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="hsl(140 40% 45%)" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-10 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Phone size={40} color="hsl(140 40% 45%)" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Enter Verification Code</Text>
        <Text className="text-muted-foreground text-center">Enter the code we sent via SMS to {phoneDisplay}</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>


    {loading && (<View className="mb-6 items-center"><ActivityIndicator size="small" color="hsl(140 40% 45%)" /></View>)}

    {errorMessage && (<View className="mb-6 d bg-red-50 border border-red-200 rounded-xl p-3"><Text className="text-sm text-red-700">{errorMessage}</Text></View>)}

      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2 text-center">Verification Code</Text>
          <View className="flex-row items-center justify-center gap-3">
            {otpChars.map((ch, idx) => (
              <View key={idx} className="w-10 h-14 bg-card rounded-lg border-2 items-center justify-center" style={{ borderColor: ch ? 'hsl(140 40% 45%)' : 'hsl(40 15% 85%)' }}>
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
