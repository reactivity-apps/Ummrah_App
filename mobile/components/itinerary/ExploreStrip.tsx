import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

export interface ExploreTemplate {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Icons;
    color: string;
    gradient: string[];
}

interface ExploreStripProps {
    onSelectTemplate: (template: ExploreTemplate) => void;
    onBrowseAll: () => void;
}

const UMRAH_TEMPLATES: ExploreTemplate[] = [
    {
        id: 'ihram',
        title: 'Ihram',
        subtitle: 'Enter sacred state',
        icon: 'ShirtIcon',
        color: '#6366f1',
        gradient: ['#6366f1', '#8b5cf6'],
    },
    {
        id: 'tawaf',
        title: 'Tawaf',
        subtitle: 'Circle the Kaaba',
        icon: 'RefreshCwIcon',
        color: '#4a9d7e',
        gradient: ['#4a9d7e', '#059669'],
    },
    {
        id: 'sai',
        title: "Sa'i",
        subtitle: 'Safa & Marwa',
        icon: 'FootprintsIcon',
        color: '#f59e0b',
        gradient: ['#f59e0b', '#d97706'],
    },
    {
        id: 'ziyarat',
        title: 'Ziyarat',
        subtitle: 'Visit holy sites',
        icon: 'MapPinIcon',
        color: '#8b5cf6',
        gradient: ['#8b5cf6', '#7c3aed'],
    },
    {
        id: 'prayers',
        title: 'Prayer Times',
        subtitle: 'Schedule salah',
        icon: 'MoonIcon',
        color: '#06b6d4',
        gradient: ['#06b6d4', '#0891b2'],
    },
    {
        id: 'meal',
        title: 'Group Meal',
        subtitle: 'Organize dining',
        icon: 'UtensilsIcon',
        color: '#ec4899',
        gradient: ['#ec4899', '#db2777'],
    },
    {
        id: 'hotel',
        title: 'Accommodation',
        subtitle: 'Hotel check-in/out',
        icon: 'BedIcon',
        color: '#14b8a6',
        gradient: ['#14b8a6', '#0d9488'],
    },
    {
        id: 'transport',
        title: 'Transport',
        subtitle: 'Bus, flight, taxi',
        icon: 'BusIcon',
        color: '#f97316',
        gradient: ['#f97316', '#ea580c'],
    },
];

export default function ExploreStrip({
    onSelectTemplate,
    onBrowseAll,
}: ExploreStripProps) {
    const renderIcon = (iconName: keyof typeof Icons, color: string) => {
        const IconComponent = Icons[iconName] as any;
        if (!IconComponent) return null;
        return <IconComponent size={28} color={color} />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Explore Activities</Text>
                    <Text style={styles.subtitle}>Quick-add from templates</Text>
                </View>
                <TouchableOpacity onPress={onBrowseAll} style={styles.browseButton}>
                    <Text style={styles.browseText}>Browse all</Text>
                    <ArrowRight size={16} color="#4a9d7e" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {UMRAH_TEMPLATES.map((template) => (
                    <TouchableOpacity
                        key={template.id}
                        onPress={() => onSelectTemplate(template)}
                        style={styles.card}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={template.gradient as [string, string]}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.iconContainer}>
                                {renderIcon(template.icon, '#ffffff')}
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{template.title}</Text>
                                <Text style={styles.cardSubtitle}>{template.subtitle}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4a9d7e20',
    },
    browseText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a9d7e',
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    card: {
        width: 180,
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        gap: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    cardSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
});
