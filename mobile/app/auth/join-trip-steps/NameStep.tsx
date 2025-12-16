import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, ChevronLeft } from 'lucide-react-native';

type Props = {
  name: string;
  setName: (s: string) => void;
  // no longer finalizes join here; parent will handle finalization at the next step
  setStep: (n: number) => void;
  groupCodeText: string;
};

export default function NameStep({ name, setName, setStep, groupCodeText }: Props) {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isNameValid = name.trim() !== '';

  return (
    <>
      <TouchableOpacity onPress={() => setStep(1)} className="flex-row items-center">
        <ChevronLeft size={24} color="#000" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-5">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <User size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Your Details</Text>
        <Text className="text-muted-foreground text-center">Tell us about yourself</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>

      {/* Local loading & error shown between header and form */}
      {localLoading && (<View className="mb-4 items-center"><ActivityIndicator size="small" color="#4A6741" /></View>)}
      {localError && (<View className="mb-4 w-full"><View className="bg-red-50 border border-red-200 rounded-xl p-3 w-full"><Text className="text-sm text-red-700">{localError}</Text></View></View>)}

      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
          <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
            <User size={20} color="hsl(40 5% 55%)" />
            <TextInput placeholder="Ahmed Hassan" placeholderTextColor="hsl(40 5% 55%)" value={name} onChangeText={setName} className="ml-3 flex-1 text-foreground" autoCapitalize="words" />
          </View>
        </View>

        <TouchableOpacity onPress={() => setStep(3)} disabled={!isNameValid || localLoading} className={`rounded-xl p-4 items-center mt-6 ${isNameValid ? 'bg-primary' : 'bg-sand-200'}`}>
          <Text className={`font-bold text-base ${isNameValid ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
