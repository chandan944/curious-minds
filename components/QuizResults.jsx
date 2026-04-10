import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { soundCelebration, soundXP, soundBadge } from '../utils/sounds';
import * as Haptics from 'expo-haptics';

// ─────────────────────────────────────────────
//  QuizResults — celebration screen after quiz
// ─────────────────────────────────────────────

export default function QuizResults({
  score,
  total,
  timeSeconds,
  xpEarned,
  newBadges,
  accentColor,
  topicTitle,
  isPerfect,
  onRetry,
  onContinue,
}) {
  const pct = Math.round((score / total) * 100);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
      Animated.stagger(150, starsAnim.slice(0, getStars()).map(a =>
        Animated.spring(a, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true })
      )),
    ]).start();

    // Animate score count
    Animated.timing(scoreAnim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
    Animated.timing(xpAnim, { toValue: xpEarned, duration: 1500, delay: 400, useNativeDriver: false }).start();

    if (isPerfect) {
      soundCelebration();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      soundXP();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (newBadges?.length > 0) {
      setTimeout(() => soundBadge(), 800);
    }
  }, []);

  const getStars = () => {
    if (pct === 100) return 3;
    if (pct >= 70) return 2;
    if (pct >= 50) return 1;
    return 0;
  };

  const getMessage = () => {
    if (isPerfect) return { title: "PERFECT! 🌟", sub: "Absolutely flawless. You're a genius!", color: COLORS.xpGold };
    if (pct >= 80) return { title: "Excellent! 🎉", sub: "Outstanding knowledge!", color: COLORS.correct };
    if (pct >= 60) return { title: "Good Job! 👏", sub: "Solid understanding. Keep it up!", color: accentColor };
    if (pct >= 40) return { title: "Keep Going! 💪", sub: "Review the theory and try again!", color: COLORS.warning };
    return { title: "Don't Give Up! 🔄", sub: "Re-read the theory cards and retry!", color: COLORS.wrong };
  };

  const msg = getMessage();
  const stars = getStars();
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      {/* Celebration glow */}
      {isPerfect && (
        <View style={[styles.celebrationGlow, { backgroundColor: COLORS.xpGold }]} />
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          {/* Stars */}
          <View style={styles.starsRow}>
            {[0,1,2].map(i => (
              <Animated.Text key={i} style={[
                styles.star,
                { opacity: starsAnim[i], transform: [{ scale: starsAnim[i] }] },
                i >= stars && { opacity: starsAnim[i].interpolate({ inputRange: [0,1], outputRange: [0, 0.2] }) },
              ]}>⭐</Animated.Text>
            ))}
          </View>

          {/* Score circle */}
          <View style={[styles.scoreCircle, { borderColor: msg.color + '60' }]}>
            <LinearGradient
              colors={[msg.color + '20', 'transparent']}
              style={styles.scoreCircleGrad}
            >
              <Animated.Text style={[styles.scoreNum, { color: msg.color }]}>
                {score}/{total}
              </Animated.Text>
              <Text style={[styles.scorePct, { color: msg.color }]}>{pct}%</Text>
            </LinearGradient>
          </View>

          {/* Message */}
          <Text style={[styles.msgTitle, { color: msg.color }]}>{msg.title}</Text>
          <Text style={styles.msgSub}>{msg.sub}</Text>

          {/* Stats grid */}
          <BlurView intensity={18} tint="dark" style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <StatItem icon="✅" label="Correct" value={`${score}/${total}`} color={COLORS.correct} />
              <StatItem icon="⏱️" label="Time" value={formatTime(timeSeconds)} color={accentColor} />
              <StatItem icon="⭐" label="XP Earned" value={`+${xpEarned}`} color={COLORS.xpGold} />
              <StatItem icon="🔥" label="Stars" value={`${stars}/3`} color={COLORS.warning} />
            </View>
          </BlurView>

          {/* New badges */}
          {newBadges?.length > 0 && (
            <BlurView intensity={18} tint="dark" style={[styles.badgesCard, { borderColor: COLORS.xpGold + '40' }]}>
              <Text style={[styles.badgesTitle, { color: COLORS.xpGold }]}>🏅 New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</Text>
              {newBadges.map(badge => (
                <View key={badge.id} style={styles.badgeRow}>
                  <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                  <View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </BlurView>
          )}

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>🔄 Retry Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
              <LinearGradient
                colors={[accentColor + 'CC', accentColor + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.continueBtnGrad}
              >
                <Text style={styles.continueBtnText}>
                  {score >= total * 0.7 ? 'Complete! →' : 'Back to Topic →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Motivational note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {pct < 70
                ? "💡 Tip: Re-read the theory cards, especially the highlighted callouts. The quiz questions are based directly on them."
                : "🚀 Great job! Try exploring a related topic next to build on your knowledge."
              }
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg1 },
  celebrationGlow: {
    position: 'absolute',
    top: -80, alignSelf: 'center',
    width: 400, height: 400, borderRadius: 200, opacity: 0.08,
  },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl },
  container: { alignItems: 'center' },

  starsRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.lg },
  star: { fontSize: 44 },

  scoreCircle: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 3, overflow: 'hidden',
    marginBottom: SPACING.lg, ...SHADOWS.soft,
  },
  scoreCircleGrad: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontFamily: FONTS.display, fontSize: 32 },
  scorePct: { fontFamily: FONTS.bodyMedium, fontSize: 16, marginTop: 2 },

  msgTitle: { fontFamily: FONTS.display, fontSize: 28, marginBottom: 8 },
  msgSub: {
    fontFamily: FONTS.body, fontSize: 15,
    color: COLORS.textSecondary, marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  statsCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden', width: '100%',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glass1,
  },
  statsGrid: {
    flexDirection: 'row', padding: SPACING.md,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 17, marginBottom: 2 },
  statLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted },

  badgesCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    overflow: 'hidden', width: '100%',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.glass1, padding: SPACING.md,
  },
  badgesTitle: {
    fontFamily: FONTS.displayMedium, fontSize: 14,
    marginBottom: 12, letterSpacing: 0.3,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  badgeEmoji: { fontSize: 32 },
  badgeName: { fontFamily: FONTS.displayMedium, fontSize: 14, color: COLORS.textPrimary },
  badgeDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted },

  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: SPACING.md },
  retryBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.glass2,
    alignItems: 'center',
  },
  retryBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary },
  continueBtn: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
  continueBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  continueBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15, color: '#fff' },

  noteBox: {
    backgroundColor: COLORS.glass1, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    padding: 14, width: '100%',
  },
  noteText: {
    fontFamily: FONTS.body, fontSize: 13,
    color: COLORS.textMuted, lineHeight: 18, textAlign: 'center',
  },
});
