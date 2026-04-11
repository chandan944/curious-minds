import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundTap, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';

export default function DoYouKnowWhy({ questions, accentColor, onComplete }) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const revealAnims = useMemo(
    () => Array.from({ length: questions.length }, () => new Animated.Value(0)),
    []
  );

  // Theme tokens
  const bg     = theme.bg.surface;
  const txt1   = theme.text.primary;
  const txt2   = theme.text.secondary;
  const txtM   = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const border = theme.glass.border;
  const gold   = theme.accent.gold;

  const q = questions[currentIndex];
  const isCurrentRevealed = revealed.includes(currentIndex);
  const isLast = currentIndex === questions.length - 1;

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

  if (!questions || questions.length === 0) return null;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIconWrap, { backgroundColor: accentColor + '20', borderColor: accentColor + '30' }]}>
            <Icon name="brain" size={28} color={accentColor} />
          </View>
          <Text style={[styles.headerLabel, { color: accentColor }]}>Do You Know Why?</Text>
          <Text style={[styles.headerSub, { color: txtM }]}>Think about it, then reveal the answer</Text>
        </View>

        {/* Progress pills */}
        <View style={styles.progressRow}>
          {questions.map((_, i) => (
            <View key={i} style={[
              styles.progressPill,
              {
                backgroundColor: revealed.includes(i) ? accentColor + '30' : glass1,
                borderColor: revealed.includes(i) ? accentColor : border,
                flex: i === currentIndex ? 2 : 1,
              }
            ]}>
              <Text style={[styles.progressPillText, { color: revealed.includes(i) ? accentColor : txtM }]}>
                {revealed.includes(i) ? '✓' : i + 1}
              </Text>
            </View>
          ))}
        </View>

        {/* Question card */}
        <Animated.View style={[styles.questionWrap, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient
            colors={[accentColor + '15', isDark ? theme.bg.elevated : '#F8F9FF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.questionCard, { borderColor: accentColor + '30' }]}
          >
            <View style={[styles.questionIconBadge, { backgroundColor: accentColor + '18', borderColor: accentColor + '30' }]}>
              <Icon name="brain" size={26} color={accentColor} />
            </View>
            <Text style={[styles.questionNum, { color: accentColor }]}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
            <Text style={[styles.questionText, { color: txt1 }]}>{q.question}</Text>

            {!isCurrentRevealed && (
              <View style={[styles.thinkBox, { backgroundColor: glass1, borderColor: border }]}>
                <Icon name="lightbulb" size={14} color={txtM} />
                <Text style={[styles.thinkText, { color: txtM }]}>Take a moment to think...</Text>
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
              backgroundColor: glass2,
              transform: [{
                translateY: revealAnims[currentIndex].interpolate({
                  inputRange: [0, 1], outputRange: [16, 0],
                })
              }]
            }
          ]}>
            <View style={[styles.answerTop, { borderBottomColor: border }]}>
              <View style={styles.answerLabelRow}>
                <Icon name="lightbulb" size={16} color={accentColor} />
                <Text style={[styles.answerLabel, { color: accentColor }]}>The Explanation</Text>
              </View>
            </View>
            <Text style={[styles.answerText, { color: txt2 }]}>{q.answer}</Text>
          </Animated.View>
        )}

        <View style={styles.btnRow}>
          {!isCurrentRevealed ? (
            <View style={[styles.btnShadow, { shadowColor: accentColor }]}>
              <TouchableOpacity onPress={handleReveal} activeOpacity={0.8} style={styles.revealBtn}>
                <LinearGradient
                  colors={[accentColor, accentColor + 'D0']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.revealBtnGrad}
                >
                  <View style={styles.revealBtnInner}>
                    <Icon name="brain" size={20} color="#fff" />
                    <Text style={styles.revealBtnText}>Reveal the explanation</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : !isLast ? (
            <TouchableOpacity onPress={goNext} activeOpacity={0.8}
              style={[styles.nextBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '15' }]}>
              <Text style={[styles.nextBtnText, { color: accentColor }]}>Next question →</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.btnShadow, { shadowColor: gold }]}>
              <TouchableOpacity onPress={() => { soundWhoosh(); onComplete(); }} activeOpacity={0.8} style={styles.quizBtn}>
                <LinearGradient
                  colors={[gold, '#FF9F1C']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.quizBtnGrad}
                >
                  <View style={styles.quizBtnInner}>
                    <Icon name="trophy" size={20} color={isDark ? '#0D0F1E' : '#fff'} />
                    <Text style={[styles.quizBtnText, { color: isDark ? '#0D0F1E' : '#fff' }]}>Ready for the Quiz!</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.nudgeBox, { backgroundColor: glass1, borderColor: border }]}>
          <Icon name="sparkle" size={14} color={txtM} />
          <Text style={[styles.nudgeText, { color: txtM }]}>
            Understanding the "why" makes the quiz much easier — and makes the knowledge stick!
          </Text>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  header: { alignItems: 'center', marginBottom: SPACING.lg },
  headerIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 12,
  },
  headerLabel: { fontFamily: FONTS.displayMedium, fontSize: 20, marginBottom: 6 },
  headerSub: { fontFamily: FONTS.body, fontSize: 14 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg, height: 32 },
  progressPill: { borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  progressPillText: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  questionWrap: { marginBottom: SPACING.md },
  questionCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg },
  questionIconBadge: {
    width: 58, height: 58, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: SPACING.md,
  },
  questionNum: { fontFamily: FONTS.bodyMedium, fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  questionText: { fontFamily: FONTS.displayMedium, fontSize: 17, lineHeight: 26, marginBottom: SPACING.md },
  thinkBox: {
    borderRadius: RADIUS.md, padding: 12, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  thinkText: { fontFamily: FONTS.body, fontSize: 13, textAlign: 'center' },
  answerCard: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.md },
  answerTop: { padding: SPACING.md, borderBottomWidth: 1 },
  answerLabel: { fontFamily: FONTS.displayMedium, fontSize: 13, letterSpacing: 0.5 },
  answerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  answerText: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 24, padding: SPACING.md },
  btnRow: { marginBottom: SPACING.md },
  btnShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  revealBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  revealBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  revealBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  revealBtnText: { fontFamily: FONTS.displayMedium, fontSize: 17, color: '#fff', letterSpacing: 0.5 },
  nextBtn: { paddingVertical: 18, borderRadius: RADIUS.xl, borderWidth: 1, alignItems: 'center' },
  nextBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, letterSpacing: 0.5 },
  quizBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  quizBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  quizBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quizBtnText: { fontFamily: FONTS.displayMedium, fontSize: 17, letterSpacing: 0.5 },
  nudgeBox: {
    borderRadius: RADIUS.md, padding: 14, borderWidth: 1,
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
  },
  nudgeText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18, flex: 1 },
});