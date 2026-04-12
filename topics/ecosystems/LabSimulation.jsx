/**
 * Ecosystems Lab — interactive simulation
 * NO react-native-reanimated (incompatible with Old Architecture Expo Go)
 * Uses only: RN Animated API, setInterval, useState, useRef
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, {
  Circle, Rect, Ellipse, G, Defs, RadialGradient, Stop,
  Text as SvgText, Path,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 240);
const CX = width / 2;
const CY = VIEWPORT_H / 2;

// Plant ring positions
const PLANT_ANGLES = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2);

const DISCOVERIES = [
  { id: 'ec1', cond: s => s.predator > 80 && s.prey < 15, title: 'Trophic Cascade', entry: 'Predator overpopulation drives prey to near-extinction, then itself collapses from starvation — the Lotka-Volterra predator-prey cycle. This is what happened when wolves returned to Yellowstone.', rarity: 'Common' },
  { id: 'ec2', cond: s => s.resource < 20 && s.prey > 65, title: 'Carrying Capacity Crash', entry: 'When prey population exceeds the resource base, density-dependent feedback triggers mass starvation — restoring equilibrium. Nature has a hard limit on population size.', rarity: 'Uncommon' },
  { id: 'ec3', cond: s => s.co2 > 72 && s.resource < 38, title: 'Ecosystem Collapse', entry: 'High pollution degrades primary producers — without plants the entire food chain unravels from the bottom up. This trophic bottom-up collapse is the most common mechanism of ecosystem failure.', rarity: 'Common' },
  { id: 'ec4', cond: s => s.predator > 50 && s.prey > 70 && s.resource > 62, title: 'Trophic Balance', entry: 'All three trophic levels in dynamic equilibrium — this is the stable state ecologists call a healthy trophic structure. Populations oscillate gently without collapse.', rarity: 'Rare ✨' },
  { id: 'ec5', cond: s => s.co2 < 18 && s.resource > 82 && s.prey > 52, title: 'Carbon Sequestration', entry: 'Dense plant cover with healthy prey and low pollution creates maximum biological carbon storage — the natural climate solution more powerful than any technology yet invented.', rarity: 'Rare ✨' },
];

export default function EcosystemsLab({ scientistMode = false, accentColor = '#2ECC71', onLabBreaker }) {
  const [prey,     setPrey]     = useState(60);  // prey population %
  const [predator, setPredator] = useState(30);  // predator %
  const [resource, setResource] = useState(70);  // plant resource %
  const [co2,      setCo2]      = useState(40);  // pollution %
  const [frame,    setFrame]    = useState(0);
  const [danger,   setDanger]   = useState(false);
  const [logs,     setLogs]     = useState([]);
  const [hint,     setHint]     = useState('Adjust prey population — watch the preditor-prey Lotka-Volterra cycle emerge! Push predators to 80%+ with low prey for a trophic cascade.');
  const [logsOpen, setLogsOpen] = useState(false);
  const [discMode, setDiscMode] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);
  const shakeLoop  = useRef(null);

  useEffect(() => {
    const speed = 0.2 + (prey / 100) * 0.8;
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.038 * speed) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, [prey]);

  useEffect(() => {
    const collapse = predator > 80 && prey < 15;
    setDanger(collapse);
    if (collapse) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      shakeLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]));
      shakeLoop.current.start();
      setHint('💀 ECOSYSTEM COLLAPSE — Prey extinct! Predators will starve. Reduce predator pressure!');
    } else {
      dangerLoop.current?.stop();
      shakeLoop.current?.stop();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
    }
  }, [predator, prey]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = { prey, predator, resource, co2 };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`🌍 Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [prey, predator, resource, co2]);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-7, 0, 7] });

  // Prey animals orbit fast
  const preyAnimals = Array.from({ length: 12 }, (_, i) => {
    const flee = predator / 100;
    const speed = 0.4 + flee * 0.8;
    const t = (frameRef.current * speed + i / 12) % 1;
    const angle = t * Math.PI * 2 + flee * 0.5;
    const orbit = 72 + (i % 4) * 18;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      opacity: Math.max(0, Math.min(1, prey / 20)),
    };
  });

  // Predators orbit slowly
  const predatorAnimals = Array.from({ length: 4 }, (_, i) => {
    const speed = 0.25 + (prey / 100) * 0.4;
    const t = (frameRef.current * speed + i / 4) % 1;
    const angle = t * Math.PI * 2;
    const orbit = 48 + i * 28;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      opacity: Math.max(0, Math.min(1, predator / 20)),
    };
  });

  // Plants ring (outer)
  const plants = PLANT_ANGLES.map((angle, i) => {
    const grow = resource / 100;
    const sway = Math.sin(frameRef.current * Math.PI * 2 + i) * 2.5;
    return {
      cx: CX + Math.cos(angle) * 130 + sway,
      cy: CY + Math.sin(angle) * 130,
      r: 4 + grow * 8,
      fill: danger ? '#8B4513' : co2 > 70 ? '#556B2F' : '#27AE60',
    };
  });

  // CO2 rising clouds
  const co2Clouds = Array.from({ length: 5 }, (_, i) => {
    const t = (frameRef.current * 0.3 + i / 5) % 1;
    return {
      cx: 50 + i * (width / 5) + Math.sin(t * Math.PI * 3 + i) * 25,
      cy: VIEWPORT_H - t * VIEWPORT_H,
      r: 7 + (co2 / 100) * 7,
      opacity: co2 > 15 ? Math.min(0.75, co2 / 100 * 1.5) : 0,
    };
  });

  // Sun in top right
  const sunR = 20 + Math.sin(frameRef.current * Math.PI * 2) * 2;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.viewport, { transform: [{ translateX: shakeX }] }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Defs>
            <RadialGradient id="ecoBg" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor="#041A0C" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#030D08" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height={VIEWPORT_H} fill="url(#ecoBg)" />

          {/* Sun */}
          <Circle cx={width - 38} cy={36} r={sunR} fill="#F39C12" fillOpacity={0.88} />

          {/* CO2 clouds */}
          {co2Clouds.map((c, i) => (
            <Ellipse key={i} cx={c.cx} cy={c.cy} rx={c.r * 1.4} ry={c.r} fill="#778899" opacity={c.opacity} />
          ))}

          {/* Plants ring */}
          {plants.map((p, i) => (
            <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={0.8} />
          ))}

          {/* Prey (green dots) */}
          {preyAnimals.map((a, i) => (
            <Circle key={i} cx={a.cx} cy={a.cy} r={5} fill="#2ECC71" opacity={a.opacity} />
          ))}

          {/* Predators (red triangles approximated as larger circles) */}
          {predatorAnimals.map((a, i) => (
            <Circle key={i} cx={a.cx} cy={a.cy} r={9} fill="#E74C3C" opacity={a.opacity} />
          ))}

          {/* Centre ecosystem label */}
          {discMode && (
            <G>
              <SvgText x={CX} y={CY + 6} textAnchor="middle" fill="#2ECC71" fontSize={10} fontWeight="bold">ECO-CORE</SvgText>
              <SvgText x={20} y={VIEWPORT_H - 12} textAnchor="start" fill="#27AE60" fontSize={9}>PLANTS (ring)</SvgText>
              <SvgText x={CX} y={VIEWPORT_H - 12} textAnchor="middle" fill="#2ECC71" fontSize={9}>PREY (green)</SvgText>
              <SvgText x={width - 20} y={VIEWPORT_H - 12} textAnchor="end" fill="#E74C3C" fontSize={9}>PRED (red)</SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#C0392B',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: danger ? '#E74C3C' : resource > 30 ? '#2ECC71' : '#333' }]} />
        <TouchableOpacity style={styles.magBtn} onPress={() => { setDiscMode(d => !d); soundTap(); }}>
          <Icon name={discMode ? 'close' : 'microscope'} size={22} color="#F39C12" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="🐇 Prey Pop." value={prey} onChange={v => { setPrey(v); soundTap(); }} color="#2ECC71" displayVal={`${prey}%`} />
          <SliderControl label="🐺 Predators" value={predator} onChange={v => { setPredator(v); soundTap(); }} color={predator > 80 ? '#E74C3C' : '#E74C3C'} displayVal={`${predator}%`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="🌿 Resources" value={resource} onChange={v => { setResource(v); soundTap(); }} color="#F39C12" displayVal={`${resource}%`} />
          <SliderControl label="💨 CO₂/Pollution" value={co2} onChange={v => { setCo2(v); soundTap(); }} color={co2 > 70 ? '#E74C3C' : '#778899'} displayVal={`${co2}%`} />
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label="Prey" value={`${prey}%`} color="#2ECC71" />
        <ReadoutPill label="Predator" value={`${predator}%`} color="#E74C3C" />
        <ReadoutPill label="Balance" value={danger ? 'COLLAPSE' : predator > 50 && prey > 50 ? 'Tension' : 'Stable'} color={danger ? '#E74C3C' : '#2ECC71'} />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#F39C12" />
      </View>

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#2ECC71" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#2ECC71' }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#071510' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#2ECC71' }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#D5F5E3" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore the ecosystem! Try trophic cascade (high predators + low prey), or perfect balance.</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#2ECC71' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#F39C12' : '#2ECC71' }]}>{l.rarity}</Text>
                    </View>
                    <Text style={styles.logCardDesc}>{l.entry}</Text>
                  </View>
                ))
              }
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
        onResponderGrant={e => { trackRef.current?.measure((fx, fy, fw, fh, px) => { onChange(Math.round(Math.max(0, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))); }); }}
        onResponderMove={e => { trackRef.current?.measure((fx, fy, fw, fh, px) => { onChange(Math.round(Math.max(0, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))); }); }}
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
  container: { flex: 1, backgroundColor: '#030D08' },
  viewport: { height: VIEWPORT_H, backgroundColor: '#030D08', overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  magBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 16 },
  panel: { backgroundColor: '#071510', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#0D2018' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#050F0A', borderTopWidth: 1, borderTopColor: '#111' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#04100A', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0C1C10', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#D5F5E3', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});

const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#0D1C10', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#1A2A1A' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});

const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
