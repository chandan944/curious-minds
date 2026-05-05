// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  LAB: Brain Structure â€” Brain Explorer Lab (Multi-Mode)
//
//  SUB-CONCEPTS TAUGHT:
//  1. Brain anatomy (lobes, gyri, sulci)         â†’ Brain Map (side/inside)
//  2. Region functions & specialization          â†’ Brain Map (tap regions)
//  3. Neural pathways & signal flow              â†’ Brain Map (pathway anim)
//  4. Brain activity mapping (fMRI-style)        â†’ Activity Scan
//  5. Reaction time & neural processing speed    â†’ Reaction Test (real!)
//  6. Sensory/motor pathway anatomy              â†’ Reaction Test (explainer)
//  7. Brain waves (EEG patterns)                 â†’ Brain Waves (animated)
//  8. Mental states & frequency bands            â†’ Brain Waves (selector)
//  9. Neural conduction velocity                 â†’ Scientist Mode
// 10. Neuroplasticity & synaptic connections     â†’ Challenges + fun facts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import Svg, {
  Circle, Line, Text as SvgText, Rect, Path,
  Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Ellipse,
import Svg, { Rect, Line, Path, Ellipse, Defs, Stop, RadialGradient, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DATA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const REGIONS = [
  { id: 'frontal',    name: 'Frontal Lobe',   color: '#6C63FF', icon: 'brain',    functions: ['Decision making', 'Planning', 'Personality', 'Speech production (Broca)', 'Motor cortex'], fact: 'The frontal lobe is the last to fully develop â€” not until age 25! That\'s why teens take more risks.' },
  { id: 'parietal',   name: 'Parietal Lobe',  color: '#FF9F1C', icon: 'sparkle',  functions: ['Touch/sensation', 'Spatial awareness', 'Navigation', 'Math processing'],  fact: 'London taxi drivers have enlarged parietal lobes from memorizing 25,000 streets!' },
  { id: 'temporal',   name: 'Temporal Lobe',  color: '#4ECDC4', icon: 'waves',    functions: ['Hearing', 'Language comprehension (Wernicke)', 'Memory encoding', 'Emotion processing'], fact: 'Damage to Wernicke\'s area causes fluent but completely meaningless speech!' },
  { id: 'occipital',  name: 'Occipital Lobe', color: '#FF6B9D', icon: 'target',   functions: ['Vision processing', 'Color recognition', 'Visual memory', 'Depth perception'], fact: 'Your occipital lobe processes 10 million bits of visual data per second â€” that\'s 1.25 MB/s!' },
  { id: 'cerebellum', name: 'Cerebellum',     color: '#C3B1E1', icon: 'balance',  functions: ['Balance & coordination', 'Motor learning', 'Posture', 'Timing'],         fact: 'The cerebellum has 50% of all brain neurons despite being only 10% of brain volume!' },
  { id: 'brainstem',  name: 'Brain Stem',     color: '#00E5A0', icon: 'heart',    functions: ['Heartbeat', 'Breathing', 'Sleep/wake cycles', 'Reflexes'],             fact: 'Your brainstem keeps you alive even in a coma â€” it\'s the most ancient part of the brain.' },
  { id: 'hippocampus',name: 'Hippocampus',    color: '#FFD166', icon: 'book',     functions: ['Memory formation', 'Spatial memory', 'Learning', 'Navigation'],        fact: 'Patient H.M. had his hippocampi removed in 1953 â€” he could never form new memories again.' },
  { id: 'amygdala',   name: 'Amygdala',       color: '#FF6B6B', icon: 'fire',     functions: ['Fear response', 'Fight-or-flight', 'Emotional memory', 'Threat detection'], fact: 'Your amygdala triggers fear in just 12 ms â€” before your conscious brain even knows why!' },
];

const ACTIVITIES = [
  { id: 'thinking',  name: 'Thinking Hard',    icon: 'brain',    color: '#6C63FF', active: { frontal: 0.9, parietal: 0.6, hippocampus: 0.4, temporal: 0.2 } },
  { id: 'seeing',    name: 'Seeing',           icon: 'target',   color: '#FF6B9D', active: { occipital: 0.9, parietal: 0.5, temporal: 0.3, frontal: 0.15 } },
  { id: 'talking',   name: 'Talking',          icon: 'waves',    color: '#4ECDC4', active: { frontal: 0.85, temporal: 0.9, cerebellum: 0.3 } },
  { id: 'afraid',    name: 'Feeling Fear',     icon: 'fire',     color: '#FF6B6B', active: { amygdala: 0.95, brainstem: 0.7, frontal: 0.4, hippocampus: 0.3 } },
  { id: 'sleeping',  name: 'Sleeping',         icon: 'moon',     color: '#C3B1E1', active: { brainstem: 0.8, hippocampus: 0.6, temporal: 0.2 } },
  { id: 'playing',   name: 'Playing Sports',   icon: 'zap',      color: '#00E5A0', active: { frontal: 0.5, cerebellum: 0.9, parietal: 0.7, brainstem: 0.3 } },
  { id: 'music',     name: 'Listening to Music',icon: 'headphones',color: '#FFD166', active: { temporal: 0.9, frontal: 0.4, cerebellum: 0.3, amygdala: 0.5 } },
  { id: 'memories',  name: 'Recalling Memory', icon: 'book',     color: '#FF9F1C', active: { hippocampus: 0.95, frontal: 0.6, temporal: 0.5, amygdala: 0.3 } },
];

const BRAIN_WAVES = [
  { id: 'delta', name: 'Delta',   freq: 2,  amp: 1.0,  range: '0.5â€“4 Hz',  color: '#C3B1E1', state: 'Deep dreamless sleep, healing, restoration',     icon: 'moon' },
  { id: 'theta', name: 'Theta',   freq: 6,  amp: 0.75, range: '4â€“8 Hz',    color: '#4ECDC4', state: 'Light sleep, meditation, creativity, dreams',     icon: 'leaf' },
  { id: 'alpha', name: 'Alpha',   freq: 10, amp: 0.55, range: '8â€“13 Hz',   color: '#00E5A0', state: 'Relaxed alertness, calm focus, flow state',       icon: 'sparkle' },
  { id: 'beta',  name: 'Beta',    freq: 20, amp: 0.35, range: '13â€“30 Hz',  color: '#FFD166', state: 'Active thinking, problem-solving, concentration',  icon: 'brain' },
  { id: 'gamma', name: 'Gamma',   freq: 40, amp: 0.2,  range: '30â€“100 Hz', color: '#FF6B9D', state: 'Peak concentration, insight, consciousness binding',icon: 'zap' },
];

const VIEWS = [
  { id: 'side',   name: 'Side View',   icon: 'brain',  color: '#6C63FF' },
  { id: 'inside', name: 'Inside View', icon: 'search', color: '#FF9F1C' },
];

const MODES = [
  { id: 'explore',  name: 'Brain Map',     icon: 'brain',  color: '#6C63FF', desc: 'Tap to explore' },
  { id: 'activity', name: 'fMRI Scan',     icon: 'search', color: '#FF9F1C', desc: 'Activity mapping' },
  { id: 'react',    name: 'Reaction Test', icon: 'zap',    color: '#4ECDC4', desc: 'Test yourself!' },
  { id: 'waves',    name: 'Brain Waves',   icon: 'waves',  color: '#FF6B9D', desc: 'EEG patterns' },
];

const CHALLENGES = [
  { id: 'explore_all',   title: 'Brain Scholar',   desc: 'Explore all 8 brain regions',       icon: 'brain',    color: '#6C63FF' },
  { id: 'fast_react',    title: 'Lightning Reflex', desc: 'Reaction time under 200 ms',        icon: 'zap',      color: '#4ECDC4' },
  { id: 'five_tests',    title: 'Data Collector',   desc: 'Complete 5 reaction tests',         icon: 'chart',    color: '#FF9F1C' },
  { id: 'ten_tests',     title: 'Neuroscientist',   desc: 'Complete 10 reaction tests',        icon: 'flask',    color: '#FF6B9D' },
  { id: 'scan_all',      title: 'fMRI Expert',      desc: 'Try all 8 brain activities',        icon: 'search',   color: '#C3B1E1' },
  { id: 'all_waves',     title: 'Wave Rider',       desc: 'View all 5 brain wave patterns',    icon: 'waves',    color: '#00E5A0' },
  { id: 'sub_150',       title: 'Superhuman!',      desc: 'Reaction time under 150 ms',        icon: 'star',     color: '#FFD166' },
  { id: 'inside_view',   title: 'Deep Diver',       desc: 'Explore inside view of the brain',  icon: 'target',   color: '#FF6B6B' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  BRAIN LAYOUT HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function getRegionLayout(viewId) {
  const W = SIM_W, H = SIM_H;
  if (viewId === 'side') return {
    frontal:     { cx: W * .28, cy: H * .32, rx: W * .13, ry: H * .12, vis: true },
    parietal:    { cx: W * .55, cy: H * .24, rx: W * .11, ry: H * .09, vis: true },
    temporal:    { cx: W * .35, cy: H * .58, rx: W * .11, ry: H * .06, vis: true },
    occipital:   { cx: W * .78, cy: H * .38, rx: W * .07, ry: H * .11, vis: true },
    cerebellum:  { cx: W * .78, cy: H * .65, rx: W * .06, ry: H * .06, vis: true },
    brainstem:   { cx: W * .66, cy: H * .78, rx: W * .035, ry: H * .07, vis: true },
    hippocampus: { cx: W * .48, cy: H * .48, rx: W * .04, ry: H * .025, vis: false },
    amygdala:    { cx: W * .40, cy: H * .52, rx: W * .025, ry: H * .025, vis: false },
  };
  // Inside (medial) view â€” internal structures visible
  return {
    frontal:     { cx: W * .25, cy: H * .30, rx: W * .12, ry: H * .11, vis: true, outline: true },
    parietal:    { cx: W * .55, cy: H * .22, rx: W * .10, ry: H * .08, vis: true, outline: true },
    temporal:    { cx: W * .30, cy: H * .58, rx: W * .09, ry: H * .05, vis: true, outline: true },
    occipital:   { cx: W * .80, cy: H * .35, rx: W * .06, ry: H * .10, vis: true, outline: true },
    cerebellum:  { cx: W * .78, cy: H * .65, rx: W * .06, ry: H * .06, vis: true },
    brainstem:   { cx: W * .66, cy: H * .78, rx: W * .035, ry: H * .07, vis: true },
    hippocampus: { cx: W * .48, cy: H * .50, rx: W * .06, ry: H * .035, vis: true },
    amygdala:    { cx: W * .38, cy: H * .56, rx: W * .04, ry: H * .035, vis: true },
  };
}

function brainOutline(W, H) {
  return `M ${W * .12} ${H * .48} C ${W * .10} ${H * .32}, ${W * .15} ${H * .18}, ${W * .28} ${H * .13} C ${W * .38} ${H * .10}, ${W * .52} ${H * .09}, ${W * .62} ${H * .12} C ${W * .72} ${H * .15}, ${W * .80} ${H * .22}, ${W * .84} ${H * .32} C ${W * .87} ${H * .40}, ${W * .87} ${H * .48}, ${W * .84} ${H * .54} C ${W * .82} ${H * .57}, ${W * .80} ${H * .58}, ${W * .79} ${H * .60} C ${W * .81} ${H * .64}, ${W * .82} ${H * .70}, ${W * .80} ${H * .75} C ${W * .78} ${H * .78}, ${W * .74} ${H * .80}, ${W * .70} ${H * .78} C ${W * .68} ${H * .80}, ${W * .66} ${H * .84}, ${W * .63} ${H * .88} L ${W * .60} ${H * .88} C ${W * .58} ${H * .82}, ${W * .52} ${H * .72}, ${W * .44} ${H * .68} C ${W * .34} ${H * .64}, ${W * .24} ${H * .60}, ${W * .18} ${H * .56} C ${W * .14} ${H * .54}, ${W * .12} ${H * .52}, ${W * .12} ${H * .48} Z`;
}

function centralSulcus(W, H) {
  return `M ${W * .48} ${H * .12} Q ${W * .52} ${H * .30} ${W * .50} ${H * .48}`;
}

function lateralSulcus(W, H) {
  return `M ${W * .48} ${H * .46} Q ${W * .40} ${H * .52} ${W * .26} ${H * .58}`;
}

function brainFolds(W, H) {
  return [
    `M ${W * .20} ${H * .22} Q ${W * .25} ${H * .26} ${W * .22} ${H * .32}`,
    `M ${W * .32} ${H * .16} Q ${W * .36} ${H * .24} ${W * .34} ${H * .30}`,
    `M ${W * .60} ${H * .14} Q ${W * .64} ${H * .20} ${W * .62} ${H * .28}`,
    `M ${W * .72} ${H * .20} Q ${W * .76} ${H * .28} ${W * .74} ${H * .36}`,
    `M ${W * .25} ${H * .38} Q ${W * .22} ${H * .42} ${W * .24} ${H * .46}`,
    `M ${W * .40} ${H * .30} Q ${W * .38} ${H * .36} ${W * .40} ${H * .40}`,
  ];
}

function reactionClassify(ms) {
  if (ms < 150) return { label: 'Superhuman!', emoji: 'âš¡', color: '#FFD166', fact: 'Faster than a striking rattlesnake (200ms)! Your myelinated nerves are elite.' };
  if (ms < 200) return { label: 'Lightning!',  emoji: 'ðŸ†', color: '#00E5A0', fact: 'Fighter pilots average 170ms. You\'re in the top tier of human reflexes!' };
  if (ms < 250) return { label: 'Excellent',   emoji: 'ðŸ”¥', color: '#4ECDC4', fact: 'Right at the human average. Your signal traveled: eye â†’ V1 â†’ motor cortex â†’ hand in a quarter second!' };
  if (ms < 350) return { label: 'Average',     emoji: 'ðŸ’ª', color: '#FF9F1C', fact: 'Normal range. Try when well-rested â€” caffeine can improve reaction time by 10-15%!' };
  return            { label: 'Warming Up',  emoji: 'ðŸ˜´', color: '#C3B1E1', fact: 'A bit slow â€” fatigue and distraction add 50-100ms. The signal took a scenic route through extra synapses!' };
}

const REACTION_PATH = [
  { region: 'occipital',  label: 'V1 detects', delay: '30ms' },
  { region: 'parietal',   label: 'Where?',     delay: '50ms' },
  { region: 'frontal',    label: 'Motor plan',  delay: '100ms' },
  { region: 'cerebellum', label: 'Coordinate',  delay: '20ms' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function BrainStructureLab({
  scientistMode = false,
  accentColor   = '#A855F7',
  onLabBreaker,
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

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [modeIdx, setModeIdx]         = useState(0);
  const [viewIdx, setViewIdx]         = useState(0);
  const [selRegion, setSelRegion]     = useState(null);
  const [actIdx, setActIdx]           = useState(0);
  const [waveIdx, setWaveIdx]         = useState(2);      // Alpha default
  const [wavePhase, setWavePhase]     = useState(0);

  // Reaction test
  const [rtState, setRtState]         = useState('idle');  // idle|waiting|go|early|done
  const [rtTime, setRtTime]           = useState(0);
  const [rtResults, setRtResults]     = useState([]);

  const [pulseVal, setPulseVal]       = useState(0);

  const [runCount, setRunCount]       = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [completedCh, setCompletedCh]   = useState([]);
  const [showCh, setShowCh]             = useState(false);
  const [lastChMsg, setLastChMsg]       = useState(null);
  const [regionsExplored, setRegionsExplored] = useState(new Set());
  const [activitiesScanned, setActivitiesScanned] = useState(new Set());
  const [wavesViewed, setWavesViewed]   = useState(new Set());

  // â”€â”€ Refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const impactRing = useRef(new Animated.Value(0)).current;
  const runBtnSc   = useRef(new Animated.Value(1)).current;
  const chAnim     = useRef(new Animated.Value(0)).current;
  const regionGlow = useRef(new Animated.Value(0)).current;
  const canvasFade = useRef(new Animated.Value(1)).current;

  const signalAnims = useRef(Array.from({ length: 6 }, () => ({
    x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
  }))).current;
  const particleAnims = useRef(Array.from({ length: 10 }, () => ({
    x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
  }))).current;

  const rtTimeout  = useRef(null);
  const rtStartMs  = useRef(0);
  const waveTimer  = useRef(null);
  const pulseTimer = useRef(null);

  // â”€â”€ Effects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => () => {
    if (rtTimeout.current) clearTimeout(rtTimeout.current);
    if (waveTimer.current) clearInterval(waveTimer.current);
    if (pulseTimer.current) clearInterval(pulseTimer.current);
  }, []);

  // Brain wave animation
  useEffect(() => {
    if (mode.id === 'waves') {
      waveTimer.current = setInterval(() => setWavePhase(p => p + 0.12), 40);
    } else {
      if (waveTimer.current) { clearInterval(waveTimer.current); waveTimer.current = null; }
    }
    return () => { if (waveTimer.current) clearInterval(waveTimer.current); };
  }, [modeIdx]);

  // Activity pulse
  useEffect(() => {
    if (mode.id === 'activity') {
      pulseTimer.current = setInterval(() => setPulseVal(p => p + 0.06), 40);
    } else {
      if (pulseTimer.current) { clearInterval(pulseTimer.current); pulseTimer.current = null; }
      setPulseVal(0);
    }
    return () => { if (pulseTimer.current) clearInterval(pulseTimer.current); };
  }, [modeIdx]);

  // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const mode   = MODES[modeIdx];
  const view   = VIEWS[viewIdx];
  const layout = getRegionLayout(view.id);
  const act    = ACTIVITIES[actIdx];
  const wave   = BRAIN_WAVES[waveIdx];
  const wireCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const foldCol = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  // Reaction averages
  const avgRt = rtResults.length ? Math.round(rtResults.reduce((s, t) => s + t, 0) / rtResults.length) : 0;
  const bestRt = rtResults.length ? Math.min(...rtResults) : 0;
  const rtClass = rtTime ? reactionClassify(rtTime) : null;

  // Canvas background for react mode
  const canvasBg = mode.id === 'react'
    ? rtState === 'waiting' ? (isDark ? '#1A1600' : '#FFFBE6')
    : rtState === 'go'      ? (isDark ? '#001A08' : '#E6FFEC')
    : rtState === 'early'   ? (isDark ? '#1A0505' : '#FFE6E6')
    : (isDark ? '#0A0B12' : '#F5F6FF')
    : (isDark ? '#0A0B12' : '#F5F6FF');

  // â”€â”€ Mode change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const changeMode = (i) => {
    soundTap(); Haptics.selectionAsync();
    setModeIdx(i); setSelRegion(null); setShowInsights(false);
    if (rtState !== 'idle' && rtState !== 'done') {
      if (rtTimeout.current) clearTimeout(rtTimeout.current);
      setRtState('idle');
    }
    signalAnims.forEach(s => s.op.setValue(0));
  };

  // â”€â”€ Explore: tap region â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tapRegion = (regionId) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelRegion(regionId === selRegion ? null : regionId);
    setShowInsights(regionId !== selRegion);
    burstParticles();

    // Glow animation
    regionGlow.setValue(0);
    Animated.spring(regionGlow, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }).start();

    // Track explored regions
    const updated = new Set([...regionsExplored, regionId]);
    setRegionsExplored(updated);
    setRunCount(c => c + 1);
    if (updated.size >= 8 && !completedCh.includes('explore_all')) triggerChallenge('explore_all');

    // Inside view challenge
    if (viewIdx === 1 && !completedCh.includes('inside_view')) triggerChallenge('inside_view');

    // Animate neural signal along connected pathway
    animateSignal(regionId);
  };

  const animateSignal = (fromId) => {
    signalAnims.forEach(s => s.op.setValue(0));
    const from = layout[fromId];
    if (!from) return;
    // Signal travels to 2-3 related regions
    const related = REGIONS.filter(r => r.id !== fromId).slice(0, 3);
    related.forEach((r, i) => {
      const to = layout[r.id];
      if (!to || !to.vis) return;
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.parallel([
          Animated.timing(signalAnims[i].op, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(signalAnims[i].x, { toValue: to.cx - from.cx, duration: 400, useNativeDriver: true }),
          Animated.timing(signalAnims[i].y, { toValue: to.cy - from.cy, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(signalAnims[i].op, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => { signalAnims[i].x.setValue(0); signalAnims[i].y.setValue(0); });
    });
  };

  // â”€â”€ View change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const changeView = (i) => {
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(canvasFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(canvasFade, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setViewIdx(i), 150);
    setSelRegion(null); setShowInsights(false);
  };

  // â”€â”€ Activity scan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const selectActivity = (i) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActIdx(i); setShowInsights(true); setRunCount(c => c + 1);
    burstParticles();

    const updated = new Set([...activitiesScanned, ACTIVITIES[i].id]);
    setActivitiesScanned(updated);
    if (updated.size >= 8 && !completedCh.includes('scan_all')) triggerChallenge('scan_all');
  };

  // â”€â”€ Reaction test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startReactionTest = () => {
    if (rtState === 'waiting' || rtState === 'go') return;
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseBtn();
    setRtState('waiting');
    setRtTime(0);
    setShowInsights(false);

    const delay = 2000 + Math.random() * 3000;
    rtTimeout.current = setTimeout(() => {
      setRtState('go');
      rtStartMs.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, delay);
  };

  const handleReactionTap = () => {
    if (rtState === 'waiting') {
      // Too early!
      clearTimeout(rtTimeout.current);
      setRtState('early');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      soundTap();
    } else if (rtState === 'go') {
      const time = Date.now() - rtStartMs.current;
      setRtTime(time);
      setRtResults(prev => [...prev, time]);
      setRtState('done');
      setShowInsights(true);
      setRunCount(c => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      soundBadge();
      burstParticles();

      // Impact ring
      Animated.sequence([
        Animated.spring(impactRing, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
        Animated.timing(impactRing, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();

      // Challenges
      if (time < 200 && !completedCh.includes('fast_react')) triggerChallenge('fast_react');
      if (time < 150 && !completedCh.includes('sub_150')) triggerChallenge('sub_150');
      const count = rtResults.length + 1;
      if (count >= 5 && !completedCh.includes('five_tests')) triggerChallenge('five_tests');
      if (count >= 10 && !completedCh.includes('ten_tests')) triggerChallenge('ten_tests');

      if (onLabBreaker && time < 80) onLabBreaker();
    } else if (rtState === 'early' || rtState === 'done') {
      setRtState('idle');
    }
  };

  // â”€â”€ Wave select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const selectWave = (i) => {
    soundTap(); Haptics.selectionAsync();
    setWaveIdx(i); setShowInsights(true);
    const updated = new Set([...wavesViewed, BRAIN_WAVES[i].id]);
    setWavesViewed(updated);
    if (updated.size >= 5 && !completedCh.includes('all_waves')) triggerChallenge('all_waves');
  };

  // â”€â”€ Challenge system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        Animated.delay(i * 20),
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

  // â”€â”€ Fun facts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getFunFact = () => {
    if (mode.id === 'react' && rtTime) return rtClass?.fact || '';
    if (selRegion) return REGIONS.find(r => r.id === selRegion)?.fact || '';
    if (mode.id === 'activity') return `When you're "${act.name.toLowerCase()}", ${Object.entries(act.active).length} brain regions light up simultaneously â€” the brain is NEVER doing just one thing!`;
    if (mode.id === 'waves') return `${wave.name} waves (${wave.range}) dominate during: ${wave.state}. Hans Berger first recorded brain waves in 1929 â€” inventing the EEG!`;
    return 'Your brain generates about 12-25 watts of electricity â€” enough to power a dim LED bulb! Albert Einstein\'s brain was preserved and studied; his parietal lobes were 15% wider than average. ðŸ’¡';
  };

  // â”€â”€ Wave SVG builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buildWavePath = (freq, amp, yCenter, phase, w) => {
    const pts = [];
    const margin = 30;
    const drawW = w - margin * 2;
    for (let x = 0; x <= drawW; x += 2) {
      const normFreq = freq / 10;
      const y = yCenter + amp * 50 * Math.sin(2 * Math.PI * normFreq * x / drawW * 4 + phase);
      pts.push(`${x === 0 ? 'M' : 'L'}${margin + x},${y}`);
    }
    return pts.join(' ');
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  RENDER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <View style={styles.root}>

      {/* â”€â”€ Mode Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ View tabs (Explore only) â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'explore' && (
        <View style={styles.viewRow}>
          {VIEWS.map((v, i) => (
            <TouchableOpacity key={v.id} onPress={() => changeView(i)}
              style={[styles.viewTab, { borderColor: viewIdx === i ? v.color + '80' : border, backgroundColor: viewIdx === i ? v.color + '12' : glass1, flex: 1 }]}>
              <Icon name={v.icon} size={13} color={viewIdx === i ? v.color : txtM} />
              <Text style={[styles.viewTabTxt, { color: viewIdx === i ? txt1 : txtM }]}>{v.name}</Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.viewBadge, { backgroundColor: accentColor + '15', borderColor: accentColor + '40' }]}>
            <Text style={[styles.viewBadgeTxt, { color: accentColor }]}>3D</Text>
          </View>
        </View>
      )}

      {/* â”€â”€ SVG Canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View style={[styles.simBox, { borderColor: border, backgroundColor: canvasBg, opacity: mode.id === 'explore' ? canvasFade : 1 }]}>
        {/* Reaction test tap overlay */}
        {mode.id === 'react' && (rtState === 'waiting' || rtState === 'go' || rtState === 'early') && (
          <TouchableOpacity onPress={handleReactionTap}
            style={styles.reactOverlay} activeOpacity={1}>
            <View style={styles.reactOverlayContent}>
              {rtState === 'waiting' && (
                <>
                  <Icon name="clock" size={36} color="#FFD166" />
                  <Text style={[styles.reactBigText, { color: '#FFD166' }]}>Wait for GREEN...</Text>
                  <Text style={[styles.reactSubText, { color: txtM }]}>Don't tap yet!</Text>
                </>
              )}
              {rtState === 'go' && (
                <>
                  <Icon name="zap" size={48} color="#00E5A0" />
                  <Text style={[styles.reactBigText, { color: '#00E5A0' }]}>TAP NOW!</Text>
                </>
              )}
              {rtState === 'early' && (
                <>
                  <Icon name="cross" size={36} color="#FF6B6B" />
                  <Text style={[styles.reactBigText, { color: '#FF6B6B' }]}>Too early!</Text>
                  <Text style={[styles.reactSubText, { color: txtM }]}>Tap to retry</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}

        <Svg width={SIM_W} height={SIM_H}>
          <Defs>
            <SvgLinearGradient id="canvasBg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isDark ? '#0D0E18' : '#F8F9FF'} />
              <Stop offset="1" stopColor={isDark ? '#06070C' : '#ECEEFF'} />
            </SvgLinearGradient>
            <RadialGradient id="brainGlow" cx="50%" cy="45%" r="50%">
              <Stop offset="0" stopColor={accentColor} stopOpacity="0.12" />
              <Stop offset="0.7" stopColor={accentColor} stopOpacity="0.03" />
              <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
            </RadialGradient>
            {REGIONS.map(r => (
              <RadialGradient key={`rg_${r.id}`} id={`rg_${r.id}`} cx="50%" cy="40%" r="50%">
                <Stop offset="0" stopColor={r.color} stopOpacity="0.5" />
                <Stop offset="1" stopColor={r.color} stopOpacity="0.15" />
              </RadialGradient>
            ))}
          </Defs>
          <Rect x="0" y="0" width={SIM_W} height={SIM_H} fill="url(#canvasBg)" />

          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <React.Fragment key={f}>
              <Line x1={SIM_W * f} y1="0" x2={SIM_W * f} y2={SIM_H} stroke={wireCol} strokeWidth="0.5" />
              <Line x1="0" y1={SIM_H * f} x2={SIM_W} y2={SIM_H * f} stroke={wireCol} strokeWidth="0.5" />
            </React.Fragment>
          ))}

          {/* Mode badge */}
          <Rect x={SIM_W - 130} y={8} width={122} height={22} rx={6}
            fill={mode.color} fillOpacity="0.1" stroke={mode.color} strokeOpacity="0.25" strokeWidth="0.8" />
          <SvgText x={SIM_W - 14} y={23} textAnchor="end" fontSize="9" fill={mode.color} fillOpacity="0.85">
            {mode.name}
          </SvgText>

          {/* â”€â”€ BRAIN MAP (Explore + Activity) â”€â”€ */}
          {(mode.id === 'explore' || mode.id === 'activity') && (
            <>
              {/* Brain shadow */}
              <Ellipse cx={SIM_W * .50} cy={SIM_H * .43} rx={SIM_W * .38} ry={SIM_H * .30}
                fill="url(#brainGlow)" />

              {/* Brain outline */}
              <Path d={brainOutline(SIM_W, SIM_H)} fill={isDark ? '#151828' : '#E8E9F4'}
                stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'} strokeWidth={1.5} />

              {/* Sulci (brain folds) */}
              <Path d={centralSulcus(SIM_W, SIM_H)} fill="none" stroke={foldCol} strokeWidth={1} />
              <Path d={lateralSulcus(SIM_W, SIM_H)} fill="none" stroke={foldCol} strokeWidth={1} />
              {brainFolds(SIM_W, SIM_H).map((d, i) => (
                <Path key={`fold${i}`} d={d} fill="none" stroke={foldCol} strokeWidth={0.7} />
              ))}

              {/* Brain regions */}
              {REGIONS.map(r => {
                const pos = layout[r.id];
                if (!pos || !pos.vis) return null;
                const isSelected = selRegion === r.id;

                // Activity mode: glow based on activity intensity
                let actOpacity = 0;
                if (mode.id === 'activity' && act.active[r.id]) {
                  const base = act.active[r.id];
                  actOpacity = base * (0.6 + 0.4 * Math.sin(pulseVal));
                }

                const glowOp = mode.id === 'activity' ? actOpacity :
                               isSelected ? 0.5 : (pos.outline ? 0.08 : 0.15);
                const strokeOp = isSelected ? 0.9 : mode.id === 'activity' && act.active[r.id] ? 0.6 : 0.3;

                return (
                  <React.Fragment key={r.id}>
                    <Ellipse cx={pos.cx} cy={pos.cy} rx={pos.rx} ry={pos.ry}
                      fill={`url(#rg_${r.id})`} fillOpacity={glowOp}
                      stroke={r.color} strokeWidth={isSelected ? 2 : 1} strokeOpacity={strokeOp}
                      strokeDasharray={pos.outline ? '4,3' : undefined} />
                    {/* Region label */}
                    <SvgText x={pos.cx} y={pos.cy + 3} textAnchor="middle" fontSize={pos.rx < SIM_W * 0.04 ? 7 : 9}
                      fill={isSelected || (mode.id === 'activity' && actOpacity > 0.3) ? r.color : txtM + '80'}
                      fontWeight={isSelected ? 'bold' : 'normal'}>
                      {r.id === 'hippocampus' ? 'Hippo.' : r.id === 'cerebellum' ? 'Cereb.' : r.id === 'brainstem' ? 'Stem' : r.name.split(' ')[0]}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* View label */}
              {mode.id === 'explore' && (
                <SvgText x={10} y={SIM_H - 10} fontSize="8" fill={txtM + '60'}>
                  {view.name}
                  {view.id === 'inside' ? ' (Internal structures visible)' : ' (External lobes)'}
                </SvgText>
              )}

              {/* Activity scan label */}
              {mode.id === 'activity' && (
                <>
                  <SvgText x={SIM_W / 2} y={SIM_H - 20} textAnchor="middle" fontSize="10" fill={act.color} fontWeight="bold">
                    {act.name}
                  </SvgText>
                  <SvgText x={SIM_W / 2} y={SIM_H - 8} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)">
                    {Object.keys(act.active).length} regions active â€” fMRI simulation
                  </SvgText>
                </>
              )}
            </>
          )}

          {/* â”€â”€ REACTION TEST â”€â”€ */}
          {mode.id === 'react' && (rtState === 'idle' || rtState === 'done') && (
            <>
              {/* Brain outline (dimmed) */}
              <Path d={brainOutline(SIM_W, SIM_H)} fill={isDark ? '#101320' : '#ECEEF8'}
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />

              {/* Reaction pathway highlights */}
              {rtState === 'done' && REACTION_PATH.map((step, i) => {
                const pos = layout[step.region];
                if (!pos) return null;
                const region = REGIONS.find(r => r.id === step.region);
                return (
                  <React.Fragment key={step.region}>
                    <Ellipse cx={pos.cx} cy={pos.cy} rx={pos.rx * 1.2} ry={pos.ry * 1.2}
                      fill={region?.color} fillOpacity={0.3} stroke={region?.color} strokeWidth={1.5} strokeOpacity={0.7} />
                    <SvgText x={pos.cx} y={pos.cy - pos.ry - 6} textAnchor="middle" fontSize="8" fill={region?.color}>
                      {step.label}
                    </SvgText>
                    <SvgText x={pos.cx} y={pos.cy + pos.ry + 12} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)">
                      ~{step.delay}
                    </SvgText>
                    {/* Arrow to next */}
                    {i < REACTION_PATH.length - 1 && (() => {
                      const next = layout[REACTION_PATH[i + 1].region];
                      return next ? <Line x1={pos.cx} y1={pos.cy} x2={next.cx} y2={next.cy}
                        stroke={region?.color} strokeWidth={1.5} strokeOpacity={0.35} strokeDasharray="4,3" /> : null;
                    })()}
                  </React.Fragment>
                );
              })}

              {/* Reaction time display */}
              {rtState === 'done' && (
                <>
                  <SvgText x={SIM_W / 2} y={42} textAnchor="middle" fontSize="28" fill={rtClass?.color || accentColor} fontWeight="bold">
                    {rtTime} ms
                  </SvgText>
                  <SvgText x={SIM_W / 2} y={60} textAnchor="middle" fontSize="12" fill={rtClass?.color || accentColor}>
                    {rtClass?.label} {rtClass?.emoji}
                  </SvgText>
                </>
              )}

              {/* Mini bar chart of past results */}
              {rtResults.length > 1 && rtState === 'done' && (() => {
                const maxT = Math.max(...rtResults, 350);
                const barW = Math.min(18, (SIM_W - 80) / rtResults.length - 2);
                const startX = SIM_W / 2 - (rtResults.length * (barW + 2)) / 2;
                return rtResults.map((t, i) => {
                  const h = (t / maxT) * 60;
                  const isLast = i === rtResults.length - 1;
                  const c = reactionClassify(t).color;
                  return (
                    <React.Fragment key={`bar${i}`}>
                      <Rect x={startX + i * (barW + 2)} y={SIM_H - 30 - h} width={barW} height={h}
                        rx={3} fill={c} fillOpacity={isLast ? 0.8 : 0.35} />
                      <SvgText x={startX + i * (barW + 2) + barW / 2} y={SIM_H - 18}
                        textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)">{t}</SvgText>
                    </React.Fragment>
                  );
                });
              })()}

              {rtState === 'idle' && rtResults.length === 0 && (
                <SvgText x={SIM_W / 2} y={SIM_H / 2} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.6)">
                  Tap "Start Test" to measure your reaction time!
                </SvgText>
              )}
            </>
          )}

          {/* â”€â”€ BRAIN WAVES â”€â”€ */}
          {mode.id === 'waves' && (
            <>
              {/* Multiple wave traces */}
              {BRAIN_WAVES.map((w, i) => {
                const yCenter = 40 + i * 58;
                const isActive = waveIdx === i;
                return (
                  <React.Fragment key={w.id}>
                    {/* Trace line */}
                    <Line x1={25} y1={yCenter} x2={SIM_W - 25} y2={yCenter}
                      stroke={wireCol} strokeWidth={0.5} />
                    {/* Animated wave */}
                    <Path d={buildWavePath(w.freq, isActive ? w.amp : w.amp * 0.4, yCenter, wavePhase, SIM_W)}
                      fill="none" stroke={w.color} strokeWidth={isActive ? 2.5 : 1} strokeOpacity={isActive ? 0.9 : 0.3} />
                    {/* Label */}
                    <SvgText x={SIM_W - 20} y={yCenter - 12} textAnchor="end" fontSize="9"
                      fill={isActive ? w.color : txtM + '60'} fontWeight={isActive ? 'bold' : 'normal'}>
                      {w.name}
                    </SvgText>
                    <SvgText x={SIM_W - 20} y={yCenter + 16} textAnchor="end" fontSize="7" fill={txtM + '60'}>
                      {w.range}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {/* Active wave highlight */}
              <Rect x={20} y={35 + waveIdx * 58 - 25} width={SIM_W - 40} height={50} rx={8}
                fill={wave.color} fillOpacity="0.05" stroke={wave.color} strokeOpacity="0.15" strokeWidth={1} />
            </>
          )}
        </Svg>

        {/* Explore: tappable region overlays */}
        {mode.id === 'explore' && REGIONS.map(r => {
          const pos = layout[r.id];
          if (!pos || !pos.vis) return null;
          return (
            <TouchableOpacity key={`touch_${r.id}`} onPress={() => tapRegion(r.id)}
              style={[styles.regionTouch, {
                left: pos.cx - pos.rx, top: pos.cy - pos.ry,
                width: pos.rx * 2, height: pos.ry * 2, borderRadius: pos.rx,
              }]} activeOpacity={0.6} />
          );
        })}

        {/* Neural signal dots (explore mode) */}
        {mode.id === 'explore' && selRegion && signalAnims.map((s, i) => {
          const from = layout[selRegion];
          if (!from) return null;
          return (
            <Animated.View key={`sig${i}`} style={[styles.signalDot, {
              backgroundColor: accentColor, shadowColor: accentColor,
              left: from.cx - 4, top: from.cy - 4,
              opacity: s.op,
              transform: [{ translateX: s.x }, { translateY: s.y }],
            }]} />
          );
        })}

        {/* Particles + impact ring */}
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
      </Animated.View>

      {/* â”€â”€ Controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

      {/* ACTIVITY SCAN: activity selector */}
      {mode.id === 'activity' && (
        <>
          <SectionLabel icon="search" label="BRAIN ACTIVITY" color={MODES[1].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {ACTIVITIES.map((a, i) => (
              <TouchableOpacity key={a.id} onPress={() => selectActivity(i)}
                style={[styles.actCard, { borderColor: actIdx === i ? a.color + '80' : border, backgroundColor: actIdx === i ? a.color + '12' : glass1 }]}>
                <Icon name={a.icon} size={16} color={actIdx === i ? a.color : txtM} />
                <Text style={[styles.actName, { color: actIdx === i ? txt1 : txtM }]} numberOfLines={1}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* REACTION: controls */}
      {mode.id === 'react' && (
        <>
          <SectionLabel icon="zap" label="REACTION TIME TEST" color={MODES[2].color} txtM={txtM} />
          <View style={[styles.hintBox, { borderColor: MODES[2].color + '30', backgroundColor: MODES[2].color + '08' }]}>
            <Icon name="info" size={14} color={MODES[2].color} />
            <Text style={[styles.hintText, { color: txt2 }]}>
              {rtState === 'idle' && rtResults.length === 0
                ? "Tap Start â†’ wait for green â†’ TAP as fast as you can! We'll measure your brain's neural processing speed."
                : rtState === 'idle' || rtState === 'done'
                ? `${rtResults.length} test${rtResults.length !== 1 ? 's' : ''} done. Average: ${avgRt}ms, Best: ${bestRt}ms. Try again to improve!`
                : "Focus on the screen..."}
            </Text>
          </View>
        </>
      )}

      {/* WAVES: wave type selector */}
      {mode.id === 'waves' && (
        <>
          <SectionLabel icon="waves" label="BRAIN WAVE TYPE" color={MODES[3].color} txtM={txtM} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            {BRAIN_WAVES.map((w, i) => (
              <TouchableOpacity key={w.id} onPress={() => selectWave(i)}
                style={[styles.waveCard, { borderColor: waveIdx === i ? w.color + '80' : border, backgroundColor: waveIdx === i ? w.color + '12' : glass1 }]}>
                <Icon name={w.icon} size={14} color={waveIdx === i ? w.color : txtM} />
                <Text style={[styles.waveName, { color: waveIdx === i ? txt1 : txtM }]}>{w.name}</Text>
                <Text style={[styles.waveRange, { color: waveIdx === i ? w.color : txtM }]}>{w.range}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* â”€â”€ Stats Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={styles.statsRow}>
        <StatPill icon="brain" iconColor={accentColor} label="Regions" value={`${regionsExplored.size}/8`} txt1={txt1} txtM={txtM} />
        <StatPill icon="zap" iconColor="#4ECDC4" label={mode.id === 'react' ? 'Best' : 'Scans'} value={mode.id === 'react' ? (bestRt ? `${bestRt}ms` : 'â€”') : `${activitiesScanned.size}`} txt1={txt1} txtM={txtM} />
        <StatPill icon="waves" iconColor="#FF6B9D" label="Waves" value={`${wavesViewed.size}/5`} txt1={txt1} txtM={txtM} />
        <StatPill icon="flask" iconColor="#FF9F1C" label="Exps" value={`${runCount}`} txt1={txt1} txtM={txtM} />
      </View>

      {/* â”€â”€ Run / Action Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'react' && (
        <Animated.View style={{ transform: [{ scale: runBtnSc }] }}>
          <TouchableOpacity onPress={startReactionTest}
            disabled={rtState === 'waiting' || rtState === 'go'}
            activeOpacity={0.85}
            style={[styles.runBtn, { borderColor: rtState === 'waiting' || rtState === 'go' ? border : MODES[2].color + '70' }]}>
            <LinearGradient colors={[MODES[2].color + '35', MODES[2].color + '18']} style={styles.runBtnGrad}>
              <Icon name={rtState === 'waiting' || rtState === 'go' ? 'clock' : rtResults.length ? 'refresh' : 'zap'} size={18}
                color={rtState === 'waiting' || rtState === 'go' ? txtM : MODES[2].color} />
              <Text style={[styles.runBtnTxt, { color: rtState === 'waiting' || rtState === 'go' ? txtM : txt1 }]}>
                {rtState === 'waiting' ? 'Waiting...' : rtState === 'go' ? 'TAP NOW!' : rtResults.length ? 'Test Again' : 'Start Reaction Test'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {runCount > 0 && <View style={[styles.counterRow, { borderColor: border }]}><Icon name="flask" size={12} color={txtM} /><Text style={[styles.counterTxt, { color: txtM }]}>{runCount} interaction{runCount > 1 ? 's' : ''}</Text></View>}

      {/* â”€â”€ Region Info Panel (Explore) â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'explore' && selRegion && showInsights && (() => {
        const region = REGIONS.find(r => r.id === selRegion);
        if (!region) return null;
        return (
          <View style={[styles.insightsBox, { borderColor: region.color + '40', backgroundColor: region.color + '08' }]}>
            <View style={styles.insightsHeader}>
              <View style={[styles.regionIcon, { backgroundColor: region.color + '20' }]}>
                <Icon name={region.icon} size={18} color={region.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightsTitle, { color: txt1 }]}>{region.name}</Text>
                <Text style={[styles.regionSub, { color: region.color }]}>Tap another region to compare</Text>
              </View>
            </View>
            <View style={styles.funcGrid}>
              {region.functions.map((fn, i) => (
                <View key={i} style={[styles.funcChip, { borderColor: region.color + '30', backgroundColor: region.color + '0A' }]}>
                  <View style={[styles.funcDot, { backgroundColor: region.color }]} />
                  <Text style={[styles.funcText, { color: txt2 }]}>{fn}</Text>
                </View>
              ))}
            </View>
            {scientistMode && (
              <View style={[styles.sciRow, { borderColor: border }]}>
                <Icon name="flask" size={12} color={accentColor} />
                <Text style={[styles.sciText, { color: txt2 }]}>
                  Signal speed: ~{region.id === 'brainstem' ? '120' : region.id === 'cerebellum' ? '100' : '80'} m/s via myelinated axons.
                  Synaptic delay: ~0.5-1 ms per synapse.
                </Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* â”€â”€ Activity Results (fMRI) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'activity' && showInsights && (
        <View style={[styles.insightsBox, { borderColor: act.color + '40', backgroundColor: act.color + '08' }]}>
          <View style={styles.insightsHeader}>
            <Icon name={act.icon} size={18} color={act.color} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>{act.name} â€” Active Regions</Text>
          </View>
          {Object.entries(act.active).sort((a, b) => b[1] - a[1]).map(([rId, intensity]) => {
            const region = REGIONS.find(r => r.id === rId);
            if (!region) return null;
            return (
              <View key={rId} style={[styles.actRow, { borderBottomColor: border + '20' }]}>
                <View style={[styles.actRowIcon, { backgroundColor: region.color + '18' }]}>
                  <Icon name={region.icon} size={12} color={region.color} />
                </View>
                <Text style={[styles.actRowName, { color: txt1 }]}>{region.name}</Text>
                <View style={[styles.actBar, { backgroundColor: glass2 }]}>
                  <View style={[styles.actBarFill, { width: `${intensity * 100}%`, backgroundColor: region.color }]} />
                </View>
                <Text style={[styles.actRowPct, { color: region.color }]}>{Math.round(intensity * 100)}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* â”€â”€ Reaction Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'react' && rtState === 'done' && showInsights && (
        <View style={[styles.insightsBox, { borderColor: border, backgroundColor: glass1 }]}>
          <View style={styles.insightsHeader}>
            <Icon name="zap" size={16} color={rtClass?.color || accentColor} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>Neural Pathway Analysis</Text>
          </View>
          <Text style={[styles.pathDesc, { color: txt2 }]}>
            Your reaction traveled: Light hits retina (0ms) â†’ Occipital V1 (~30ms) â†’ Parietal (~50ms) â†’ Frontal motor cortex (~100ms) â†’ Cerebellum coordinate â†’ muscle contraction â†’ total: {rtTime}ms
          </Text>
          {REACTION_PATH.map((step, i) => {
            const region = REGIONS.find(r => r.id === step.region);
            return (
              <View key={step.region} style={[styles.pathStep, { borderLeftColor: region?.color + '60' }]}>
                <View style={[styles.pathDot, { backgroundColor: region?.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pathStepName, { color: txt1 }]}>{region?.name}</Text>
                  <Text style={[styles.pathStepDesc, { color: txt2 }]}>{step.label} â€” adds ~{step.delay}</Text>
                </View>
              </View>
            );
          })}
          {rtResults.length >= 3 && (
            <View style={[styles.rtSummary, { borderColor: border }]}>
              <View style={styles.rtSumItem}>
                <Text style={[styles.rtSumVal, { color: reactionClassify(bestRt).color }]}>{bestRt}ms</Text>
                <Text style={[styles.rtSumLabel, { color: txtM }]}>Best</Text>
              </View>
              <View style={styles.rtSumItem}>
                <Text style={[styles.rtSumVal, { color: txt1 }]}>{avgRt}ms</Text>
                <Text style={[styles.rtSumLabel, { color: txtM }]}>Average</Text>
              </View>
              <View style={styles.rtSumItem}>
                <Text style={[styles.rtSumVal, { color: txt1 }]}>{rtResults.length}</Text>
                <Text style={[styles.rtSumLabel, { color: txtM }]}>Tests</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* â”€â”€ Wave Info Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mode.id === 'waves' && showInsights && (
        <View style={[styles.insightsBox, { borderColor: wave.color + '40', backgroundColor: wave.color + '08' }]}>
          <View style={styles.insightsHeader}>
            <Icon name={wave.icon} size={18} color={wave.color} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>{wave.name} Waves â€” {wave.range}</Text>
          </View>
          <View style={[styles.waveInfoBox, { borderColor: wave.color + '30' }]}>
            <Icon name="sparkle" size={14} color={wave.color} />
            <Text style={[styles.waveState, { color: txt2 }]}>{wave.state}</Text>
          </View>
          <View style={styles.waveDataRow}>
            <View style={[styles.waveDataItem, { borderColor: border }]}>
              <Text style={[styles.waveDataVal, { color: wave.color }]}>{wave.freq} Hz</Text>
              <Text style={[styles.waveDataLabel, { color: txtM }]}>Frequency</Text>
            </View>
            <View style={[styles.waveDataItem, { borderColor: border }]}>
              <Text style={[styles.waveDataVal, { color: wave.color }]}>{(wave.amp * 100).toFixed(0)} Î¼V</Text>
              <Text style={[styles.waveDataLabel, { color: txtM }]}>Amplitude</Text>
            </View>
            <View style={[styles.waveDataItem, { borderColor: border }]}>
              <Text style={[styles.waveDataVal, { color: wave.color }]}>{wave.range}</Text>
              <Text style={[styles.waveDataLabel, { color: txtM }]}>Band</Text>
            </View>
          </View>
          <Text style={[styles.waveFact, { color: txtM }]}>
            {waveIdx === 0 ? 'Delta waves are strongest during deep sleep â€” your brain is repairing and consolidating. Growth hormone is released!' :
             waveIdx === 1 ? 'Theta waves appear during meditation. Buddhist monks show 700% more theta during deep meditation!' :
             waveIdx === 2 ? 'Alpha waves = flow state. Closing your eyes increases alpha by 50%. Artists and athletes train to enhance them.' :
             waveIdx === 3 ? 'Beta dominates during active thinking. Too much beta â†’ anxiety. Coffee increases beta waves!' :
             'Gamma waves may be the neural signature of consciousness itself. They bind sensory data into unified perception.'}
          </Text>
        </View>
      )}

      {/* â”€â”€ Fun Fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(showInsights || runCount > 0) && (
        <View style={[styles.funFact, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
          <View style={[styles.funFactIco, { backgroundColor: accentColor + '18' }]}>
            <Icon name="lightbulb" size={16} color={accentColor} />
          </View>
          <Text style={[styles.funFactTxt, { color: txt2 }]}>{getFunFact()}</Text>
        </View>
      )}

      {/* â”€â”€ Challenge popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Challenge panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SUB-COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function SectionLabel({ icon, label, color, txtM }) {
  return (
    <View style={styles.sectionLabel}>
      <Icon name={icon} size={12} color={color} />
      <Text style={[styles.sectionLabelTxt, { color: txtM }]}>{label}</Text>
    </View>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STYLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const styles = StyleSheet.create({
  root: { gap: SPACING.sm },
  scroll: { marginBottom: 4 },
  scrollInner: { gap: 8, paddingRight: SPACING.md },

  // Mode tabs
  modeTab: { alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 82 },
  modeIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modeName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  modeDesc: { fontFamily: FONTS.body, fontSize: 8 },

  // View tabs
  viewRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  viewTab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1 },
  viewTabTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  viewBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
  viewBadgeTxt: { fontFamily: FONTS.displayMedium, fontSize: 11, letterSpacing: 1 },

  // Canvas
  simBox: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', marginBottom: 4, position: 'relative' },
  regionTouch: { position: 'absolute' },
  signalDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, shadowOpacity: 0.9, shadowRadius: 5, elevation: 4 },
  impactRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, top: SIM_H / 2 - 30, left: SIM_W / 2 - 30 },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2, top: SIM_H / 2 - 2, left: SIM_W / 2 - 2 },

  // React overlay
  reactOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  reactOverlayContent: { alignItems: 'center', gap: 12 },
  reactBigText: { fontFamily: FONTS.displayMedium, fontSize: 24, letterSpacing: 1 },
  reactSubText: { fontFamily: FONTS.body, fontSize: 13 },

  // Activity cards
  actCard: { alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 72 },
  actName: { fontFamily: FONTS.bodyMedium, fontSize: 10 },

  // Wave cards
  waveCard: { alignItems: 'center', gap: 3, paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 65 },
  waveName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  waveRange: { fontFamily: FONTS.body, fontSize: 8 },

  // Section labels
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, marginBottom: 6 },
  sectionLabelTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },

  // Hint
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: RADIUS.md, padding: 10 },
  hintText: { fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 17 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statVal: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  statLbl: { fontFamily: FONTS.body, fontSize: 9 },

  // Run button
  runBtn: { borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  runBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  runBtnTxt: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 4 },
  counterTxt: { fontFamily: FONTS.body, fontSize: 11 },

  // Insights
  insightsBox: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginTop: SPACING.sm },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.sm },
  insightsTitle: { fontFamily: FONTS.displayMedium, fontSize: 15, flex: 1 },
  regionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  regionSub: { fontFamily: FONTS.body, fontSize: 10, marginTop: 2 },

  // Function chips
  funcGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  funcChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  funcDot: { width: 5, height: 5, borderRadius: 2.5 },
  funcText: { fontFamily: FONTS.body, fontSize: 11 },

  // Scientist note
  sciRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingTop: 8, borderTopWidth: 0.5 },
  sciText: { fontFamily: FONTS.body, fontSize: 10, flex: 1, lineHeight: 15 },

  // Activity rows
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 0.5 },
  actRowIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  actRowName: { fontFamily: FONTS.bodyMedium, fontSize: 11, flex: 1 },
  actBar: { width: 50, height: 5, borderRadius: 3, overflow: 'hidden' },
  actBarFill: { height: 5, borderRadius: 3 },
  actRowPct: { fontFamily: FONTS.bodyMedium, fontSize: 10, width: 30, textAlign: 'right' },

  // Reaction results
  pathDesc: { fontFamily: FONTS.body, fontSize: 11, lineHeight: 17, marginBottom: 10 },
  pathStep: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderLeftWidth: 2, paddingLeft: 12, marginLeft: 4 },
  pathDot: { width: 8, height: 8, borderRadius: 4, marginLeft: -17 },
  pathStepName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  pathStepDesc: { fontFamily: FONTS.body, fontSize: 10 },
  rtSummary: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 0.5, marginTop: 8 },
  rtSumItem: { alignItems: 'center' },
  rtSumVal: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  rtSumLabel: { fontFamily: FONTS.body, fontSize: 9, marginTop: 2 },

  // Wave info
  waveInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 10 },
  waveState: { fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 17 },
  waveDataRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  waveDataItem: { flex: 1, alignItems: 'center', padding: 8, borderRadius: RADIUS.md, borderWidth: 1 },
  waveDataVal: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  waveDataLabel: { fontFamily: FONTS.body, fontSize: 9, marginTop: 2 },
  waveFact: { fontFamily: FONTS.body, fontSize: 11, lineHeight: 17, fontStyle: 'italic' },

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
