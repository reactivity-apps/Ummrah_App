import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, User, Mail, Phone, Save, CheckCircle, XCircle, Send, MapPin, Calendar, FileText, Utensils, Camera, Eye } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { ProfileRow } from "../../types/db";
import { useAuth } from "../../lib/context/AuthContext";
import { loadFromCache, saveToCache } from "../../lib/utils";

interface PersonalInfoData {
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    country: string;
    city: string;
    dateOfBirth: string;
    medicalNotes: string;
    dietaryRestrictions: string;
    profileVisible: boolean;
}

export default function PersonalInfoScreen() {
    const router = useRouter();
    const { updateUserProfile } = useAuth();
    // TODO: Allow editing of verified emails with proper confirmation flow
    const ALLOW_VERIFIED_EMAIL_EDIT = false;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
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

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async (forceRefresh: boolean = false) => {
        try {
            if (!forceRefresh) {
                setLoading(true);
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const cacheKey = `@ummrah_personal_info_${user.id}`;

            // Try to load from cache if not forcing refresh
            if (!forceRefresh) {
                const cached = await loadFromCache<PersonalInfoData>(cacheKey, CACHE_DURATION, 'PersonalInfo');
                if (cached) {
                    setName(cached.name);
                    setEmail(cached.email);
                    setPhone(cached.phone);
                    setEmailVerified(cached.emailVerified);
                    setCountry(cached.country);
                    setCity(cached.city);
                    setDateOfBirth(cached.dateOfBirth);
                    setMedicalNotes(cached.medicalNotes);
                    setDietaryRestrictions(cached.dietaryRestrictions);
                    setProfileVisible(cached.profileVisible);
                    
                    setOriginalValues({
                        name: cached.name,
                        email: cached.email,
                        phone: cached.phone,
                        country: cached.country,
                        city: cached.city,
                        dateOfBirth: cached.dateOfBirth,
                        medicalNotes: cached.medicalNotes,
                        dietaryRestrictions: cached.dietaryRestrictions,
                        profileVisible: cached.profileVisible,
                    });
                    
                    setLoading(false);
                    return;
                }
            }

            const { data: { user: freshUser } } = await supabase.auth.getUser();
            
            if (!freshUser) {
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Check email verification status
            const emailVerified = freshUser.email_confirmed_at !== null;
            setEmailVerified(emailVerified);

            // Load data from auth user
            const userName = freshUser.user_metadata?.full_name || '';
            const userEmail = freshUser.email || '';
            const userPhone = freshUser.user_metadata?.phone || '';
            
            setName(userName);
            setEmail(userEmail);
            setPhone(userPhone);

            // Load data from profiles table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', freshUser.id)
                .single();

            const profileCountry = profile?.country || '';
            const profileCity = profile?.city || '';
            const profileDateOfBirth = profile?.date_of_birth || '';
            const profileMedicalNotes = profile?.medical_notes || '';
            const profileDietaryRestrictions = profile?.dietary_restrictions || '';
            const profileVisible = profile?.profile_visible ?? true;

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile:', profileError);
            } else if (profile) {
                setCountry(profileCountry);
                setCity(profileCity);
                setDateOfBirth(profileDateOfBirth);
                setMedicalNotes(profileMedicalNotes);
                setDietaryRestrictions(profileDietaryRestrictions);
                setProfileVisible(profileVisible);
            }

            // Store original values for change detection
            const originalData = {
                name: userName,
                email: userEmail,
                phone: userPhone,
                country: profileCountry,
                city: profileCity,
                dateOfBirth: profileDateOfBirth,
                medicalNotes: profileMedicalNotes,
                dietaryRestrictions: profileDietaryRestrictions,
                profileVisible: profileVisible,
            };
            setOriginalValues(originalData);

            // Cache the data
            const dataToCache: PersonalInfoData = {
                name: userName,
                email: userEmail,
                phone: userPhone,
                emailVerified: emailVerified,
                country: profileCountry,
                city: profileCity,
                dateOfBirth: profileDateOfBirth,
                medicalNotes: profileMedicalNotes,
                dietaryRestrictions: profileDietaryRestrictions,
                profileVisible: profileVisible,
            };
            await saveToCache(cacheKey, dataToCache, 'PersonalInfo');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
        setProfileVisible(newValue);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    profile_visible: newValue,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error updating profile visibility:', error);
                // Revert on error
                setProfileVisible(!newValue);
            } else {
                // Update original values so hasChanges() reflects the save
                setOriginalValues(prev => ({
                    ...prev,
                    profileVisible: newValue,
                }));

                // Update the cache with new visibility value
                const cacheKey = `@ummrah_personal_info_${user.id}`;
                const cached = await loadFromCache<PersonalInfoData>(cacheKey, CACHE_DURATION, 'PersonalInfo');
                if (cached) {
                    const updatedCache = {
                        ...cached,
                        profileVisible: newValue,
                    };
                    await saveToCache(cacheKey, updatedCache, 'PersonalInfo');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setProfileVisible(!newValue);
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

            // Use AuthContext wrapper to prevent unwanted reloads
            const { error: authError } = await updateUserProfile(updates);

            if (authError) {
                console.error('Error updating auth user:', authError);
                Alert.alert('Error', authError.message || 'Failed to update user information');
                return;
            }

            // Update or insert profile data
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    country: country.trim() || null,
                    city: city.trim() || null,
                    date_of_birth: dateOfBirth || null,
                    medical_notes: medicalNotes.trim() || null,
                    dietary_restrictions: dietaryRestrictions.trim() || null,
                    profile_visible: profileVisible,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Error updating profile:', profileError);
                Alert.alert('Warning', 'Profile info saved to auth but failed to update extended profile data');
            }

            let successMessage = 'Profile updated successfully';
            if (email.trim() !== user.email) {
                successMessage += '\n\nA confirmation email has been sent to your new email address. Please verify it to complete the change.';
            }

            Alert.alert('Success', successMessage);
            
            // Reload profile to get updated data (force refresh to bypass cache)
            await loadProfile(true);
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
                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                await loadProfile(true);
                            }}
                            tintColor="#4A6741"
                            colors={["#4A6741"]}
                        />
                    }
                >
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
                    <View className="mt-3 p-3 bg-sand-50 rounded-lg">
                        <Text className="text-xs text-muted-foreground leading-5">
                            Your name, email, and phone are stored securely in your account. Other details like location, medical notes, and dietary preferences are optional and help trip organizers plan better.
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View className="px-5 mt-6">
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
