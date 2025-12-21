import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

export interface Activity {
    id: string;
    title: string;
    time: string;
    duration: string;
    category: string;
    location?: string;
    description?: string;
    categoryColor: string;
    icon: keyof typeof Icons;
    isLocked?: boolean;
    isSuggested?: boolean;
    type?: 'ritual' | 'logistics' | 'personal';
}

interface ActivityCardProps {
    activity: Activity;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isDragging?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export default function ActivityCard({
    activity,
    onPress,
    onEdit,
    onDelete,
    isDragging = false,
    onDragStart,
    onDragEnd,
}: ActivityCardProps) {
    const [pan] = useState(new Animated.ValueXY());

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            onDragStart?.();
        },
        onPanResponderMove: Animated.event([null, { dy: pan.y }], {
            useNativeDriver: false,
        }),
        onPanResponderRelease: () => {
            onDragEnd?.();
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start();
        },
    });

    const renderIcon = (iconName: keyof typeof Icons, color: string, size: number = 20) => {
        const IconComponent = Icons[iconName] as any;
        if (!IconComponent) return null;
        return <IconComponent size={size} color={color} />;
    };

    const getTypeIndicator = () => {
        if (activity.isLocked) {
            return (
                <View style={styles.typeIndicator}>
                    <Icons.LockIcon size={12} color="#6b7280" />
                    <Text style={styles.typeText}>Locked</Text>
                </View>
            );
        }
        if (activity.isSuggested) {
            return (
                <View style={[styles.typeIndicator, { backgroundColor: '#fef3c7' }]}>
                    <Icons.LightbulbIcon size={12} color="#f59e0b" />
                    <Text style={[styles.typeText, { color: '#f59e0b' }]}>Suggested</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <Animated.View
            style={[
                styles.container,
                isDragging && styles.dragging,
                { transform: [{ translateY: pan.y }] },
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                style={styles.card}
                activeOpacity={0.9}
            >
                <View style={[styles.leftBar, { backgroundColor: activity.categoryColor }]} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View style={[styles.iconContainer, { backgroundColor: `${activity.categoryColor}20` }]}>
                                {renderIcon(activity.icon, activity.categoryColor)}
                            </View>
                            <View style={styles.titleContent}>
                                <View style={styles.titleWithBadge}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {activity.title}
                                    </Text>
                                    {getTypeIndicator()}
                                </View>
                                {activity.location && (
                                    <View style={styles.locationRow}>
                                        <Icons.MapPinIcon size={14} color="#6b7280" />
                                        <Text style={styles.location} numberOfLines={1}>
                                            {activity.location}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {!activity.isLocked && (
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                                    <Icons.Edit2Icon size={18} color="#6b7280" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                                    <Icons.Trash2Icon size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.timeInfo}>
                            <Icons.ClockIcon size={16} color="#6b7280" />
                            <Text style={styles.time}>{activity.time}</Text>
                            <Text style={styles.duration}>• {activity.duration}</Text>
                        </View>

                        <View style={[styles.categoryBadge, { backgroundColor: `${activity.categoryColor}15` }]}>
                            <Text style={[styles.categoryText, { color: activity.categoryColor }]}>
                                {activity.category}
                            </Text>
                        </View>
                    </View>

                    {activity.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {activity.description}
                        </Text>
                    )}
                </View>

                <View {...panResponder.panHandlers} style={styles.dragHandle}>
                    <Icons.GripVerticalIcon size={20} color="#d1d5db" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    dragging: {
        opacity: 0.7,
        transform: [{ scale: 1.02 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    leftBar: {
        width: 4,
    },
    content: {
        flex: 1,
        padding: 16,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleRow: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContent: {
        flex: 1,
        gap: 4,
    },
    titleWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
    },
    typeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
    },
    typeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6b7280',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 13,
        color: '#6b7280',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionButton: {
        padding: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    time: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    duration: {
        fontSize: 14,
        color: '#9ca3af',
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    dragHandle: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
