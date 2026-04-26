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
import MarkdownText from './ui/MarkdownText';

export default function DoYouKnowWhy({ questions, accentColor, onComplete }) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const revealAnims = useMemo(
    () => Array.from({ length: questions.length }, () => new Animated.Value(0)),
    []
  );

  const txt1   = theme.text.primary;
  const txt2   = theme.text.secondary;
  const txtM   = theme.text.muted;
  const bg     = theme.bg.surface;
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
      toValue: 1, tension: 55, friction: 12, useNativeDriver: true,
    }).start();
  };

  const goNext = () => {
    soundTap();
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(i => i + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 14, useNativeDriver: true }),
      ]).start();
    });
  };

  if (!questions || questions.length === 0) return null;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Section Label ── */}
        <View style={styles.sectionLabel}>
          <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
          <Text style={[styles.sectionLabelText, { color: accentColor }]}>DO YOU KNOW WHY?</Text>
        </View>

        {/* ── Progress dots ── */}
        <View style={styles.dotsRow}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < currentIndex
                    ? accentColor + '60'
                    : i === currentIndex
                    ? accentColor
                    : isDark ? '#FFFFFF20' : '#00000015',
                  width: i === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* ── Question ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <View style={styles.questionBlock}>
            <Text style={[styles.counterText, { color: txtM }]}>
              {currentIndex + 1} / {questions.length}
            </Text>
            <MarkdownText
              style={[styles.questionText, { color: txt1 }]}
              highlightColor={accentColor}
            >
              {q.question}
            </MarkdownText>
          </View>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#FFFFFF10' : '#00000010' }]} />

          {/* ── Answer reveal ── */}
          {isCurrentRevealed ? (
            <Animated.View
              style={{
                opacity: revealAnims[currentIndex],
                transform: [{
                  translateY: revealAnims[currentIndex].interpolate({
                    inputRange: [0, 1], outputRange: [12, 0],
                  })
                }]
              }}
            >
              <View style={[styles.answerBlock, { borderLeftColor: accentColor }]}>
                <Text style={[styles.answerLabel, { color: accentColor }]}>THE EXPLANATION</Text>
                <MarkdownText
                  style={[styles.answerText, { color: txt2 }]}
                  highlightColor={accentColor}
                >
                  {q.answer}
                </MarkdownText>
              </View>
            </Animated.View>
          ) : (
            <Text style={[styles.thinkPrompt, { color: txtM }]}>
              Think about it before revealing...
            </Text>
          )}
        </Animated.View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          {!isCurrentRevealed ? (
            <TouchableOpacity
              onPress={handleReveal}
              activeOpacity={0.85}
              style={[styles.primaryBtn, { backgroundColor: accentColor }]}
            >
              <Text style={styles.primaryBtnText}>Reveal Answer</Text>
            </TouchableOpacity>
          ) : !isLast ? (
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.85}
              style={[styles.primaryBtn, { backgroundColor: accentColor }]}
            >
              <View style={styles.btnRow}>
                <Text style={styles.primaryBtnText}>Next Question</Text>
                <Icon name="forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => { soundWhoosh(); onComplete(); }}
              activeOpacity={0.85}
              style={[styles.primaryBtn, { backgroundColor: gold }]}
            >
              <View style={styles.btnRow}>
                <Icon name="trophy" size={18} color={isDark ? '#0D0F1E' : '#fff'} />
                <Text style={[styles.primaryBtnText, { color: isDark ? '#0D0F1E' : '#fff' }]}>
                  Take the Quiz
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {!isCurrentRevealed && (
            <TouchableOpacity
              onPress={() => { soundTap(); isLast ? onComplete() : goNext(); }}
              activeOpacity={0.7}
              style={styles.skipLink}
            >
              <Text style={[styles.skipLinkText, { color: txtM }]}>Skip →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.xl,
  },
  accentLine: { width: 3, height: 18, borderRadius: 2 },
  sectionLabelText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 12,
    letterSpacing: 2.5,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  questionBlock: {
    marginBottom: SPACING.xl,
  },
  counterText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  questionText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    lineHeight: 25,
  },

  divider: {
    height: 1,
    marginBottom: SPACING.xl,
  },

  thinkPrompt: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: SPACING.xxl,
  },

  answerBlock: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  answerLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  answerText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },

  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipLinkText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});