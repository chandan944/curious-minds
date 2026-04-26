import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../ui/Icons';

/**
 * ChallengeCard
 * Props:
 *   title       — challenge name
 *   instruction — text description of the challenge goal
 *   completed   — boolean; true shows a success state
 *   onNext      — callback to advance to the next challenge
 */
export default function ChallengeCard({ title, instruction, completed, onNext }) {
  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{completed ? '🏆' : '🎯'}</Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        <View style={[styles.badge, completed ? styles.badgeDone : styles.badgePending]}>
          <Text style={styles.badgeText}>{completed ? 'DONE' : 'ACTIVE'}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      {completed && (
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.nextText}>Next Challenge</Text>
          <Icon name="arrow-right" size={14} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: SPACING.md,
  },
  cardCompleted: {
    borderColor: '#00D4A0',
    backgroundColor: 'rgba(0,212,160,0.07)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.displayMedium,
    color: '#E8EAFF',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgePending: {
    backgroundColor: 'rgba(123,111,255,0.25)',
  },
  badgeDone: {
    backgroundColor: 'rgba(0,212,160,0.30)',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: FONTS.displayMedium,
    color: '#FFF',
    letterSpacing: 0.8,
  },
  instruction: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: 'rgba(232,234,255,0.65)',
    lineHeight: 20,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#00D4A0',
    gap: 6,
  },
  nextText: {
    fontSize: 13,
    fontFamily: FONTS.displayMedium,
    color: '#000',
  },
});
