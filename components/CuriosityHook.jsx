import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundWhoosh, soundTap } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';
import MarkdownText from './ui/MarkdownText';

const { height: SCREEN_H } = Dimensions.get('window');

export default function CuriosityHook({ hook, accentColor, topicTitle, onContinue }) {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(18)).current;
  const revealSlide = useRef(new Animated.Value(60)).current;
  const revealFade = useRef(new Animated.Value(0)).current;
  const [revealed, setRevealed] = React.useState(false);

  const txt1 = theme.text.primary;
  const txt2 = theme.text.secondary;
  const txtM = theme.text.muted;
  const bg   = theme.bg.surface;
  const color = accentColor || theme.accent.primary;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(lineAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.spring(textAnim, { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleReveal = () => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed(true);
    Animated.parallel([
      Animated.timing(revealFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(revealSlide, { toValue: 0, tension: 55, friction: 13, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* ── Top: Category label left-aligned ── */}
        <View style={styles.topRow}>
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
          <Text style={[styles.categoryText, { color }]}>{topicTitle?.toUpperCase()}</Text>
        </View>

        {/* ── Animated accent line ── */}
        <Animated.View
          style={[
            styles.accentBar,
            {
              backgroundColor: color,
              width: lineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />

        {/* ── Giant faded number ── */}
       
        {/* ── Question — left aligned, editorial ── */}
        <Animated.View style={{ transform: [{ translateY: textAnim }] }}>
          <Text style={[styles.questionLabel, { color: txtM }]}>Question</Text>
          <MarkdownText style={[styles.questionText, { color: txt1 }]} highlightColor={color}>
            {hook.question}
          </MarkdownText>
        </Animated.View>

        {/* ── Bottom divider line ── */}
        <View style={[styles.bottomDivider, { backgroundColor: isDark ? '#FFFFFF12' : '#00000012' }]} />

        {/* ── Reveal / Answer ── */}
        {!revealed ? (
          <View style={styles.revealArea}>
            <TouchableOpacity onPress={handleReveal} activeOpacity={0.8} style={[styles.revealBtn, { borderColor: color + '50', backgroundColor: color + '0A' }]}>
              <Text style={[styles.revealBtnText, { color }]}>Reveal the Answer</Text>
              <View style={[styles.revealArrow, { borderColor: color }]}>
                <Icon name="forward" size={14} color={color} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { soundTap(); onContinue(); }} activeOpacity={0.6} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: txtM }]}>Skip →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.answerBlock,
              { opacity: revealFade, transform: [{ translateY: revealSlide }] },
            ]}
          >
            <View style={styles.answerHeader}>
              <View style={[styles.answerAccent, { backgroundColor: color }]} />
              <Text style={[styles.answerLabel, { color }]}>THE ANSWER</Text>
            </View>
            <MarkdownText style={[styles.answerText, { color: txt2 }]} highlightColor={color}>
              {hook.reveal}
            </MarkdownText>
            <TouchableOpacity
              onPress={() => { soundTap(); onContinue(); }}
              activeOpacity={0.85}
              style={[styles.continueBtn, { backgroundColor: color }]}
            >
              <Text style={styles.continueBtnText}>Start Learning</Text>
              <Icon name="forward" size={15} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    minHeight: SCREEN_H * 0.75,
  },
  container: {},

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  categoryDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  categoryText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 11,
    letterSpacing: 2.5,
  },

  accentBar: {
    height: 2,
    borderRadius: 1,
    marginBottom: SPACING.lg,
  },

  bigNumber: {
    fontFamily: FONTS.displayMedium,
    fontSize: 140,
    lineHeight: 140,
    letterSpacing: -4,
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: -1,
  },

  questionLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  questionText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    lineHeight: 28,
  },

  bottomDivider: {
    height: 1,
    marginVertical: SPACING.xl,
  },

  revealArea: {
    gap: SPACING.md,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
  },
  revealBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  revealArrow: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  skipBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  skipText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  answerBlock: {
    gap: SPACING.md,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  answerAccent: {
    width: 3, height: 16, borderRadius: 2,
  },
  answerLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 11,
    letterSpacing: 2.5,
  },
  answerText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 24,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  continueBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
