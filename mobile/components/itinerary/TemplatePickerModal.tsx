/**
 * TemplatePickerModal Component
 * 
 * Mobile-optimized modal for rapid activity addition
 * Design: "Tap → added → move on"
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Clock } from 'lucide-react-native';
import { ACTIVITY_TEMPLATES, TEMPLATE_CATEGORIES, ActivityTemplate } from '../ActivityTemplates';

interface TemplatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectTemplate: (template: ActivityTemplate) => void;
    selectedDate?: string; // ISO date string
}

export default function TemplatePickerModal({
    visible,
    onClose,
    onSelectTemplate,
    selectedDate,
}: TemplatePickerModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    // Format date for display
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'this day';
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Filter and sort templates
    const filteredTemplates = ACTIVITY_TEMPLATES
        .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
        .sort((a, b) => {
            // Sort by suggested time if available
            const timeA = a.suggestedTimes?.[0] || '12:00';
            const timeB = b.suggestedTimes?.[0] || '12:00';
            return timeA.localeCompare(timeB);
        });

    const handleSelectTemplate = (template: ActivityTemplate) => {
        // Haptic feedback
        Vibration.vibrate(10);

        // Visual feedback
        setLastAddedId(template.id);
        setTimeout(() => setLastAddedId(null), 800);

        // Add to itinerary
        onSelectTemplate(template);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-sand-50" edges={['top']}>
                {/* Sticky Header - Context Is King */}
                <View className="bg-white border-b border-sand-200">
                    <View className="px-5 py-4">
                        <View className="flex-row items-start justify-between mb-1">
                            <View className="flex-1 mr-3">
                                <Text className="text-xl font-bold text-foreground leading-tight">
                                    Add to {formatDate(selectedDate)}
                                </Text>
                                <Text className="text-sm text-muted-foreground mt-1">
                                    Tap an activity to add it to this day
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-9 h-9 items-center justify-center -mt-1"
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Horizontal Swipeable Chip Bar */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
                        className="border-t border-sand-100"
                        style={{ paddingTop: 12 }}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === 'all'
                                    ? 'bg-[#4A6741]'
                                    : 'bg-sand-100'
                                }`}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-sm font-semibold ${selectedCategory === 'all'
                                    ? 'text-white'
                                    : 'text-muted-foreground'
                                }`}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {TEMPLATE_CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => setSelectedCategory(category.id)}
                                className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${selectedCategory === category.id
                                        ? 'bg-[#4A6741]'
                                        : 'bg-sand-100'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className="text-base mr-1.5">{category.icon}</Text>
                                <Text className={`text-sm font-semibold ${selectedCategory === category.id
                                        ? 'text-white'
                                        : 'text-muted-foreground'
                                    }`}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Activity Cards - Optimized for Thumb */}
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredTemplates.map((template) => {
                        const isJustAdded = lastAddedId === template.id;

                        return (
                            <TouchableOpacity
                                key={template.id}
                                onPress={() => handleSelectTemplate(template)}
                                className={`mx-4 my-1.5 rounded-2xl overflow-hidden ${isJustAdded ? 'bg-[#4A6741]/10' : 'bg-white'
                                    }`}
                                activeOpacity={0.7}
                                style={{
                                    minHeight: 76,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="px-4 py-4">
                                    {/* Row 1: Icon + Title + Duration */}
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center flex-1 mr-3">
                                            {/* Icon */}
                                            <View className="w-10 h-10 bg-[#4A6741]/10 rounded-xl items-center justify-center mr-3">
                                                <Text className="text-xl">{template.icon}</Text>
                                            </View>

                                            {/* Title */}
                                            <Text className="text-base font-bold text-foreground flex-1">
                                                {template.title}
                                            </Text>
                                        </View>

                                        {/* Duration Pill */}
                                        {template.defaultDuration && (
                                            <View className="bg-sand-100 px-3 py-1.5 rounded-full">
                                                <Text className="text-xs font-semibold text-muted-foreground">
                                                    {template.defaultDuration}m
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Row 2: Time + Description */}
                                    <View className="ml-[52px]">
                                        {/* Time (larger, clearer) */}
                                        {template.suggestedTimes && template.suggestedTimes.length > 0 && (
                                            <View className="flex-row items-center mb-1">
                                                <Clock size={14} color="#4A6741" />
                                                <Text className="text-base font-semibold text-[#4A6741] ml-1.5">
                                                    {template.suggestedTimes[0]}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Description (single line) */}
                                        {template.description && (
                                            <Text
                                                className="text-sm text-muted-foreground leading-snug"
                                                numberOfLines={1}
                                            >
                                                {template.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Just Added Indicator */}
                                {isJustAdded && (
                                    <View className="absolute top-0 right-0 bg-[#4A6741] px-3 py-1 rounded-bl-xl">
                                        <Text className="text-xs font-bold text-white">Added ✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Empty State - Calm & Guiding */}
                    {filteredTemplates.length === 0 && (
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-5xl mb-3">📋</Text>
                            <Text className="text-muted-foreground text-base">
                                No templates yet for this category
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
