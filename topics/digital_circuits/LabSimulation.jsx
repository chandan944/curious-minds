import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Circle, G, Path, Line, Text as SvgText, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const GATE_TYPES = ['AND', 'OR', 'XOR', 'NAND'];

const CHALLENGES = [
  { id: 'light_up', title: 'The Ignition', desc: 'Configure the gates to light the central LED', icon: 'zap', color: '#39FF14' },
  { id: 'xor_logic', title: 'Exclusive Logic', desc: 'Use an XOR gate in the final position', icon: 'star', color: '#A855F7' },
  { id: 'all_paths', title: 'Full Circuitry', desc: 'Enable all 4 inputs simultaneously without losing output', icon: 'layers', color: '#00E5FF' },
  { id: 'rebel_inverter', title: 'NAND Master', desc: 'Achieve output using only NAND gates', icon: 'terminal', color: '#FF3131' },
];

export default function DigitalCircuitsLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [inputs, setInputs] = useState([false, false, false, false]); // A, B, C, D
  const [gates, setGates] = useState(['AND', 'OR', 'XOR']); // Gate1, Gate2, FinalGate
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const challengePopAnim = useRef(new Animated.Value(0)).current;

  const computeGate = (type, a, b) => {
    if (type === 'AND') return a && b;
    if (type === 'OR') return a || b;
    if (type === 'XOR') return a !== b;
    if (type === 'NAND') return !(a && b);
    return false;
  };

  const out1 = computeGate(gates[0], inputs[0], inputs[1]);
  const out2 = computeGate(gates[1], inputs[2], inputs[3]);
  const finalOut = computeGate(gates[2], out1, out2);

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

  useEffect(() => {
    if (finalOut) triggerChallenge('light_up');
    if (gates[2] === 'XOR' && finalOut) triggerChallenge('xor_logic');
    if (inputs.every(i => i) && finalOut) triggerChallenge('all_paths');
    if (gates.every(g => g === 'NAND') && finalOut) triggerChallenge('rebel_inverter');
  }, [finalOut, gates, inputs]);

  const toggleInput = (idx) => {
    soundTap();
    setInputs(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
    Haptics.impactAsync();
  };

  const cycleGate = (idx) => {
    soundWhoosh();
    setGates(prev => {
      const next = [...prev];
      const curIdx = GATE_TYPES.indexOf(next[idx]);
      next[idx] = GATE_TYPES[(curIdx + 1) % GATE_TYPES.length];
      return next;
    });
    Haptics.selectionAsync();
  };

  // Node coordinates
  const yA = 60, yB = 120, yC = 220, yD = 280;
  const col1 = 40, col2 = 120, col3 = 220, col4 = SIM_W - 40;
  const g1y = (yA + yB)/2, g2y = (yC + yD)/2, g3y = (g1y + g2y)/2;

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

      {/* ── Power Hub ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <Icon name="zap" size={24} color="#39FF14" />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>CIRCUIT LOAD</Text>
               <Text style={[styles.sValue, { color: finalOut ? '#39FF14' : txt1 }]}>
                 {finalOut ? 'CONTINUITY ESTABLISHED [1]' : 'OPEN CIRCUIT [0]'}
               </Text>
            </View>
            <Icon name={finalOut ? 'lock' : 'unlock'} size={20} color={finalOut ? '#39FF14' : txtM} />
         </View>
      </View>

      {/* ── Breadboard Viz ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <RadialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFF" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
             </RadialGradient>
           </Defs>
           
           {/* Wires */}
           <Line x1={col1} y1={yA} x2={col2} y2={g1y-10} stroke={inputs[0] ? '#39FF14' : '#334444'} strokeWidth="4" />
           <Line x1={col1} y1={yB} x2={col2} y2={g1y+10} stroke={inputs[1] ? '#39FF14' : '#334444'} strokeWidth="4" />
           <Line x1={col1} y1={yC} x2={col2} y2={g2y-10} stroke={inputs[2] ? '#39FF14' : '#334444'} strokeWidth="4" />
           <Line x1={col1} y1={yD} x2={col2} y2={g2y+10} stroke={inputs[3] ? '#39FF14' : '#334444'} strokeWidth="4" />
           
           <Line x1={col2+40} y1={g1y} x2={col3} y2={g3y-10} stroke={out1 ? '#39FF14' : '#334444'} strokeWidth="4" />
           <Line x1={col2+40} y1={g2y} x2={col3} y2={g3y+10} stroke={out2 ? '#39FF14' : '#334444'} strokeWidth="4" />
           
           <Line x1={col3+40} y1={g3y} x2={col4} y2={g3y} stroke={finalOut ? '#39FF14' : '#334444'} strokeWidth="4" />

           {/* Input Switches */}
           {inputs.map((on, i) => (
             <G key={i} onPress={() => toggleInput(i)}>
                <Circle cx={col1} cy={[yA, yB, yC, yD][i]} r="12" fill={on ? '#39FF14' : '#223333'} />
                <SvgText x={col1} y={[yA, yB, yC, yD][i] + 4} fontSize="10" fill="#FFF" textAnchor="middle" fontWeight="bold">
                  {on ? '1' : '0'}
                </SvgText>
             </G>
           ))}

           {/* Gates */}
           {gates.map((g, i) => {
              const gx = i < 2 ? col2 : col3;
              const gy = i === 0 ? g1y : (i === 1 ? g2y : g3y);
              return (
                <G key={i} onPress={() => cycleGate(i)}>
                   <Rect x={gx} y={gy-20} width={40} height={40} rx="6" fill="#A855F7" />
                   <SvgText x={gx+20} y={gy+4} fontSize="8" fill="#FFF" textAnchor="middle" fontWeight="bold">
                     {g}
                   </SvgText>
                </G>
              );
           })}

           {/* Finish LED */}
           <G>
              <Circle cx={col4} cy={g3y} r="18" fill={finalOut ? '#FF3131' : '#222'} stroke={finalOut ? '#FFF' : '#333'} strokeWidth="2" />
              {finalOut && <Circle cx={col4} cy={g3y} r="25" fill="#FF313120" />}
           </G>
        </Svg>
      </View>

      {/* ── Input Toggles ── */}
      <View style={styles.inputGrid}>
         {['A', 'B', 'C', 'D'].map((lab, i) => (
           <TouchableOpacity key={lab} onPress={() => toggleInput(i)} 
             style={[styles.inputBtn, { backgroundColor: inputs[i] ? '#39FF1420' : '#33444440', borderColor: inputs[i] ? '#39FF14' : border }]}>
              <Text style={[styles.inputBtnText, { color: inputs[i] ? '#39FF14' : txtM }]}>{lab}</Text>
           </TouchableOpacity>
         ))}
      </View>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="terminal" size={14} color="#39FF14" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Boolean Algebra 🧑‍🔬</Text>
           </View>
           <View style={styles.eqBox}>
              <Text style={[styles.eqLabel, { color: txtM }]}>LOGIC EXPRESSION (Q):</Text>
              <Text style={[styles.eqValue, { color: '#39FF14' }]}>
                {`Q = (A ${gates[0]} B) ${gates[2]} (C ${gates[1]} D)`}
              </Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>TRANSISTORS</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>16 FET</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>PROP. DELAY</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>2.4 ns</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>VOLTAGE (Vcc)</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>5.0 V</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>LOGIC LEVEL</Text>
                 <Text style={[styles.statValue, { color: '#A855F7' }]}>CMOS</Text>
              </View>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Circuit Missions ({completedChallenges.length}/4)</Text>
        </View>
        {CHALLENGES.map(c => {
          const done = completedChallenges.includes(c.id);
          return (
            <View key={c.id} style={styles.challengeItem}>
              <View style={[styles.cIcon, { backgroundColor: done ? c.color + '20' : '#334444' }]}>
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

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md },
  statusCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  sValue: { fontFamily: FONTS.displayMedium, fontSize: 15, marginTop: 2 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden' },
  inputGrid: { flexDirection: 'row', marginTop: 16, gap: 10 },
  inputBtn: { flex: 1, height: 44, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  inputBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  eqBox: { padding: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.sm, marginBottom: 16 },
  eqLabel: { fontFamily: FONTS.bodyMedium, fontSize: 9, marginBottom: 4 },
  eqValue: { fontFamily: 'monospace', fontSize: 12 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
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
