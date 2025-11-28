import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Clock, Megaphone, AlertTriangle, Settings } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEYS = {
    ANNOUNCEMENT_NOTIFICATIONS: 'notifications_announcements',
    PRAYER_NOTIFICATIONS: 'notifications_prayers',
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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
            const [announcements, prayers] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT_NOTIFICATIONS),
                AsyncStorage.getItem(STORAGE_KEYS.PRAYER_NOTIFICATIONS),
            ]);

            // Default to true if not set
            setAnnouncementNotifications(announcements !== 'false');
            setPrayerNotifications(prayers !== 'false');
        } catch (error) {
            console.error('Error loading notification settings:', error);
            Alert.alert('Error', 'Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAnnouncements = async (value: boolean) => {
        try {
            setAnnouncementNotifications(value);
            await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT_NOTIFICATIONS, String(value));
            
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
        }
    };

    const handleTogglePrayers = async (value: boolean) => {
        try {
            setPrayerNotifications(value);
            await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_NOTIFICATIONS, String(value));
            
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
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-muted-foreground">Loading...</Text>
            </SafeAreaView>
        );
    }

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
                    <Text className="text-2xl font-bold text-foreground">Notifications</Text>
                    <Text className="text-muted-foreground mt-1">Manage your notification preferences</Text>
                </View>

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
