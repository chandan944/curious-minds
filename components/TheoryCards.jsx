import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundTap, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';
import MarkdownText from './ui/MarkdownText';

const { width, height: SCREEN_H } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function TheoryCards({ theory, accentColor, onComplete }) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Theme tokens
  const txt1 = theme.text.primary;
  const txt2 = theme.text.secondary;
  const txtM = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const glass3 = theme.glass.strong;
  const border = theme.glass.border;

  const goToCard = (direction) => {
    soundTap();
    Haptics.selectionAsync();
    const next = Math.max(0, Math.min(currentIndex + direction, theory.length - 1));
    setCurrentIndex(next);
    if (next === theory.length - 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const isLast = currentIndex === theory.length - 1;
  const card = theory[currentIndex];

  return (
    <View style={styles.root}>
      {/* Top bar: dots + counter */}
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          {theory.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => { soundTap(); setCurrentIndex(i); }}>
              <View style={[
                styles.dot,
                {
                  width: i === currentIndex ? 22 : 8,
                  backgroundColor: i === currentIndex ? accentColor : glass3,
                  opacity: i <= currentIndex ? 1 : 0.3,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.counterBadge, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
          <Text style={[styles.counterText, { color: accentColor }]}>{currentIndex + 1}/{theory.length}</Text>
        </View>
      </View>

      {/* Scrollable card — vertical scroll so long content is always accessible */}
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
        key={currentIndex}
      >
        <TheoryCard
          card={card}
          index={currentIndex}
          total={theory.length}
          isDark={isDark}
          txt1={txt1}
          txt2={txt2}
          accentColor={accentColor}
          onPress={() => {
            if (isLast) {
              soundWhoosh();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onComplete();
            } else {
              goToCard(1);
            }
          }}
        />
      </ScrollView>

      {/* Navigation buttons — always pinned at bottom */}
      <View style={[styles.navRow, { borderTopColor: border }]}>
        <TouchableOpacity
          onPress={() => goToCard(-1)}
          style={[styles.navBtn, { borderColor: border, backgroundColor: glass1 }, currentIndex === 0 && styles.navBtnDisabled]}
          disabled={currentIndex === 0}
        >
          <View style={styles.navBtnInner}>
            <Icon name="back" size={14} color={txt2} />
            <Text style={[styles.navBtnText, { color: txt2 }]}>Prev</Text>
          </View>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            onPress={() => { soundWhoosh(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onComplete(); }}
            style={[styles.completeBtn, { borderColor: accentColor + '80' }]}
          >
            <LinearGradient
              colors={[accentColor + 'CC', accentColor + '88']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.completeBtnGrad}
            >
              <View style={styles.completeBtnInner}>
                <Text style={styles.completeBtnText}>Theory Complete!</Text>
                <Icon name="forward" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => goToCard(1)}
            style={[styles.nextBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '12' }]}
          >
            <View style={styles.nextBtnInner}>
              <Text style={[styles.nextBtnText, { color: accentColor }]}>Next</Text>
              <Icon name="forward" size={14} color={accentColor} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Individual Theory Card ────────────────────

function TheoryCard({ card, index, total, isDark, txt1, txt2, accentColor, onPress }) {
  const bgGrad = isDark
    ? (card.bgGradient || ['#1A1040', '#0D0D1A'])
    : ['#FFFFFF', '#F5F5FF'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
      <LinearGradient
        colors={bgGrad}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: card.color + (isDark ? '40' : '30') }]}
      >
      {/* Top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: card.color }]} />

      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: card.color + '20', borderColor: card.color + '30' }]}>
          <Icon name={card.svgIcon || 'sparkle'} size={28} color={card.color} />
        </View>
        <View style={[styles.cardIndexBadge, { borderColor: card.color + '50', backgroundColor: card.color + '15' }]}>
          <Text style={[styles.cardIndexText, { color: card.color }]}>{index + 1}/{total}</Text>
        </View>
      </View>

      <Text style={[styles.cardTitle, { color: card.color }]}>{card.title}</Text>

      {/* Formula highlight */}
      {card.formula && (
        <View style={[styles.formulaBox, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        }]}>
          <Text style={[styles.formula, { color: card.color }]}>{card.formula}</Text>
        </View>
      )}

      {/* Content */}
      <MarkdownText style={[styles.cardContent, { color: isDark ? 'rgba(232,234,255,0.70)' : 'rgba(13,15,30,0.65)' }]} highlightColor="#FFD166">
        {card.content}
      </MarkdownText>

      {/* Highlight callout */}
      {card.highlight && (
        <View style={[styles.highlight, { borderLeftColor: card.color, backgroundColor: card.color + '0F' }]}>
          <View style={[styles.highlightIconWrap, { backgroundColor: card.color + '20' }]}>
            <Icon name="lightbulb" size={14} color={card.color} />
          </View>
          <MarkdownText style={[styles.highlightText, { color: card.color }]} highlightColor="#FFD166">{card.highlight}</MarkdownText>
        </View>
      )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm, paddingBottom: 6, gap: 12,
  },
  dotsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
  },
  dot: { height: 8, borderRadius: 4 },
  counterBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1,
  },
  counterText: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  // Vertical scroll for the card
  cardScroll: { flex: 1 },
  cardScrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 80 },

  card: {
    borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.lg, overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md, marginTop: 8,
  },
  cardIconWrap: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  cardIndexBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  cardIndexText: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  cardTitle: {
    fontFamily: FONTS.display, fontSize: 22, lineHeight: 28, marginBottom: SPACING.md,
  },
  formulaBox: {
    borderRadius: RADIUS.md, overflow: 'hidden',
    padding: 12, marginBottom: SPACING.md, alignItems: 'center',
  },
  formula: { fontFamily: FONTS.bodyMedium, fontSize: 18, letterSpacing: 1 },
  cardContent: {
    fontFamily: FONTS.body, fontSize: 15, lineHeight: 24, marginBottom: SPACING.md,
  },
  highlight: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderLeftWidth: 3, borderRadius: RADIUS.sm, padding: 12, marginTop: 4,
  },
  highlightIconWrap: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  highlightText: {
    fontFamily: FONTS.bodyMedium, fontSize: 14, lineHeight: 20, flex: 1,
  },

  // Navigation — pinned at bottom
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 24, gap: 12,
    borderTopWidth: 1,
    marginBottom: 10,
  },
  navBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: RADIUS.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    
  },
  navBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  nextBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  nextBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  nextBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  completeBtn: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden' },
  completeBtnGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  completeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completeBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15, color: '#FFFFFF' },
});
