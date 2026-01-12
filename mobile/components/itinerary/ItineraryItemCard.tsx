/**
 * ItineraryItemCard Component
 * 
 * Displays a single itinerary item with expand/collapse functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Edit3, Trash2, GripVertical } from 'lucide-react-native';
import { ItineraryItemRow } from '../../types/db';
import { ActivityIcon, getActivityType } from '../../lib/itineraryUtils';
import { formatTime } from '../../lib/utils';

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
    return (
        <View className="relative pl-6 pb-4">
            {/* Timeline Dot */}
            <View
                className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 bg-card border-sand-300"
                style={{ transform: [{ translateX: -7 }] }}
            />

            <TouchableOpacity
                onPress={() => item.id && onToggle(item.id)}
                className="bg-card border border-[#C5A059]/30 rounded-xl p-3.5"
                activeOpacity={0.7}
            >
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                        <View className="mr-2">
                            <ActivityIcon title={item.title} />
                        </View>
                        {item.starts_at && (
                            <Text className="text-xs text-muted-foreground font-semibold">
                                {formatTime(item.starts_at)}
                            </Text>
                        )}
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="px-2 py-0.5 rounded-full bg-sand-100">
                            <Text className="text-xs font-medium text-foreground">
                                {getActivityType(item.title)}
                            </Text>
                        </View>
                        <GripVertical size={20} color="#C5A059" />
                    </View>
                </View>

                <Text className="text-foreground font-semibold leading-5 mb-1">
                    {item.title}
                </Text>

                {item.description && (
                    <Text className="text-xs text-muted-foreground mt-1">
                        {item.description}
                    </Text>
                )}

                {/* Location */}
                {item.location && (
                    <View className="flex-row items-center mt-2">
                        <MapPin size={12} color="hsl(40 5% 55%)" />
                        <Text className="text-muted-foreground text-xs ml-1">
                            {item.location}
                        </Text>
                    </View>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <View className="mt-3 pt-3 border-t border-[#C5A059]/10">
                        {item.description && (
                            <View className="mb-3">
                                <Text className="text-xs text-[#C5A059] font-medium mb-1">
                                    DESCRIPTION
                                </Text>
                                <Text className="text-foreground text-sm leading-5">
                                    {item.description}
                                </Text>
                            </View>
                        )}

                        {item.ends_at && (
                            <View className="mb-3">
                                <Text className="text-xs text-[#C5A059] font-medium mb-1">
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
                                className="flex-1 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-lg py-2.5 flex-row items-center justify-center"
                            >
                                <Edit3 size={16} color="#C5A059" />
                                <Text className="text-[#C5A059] font-medium ml-2">Edit</Text>
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
