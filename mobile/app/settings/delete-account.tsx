import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/context/AuthContext";
import { useTrip } from "../../lib/context/TripContext";

export default function DeleteAccountScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { currentTrip } = useTrip();
    const [deleting, setDeleting] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Continue",
                    style: "destructive",
                    onPress: () => setShowPasswordModal(true)
                }
            ]
        );
    };

    const handlePasswordSubmit = async () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        try {
            setVerifying(true);

            // Get current user email
            if (!user || !user.email) {
                throw new Error("Unable to get user information");
            }

            // Verify password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password,
            });

            if (signInError) {
                Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
                setPassword('');
                return;
            }

            // Password is correct, proceed with deletion
            setShowPasswordModal(false);
            setPassword('');
            await confirmDeleteAccount();

        } catch (error: any) {
            console.error('Error verifying password:', error);
            Alert.alert('Error', error.message || 'Failed to verify password');
        } finally {
            setVerifying(false);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            setDeleting(true);

            // Get current user
            if (!user) {
                throw new Error("Unable to get user information");
            }

            // Step 1: Mark all trip memberships as left
            const { error: membershipUpdateError } = await supabase
                .from('trip_memberships')
                .update({ left_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .is('left_at', null); // Only update active memberships

            if (membershipUpdateError) {
                console.error('Error updating trip memberships:', membershipUpdateError);
                throw new Error('Failed to remove you from trips');
            }

            // Step 2: Mark profile as inactive (soft delete)
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ 
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (profileUpdateError) {
                console.error('Error deactivating profile:', profileUpdateError);
                throw new Error('Failed to deactivate account');
            }

            // Step 3: Sign out
            const { error: signOutError } = await supabase.auth.signOut();
            
            if (signOutError) {
                throw new Error(`Failed to sign out: ${signOutError.message}`);
            }

            // Navigate to login with success message
            Alert.alert(
                "Account Deactivated",
                "Your account has been deactivated. You've been removed from all trips and can no longer access your account.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace('/join-trip')
                    }
                ]
            );

        } catch (error: any) {
            console.error('Error deactivating account:', error);
            Alert.alert(
                'Deactivation Failed',
                error.message || 'An error occurred while deactivating your account. Please try again or contact support.',
                [{ text: 'OK' }]
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
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
                    <Text className="text-2xl font-bold text-foreground">Delete Account</Text>
                    <Text className="text-muted-foreground mt-1">Deactivate your account and remove trip access</Text>
                </View>

                {/* Warning */}
                <View className="px-5 mt-6">
                    <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
                        <View className="flex-row items-start">
                            <AlertTriangle size={20} color="hsl(0 84% 60%)" style={{ marginTop: 2 }} />
                            <View className="flex-1 ml-3">
                                <Text className="text-red-900 font-bold mb-2">
                                    Warning: This action is irreversible
                                </Text>
                                <Text className="text-red-800 text-sm leading-relaxed">
                                    Once you delete your account, there is no going back. Please be certain before proceeding.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* What Will Be Deleted */}
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        What Will Be Deleted
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 p-4 mb-6">
                        <Text className="text-sm text-foreground leading-relaxed">
                            • <Text className="font-semibold">Personal Information</Text> - Your name, email, phone number, and profile details
                            {'\n\n'}• <Text className="font-semibold">Emergency Contacts</Text> - All saved emergency contact information
                            {'\n\n'}• <Text className="font-semibold">Trip Memberships</Text> - You will be removed from all current and past trips
                            {'\n\n'}• <Text className="font-semibold">Trip History</Text> - All records of trips you've participated in
                            {'\n\n'}• <Text className="font-semibold">Account Access</Text> - You will be immediately logged out and unable to sign in
                        </Text>
                    </View>

                    {currentTrip && (
                        <>
                            <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                                Current Trip Impact
                            </Text>

                            <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
                                <View className="flex-row items-start">
                                    <AlertTriangle size={18} color="#D97706" style={{ marginTop: 2 }} />
                                    <View className="flex-1 ml-3">
                                        <Text className="text-amber-900 font-semibold mb-1">
                                            You're currently on a trip
                                        </Text>
                                        <Text className="text-amber-800 text-sm mb-2">
                                            <Text className="font-semibold">{currentTrip.name}</Text>
                                        </Text>
                                        <Text className="text-amber-800 text-sm leading-relaxed">
                                            Deleting your account will remove you from this trip. Your trip organizers will be notified.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Alternatives */}
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Consider These Alternatives
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 mb-6">
                        <View className="p-4 border-b border-sand-100">
                            <Text className="text-foreground font-semibold mb-1">
                                Just need a break?
                            </Text>
                            <Text className="text-sm text-muted-foreground leading-relaxed">
                                You can simply log out and come back anytime. Your data will be waiting for you.
                            </Text>
                        </View>
                        <View className="p-4 border-b border-sand-100">
                            <Text className="text-foreground font-semibold mb-1">
                                Privacy concerns?
                            </Text>
                            <Text className="text-sm text-muted-foreground leading-relaxed">
                                Adjust your privacy settings and control who can see your information without deleting everything.
                            </Text>
                        </View>
                        <View className="p-4">
                            <Text className="text-foreground font-semibold mb-1">
                                Having issues?
                            </Text>
                            <Text className="text-sm text-muted-foreground leading-relaxed">
                                Contact our support team at support@ummrahapp.com - we're here to help!
                            </Text>
                        </View>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-red-600 p-4 rounded-xl flex-row items-center justify-center"
                        style={{ opacity: deleting ? 0.7 : 1 }}
                    >
                        {deleting ? (
                            <>
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white font-bold ml-2">
                                    Deactivating Account...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Trash2 size={20} color="white" />
                                <Text className="text-white font-bold ml-2">
                                    I Understand, Deactivate My Account
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Password Verification Modal */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setShowPassword(false);
                }}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="flex-1 bg-black/50 items-center justify-center px-5">
                            <TouchableWithoutFeedback>
                                <View className="bg-card rounded-2xl p-6 w-full max-w-md border border-sand-200">
                                    <View className="items-center mb-4">
                                        <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-3">
                                            <Lock size={28} color="hsl(0 84% 60%)" />
                                        </View>
                                        <Text className="text-xl font-bold text-foreground mb-2">
                                            Verify Your Identity
                                        </Text>
                                        <Text className="text-sm text-muted-foreground text-center">
                                            Please enter your password to confirm account deletion
                                        </Text>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-sm font-medium text-foreground mb-2">
                                            Password
                                        </Text>
                                        <View className="flex-row items-center bg-background rounded-xl px-4 py-3 border border-sand-200">
                                            <Lock size={20} color="hsl(40 5% 55%)" />
                                            <TextInput
                                                placeholder="Enter your password"
                                                placeholderTextColor="hsl(40 5% 55%)"
                                                value={password}
                                                onChangeText={setPassword}
                                                className="ml-3 flex-1 text-foreground"
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                                returnKeyType="done"
                                                onSubmitEditing={handlePasswordSubmit}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                {showPassword ? (
                                                    <EyeOff size={20} color="hsl(40 5% 55%)" />
                                                ) : (
                                                    <Eye size={20} color="hsl(40 5% 55%)" />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handlePasswordSubmit}
                                        disabled={verifying}
                                        className="bg-red-600 p-4 rounded-xl items-center mb-3"
                                        style={{ opacity: verifying ? 0.7 : 1 }}
                                    >
                                        {verifying ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-bold">
                                                Confirm & Delete Account
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowPasswordModal(false);
                                            setPassword('');
                                            setShowPassword(false);
                                        }}
                                        disabled={verifying}
                                        className="bg-sand-100 p-4 rounded-xl items-center"
                                    >
                                        <Text className="text-foreground font-semibold">
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
