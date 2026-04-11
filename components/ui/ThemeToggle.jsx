// ─────────────────────────────────────────────
//  ThemeToggle — smooth dark/light switcher
//  Drop anywhere in your UI:
//  <ThemeToggle />
// ─────────────────────────────────────────────

import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS } from '../../constants/theme';
import Icon from './Icons';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';

export default function ThemeToggle({ size = 36, style }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(rotate, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    toggleTheme();
  };

  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 3,
          backgroundColor: theme.glass.medium,
          borderColor: theme.glass.border,
        },
        style,
      ]}
      activeOpacity={0.75}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Icon
          name={isDark ? 'moon' : 'sun'}
          size={size * 0.5}
          color={theme.text.secondary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
