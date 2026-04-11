// ─────────────────────────────────────────────────────────
//  LAB: Electricity & Circuits — Interactive Circuit Playground
//  Build circuits by choosing topologies, placing component Icons
//  into slots, then analyzing with real electrical laws.
// ─────────────────────────────────────────────────────────

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
const SIM_W  = width - SPACING.md * 4;
const SIM_H  = 340;
const NUM_ELECTRONS = 10;
const SIM_DURATION  = 2800;
const MAX_SLOTS     = 5;

// ══════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════

const COMPONENTS = [
  { name: 'Resistor',  resistance: 100, color: '#6C63FF', icon: 'link',        desc: 'Standard 100Ω' },
  { name: 'LED',       resistance: 50,  color: '#FF6B9D', icon: 'lightbulb',   desc: '50Ω LED' },
  { name: 'Motor',     resistance: 80,  color: '#4ECDC4', icon: 'cpu',         desc: '80Ω DC motor' },
  { name: 'Heater',    resistance: 20,  color: '#FF9F1C', icon: 'fire',        desc: '20Ω element' },
  { name: 'Buzzer',    resistance: 200, color: '#C3B1E1', icon: 'waves',       desc: '200Ω piezo' },
  { name: 'Lamp',      resistance: 150, color: '#85C1E9', icon: 'sun',         desc: '150Ω filament' },
  { name: 'Fuse',      resistance: 5,   color: '#FFD166', icon: 'shield',      desc: '5Ω fusible' },
  { name: 'Sensor',    resistance: 500, color: '#98D8C8', icon: 'thermometer', desc: '500Ω NTC' },
];

const TOPOLOGIES = [
  { id: 'series',   name: 'Series',           icon: 'link',     color: '#6C63FF', slots: 4, desc: 'Components in a chain — same current everywhere' },
  { id: 'parallel', name: 'Parallel',         icon: 'grid',     color: '#00E5A0', slots: 4, desc: 'Components on branches — same voltage everywhere' },
  { id: 'mixed',    name: 'Series‑Parallel',  icon: 'molecule', color: '#FF9F1C', slots: 4, desc: 'Combined S1→(S2‖S3)→S4' },
  { id: 'divider',  name: 'Voltage Divider',  icon: 'balance',  color: '#4ECDC4', slots: 2, desc: 'Split voltage with R1‑R2 tap' },
  { id: 'bridge',   name: 'Wheatstone Bridge',icon: 'target',   color: '#C3B1E1', slots: 4, desc: 'Precision measurement bridge' },
];

const VOLTAGES = [
  { name: '1.5V', v: 1.5,  color: '#A8EDEA', icon: 'battery'  },
  { name: '3V',   v: 3,    color: '#98D8C8', icon: 'battery'  },
  { name: '5V',   v: 5,    color: '#85C1E9', icon: 'battery'  },
  { name: '9V',   v: 9,    color: '#FFD166', icon: 'zap'      },
  { name: '12V',  v: 12,   color: '#FF9F1C', icon: 'zap'      },
  { name: '24V',  v: 24,   color: '#FF6B9D', icon: 'lightning' },
  { name: 'Custom', v: null, color: '#C3B1E1', icon: 'settings' },
];
const CUSTOM_V    = [0.5, 1, 2, 5, 10, 15, 24, 48, 100];
const WIRE_R_PRE  = [0, 0.5, 1, 2, 5, 10];

const CHALLENGES = [
  { id: 'series_fill',    title: 'Series Builder',   desc: 'Fill & analyze a full series circuit',  icon: 'link',   color: '#6C63FF' },
  { id: 'parallel_fill',  title: 'Parallel Master',  desc: 'Fill & analyze a full parallel circuit', icon: 'grid',   color: '#00E5A0' },
  { id: 'power_surge',    title: 'Power Surge',      desc: 'Total power exceeds 10 W',              icon: 'zap',    color: '#FF6B9D' },
  { id: 'bridge_balance', title: 'Bridge Balancer',   desc: 'Balance a Wheatstone Bridge (V_ab≈0)',  icon: 'target', color: '#C3B1E1' },
  { id: 'multi_comp',     title: 'Circuit Engineer',  desc: 'Use 4+ different component types',      icon: 'star',   color: '#FFD166' },
];

// ══════════════════════════════════════════════════════════
//  LAYOUT FUNCTIONS  — returns { slots, wires, extras }
// ══════════════════════════════════════════════════════════

const BX   = 42;                 // Battery X
const BCY  = SIM_H / 2;         // Battery center Y

function getLayout(topoId) {
  switch (topoId) {
    case 'series':   return seriesLayout();
    case 'parallel': return parallelLayout();
    case 'mixed':    return mixedLayout();
    case 'divider':  return dividerLayout();
    case 'bridge':   return bridgeLayout();
    default:         return seriesLayout();
  }
}

function seriesLayout() {
  const TY = 58, BY = SIM_H - 58, RX = SIM_W - 28;
  const slots = [];
  for (let i = 0; i < 4; i++) {
    const f = (i + 1) / 5;
    slots.push({ x: BX + (RX - BX) * f, y: TY });
  }
  return {
    slots,
    wires: [
      [BX, BCY - 32, BX, TY], [BX, TY, RX, TY],
      [RX, TY, RX, BY], [RX, BY, BX, BY],
      [BX, BY, BX, BCY + 32],
    ],
    electronPath: [
      { x: BX, y: TY }, { x: RX, y: TY },
      { x: RX, y: BY }, { x: BX, y: BY },
    ],
  };
}

function parallelLayout() {
  const LB = 78, RB = SIM_W - 58;
  const TT = 45, BB = SIM_H - 45;
  const midX = (LB + RB) / 2;
  const slots = [];
  for (let i = 0; i < 4; i++) {
    const f = (i + 0.5) / 4;
    slots.push({ x: midX, y: TT + (BB - TT) * f });
  }
  return {
    slots,
    wires: [
      [BX, BCY - 32, BX, TT], [BX, TT, LB, TT],
      [BX, BCY + 32, BX, BB], [BX, BB, LB, BB],
      [LB, TT, LB, BB], [RB, TT, RB, BB],
      [RB, TT, RB + 15, TT], [RB + 15, TT, RB + 15, BB], [RB + 15, BB, RB, BB],
    ],
    branchWires: (slotsArr) => slotsArr.map((s) => [[LB, s.y, RB, s.y]]),
    electronPath: null, // per-branch handled
  };
}

function mixedLayout() {
  const TY = 58, BY = SIM_H - 58, RX = SIM_W - 28;
  const FX = BX + 80;     // fork X
  const JX = RX - 80;     // join X
  const PY = TY + 75;     // parallel lower branch
  const mX = (FX + JX) / 2;
  return {
    slots: [
      { x: (BX + FX) / 2 + 12, y: TY },   // S1 – series left
      { x: mX, y: TY },                     // S2 – parallel top
      { x: mX, y: PY },                     // S3 – parallel bottom
      { x: (JX + RX) / 2, y: TY },          // S4 – series right
    ],
    wires: [
      [BX, BCY - 32, BX, TY], [BX, TY, RX, TY],
      [FX, TY, FX, PY], [FX, PY, JX, PY], [JX, PY, JX, TY],
      [RX, TY, RX, BY], [RX, BY, BX, BY], [BX, BY, BX, BCY + 32],
    ],
    forkX: FX, joinX: JX, parY: PY,
    electronPath: [
      { x: BX, y: TY }, { x: RX, y: TY },
      { x: RX, y: BY }, { x: BX, y: BY },
    ],
  };
}

function dividerLayout() {
  const TY = 58, BY = SIM_H - 58, RX = SIM_W - 28;
  const s1x = BX + (RX - BX) * 0.33;
  const s2x = BX + (RX - BX) * 0.67;
  const voutX = (s1x + s2x) / 2;
  return {
    slots: [
      { x: s1x, y: TY }, // R1
      { x: s2x, y: TY }, // R2
    ],
    wires: [
      [BX, BCY - 32, BX, TY], [BX, TY, RX, TY],
      [RX, TY, RX, BY], [RX, BY, BX, BY],
      [BX, BY, BX, BCY + 32],
    ],
    voutMarker: { x: voutX, y: TY },
    electronPath: [
      { x: BX, y: TY }, { x: RX, y: TY },
      { x: RX, y: BY }, { x: BX, y: BY },
    ],
  };
}

function bridgeLayout() {
  const LX = 78, RXb = SIM_W - 58;
  const MX = SIM_W / 2;
  const TY = 68, BY = SIM_H - 68;
  return {
    slots: [
      { x: (LX + MX) / 2, y: (BCY + TY) / 2 },   // R1 left→top
      { x: (MX + RXb) / 2, y: (TY + BCY) / 2 },   // R2 top→right
      { x: (LX + MX) / 2, y: (BCY + BY) / 2 },     // R3 left→bottom
      { x: (MX + RXb) / 2, y: (BY + BCY) / 2 },     // R4 bottom→right
    ],
    wires: [
      [BX, BCY, LX, BCY],
      [LX, BCY, MX, TY], [MX, TY, RXb, BCY],
      [LX, BCY, MX, BY], [MX, BY, RXb, BCY],
      [RXb, BCY, SIM_W - 28, BCY],
      [SIM_W - 28, BCY, SIM_W - 28, SIM_H - 22],
      [SIM_W - 28, SIM_H - 22, BX, SIM_H - 22],
      [BX, SIM_H - 22, BX, BCY],
    ],
    nodeA: { x: MX, y: TY },
    nodeB: { x: MX, y: BY },
    leftPt: { x: LX, y: BCY },
    rightPt: { x: RXb, y: BCY },
    electronPath: [
      { x: LX, y: BCY }, { x: MX, y: TY }, { x: RXb, y: BCY },
      { x: SIM_W - 28, y: BCY }, { x: SIM_W - 28, y: SIM_H - 22 },
      { x: BX, y: SIM_H - 22 }, { x: BX, y: BCY },
    ],
  };
}

// ══════════════════════════════════════════════════════════
//  PHYSICS CALCULATORS
// ══════════════════════════════════════════════════════════

function calcSeries(V, comps, wireR) {
  const totalR = comps.reduce((s, c) => s + c.resistance, 0) + wireR;
  const I = totalR > 0 ? V / totalR : 0;
  const items = comps.map(c => ({
    name: c.name, icon: c.icon, color: c.color,
    resistance: c.resistance,
    voltage: I * c.resistance,
    current: I,
    power: I * I * c.resistance,
  }));
  const totalP = items.reduce((s, c) => s + c.power, 0);
  const drops = items.map(c => c.voltage.toFixed(2) + 'V');
  return {
    components: items, totalR, totalI: I, totalP,
    laws: [
      { icon: 'zap',       label: "Ohm's Law",  text: `I = V/R = ${V}/${totalR.toFixed(1)} = ${I.toFixed(4)} A`, ok: true },
      { icon: 'refresh',   label: 'KCL',        text: `Same current ${fmtI(I)} through every component`, ok: true },
      { icon: 'target',    label: 'KVL (loop)',  text: `${V}V − ${drops.join(' − ')} ${wireR > 0 ? `− ${(I * wireR).toFixed(2)}V(wire)` : ''} = 0`, ok: true },
      { icon: 'lightbulb', label: 'Power',       text: `P_total = ${totalP.toFixed(3)} W   (P=I²R per component)`, ok: true },
      { icon: 'clock',     label: 'Energy / hr', text: `E = ${totalP.toFixed(3)} Wh = ${(totalP / 1000).toFixed(6)} kWh`, ok: true },
    ],
  };
}

function calcParallel(V, comps, wireR) {
  const items = comps.map(c => {
    const brR = c.resistance + wireR;
    const I = V / brR;
    return {
      name: c.name, icon: c.icon, color: c.color,
      resistance: c.resistance, voltage: V, current: I, power: V * I,
    };
  });
  const totalI = items.reduce((s, c) => s + c.current, 0);
  const totalP = items.reduce((s, c) => s + c.power, 0);
  const parR = comps.length > 0 ? 1 / comps.reduce((s, c) => s + 1 / (c.resistance + wireR), 0) : Infinity;
  const branches = items.map(c => `${fmtI(c.current)}`).join(' + ');
  return {
    components: items, totalR: parR, totalI, totalP,
    laws: [
      { icon: 'zap',       label: "Ohm's Law",    text: `R_eq = ${parR.toFixed(2)}Ω → I_total = ${fmtI(totalI)}`, ok: true },
      { icon: 'refresh',   label: 'KCL (junction)',text: `I_total = ${branches} = ${fmtI(totalI)}`, ok: true },
      { icon: 'target',    label: 'KVL',           text: `Each branch sees full ${V}V`, ok: true },
      { icon: 'lightbulb', label: 'Power',          text: `P_total = ${totalP.toFixed(3)} W  (P=V²/R per branch)`, ok: true },
      { icon: 'clock',     label: 'Energy / hr',    text: `E = ${totalP.toFixed(3)} Wh = ${(totalP / 1000).toFixed(6)} kWh`, ok: true },
      { icon: 'chart',     label: 'Current Divider', text: `Higher R → less current.  I_k = V/R_k`, ok: true },
    ],
  };
}

function calcMixed(V, comps, wireR) {
  // S1 series ─ (S2 ‖ S3) parallel ─ S4 series
  const R1 = comps[0].resistance, R2 = comps[1].resistance;
  const R3 = comps[2].resistance, R4 = comps[3].resistance;
  const Rpar = (R2 * R3) / (R2 + R3);
  const Rtot = R1 + Rpar + R4 + wireR;
  const It = V / Rtot;
  const V1 = It * R1, V4 = It * R4, Vp = It * Rpar;
  const I2 = Vp / R2, I3 = Vp / R3;
  const items = [
    { name: comps[0].name, icon: comps[0].icon, color: comps[0].color, resistance: R1, voltage: V1, current: It, power: It * It * R1 },
    { name: comps[1].name, icon: comps[1].icon, color: comps[1].color, resistance: R2, voltage: Vp, current: I2, power: I2 * I2 * R2 },
    { name: comps[2].name, icon: comps[2].icon, color: comps[2].color, resistance: R3, voltage: Vp, current: I3, power: I3 * I3 * R3 },
    { name: comps[3].name, icon: comps[3].icon, color: comps[3].color, resistance: R4, voltage: V4, current: It, power: It * It * R4 },
  ];
  const totalP = items.reduce((s, c) => s + c.power, 0);
  return {
    components: items, totalR: Rtot, totalI: It, totalP,
    laws: [
      { icon: 'zap',      label: "Ohm's Law",     text: `R_eq = ${R1}+${Rpar.toFixed(1)}+${R4} = ${Rtot.toFixed(1)}Ω  →  I = ${fmtI(It)}`, ok: true },
      { icon: 'refresh',  label: 'KCL (fork)',     text: `I_total (${fmtI(It)}) = I₂ (${fmtI(I2)}) + I₃ (${fmtI(I3)})`, ok: true },
      { icon: 'target',   label: 'KVL (outer)',    text: `${V}V − ${V1.toFixed(2)}V − ${Vp.toFixed(2)}V − ${V4.toFixed(2)}V = 0`, ok: true },
      { icon: 'lightbulb',label: 'Power',          text: `P_total = ${totalP.toFixed(3)} W`, ok: true },
      { icon: 'chart',    label: 'Parallel section',text: `R_par = (${R2}×${R3})/(${R2}+${R3}) = ${Rpar.toFixed(1)}Ω`, ok: true },
    ],
  };
}

function calcDivider(V, comps, wireR) {
  const R1 = comps[0].resistance, R2 = comps[1].resistance;
  const Rtot = R1 + R2 + wireR;
  const I = V / Rtot;
  const V1 = I * R1, V2 = I * R2;
  const Vout = V * R2 / (R1 + R2);
  const ratio = R2 / (R1 + R2);
  const items = [
    { name: comps[0].name, icon: comps[0].icon, color: comps[0].color, resistance: R1, voltage: V1, current: I, power: I * I * R1 },
    { name: comps[1].name, icon: comps[1].icon, color: comps[1].color, resistance: R2, voltage: V2, current: I, power: I * I * R2 },
  ];
  const totalP = items.reduce((s, c) => s + c.power, 0);
  return {
    components: items, totalR: Rtot, totalI: I, totalP,
    Vout, ratio,
    laws: [
      { icon: 'zap',      label: "Ohm's Law",         text: `I = ${V}/(${R1}+${R2}) = ${fmtI(I)}`, ok: true },
      { icon: 'balance',  label: 'Voltage Divider',     text: `V_out = V × R₂/(R₁+R₂) = ${V} × ${R2}/${R1 + R2} = ${Vout.toFixed(3)} V`, ok: true },
      { icon: 'chart',    label: 'Divider Ratio',        text: `Ratio = ${(ratio * 100).toFixed(1)}%  →  ${ratio.toFixed(4)}`, ok: true },
      { icon: 'target',   label: 'KVL',                  text: `${V}V − ${V1.toFixed(2)}V − ${V2.toFixed(2)}V = 0`, ok: true },
      { icon: 'lightbulb',label: 'Power dissipated',     text: `P = ${totalP.toFixed(3)} W  (wasted as heat!)`, ok: true },
      { icon: 'clock',    label: 'Energy / hr',           text: `E = ${totalP.toFixed(3)} Wh`, ok: true },
    ],
  };
}

function calcBridge(V, comps, wireR) {
  const R1 = comps[0].resistance, R2 = comps[1].resistance;
  const R3 = comps[2].resistance, R4 = comps[3].resistance;
  const VA = V * R3 / (R1 + R3);
  const VB = V * R4 / (R2 + R4);
  const Vbridge = VA - VB;
  const balanced = Math.abs(Vbridge) < 0.05;
  const Ileft = V / (R1 + R3 + wireR);
  const Iright = V / (R2 + R4 + wireR);
  const items = [
    { name: comps[0].name, icon: comps[0].icon, color: comps[0].color, resistance: R1, voltage: Ileft * R1, current: Ileft, power: Ileft * Ileft * R1 },
    { name: comps[1].name, icon: comps[1].icon, color: comps[1].color, resistance: R2, voltage: Iright * R2, current: Iright, power: Iright * Iright * R2 },
    { name: comps[2].name, icon: comps[2].icon, color: comps[2].color, resistance: R3, voltage: Ileft * R3, current: Ileft, power: Ileft * Ileft * R3 },
    { name: comps[3].name, icon: comps[3].icon, color: comps[3].color, resistance: R4, voltage: Iright * R4, current: Iright, power: Iright * Iright * R4 },
  ];
  const totalP = items.reduce((s, c) => s + c.power, 0);
  const totalI = Ileft + Iright;
  const neededR4 = R2 * R3 / R1;
  const lawList = [
    { icon: 'target',    label: 'Bridge Voltage',    text: `V_A = ${VA.toFixed(3)}V   V_B = ${VB.toFixed(3)}V   →   V_ab = ${Vbridge.toFixed(4)} V`, ok: balanced },
    { icon: 'check',     label: 'Balance condition',  text: balanced ? `R₁/R₃ = R₂/R₄ ✓  Bridge BALANCED!` : `R₁/R₃ ≠ R₂/R₄  →  need R₄ = ${neededR4.toFixed(1)}Ω to balance`, ok: balanced },
    { icon: 'refresh',   label: 'KCL at nodes',       text: `Left branch: ${fmtI(Ileft)} | Right branch: ${fmtI(Iright)}`, ok: true },
    { icon: 'zap',       label: "Ohm's Law",          text: `I_left = ${V}/(${R1}+${R3}) = ${fmtI(Ileft)}`, ok: true },
    { icon: 'lightbulb', label: 'Power',               text: `P_total = ${totalP.toFixed(3)} W`, ok: true },
  ];
  return {
    components: items, totalR: (R1 + R3) * (R2 + R4) / (R1 + R3 + R2 + R4), totalI, totalP,
    VA, VB, Vbridge, balanced, neededR4,
    laws: lawList,
  };
}

// ── formatter helper (used inside calc funcs) ───────
function fmtI(i) { return i >= 1 ? `${i.toFixed(3)} A` : `${(i * 1000).toFixed(1)} mA`; }

// ── Path interpolation ──────────────────────────────
function interpolatePath(pts, t) {
  let total = 0;
  const lens = [];
  for (let i = 0; i < pts.length; i++) {
    const nx = pts[(i + 1) % pts.length];
    const l = Math.hypot(nx.x - pts[i].x, nx.y - pts[i].y);
    lens.push(l); total += l;
  }
  let d = (t % 1) * total;
  for (let i = 0; i < pts.length; i++) {
    if (d <= lens[i]) {
      const f = d / lens[i];
      const nx = pts[(i + 1) % pts.length];
      return { x: pts[i].x + f * (nx.x - pts[i].x), y: pts[i].y + f * (nx.y - pts[i].y) };
    }
    d -= lens[i];
  }
  return pts[0];
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function ElectricityLab({
  scientistMode = false,
  accentColor   = '#FFD166',
  onLabBreaker,
}) {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary, txt2 = theme.text.secondary;
  const txtM = theme.text.muted;
  const glass1 = theme.glass.light, glass2 = theme.glass.medium;
  const border = theme.glass.border;

  // ── State ─────────────────────────────────────
  const [topologyIdx, setTopologyIdx]           = useState(0);
  const [selVoltage, setSelVoltage]             = useState(2);      // 5V
  const [customV, setCustomV]                   = useState(5);
  const [wireRes, setWireRes]                   = useState(0);
  const [selectedPalette, setSelectedPalette]   = useState(null);   // comp index to place
  const [placed, setPlaced]                     = useState({});     // slotIdx → compIdx
  const [running, setRunning]                   = useState(false);
  const [hasRun, setHasRun]                     = useState(false);
  const [runCount, setRunCount]                 = useState(0);
  const [results, setResults]                   = useState(null);
  const [showInsights, setShowInsights]         = useState(false);
  const [completedChallenges, setCompleted]     = useState([]);
  const [showChallenges, setShowChallenges]     = useState(false);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  // ── Animated refs ──────────────────────────────
  const electronAnims = useRef(
    Array.from({ length: NUM_ELECTRONS }, () => ({
      x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
    }))
  ).current;
  const slotScaleAnims = useRef(Array.from({ length: MAX_SLOTS }, () => new Animated.Value(1))).current;
  const impactRing   = useRef(new Animated.Value(0)).current;
  const runBtnScale  = useRef(new Animated.Value(1)).current;
  const challengeAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 10 }, () => ({ x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0) }))
  ).current;
  const interval = useRef(null);
  const startTs  = useRef(0);

  useEffect(() => () => { if (interval.current) clearInterval(interval.current); }, []);

  // ── Derived values ─────────────────────────────
  const topo   = TOPOLOGIES[topologyIdx];
  const layout = getLayout(topo.id);
  const V      = VOLTAGES[selVoltage].v ?? customV;
  const isCustomV = VOLTAGES[selVoltage].v == null;
  const filledSlots   = Object.keys(placed).length;
  const allFilled     = filledSlots >= topo.slots;
  const filledComps   = layout.slots.map((_, i) => placed[i] != null ? COMPONENTS[placed[i]] : null).filter(Boolean);
  const minForAnalyze = topo.id === 'divider' || topo.id === 'bridge' ? topo.slots : 1;
  const canAnalyze    = filledSlots >= minForAnalyze;

  // quick total-R estimate
  const estTotalR = (() => {
    if (!canAnalyze) return Infinity;
    const comps = layout.slots.map((_, i) => placed[i] != null ? COMPONENTS[placed[i]] : null).filter(Boolean);
    if (topo.id === 'series')   return comps.reduce((s, c) => s + c.resistance, 0) + wireRes;
    if (topo.id === 'parallel') { const sm = comps.reduce((s, c) => s + 1 / (c.resistance + wireRes), 0); return sm > 0 ? 1 / sm : Infinity; }
    if (topo.id === 'mixed' && comps.length === 4) {
      const Rp = (comps[1].resistance * comps[2].resistance) / (comps[1].resistance + comps[2].resistance);
      return comps[0].resistance + Rp + comps[3].resistance + wireRes;
    }
    if (topo.id === 'divider' && comps.length === 2) return comps[0].resistance + comps[1].resistance + wireRes;
    if (topo.id === 'bridge' && comps.length === 4) return ((comps[0].resistance + comps[2].resistance) * (comps[1].resistance + comps[3].resistance)) / (comps[0].resistance + comps[1].resistance + comps[2].resistance + comps[3].resistance);
    return Infinity;
  })();
  const estI = estTotalR > 0 && estTotalR < Infinity ? V / estTotalR : 0;

  // ── Topology change (resets circuit) ───────────
  const changeTopology = (idx) => {
    soundTap(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTopologyIdx(idx); setPlaced({}); setResults(null);
    setHasRun(false); setShowInsights(false); setSelectedPalette(null);
  };

  // ── Slot tap handler ──────────────────────────
  const handleSlotTap = (slotIdx) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (placed[slotIdx] != null) {
      // Remove component
      Animated.timing(slotScaleAnims[slotIdx], { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
        setPlaced(p => { const n = { ...p }; delete n[slotIdx]; return n; });
        slotScaleAnims[slotIdx].setValue(1);
      });
      setHasRun(false); setResults(null); setShowInsights(false);
    } else if (selectedPalette != null) {
      // Place component with spring
      setPlaced(p => ({ ...p, [slotIdx]: selectedPalette }));
      slotScaleAnims[slotIdx].setValue(0.25);
      Animated.spring(slotScaleAnims[slotIdx], { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }).start();
      soundWhoosh();
      setHasRun(false); setResults(null); setShowInsights(false);
    }
  };

  // ── Palette select ─────────────────────────────
  const selectPalette = (idx) => {
    soundTap(); Haptics.selectionAsync();
    setSelectedPalette(prev => prev === idx ? null : idx);
  };

  // ── Start analysis ─────────────────────────────
  const startAnalysis = () => {
    if (running || !canAnalyze) return;
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseBtn();

    // Lab breaker
    if ((V >= 48 || estI > 5 || wireRes >= 10) && onLabBreaker) onLabBreaker();

    // Reset visuals
    setHasRun(false); setShowInsights(false); setResults(null);
    impactRing.setValue(0);
    particleAnims.forEach(p => p.op.setValue(0));

    setRunning(true);
    startTs.current = Date.now();

    const compsOrdered = layout.slots.map((_, i) => placed[i] != null ? COMPONENTS[placed[i]] : null).filter(Boolean);

    interval.current = setInterval(() => {
      const elapsed = Date.now() - startTs.current;
      const elSec   = elapsed / 1000;
      const speed   = Math.min(Math.max(estI * 0.35, 0.02), 4);

      // Electron animation
      if (topo.id === 'parallel') {
        // Per-branch electrons
        let eIdx = 0;
        const branchSlots = layout.slots.filter((_, i) => placed[i] != null);
        for (let b = 0; b < branchSlots.length && b < 5; b++) {
          const brComp = COMPONENTS[placed[Object.keys(placed).sort()[b]]];
          const brI    = brComp ? V / (brComp.resistance + wireRes) : 0.1;
          const brSpd  = Math.min(Math.max(brI * 0.35, 0.02), 4);
          const brY    = branchSlots[b].y;
          const lb = 78, rb = SIM_W - 58;
          for (let j = 0; j < 2 && eIdx < NUM_ELECTRONS; j++) {
            const t = (elSec * brSpd + j * 0.5) % 1;
            electronAnims[eIdx].x.setValue(lb + t * (rb - lb));
            electronAnims[eIdx].y.setValue(brY);
            electronAnims[eIdx].op.setValue(1);
            eIdx++;
          }
        }
        while (eIdx < NUM_ELECTRONS) { electronAnims[eIdx].op.setValue(0); eIdx++; }
      } else if (layout.electronPath) {
        const phase = (elSec * speed) % 1;
        const cnt = Math.min(NUM_ELECTRONS, 8);
        for (let i = 0; i < cnt; i++) {
          const t   = (phase + i / cnt) % 1;
          const pos = interpolatePath(layout.electronPath, t);
          electronAnims[i].x.setValue(pos.x);
          electronAnims[i].y.setValue(pos.y);
          electronAnims[i].op.setValue(1);
        }
        for (let i = cnt; i < NUM_ELECTRONS; i++) electronAnims[i].op.setValue(0);
      }

      if (elapsed >= SIM_DURATION) {
        clearInterval(interval.current); interval.current = null;
        setRunning(false);
        triggerCompletion(compsOrdered);
      }
    }, 16);
  };

  // ── Completion ──────────────────────────────────
  const triggerCompletion = (compsOrdered) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    soundBadge();
    electronAnims.forEach(e => e.op.setValue(0));

    Animated.sequence([
      Animated.spring(impactRing, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
      Animated.timing(impactRing, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    particleAnims.forEach((p, i) => {
      const a = (i / 10) * Math.PI * 2, d = 30 + Math.random() * 25;
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

    let res;
    switch (topo.id) {
      case 'series':   res = calcSeries(V, compsOrdered, wireRes); break;
      case 'parallel': res = calcParallel(V, compsOrdered, wireRes); break;
      case 'mixed':    res = calcMixed(V, compsOrdered, wireRes); break;
      case 'divider':  res = calcDivider(V, compsOrdered, wireRes); break;
      case 'bridge':   res = calcBridge(V, compsOrdered, wireRes); break;
      default:         res = calcSeries(V, compsOrdered, wireRes);
    }
    setResults(res); setHasRun(true); setShowInsights(true); setRunCount(c => c + 1);
    checkChallenges(res);
  };

  // ── Challenge checking ──────────────────────────
  const checkChallenges = (res) => {
    const fresh = [];
    if (topo.id === 'series' && allFilled && !completedChallenges.includes('series_fill')) fresh.push('series_fill');
    if (topo.id === 'parallel' && allFilled && !completedChallenges.includes('parallel_fill')) fresh.push('parallel_fill');
    if (res.totalP > 10 && !completedChallenges.includes('power_surge')) fresh.push('power_surge');
    if (topo.id === 'bridge' && res.balanced && !completedChallenges.includes('bridge_balance')) fresh.push('bridge_balance');
    const uniqueIcons = new Set(Object.values(placed).map(i => COMPONENTS[i].icon));
    if (uniqueIcons.size >= 4 && !completedChallenges.includes('multi_comp')) fresh.push('multi_comp');
    if (fresh.length) {
      setCompleted(p => [...p, ...fresh]);
      setLastChallengeMsg(CHALLENGES.find(c => c.id === fresh[0])?.title);
      soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(challengeAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(challengeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const pulseBtn = () => {
    Animated.sequence([
      Animated.spring(runBtnScale, { toValue: 0.92, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.spring(runBtnScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  // ── Formatters ─────────────────────────────────
  const fmtR = (r) => r >= 1000 ? `${(r / 1000).toFixed(1)}kΩ` : `${r.toFixed(1)}Ω`;
  const fmtIL = (i) => i >= 1 ? `${i.toFixed(3)}A` : `${(i * 1000).toFixed(1)}mA`;
  const fmtP = (p) => p >= 1 ? `${p.toFixed(2)}W` : `${(p * 1000).toFixed(1)}mW`;
  const fmtVL = (v) => `${v.toFixed(2)}V`;

  // ── Fun fact ───────────────────────────────────
  const getFunFact = () => {
    if (topo.id === 'bridge' && results?.balanced) return "A balanced Wheatstone Bridge was the gold-standard method for measuring unknown resistances from the 1840s to the 1960s! Invented by Samuel Hunter Christie, popularized by Sir Charles Wheatstone. 📐";
    if (topo.id === 'divider') return `Your voltage divider outputs ${results?.Vout?.toFixed(2)}V — this is exactly how volume knobs, sensor readings, and microcontroller ADCs work! 🎚️`;
    if (V >= 24) return `At ${V}V you're in industrial territory! Household electronics run at 5–12V, while power grids transmit at 400,000V+ ⚡`;
    if (topo.id === 'parallel' && filledSlots >= 3) return "Your home wiring uses parallel circuits — that's why turning off one light doesn't kill all the others! 🏠";
    if (results?.totalP > 5) return `${results.totalP.toFixed(1)}W could power about ${Math.max(1, Math.floor(results.totalP / 0.06))} modern LEDs simultaneously! 💡`;
    return "Georg Ohm's law V=IR was rejected for years — he nearly abandoned science before being vindicated! 📜";
  };

  // ── Wire color ─────────────────────────────────
  const wireCol   = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  const wireActv  = running ? accentColor + '55' : wireCol;

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  return (
    <View style={styles.root}>

      {/* ── Topology selector ─────────────── */}
      <SectionLabel icon="molecule" label="CIRCUIT TOPOLOGY" color={accentColor} txtM={txtM} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {TOPOLOGIES.map((tp, i) => {
          const active = topologyIdx === i;
          return (
            <TouchableOpacity key={tp.id} onPress={() => changeTopology(i)}
              style={[styles.topoCard, { borderColor: active ? tp.color + '80' : border, backgroundColor: active ? tp.color + '12' : glass1 }]}>
              <View style={[styles.topoIconWrap, { backgroundColor: tp.color + '18', borderColor: tp.color + '30' }]}>
                <Icon name={tp.icon} size={18} color={active ? tp.color : txtM} />
              </View>
              <Text style={[styles.topoName, { color: active ? txt1 : txtM }]} numberOfLines={1}>{tp.name}</Text>
              <Text style={[styles.topoSlots, { color: active ? tp.color : txtM }]}>{tp.slots} slots</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── SVG Canvas ─────────────────────── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#0A0B12' : '#F5F6FF' }]}>
        <Svg width={SIM_W} height={SIM_H}>
          <Defs>
            <SvgLinearGradient id="simBg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isDark ? '#0D0E18' : '#F8F9FF'} />
              <Stop offset="1" stopColor={isDark ? '#06070C' : '#ECEEFF'} />
            </SvgLinearGradient>
            <RadialGradient id="eGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={accentColor} stopOpacity="0.9" />
              <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SIM_W} height={SIM_H} fill="url(#simBg)" />

          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <React.Fragment key={f}>
              <Line x1={SIM_W * f} y1="0" x2={SIM_W * f} y2={SIM_H} stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.5" />
              <Line x1="0" y1={SIM_H * f} x2={SIM_W} y2={SIM_H * f} stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Battery symbol */}
          <Rect x={BX - 14} y={BCY - 32} width={28} height={64} rx={5}
            fill={accentColor + '12'} stroke={accentColor + '40'} strokeWidth={1.2} />
          <Line x1={BX - 9} y1={BCY - 10} x2={BX + 9} y2={BCY - 10} stroke={accentColor} strokeWidth={2.5} strokeLinecap="round" />
          <Line x1={BX - 5} y1={BCY} x2={BX + 5} y2={BCY} stroke={accentColor} strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={BX - 9} y1={BCY + 10} x2={BX + 9} y2={BCY + 10} stroke={accentColor} strokeWidth={2.5} strokeLinecap="round" />
          <Line x1={BX - 5} y1={BCY + 20} x2={BX + 5} y2={BCY + 20} stroke={accentColor} strokeWidth={1.5} strokeLinecap="round" />
          <SvgText x={BX} y={BCY - 36} textAnchor="middle" fontSize="9" fill={accentColor} fillOpacity="0.8" fontWeight="bold">+</SvgText>
          <SvgText x={BX} y={BCY + 42} textAnchor="middle" fontSize="11" fill={accentColor} fillOpacity="0.8" fontWeight="bold">−</SvgText>
          <SvgText x={BX} y={BCY + 55} textAnchor="middle" fontSize="9" fill={accentColor} fillOpacity="0.5">{V}V</SvgText>

          {/* Wires */}
          {layout.wires.map((w, i) => (
            <Line key={i} x1={w[0]} y1={w[1]} x2={w[2]} y2={w[3]}
              stroke={wireActv} strokeWidth={2} strokeLinecap="round" />
          ))}

          {/* Parallel branch wires */}
          {topo.id === 'parallel' && layout.slots.map((s, i) => {
            const hasCmp = placed[i] != null;
            const col = hasCmp ? COMPONENTS[placed[i]].color + '50' : wireCol;
            return <Line key={`br${i}`} x1={78} y1={s.y} x2={SIM_W - 58} y2={s.y} stroke={col} strokeWidth={1.5} strokeLinecap="round" />;
          })}

          {/* Mixed fork indicators */}
          {topo.id === 'mixed' && layout.forkX && (
            <>
              <Circle cx={layout.forkX} cy={layout.slots[0].y} r={3} fill={accentColor} fillOpacity="0.5" />
              <Circle cx={layout.joinX} cy={layout.slots[0].y} r={3} fill={accentColor} fillOpacity="0.5" />
              <SvgText x={layout.forkX} y={layout.slots[0].y - 10} textAnchor="middle" fontSize="7" fill={txtM}>fork</SvgText>
              <SvgText x={layout.joinX} y={layout.slots[0].y - 10} textAnchor="middle" fontSize="7" fill={txtM}>join</SvgText>
            </>
          )}

          {/* Divider Vout marker */}
          {topo.id === 'divider' && layout.voutMarker && (
            <>
              <Line x1={layout.voutMarker.x} y1={layout.voutMarker.y} x2={layout.voutMarker.x} y2={layout.voutMarker.y + 55}
                stroke={accentColor + '50'} strokeWidth={1} strokeDasharray="3,3" />
              <Circle cx={layout.voutMarker.x} cy={layout.voutMarker.y} r={4} fill={accentColor} fillOpacity="0.6" />
              <Rect x={layout.voutMarker.x - 26} y={layout.voutMarker.y + 40} width={52} height={18} rx={4}
                fill={accentColor + '15'} stroke={accentColor + '40'} strokeWidth={0.8} />
              <SvgText x={layout.voutMarker.x} y={layout.voutMarker.y + 53} textAnchor="middle"
                fontSize="8" fill={accentColor} fontWeight="bold">
                {results ? `V_out=${results.Vout.toFixed(2)}` : 'V_out'}
              </SvgText>
            </>
          )}

          {/* Bridge galvanometer + node labels */}
          {topo.id === 'bridge' && layout.nodeA && (
            <>
              <Line x1={layout.nodeA.x} y1={layout.nodeA.y} x2={layout.nodeB.x} y2={layout.nodeB.y}
                stroke={results?.balanced ? '#00E5A080' : '#FF6B9D60'} strokeWidth={1.2} strokeDasharray="4,4" />
              <Circle cx={SIM_W / 2} cy={BCY} r={11}
                fill={isDark ? '#12131D' : '#F0F1FF'} stroke={results?.balanced ? '#00E5A060' : '#FF6B9D50'} strokeWidth={1.2} />
              <SvgText x={SIM_W / 2} y={BCY + 3.5} textAnchor="middle" fontSize="8"
                fill={results?.balanced ? '#00E5A0' : '#FF6B9D'} fontWeight="bold">G</SvgText>
              <Circle cx={layout.nodeA.x} cy={layout.nodeA.y} r={4} fill={accentColor} fillOpacity="0.5" />
              <Circle cx={layout.nodeB.x} cy={layout.nodeB.y} r={4} fill={accentColor} fillOpacity="0.5" />
              <SvgText x={layout.nodeA.x + 12} y={layout.nodeA.y - 4} fontSize="8" fill={txtM}>A</SvgText>
              <SvgText x={layout.nodeB.x + 12} y={layout.nodeB.y + 12} fontSize="8" fill={txtM}>B</SvgText>
            </>
          )}

          {/* Empty slot dashed rects in SVG */}
          {layout.slots.map((s, i) => placed[i] == null && (
            <React.Fragment key={`es${i}`}>
              <Rect x={s.x - 18} y={s.y - 18} width={36} height={36} rx={8}
                fill="none" stroke={selectedPalette != null ? accentColor + '50' : txtM + '30'}
                strokeWidth={1.2} strokeDasharray="5,3" />
              <SvgText x={s.x} y={s.y + 4} textAnchor="middle" fontSize="14"
                fill={selectedPalette != null ? accentColor + '50' : txtM + '40'} fontWeight="300">+</SvgText>
            </React.Fragment>
          ))}

          {/* Mode badge */}
          <Rect x={SIM_W - 130} y={8} width={122} height={22} rx={6}
            fill={topo.color} fillOpacity="0.1" stroke={topo.color} strokeOpacity="0.25" strokeWidth="0.8" />
          <SvgText x={SIM_W - 14} y={23} textAnchor="end" fontSize="9" fill={topo.color} fillOpacity="0.85">
            {topo.name}  •  {V}V
          </SvgText>

          {/* Slot labels */}
          {layout.slots.map((s, i) => (
            <SvgText key={`sl${i}`} x={s.x} y={s.y + 30} textAnchor="middle" fontSize="7" fill={txtM + '80'}>
              {topo.id === 'bridge' ? `R${i + 1}` : `S${i + 1}`}
            </SvgText>
          ))}
        </Svg>

        {/* ── Placed component Icon overlays ── */}
        {layout.slots.map((s, i) => {
          if (placed[i] == null) return null;
          const comp = COMPONENTS[placed[i]];
          const glowPower = results ? Math.min(results.components.find(c => c.name === comp.name)?.power || 0, 5) / 5 : 0;
          return (
            <Animated.View key={`pc${i}`} style={[styles.placedWrap, {
              left: s.x - 22, top: s.y - 22,
              transform: [{ scale: slotScaleAnims[i] }],
            }]}>
              <TouchableOpacity onPress={() => handleSlotTap(i)} activeOpacity={0.7}
                style={[styles.placedBox, {
                  borderColor: comp.color + '90',
                  backgroundColor: comp.color + '18',
                  shadowColor: comp.color,
                  shadowOpacity: 0.3 + glowPower * 0.5,
                  shadowRadius: 4 + glowPower * 8,
                }]}>
                <Icon name={comp.icon} size={20} color={comp.color} />
              </TouchableOpacity>
              <Text style={[styles.placedLabel, { color: comp.color }]} numberOfLines={1}>{comp.resistance}Ω</Text>
            </Animated.View>
          );
        })}

        {/* ── Empty slot touch targets ──────── */}
        {layout.slots.map((s, i) => {
          if (placed[i] != null) return null;
          return (
            <TouchableOpacity key={`et${i}`}
              style={[styles.emptyTouch, { left: s.x - 22, top: s.y - 22, borderColor: selectedPalette != null ? accentColor + '40' : 'transparent' }]}
              onPress={() => handleSlotTap(i)} activeOpacity={0.7} />
          );
        })}

        {/* ── Electrons ─────────────────────── */}
        {electronAnims.map((e, i) => (
          <Animated.View key={`el${i}`} style={[styles.electron, {
            backgroundColor: accentColor, shadowColor: accentColor,
            transform: [{ translateX: e.x }, { translateY: e.y }], opacity: e.op,
          }]} />
        ))}

        {/* Impact ring */}
        <Animated.View style={[styles.impactRing, {
          borderColor: accentColor,
          opacity: impactRing.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] }),
          transform: [{ scale: impactRing.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2.5] }) }],
        }]} />

        {/* Particles */}
        {particleAnims.map((p, i) => (
          <Animated.View key={`pt${i}`} style={[styles.particle, {
            backgroundColor: accentColor, opacity: p.op,
            transform: [{ translateX: p.x }, { translateY: p.y }],
          }]} />
        ))}

        {running && <View style={styles.runOverlay}><Text style={[styles.runOverlayTxt, { color: accentColor }]}>Analyzing…</Text></View>}
      </View>

      {/* ── Component Palette ─────────────── */}
      <SectionLabel icon="lightbulb" label={`COMPONENT PALETTE${selectedPalette != null ? '  •  Tap a slot to place' : ''}`} color={accentColor} txtM={txtM} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {COMPONENTS.map((comp, i) => {
          const sel = selectedPalette === i;
          return (
            <TouchableOpacity key={comp.name} onPress={() => selectPalette(i)}
              style={[styles.paletteCard, {
                borderColor: sel ? comp.color + '90' : border,
                backgroundColor: sel ? comp.color + '15' : glass1,
              }]}>
              <View style={[styles.paletteIconWrap, { backgroundColor: comp.color + '18', borderColor: comp.color + '30' }]}>
                <Icon name={comp.icon} size={16} color={sel ? comp.color : txtM} />
              </View>
              <Text style={[styles.paletteName, { color: sel ? txt1 : txtM }]} numberOfLines={1}>{comp.name}</Text>
              <Text style={[styles.paletteR, { color: sel ? comp.color : txtM }]}>{comp.resistance}Ω</Text>
              {sel && <View style={[styles.paletteSelDot, { backgroundColor: comp.color }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Guide hint */}
      {filledSlots === 0 && (
        <View style={[styles.hintBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
          <Icon name="info" size={14} color={accentColor} />
          <Text style={[styles.hintText, { color: txt2 }]}>
            Select a component above, then tap an empty slot on the circuit to place it
          </Text>
        </View>
      )}

      {/* ── Voltage selector ──────────────── */}
      <SectionLabel icon="battery" label="VOLTAGE SOURCE" color={accentColor} txtM={txtM} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {VOLTAGES.map((vp, i) => (
          <Preset key={vp.name} label={vp.name}
            active={selVoltage === i} activeColor={vp.color}
            onPress={() => { soundTap(); Haptics.selectionAsync(); setSelVoltage(i); setHasRun(false); setResults(null); }}
            txtM={txtM} glass1={glass1} border={border} />
        ))}
      </ScrollView>
      {isCustomV && (
        <>
          <View style={[styles.fillTrack, { backgroundColor: glass1 }]}>
            <View style={[styles.fillBar, { width: `${Math.min(customV / 100, 1) * 100}%`, backgroundColor: accentColor + '50' }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {CUSTOM_V.map(cv => (
              <Preset key={cv} label={`${cv}V`}
                active={customV === cv} activeColor={accentColor}
                onPress={() => { soundTap(); Haptics.selectionAsync(); setCustomV(cv); setHasRun(false); setResults(null); }}
                txtM={txtM} glass1={glass1} border={border} />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Scientist mode: wire resistance ── */}
      {scientistMode && (
        <>
          <SectionLabel icon="microscope" label="WIRE RESISTANCE (Ω)" color={accentColor} txtM={txtM} />
          <View style={[styles.fillTrack, { backgroundColor: glass1 }]}>
            <View style={[styles.fillBar, { width: `${Math.min(wireRes / 10, 1) * 100}%`, backgroundColor: '#FF6B9D50' }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {WIRE_R_PRE.map(wr => (
              <Preset key={wr} label={`${wr}Ω`}
                active={wireRes === wr} activeColor="#FF6B9D"
                onPress={() => { soundTap(); Haptics.selectionAsync(); setWireRes(wr); setHasRun(false); setResults(null); }}
                txtM={txtM} glass1={glass1} border={border} />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Stats bar ──────────────────────── */}
      <View style={styles.statsRow}>
        <StatPill icon="zap" iconColor={accentColor} label="Voltage" value={`${V}V`} txt1={txt1} txtM={txtM} />
        <StatPill icon="link" iconColor="#6C63FF" label="R_eq" value={estTotalR < Infinity ? fmtR(estTotalR) : '∞'} txt1={txt1} txtM={txtM} />
        <StatPill icon="lightning" iconColor="#FF9F1C" label="Est. I" value={estI > 0 ? fmtIL(estI) : '—'} txt1={txt1} txtM={txtM} />
        <StatPill icon="target" iconColor="#4ECDC4" label="Placed" value={`${filledSlots}/${topo.slots}`} txt1={txt1} txtM={txtM} />
      </View>

      {/* ── Analyze button ─────────────────── */}
      <Animated.View style={{ transform: [{ scale: runBtnScale }] }}>
        <TouchableOpacity
          onPress={running ? undefined : startAnalysis}
          activeOpacity={running ? 1 : 0.85}
          disabled={running || !canAnalyze}
          style={[styles.runBtn, { borderColor: running ? border : canAnalyze ? accentColor + '70' : border, opacity: canAnalyze ? 1 : 0.45 }]}>
          <LinearGradient colors={running ? [glass2, glass1] : [accentColor + '35', accentColor + '18']} style={styles.runBtnGrad}>
            <Icon name={running ? 'clock' : hasRun ? 'refresh' : 'zap'} size={18} color={running ? txtM : accentColor} />
            <Text style={[styles.runBtnTxt, { color: running ? txtM : txt1 }]}>
              {running ? 'Analyzing…' : hasRun ? 'Re-Analyze' : canAnalyze ? 'Analyze Circuit' : `Fill ${minForAnalyze - filledSlots} more slot${minForAnalyze - filledSlots > 1 ? 's' : ''}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {runCount > 0 && (
        <View style={[styles.counterRow, { borderColor: border }]}>
          <Icon name="flask" size={12} color={txtM} />
          <Text style={[styles.counterTxt, { color: txtM }]}>{runCount} analysis run{runCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* ── Results Table ──────────────────── */}
      {showInsights && results && (
        <View style={[styles.insightsBox, { borderColor: border, backgroundColor: glass1 }]}>
          <View style={styles.insightsHeader}>
            <Icon name="chart" size={16} color={accentColor} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>Measurement Results</Text>
          </View>

          {/* Table header */}
          <View style={[styles.tableRow, styles.tableHead, { borderBottomColor: border }]}>
            <Text style={[styles.tH, styles.tColN, { color: txtM }]}>Component</Text>
            <Text style={[styles.tH, styles.tColV, { color: txtM }]}>Current</Text>
            <Text style={[styles.tH, styles.tColV, { color: txtM }]}>Voltage</Text>
            <Text style={[styles.tH, styles.tColV, { color: txtM }]}>Power</Text>
          </View>
          {[...results.components].sort((a, b) => b.power - a.power).map((r, i) => {
            const best = i === 0, worst = i === results.components.length - 1 && results.components.length > 1;
            return (
              <View key={`${r.name}${i}`} style={[styles.tableRow, { borderBottomColor: border + '40' }]}>
                <View style={[styles.tColN, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
                  <Icon name={r.icon} size={12} color={r.color} />
                  <Text style={[styles.tCell, { color: txt1 }]} numberOfLines={1}>{r.name}</Text>
                  {best && <View style={[styles.rankBadge, { backgroundColor: '#FFD16620', borderColor: '#FFD16650' }]}><Text style={[styles.rankTxt, { color: '#FFD166' }]}>MAX</Text></View>}
                  {worst && <View style={[styles.rankBadge, { backgroundColor: '#85C1E920', borderColor: '#85C1E950' }]}><Text style={[styles.rankTxt, { color: '#85C1E9' }]}>MIN</Text></View>}
                </View>
                <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{fmtIL(r.current)}</Text>
                <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{fmtVL(r.voltage)}</Text>
                <Text style={[styles.tCell, styles.tColV, { color: txt2 }]}>{fmtP(r.power)}</Text>
              </View>
            );
          })}
          {/* Total */}
          <View style={[styles.tableRow, styles.totalRow, { backgroundColor: accentColor + '0A' }]}>
            <Text style={[styles.tH, styles.tColN, { color: accentColor }]}>Total</Text>
            <Text style={[styles.tH, styles.tColV, { color: accentColor }]}>{fmtIL(results.totalI)}</Text>
            <Text style={[styles.tH, styles.tColV, { color: accentColor }]}>{fmtVL(V)}</Text>
            <Text style={[styles.tH, styles.tColV, { color: accentColor }]}>{fmtP(results.totalP)}</Text>
          </View>

          {/* Wire loss (scientist mode) */}
          {scientistMode && wireRes > 0 && (
            <View style={[styles.wireLoss, { borderColor: '#FF6B9D30', backgroundColor: '#FF6B9D08' }]}>
              <Icon name="info" size={12} color="#FF6B9D" />
              <Text style={[styles.wireLossTxt, { color: '#FF6B9D' }]}>
                Wire loss: {fmtP(results.totalI * results.totalI * wireRes)} ({wireRes}Ω wire)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Laws Verification Panel ──────── */}
      {showInsights && results?.laws && (
        <View style={[styles.lawsBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '06' }]}>
          <View style={styles.lawsHeader}>
            <Icon name="book" size={16} color={accentColor} />
            <Text style={[styles.lawsTitle, { color: txt1 }]}>Electrical Laws Verified</Text>
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

      {/* ── Fun Fact ──────────────────────── */}
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
        opacity: challengeAnim,
        transform: [
          { translateY: challengeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          { scale: challengeAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.05, 1] }) },
        ],
      }]}>
        <Icon name="trophy" size={18} color={accentColor} />
        <Text style={[styles.challengePopTxt, { color: accentColor }]}>{lastChallengeMsg}</Text>
      </Animated.View>

      {/* ── Challenge panel ─────────────────── */}
      <TouchableOpacity onPress={() => { soundTap(); setShowChallenges(v => !v); }}
        style={[styles.challengeToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={styles.challengeTogInner}>
          <Icon name="target" size={14} color={accentColor} />
          <Text style={[styles.challengeTogTxt, { color: txt1 }]}>Challenges ({completedChallenges.length}/{CHALLENGES.length})</Text>
          <View style={[styles.challengeBar, { backgroundColor: glass2 }]}>
            <View style={[styles.challengeBarFill, { width: `${(completedChallenges.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Icon name={showChallenges ? 'close' : 'forward'} size={12} color={txtM} />
        </View>
      </TouchableOpacity>
      {showChallenges && CHALLENGES.map(ch => {
        const done = completedChallenges.includes(ch.id);
        return (
          <View key={ch.id} style={[styles.challengeItem, { borderColor: done ? ch.color + '40' : border, backgroundColor: done ? ch.color + '0A' : glass1 }]}>
            <View style={[styles.challengeIcoWrap, { backgroundColor: (done ? ch.color : txtM) + '18' }]}>
              <Icon name={ch.icon} size={14} color={done ? ch.color : txtM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.challengeN, { color: done ? txt1 : txtM }]}>{ch.title}</Text>
              <Text style={[styles.challengeD, { color: done ? txt2 : txtM }]}>{ch.desc}</Text>
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

  // Topology cards
  topoCard: {
    alignItems: 'center', gap: 4,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: RADIUS.md, borderWidth: 1, minWidth: 88,
  },
  topoIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  topoName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  topoSlots: { fontFamily: FONTS.body, fontSize: 9 },

  // Sim canvas
  simBox: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.xs, position: 'relative' },
  electron: {
    position: 'absolute', width: 7, height: 7, borderRadius: 3.5,
    shadowOpacity: 0.9, shadowRadius: 5, elevation: 4, top: -3.5, left: -3.5,
  },
  impactRing: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2,
    top: SIM_H / 2 - 30, left: SIM_W / 2 - 30,
  },
  particle: {
    position: 'absolute', width: 4, height: 4, borderRadius: 2,
    top: SIM_H / 2 - 2, left: SIM_W / 2 - 2,
  },
  runOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  runOverlayTxt: { fontFamily: FONTS.displayMedium, fontSize: 14, letterSpacing: 1 },

  // Placed component overlays
  placedWrap: { position: 'absolute', width: 44, height: 52, alignItems: 'center' },
  placedBox: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  placedLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginTop: 1 },

  // Empty slot touch targets
  emptyTouch: {
    position: 'absolute', width: 44, height: 44, borderRadius: 12, borderWidth: 1,
  },

  // Palette
  paletteCard: {
    alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: RADIUS.md, borderWidth: 1, minWidth: 72,
  },
  paletteIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  paletteName: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  paletteR: { fontFamily: FONTS.body, fontSize: 9 },
  paletteSelDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  // Hint
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: RADIUS.md, padding: 10,
  },
  hintText: { fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 17 },

  // Section labels
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, marginBottom: 6 },
  sectionLabelTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },

  // Presets
  scroll: { marginBottom: SPACING.xs },
  scrollInner: { gap: 8, paddingRight: SPACING.md },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  presetTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  fillTrack: { height: 3, borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  fillBar: { height: 3, borderRadius: 2 },

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

  // Insights / results table
  insightsBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.sm },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  insightsTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5 },
  tableHead: { paddingVertical: 6 },
  totalRow: { borderBottomWidth: 0, borderRadius: RADIUS.sm, marginTop: 4, paddingHorizontal: 8 },
  tH: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  tCell: { fontFamily: FONTS.body, fontSize: 10 },
  tColN: { flex: 1.4 },
  tColV: { flex: 1, textAlign: 'right' },
  rankBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1, marginLeft: 4 },
  rankTxt: { fontFamily: FONTS.bodyMedium, fontSize: 7 },
  wireLoss: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: RADIUS.sm, padding: 8, marginTop: 8 },
  wireLossTxt: { fontFamily: FONTS.body, fontSize: 11, flex: 1 },

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
  challengePopup: {
    position: 'absolute', top: 10, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, zIndex: 999,
  },
  challengePopTxt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  challengeToggle: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginTop: SPACING.sm },
  challengeTogInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeTogTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  challengeBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  challengeBarFill: { height: 4, borderRadius: 2 },
  challengeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 6 },
  challengeIcoWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  challengeN: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  challengeD: { fontFamily: FONTS.body, fontSize: 10 },
});
