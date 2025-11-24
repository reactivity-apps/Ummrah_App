import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Phone, ArrowRight, ChevronLeft } from 'lucide-react-native';

type Props = {
  areaCode: string;
  setAreaCode: (s: string) => void;
  phoneNumber: string;
  setPhoneNumber: (s: string) => void;
  handleVerifyPhoneStep: () => Promise<void>;
  isPhoneValid: boolean;
  loading: boolean;
  errorMessage: string | null;
  handleBack: () => void;
  groupCodeText: string;
};

export default function PhoneStep({ areaCode, setAreaCode, phoneNumber, setPhoneNumber, handleVerifyPhoneStep, isPhoneValid, loading, errorMessage, handleBack, groupCodeText }: Props) {
  return (
    <>
      {/* Back Button */}
      <TouchableOpacity onPress={handleBack} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="#4A6741" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View className="items-center mb-12 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Phone size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Verify Phone</Text>
        <Text className="text-muted-foreground text-center">We'll use this to create your account</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>

      {/* Form */}
      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Phone Number</Text>
          <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
            <Phone size={20} color="hsl(40 5% 55%)" />
            <View className="flex-row items-center ml-3 flex-1">
              <View className="flex-row items-center mr-3">
                <Text className="text-foreground text-lg">+</Text>
                <TextInput placeholder="1" placeholderTextColor="hsl(40 5% 55%)" value={areaCode} onChangeText={setAreaCode} className="w-16 text-foreground ml-1" keyboardType="phone-pad" maxLength={4} />
              </View>
              <TextInput placeholder="5551234567" placeholderTextColor="hsl(40 5% 55%)" value={phoneNumber} onChangeText={setPhoneNumber} className="flex-1 text-foreground" keyboardType="phone-pad" autoFocus />
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleVerifyPhoneStep} disabled={!isPhoneValid} className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${isPhoneValid ? 'bg-primary' : 'bg-sand-200'}`}>
          <Text className={`font-bold text-base mr-2 ${isPhoneValid ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Verify Phone</Text>
          <ArrowRight size={20} color={isPhoneValid ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"} />
        </TouchableOpacity>

        {loading && (<View className="mt-4 items-center"><ActivityIndicator size="small" color="#4A6741" /></View>)}

        {errorMessage && (<View className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3"><Text className="text-sm text-red-700">{errorMessage}</Text></View>)}
      </View>
    </>
  );
}
