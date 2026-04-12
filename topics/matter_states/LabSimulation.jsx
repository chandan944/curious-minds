/**
 * Matter States Lab — Phase Change Simulator
 * Scientist Mode: entropy, latent heat, Clausius-Clapeyron, kinetic energy formulas
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, Ellipse, G, Text as SvgText, Line, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 230);
const CX = width / 2;

const DISCOVERIES = [
  { id: 'ph1', cond: s => s.temp > 370 && s.pressure < 20, title: 'Sublimation', entry: 'At high temperature and low pressure, matter skips the liquid phase entirely — solid → gas. Dry ice (CO₂) does this at room temperature because liquid CO₂ needs >5.1 atm. Freeze-drying food uses sublimation to remove water without heat damage.', rarity: 'Uncommon' },
  { id: 'ph2', cond: s => s.temp < 1 && s.pressure < 15, title: 'Absolute Zero Approach', entry: 'Near 0K (−273.15°C), particle motion minimises. Quantum mechanics still prevents true zero — Heisenberg Uncertainty Principle forbids both exact position and zero momentum. Bose-Einstein Condensates form at ~100 nanokelvin — 10 million times colder than outer space!', rarity: 'Rare ✨' },
  { id: 'ph3', cond: s => s.temp > 180 && s.pressure > 80, title: 'Supercritical Fluid', entry: 'Beyond the critical point (374°C, 218 atm for water), liquid and gas become indistinguishable — a supercritical fluid with properties of both. Supercritical CO₂ decaffeinates coffee; supercritical water destroys toxic waste!', rarity: 'Rare ✨' },
  { id: 'ph4', cond: s => s.temp > 95 && s.temp < 110 && s.pressure > 70, title: 'Boiling Point Shift', entry: 'Boiling point depends on pressure! At 1 atm: 100°C. At Mount Everest (0.33 atm): 69°C. In a pressure cooker (2 atm): 120°C. This is why astronaut food was a major challenge — water boils at room temperature in space!', rarity: 'Common' },
  { id: 'ph5', cond: s => s.temp > 8000, title: 'Plasma State', entry: 'Above ~10,000K, electrons are stripped from atoms — gas ionises into plasma. The Sun\'s corona reaches 1–3 million K. Plasma makes up 99% of all visible matter in the universe. ITER fusion reactor aims to contain plasma at 150 million K!', rarity: 'Rare ✨' },
];

// Gets state label from temp and pressure
function getState(temp, pressure) {
  if (temp > 8000) return { label: 'PLASMA ⚡', color: '#FD79A8', emoji: '⚡' };
  if (temp > 180 && pressure > 80) return { label: 'SUPERCRITICAL 🌀', color: '#A29BFE', emoji: '🌀' };
  if (temp > 100 + (pressure - 50) * 0.3) return { label: 'GAS 💨', color: '#55EFC4', emoji: '💨' };
  if (temp > 0 - (pressure - 50) * 0.05) return { label: 'LIQUID 🌊', color: '#74B9FF', emoji: '🌊' };
  return { label: 'SOLID 🧊', color: '#74B9FF', emoji: '🧊' };
}

export default function MatterStatesLab({ scientistMode = false, accentColor = '#74B9FF', onLabBreaker }) {
  const [temp,     setTemp]     = useState(25);    // −273 to 10000°C
  const [pressure, setPressure] = useState(50);    // 0 (vacuum) to 100 (high pressure)
  const [subs,     setSubs]     = useState(0);     // 0=water, 1=CO₂, 2=nitrogen

  const [frame, setFrame]  = useState(0);
  const [danger, setDanger] = useState(false);
  const [logs,  setLogs]   = useState([]);
  const [hint,  setHint]   = useState('Raise temperature slowly — watch molecules speed up through Solid → Liquid → Gas → Plasma! Try lowering pressure while hot to find sublimation.');
  const [logsOpen, setLogsOpen] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);
  const shakeLoop  = useRef(null);

  const stateInfo = getState(temp, pressure);
  const stateKey  = stateInfo.label;

  // KE = 3/2 kT
  const kBoltzmann = 1.38e-23;
  const tempK      = Math.max(0.001, temp + 273.15);
  const kineticEV  = ((3 / 2) * kBoltzmann * tempK) * 6.242e18; // in eV

  // Particle speed approximation (m/s for N2)
  const mN2    = 4.65e-26; // mass in kg
  const vRMS   = Math.sqrt(3 * kBoltzmann * tempK / mN2);

  useEffect(() => {
    const speed = Math.max(0.2, Math.min(3.5, temp / 100));
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.035 * speed) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, [temp]);

  useEffect(() => {
    const isDanger = temp > 8000;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      shakeLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]));
      shakeLoop.current.start();
      setHint('🌟 PLASMA STATE — electrons stripped from atoms! 99% of visible universe is this state!');
    } else {
      dangerLoop.current?.stop();
      shakeLoop.current?.stop();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
    }
  }, [temp]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = { temp, pressure };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`⚗️ Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [temp, pressure]);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-8, 0, 8] });

  // Particle positions — speed and spread depend on state
  const isGas     = stateKey.includes('GAS') || stateKey.includes('PLASMA') || stateKey.includes('SUPER');
  const isLiquid  = stateKey.includes('LIQUID');
  const isSolid   = stateKey.includes('SOLID');
  const speed     = Math.max(0.3, Math.min(4, temp / 80));

  const particles = Array.from({ length: 28 }, (_, i) => {
    if (isSolid) {
      // Grid with vibration
      const col = i % 7;
      const row = Math.floor(i / 7);
      const vibAmp = Math.max(1, temp / 10);
      const vib = Math.sin(frameRef.current * Math.PI * 6 + i) * vibAmp;
      return {
        cx: 24 + col * ((width - 48) / 6) + vib,
        cy: 50 + row * 38 + Math.cos(frameRef.current * Math.PI * 4 + i * 1.3) * vibAmp,
        r: 8, fill: stateInfo.color,
      };
    } else if (isLiquid) {
      // Flowing clusters
      const t = (frameRef.current * speed + i / 28) % 1;
      const angle = t * Math.PI * 2;
      const r = 40 + (i % 4) * 20;
      return {
        cx: CX + Math.cos(angle + i) * (r * 0.8),
        cy: 60 + 60 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 + i * 0.5)),
        r: 7, fill: '#74B9FF',
      };
    } else {
      // Random fast bouncing (gas/plasma)
      const t = (frameRef.current * speed + i * 0.036) % 1;
      const angle = t * Math.PI * 2;
      const orbit = 20 + (i % 7) * (width / 14);
      return {
        cx: orbit + Math.cos(angle * (1 + i * 0.1)) * 30,
        cy: 20 + Math.abs(Math.sin(t * Math.PI * 3 + i)) * (VIEWPORT_H - 40),
        r: isGas ? 5 : 6,
        fill: stateKey.includes('PLASMA') ? '#FD79A8' : '#55EFC4',
      };
    }
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.viewport, { transform: [{ translateX: shakeX }] }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Rect width="100%" height={VIEWPORT_H} fill="#030810" />

          {/* Particles */}
          {particles.map((p, i) => (
            <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={0.8} />
          ))}

          {/* State label */}
          <Rect x={CX - 70} y={VIEWPORT_H - 32} width={140} height={24} fill="#0C0F1A" rx={5} />
          <SvgText x={CX} y={VIEWPORT_H - 16} textAnchor="middle" fill={stateInfo.color} fontSize={14} fontWeight="bold">{stateInfo.label}</SvgText>

          {/* Temperature gauge side bar */}
          <Rect x={width - 18} y={10} width={8} height={VIEWPORT_H - 20} fill="#111" rx={4} />
          <Rect
            x={width - 18}
            y={10 + (VIEWPORT_H - 20) * (1 - Math.min(1, temp / 10000))}
            width={8}
            height={(VIEWPORT_H - 20) * Math.min(1, temp / 10000)}
            fill={stateInfo.color}
            rx={4}
          />

          {scientistMode && (
            <G>
              <Rect x={8} y={8} width={200} height={50} fill="#050810" rx={4} />
              <SvgText x={14} y={22} fill="#74B9FF" fontSize={9} fontFamily="monospace">{`KE = ½mv² = 3/2 k_B T = ${kineticEV.toFixed(4)} eV`}</SvgText>
              <SvgText x={14} y={35} fill="#74B9FF" fontSize={9} fontFamily="monospace">{`v_rms = √(3k_BT/m) ≈ ${Math.min(999999, vRMS).toFixed(0)} m/s`}</SvgText>
              <SvgText x={14} y={48} fill="#74B9FF" fontSize={9} fontFamily="monospace">{`T = ${(temp + 273.15).toFixed(1)} K  |  P = ${pressure}% atm`}</SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FD79A8',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }),
          }]} />
        )}
        <View style={[styles.led, { backgroundColor: stateInfo.color }]} />
      </Animated.View>

      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="🌡️ Temperature" value={Math.round((temp + 273) / 102.73)} onChange={v => { setTemp(Math.round(v * 102.73 - 273)); soundTap(); }} color={stateInfo.color} displayVal={`${temp}°C`} />
          <SliderControl label="⚡ Pressure" value={pressure} onChange={v => { setPressure(v); soundTap(); }} color="#A29BFE" displayVal={`${pressure}%`} />
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label="State" value={stateInfo.emoji} color={stateInfo.color} />
        <ReadoutPill label="Temp (K)" value={`${(temp + 273.15).toFixed(0)}K`} color="#FFD166" />
        <ReadoutPill label="v_rms" value={`${Math.min(999999, Math.round(vRMS)).toLocaleString()}m/s`} color="#55EFC4" />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FD79A8" />
      </View>

      {scientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciPanelTitle}>⚗️ Scientist Mode — Kinetic & Thermodynamic Equations</Text>
          <Text style={styles.sciFormula}>{`Average KE = 3/2 k_B T = 3/2 × 1.38×10⁻²³ × ${(temp + 273.15).toFixed(0)} = ${(1.5 * 1.38e-23 * tempK * 6.242e18).toFixed(4)} eV`}</Text>
          <Text style={styles.sciFormula}>{`Root mean square speed: v_rms = √(3RT/M) ≈ ${Math.min(999999, vRMS).toFixed(0).toLocaleString()} m/s`}</Text>
          <Text style={styles.sciFormula}>{`Phase: ${stateInfo.label}  |  Entropy: ${isSolid ? 'Low 🧊' : isLiquid ? 'Medium 🌊' : 'High 💨'}`}</Text>
          <Text style={styles.sciFormula}>{`Boiling pt at this pressure: ${(100 + (pressure - 50) * 0.3).toFixed(1)}°C`}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#74B9FF" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#74B9FF' }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#050A10' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#74B9FF' }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#D0EEFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore phase transitions! Try: low pressure + high temp (sublimation), very high temp + high pressure (supercritical), temp above 8000°C (plasma)!</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#74B9FF' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : '#74B9FF' }]}>{l.rarity}</Text>
                    </View>
                    <Text style={styles.logCardDesc}>{l.entry}</Text>
                  </View>
                ))}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SliderControl({ label, value, onChange, color, displayVal }) {
  const trackRef = useRef(null);
  return (
    <View style={sliderS.wrap}>
      <Text style={sliderS.label}>{label}</Text>
      <View ref={trackRef} style={sliderS.track}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={e => trackRef.current?.measure((fx, fy, fw, fh, px) => onChange(Math.round(Math.max(0, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))))}
        onResponderMove={e => trackRef.current?.measure((fx, fy, fw, fh, px) => onChange(Math.round(Math.max(0, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))))}
      >
        <View style={[sliderS.fill, { width: `${value}%`, backgroundColor: color }]} />
        <View style={[sliderS.thumb, { left: `${value}%`, borderColor: color, backgroundColor: color + '40' }]} />
      </View>
      <Text style={[sliderS.val, { color }]}>{displayVal}</Text>
    </View>
  );
}
function ReadoutPill({ label, value, color }) {
  return (
    <View style={rS.wrap}>
      <Text style={[rS.val, { color }]}>{value}</Text>
      <Text style={rS.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030810' },
  viewport: { height: VIEWPORT_H, overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  panel: { backgroundColor: '#080C14', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#111' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#060A10', borderTopWidth: 1, borderTopColor: '#111' },
  sciPanel: { backgroundColor: '#080C14', padding: 10, borderTopWidth: 1, borderTopColor: '#0D1A2A' },
  sciPanelTitle: { color: '#4488CC', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sciFormula: { color: '#2A4A7A', fontFamily: 'monospace', fontSize: 10, marginVertical: 1.5 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#050810', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0C1018', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#D0EEFF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});
const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#0C1018', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#111828' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
