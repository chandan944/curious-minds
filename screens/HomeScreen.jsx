// ─────────────────────────────────────────────
//  HomeScreen v3 — Theme-aware, SVG Icons, Gamified
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Animated, Platform, StatusBar, TextInput
} from 'react-native';

import { BlurView } from 'expo-blur';

const STATUS_BAR_H = Platform.OS === 'android' ? ((StatusBar.currentHeight || 36) + 10) : 0;
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, RADIUS, COLORS } from '../constants/theme';
import { TOPIC_REGISTRY, CATEGORIES } from '../constants/topicRegistry';
import { getXP, getStreak } from '../utils/storage';
import { getLevelForXP, getLevelProgress, getNextLevel } from '../constants/xpSystem';
import { soundTap, soundWhoosh } from '../utils/sounds';
import Icon from '../components/ui/Icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageToggle from '../components/ui/LanguageToggle';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredTopics = TOPIC_REGISTRY
    .filter(t => activeCategory === 'All' || t.category === activeCategory)
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    });

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
            <LanguageToggle size={36} />
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
const CARD_SIZE = '100%'; // Full width to match screenshot design

function TopicCard({ topic, index, theme, onPress }) {
  const topicColors = theme.topics;
  const colorKey = Object.keys(topicColors).find(k => topic.id.startsWith(k)) || 'default';
  const color = (topicColors[colorKey] || topicColors.default).primary;

  const isReady = topic.status === 'ready';
  const iconName = topic.icon || 'book';

  const glass1  = theme.glass.light;
  const glass2  = theme.glass.medium;
  const glass3  = theme.glass.strong;
  const border  = theme.glass.border;
  const txtPrim = theme.text.primary;
  const txtMut  = theme.text.muted;
  const cardBg  = theme.bg.card;
  const isDark  = theme.isDark;

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
        activeOpacity={0.9}
        disabled={!isReady}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={isReady 
            ? [isDark ? '#1C1D26' : '#FFFFFF', isDark ? '#13141C' : '#F9FAFB'] 
            : [isDark ? '#161720' : '#FFFFFF', isDark ? '#0D0E15' : '#F4F6F9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[
            styles.cardGrad,
            { borderColor: isReady ? (isDark ? '#2A2C3A' : '#E5E7EB') : border },
            !isReady && styles.cardDimmed,
          ]}
        >
          {/* Top Row */}
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardCategoryText, { color: isDark ? '#D8B4E2' : '#8A5B96' }]}>
              {topic.category.toUpperCase()}
            </Text>

          </View>

          {/* Center Circular Icon */}
          <View style={styles.cardCenter}>
            <View style={[styles.iconOrbContainer, { shadowColor: color }]}>
              <LinearGradient 
                colors={isDark ? ['#1A1B23', '#0F1015'] : ['#F9FAFB', '#F3F4F6']} 
                style={[styles.iconOrbInner, { borderColor: isDark ? '#2D2E3C' : '#E5E7EB' }]}
              >
                <Icon name={iconName} size={42} color={color} />
              </LinearGradient>
            </View>
            
            <Text style={[styles.cardTitle, { color: txtPrim }]} numberOfLines={2}>
              {topic.title}
            </Text>
          </View>

          {/* Bottom Divider */}
          <View style={[styles.cardDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Bottom Row */}
          <View style={styles.cardBottomRow}>
            {isReady ? (
              <View style={[styles.readyBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
                <View style={[styles.readyDot, { backgroundColor: color }]} />
                <Text style={[styles.readyText, { color }]}>Ready</Text>
              </View>
            ) : (
              <View style={[styles.comingBadge, { borderColor: border, backgroundColor: glass1 }]}>
                <Icon name="lock" size={10} color={txtMut} />
                <Text style={[styles.comingText, { color: txtMut }]}>Soon</Text>
              </View>
            )}

            <View style={styles.hashtagWrap}>
              <Icon name="hash" size={12} color={isDark ? '#52525B' : '#9CA3AF'} />
              <Text style={[styles.hashtagText, { color: isDark ? '#71717A' : '#6B7280' }]}>
                {topic.id.toUpperCase()}
              </Text>
            </View>
          </View>

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

  // Search Bar
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1, marginLeft: 10,
    fontFamily: FONTS.body, fontSize: 14,
    height: 20,
    padding: 0,
  },
  searchClear: {
    padding: 4,
  },

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
    flexDirection: 'column', gap: 16, // Stack cards vertically
  },
  card: { width: CARD_SIZE },
  cardTouchable: { width: '100%' },
  cardDimmed: { opacity: 0.6 },
  cardGrad: {
    borderRadius: 24, borderWidth: 1,
    padding: 20, minHeight: 280,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategoryText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  priorityText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconOrbContainer: {
    width: 90, height: 90,
    borderRadius: 45,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
  },
  iconOrbInner: {
    width: '100%', height: '100%',
    borderRadius: 45,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.display,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  cardDivider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  readyDot: { width: 6, height: 6, borderRadius: 3 },
  readyText: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  comingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  comingText: { fontFamily: FONTS.body, fontSize: 12 },
  hashtagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  hashtagText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});