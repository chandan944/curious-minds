import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { soundTap, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';

// ─────────────────────────────────────────────
//  DoYouKnowWhy — 2 open-ended bridge questions
//  between the Lab and the Quiz
// ─────────────────────────────────────────────

export default function DoYouKnowWhy({ questions, accentColor, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const revealAnims = questions.map(() => useRef(new Animated.Value(0)).current);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const q = questions[currentIndex];
  const isCurrentRevealed = revealed.includes(currentIndex);
  const isLast = currentIndex === questions.length - 1;
  const allRevealed = questions.every((_, i) => revealed.includes(i));

  const handleReveal = () => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(prev => [...prev, currentIndex]);
    Animated.spring(revealAnims[currentIndex], {
      toValue: 1, tension: 60, friction: 14, useNativeDriver: true,
    }).start();
  };

  const goNext = () => {
    soundTap();
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setCurrentIndex(i => i + 1);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: accentColor }]}>🤔 Do You Know Why?</Text>
          <Text style={styles.headerSub}>Think about it, then reveal the answer</Text>
        </View>

        {/* Progress pills */}
        <View style={styles.progressRow}>
          {questions.map((_, i) => (
            <View key={i} style={[
              styles.progressPill,
              {
                backgroundColor: revealed.includes(i) ? accentColor + '30' : COLORS.glass1,
                borderColor: revealed.includes(i) ? accentColor : COLORS.glassBorder,
                flex: i === currentIndex ? 2 : 1,
              }
            ]}>
              <Text style={[styles.progressPillText, revealed.includes(i) && { color: accentColor }]}>
                {revealed.includes(i) ? '✓' : i + 1}
              </Text>
            </View>
          ))}
        </View>

        {/* Question card */}
        <Animated.View style={[styles.questionWrap, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient
            colors={[accentColor + '15', COLORS.bg2]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.questionCard, { borderColor: accentColor + '30' }]}
          >
            <Text style={styles.questionEmoji}>{q.emoji}</Text>
            <Text style={[styles.questionNum, { color: accentColor }]}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
            <Text style={styles.questionText}>{q.question}</Text>

            {/* Think prompt */}
            {!isCurrentRevealed && (
              <View style={styles.thinkBox}>
                <Text style={styles.thinkText}>💭 Take a moment to think...</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Answer reveal */}
        {isCurrentRevealed && (
          <Animated.View style={[
            styles.answerCard,
            {
              opacity: revealAnims[currentIndex],
              borderColor: accentColor + '40',
              transform: [{
                translateY: revealAnims[currentIndex].interpolate({
                  inputRange: [0, 1], outputRange: [16, 0],
                })
              }]
            }
          ]}>
            <BlurView intensity={18} tint="dark" style={styles.answerBlur}>
              <View style={[styles.answerTop, { borderBottomColor: accentColor + '25' }]}>
                <Text style={[styles.answerLabel, { color: accentColor }]}>💡 The Explanation</Text>
              </View>
              <Text style={styles.answerText}>{q.answer}</Text>
            </BlurView>
          </Animated.View>
        )}

        {/* CTA buttons */}
        <View style={styles.btnRow}>
          {!isCurrentRevealed ? (
            <TouchableOpacity onPress={handleReveal} style={styles.revealBtn}>
              <LinearGradient
                colors={[accentColor + 'CC', accentColor + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.revealBtnGrad}
              >
                <Text style={styles.revealBtnText}>Reveal the why 🧠</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : !isLast ? (
            <TouchableOpacity onPress={goNext}
              style={[styles.nextBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '12' }]}>
              <Text style={[styles.nextBtnText, { color: accentColor }]}>
                Next question →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onComplete}
              style={styles.quizBtn}
            >
              <LinearGradient
                colors={[COLORS.xpGold + 'CC', COLORS.xpGold + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.quizBtnGrad}
              >
                <Text style={styles.quizBtnText}>🏆 Ready for the Quiz!</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Fun nudge */}
        <View style={styles.nudgeBox}>
          <Text style={styles.nudgeText}>
            Understanding the "why" makes the quiz much easier — and makes the knowledge stick! 🧠
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  header: { alignItems: 'center', marginBottom: SPACING.lg },
  headerLabel: {
    fontFamily: FONTS.displayMedium, fontSize: 20, marginBottom: 6,
  },
  headerSub: {
    fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted,
  },

  progressRow: {
    flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, height: 32,
  },
  progressPill: {
    borderRadius: RADIUS.full, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  progressPillText: {
    fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textMuted,
  },

  questionWrap: { marginBottom: SPACING.md },
  questionCard: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg,
    ...SHADOWS.soft,
  },
  questionEmoji: { fontSize: 48, marginBottom: SPACING.md },
  questionNum: {
    fontFamily: FONTS.bodyMedium, fontSize: 12, marginBottom: 8, letterSpacing: 0.5,
  },
  questionText: {
    fontFamily: FONTS.displayMedium, fontSize: 17,
    color: COLORS.textPrimary, lineHeight: 26, marginBottom: SPACING.md,
  },
  thinkBox: {
    backgroundColor: COLORS.glass1, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  thinkText: {
    fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted,
    textAlign: 'center',
  },

  answerCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
    marginBottom: SPACING.md, ...SHADOWS.soft,
  },
  answerBlur: { backgroundColor: COLORS.glass1 },
  answerTop: {
    padding: SPACING.md, borderBottomWidth: 1,
  },
  answerLabel: {
    fontFamily: FONTS.displayMedium, fontSize: 13, letterSpacing: 0.5,
  },
  answerText: {
    fontFamily: FONTS.body, fontSize: 15,
    color: COLORS.textSecondary, lineHeight: 24,
    padding: SPACING.md,
  },

  btnRow: { marginBottom: SPACING.md },
  revealBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  revealBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  revealBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, color: '#fff' },
  nextBtn: {
    paddingVertical: 16, borderRadius: RADIUS.md,
    borderWidth: 1, alignItems: 'center',
  },
  nextBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  quizBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  quizBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  quizBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, color: COLORS.bg1 },

  nudgeBox: {
    backgroundColor: COLORS.glass1, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  nudgeText: {
    fontFamily: FONTS.body, fontSize: 13,
    color: COLORS.textMuted, textAlign: 'center', lineHeight: 18,
  },
});
