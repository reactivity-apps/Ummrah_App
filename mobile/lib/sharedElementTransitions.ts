/**
 * Shared Element Transition Utilities
 * 
 * Provides smooth, spiritual transitions between list items and detail screens.
 * Uses React Native Reanimated for GPU-accelerated animations.
 * 
 * Usage:
 * 1. Wrap shared elements with SharedElement component
 * 2. Use same sharedId on both source and destination screens
 * 3. Navigation automatically handles the transition
 * 
 * Example:
 * List screen: <SharedElement sharedId={`ziyarat-${item.id}`}>...</SharedElement>
 * Detail screen: <SharedElement sharedId={`ziyarat-${id}`}>...</SharedElement>
 */

import { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';

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
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
        // Gentle fade-in from slightly below
        opacity.value = withTiming(1, {
            duration: NAVIGATION_TIMING.STANDARD,
            easing: Easing.out(Easing.ease),
        });

        translateY.value = withSpring(0, SPRING_CONFIG);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return animatedStyle;
}

/**
 * Hook for scale animation on press
 * Provides tactile feedback before navigation
 */
export function usePressScale() {
    const scale = useSharedValue(1);

    const onPressIn = () => {
        scale.value = withSpring(0.97, {
            damping: 15,
            stiffness: 150,
        });
    };

    const onPressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return { animatedStyle, onPressIn, onPressOut };
}

/**
 * Hook for hero image expansion on detail screen
 * Creates smooth transition from card to full hero
 */
export function useHeroExpansion(isExpanded: boolean) {
    const height = useSharedValue(isExpanded ? 256 : 192);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isExpanded) {
            height.value = withTiming(256, {
                duration: NAVIGATION_TIMING.SHARED_ELEMENT,
                easing: Easing.out(Easing.ease),
            });
            opacity.value = withTiming(1, {
                duration: NAVIGATION_TIMING.STANDARD,
                easing: Easing.out(Easing.ease),
            });
        }
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
    }));

    return animatedStyle;
}

/**
 * Hook for staggered list item animations
 * Each item fades in sequentially for calm appearance
 */
export function useStaggeredFadeIn(index: number, totalItems: number) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        // Stagger delay based on index
        // Max delay of 400ms to avoid feeling slow
        const maxDelay = 400;
        const delayPerItem = Math.min(50, maxDelay / totalItems);
        const delay = index * delayPerItem;

        setTimeout(() => {
            opacity.value = withTiming(1, {
                duration: 300,
                easing: Easing.out(Easing.ease),
            });

            translateY.value = withSpring(0, SPRING_CONFIG);
        }, delay);
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return animatedStyle;
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
