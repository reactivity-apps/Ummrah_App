import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface Day {
    id: string;
    date: string;
    label: string;
    phase: string;
    progress: number; // 0-100
    itemCount: number;
    isExpanded?: boolean;
}

interface DaySidebarProps {
    days: Day[];
    selectedDayId: string;
    onSelectDay: (dayId: string) => void;
    tripName: string;
    dateRange: string;
    isVisible: boolean;
    onToggleSidebar: () => void;
    onToggleDay?: (dayId: string) => void;
}

export default function DaySidebar({
    days,
    selectedDayId,
    onSelectDay,
    tripName,
    dateRange,
    isVisible,
    onToggleSidebar,
    onToggleDay,
}: DaySidebarProps) {
    if (!isVisible) {
        return (
            <TouchableOpacity
                style={styles.showButton}
                onPress={onToggleSidebar}
            >
                <ChevronRight size={24} color="#4A6741" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.sidebar}>
            {/* Trip Header */}
            <View style={styles.header}>
                <Text style={styles.tripName} numberOfLines={2}>
                    {tripName}
                </Text>
                <Text style={styles.dateRange}>{dateRange}</Text>
            </View>

            {/* Days List */}
            <ScrollView style={styles.daysList} showsVerticalScrollIndicator={false}>
                {days.map((day) => {
                    const isSelected = day.id === selectedDayId;
                    return (
                        <View key={day.id} style={styles.dayItemContainer}>
                            <TouchableOpacity
                                onPress={() => onSelectDay(day.id)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={isSelected ? ['#4a9d7e', '#3d8569'] : ['#ffffff', '#ffffff']}
                                    style={[
                                        styles.dayItem,
                                        isSelected && styles.dayItemActive,
                                    ]}
                                >
                                    <View style={styles.dayHeader}>
                                        <View style={styles.dayContent}>
                                            <Text style={[
                                                styles.dayLabel,
                                                isSelected && styles.dayLabelActive
                                            ]}>
                                                {day.label}
                                            </Text>
                                            <Text style={[
                                                styles.dayDate,
                                                isSelected && styles.dayDateActive
                                            ]}>
                                                {day.date}
                                            </Text>
                                        </View>

                                        {onToggleDay && (
                                            <TouchableOpacity
                                                onPress={() => onToggleDay(day.id)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                {day.isExpanded ? (
                                                    <ChevronDown size={20} color={isSelected ? '#ffffff' : '#6b7280'} />
                                                ) : (
                                                    <ChevronRight size={20} color={isSelected ? '#ffffff' : '#6b7280'} />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <Text style={[
                                        styles.dayPhase,
                                        isSelected && styles.dayPhaseActive
                                    ]}>
                                        {day.phase}
                                    </Text>

                                    {/* Progress Indicator */}
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBackground}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${day.progress}%`,
                                                        backgroundColor: isSelected ? '#ffffff' : '#4a9d7e',
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.itemCount,
                                            isSelected && styles.itemCountActive
                                        ]}>
                                            {day.itemCount} {day.itemCount === 1 ? 'item' : 'items'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Hide Sidebar Button */}
            <TouchableOpacity
                style={styles.hideSidebarButton}
                onPress={onToggleSidebar}
            >
                <ChevronRight size={20} color="#4A6741" style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.hideSidebarText}>Hide Sidebar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 280,
        backgroundColor: '#f8faf9',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    showButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    tripName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d5f4c',
        marginBottom: 4,
    },
    dateRange: {
        fontSize: 14,
        color: '#6b7280',
    },
    daysList: {
        flex: 1,
        padding: 12,
    },
    dayItemContainer: {
        marginBottom: 8,
    },
    dayItem: {
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dayItemActive: {
        borderColor: '#4a9d7e',
        borderWidth: 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayContent: {
        flex: 1,
    },
    dayLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    dayLabelActive: {
        color: '#ffffff',
    },
    dayDate: {
        fontSize: 13,
        color: '#6b7280',
    },
    dayDateActive: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    dayPhase: {
        fontSize: 12,
        color: '#4a9d7e',
        fontWeight: '500',
        marginBottom: 12,
    },
    dayPhaseActive: {
        color: '#ffffff',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBackground: {
        flex: 1,
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    itemCount: {
        fontSize: 11,
        color: '#6b7280',
        minWidth: 60,
    },
    itemCountActive: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    hideSidebarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 8,
        backgroundColor: '#ffffff',
    },
    hideSidebarText: {
        fontSize: 14,
        color: '#4A6741',
        fontWeight: '500',
    },
});
