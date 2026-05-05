/**
 * PhotosynthesisLab â€” rewritten WITHOUT react-native-reanimated.
 *
 * Root cause of the previous crash:
 *   react-native-reanimated v4 requires the New Architecture (Fabric/JSI).
 *   Expo Go on Android without New Architecture throws:
 *     "TurboModule method installTurboModule called with 1 arguments (expected 0)"
 *   â€¦which crashes the entire module at require() time, making .default === undefined.
 *
 * Fix: use only React Native's built-in Animated API + setInterval + useState.
 *       These work on both Old and New Architecture with Expo Go.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, Ellipse, Defs, Stop, RadialGradient, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');

// â”€â”€ Layout constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const VIEWPORT_H = Math.min(height * 0.40, 260);
const PANEL_H    = 240;

// â”€â”€ Scientific colour palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  amber:  '#FFB347',
  cyan:   '#00D4FF',
  green:  '#39FF14',
  red:    '#FF3131',
  text:   '#E8E0D0',
  grana:  '#0D2B0D',
  steel:  '#2A2A35',
  bg:     '#0A0A0F',
  panel:  '#12121A',
};

// â”€â”€ Light wavelength options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WAVE_OPTIONS = [
  { label: 'RED 660nm',  color: '#FF3131', wFactor: 1.0, description: 'Red light â€” absorbed by PS I & PS II' },
  { label: 'WHITE MIX',  color: '#FFFFFF', wFactor: 0.9, description: 'Full spectrum â€” broad absorption' },
  { label: 'GREEN 550nm', color: C.green,  wFactor: 0.1, description: 'Green light â€” mostly reflected by leaves' },
];

// â”€â”€ Discovery log data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISCOVERIES = [
  {
    id: 'd1', minLight: 1200, maxCo2: 200, minCo2: -1, minTemp: -99, maxTemp: 99, wave: -1,
    title: 'Light Saturation Limiting',
    entry: "Even intense light can't make more sugar if COâ‚‚ runs out â€” the light reactions outrun the Calvin cycle.",
    rarity: 'Uncommon',
  },
  {
    id: 'd2', minLight: -1, maxCo2: 9999, minCo2: -1, minTemp: -99, maxTemp: 99, wave: 2,
    title: "Chlorophyll's Green Paradox",
    entry: "Leaves appear green because they REFLECT green light â€” the one wavelength they cannot use.",
    rarity: 'Common',
  },
  {
    id: 'd3', minLight: 800, maxCo2: 9999, minCo2: 800, minTemp: 24, maxTemp: 26, wave: -1,
    title: 'Optimal Photosynthesis State',
    entry: "At 25 Â°C with abundant COâ‚‚ and saturating light, enzymes hit peak efficiency â€” like a rainforest leaf at noon.",
    rarity: 'Rare âœ¨',
  },
  {
    id: 'd4', minLight: -1, maxCo2: 150, minCo2: -1, minTemp: -99, maxTemp: 99, wave: -1,
    title: 'COâ‚‚ Starvation',
    entry: "The light reactions keep producing energy, but RuBisCO runs in reverse â€” wasting energy in photorespiration.",
    rarity: 'Uncommon',
  },
  {
    id: 'd5', minLight: 1000, maxCo2: 9999, minCo2: -1, minTemp: -99, maxTemp: 99, wave: 0,
    title: 'Two-Photon Boost',
    entry: "One photon isn't enough â€” plants chain two photosystems to give electrons enough energy to make NADPH.",
    rarity: 'Rare âœ¨',
  },
];

// â”€â”€ Photon particle state (8 particles) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PARTICLE_COUNT = 8;
const GLUCOSE_OFFSETS = [
  { x: 0, y: -22 }, { x: 19, y: -11 }, { x: 19, y: 11 }, { x: 0, y: 22 },
  { x: -19, y: 11 }, { x: -19, y: -11 },
];

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PhotosynthesisLab({
  scientistMode = false,
  accentColor   = '#39FF14',
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
  const bg = (_themeObj || {}).bg?.base || '#0A0A0A';

  // â”€â”€ Instrument values (0-100 slider percentages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [lightPct, setLightPct]   = useState(0);    // 0â€“100 â†’ 0â€“2000 Î¼mol
  const [co2Pct,   setCo2Pct]     = useState(27);   // 0â€“100 â†’ 50â€“1500 ppm
  const [tempPct,  setTempPct]    = useState(40);   // 0â€“100 â†’ 0â€“50 Â°C
  const [waveIdx,  setWaveIdx]    = useState(1);    // 0=red, 1=white, 2=green

  // â”€â”€ Computed real values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const lightVal = Math.round(lightPct * 20);        // 0â€“2000
  const co2Val   = Math.round(50 + co2Pct * 14.5);  // 50â€“1500
  const tempVal  = Math.round(tempPct * 0.5);        // 0â€“50

  // â”€â”€ Animation frame (JS-side, uses setInterval) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const frameRef       = useRef(0);        // 0â€“1 cycling
  const [frame, setFrame] = useState(0);  // triggers re-render for particle positions

  // â”€â”€ Danger state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [danger, setDanger] = useState(false);
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  // â”€â”€ Discovery log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [unlockedLogs,  setUnlockedLogs]  = useState([]);
  const [logsOpen,      setLogsOpen]      = useState(false);
  const [activeHint,    setActiveHint]    = useState(
    'Slide the Light dial up to send photons into the chloroplast. Watch the grana wake up!'
  );

  // â”€â”€ Discovery log: track which ones unlocked â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const discLocks = useRef({});

  // â”€â”€ Animated values for shake â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const shakeX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1], outputRange: [-5, 0, 5],
  });

  // â”€â”€ Frame loop: runs at ~30fps on JS thread â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const tFactor = tempVal < 10 ? 0.3 : tempVal > 42 ? 0.15 : 1.0;
    const lFactor = lightVal < 100 ? 0.05 : lightVal < 1500 ? 0.5 + (lightVal - 100) / 1400 : 1.5;
    const cFactor = co2Val < 150 ? 0.1 : co2Val < 400 ? 0.4 + (co2Val - 150) / 250 * 0.6 : 1.0;
    const wFactor = waveIdx === 2 ? 0.1 : 1.0;
    const speed   = tFactor * lFactor * cFactor * wFactor;

    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.033 * speed) % 1;
      setFrame(frameRef.current);
    }, 33); // ~30fps

    return () => clearInterval(id);
  }, [lightVal, co2Val, tempVal, waveIdx]);

  // â”€â”€ Temperature danger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const isDanger = tempVal > 45;
    setDanger(isDanger);
    if (isDanger) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (onLabBreaker) onLabBreaker();
      Animated.loop(
        Animated.sequence([
          Animated.timing(dangerAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dangerAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1,  duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0,  duration: 50, useNativeDriver: true }),
        ])
      ).start();
      setActiveHint('ðŸ”¥ Temperature too high! Enzymes are denaturing â€” lower the heat!');
    } else {
      dangerAnim.stopAnimation();
      shakeAnim.stopAnimation();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
    }
    if (tempVal > 40 && tempVal <= 45) {
      setActiveHint('âš ï¸ Enzymes approaching thermal limit. Lower the temperature!');
    }
  }, [tempVal]);

  // â”€â”€ Discovery checks (every 1.5 s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const id = setInterval(() => {
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        const match =
          (d.minLight < 0  || lightVal >= d.minLight) &&
          (d.maxCo2  > 900 || co2Val   <= d.maxCo2)  &&
          (d.minCo2  < 0   || co2Val   >= d.minCo2)  &&
          (tempVal >= d.minTemp && tempVal <= d.maxTemp) &&
          (d.wave < 0 || waveIdx === d.wave);

        if (match) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setUnlockedLogs(prev => [{ ...d }, ...prev]);
          setActiveHint(`ðŸ”¬ Discovery: ${d.title}`);
        }
      });
    }, 1500);
    return () => clearInterval(id);
  }, [lightVal, co2Val, tempVal, waveIdx]);

  // â”€â”€ Derived display values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wave        = WAVE_OPTIONS[waveIdx];
  const glucoseLevel = Math.min(1,
    (lightVal / 1200) * (co2Val / 800) *
    (tempVal < 10 ? 0.2 : tempVal > 42 ? 0.1 : 1) *
    wave.wFactor
  );
  const granaGlow = Math.min(1, lightVal / 800);

  // â”€â”€ Photon particle positions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const photons = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const slot = (frame + i / PARTICLE_COUNT) % 1;
    const yPos = slot * VIEWPORT_H;
    const absorbed = waveIdx === 2 && yPos > VIEWPORT_H * 0.6;
    const cx = width * 0.30 + i * (width * 0.045) +
      (waveIdx === 2 && yPos > VIEWPORT_H * 0.4
        ? (yPos - VIEWPORT_H * 0.4) * (i % 2 === 0 ? 0.8 : -0.8)
        : 0);
    const opacity = absorbed ? 0 :
      lightVal < 50 ? 0 :
      Math.min(1, lightVal / 1000) * (1 - slot * 0.2);
    return { cx, cy: yPos, opacity, color: wave.color };
  });

  // â”€â”€ Glucose shatter (danger) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const glucoseNodes = GLUCOSE_OFFSETS.map((off, i) => {
    const cx = width * 0.72 + (danger ? off.x * 3 : off.x);
    const cy = VIEWPORT_H * 0.5 + (danger ? off.y * 3 : off.y);
    const opacity = danger ? 0 : glucoseLevel * (0.3 + i * 0.1);
    return { cx, cy, opacity };
  });

  // â”€â”€ Chloroplast body color â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chloroFill = danger ? '#8B8B5C' :
    tempVal < 10 ? '#0A1A0A' :
    tempVal < 25 ? '#112211' : '#1A3A1A';

  return (
    <View style={styles.container}>

      {/* â”€â”€ VIEWPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View style={[
        styles.viewport,
        { transform: [{ translateX: shakeX }] },
      ]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Defs>
            <RadialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
              <Stop offset="0%"   stopColor="#1A3A1A" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#0A0A0F" stopOpacity="1"   />
            </RadialGradient>
            <RadialGradient id="vig" cx="50%" cy="50%" r="50%">
              <Stop offset="70%"  stopColor="#000" stopOpacity="0"   />
              <Stop offset="100%" stopColor="#000" stopOpacity="0.8" />
            </RadialGradient>
          </Defs>

          {/* Background */}
          <Rect width="100%" height={VIEWPORT_H} fill="url(#bgGrad)" />

          {/* Chloroplast body */}
          <Ellipse
            cx={width / 2} cy={VIEWPORT_H / 2}
            rx={160} ry={100}
            fill={chloroFill}
            stroke={C.green} strokeWidth={2} strokeOpacity={0.4}
          />

          {/* Grana stacks */}
          {[0, 1, 2].map(si =>
            [0, 1, 2, 3].map(di => (
              <Ellipse
                key={`g${si}${di}`}
                cx={width / 2 - 60 + si * 40}
                cy={VIEWPORT_H / 2 - 15 + di * 10}
                rx={18} ry={6}
                fill={C.grana}
                stroke={granaGlow > 0.5 ? C.amber : C.green}
                strokeWidth={1}
                strokeOpacity={danger ? 0.9 : granaGlow}
              />
            ))
          )}

          {/* Photon particles */}
          {photons.map((p, i) => (
            <Circle
              key={`ph${i}`}
              cx={p.cx} cy={p.cy}
              r={4}
              fill={p.color}
              opacity={p.opacity}
            />
          ))}

          {/* Glucose hexagon nodes */}
          {glucoseNodes.map((gn, i) => (
            <Circle
              key={`gn${i}`}
              cx={gn.cx} cy={gn.cy}
              r={5}
              fill={danger ? C.red : C.amber}
              opacity={Math.max(0, gn.opacity)}
            />
          ))}

          {/* Vignette */}
          <Rect width="100%" height={VIEWPORT_H} fill="url(#vig)" />
        </Svg>

        {/* Danger red flash overlay */}
        {danger && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: C.red, opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }) },
            ]}
          />
        )}

        {/* LED status */}
        <View style={[styles.led, { backgroundColor: danger ? C.red : lightVal > 50 ? C.green : '#444' }]} />
      </Animated.View>

      {/* â”€â”€ CONTROL PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[styles.panel, { backgroundColor: C.panel }]}>

        {/* Row 1: Light + COâ‚‚ */}
        <View style={styles.panelRow}>

          {/* Light intensity slider */}
          <View style={styles.instBox}>
            <Text style={styles.instLabel}>â˜€ï¸ Light</Text>
            <SliderControl
              value={lightPct}
              onChange={v => { setLightPct(v); soundTap(); }}
              color={C.amber}
              trackColor="#1A1A1A"
            />
            <Text style={styles.lcdText}>LIGHT: {lightVal} Î¼mol</Text>
          </View>

          {/* COâ‚‚ slider */}
          <View style={styles.instBox}>
            <Text style={styles.instLabel}>ðŸ’¨ COâ‚‚</Text>
            <SliderControl
              value={co2Pct}
              onChange={v => { setCo2Pct(v); soundTap(); }}
              color={C.cyan}
              trackColor="#1A1A1A"
            />
            <Text style={styles.lcdText}>COâ‚‚: {co2Val} ppm</Text>
          </View>
        </View>

        {/* Row 2: Temperature + Wavelength */}
        <View style={styles.panelRow}>

          {/* Temperature slider */}
          <View style={styles.instBox}>
            <Text style={styles.instLabel}>ðŸŒ¡ï¸ Temp</Text>
            <SliderControl
              value={tempPct}
              onChange={v => { setTempPct(v); soundTap(); }}
              color={tempVal > 42 ? C.red : tempVal > 30 ? C.amber : C.cyan}
              trackColor="#1A1A1A"
            />
            <Text style={[styles.lcdText, tempVal > 42 && { color: C.red }]}>
              TEMP: {tempVal}Â°C {tempVal > 42 ? 'ðŸ”¥' : ''}
            </Text>
          </View>

          {/* Wavelength toggle */}
          <View style={styles.instBox}>
            <Text style={styles.instLabel}>ðŸŒˆ Wavelength</Text>
            <View style={styles.waveToggleRow}>
              {WAVE_OPTIONS.map((w, i) => (
                <TouchableOpacity
                  key={w.label}
                  onPress={() => { setWaveIdx(i); soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                  style={[
                    styles.waveBtn,
                    { borderColor: i === waveIdx ? w.color : '#333', backgroundColor: i === waveIdx ? w.color + '25' : '#111' },
                  ]}
                >
                  <View style={[styles.waveDot, { backgroundColor: w.color }]} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.lcdText, { color: wave.color }]}>
              {wave.label}
            </Text>
          </View>
        </View>
      </View>

      {/* â”€â”€ LIVE READOUT BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[styles.readoutBar, { backgroundColor: '#0D0D14', borderColor: '#1A1A2A' }]}>
        <ReadoutPill label="Glucose" value={`${Math.round(glucoseLevel * 100)}%`} color={C.amber} />
        <ReadoutPill label="Grana glow" value={`${Math.round(granaGlow * 100)}%`} color={C.green} />
        <ReadoutPill label="Efficiency" value={
          danger ? 'DANGER' :
          waveIdx === 2 ? 'Very Low' :
          glucoseLevel > 0.8 ? 'Optimal' :
          glucoseLevel > 0.4 ? 'Good' : 'Low'
        } color={danger ? C.red : glucoseLevel > 0.8 ? C.green : glucoseLevel > 0.4 ? C.amber : '#888'} />
        <ReadoutPill label="Discoveries" value={`${unlockedLogs.length}/5`} color={C.cyan} />
      </View>

      {/* â”€â”€ HINT / LOG BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TouchableOpacity
        style={[styles.logBar, { backgroundColor: '#1A1A1A', borderColor: '#2A2A3A' }]}
        onPress={() => { setLogsOpen(true); soundTap(); }}
      >
        <Icon name="book" size={18} color={C.amber} />
        <Text style={styles.logHintText} numberOfLines={1}>{activeHint}</Text>
        {unlockedLogs.length > 0 && (
          <View style={styles.logBadge}>
            <Text style={styles.logBadgeText}>{unlockedLogs.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* â”€â”€ SCIENTIST MODE: wavelength info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {scientistMode && (
        <View style={[styles.sciBox, { backgroundColor: '#0D1520', borderColor: C.cyan + '40' }]}>
          <Icon name="flask" size={14} color={C.cyan} />
          <Text style={[styles.sciText, { color: C.cyan + 'CC' }]}>
            {wave.description}
            {waveIdx === 1 && ` â€” COâ‚‚ rate: ${Math.round(glucoseLevel * 100)}% of max`}
          </Text>
        </View>
      )}

      {/* â”€â”€ RESEARCH LOG MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: C.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.amber }]}>Research Logs ðŸ““</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logScroll}>
              {unlockedLogs.length === 0 ? (
                <View style={styles.emptyLogWrap}>
                  <Text style={styles.emptyLog}>
                    ðŸ”¬ Explore the controls to discover hidden scientific facts!
                  </Text>
                  <Text style={[styles.emptyLogHint, { color: '#555' }]}>
                    Tip: try extreme temperature, low COâ‚‚, or green light wavelength
                  </Text>
                </View>
              ) : (
                unlockedLogs.map(log => (
                  <View key={log.id} style={styles.logCard}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{log.title}</Text>
                      <Text style={[styles.logRarity, {
                        color: log.rarity.includes('Rare') ? C.amber : log.rarity === 'Common' ? '#888' : C.cyan,
                      }]}>{log.rarity}</Text>
                    </View>
                    <Text style={styles.logCardDesc}>{log.entry}</Text>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// â”€â”€â”€ SliderControl: touch-friendly slider using layout measurement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SliderControl({ value, onChange, color, trackColor }) {
  const trackRef = useRef(null);
  const trackWidth = useRef(0);
  const dragging = useRef(false);

  const handleLayout = (e) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const getValueFromX = (pageX) => {
    if (!trackRef.current) return value;
    trackRef.current.measure((fx, fy, fw, fh, px, py) => {
      const relX = Math.max(0, Math.min(pageX - px, fw));
      const pct  = Math.round((relX / fw) * 100);
      onChange(pct);
    });
  };

  const filled = `${value}%`;

  return (
    <View
      ref={trackRef}
      onLayout={handleLayout}
      style={[styles.sliderTrack, { backgroundColor: trackColor }]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => { dragging.current = true; getValueFromX(e.nativeEvent.pageX); }}
      onResponderMove={(e) => { if (dragging.current) getValueFromX(e.nativeEvent.pageX); }}
      onResponderRelease={() => { dragging.current = false; }}
    >
      <View style={[styles.sliderFill, { width: `${value}%`, backgroundColor: color }]} />
      <View style={[styles.sliderThumb, { left: `${value}%`, borderColor: color, backgroundColor: color + '40' }]} />
    </View>
  );
}

// â”€â”€â”€ ReadoutPill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReadoutPill({ label, value, color }) {
  return (
    <View style={styles.readoutPill}>
      <Text style={[styles.readoutVal, { color }]}>{value}</Text>
      <Text style={styles.readoutLabel}>{label}</Text>
    </View>
  );
}

// â”€â”€â”€ STYLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  viewport: {
    width: '100%', height: VIEWPORT_H,
    backgroundColor: C.bg, overflow: 'hidden',
    position: 'relative',
  },
  led: {
    position: 'absolute', top: 10, right: 12,
    width: 10, height: 10, borderRadius: 5,
  },

  panel: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#222',
  },
  panelRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginBottom: 10,
  },
  instBox: {
    width: '47%', alignItems: 'stretch',
  },
  instLabel: {
    color: '#888', fontSize: 11, fontFamily: 'monospace',
    letterSpacing: 1, marginBottom: 6,
  },
  lcdText: {
    color: C.green, fontFamily: 'monospace', fontSize: 11,
    marginTop: 6, backgroundColor: '#050505',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1, borderColor: '#111',
    overflow: 'hidden', textAlign: 'center',
  },

  sliderTrack: {
    height: 24, borderRadius: 12, overflow: 'visible',
    position: 'relative', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A35',
  },
  sliderFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    borderRadius: 12,
  },
  sliderThumb: {
    position: 'absolute', width: 20, height: 20,
    borderRadius: 10, borderWidth: 2,
    top: 2, marginLeft: -10,
  },

  waveToggleRow: {
    flexDirection: 'row', gap: 6, marginVertical: 4,
  },
  waveBtn: {
    flex: 1, height: 28, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  waveDot: {
    width: 10, height: 10, borderRadius: 5,
  },

  readoutBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1,
  },
  readoutPill: { alignItems: 'center', minWidth: 64 },
  readoutVal:  { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  readoutLabel: { color: '#555', fontFamily: 'monospace', fontSize: 10, marginTop: 2 },

  logBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1,
    gap: 10,
  },
  logHintText: {
    flex: 1, color: '#888', fontFamily: 'monospace',
    fontSize: 12, fontStyle: 'italic',
  },
  logBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  logBadgeText: { color: '#000', fontSize: 11, fontWeight: 'bold' },

  sciBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: 8, padding: 10,
    marginHorizontal: 12, marginTop: 6,
  },
  sciText: { flex: 1, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },

  // Modal
  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: height * 0.72,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  logScroll:  { flex: 1 },
  emptyLogWrap: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyLog: { color: '#666', textAlign: 'center', fontFamily: 'monospace', fontSize: 13 },
  emptyLogHint: { textAlign: 'center', fontSize: 11, fontFamily: 'monospace' },
  logCard: {
    backgroundColor: '#1E1E28', padding: 14,
    borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: C.amber,
  },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logCardTitle: { color: C.text, fontWeight: 'bold', fontSize: 14, flex: 1 },
  logRarity: { fontSize: 11, fontFamily: 'monospace', marginLeft: 8 },
  logCardDesc: { color: '#CCC', fontSize: 13, lineHeight: 19 },
});
