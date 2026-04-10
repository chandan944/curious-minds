import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';

// ─────────────────────────────────────────────
//  XPToast — floats up and fades when XP is earned
//  Usage: <XPToast amount={20} label="Correct!" visible={show} />
// ─────────────────────────────────────────────

export default function XPToast({ amount, label, visible, accentColor }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(1);
      translateY.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1800,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -60,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const color = accentColor || COLORS.xpGold;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.pill, { borderColor: color + '60', backgroundColor: color + '18' }]}>
        <Text style={[styles.amount, { color }]}>+{amount} XP</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 999,
    top: '40%',
    pointerEvents: 'none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  amount: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
