import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RADIUS, SPACING } from '../../constants/theme';

/**
 * SimBox
 * A styled container for the SVG simulation canvas.
 * Children are rendered inside a rounded, dark glass-style box
 * with relative positioning so overlays can be absolutely positioned.
 */
export default function SimBox({ children, style = {} }) {
  return (
    <View style={[styles.box, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,9,15,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.md,
    position: 'relative',
  },
});
