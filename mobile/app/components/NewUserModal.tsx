import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function NewUserModal() {
  const { message, email } = useLocalSearchParams<{ message?: string; email?: string }>();
  const router = useRouter();

  const visible = message === 'new-user';

  const handleClose = () => {
    // Navigate to the tabs root which clears the query param
    router.replace('/(tabs)');
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-lg bg-card rounded-2xl p-6">
          <View className="items-center">
            <View className="h-20 w-20 rounded-full bg-green-50 items-center justify-center mb-4">
              <Check size={56} color="#047857" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">Welcome</Text>
            <Text className="text-center text-muted-foreground mb-4">
              Your account has been created. We sent a confirmation link to {email ?? 'your email'}.
              Please check your inbox and verify your email to complete account setup.
            </Text>
          </View>

          <View className="mt-3">
            <TouchableOpacity onPress={handleClose} className="bg-primary rounded-xl px-5 py-3 mb-3 items-center">
              <Text className="text-primary-foreground font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
