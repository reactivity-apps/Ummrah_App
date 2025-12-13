import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Bell, Clock, Megaphone, AlertTriangle, Settings } from "lucide-react-native";
import * as Notifications from 'expo-notifications';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/context/AuthContext";
import { ProfileRow } from "../../types/db";
import { loadFromCache, saveToCache, getTimeAgo } from "../../lib/utils";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface NotificationPreferences {
    announcements: boolean;
    prayers: boolean;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [announcementNotifications, setAnnouncementNotifications] = useState(true);
    const [prayerNotifications, setPrayerNotifications] = useState(true);
    const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(true);
    const [openingSettings, setOpeningSettings] = useState(false);

    useEffect(() => {
        loadSettings();
        checkSystemPermissions();
    }, []);

    const checkSystemPermissions = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setSystemNotificationsEnabled(status === 'granted');
        } catch (error) {
            console.error('Error checking notification permissions:', error);
        }
    };

    const openAppSettings = async () => {
        try {
            setOpeningSettings(true);
            if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
            } else {
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Error opening settings:', error);
            Alert.alert('Error', 'Could not open device settings');
        } finally {
            // Keep loading state for a moment as user is navigating away
            setTimeout(() => setOpeningSettings(false), 1000);
        }
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            
            if (!user?.id) {
                console.warn('No user ID available');
                setLoading(false);
                return;
            }

            // Try loading from cache first
            const cacheKey = `notification_preferences_${user.id}`;
            const cached = await loadFromCache<NotificationPreferences>(cacheKey, CACHE_DURATION);
            
            if (cached) {
                setAnnouncementNotifications(cached.data.announcements);
                setPrayerNotifications(cached.data.prayers);
                setLastUpdated(cached.timestamp);
                setLoading(false);
            }

            // Fetch from database
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('notification_announcements, notification_prayers, updated_at')
                .eq('user_id', user.id)
                .single();

            if (error) {
                throw error;
            }

            if (profile) {
                const preferences: NotificationPreferences = {
                    announcements: profile.notification_announcements ?? true,
                    prayers: profile.notification_prayers ?? true,
                };
                
                setAnnouncementNotifications(preferences.announcements);
                setPrayerNotifications(preferences.prayers);
                
                // Save to cache
                await saveToCache(cacheKey, preferences);
                setLastUpdated(Date.now());
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
            Alert.alert('Error', 'Failed to load notification preferences');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleToggleAnnouncements = async (value: boolean) => {
        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            setSaving(true);
            setAnnouncementNotifications(value);

            // Save to database
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    notification_announcements: value,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (error) {
                throw error;
            }

            // Update cache
            const cacheKey = `notification_preferences_${user.id}`;
            const preferences: NotificationPreferences = {
                announcements: value,
                prayers: prayerNotifications,
            };
            await saveToCache(cacheKey, preferences);
            setLastUpdated(Date.now());
            
            // Show feedback
            Alert.alert(
                value ? 'Enabled' : 'Disabled',
                value 
                    ? 'You will receive notifications for new announcements'
                    : 'You will not receive announcement notifications'
            );
        } catch (error) {
            console.error('Error saving announcement settings:', error);
            Alert.alert('Error', 'Failed to save settings');
            setAnnouncementNotifications(!value); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePrayers = async (value: boolean) => {
        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            setSaving(true);
            setPrayerNotifications(value);

            // Save to database
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    notification_prayers: value,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (error) {
                throw error;
            }

            // Update cache
            const cacheKey = `notification_preferences_${user.id}`;
            const preferences: NotificationPreferences = {
                announcements: announcementNotifications,
                prayers: value,
            };
            await saveToCache(cacheKey, preferences);
            setLastUpdated(Date.now());
            
            // Show feedback
            Alert.alert(
                value ? 'Enabled' : 'Disabled',
                value 
                    ? 'You will receive notifications for prayer times'
                    : 'You will not receive prayer time notifications'
            );
        } catch (error) {
            console.error('Error saving prayer settings:', error);
            Alert.alert('Error', 'Failed to save settings');
            setPrayerNotifications(!value); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSettings();
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-muted-foreground">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A6741"
                        colors={['#4A6741']}
                    />
                }
            >
                {/* Last Updated */}
                {lastUpdated && (
                    <View className="px-5 mt-4">
                        <Text className="text-xs text-muted-foreground">
                            Last updated {getTimeAgo(lastUpdated)}
                        </Text>
                    </View>
                )}

                {/* Info Box */}
                <View className="px-5 mt-4">
                    <View className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <Text className="text-sm text-foreground">
                            Control which notifications you receive. You can always change these settings later.
                        </Text>
                    </View>
                </View>

                {/* System Notifications Warning */}
                {!systemNotificationsEnabled && (
                    <View className="px-5 mt-4">
                        <View className="bg-card rounded-xl border border-sand-200 p-4">
                            <View className="flex-row items-start mb-3">
                                <View className="h-8 w-8 bg-red-500 rounded-full items-center justify-center">
                                    <AlertTriangle size={18} color="white" />
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-sm font-semibold text-foreground mb-1">
                                        Notifications Disabled
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed">
                                        Notifications are currently disabled for this app in your device settings. You need to enable them to receive any notifications.
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={openAppSettings}
                                disabled={openingSettings}
                                className="bg-red-500 p-3 rounded-lg flex-row items-center justify-center mt-2"
                                style={{ opacity: openingSettings ? 0.7 : 1 }}
                            >
                                {openingSettings ? (
                                    <>
                                        <ActivityIndicator size="small" color="white" />
                                        <Text className="text-white font-semibold ml-2">
                                            Opening Settings...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Settings size={16} color="white" />
                                        <Text className="text-white font-semibold ml-2">
                                            Open Settings
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Notification Settings */}
                <View className="px-5 mt-6">
                    {/* Announcements */}
                    <View className="bg-card rounded-xl border border-sand-200 mb-4">
                        <View className="p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-4">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Megaphone size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">Announcements</Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Get notified when trip admins post important updates
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={announcementNotifications}
                                onValueChange={handleToggleAnnouncements}
                                trackColor={{ false: '#D1D5DB', true: '#A8C5A0' }}
                                thumbColor={announcementNotifications ? '#4A6741' : '#f4f3f4'}
                                ios_backgroundColor="#D1D5DB"
                                disabled={!systemNotificationsEnabled}
                            />
                        </View>
                    </View>

                    {/* Prayer Times */}
                    <View className="bg-card rounded-xl border border-sand-200 mb-4">
                        <View className="p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-4">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Clock size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">Prayer Times</Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Receive reminders for daily prayer times
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={prayerNotifications}
                                onValueChange={handleTogglePrayers}
                                trackColor={{ false: '#D1D5DB', true: '#A8C5A0' }}
                                thumbColor={prayerNotifications ? '#4A6741' : '#f4f3f4'}
                                ios_backgroundColor="#D1D5DB"
                                disabled={!systemNotificationsEnabled}
                            />
                        </View>
                    </View>
                </View>

                 {/* Saving Indicator */}
                {saving && (
                    <View className="px-5 mt-2">
                        <View className="bg-primary/10 p-3 rounded-lg flex-row items-center justify-center">
                            <ActivityIndicator size="small" color="#4A6741" />
                            <Text className="text-sm text-primary ml-2">Saving preferences...</Text>
                        </View>
                    </View>
                )}

                {/* Help Text */}
                <View className="px-5 mt-8">
                    <View className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                        <View className="flex-row items-start mb-3">
                            <Bell size={16} color="hsl(40 5% 55%)" style={{ marginTop: 2 }} />
                            <Text className="text-sm font-semibold text-foreground ml-2">
                                About Notifications
                            </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            • Announcement notifications keep you informed about trip updates, schedule changes, and important information from your trip organizers.
                            {'\n\n'}
                            • Prayer time notifications help you stay on track with your daily prayers by sending reminders at the appropriate times based on your location.
                            {'\n\n'}
                            • You must have notifications enabled in your device settings for these preferences to work.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
