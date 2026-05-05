/**
 * Cell Structure Lab â€” interactive simulation
 * Architecture: NO react-native-reanimated (Reanimated v4 requires New Architecture)
 * Uses only: RN Animated API, setInterval, useState, useRef
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, {
  Circle, Rect, Ellipse, G, Defs, RadialGradient, Stop,
  Text as SvgText, Line, Path,
import Svg, { Circle, Rect, G, Ellipse, Defs, Stop, RadialGradient, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 240);
const CX = width / 2;
const CY = VIEWPORT_H / 2;

// â”€â”€ Organelle colours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ORGANELLES = [
  { angle: 30,  radius: 95,  size: 11, color: '#FF6B6B', label: 'Mitochondria', pulseOff: 0.0 },
  { angle: 100, radius: 90,  size: 8,  color: '#FFD93D', label: 'Golgi Body',   pulseOff: 0.4 },
  { angle: 170, radius: 100, size: 13, color: '#6BCB77', label: 'Chloroplast',  pulseOff: 0.8 },
  { angle: 240, radius: 93,  size: 10, color: '#4D96FF', label: 'Vacuole',      pulseOff: 1.2 },
  { angle: 310, radius: 96,  size: 9,  color: '#C77DFF', label: 'Lysosome',     pulseOff: 1.6 },
];

const DISCOVERIES = [
  { id: 'c1', cond: s => s.size > 80 && s.energy > 80, title: 'Cell Division Threshold', entry: 'When a cell grows large enough with sufficient ATP, it signals for mitosis â€” division keeps the DNA-to-cytoplasm ratio balanced. Uncontrolled growth = cancer.', rarity: 'Rare âœ¨' },
  { id: 'c2', cond: s => s.rna < 12,  title: 'Transcription Silence', entry: 'With near-zero RNA activity, protein synthesis halts â€” the cell enters a quiescent state used in stem cells and dormancy. No RNA = no proteins = no life.', rarity: 'Uncommon' },
  { id: 'c3', cond: s => s.perm > 83, title: 'Osmotic Lysis', entry: 'A membrane too permeable loses selective control â€” water floods in by osmosis and the cell lyses (bursts). This is cytolysis â€” the cell\'s catastrophic failure mode.', rarity: 'Common' },
  { id: 'c4', cond: s => s.energy < 12 && s.size > 60, title: 'Energy Crisis', entry: 'Large cells need tremendous ATP to maintain ion gradients. When energy drops, sodium-potassium pumps fail and the cell depolarises â€” triggering cell death.', rarity: 'Uncommon' },
  { id: 'c5', cond: s => s.rna > 70 && s.energy > 70, title: 'Ribosome Storm', entry: 'High RNA + high ATP floods the endoplasmic reticulum with ribosomes â€” the cell\'s protein factory running at maximum capacity. Seen in rapidly dividing tumour cells!', rarity: 'Rare âœ¨' },
];

export default function CellStructureLab({ scientistMode = false, accentColor = '#7B61FF', onLabBreaker }) {
  const [size,   setSize]   = useState(50);   // cell size %
  const [rna,    setRna]    = useState(30);   // RNA activity %
  const [perm,   setPerm]   = useState(50);   // membrane permeability %
  const [energy, setEnergy] = useState(60);   // ATP energy %
  const [frame,  setFrame]  = useState(0);    // animation frame 0-1
  const [danger, setDanger] = useState(false);
  const [logs,   setLogs]   = useState([]);
  const [hint,   setHint]   = useState('Slide Cell Size up and watch the organelles respond. Try pushing Permeability above 85%!');
  const [logsOpen, setLogsOpen] = useState(false);
  const [discMode, setDiscMode] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);
  const shakeLoop  = useRef(null);

  // Frame loop
  useEffect(() => {
    const speed = 0.2 + (energy / 100) * 0.8;
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.04 * speed) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, [energy]);

  // Danger (high permeability)
  useEffect(() => {
    const isDanger = perm > 85;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      shakeLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]));
      shakeLoop.current.start();
      setHint('ðŸ’¥ Membrane too permeable! Water is flooding in â€” OSMOTIC LYSIS!');
    } else {
      dangerLoop.current?.stop();
      shakeLoop.current?.stop();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
    }
    if (perm > 75 && perm <= 85) setHint('âš ï¸ High permeability â€” membrane selectivity breaking down!');
  }, [perm]);

  // Discovery checks
  useEffect(() => {
    const id = setInterval(() => {
      const state = { size, rna, perm, energy };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`ðŸ”¬ Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [size, rna, perm, energy]);

  // Calculated positions
  const nucleusR = 45 + size * 0.18;
  const poreOpen = perm / 100;
  const granaGlow = Math.min(1, energy / 70);
  const glucoseOpacity = rna / 100;

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  // Organelle computed positions
  const organelleNodes = ORGANELLES.map(o => {
    const pulse = Math.sin(frameRef.current * Math.PI * 2 + o.pulseOff) * 0.12 + 1;
    const r = (o.size + size * 0.06) * pulse;
    const rad = (o.angle * Math.PI) / 180;
    return { cx: CX + Math.cos(rad) * o.radius, cy: CY + Math.sin(rad) * o.radius, r, ...o };
  });

  // Ribosome positions
  const ribosomes = rna > 20 ? Array.from({ length: 8 }, (_, i) => {
    const t = (frameRef.current + i * 0.125) % 1;
    const angle = t * Math.PI * 2;
    const r = 88 + (i % 3) * 10;
    return { cx: CX + Math.cos(angle) * r, cy: CY + Math.sin(angle) * r, opacity: glucoseOpacity };
  }) : [];

  // Membrane pores
  const pores = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return {
      cx: CX + Math.cos(angle) * 128,
      cy: CY + Math.sin(angle) * 128,
      r: 3 + poreOpen * 6,
      opacity: 0.3 + poreOpen * 0.6,
    };
  });

  return (
    <View style={styles.container}>
      {/* VIEWPORT */}
      <Animated.View style={[styles.viewport, { transform: [{ translateX: shakeX }] }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Defs>
            <RadialGradient id="cellBg" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor="#1A1040" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#050810" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height={VIEWPORT_H} fill="url(#cellBg)" />

          {/* Cell wall ring */}
          <Ellipse cx={CX} cy={CY} rx={130} ry={130} fill="none"
            stroke="#7B61FF" strokeWidth={2} strokeOpacity={0.5} strokeDasharray="8 4" />

          {/* Membrane pores */}
          {pores.map((p, i) => (
            <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#00FFD1" opacity={p.opacity} />
          ))}

          {/* Nucleus */}
          <Ellipse cx={CX} cy={CY} rx={nucleusR} ry={nucleusR * 0.75}
            fill={danger ? '#3A002A' : '#1A1040'} stroke="#7B61FF" strokeWidth={2} strokeOpacity={0.7} />
          {discMode && (
            <SvgText x={CX} y={CY + 5} textAnchor="middle" fill="#7B61FF" fontSize={10} fontWeight="bold">CHROMATIN</SvgText>
          )}

          {/* Organelles */}
          {organelleNodes.map((o, i) => (
            <G key={i}>
              <Circle cx={o.cx} cy={o.cy} r={o.r} fill={o.color} opacity={0.85} />
              {discMode && (
                <SvgText x={o.cx} y={o.cy - o.r - 4} textAnchor="middle" fill={o.color} fontSize={9}>{o.label}</SvgText>
              )}
            </G>
          ))}

          {/* Ribosomes */}
          {ribosomes.map((rb, i) => (
            <Circle key={i} cx={rb.cx} cy={rb.cy} r={3} fill="#00FFD1" opacity={rb.opacity} />
          ))}

          {/* Status LED */}
        </Svg>

        {/* Danger overlay */}
        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF3E6C',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: danger ? '#FF3E6C' : energy > 20 ? '#7B61FF' : '#333' }]} />
        <TouchableOpacity style={styles.magBtn} onPress={() => { setDiscMode(d => !d); soundTap(); }}>
          <Icon name={discMode ? 'close' : 'microscope'} size={22} color="#00FFD1" />
        </TouchableOpacity>
      </Animated.View>

      {/* CONTROLS */}
      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="ðŸ”¬ Cell Size" value={size} onChange={v => { setSize(v); soundTap(); }} color="#7B61FF" displayVal={`${size}%`} />
          <SliderControl label="ðŸ§¬ RNA Activity" value={rna} onChange={v => { setRna(v); soundTap(); }} color="#00FFD1" displayVal={`${rna}%`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="ðŸŒŠ Permeability" value={perm} onChange={v => { setPerm(v); soundTap(); }} color={perm > 85 ? '#FF3E6C' : '#C77DFF'} displayVal={`${perm}%`} />
          <SliderControl label="âš¡ ATP Energy" value={energy} onChange={v => { setEnergy(v); soundTap(); }} color="#FFD93D" displayVal={`${energy}%`} />
        </View>
      </View>

      {/* READOUT */}
      <View style={styles.readoutBar}>
        <ReadoutPill label="Nucleus R" value={`${Math.round(nucleusR)}px`} color="#7B61FF" />
        <ReadoutPill label="Ribosomes" value={rna > 20 ? 'Active' : 'Idle'} color="#00FFD1" />
        <ReadoutPill label="Membrane" value={perm > 85 ? 'LYSIS!' : perm > 70 ? 'Leaking' : 'Healthy'} color={perm > 85 ? '#FF3E6C' : '#7B61FF'} />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FFD93D" />
      </View>

      {/* HINT BAR */}
      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#7B61FF" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={styles.logBadge}><Text style={styles.logBadgeText}>{logs.length}</Text></View>}
      </TouchableOpacity>

      {/* LOG MODAL */}
      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#0C0F1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#7B61FF' }]}>Research Logs ðŸ““</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#E0DCFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore controls to unlock discoveries! Try large cell size, low RNA, or high permeability.</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#7B61FF' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : '#00FFD1' }]}>{l.rarity}</Text>
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

// â”€â”€ Shared slider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SliderControl({ label, value, onChange, color, displayVal }) {
  const trackRef = useRef(null);
  return (
    <View style={sliderS.wrap}>
      <Text style={sliderS.label}>{label}</Text>
      <View
        ref={trackRef}
        style={sliderS.track}
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
  container: { flex: 1, backgroundColor: '#050810' },
  viewport: { height: VIEWPORT_H, backgroundColor: '#050810', overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  magBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 16 },
  panel: { backgroundColor: '#0C0F1A', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1A1A2A' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#080B14', borderTopWidth: 1, borderTopColor: '#111' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#0A0C16', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#666', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#7B61FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#111520', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#E0DCFF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});

const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#666', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#1A1A2A', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A3A' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});

const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
