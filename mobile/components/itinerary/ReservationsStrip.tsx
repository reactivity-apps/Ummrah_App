import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import * as Icons from 'lucide-react-native';

interface ReservationType {
    id: string;
    label: string;
    icon: keyof typeof Icons;
    count: number;
}

interface ReservationsStripProps {
    reservations: ReservationType[];
    onAddReservation: (type: string) => void;
    onViewDetails: () => void;
    budget: number;
}

export default function ReservationsStrip({
    reservations,
    onAddReservation,
    onViewDetails,
    budget,
}: ReservationsStripProps) {
    const defaultReservations: ReservationType[] = [
        { id: 'flight', label: 'Flight', icon: 'PlaneIcon', count: 0 },
        { id: 'lodging', label: 'Lodging', icon: 'BedIcon', count: 0 },
        { id: 'transport', label: 'Transport', icon: 'BusIcon', count: 0 },
        { id: 'restaurant', label: 'Dining', icon: 'UtensilsIcon', count: 0 },
        { id: 'documents', label: 'Documents', icon: 'FileTextIcon', count: 0 },
    ];

    const mergedReservations = defaultReservations.map(def => {
        const found = reservations.find(r => r.id === def.id);
        return found || def;
    });

    const renderIcon = (iconName: keyof typeof Icons, color: string, size: number = 24) => {
        const IconComponent = Icons[iconName] as any;
        if (!IconComponent) return null;
        return <IconComponent size={size} color={color} />;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Reservations & Attachments</Text>

            <View style={styles.content}>
                <View style={styles.reservationsRow}>
                    {mergedReservations.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.reservationItem}
                            onPress={() => onAddReservation(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconWrapper}>
                                {renderIcon(item.icon, '#4a9d7e')}
                                {item.count > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.count}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.reservationLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.reservationItem}>
                        <View style={styles.iconWrapper}>
                            <Icons.MoreHorizontalIcon size={24} color="#6b7280" />
                        </View>
                        <Text style={styles.reservationLabel}>Other</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <Icons.DollarSignIcon size={20} color="#4a9d7e" />
                        <Text style={styles.budgetLabel}>Estimated Cost</Text>
                    </View>
                    <Text style={styles.budgetAmount}>
                        ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <TouchableOpacity onPress={onViewDetails} style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsText}>View details</Text>
                        <Icons.ArrowRightIcon size={14} color="#4a9d7e" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    content: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    reservationsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    reservationItem: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ffffff',
    },
    reservationLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 20,
    },
    budgetCard: {
        alignItems: 'center',
        gap: 8,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    budgetLabel: {
        fontSize: 13,
        color: '#6b7280',
    },
    budgetAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2d5f4c',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#4a9d7e',
        fontWeight: '600',
    },
});
