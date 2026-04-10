import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, PanResponder, ScrollView
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Rect, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_WIDTH = width - 40;
const SIM_HEIGHT = 320;
const GROUND_Y = SIM_HEIGHT - 40;
const GRAVITY_EARTH = 9.8;

// ─────────────────────────────────────────────
//  GRAVITY LAB — Interactive simulation
//  Controls: gravity (planet selector), object, air resistance
//  Scientist Mode unlocks: mass slider, show velocity vectors
// ─────────────────────────────────────────────

const PLANETS = [
  { name: 'Moon',    g: 1.6,  color: '#A8EDEA', emoji: '🌙' },
  { name: 'Mars',    g: 3.7,  color: '#FF6B4A', emoji: '🔴' },
  { name: 'Earth',   g: 9.8,  color: '#00E5A0', emoji: '🌍' },
  { name: 'Venus',   g: 8.9,  color: '#FFD166', emoji: '🪐' },
  { name: 'Jupiter', g: 24.8, color: '#FF9F1C', emoji: '🟠' },
  { name: 'Custom',  g: null, color: '#C3B1E1', emoji: '⚙️' },
];

const OBJECTS = [
  { name: 'Ball',     mass: 1,   emoji: '🏀', color: '#FF9F1C', size: 22 },
  { name: 'Feather',  mass: 0.01, emoji: '🪶', color: '#E8E8E8', size: 14 },
  { name: 'Hammer',   mass: 5,   emoji: '🔨', color: '#888',    size: 26 },
  { name: 'Balloon',  mass: 0.1, emoji: '🎈', color: '#FF6B9D', size: 20 },
  { name: 'Car',      mass: 50,  emoji: '🚗', color: '#4ECDC4', size: 32 },
];

export default function GravityLab({ scientistMode = false, accentColor = '#6C63FF', onLabBreaker }) {
  const [selectedPlanet, setSelectedPlanet] = useState(2); // Earth
  const [selectedObject, setSelectedObject] = useState(0); // Ball
  const [customG, setCustomG] = useState(9.8);
  const [airResistance, setAirResistance] = useState(0); // 0-1
  const [isDropping, setIsDropping] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);
  const [fallTime, setFallTime] = useState(null);
  const [velocity, setVelocity] = useState(0);
  const [compareMode, setCompareMode] = useState(false);

  const ballY = useRef(new Animated.Value(40)).current;
  const featherY = useRef(new Animated.Value(40)).current;
  const intervalRef = useRef(null);
  const startTime = useRef(null);
  const velRef = useRef(0);
  const posRef = useRef(0);
  const posFeatherRef = useRef(0);
  const velFeatherRef = useRef(0);

  const getG = () => {
    const p = PLANETS[selectedPlanet];
    return p.g !== null ? p.g : customG;
  };

  const getObj = () => OBJECTS[selectedObject];

  const resetSim = () => {
    clearInterval(intervalRef.current);
    ballY.setValue(40);
    featherY.setValue(40);
    setIsDropping(false);
    setHasDropped(false);
    setFallTime(null);
    setVelocity(0);
    velRef.current = 0;
    posRef.current = 0;
    posFeatherRef.current = 0;
    velFeatherRef.current = 0;
  };

  const startDrop = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetSim();

    // Check for lab breaker (extreme values)
    const g = getG();
    if ((g <= 0.5 || g >= 20) && onLabBreaker) {
      setTimeout(() => onLabBreaker(), 500);
    }

    setIsDropping(true);
    setHasDropped(true);
    startTime.current = Date.now();
    posRef.current = 0;
    velRef.current = 0;
    posFeatherRef.current = 0;
    velFeatherRef.current = 0;

    const OBJECT_START = 40;
    const FALL_DISTANCE = GROUND_Y - OBJECT_START - getObj().size;
    const DT = 0.016; // ~60fps

    let mainLanded = false;
    let featherLanded = false;

    intervalRef.current = setInterval(() => {
      const g = getG();
      const obj = getObj();

      // Main object physics
      if (!mainLanded) {
        const drag = airResistance * 0.5 * velRef.current * velRef.current * 0.01 * (1 / Math.max(obj.mass, 0.01));
        velRef.current = velRef.current + (g - drag) * DT;
        posRef.current = posRef.current + velRef.current * DT * 50;
        setVelocity(Math.round(velRef.current * 10) / 10);

        if (posRef.current >= FALL_DISTANCE) {
          posRef.current = FALL_DISTANCE;
          mainLanded = true;
          ballY.setValue(OBJECT_START + posRef.current);
          setFallTime(Math.round((Date.now() - startTime.current) / 10) / 100);
          setIsDropping(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          ballY.setValue(OBJECT_START + posRef.current);
        }
      }

      // Feather in compare mode (always with air resistance)
      if (compareMode && !featherLanded) {
        const featherDrag = 0.8 * velFeatherRef.current * velFeatherRef.current * 0.05;
        velFeatherRef.current = Math.max(0, velFeatherRef.current + (g - featherDrag) * DT);
        posFeatherRef.current = posFeatherRef.current + velFeatherRef.current * DT * 50;
        if (posFeatherRef.current >= FALL_DISTANCE) {
          posFeatherRef.current = FALL_DISTANCE;
          featherLanded = true;
        }
        featherY.setValue(OBJECT_START + posFeatherRef.current);
      }

      if (mainLanded && (!compareMode || featherLanded)) {
        clearInterval(intervalRef.current);
      }
    }, 16);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const planet = PLANETS[selectedPlanet];
  const obj = getObj();
  const g = getG();

  // Estimated fall time (GROUND_Y - 40 - obj.size pixels / ~50px per m)
  const pixelsPerMeter = 50;
  const fallDistMeters = (GROUND_Y - 40 - obj.size) / pixelsPerMeter;
  const estimatedTime = Math.sqrt(2 * fallDistMeters / g).toFixed(2);

  return (
    <View style={styles.container}>
      {/* Planet selector */}
      <Text style={styles.sectionLabel}>🪐 Choose a Planet</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {PLANETS.map((p, i) => (
          <TouchableOpacity
            key={p.name}
            onPress={() => { soundTap(); setSelectedPlanet(i); resetSim(); }}
            style={[styles.chip, selectedPlanet === i && { backgroundColor: p.color + '30', borderColor: p.color }]}
          >
            <Text style={styles.chipEmoji}>{p.emoji}</Text>
            <Text style={[styles.chipText, selectedPlanet === i && { color: p.color }]}>{p.name}</Text>
            {p.g && <Text style={[styles.chipSub, selectedPlanet === i && { color: p.color + 'AA' }]}>{p.g} m/s²</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Custom gravity slider */}
      {selectedPlanet === 5 && (
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Custom g: {customG.toFixed(1)} m/s²</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${(customG / 30) * 100}%`, backgroundColor: planet.color }]} />
          </View>
          <View style={styles.sliderButtons}>
            {[0, 2, 5, 9.8, 15, 24.8, 30].map(v => (
              <TouchableOpacity key={v} onPress={() => { setCustomG(v); resetSim(); }}
                style={[styles.smallBtn, customG === v && { backgroundColor: planet.color + '30', borderColor: planet.color }]}>
                <Text style={[styles.smallBtnText, customG === v && { color: planet.color }]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Object selector */}
      <Text style={styles.sectionLabel}>📦 Choose an Object</Text>
      <View style={styles.objectRow}>
        {OBJECTS.map((o, i) => (
          <TouchableOpacity
            key={o.name}
            onPress={() => { soundTap(); setSelectedObject(i); resetSim(); }}
            style={[styles.objectChip, selectedObject === i && { backgroundColor: o.color + '25', borderColor: o.color }]}
          >
            <Text style={styles.objEmoji}>{o.emoji}</Text>
            <Text style={[styles.objText, selectedObject === i && { color: o.color }]}>{o.name}</Text>
            {scientistMode && <Text style={styles.objMass}>{o.mass}kg</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Air resistance (scientist mode) */}
      {scientistMode && (
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>💨 Air Resistance: {Math.round(airResistance * 100)}%</Text>
          <View style={styles.sliderButtons}>
            {[0, 0.2, 0.5, 0.8, 1.0].map(v => (
              <TouchableOpacity key={v} onPress={() => { setAirResistance(v); resetSim(); }}
                style={[styles.smallBtn, airResistance === v && { backgroundColor: '#4ECDC430', borderColor: '#4ECDC4' }]}>
                <Text style={[styles.smallBtnText, airResistance === v && { color: '#4ECDC4' }]}>{Math.round(v * 100)}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Compare mode */}
      <TouchableOpacity onPress={() => { setCompareMode(!compareMode); resetSim(); soundTap(); }}
        style={[styles.toggleBtn, compareMode && { backgroundColor: '#FF6B9D20', borderColor: '#FF6B9D' }]}>
        <Text style={[styles.toggleText, compareMode && { color: '#FF6B9D' }]}>
          🪶 {compareMode ? 'Comparing: Ball vs Feather' : 'Compare Ball vs Feather (with air)'}
        </Text>
      </TouchableOpacity>

      {/* Simulation canvas */}
      <View style={[styles.simContainer, { borderColor: accentColor + '40' }]}>
        {/* Background grid */}
        <Svg width={SIM_WIDTH} height={SIM_HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="bgGrad" cx="50%" cy="0%" r="80%">
              <Stop offset="0%" stopColor={accentColor} stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SIM_WIDTH} height={SIM_HEIGHT} fill="url(#bgGrad)" />
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Line key={i} x1="0" y1={i * 52 + 40} x2={SIM_WIDTH} y2={i * 52 + 40}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {/* Ground */}
          <Line x1="0" y1={GROUND_Y} x2={SIM_WIDTH} y2={GROUND_Y}
            stroke={accentColor} strokeWidth="2" strokeOpacity="0.5" />
          <Rect x="0" y={GROUND_Y} width={SIM_WIDTH} height={40}
            fill={accentColor} fillOpacity="0.05" />
          <SvgText x="8" y={GROUND_Y + 20} fontSize="11" fill={accentColor} fillOpacity="0.6"
            fontFamily="monospace">GROUND</SvgText>
          {/* Planet label */}
          <SvgText x={SIM_WIDTH - 8} y="24" fontSize="11" fill={planet.color} fillOpacity="0.8"
            textAnchor="end" fontFamily="monospace">{planet.emoji} {planet.name} — g = {g} m/s²</SvgText>
          {/* Velocity vector (scientist mode) */}
          {scientistMode && isDropping && velocity > 0 && (
            <>
              <Line x1={SIM_WIDTH / 2} y1={40 + posRef.current}
                x2={SIM_WIDTH / 2} y2={Math.min(40 + posRef.current + velocity * 4, GROUND_Y - 10)}
                stroke="#FFD166" strokeWidth="2" markerEnd="url(#arrow)" />
              <SvgText x={SIM_WIDTH / 2 + 10} y={40 + posRef.current + velocity * 2}
                fontSize="11" fill="#FFD166" fontFamily="monospace">{velocity} m/s</SvgText>
            </>
          )}
        </Svg>

        {/* Animated ball */}
        <Animated.View style={[styles.ball, {
          top: ballY,
          left: SIM_WIDTH / 2 - obj.size / 2,
          width: obj.size,
          height: obj.size,
          borderRadius: obj.size / 2,
          backgroundColor: obj.color,
          borderWidth: 1,
          borderColor: obj.color + '80',
        }]}>
          <Text style={{ fontSize: obj.size * 0.7, textAlign: 'center' }}>{obj.emoji}</Text>
        </Animated.View>

        {/* Feather in compare mode */}
        {compareMode && (
          <Animated.View style={[styles.ball, {
            top: featherY,
            left: SIM_WIDTH / 2 + 40,
            width: 20,
            height: 20,
            borderRadius: 10,
          }]}>
            <Text style={{ fontSize: 16, textAlign: 'center' }}>🪶</Text>
          </Animated.View>
        )}

        {/* Fall time overlay */}
        {fallTime && (
          <View style={styles.resultOverlay}>
            <Text style={[styles.resultTime, { color: accentColor }]}>⏱ {fallTime}s</Text>
            <Text style={styles.resultSub}>final speed: {Math.round(velRef.current * 10) / 10} m/s</Text>
          </View>
        )}
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Gravity</Text>
          <Text style={[styles.statValue, { color: planet.color }]}>{g} m/s²</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Object</Text>
          <Text style={styles.statValue}>{obj.emoji} {obj.name}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Est. time</Text>
          <Text style={[styles.statValue, { color: accentColor }]}>~{estimatedTime}s</Text>
        </View>
        {isDropping && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Velocity</Text>
            <Text style={[styles.statValue, { color: COLORS.xpGold }]}>{velocity} m/s</Text>
          </View>
        )}
      </View>

      {/* Drop button */}
      <TouchableOpacity onPress={isDropping ? null : startDrop} style={[styles.dropBtn, { borderColor: accentColor }]}>
        <LinearGradient
          colors={isDropping ? ['#333', '#222'] : [accentColor + 'CC', accentColor + '88']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.dropBtnGrad}
        >
          <Text style={styles.dropBtnText}>
            {isDropping ? '⏳ Falling...' : hasDropped ? '🔄 Drop Again' : '⬇️ Drop!'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Fun fact */}
      {hasDropped && fallTime && (
        <View style={[styles.funFact, { borderColor: accentColor + '40' }]}>
          <Text style={styles.funFactText}>
            {g === 0
              ? "🤯 No gravity! The object floats forever — like deep space."
              : g < 3
              ? `🌙 On ${planet.name}, you could jump ${(3.5 / g * 1.5).toFixed(1)}× higher than on Earth!`
              : g > 20
              ? `🟠 On ${planet.name}, you'd feel ${(g / 9.8).toFixed(1)}× heavier. Standing up would be exhausting!`
              : `🌍 On Earth, ${obj.name} hit ground at ${Math.round(velRef.current * 3.6)} km/h — ${velRef.current > 50 ? 'ouch! 💥' : 'pretty fast!'}`
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
  },
  sectionLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
    marginRight: 8,
    minWidth: 70,
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  chipSub: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  objectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  objectChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
    minWidth: 58,
  },
  objEmoji: {
    fontSize: 22,
  },
  objText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  objMass: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  sliderRow: {
    marginVertical: 12,
  },
  sliderLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.glass3,
    borderRadius: 2,
    marginBottom: 10,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
  },
  smallBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  simContainer: {
    width: SIM_WIDTH,
    height: SIM_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: COLORS.glass1,
    marginTop: 16,
    position: 'relative',
  },
  ball: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  resultTime: {
    fontFamily: FONTS.displayMedium,
    fontSize: 22,
  },
  resultSub: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 12,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statValue: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  dropBtn: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  dropBtnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dropBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  funFact: {
    marginTop: 12,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.glass1,
  },
  funFactText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
