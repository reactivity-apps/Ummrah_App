/**
 * Announcements Manager Component
 * 
 * Admin interface for creating, editing, scheduling, and managing trip announcements
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Bell, Plus, Send, Trash2, Edit2, Edit3, AlertCircle, RefreshCw, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AnnouncementInput, getAnnouncementStatus } from '../lib/api/services/announcement.service';
import { formatTimeAgo } from '../lib/api/utils/helpers';
import { AnnouncementRow } from '../types/db';

interface AnnouncementsManagerProps {
    tripId: string;
    announcements: AnnouncementRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    createItem: (input: AnnouncementInput) => Promise<boolean>;
    updateItem: (id: string, input: AnnouncementInput) => Promise<boolean>;
    deleteItem: (id: string) => Promise<boolean>;
    sendNow: (id: string) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function AnnouncementsManager({
    tripId,
    announcements,
    loading,
    error,
    isAdmin,
    createItem,
    updateItem,
    deleteItem,
    sendNow,
    refresh
}: AnnouncementsManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
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

        setSaving(true);
        const success = editingId
            ? await updateItem(editingId, formData)
            : await createItem(formData);

        setSaving(false);
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

    return (
        <View className="flex-1">
            {/* Action Buttons */}
            <View className="bg-card border-b border-[#C5A059]/10 flex-row gap-2 p-4">
                <TouchableOpacity
                    onPress={() => handleOpenModal()}
                    className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <Plus size={18} color="#4A6741" />
                    <Text className="text-[#4A6741] font-semibold ml-2">Add Item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={refresh}
                    className="flex-1 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <RefreshCw size={18} color="#C5A059" />
                    <Text className="text-[#C5A059] font-semibold ml-2">Reload</Text>
                </TouchableOpacity>
            </View>

            {/* Announcements List */}
            <ScrollView className="flex-1 px-4">
                {loading ? (
                    <View className="p-8 items-center">
                        <Text className="text-muted-foreground mt-4 text-center">
                            Loading announcements...
                        </Text>
                    </View>
                ) : announcements.length === 0 ? (
                    <View className="p-8 items-center">
                        <Text className="text-muted-foreground mt-4 text-center">
                            No announcements yet. Create one to notify your trip members.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="flex-row items-center justify-between px-3 mt-4">
                            <Text className="text-sm text-muted-foreground">
                                {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
                            </Text>
                        </View>
                        {announcements.map(announcement => {
                            const status = getAnnouncementStatus(announcement);
                            return (
                                <View
                                    key={announcement.id}
                                    className="bg-card rounded-xl border border-[#C5A059]/20 mb-4 mt-4"
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
                                        <View className="flex-row gap-2">
                                            {status === 'scheduled' && (
                                                <TouchableOpacity
                                                    onPress={() => handleSendNow(announcement.id!)}
                                                    className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                                                >
                                                    <Send size={16} color="#4A6741" />
                                                    <Text className="text-[#4A6741] font-medium ml-2">Send Now</Text>
                                                </TouchableOpacity>
                                            )}
                                            {/* <TouchableOpacity
                                                onPress={() => handleOpenModal(announcement.id!)}
                                                className="flex-1 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                                            >
                                                <Edit3 size={16} color="#C5A059" />
                                                <Text className="text-[#C5A059] font-medium ml-2">Edit</Text>
                                            </TouchableOpacity> */}
                                            <TouchableOpacity
                                                onPress={() => handleDelete(announcement.id!)}
                                                className="flex-1 bg-red-50 border border-red-200 rounded-lg py-2.5 flex-row items-center justify-center"
                                            >
                                                <Trash2 size={16} color="#EF4444" />
                                                <Text className="text-red-600 font-medium ml-2">Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                visible={showModal}
                animationType="none"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="max-h-[90%]"
                    >
                        <View className="bg-card rounded-t-3xl p-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-foreground">
                                    {editingId ? 'Edit' : 'New'} Announcement
                                </Text>
                                <TouchableOpacity onPress={() => setShowModal(false)} className="p-1 bg-sand-100 rounded-full">
                                    <X size={20} color="#718096" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView>
                                {/* Title */}
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
                                    <TextInput
                                        value={formData.title}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                        placeholder="e.g., Important Update About Tomorrow's Schedule"
                                        placeholderTextColor="#9CA3AF"
                                        className="bg-sand-50 p-3 rounded-lg border border-sand-200 text-foreground"
                                    />
                                </View>

                                {/* Body */}
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-foreground mb-2">Message</Text>
                                    <TextInput
                                        value={formData.body}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, body: text }))}
                                        placeholder="Write your message here."
                                        placeholderTextColor="#9CA3AF"
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
                                        placeholder="https://example.com/important-info"
                                        placeholderTextColor="#9CA3AF"
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

                                {/* TODO: Scheduling feature temporarily disabled - needs implementation work */}
                                {/* Schedule */}
                                {/* <View className="mb-4">
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
                                </View> */}
                            </ScrollView>

                            {/* Action Buttons */}
                            <View className="flex-row gap-3 pb-5 border-t border-sand-200 pt-4">
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    disabled={saving}
                                    className="flex-1 bg-sand-100 border border-sand-200 rounded-xl p-4 flex-row items-center justify-center"
                                >
                                    <X size={18} color="#718096" />
                                    <Text className="text-muted-foreground font-semibold text-center ml-2">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-xl p-4 flex-row items-center justify-center"
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#4A6741" />
                                    ) : (
                                        <>
                                            <Send size={18} color="#4A6741" />
                                            <Text className="text-[#4A6741] font-semibold text-center ml-2">Send</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
