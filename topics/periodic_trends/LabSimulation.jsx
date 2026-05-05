import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 60) / 10; // Show first 10 columns for mobile view
const SIM_H = 340;
const AnimatedG = Animated.createAnimatedComponent(G);

// ── Simplified Data ───────────────────────────
const ELEMENTS = [
  { s: 'H', r: 37, en: 2.2, ie: 1312, g: 1, p: 1, color: '#FFB74D' },
  { s: 'He', r: 31, en: 0, ie: 2372, g: 18, p: 1, color: '#81C784' },
  { s: 'Li', r: 152, en: 0.98, ie: 520, g: 1, p: 2, color: '#E57373' },
  { s: 'Be', r: 112, en: 1.57, ie: 899, g: 2, p: 2, color: '#E57373' },
  { s: 'B', r: 82, en: 2.04, ie: 801, g: 13, p: 2, color: '#64B5F6' },
  { s: 'C', r: 77, en: 2.55, ie: 1086, g: 14, p: 2, color: '#64B5F6' },
  { s: 'N', r: 75, en: 3.04, ie: 1402, g: 15, p: 2, color: '#64B5F6' },
  { s: 'O', r: 73, en: 3.44, ie: 1314, g: 16, p: 2, color: '#64B5F6' },
  { s: 'F', r: 71, en: 3.98, ie: 1681, g: 17, p: 2, color: '#64B5F6' },
  { s: 'Ne', r: 69, en: 0, ie: 2081, g: 18, p: 2, color: '#81C784' },
  { s: 'Na', r: 186, en: 0.93, ie: 496, g: 1, p: 3, color: '#E57373' },
  { s: 'Mg', r: 160, en: 1.31, ie: 738, g: 2, p: 3, color: '#E57373' },
  { s: 'Al', r: 143, en: 1.61, ie: 578, g: 13, p: 3, color: '#A1887F' },
  { s: 'Si', r: 111, en: 1.9, ie: 786, g: 14, p: 3, color: '#A1887F' },
  { s: 'P', r: 106, en: 2.19, ie: 1012, g: 15, p: 3, color: '#64B5F6' },
  { s: 'S', r: 102, en: 2.58, ie: 1000, g: 16, p: 3, color: '#64B5F6' },
  { s: 'Cl', r: 99, en: 3.16, ie: 1251, g: 17, p: 3, color: '#64B5F6' },
  { s: 'Ar', r: 97, en: 0, ie: 1521, g: 18, p: 3, color: '#81C784' },
  { s: 'K', r: 227, en: 0.82, ie: 419, g: 1, p: 4, color: '#E57373' },
  { s: 'Ca', r: 197, en: 1.0, ie: 590, g: 2, p: 4, color: '#E57373' },
  { s: 'Fe', r: 126, en: 1.83, ie: 762, g: 8, p: 4, color: '#FFD54F' },
  { s: 'Cu', r: 128, en: 1.9, ie: 745, g: 11, p: 4, color: '#FFD54F' },
  { s: 'Br', r: 114, en: 2.96, ie: 1140, g: 17, p: 4, color: '#64B5F6' },
  { s: 'Kr', r: 110, en: 0, ie: 1351, g: 18, p: 4, color: '#81C784' },
];

const MODES = [
  { id: 'RADIUS', label: 'Size', color: '#4ECDC4', unit: 'pm' },
  { id: 'EN', label: 'Bully (EN)', color: '#FF4444', unit: 'Paul' },
  { id: 'IE', label: 'Grip (IE)', color: '#FF9F1C', unit: 'kJ' }
];

export default function PeriodicLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const glass = glass2;

  const [mode, setMode] = useState('RADIUS');
  const [selected, setSelected] = useState(ELEMENTS[0]);
  const scaleAnims = useRef(ELEMENTS.reduce((acc, el) => ({ ...acc, [el.s]: new Animated.Value(1) }), {})).current;

  // ── Handlers ───────────────────────────────────

  const updateAnims = (newMode) => {
    soundTap();
    setMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    ELEMENTS.forEach(el => {
      let val = 1;
      if (newMode === 'RADIUS') val = el.r / 227;
      if (newMode === 'EN') val = el.en / 4.0;
      if (newMode === 'IE') val = el.ie / 2372;

      Animated.spring(scaleAnims[el.s], {
        toValue: val * 1.5 + 0.5,
        tension: 80,
        useNativeDriver: true
      }).start();
    });
  };

  useEffect(() => {
    updateAnims('RADIUS');
  }, []);

  const selectElement = (el) => {
    setSelected(el);
    soundBadge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── Render ─────────────────────────────────────

  const renderCell = (el) => {
    // Column map for mobile (compress 18 into 10)
    let col = el.g;
    if (col > 2 && col < 13) col = 3; // Squash transition metals
    if (col >= 13) col -= 8;

    const x = (col - 1) * (GRID_SIZE + 4);
    const y = (el.p - 1) * (GRID_SIZE + 4);

    let heatmapColor = '#333';
    if (mode === 'RADIUS') heatmapColor = `hsl(176, ${Math.min(100, (el.r/1.5))}%, 50%)`;
    if (mode === 'EN') heatmapColor = `hsl(0, ${Math.min(100, el.en*25)}%, 50%)`;
    if (mode === 'IE') heatmapColor = `hsl(36, ${Math.min(100, el.ie/15)}%, 50%)`;

    return (
      // @ts-ignore: style prop on AnimatedG causes false positive TS error
      <AnimatedG key={el.s} style={{ transform: [{ translateX: x }, { translateY: y }, { scale: scaleAnims[el.s] }] }}>
        <Rect 
          x={0} y={0} width={GRID_SIZE - 2} height={GRID_SIZE - 2} rx="4"
          fill={isSelected(el) ? '#fff' : isDark ? '#111' : '#eee'} 
          stroke={isSelected(el) ? el.color : heatmapColor} strokeWidth="1"
          onPress={() => selectElement(el)}
        />
        <SvgText x={GRID_SIZE/2 - 1} y={GRID_SIZE/2 + 4} fill={isSelected(el) ? '#000' : isDark ? '#fff' : '#000'} fontSize="10" fontWeight="bold" textAnchor="middle">
          {el.s}
        </SvgText>
      </AnimatedG>
    );
  };

  const isSelected = (el) => selected?.s === el.s;

  return (
    <View style={styles.container}>
      {/* ── Mode Selection ── */}
      <View style={styles.tabRow}>
        {MODES.map(m => (
          <TouchableOpacity key={m.id} onPress={() => updateAnims(m.id)}
            style={[styles.tab, mode === m.id && { backgroundColor: m.color, borderColor: m.color }]}>
            <Text style={[styles.tabText, mode === m.id && { color: '#000' }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Legend ── */}
      <View style={styles.legend}>
         <Icon name="info" size={12} color={txtM} />
         <Text style={[styles.legendText, { color: txtM }]}>
            {mode === 'RADIUS' ? "Bigger = More electron shells / Lower Z-eff" : 
             mode === 'EN' ? "Brighter = Greater hunger for electrons (Fluorine is king!)" :
             "Warmth = Higher energy needed to remove 1st electron"}
         </Text>
      </View>

      {/* ── Periodic Grid ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={GRID_SIZE * 10} height={GRID_SIZE * 5} style={{ alignSelf: 'center' }}>
           {ELEMENTS.map(el => renderCell(el))}
        </Svg>

        {/* ── Selection Detail ── */}
        {selected && (
           <View style={[styles.detailCard, { backgroundColor: glass, borderColor: border }]}>
              <View style={[styles.symbolBox, { backgroundColor: selected.color }]}>
                 <Text style={styles.detailSym}>{selected.s}</Text>
              </View>
              <View style={styles.detailInfo}>
                 <Text style={[styles.detailName, { color: txt1 }]}>Element Specs</Text>
                 <View style={styles.specGrid}>
                    <View style={styles.specItem}>
                       <Text style={styles.specLabel}>RADIUS</Text>
                       <Text style={[styles.specVal, { color: '#4ECDC4' }]}>{selected.r} pm</Text>
                    </View>
                    <View style={styles.specItem}>
                       <Text style={styles.specLabel}>ELECTRONEG</Text>
                       <Text style={[styles.specVal, { color: '#FF4444' }]}>{selected.en || 'N/A'}</Text>
                    </View>
                    <View style={styles.specItem}>
                       <Text style={styles.specLabel}>IONIZATION</Text>
                       <Text style={[styles.specVal, { color: '#FF9F1C' }]}>{selected.ie} kJ/mol</Text>
                    </View>
                 </View>
              </View>
           </View>
        )}

        {/* ── Scientist Mode ── */}
        {scientistMode && selected && (
          <View style={styles.sciOverlay}>
             <Text style={styles.sciTitle}>HYDROGENIC MODEL ANALYSIS 🧑‍🔬</Text>
             <Text style={styles.sciPoint}>Effective Nuclear Charge ({"$Z_{eff}$"}): {(selected.ie / 1312).toFixed(2)} units</Text>
             <Text style={styles.sciPoint}>Trend Gradient: {(-(selected.p / 10)).toFixed(2)} Δ/atomic_unit</Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>* Transition metals Squashed for Mobile View *</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontFamily: FONTS.displayBold, fontSize: 11, color: '#888' },
  
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
  legendText: { fontSize: 9, fontFamily: FONTS.body, flex: 1 },

  simBox: { padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  detailCard: { marginTop: 20, flexDirection: 'row', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, gap: 12 },
  symbolBox: { width: 50, height: 50, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  detailSym: { fontSize: 24, fontFamily: FONTS.displayBold, color: '#000' },
  detailInfo: { flex: 1 },
  detailName: { fontSize: 13, fontFamily: FONTS.displayBold, marginBottom: 8 },
  specGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { alignItems: 'flex-start' },
  specLabel: { fontSize: 7, color: '#888', fontFamily: FONTS.displayBold },
  specVal: { fontSize: 11, fontFamily: FONTS.displayBold },

  sciOverlay: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  sciTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#FFD166', marginBottom: 6 },
  sciPoint: { fontSize: 10, color: '#999', fontFamily: 'monospace', marginBottom: 2 },

  footer: { textAlign: 'right', fontSize: 8, color: '#666', marginTop: 8, fontStyle: 'italic' }
});
