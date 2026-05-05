import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS } from '../../constants/theme';

export default function SkeletonLoader({ width, height, borderRadius = RADIUS.md, style, circle = false }) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  const backgroundColor = isDark ? '#2A2C3A' : '#E2E8F0';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius: circle ? height / 2 : borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}
