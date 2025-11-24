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

import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, withRepeat, withSequence, Easing } from "react-native-reanimated";
import { useState, useEffect } from "react";
import { Home, Calendar, LayoutGrid, MessageCircle, Clock, Map, Phone, User, Shield, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    green: '#4A6741',
    gold: '#C5A059',
    white: '#FFFFFF',
    backdrop: 'rgba(253, 251, 247, 0.95)',
};

const FAB_SIZE = 80;
const ITEM_SIZE = 75;
const RADIUS = 210; // Increased for better spacing
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

    // Animated style for expand/collapse

    const animatedStyle = useAnimatedStyle(() => {
        const scale = withDelay(delay, withSpring(isOpen ? 1 : 0));
        const opacity = withDelay(delay, withTiming(isOpen ? 1 : 0));
        const translateX = withDelay(delay, withSpring(isOpen ? x : 0));
        const translateY = withDelay(delay, withSpring(isOpen ? y : 0));

        return {
            opacity,
            transform: [
                { translateX },
                { translateY },
                { scale }
            ]
        };
    });

    return (
        <Animated.View style={[styles.menuItemContainer, animatedStyle]}>
            <TouchableOpacity onPress={onPress} style={styles.menuItem}>
                {/* Icon Circle */}
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <item.icon size={22} color="white" />
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
    const rotation = useSharedValue(0);
    const breathing = useSharedValue(1);

    // Breathing animation for FAB when closed

    useEffect(() => {
        breathing.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    // Toggle menu open/closed
    const toggleMenu = () => {
        const newValue = !isOpen;
        setIsOpen(newValue);
        rotation.value = withSpring(newValue ? 45 : 0);
    };

    // Handle menu item press
    const handlePress = (route: string) => {
        toggleMenu();
        setTimeout(() => {
            router.push(route as any);
        }, 100);
    };

    // FAB rotation and breathing animation

    const fabStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: isOpen ? 1 : breathing.value }
            ]
        };
    });

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
                {MENU_ITEMS.map((item, index) => (
                    <RadialMenuItem
                        key={item.id}
                        item={item}
                        index={index}
                        totalItems={MENU_ITEMS.length}
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
                <Animated.View style={[styles.fab, fabStyle]}>
                    <View style={styles.fabIcon}>
                        {isOpen ? (
                            <X size={36} color="white" />
                        ) : (
                            <KaabaIcon size={36} color="white" />
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
        height: RADIUS * 2 + 120,
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
        bottom: 50,
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
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    labelContainer: {
        position: 'absolute',
        top: 62,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(74, 103, 65, 0.1)',
        minWidth: 70,
        alignItems: 'center',
    },
    label: {
        fontSize: 10.5,
        fontWeight: '700',
        color: '#4A6741',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    fabContainer: {
        marginBottom: 30,
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
