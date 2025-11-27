/**
 * Announcements Manager Component
 * 
 * Admin interface for creating, editing, scheduling, and managing trip announcements
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal } from 'react-native';
import { Bell, Plus, Calendar, Send, Trash2, Edit2, AlertCircle } from 'lucide-react-native';
import { useAnnouncements } from '../lib/api/hooks/useAnnouncements';
import { AnnouncementInput, getAnnouncementStatus } from '../lib/api/services/announcement.service';
import { formatTimeAgo } from '../lib/api/utils/helpers';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface AnnouncementsManagerProps {
    tripId: string;
}

export function AnnouncementsManager({ tripId }: AnnouncementsManagerProps) {
    const {
        announcements,
        loading,
        error,
        isAdmin,
        createItem,
        updateItem,
        deleteItem,
        sendNow,
        refresh
    } = useAnnouncements({ tripId, adminView: true });

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AnnouncementInput>({
        trip_id: tripId,
        title: '',
        body: '',
        link_url: '',
        is_high_priority: false,
        scheduled_for: null,
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(new Date());

    // Handle create/edit
    const handleOpenModal = (announcementId?: string) => {
        if (announcementId) {
            const announcement = announcements.find(a => a.id === announcementId);
            if (announcement) {
                setEditingId(announcementId);
                setFormData({
                    trip_id: tripId,
                    title: announcement.title,
                    body: announcement.body,
                    link_url: announcement.link_url || '',
                    is_high_priority: announcement.is_high_priority,
                    scheduled_for: announcement.scheduled_for,
                });
                if (announcement.scheduled_for) {
                    setScheduledDate(new Date(announcement.scheduled_for));
                }
            }
        } else {
            setEditingId(null);
            setFormData({
                trip_id: tripId,
                title: '',
                body: '',
                link_url: '',
                is_high_priority: false,
                scheduled_for: null,
            });
            setScheduledDate(new Date());
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.body.trim()) {
            Alert.alert('Error', 'Title and body are required');
            return;
        }

        const success = editingId
            ? await updateItem(editingId, formData)
            : await createItem(formData);

        if (success) {
            setShowModal(false);
            Alert.alert('Success', `Announcement ${editingId ? 'updated' : 'created'} successfully`);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Announcement',
            'Are you sure you want to delete this announcement?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteItem(id);
                        if (success) {
                            Alert.alert('Success', 'Announcement deleted');
                        }
                    },
                },
            ]
        );
    };

    const handleSendNow = async (id: string) => {
        Alert.alert(
            'Send Announcement',
            'Send this announcement to all trip members now?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        const success = await sendNow(id);
                        if (success) {
                            Alert.alert('Success', 'Announcement sent to all members');
                        }
                    },
                },
            ]
        );
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setScheduledDate(selectedDate);
            setFormData(prev => ({
                ...prev,
                scheduled_for: selectedDate.toISOString(),
            }));
        }
    };

    if (!isAdmin) {
        return (
            <View className="p-4 bg-red-50 rounded-lg m-4">
                <Text className="text-red-900">Only admins can manage announcements</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View className="p-4">
                <Text className="text-muted-foreground">Loading announcements...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* Header */}
            <View className="p-4 border-b border-sand-200 bg-card">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Bell size={20} color="#4A6741" />
                        <Text className="text-lg font-bold text-foreground ml-2">Announcements</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleOpenModal()}
                        className="bg-[#4A6741] px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-semibold ml-1">New</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-sm text-muted-foreground">
                    {announcements.length} total announcement{announcements.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Announcements List */}
            <ScrollView className="flex-1">
                {announcements.length === 0 ? (
                    <View className="p-8 items-center">
                        <Bell size={48} color="#9CA3AF" opacity={0.3} />
                        <Text className="text-muted-foreground mt-4 text-center">
                            No announcements yet. Create one to notify your trip members.
                        </Text>
                    </View>
                ) : (
                    announcements.map(announcement => {
                        const status = getAnnouncementStatus(announcement);
                        return (
                            <View
                                key={announcement.id}
                                className="bg-card m-3 rounded-xl border border-sand-200 shadow-sm"
                            >
                                <View className="p-4">
                                    {/* Header */}
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                {announcement.is_high_priority && (
                                                    <View className="bg-amber-100 px-2 py-0.5 rounded mr-2">
                                                        <Text className="text-xs font-bold text-amber-700">HIGH PRIORITY</Text>
                                                    </View>
                                                )}
                                                <View className={`px-2 py-0.5 rounded ${status === 'sent'
                                                    ? 'bg-[#4A6741]/10'
                                                    : status === 'scheduled'
                                                        ? 'bg-blue-100'
                                                        : 'bg-sand-100'
                                                    }`}>
                                                    <Text className={`text-xs font-semibold ${status === 'sent'
                                                        ? 'text-[#4A6741]'
                                                        : status === 'scheduled'
                                                            ? 'text-blue-700'
                                                            : 'text-muted-foreground'
                                                        }`}>
                                                        {status.toUpperCase()}
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
                                    <View className="flex-row items-center mb-3">
                                        <Text className="text-xs text-muted-foreground">
                                            {announcement.sent_at
                                                ? `Sent ${formatTimeAgo(announcement.sent_at)}`
                                                : announcement.scheduled_for
                                                    ? `Scheduled for ${new Date(announcement.scheduled_for).toLocaleString()}`
                                                    : 'Draft'}
                                        </Text>
                                    </View>

                                    {/* Actions */}
                                    <View className="flex-row items-center gap-2 border-t border-sand-100 pt-3">
                                        {status === 'scheduled' && (
                                            <TouchableOpacity
                                                onPress={() => handleSendNow(announcement.id!)}
                                                className="flex-row items-center bg-[#4A6741]/10 px-3 py-2 rounded-lg flex-1"
                                            >
                                                <Send size={14} color="#4A6741" />
                                                <Text className="text-[#4A6741] font-semibold text-sm ml-1">Send Now</Text>
                                            </TouchableOpacity>
                                        )}
                                        {!announcement.sent_at && (
                                            <TouchableOpacity
                                                onPress={() => handleOpenModal(announcement.id!)}
                                                className="flex-row items-center bg-sand-100 px-3 py-2 rounded-lg flex-1"
                                            >
                                                <Edit2 size={14} color="#6B7280" />
                                                <Text className="text-muted-foreground font-semibold text-sm ml-1">Edit</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => handleDelete(announcement.id!)}
                                            className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg flex-1"
                                        >
                                            <Trash2 size={14} color="#EF4444" />
                                            <Text className="text-red-600 font-semibold text-sm ml-1">Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-card rounded-t-3xl p-6 max-h-[90%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-foreground">
                                {editingId ? 'Edit' : 'New'} Announcement
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text className="text-[#C5A059] font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="mb-4">
                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
                                <TextInput
                                    value={formData.title}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                    placeholder="Enter announcement title..."
                                    className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground"
                                />
                            </View>

                            {/* Body */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-foreground mb-2">Message</Text>
                                <TextInput
                                    value={formData.body}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, body: text }))}
                                    placeholder="Enter announcement message..."
                                    multiline
                                    numberOfLines={4}
                                    className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground min-h-[100px]"
                                />
                            </View>

                            {/* Link URL */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-foreground mb-2">Link (Optional)</Text>
                                <TextInput
                                    value={formData.link_url || ''}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, link_url: text }))}
                                    placeholder="https://..."
                                    className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* High Priority Toggle */}
                            <View className="flex-row items-center justify-between mb-4 bg-sand-50 p-3 rounded-lg">
                                <View className="flex-row items-center">
                                    <AlertCircle size={20} color="#F59E0B" />
                                    <Text className="text-foreground font-semibold ml-2">High Priority</Text>
                                </View>
                                <Switch
                                    value={formData.is_high_priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, is_high_priority: value }))}
                                    trackColor={{ false: '#D1D5DB', true: '#4A6741' }}
                                    thumbColor={formData.is_high_priority ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>

                            {/* Schedule */}
                            <View className="mb-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm font-semibold text-foreground">Schedule for Later</Text>
                                    <Switch
                                        value={!!formData.scheduled_for}
                                        onValueChange={(value) => {
                                            if (value) {
                                                setFormData(prev => ({ ...prev, scheduled_for: scheduledDate.toISOString() }));
                                            } else {
                                                setFormData(prev => ({ ...prev, scheduled_for: null }));
                                            }
                                        }}
                                        trackColor={{ false: '#D1D5DB', true: '#4A6741' }}
                                        thumbColor={formData.scheduled_for ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>

                                {formData.scheduled_for && (
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        className="bg-sand-50 p-3 rounded-lg border border-sand-200 flex-row items-center"
                                    >
                                        <Calendar size={20} color="#4A6741" />
                                        <Text className="text-foreground ml-2">
                                            {scheduledDate.toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={scheduledDate}
                                        mode="datetime"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>
                        </ScrollView>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-[#4A6741] p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-base">
                                {editingId ? 'Update' : formData.scheduled_for ? 'Schedule' : 'Send'} Announcement
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
