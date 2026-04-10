import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { soundTap, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// ─────────────────────────────────────────────
//  TheoryCards — horizontal swipe cards
//  Each theory entry in config renders as a card
// ─────────────────────────────────────────────

export default function TheoryCards({ theory, accentColor, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goToCard = (index) => {
    soundTap();
    Haptics.selectionAsync();
    const clamped = Math.max(0, Math.min(index, theory.length - 1));
    setCurrentIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * (CARD_WIDTH + 16), animated: true });
    Animated.spring(progressAnim, {
      toValue: clamped / (theory.length - 1),
      tension: 80, friction: 14, useNativeDriver: false,
    }).start();

    if (clamped === theory.length - 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (CARD_WIDTH + 16));
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
      Animated.spring(progressAnim, {
        toValue: idx / (theory.length - 1),
        tension: 80, friction: 14, useNativeDriver: false,
      }).start();
    }
  };

  const isLast = currentIndex === theory.length - 1;

  return (
    <View style={styles.root}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {theory.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToCard(i)}>
            <Animated.View style={[
              styles.dot,
              {
                width: i === currentIndex ? 20 : 8,
                backgroundColor: i === currentIndex ? accentColor : COLORS.glass3,
                opacity: i <= currentIndex ? 1 : 0.3,
              }
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Card count */}
      <Text style={[styles.cardCount, { color: accentColor }]}>
        {currentIndex + 1} / {theory.length}
      </Text>

      {/* Scrollable cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.cardsContainer}
        style={styles.scrollView}
      >
        {theory.map((card, index) => (
          <TheoryCard
            key={card.id}
            card={card}
            index={index}
            total={theory.length}
            isActive={index === currentIndex}
          />
        ))}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => goToCard(currentIndex - 1)}
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtnText, currentIndex === 0 && { opacity: 0.3 }]}>← Prev</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            onPress={() => { soundWhoosh(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onComplete(); }}
            style={[styles.completeBtn, { borderColor: accentColor + '80', backgroundColor: accentColor + '18' }]}
          >
            <LinearGradient
              colors={[accentColor + 'CC', accentColor + '88']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.completeBtnGrad}
            >
              <Text style={styles.completeBtnText}>Theory Complete! →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => goToCard(currentIndex + 1)}
            style={[styles.nextBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '12' }]}
          >
            <Text style={[styles.nextBtnText, { color: accentColor }]}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Individual Theory Card ────────────────────

function TheoryCard({ card, index, total, isActive }) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.95,
      tension: 100, friction: 14,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <Animated.View style={[
      styles.cardWrap,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <LinearGradient
        colors={card.bgGradient || ['#1A1040', '#0D0D1A']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: card.color + '40' }]}
      >
        {/* Top accent bar */}
        <View style={[styles.accentBar, { backgroundColor: card.color }]} />

        {/* Card header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{card.icon}</Text>
          <View style={[styles.cardIndexBadge, { borderColor: card.color + '50', backgroundColor: card.color + '15' }]}>
            <Text style={[styles.cardIndexText, { color: card.color }]}>{index + 1}/{total}</Text>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: card.color }]}>{card.title}</Text>

        {/* Formula highlight */}
        {card.formula && (
          <BlurView intensity={15} tint="dark" style={styles.formulaBox}>
            <Text style={[styles.formula, { color: card.color }]}>{card.formula}</Text>
          </BlurView>
        )}

        {/* Content */}
        <Text style={styles.cardContent}>{card.content}</Text>

        {/* Highlight callout */}
        {card.highlight && (
          <View style={[styles.highlight, { borderLeftColor: card.color, backgroundColor: card.color + '0F' }]}>
            <Text style={styles.highlightIcon}>💡</Text>
            <Text style={[styles.highlightText, { color: card.color }]}>{card.highlight}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dotsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingHorizontal: 24, marginBottom: 8,
  },
  dot: {
    height: 8, borderRadius: 4,
    transition: 'all 0.3s',
  },
  cardCount: {
    fontFamily: FONTS.mono, fontSize: 12,
    textAlign: 'center', marginBottom: 14,
  },
  scrollView: {
    flexGrow: 0,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    paddingRight: 24,
  },
  cardWrap: {
    width: CARD_WIDTH,
    ...SHADOWS.card,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    minHeight: 400,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
    marginTop: 8,
  },
  cardIcon: { fontSize: 40 },
  cardIndexBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  cardIndexText: { fontFamily: FONTS.mono, fontSize: 11 },
  cardTitle: {
    fontFamily: FONTS.display, fontSize: 22,
    lineHeight: 28, marginBottom: SPACING.md,
  },
  formulaBox: {
    borderRadius: RADIUS.md, overflow: 'hidden',
    padding: 12, marginBottom: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  formula: {
    fontFamily: FONTS.mono, fontSize: 18,
    letterSpacing: 1,
  },
  cardContent: {
    fontFamily: FONTS.body, fontSize: 15,
    color: COLORS.textSecondary, lineHeight: 24,
    marginBottom: SPACING.md,
  },
  highlight: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 8, borderLeftWidth: 3,
    borderRadius: RADIUS.sm, padding: 12,
    marginTop: 4,
  },
  highlightIcon: { fontSize: 16 },
  highlightText: {
    fontFamily: FONTS.bodyMedium, fontSize: 14,
    lineHeight: 20, flex: 1,
  },

  // Navigation
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    gap: 12,
  },
  navBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: {
    fontFamily: FONTS.bodyMedium, fontSize: 14,
    color: COLORS.textSecondary,
  },
  nextBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: RADIUS.md, borderWidth: 1,
    alignItems: 'center',
  },
  nextBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  completeBtn: {
    flex: 1, borderRadius: RADIUS.md,
    borderWidth: 1, overflow: 'hidden',
  },
  completeBtnGrad: {
    paddingVertical: 14, alignItems: 'center',
  },
  completeBtnText: {
    fontFamily: FONTS.displayMedium, fontSize: 15,
    color: COLORS.textPrimary,
  },
});
