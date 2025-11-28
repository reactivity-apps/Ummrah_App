/**
 * RadialMenu Component
 * 
 * A circular radial navigation menu that appears at the bottom of the screen.
 * Features:
 * - 8 navigation items arranged in a semi-circle
 * - Animated expand/collapse with spring animations
 * - Breathing animation on the FAB when closed
 * - Alternating green and gold color scheme
 */

import { View, TouchableOpacity, StyleSheet, Text, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Home, Calendar, LayoutGrid, MessageCircle, Clock, Map, Phone, User, Shield, X } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";
import { useTrip } from "../lib/context/TripContext";

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    green: '#4A6741',
    gold: '#C5A059',
    white: '#FFFFFF',
    backdrop: 'rgba(253, 251, 247, 0.95)',
};

const FAB_SIZE = 64;
const ITEM_SIZE = 60;
const RADIUS = 150; // Reduced for mobile screens
const KaabaIcon = ({ size = 32, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="5" width="16" height="15" rx="2" fill={color} />
        <Path d="M4 9H20" stroke={color === "white" ? "#4A6741" : "white"} strokeWidth="2" strokeOpacity="0.4" />
        <Path d="M7 5V9" stroke={color === "white" ? "#4A6741" : "white"} strokeWidth="1.5" strokeOpacity="0.3" />
        <Path d="M12 14H16" stroke={color === "white" ? "#4A6741" : "white"} strokeWidth="1.5" strokeOpacity="0.3" />
    </Svg>
);

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

// Menu Items Configuration
const MENU_ITEMS = [
    { id: 'today', label: 'Today', icon: Home, route: '/(tabs)', color: COLORS.green },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar, route: '/itinerary', color: COLORS.gold },
    { id: 'murshid', label: 'Murshid', icon: MessageCircle, route: '/(tabs)/murshid', color: COLORS.green },
    { id: 'prayer', label: 'Prayers', icon: Clock, route: '/prayers', color: COLORS.gold },
    { id: 'map', label: 'Map', icon: Map, route: '/(tabs)/map', color: COLORS.green },
    { id: 'admin', label: 'Admin', icon: Shield, route: '/(tabs)/admin', color: COLORS.gold },
    { id: 'profile', label: 'Profile', icon: User, route: '/(tabs)/profile', color: COLORS.green },
];

// ============================================================================
// RADIAL MENU ITEM COMPONENT
// ============================================================================

const RadialMenuItem = ({ item, index, isOpen, totalItems, onPress, delay }: any) => {
    // Calculate position on arc (semi-circle from left to right)
    // Adjusted for 7 items to provide better spacing
    const startAngle = -170; // Start angle (left side)
    const endAngle = -10;    // End angle (right side)
    const angleRange = endAngle - startAngle;
    const angleStep = angleRange / (totalItems - 1);
    const angleDeg = startAngle + (index * angleStep);
    const angleRad = (angleDeg * Math.PI) / 180;

    // Calculate x and y position
    const x = RADIUS * Math.cos(angleRad);
    const y = RADIUS * Math.sin(angleRad);

    // Animated values
    const animatedScale = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedX = useRef(new Animated.Value(0)).current;
    const animatedY = useRef(new Animated.Value(0)).current;

    // Animate when isOpen changes
    useEffect(() => {
        Animated.parallel([
            Animated.spring(animatedScale, {
                toValue: isOpen ? 1 : 0,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(animatedOpacity, {
                toValue: isOpen ? 1 : 0,
                delay,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(animatedX, {
                toValue: isOpen ? x : 0,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(animatedY, {
                toValue: isOpen ? y : 0,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen]);

    return (
        <Animated.View
            style={[
                styles.menuItemContainer,
                {
                    opacity: animatedOpacity,
                    transform: [
                        { translateX: animatedX },
                        { translateY: animatedY },
                        { scale: animatedScale },
                    ],
                },
            ]}
        >
            <TouchableOpacity onPress={onPress} style={styles.menuItem}>
                {/* Icon Circle */}
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <item.icon size={18} color="white" />
                </View>

                {/* Label */}
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{item.label}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MAIN RADIAL MENU COMPONENT
// ============================================================================

export default function RadialMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const rotation = useRef(new Animated.Value(0)).current;
    const breathing = useRef(new Animated.Value(1)).current;
    const { currentTrip, currentTripRole } = useTrip();

    // Hide RadialMenu on murshid screen
    if (pathname === '/(tabs)/murshid') {
        return null;
    }

    // Filter menu items based on user role
    const isAdmin = currentTripRole === 'group_owner' || currentTripRole === 'super_admin';
    const visibleMenuItems = MENU_ITEMS.filter(item => {
        if (item.id === 'admin') {
            return isAdmin;
        }
        return true;
    });

    // Breathing animation for FAB when closed
    useEffect(() => {
        const breathingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(breathing, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(breathing, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        breathingAnimation.start();

        return () => breathingAnimation.stop();
    }, []);

    // Toggle menu open/closed
    const toggleMenu = () => {
        const newValue = !isOpen;
        setIsOpen(newValue);
        Animated.spring(rotation, {
            toValue: newValue ? 45 : 0,
            useNativeDriver: true,
        }).start();
    };

    // Handle menu item press
    const handlePress = (route: string) => {
        toggleMenu();
        setTimeout(() => {
            router.push(route as any);
        }, 100);
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop - appears when menu is open */}
            {isOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={toggleMenu}
                    style={styles.backdrop}
                />
            )}

            {/* Menu Items Container */}
            <View style={styles.itemsContainer} pointerEvents="box-none">
                {visibleMenuItems.map((item, index) => (
                    <RadialMenuItem
                        key={item.id}
                        item={item}
                        index={index}
                        totalItems={visibleMenuItems.length}
                        isOpen={isOpen}
                        onPress={() => handlePress(item.route)}
                        delay={index * 30}
                    />
                ))}
            </View>

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleMenu}
                style={styles.fabContainer}
            >
                <Animated.View
                    style={[
                        styles.fab,
                        {
                            transform: [
                                {
                                    rotate: rotation.interpolate({
                                        inputRange: [0, 45],
                                        outputRange: ['0deg', '45deg'],
                                    }),
                                },
                                { scale: isOpen ? 1 : breathing },
                            ],
                        },
                    ]}
                >
                    <View style={styles.fabIcon}>
                        {isOpen ? (
                            <X size={28} color="white" />
                        ) : (
                            <KaabaIcon size={28} color="white" />
                        )}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: RADIUS * 2 + 80,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    backdrop: {
        position: 'absolute',
        top: -1000,
        left: -1000,
        right: -1000,
        bottom: 0,
        backgroundColor: 'rgba(253, 251, 247, 0.95)',
    },
    itemsContainer: {
        position: 'absolute',
        bottom: 35,
        alignItems: 'center',
        justifyContent: 'center',
        width: 0,
        height: 0,
    },
    menuItemContainer: {
        position: 'absolute',
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -ITEM_SIZE / 2,
        marginTop: -ITEM_SIZE / 2,
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    labelContainer: {
        position: 'absolute',
        top: 50,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(74, 103, 65, 0.1)',
        minWidth: 60,
        alignItems: 'center',
    },
    label: {
        fontSize: 9,
        fontWeight: '700',
        color: '#4A6741',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    fabContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: '#4A6741',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: "#4A6741",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 10,
    },
    fabIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
