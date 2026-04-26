import React, { useRef, useState } from 'react';
import { Pressable, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

export default function LanguageToggle({ size = 36 }) {
  const { theme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const isHindi = language === 'hi';

  const handlePress = () => {
    soundTap();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleLanguage();
  };

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: isHovered ? 1.05 : 1.0, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onHoverIn={() => { setIsHovered(true); Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }).start(); }}
        onHoverOut={() => { setIsHovered(false); Animated.spring(scale, { toValue: 1.0, useNativeDriver: true }).start(); }}
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            backgroundColor: isHindi ? theme.accent.primary + '25' : theme.glass.light,
            borderColor: isHindi ? theme.accent.primary : theme.glass.border,
          }
        ]}
      >
        <Text style={[styles.text, { color: isHindi ? theme.accent.primary : theme.text.primary }]}>
          {isHindi ? 'EN' : 'अ'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
  }
});
