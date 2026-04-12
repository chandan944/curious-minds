/**
 * Heat & Temperature Lab — Thermodynamics Chamber
 * Scientist Mode: Q=mcΔT matrices, Phase State identifiers
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
  bg: '#0F0505',
  panel: '#200A0A',
  red: '#FF3131',
  blue: '#00D4FF',
  white: '#E8E0D0',
  amber: '#FFB347',
  steel: '#351A1A'
};

export default function HeatLab({ scientistMode = false, accentColor = '#FF3131', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [temp, setTemp] = useState(20); // -273 to 400 Celsius
  const [substance, setSubstance] = useState('water'); // water, iron, oxygen
  
  const discovered = useRef(new Set());

  // Logic Tick (for physics loop)
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
    // 1. Absolute Zero Attempt
    if (temp <= -273) {
      addLog('d1', {
        title: "Absolute Zero Reached",
        entry: "-273.15°C (0 Kelvin). The theoretical limit of the universe. All atomic motion has ceased. You cannot extract any more heat because there is literally no kinetic energy left to extract!",
        color: PALETTE.blue
      });
    }

    // 2. Boiling Point of Water
    if (substance === 'water' && temp >= 100 && temp < 110) {
      addLog('d2', {
        title: "Phase Change: Vaporization (Latent Heat)",
        entry: "H2O has hit 100°C. Notice how the heat energy is now being used to aggressively rip the liquid bonds apart, turning the water into expansive gaseous steam rather than immediately raising its temperature further.",
        color: PALETTE.amber
      });
    }

    // 3. Melting Iron
    if (substance === 'iron' && temp > 350) {
      addLog('d3', {
        title: "Thermal Expansion Alert",
        entry: "Even though the Iron is nowhere near its melting point (1,538°C), the extreme heat is causing its atoms to vibrate wildly, forcing the physical metal structure to expand! This is why bridges need expansion joints.",
        color: PALETTE.red
      });
    }

    // Danger: Plasma State / Extreme Entropy
    if (temp >= 390) {
      if (shakeAnim._value === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
        ]).start();
      }
    }
  }, [temp, substance, addLog]);

  useEffect(() => { checkDiscoveries(); }, [checkDiscoveries]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // State calculations
  let state = 'Liquid';
  let particleColor = PALETTE.blue;
  let shakeMulti = 0; // for solid vibration
  let floatMulti = 0; // for gas spreading
  
  if (substance === 'water') {
    if (temp <= 0) { state = 'Solid (Ice)'; particleColor = '#FFF'; shakeMulti = (temp + 273)/273; }
    else if (temp < 100) { state = 'Liquid'; particleColor = PALETTE.blue; }
    else { state = 'Gas (Steam)'; particleColor = '#CCC'; floatMulti = (temp - 100)/50; }
  } else if (substance === 'iron') {
    state = 'Solid (Metal)';
    particleColor = temp > 200 ? PALETTE.red : '#888';
    shakeMulti = (temp + 273)/400; // lots of vibration but locked in place
  } else if (substance === 'oxygen') {
    if (temp <= -218) { state = 'Solid (O2 Ice)'; particleColor = '#88CCFF'; shakeMulti = 0.1; }
    else if (temp <= -183) { state = 'Liquid O2'; particleColor = '#4488FF'; }
    else { state = 'Gas (Air)'; particleColor = '#CCCCFF'; floatMulti = (temp + 180)/100; }
  }
  
  // Create particle grid
  const particles = [];
  const cx = width / 2;
  const cy = H_VIEWPORT / 1.8;
  
  // Depending on state, particles behave differently
  let spacing = 15;
  if (state.includes('Gas')) spacing = 25 + Math.min(floatMulti * 10, 40);
  else if (state.includes('Solid')) spacing = substance === 'water' ? 18 : 14; // Ice expands!
  
  const kineticJitter = temp === -273 ? 0 : Math.max(0, temp + 273) * 0.01;

  for (let row = -2; row <= 2; row++) {
    for (let col = -3; col <= 3; col++) {
      let px = cx + col * spacing;
      let py = cy + row * spacing;
      
      // Brownian motion / Kinetic Jitter
      if (kineticJitter > 0) {
        if (state.includes('Solid')) {
          px += Math.sin(tick * 0.5 + row*col) * kineticJitter;
          py += Math.cos(tick * 0.5 + row*col) * kineticJitter;
        } else if (state.includes('Gas')) {
          // Gas particles fly around chaotic
          px += Math.sin(tick * 0.1 * kineticJitter + row*10) * (spacing*2) * ((tick%100)/100);
          py -= ((tick*kineticJitter*0.5 + col*10) % 150) - 75; 
        } else {
          // Liquid rolling
          px += Math.sin(tick * 0.2 + row*col) * kineticJitter * 2;
          py += Math.cos(tick * 0.2 + row*col) * kineticJitter * 2;
        }
      }
      particles.push(<Circle key={`${row}-${col}`} cx={px} cy={py} r={6} fill={particleColor} opacity={state.includes('Gas') ? 0.6 : 1} />);
    }
  }

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bgGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2A0A0A" />
              <Stop offset="100%" stopColor="#0F0505" />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />
          
          {/* Beaker Chamber */}
          <Path d={`M ${cx-80} 50 L ${cx-80} ${cy+60} Q ${cx-80} ${cy+80} ${cx-60} ${cy+80} L ${cx+60} ${cy+80} Q ${cx+80} ${cy+80} ${cx+80} ${cy+60} L ${cx+80} 50`} fill="none" stroke={PALETTE.white} strokeWidth={4} opacity={0.3} />
          
          {/* Flame under beaker based on temperature */}
          {temp > 40 && (
            <G x={cx} y={cy+90}>
              <Path d={`M 0 0 Q ${10 + (tick%5)} -15 0 -${20 + (temp/10)} Q -${10 + ((tick+2)%5)} -15 0 0`} fill={PALETTE.amber} opacity={0.8} />
              {temp > 150 && <Path d={`M 0 0 Q ${5 + (tick%8)} -25 0 -${30 + (temp/8)} Q -${5 + ((tick+4)%8)} -25 0 0`} fill={PALETTE.red} opacity={0.6} />}
            </G>
          )}

          {/* Frost under beaker if cold */}
          {temp < -50 && (
            <G x={cx} y={cy+80}>
               <Rect x={-40} y={0} width={80} height={10} fill={PALETTE.blue} opacity={(Math.abs(temp)/273) * 0.8} rx={5} />
               <SvgText x={-15} y={22} fill={PALETTE.blue} fontSize={10}>FROST</SvgText>
            </G>
          )}

          {/* The Particles */}
          {particles}

          {/* Discovery Info */}
          {discoveryMode && (
            <G>
              <Line x1={cx - 100} y1={cy} x2={cx + 100} y2={cy} stroke={PALETTE.amber} strokeWidth={1} strokeDasharray="5 5" opacity={0.5} />
              <SvgText x={cx + 90} y={cy - 5} fill={PALETTE.amber} fontSize={10} textAnchor="end">Average Kinetic Energy Field</SvgText>
            </G>
          )}

          {scientistMode && (
            <G>
              <SvgText x={15} y={30} fill={PALETTE.white} fontSize={12} fontFamily="monospace">
                T = {temp + 273.15} K
              </SvgText>
              <SvgText x={15} y={50} fill={PALETTE.red} fontSize={12} fontFamily="monospace">
                Q = mcΔT
              </SvgText>
              <SvgText x={15} y={70} fill={PALETTE.blue} fontSize={12} fontFamily="monospace">
                State: {state}
              </SvgText>
            </G>
          )}
        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.amber : PALETTE.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>
          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>THERMAL DIAL: {Math.round(temp)}°C  ({Math.round(temp + 273.15)} K)</Text>
            <View style={[styles.sliderBg, { borderColor:PALETTE.red}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              // Range: -273 to 400 = 673 range
              setTemp(-273 + (x / (width-40)) * 673);
            }}>
              <View style={[styles.sliderFill, { width: `${((temp + 273)/673)*100}%`, backgroundColor: temp < 0 ? PALETTE.blue : temp > 100 ? PALETTE.red : PALETTE.amber }]} />
              <View style={[styles.sliderThumb, { left: `${((temp + 273)/673)*100}%` }]} />
            </View>
          </View>

          <View style={{ marginVertical: 15 }}>
            <Text style={{ color: '#888', fontSize: 10, fontFamily: 'monospace', marginBottom: 8 }}>TEST SUBSTANCE:</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.pill, substance === 'water' && { backgroundColor: PALETTE.blue, borderColor: PALETTE.blue }]} onPress={() => { soundTap(); setSubstance('water'); }}>
                <Text style={styles.pillTxt}>H₂O (Water)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, substance === 'iron' && { backgroundColor: PALETTE.red, borderColor: PALETTE.red }]} onPress={() => { soundTap(); setSubstance('iron'); }}>
                <Text style={styles.pillTxt}>Fe (Iron)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, substance === 'oxygen' && { backgroundColor: PALETTE.white, borderColor: PALETTE.white }]} onPress={() => { soundTap(); setSubstance('oxygen'); }}>
                <Text style={[styles.pillTxt, substance === 'oxygen' && {color: '#000'}]}>O₂ (Oxygen)</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.white} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Inject heat to discover thermodynamics...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.red : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
      </TouchableOpacity>

      {/* Logs Modal */}
      <Modal visible={logsOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: PALETTE.white }]}>Research Log</Text>
              <TouchableOpacity onPress={() => { soundTap(); setLogsOpen(false); }}>
                <Icon name="x" size={24} color={PALETTE.white} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>No discoveries yet. Try pushing to Absolute Zero or Boiling different materials!</Text>
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
  discoveryBtn: { position: 'absolute', bottom: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 20 },
  sliderWrap: { width: '100%', marginBottom: 15 },
  sliderLabel: { color: PALETTE.white, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 16, backgroundColor: '#0A0505', borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: PALETTE.steel, backgroundColor: '#0A0505' },
  pillTxt: { color: '#FFF', fontSize: 11, fontFamily: 'Outfit_500Medium' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#0A0505', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0A0505', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.white, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
