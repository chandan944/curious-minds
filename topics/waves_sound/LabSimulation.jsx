/**
 * Waves & Sound Lab — Acoustic Oscilloscope Simulator
 * Scientist Mode: Sine Wave matrices, Constructive Interference
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Ellipse
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#0A150A',
  panel: '#122012',
  cyan: '#00D4FF',
  green: '#39FF14',
  red: '#FF3131',
  text: '#E8E0D0',
  steel: '#1A351A',
  amber: '#FFB347'
};

export default function SoundLab({ scientistMode = false, accentColor = '#39FF14', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [freqA, setFreqA] = useState(440); // 20 to 20000 Hz
  const [ampA, setAmpA] = useState(50); // 0 to 100 dB
  const [freqB, setFreqB] = useState(440);
  const [ampB, setAmpB] = useState(50);

  const discovered = useRef(new Set());

  // Logic Tick (for lively animations)
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

  const checkDiscoveries = useCallback(() => {
    // 1. Resonance matching
    if (Math.abs(freqA - freqB) === 0 && ampA > 0 && ampB > 0) {
      addLog('d1', {
        title: "Perfect Resonance",
        entry: "Both sources are generating the exact same frequency! If two physical objects share this frequency, one can cause the other to violently vibrate across the room—this is how singers shatter glass.",
        color: PALETTE.amber
      });
    }

    // 2. Destructive Interference (180 out of phase simulation)
    // We simulate this by having exactly 1 Hz difference creating a beat frequency of 1
    if (Math.abs(freqA - freqB) === 1 && ampA > 40 && ampB > 40) {
      addLog('d2', {
        title: "Acoustic Beat Frequencies",
        entry: "Frequencies 1 Hz apart create an oscillating 'beat' where the waves continuously drift in and out of phase, creating a pulsing 'wah-wah' sound. At the exact moment they push opposite to each other, they create Destructive Interference—total silence!",
        color: PALETTE.cyan
      });
    }

    // 3. Ultrasound
    if ((freqA > 18000 || freqB > 18000) && (ampA > 20 || ampB > 20)) {
      addLog('d3', {
        title: "Ultrasonic Waves",
        entry: "You've crossed 18,000 Hertz. These high-speed longitudinal waves are completely invisible to human ears, but dogs, bats, and hospital ultrasound machines can use them perfectly!",
        color: PALETTE.green
      });
    }

    // Danger: Over-amplitude
    if (ampA > 95 && ampB > 95 && Math.abs(freqA - freqB) === 0) {
      if (shakeAnim._value === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
      }
    }
  }, [freqA, ampA, freqB, ampB, addLog]);

  useEffect(() => { checkDiscoveries(); }, [checkDiscoveries]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Rendering Waves
  const cx = width / 2;
  const cy = H_VIEWPORT / 2;
  
  // Create SVG path strings for sine waves
  const buildWave = (frequency, amplitude, phaseOffset) => {
    let d = `M 0 ${cy} `;
    // Map frequency (20-20k) to a visual wavelength scalar
    // 20Hz = long waves (few peaks), 20k = many peaks
    // For visual aesthetics, we map to a reasonable number of cycles
    const mappedFreq = 1 + (frequency / 20000) * 15; // 1 to 16 cycles
    const mappedAmp = (amplitude / 100) * (H_VIEWPORT / 3);
    
    for (let x = 0; x <= width; x += 5) {
      const theta = (x / width) * Math.PI * 2 * mappedFreq + phaseOffset;
      const y = cy + Math.sin(theta) * mappedAmp;
      d += `L ${x} ${y} `;
    }
    return d;
  };

  const phaseA = tick * 0.2;
  const phaseB = tick * 0.2 * (freqB/freqA);

  const pathA = buildWave(freqA, ampA, phaseA);
  const pathB = buildWave(freqB, ampB, phaseB);

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bgGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#112211" />
              <Stop offset="100%" stopColor="#050A05" />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />
          
          {/* Grid */}
          <Line x1={0} y1={cy} x2={width} y2={cy} stroke="#224422" strokeWidth={1} />
          <Line x1={cx} y1={0} x2={cx} y2={height} stroke="#224422" strokeWidth={1} />

          {/* Wave A */}
          {ampA > 0 && <Path d={pathA} fill="none" stroke={PALETTE.cyan} strokeWidth={3} opacity={0.8} />}
          
          {/* Wave B */}
          {ampB > 0 && <Path d={pathB} fill="none" stroke={PALETTE.amber} strokeWidth={3} opacity={0.6} strokeDasharray="5,5" />}

          {/* Longitudinal Particle Simulation in Discovery Mode */}
          {discoveryMode && (
            <G y={cy + 80}>
              <Rect x={0} y={-20} width={width} height={40} fill="#0A0A0A" opacity={0.8}/>
              <Line x1={0} y1={0} x2={width} y2={0} stroke="#444" strokeWidth={1} />
              {/* Simulate air particles compressing */}
              {Array.from({length: 40}).map((_, i) => {
                const px = (i / 40) * width;
                const theta = (px / width) * Math.PI * 2 * (1 + (freqA/20000)*15) + phaseA;
                const displacement = Math.sin(theta) * (ampA/100) * 20;
                return <Circle key={i} cx={px + displacement} cy={Math.sin(i*7)*10} r={2} fill={PALETTE.green} opacity={0.7} />
              })}
              <SvgText x={10} y={-5} fill={PALETTE.green} fontSize={10}>Longitudinal Air Molecule View</SvgText>
            </G>
          )}

          {scientistMode && (
            <G>
              <SvgText x={10} y={30} fill={PALETTE.cyan} fontSize={12} fontFamily="monospace">
                y₁ = {Math.round(ampA)}sin(2π({Math.round(freqA)})t)
              </SvgText>
              <SvgText x={10} y={50} fill={PALETTE.amber} fontSize={12} fontFamily="monospace">
                y₂ = {Math.round(ampB)}sin(2π({Math.round(freqB)})t)
              </SvgText>
            </G>
          )}
        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.green : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>
          
          <ControlRow title="CHANNEL A (Cyan)" color={PALETTE.cyan} freq={freqA} setFreq={setFreqA} amp={ampA} setAmp={setAmpA} />
          <View style={{ height: 1, backgroundColor: '#224422', marginVertical: 10 }} />
          <ControlRow title="CHANNEL B (Amber)" color={PALETTE.amber} freq={freqB} setFreq={setFreqB} amp={ampB} setAmp={setAmpB} />

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Mix waves to discover properties...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.amber : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
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
                <Text style={styles.emptyLog}>No discoveries yet. Try pushing amplitude and crossing specific frequencies!</Text>
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

function ControlRow({ title, color, freq, setFreq, amp, setAmp }) {
  return (
    <View style={styles.cRow}>
      <Text style={[styles.cRowTitle, { color }]}>{title}</Text>
      
      <View style={styles.sliderWrap}>
        <Text style={styles.sliderLabel}>FREQ: {Math.round(freq)} Hz</Text>
        <View style={[styles.sliderBg, { borderColor: color}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
          const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
          const p = x / (width-40);
          // Logarithmic scale for frequency 20 to 20000
          setFreq(20 * Math.pow(1000, p));
        }}>
          <View style={[styles.sliderFill, { width: `${(Math.log(freq/20)/Math.log(1000))*100}%`, backgroundColor: color }]} />
          <View style={[styles.sliderThumb, { left: `${(Math.log(freq/20)/Math.log(1000))*100}%` }]} />
        </View>
      </View>

      <View style={styles.sliderWrap}>
        <Text style={styles.sliderLabel}>AMP: {Math.round(amp)} dB</Text>
        <View style={[styles.sliderBg, { borderColor: color}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
          const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
          setAmp((x / (width-40)) * 100);
        }}>
          <View style={[styles.sliderFill, { width: `${amp}%`, backgroundColor: color }]} />
          <View style={[styles.sliderThumb, { left: `${amp}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  viewport: { width: '100%', overflow: 'hidden' },
  discoveryBtn: { position: 'absolute', bottom: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  cRow: { marginBottom: 10 },
  cRowTitle: { fontSize: 13, fontFamily: 'Outfit_700Bold', marginBottom: 10, letterSpacing: 1 },
  sliderWrap: { width: '100%', marginBottom: 15 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 16, backgroundColor: '#0A150A', borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#050A05', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#050A05', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
