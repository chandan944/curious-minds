import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../ui/Icons';

/**
 * ScientistCard
 * Props:
 *   title    — section heading shown at the top
 *   children — analytics content (grids, formulas, text)
 */
export default function ScientistCard({ title, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="flask" size={14} color="#7B6FFF" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>SCIENTIST</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(123,111,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(123,111,255,0.25)',
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(123,111,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.displayMedium,
    color: '#E8EAFF',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(123,111,255,0.35)',
  },
  modeText: {
    fontSize: 8,
    fontFamily: FONTS.displayMedium,
    color: '#C4BFFF',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(123,111,255,0.20)',
    marginHorizontal: SPACING.md,
  },
  body: {
    padding: SPACING.md,
  },
});
