import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

const COLORS = {
    secondary: '#8C9E84',
};

export const TypingIndicator = () => {
    const scale1 = useRef(new Animated.Value(1)).current;
    const scale2 = useRef(new Animated.Value(1)).current;
    const scale3 = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const createWaveAnimation = () => {
            return Animated.loop(
                Animated.sequence([
                    // Circle 1
                    Animated.parallel([
                        Animated.timing(scale1, {
                            toValue: 1.3,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale2, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale3, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scale1, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale2, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Circle 2
                    Animated.parallel([
                        Animated.timing(scale2, {
                            toValue: 1.3,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scale2, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Circle 3
                    Animated.parallel([
                        Animated.timing(scale3, {
                            toValue: 1.3,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scale3, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );
        };

        const waveAnimation = createWaveAnimation();
        waveAnimation.start();

        return () => {
            waveAnimation.stop();
        };
    }, []);

    return (
        <View className="flex-row items-center justify-center space-x-2 p-4 bg-[#FDFBF7] rounded-2xl rounded-tl-none border-2 border-sand-200 self-start mt-2">
            <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary, transform: [{ scale: scale1 }] }]} />
            <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary, transform: [{ scale: scale2 }] }]} />
            <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary, transform: [{ scale: scale3 }] }]} />
            <Text className="text-xs text-sand-400 ml-3 font-medium">Murshid is reflecting...</Text>
        </View>
    );
};
