import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Modal, TextInput,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withSpring, withTiming, withRepeat, withSequence,
  Easing, interpolate, Extrapolation,
  runOnJS, useFrameCallback, interpolateColor, useAnimatedReaction,
} from 'react-native-reanimated';
import {
  Gesture, GestureDetector, GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, {
  Circle, Rect, Path, G, Ellipse, Defs,
  RadialGradient, Stop, Text as SvgText, Line,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HEADER_H  = height * 0.08;
const VIEWPORT_H = height * 0.52;
const PANEL_H   = height * 0.30;
const LOG_H     = height * 0.10;

const C = {
  bg:     '#0A0A0F',
  panel:  '#12121A',
  amber:  '#FFB347',
  cyan:   '#00D4FF',
  green:  '#39FF14',
  red:    '#FF3131',
  text:   '#E8E0D0',
  stroma: '#1A3A1A',
  grana:  '#0D2B0D',
  steel:  '#2A2A35',
};

const AnimatedCircle  = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedRect    = Animated.createAnimatedComponent(Rect);
const AnimatedLine    = Animated.createAnimatedComponent(Line);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

// ─── Sub-components: each has its own hooks at the top level ────────────────

// Single photon particle — hooks at component top level, NOT inside map
function PhotonParticle({ index, globalFrame, waveVal, lightVal }) {
  const aProps = useAnimatedProps(() => {
    const t    = globalFrame.value;
    const slot = (t + index * 0.4) % 1; // 0..1 progress
    const yPos = VIEWPORT_H * slot;

    const wv = Math.round(waveVal.value);
    const isGreen = wv === 2;
    const isRed   = wv === 0;

    const baseCx = width * 0.3 + index * (width * 0.05);
    // bounce sideways for green (reflection)
    const cx = isGreen && yPos > VIEWPORT_H * 0.4
      ? baseCx + (yPos - VIEWPORT_H * 0.4) * (index % 2 === 0 ? 0.8 : -0.8)
      : baseCx;

    const fill = isGreen ? C.green : isRed ? C.red : (slot < 0.5 ? C.cyan : C.amber);
    let opacity = interpolate(lightVal.value, [0, 50, 2000], [0, 0.5, 1], Extrapolation.CLAMP);
    if (isGreen && yPos > VIEWPORT_H * 0.6) opacity = 0; // absorbed = 0

    return { cx, cy: yPos, fill, opacity };
  });
  return <AnimatedCircle r={4} animatedProps={aProps} />;
}

// One grana disc
function GranaDisc({ cx, cy, lightVal, dangerVal }) {
  const aProps = useAnimatedProps(() => {
    const glow    = interpolate(lightVal.value, [100, 1500], [0, 1], Extrapolation.CLAMP);
    const stroke  = glow > 0.5 ? C.amber : C.green;
    const sOpacity = dangerVal.value ? 0.9 : glow;
    return { stroke, strokeOpacity: sOpacity };
  });
  return (
    <AnimatedEllipse
      cx={cx} cy={cy} rx={18} ry={6}
      fill={C.grana} strokeWidth={1}
      animatedProps={aProps}
    />
  );
}

// One glucose vertex node
function GlucoseNode({ offsetX, offsetY, centerX, centerY, co2Val, dangerVal, glucoseShatter }) {
  const aProps = useAnimatedProps(() => {
    const shatter = glucoseShatter.value;
    const danger  = dangerVal.value;
    const scale   = danger ? 1 + shatter * 3 : 1;
    const cx = centerX + offsetX * scale;
    const cy = centerY + offsetY * scale;
    const opacity = danger ? Math.max(0, 1 - shatter) : interpolate(co2Val.value, [50, 150, 400], [0.2, 0.5, 1], Extrapolation.CLAMP);
    const fill    = danger ? C.red : C.amber;
    return { cx, cy, opacity, fill };
  });
  return <AnimatedCircle r={5} animatedProps={aProps} />;
}

// Dial needle
function DialNeedle({ lightVal }) {
  const aProps = useAnimatedProps(() => {
    const ang = (135 + (lightVal.value / 2000) * 270) * Math.PI / 180;
    return {
      x2: 45 + Math.cos(ang) * 30,
      y2: 45 + Math.sin(ang) * 30,
    };
  });
  return <AnimatedLine x1="45" y1="45" stroke={C.amber} strokeWidth={4} animatedProps={aProps} />;
}

// CO2 slider handle
function SliderHandle({ co2Val }) {
  const aProps = useAnimatedProps(() => {
    const py = ((1500 - co2Val.value) / 1450) * 85;
    return { y: py };
  });
  return <AnimatedRect x={5} width={30} height={15} fill={C.cyan} rx={4} animatedProps={aProps} />;
}

// Temperature needle
function TempNeedle({ tempVal }) {
  const aProps = useAnimatedProps(() => {
    const ang = (180 + (tempVal.value / 50) * 180) * Math.PI / 180;
    return {
      x2: 50 + Math.cos(ang) * 35,
      y2: 50 + Math.sin(ang) * 35,
    };
  });
  return <AnimatedLine x1="50" y1="50" stroke={C.text} strokeWidth={3} animatedProps={aProps} />;
}

// Toggle knob
function ToggleKnob({ waveVal }) {
  const aProps = useAnimatedProps(() => {
    const v    = waveVal.value;
    const fill = v < 0.5 ? C.red : v < 1.5 ? '#FFFFFF' : C.green;
    return { x: 5 + Math.round(v) * 25, fill };
  });
  return <AnimatedRect width={20} height={20} y={10} rx={10} animatedProps={aProps} />;
}

// Chloroplast body
function ChloroplastBody({ tempVal, dangerVal, dangerFlash }) {
  const aProps = useAnimatedProps(() => {
    if (dangerVal.value) {
      const fill = interpolateColor(dangerFlash.value, [-1, 0, 1, 2], ['#2A3A1A', '#2A3A1A', '#8B8B5C', '#8B8B5C']);
      return { fill };
    }
    const fill = interpolateColor(
      tempVal.value,
      [-10, 0, 10, 25, 40, 50, 60],
      ['#0A1A0A', '#0A1A0A', '#112211', '#1A3A1A', '#22331A', '#22331A', '#22331A']
    );
    return { fill };
  });
  return (
    <AnimatedEllipse
      cx={width / 2} cy={VIEWPORT_H / 2}
      rx={160} ry={100}
      stroke={C.green} strokeWidth={2} strokeOpacity={0.4}
      animatedProps={aProps}
    />
  );
}

// Danger overlay (View-based so opacity works correctly)
function DangerOverlay({ dangerFlash, dangerVal }) {
  const style = useAnimatedStyle(() => ({
    opacity: dangerVal.value
      ? interpolate(dangerFlash.value, [0, 1], [0, 0.35])
      : 0,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: C.red }, style]}
    />
  );
}

// Screen shake wrapper
function ShakeView({ shakeOffset, children, style }) {
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

// LCD displays
function LcdLight({ lightVal }) {
  const aProps = useAnimatedProps(() => ({ text: `LIGHT: ${Math.round(lightVal.value)} μmol` }));
  return (
    <AnimatedTextInput
      editable={false}
      style={styles.lcdText}
      animatedProps={aProps}
    />
  );
}
function LcdCo2({ co2Val }) {
  const aProps = useAnimatedProps(() => ({ text: `CO₂: ${Math.round(co2Val.value)} ppm` }));
  return (
    <AnimatedTextInput
      editable={false}
      style={styles.lcdText}
      animatedProps={aProps}
    />
  );
}
function LcdTemp({ tempVal }) {
  const aProps = useAnimatedProps(() => ({ text: `TEMP: ${Math.round(tempVal.value)}°C` }));
  return (
    <AnimatedTextInput
      editable={false}
      style={styles.lcdText}
      animatedProps={aProps}
    />
  );
}
function LcdWave({ waveVal }) {
  const aProps = useAnimatedProps(() => {
    const v = Math.round(waveVal.value);
    const s = v === 0 ? 'RED 660nm' : v === 1 ? 'WHITE MIX' : 'GREEN 550nm';
    return { text: `WAVE: ${s}` };
  });
  return (
    <AnimatedTextInput
      editable={false}
      style={styles.lcdText}
      animatedProps={aProps}
    />
  );
}

// ─── Glucose vertices ───────────────────────────────────────────────────────
const GLUCOSE_OFFSETS = [
  { x: 0,   y: -22 },
  { x: 19,  y: -11 },
  { x: 19,  y:  11 },
  { x: 0,   y:  22 },
  { x: -19, y:  11 },
  { x: -19, y: -11 },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function PhotosynthesisLab() {
  const [logsOpen,      setLogsOpen]      = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const [unlockedLogs,  setUnlockedLogs]  = useState([]);
  const [activeHint,    setActiveHint]    = useState(
    'Rotate the Light Dial clockwise to send photons into the chloroplast. Watch the grana wake up.'
  );

  // Instrument values
  const lightVal = useSharedValue(0);
  const co2Val   = useSharedValue(400);
  const tempVal  = useSharedValue(20);
  const waveVal  = useSharedValue(1);   // 0=Red 1=White 2=Green (integer steps)

  // Animation internals
  const globalFrame    = useSharedValue(0);
  const dangerVal      = useSharedValue(false);
  const shakeOffset    = useSharedValue(0);
  const dangerFlash    = useSharedValue(0);
  const glucoseShatter = useSharedValue(0);

  // Haptic snap refs (JS-side tracking)
  const lastLightSnap = useRef(-1);
  const lastCo2Snap   = useRef(400);
  const lastTempSnap  = useRef(20);
  const discLocks     = useRef({});

  // ── Frame loop ─────────────────────────────────────────────────────────────
  useFrameCallback((frame) => {
    if (!frame.timeDelta) return;
    const temp  = tempVal.value;
    const light = lightVal.value;
    const co2   = co2Val.value;
    const wave  = Math.round(waveVal.value);

    let tFactor = temp < 10 ? 0.3 : temp > 42 ? 0.15 : 1.0;
    let lFactor = interpolate(light, [0, 100, 1500, 2000], [0.05, 0.5, 1.5, 2.0], Extrapolation.CLAMP);
    let cFactor = interpolate(co2,   [50, 150, 400, 1500], [0.1,  0.4, 1.0, 1.2], Extrapolation.CLAMP);
    let wFactor = wave === 2 ? 0.1 : 1.0;

    const speed = tFactor * lFactor * cFactor * wFactor;
    globalFrame.value = (globalFrame.value + frame.timeDelta * speed * 0.0003) % 1;
  });

  // ── Danger monitor ─────────────────────────────────────────────────────────
  useAnimatedReaction(
    () => tempVal.value,
    (temp) => {
      if (temp > 45 && !dangerVal.value) {
        dangerVal.value = true;
        shakeOffset.value = withSequence(
          withTiming(5,  { duration: 40 }),
          withRepeat(withTiming(-5, { duration: 40 }), 8, true),
          withTiming(0,  { duration: 40 })
        );
        dangerFlash.value = withRepeat(withTiming(1, { duration: 280 }), -1, true);
        glucoseShatter.value = withTiming(1, { duration: 800 });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error);
      } else if (temp <= 38 && dangerVal.value) {
        dangerVal.value      = false;
        dangerFlash.value    = withTiming(0, { duration: 300 });
        glucoseShatter.value = withTiming(0, { duration: 1200 });
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      }
    }
  );

  // ── Hint monitor ───────────────────────────────────────────────────────────
  useAnimatedReaction(
    () => tempVal.value,
    (temp) => {
      if (temp > 40 && temp <= 45) {
        runOnJS(setActiveHint)('⚠️ Enzymes approaching thermal limit. Lower the temperature!');
      }
    }
  );

  // ── Discovery checks (JS side, 1-second poll) ──────────────────────────────
  const addLog = (id, title, entry, rarity) => {
    if (discLocks.current[id]) return;
    discLocks.current[id] = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUnlockedLogs(prev => [{ id, title, entry, rarity }, ...prev]);
    setActiveHint(`Discovery: ${title}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const l = lightVal.value;
      const c = co2Val.value;
      const t = tempVal.value;
      const w = Math.round(waveVal.value);

      if (l > 1200 && c < 200)
        addLog('d1', 'Light Saturation Limiting',
          "Even intense light can't make more sugar if CO₂ runs out — the light reactions outrun the Calvin cycle.", 'Uncommon');

      if (w === 2)
        addLog('d2', "Chlorophyll's Green Paradox",
          "Leaves appear green because they REFLECT green light — the one wavelength they cannot use.", 'Common');

      if (t >= 24 && t <= 26 && l > 800 && c > 800)
        addLog('d3', 'Optimal Photosynthesis State',
          "At 25°C with abundant CO₂ and saturating light, enzymes hit peak efficiency — like a rainforest leaf at noon.", 'Rare');

      if (c < 150)
        addLog('d4', 'CO₂ Starvation',
          "The light reactions keep producing energy, but RuBisCO runs in reverse — wasting energy in photorespiration.", 'Uncommon');

      if (discoveryMode && w === 0 && l > 1000)
        addLog('d5', 'Two-Photon Boost',
          "One photon isn't enough — plants chain two photosystems to give electrons enough energy to make NADPH.", 'Rare');
    }, 1000);
    return () => clearInterval(interval);
  }, [discoveryMode]);

  // ── Gestures ───────────────────────────────────────────────────────────────
  const lightPan = Gesture.Pan().onUpdate((e) => {
    let ang = Math.atan2(e.y - 45, e.x - 45) * (180 / Math.PI);
    if (ang < 0) ang += 360;
    // Map 135°..405° → 0..2000
    let nAng = ang < 90 ? ang + 360 : ang;
    nAng = Math.max(135, Math.min(405, nAng));
    const val = ((nAng - 135) / 270) * 2000;
    lightVal.value = val;

    // Haptic snaps
    if (val >= 200 && lastLightSnap.current < 200) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
    if (val < 200 && lastLightSnap.current >= 200) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
    if (val >= 1200 && lastLightSnap.current < 1200) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (val < 1200 && lastLightSnap.current >= 1200) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastLightSnap.current = val;
  });

  const co2Pan = Gesture.Pan().onUpdate((e) => {
    const py  = Math.max(0, Math.min(100, e.y));
    const val = 1500 - (py / 100) * 1450;
    co2Val.value = val;
    if (Math.abs(val - 400) < 40 && Math.abs(lastCo2Snap.current - 400) >= 40) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (Math.abs(val - 150) < 40 && Math.abs(lastCo2Snap.current - 150) >= 40) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastCo2Snap.current = val;
  });

  const tempPan = Gesture.Pan().onUpdate((e) => {
    const px  = Math.max(0, Math.min(100, e.x));
    const val = (px / 100) * 50;
    tempVal.value = val;
    if (Math.abs(val - 10) < 2 && Math.abs(lastTempSnap.current - 10) >= 2) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (Math.abs(val - 25) < 2 && Math.abs(lastTempSnap.current - 25) >= 2) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
    if (Math.abs(val - 42) < 2 && Math.abs(lastTempSnap.current - 42) >= 2) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
    }
    lastTempSnap.current = val;
  });

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const next = (Math.round(waveVal.value) + 1) % 3;
    waveVal.value = withTiming(next, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const glucoseCX = width * 0.72;
  const glucoseCY = VIEWPORT_H * 0.5;

  return (
    <GestureHandlerRootView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PHOTOSYNTHESIS LAB</Text>
        <View style={styles.led} />
      </View>

      {/* ── VIEWPORT ── */}
      <ShakeView shakeOffset={shakeOffset} style={styles.viewport}>
        <Svg width="100%" height="100%">
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
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Chloroplast */}
          <ChloroplastBody tempVal={tempVal} dangerVal={dangerVal} dangerFlash={dangerFlash} />

          {/* Grana stacks — 3 stacks × 4 discs */}
          {[0, 1, 2].map(si => (
            <G key={`stack${si}`}>
              {[0, 1, 2, 3].map(di => (
                <GranaDisc
                  key={`g${si}${di}`}
                  cx={width / 2 - 60 + si * 40}
                  cy={VIEWPORT_H / 2 - 15 + di * 10}
                  lightVal={lightVal}
                  dangerVal={dangerVal}
                />
              ))}
            </G>
          ))}

          {/* Photon particles — each is its own component with proper hooks */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <PhotonParticle
              key={`ph${i}`}
              index={i}
              globalFrame={globalFrame}
              waveVal={waveVal}
              lightVal={lightVal}
            />
          ))}

          {/* Glucose ring nodes */}
          {GLUCOSE_OFFSETS.map((off, i) => (
            <GlucoseNode
              key={`gn${i}`}
              offsetX={off.x}
              offsetY={off.y}
              centerX={glucoseCX}
              centerY={glucoseCY}
              co2Val={co2Val}
              dangerVal={dangerVal}
              glucoseShatter={glucoseShatter}
            />
          ))}

          {/* Vignette */}
          <Rect width="100%" height="100%" fill="url(#vig)" />
        </Svg>

        {/* Danger overlay as a plain View (opacity works correctly) */}
        <DangerOverlay dangerFlash={dangerFlash} dangerVal={dangerVal} />

        {/* Discovery Mode overlay */}
        {discoveryMode && (
          <View style={styles.discoveryOverlay}>
            <View style={styles.discoveryBox}>
              <Text style={styles.discTitle}>NANO-SCALE MACHINERY REVEALED</Text>
              <View style={styles.psRow}>
                <View style={[styles.protein, { backgroundColor: C.cyan }]}>
                  <Text style={styles.pText}>PS-II</Text>
                </View>
                <View style={[styles.protein, { backgroundColor: C.amber }]}>
                  <Text style={styles.pText}>PS-I</Text>
                </View>
              </View>
              <Text style={styles.obsText}>
                You are watching the nanoscale machinery of life.{'\n'}
                Every breath of oxygen came from a water molecule split here.
              </Text>
            </View>
          </View>
        )}

        {/* Discovery toggle button */}
        <TouchableOpacity style={styles.magBtn} onPress={() => setDiscoveryMode(d => !d)}>
          <Ionicons name={discoveryMode ? 'close-circle' : 'search'} size={28} color={C.cyan} />
        </TouchableOpacity>
      </ShakeView>

      {/* ── CONTROL PANEL ── */}
      <View style={styles.panel}>

        {/* Row 1: Light Dial + CO2 Slider */}
        <View style={styles.panelRow}>

          {/* Light intensity rotary dial */}
          <View style={styles.instBox}>
            <GestureDetector gesture={lightPan}>
              <View style={styles.dialContainer}>
                <Svg width={90} height={90}>
                  <Circle cx="45" cy="45" r="40" fill={C.steel} stroke={C.amber} strokeWidth="2" />
                  <Circle cx="15" cy="75" r="3" fill="#666" />
                  <Circle cx="75" cy="75" r="3" fill="#666" />
                  <DialNeedle lightVal={lightVal} />
                </Svg>
              </View>
            </GestureDetector>
            <LcdLight lightVal={lightVal} />
          </View>

          {/* CO2 vertical slider */}
          <View style={styles.instBox}>
            <GestureDetector gesture={co2Pan}>
              <View style={styles.sliderContainer}>
                <Svg width={40} height={100}>
                  <Rect x="15" y="0" width="10" height="100" fill="#333" rx="5" />
                  <SliderHandle co2Val={co2Val} />
                </Svg>
              </View>
            </GestureDetector>
            <LcdCo2 co2Val={co2Val} />
          </View>
        </View>

        {/* Row 2: Temperature Gauge + Wavelength Toggle */}
        <View style={styles.panelRow}>

          {/* Temperature gauge */}
          <View style={styles.instBox}>
            <GestureDetector gesture={tempPan}>
              <View style={styles.gaugeContainer}>
                <Svg width={100} height={60}>
                  <Path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#555" strokeWidth="10" />
                  <Path d="M 72 18 A 40 40 0 0 1 90 50" fill="none" stroke={C.red}   strokeWidth="10" />
                  <Path d="M 38 16 A 40 40 0 0 1 62 16" fill="none" stroke={C.green} strokeWidth="4"  />
                  <TempNeedle tempVal={tempVal} />
                  <Circle cx="50" cy="50" r="5" fill={C.text} />
                </Svg>
              </View>
            </GestureDetector>
            <LcdTemp tempVal={tempVal} />
          </View>

          {/* Wavelength toggle */}
          <View style={styles.instBox}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleToggle} style={styles.toggleContainer}>
              <Svg width={80} height={40}>
                <Rect x="0" y="5" width="80" height="30" rx="15" fill="#333" />
                <ToggleKnob waveVal={waveVal} />
              </Svg>
            </TouchableOpacity>
            <LcdWave waveVal={waveVal} />
          </View>
        </View>
      </View>

      {/* ── RESEARCH LOG BAR ── */}
      <TouchableOpacity style={styles.logBar} onPress={() => setLogsOpen(true)}>
        <Ionicons name="journal-outline" size={24} color={C.amber} />
        <Text style={styles.logHintText} numberOfLines={1}>{activeHint}</Text>
      </TouchableOpacity>

      {/* ── LOG MODAL ── */}
      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Research Logs</Text>
              <TouchableOpacity onPress={() => setLogsOpen(false)}>
                <Ionicons name="close" size={28} color={C.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logScroll}>
              {unlockedLogs.length === 0 ? (
                <Text style={styles.emptyLog}>
                  Explore the controls to discover hidden scientific facts!
                </Text>
              ) : (
                unlockedLogs.map(log => (
                  <View key={log.id} style={styles.logCard}>
                    <Text style={styles.logCardTitle}>
                      {log.title}{' '}
                      <Text style={{ fontSize: 12, color: C.amber }}>({log.rarity})</Text>
                    </Text>
                    <Text style={styles.logCardDesc}>{log.entry}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </GestureHandlerRootView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       {
    height: HEADER_H, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20,
    backgroundColor: '#050508', borderBottomWidth: 1,
    borderBottomColor: '#222', paddingTop: 30,
  },
  headerTitle:  { color: '#888', fontSize: 16, letterSpacing: 3, fontWeight: '800' },
  led:          {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#FFB347',
    shadowColor: '#FFB347', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 6,
  },
  viewport:     { height: VIEWPORT_H, width, backgroundColor: C.bg, overflow: 'hidden' },
  magBtn:       {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#112233', padding: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#005588',
  },
  discoveryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,10,30,0.88)',
    justifyContent: 'center', alignItems: 'center',
  },
  discoveryBox: {
    padding: 20, borderWidth: 1, borderColor: C.cyan,
    borderRadius: 15, backgroundColor: '#0A1A25', width: width * 0.85,
  },
  discTitle:  { color: C.cyan, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', letterSpacing: 1 },
  psRow:      { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  protein:    { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  pText:      { color: '#000', fontWeight: '900' },
  obsText:    { color: C.text, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  panel:      {
    height: PANEL_H, backgroundColor: C.panel,
    borderTopWidth: 2, borderTopColor: '#333',
    padding: 10, justifyContent: 'space-evenly',
  },
  panelRow:   { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  instBox:    { alignItems: 'center', width: width / 2 - 20 },
  dialContainer:   { width: 90,  height: 90,  margin: 5 },
  sliderContainer: { width: 40,  height: 100, margin: 5 },
  gaugeContainer:  { width: 100, height: 60,  margin: 5 },
  toggleContainer: { width: 80,  height: 40,  margin: 5, justifyContent: 'center' },
  lcdText: {
    color: C.green, fontFamily: 'monospace', fontSize: 12,
    marginTop: 5, backgroundColor: '#050505',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1, borderColor: '#111',
    overflow: 'hidden', textAlign: 'center', minWidth: 140,
  },
  logBar:     {
    height: LOG_H, backgroundColor: '#1A1A1A',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
  },
  logHintText: { color: '#888', marginLeft: 15, fontSize: 13, flex: 1, fontStyle: 'italic' },
  modalBg:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: {
    height: height * 0.7, backgroundColor: C.panel,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle:   { color: C.amber, fontSize: 20, fontWeight: 'bold' },
  logScroll:    { flex: 1 },
  emptyLog:     { color: '#666', textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
  logCard: {
    backgroundColor: '#1E1E28', padding: 15, borderRadius: 10,
    marginBottom: 10, borderLeftWidth: 3, borderLeftColor: C.amber,
  },
  logCardTitle: { color: C.text, fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  logCardDesc:  { color: '#CCC', fontSize: 14, lineHeight: 20 },
});