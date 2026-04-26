import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop, Circle, G, Path, Line, Text as SvgText, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 360;
const BH_X = SIM_W / 2;
const BH_Y = SIM_H / 2;

const PRESETS = [
  { label: 'Stellar (10 M☉)', mass: 10, radius: 30, color: '#F1F5F9' },
  { label: 'Intermediate (1k M☉)', mass: 1000, radius: 60, color: '#A855F7' },
  { label: 'Supermassive (1M M☉)', mass: 1000000, radius: 90, color: '#FF3131' },
];

const CHALLENGES = [
  { id: 'horizon', title: 'The Event Horizon', desc: 'Reach the Schwarzschild radius of any Black Hole', icon: 'target', color: '#FF3131' },
  { id: 'spaghetti', title: 'Long Pasta', desc: 'Sustain a spaghettification factor of 5.0x', icon: 'activity', color: '#FFD166' },
  { id: 'redshift', title: 'Ghost Probe', desc: 'Achieve a Redshift factor of 10.0 or higher', icon: 'zap', color: '#888888' },
  { id: 'time_freeze', title: 'Frozen in Time', desc: 'Reach a time dilation where 1 ship hour = 100 Earth years', icon: 'clock', color: '#00E5FF' },
];

// ── Animated SVG components must be defined before JSX use ──
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BlackHolesLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const probeColor = '#00E5FF';

  const [activePreset, setActivePreset] = useState(0);
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(200);
  const [spaghetti, setSpaghetti] = useState(1);
  const [redshift, setRedshift] = useState(0);
  const [dilation, setDilation] = useState(1);
  
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const probeY = useRef(new Animated.Value(20)).current;
  const probeScaleY = useRef(new Animated.Value(1)).current;
  const probeScaleX = useRef(new Animated.Value(1)).current;
  const challengePopAnim = useRef(new Animated.Value(0)).current;
  const loop = useRef(null);

  const resetLab = () => {
    clearInterval(loop.current);
    setRunning(false);
    setDistance(200);
    setSpaghetti(1);
    setRedshift(0);
    setDilation(1);
    probeY.setValue(20);
    probeScaleY.setValue(1);
    probeScaleX.setValue(1);
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

  const startVoyage = () => {
    soundWhoosh();
    resetLab();
    setRunning(true);
    
    const p = PRESETS[activePreset];
    const rs = p.radius;
    let dist = 200;

    loop.current = setInterval(() => {
      dist -= 0.5;
      setDistance(dist);
      
      const relDist = dist - rs;
      if (relDist <= 2) {
         // Horizon reached
         clearInterval(loop.current);
         setRunning(false);
         triggerChallenge('horizon');
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Physics Calcs
      const sFact = 1 + (rs / Math.max(relDist, 1)) * 2;
      const dFact = 1 / Math.sqrt(1 - (rs / Math.max(dist, rs + 1)));
      const redFact = dFact - 1;

      setSpaghetti(sFact);
      setDilation(dFact);
      setRedshift(redFact);

      // Animate Probe
      probeY.setValue(BH_Y - dist);
      probeScaleY.setValue(sFact);
      probeScaleX.setValue(1 / Math.sqrt(sFact));

      // Challenges
      if (sFact >= 5) triggerChallenge('spaghetti');
      if (redFact >= 10) triggerChallenge('redshift');
      if (dFact >= 100) triggerChallenge('time_freeze');

    }, 30);
  };

  useEffect(() => () => clearInterval(loop.current), []);

  const renderProbe = () => {
    return (
      <AnimatedG transform={[{ translateX: BH_X }, { translateY: probeY }, { scaleY: probeScaleY }, { scaleX: probeScaleX }]}>
        <Rect x="-10" y="-10" width="20" height="20" fill={probeColor} rx="4" />
        <Rect x="-4" y="-15" width="8" height="5" fill="#fff" opacity={0.8} />
        <Line x1="-15" y1="0" x2="15" y2="0" stroke="#fff" strokeWidth="1" opacity={0.5} />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
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

      {/* ── Black Hole Selector ── */}
      <View style={styles.sectionHeader}>
         <Icon name="blackhole" size={12} color="#F1F5F9" />
         <Text style={[styles.sectionLabel, { color: txtM }]}>Select Target Anomaly</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {PRESETS.map((p, i) => {
          const active = activePreset === i;
          return (
            <TouchableOpacity key={p.label} onPress={() => { setActivePreset(i); resetLab(); soundTap(); }} activeOpacity={0.7}>
              <LinearGradient colors={active ? [glass2, glass1] : [glass1, 'rgba(0,0,0,0)']} 
                style={[styles.sampleChip, { borderColor: active ? '#F1F5F9' : border }]}>
                <Text style={[styles.sampleName, { color: active ? txt1 : txtM }]}>{p.label}</Text>
                <Text style={[styles.sampleDesc, { color: txtM }]}>Rs = {p.mass * 3} km</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Voyager View ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <RadialGradient id="bhGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="70%" stopColor="#000" stopOpacity="1" />
                <Stop offset="85%" stopColor="#FF3131" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
             </RadialGradient>
             <RadialGradient id="stars" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#000" stopOpacity="0" />
             </RadialGradient>
           </Defs>
           
           {/* Starfield */}
           {[...Array(20)].map((_, i) => (
             <Circle key={i} cx={Math.random()*SIM_W} cy={Math.random()*SIM_H} r="1" fill="#fff" opacity={0.3} />
           ))}
           
           {/* Einstein Ring (Accretion) */}
           <Circle cx={BH_X} cy={BH_Y} r={PRESETS[activePreset].radius + 15} stroke="#FF9F1C" strokeWidth="2" opacity={0.2} />
           <Circle cx={BH_X} cy={BH_Y} r={PRESETS[activePreset].radius + 10} stroke="#FF3131" strokeWidth="1" opacity={0.3} />

           {/* The Black Hole */}
           <Circle cx={BH_X} cy={BH_Y} r={PRESETS[activePreset].radius + 30} fill="url(#bhGlow)" />
           <Circle cx={BH_X} cy={BH_Y} r={PRESETS[activePreset].radius} fill="#000" />

           {/* The Probe */}
           {renderProbe()}
           
           <SvgText x={SIM_W - 100} y="30" fontSize="12" fill="#00E5FF" fontFamily="monospace">DIST: {distance.toFixed(1)} km</SvgText>
        </Svg>
      </View>

      {/* ── Action Control ── */}
      <View style={styles.btnRow}>
         <TouchableOpacity onPress={resetLab} style={[styles.btn, { borderBottomLeftRadius: RADIUS.md, borderTopLeftRadius: RADIUS.md }]}>
            <Text style={[styles.btnText, { color: txt2 }]}>ABORT MISSION</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={startVoyage} disabled={running}
           style={[styles.btn, styles.btnMain, { borderBottomRightRadius: RADIUS.md, borderTopRightRadius: RADIUS.md, borderColor: !running ? '#FF3131' : border }]}>
            <Text style={[styles.btnText, { color: !running ? '#FF3131' : txtM }]}>
               {running ? 'ENGAGING SINGULARITY...' : 'LAUNCH PROBE'}
            </Text>
         </TouchableOpacity>
      </View>

      {/* ── Scientist Mode Logic (More Features) ── */}
      {scientistMode && (
         <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="target" size={14} color="#FF3131" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>General Relativity Analytics 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>TIME DILATION (γ)</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>{dilation > 1000 ? 'INFINITE' : dilation.toFixed(2)}x</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>SPAGHETTI FACTOR</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>{spaghetti.toFixed(2)}:1</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>GRAV. REDSHIFT (z)</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{redshift.toFixed(3)}</Text>
              </View>
           </View>
           <View style={styles.sciNote}>
             <Icon name="info" size={12} color={txtM} />
             <Text style={[styles.sciNoteText, { color: txtM }]}>
               {"Time Dilation ratio: $\\gamma = 1 / \\sqrt{1 - R_s/r}$. As $r \\to R_s$, time stops for the external observer!"}
             </Text>
           </View>
         </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Mission Objectives ({completedChallenges.length}/4)</Text>
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 10 },
  sectionLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  scrollRow: { gap: 8, paddingBottom: 4 },
  sampleChip: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1, minWidth: 120 },
  sampleName: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  sampleDesc: { fontFamily: FONTS.body, fontSize: 9, marginTop: 2 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  distLabel: { position: 'absolute', fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' },
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
