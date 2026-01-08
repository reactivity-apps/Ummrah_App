/**
 * Announcements Screen
 * 
 * User-facing screen to view trip announcements with unread indicators and priority markers
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, X, ExternalLink } from 'lucide-react-native';
import { useAnnouncements } from '../lib/api/hooks/useAnnouncements';
import { formatTimeAgo } from '../lib/api/utils/helpers';
import { AnnouncementRow } from '../types/db';
import { useTrip } from '../lib/context/TripContext';

export default function AnnouncementsScreen() {
    const { currentTrip } = useTrip();
    const { announcements, loading } = useAnnouncements({
        tripId: currentTrip?.id || '',
        adminView: false, // Users only see sent announcements
        enableRealtime: true
    });

    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRow | null>(null);

    const handleOpenLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err => console.error('Error opening link:', err));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
            {/* Content */}
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                {!loading && (
                    <View className="px-4 pt-4 pb-2">
                        <Text className="text-sm text-muted-foreground">
                            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
                {loading ? (
                    <View className="flex-1 items-center justify-center p-8">
                        <ActivityIndicator size="large" color="#4A6741" />
                        <Text className="text-muted-foreground mt-4">Loading announcements...</Text>
                    </View>
                ) : announcements.length === 0 ? (
                    <View className="p-8 items-center">
                        <Bell size={64} color="#9CA3AF" opacity={0.3} />
                        <Text className="text-muted-foreground mt-4 text-center text-lg">
                            No announcements yet
                        </Text>
                        <Text className="text-muted-foreground text-center mt-2">
                            You'll be notified when your trip admin posts updates
                        </Text>
                    </View>
                ) : (
                    <View className="p-3">
                        {announcements.map(announcement => (
                            <TouchableOpacity
                                key={announcement.id}
                                onPress={() => setSelectedAnnouncement(announcement)}
                                className="bg-card rounded-xl border border-[#C5A059]/20 mb-4"
                                activeOpacity={0.7}
                            >
                                <View className="p-4">
                                    {/* Header */}
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                {announcement.is_high_priority && (
                                                    <View className="bg-[#F5E6C8] px-2 py-0.5 rounded mr-2">
                                                        <Text className="text-xs font-bold text-[#D4A574]">HIGH PRIORITY</Text>
                                                    </View>
                                                )}
                                                <View className="px-2 py-0.5 rounded bg-[#4A6741]/10">
                                                    <Text className="text-xs font-semibold text-[#4A6741]">
                                                        SENT
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-lg font-bold text-foreground">
                                                {announcement.title}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Body */}
                                    <Text className="text-foreground/80 mb-3" numberOfLines={3}>
                                        {announcement.body}
                                    </Text>

                                    {/* Meta */}
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xs text-muted-foreground">
                                            Sent {formatTimeAgo(announcement.sent_at || announcement.created_at!)}
                                        </Text>
                                        {announcement.link_url && (
                                            <View className="flex-row items-center">
                                                <ExternalLink size={12} color="#4A6741" />
                                                <Text className="text-xs text-[#4A6741] font-semibold ml-1">Link</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal
                visible={selectedAnnouncement !== null}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSelectedAnnouncement(null)}
            >
                {selectedAnnouncement && (
                    <View className="flex-1 bg-black/60 justify-center items-center p-4">
                        <View className="bg-card rounded-3xl max-h-[90%] w-full max-w-lg" style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                            elevation: 10,
                        }}>
                            {/* Header */}
                            <View className="p-5 border-b border-sand-200 flex-row items-center justify-between">
                                <View className="flex-1 mr-4">
                                    {selectedAnnouncement.is_high_priority && (
                                        <View className="flex-row items-center mb-2">
                                            <View className="bg-[#F5E6C8] px-2 py-0.5 rounded">
                                                <Text className="text-xs font-bold text-[#D4A574]">HIGH PRIORITY</Text>
                                            </View>
                                        </View>
                                    )}
                                    <Text className="text-2xl font-bold text-foreground">
                                        {selectedAnnouncement.title}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSelectedAnnouncement(null)}
                                    className="p-2 rounded-full bg-sand-100"
                                >
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                                <Text className="text-base text-foreground leading-relaxed mb-6">
                                    {selectedAnnouncement.body}
                                </Text>

                                {/* Link */}
                                {selectedAnnouncement.link_url && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenLink(selectedAnnouncement.link_url!)}
                                        className="bg-primary/10 p-4 rounded-xl flex-row items-center justify-between mb-6"
                                    >
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-1">View Link</Text>
                                            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                                {selectedAnnouncement.link_url}
                                            </Text>
                                        </View>
                                        <ExternalLink size={20} color="#4A6741" />
                                    </TouchableOpacity>
                                )}

                                {/* Metadata */}
                                <View className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                                    <Text className="text-xs text-muted-foreground mb-1">Posted</Text>
                                    <Text className="text-foreground font-semibold">
                                        {new Date(selectedAnnouncement.sent_at || selectedAnnouncement.created_at!).toLocaleString()}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground mt-2">
                                        {formatTimeAgo(selectedAnnouncement.sent_at || selectedAnnouncement.created_at!)}
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Close Button */}
                            <View className="p-5 border-t border-sand-200">
                                <TouchableOpacity
                                    onPress={() => setSelectedAnnouncement(null)}
                                    className="bg-sand-100 p-4 rounded-xl items-center"
                                >
                                    <Text className="text-muted-foreground font-bold">Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        </SafeAreaView>
    );
}
