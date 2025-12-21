import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DaySidebar, { Day } from '../components/itinerary/DaySidebar';
import ExploreStrip, { ExploreTemplate } from '../components/itinerary/ExploreStrip';
import ReservationsStrip from '../components/itinerary/ReservationsStrip';
import ActivityCard, { Activity } from '../components/itinerary/ActivityCard';
import * as Icons from 'lucide-react-native';

export default function ItineraryBuilder() {
    const router = useRouter();
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [selectedDayId, setSelectedDayId] = useState('day-1');
    const [notes, setNotes] = useState('');

    // Sample data - replace with real data from your API
    const days: Day[] = [
        { id: 'day-1', date: 'Dec 20', label: 'Day 1', phase: 'Travel to Makkah', progress: 75, itemCount: 3 },
        { id: 'day-2', date: 'Dec 21', label: 'Day 2', phase: 'Ihram & Tawaf', progress: 50, itemCount: 4 },
        { id: 'day-3', date: 'Dec 22', label: 'Day 3', phase: "Sa'i & Ziyarat", progress: 100, itemCount: 5 },
        { id: 'day-4', date: 'Dec 23', label: 'Day 4', phase: 'Rest & Prayers', progress: 25, itemCount: 2 },
        { id: 'day-5', date: 'Dec 24', label: 'Day 5', phase: 'Travel to Madinah', progress: 0, itemCount: 0 },
        { id: 'day-6', date: 'Dec 25', label: 'Day 6', phase: 'Masjid an-Nabawi', progress: 60, itemCount: 3 },
        { id: 'day-7', date: 'Dec 26', label: 'Day 7', phase: 'Return Journey', progress: 80, itemCount: 2 },
    ];

    const activities: Activity[] = [
        {
            id: '1',
            title: 'Fajr Prayer',
            time: '05:00 AM',
            duration: '30 min',
            category: 'Prayer',
            location: 'Masjid al-Haram',
            description: 'Early morning prayer at the Grand Mosque',
            categoryColor: '#6366f1',
            icon: 'MoonIcon',
            type: 'ritual',
            isLocked: false,
        },
        {
            id: '2',
            title: 'Group Breakfast',
            time: '07:00 AM',
            duration: '1 hour',
            category: 'Meal',
            location: 'Hotel Restaurant',
            categoryColor: '#ec4899',
            icon: 'UtensilsIcon',
            type: 'logistics',
        },
        {
            id: '3',
            title: 'Tawaf (Circling Kaaba)',
            time: '09:00 AM',
            duration: '2 hours',
            category: 'Ritual',
            location: 'Holy Kaaba',
            description: 'Perform Tawaf - circling the Holy Kaaba 7 times',
            categoryColor: '#4a9d7e',
            icon: 'RefreshCwIcon',
            type: 'ritual',
            isSuggested: true,
        },
    ];

    const reservations = [
        { id: 'flight', label: 'Flight', icon: 'PlaneIcon' as const, count: 2 },
        { id: 'lodging', label: 'Lodging', icon: 'BedIcon' as const, count: 1 },
        { id: 'transport', label: 'Transport', icon: 'BusIcon' as const, count: 3 },
        { id: 'restaurant', label: 'Dining', icon: 'UtensilsIcon' as const, count: 5 },
        { id: 'documents', label: 'Documents', icon: 'FileTextIcon' as const, count: 4 },
    ];

    const selectedDay = days.find(d => d.id === selectedDayId) || days[0];

    const handleTemplateSelect = (template: ExploreTemplate) => {
        console.log('Selected template:', template);
        // TODO: Open modal to add activity from template
    };

    const handleAddActivity = () => {
        console.log('Add custom activity');
        // TODO: Open modal to add custom activity
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.layout}>
                {/* Sidebar */}
                <DaySidebar
                    days={days}
                    selectedDayId={selectedDayId}
                    onSelectDay={setSelectedDayId}
                    tripName="Umrah Journey 2025"
                    dateRange="Dec 20 - Dec 27"
                    isVisible={sidebarVisible}
                    onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
                />

                {/* Main Content */}
                <ScrollView
                    style={styles.mainContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentPadding}>
                        {/* Header */}
                        <View style={styles.pageHeader}>
                            <View>
                                <Text style={styles.pageTitle}>{selectedDay.label} - {selectedDay.phase}</Text>
                                <Text style={styles.pageSubtitle}>{selectedDay.date}, 2025</Text>
                            </View>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                                <Icons.PlusIcon size={20} color="#ffffff" />
                                <Text style={styles.addButtonText}>Add Activity</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Explore Strip */}
                        <ExploreStrip
                            onSelectTemplate={handleTemplateSelect}
                            onBrowseAll={() => console.log('Browse all')}
                        />

                        {/* Today's Schedule */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                                <Text style={styles.sectionCount}>{activities.length} activities</Text>
                            </View>

                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        onPress={() => console.log('View:', activity.title)}
                                        onEdit={() => console.log('Edit:', activity.title)}
                                        onDelete={() => console.log('Delete:', activity.title)}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icons.CalendarIcon size={48} color="#d1d5db" />
                                    <Text style={styles.emptyText}>No activities scheduled</Text>
                                    <Text style={styles.emptySubtext}>
                                        Add activities from templates above or create custom ones
                                    </Text>
                                    <TouchableOpacity style={styles.emptyButton} onPress={handleAddActivity}>
                                        <Text style={styles.emptyButtonText}>Add First Activity</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Reservations & Attachments */}
                        <ReservationsStrip
                            reservations={reservations}
                            onAddReservation={(type: string) => console.log('Add:', type)}
                            onViewDetails={() => console.log('View budget details')}
                            budget={4250.00}
                        />

                        {/* Notes Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Notes</Text>
                                <Text style={styles.autoSaveText}>Auto-saved</Text>
                            </View>
                            <View style={styles.notesCard}>
                                <View style={styles.notesHeader}>
                                    <Icons.FileTextIcon size={20} color="#6b7280" />
                                    <Text style={styles.notesTitle}>Day notes & reflections</Text>
                                </View>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Add notes, reminders, or reflections for this day..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={4}
                                    value={notes}
                                    onChangeText={setNotes}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Bottom spacing */}
                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8faf9',
    },
    layout: {
        flex: 1,
        flexDirection: 'row',
    },
    mainContent: {
        flex: 1,
    },
    contentPadding: {
        paddingVertical: 20,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4a9d7e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#4a9d7e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    sectionCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    autoSaveText: {
        fontSize: 12,
        color: '#4a9d7e',
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 48,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: 12,
        backgroundColor: '#4a9d7e',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    notesCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    notesInput: {
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 20,
        minHeight: 80,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
});
