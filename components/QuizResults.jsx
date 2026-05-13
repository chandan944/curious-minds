import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundCelebration, soundXP, soundBadge, soundTap, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';

export default function QuizResults({
  score, total, timeSeconds, xpEarned, newBadges,
  accentColor, topicTitle, isPerfect, onRetry, onContinue,
}) {
  const { theme, isDark } = useTheme();

  // Theme tokens
  const bg     = theme.bg.surface;
  const txt1   = theme.text.primary;
  const txt2   = theme.text.secondary;
  const txtM   = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const border = theme.glass.border;
  const borderBr = theme.glass.borderBright;
  const gold   = theme.accent.gold;
  const correct = theme.status.correct;
  const warning = theme.status.warning;
  const wrong  = theme.status.wrong;

  const pct      = Math.round((score / total) * 100);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const starsAnim = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const getStars = () => {
    if (pct === 100) return 3;
    if (pct >= 70)   return 2;
    if (pct >= 50)   return 1;
    return 0;
  };

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fadeAnim,  { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
      Animated.stagger(150, starsAnim.slice(0, getStars()).map(a =>
        Animated.spring(a, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true })
      )),
    ]).start();

    if (isPerfect) {
      soundCelebration();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      soundXP();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (newBadges?.length > 0) setTimeout(() => soundBadge(), 800);
  }, []);

  const getMessage = () => {
    if (isPerfect) return { title: 'PERFECT!',    sub: "Absolutely flawless. You're a genius!", color: gold,    icon: 'sparkle' };
    if (pct >= 80) return { title: 'Excellent!',  sub: 'Outstanding knowledge!',               color: correct, icon: 'trophy'  };
    if (pct >= 60) return { title: 'Good Job!',   sub: 'Solid understanding. Keep it up!',     color: accentColor, icon: 'star' };
    if (pct >= 40) return { title: 'Keep Going!', sub: 'Review the theory and try again!',     color: warning, icon: 'refresh' };
    return         { title: "Don't Give Up!", sub: 'Re-read the theory cards and retry!',      color: wrong,   icon: 'refresh' };
  };

  const msg   = getMessage();
  const stars = getStars();
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {isPerfect && (
        <View style={[styles.celebrationGlow, { backgroundColor: gold }]} />
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[0, 1, 2].map(i => (
              <Animated.View key={i} style={[
                styles.starWrap,
                { opacity: starsAnim[i], transform: [{ scale: starsAnim[i] }] },
                i >= stars && { opacity: 0.2 },
              ]}>
                <View style={[styles.starBg, { backgroundColor: i < stars ? gold + '25' : 'transparent' }]}>
                  <Icon name="star" size={32} color={i < stars ? gold : txtM} filled={i < stars} />
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Score circle */}
          <View style={[styles.scoreCircle, { borderColor: msg.color + '60' }]}>
            <LinearGradient colors={[msg.color + '25', 'transparent']} style={styles.scoreCircleGrad}>
              <Icon name={msg.icon} size={24} color={msg.color} />
              <Text style={[styles.scoreNum, { color: msg.color }]}>{score}/{total}</Text>
              <Text style={[styles.scorePct, { color: msg.color }]}>{pct}%</Text>
            </LinearGradient>
          </View>

          {/* Message */}
          <Text style={[styles.msgTitle, { color: msg.color }]}>{msg.title}</Text>
          <Text style={[styles.msgSub, { color: txt2 }]}>{msg.sub}</Text>

          {/* Stats grid */}
          <View style={[styles.statsCard, { backgroundColor: glass1, borderColor: border }]}>
            <View style={styles.statsGrid}>
              <StatItem icon="check" iconColor={correct} label="Correct" value={`${score}/${total}`} color={correct} txtM={txtM} />
              <StatItem icon="clock" iconColor={accentColor} label="Time" value={formatTime(timeSeconds)} color={accentColor} txtM={txtM} />
              <StatItem icon="xp" iconColor={gold} label="XP Earned" value={`+${xpEarned}`} color={gold} txtM={txtM} />
              <StatItem icon="star" iconColor={warning} label="Stars" value={`${stars}/3`} color={warning} txtM={txtM} />
            </View>
          </View>

          {/* New badges */}
          {newBadges?.length > 0 && (
            <View style={[styles.badgesCard, { backgroundColor: glass1, borderColor: gold + '40' }]}>
              <View style={styles.badgesTitleRow}>
                <Icon name="badge" size={16} color={gold} />
                <Text style={[styles.badgesTitle, { color: gold }]}>
                  New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!
                </Text>
              </View>
              {newBadges.map(badge => (
                <View key={badge.id} style={styles.badgeRow}>
                  <View style={[styles.badgeIconWrap, { backgroundColor: gold + '20' }]}>
                    <Icon name="trophy" size={20} color={gold} />
                  </View>
                  <View>
                    <Text style={[styles.badgeName, { color: txt1 }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDesc, { color: txtM }]}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={() => { soundTap(); onRetry(); }} style={[styles.retryBtn, { borderColor: borderBr, backgroundColor: glass2 }]}>
              <View style={styles.retryBtnInner}>
                <Icon name="refresh" size={16} color={txt2} />
                <Text style={[styles.retryBtnText, { color: txt2 }]}>Retry Quiz</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { soundWhoosh(); onContinue(); }} style={styles.continueBtn}>
              <LinearGradient
                colors={[accentColor + 'CC', accentColor + '88']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.continueBtnGrad}
              >
                <Icon name="forward" size={16} color="#fff" />
                <Text style={styles.continueBtnText}>
                  {score >= total * 0.7 ? 'Complete!' : 'Back to Topic'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Motivational note */}
          

        </Animated.View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, iconColor, label, value, color, txtM }) {
  return (
    <View style={styles.statItem}>
      <Icon name={icon} size={20} color={iconColor} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: txtM }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  celebrationGlow: {
    position: 'absolute', top: -80, alignSelf: 'center',
    width: 400, height: 400, borderRadius: 200, opacity: 0.08,
  },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl },
  container: { alignItems: 'center' },

  starsRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.lg },
  starWrap: { alignItems: 'center' },
  starBg: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  scoreCircle: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 3, overflow: 'hidden', marginBottom: SPACING.lg,
  },
  scoreCircleGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  scoreNum: { fontFamily: FONTS.display, fontSize: 28 },
  scorePct: { fontFamily: FONTS.bodyMedium, fontSize: 14 },

  msgTitle: { fontFamily: FONTS.display, fontSize: 26, marginBottom: 6 },
  msgSub: { fontFamily: FONTS.body, fontSize: 15, marginBottom: SPACING.lg, textAlign: 'center' },

  statsCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
    width: '100%', marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row', padding: SPACING.md, justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statLabel: { fontFamily: FONTS.body, fontSize: 11 },

  badgesCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
    width: '100%', marginBottom: SPACING.md, padding: SPACING.md,
  },
  badgesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  badgesTitle: { fontFamily: FONTS.displayMedium, fontSize: 14, letterSpacing: 0.3 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  badgeIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeName: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  badgeDesc: { fontFamily: FONTS.body, fontSize: 12 },

  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: SPACING.md },
  retryBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  retryBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  retryBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  continueBtn: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
  continueBtnGrad: {
    paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  continueBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15, color: '#fff' },

  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: RADIUS.md, borderWidth: 1, padding: 14, width: '100%',
  },
  noteText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18, flex: 1 },
});
