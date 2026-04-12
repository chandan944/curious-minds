/**
 * Digital Circuits Lab — Cascading Logic Board
 * Scientist Mode: Boolean Algebra overlay
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Polygon
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#051015',
  panel: '#0B1A20',
  cyan: '#00D4FF',
  green: '#39FF14',
  red: '#FF3131',
  text: '#E8E0D0',
  steel: '#1A3035',
  purple: '#A855F7',
  offWire: '#334444',
  onWire: '#39FF14'
};

const GATE_TYPES = ['AND', 'OR', 'XOR', 'NAND'];

export default function CircuitLab({ scientistMode = false, accentColor = '#39FF14', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const discovered = useRef(new Set());

  // Input states
  const [inA, setInA] = useState(false);
  const [inB, setInB] = useState(false);
  const [inC, setInC] = useState(false);
  const [inD, setInD] = useState(false);

  // Gate types
  const [gate1, setGate1] = useState('AND'); // takes A,B
  const [gate2, setGate2] = useState('OR');  // takes C,D
  const [gate3, setGate3] = useState('XOR'); // takes Gate1, Gate2

  // Logic Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const loop = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(loop);
  }, []);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  // Compute logic
  const computeGate = (type, a, b) => {
    if (type === 'AND') return a && b;
    if (type === 'OR') return a || b;
    if (type === 'XOR') return a !== b;
    if (type === 'NAND') return !(a && b);
    return false;
  };

  const out1 = computeGate(gate1, inA, inB);
  const out2 = computeGate(gate2, inC, inD);
  const finalOut = computeGate(gate3, out1, out2);

  // Discovery checks
  useEffect(() => {
    // 1. All inputs ON, XOR final gate outputs 0
    if (inA && inB && inC && inD && gate1 === 'AND' && gate2 === 'AND' && gate3 === 'XOR' && !finalOut) {
       addLog('d1', {
         title: "XOR Cancellation",
         entry: "You powered all 4 inputs, making Gate 1 and Gate 2 output True. But the final XOR gate cancelled them out because XOR strictly forbids both inputs from being True!",
         color: PALETTE.purple
       });
    }

    // 2. Short Circuit Simulation (Danger)
    if (gate1 === 'NAND' && gate2 === 'NAND' && gate3 === 'NAND' && !inA && !inB && !inC && !inD && finalOut) {
       if (shakeAnim._value === 0) {
        addLog('d2', {
          title: "NAND Cascading Overload",
          entry: "By using cascading NOT-AND gates with zero power input, you forced the board to generate spontaneous power from nothing, triggering a logic overload!",
          color: PALETTE.red
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
        ]).start();
       }
    }
  }, [inA, inB, inC, inD, gate1, gate2, gate3, finalOut, addLog]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  const cycleGate = (curr) => {
    soundTap();
    const idx = GATE_TYPES.indexOf(curr);
    return GATE_TYPES[(idx + 1) % GATE_TYPES.length];
  };

  // Rendering Layout Coordinates
  const pad = 30;
  const col1 = pad;
  const col2 = pad + 100;
  const col3 = pad + 220;
  const col4 = width - pad - 20;

  const yA = 40; const yB = 90;
  const yC = 160; const yD = 210;
  
  const g1y = (yA + yB) / 2;
  const g2y = (yC + yD) / 2;
  const g3y = (g1y + g2y) / 2;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0B1A20" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
          
          {/* Wires */}
          <Line x1={col1+20} y1={yA} x2={col2} y2={g1y-10} stroke={inA ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />
          <Line x1={col1+20} y1={yB} x2={col2} y2={g1y+10} stroke={inB ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />
          
          <Line x1={col1+20} y1={yC} x2={col2} y2={g2y-10} stroke={inC ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />
          <Line x1={col1+20} y1={yD} x2={col2} y2={g2y+10} stroke={inD ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />

          <Line x1={col2+40} y1={g1y} x2={col3} y2={g3y-10} stroke={out1 ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />
          <Line x1={col2+40} y1={g2y} x2={col3} y2={g3y+10} stroke={out2 ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />

          <Line x1={col3+40} y1={g3y} x2={col4} y2={g3y} stroke={finalOut ? PALETTE.onWire : PALETTE.offWire} strokeWidth={4} />

          {/* Current Animation Pulses */}
          {inA && <Circle cx={col1+20 + ((tick*2)%80)} cy={yA + ((tick*2)%80)*((g1y-10-yA)/80)} r={2} fill="#FFF" />}
          {inB && <Circle cx={col1+20 + ((tick*2)%80)} cy={yB + ((tick*2)%80)*((g1y+10-yB)/80)} r={2} fill="#FFF" />}
          {finalOut && <Circle cx={col3+40 + ((tick*2)%80)} cy={g3y} r={3} fill="#FFF" />}

          {/* Input Nodes */}
          <Circle cx={col1} cy={yA} r={12} fill={inA ? PALETTE.cyan : '#333'} />
          <SvgText x={col1-5} y={yA+5} fill="#FFF" fontSize={14} fontWeight="bold">{inA ? '1' : '0'}</SvgText>
          
          <Circle cx={col1} cy={yB} r={12} fill={inB ? PALETTE.cyan : '#333'} />
          <SvgText x={col1-5} y={yB+5} fill="#FFF" fontSize={14} fontWeight="bold">{inB ? '1' : '0'}</SvgText>

          <Circle cx={col1} cy={yC} r={12} fill={inC ? PALETTE.cyan : '#333'} />
          <SvgText x={col1-5} y={yC+5} fill="#FFF" fontSize={14} fontWeight="bold">{inC ? '1' : '0'}</SvgText>

          <Circle cx={col1} cy={yD} r={12} fill={inD ? PALETTE.cyan : '#333'} />
          <SvgText x={col1-5} y={yD+5} fill="#FFF" fontSize={14} fontWeight="bold">{inD ? '1' : '0'}</SvgText>

          {/* Gates */}
          <Rect x={col2} y={g1y-20} width={40} height={40} rx={5} fill={PALETTE.purple} />
          <SvgText x={col2+6} y={g1y+4} fill="#FFF" fontSize={10} fontWeight="bold">{gate1}</SvgText>

          <Rect x={col2} y={g2y-20} width={40} height={40} rx={5} fill={PALETTE.purple} />
          <SvgText x={col2+6} y={g2y+4} fill="#FFF" fontSize={10} fontWeight="bold">{gate2}</SvgText>

          <Rect x={col3} y={g3y-20} width={40} height={40} rx={5} fill={PALETTE.purple} />
          <SvgText x={col3+6} y={g3y+4} fill="#FFF" fontSize={10} fontWeight="bold">{gate3}</SvgText>

          {/* Final Output LED */}
          <Circle cx={col4} cy={g3y} r={16} fill={finalOut ? PALETTE.red : '#222'} stroke={finalOut ? '#FFF' : '#444'} strokeWidth={2} />
          {finalOut && (
            <Circle cx={col4} cy={g3y} r={16 + (tick%10)} fill="none" stroke={PALETTE.red} strokeWidth={2} opacity={1 - (tick%10)/10} />
          )}

          {scientistMode && (
            <G>
              <SvgText x={15} y={height - 20} fill={PALETTE.cyan} fontSize={12} fontFamily="monospace">
                Q = (A {gate1} B) {gate3} (C {gate2} D)
              </SvgText>
            </G>
          )}

        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.cyan : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>

          <View style={styles.inputGrid}>
            <TouchableOpacity style={[styles.toggleBtn, inA && styles.toggleOn]} onPress={() => { soundTap(); setInA(!inA); }}><Text style={styles.toggleTxt}>A: {inA?1:0}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, inB && styles.toggleOn]} onPress={() => { soundTap(); setInB(!inB); }}><Text style={styles.toggleTxt}>B: {inB?1:0}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, inC && styles.toggleOn]} onPress={() => { soundTap(); setInC(!inC); }}><Text style={styles.toggleTxt}>C: {inC?1:0}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, inD && styles.toggleOn]} onPress={() => { soundTap(); setInD(!inD); }}><Text style={styles.toggleTxt}>D: {inD?1:0}</Text></TouchableOpacity>
          </View>

          <View style={{height: 1, backgroundColor: PALETTE.steel, marginVertical: 15}}/>

          <View style={styles.row}>
            <Text style={styles.optLabel}>GATE 1 (A,B):</Text>
            <TouchableOpacity style={styles.pill} onPress={() => setGate1(cycleGate(gate1))}><Text style={styles.pillTxt}>{gate1}</Text></TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.optLabel}>GATE 2 (C,D):</Text>
            <TouchableOpacity style={styles.pill} onPress={() => setGate2(cycleGate(gate2))}><Text style={styles.pillTxt}>{gate2}</Text></TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.optLabel}>GATE 3 (Final):</Text>
            <TouchableOpacity style={styles.pill} onPress={() => setGate3(cycleGate(gate3))}><Text style={styles.pillTxt}>{gate3}</Text></TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Tap inputs to send current...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.green : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
      </TouchableOpacity>

      {/* Logs Modal */}
      <Modal visible={logsOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: PALETTE.text }]}>Research Log</Text>
              <TouchableOpacity onPress={() => { soundTap(); setLogsOpen(false); }}>
                <Icon name="x" size={24} color={PALETTE.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>No discoveries yet. Try generating power from NAND gates!</Text>
              ) : (
                logs.map((l, i) => (
                  <View key={i} style={[styles.logCard, { borderLeftColor: l.color }]}>
                    <Text style={styles.logCardTitle}>{l.title}</Text>
                    <Text style={styles.logCardDesc}>{l.entry}</Text>
                  </View>
                ))
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  viewport: { width: '100%', overflow: 'hidden' },
  discoveryBtn: { position: 'absolute', top: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 15 },
  inputGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  toggleBtn: { flex: 1, backgroundColor: '#223333', paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#445555' },
  toggleOn: { backgroundColor: PALETTE.green, borderColor: PALETTE.green },
  toggleTxt: { color: '#FFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  optLabel: { color: '#888', fontSize: 11, fontFamily: 'monospace' },
  pill: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: PALETTE.purple, backgroundColor: '#1A0B20' },
  pillTxt: { color: '#FFF', fontSize: 12, fontFamily: 'Outfit_700Bold' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#051015', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#051015', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
