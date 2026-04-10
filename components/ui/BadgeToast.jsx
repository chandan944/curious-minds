import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../constants/theme';

// ─────────────────────────────────────────────
//  BadgeToast — slides down from top on badge earn
//  Usage: <BadgeToast badge={BADGES.perfect_quiz} visible={show} />
// ─────────────────────────────────────────────

export default function BadgeToast({ badge, visible }) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -120,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, badge]);

  if (!badge) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <LinearGradient
        colors={['rgba(108,99,255,0.95)', 'rgba(78,205,196,0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.unlocked}>🏅 BADGE UNLOCKED</Text>
        <View style={styles.row}>
          <Text style={styles.emoji}>{badge.emoji}</Text>
          <View>
            <Text style={styles.name}>{badge.name}</Text>
            <Text style={styles.desc}>{badge.description}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    ...SHADOWS.card,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  unlocked: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: '#fff',
  },
  desc: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});
