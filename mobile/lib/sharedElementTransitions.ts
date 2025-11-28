/**
 * Shared Element Transition Utilities
 * 
 * Provides smooth, spiritual transitions between list items and detail screens.
 * Uses React Native's Animated API for smooth animations.
 * 
 * Usage:
 * 1. Wrap shared elements with Animated component
 * 2. Apply the returned animated styles
 * 3. Navigation automatically handles the transition
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Navigation timing constants
 */
const NAVIGATION_TIMING = {
    STANDARD: 300,
    SHARED_ELEMENT: 350,
};

/**
 * Shared element transition configuration
 * Calm spring physics for natural, spiritual feel
 */
const SHARED_ELEMENT_CONFIG = {
    duration: NAVIGATION_TIMING.SHARED_ELEMENT,
    easing: Easing.inOut(Easing.ease),
};

/**
 * Gentle spring config for shared elements
 * No bounce - smooth and calm
 */
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 90,
    mass: 1,
    overshootClamping: true, // No bounce/overshoot
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

/**
 * Hook for fade-in animation on screen mount
 * Used for detail screens after shared element transition
 */
export function useFadeIn(delay = 0) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        // Gentle fade-in from slightly below
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: NAVIGATION_TIMING.STANDARD,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                ...SPRING_CONFIG,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return {
        opacity,
        transform: [{ translateY }],
    };
}

/**
 * Hook for scale animation on press
 * Provides tactile feedback before navigation
 */
export function usePressScale() {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.97,
            damping: 15,
            stiffness: 150,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            damping: 15,
            stiffness: 150,
            useNativeDriver: true,
        }).start();
    };

    const animatedStyle = {
        transform: [{ scale }],
    };

    return { animatedStyle, onPressIn, onPressOut };
}

/**
 * Hook for hero image expansion on detail screen
 * Creates smooth transition from card to full hero
 */
export function useHeroExpansion(isExpanded: boolean) {
    const height = useRef(new Animated.Value(isExpanded ? 256 : 192)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isExpanded) {
            Animated.parallel([
                Animated.timing(height, {
                    toValue: 256,
                    duration: NAVIGATION_TIMING.SHARED_ELEMENT,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false, // height animation cannot use native driver
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: NAVIGATION_TIMING.STANDARD,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isExpanded]);

    return {
        height,
        opacity,
    };
}

/**
 * Hook for staggered list item animations
 * Each item fades in sequentially for calm appearance
 */
export function useStaggeredFadeIn(index: number, totalItems: number) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Stagger delay based on index
        // Max delay of 400ms to avoid feeling slow
        const maxDelay = 400;
        const delayPerItem = Math.min(50, maxDelay / totalItems);
        const delay = index * delayPerItem;

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    ...SPRING_CONFIG,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);
    }, [index]);

    return {
        opacity,
        transform: [{ translateY }],
    };
}

/**
 * Simple shared element wrapper
 * Provides consistent animation for elements that should transition smoothly
 */
export function useSharedElementStyle(sharedId: string) {
    // In a full implementation, this would register with a transition coordinator
    // For now, we use fade-in animation
    return useFadeIn();
}
