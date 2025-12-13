import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { User, Mail, Phone, Save, CheckCircle, XCircle, Send, MapPin, Calendar, FileText, Utensils, Camera, Eye } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/context/AuthContext";
import { useProfile } from "../../lib/api/hooks/useProfile";
import { getTimeAgo } from "../../lib/utils";

export default function PersonalInfoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { profile, loading, refreshing, lastUpdated, refresh, updateProfile } = useProfile({
        userId: user?.id,
        enableRealtime: false,
    });
    
    // TODO: Allow editing of verified emails with proper confirmation flow
    const ALLOW_VERIFIED_EMAIL_EDIT = false;
    
    const [saving, setSaving] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [medicalNotes, setMedicalNotes] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('');
    const [profileVisible, setProfileVisible] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Track original values for change detection
    const [originalValues, setOriginalValues] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        dateOfBirth: '',
        medicalNotes: '',
        dietaryRestrictions: '',
        profileVisible: true,
    });

    // Update local state when profile data loads
    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setEmail(profile.email);
            setPhone(profile.phone);
            setEmailVerified(profile.emailVerified);
            setCountry(profile.country);
            setCity(profile.city);
            setDateOfBirth(profile.dateOfBirth);
            setMedicalNotes(profile.medicalNotes);
            setDietaryRestrictions(profile.dietaryRestrictions);
            setProfileVisible(profile.profileVisible);

            setOriginalValues({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                country: profile.country,
                city: profile.city,
                dateOfBirth: profile.dateOfBirth,
                medicalNotes: profile.medicalNotes,
                dietaryRestrictions: profile.dietaryRestrictions,
                profileVisible: profile.profileVisible,
            });
        }
    }, [profile]);

    const hasChanges = () => {
        return (
            name.trim() !== originalValues.name ||
            email.trim() !== originalValues.email ||
            phone.trim() !== originalValues.phone ||
            country.trim() !== originalValues.country ||
            city.trim() !== originalValues.city ||
            dateOfBirth !== originalValues.dateOfBirth ||
            medicalNotes.trim() !== originalValues.medicalNotes ||
            dietaryRestrictions.trim() !== originalValues.dietaryRestrictions ||
            profileVisible !== originalValues.profileVisible
        );
    };

    const handleProfileVisibilityChange = async (newValue: boolean) => {
        const previousValue = profileVisible;
        setProfileVisible(newValue);
        
        try {
            await updateProfile({ profileVisible: newValue });
            
            setOriginalValues(prev => ({
                ...prev,
                profileVisible: newValue,
            }));
        } catch (error) {
            console.error('Error updating profile visibility:', error);
            setProfileVisible(previousValue);
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

        try {
            setSaving(true);

            const emailChanged = email.trim() !== user?.email;

            await updateProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || '',
                country: country.trim() || '',
                city: city.trim() || '',
                dateOfBirth: dateOfBirth || '',
                medicalNotes: medicalNotes.trim() || '',
                dietaryRestrictions: dietaryRestrictions.trim() || '',
                profileVisible,
            });

            // Update original values
            setOriginalValues({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || '',
                country: country.trim() || '',
                city: city.trim() || '',
                dateOfBirth: dateOfBirth || '',
                medicalNotes: medicalNotes.trim() || '',
                dietaryRestrictions: dietaryRestrictions.trim() || '',
                profileVisible,
            });

            let successMessage = 'Profile updated successfully';
            if (emailChanged) {
                successMessage += '\n\nA confirmation email has been sent to your new email address. Please verify it to complete the change.';
            }

            Alert.alert('Success', successMessage);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to update profile');
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
                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor="#4A6741"
                            colors={["#4A6741"]}
                        />
                    }
                >
                    {/* Form */}
                    <View className="px-5 mt-6">
                         {lastUpdated && (
                            <Text className="text-xs text-muted-foreground mb-4">Last updated {getTimeAgo(lastUpdated)}</Text>
                        )}
                        <View className="mb-3 p-3 bg-sand-50 rounded-lg">
                            <Text className="text-xs text-muted-foreground leading-5">
                                Your name, email, and phone are stored securely in your account. Other details like location, medical notes, and dietary preferences are optional and help trip organizers plan better.
                            </Text>
                        </View>
                     {/* Profile Visibility */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between bg-card rounded-xl px-4 py-4 border border-sand-200">
                            <View className="flex-1 mr-4">
                                <View className="flex-row items-center mb-1">
                                    <Eye size={18} color="hsl(40 5% 55%)" />
                                    <Text className="text-sm font-medium text-foreground ml-2">Profile Visibility</Text>
                                </View>
                                <Text className="text-xs text-muted-foreground">
                                    Allow other trip members to see your profile
                                </Text>
                            </View>
                            <Switch
                                value={profileVisible}
                                onValueChange={handleProfileVisibilityChange}
                                trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
                                thumbColor={profileVisible ? '#FFFFFF' : '#F3F4F6'}
                            />
                        </View>
                        <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Text className="text-xs text-blue-900 leading-4 font-medium">
                                ℹ️ This setting saves immediately. For other profile details below, make your changes and press Save Changes at the bottom.
                            </Text>
                        </View>
                    </View>

                    {/* Separator */}
                    <View className="h-px bg-sand-200 mb-6" />

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

                    {/* Photo Upload Placeholder */}
                    {/* <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Profile Photo</Text>
                        <TouchableOpacity 
                            disabled 
                            className="bg-card rounded-xl px-4 py-8 border border-sand-200 border-dashed items-center opacity-50"
                        >
                            <View className="h-16 w-16 bg-sand-100 rounded-full items-center justify-center mb-3">
                                <Camera size={28} color="hsl(40 5% 55%)" />
                            </View>
                            <Text className="text-muted-foreground font-medium">Upload Photo</Text>
                            <Text className="text-xs text-muted-foreground mt-1">Coming soon</Text>
                        </TouchableOpacity>
                    </View> */}

                     {/* City */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">City</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <MapPin size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="Enter your city"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={city}
                                onChangeText={setCity}
                                className="ml-3 flex-1 text-foreground"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Country */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Country</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <MapPin size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="Enter your country"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={country}
                                onChangeText={setCountry}
                                className="ml-3 flex-1 text-foreground"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Date of Birth */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200"
                        >
                            <Calendar size={20} color="hsl(40 5% 55%)" />
                            <Text className={`ml-3 flex-1 ${dateOfBirth ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {dateOfBirth 
                                    ? new Date(dateOfBirth).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })
                                    : 'Select your date of birth'
                                }
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <View>
                                {Platform.OS === 'ios' && (
                                    <View className="flex-row justify-end px-4 py-2">
                                        <TouchableOpacity
                                            onPress={() => setShowDatePicker(false)}
                                            className="bg-primary px-4 py-2 rounded-lg"
                                        >
                                            <Text className="text-primary-foreground font-semibold">Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <DateTimePicker
                                    value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        if (Platform.OS === 'android') {
                                            setShowDatePicker(false);
                                        }
                                        if (selectedDate) {
                                            setDateOfBirth(selectedDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1900, 0, 1)}
                                />
                            </View>
                        )}
                    </View>

                    {/* Medical Notes */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Medical Notes</Text>
                        <View className="flex-row items-start bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <FileText size={20} color="hsl(40 5% 55%)" style={{ marginTop: 2 }} />
                            <TextInput
                                placeholder="Any medical conditions, allergies, or medications..."
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={medicalNotes}
                                onChangeText={setMedicalNotes}
                                className="ml-3 flex-1 text-foreground"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={{ minHeight: 80 }}
                            />
                        </View>
                    </View>

                    {/* Dietary Restrictions */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Dietary Restrictions</Text>
                        <View className="flex-row items-start bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <Utensils size={20} color="hsl(40 5% 55%)" style={{ marginTop: 2 }} />
                            <TextInput
                                placeholder="Food allergies, dietary preferences, or restrictions..."
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={dietaryRestrictions}
                                onChangeText={setDietaryRestrictions}
                                className="ml-3 flex-1 text-foreground"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                style={{ minHeight: 60 }}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving || !hasChanges()}
                        className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${
                            saving || !hasChanges() ? 'bg-sand-200' : 'bg-primary'
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
                                <Save size={20} color={!hasChanges() ? "hsl(40 5% 55%)" : "white"} />
                                <Text className={`font-bold text-base ml-2 ${
                                    !hasChanges() ? 'text-muted-foreground' : 'text-primary-foreground'
                                }`}>
                                    {!hasChanges() ? 'No Changes' : 'Save Changes'}
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
