import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { User, ChevronLeft } from 'lucide-react-native';

type Props = {
  name: string;
  setName: (s: string) => void;
  handleJoinGroup: () => Promise<void>;
  isNameValid: boolean;
  goToStep: (n: number) => void;
  groupCodeText: string;
};

export default function NameStep({ name, setName, handleJoinGroup, isNameValid, goToStep, groupCodeText }: Props) {
  return (
    <>
      <TouchableOpacity onPress={() => goToStep(3)} className="flex-row items-center mb-4">
        <ChevronLeft size={24} color="hsl(140 40% 45%)" />
        <Text className="text-primary font-medium ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-12 mt-4">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <User size={40} color="hsl(140 40% 45%)" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Your Details</Text>
        <Text className="text-muted-foreground text-center">Tell us about yourself</Text>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-3"><Text className="text-primary font-semibold">Group: {groupCodeText}</Text></View>
      </View>

      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
          <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
            <User size={20} color="hsl(40 5% 55%)" />
            <TextInput placeholder="Ahmed Hassan" placeholderTextColor="hsl(40 5% 55%)" value={name} onChangeText={setName} className="ml-3 flex-1 text-foreground" autoCapitalize="words" autoFocus />
          </View>
        </View>

        <TouchableOpacity onPress={handleJoinGroup} disabled={!isNameValid} className={`rounded-xl p-4 items-center mt-6 ${isNameValid ? 'bg-primary' : 'bg-sand-200'}`}>
          <Text className={`font-bold text-base ${isNameValid ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
