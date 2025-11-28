import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Phone, FileText, Save } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { Profile } from "../../types/db";

export default function EmergencyContactScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [emergencyNotes, setEmergencyNotes] = useState('');

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

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                Alert.alert('Error', 'Failed to load profile');
            } else {
                setProfile(data);
                setEmergencyName(data.emergency_name || '');
                setEmergencyPhone(data.emergency_phone || '');
                setEmergencyNotes(data.emergency_notes || '');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile) return;

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
            
            if (!user) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    emergency_name: emergencyName.trim(),
                    emergency_phone: emergencyPhone.trim(),
                    emergency_notes: emergencyNotes.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (error) {
                console.error('Error updating emergency contact:', error);
                Alert.alert('Error', 'Failed to update emergency contact');
            } else {
                Alert.alert('Success', 'Emergency contact updated successfully');
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
                    <Text className="text-2xl font-bold text-foreground">Emergency Contact</Text>
                    <Text className="text-muted-foreground mt-1">Person to contact in case of emergency</Text>
                </View>

                {/* Form */}
                <View className="px-5 mt-6">
                    {/* Info Box */}
                    <View className="bg-primary/10 p-4 rounded-xl border border-primary/20 mb-6">
                        <Text className="text-sm text-foreground">
                            This information will only be used in case of emergencies during your trip.
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

                    {/* Notes */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-foreground mb-2">Additional Notes</Text>
                        <View className="flex-row items-start bg-card rounded-xl px-4 py-3 border border-sand-200">
                            <FileText size={20} color="hsl(40 5% 55%)" style={{ marginTop: 2 }} />
                            <TextInput
                                placeholder="Relationship, medical information, etc."
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={emergencyNotes}
                                onChangeText={setEmergencyNotes}
                                className="ml-3 flex-1 text-foreground"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
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
