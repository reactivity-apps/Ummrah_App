/**
 * ItineraryManager Component
 * 
 * Main orchestrator for managing trip itinerary items.
 * Coordinates between edit modal, template picker, and item list.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Plus, AlertCircle, Calendar } from 'lucide-react-native';
import { ItineraryItemInput } from '../../lib/api/services/itinerary.service';
import { ItineraryItemRow } from '../../types/db';
import { ActivityTemplate } from '../ActivityTemplates';
import ItineraryItemCard from './ItineraryItemCard';
import ItineraryEditModal, { EditingItem } from './ItineraryEditModal';
import TemplatePickerModal from './TemplatePickerModal';

interface ItineraryManagerProps {
    tripId: string;
    tripName?: string;
    items: ItineraryItemRow[];
    loading: boolean;
    error: string | null;
    isAdmin: boolean;
    checkingPermissions: boolean;
    createItem: (input: ItineraryItemInput) => Promise<boolean>;
    updateItem: (itemId: string, updates: Partial<ItineraryItemInput>, optimistic?: boolean) => Promise<boolean>;
    deleteItem: (itemId: string, optimistic?: boolean) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export default function ItineraryManager({
    tripId,
    tripName,
    items,
    loading,
    error,
    isAdmin,
    checkingPermissions,
    createItem,
    updateItem,
    deleteItem,
    refresh,
}: ItineraryManagerProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [selectedDateForTemplate, setSelectedDateForTemplate] = useState<string>('');

    // Group items by day
    const groupedItems = items.reduce((acc, item) => {
        const day = item.day_date || 'No Date';
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {} as Record<string, ItineraryItemRow[]>);

    const sortedDays = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return a.localeCompare(b);
    });

    // Handlers
    const handleCreateNew = () => {
        setEditingItem({
            trip_id: tripId,
            title: '',
            description: '',
            location: '',
            day_date: '',
            starts_at: '',
            ends_at: '',
            isNew: true,
        });
        setShowEditModal(true);
    };

    const handleSelectTemplate = (template: ActivityTemplate) => {
        setShowTemplateModal(false);

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
                        if (success) Alert.alert('Success', 'Item deleted successfully');
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!editingItem) return;

        if (!editingItem.title?.trim()) {
            Alert.alert('Validation Error', 'Title is required');
            return;
        }

        setSaving(true);

        try {
            let success = false;

            if (editingItem.isNew) {
                const input: ItineraryItemInput = {
                    trip_id: tripId,
                    title: editingItem.title,
                    description: editingItem.description,
                    location: editingItem.location,
                    day_date: editingItem.day_date || null,
                    starts_at: editingItem.starts_at || null,
                    ends_at: editingItem.ends_at || null,
                };
                success = await createItem(input);
            } else {
                success = await updateItem(
                    editingItem.id!,
                    {
                        title: editingItem.title,
                        description: editingItem.description,
                        location: editingItem.location,
                        day_date: editingItem.day_date,
                        starts_at: editingItem.starts_at,
                        ends_at: editingItem.ends_at,
                    },
                    true
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

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Permission checks
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
                    You need admin permissions to manage the itinerary.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-sand-50">
            

            {/* Action Buttons */}
            <View className="bg-card border-b border-[#C5A059]/10 px-4 py-3 flex-row gap-2">
                <TouchableOpacity
                    onPress={handleCreateNew}
                    className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <Plus size={18} color="#4A6741" />
                    <Text className="text-[#4A6741] font-semibold ml-2">Add Item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowTemplateModal(true)}
                    className="flex-1 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <Calendar size={18} color="#C5A059" />
                    <Text className="text-[#C5A059] font-semibold ml-2">Templates</Text>
                </TouchableOpacity>
            </View>

            {/* Itinerary List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A6741" />
                    <Text className="text-muted-foreground mt-4">Loading itinerary...</Text>
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <View className="bg-card rounded-xl p-8 border border-[#C5A059]/20 border-dashed">
                        <View className="items-center">
                            <Calendar size={48} color="hsl(40 5% 70%)" />
                            <Text className="text-foreground font-semibold text-lg mt-4">No Activities Yet</Text>
                            <Text className="text-sm text-muted-foreground mt-2 text-center">
                                Add your first activity or choose from templates
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
                    {sortedDays.map((day) => (
                        <View key={day} className="mb-6">
                            <View className="flex-row items-center mb-3">
                                <View className="px-3 py-1.5 rounded-full bg-sand-200">
                                    <Text className="font-bold text-sm text-foreground">
                                        {day === 'No Date' ? 'Unscheduled' : formatDate(day)}
                                    </Text>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-xs text-muted-foreground">
                                        {groupedItems[day].length} {groupedItems[day].length === 1 ? 'activity' : 'activities'}
                                    </Text>
                                </View>
                            </View>
                            <View className="ml-6 border-l-2 border-sand-200">
                                {groupedItems[day].map((item) => (
                                    <ItineraryItemCard
                                        key={item.id}
                                        item={item}
                                        isExpanded={expandedItems.has(item.id!)}
                                        onToggle={toggleExpanded}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modals */}
            <ItineraryEditModal
                visible={showEditModal}
                editingItem={editingItem}
                saving={saving}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                }}
                onSave={handleSave}
                onUpdate={setEditingItem}
            />

            <TemplatePickerModal
                visible={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                onSelectTemplate={handleSelectTemplate}
                selectedDate={selectedDateForTemplate}
            />
        </View>
    );
}
