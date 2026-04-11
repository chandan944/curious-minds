// ─────────────────────────────────────────────────────────────
//  LAB: Chemical Bonding — Bond Builder Lab (Multi-Mode)
//
//  SUB-CONCEPTS TAUGHT:
//  1. Electronegativity & Pauling scale        → Explore (EN bar)
//  2. Ionic bonding (electron transfer)        → Explore (ionic pairs)
//  3. Covalent bonding (electron sharing)      → Explore (covalent pairs)
//  4. Metallic bonding (electron sea)          → Explore (metal pairs)
//  5. Bond polarity (δ+ / δ−)                 → Explore (partial charges)
//  6. Lewis dot structures / valence electrons → Build (electron dots)
//  7. VSEPR molecular geometry & bond angles   → Build (template geometry)
//  8. Bond energy vs bond length relationship  → Graph (plot)
//  9. ΔEN vs ionic character % (Pauling)       → Graph (plot)
// 10. Intermolecular forces & temperature      → Scientist Mode
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import Svg, {
  Circle, Line, Text as SvgText, Rect, Path,
  Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Ellipse,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

// ══════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════

const ATOMS = [
  { name: 'Hydrogen',  sym: 'H',  en: 2.20, valence: 1, color: '#E0E0E0', icon: 'drop',        num: 1,  r: 16, group: 'non' },
  { name: 'Carbon',    sym: 'C',  en: 2.55, valence: 4, color: '#555',    icon: 'atom',        num: 6,  r: 20, group: 'non' },
  { name: 'Nitrogen',  sym: 'N',  en: 3.04, valence: 3, color: '#4ECDC4', icon: 'molecule',    num: 7,  r: 19, group: 'non' },
  { name: 'Oxygen',    sym: 'O',  en: 3.44, valence: 2, color: '#FF6B9D', icon: 'water',       num: 8,  r: 18, group: 'non' },
  { name: 'Fluorine',  sym: 'F',  en: 3.98, valence: 1, color: '#FFD166', icon: 'zap',         num: 9,  r: 17, group: 'non' },
  { name: 'Sodium',    sym: 'Na', en: 0.93, valence: 1, color: '#6C63FF', icon: 'sparkle',     num: 11, r: 24, group: 'met' },
  { name: 'Chlorine',  sym: 'Cl', en: 3.16, valence: 1, color: '#00E5A0', icon: 'shield',      num: 17, r: 21, group: 'non' },
  { name: 'Iron',      sym: 'Fe', en: 1.83, valence: 2, color: '#C3B1E1', icon: 'wrench',      num: 26, r: 22, group: 'met' },
];

const BOND_PAIRS = [
  { name: 'NaCl',   a1: 5, a2: 6, energy: 787,  length: 2.36 },
  { name: 'H₂',     a1: 0, a2: 0, energy: 436,  length: 0.74 },
  { name: 'HCl',    a1: 0, a2: 6, energy: 431,  length: 1.27 },
  { name: 'O₂',     a1: 3, a2: 3, energy: 498,  length: 1.21 },
  { name: 'HF',     a1: 0, a2: 4, energy: 568,  length: 0.92 },
  { name: 'Fe‑Fe',  a1: 7, a2: 7, energy: 118,  length: 2.48 },
  { name: 'CO',     a1: 1, a2: 3, energy: 1072, length: 1.13 },
  { name: 'Custom', a1: null, a2: null, energy: null, length: null },
];

const MODES = [
  { id: 'explore', name: 'Explore',  icon: 'flask',  color: '#6C63FF', desc: 'Bond formation' },
  { id: 'build',   name: 'Build',    icon: 'wrench', color: '#FF9F1C', desc: 'Molecules' },
  { id: 'predict', name: 'Predict',  icon: 'brain',  color: '#4ECDC4', desc: 'Guess bond type' },
  { id: 'graph',   name: 'Graph',    icon: 'chart',  color: '#FF6B9D', desc: 'Plot data' },
];

const TEMPLATES = [
  { id: 'diatomic',  name: 'Diatomic',         icon: 'link',     color: '#6C63FF', slots: 2, geom: 'linear',     angle: 180,   desc: 'A-B' },
  { id: 'bent',      name: 'Bent (H₂O-like)',  icon: 'water',    color: '#4ECDC4', slots: 3, geom: 'bent',       angle: 104.5, desc: 'A-B-A' },
  { id: 'linear3',   name: 'Linear (CO₂-like)',icon: 'ruler',    color: '#FF9F1C', slots: 3, geom: 'linear',     angle: 180,   desc: 'B=A=B' },
  { id: 'tetra',     name: 'Tetrahedral (CH₄)',icon: 'molecule', color: '#FF6B9D', slots: 5, geom: 'tetrahedral',angle: 109.5, desc: 'AB₄' },
  { id: 'trigonal',  name: 'Trigonal Planar',  icon: 'atom',     color: '#C3B1E1', slots: 4, geom: 'trigonal',   angle: 120,   desc: 'AB₃' },
];

const GRAPH_TYPES = [
  { id: 'en_ionic',      name: 'ΔEN vs Ionic%',      xLabel: 'ΔEN',    yLabel: 'Ionic %', icon: 'chart', color: '#6C63FF' },
  { id: 'energy_length', name: 'Energy vs Length',    xLabel: 'Å',      yLabel: 'kJ/mol',  icon: 'chart', color: '#FF6B9D' },
];

const PREDICT_TYPES = [
  { label: 'Nonpolar Covalent', color: '#00E5A0', type: 'nonpolar' },
  { label: 'Polar Covalent',    color: '#FFD166', type: 'polar' },
  { label: 'Ionic',             color: '#FF6B9D', type: 'ionic' },
  { label: 'Metallic',          color: '#C3B1E1', type: 'metallic' },
];

const CHALLENGES = [
  { id: 'ionic_bond',   title: 'Ion Maker',       desc: 'Form an ionic bond (ΔEN > 1.7)',      icon: 'lightning', color: '#6C63FF' },
  { id: 'triple_bond',  title: 'Triple Threat',    desc: 'Observe a triple bond (N₂ or CO)',    icon: 'link',      color: '#FF9F1C' },
  { id: 'build_water',  title: 'Water World',      desc: 'Build H₂O in molecule builder',       icon: 'water',     color: '#4ECDC4' },
  { id: 'build_ch4',    title: 'Carbon King',      desc: 'Build CH₄ (tetrahedral molecule)',     icon: 'molecule',  color: '#FF6B9D' },
  { id: 'predict_5',    title: 'Bond Oracle',      desc: 'Get 5 correct predictions in a row',  icon: 'brain',     color: '#00E5A0' },
  { id: 'predict_en',   title: 'Sharp Chemist',    desc: 'Predict bond energy within 15%',      icon: 'target',    color: '#FFD166' },
  { id: 'all_types',    title: 'Bond Collector',   desc: 'Explore all 3 main bond types',       icon: 'star',      color: '#A8EDEA' },
  { id: 'graph_10',     title: 'Data Scientist',   desc: 'Collect 10+ graph data points',       icon: 'chart',     color: '#C3B1E1' },
];

// ══════════════════════════════════════════════════════════
//  CHEMISTRY HELPERS
// ══════════════════════════════════════════════════════════

function getBondType(a1, a2) {
  if (a1.group === 'met' && a2.group === 'met') return 'metallic';
  const d = Math.abs(a1.en - a2.en);
  if (d >= 1.7) return 'ionic';
  if (d >= 0.4) return 'polar';
  return 'nonpolar';
}
function ionicChar(deltaEN) { return (1 - Math.exp(-0.25 * deltaEN * deltaEN)) * 100; }
function estEnergy(a1, a2) {
  const d = Math.abs(a1.en - a2.en);
  return (a1.en + a2.en) * 80 + 96.5 * d * d + 50;
}
function estLength(a1, a2) { return ((a1.r + a2.r) * 0.012 + 0.3).toFixed(2); }

// Build-mode slot positions per template
function getSlots(tId) {
  const CX = SIM_W / 2, CY = SIM_H / 2;
  switch (tId) {
    case 'diatomic':
      return [{ x: CX - 55, y: CY, label: 'A' }, { x: CX + 55, y: CY, label: 'B' }];
    case 'bent':
      return [
        { x: CX, y: CY - 30, label: 'Central' },
        { x: CX - 60, y: CY + 40, label: 'Left' },
        { x: CX + 60, y: CY + 40, label: 'Right' },
      ];
    case 'linear3':
      return [
        { x: CX, y: CY, label: 'Central' },
        { x: CX - 75, y: CY, label: 'Left' },
        { x: CX + 75, y: CY, label: 'Right' },
      ];
    case 'tetra':
      return [
        { x: CX, y: CY, label: 'Center' },
        { x: CX, y: CY - 60, label: 'Top' },
        { x: CX - 60, y: CY + 30, label: 'Left' },
        { x: CX + 60, y: CY + 30, label: 'Right' },
        { x: CX, y: CY + 65, label: 'Bottom' },
      ];
    case 'trigonal':
      return [
        { x: CX, y: CY, label: 'Center' },
        { x: CX, y: CY - 60, label: 'Top' },
        { x: CX - 55, y: CY + 40, label: 'Left' },
        { x: CX + 55, y: CY + 40, label: 'Right' },
      ];
    default: return [];
  }
}

function analyzeBuild(tmpl, placed) {
  const atoms = tmpl.slots > 2
    ? { center: placed[0], outers: Object.values(placed).slice(1) }
    : { center: placed[0], outers: [placed[1]] };
  if (!atoms.center || atoms.outers.some(a => !a)) return null;
  const bonds = atoms.outers.map(outer => ({
    a1: atoms.center, a2: outer,
    deltaEN: Math.abs(atoms.center.en - outer.en),
    type: getBondType(atoms.center, outer),
    energy: estEnergy(atoms.center, outer),
  }));
  const avgDEN = bonds.reduce((s, b) => s + b.deltaEN, 0) / bonds.length;
  const allSame = atoms.outers.every(o => o.sym === atoms.outers[0]?.sym);
  const symmetricGeom = ['linear', 'trigonal', 'tetrahedral'].includes(tmpl.geom);
  return {
    bonds, geom: tmpl.geom, angle: tmpl.angle,
    molecularPolar: !(allSame && symmetricGeom),
    avgDEN, formula: buildFormula(atoms.center, atoms.outers),
  };
}

function buildFormula(center, outers) {
  const counts = {};
  counts[center.sym] = 1;
  outers.forEach(o => { counts[o.sym] = (counts[o.sym] || 0) + 1; });
  return Object.entries(counts).map(([sym, n]) => n > 1 ? `${sym}${n}` : sym).join('');
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function ChemicalBondingLab({
  scientistMode = false,
  accentColor   = '#4ECDC4',
  onLabBreaker,
}) {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary, txt2 = theme.text.secondary, txtM = theme.text.muted;
  const glass1 = theme.glass.light, glass2 = theme.glass.medium, border = theme.glass.border;

  // ── State ──────────────────────────────────
  const [modeIdx, setModeIdx]         = useState(0);
  const [pairIdx, setPairIdx]         = useState(1);     // H₂ default
  const [customA1, setCustomA1]       = useState(0);
  const [customA2, setCustomA2]       = useState(6);
  const [tmplIdx, setTmplIdx]         = useState(0);
  const [placed, setPlaced]           = useState({});
  const [selPalette, setSelPalette]   = useState(null);
  const [graphType, setGraphType]     = useState(0);
  const [graphData, setGraphData]     = useState([]);
  const [predType, setPredType]       = useState(null);
  const [predHistory, setPredHistory] = useState([]);
  const [temperature, setTemperature] = useState(298);   // Kelvin (scientist mode)

  const [running, setRunning]           = useState(false);
  const [hasRun, setHasRun]             = useState(false);
  const [runCount, setRunCount]         = useState(0);
  const [results, setResults]           = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [completedCh, setCompletedCh]   = useState([]);
  const [showCh, setShowCh]             = useState(false);
  const [lastChMsg, setLastChMsg]       = useState(null);
  const [bondsSeen, setBondsSeen]       = useState(new Set());
  const [correctPreds, setCorrectPreds] = useState(0);

  // ── Anim refs ──────────────────────────────
  const atom1X    = useRef(new Animated.Value(SIM_W * 0.2)).current;
  const atom2X    = useRef(new Animated.Value(SIM_W * 0.8)).current;
  const bondOp    = useRef(new Animated.Value(0)).current;
  const impactRing = useRef(new Animated.Value(0)).current;
  const runBtnSc  = useRef(new Animated.Value(1)).current;
  const chAnim    = useRef(new Animated.Value(0)).current;
  const slotAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(1))).current;
  const electronAnims = useRef(Array.from({ length: 8 }, () => ({
    x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
  }))).current;
  const particleAnims = useRef(Array.from({ length: 10 }, () => ({
    x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
  }))).current;
  const interval = useRef(null);
  const startTs  = useRef(0);

  useEffect(() => () => { if (interval.current) clearInterval(interval.current); }, []);

  // ── Derived ────────────────────────────────
  const mode = MODES[modeIdx];
  const isCustomPair = pairIdx === BOND_PAIRS.length - 1;
  const a1 = isCustomPair ? ATOMS[customA1] : ATOMS[BOND_PAIRS[pairIdx].a1];
  const a2 = isCustomPair ? ATOMS[customA2] : ATOMS[BOND_PAIRS[pairIdx].a2];
  const deltaEN = Math.abs(a1.en - a2.en);
  const bondType = getBondType(a1, a2);
  const ionicPct = ionicChar(deltaEN);
  const tmpl = TEMPLATES[tmplIdx];
  const slots = getSlots(tmpl.id);
  const filledCount = Object.keys(placed).length;
  const allFilled = filledCount >= tmpl.slots;
  const buildResult = allFilled ? analyzeBuild(tmpl, Object.fromEntries(
    Object.entries(placed).map(([k, v]) => [k, ATOMS[v]])
  )) : null;

  // ── Mode change ────────────────────────────
  const changeMode = (i) => {
    soundTap(); Haptics.selectionAsync();
    setModeIdx(i); setRunning(false); setHasRun(false); setResults(null);
    setShowInsights(false);
    atom1X.setValue(SIM_W * 0.2); atom2X.setValue(SIM_W * 0.8); bondOp.setValue(0);
    electronAnims.forEach(e => e.op.setValue(0));
  };

  // ── Explore: start bond animation ──────────
  const startExplore = () => {
    if (running) return;
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseBtn(); setRunning(true); setHasRun(false); setShowInsights(false); setResults(null);
    bondOp.setValue(0); atom1X.setValue(SIM_W * 0.2); atom2X.setValue(SIM_W * 0.8);
    electronAnims.forEach(e => e.op.setValue(0));
    startTs.current = Date.now();

    if (onLabBreaker && (deltaEN > 3.5 || temperature > 5000)) onLabBreaker();

    interval.current = setInterval(() => {
      const el = (Date.now() - startTs.current) / 1000;
      // Atoms approach each other
      const progress = Math.min(el / 1.8, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      atom1X.setValue(SIM_W * 0.2 + ease * SIM_W * 0.15);
      atom2X.setValue(SIM_W * 0.8 - ease * SIM_W * 0.15);

      // Electron animation (after approach starts)
      if (el > 0.5) {
        const eProg = Math.min((el - 0.5) / 1.2, 1);
        if (bondType === 'ionic') animateIonicElectrons(eProg);
        else if (bondType === 'metallic') animateMetallicElectrons(eProg, el);
        else animateCovalentElectrons(eProg, el);
      }

      if (el >= 2.5) {
        clearInterval(interval.current); interval.current = null;
        bondOp.setValue(1);
        completeExplore();
      }
    }, 16);
  };

  const animateIonicElectrons = (prog) => {
    const fromX = a1.group === 'met' ? SIM_W * 0.35 : SIM_W * 0.65;
    const toX   = a1.group === 'met' ? SIM_W * 0.65 : SIM_W * 0.35;
    for (let i = 0; i < Math.min(a1.valence, 3); i++) {
      const p = Math.max(0, Math.min((prog - i * 0.15) * 2, 1));
      electronAnims[i].x.setValue(fromX + p * (toX - fromX));
      electronAnims[i].y.setValue(SIM_H / 2 + Math.sin(p * Math.PI) * (-30 - i * 10));
      electronAnims[i].op.setValue(p > 0 && p < 1 ? 1 : p >= 1 ? 0.7 : 0);
    }
  };

  const animateCovalentElectrons = (prog, t) => {
    const cx = SIM_W / 2;
    const cy = SIM_H / 2;
    const shift = bondType === 'polar' ? (a2.en > a1.en ? 12 : -12) : 0;
    for (let i = 0; i < 2; i++) {
      const angle = t * 2 + i * Math.PI;
      const rx = 15 + prog * 5, ry = 10;
      electronAnims[i].x.setValue(cx + shift + Math.cos(angle) * rx * prog);
      electronAnims[i].y.setValue(cy + Math.sin(angle) * ry * prog);
      electronAnims[i].op.setValue(prog > 0.1 ? 0.9 : 0);
    }
  };

  const animateMetallicElectrons = (prog, t) => {
    const cx = SIM_W / 2, cy = SIM_H / 2;
    for (let i = 0; i < 6; i++) {
      const ox = Math.sin(t * 1.5 + i * 1.1) * 40 * prog;
      const oy = Math.cos(t * 2 + i * 0.9) * 20 * prog;
      electronAnims[i].x.setValue(cx + ox);
      electronAnims[i].y.setValue(cy + oy);
      electronAnims[i].op.setValue(prog > 0.1 ? 0.7 : 0);
    }
  };

  const completeExplore = () => {
    setRunning(false);
    soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Impact ring
    Animated.sequence([
      Animated.spring(impactRing, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
      Animated.timing(impactRing, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    burstParticles();

    const energy = isCustomPair ? estEnergy(a1, a2) : BOND_PAIRS[pairIdx].energy;
    const length = isCustomPair ? estLength(a1, a2) : BOND_PAIRS[pairIdx].length;
    const bt = bondType;
    const res = {
      atom1: a1, atom2: a2, deltaEN, bondType: bt, ionicPct, energy, length,
      laws: [
        { icon: 'lightning', label: 'Bond Type',      text: `ΔEN = ${deltaEN.toFixed(2)} → ${bt === 'nonpolar' ? 'Nonpolar Covalent' : bt === 'polar' ? 'Polar Covalent' : bt === 'ionic' ? 'Ionic' : 'Metallic'}`, ok: true },
        { icon: 'chart',     label: 'Pauling Ionic%', text: `% ionic = [1−e^(−0.25×${deltaEN.toFixed(2)}²)]×100 = ${ionicPct.toFixed(1)}%`, ok: true },
        { icon: 'zap',       label: 'Bond Energy',    text: `${energy} kJ/mol${energy > 500 ? ' (very strong!)' : energy < 200 ? ' (weak)' : ''}`, ok: true },
        { icon: 'ruler',     label: 'Bond Length',     text: `${length} Å${parseFloat(length) < 1 ? ' (very short!)' : ''}`, ok: true },
        { icon: 'balance',   label: 'Polarity',        text: bt === 'polar' ? `δ⁺${a1.en < a2.en ? a1.sym : a2.sym}—${a1.en > a2.en ? a1.sym : a2.sym}δ⁻` : bt === 'ionic' ? `${a1.group === 'met' ? a1.sym + '⁺' : a2.sym + '⁺'} ${a1.group === 'met' ? a2.sym + '⁻' : a1.sym + '⁻'}` : 'Equal sharing / delocalized', ok: true },
      ],
    };
    setResults(res); setHasRun(true); setShowInsights(true); setRunCount(c => c + 1);

    // Add graph data
    setGraphData(prev => [...prev, { deltaEN, ionicPct, energy: parseFloat(energy), length: parseFloat(length) }]);

    // Track bond types seen
    setBondsSeen(prev => new Set([...prev, bt]));
    checkChallenges(res);
  };

  // ── Build: analyze molecule ─────────────────
  const startBuild = () => {
    if (!allFilled) return;
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseBtn();
    Animated.sequence([
      Animated.spring(impactRing, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
      Animated.timing(impactRing, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    burstParticles();
    soundBadge();

    if (buildResult) {
      const res = {
        ...buildResult,
        laws: [
          { icon: 'molecule', label: 'Geometry (VSEPR)', text: `${buildResult.geom} — bond angle ${buildResult.angle}°`, ok: true },
          { icon: 'balance',  label: 'Mol. Polarity',     text: buildResult.molecularPolar ? 'Polar molecule (dipoles don\'t cancel)' : 'Nonpolar molecule (symmetric → dipoles cancel)', ok: true },
          ...buildResult.bonds.map((b, i) => ({
            icon: 'link', label: `Bond ${i + 1}: ${b.a1.sym}-${b.a2.sym}`,
            text: `ΔEN=${b.deltaEN.toFixed(2)} → ${b.type}, ~${b.energy.toFixed(0)} kJ/mol`, ok: true,
          })),
        ],
      };
      setResults(res); setHasRun(true); setShowInsights(true); setRunCount(c => c + 1);

      // Challenge: water or CH₄
      if (buildResult.formula === 'OH2' || buildResult.formula === 'H2O') {
        if (!completedCh.includes('build_water')) triggerChallenge('build_water');
      }
      if (buildResult.formula === 'CH4') {
        if (!completedCh.includes('build_ch4')) triggerChallenge('build_ch4');
      }
    }
  };

  // ── Predict: run & compare ──────────────────
  const startPredict = () => {
    if (predType == null) return;
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseBtn();
    const actualType = bondType;
    const correct = PREDICT_TYPES[predType].type === actualType;
    const entry = { predicted: PREDICT_TYPES[predType].type, actual: actualType, correct };
    setPredHistory(prev => [...prev, entry]);
    if (correct) setCorrectPreds(c => c + 1); else setCorrectPreds(0);
    burstParticles();
    Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    correct ? soundBadge() : soundTap();

    setResults({
      predicted: PREDICT_TYPES[predType].label,
      actual: actualType === 'nonpolar' ? 'Nonpolar Covalent' : actualType === 'polar' ? 'Polar Covalent' : actualType === 'ionic' ? 'Ionic' : 'Metallic',
      correct,
      deltaEN,
      laws: [
        { icon: 'brain', label: 'Your prediction', text: PREDICT_TYPES[predType].label, ok: correct },
        { icon: 'check', label: 'Actual type',     text: `ΔEN = ${deltaEN.toFixed(2)} → ${actualType}`, ok: true },
      ],
    });
    setHasRun(true); setShowInsights(true); setRunCount(c => c + 1);

    if (correctPreds + (correct ? 1 : 0) >= 5 && !completedCh.includes('predict_5')) triggerChallenge('predict_5');
    checkChallenges(null);
  };

  // ── Placement handlers (Build) ─────────────
  const handleSlotTap = (i) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (placed[i] != null) {
      Animated.timing(slotAnims[i], { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
        setPlaced(p => { const n = { ...p }; delete n[i]; return n; });
        slotAnims[i].setValue(1);
      });
      setHasRun(false); setResults(null); setShowInsights(false);
    } else if (selPalette != null) {
      setPlaced(p => ({ ...p, [i]: selPalette }));
      slotAnims[i].setValue(0.2);
      Animated.spring(slotAnims[i], { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }).start();
      soundWhoosh();
      setHasRun(false); setResults(null); setShowInsights(false);
    }
  };

  // ── Challenges ─────────────────────────────
  const checkChallenges = (res) => {
    const fresh = [];
    if (res?.bondType === 'ionic' && !completedCh.includes('ionic_bond')) fresh.push('ionic_bond');
    if (res?.energy >= 800 && !completedCh.includes('triple_bond')) fresh.push('triple_bond');
    if (bondsSeen.size >= 3 && !completedCh.includes('all_types')) fresh.push('all_types');
    if (graphData.length >= 10 && !completedCh.includes('graph_10')) fresh.push('graph_10');
    if (fresh.length) triggerChallenge(fresh[0]);
  };

  const triggerChallenge = (id) => {
    setCompletedCh(p => [...p, id]);
    setLastChMsg(CHALLENGES.find(c => c.id === id)?.title);
    soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(chAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(chAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const burstParticles = () => {
    particleAnims.forEach((p, i) => {
      const a = (i / 10) * Math.PI * 2, d = 25 + Math.random() * 25;
      Animated.sequence([
        Animated.delay(i * 25),
        Animated.parallel([
          Animated.timing(p.x, { toValue: Math.cos(a) * d, duration: 350, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: Math.sin(a) * d, duration: 350, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(p.op, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(p.op, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => { p.x.setValue(0); p.y.setValue(0); });
    });
  };

  const pulseBtn = () => {
    Animated.sequence([
      Animated.spring(runBtnSc, { toValue: 0.92, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.spring(runBtnSc, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  // ── Fun facts ──────────────────────────────
  const getFunFact = () => {
    if (mode.id === 'build' && buildResult?.formula === 'H2O') return "Every water molecule is bent at exactly 104.5° — this tiny angle makes ice float, regulates Earth's climate, and makes life possible! 💧";
    if (bondType === 'ionic') return `Ionic bonds create crystal lattices. NaCl's lattice energy is 787 kJ/mol — breaking it requires heating to 801°C! 🧂`;
    if (bondType === 'metallic') return "The 'electron sea' in metals is why they conduct electricity, reflect light, and can be hammered into sheets without breaking! 🪙";
    if (deltaEN > 3) return `ΔEN of ${deltaEN.toFixed(2)} is extreme! This bond is almost entirely ionic — essentially a full electron transfer. ⚡`;
    if (ionicPct > 50) return `${ionicPct.toFixed(1)}% ionic character — more ionic than covalent! Linus Pauling won the Nobel Prize for quantifying this concept in 1954. 🏆`;
    return "Gilbert Lewis published his 'cubical atom' model in 1916 — drawing dots to represent electrons was revolutionary and is still used today! 📝";
  };

  const wireCol = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

  // Graph helpers
  const gd = graphData || [];
  const gType = GRAPH_TYPES[graphType];
  const gPts = gd.map(d => gType.id === 'en_ionic' ? { x: d.deltaEN, y: d.ionicPct } : { x: d.length, y: d.energy });
  const gXMax = gPts.length ? Math.max(...gPts.map(p => p.x), 1) * 1.1 : 4;
  const gYMax = gPts.length ? Math.max(...gPts.map(p => p.y), 1) * 1.1 : 100;
  const GP = { t: 35, r: 20, b: 40, l: 50 };
  const GW = SIM_W - GP.l - GP.r, GH = SIM_H - GP.t - GP.b;
  const gScale = (p) => ({ sx: GP.l + (p.x / gXMax) * GW, sy: GP.t + GH - (p.y / gYMax) * GH });

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  return (
    <View style={styles.root}>

      {/* ── Mode Tabs ─────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {MODES.map((m, i) => (
          <TouchableOpacity key={m.id} onPress={() => changeMode(i)}
            style={[styles.modeTab, { borderColor: modeIdx === i ? m.color + '80' : border, backgroundColor: modeIdx === i ? m.color + '12' : glass1 }]}>
            <View style={[styles.modeIconWrap, { backgroundColor: m.color + '18' }]}>
              <Icon name={m.icon} size={16} color={modeIdx === i ? m.color : txtM} />
            </View>
            <Text style={[styles.modeName, { color: modeIdx === i ? txt1 : txtM }]}>{m.name}</Text>
            <Text style={[styles.modeDesc, { color: modeIdx === i ? m.color : txtM }]}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SVG Canvas ─────────────────────── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#0A0B12' : '#F5F6FF' }]}>
        <Svg width={SIM_W} height={SIM_H}>
          <Defs>
            <SvgLinearGradient id="canvasBg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isDark ? '#0D0E18' : '#F8F9FF'} />
              <Stop offset="1" stopColor={isDark ? '#06070C' : '#ECEEFF'} />
            </SvgLinearGradient>
            <RadialGradient id="eGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accentColor} stopOpacity="0.9" />
              <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SIM_W} height={SIM_H} fill="url(#canvasBg)" />

          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <React.Fragment key={f}>
              <Line x1={SIM_W * f} y1="0" x2={SIM_W * f} y2={SIM_H} stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.5" />
              <Line x1="0" y1={SIM_H * f} x2={SIM_W} y2={SIM_H * f} stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Mode badge */}
          <Rect x={SIM_W - 125} y={8} width={117} height={22} rx={6}
            fill={mode.color} fillOpacity="0.1" stroke={mode.color} strokeOpacity="0.25" strokeWidth="0.8" />
          <SvgText x={SIM_W - 14} y={23} textAnchor="end" fontSize="9" fill={mode.color} fillOpacity="0.85">
            {mode.name}
          </SvgText>

          {/* ── Explore / Predict Canvas ──── */}
          {(mode.id === 'explore' || mode.id === 'predict') && (
            <>
              {/* Bond line (appears on completion) */}
              <Line x1={SIM_W * 0.35} y1={SIM_H / 2} x2={SIM_W * 0.65} y2={SIM_H / 2}
                stroke={bondType === 'ionic' ? '#FF6B9D' : bondType === 'polar' ? '#FFD166' : bondType === 'metallic' ? '#C3B1E1' : '#00E5A0'}
                strokeWidth={bondType === 'metallic' ? 0 : 3} strokeOpacity={hasRun ? 0.6 : 0} strokeDasharray={bondType === 'ionic' ? '6,4' : undefined} />

              {/* EN scale bar */}
              <Rect x={SIM_W * 0.15} y={SIM_H - 52} width={SIM_W * 0.7} height={8} rx={4}
                fill={isDark ? '#1a1b28' : '#e8e9f0'} />
              <Rect x={SIM_W * 0.15} y={SIM_H - 52}
                width={SIM_W * 0.7 * (a1.en / 4)} height={8} rx={4} fill={a1.color} fillOpacity="0.5" />
              <Circle cx={SIM_W * 0.15 + SIM_W * 0.7 * (a1.en / 4)} cy={SIM_H - 48} r={5} fill={a1.color} />
              <Circle cx={SIM_W * 0.15 + SIM_W * 0.7 * (a2.en / 4)} cy={SIM_H - 48} r={5} fill={a2.color} />
              <SvgText x={SIM_W * 0.15} y={SIM_H - 28} fontSize="8" fill={txtM}>EN: 0</SvgText>
              <SvgText x={SIM_W * 0.85} y={SIM_H - 28} fontSize="8" fill={txtM} textAnchor="end">4.0</SvgText>
              <SvgText x={SIM_W / 2} y={SIM_H - 28} fontSize="9" fill={accentColor} textAnchor="middle" fontWeight="bold">
                ΔEN = {deltaEN.toFixed(2)}
              </SvgText>

              {/* Bond type label */}
              {hasRun && (
                <SvgText x={SIM_W / 2} y={38} textAnchor="middle" fontSize="13" fill={accentColor} fontWeight="bold">
                  {bondType === 'ionic' ? 'IONIC BOND' : bondType === 'polar' ? 'POLAR COVALENT' : bondType === 'nonpolar' ? 'NONPOLAR COVALENT' : 'METALLIC BOND'}
                </SvgText>
              )}

              {/* Metallic electron sea shimmer */}
              {bondType === 'metallic' && hasRun && (
                <Ellipse cx={SIM_W / 2} cy={SIM_H / 2} rx={60} ry={30} fill={a1.color} fillOpacity="0.08" stroke={a1.color} strokeOpacity="0.15" strokeWidth={1} />
              )}
            </>
          )}

          {/* ── Build Canvas ──────────────── */}
          {mode.id === 'build' && (
            <>
              {/* Bond lines between placed atoms */}
              {slots.length > 2 && slots.slice(1).map((s, i) => (
                <Line key={`bl${i}`} x1={slots[0].x} y1={slots[0].y} x2={s.x} y2={s.y}
                  stroke={placed[0] != null && placed[i + 1] != null
                    ? ATOMS[placed[i + 1]]?.color + '50' : wireCol}
                  strokeWidth={1.5} strokeDasharray={placed[i + 1] != null ? undefined : '5,3'} />
              ))}
              {slots.length === 2 && (
                <Line x1={slots[0].x} y1={slots[0].y} x2={slots[1].x} y2={slots[1].y}
                  stroke={placed[0] != null && placed[1] != null ? accentColor + '50' : wireCol}
                  strokeWidth={1.5} strokeDasharray={placed[1] != null ? undefined : '5,3'} />
              )}

              {/* Empty slot indicators */}
              {slots.map((s, i) => placed[i] == null && (
                <React.Fragment key={`es${i}`}>
                  <Circle cx={s.x} cy={s.y} r={22} fill="none"
                    stroke={selPalette != null ? accentColor + '50' : txtM + '25'}
                    strokeWidth={1.2} strokeDasharray="5,3" />
                  <SvgText x={s.x} y={s.y + 4} textAnchor="middle" fontSize="14"
                    fill={selPalette != null ? accentColor + '50' : txtM + '35'}>+</SvgText>
                </React.Fragment>
              ))}

              {/* Slot labels */}
              {slots.map((s, i) => (
                <SvgText key={`sl${i}`} x={s.x} y={s.y + 35} textAnchor="middle" fontSize="7" fill={txtM + '80'}>{s.label}</SvgText>
              ))}

              {/* Geometry label */}
              <SvgText x={SIM_W / 2} y={SIM_H - 18} textAnchor="middle" fontSize="10" fill={accentColor + '80'}>
                {tmpl.geom} • {tmpl.angle}°{buildResult ? ` • ${buildResult.formula}` : ''}
              </SvgText>
              {buildResult && (
                <SvgText x={SIM_W / 2} y={SIM_H - 6} textAnchor="middle" fontSize="9" fill={buildResult.molecularPolar ? '#FFD166' : '#00E5A0'}>
                  {buildResult.molecularPolar ? 'Polar molecule' : 'Nonpolar molecule'}
                </SvgText>
              )}
            </>
          )}

          {/* ── Graph Canvas ──────────────── */}
          {mode.id === 'graph' && (
            <>
              {/* Axes */}
              <Line x1={GP.l} y1={GP.t} x2={GP.l} y2={SIM_H - GP.b} stroke={wireCol} strokeWidth={1.5} />
              <Line x1={GP.l} y1={SIM_H - GP.b} x2={SIM_W - GP.r} y2={SIM_H - GP.b} stroke={wireCol} strokeWidth={1.5} />
              {/* X label */}
              <SvgText x={SIM_W / 2} y={SIM_H - 8} textAnchor="middle" fontSize="10" fill={txtM}>{gType.xLabel}</SvgText>
              {/* Y label */}
              <SvgText x={12} y={SIM_H / 2} textAnchor="middle" fontSize="10" fill={txtM} transform={`rotate(-90, 12, ${SIM_H / 2})`}>{gType.yLabel}</SvgText>
              {/* Grid */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <React.Fragment key={f}>
                  <Line x1={GP.l} y1={GP.t + GH * (1 - f)} x2={SIM_W - GP.r} y2={GP.t + GH * (1 - f)}
                    stroke={wireCol} strokeWidth={0.5} strokeDasharray="3,3" />
                  <SvgText x={GP.l - 5} y={GP.t + GH * (1 - f) + 3} textAnchor="end" fontSize="8" fill={txtM}>
                    {(gYMax * f).toFixed(0)}
                  </SvgText>
                  <Line x1={GP.l + GW * f} y1={GP.t} x2={GP.l + GW * f} y2={SIM_H - GP.b}
                    stroke={wireCol} strokeWidth={0.5} strokeDasharray="3,3" />
                  <SvgText x={GP.l + GW * f} y={SIM_H - GP.b + 14} textAnchor="middle" fontSize="8" fill={txtM}>
                    {(gXMax * f).toFixed(1)}
                  </SvgText>
                </React.Fragment>
              ))}
              {/* Data points + line */}
              {gPts.length > 1 && (
                <Path
                  d={gPts.map((p, i) => { const s = gScale(p); return `${i === 0 ? 'M' : 'L'}${s.sx},${s.sy}`; }).join(' ')}
                  fill="none" stroke={accentColor} strokeWidth={1.5} strokeOpacity={0.5} />
              )}
              {gPts.map((p, i) => {
                const s = gScale(p);
                return <Circle key={i} cx={s.sx} cy={s.sy} r={4} fill={accentColor} stroke={accentColor} strokeWidth={0.5} fillOpacity="0.8" />;
              })}
              {/* Point count */}
              <SvgText x={SIM_W - GP.r} y={GP.t - 5} textAnchor="end" fontSize="9" fill={txtM}>{gPts.length} pts</SvgText>
            </>
          )}
        </Svg>

        {/* Explore atom overlays (Animated)  */}
        {(mode.id === 'explore' || mode.id === 'predict') && (
          <>
            <Animated.View style={[styles.atomOverlay, { left: 0, top: SIM_H / 2 - 28, transform: [{ translateX: atom1X }] }]}>
              <View style={[styles.atomCircle, { backgroundColor: a1.color + '25', borderColor: a1.color + '60', width: a1.r * 2.2, height: a1.r * 2.2, borderRadius: a1.r * 1.1 }]}>
                <Text style={[styles.atomSym, { color: a1.color === '#555' ? txt1 : a1.color }]}>{a1.sym}</Text>
              </View>
              <Text style={[styles.atomLabel, { color: txtM }]}>{a1.name}</Text>
              {hasRun && bondType === 'ionic' && a1.group === 'met' && <Text style={[styles.chargeLabel, { color: '#6C63FF' }]}>+</Text>}
              {hasRun && bondType === 'polar' && a1.en < a2.en && <Text style={[styles.chargeLabel, { color: '#6C63FF' }]}>δ+</Text>}
            </Animated.View>
            <Animated.View style={[styles.atomOverlay, { left: -a2.r * 1.1, top: SIM_H / 2 - 28, transform: [{ translateX: atom2X }] }]}>
              <View style={[styles.atomCircle, { backgroundColor: a2.color + '25', borderColor: a2.color + '60', width: a2.r * 2.2, height: a2.r * 2.2, borderRadius: a2.r * 1.1 }]}>
                <Text style={[styles.atomSym, { color: a2.color === '#555' ? txt1 : a2.color }]}>{a2.sym}</Text>
              </View>
              <Text style={[styles.atomLabel, { color: txtM }]}>{a2.name}</Text>
              {hasRun && bondType === 'ionic' && a2.group === 'non' && <Text style={[styles.chargeLabel, { color: '#FF6B9D' }]}>−</Text>}
              {hasRun && bondType === 'polar' && a2.en > a1.en && <Text style={[styles.chargeLabel, { color: '#FF6B9D' }]}>δ−</Text>}
            </Animated.View>
          </>
        )}

        {/* Build: placed atom overlays */}
        {mode.id === 'build' && slots.map((s, i) => {
          if (placed[i] == null) return (
            <TouchableOpacity key={`et${i}`} style={[styles.emptyTouch, { left: s.x - 24, top: s.y - 24 }]}
              onPress={() => handleSlotTap(i)} activeOpacity={0.7} />
          );
          const at = ATOMS[placed[i]];
          return (
            <Animated.View key={`pc${i}`} style={[styles.placedWrap, { left: s.x - 24, top: s.y - 24, transform: [{ scale: slotAnims[i] }] }]}>
              <TouchableOpacity onPress={() => handleSlotTap(i)} activeOpacity={0.7}
                style={[styles.placedBox, { borderColor: at.color + '90', backgroundColor: at.color + '18' }]}>
                <Icon name={at.icon} size={18} color={at.color === '#555' ? txt1 : at.color} />
                <Text style={[styles.placedSym, { color: at.color === '#555' ? txt1 : at.color }]}>{at.sym}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Electron dots (explore animation) */}
        {electronAnims.map((e, i) => (
          <Animated.View key={`el${i}`} style={[styles.electron, {
            backgroundColor: accentColor, shadowColor: accentColor,
            transform: [{ translateX: e.x }, { translateY: e.y }], opacity: e.op,
          }]} />
        ))}

        {/* Impact ring + particles */}
        <Animated.View style={[styles.impactRing, { borderColor: accentColor,
          opacity: impactRing.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] }),
          transform: [{ scale: impactRing.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2.5] }) }],
        }]} />
        {particleAnims.map((p, i) => (
          <Animated.View key={`pt${i}`} style={[styles.particle, {
            backgroundColor: accentColor, opacity: p.op,
            transform: [{ translateX: p.x }, { translateY: p.y }],
          }]} />
        ))}

        {running && <View style={styles.runOverlay}><Text style={[styles.runOverlayTxt, { color: accentColor }]}>Bonding…</Text></View>}
      </View>

      {/* ── Controls (mode-reactive) ──────── */}

      {/* EXPLORE / PREDICT: Bond pair selector */}
      {(mode.id === 'explore' || mode.id === 'predict') && (
        <>
          <SectionLabel icon="link" label="ATOM PAIR" color={accentColor} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {BOND_PAIRS.map((bp, i) => (
              <Preset key={bp.name} label={bp.name} active={pairIdx === i} activeColor={accentColor}
                onPress={() => { soundTap(); Haptics.selectionAsync(); setPairIdx(i); setHasRun(false); setResults(null); setShowInsights(false); atom1X.setValue(SIM_W * 0.2); atom2X.setValue(SIM_W * 0.8); bondOp.setValue(0); electronAnims.forEach(e => e.op.setValue(0)); }}
                txtM={txtM} glass1={glass1} border={border} />
            ))}
          </ScrollView>

          {isCustomPair && (
            <>
              <SectionLabel icon="atom" label="ATOM 1" color={accentColor} txtM={txtM} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
                {ATOMS.map((at, i) => (
                  <Preset key={`a1${i}`} label={`${at.sym} (${at.en})`} active={customA1 === i} activeColor={at.color === '#555' ? accentColor : at.color}
                    onPress={() => { soundTap(); setCustomA1(i); setHasRun(false); setResults(null); }}
                    txtM={txtM} glass1={glass1} border={border} />
                ))}
              </ScrollView>
              <SectionLabel icon="atom" label="ATOM 2" color={accentColor} txtM={txtM} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
                {ATOMS.map((at, i) => (
                  <Preset key={`a2${i}`} label={`${at.sym} (${at.en})`} active={customA2 === i} activeColor={at.color === '#555' ? accentColor : at.color}
                    onPress={() => { soundTap(); setCustomA2(i); setHasRun(false); setResults(null); }}
                    txtM={txtM} glass1={glass1} border={border} />
                ))}
              </ScrollView>
            </>
          )}
        </>
      )}

      {/* PREDICT: type prediction */}
      {mode.id === 'predict' && (
        <>
          <SectionLabel icon="brain" label="YOUR PREDICTION" color={MODES[2].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {PREDICT_TYPES.map((pt, i) => (
              <Preset key={pt.type} label={pt.label} active={predType === i} activeColor={pt.color}
                onPress={() => { soundTap(); Haptics.selectionAsync(); setPredType(prev => prev === i ? null : i); }}
                txtM={txtM} glass1={glass1} border={border} />
            ))}
          </ScrollView>
          {predHistory.length > 0 && (
            <View style={[styles.predScore, { borderColor: border, backgroundColor: glass1 }]}>
              <Icon name="trophy" size={12} color={accentColor} />
              <Text style={[styles.predScoreTxt, { color: txt2 }]}>
                {predHistory.filter(p => p.correct).length}/{predHistory.length} correct ({(predHistory.filter(p => p.correct).length / predHistory.length * 100).toFixed(0)}%)
              </Text>
            </View>
          )}
        </>
      )}

      {/* BUILD: template + palette */}
      {mode.id === 'build' && (
        <>
          <SectionLabel icon="molecule" label="MOLECULE TEMPLATE" color={MODES[1].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {TEMPLATES.map((t, i) => (
              <TouchableOpacity key={t.id} onPress={() => { soundTap(); Haptics.selectionAsync(); setTmplIdx(i); setPlaced({}); setHasRun(false); setResults(null); setShowInsights(false); }}
                style={[styles.tmplCard, { borderColor: tmplIdx === i ? t.color + '80' : border, backgroundColor: tmplIdx === i ? t.color + '12' : glass1 }]}>
                <Icon name={t.icon} size={16} color={tmplIdx === i ? t.color : txtM} />
                <Text style={[styles.tmplName, { color: tmplIdx === i ? txt1 : txtM }]} numberOfLines={1}>{t.name}</Text>
                <Text style={[styles.tmplDesc, { color: tmplIdx === i ? t.color : txtM }]}>{t.slots} atoms</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionLabel icon="atom" label={`ATOM PALETTE${selPalette != null ? '  •  Tap a slot' : ''}`} color={MODES[1].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {ATOMS.map((at, i) => {
              const sel = selPalette === i;
              return (
                <TouchableOpacity key={at.sym} onPress={() => { soundTap(); Haptics.selectionAsync(); setSelPalette(sel ? null : i); }}
                  style={[styles.paletteCard, { borderColor: sel ? (at.color === '#555' ? accentColor : at.color) + '90' : border, backgroundColor: sel ? (at.color === '#555' ? accentColor : at.color) + '15' : glass1 }]}>
                  <Icon name={at.icon} size={14} color={sel ? (at.color === '#555' ? accentColor : at.color) : txtM} />
                  <Text style={[styles.paletteSym, { color: sel ? txt1 : txtM }]}>{at.sym}</Text>
                  <Text style={[styles.paletteEN, { color: sel ? (at.color === '#555' ? accentColor : at.color) : txtM }]}>v{at.valence}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {filledCount === 0 && (
            <View style={[styles.hintBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
              <Icon name="info" size={14} color={accentColor} />
              <Text style={[styles.hintText, { color: txt2 }]}>Select an atom above, then tap an empty slot on the canvas to place it</Text>
            </View>
          )}
        </>
      )}

      {/* GRAPH: type + clear */}
      {mode.id === 'graph' && (
        <>
          <SectionLabel icon="chart" label="GRAPH TYPE" color={MODES[3].color} txtM={txtM} />
          <View style={styles.graphRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollInner}>
              {GRAPH_TYPES.map((gt, i) => (
                <Preset key={gt.id} label={gt.name} active={graphType === i} activeColor={gt.color}
                  onPress={() => { soundTap(); Haptics.selectionAsync(); setGraphType(i); }}
                  txtM={txtM} glass1={glass1} border={border} />
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => { soundTap(); setGraphData([]); }}
              style={[styles.clearBtn, { borderColor: '#FF6B9D30', backgroundColor: '#FF6B9D0A' }]}>
              <Icon name="refresh" size={12} color="#FF6B9D" />
              <Text style={[styles.clearTxt, { color: '#FF6B9D' }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.hintBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
            <Icon name="info" size={14} color={accentColor} />
            <Text style={[styles.hintText, { color: txt2 }]}>
              Run experiments in Explore mode to collect data points. Each bond analysis adds a point to the graph!
            </Text>
          </View>
        </>
      )}

      {/* ── Scientist Mode: temperature ──── */}
      {scientistMode && (mode.id === 'explore' || mode.id === 'predict') && (
        <>
          <SectionLabel icon="thermometer" label="TEMPERATURE (K)" color="#FF6B9D" txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {[100, 298, 500, 1000, 2000, 5000].map(t => (
              <Preset key={t} label={`${t}K`} active={temperature === t} activeColor="#FF6B9D"
                onPress={() => { soundTap(); Haptics.selectionAsync(); setTemperature(t); }}
                txtM={txtM} glass1={glass1} border={border} />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Stats Bar ──────────────────────── */}
      <View style={styles.statsRow}>
        <StatPill icon="link" iconColor={accentColor} label="ΔEN" value={mode.id === 'build' ? (buildResult?.avgDEN?.toFixed(2) || '—') : deltaEN.toFixed(2)} txt1={txt1} txtM={txtM} />
        <StatPill icon="lightning" iconColor="#FF9F1C" label="Type" value={mode.id === 'build' ? (buildResult?.bonds?.[0]?.type || '—') : bondType} txt1={txt1} txtM={txtM} />
        <StatPill icon="chart" iconColor="#FF6B9D" label="Ionic%" value={mode.id === 'build' ? '—' : `${ionicPct.toFixed(0)}%`} txt1={txt1} txtM={txtM} />
        <StatPill icon="flask" iconColor="#4ECDC4" label="Runs" value={`${runCount}`} txt1={txt1} txtM={txtM} />
      </View>

      {/* ── Run Button ─────────────────────── */}
      <Animated.View style={{ transform: [{ scale: runBtnSc }] }}>
        <TouchableOpacity
          onPress={mode.id === 'explore' ? startExplore : mode.id === 'build' ? startBuild : mode.id === 'predict' ? startPredict : undefined}
          disabled={running || (mode.id === 'build' && !allFilled) || (mode.id === 'predict' && predType == null) || mode.id === 'graph'}
          activeOpacity={0.85}
          style={[styles.runBtn, {
            borderColor: running ? border : (mode.id === 'graph' ? border : accentColor + '70'),
            opacity: mode.id === 'graph' ? 0.4 : 1,
          }]}>
          <LinearGradient colors={running ? [glass2, glass1] : [accentColor + '35', accentColor + '18']} style={styles.runBtnGrad}>
            <Icon name={running ? 'clock' : hasRun ? 'refresh' : mode.id === 'predict' ? 'brain' : 'flask'} size={18} color={running ? txtM : accentColor} />
            <Text style={[styles.runBtnTxt, { color: running ? txtM : txt1 }]}>
              {running ? 'Bonding…' : mode.id === 'predict' ? (hasRun ? 'Predict Again' : 'Run & Check') : mode.id === 'build' ? (hasRun ? 'Re-Analyze' : allFilled ? 'Analyze Molecule' : `Place ${tmpl.slots - filledCount} more`) : mode.id === 'graph' ? 'Use Explore to add data' : hasRun ? 'Re-Bond' : 'Form Bond'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {runCount > 0 && <View style={[styles.counterRow, { borderColor: border }]}><Icon name="flask" size={12} color={txtM} /><Text style={[styles.counterTxt, { color: txtM }]}>{runCount} experiment{runCount > 1 ? 's' : ''}</Text></View>}

      {/* ── Results Panel ──────────────────── */}
      {showInsights && results && (
        <View style={[styles.insightsBox, { borderColor: border, backgroundColor: glass1 }]}>
          <View style={styles.insightsHeader}>
            <Icon name="chart" size={16} color={accentColor} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>
              {mode.id === 'predict' ? 'Prediction Result' : mode.id === 'build' ? 'Molecule Analysis' : 'Bond Analysis'}
            </Text>
          </View>

          {/* Predict result card */}
          {mode.id === 'predict' && results.correct != null && (
            <View style={[styles.predResult, { borderColor: results.correct ? '#00E5A040' : '#FF6B9D40', backgroundColor: results.correct ? '#00E5A008' : '#FF6B9D08' }]}>
              <Icon name={results.correct ? 'check' : 'cross'} size={22} color={results.correct ? '#00E5A0' : '#FF6B9D'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.predResultMain, { color: results.correct ? '#00E5A0' : '#FF6B9D' }]}>
                  {results.correct ? 'Correct!' : 'Not quite!'}
                </Text>
                <Text style={[styles.predResultSub, { color: txt2 }]}>
                  You said: {results.predicted} — Actual: {results.actual} (ΔEN = {results.deltaEN.toFixed(2)})
                </Text>
              </View>
            </View>
          )}

          {/* Build results table */}
          {mode.id === 'build' && buildResult && (
            <>
              <View style={[styles.tableRow, styles.tableHead, { borderBottomColor: border }]}>
                <Text style={[styles.tH, styles.tColN, { color: txtM }]}>Bond</Text>
                <Text style={[styles.tH, styles.tColV, { color: txtM }]}>ΔEN</Text>
                <Text style={[styles.tH, styles.tColV, { color: txtM }]}>Type</Text>
                <Text style={[styles.tH, styles.tColV, { color: txtM }]}>~kJ/mol</Text>
              </View>
              {buildResult.bonds.map((b, i) => (
                <View key={i} style={[styles.tableRow, { borderBottomColor: border + '40' }]}>
                  <View style={[styles.tColN, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <Icon name={b.a1.icon} size={10} color={b.a1.color === '#555' ? txt1 : b.a1.color} />
                    <Text style={[styles.tCell, { color: txt1 }]}>{b.a1.sym}-{b.a2.sym}</Text>
                  </View>
                  <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{b.deltaEN.toFixed(2)}</Text>
                  <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{b.type}</Text>
                  <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{b.energy.toFixed(0)}</Text>
                </View>
              ))}
            </>
          )}

          {/* Explore results */}
          {mode.id === 'explore' && results.energy && (
            <View style={[styles.tableRow, { borderBottomColor: border + '40' }]}>
              <View style={[styles.tColN, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Icon name="link" size={10} color={accentColor} />
                <Text style={[styles.tCell, { color: txt1 }]}>{a1.sym}—{a2.sym}</Text>
              </View>
              <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{results.energy} kJ</Text>
              <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{results.length} Å</Text>
              <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{ionicPct.toFixed(1)}%</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Laws Verification ──────────────── */}
      {showInsights && results?.laws && (
        <View style={[styles.lawsBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '06' }]}>
          <View style={styles.lawsHeader}>
            <Icon name="book" size={16} color={accentColor} />
            <Text style={[styles.lawsTitle, { color: txt1 }]}>Chemistry Laws Verified</Text>
          </View>
          {results.laws.map((law, i) => (
            <View key={i} style={[styles.lawRow, { borderBottomColor: border + '20' }]}>
              <View style={[styles.lawIconWrap, { backgroundColor: law.ok ? '#00E5A012' : '#FF6B9D12' }]}>
                <Icon name={law.icon} size={13} color={law.ok ? '#00E5A0' : '#FF6B9D'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lawLabel, { color: txt1 }]}>{law.label}</Text>
                <Text style={[styles.lawText, { color: txt2 }]}>{law.text}</Text>
              </View>
              <Icon name={law.ok ? 'check' : 'cross'} size={12} color={law.ok ? '#00E5A0' : '#FF6B9D'} />
            </View>
          ))}
        </View>
      )}

      {/* ── Fun Fact ───────────────────────── */}
      {hasRun && (
        <View style={[styles.funFact, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
          <View style={[styles.funFactIco, { backgroundColor: accentColor + '18' }]}>
            <Icon name="lightbulb" size={16} color={accentColor} />
          </View>
          <Text style={[styles.funFactTxt, { color: txt2 }]}>{getFunFact()}</Text>
        </View>
      )}

      {/* ── Challenge popup ────────────────── */}
      <Animated.View style={[styles.challengePopup, {
        backgroundColor: accentColor + '18', borderColor: accentColor + '50',
        opacity: chAnim,
        transform: [
          { translateY: chAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          { scale: chAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.05, 1] }) },
        ],
      }]}>
        <Icon name="trophy" size={18} color={accentColor} />
        <Text style={[styles.challengePopTxt, { color: accentColor }]}>{lastChMsg}</Text>
      </Animated.View>

      {/* ── Challenge panel ─────────────────── */}
      <TouchableOpacity onPress={() => { soundTap(); setShowCh(v => !v); }}
        style={[styles.challengeToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={styles.challengeTogInner}>
          <Icon name="target" size={14} color={accentColor} />
          <Text style={[styles.challengeTogTxt, { color: txt1 }]}>Challenges ({completedCh.length}/{CHALLENGES.length})</Text>
          <View style={[styles.challengeBar, { backgroundColor: glass2 }]}>
            <View style={[styles.challengeBarFill, { width: `${(completedCh.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Icon name={showCh ? 'close' : 'forward'} size={12} color={txtM} />
        </View>
      </TouchableOpacity>
      {showCh && CHALLENGES.map(ch => {
        const done = completedCh.includes(ch.id);
        return (
          <View key={ch.id} style={[styles.chItem, { borderColor: done ? ch.color + '40' : border, backgroundColor: done ? ch.color + '0A' : glass1 }]}>
            <View style={[styles.chIcoWrap, { backgroundColor: (done ? ch.color : txtM) + '18' }]}>
              <Icon name={ch.icon} size={14} color={done ? ch.color : txtM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.chN, { color: done ? txt1 : txtM }]}>{ch.title}</Text>
              <Text style={[styles.chD, { color: done ? txt2 : txtM }]}>{ch.desc}</Text>
            </View>
            {done && <Icon name="check" size={14} color={ch.color} />}
          </View>
        );
      })}
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function SectionLabel({ icon, label, color, txtM }) {
  return (
    <View style={styles.sectionLabel}>
      <Icon name={icon} size={12} color={color} />
      <Text style={[styles.sectionLabelTxt, { color: txtM }]}>{label}</Text>
    </View>
  );
}

function Preset({ label, active, activeColor, onPress, txtM, glass1, border }) {
  return (
    <TouchableOpacity onPress={onPress}
      style={[styles.preset, { borderColor: active ? activeColor + '80' : border, backgroundColor: active ? activeColor + '18' : glass1 }]}>
      <Text style={[styles.presetTxt, { color: active ? activeColor : txtM }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatPill({ icon, iconColor, label, value, txt1, txtM }) {
  return (
    <View style={styles.statPill}>
      <Icon name={icon} size={13} color={iconColor} />
      <View>
        <Text style={[styles.statVal, { color: txt1 }]}>{value}</Text>
        <Text style={[styles.statLbl, { color: txtM }]}>{label}</Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root: { gap: SPACING.sm },
  scroll: { marginBottom: SPACING.xs },
  scrollInner: { gap: 8, paddingRight: SPACING.md },

  // Mode tabs
  modeTab: { alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 82 },
  modeIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modeName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  modeDesc: { fontFamily: FONTS.body, fontSize: 8 },

  // SVG canvas
  simBox: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.xs, position: 'relative' },
  runOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  runOverlayTxt: { fontFamily: FONTS.displayMedium, fontSize: 14, letterSpacing: 1 },

  // Atom overlays (Explore)
  atomOverlay: { position: 'absolute', alignItems: 'center' },
  atomCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  atomSym: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  atomLabel: { fontFamily: FONTS.body, fontSize: 9, marginTop: 2 },
  chargeLabel: { fontFamily: FONTS.displayMedium, fontSize: 14, marginTop: -2 },

  // Electron dots
  electron: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5, shadowOpacity: 0.9, shadowRadius: 5, elevation: 4, top: -3.5, left: -3.5 },
  impactRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, top: SIM_H / 2 - 30, left: SIM_W / 2 - 30 },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2, top: SIM_H / 2 - 2, left: SIM_W / 2 - 2 },

  // Build: slots
  emptyTouch: { position: 'absolute', width: 48, height: 48, borderRadius: 24 },
  placedWrap: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  placedBox: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  placedSym: { fontFamily: FONTS.bodyMedium, fontSize: 10, marginTop: 1 },

  // Palette
  paletteCard: { alignItems: 'center', gap: 3, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 52 },
  paletteSym: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  paletteEN: { fontFamily: FONTS.body, fontSize: 9 },

  // Template cards
  tmplCard: { alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 80 },
  tmplName: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  tmplDesc: { fontFamily: FONTS.body, fontSize: 8 },

  // Hint
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: RADIUS.md, padding: 10 },
  hintText: { fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 17 },

  // Graph
  graphRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.xs },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  clearTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  // Prediction
  predScore: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: RADIUS.md, borderWidth: 1 },
  predScoreTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  predResult: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8 },
  predResultMain: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  predResultSub: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },

  // Section labels
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, marginBottom: 6 },
  sectionLabelTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  presetTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statVal: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  statLbl: { fontFamily: FONTS.body, fontSize: 9 },

  // Run button
  runBtn: { borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.xs },
  runBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  runBtnTxt: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: SPACING.xs },
  counterTxt: { fontFamily: FONTS.body, fontSize: 11 },

  // Insights / results
  insightsBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.sm },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  insightsTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5 },
  tableHead: { paddingVertical: 6 },
  tH: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  tCell: { fontFamily: FONTS.body, fontSize: 10 },
  tColN: { flex: 1.4 },
  tColV: { flex: 1, textAlign: 'right' },

  // Laws panel
  lawsBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.sm },
  lawsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  lawsTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  lawRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderBottomWidth: 0.5 },
  lawIconWrap: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  lawLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  lawText: { fontFamily: FONTS.body, fontSize: 10, lineHeight: 15, marginTop: 2 },

  // Fun fact
  funFact: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginTop: SPACING.sm },
  funFactIco: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  funFactTxt: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, flex: 1 },

  // Challenge system
  challengePopup: { position: 'absolute', top: 10, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, zIndex: 999 },
  challengePopTxt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  challengeToggle: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginTop: SPACING.sm },
  challengeTogInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeTogTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  challengeBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  challengeBarFill: { height: 4, borderRadius: 2 },
  chItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 6 },
  chIcoWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chN: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  chD: { fontFamily: FONTS.body, fontSize: 10 },
});
