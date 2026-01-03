/**
 * ItineraryEditModal Component
 * 
 * Mobile-optimized "Review & Adjust" modal (not an "Edit Form")
 * Design: Calm, trustworthy, non-technical
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Platform,
    Vibration,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, AlignLeft, ChevronRight, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ItineraryItemInput } from '../../lib/api/services/itinerary.service';

export interface EditingItem extends Partial<ItineraryItemInput> {
    id?: string;
    isNew?: boolean;
}

interface ItineraryEditModalProps {
    visible: boolean;
    editingItem: EditingItem | null;
    onClose: () => void;
    onSave: () => void;
    onUpdate: (item: EditingItem) => void;
    saving?: boolean;
}

export default function ItineraryEditModal({
    visible,
    editingItem,
    onClose,
    onSave,
    onUpdate,
    saving = false,
}: ItineraryEditModalProps) {
    // Editing states for inline editing
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editingLocation, setEditingLocation] = useState(false);
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);
    const [schedulePickerMode, setSchedulePickerMode] = useState<'date' | 'start' | 'end'>('date');

    // Reset editing states when modal opens/closes
    useEffect(() => {
        if (!visible) {
            setEditingTitle(false);
            setEditingDescription(false);
            setEditingLocation(false);
            setShowSchedulePicker(false);
        }
    }, [visible]);

    if (!editingItem) return null;

    // Format date and time for display
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (timeStr?: string | null) => {
        if (!timeStr) return '--:--';
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatSchedule = () => {
        const date = formatDate(editingItem.day_date);
        const startTime = formatTime(editingItem.starts_at);
        const endTime = formatTime(editingItem.ends_at);
        return `${date} · ${startTime}–${endTime}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowSchedulePicker(false);
        }

        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            onUpdate({ ...editingItem, day_date: dateStr });

            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            }
        }
    };

    const handleStartTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowSchedulePicker(false);
        }

        if (selectedTime) {
            onUpdate({ ...editingItem, starts_at: selectedTime.toISOString() });

            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            }
        }
    };

    const handleEndTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowSchedulePicker(false);
        }

        if (selectedTime) {
            onUpdate({ ...editingItem, ends_at: selectedTime.toISOString() });

            if (Platform.OS === 'ios') {
                Vibration.vibrate(10);
            }
        }
    };

    const openSchedulePicker = (mode: 'date' | 'start' | 'end') => {
        setSchedulePickerMode(mode);
        setShowSchedulePicker(true);
        Vibration.vibrate(10);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-sand-50" edges={['top']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={0}
                >
                    {/* Header - Back + Save in Header */}
                    <View className="bg-white border-b border-sand-200">
                        <View className="px-5 py-4 flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-row items-center"
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <ArrowLeft size={24} color="#6B7280" />
                            </TouchableOpacity>

                            <View className="flex-1 mx-4">
                                <Text className="text-lg font-bold text-foreground">
                                    {editingItem.isNew ? 'New Activity' : 'Review Activity'}
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    Adjust details if needed
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={onSave}
                                disabled={saving || !editingItem.title?.trim()}
                                className={`px-4 py-2 rounded-full ${!editingItem.title?.trim()
                                    ? 'bg-sand-200'
                                    : 'bg-[#4A6741]'
                                    }`}
                                activeOpacity={0.7}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="text-white font-semibold text-sm">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >
                        {/* Activity Summary Card (Always Visible) */}
                        {!editingItem.isNew && (
                            <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm" style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}>
                                <Text className="text-lg font-bold text-foreground mb-2">
                                    {editingItem.title || 'Untitled Activity'}
                                </Text>
                                <Text className="text-sm text-muted-foreground">
                                    {formatSchedule()}
                                </Text>
                                {editingItem.location && (
                                    <View className="flex-row items-center mt-2">
                                        <MapPin size={14} color="#9CA3AF" />
                                        <Text className="text-sm text-muted-foreground ml-1">
                                            {editingItem.location}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Template Helper Text */}
                        {!editingItem.isNew && (
                            <Text className="text-xs text-muted-foreground text-center mt-3 px-6">
                                Based on template — edit only if needed
                            </Text>
                        )}

                        {/* Spacer */}
                        <View className="h-6" />

                        {/* Section: Activity Details */}
                        <View className="mx-4">
                            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Activity Details
                            </Text>

                            {/* Title - Inline Editing */}
                            <TouchableOpacity
                                onPress={() => setEditingTitle(true)}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                                activeOpacity={0.7}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-xs font-semibold text-muted-foreground">Title</Text>
                                    {!editingTitle && <ChevronRight size={16} color="#9CA3AF" />}
                                </View>
                                {editingTitle ? (
                                    <TextInput
                                        value={editingItem.title}
                                        onChangeText={(text) => onUpdate({ ...editingItem, title: text })}
                                        onBlur={() => setEditingTitle(false)}
                                        placeholder="Activity name"
                                        placeholderTextColor="#A0AEC0"
                                        autoFocus
                                        className="text-base font-semibold text-foreground"
                                        returnKeyType="done"
                                    />
                                ) : (
                                    <Text className="text-base font-semibold text-foreground">
                                        {editingItem.title || 'Tap to add title'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Description - Inline Editing */}
                            <TouchableOpacity
                                onPress={() => setEditingDescription(true)}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                                activeOpacity={0.7}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <AlignLeft size={16} color="#9CA3AF" />
                                        <Text className="text-xs font-semibold text-muted-foreground ml-2">Description</Text>
                                    </View>
                                    {!editingDescription && <ChevronRight size={16} color="#9CA3AF" />}
                                </View>
                                {editingDescription ? (
                                    <TextInput
                                        value={editingItem.description || ''}
                                        onChangeText={(text) => onUpdate({ ...editingItem, description: text })}
                                        onBlur={() => setEditingDescription(false)}
                                        placeholder="Add details about this activity"
                                        placeholderTextColor="#A0AEC0"
                                        autoFocus
                                        multiline
                                        numberOfLines={3}
                                        className="text-sm text-foreground min-h-[60px]"
                                        returnKeyType="done"
                                    />
                                ) : (
                                    <Text className="text-sm text-foreground">
                                        {editingItem.description || 'Tap to add description'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Location - Inline Editing */}
                            <TouchableOpacity
                                onPress={() => setEditingLocation(true)}
                                className="bg-white rounded-2xl p-4 shadow-sm"
                                activeOpacity={0.7}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <MapPin size={16} color="#9CA3AF" />
                                        <Text className="text-xs font-semibold text-muted-foreground ml-2">Location</Text>
                                    </View>
                                    {!editingLocation && <ChevronRight size={16} color="#9CA3AF" />}
                                </View>
                                {editingLocation ? (
                                    <TextInput
                                        value={editingItem.location || ''}
                                        onChangeText={(text) => onUpdate({ ...editingItem, location: text })}
                                        onBlur={() => setEditingLocation(false)}
                                        placeholder="Where is this activity?"
                                        placeholderTextColor="#A0AEC0"
                                        autoFocus
                                        className="text-sm text-foreground"
                                        returnKeyType="done"
                                    />
                                ) : (
                                    <Text className="text-sm text-foreground">
                                        {editingItem.location || 'Tap to add location'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Spacer */}
                        <View className="h-6" />

                        {/* Section: Schedule */}
                        <View className="mx-4">
                            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Schedule
                            </Text>

                            {/* Combined Schedule Card */}
                            <TouchableOpacity
                                onPress={() => openSchedulePicker('date')}
                                className="bg-white rounded-2xl p-4 shadow-sm"
                                activeOpacity={0.7}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <Calendar size={18} color="#4A6741" />
                                        <Text className="text-xs font-semibold text-muted-foreground ml-2">Date & Time</Text>
                                    </View>
                                    <ChevronRight size={16} color="#9CA3AF" />
                                </View>

                                <Text className="text-base font-semibold text-foreground mb-1">
                                    {formatSchedule()}
                                </Text>

                                <Text className="text-xs text-muted-foreground mt-2">
                                    Times can be adjusted anytime
                                </Text>

                                {/* Quick Time Adjusters */}
                                <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-sand-100">
                                    <TouchableOpacity
                                        onPress={() => openSchedulePicker('date')}
                                        className="flex-1 bg-sand-50 rounded-xl p-3"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-xs text-muted-foreground mb-1">Date</Text>
                                        <Text className="text-sm font-semibold text-foreground">
                                            {formatDate(editingItem.day_date)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => openSchedulePicker('start')}
                                        className="flex-1 bg-sand-50 rounded-xl p-3"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-xs text-muted-foreground mb-1">Start</Text>
                                        <Text className="text-sm font-semibold text-foreground">
                                            {formatTime(editingItem.starts_at)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => openSchedulePicker('end')}
                                        className="flex-1 bg-sand-50 rounded-xl p-3"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-xs text-muted-foreground mb-1">End</Text>
                                        <Text className="text-sm font-semibold text-foreground">
                                            {formatTime(editingItem.ends_at)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Date/Time Picker (iOS) */}
                        {showSchedulePicker && Platform.OS === 'ios' && (
                            <View className="mx-4 mt-3">
                                <View className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}>
                                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-sand-100">
                                        <Text className="text-sm font-semibold text-foreground">
                                            {schedulePickerMode === 'date' ? 'Select Date' :
                                                schedulePickerMode === 'start' ? 'Select Start Time' : 'Select End Time'}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowSchedulePicker(false)}
                                            className="w-8 h-8 items-center justify-center"
                                            activeOpacity={0.6}
                                        >
                                            <Check size={20} color="#4A6741" />
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={
                                            schedulePickerMode === 'date'
                                                ? (editingItem.day_date ? new Date(editingItem.day_date) : new Date())
                                                : schedulePickerMode === 'start'
                                                    ? (editingItem.starts_at ? new Date(editingItem.starts_at) : new Date())
                                                    : (editingItem.ends_at ? new Date(editingItem.ends_at) : new Date())
                                        }
                                        mode={schedulePickerMode === 'date' ? 'date' : 'time'}
                                        display="spinner"
                                        onChange={
                                            schedulePickerMode === 'date'
                                                ? handleDateChange
                                                : schedulePickerMode === 'start'
                                                    ? handleStartTimeChange
                                                    : handleEndTimeChange
                                        }
                                        textColor="#1F2937"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Android Date/Time Picker */}
                        {showSchedulePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={
                                    schedulePickerMode === 'date'
                                        ? (editingItem.day_date ? new Date(editingItem.day_date) : new Date())
                                        : schedulePickerMode === 'start'
                                            ? (editingItem.starts_at ? new Date(editingItem.starts_at) : new Date())
                                            : (editingItem.ends_at ? new Date(editingItem.ends_at) : new Date())
                                }
                                mode={schedulePickerMode === 'date' ? 'date' : 'time'}
                                display="default"
                                onChange={
                                    schedulePickerMode === 'date'
                                        ? handleDateChange
                                        : schedulePickerMode === 'start'
                                            ? handleStartTimeChange
                                            : handleEndTimeChange
                                }
                            />
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}
