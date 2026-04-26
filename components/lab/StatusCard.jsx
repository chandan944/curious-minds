import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../ui/Icons';

/**
 * StatusCard
 * Props:
 *   label  — short uppercase label (e.g. "VELOCITY")
 *   value  — numeric or string value to display
 *   unit   — unit suffix (e.g. "m/s")
 *   icon   — icon name passed to <Icon>
 *   color  — accent color for icon and value
 */
export default function StatusCard({ label, value, unit, icon, color = '#7B6FFF' }) {
  return (
    <View style={[styles.card, { borderColor: color + '33' }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Icon name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 6,
    marginHorizontal: 3,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontFamily: FONTS.displayMedium,
    textAlign: 'center',
  },
  unit: {
    fontSize: 10,
    fontFamily: FONTS.body,
    opacity: 0.7,
  },
  label: {
    fontSize: 8,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
