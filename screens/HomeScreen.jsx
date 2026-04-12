// ─────────────────────────────────────────────
//  HomeScreen v3 — Theme-aware, SVG Icons, Gamified
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Animated, Platform, StatusBar,
} from 'react-native';

const STATUS_BAR_H = Platform.OS === 'android' ? ((StatusBar.currentHeight || 36) + 10) : 0;
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING, RADIUS, COLORS } from '../constants/theme';
import { TOPIC_REGISTRY, CATEGORIES } from '../constants/topicRegistry';
import { getXP, getStreak } from '../utils/storage';
import { getLevelForXP, getLevelProgress, getNextLevel } from '../constants/xpSystem';
import { soundTap, soundWhoosh } from '../utils/sounds';
import Icon from '../components/ui/Icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import TopicScreen from './TopicScreen';

const { width } = Dimensions.get('window');

// ── Category → Icon mapping ───────────────────
const CAT_ICONS = {
  All:         'grid',
  Foundations: 'sparkle',
  Physics:     'planet',
  Chemistry:   'flask',
  Biology:     'dna',
  Psychology:  'brain',
  History:     'history',
  Space:       'telescope',
  Technology:  'cpu',
};

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const headerFade = useRef(new Animated.Value(0)).current;
  const listFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getXP().then(setXp);
    getStreak().then(setStreak);

    Animated.stagger(120, [
      Animated.spring(headerFade, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
      Animated.spring(listFade,   { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
    ]).start();
  }, []);

  if (selectedTopic) {
    return <TopicScreen topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  const level = getLevelForXP(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);
  const categories = ['All', ...CATEGORIES];

  const filteredTopics = activeCategory === 'All'
    ? TOPIC_REGISTRY
    : TOPIC_REGISTRY.filter(t => t.category === activeCategory);

  const readyTopics = TOPIC_REGISTRY.filter(t => t.status === 'ready').length;

  // Theme-reactive colors
  const bg       = theme.bg.base;
  const surface  = theme.bg.surface;
  const card     = theme.bg.card;
  const glass1   = theme.glass.light;
  const glass2   = theme.glass.medium;
  const glass3   = theme.glass.strong;
  const border   = theme.glass.border;
  const borderBr = theme.glass.borderBright;
  const txt1     = theme.text.primary;
  const txt2     = theme.text.secondary;
  const txtM     = theme.text.muted;
  const accent   = theme.accent.primary;
  const gold     = theme.accent.gold;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg, paddingTop: STATUS_BAR_H }]}>
      {/* Ambient background orbs */}
      <View style={[styles.orb1, { backgroundColor: accent }]} />
      <View style={[styles.orb2, { backgroundColor: theme.accent.mint }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoRow}>
              <View style={[styles.logoIcon, { backgroundColor: accent + '25', borderColor: accent + '50' }]}>
                <Icon name="brain" size={22} color={accent} />
              </View>
              <Text style={[styles.appName, { color: txt1 }]}>Curious Minds</Text>
            </View>
            <Text style={[styles.tagline, { color: txtM }]}>What will you discover today?</Text>
          </View>

          {/* Theme Toggle + Settings */}
          <View style={styles.headerRight}>
            <ThemeToggle size={36} />
            
          </View>
        </Animated.View>

        {/* ── XP + Level Card ─────────────────── */}
        <Animated.View style={{ opacity: headerFade }}>
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.xpCard, { borderColor: borderBr }]}>
            <LinearGradient
              colors={[accent + '18', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.xpCardGrad}
            >
              {/* Left: Level info */}
              <View style={styles.xpLeft}>
                <View style={[styles.levelBadge, { backgroundColor: level.color + '20', borderColor: level.color + '50' }]}>
                  <Icon name="sparkle" size={14} color={level.color} />
                  <Text style={[styles.levelTitle, { color: level.color }]}>{level.title}</Text>
                </View>
                <Text style={[styles.xpNum, { color: gold }]}>{xp.toLocaleString()} XP</Text>
                {nextLevel && (
                  <Text style={[styles.xpNext, { color: txtM }]}>
                    {nextLevel.minXP - xp} XP to {nextLevel.title}
                  </Text>
                )}
                {/* Progress bar */}
                <View style={[styles.progressTrack, { backgroundColor: glass3 }]}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: level.color }]} />
                </View>
              </View>

              {/* Divider */}
              <View style={[styles.xpDivider, { backgroundColor: borderBr }]} />

              {/* Right: Stats */}
              <View style={styles.xpRight}>
                <StatPill
                  icon="flame"
                  iconColor="#FF9F1C"
                  value={streak > 0 ? `${streak}d` : '0d'}
                  label="Streak"
                  txt1={txt1} txtM={txtM}
                />
                <StatPill
                  icon="check"
                  iconColor={theme.status.correct}
                  value={`${readyTopics}`}
                  label="Ready"
                  txt1={txt1} txtM={txtM}
                />
                <StatPill
                  icon="trophy"
                  iconColor={gold}
                  value={`${level.level}`}
                  label="Level"
                  txt1={txt1} txtM={txtM}
                />
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* ── Daily Challenge Banner ────────────── */}
        <TouchableOpacity style={styles.challengeBanner} onPress={() => soundTap()} activeOpacity={0.85}>
          <LinearGradient
            colors={[gold + 'CC', '#44e66cff']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.challengeGrad}
          >
            <View style={styles.challengeLeft}>
              <View style={styles.challengeIconWrap}>
                <Icon name="zap" size={20} color="#0D0F1E" />
              </View>
              <View>
                <Text style={styles.challengeTitle}>Daily Challenge</Text>
                <Text style={styles.challengeSub}>Complete Gravity — earn 2× XP</Text>
              </View>
            </View>
            <View style={styles.challengeRight}>
              <Text style={styles.challengeXP}>+200 XP</Text>
              <Icon name="forward" size={16} color="#0D0F1E" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Category Filter ───────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          contentContainerStyle={styles.catContent}
        >
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  soundTap();
                  setActiveCategory(cat);
                }}
                style={[
                  styles.catChip,
                  { borderColor: border, backgroundColor: glass1 },
                  isActive && { backgroundColor: accent + '22', borderColor: accent + '80' },
                ]}
                activeOpacity={0.75}
              >
                <Icon
                  name={CAT_ICONS[cat] || 'grid'}
                  size={14}
                  color={isActive ? accent : txtM}
                />
                <Text style={[styles.catText, { color: isActive ? accent : txt2 }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Section Header ────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: txt1 }]}>
            {activeCategory === 'All' ? 'All Topics' : activeCategory}
          </Text>
          <Text style={[styles.sectionCount, { color: txtM }]}>{filteredTopics.length} topics</Text>
        </View>

        {/* ── Topic Grid ───────────────────────── */}
        <Animated.View style={[styles.grid, { opacity: listFade }]}>
          {filteredTopics.map((topic, idx) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={idx}
              theme={theme}
              onPress={() => {
                if (topic.status === 'ready') setSelectedTopic(topic.id);
              }}
            />
          ))}
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stat Pill ──────────────────────────────────
function StatPill({ icon, iconColor, value, label, txt1, txtM }) {
  return (
    <View style={styles.statPill}>
      <Icon name={icon} size={16} color={iconColor} />
      <Text style={[styles.statPillValue, { color: txt1 }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: txtM }]}>{label}</Text>
    </View>
  );
}

// ── Topic Card ─────────────────────────────────
const CARD_SIZE = (width - SPACING.lg * 2 - 12) / 2;

function TopicCard({ topic, index, theme, onPress }) {
  const topicColors = theme.topics;
  const colorKey = Object.keys(topicColors).find(k => topic.id.startsWith(k)) || 'default';
  const color = (topicColors[colorKey] || topicColors.default).primary;

  const isReady = topic.status === 'ready';
  const iconName = topic.icon || 'book';

  const glass1  = theme.glass.light;
  const glass2  = theme.glass.medium;
  const border  = theme.glass.border;
  const txtPrim = theme.text.primary;
  const txtMut  = theme.text.muted;
  const cardBg  = theme.bg.card;

  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => {
    soundTap();
    Animated.spring(scale, { toValue: 0.96, tension: 300, friction: 10, useNativeDriver: true }).start();
  };
  const onPressOut = () => Animated.spring(scale, { toValue: 1.00, tension: 300, friction: 10, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={!isReady}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={isReady ? [color + '18', cardBg] : [glass2, cardBg]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[
            styles.cardGrad,
            { borderColor: isReady ? color + '35' : border },
            !isReady && styles.cardDimmed,
          ]}
        >
          {/* Top accent line */}
          {isReady && <View style={[styles.cardAccentBar, { backgroundColor: color }]} />}

          {/* Icon container */}
          <View style={[
            styles.cardIconWrap,
            { backgroundColor: isReady ? color + '18' : glass2, borderColor: isReady ? color + '30' : border }
          ]}>
            <Icon name={iconName} size={22} color={isReady ? color : txtMut} />
          </View>

          {/* Title */}
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: isReady ? txtPrim : txtMut }]} numberOfLines={2}>
              {topic.title}
            </Text>
            <Text style={[styles.cardCategory, { color: txtMut }]}>{topic.category}</Text>
          </View>

          {/* Status badge */}
          {isReady ? (
            <View style={[styles.readyBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
              <View style={[styles.readyDot, { backgroundColor: color }]} />
              <Text style={[styles.readyText, { color }]}>Ready</Text>
            </View>
          ) : (
            <View style={[styles.comingBadge, { borderColor: border, backgroundColor: glass1 }]}>
              <Icon name="lock" size={10} color={txtMut} />
              <Text style={[styles.comingText, { color: txtMut }]}>Soon</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Ambient orbs
  orb1: {
    position: 'absolute', top: -120, left: -80,
    width: 280, height: 280, borderRadius: 140,
    opacity: 0.06,
  },
  orb2: {
    position: 'absolute', top: 200, right: -100,
    width: 240, height: 240, borderRadius: 120,
    opacity: 0.05,
  },

  // Scroll
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  appName: {
    fontFamily: FONTS.display, fontSize: 22,
  },
  tagline: {
    fontFamily: FONTS.body, fontSize: 13,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },

  // XP Card
  xpCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  xpCardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  xpLeft: { flex: 1 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
    marginBottom: 8,
  },
  levelTitle: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  xpNum: { fontFamily: FONTS.display, fontSize: 22 },
  xpNext: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2, marginBottom: 8 },
  progressTrack: {
    height: 4,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2 },
  xpDivider: { width: 1, height: 64 },
  xpRight: { gap: 8 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  statPillValue: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  statPillLabel: { fontFamily: FONTS.body, fontSize: 11 },

  // Daily Challenge
  challengeBanner: {
    borderRadius: RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  challengeGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
  },
  challengeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIconWrap: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
  },
  challengeTitle: { fontFamily: FONTS.displayMedium, fontSize: 14, color: '#0D0F1E' },
  challengeSub: { fontFamily: FONTS.body, fontSize: 12, color: 'rgba(13,15,30,0.7)' },
  challengeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  challengeXP: { fontFamily: FONTS.displayMedium, fontSize: 14, color: '#0D0F1E' },

  // Category filter
  catRow: { marginBottom: SPACING.md },
  catContent: { gap: 8, paddingRight: SPACING.lg },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  catText: { fontFamily: FONTS.bodyMedium, fontSize: 13 },

  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  sectionCount: { fontFamily: FONTS.body, fontSize: 13 },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  card: { width: CARD_SIZE },
  cardTouchable: { width: '100%' },
  cardDimmed: { opacity: 0.5 },
  cardGrad: {
    borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.md, minHeight: 164,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardAccentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
  },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 10, marginTop: 4,
  },
  cardTitle: { fontFamily: FONTS.displayMedium, fontSize: 13, lineHeight: 19, marginBottom: 3 },
  cardCategory: { fontFamily: FONTS.body, fontSize: 11, marginBottom: 10 },
  readyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  readyDot: { width: 5, height: 5, borderRadius: 2.5 },
  readyText: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  comingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  comingText: { fontFamily: FONTS.body, fontSize: 10 },
});