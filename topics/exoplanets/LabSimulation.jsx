import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

const STARS = [
  { id: 'red_dwarf', label: 'Red Dwarf', temp: 3000, lum: 0.1, color: '#FF4444', zone: [30, 60] },
  { id: 'sun_like', label: 'Sun-Like', temp: 5800, lum: 1.0, color: '#FFD166', zone: [80, 130] },
  { id: 'blue_giant', label: 'Blue Giant', temp: 15000, lum: 100, color: '#00D4FF', zone: [180, 260] },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function ExoplanetLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── State ──────────────────────────────────────
  const [star, setStar] = useState(STARS[1]);
  const [orbitDist, setOrbitDist] = useState(100);
  const [pSize, setPSize] = useState(1); // 1 = Earth, 5 = Jupiter
  const [isOrbiting, setIsOrbiting] = useState(true);
  
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const transitAnim = useRef(new Animated.Value(1)).current; // Star luminosity multiplier

  // ── Derived ───────────────────────────────────
  const orbitalPeriod = useMemo(() => {
    // P^2 ~ a^3 / M
    return Math.sqrt(Math.pow(orbitDist, 3) / (star.lum * 10)) * 50;
  }, [orbitDist, star]);

  const planetTemp = useMemo(() => {
    // Basic Stefan-Boltzmann simplified: T ~ L^0.25 / d^0.5
    const temp = 288 * Math.pow(star.lum, 0.25) / Math.sqrt(orbitDist / 100);
    return Math.round(temp);
  }, [orbitDist, star]);

  const habitability = useMemo(() => {
    if (planetTemp > 373) return { label: 'SCORCHED', color: '#FF4444' };
    if (planetTemp < 200) return { label: 'FROZEN', color: '#4ECDC4' };
    if (planetTemp >= 273 && planetTemp <= 373) return { label: 'GOLDILOCKS', color: '#00D4A0' };
    return { label: 'UNSTABLE', color: '#FF9F1C' };
  }, [planetTemp]);

  // ── Animation Loop ─────────────────────────────
  useEffect(() => {
    orbitAnim.setValue(0);
    if (isOrbiting) {
      Animated.loop(
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: orbitalPeriod,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      orbitAnim.stopAnimation();
    }
  }, [orbitalPeriod, isOrbiting]);

  // Monitor transit for graph effect
  useEffect(() => {
    const listener = orbitAnim.addListener(({ value }) => {
      // Transit happens around 0.25 and 0.75 (front and back)
      // We only care about the front (let's say 0.25 is front)
      const dist = Math.abs(value - 0.25);
      if (dist < 0.05) {
        // Dip happens
        const dip = 1 - (pSize * 0.05); // 5% dip for Jupiter-size
        transitAnim.setValue(dip);
      } else {
        transitAnim.setValue(1);
      }
    });
    return () => orbitAnim.removeListener(listener);
  }, [pSize]);

  // ── Handlers ───────────────────────────────────
  const changeStar = (s) => {
    soundWhoosh();
    setStar(s);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const adjustOrbit = (delta) => {
    setOrbitDist(prev => Math.max(20, Math.min(280, prev + delta)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const adjustSize = (delta) => {
    setPSize(prev => Math.max(0.2, Math.min(6, prev + delta)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderPlanet = () => {
    return (
      <AnimatedG 
        transform={[
          { translateX: SIM_W/2 },
          { translateY: SIM_H/2 },
          { rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
          { translateX: orbitDist },
          { rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }
        ]}>
          <Circle cx="0" cy="0" r={pSize * 8} fill="url(#planetGlow)" />
          <Circle cx="0" cy="0" r={pSize * 5} fill={isDark ? '#222' : '#888'} stroke={habitability.color} strokeWidth="1" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Star Selection ── */}
      <View style={styles.tabRow}>
        {STARS.map(s => (
          <TouchableOpacity key={s.id} onPress={() => changeStar(s)}
            style={[styles.tab, star.id === s.id && { backgroundColor: s.color, borderColor: s.color }]}>
            <Text style={[styles.tabText, star.id === s.id && { color: '#000' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* ── Simulation ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
        <Svg width={SIM_W} height={SIM_H}>
          <Defs>
            <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={star.color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={star.color} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={habitability.color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={habitability.color} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Background Stars */}
          {[...Array(20)].map((_, i) => (
             <Circle key={i} cx={Math.random()*SIM_W} cy={Math.random()*SIM_H} r="0.5" fill="#fff" opacity={0.3} />
          ))}

          {/* Zones */}
          <Circle cx={SIM_W/2} cy={SIM_H/2} r={star.zone[1]} fill="none" stroke="#222" strokeWidth={star.zone[1] - star.zone[0]} opacity={0.2} />
          <Circle cx={SIM_W/2} cy={SIM_H/2} r={star.zone[0]} fill="none" stroke="#00D4A0" strokeWidth="1" opacity={0.1} />
          <Circle cx={SIM_W/2} cy={SIM_H/2} r={star.zone[1]} fill="none" stroke="#00D4A0" strokeWidth="1" opacity={0.1} />

          {/* Star */}
          <Circle cx={SIM_W/2} cy={SIM_H/2} r="35" fill="url(#starGlow)" />
          <Circle cx={SIM_W/2} cy={SIM_H/2} r="25" fill={star.color} />

          {/* Orbit Path */}
          <Circle cx={SIM_W/2} cy={SIM_H/2} r={orbitDist} fill="none" stroke="#444" strokeWidth="0.5" strokeDasharray="5,5" />

          {/* Planet */}
          {renderPlanet()}

          {/* Info Overlays */}
          <SvgText x={20} y={30} fill="#fff" fontSize="12" fontFamily={FONTS.displayBold}>{habitability.label}</SvgText>
          <SvgText x={20} y={50} fill="rgba(255,255,255,0.6)" fontSize="10">{planetTemp} K</SvgText>

          {scientistMode && (
             <G>
               <SvgText x={SIM_W - 100} y={30} fill="#FFD166" fontSize="8">PERIOD: {(orbitalPeriod/1000).toFixed(2)}s</SvgText>
               <SvgText x={SIM_W - 100} y={42} fill="#FFD166" fontSize="8">VELOCITY: {(2 * Math.PI * orbitDist / orbitalPeriod * 1000).toFixed(1)} orbital_u/s</SvgText>
             </G>
          )}
        </Svg>

        {/* Transit Graph View (Bottom) */}
        <View style={styles.graphBox}>
           <Text style={styles.graphLabel}>TRANSIT LIGHT CURVE</Text>
           <View style={styles.graphContainer}>
              <Animated.View style={[styles.graphLine, { 
                height: 2, 
                backgroundColor: '#FFD166',
                transform: [{ translateY: transitAnim.interpolate({ inputRange: [0.7, 1], outputRange: [10, 0] }) }] 
              }]} />
              <View style={styles.baseline} />
           </View>
        </View>
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlRow}>
          <View style={styles.controlGroup}>
             <Text style={styles.label}>ORBIT DISTANCE</Text>
             <View style={styles.btnRow}>
                <TouchableOpacity onPress={() => adjustOrbit(-10)} style={styles.smallBtn}><Icon name="minus" size={14} color="#fff" /></TouchableOpacity>
                <Text style={styles.valText}>{orbitDist} AU</Text>
                <TouchableOpacity onPress={() => adjustOrbit(10)} style={styles.smallBtn}><Icon name="plus" size={14} color="#fff" /></TouchableOpacity>
             </View>
          </View>
          <View style={styles.controlGroup}>
             <Text style={styles.label}>PLANET SIZE</Text>
             <View style={styles.btnRow}>
                <TouchableOpacity onPress={() => adjustSize(-0.5)} style={styles.smallBtn}><Icon name="minus" size={14} color="#fff" /></TouchableOpacity>
                <Text style={styles.valText}>{pSize.toFixed(1)} r⊕</Text>
                <TouchableOpacity onPress={() => adjustSize(0.5)} style={styles.smallBtn}><Icon name="plus" size={14} color="#fff" /></TouchableOpacity>
             </View>
          </View>
      </View>

      <TouchableOpacity style={styles.missionBtn} onPress={() => soundBadge()}>
         <Text style={styles.missionText}>CAPTURE BIOSIGNATURE SCAN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontFamily: FONTS.displayBold, fontSize: 10, color: '#888' },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  graphBox: { position: 'absolute', bottom: 10, left: 20, right: 20, height: 40 },
  graphLabel: { fontSize: 7, color: '#666', fontFamily: FONTS.displayBold, marginBottom: 4 },
  graphContainer: { height: 20, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#333', justifyContent: 'center' },
  graphLine: { width: '100%' },
  baseline: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#222', top: 10 },

  controlRow: { flexDirection: 'row', gap: 20, marginTop: 16 },
  controlGroup: { flex: 1 },
  label: { fontSize: 8, color: '#888', fontFamily: FONTS.displayBold, marginBottom: 6, letterSpacing: 1 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: RADIUS.sm },
  smallBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  valText: { color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold, flex: 1, textAlign: 'center' },

  missionBtn: { marginTop: 20, backgroundColor: '#6C63FF', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  missionText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 12, letterSpacing: 1 }
});
