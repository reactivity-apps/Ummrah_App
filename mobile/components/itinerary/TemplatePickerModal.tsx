/**
 * TemplatePickerModal Component
 * 
 * Modal for selecting activity templates
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Clock, AlertCircle } from 'lucide-react-native';
import { ACTIVITY_TEMPLATES, TEMPLATE_CATEGORIES, ActivityTemplate } from '../ActivityTemplates';

interface TemplatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectTemplate: (template: ActivityTemplate) => void;
}

export default function TemplatePickerModal({
    visible,
    onClose,
    onSelectTemplate,
}: TemplatePickerModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredTemplates = ACTIVITY_TEMPLATES.filter(
        t => selectedCategory === 'all' || t.category === selectedCategory
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-sand-50">
                {/* Modal Header */}
                <View className="bg-card border-b border-sand-200 px-5 py-3.5">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-foreground">Activity Templates</Text>
                        <TouchableOpacity
                            onPress={onClose}
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
                            className={`px-3.5 py-1.5 rounded-full mr-2 ${selectedCategory === 'all'
                                    ? 'bg-[#4A6741]'
                                    : 'bg-transparent'
                                }`}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-sm ${selectedCategory === 'all'
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
                                className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 ${selectedCategory === category.id
                                        ? 'bg-[#4A6741]'
                                        : 'bg-transparent'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-sm ${selectedCategory === category.id
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
                    {filteredTemplates.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            onPress={() => onSelectTemplate(template)}
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
                    {filteredTemplates.length === 0 && (
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
    );
}
