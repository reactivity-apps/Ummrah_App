/**
 * ItineraryItemCard Component
 * 
 * Displays a single itinerary item with expand/collapse functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Edit3, Trash2, GripVertical } from 'lucide-react-native';
import { ItineraryItemRow } from '../../types/db';

interface ItineraryItemCardProps {
    item: ItineraryItemRow;
    isExpanded: boolean;
    onToggle: (itemId: string) => void;
    onEdit: (item: ItineraryItemRow) => void;
    onDelete: (item: ItineraryItemRow) => void;
}

export default function ItineraryItemCard({
    item,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
}: ItineraryItemCardProps) {
    const formatTime = (datetime: string | null | undefined) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <View className="mb-3">
            <TouchableOpacity
                onPress={() => item.id && onToggle(item.id)}
                className="bg-card border border-sand-200 rounded-xl p-4 shadow-sm"
                activeOpacity={0.7}
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                        {/* Time and Title */}
                        <View className="flex-row items-center mb-2">
                            <View className="bg-[#4A6741]/10 px-2.5 py-1 rounded-md mr-2">
                                <Text className="text-xs font-bold text-[#4A6741]">
                                    {formatTime(item.starts_at)}
                                </Text>
                            </View>
                            <Text className="text-base font-bold text-foreground flex-1" numberOfLines={1}>
                                {item.title}
                            </Text>
                        </View>

                        {/* Location */}
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
                                onPress={() => onEdit(item)}
                                className="flex-1 bg-[#4A6741]/10 border border-[#4A6741]/20 rounded-lg py-2.5 flex-row items-center justify-center"
                            >
                                <Edit3 size={16} color="#4A6741" />
                                <Text className="text-[#4A6741] font-medium ml-2">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onDelete(item)}
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
}
