import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import { FACT_REGISTRY, FACT_CATEGORIES } from '../constants/factRegistry';
import Icon from '../components/ui/Icons';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../utils/sounds';

const { width } = Dimensions.get('window');

// ── Icon Mapping Helper ──────────────────────
const mapIcon = (name) => {
  const available = [
    'home', 'back', 'forward', 'settings', 'close', 'upload', 'chevron-right', 'chevron-left', 'user-plus', 'search', 'share',
    'star', 'trophy', 'badge', 'zap', 'calendar', 'sun', 'flame', 'lock', 'unlock', 'xp', 'coin', 'activity', 'plus', 'minus', 'repeat', 'power', 'layers', 'droplet',
    'brain', 'book', 'flask', 'telescope', 'atom', 'planet', 'dna', 'microscope', 'ruler', 'robot', 'snowflake', 'beaker', 'trash', 'edit', 'heart', 'shield', 'leaf', 'earth', 'bomb', 'wifi', 'terminal', 'cloud', 'waves', 'magnet', 'fire', 'magnet2', 'wrench', 'cpu', 'molecule', 'lightning', 'pressure', 'thermometer', 'battery', 'link', 'balance', 'water', 'time', 'galaxy', 'rocket', 'blackhole', 'binary', 'key', 'data', 'globe',
    'check', 'check-double', 'cross', 'clock', 'refresh', 'info', 'moon', 'lightbulb', 'target', 'chart', 'grid', 'play', 'download', 'sparkle', 'shovel', 'history', 'flag', 'factory', 'person', 'hammer', 'headphones', 'alert', 'users', 'hash', 'cube', 'question', 'void', 'chaos', 'mountain', 'compass', 'scroll', 'scale', 'eye', 'lotus', 'debate', 'rain', 'storm', 'broken_heart', 'mirror', 'spiral', 'dollar', 'eyes', 'sleep', 'volcano', 'handshake', 'chat', 'send', 'bell', 'heart-filled'
  ];
  if (available.includes(name)) return name;

  const map = {
    'twitter': 'globe', 'aperture': 'eye', 'triangle': 'mountain', 'git-branch': 'dna',
    'coffee': 'beaker', 'crosshair': 'target', 'award': 'trophy', 'message-circle': 'chat',
    'gift': 'star', 'monitor': 'terminal', 'smartphone': 'battery', 'truck': 'settings',
    'navigation': 'compass', 'tool': 'wrench', 'music': 'headphones', 'image': 'eye',
    'camera': 'eye', 'book-open': 'book', 'video': 'play', 'shopping-bag': 'heart',
    'user': 'person', 'message-square': 'chat', 'help-circle': 'question', 'check-circle': 'check',
    'dollar-sign': 'dollar', 'briefcase': 'lock', 'play-circle': 'play', 'share-2': 'share',
    'eye-off': 'chaos'
  };
  return map[name] || 'sparkle';
};

// ── Bento Grid Configurations ──────────────────────
const BENTO_GAP = 12;

export default function FactsHubScreen({ onClose, onSelectFactTopic, isTab = false }) {
  const { theme, isDark } = useTheme();
  const { isCompleted } = useProgress();
  
  const bg = theme?.bg?.base || '#08090F';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  
  const [activeCategory, setActiveCategory] = useState(FACT_CATEGORIES[0]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Group facts by category
  const categoryMap = useMemo(() => {
    const map = {};
    FACT_CATEGORIES.forEach(cat => {
      map[cat] = FACT_REGISTRY.filter(t => t.category === cat);
    });
    return map;
  }, []);

  const handleCategoryChange = (cat) => {
    if (cat === activeCategory) return;
    Haptics.selectionAsync();
    soundTap();
    
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 20, duration: 150, useNativeDriver: true })
    ]).start(() => {
      setActiveCategory(cat);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
      ]).start();
    });
  };

  const handleSelect = (topic) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFactTopic(topic);
  };

  const activeTopics = categoryMap[activeCategory] || [];

  const Container = isTab ? View : SafeAreaView;
  
  return (
    <Container style={[styles.root, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, isTab && { paddingTop: SPACING.md }]}>
        {!isTab && (
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Icon name="close" size={28} color={txt1} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: txt1, marginLeft: isTab ? 0 : 0 }]}>Explore</Text>
        {!isTab && <View style={{ width: 40 }} />}
      </View>

      {/* Massive Vertical Scroll of All Categories & Topics */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
       

        {FACT_CATEGORIES.map((cat, index) => {
          const topics = categoryMap[cat] || [];
          if (topics.length === 0) return null;
          
          return (
            <View key={cat} style={{ marginBottom: 40 }}>
              <Text style={[styles.sectionTitle, { color: txt1 }]}>{cat}</Text>
              <BentoGrid topics={topics} onPress={handleSelect} isCompleted={isCompleted} />
            </View>
          );
        })}
      </ScrollView>
    </Container>
  );
}

// ── Bento Grid Component ──────────────────────
function BentoGrid({ topics, onPress, isCompleted }) {
  if (!topics || topics.length === 0) return null;

  const t = (index) => topics[index] || null;

  return (
    <View style={styles.bentoGrid}>
      {/* 0: Hero */}
      {t(0) && <BentoCard topic={t(0)} onPress={onPress} variant="hero" isDone={isCompleted(t(0).id)} />}

      {/* 1 & 2: Two Squares */}
      <View style={styles.row}>
        {t(1) && <BentoCard topic={t(1)} onPress={onPress} variant="square" isDone={isCompleted(t(1).id)} />}
        {t(2) && <BentoCard topic={t(2)} onPress={onPress} variant="square" isDone={isCompleted(t(2).id)} />}
      </View>

      {/* 3: Tall, 4 & 5: Small stacked */}
      <View style={styles.row}>
        {t(3) && <BentoCard topic={t(3)} onPress={onPress} variant="tall" isDone={isCompleted(t(3).id)} />}
        <View style={styles.col}>
          {t(4) && <BentoCard topic={t(4)} onPress={onPress} variant="small" isDone={isCompleted(t(4).id)} />}
          {t(5) && <BentoCard topic={t(5)} onPress={onPress} variant="small" isDone={isCompleted(t(5).id)} />}
        </View>
      </View>

      {/* 6 & 7: Two Squares */}
      <View style={styles.row}>
        {t(6) && <BentoCard topic={t(6)} onPress={onPress} variant="square" isDone={isCompleted(t(6).id)} />}
        {t(7) && <BentoCard topic={t(7)} onPress={onPress} variant="square" isDone={isCompleted(t(7).id)} />}
      </View>

      {/* 8 & 9: Wide Footers */}
      {t(8) && <BentoCard topic={t(8)} onPress={onPress} variant="wide" isDone={isCompleted(t(8).id)} />}
      {t(9) && <BentoCard topic={t(9)} onPress={onPress} variant="wide" isDone={isCompleted(t(9).id)} />}
    </View>
  );
}

// ── Individual Bento Card ──────────────────────
function BentoCard({ topic, onPress, variant = 'square', isDone = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  // ── Variant Configuration Engine ──
  // Dynamically scales padding, typography, and icon size according to the physical dimensions of the card
  const config = {
    hero:   { style: styles.heroCard,   pad: 24, iconSize: 140, title: 26, sub: 15, showSub: true,  align: 'flex-end' },
    tall:   { style: styles.tallCard,   pad: 20, iconSize: 120, title: 22, sub: 14, showSub: true,  align: 'flex-end' },
    square: { style: styles.squareCard, pad: 16, iconSize: 90,  title: 18, sub: 13, showSub: true,  align: 'flex-end' },
    small:  { style: styles.smallCard,  pad: 12, iconSize: 60,  title: 15, sub: 12, showSub: false, align: 'flex-end' },
    wide:   { style: styles.wideCard,   pad: 16, iconSize: 100, title: 18, sub: 13, showSub: true,  align: 'center'   } // Wide banners look best centered vertically
  }[variant];

  const colors = [
    ['#FF416C', '#FF4B2B'], ['#8A2387', '#E94057'], ['#00B4DB', '#0083B0'],
    ['#11998E', '#38EF7D'], ['#FC466B', '#3F5EFB'], ['#ED213A', '#93291E'],
    ['#0F2027', '#2C5364'], ['#8E2DE2', '#4A00E0'], ['#1D976C', '#93F9B9'],
    ['#FF512F', '#DD2476']
  ];
  const gradient = colors[topic.title.length % colors.length];

  return (
    <Pressable 
      onPress={() => onPress(topic)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[config.style]}
    >
      <Animated.View style={[styles.cardInner, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Single, dynamically sized abstract background icon */}
        <Icon 
          name={mapIcon(topic.icon)} 
          size={config.iconSize} 
          color="rgba(255,255,255,0.15)" 
          style={styles.bleedingIcon}
        />

        {/* Done Badge */}
        {isDone && (
          <View style={styles.doneBadge}>
            <Icon name="check" size={12} color="#FFF" />
          </View>
        )}

        {/* Text container, alignment and padding perfectly matched to card size */}
        <View style={[styles.cardContent, { padding: config.pad }]}>
          <Text style={[styles.cardTitle, { fontSize: config.title }]} numberOfLines={2}>
            {topic.title}
          </Text>
          {config.showSub && topic.subtitle && (
            <Text style={[styles.cardSub, { fontSize: config.sub, marginTop: 4 }]} numberOfLines={1}>
              {topic.subtitle}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Styles ──────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, zIndex: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 1,
    paddingBottom: 5,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
  },
  // Intro Title
  introBox: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  introTitle: { fontFamily: FONTS.display, fontSize: 24, marginBottom: 4 },
  introSub: { fontFamily: FONTS.displayBold, fontSize: 36, marginBottom: 8 },
  sectionTitle: {
    fontFamily: FONTS.displayBold, 
    fontSize: 26, 
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  // Bento Layout
  bentoGrid: {
    gap: BENTO_GAP,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    gap: BENTO_GAP,
  },
  col: {
    flex: 1,
    gap: BENTO_GAP,
  },
  heroCard: { width: '100%', height: 220 },
  squareCard: { flex: 1, aspectRatio: 1 },
  tallCard: { flex: 1, height: 260 },
  smallCard: { height: 124 }, // (260 - 12 gap) / 2
  wideCard: { width: '100%', height: 100 },

  // Card Internals
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bleedingIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
    zIndex: 1,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  doneBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardTitle: {
    fontFamily: FONTS.displayBold,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardSub: {
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  horizontalIconBox: {
    width: 60, height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
