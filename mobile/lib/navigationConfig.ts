/**
 * Centralized Navigation Configuration
 * 
 * This file contains all navigation transition settings for a calm, 
 * spiritual experience. Adjust durations and easing here to affect 
 * all screen transitions app-wide.
 * 
 * Design Philosophy:
 * - Smooth, GPU-accelerated animations (200-240ms)
 * - Calm, non-bouncy motion (easeInOut curves)
 * - Platform-appropriate defaults (iOS slide, Android fade)
 * - No jarring jumps or layout shifts
 */

import { Platform } from 'react-native';

/**
 * TRANSITION TIMINGS
 * Adjust these values to make transitions faster or slower
 */
export const NAVIGATION_TIMING = {
    /** Standard screen push/pop duration (200-240ms recommended) */
    STANDARD: 220,

    /** Modal presentation duration (slightly faster) */
    MODAL: 200,

    /** Shared element transition duration */
    SHARED_ELEMENT: 240,
} as const;

/**
 * EASING CURVES
 * These define the "feel" of the motion
 * - easeInOut: Calm, natural acceleration/deceleration
 * - ease: Slightly more dynamic
 * - linear: Constant speed (avoid for spiritual feel)
 */
export const EASING_CURVES = {
    /** Gentle acceleration and deceleration - main curve for spiritual feel */
    CALM: 'easeInOut' as const,

    /** Slightly more dynamic for quick actions */
    STANDARD: 'ease' as const,
} as const;

/**
 * Screen transition configuration for standard stack navigation
 * iOS: Slide from right (native feel)
 * Android: Fade with slight slide (Material Design adapted)
 */
export const getStackScreenOptions = () => ({
    headerShown: false,

    // Use native animations for best performance
    animationEnabled: true,
    animation: Platform.select({
        ios: 'default' as const,
        android: 'fade' as const,
    }),

    // Enable gestures for smooth back navigation
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,

    // Custom animation timing
    transitionSpec: {
        open: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.STANDARD,
            },
        },
        close: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.STANDARD,
            },
        },
    },
});

/**
 * Modal presentation configuration
 * Used for overlays, dialogs, and secondary flows
 */
export const getModalScreenOptions = () => ({
    headerShown: false,
    presentation: 'modal' as const,
    animationEnabled: true,

    gestureEnabled: true,
    gestureDirection: 'vertical' as const,

    animation: 'slide_from_bottom' as const,

    transitionSpec: {
        open: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.MODAL,
            },
        },
        close: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.MODAL,
            },
        },
    },
});

/**
 * Fade-only transition for subtle screen changes
 * Use for tabs or related content transitions
 */
export const getFadeScreenOptions = () => ({
    headerShown: false,
    animationEnabled: true,
    animation: 'fade' as const,

    transitionSpec: {
        open: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.STANDARD,
            },
        },
        close: {
            animation: 'timing' as const,
            config: {
                duration: NAVIGATION_TIMING.STANDARD,
            },
        },
    },
});

/**
 * Tab bar animation configuration
 * Kept minimal to avoid interfering with tab switching
 */
export const getTabScreenOptions = () => ({
    headerShown: false,

    // Smooth tab transitions
    animationEnabled: true,
    animation: 'fade' as const,

    // Fast but smooth
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 180,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 180,
            },
        },
    },
});

/**
 * Performance optimization: Detach inactive screens
 * This prevents heavy screens from consuming resources when not visible
 */
export const DETACH_INACTIVE_SCREENS_OPTIONS = {
    detachInactiveScreens: true,
    freezeOnBlur: true,
};
