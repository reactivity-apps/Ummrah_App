import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Mail, Phone, Save, CheckCircle, XCircle, Send, Lock, Eye, EyeOff } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

export default function PersonalInfoScreen() {
    const router = useRouter();
    // TODO: Allow editing of verified emails with proper confirmation flow
    const ALLOW_VERIFIED_EMAIL_EDIT = false;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.replace('/login');
                return;
            }

            // Check email verification status
            setEmailVerified(user.email_confirmed_at !== null);

            // Load data from auth user
            setName(user.user_metadata?.full_name || '');
            setEmail(user.email || '');
            setPhone(user.user_metadata?.phone || '');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.trim() && !emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Password validation
        if (newPassword || confirmPassword) {
            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'New passwords do not match');
                return;
            }
            if (newPassword.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters long');
                return;
            }
        }

        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            const updates: any = {
                data: {
                    full_name: name.trim(),
                    phone: phone.trim() || null,
                }
            };

            // Update email if changed
            if (email.trim() && email.trim() !== user.email) {
                updates.email = email.trim();
            }

            // Update password if provided
            if (newPassword) {
                updates.password = newPassword;
            }

            const { error: authError } = await supabase.auth.updateUser(updates);

            if (authError) {
                console.error('Error updating auth user:', authError);
                Alert.alert('Error', authError.message || 'Failed to update user information');
                return;
            }

            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            let successMessage = 'Profile updated successfully';
            if (email.trim() !== user.email) {
                successMessage += '\n\nA confirmation email has been sent to your new email address. Please verify it to complete the change.';
            }

            Alert.alert('Success', successMessage);
            
            // Reload profile to get updated data
            await loadProfile();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleSendVerification = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address first');
            return;
        }

        try {
            setSendingVerification(true);
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email.trim(),
            });

            if (error) {
                console.error('Error sending verification:', error);
                Alert.alert('Error', error.message || 'Failed to send verification email');
            } else {
                Alert.alert(
                    'Verification Email Sent', 
                    'Please check your email inbox and spam folder for the verification link.'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSendingVerification(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#4A6741" />
            </SafeAreaView>
        );
    }

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
                    <Text className="text-2xl font-bold text-foreground">Personal Information</Text>
                    <Text className="text-muted-foreground mt-1">Update your profile details</Text>
                </View>

                {/* Form */}
                <View className="px-5 mt-6">
                    {/* Name */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Full Name *</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <User size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="Enter your full name"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={name}
                                onChangeText={setName}
                                className="ml-3 flex-1 text-foreground"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-sm font-medium text-foreground">Email Address</Text>
                            {emailVerified ? (
                                <View className="flex-row items-center">
                                    <CheckCircle size={16} color="#10B981" />
                                    <Text className="text-xs text-green-600 ml-1 font-medium">Verified</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center">
                                    <XCircle size={16} color="#EF4444" />
                                    <Text className="text-xs text-red-600 ml-1 font-medium">Not Verified</Text>
                                </View>
                            )}
                        </View>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <Mail size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="your.email@example.com"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={email}
                                onChangeText={setEmail}
                                className="ml-3 flex-1 text-foreground"
                                style={{ opacity: emailVerified && !ALLOW_VERIFIED_EMAIL_EDIT ? 0.5 : 1 }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!emailVerified || ALLOW_VERIFIED_EMAIL_EDIT}
                            />
                        </View>
                        {emailVerified && !ALLOW_VERIFIED_EMAIL_EDIT && (
                            <Text className="text-xs text-muted-foreground mt-2 ml-1">
                                Verified emails cannot be changed at this time
                            </Text>
                        )}
                        {!emailVerified && email.trim() && (
                            <TouchableOpacity
                                onPress={handleSendVerification}
                                disabled={sendingVerification}
                                className={`mt-2 flex-row items-center justify-center p-3 rounded-lg ${
                                    sendingVerification ? 'bg-sand-100' : 'bg-primary/10'
                                }`}
                            >
                                {sendingVerification ? (
                                    <ActivityIndicator size="small" color="#4A6741" />
                                ) : (
                                    <>
                                        <Send size={16} color="#4A6741" />
                                        <Text className="text-primary font-medium ml-2 text-sm">
                                            Send Verification Email
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Phone */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Phone Number</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <Phone size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="+1 (555) 123-4567"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={phone}
                                onChangeText={setPhone}
                                className="ml-3 flex-1 text-foreground"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Password Section */}
                    <View className="mb-6 pt-4 border-t border-sand-200">
                        <Text className="text-lg font-bold text-foreground mb-4">Change Password</Text>
                        <Text className="text-sm text-muted-foreground mb-4">
                            Leave blank if you don't want to change your password
                        </Text>

                        {/* New Password */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">New Password</Text>
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
                        </View>

                        {/* Confirm Password */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-foreground mb-2">Confirm New Password</Text>
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
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                            saving ? 'bg-sand-200' : 'bg-primary'
                        }`}
                    >
                        {saving ? (
                            <>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text className="text-muted-foreground font-bold text-base ml-2">
                                    Saving...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Save size={20} color="white" />
                                <Text className="text-primary-foreground font-bold text-base ml-2">
                                    Save Changes
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
