import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { TOPIC_REGISTRY, CATEGORIES } from '../constants/topicRegistry';
import { getXP, getStreak } from '../utils/storage';
import { getLevelForXP } from '../constants/xpSystem';
import StarBackground from '../components/ui/StarBackground';
import TopicScreen from './TopicScreen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getXP().then(setXp);
    getStreak().then(setStreak);
  }, []);

  // If a topic is selected, show TopicScreen
  if (selectedTopic) {
    return (
      <TopicScreen
        topicId={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  const level = getLevelForXP(xp);
  const categories = ['All', ...CATEGORIES];

  const filteredTopics = activeCategory === 'All'
    ? TOPIC_REGISTRY
    : TOPIC_REGISTRY.filter(t => t.category === activeCategory);

  return (
    <SafeAreaView style={styles.root}>
      <StarBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Curious Minds 🧠</Text>
            <Text style={styles.subGreeting}>What will you discover today?</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={[styles.xpLevel, { color: level.color }]}>{level.title}</Text>
            <Text style={styles.xpNum}>⭐ {xp} XP</Text>
            {streak > 0 && <Text style={styles.streak}>🔥 {streak} days</Text>}
          </View>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          contentContainerStyle={styles.catContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.catChip,
                activeCategory === cat && {
                  backgroundColor: COLORS.accent + '30',
                  borderColor: COLORS.accent,
                }
              ]}
            >
              <Text style={[
                styles.catText,
                activeCategory === cat && { color: COLORS.accent }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Topic grid */}
        <View style={styles.grid}>
          {filteredTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPress={() => {
                if (topic.status === 'ready') {
                  setSelectedTopic(topic.id);
                }
              }}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopicCard({ topic, onPress }) {
  const colorKey = topic.id;
  const color = COLORS.topicColors[colorKey]?.primary || COLORS.accent;
  const isReady = topic.status === 'ready';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, !isReady && styles.cardDimmed]}
      activeOpacity={isReady ? 0.75 : 0.9}
    >
      <LinearGradient
        colors={[color + '18', COLORS.bg2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardGrad, { borderColor: color + '35' }]}
      >
        <Text style={styles.cardEmoji}>{topic.emoji}</Text>
        <Text style={[styles.cardTitle, { color: isReady ? COLORS.textPrimary : COLORS.textMuted }]}>
          {topic.title}
        </Text>
        <Text style={styles.cardCategory}>{topic.category}</Text>
        {!isReady && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
        {isReady && (
          <View style={[styles.readyDot, { backgroundColor: color }]} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const CARD_SIZE = (width - SPACING.lg * 2 - 12) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  xpBadge: {
    alignItems: 'flex-end',
    backgroundColor: COLORS.glass1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 10,
  },
  xpLevel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  xpNum: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
    color: COLORS.xpGold,
    marginTop: 2,
  },
  streak: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.warning,
    marginTop: 2,
  },

  catRow: {
    marginBottom: SPACING.md,
  },
  catContent: {
    gap: 8,
    paddingRight: SPACING.lg,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
  },
  catText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
  },
  cardDimmed: {
    opacity: 0.55,
  },
  cardGrad: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    minHeight: 120,
    justifyContent: 'space-between',
    ...SHADOWS.soft,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  cardCategory: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.glass2,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  comingSoonText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  readyDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
