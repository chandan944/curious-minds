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
    overlay:  isDark ? 'rgba(8,9,15,0.85)' : 'rgba(255,255,255,0.85)',
  },

  // ── Glass Surfaces ─────────────────────────
  glass: {
    light:   isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
    medium:  isDark ? 'rgba(255,255,255,0.07)' : '#FFFFFF',
    strong:  isDark ? 'rgba(255,255,255,0.11)' : '#FFFFFF',
    border:  isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
    borderBright: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
  },

  // ── Typography ─────────────────────────────
  text: {
    primary:   isDark ? '#FFFFFF' : '#0F172A',
    secondary: isDark ? 'rgba(232,234,255,0.85)' : '#1E293B',
    muted:     isDark ? 'rgba(232,234,255,0.60)' : '#475569',
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
    scientific:  { primary: '#00D4FF', shadow: 'rgba(0,212,255,0.30)' },
    measurement: { primary: '#FFD166', shadow: 'rgba(255,209,102,0.30)' },
    matter:      { primary: '#4ECDC4', shadow: 'rgba(78,205,196,0.30)' },
    social:      { primary: '#FF6B9D', shadow: 'rgba(255,107,157,0.30)' },
    happiness:   { primary: '#FF9F1C', shadow: 'rgba(255,159,28,0.30)' },
    meaningful:  { primary: '#6C63FF', shadow: 'rgba(108,99,255,0.30)' },
    science:     { primary: '#FF4444', shadow: 'rgba(255,68,68,0.30)' },
    manipulation:{ primary: '#D4A74A', shadow: 'rgba(212,167,74,0.30)' },
    study:       { primary: '#34D399', shadow: 'rgba(52,211,153,0.30)' },
    mastery:     { primary: '#8B5CF6', shadow: 'rgba(139,92,246,0.30)' },
    earn:        { primary: '#FBBF24', shadow: 'rgba(251,191,36,0.30)' },
    love:        { primary: '#FB7185', shadow: 'rgba(251,113,133,0.30)' },
    anger:       { primary: '#EF4444', shadow: 'rgba(239,68,68,0.30)' },
    lust:        { primary: '#EC4899', shadow: 'rgba(236,72,153,0.30)' },
    greed:       { primary: '#ddae15ff', shadow: 'rgba(212,175,55,0.30)' },
    envy:        { primary: '#10B981', shadow: 'rgba(16,185,129,0.30)' },
    sloth:       { primary: '#F59E0B', shadow: 'rgba(245,158,11,0.30)' },
    wrath:       { primary: '#B91C1C', shadow: 'rgba(185,28,28,0.30)' },
    relationships:{ primary: '#0EA5E9', shadow: 'rgba(14,165,233,0.30)' },
    mental:      { primary: '#00D4A0', shadow: 'rgba(0,212,160,0.30)' },
    phobias:     { primary: '#89D4F5', shadow: 'rgba(137,212,245,0.30)' },
    good:        { primary: '#00FF7F', shadow: 'rgba(0,255,127,0.30)' },
    why:         { primary: '#FF00FF', shadow: 'rgba(255,0,255,0.30)' },
    basic:       { primary: '#98D8C8', shadow: 'rgba(152,216,200,0.30)' },
    atoms:       { primary: '#85C1E9', shadow: 'rgba(133,193,233,0.30)' },
    periodic:    { primary: '#C3B1E1', shadow: 'rgba(195,177,225,0.30)' },
    energy:      { primary: '#FFD700', shadow: 'rgba(255,215,0,0.30)' },
    forces:      { primary: '#FF7A59', shadow: 'rgba(255,122,89,0.30)' },
    work:        { primary: '#FF007F', shadow: 'rgba(255,0,127,0.30)' },
    heat:        { primary: '#FF4500', shadow: 'rgba(255,69,0,0.30)' },
    waves:       { primary: '#007FFF', shadow: 'rgba(0,127,255,0.30)' },
    light:       { primary: '#FF6B9D', shadow: 'rgba(255,107,157,0.30)' },
    electricity: { primary: '#FFD166', shadow: 'rgba(255,209,102,0.30)' },
    magnetism:   { primary: '#9B59B6', shadow: 'rgba(155,89,182,0.30)' },
    thermo:      { primary: '#E74C3C', shadow: 'rgba(231,76,60,0.30)' },
    momentum:    { primary: '#3498DB', shadow: 'rgba(52,152,219,0.30)' },
    pressure:    { primary: '#1ABC9C', shadow: 'rgba(26,188,156,0.30)' },
    relativity:  { primary: '#2ECC71', shadow: 'rgba(46,204,113,0.30)' },
    quantum:     { primary: '#9C27B0', shadow: 'rgba(156,39,176,0.30)' },
    chemical:    { primary: '#00E5FF', shadow: 'rgba(0,229,255,0.30)' },
    acids:       { primary: '#7FFF00', shadow: 'rgba(127,255,0,0.30)' },
    stoichiometry:{ primary: '#DEB887', shadow: 'rgba(222,184,135,0.30)' },
    organic:     { primary: '#228B22', shadow: 'rgba(34,139,34,0.30)' },
    electro:     { primary: '#FFA500', shadow: 'rgba(255,165,0,0.30)' },
    cell:        { primary: '#FF69B4', shadow: 'rgba(255,105,180,0.30)' },
    dna:         { primary: '#8A2BE2', shadow: 'rgba(138,43,226,0.30)' },
    evolution:   { primary: '#4CA050', shadow: 'rgba(76,160,80,0.30)' },
    human:       { primary: '#FFDAB9', shadow: 'rgba(255,218,185,0.30)' },
    nervous:     { primary: '#EE82EE', shadow: 'rgba(238,130,238,0.30)' },
    immune:      { primary: '#32CD32', shadow: 'rgba(50,205,50,0.30)' },
    photosynthesis: { primary: '#00FA9A', shadow: 'rgba(0,250,154,0.30)' },
    ecosystems:  { primary: '#2E8B57', shadow: 'rgba(46,139,87,0.30)' },
    brain:       { primary: '#DA70D6', shadow: 'rgba(218,112,214,0.30)' },
    memory:      { primary: '#6495ED', shadow: 'rgba(100,149,237,0.30)' },
    cognitive:   { primary: '#FF8C00', shadow: 'rgba(255,140,0,0.30)' },
    emotions:    { primary: '#DC143C', shadow: 'rgba(220,20,60,0.30)' },
    learning:    { primary: '#40E0D0', shadow: 'rgba(64,224,208,0.30)' },
    ancient:     { primary: '#CD853F', shadow: 'rgba(205,133,63,0.30)' },
    industrial:  { primary: '#A9A9A9', shadow: 'rgba(169,169,169,0.30)' },
    world:       { primary: '#8B4513', shadow: 'rgba(139,69,19,0.30)' },
    indian:      { primary: '#FF6347', shadow: 'rgba(255,99,71,0.30)' },
    solar:       { primary: '#FFD700', shadow: 'rgba(255,215,0,0.30)' },
    stars:       { primary: '#f5dd0bff', shadow: 'rgba(255,250,205,0.30)' },
    black_holes: { primary: '#00BFFF', shadow: 'rgba(0,191,255,0.30)' },
    big_bang:    { primary: '#BA55D3', shadow: 'rgba(186,85,211,0.30)' },
    exoplanets:  { primary: '#00CED1', shadow: 'rgba(0,206,209,0.30)' },
    binary:      { primary: '#00FF00', shadow: 'rgba(0,255,0,0.30)' },
    internet:    { primary: '#1E90FF', shadow: 'rgba(30,144,255,0.30)' },
    ai:          { primary: '#FF1493', shadow: 'rgba(255,20,147,0.30)' },
    digital:     { primary: '#00FFFF', shadow: 'rgba(0,255,255,0.30)' },
    crypto:      { primary: '#808000', shadow: 'rgba(128,128,0,0.30)' },
    data:        { primary: '#4169E1', shadow: 'rgba(65,105,225,0.30)' },
    financial:   { primary: '#3CB371', shadow: 'rgba(60,179,113,0.30)' },
    critical:    { primary: '#9932CC', shadow: 'rgba(153,50,204,0.30)' },
    climate:     { primary: '#00FA9A', shadow: 'rgba(0,250,154,0.30)' },
    atheism:     { primary: '#A0AEC0', shadow: 'rgba(160,174,192,0.30)' },
    nihilism:    { primary: '#4A5568', shadow: 'rgba(74,85,104,0.30)' },
    absurdism:   { primary: '#ED8936', shadow: 'rgba(237,137,54,0.30)' },
    stoicism:    { primary: '#718096', shadow: 'rgba(113,128,150,0.30)' },
    existentialism:{ primary: '#9F7AEA', shadow: 'rgba(159,122,234,0.30)' },
    enlightenment: { primary: '#f1d222ff', shadow: 'rgba(246,224,94,0.30)' },
    great_philosophers: { primary: '#D69E2E', shadow: 'rgba(214,158,46,0.30)' },
    ethics:      { primary: '#48BB78', shadow: 'rgba(72,187,120,0.30)' },
    free_will:   { primary: '#4FD1C5', shadow: 'rgba(79,209,197,0.30)' },
    consciousness: { primary: '#667EEA', shadow: 'rgba(102,126,234,0.30)' },
    eastern:     { primary: '#F687B3', shadow: 'rgba(246,135,179,0.30)' },
    how_religion: { primary: '#D53F8C', shadow: 'rgba(213,63,140,0.30)' },
    science_vs:  { primary: '#3182CE', shadow: 'rgba(49,130,206,0.30)' },
    world_religions: { primary: '#38B2AC', shadow: 'rgba(56,178,172,0.30)' },
    god_arguments: { primary: '#E53E3E', shadow: 'rgba(229,62,62,0.30)' },
    spirituality: { primary: '#9F7AEA', shadow: 'rgba(159,122,234,0.30)' },
    afterlife:   { primary: '#ED64A6', shadow: 'rgba(237,100,166,0.30)' },
    depression:  { primary: '#4299E1', shadow: 'rgba(66,153,225,0.30)' },
    anxiety:     { primary: '#F6AD55', shadow: 'rgba(246,173,85,0.30)' },
    fear:        { primary: '#FC8181', shadow: 'rgba(252,129,129,0.30)' },
    loneliness:  { primary: '#A0AEC0', shadow: 'rgba(160,174,192,0.30)' },
    trauma:      { primary: '#E53E3E', shadow: 'rgba(229,62,62,0.30)' },
    self_esteem: { primary: '#68D391', shadow: 'rgba(104,211,145,0.30)' },
    burnout:     { primary: '#F56565', shadow: 'rgba(245,101,101,0.30)' },
    overthinking: { primary: '#B794F4', shadow: 'rgba(183,148,244,0.30)' },
    meditation:  { primary: '#2ECC71', shadow: 'rgba(46,204,113,0.30)' },
    addiction:   { primary: '#E74C3C', shadow: 'rgba(231,76,60,0.30)' },
    consistency: { primary: '#F39C12', shadow: 'rgba(243,156,18,0.30)' },
    life_hacks:  { primary: '#F1C40F', shadow: 'rgba(241,196,15,0.30)' },
    politics:    { primary: '#34495E', shadow: 'rgba(52,73,94,0.30)' },
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
  // ── Backward-compat aliases used by lab files ──
  bold:          'Outfit_600SemiBold',
  regular:       'Outfit_400Regular',
  displayBold:   'Outfit_700Bold',
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