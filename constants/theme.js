// ─────────────────────────────────────────────
//  CURIOUS MINDS — Design Tokens
//  Neo Glassmorphism + Minimal Clean + Micro-Animations
// ─────────────────────────────────────────────

export const COLORS = {
  // Deep space background layers
  bg0: '#08080E',       // Deepest dark
  bg1: '#0D0D1A',       // Primary background
  bg2: '#12121F',       // Card base
  bg3: '#1A1A2E',       // Elevated surface

  // Glass surfaces
  glass1: 'rgba(255,255,255,0.04)',
  glass2: 'rgba(255,255,255,0.07)',
  glass3: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderBright: 'rgba(255,255,255,0.18)',

  // Accent palette — each topic owns one accent
  accent: '#6C63FF',     // Default violet
  accentGlow: 'rgba(108,99,255,0.35)',
  accentSoft: 'rgba(108,99,255,0.12)',

  // Status colors
  correct: '#00E5A0',
  correctGlow: 'rgba(0,229,160,0.30)',
  wrong: '#FF4D6D',
  wrongGlow: 'rgba(255,77,109,0.30)',
  xpGold: '#FFD166',
  xpGoldGlow: 'rgba(255,209,102,0.30)',
  warning: '#FF9F1C',

  // Text
  textPrimary: '#F0F0FF',
  textSecondary: 'rgba(240,240,255,0.60)',
  textMuted: 'rgba(240,240,255,0.35)',
  textOnAccent: '#FFFFFF',

  // Topic-specific accent colors (used in topic configs)
  topicColors: {
    gravity:     { primary: '#6C63FF', glow: 'rgba(108,99,255,0.35)',  soft: 'rgba(108,99,255,0.12)'  },
    chemistry:   { primary: '#00E5A0', glow: 'rgba(0,229,160,0.35)',   soft: 'rgba(0,229,160,0.12)'   },
    biology:     { primary: '#4ECDC4', glow: 'rgba(78,205,196,0.35)',  soft: 'rgba(78,205,196,0.12)'  },
    electricity: { primary: '#FFD166', glow: 'rgba(255,209,102,0.35)', soft: 'rgba(255,209,102,0.12)' },
    light:       { primary: '#FF6B9D', glow: 'rgba(255,107,157,0.35)', soft: 'rgba(255,107,157,0.12)' },
    sound:       { primary: '#FF9F1C', glow: 'rgba(255,159,28,0.35)',  soft: 'rgba(255,159,28,0.12)'  },
    magnetism:   { primary: '#A8EDEA', glow: 'rgba(168,237,234,0.35)', soft: 'rgba(168,237,234,0.12)' },
    evolution:   { primary: '#98D8C8', glow: 'rgba(152,216,200,0.35)', soft: 'rgba(152,216,200,0.12)' },
    cells:       { primary: '#C3B1E1', glow: 'rgba(195,177,225,0.35)', soft: 'rgba(195,177,225,0.12)' },
    atoms:       { primary: '#85C1E9', glow: 'rgba(133,193,233,0.35)', soft: 'rgba(133,193,233,0.12)' },
  },
};

export const FONTS = {
  display: 'Outfit_700Bold',
  displayMedium: 'Outfit_600SemiBold',
  displayLight: 'Outfit_300Light',
  body: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  mono: 'SpaceMono_400Regular',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
  full: 999,
};

export const SHADOWS = {
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  }),
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Glass card style preset
export const GLASS_CARD = {
  backgroundColor: COLORS.glass2,
  borderWidth: 1,
  borderColor: COLORS.glassBorder,
  borderRadius: RADIUS.lg,
  ...SHADOWS.card,
};

export const GLASS_CARD_BRIGHT = {
  ...GLASS_CARD,
  backgroundColor: COLORS.glass3,
  borderColor: COLORS.glassBorderBright,
};
