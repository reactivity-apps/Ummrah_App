import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

const COLORS = {
    gold: '#C5A059',
};

interface GeometricPatternProps {
    size?: number;
    color?: string;
    opacity?: number;
}

export const GeometricPattern = ({ 
    size = 100, 
    color = COLORS.gold, 
    opacity = 0.1 
}: GeometricPatternProps) => (
    <Svg height={size} width={size} viewBox="0 0 100 100" style={{ position: 'absolute', opacity }}>
        <G stroke={color} strokeWidth="1" fill="none">
            <Path d="M50 0 L61 35 L97 35 L68 57 L79 91 L50 70 L21 91 L32 57 L3 35 L39 35 Z" />
            <Circle cx="50" cy="50" r="45" />
            <Circle cx="50" cy="50" r="35" />
        </G>
    </Svg>
);
