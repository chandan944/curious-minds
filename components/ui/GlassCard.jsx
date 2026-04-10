import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

// ─────────────────────────────────────────────
//  GlassCard — Neo Glassmorphism card container
//  Usage: <GlassCard glow="#6C63FF" style={...}>
// ─────────────────────────────────────────────

export default function GlassCard({
  children,
  style,
  glow,
  intensity = 18,
  bright = false,
  noBorder = false,
  radius = RADIUS.lg,
  padding = 20,
}) {
  return (
    <View style={[styles.wrapper, { borderRadius: radius }, glow && SHADOWS.glow(glow), style]}>
      {/* Outer glow ring */}
      {glow && (
        <View style={[
          styles.glowRing,
          { borderRadius: radius + 1, borderColor: glow + '40' }
        ]} />
      )}

      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.blur,
          { borderRadius: radius },
          !noBorder && {
            borderWidth: 1,
            borderColor: bright ? COLORS.glassBorderBright : COLORS.glassBorder,
          },
        ]}
      >
        {/* Inner gradient highlight (top edge) */}
        <View style={[styles.innerHighlight, { borderRadius: radius }]} />
        <View style={{ padding }}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  blur: {
    overflow: 'hidden',
    backgroundColor: COLORS.glass2,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    margin: -1,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
