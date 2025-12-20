import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Check, X, Megaphone, Clock, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { requestPushNotificationPermissions } from "../../lib/api/services/pushNotification.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_PROMPT_KEY = '@notification_prompt_shown';

export default function EnableNotificationsScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            const result = await requestPushNotificationPermissions();
            
            // Mark that we've shown the prompt
            await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
            
            if (result.success) {
                console.log('✅ Notifications enabled successfully');
            } else {
                console.log('⚠️ User declined notifications or error occurred');
            }
            
            // Navigate to main app regardless of result
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error enabling notifications:', error);
            router.replace('/(tabs)');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        // Mark that we've shown the prompt
        await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <View className="flex-1 px-6 py-8 justify-between">
                {/* Header */}
                <View>
                    <View className="items-center mb-8 mt-12">
                        <View className="h-32 w-32 bg-[#C5A059]/10 rounded-full items-center justify-center mb-6 border-4 border-[#C5A059]/20">
                            <Bell size={64} color="#C5A059" />
                        </View>
                        <Text className="text-3xl font-bold text-foreground text-center mb-3">
                            Stay Connected
                        </Text>
                        <Text className="text-base text-muted-foreground text-center leading-relaxed">
                            Get important updates about your Umrah journey
                        </Text>
                    </View>

                    {/* Benefits */}
                    <View className="space-y-4 mb-8">
                        <BenefitItem
                            icon={<Megaphone size={24} color="#4A6741" />}
                            title="Trip Announcements"
                            description="Never miss important updates from your group admin"
                        />
                        <BenefitItem
                            icon={<Clock size={24} color="#4A6741" />}
                            title="Prayer Reminders"
                            description="Get notified before each prayer time"
                        />
                        <BenefitItem
                            icon={<AlertCircle size={24} color="#4A6741" />}
                            title="Urgent Alerts"
                            description="Receive time-sensitive information immediately"
                        />
                    </View>

                    {/* Privacy Notice */}
                    <View className="bg-sand-50 rounded-xl p-4 border border-sand-200">
                        <View className="flex-row items-center mb-2">
                            <Check size={16} color="#4A6741" />
                            <Text className="text-xs font-semibold text-foreground ml-2">
                                Your Privacy Matters
                            </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            You can customize notification preferences anytime in Settings. We only send relevant updates for your trip.
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="space-y-3">
                    <TouchableOpacity
                        onPress={handleEnableNotifications}
                        disabled={isLoading}
                        className="bg-[#4A6741] rounded-xl p-4 flex-row items-center justify-center shadow-sm"
                        activeOpacity={0.8}
                    >
                        <Bell size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            {isLoading ? 'Enabling...' : 'Enable Notifications'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSkip}
                        disabled={isLoading}
                        className="rounded-xl p-4 items-center"
                        activeOpacity={0.7}
                    >
                        <Text className="text-muted-foreground font-semibold">
                            I'll do this later
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <View className="flex-row items-start">
            <View className="h-12 w-12 bg-[#4A6741]/10 rounded-full items-center justify-center mr-4">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-foreground mb-1">
                    {title}
                </Text>
                <Text className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                </Text>
            </View>
        </View>
    );
}
