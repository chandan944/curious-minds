import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop, Circle, G, Path, Line, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const TIMELINE = [
  { id: 'singular', label: 'Singularity', time: '0s', temp: 'Infinite', a: 0, z: 'Inf', icon: 'blackhole', color: '#FFF' },
  { id: 'inflated', label: 'Inflation', time: '10^-36s', temp: '10^28 K', a: 1e-12, z: '10^28', icon: 'zap', color: '#FF3131' },
  { id: 'soup', label: 'Quark Soup', time: '10^-6s', temp: '10^13 K', a: 1e-6, z: '10^13', icon: 'sun', color: '#FFD166' },
  { id: 'atomic', label: 'Nucleogenesis', time: '3 min', temp: '10^9 K', a: 0.1, z: '10^9', icon: 'atom', color: '#10B981' },
  { id: 'recom', label: 'First Light', time: '380k yr', temp: '3000 K', a: 1100, z: '1100', icon: 'sun', color: '#00E5FF' },
  { id: 'modern', label: 'Today', time: '13.8B yr', temp: '2.7 K', a: '1.0 (Ref)', z: '0', icon: 'earth', color: '#F8FAFC' },
];

const CHALLENGES = [
  { id: 'ignite', title: 'Cosmic Ignition', desc: 'Trigger the Inflation phase from the Singularity', icon: 'zap', color: '#FF3131' },
  { id: 'light', title: 'Let There Be Light', desc: 'Reach the Recombination era (380,000 years)', icon: 'sun', color: '#FFD166' },
  { id: 'cooling', title: 'Absolute Zero-ish', desc: 'Evolve the universe to the Modern era (2.7 K)', icon: 'earth', color: '#00E5FF' },
  { id: 'math_god', title: 'Redshift Master', desc: 'View analytics with z > 1,000,000 in Scholar Mode', icon: 'target', color: '#A855F7' },
];

// ── Animated SVG components must be defined before JSX use ──
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BigBangLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [tIdx, setTIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const challengePopAnim = useRef(new Animated.Value(0)).current;

  const resetLab = () => {
    setTIdx(0);
    setRunning(false);
    scaleAnim.setValue(0);
    pulseAnim.setValue(0);
  };

  const triggerChallenge = useCallback((cid) => {
    if (completedChallenges.includes(cid)) return;
    const ch = CHALLENGES.find(c => c.id === cid);
    setLastChallengeMsg(ch);
    soundBadge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    challengePopAnim.setValue(0);
    Animated.sequence([
      Animated.spring(challengePopAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(challengePopAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLastChallengeMsg(null));
    setCompleted(prev => [...prev, cid]);
  }, [completedChallenges]);

  const advance = () => {
    if (tIdx >= TIMELINE.length - 1) return;
    soundWhoosh();
    setRunning(true);
    
    const nextIdx = tIdx + 1;
    const item = TIMELINE[nextIdx];
    
    // Animation logic
    if (item.id === 'inflated') {
       triggerChallenge('ignite');
       Animated.parallel([
         Animated.timing(scaleAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
         Animated.sequence([
           Animated.timing(pulseAnim, { toValue: 1, duration: 50, useNativeDriver: false }),
           Animated.timing(pulseAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
         ])
       ]).start(() => { setTIdx(nextIdx); setRunning(false); });
    } else {
       if (item.id === 'recom') triggerChallenge('light');
       if (item.id === 'modern') triggerChallenge('cooling');
       
       Animated.timing(scaleAnim, { 
         toValue: nextIdx === 5 ? 1 : 0.1 + (nextIdx * 0.15), 
         duration: 1000, 
         useNativeDriver: true 
       }).start(() => { setTIdx(nextIdx); setRunning(false); });
    }

    if (scientistMode && (item.id === 'inflated' || item.id === 'soup')) {
       triggerChallenge('math_god');
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const current = TIMELINE[tIdx];
  const nextItem = tIdx < TIMELINE.length - 1 ? TIMELINE[tIdx + 1] : null;

  const renderBackgroundGrid = () => {
    return (
      <AnimatedG 
        opacity={0.1} 
        transform={[{ scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }]}
      >
        {[...Array(10)].map((_, i) => (
          <Line key={`h-${i}`} x1="0" y1={i*40} x2={SIM_W} y2={i*40} stroke="#FFF" strokeWidth="1" />
        ))}
        {[...Array(10)].map((_, i) => (
          <Line key={`v-${i}`} x1={i*40} y1="0" x2={i*40} y2={SIM_H} stroke="#FFF" strokeWidth="1" />
        ))}
      </AnimatedG>
    );
  };

  const renderUniverseCore = () => {
    return (
      <AnimatedG transform={[{ scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 120] }) }]}>
        <Circle cx={SIM_W/2} cy={SIM_H/2} r="1" fill="url(#coreGlow)" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard/Popups ── */}
      {lastChallengeMsg && (
        <Animated.View style={[styles.challengePopup, {
          opacity: challengePopAnim, backgroundColor: lastChallengeMsg.color + '20', borderColor: lastChallengeMsg.color + '60',
          transform: [{ translateY: challengePopAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <Icon name="trophy" size={18} color={lastChallengeMsg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengePopTitle, { color: lastChallengeMsg.color }]}>Challenge Complete!</Text>
            <Text style={[styles.challengePopDesc, { color: txt2 }]}>{lastChallengeMsg.title}</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Status View ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <View style={styles.vLine} />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>COSMIC ERA</Text>
               <Text style={[styles.sValue, { color: current.color }]}>{current.label}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={[styles.sLabel, { color: txtM }]}>T +</Text>
               <Text style={[styles.sValue, { color: '#00E5FF' }]}>{current.time}</Text>
            </View>
         </View>
      </View>

      {/* ── Expansion View ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#000' : '#111' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={current.color} stopOpacity="1" />
                <Stop offset="40%" stopColor={current.color} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={current.color} stopOpacity="0" />
             </RadialGradient>
           </Defs>
           
           {/* Background Grid - Warping with Expansion */}
           {renderBackgroundGrid()}

           {/* The Universe Core */}
           {renderUniverseCore()}

           {/* Inflation Pulsar */}
           <AnimatedCircle cx={SIM_W/2} cy={SIM_H/2} r={pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 150] })} 
             stroke="#FF3131" strokeWidth="2" fill="transparent" opacity={pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] })} />

           <SvgText x={SIM_W/2} y={SIM_H - 15} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">
             SCALE FACTOR (a): {scientistMode ? current.a : (tIdx === 0 ? '0' : 'Expanding...')}
           </SvgText>
        </Svg>
      </View>

      {/* ── Action Control ── */}
      <View style={styles.btnRow}>
         <TouchableOpacity onPress={resetLab} style={[styles.btn, { borderBottomLeftRadius: RADIUS.md, borderTopLeftRadius: RADIUS.md }]}>
            <Text style={[styles.btnText, { color: txt2 }]}>REWIND</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={advance} disabled={running || !nextItem}
           style={[styles.btn, styles.btnMain, { borderBottomRightRadius: RADIUS.md, borderTopRightRadius: RADIUS.md, borderColor: nextItem && !running ? '#A855F7' : border }]}>
            <Text style={[styles.btnText, { color: nextItem && !running ? '#A855F7' : txtM }]}>
               {running ? 'BENDING SPACETIME...' : nextItem ? `ADVANCE TO ${nextItem.label.toUpperCase()}` : 'MAX EXPANSION REACHED'}
            </Text>
         </TouchableOpacity>
      </View>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="rocket" size={14} color="#A855F7" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Cosmological Analytics 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>TEMPERATURE (K)</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{current.temp}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>REDSHIFT (z)</Text>
                 <Text style={[styles.statValue, { color: '#00D4FF' }]}>{current.z}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>HUBBLE PARAM (H)</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>{tIdx < 2 ? 'MAX' : (70 / (tIdx+1)).toFixed(1)} km/s/Mpc</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>DENSITY PARAM (Ω)</Text>
                 <Text style={[styles.statValue, { color: '#10B981' }]}>{tIdx === 0 ? 'Infinite' : (1.0).toFixed(4)}</Text>
              </View>
           </View>
           <View style={styles.sciNote}>
             <Icon name="info" size={12} color={txtM} />
             <Text style={[styles.sciNoteText, { color: txtM }]}>
               {"Friedmann Eq: expansion depends on mass-energy density $ρ$."}
             </Text>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Cosmic Missions ({completedChallenges.length}/4)</Text>
        </View>
        {CHALLENGES.map(c => {
          const done = completedChallenges.includes(c.id);
          return (
            <View key={c.id} style={styles.challengeItem}>
              <View style={[styles.cIcon, { backgroundColor: done ? c.color + '20' : glass2 }]}>
                <Icon name={done ? 'check' : c.icon} size={14} color={done ? c.color : txtM} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cTitle, { color: done ? c.color : txt1, textDecorationLine: done ? 'line-through' : 'none' }]}>{c.title}</Text>
                <Text style={[styles.cDesc, { color: txtM }]}>{c.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
}

// AnimatedG and AnimatedCircle are defined above (see top of file)

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md },
  statusCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vLine: { width: 3, height: 30, backgroundColor: '#A855F7', borderRadius: 2 },
  sLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  sValue: { fontFamily: FONTS.displayMedium, fontSize: 18, marginTop: 2 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', marginTop: 16 },
  btn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnMain: { flex: 2 },
  btnText: { fontFamily: FONTS.displayMedium, fontSize: 12, letterSpacing: 1 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  sciNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  sciNoteText: { fontFamily: FONTS.body, fontSize: 11 },
  challengeCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  challengeCardTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  challengeItem: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  cIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  cDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  challengePopup: { position: 'absolute', top: 20, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 100 },
  challengePopTitle: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  challengePopDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 1 },
});
