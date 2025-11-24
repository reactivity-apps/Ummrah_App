/**
 * Skeleton Loader Components
 * 
 * Prevents jarring white flashes during navigation by showing
 * placeholder content while data loads. Creates a calm, smooth
 * experience suitable for a spiritual app.
 * 
 * Usage:
 * - Show skeleton on initial render
 * - Replace with real content once data is ready
 * - Gentle pulse animation (not distracting)
 */

import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

/**
 * Base skeleton item with gentle pulse animation
 */
export function SkeletonItem({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style
}: {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        // Gentle pulse: 0.3 → 0.6 → 0.3 over 1.5 seconds
        // Slow enough to be calming, not distracting
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, {
                    duration: 750,
                    easing: Easing.inOut(Easing.ease)
                }),
                withTiming(0.3, {
                    duration: 750,
                    easing: Easing.inOut(Easing.ease)
                })
            ),
            -1, // Infinite repeat
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: '#E2E8F0',
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

/**
 * Skeleton for Itinerary Screen
 * Mimics the layout of itinerary timeline items
 */
export function ItinerarySkeleton() {
    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.headerSkeleton}>
                <SkeletonItem width={120} height={28} borderRadius={12} />
                <SkeletonItem width={80} height={20} borderRadius={8} />
            </View>

            {/* Timeline items skeleton */}
            {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.timelineItemSkeleton}>
                    <View style={styles.timelineLeftSkeleton}>
                        <SkeletonItem width={60} height={16} borderRadius={6} />
                        <View style={styles.timelineDot} />
                    </View>
                    <View style={styles.timelineCardSkeleton}>
                        <SkeletonItem width="70%" height={20} borderRadius={8} />
                        <SkeletonItem width="90%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
                        <SkeletonItem width="60%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
                        <View style={styles.tagsSkeleton}>
                            <SkeletonItem width={60} height={24} borderRadius={12} />
                            <SkeletonItem width={80} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

/**
 * Skeleton for Duas Screen
 * Mimics the card-based layout
 */
export function DuasSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerSkeleton}>
                <SkeletonItem width={100} height={28} borderRadius={12} />
            </View>

            {/* Search bar */}
            <SkeletonItem width="100%" height={44} borderRadius={12} style={{ marginBottom: 16 }} />

            {/* Category tabs */}
            <View style={styles.categoryTabsSkeleton}>
                <SkeletonItem width={80} height={36} borderRadius={18} />
                <SkeletonItem width={100} height={36} borderRadius={18} style={{ marginLeft: 8 }} />
                <SkeletonItem width={90} height={36} borderRadius={18} style={{ marginLeft: 8 }} />
            </View>

            {/* Dua cards */}
            {[1, 2, 3].map((item) => (
                <View key={item} style={styles.duaCardSkeleton}>
                    <SkeletonItem width="80%" height={20} borderRadius={8} />
                    <SkeletonItem width="100%" height={16} borderRadius={6} style={{ marginTop: 12 }} />
                    <SkeletonItem width="95%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
                    <SkeletonItem width="70%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
                    <View style={styles.duaFooterSkeleton}>
                        <SkeletonItem width={100} height={14} borderRadius={6} />
                        <SkeletonItem width={40} height={24} borderRadius={12} />
                    </View>
                </View>
            ))}
        </View>
    );
}

/**
 * Skeleton for Guide/Ziyarat list
 * Mimics card grid layout
 */
export function GuideSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerSkeleton}>
                <SkeletonItem width={150} height={28} borderRadius={12} />
            </View>

            {/* Grid of cards */}
            <View style={styles.gridSkeleton}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <View key={item} style={styles.guideCardSkeleton}>
                        <SkeletonItem width="100%" height={120} borderRadius={12} />
                        <SkeletonItem width="90%" height={18} borderRadius={6} style={{ marginTop: 12 }} />
                        <SkeletonItem width="70%" height={14} borderRadius={6} style={{ marginTop: 6 }} />
                    </View>
                ))}
            </View>
        </View>
    );
}

/**
 * Skeleton for Map/Ziyarat detail screen
 */
export function DetailSkeleton() {
    return (
        <View style={styles.container}>
            {/* Image skeleton */}
            <SkeletonItem width="100%" height={250} borderRadius={0} />

            {/* Content */}
            <View style={{ padding: 16 }}>
                <SkeletonItem width="80%" height={28} borderRadius={12} />
                <SkeletonItem width="50%" height={16} borderRadius={6} style={{ marginTop: 8 }} />

                <View style={{ marginTop: 24 }}>
                    <SkeletonItem width="100%" height={16} borderRadius={6} />
                    <SkeletonItem width="100%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
                    <SkeletonItem width="95%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
                    <SkeletonItem width="85%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
                </View>

                <View style={{ marginTop: 24 }}>
                    <SkeletonItem width={120} height={20} borderRadius={8} />
                    <View style={styles.tagsSkeleton}>
                        <SkeletonItem width={80} height={32} borderRadius={16} style={{ marginTop: 12 }} />
                        <SkeletonItem width={100} height={32} borderRadius={16} style={{ marginTop: 12, marginLeft: 8 }} />
                        <SkeletonItem width={90} height={32} borderRadius={16} style={{ marginTop: 12, marginLeft: 8 }} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7',
        padding: 16,
    },
    headerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    timelineItemSkeleton: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineLeftSkeleton: {
        alignItems: 'flex-end',
        width: 80,
        marginRight: 16,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E2E8F0',
        marginTop: 8,
    },
    timelineCardSkeleton: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagsSkeleton: {
        flexDirection: 'row',
        marginTop: 12,
    },
    categoryTabsSkeleton: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    duaCardSkeleton: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    duaFooterSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    gridSkeleton: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    guideCardSkeleton: {
        width: '48%',
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
});
