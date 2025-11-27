/**
 * ItineraryManager Component
 * 
 * Main orchestrator for managing trip itinerary items.
 * Coordinates between edit modal, template picker, and item list.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Plus, AlertCircle, Calendar } from 'lucide-react-native';
import { useItinerary } from '../lib/api/hooks/useItinerary';
import { ItineraryItemInput } from '../lib/api/services/itinerary.service';
import { ItineraryItemRow } from '../types/db';
import { ActivityTemplate } from './ActivityTemplates';
import ItineraryItemCard from './itinerary/ItineraryItemCard';
import ItineraryEditModal, { EditingItem } from './itinerary/ItineraryEditModal';
import TemplatePickerModal from './itinerary/TemplatePickerModal';

interface ItineraryManagerProps {
    tripId: string;
    tripName?: string;
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
        refresh,
    } = useItinerary({
        tripId,
        enableRealtime: true,
        onError: (err) => Alert.alert('Error', err),
        onConflict: () => {
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
            sort_order: items.length,
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
                    sort_order: editingItem.sort_order ?? items.length,
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
                        sort_order: editingItem.sort_order,
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
            {/* Header */}
            <View className="bg-card border-b border-sand-200 px-4 py-4">
                <Text className="text-xl font-bold text-foreground mb-1">Itinerary</Text>
                {tripName && <Text className="text-sm text-muted-foreground">{tripName}</Text>}
            </View>

            {/* Action Buttons */}
            <View className="bg-card border-b border-sand-100 px-4 py-3 flex-row gap-2">
                <TouchableOpacity
                    onPress={handleCreateNew}
                    className="flex-1 bg-[#4A6741] rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <Plus size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Add Item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowTemplateModal(true)}
                    className="flex-1 bg-teal-600 rounded-lg py-2.5 flex-row items-center justify-center"
                >
                    <Calendar size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Templates</Text>
                </TouchableOpacity>
            </View>

            {/* Itinerary List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A6741" />
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center p-4">
                    <AlertCircle size={48} color="#CBD5E0" />
                    <Text className="text-foreground font-semibold text-lg mt-4">No Items Yet</Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Add your first activity or choose from templates
                    </Text>
                </View>
            ) : (
                <ScrollView className="flex-1">
                    {sortedDays.map((day) => (
                        <View key={day} className="mb-4">
                            <View className="bg-[#4A6741] px-4 py-2">
                                <Text className="text-white font-bold text-sm">
                                    {day === 'No Date' ? day : formatDate(day)}
                                </Text>
                            </View>
                            <View className="px-4 pt-3">
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
            />
        </View>
    );
}
