// ─────────────────────────────────────────────────────────────
//  LAB: Ancient Civilizations — Empire Explorer
//
//  MODE 1 — Empire Map: territory ellipses that grow/shrink per era
//  MODE 2 — Rise & Fall: power-curve chart across all eras
//  MODE 3 — Wars & Battles: historical battles on the map
//  MODE 4 — Match Game: achievement quiz (RN Views, no SVG cards)
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import Svg, {
  Circle, Line, Text as SvgText, Rect, Path,
  Defs, RadialGradient, LinearGradient as SvgLG, Stop, Ellipse,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width: W_SCREEN } = Dimensions.get('window');
const SIM_W = W_SCREEN - SPACING.md * 4;
const SIM_H = 300;

// ══════════════════════════════════════════════════════════
//  CIVILIZATION BASE DATA
// ══════════════════════════════════════════════════════════

const CIVS = [
  { id: 'mesopotamia', name: 'Mesopotamia',  short: 'Mesop.',  color: '#FF9F1C', icon: 'construction', mapX: 0.56, mapY: 0.38 },
  { id: 'egypt',       name: 'Ancient Egypt', short: 'Egypt',   color: '#FFD166', icon: 'sparkle',      mapX: 0.46, mapY: 0.52 },
  { id: 'indus',       name: 'Indus Valley',  short: 'Indus',   color: '#4ECDC4', icon: 'water',        mapX: 0.68, mapY: 0.44 },
  { id: 'china',       name: 'Ancient China', short: 'China',   color: '#FF6B9D', icon: 'flag',         mapX: 0.86, mapY: 0.30 },
  { id: 'greece',      name: 'Ancient Greece',short: 'Greece',  color: '#6C63FF', icon: 'balance',      mapX: 0.44, mapY: 0.26 },
  { id: 'rome',        name: 'Roman Empire',  short: 'Rome',    color: '#C3B1E1', icon: 'shield',       mapX: 0.36, mapY: 0.22 },
  { id: 'maya',        name: 'Maya',          short: 'Maya',    color: '#00E5A0', icon: 'star',         mapX: 0.12, mapY: 0.46 },
  { id: 'persia',      name: 'Persian Empire',short: 'Persia',  color: '#FF6B6B', icon: 'globe',        mapX: 0.62, mapY: 0.34 },
];

const civById = (id) => CIVS.find(c => c.id === id);

// ══════════════════════════════════════════════════════════
//  ERAS — who ruled, where, with how much power (1-10)
// ══════════════════════════════════════════════════════════

const ERAS = [
  {
    year: -3500, label: '3500 BCE', title: 'Dawn of Civilization',
    desc: 'First cities appear between the Tigris and Euphrates. Writing is invented.',
    civs: {
      mesopotamia: { power: 3, ruler: 'Sumerian city-states (Ur, Uruk)', event: 'Cuneiform writing & wheel invented' },
    },
  },
  {
    year: -2500, label: '2500 BCE', title: 'Age of Pyramids',
    desc: 'Three great river civilizations thrive simultaneously — worlds apart.',
    civs: {
      mesopotamia: { power: 7, ruler: 'Sargon of Akkad', event: 'First empire in human history' },
      egypt:       { power: 9, ruler: 'Pharaoh Khufu (4th Dynasty)', event: 'Great Pyramid of Giza built' },
      indus:       { power: 7, ruler: 'Unknown council-based', event: 'Mohenjo-daro reaches 40,000 pop.' },
    },
  },
  {
    year: -1500, label: '1500 BCE', title: 'Bronze Age Powers',
    desc: "Egypt's New Kingdom reaches its peak. Shang Dynasty rises in China.",
    civs: {
      mesopotamia: { power: 5, ruler: 'Kassite Babylonia', event: 'Recovering from Hittite invasion' },
      egypt:       { power: 10, ruler: 'Hatshepsut → Thutmose III', event: "Egypt's Golden Age (New Kingdom)" },
      indus:       { power: 2, ruler: 'Declining cities', event: 'Severe drought → cities abandoned' },
      china:       { power: 4, ruler: 'Shang Dynasty', event: 'Oracle bones, bronze casting begins' },
      maya:        { power: 2, ruler: 'Early settlements', event: 'Pre-Classic farming communities' },
    },
  },
  {
    year: -1000, label: '1000 BCE', title: 'Iron Age Begins',
    desc: 'Assyria becomes the most feared military. Greek city-states start forming.',
    civs: {
      mesopotamia: { power: 9, ruler: 'Neo-Assyrian Empire', event: 'Most feared army in the ancient world' },
      egypt:       { power: 5, ruler: 'Third Intermediate Period', event: 'Kingdom splits into rival factions' },
      china:       { power: 6, ruler: 'Western Zhou Dynasty', event: 'Mandate of Heaven concept created' },
      greece:      { power: 3, ruler: 'Dark Age ending', event: 'Greek alphabet being developed' },
      maya:        { power: 3, ruler: 'Olmec cultural influence', event: 'First monumental architecture' },
    },
  },
  {
    year: -500, label: '500 BCE', title: 'Classical Age',
    desc: 'Persia controls 44% of world. Democracy born in Athens. Confucius teaches.',
    civs: {
      mesopotamia: { power: 1, ruler: 'Under Persian rule', event: 'Absorbed into the Persian Empire' },
      egypt:       { power: 4, ruler: 'Late Period pharaohs', event: 'Under frequent foreign pressure' },
      china:       { power: 6, ruler: 'Warring States begins', event: 'Confucius, Sun Tzu, Laozi all alive' },
      greece:      { power: 8, ruler: 'Athens & Sparta', event: 'Democracy, philosophy, Olympics' },
      persia:      { power: 10, ruler: 'Darius I the Great', event: '44% of world pop., Royal Road built' },
      rome:        { power: 3, ruler: 'Early Roman Republic', event: 'Republic established 509 BCE' },
      maya:        { power: 4, ruler: 'Late Pre-Classic', event: 'El Mirador great city flourishes' },
    },
  },
  {
    year: -250, label: '250 BCE', title: 'Empire Builders',
    desc: 'Alexander conquered Persia. Rome expands. Qin Shi Huang unifies China.',
    civs: {
      egypt:  { power: 3, ruler: 'Ptolemaic Dynasty (Greek rulers)', event: "Cleopatra's ancestors now rule" },
      china:  { power: 9, ruler: 'Qin Shi Huang → early Han', event: 'China unified, Great Wall begun' },
      greece: { power: 5, ruler: 'Hellenistic kingdoms', event: "Alexander's empire has fractured" },
      rome:   { power: 7, ruler: 'Roman Republic expands', event: 'Punic Wars vs Carthage begin' },
      maya:   { power: 5, ruler: 'Late Pre-Classic peak', event: 'Large cities growing rapidly' },
    },
  },
  {
    year: 1, label: '1 CE', title: 'Two Super-Empires',
    desc: 'Rome and Han China dominate East and West. Connected by the Silk Road.',
    civs: {
      china: { power: 9, ruler: 'Han Dynasty (Emperor Wu)', event: 'Silk Road active, paper spreading' },
      rome:  { power: 10, ruler: 'Emperor Augustus', event: 'Pax Romana: 200 years of peace begin' },
      maya:  { power: 6, ruler: 'Early Classic cities', event: 'Tikal urbanizing rapidly' },
    },
  },
  {
    year: 250, label: '250 CE', title: 'Shifting Powers',
    desc: 'Rome shows cracks. Maya reaches its golden age. China enters civil war.',
    civs: {
      china: { power: 4, ruler: 'Three Kingdoms (Wei, Shu, Wu)', event: 'Civil war splits the empire' },
      rome:  { power: 6, ruler: 'Crisis of the 3rd Century', event: 'Barbarian raids increasing' },
      maya:  { power: 9, ruler: 'Classic Period peak', event: 'Tikal, Palenque, Copán thrive' },
    },
  },
  {
    year: 500, label: '500 CE', title: 'End of an Era',
    desc: 'Western Rome has fallen. Dark Ages begin in Europe. Maya still powerful.',
    civs: {
      china: { power: 3, ruler: 'Southern & Northern Dynasties', event: 'Buddhism spreading widely' },
      rome:  { power: 1, ruler: 'Eastern Roman (Byzantine) only', event: 'Western Empire fell 476 CE' },
      maya:  { power: 8, ruler: 'Classic Period cities', event: 'Over 40 city-states still active' },
    },
  },
];

// ══════════════════════════════════════════════════════════
//  WARS — historically accurate battles
// ══════════════════════════════════════════════════════════

const WARS = [
  { year: -1274, name: 'Battle of Kadesh',      a: 'egypt',  b: 'mesopotamia', winner: 'draw',
    desc: 'Ramesses II vs Hittites — largest chariot battle ever. Led to the first peace treaty in history!',
    soldiers: '~50,000 total', locX: 0.51, locY: 0.34 },
  { year: -539, name: 'Fall of Babylon',         a: 'persia', b: 'mesopotamia', winner: 'persia',
    desc: 'Cyrus the Great conquers Babylon without a fight. Issues the Cyrus Cylinder — first human rights.',
    soldiers: 'Bloodless conquest', locX: 0.56, locY: 0.38 },
  { year: -490, name: 'Battle of Marathon',      a: 'persia', b: 'greece', winner: 'greece',
    desc: '10,000 Athenians defeat 25,000 Persians. Pheidippides runs 42 km to Athens — the first marathon!',
    soldiers: '35,000 total', locX: 0.46, locY: 0.28 },
  { year: -480, name: 'Thermopylae & Salamis',   a: 'persia', b: 'greece', winner: 'greece',
    desc: '300 Spartans delay 100,000+ Persians at the pass. Then Greek navy destroys Persian fleet at Salamis.',
    soldiers: '~300 vs 100,000+', locX: 0.45, locY: 0.27 },
  { year: -331, name: 'Battle of Gaugamela',     a: 'greece', b: 'persia', winner: 'greece',
    desc: 'Alexander the Great (47,000) defeats Darius III (100,000+). Persian Empire falls forever.',
    soldiers: '~150,000 total', locX: 0.57, locY: 0.36 },
  { year: -146, name: 'Conquest of Greece',       a: 'rome',   b: 'greece', winner: 'rome',
    desc: 'Rome conquers Greece. But "captured Greece captured Rome" — Greece transforms Roman culture forever.',
    soldiers: 'Roman legions', locX: 0.44, locY: 0.26 },
  { year: -31,  name: 'Battle of Actium',        a: 'rome',   b: 'egypt', winner: 'rome',
    desc: 'Octavian defeats Mark Antony & Cleopatra VII. Egypt becomes a Roman province. Last pharaoh dies.',
    soldiers: '~400 ships vs 230', locX: 0.45, locY: 0.34 },
  { year: 476,  name: 'Fall of Western Rome',    a: 'rome',   b: 'rome', winner: null,
    desc: 'Germanic chief Odoacer deposes last Emperor Romulus. 1,000 years of Roman civilization ends.',
    soldiers: 'Collapse', locX: 0.38, locY: 0.22 },
];

// ══════════════════════════════════════════════════════════
//  MATCH ITEMS (20 achievements → civilization)
// ══════════════════════════════════════════════════════════

const MATCH_ITEMS = [
  { q: 'Invented the wheel', a: 'mesopotamia' },
  { q: 'Built the Great Pyramid of Giza', a: 'egypt' },
  { q: 'Created the first law code (Hammurabi)', a: 'mesopotamia' },
  { q: 'Invented democracy', a: 'greece' },
  { q: 'Built 400,000 km of roads', a: 'rome' },
  { q: 'Invented paper (105 CE)', a: 'china' },
  { q: 'Independently discovered zero', a: 'maya' },
  { q: 'Built first planned cities with drainage', a: 'indus' },
  { q: 'First human rights declaration (Cyrus)', a: 'persia' },
  { q: 'Created the Olympic Games', a: 'greece' },
  { q: 'Developed hieroglyphic writing', a: 'egypt' },
  { q: 'Built the 21,000 km Great Wall', a: 'china' },
  { q: 'Invented the 365-day calendar', a: 'egypt' },
  { q: 'Created concrete lasting 2000+ years', a: 'rome' },
  { q: 'Invented silk production', a: 'china' },
  { q: 'Created the first postal system', a: 'persia' },
  { q: 'Used base-60 number system', a: 'mesopotamia' },
  { q: 'Predicted eclipses with 99.9% accuracy', a: 'maya' },
  { q: 'Proved a² + b² = c²', a: 'greece' },
  { q: 'Standardized bricks across 1500 km (4:2:1)', a: 'indus' },
];

// ══════════════════════════════════════════════════════════
//  MODES + CHALLENGES
// ══════════════════════════════════════════════════════════

const MODES = [
  { id: 'map',   name: 'Empire Map',  icon: 'globe',  color: '#D4A74A' },
  { id: 'rise',  name: 'Rise & Fall', icon: 'chart',  color: '#6C63FF' },
  { id: 'wars',  name: 'Wars',        icon: 'shield', color: '#FF6B6B' },
  { id: 'match', name: 'Match Game',  icon: 'target', color: '#00E5A0' },
];

const CHALLENGES = [
  { id: 'explore_5',  title: 'Explorer',         desc: 'View 5 different empires on the map', icon: 'globe',   color: '#D4A74A' },
  { id: 'all_eras',   title: 'Time Traveler',     desc: 'Visit all 9 eras',                   icon: 'clock',   color: '#6C63FF' },
  { id: 'find_peak',  title: 'History Detective',  desc: 'Find an era with 7 active empires',  icon: 'search',  color: '#FFD166' },
  { id: 'war_buff',   title: 'War Historian',      desc: 'Read all 8 battles',                 icon: 'shield',  color: '#FF6B6B' },
  { id: 'match_10',   title: 'Achievement Hunter', desc: 'Match 10 achievements correctly',    icon: 'target',  color: '#00E5A0' },
  { id: 'match_all',  title: 'Grand Master',       desc: 'Score 20/20 in Match Game',          icon: 'trophy',  color: '#FF9F1C' },
  { id: 'perfect_5',  title: 'Perfect Streak',     desc: '5 correct matches in a row',         icon: 'star',    color: '#C3B1E1' },
  { id: 'scholar',    title: 'Ancient Scholar',     desc: 'Complete all other challenges',      icon: 'sparkle', color: '#4ECDC4' },
];

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════

function fmtYear(y) { return y <= 0 ? `${Math.abs(y)} BCE` : `${y} CE`; }
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// continent shapes (simplified ancient world)
function landPaths(W, H) {
  return [
    `M${W*.32} ${H*.08}L${W*.50} ${H*.06}L${W*.52} ${H*.18}L${W*.48} ${H*.28}L${W*.38} ${H*.30}L${W*.32} ${H*.20}Z`, // Europe
    `M${W*.36} ${H*.32}L${W*.52} ${H*.32}L${W*.56} ${H*.56}L${W*.50} ${H*.76}L${W*.42} ${H*.78}L${W*.36} ${H*.58}Z`, // Africa
    `M${W*.52} ${H*.06}L${W*.94} ${H*.10}L${W*.96} ${H*.42}L${W*.88} ${H*.56}L${W*.70} ${H*.58}L${W*.56} ${H*.46}L${W*.52} ${H*.28}Z`, // Asia
    `M${W*.04} ${H*.08}L${W*.20} ${H*.06}L${W*.24} ${H*.30}L${W*.20} ${H*.54}L${W*.14} ${H*.70}L${W*.06} ${H*.50}L${W*.04} ${H*.26}Z`, // Americas
  ];
}

// Power-curve chart helpers
const CH_L = 45, CH_R_PAD = 10, CH_TOP = 35, CH_BOT = SIM_H - 25;
const CH_H = CH_BOT - CH_TOP;

function eraX(idx, total, w) { return CH_L + (idx / (total - 1)) * (w - CH_L - CH_R_PAD); }
function powerY(p) { return CH_BOT - (p / 10) * CH_H; }

// ══════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════

export default function AncientCivilizationsLab({
  scientistMode = false,
  accentColor   = '#D4A74A',
}) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const landFill = isDark ? '#151828' : '#E0E2F0';
  const oceanBg  = isDark ? '#0A0C18' : '#EDF0FF';
  const wire     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  // ── State ──────────────────────────────────
  const [modeIdx, setModeIdx]     = useState(0);
  const [eraIdx, setEraIdx]       = useState(4);        // start at 500 BCE (classical age)
  const [selCivId, setSelCivId]   = useState(null);     // tapped territory
  const [selWarIdx, setSelWarIdx] = useState(null);      // tapped war

  // Rise & Fall — highlighted civs
  const [hlCivs, setHlCivs]       = useState(new Set(['rome', 'egypt', 'china']));

  // Match state
  const [matchQ, setMatchQ]       = useState(() => shuffleArr(MATCH_ITEMS));
  const [mIdx, setMIdx]           = useState(0);
  const [mScore, setMScore]       = useState(0);
  const [mStreak, setMStreak]     = useState(0);
  const [mBest, setMBest]         = useState(0);
  const [mResult, setMResult]     = useState(null);     // null | 'correct' | 'wrong'
  const [mDone, setMDone]         = useState(false);

  // Tracking
  const [civsViewed, setCivsViewed] = useState(new Set());
  const [erasVisited, setErasVisited] = useState(new Set([4]));
  const [warsRead, setWarsRead]     = useState(new Set());
  const [completedCh, setCompletedCh] = useState([]);
  const [lastChMsg, setLastChMsg]     = useState(null);
  const [showCh, setShowCh]           = useState(false);
  const [runCount, setRunCount]       = useState(0);

  // Animation
  const chAnim    = useRef(new Animated.Value(0)).current;
  const fadeSvg   = useRef(new Animated.Value(1)).current;

  // ── Derived ────────────────────────────────
  const mode       = MODES[modeIdx];
  const era        = ERAS[eraIdx];
  const activeCivs = Object.keys(era.civs);
  const curMatch   = matchQ[mIdx] || null;
  const matchOpts  = useMemo(() => {
    if (!curMatch) return [];
    const correct = civById(curMatch.a);
    const others = shuffleArr(CIVS.filter(c => c.id !== curMatch.a)).slice(0, 3);
    return shuffleArr([correct, ...others]);
  }, [mIdx, matchQ]);

  // ── Handlers ───────────────────────────────
  const switchMode = (i) => {
    soundTap(); Haptics.selectionAsync();
    setModeIdx(i); setSelCivId(null); setSelWarIdx(null);
    Animated.sequence([
      Animated.timing(fadeSvg, { toValue: 0.4, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeSvg, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const pickEra = (i) => {
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEraIdx(i); setSelCivId(null); setRunCount(c => c + 1);
    const updated = new Set([...erasVisited, i]);
    setErasVisited(updated);
    if (updated.size >= ERAS.length && !completedCh.includes('all_eras')) unlockCh('all_eras');
    const count = Object.keys(ERAS[i].civs).length;
    if (count >= 7 && !completedCh.includes('find_peak')) unlockCh('find_peak');
  };

  const tapTerritory = (civId) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelCivId(civId === selCivId ? null : civId); setRunCount(c => c + 1);
    const updated = new Set([...civsViewed, civId]);
    setCivsViewed(updated);
    if (updated.size >= 5 && !completedCh.includes('explore_5')) unlockCh('explore_5');
  };

  const toggleHlCiv = (civId) => {
    soundTap(); Haptics.selectionAsync();
    const next = new Set(hlCivs);
    if (next.has(civId)) next.delete(civId); else next.add(civId);
    setHlCivs(next);
  };

  const tapWar = (i) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelWarIdx(selWarIdx === i ? null : i); setRunCount(c => c + 1);
    const updated = new Set([...warsRead, i]);
    setWarsRead(updated);
    if (updated.size >= WARS.length && !completedCh.includes('war_buff')) unlockCh('war_buff');
  };

  const answerMatch = (civId) => {
    if (mResult) return;
    const correct = curMatch.a === civId;
    setMResult(correct ? 'correct' : 'wrong');
    setRunCount(c => c + 1);
    if (correct) {
      setMScore(s => s + 1); const ns = mStreak + 1; setMStreak(ns);
      if (ns > mBest) setMBest(ns);
      soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (ns >= 5 && !completedCh.includes('perfect_5')) unlockCh('perfect_5');
      const newScore = mScore + 1;
      if (newScore >= 10 && !completedCh.includes('match_10')) unlockCh('match_10');
      if (newScore >= 20 && !completedCh.includes('match_all')) unlockCh('match_all');
    } else {
      setMStreak(0); soundTap(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      setMResult(null);
      if (mIdx + 1 >= matchQ.length) setMDone(true); else setMIdx(i => i + 1);
    }, 1400);
  };

  const resetMatch = () => {
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMatchQ(shuffleArr(MATCH_ITEMS)); setMIdx(0); setMScore(0); setMStreak(0); setMDone(false); setMResult(null);
  };

  const unlockCh = (id) => {
    if (completedCh.includes(id)) return;
    const next = [...completedCh, id];
    setCompletedCh(next); setLastChMsg(CHALLENGES.find(c => c.id === id)?.title);
    soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(chAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(chAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    if (next.length >= CHALLENGES.length - 1 && !next.includes('scholar')) {
      setTimeout(() => unlockCh('scholar'), 2200);
    }
  };

  // ── Fun fact ───────────────────────────────
  const funFact = (() => {
    if (mode.id === 'map') {
      const n = activeCivs.length;
      if (n >= 6) return `Incredible! ${n} civilizations coexisted in ${era.label} — yet most had no idea the others existed!`;
      if (selCivId && era.civs[selCivId]) return `${era.civs[selCivId].event} — Power level: ${era.civs[selCivId].power}/10`;
      return era.desc;
    }
    if (mode.id === 'wars' && selWarIdx !== null) return WARS[selWarIdx].desc;
    if (mode.id === 'match') return mDone ? `Final: ${mScore}/${matchQ.length}  |  Best streak: ${mBest}` : `Score: ${mScore}  |  Streak: ${mStreak}  |  Best: ${mBest}`;
    return 'Explore the rise and fall of 8 ancient civilizations across 4,000 years!';
  })();

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  return (
    <View style={s.root}>

      {/* ── Mode Tabs ─────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity key={m.id} onPress={() => switchMode(i)}
            style={[s.tab, { borderColor: modeIdx === i ? m.color + '80' : border, backgroundColor: modeIdx === i ? m.color + '12' : glass1 }]}>
            <Icon name={m.icon} size={16} color={modeIdx === i ? m.color : txtM} />
            <Text style={[s.tabTxt, { color: modeIdx === i ? txt1 : txtM }]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SVG CANVAS (Map, Rise & Fall, Wars) ── */}
      {mode.id !== 'match' && (
        <Animated.View style={[s.canvas, { borderColor: border, backgroundColor: oceanBg, opacity: fadeSvg }]}>
          <Svg width={SIM_W} height={SIM_H}>
            <Defs>
              <SvgLG id="bgG" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isDark ? '#0D0E18' : '#F0F2FF'} />
                <Stop offset="1" stopColor={isDark ? '#060810' : '#E4E8FF'} />
              </SvgLG>
              {CIVS.map(c => (
                <RadialGradient key={`rg${c.id}`} id={`rg${c.id}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={c.color} stopOpacity="0.6" />
                  <Stop offset="1" stopColor={c.color} stopOpacity="0" />
                </RadialGradient>
              ))}
            </Defs>
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} fill="url(#bgG)" />

            {/* ── EMPIRE MAP ── */}
            {mode.id === 'map' && (
              <>
                {/* Continents */}
                {landPaths(SIM_W, SIM_H).map((d, i) => (
                  <Path key={`land${i}`} d={d} fill={landFill} stroke={wire} strokeWidth={0.8} />
                ))}

                {/* Era title badge */}
                <Rect x={8} y={6} width={SIM_W - 16} height={24} rx={8} fill={accentColor} fillOpacity={0.06}
                  stroke={accentColor} strokeOpacity={0.15} strokeWidth={0.8} />
                <SvgText x={14} y={22} fontSize="9" fill={accentColor} fontWeight="bold">{era.label}</SvgText>
                <SvgText x={SIM_W - 14} y={22} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.8)">{era.title}</SvgText>

                {/* Territory ellipses */}
                {CIVS.map(c => {
                  const info = era.civs[c.id];
                  if (!info) return null;
                  const cx = SIM_W * c.mapX, cy = SIM_H * c.mapY;
                  const pw = info.power;
                  const rx = 8 + pw * 2.5, ry = 6 + pw * 1.8;
                  const isSel = selCivId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      {/* Glow */}
                      {isSel && <Circle cx={cx} cy={cy} r={rx + 8} fill={`url(#rg${c.id})`} />}
                      {/* Territory zone */}
                      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry}
                        fill={c.color} fillOpacity={isSel ? 0.35 : 0.18}
                        stroke={c.color} strokeWidth={isSel ? 2 : 1} strokeOpacity={isSel ? 0.9 : 0.45} />
                      {/* Label */}
                      <SvgText x={cx} y={cy - ry - 4} textAnchor="middle"
                        fontSize={isSel ? 9 : 7} fill={isSel ? c.color : txtM}
                        fontWeight={isSel ? 'bold' : 'normal'}>{c.short}</SvgText>
                      {/* Power badge */}
                      <Circle cx={cx} cy={cy} r={isSel ? 10 : 7} fill={c.color} fillOpacity={0.85} />
                      <SvgText x={cx} y={cy + (isSel ? 4 : 3)} textAnchor="middle"
                        fontSize={isSel ? 10 : 7} fill="#fff" fontWeight="bold">{pw}</SvgText>
                    </React.Fragment>
                  );
                })}

                {/* War markers for this era range */}
                {WARS.filter(w => Math.abs(w.year - era.year) < 400).map((w, i) => {
                  const wx = SIM_W * w.locX, wy = SIM_H * w.locY;
                  return (
                    <React.Fragment key={`wm${i}`}>
                      <Line x1={wx - 5} y1={wy - 5} x2={wx + 5} y2={wy + 5} stroke="#FF4444" strokeWidth={1.5} strokeOpacity={0.7} />
                      <Line x1={wx + 5} y1={wy - 5} x2={wx - 5} y2={wy + 5} stroke="#FF4444" strokeWidth={1.5} strokeOpacity={0.7} />
                    </React.Fragment>
                  );
                })}

                {/* Active count */}
                <SvgText x={SIM_W / 2} y={SIM_H - 8} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)">
                  {activeCivs.length} empire{activeCivs.length !== 1 ? 's' : ''} active  •  Numbers = power (1-10)
                </SvgText>
              </>
            )}

            {/* ── RISE & FALL CHART ── */}
            {mode.id === 'rise' && (
              <>
                {/* Grid lines */}
                {[2, 4, 6, 8, 10].map(p => (
                  <React.Fragment key={`gl${p}`}>
                    <Line x1={CH_L} y1={powerY(p)} x2={SIM_W - CH_R_PAD} y2={powerY(p)} stroke={wire} strokeWidth={0.5} />
                    <SvgText x={CH_L - 4} y={powerY(p) + 3} textAnchor="end" fontSize="7" fill={txtM + '60'}>{p}</SvgText>
                  </React.Fragment>
                ))}
                {/* X axis labels */}
                {ERAS.map((e, i) => (
                  <React.Fragment key={`xl${i}`}>
                    <Line x1={eraX(i, ERAS.length, SIM_W)} y1={CH_BOT} x2={eraX(i, ERAS.length, SIM_W)} y2={CH_BOT + 4}
                      stroke={txtM + '40'} strokeWidth={0.5} />
                    <SvgText x={eraX(i, ERAS.length, SIM_W)} y={CH_BOT + 14} textAnchor="middle" fontSize="6" fill={txtM + '60'}>
                      {e.label.replace(' BCE', 'B').replace(' CE', 'C')}
                    </SvgText>
                  </React.Fragment>
                ))}
                {/* Y axis label */}
                <SvgText x={4} y={CH_TOP + CH_H / 2} fontSize="7" fill="rgba(255,255,255,0.6)" transform={`rotate(-90, 4, ${CH_TOP + CH_H / 2})`}>
                  Power
                </SvgText>

                {/* Area fills for highlighted civs */}
                {CIVS.map(c => {
                  const isHl = hlCivs.has(c.id);
                  const pts = ERAS.map((e, i) => ({
                    x: eraX(i, ERAS.length, SIM_W),
                    y: powerY(e.civs[c.id]?.power || 0),
                  }));
                  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
                  const areaPath = linePath + `L${pts[pts.length - 1].x} ${CH_BOT}L${pts[0].x} ${CH_BOT}Z`;
                  return (
                    <React.Fragment key={`rc${c.id}`}>
                      {isHl && <Path d={areaPath} fill={c.color} fillOpacity={0.12} />}
                      <Path d={linePath} fill="none" stroke={c.color}
                        strokeWidth={isHl ? 2.5 : 1} strokeOpacity={isHl ? 0.9 : 0.2}
                        strokeLinejoin="round" />
                    </React.Fragment>
                  );
                })}

                {/* Current era marker */}
                <Line x1={eraX(eraIdx, ERAS.length, SIM_W)} y1={CH_TOP - 5}
                  x2={eraX(eraIdx, ERAS.length, SIM_W)} y2={CH_BOT}
                  stroke={accentColor} strokeWidth={1.5} strokeOpacity={0.6} strokeDasharray="4,3" />
                <Circle cx={eraX(eraIdx, ERAS.length, SIM_W)} cy={CH_TOP - 8} r={4} fill={accentColor} />

                {/* Title */}
                <SvgText x={SIM_W / 2} y={16} textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="bold">
                  Rise & Fall of Ancient Empires
                </SvgText>
              </>
            )}

            {/* ── WARS MAP ── */}
            {mode.id === 'wars' && (
              <>
                {landPaths(SIM_W, SIM_H).map((d, i) => (
                  <Path key={`wl${i}`} d={d} fill={landFill} stroke={wire} strokeWidth={0.8} />
                ))}
                <SvgText x={SIM_W / 2} y={18} textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="bold">
                  Major Battles of the Ancient World
                </SvgText>
                {WARS.map((w, i) => {
                  const wx = SIM_W * w.locX, wy = SIM_H * w.locY;
                  const isSel = selWarIdx === i;
                  const civA = civById(w.a), civB = civById(w.b);
                  return (
                    <React.Fragment key={`wb${i}`}>
                      {isSel && <Circle cx={wx} cy={wy} r={20} fill="#FF4444" fillOpacity={0.12} />}
                      <Circle cx={wx} cy={wy} r={isSel ? 8 : 5} fill={isSel ? '#FF4444' : '#FF6B6B'}
                        fillOpacity={isSel ? 1 : 0.6} stroke="#FF4444" strokeWidth={isSel ? 2 : 0.8} />
                      <SvgText x={wx} y={wy + 3} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">
                        {isSel ? '⚔' : ''}
                      </SvgText>
                      {isSel && (
                        <>
                          <Rect x={wx - 60} y={wy + 14} width={120} height={18} rx={5}
                            fill={isDark ? '#1A1A2E' : '#fff'} fillOpacity={0.9}
                            stroke="#FF4444" strokeOpacity={0.3} strokeWidth={0.8} />
                          <SvgText x={wx} y={wy + 26} textAnchor="middle" fontSize="7" fill="#FF6B6B" fontWeight="bold">
                            {w.name} ({fmtYear(w.year)})
                          </SvgText>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </Svg>

          {/* Tappable overlays: map territories */}
          {mode.id === 'map' && CIVS.map(c => {
            if (!era.civs[c.id]) return null;
            const pw = era.civs[c.id].power;
            const rx = 8 + pw * 2.5;
            return (
              <TouchableOpacity key={`t_${c.id}`} onPress={() => tapTerritory(c.id)}
                style={[s.touchZone, {
                  left: SIM_W * c.mapX - rx - 4, top: SIM_H * c.mapY - rx - 4,
                  width: (rx + 4) * 2, height: (rx + 4) * 2, borderRadius: rx + 4,
                }]} activeOpacity={0.6} />
            );
          })}

          {/* Tappable overlays: war markers */}
          {mode.id === 'wars' && WARS.map((w, i) => (
            <TouchableOpacity key={`tw${i}`} onPress={() => tapWar(i)}
              style={[s.touchZone, {
                left: SIM_W * w.locX - 18, top: SIM_H * w.locY - 18,
                width: 36, height: 36, borderRadius: 18,
              }]} activeOpacity={0.6} />
          ))}
        </Animated.View>
      )}

      {/* ── MATCH GAME (RN Views — no SVG cards) ── */}
      {mode.id === 'match' && (
        <View style={[s.matchBox, { borderColor: border, backgroundColor: glass1 }]}>
          {/* Progress */}
          <View style={s.matchProgress}>
            <View style={[s.matchBar, { backgroundColor: wire }]}>
              <View style={[s.matchBarFill, { width: `${(mIdx / matchQ.length) * 100}%`, backgroundColor: MODES[3].color }]} />
            </View>
            <Text style={[s.matchCount, { color: txtM }]}>{mIdx + (mDone ? 0 : 1)}/{matchQ.length}</Text>
          </View>

          {mDone ? (
            /* Results */
            <View style={s.matchResults}>
              <Text style={[s.matchBigScore, { color: accentColor }]}>{mScore}/{matchQ.length}</Text>
              <Text style={[s.matchGrade, { color: txt1 }]}>
                {mScore >= 18 ? 'Grand Master!' : mScore >= 14 ? 'Excellent!' : mScore >= 10 ? 'Good Work!' : 'Keep Studying!'}
              </Text>
              <Text style={[s.matchStat, { color: txtM }]}>Accuracy: {Math.round(mScore / matchQ.length * 100)}%  |  Best streak: {mBest}</Text>
              <TouchableOpacity onPress={resetMatch} style={[s.replayBtn, { borderColor: MODES[3].color + '60' }]}>
                <Icon name="refresh" size={16} color={MODES[3].color} />
                <Text style={[s.replayTxt, { color: txt1 }]}>Play Again (Reshuffled)</Text>
              </TouchableOpacity>
            </View>
          ) : curMatch ? (
            <>
              {/* Question */}
              <View style={[s.matchQ, { borderColor: accentColor + '25', backgroundColor: accentColor + '08' }]}>
                <Text style={[s.matchQLabel, { color: txtM }]}>Who did this?</Text>
                <Text style={[s.matchQText, { color: txt1 }]}>{curMatch.q}</Text>
              </View>
              {/* Score row */}
              <View style={s.matchScoreRow}>
                <Text style={[s.matchScoreTxt, { color: accentColor }]}>Score: {mScore}</Text>
                {mStreak > 0 && <Text style={[s.matchScoreTxt, { color: '#FFD166' }]}>Streak: {mStreak}</Text>}
              </View>
              {/* 4 option cards */}
              <View style={s.matchGrid}>
                {matchOpts.map(opt => {
                  if (!opt) return null;
                  let bg = opt.color + '10', bc = opt.color + '30', tc = opt.color;
                  if (mResult) {
                    if (opt.id === curMatch.a) { bg = '#00E5A020'; bc = '#00E5A0'; tc = '#00E5A0'; }
                    else { bg = wire; bc = border; tc = txtM; }
                  }
                  return (
                    <TouchableOpacity key={opt.id} onPress={() => answerMatch(opt.id)} disabled={!!mResult}
                      style={[s.matchOpt, { borderColor: bc, backgroundColor: bg }]} activeOpacity={0.7}>
                      <View style={[s.matchOptIco, { backgroundColor: opt.color + '18' }]}>
                        <Icon name={opt.icon} size={18} color={tc} />
                      </View>
                      <Text style={[s.matchOptName, { color: tc }]}>{opt.short}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      )}

      {/* ── ERA SELECTOR (Map + Rise+Fall) ── */}
      {(mode.id === 'map' || mode.id === 'rise') && (
        <>
          <SLabel icon="clock" label="ERA" color={accentColor} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {ERAS.map((e, i) => (
              <TouchableOpacity key={e.year} onPress={() => pickEra(i)}
                style={[s.eraPill, { borderColor: eraIdx === i ? accentColor + '80' : border, backgroundColor: eraIdx === i ? accentColor + '12' : glass1 }]}>
                <Text style={[s.eraPillTxt, { color: eraIdx === i ? txt1 : txtM }]}>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Rise & Fall: civ legend ─────── */}
      {mode.id === 'rise' && (
        <>
          <SLabel icon="chart" label="TOGGLE CIVILIZATIONS" color={MODES[1].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {CIVS.map(c => {
              const isHl = hlCivs.has(c.id);
              return (
                <TouchableOpacity key={c.id} onPress={() => toggleHlCiv(c.id)}
                  style={[s.civLeg, { borderColor: isHl ? c.color + '80' : border, backgroundColor: isHl ? c.color + '12' : glass1 }]}>
                  <View style={[s.civLegDot, { backgroundColor: c.color, opacity: isHl ? 1 : 0.3 }]} />
                  <Text style={[s.civLegName, { color: isHl ? txt1 : txtM }]}>{c.short}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* ── WARS LIST ──────────────────── */}
      {mode.id === 'wars' && (
        <>
          <SLabel icon="shield" label="BATTLES (tap map markers or cards)" color={MODES[2].color} txtM={txtM} />
          {WARS.map((w, i) => {
            const isSel = selWarIdx === i;
            const civA = civById(w.a), civB = w.a !== w.b ? civById(w.b) : null;
            return (
              <TouchableOpacity key={i} onPress={() => tapWar(i)} activeOpacity={0.8}
                style={[s.warCard, { borderColor: isSel ? '#FF6B6B60' : border, backgroundColor: isSel ? '#FF6B6B08' : glass1 }]}>
                <View style={s.warCardTop}>
                  <Text style={[s.warYear, { color: '#FF6B6B' }]}>{fmtYear(w.year)}</Text>
                  <Text style={[s.warName, { color: isSel ? txt1 : txt2 }]} numberOfLines={1}>{w.name}</Text>
                  {w.winner && w.winner !== 'draw' && (
                    <View style={[s.winBadge, { backgroundColor: (civById(w.winner)?.color || '#888') + '18' }]}>
                      <Text style={[s.winTxt, { color: civById(w.winner)?.color || '#888' }]}>
                        {civById(w.winner)?.short} wins
                      </Text>
                    </View>
                  )}
                  {w.winner === 'draw' && (
                    <View style={[s.winBadge, { backgroundColor: '#FFD16618' }]}>
                      <Text style={[s.winTxt, { color: '#FFD166' }]}>Draw</Text>
                    </View>
                  )}
                </View>
                {isSel && (
                  <View style={s.warDetail}>
                    <View style={s.warSides}>
                      <View style={[s.warSide, { borderColor: civA.color + '30' }]}>
                        <Icon name={civA.icon} size={14} color={civA.color} />
                        <Text style={[s.warSideName, { color: civA.color }]}>{civA.name}</Text>
                      </View>
                      <Text style={[s.warVs, { color: txtM }]}>vs</Text>
                      {civB && (
                        <View style={[s.warSide, { borderColor: civB.color + '30' }]}>
                          <Icon name={civB.icon} size={14} color={civB.color} />
                          <Text style={[s.warSideName, { color: civB.color }]}>{civB.name}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[s.warDesc, { color: txt2 }]}>{w.desc}</Text>
                    {scientistMode && <Text style={[s.warSoldiers, { color: txtM }]}>Forces: {w.soldiers}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* ── MAP: selected territory info ── */}
      {mode.id === 'map' && selCivId && era.civs[selCivId] && (() => {
        const c = civById(selCivId), info = era.civs[selCivId];
        return (
          <View style={[s.infoBox, { borderColor: c.color + '40', backgroundColor: c.color + '08' }]}>
            <View style={s.infoHeader}>
              <View style={[s.infoIco, { backgroundColor: c.color + '20' }]}>
                <Icon name={c.icon} size={18} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.infoTitle, { color: txt1 }]}>{c.name}</Text>
                <Text style={[s.infoSub, { color: c.color }]}>{info.ruler}</Text>
              </View>
              <View style={[s.powerCircle, { borderColor: c.color }]}>
                <Text style={[s.powerNum, { color: c.color }]}>{info.power}</Text>
                <Text style={[s.powerLbl, { color: txtM }]}>/10</Text>
              </View>
            </View>
            <Text style={[s.infoEvent, { color: txt2 }]}>{info.event}</Text>
            {/* Power bar */}
            <View style={[s.powerBar, { backgroundColor: glass2 }]}>
              <View style={[s.powerBarFill, { width: `${info.power * 10}%`, backgroundColor: c.color }]} />
            </View>
          </View>
        );
      })()}

      {/* ── Rise & Fall: era info ─────── */}
      {mode.id === 'rise' && (
        <View style={[s.infoBox, { borderColor: border, backgroundColor: glass1 }]}>
          <Text style={[s.infoTitle, { color: txt1, marginBottom: 4 }]}>{era.title} — {era.label}</Text>
          <Text style={[s.infoEvent, { color: txt2 }]}>{era.desc}</Text>
          {activeCivs.length > 0 && (
            <View style={s.riseList}>
              {activeCivs.sort((a, b) => era.civs[b].power - era.civs[a].power).map(id => {
                const c = civById(id), info = era.civs[id];
                return (
                  <View key={id} style={s.riseRow}>
                    <View style={[s.riseDot, { backgroundColor: c.color }]} />
                    <Text style={[s.riseName, { color: hlCivs.has(id) ? txt1 : txtM }]}>{c.short}</Text>
                    <View style={[s.riseMiniBar, { backgroundColor: glass2 }]}>
                      <View style={[s.riseMiniBarFill, { width: `${info.power * 10}%`, backgroundColor: c.color }]} />
                    </View>
                    <Text style={[s.risePow, { color: c.color }]}>{info.power}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── Stats Bar ─────────────────────── */}
      <View style={s.statsRow}>
        <Stat icon="globe" color={accentColor} label="Explored" val={`${civsViewed.size}/8`} t1={txt1} tM={txtM} />
        <Stat icon="clock" color="#6C63FF" label="Eras" val={`${erasVisited.size}/${ERAS.length}`} t1={txt1} tM={txtM} />
        <Stat icon="shield" color="#FF6B6B" label="Battles" val={`${warsRead.size}/${WARS.length}`} t1={txt1} tM={txtM} />
        <Stat icon="target" color="#00E5A0" label="Matched" val={`${mScore}`} t1={txt1} tM={txtM} />
      </View>

      {/* ── Fun Fact ───────────────────────── */}
      <View style={[s.fact, { borderColor: accentColor + '25', backgroundColor: accentColor + '08' }]}>
        <View style={[s.factIco, { backgroundColor: accentColor + '18' }]}>
          <Icon name="lightbulb" size={14} color={accentColor} />
        </View>
        <Text style={[s.factTxt, { color: txt2 }]}>{funFact}</Text>
      </View>

      {/* ── Challenge toast ─────────────── */}
      <Animated.View style={[s.toast, { backgroundColor: accentColor + '18', borderColor: accentColor + '50',
        opacity: chAnim, transform: [{ translateY: chAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }]}>
        <Icon name="trophy" size={16} color={accentColor} />
        <Text style={[s.toastTxt, { color: accentColor }]}>{lastChMsg}</Text>
      </Animated.View>

      {/* ── Challenges ───────────────────── */}
      <TouchableOpacity onPress={() => { soundTap(); setShowCh(v => !v); }}
        style={[s.chToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={s.chToggleInner}>
          <Icon name="target" size={14} color={accentColor} />
          <Text style={[s.chToggleTxt, { color: txt1 }]}>Challenges ({completedCh.length}/{CHALLENGES.length})</Text>
          <View style={[s.chBar, { backgroundColor: glass2 }]}>
            <View style={[s.chBarFill, { width: `${(completedCh.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Icon name={showCh ? 'close' : 'forward'} size={12} color={txtM} />
        </View>
      </TouchableOpacity>
      {showCh && CHALLENGES.map(ch => {
        const done = completedCh.includes(ch.id);
        return (
          <View key={ch.id} style={[s.chItem, { borderColor: done ? ch.color + '40' : border, backgroundColor: done ? ch.color + '0A' : glass1 }]}>
            <View style={[s.chIcoW, { backgroundColor: (done ? ch.color : txtM) + '18' }]}>
              <Icon name={ch.icon} size={14} color={done ? ch.color : txtM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.chN, { color: done ? txt1 : txtM }]}>{ch.title}</Text>
              <Text style={[s.chD, { color: done ? txt2 : txtM }]}>{ch.desc}</Text>
            </View>
            {done && <Icon name="check" size={14} color={ch.color} />}
          </View>
        );
      })}

      {runCount > 0 && (
        <View style={s.cntRow}>
          <Icon name="flask" size={11} color={txtM} />
          <Text style={[s.cntTxt, { color: txtM }]}>{runCount} interaction{runCount > 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function SLabel({ icon, label, color, txtM }) {
  return (
    <View style={s.sLabel}>
      <Icon name={icon} size={11} color={color} />
      <Text style={[s.sLabelTxt, { color: txtM }]}>{label}</Text>
    </View>
  );
}

function Stat({ icon, color, label, val, t1, tM }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={12} color={color} />
      <View>
        <Text style={[s.statVal, { color: t1 }]}>{val}</Text>
        <Text style={[s.statLbl, { color: tM }]}>{label}</Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════

const s = StyleSheet.create({
  root: { gap: SPACING.sm },
  tabRow: { gap: 8, paddingRight: SPACING.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1 },
  tabTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  canvas: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  touchZone: { position: 'absolute' },

  eraPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  eraPillTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  sLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 },
  sLabelTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },

  civLeg: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  civLegDot: { width: 8, height: 8, borderRadius: 4 },
  civLegName: { fontFamily: FONTS.bodyMedium, fontSize: 10 },

  // Match game (RN Views)
  matchBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md },
  matchProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  matchBar: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  matchBarFill: { height: 5, borderRadius: 3 },
  matchCount: { fontFamily: FONTS.body, fontSize: 10 },
  matchQ: { borderRadius: RADIUS.md, borderWidth: 1, padding: 14, marginBottom: 10 },
  matchQLabel: { fontFamily: FONTS.body, fontSize: 10, marginBottom: 4 },
  matchQText: { fontFamily: FONTS.displayMedium, fontSize: 15, lineHeight: 22 },
  matchScoreRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 10 },
  matchScoreTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  matchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matchOpt: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1.5 },
  matchOptIco: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  matchOptName: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  matchResults: { alignItems: 'center', paddingVertical: 20 },
  matchBigScore: { fontFamily: FONTS.displayMedium, fontSize: 36 },
  matchGrade: { fontFamily: FONTS.displayMedium, fontSize: 16, marginTop: 4 },
  matchStat: { fontFamily: FONTS.body, fontSize: 11, marginTop: 6 },
  replayBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: RADIUS.md, borderWidth: 1 },
  replayTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13 },

  // War cards
  warCard: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginBottom: 6 },
  warCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warYear: { fontFamily: FONTS.bodyMedium, fontSize: 10, width: 62 },
  warName: { fontFamily: FONTS.bodyMedium, fontSize: 12, flex: 1 },
  winBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  winTxt: { fontFamily: FONTS.bodyMedium, fontSize: 9 },
  warDetail: { marginTop: 10 },
  warSides: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  warSide: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.md, borderWidth: 1 },
  warSideName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  warVs: { fontFamily: FONTS.displayMedium, fontSize: 11 },
  warDesc: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
  warSoldiers: { fontFamily: FONTS.body, fontSize: 10, marginTop: 6 },

  // Info panel
  infoBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoIco: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  infoSub: { fontFamily: FONTS.body, fontSize: 10, marginTop: 2 },
  infoEvent: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
  powerCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  powerNum: { fontFamily: FONTS.displayMedium, fontSize: 16, marginTop: -2 },
  powerLbl: { fontFamily: FONTS.body, fontSize: 8, marginTop: -3 },
  powerBar: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  powerBarFill: { height: 5, borderRadius: 3 },

  // Rise list
  riseList: { marginTop: 10, gap: 5 },
  riseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  riseDot: { width: 7, height: 7, borderRadius: 4 },
  riseName: { fontFamily: FONTS.bodyMedium, fontSize: 10, width: 44 },
  riseMiniBar: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  riseMiniBarFill: { height: 5, borderRadius: 3 },
  risePow: { fontFamily: FONTS.bodyMedium, fontSize: 10, width: 16, textAlign: 'right' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statVal: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  statLbl: { fontFamily: FONTS.body, fontSize: 9 },

  // Fun fact
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: 12 },
  factIco: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  factTxt: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, flex: 1 },

  // Challenges
  toast: { position: 'absolute', top: 10, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, zIndex: 999 },
  toastTxt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  chToggle: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12 },
  chToggleInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chToggleTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  chBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  chBarFill: { height: 4, borderRadius: 2 },
  chItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 4 },
  chIcoW: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chN: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  chD: { fontFamily: FONTS.body, fontSize: 10 },
  cntRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 4 },
  cntTxt: { fontFamily: FONTS.body, fontSize: 11 },
});
