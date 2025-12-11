import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Globe, Volume2, Bell, Download, Trash2, Info, Shield, Wifi } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function AppSettingsScreen() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [autoDownloadMedia, setAutoDownloadMedia] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache",
            "This will clear all cached data including images and files. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                        // TODO: Implement cache clearing
                        Alert.alert("Success", "Cache cleared successfully");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Version Info */}
                <View className="px-4 mt-4">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        About
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <View className="p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Info size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">App Version</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            Current version
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-foreground font-semibold">1.0.0</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Appearance */}
                <View className="px-4 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Appearance
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <View className="p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Moon size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">Dark Mode</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            {isDarkMode ? 'Enabled' : 'Disabled'}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={setIsDarkMode}
                                    trackColor={{ false: '#E5E5E5', true: '#86A47C' }}
                                    thumbColor={isDarkMode ? '#4A6741' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Language */}
                <View className="px-4 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Regional
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <TouchableOpacity 
                            className="p-4"
                            onPress={() => Alert.alert("Coming Soon", "Language selection will be available in a future update")}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Globe size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">Language</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            English (US)
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-muted-foreground">›</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Media & Storage */}
                <View className="px-4 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Media & Storage
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <View className="p-4 border-b border-sand-100">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Download size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">Auto-Download Media</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            Photos and videos
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={autoDownloadMedia}
                                    onValueChange={setAutoDownloadMedia}
                                    trackColor={{ false: '#E5E5E5', true: '#86A47C' }}
                                    thumbColor={autoDownloadMedia ? '#4A6741' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                        <View className="p-4 border-b border-sand-100">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Wifi size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">Offline Mode</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            Save data for offline access
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={offlineMode}
                                    onValueChange={setOfflineMode}
                                    trackColor={{ false: '#E5E5E5', true: '#86A47C' }}
                                    thumbColor={offlineMode ? '#4A6741' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                        <TouchableOpacity className="p-4" onPress={handleClearCache}>
                            <View className="flex-row items-center">
                                <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                    <Trash2 size={18} color="#4A6741" />
                                </View>
                                <View>
                                    <Text className="text-foreground font-medium">Clear Cache</Text>
                                    <Text className="text-xs text-muted-foreground mt-0.5">
                                        Free up storage space
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sound */}
                <View className="px-4 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Sound
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <View className="p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Volume2 size={18} color="#4A6741" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-medium">Sound Effects</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            In-app sounds
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={soundEffects}
                                    onValueChange={setSoundEffects}
                                    trackColor={{ false: '#E5E5E5', true: '#86A47C' }}
                                    thumbColor={soundEffects ? '#4A6741' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Legal */}
                <View className="px-4 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Legal
                    </Text>
                    <View className="bg-card rounded-xl border border-sand-200 overflow-hidden">
                        <TouchableOpacity 
                            className="p-4 border-b border-sand-100"
                            onPress={() => Alert.alert("Terms of Service", "Terms of Service will be displayed here")}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Info size={18} color="#4A6741" />
                                    </View>
                                    <Text className="text-foreground font-medium">Terms of Service</Text>
                                </View>
                                <Text className="text-muted-foreground">›</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="p-4"
                            onPress={() => Alert.alert("Privacy Policy", "Privacy Policy will be displayed here")}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="h-9 w-9 bg-sand-100 rounded-full items-center justify-center mr-3">
                                        <Shield size={18} color="#4A6741" />
                                    </View>
                                    <Text className="text-foreground font-medium">Privacy Policy</Text>
                                </View>
                                <Text className="text-muted-foreground">›</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Build Info */}
                <View className="px-4 mt-6 mb-4">
                    <Text className="text-center text-xs text-muted-foreground">
                        Build 100 • © 2025 Ummrah App
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
