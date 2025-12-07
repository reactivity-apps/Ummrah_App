import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Phone, Save } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { ProfileRow } from "../../types/db";
import { loadFromCache, saveToCache } from "../../lib/utils";

interface EmergencyContactData {
    name: string;
    phone: string;
}

export default function EmergencyContactScreen() {
    const router = useRouter();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    
    // Track original values for change detection
    const [originalValues, setOriginalValues] = useState({
        name: '',
        phone: '',
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

            const cacheKey = `@ummrah_emergency_contact_${user.id}`;

            // Try to load from cache if not forcing refresh
            if (!forceRefresh) {
                const cached = await loadFromCache<EmergencyContactData>(cacheKey, CACHE_DURATION, 'EmergencyContact');
                if (cached) {
                    setEmergencyName(cached.name);
                    setEmergencyPhone(cached.phone);
                    
                    setOriginalValues({
                        name: cached.name,
                        phone: cached.phone,
                    });
                    
                    setLoading(false);
                    return;
                }
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            const emergencyName = data?.emergency_contact_name || '';
            const emergencyPhone = data?.emergency_contact_phone || '';

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            } else if (data) {
                setProfile(data);
                setEmergencyName(emergencyName);
                setEmergencyPhone(emergencyPhone);
                
                // Store original values
                setOriginalValues({
                    name: emergencyName,
                    phone: emergencyPhone,
                });

                // Cache the data
                const dataToCache: EmergencyContactData = {
                    name: emergencyName,
                    phone: emergencyPhone,
                };
                await saveToCache(cacheKey, dataToCache, 'EmergencyContact');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const hasChanges = () => {
        return (
            emergencyName.trim() !== originalValues.name ||
            emergencyPhone.trim() !== originalValues.phone
        );
    };

    const handleSave = async () => {
        if (!emergencyName.trim()) {
            Alert.alert('Error', 'Emergency contact name is required');
            return;
        }

        if (!emergencyPhone.trim()) {
            Alert.alert('Error', 'Emergency contact phone is required');
            return;
        }

        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    emergency_contact_name: emergencyName.trim(),
                    emergency_contact_phone: emergencyPhone.trim(),
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error updating emergency contact:', error);
                Alert.alert('Error', 'Failed to update emergency contact');
            } else {
                Alert.alert('Success', 'Emergency contact updated successfully');
                await loadProfile(true);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
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
                    <Text className="text-2xl font-bold text-foreground">Emergency Contact</Text>
                    <Text className="text-muted-foreground mt-1">Person to contact in case of emergency</Text>
                </View>

                {/* Form */}
                <View className="px-5 mt-6">
                    {/* Info Box */}
                    <View className="bg-primary/10 p-4 rounded-xl border border-primary/20 mb-6">
                        <Text className="text-sm text-foreground leading-5">
                            This information will only be used in case of emergencies during your trip. Make sure to keep it up to date before each journey.
                        </Text>
                    </View>

                    {/* Name */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Contact Name *</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <User size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="Enter contact name"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={emergencyName}
                                onChangeText={setEmergencyName}
                                className="ml-3 flex-1 text-foreground"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Contact Phone *</Text>
                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <Phone size={20} color="hsl(40 5% 55%)" />
                            <TextInput
                                placeholder="+1 (555) 123-4567"
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={emergencyPhone}
                                onChangeText={setEmergencyPhone}
                                className="ml-3 flex-1 text-foreground"
                                keyboardType="phone-pad"
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
