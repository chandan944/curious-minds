import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────
//  CuriosityHook — the "jaw-drop" first screen
//  Shows a compelling question, then reveals the answer
// ─────────────────────────────────────────────

export default function CuriosityHook({ hook, accentColor, topicTitle, onContinue }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [revealed, setRevealed] = React.useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
    ]).start();

    // Pulse the question mark
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleReveal = () => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
    Animated.spring(revealAnim, {
      toValue: 1, tension: 60, friction: 14, useNativeDriver: true,
    }).start();
  };

  const color = accentColor || COLORS.accent;

  return (
    <View style={styles.root}>
      {/* Background glow */}
      <View style={[styles.bgGlow, { backgroundColor: color }]} />

      <Animated.View style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Topic pill */}
        <View style={[styles.topicPill, { borderColor: color + '50', backgroundColor: color + '12' }]}>
          <Text style={[styles.topicPillText, { color }]}>{topicTitle}</Text>
        </View>

        {/* Emoji */}
        <Animated.Text style={[styles.hookEmoji, { transform: [{ scale: pulseAnim }] }]}>
          {hook.emoji || '🤔'}
        </Animated.Text>

        {/* Question */}
        <Text style={styles.hookLabel}>Here's a question:</Text>
        <BlurView intensity={20} tint="dark" style={[styles.questionCard, { borderColor: color + '30' }]}>
          <Text style={[styles.question, { color: COLORS.textPrimary }]}>
            {hook.question}
          </Text>
        </BlurView>

        {/* Reveal / Answer */}
        {!revealed ? (
          <TouchableOpacity onPress={handleReveal} style={styles.revealBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={[color + 'CC', color + '88']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.revealBtnGrad}
            >
              <Text style={styles.revealBtnText}>🧠 Reveal the Answer</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Animated.View style={[
            styles.answerCard,
            {
              opacity: revealAnim,
              borderColor: color + '40',
              transform: [{ translateY: revealAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }],
            }
          ]}>
            <LinearGradient
              colors={[color + '15', 'transparent']}
              style={styles.answerGrad}
            >
              <Text style={styles.answerLabel}>💡 The Answer</Text>
              <Text style={styles.answerText}>{hook.reveal}</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Continue button */}
        {revealed && (
          <Animated.View style={{ opacity: revealAnim, marginTop: SPACING.lg }}>
            <TouchableOpacity onPress={onContinue} style={[styles.continueBtn, { borderColor: color + '60' }]}>
              <Text style={[styles.continueBtnText, { color }]}>Let's learn more →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Skip */}
        {!revealed && (
          <TouchableOpacity onPress={onContinue} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip intro →</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.06,
  },
  container: {
    alignItems: 'center',
  },
  topicPill: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  topicPillText: {
    fontFamily: FONTS.bodyMedium, fontSize: 13, letterSpacing: 0.5,
  },
  hookEmoji: {
    fontSize: 72, marginBottom: SPACING.lg,
    textShadowColor: 'rgba(255,255,255,0.1)',
    textShadowRadius: 20,
  },
  hookLabel: {
    fontFamily: FONTS.body, fontSize: 13,
    color: COLORS.textMuted, marginBottom: 12,
    letterSpacing: 0.5,
  },
  questionCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    overflow: 'hidden', padding: SPACING.lg,
    width: '100%', marginBottom: SPACING.lg,
    backgroundColor: COLORS.glass1,
  },
  question: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18, lineHeight: 26,
    textAlign: 'center',
  },
  revealBtn: {
    borderRadius: RADIUS.md, overflow: 'hidden',
    width: '100%', marginBottom: SPACING.md,
  },
  revealBtnGrad: {
    paddingVertical: 16, alignItems: 'center',
  },
  revealBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16, color: COLORS.textPrimary,
  },
  answerCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    width: '100%', overflow: 'hidden',
  },
  answerGrad: {
    padding: SPACING.lg,
  },
  answerLabel: {
    fontFamily: FONTS.bodyMedium, fontSize: 12,
    color: COLORS.textMuted, letterSpacing: 1,
    marginBottom: 10,
  },
  answerText: {
    fontFamily: FONTS.body, fontSize: 15,
    color: COLORS.textSecondary, lineHeight: 24,
  },
  continueBtn: {
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  continueBtnText: {
    fontFamily: FONTS.displayMedium, fontSize: 15,
  },
  skipBtn: {
    marginTop: SPACING.xl, paddingVertical: 8,
  },
  skipText: {
    fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted,
  },
});
