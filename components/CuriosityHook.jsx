import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundWhoosh, soundTap } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';
import MarkdownText from './ui/MarkdownText';

// ─────────────────────────────────────────────
//  CuriosityHook — the "jaw-drop" first screen
//  Shows a compelling question, then reveals the answer
// ─────────────────────────────────────────────

export default function CuriosityHook({ hook, accentColor, topicTitle, onContinue }) {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [revealed, setRevealed] = React.useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  // Theme tokens
  const bg   = theme.bg.surface;
  const txt1 = theme.text.primary;
  const txt2 = theme.text.secondary;
  const txtM = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const border = theme.glass.border;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
    ]).start();

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

  const color = accentColor || theme.accent.primary;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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

        {/* Icon — animated scale pulse */}
        <Animated.View style={[styles.hookIconWrap, {
          backgroundColor: color + '15', borderColor: color + '30',
          transform: [{ scale: pulseAnim }]
        }]}>
          <Icon name="brain" size={52} color={color} />
        </Animated.View>

        {/* Question */}
        <Text style={[styles.hookLabel, { color: txtM }]}>Here's a question:</Text>
        <View style={[styles.questionCard, { borderColor: color + '30', backgroundColor: glass2 }]}>
          <MarkdownText style={[styles.question, { color: txt1 }]} highlightColor="#FFD166">
            {hook.question}
          </MarkdownText>
        </View>

        {/* Reveal / Answer */}
        {!revealed ? (
          <TouchableOpacity onPress={handleReveal} style={styles.revealBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={[color + 'CC', color + '88']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.revealBtnGrad}
            >
              <View style={styles.revealBtnInner}>
                <Icon name="brain" size={18} color="#fff" />
                <Text style={styles.revealBtnText}>Reveal the Answer</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Animated.View style={[
            styles.answerCard,
            {
              opacity: revealAnim,
              borderColor: color + '40',
              backgroundColor: glass1,
              transform: [{ translateY: revealAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }],
            }
          ]}>
            <LinearGradient
              colors={[color + '15', 'transparent']}
              style={styles.answerGrad}
            >
              <View style={styles.answerLabelRow}>
                <Icon name="lightbulb" size={14} color={color} />
                <Text style={[styles.answerLabel, { color: txtM }]}>The Answer</Text>
              </View>
              <MarkdownText style={[styles.answerText, { color: txt2 }]} highlightColor="#FFD166">{hook.reveal}</MarkdownText>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Continue button */}
        {revealed && (
          <Animated.View style={{ opacity: revealAnim, marginTop: SPACING.lg }}>
            <TouchableOpacity onPress={() => { soundTap(); onContinue(); }} style={[styles.continueBtn, { borderColor: color + '60' }]}>
              <View style={styles.continueBtnInner}>
                <Text style={[styles.continueBtnText, { color }]}>Let's learn more</Text>
                <Icon name="forward" size={16} color={color} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Skip */}
        {!revealed && (
          <TouchableOpacity onPress={() => { soundTap(); onContinue(); }} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: txtM }]}>Skip intro →</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  bgGlow: {
    position: 'absolute', top: -100, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150, opacity: 0.06,
  },
  container: { alignItems: 'center' },
  topicPill: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, marginBottom: SPACING.lg,
  },
  topicPillText: { fontFamily: FONTS.bodyMedium, fontSize: 13, letterSpacing: 0.5 },
  hookIconWrap: {
    width: 100, height: 100, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 100,
  },
  hookLabel: {
    fontFamily: FONTS.body, fontSize: 13, marginBottom: 12, letterSpacing: 0.5,
  },
  questionCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
    padding: SPACING.lg, width: '100%', marginBottom: SPACING.lg,
  },
  question: {
    fontFamily: FONTS.displayMedium, fontSize: 18, lineHeight: 26, textAlign: 'center',
  },
  revealBtn: {
    borderRadius: RADIUS.md, overflow: 'hidden', width: '100%', marginBottom: SPACING.md,
  },
  revealBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  revealBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revealBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, color: '#FFFFFF' },
  answerCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, width: '100%', overflow: 'hidden',
  },
  answerGrad: { padding: SPACING.lg },
  answerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  answerLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12, letterSpacing: 1 },
  answerText: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 24 },
  continueBtn: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1,
  },
  continueBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  continueBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  skipBtn: { marginTop: SPACING.xl, paddingVertical: 8 },
  skipText: { fontFamily: FONTS.body, fontSize: 13 },
});
