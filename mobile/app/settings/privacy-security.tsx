import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, Lock, Eye, Trash2, AlertTriangle, EyeOff } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useTrip } from "../../lib/context/TripContext";

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const { currentTrip } = useTrip();
    const [deleting, setDeleting] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verifying, setVerifying] = useState(false);

    console.log(currentTrip)

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
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user || !user.email) {
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
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                throw new Error("Unable to get user information");
            }

            // Step 1: Delete all trip memberships (cascade will handle related data)
            const { error: membershipDeleteError } = await supabase
                .from('trip_memberships')
                .delete()
                .eq('user_id', user.id);

            if (membershipDeleteError) {
                console.warn('Error removing trip memberships:', membershipDeleteError);
                // Continue anyway - database triggers should handle cleanup
            }

            // Step 2: Delete profile
            const { error: profileDeleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('user_id', user.id);

            if (profileDeleteError) {
                console.warn('Error deleting profile:', profileDeleteError);
                // Continue anyway
            }

            // Step 3: Sign out (backend triggers will handle user deletion)
            const { error: signOutError } = await supabase.auth.signOut();
            
            if (signOutError) {
                throw new Error(`Failed to sign out: ${signOutError.message}`);
            }

            // Navigate to login
            Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace('/join-trip')
                    }
                ]
            );

        } catch (error: any) {
            console.error('Error deleting account:', error);
            Alert.alert(
                'Deletion Failed',
                error.message || 'An error occurred while deleting your account. Please try again or contact support.',
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
                    <Text className="text-2xl font-bold text-foreground">Privacy & Security</Text>
                    <Text className="text-muted-foreground mt-1">Your data, your control</Text>
                </View>

                {/* Data Security Info */}
                <View className="px-5 mt-4">
                    <View className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <View className="flex-row items-start mb-3">
                            <Shield size={20} color="#4A6741" style={{ marginTop: 2 }} />
                            <Text className="text-sm font-semibold text-foreground ml-2">
                                Your Data is Secure
                            </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            We take your privacy seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.
                        </Text>
                    </View>
                </View>

                {/* Privacy Features */}
                <View className="px-5 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Data Protection
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 mb-4">
                        {/* Encryption */}
                        <View className="p-4 border-b border-sand-100">
                            <View className="flex-row items-start">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Lock size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">
                                        End-to-End Encryption
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed">
                                        Your personal information, trip details, and communications are encrypted both in transit and at rest using industry-standard protocols.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Data Access */}
                        <View className="p-4">
                            <View className="flex-row items-start">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Eye size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">
                                        Limited Data Access
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed">
                                        Only you and authorized trip organizers can access your information. We implement strict access controls and audit logs.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        What We Collect
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 p-4 mb-6">
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            • Personal information (name, email, phone number)
                            {'\n'}• Emergency contact details
                            {'\n'}• Trip participation and history
                            {'\n'}• Location data (only when using trip features)
                            {'\n'}• App usage analytics (anonymized)
                            {'\n\n'}
                            <Text className="font-semibold text-foreground">We do not collect:</Text>
                            {'\n'}• Payment card information (processed by secure payment providers)
                            {'\n'}• Biometric data
                            {'\n'}• Contacts or other device data
                        </Text>
                    </View>

                    {/* Danger Zone */}
                    <Text className="text-sm font-bold text-red-600 mb-3 uppercase tracking-wider">
                        Danger Zone
                    </Text>

                    <View className="bg-card rounded-xl border border-red-200">
                        <View className="p-4">
                            <View className="flex-row items-start mb-3">
                                <View className="h-10 w-10 bg-red-50 rounded-full items-center justify-center mr-3">
                                    <Trash2 size={20} color="hsl(0 84% 60%)" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">
                                        Delete Account
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed mb-3">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </Text>
                                    <View className="bg-red-50 p-3 rounded-lg border border-red-100 mb-3">
                                        <View className="flex-row items-start">
                                            <AlertTriangle size={14} color="hsl(0 84% 60%)" style={{ marginTop: 1 }} />
                                            <Text className="text-xs text-red-600 ml-2 flex-1 leading-relaxed">
                                                <Text className="font-semibold">This will:</Text>
                                                {'\n'}• Remove you from your current trip
                                                {'\n'}• Delete your profile and personal information
                                                {'\n'}• Remove all trip history
                                                {'\n'}• Cancel any active memberships
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleDeleteAccount}
                                        disabled={deleting}
                                        className="bg-red-600 p-3 rounded-lg flex-row items-center justify-center"
                                        style={{ opacity: deleting ? 0.7 : 1 }}
                                    >
                                        {deleting ? (
                                            <>
                                                <ActivityIndicator size="small" color="white" />
                                                <Text className="text-white font-semibold ml-2">
                                                    Deleting Account...
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} color="white" />
                                                <Text className="text-white font-semibold ml-2">
                                                    Delete My Account
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Info */}
                <View className="px-5 mt-8">
                    <View className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            For more information about how we handle your data, please review our Privacy Policy and Terms of Service. If you have questions or concerns, contact us at privacy@ummrahapp.com
                        </Text>
                    </View>
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
