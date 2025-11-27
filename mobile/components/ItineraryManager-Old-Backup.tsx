/**
 * ItineraryManager Component
 * 
 * Admin interface for managing trip itinerary items.
 * Features:
 * - Create, update, delete itinerary items
 * - Drag-to-reorder functionality
 * - Real-time updates
 * - Conflict detection
 * - Optimistic UI updates
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    GripVertical,
    AlertCircle,
    CheckCircle,
    ChevronDown,
} from 'lucide-react-native';
import { useItinerary } from '../lib/api/hooks/useItinerary';
import { ItineraryItemInput } from '../lib/api/services/itinerary.service';
import { ItineraryItemRow } from '../types/db';
import { ACTIVITY_TEMPLATES, TEMPLATE_CATEGORIES, templateToItineraryItem, ActivityTemplate } from './ActivityTemplates';

interface ItineraryManagerProps {
    tripId: string;
    tripName?: string;
}

interface EditingItem extends Partial<ItineraryItemInput> {
    id?: string;
    isNew?: boolean;
}

export default function ItineraryManager({ tripId, tripName }: ItineraryManagerProps) {
    const {
        items,
        loading,
        error,
        isAdmin,
        checkingPermissions,
        createItem,
        updateItem,
        deleteItem,
        reorderItems,
        refresh,
    } = useItinerary({
        tripId,
        enableRealtime: true,
        onError: (err) => {
            Alert.alert('Error', err);
        },
        onConflict: (item) => {
            Alert.alert(
                'Conflict Detected',
                'This item was modified by another admin. Please refresh and try again.',
                [{ text: 'Refresh', onPress: () => refresh() }]
            );
        },
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // Date/time picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempStartTime, setTempStartTime] = useState(new Date());
    const [tempEndTime, setTempEndTime] = useState(new Date());

    // Group items by day
    const groupedItems = items.reduce((acc, item) => {
        const day = item.day_date || 'No Date';
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(item);
        return acc;
    }, {} as Record<string, ItineraryItemRow[]>);

    const sortedDays = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return a.localeCompare(b);
    });

    // =========================================================================
    // HANDLERS
    // =========================================================================

    const handleCreateNew = () => {
        setEditingItem({
            trip_id: tripId,
            title: '',
            description: '',
            location: '',
            day_date: '',
            starts_at: '',
            ends_at: '',
            sort_order: items.length,
            isNew: true,
        });
        setShowEditModal(true);
    };

    const handleSelectTemplate = async (template: ActivityTemplate) => {
        // Close template modal and open edit modal with template data pre-filled
        setShowTemplateModal(false);
        
        // Set default date to tomorrow at suggested time
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 1);
        const [hours, minutes] = (template.suggestedTimes?.[0] || '09:00').split(':');
        defaultDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endDate = new Date(defaultDate);
        endDate.setMinutes(endDate.getMinutes() + (template.defaultDuration || 60));
        
        setEditingItem({
            trip_id: tripId,
            title: template.title,
            description: template.description,
            location: '',
            day_date: defaultDate.toISOString().split('T')[0],
            starts_at: defaultDate.toISOString(),
            ends_at: endDate.toISOString(),
            sort_order: items.length,
            isNew: true,
        });
        
        setShowEditModal(true);
    };

    const handleEdit = (item: ItineraryItemRow) => {
        setEditingItem({
            id: item.id,
            trip_id: item.trip_id,
            title: item.title,
            description: item.description || '',
            location: item.location || '',
            day_date: item.day_date || '',
            starts_at: item.starts_at || '',
            ends_at: item.ends_at || '',
            sort_order: item.sort_order,
            isNew: false,
        });
        setShowEditModal(true);
    };

    const handleDelete = (item: ItineraryItemRow) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteItem(item.id!, true);
                        if (success) {
                            Alert.alert('Success', 'Item deleted successfully');
                        }
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!editingItem) return;

        // Validation
        if (!editingItem.title?.trim()) {
            Alert.alert('Validation Error', 'Title is required');
            return;
        }

        setSaving(true);

        try {
            let success = false;

            if (editingItem.isNew) {
                // Create new item
                const input: ItineraryItemInput = {
                    trip_id: tripId,
                    title: editingItem.title,
                    description: editingItem.description,
                    location: editingItem.location,
                    day_date: editingItem.day_date || null,
                    starts_at: editingItem.starts_at || null,
                    ends_at: editingItem.ends_at || null,
                    sort_order: editingItem.sort_order ?? items.length,
                };
                success = await createItem(input);
            } else {
                // Update existing item
                success = await updateItem(
                    editingItem.id!,
                    {
                        title: editingItem.title,
                        description: editingItem.description,
                        location: editingItem.location,
                        day_date: editingItem.day_date,
                        starts_at: editingItem.starts_at,
                        ends_at: editingItem.ends_at,
                        sort_order: editingItem.sort_order,
                    },
                    true // optimistic update
                );
            }

            if (success) {
                setShowEditModal(false);
                setEditingItem(null);
                Alert.alert('Success', editingItem.isNew ? 'Item created successfully' : 'Item updated successfully');
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleExpanded = (itemId: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const formatTime = (datetime: string | null | undefined) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'No Date';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Date/Time Picker Handlers
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (selectedDate && editingItem) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setTempDate(selectedDate);
            setEditingItem(prev => prev ? { ...prev, day_date: dateStr } : null);
            
            // Update starts_at with new date
            if (editingItem.starts_at) {
                const startTime = new Date(editingItem.starts_at);
                selectedDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
                setEditingItem(prev => prev ? { ...prev, starts_at: selectedDate.toISOString() } : null);
            }
            
            // Update ends_at with new date
            if (editingItem.ends_at) {
                const endTime = new Date(editingItem.ends_at);
                const endDate = new Date(selectedDate);
                endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
                setEditingItem(prev => prev ? { ...prev, ends_at: endDate.toISOString() } : null);
            }
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
            setTempStartTime(selectedTime);
            
            // Combine with current date
            const date = editingItem.day_date ? new Date(editingItem.day_date) : new Date();
            date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
            
            setEditingItem(prev => prev ? { 
                ...prev, 
                starts_at: date.toISOString(),
                day_date: prev.day_date || date.toISOString().split('T')[0]
            } : null);
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
            setTempEndTime(selectedTime);
            
            // Combine with current date
            const date = editingItem.day_date ? new Date(editingItem.day_date) : new Date();
            date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
            
            setEditingItem(prev => prev ? { 
                ...prev, 
                ends_at: date.toISOString()
            } : null);
        }
        
        if (Platform.OS === 'ios' && event.type === 'dismissed') {
            setShowEndTimePicker(false);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    if (checkingPermissions) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <ActivityIndicator size="large" color="#4A6741" />
                <Text className="text-muted-foreground mt-4">Checking permissions...</Text>
            </View>
        );
    }

    if (!isAdmin) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <AlertCircle size={48} color="#EF4444" />
                <Text className="text-foreground font-semibold text-lg mt-4">Access Denied</Text>
                <Text className="text-muted-foreground text-center mt-2">
                    Only admins and sub-admins can manage the itinerary
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-sand-50">
            {/* Header */}
            <View className="bg-card border-b border-sand-200 px-4 py-4">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-foreground">Manage Itinerary</Text>
                        {tripName && (
                            <Text className="text-sm text-muted-foreground mt-1">{tripName}</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleCreateNew}
                        className="bg-[#4A6741] px-4 py-2 rounded-lg flex-row items-center mr-2"
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Add Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowTemplateModal(true)}
                        className="bg-teal-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Calendar size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Templates</Text>
                    </TouchableOpacity>
                </View>

                {error && (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex-row items-center">
                        <AlertCircle size={16} color="#EF4444" />
                        <Text className="text-red-700 ml-2 flex-1 text-sm">{error}</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A6741" />
                    <Text className="text-muted-foreground mt-4">Loading itinerary...</Text>
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <Calendar size={64} color="#CBD5E0" />
                    <Text className="text-foreground font-semibold text-lg mt-4">No Itinerary Items</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Get started by adding the first activity to your trip itinerary
                    </Text>
                    <TouchableOpacity
                        onPress={handleCreateNew}
                        className="bg-[#4A6741] px-6 py-3 rounded-lg mt-6"
                    >
                        <Text className="text-white font-semibold">Create First Item</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                    {sortedDays.map((day) => (
                        <View key={day} className="mb-6">
                            {/* Day Header */}
                            <View className="flex-row items-center mb-3">
                                <View className="bg-[#4A6741] px-3 py-1.5 rounded-full">
                                    <Text className="text-white font-semibold text-sm">{formatDate(day)}</Text>
                                </View>
                                <View className="flex-1 h-[1px] bg-sand-200 ml-3" />
                            </View>

                            {/* Items for this day */}
                            {groupedItems[day].map((item, index) => {
                                const isExpanded = expandedItems.has(item.id!);
                                return (
                                    <View
                                        key={item.id}
                                        className="bg-card rounded-xl border border-sand-200 mb-3 shadow-sm overflow-hidden"
                                    >
                                        {/* Item Header */}
                                        <TouchableOpacity
                                            onPress={() => toggleExpanded(item.id!)}
                                            className="p-4"
                                            activeOpacity={0.7}
                                        >
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1">
                                                    <View className="flex-row items-center gap-2 mb-2">
                                                        {item.starts_at && (
                                                            <View className="flex-row items-center bg-[#C5A059]/10 px-2 py-1 rounded">
                                                                <Clock size={12} color="#C5A059" />
                                                                <Text className="text-[#C5A059] text-xs font-medium ml-1">
                                                                    {formatTime(item.starts_at)}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        <View className="bg-sand-100 px-2 py-1 rounded">
                                                            <Text className="text-xs font-medium text-muted-foreground">
                                                                #{item.sort_order}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-foreground font-semibold text-base mb-1">
                                                        {item.title}
                                                    </Text>
                                                    {item.location && (
                                                        <View className="flex-row items-center mt-1">
                                                            <MapPin size={12} color="#718096" />
                                                            <Text className="text-muted-foreground text-xs ml-1">
                                                                {item.location}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <GripVertical size={20} color="#CBD5E0" />
                                            </View>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <View className="mt-4 pt-4 border-t border-sand-100">
                                                    {item.description && (
                                                        <View className="mb-3">
                                                            <Text className="text-xs text-muted-foreground font-medium mb-1">
                                                                DESCRIPTION
                                                            </Text>
                                                            <Text className="text-foreground text-sm leading-5">
                                                                {item.description}
                                                            </Text>
                                                        </View>
                                                    )}

                                                    {item.ends_at && (
                                                        <View className="mb-3">
                                                            <Text className="text-xs text-muted-foreground font-medium mb-1">
                                                                END TIME
                                                            </Text>
                                                            <Text className="text-foreground text-sm">
                                                                {formatTime(item.ends_at)}
                                                            </Text>
                                                        </View>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <View className="flex-row gap-2 mt-4">
                                                        <TouchableOpacity
                                                            onPress={() => handleEdit(item)}
                                                            className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/20 rounded-lg py-2.5 flex-row items-center justify-center"
                                                        >
                                                            <Edit3 size={16} color="#4A6741" />
                                                            <Text className="text-[#4A6741] font-medium ml-2">Edit</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => handleDelete(item)}
                                                            className="flex-1 bg-red-50 border border-red-200 rounded-lg py-2.5 flex-row items-center justify-center"
                                                        >
                                                            <Trash2 size={16} color="#EF4444" />
                                                            <Text className="text-red-600 font-medium ml-2">Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Edit/Create Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    if (!saving) {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }
                }}
            >
                <SafeAreaView className="flex-1 bg-sand-50">
                    {/* Modal Header */}
                    <View className="bg-card border-b border-sand-200 px-4 py-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-foreground">
                                {editingItem?.isNew ? 'Create Item' : 'Edit Item'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!saving) {
                                        setShowEditModal(false);
                                        setEditingItem(null);
                                    }
                                }}
                                disabled={saving}
                            >
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
                                onChangeText={(text) =>
                                    setEditingItem((prev) => prev ? { ...prev, title: text } : null)
                                }
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
                                onChangeText={(text) =>
                                    setEditingItem((prev) => prev ? { ...prev, description: text } : null)
                                }
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
                                onChangeText={(text) =>
                                    setEditingItem((prev) => prev ? { ...prev, location: text } : null)
                                }
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
                                    setEditingItem((prev) =>
                                        prev ? { ...prev, sort_order: parseInt(text) || 0 } : null
                                    )
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
                                onPress={() => {
                                    setShowEditModal(false);
                                    setEditingItem(null);
                                }}
                                disabled={saving}
                                className="flex-1 bg-sand-100 rounded-lg py-3"
                            >
                                <Text className="text-muted-foreground font-semibold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
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

            {/* Template Picker Modal */}
            <Modal
                visible={showTemplateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowTemplateModal(false)}
            >
                <SafeAreaView className="flex-1 bg-sand-50">
                    {/* Modal Header */}
                    <View className="bg-card border-b border-sand-200 px-5 py-3.5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-foreground">Activity Templates</Text>
                            <TouchableOpacity
                                onPress={() => setShowTemplateModal(false)}
                                className="w-8 h-8 items-center justify-center"
                                activeOpacity={0.6}
                            >
                                <X size={22} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Compact Category Segmented Control */}
                    <View className="bg-card border-b border-sand-100 px-4 py-2.5">
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 16 }}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedCategory('all')}
                                className={`px-3.5 py-1.5 rounded-full mr-2 ${
                                    selectedCategory === 'all' 
                                        ? 'bg-[#4A6741]' 
                                        : 'bg-transparent'
                                }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-sm ${
                                    selectedCategory === 'all' 
                                        ? 'text-white font-bold' 
                                        : 'text-muted-foreground font-medium'
                                }`}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {TEMPLATE_CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    onPress={() => setSelectedCategory(category.id)}
                                    className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 ${
                                        selectedCategory === category.id 
                                            ? 'bg-[#4A6741]' 
                                            : 'bg-transparent'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`text-sm ${
                                        selectedCategory === category.id 
                                            ? 'text-white font-bold' 
                                            : 'text-muted-foreground font-medium'
                                    }`}>
                                        {category.icon} {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Template List - Clean Card Layout */}
                    <ScrollView className="flex-1 px-5 pt-3">
                        {ACTIVITY_TEMPLATES
                            .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
                            .map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    onPress={() => handleSelectTemplate(template)}
                                    className="bg-card border border-sand-200 rounded-xl mb-2.5 p-4 shadow-sm"
                                    activeOpacity={0.6}
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 2,
                                        elevation: 1,
                                    }}
                                >
                                    <View className="flex-row items-start justify-between">
                                        {/* Left: Icon + Text Block */}
                                        <View className="flex-1 flex-row items-start mr-3">
                                            {/* Icon Badge */}
                                            <View className="w-9 h-9 bg-[#4A6741]/10 rounded-lg items-center justify-center mr-3">
                                                <Text className="text-base">{template.icon}</Text>
                                            </View>
                                            
                                            {/* Text Content */}
                                            <View className="flex-1">
                                                {/* Title */}
                                                <Text className="text-base font-semibold text-foreground leading-tight mb-0.5">
                                                    {template.title}
                                                </Text>
                                                
                                                {/* Description */}
                                                {template.description && (
                                                    <Text 
                                                        className="text-sm text-muted-foreground leading-snug mt-1" 
                                                        numberOfLines={2}
                                                    >
                                                        {template.description}
                                                    </Text>
                                                )}
                                                
                                                {/* Suggested Time Pills */}
                                                {template.suggestedTimes && template.suggestedTimes.length > 0 && (
                                                    <View className="flex-row items-center mt-2">
                                                        <Clock size={12} color="#9CA3AF" />
                                                        <Text className="text-xs text-muted-foreground ml-1.5 font-medium">
                                                            {template.suggestedTimes[0]}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        
                                        {/* Right: Duration Indicator */}
                                        {template.defaultDuration && (
                                            <View className="bg-sand-100 px-2.5 py-1.5 rounded-lg">
                                                <Text className="text-xs font-semibold text-foreground">
                                                    {template.defaultDuration}m
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        
                        {/* Empty State */}
                        {ACTIVITY_TEMPLATES.filter(t => selectedCategory === 'all' || t.category === selectedCategory).length === 0 && (
                            <View className="flex-1 items-center justify-center py-16">
                                <View className="w-16 h-16 bg-sand-100 rounded-full items-center justify-center mb-3">
                                    <AlertCircle size={28} color="#9CA3AF" />
                                </View>
                                <Text className="text-muted-foreground text-sm font-medium">No templates in this category</Text>
                            </View>
                        )}
                        
                        {/* Bottom Padding */}
                        <View className="h-6" />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
