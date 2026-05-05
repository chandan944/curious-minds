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

const STAGES = [
  { id: 'cloud', name: 'Nebula Cloud', color: '#A855F7' },
  { id: 'main', name: 'Main Sequence', color: '#FFD166' },
  { id: 'giant', name: 'Red Giant', color: '#FF3131' },
  { id: 'dead', name: 'Post-Life Remnant', color: '#F8FAFC' },
];

const PRESETS = [
  { label: 'Low Mass (0.5 M☉)', mass: 0.5, end: 'White Dwarf', color: '#F1F5F9' },
  { label: 'Mid Mass (1.0 M☉)', mass: 1, end: 'White Dwarf', color: '#FFD166' },
  { label: 'High Mass (10 M☉)', mass: 10, end: 'Neutron Star', color: '#3B82F6' },
  { label: 'Massive (50 M☉)', mass: 50, end: 'Black Hole', color: '#000000' },
];

const CHALLENGES = [
  { id: 'supernova', title: 'Cosmic Bang', desc: 'Trigger a Supernova by evolving a massive star', icon: 'zap', color: '#FF3131' },
  { id: 'neutron', title: 'Density King', desc: 'Creation of a rotating Neutron Star', icon: 'grid', color: '#A855F7' },
  { id: 'dweller', title: 'Black Hole Sun', desc: 'Collapse a star into a Singularity', icon: 'target', color: '#000000' },
  { id: 'longevity', title: 'Patient Observer', desc: 'Evolve a low-mass star till the end', icon: 'clock', color: '#00E5FF' },
];

// ── Animated SVG components must be defined before JSX use ──
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function StarsLifecycleLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [mass, setMass] = useState(1);
  const [stage, setStage] = useState('cloud');
  const [running, setRunning] = useState(false);
  const [age, setAge] = useState(0);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const starScale = useRef(new Animated.Value(1)).current;
  const explosionAnim = useRef(new Animated.Value(0)).current;
  const challengePopAnim = useRef(new Animated.Value(0)).current;
  const loop = useRef(null);

  const resetLab = () => {
    clearInterval(loop.current);
    setRunning(false);
    setStage('cloud');
    setAge(0);
    starScale.setValue(1);
    explosionAnim.setValue(0);
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

  const startEvolve = () => {
    soundWhoosh();
    resetLab();
    setRunning(true);
    
    let currentAge = 0;
    const maxAge = 100;
    const evolveRate = mass > 10 ? 2 : 1;

    loop.current = setInterval(() => {
      currentAge += evolveRate;
      setAge(currentAge);

      if (currentAge === 20) {
        setStage('main');
        Animated.spring(starScale, { toValue: Math.sqrt(mass), tension: 50, useNativeDriver: true }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (currentAge === 60) {
        setStage('giant');
        Animated.timing(starScale, { toValue: mass > 10 ? 8 : 4, duration: 2000, useNativeDriver: true }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentAge === 90) {
        if (mass >= 10) {
           // Supernova
           Animated.timing(explosionAnim, { toValue: 1, duration: 100, useNativeDriver: false }).start(() => {
              setStage('dead');
              starScale.setValue(mass >= 50 ? 0.2 : 0.5);
              Animated.timing(explosionAnim, { toValue: 0, duration: 1000, useNativeDriver: false }).start();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
           });
           triggerChallenge('supernova');
           if (mass >= 50) triggerChallenge('dweller');
           else triggerChallenge('neutron');
        } else {
           setStage('dead');
           Animated.spring(starScale, { toValue: 0.3, tension: 40, useNativeDriver: true }).start();
           triggerChallenge('longevity');
        }
      }

      if (currentAge >= maxAge) {
        clearInterval(loop.current);
        setRunning(false);
      }
    }, 100);
  };

  useEffect(() => () => clearInterval(loop.current), []);

  const starColor = stage === 'cloud' ? '#A855F7' : 
                    stage === 'main' ? (mass > 10 ? '#3B82F6' : '#FFD166') : 
                    stage === 'giant' ? '#FF3131' : 
                    (mass >= 50 ? '#000' : mass >= 10 ? '#6366F1' : '#F1F5F9');

  const renderStar = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG {...{ style: { transform: [{ scale: starScale }] } }}>
        <Circle cx={SIM_W/2} cy={SIM_H/2} r="20" fill="url(#starGlow)" />
        {stage !== 'cloud' && <Circle cx={SIM_W/2} cy={SIM_H/2} r="18" fill={starColor} />}
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

      {/* ── Preset Masses ── */}
      <View style={styles.sectionHeader}>
         <Icon name="sun" size={12} color="#FFD166" />
         <Text style={[styles.sectionLabel, { color: txtM }]}>Select Initial Star Mass</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {PRESETS.map((p, i) => {
          const active = mass === p.mass;
          return (
            <TouchableOpacity key={p.label} onPress={() => { setMass(p.mass); resetLab(); soundTap(); }} activeOpacity={0.7}>
              <LinearGradient colors={active ? [glass2, glass1] : [glass1, 'rgba(0,0,0,0)']} 
                style={[styles.sampleChip, { borderColor: active ? '#FFD166' : border }]}>
                <Text style={[styles.sampleName, { color: active ? txt1 : txtM }]}>{p.label}</Text>
                <Text style={[styles.sampleDesc, { color: txtM }]}>Ends as: {p.end}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Forge View ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#050A15' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={starColor} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={starColor} stopOpacity="0" />
             </RadialGradient>
             <RadialGradient id="nebulaEffect" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#000" stopOpacity="0" />
             </RadialGradient>
           </Defs>
           
           {/* Starry Background */}
           {[...Array(15)].map((_, i) => (
             <Circle key={i} cx={Math.random()*SIM_W} cy={Math.random()*SIM_H} r="1" fill="#fff" opacity={0.3} />
           ))}
           
           {stage === 'cloud' && <Circle cx={SIM_W/2} cy={SIM_H/2} r="100" fill="url(#nebulaEffect)" />}

           {/* The Star */}
           {renderStar()}

           {/* Supernova Effect */}
           <AnimatedCircle cx={SIM_W/2} cy={SIM_H/2} r={explosionAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 250] })} 
             fill="#fff" opacity={explosionAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] })} />
        </Svg>
        
        <View style={styles.overlayAge}>
           <Text style={[styles.ageValue, { color: '#00D4FF' }]}>{age}B <Text style={{ fontSize: 10 }}>Years</Text></Text>
           <Text style={[styles.stageName, { color: '#fff' }]}>{STAGES.find(s => s.id === stage).name}</Text>
        </View>
      </View>

      {/* ── Action Control ── */}
      <View style={styles.btnRow}>
         <TouchableOpacity onPress={resetLab} style={[styles.btn, { borderBottomLeftRadius: RADIUS.md, borderTopLeftRadius: RADIUS.md }]}>
            <Text style={[styles.btnText, { color: txt2 }]}>RE-SEED NURSERY</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={startEvolve} disabled={running}
           style={[styles.btn, styles.btnMain, { borderBottomRightRadius: RADIUS.md, borderTopRightRadius: RADIUS.md, borderColor: !running ? '#FFD166' : border }]}>
            <Text style={[styles.btnText, { color: !running ? '#FFD166' : txtM }]}>
               {running ? 'ACCELERATING TIME...' : 'EVOLVE STAR'}
            </Text>
         </TouchableOpacity>
      </View>

      {/* ── Scientist Mode Logic (More Features) ── */}
      {scientistMode && (
         <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="target" size={14} color="#FFD166" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Thermodynamic Stellar Flux 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>LUMINOSITY (L☉)</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>{stage === 'giant' ? (mass * 1000).toLocaleString() : mass.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>CORE TEMP (K)</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{stage === 'cloud' ? 'N/A' : stage === 'dead' ? 'COLLAPSED' : (15 * mass).toFixed(1) + 'M'}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>H-R INDEX</Text>
                 <Text style={[styles.statValue, { color: '#A855F7' }]}>{stage === 'main' ? 'V (MAIN)' : stage === 'giant' ? 'III (GIANT)' : 'VII (WD)'}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>L-M RATIO</Text>
                 <Text style={[styles.statValue, { color: '#EC4899' }]}>{"L ∝ M^{3.5}"}</Text>
              </View>
           </View>
           <View style={styles.sciNote}>
             <Icon name="info" size={12} color={txtM} />
             <Text style={[styles.sciNoteText, { color: txtM }]}>
               {"Hydrostatic Equilibrium: $P_{fusion} = G_{gravity}$. When fusion stops, the star collapses!"}
             </Text>
           </View>
         </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Stellar Missions ({completedChallenges.length}/4)</Text>
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
  overlayAge: { position: 'absolute', top: 20, left: 20 },
  ageValue: { fontFamily: FONTS.displayMedium, fontSize: 24 },
  stageName: { fontFamily: FONTS.bodyMedium, fontSize: 12, marginTop: 4, letterSpacing: 1 },
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
