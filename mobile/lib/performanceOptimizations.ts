/**
 * Navigation Performance Optimization Guide
 * 
 * This file contains utilities and documentation for maintaining
 * smooth 60 FPS navigation throughout the app.
 * 
 * Key Principles:
 * 1. Avoid heavy synchronous work during transitions
 * 2. Prefetch data before navigation when possible
 * 3. Use skeleton loaders to prevent empty flashes
 * 4. Optimize FlatList rendering with proper configs
 * 5. Avoid layout thrashing with fixed dimensions
 */

import { InteractionManager } from 'react-native';

/**
 * Run expensive operations after navigation completes
 * 
 * This ensures the animation thread stays at 60 FPS by
 * deferring heavy JS work until after the transition finishes.
 * 
 * Usage:
 * ```tsx
 * useEffect(() => {
 *   runAfterInteractions(() => {
 *     // Heavy data processing
 *     // API calls
 *     // Complex calculations
 *   });
 * }, []);
 * ```
 */
export function runAfterInteractions(callback: () => void) {
    InteractionManager.runAfterInteractions(() => {
        callback();
    });
}

/**
 * Debounce function for search and input handlers
 * Prevents excessive re-renders during typing
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * FlatList optimization config
 * Use this for all list screens to ensure smooth scrolling
 */
export const FLATLIST_OPTIMIZATIONS = {
    // Only render 10 items initially (fast initial render)
    initialNumToRender: 10,

    // Render 5 items per batch (smooth scrolling)
    maxToRenderPerBatch: 5,

    // Keep 10 screens worth of items in memory
    windowSize: 10,

    // Remove offscreen items from memory
    removeClippedSubviews: true,

    // Use keys for efficient updates
    keyExtractor: (item: any, index: number) => item.id || `item-${index}`,

    // Optimize for long lists
    getItemLayout: (data: any, index: number) => ({
        length: 100, // Adjust based on your item height
        offset: 100 * index,
        index,
    }),
} as const;

/**
 * Performance monitoring hook
 * Use in development to identify slow screens
 */
export function usePerformanceMonitor(screenName: string) {
    if (__DEV__) {
        const startTime = Date.now();

        return () => {
            const endTime = Date.now();
            const renderTime = endTime - startTime;

            if (renderTime > 16) { // More than one frame (60 FPS = 16.67ms per frame)
                console.warn(
                    `⚠️ Slow render on ${screenName}: ${renderTime}ms`
                );
            }
        };
    }

    return () => { };
}

/**
 * Prefetch data utility
 * Call this when user hovers/focuses on a navigation element
 * 
 * Usage:
 * ```tsx
 * <TouchableOpacity
 *   onPressIn={() => prefetchData('/api/ziyarat/123')}
 *   onPress={() => router.push('/ziyarat/123')}
 * >
 * ```
 */
export async function prefetchData(endpoint: string) {
    try {
        // Implement your API prefetch logic here
        // Store in cache or state management
        console.log(`Prefetching: ${endpoint}`);
    } catch (error) {
        // Silent fail - prefetch is optional optimization
        console.warn('Prefetch failed:', error);
    }
}

/**
 * BEST PRACTICES CHECKLIST
 * 
 * ✅ Navigation Transitions:
 * - Duration: 200-240ms for calm feel
 * - Easing: easeInOut for smooth acceleration/deceleration
 * - Platform: Use native animations (slide on iOS, fade on Android)
 * - Gestures: Enable swipe-back on all screens
 * 
 * ✅ Loading States:
 * - Always show skeleton loader on initial render
 * - Minimum 100-150ms delay to avoid flash
 * - Match skeleton layout to real content
 * - Use gentle pulse animation (750ms cycle)
 * 
 * ✅ Shared Elements:
 * - Animate hero images between list and detail
 * - Use press scale feedback (0.97) before navigation
 * - Stagger list items with 50ms delay
 * - Fade in content 100ms after hero
 * 
 * ✅ Performance:
 * - Run heavy work after InteractionManager
 * - Optimize FlatList with proper config
 * - Use React.memo for complex components
 * - Avoid inline functions in render
 * - Use fixed dimensions where possible
 * 
 * ✅ Avoiding Janky Transitions:
 * - Don't use setState during animation
 * - Don't start timers during transition
 * - Don't make API calls synchronously
 * - Don't calculate layouts on JS thread
 * - Don't use ScrollView for long lists
 * 
 * ❌ Anti-Patterns to Avoid:
 * - Bouncy/elastic animations (not spiritual)
 * - Long transitions (>300ms feels sluggish)
 * - Zoom/scale transitions (too flashy)
 * - Multiple simultaneous animations
 * - Heavy work in useEffect without InteractionManager
 * - White flashes (always use skeletons)
 * - Synchronous data fetching on mount
 */

/**
 * Example: Optimized screen component
 * 
 * ```tsx
 * export default function MyScreen() {
 *   const [data, setData] = useState(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *   
 *   useEffect(() => {
 *     // Show skeleton immediately
 *     // Load data after transition completes
 *     runAfterInteractions(async () => {
 *       const result = await fetchData();
 *       setData(result);
 *       setIsLoading(false);
 *     });
 *   }, []);
 *   
 *   if (isLoading) {
 *     return <MySkeleton />;
 *   }
 *   
 *   return (
 *     <FlatList
 *       data={data}
 *       {...FLATLIST_OPTIMIZATIONS}
 *       renderItem={({ item, index }) => (
 *         <AnimatedCard item={item} index={index} />
 *       )}
 *     />
 *   );
 * }
 * ```
 */
