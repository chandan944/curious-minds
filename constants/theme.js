// ─────────────────────────────────────────────
//  CURIOUS MINDS — Premium Design System v2.0
//  Neo Glassmorphism + Light/Dark Mode + Gamified UI
// ─────────────────────────────────────────────

export const createTheme = (isDark = true) => ({
  // ── Background Layers ──────────────────────
  bg: {
    base:     isDark ? '#08090F' : '#F4F6F9',
    surface:  isDark ? '#0E1018' : '#FFFFFF',
    elevated: isDark ? '#141620' : '#FFFFFF',
    card:     isDark ? '#181B28' : '#FFFFFF',
    overlay:  isDark ? 'rgba(8,9,15,0.85)' : 'rgba(244,246,249,0.85)',
  },

  // ── Glass Surfaces ─────────────────────────
  glass: {
    light:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
    medium:  isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)',
    strong:  isDark ? 'rgba(255,255,255,0.11)' : 'rgba(15,23,42,0.10)',
    border:  isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)',
    borderBright: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.15)',
  },

  // ── Typography ─────────────────────────────
  text: {
    primary:   isDark ? '#E8EAFF' : '#0F172A',
    secondary: isDark ? 'rgba(232,234,255,0.65)' : '#475569',
    muted:     isDark ? 'rgba(232,234,255,0.35)' : '#94A3B8',
    inverse:   isDark ? '#0D0F1E' : '#FFFFFF',
  },

  // ── Accent System ──────────────────────────
  accent: {
    primary:  '#7B6FFF',
    secondary:'#4FC9C0',
    gold:     '#FFD166',
    coral:    '#FF6B6B',
    mint:     '#4ECDC4',
  },

  // ── Status Colors ──────────────────────────
  status: {
    correct:     '#00D4A0',
    correctGlow: 'rgba(0,212,160,0.25)',
    wrong:       '#FF4D6D',
    wrongGlow:   'rgba(255,77,109,0.25)',
    warning:     '#FF9F1C',
    info:        '#5B9CF6',
  },

  // ── Topic Accent Colors ────────────────────
  topics: {
    gravity:     { primary: '#7B6FFF', shadow: 'rgba(123,111,255,0.30)' },
    chemistry:   { primary: '#00D4A0', shadow: 'rgba(0,212,160,0.30)'   },
    biology:     { primary: '#4FC9C0', shadow: 'rgba(79,201,192,0.30)'  },
    electricity: { primary: '#FFD166', shadow: 'rgba(255,209,102,0.30)' },
    light:       { primary: '#FF6B9D', shadow: 'rgba(255,107,157,0.30)' },
    sound:       { primary: '#FF9F1C', shadow: 'rgba(255,159,28,0.30)'  },
    magnetism:   { primary: '#89D4F5', shadow: 'rgba(137,212,245,0.30)' },
    evolution:   { primary: '#98D8C8', shadow: 'rgba(152,216,200,0.30)' },
    cells:       { primary: '#C3B1E1', shadow: 'rgba(195,177,225,0.30)' },
    atoms:       { primary: '#85C1E9', shadow: 'rgba(133,193,233,0.30)' },
    chemical:    { primary: '#4ECDC4', shadow: 'rgba(78,205,196,0.30)'  },
    brain:       { primary: '#A855F7', shadow: 'rgba(168,85,247,0.30)' },
    ancient:     { primary: '#D4A74A', shadow: 'rgba(212,167,74,0.30)' },
    industrial:  { primary: '#FF7A59', shadow: 'rgba(255,122,89,0.30)' },
    military:    { primary: '#B42B2B', shadow: 'rgba(180,43,43,0.30)' },
    genetics:    { primary: '#00D4A0', shadow: 'rgba(0,212,160,0.30)' },
    chemistry:   { primary: '#00E5FF', shadow: 'rgba(0,229,255,0.30)' },
    evolution:   { primary: '#4CA050', shadow: 'rgba(76,160,80,0.30)' },
    space:       { primary: '#7B2CBF', shadow: 'rgba(123,44,191,0.30)' },
    cyberpunk:   { primary: '#FF007F', shadow: 'rgba(255,0,127,0.30)' },
    network:     { primary: '#3B82F6', shadow: 'rgba(59,130,246,0.30)' },
    default:     { primary: '#7B6FFF', shadow: 'rgba(123,111,255,0.30)' },
  },

  // ── Shadows ────────────────────────────────
  shadows: {
    card:   isDark
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 32, elevation: 20 }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 4  }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6  },
    soft:   isDark
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4  }, shadowOpacity: 0.3,  shadowRadius: 12, elevation: 8  }
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2  }, shadowOpacity: 0.07, shadowRadius: 8,  elevation: 3  },
    glow: (color) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.55 : 0.35,
      shadowRadius: 20,
      elevation: 12,
    }),
  },

  isDark,
});

// ── Static Design Tokens ───────────────────────
export const FONTS = {
  display:       'Outfit_700Bold',
  displayMedium: 'Outfit_600SemiBold',
  displayLight:  'Outfit_300Light',
  body:          'Outfit_400Regular',
  bodyMedium:    'Outfit_500Medium',
  mono:          'Outfit_400Regular',   // SpaceMono not installed — fallback to Outfit
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  xxl:  40,
  full: 999,
};

// ── Backward-compat COLORS export (dark mode default) ──
const _dark = createTheme(true);
export const COLORS = {
  bg0: _dark.bg.base,
  bg1: _dark.bg.surface,
  bg2: _dark.bg.elevated,
  bg3: _dark.bg.card,
  glass1: _dark.glass.light,
  glass2: _dark.glass.medium,
  glass3: _dark.glass.strong,
  glassBorder: _dark.glass.border,
  glassBorderBright: _dark.glass.borderBright,
  accent:    _dark.accent.primary,
  accentGlow:'rgba(123,111,255,0.30)',
  accentSoft:'rgba(123,111,255,0.12)',
  correct:   _dark.status.correct,
  correctGlow:_dark.status.correctGlow,
  wrong:     _dark.status.wrong,
  wrongGlow: _dark.status.wrongGlow,
  xpGold:    _dark.accent.gold,
  xpGoldGlow:'rgba(255,209,102,0.30)',
  warning:   _dark.status.warning,
  textPrimary:   _dark.text.primary,
  textSecondary: _dark.text.secondary,
  textMuted:     _dark.text.muted,
  textOnAccent:  '#FFFFFF',
  topicColors: Object.fromEntries(
    Object.entries(_dark.topics).map(([k, v]) => [k, { primary: v.primary, glow: v.shadow, soft: v.shadow.replace('0.30', '0.12') }])
  ),
};

export const SHADOWS = {
  card:  _dark.shadows.card,
  soft:  _dark.shadows.soft,
  glow:  _dark.shadows.glow,
};

export const GLASS_CARD = {
  backgroundColor: _dark.glass.medium,
  borderWidth: 1,
  borderColor: _dark.glass.border,
  borderRadius: RADIUS.lg,
  ..._dark.shadows.card,
};