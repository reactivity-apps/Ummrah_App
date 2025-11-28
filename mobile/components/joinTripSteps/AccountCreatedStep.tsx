import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Link } from 'expo-router';

type Props = {
  email?: string;
};

export default function AccountCreatedStep({ email }: Props) {

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="h-24 w-24 rounded-full bg-green-50 items-center justify-center mb-6">
        <Check size={48} color="#047857" />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-3">Account created</Text>
      <Text className="text-center text-muted-foreground mb-6">We sent a confirmation link to {email ?? 'your email'}. Please check your inbox and verify your email to complete account setup. NO CONFIRMATION IN PLACE YET</Text>

      <Link href="/(tabs)" asChild>
        <TouchableOpacity className="w-full bg-primary py-4 rounded-lg items-center mt-4">
          <Text className="text-white font-semibold text-base">Continue to App</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
