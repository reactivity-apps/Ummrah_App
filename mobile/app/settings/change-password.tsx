import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Eye, EyeOff, Save } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/context/AuthContext";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { user, updateUserProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword.trim()) {
            Alert.alert('Error', 'Current password is required');
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert('Error', 'New password is required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        if (newPassword === currentPassword) {
            Alert.alert('Error', 'New password must be different from current password');
            return;
        }

        try {
            setSaving(true);

            // Get current user email
            if (!user || !user.email) {
                Alert.alert('Error', 'Unable to get user information');
                return;
            }

            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                Alert.alert('Incorrect Password', 'Your current password is incorrect. Please try again.');
                setCurrentPassword('');
                return;
            }

            // Update password using AuthContext wrapper
            // This prevents unwanted reloads and redirects
            const { error: updateError } = await updateUserProfile({
                password: newPassword
            });

            if (updateError) {
                console.error('Error updating password:', updateError);
                Alert.alert('Error', updateError.message || 'Failed to update password');
                return;
            }

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            Alert.alert(
                'Success', 
                'Your password has been updated successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                    {/* Header */}
                    <View className="px-5 py-4 border-b border-sand-200">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-row items-center mb-4"
                        >
                            <ArrowLeft size={24} color="#4A6741" />
                            <Text className="text-primary font-medium ml-2">Back</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-foreground">Change Password</Text>
                        <Text className="text-muted-foreground mt-1">Update your account password</Text>
                    </View>

                    {/* Form */}
                    <View className="px-5 mt-6">
                        <Text className="text-sm text-muted-foreground mb-6">
                            For your security, please enter your current password before setting a new one.
                        </Text>

                        {/* Current Password */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">Current Password *</Text>
                            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                                <Lock size={20} color="hsl(40 5% 55%)" />
                                <TextInput
                                    placeholder="Enter current password"
                                    placeholderTextColor="hsl(40 5% 55%)"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    className="ml-3 flex-1 text-foreground"
                                    secureTextEntry={!showCurrentPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? (
                                        <EyeOff size={20} color="hsl(40 5% 55%)" />
                                    ) : (
                                        <Eye size={20} color="hsl(40 5% 55%)" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">New Password *</Text>
                            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                                <Lock size={20} color="hsl(40 5% 55%)" />
                                <TextInput
                                    placeholder="Enter new password"
                                    placeholderTextColor="hsl(40 5% 55%)"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    className="ml-3 flex-1 text-foreground"
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? (
                                        <EyeOff size={20} color="hsl(40 5% 55%)" />
                                    ) : (
                                        <Eye size={20} color="hsl(40 5% 55%)" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-muted-foreground mt-2 ml-1">
                                Password must be at least 6 characters long
                            </Text>
                        </View>

                        {/* Confirm Password */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-foreground mb-2">Confirm New Password *</Text>
                            <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                                <Lock size={20} color="hsl(40 5% 55%)" />
                                <TextInput
                                    placeholder="Confirm new password"
                                    placeholderTextColor="hsl(40 5% 55%)"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    className="ml-3 flex-1 text-foreground"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color="hsl(40 5% 55%)" />
                                    ) : (
                                        <Eye size={20} color="hsl(40 5% 55%)" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleChangePassword}
                            disabled={saving}
                            className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                                saving ? 'bg-sand-200' : 'bg-primary'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text className="text-muted-foreground font-bold text-base ml-2">
                                        Updating...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Save size={20} color="white" />
                                    <Text className="text-primary-foreground font-bold text-base ml-2">
                                        Update Password
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
