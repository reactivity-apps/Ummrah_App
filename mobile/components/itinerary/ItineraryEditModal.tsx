/**
 * ItineraryEditModal Component
 * 
 * Modal for creating/editing itinerary items with date/time pickers
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, Save, X, ChevronDown } from 'lucide-react-native';
import { ItineraryItemInput } from '../../lib/api/services/itinerary.service';

export interface EditingItem extends Partial<ItineraryItemInput> {
    id?: string;
    isNew?: boolean;
}

interface ItineraryEditModalProps {
    visible: boolean;
    editingItem: EditingItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: () => void;
    onUpdate: (item: EditingItem) => void;
}

export default function ItineraryEditModal({
    visible,
    editingItem,
    saving,
    onClose,
    onSave,
    onUpdate,
}: ItineraryEditModalProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate && editingItem) {
            const dateStr = selectedDate.toISOString().split('T')[0];

            const updatedItem = { ...editingItem, day_date: dateStr };

            // Update starts_at with new date
            if (editingItem.starts_at) {
                const startTime = new Date(editingItem.starts_at);
                selectedDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
                updatedItem.starts_at = selectedDate.toISOString();
            }

            // Update ends_at with new date
            if (editingItem.ends_at) {
                const endTime = new Date(editingItem.ends_at);
                const endDate = new Date(selectedDate);
                endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
                updatedItem.ends_at = endDate.toISOString();
            }

            onUpdate(updatedItem);
        }

        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowDatePicker(false);
        }
    };

    const handleStartTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowStartTimePicker(false);
        }

        if (selectedTime && editingItem) {
            const date = editingItem.day_date ? new Date(editingItem.day_date) : new Date();
            date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            onUpdate({
                ...editingItem,
                starts_at: date.toISOString(),
                day_date: editingItem.day_date || date.toISOString().split('T')[0]
            });
        }

        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowStartTimePicker(false);
        }
    };

    const handleEndTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowEndTimePicker(false);
        }

        if (selectedTime && editingItem) {
            const date = editingItem.day_date ? new Date(editingItem.day_date) : new Date();
            date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            onUpdate({
                ...editingItem,
                ends_at: date.toISOString()
            });
        }

        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowEndTimePicker(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-sand-50">
                {/* Modal Header */}
                <View className="bg-card border-b border-sand-200 px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-foreground">
                            {editingItem?.isNew ? 'Create Item' : 'Edit Item'}
                        </Text>
                        <TouchableOpacity onPress={onClose} disabled={saving}>
                            <X size={24} color="#718096" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    {/* Title */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">
                            Title <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            value={editingItem?.title}
                            onChangeText={(text) => onUpdate({ ...editingItem!, title: text })}
                            placeholder="Enter activity title"
                            placeholderTextColor="#A0AEC0"
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 text-foreground"
                        />
                    </View>

                    {/* Description */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
                        <TextInput
                            value={editingItem?.description || ''}
                            onChangeText={(text) => onUpdate({ ...editingItem!, description: text })}
                            placeholder="Enter activity description"
                            placeholderTextColor="#A0AEC0"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 text-foreground"
                            style={{ minHeight: 100 }}
                        />
                    </View>

                    {/* Location */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">Location</Text>
                        <TextInput
                            value={editingItem?.location || ''}
                            onChangeText={(text) => onUpdate({ ...editingItem!, location: text })}
                            placeholder="Enter location"
                            placeholderTextColor="#A0AEC0"
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 text-foreground"
                        />
                    </View>

                    {/* Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">
                            Date <Text className="text-red-500">*</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(!showDatePicker)}
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center flex-1">
                                <Calendar size={18} color="#4A6741" />
                                <Text className={`ml-3 ${editingItem?.day_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {editingItem?.day_date
                                        ? new Date(editingItem.day_date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'Select date'}
                                </Text>
                            </View>
                            <ChevronDown size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <View className="mt-2 bg-card border border-sand-200 rounded-lg overflow-hidden">
                                <DateTimePicker
                                    value={editingItem?.day_date ? new Date(editingItem.day_date) : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    onChange={handleDateChange}
                                    minimumDate={new Date()}
                                    textColor="#1F2937"
                                />
                            </View>
                        )}
                    </View>

                    {/* Start Time */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">
                            Start Time <Text className="text-red-500">*</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center flex-1">
                                <Clock size={18} color="#4A6741" />
                                <Text className={`ml-3 ${editingItem?.starts_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {editingItem?.starts_at
                                        ? new Date(editingItem.starts_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Select start time'}
                                </Text>
                            </View>
                            <ChevronDown size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <View className="mt-2 bg-card border border-sand-200 rounded-lg overflow-hidden">
                                <DateTimePicker
                                    value={editingItem?.starts_at ? new Date(editingItem.starts_at) : new Date()}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleStartTimeChange}
                                    textColor="#1F2937"
                                />
                            </View>
                        )}
                    </View>

                    {/* End Time */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">End Time</Text>
                        <TouchableOpacity
                            onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center flex-1">
                                <Clock size={18} color="#4A6741" />
                                <Text className={`ml-3 ${editingItem?.ends_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {editingItem?.ends_at
                                        ? new Date(editingItem.ends_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Select end time (optional)'}
                                </Text>
                            </View>
                            <ChevronDown size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <View className="mt-2 bg-card border border-sand-200 rounded-lg overflow-hidden">
                                <DateTimePicker
                                    value={editingItem?.ends_at ? new Date(editingItem.ends_at) : new Date()}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleEndTimeChange}
                                    textColor="#1F2937"
                                />
                            </View>
                        )}
                    </View>

                    {/* Sort Order */}
                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-foreground mb-2">Sort Order</Text>
                        <TextInput
                            value={editingItem?.sort_order?.toString()}
                            onChangeText={(text) =>
                                onUpdate({ ...editingItem!, sort_order: parseInt(text) || 0 })
                            }
                            placeholder="0"
                            placeholderTextColor="#A0AEC0"
                            keyboardType="numeric"
                            className="bg-card border border-sand-200 rounded-lg px-4 py-3 text-foreground"
                        />
                        <Text className="text-xs text-muted-foreground mt-1">
                            Lower numbers appear first
                        </Text>
                    </View>
                </ScrollView>

                {/* Modal Footer */}
                <View className="bg-card border-t border-sand-200 px-4 py-4">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={saving}
                            className="flex-1 bg-sand-100 rounded-lg py-3"
                        >
                            <Text className="text-muted-foreground font-semibold text-center">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onSave}
                            disabled={saving}
                            className="flex-1 bg-[#4A6741] rounded-lg py-3 flex-row items-center justify-center"
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Save size={18} color="white" />
                                    <Text className="text-white font-semibold ml-2">Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
