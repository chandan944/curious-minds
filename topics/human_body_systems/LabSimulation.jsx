/**
 * Human Body Systems Lab â€” interactive simulation
 * NO react-native-reanimated (incompatible with Old Architecture)
 * Uses only: RN Animated API, setInterval, useState, useRef
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, Ellipse, Defs, Stop, RadialGradient, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 240);
const CX = width / 2;
const CY = VIEWPORT_H / 2;

const DISCOVERIES = [
  { id: 'b1', cond: s => s.hr > 140 && s.cortisol > 70, title: 'Fight-or-Flight', entry: 'High cortisol + elevated heart rate activates the sympathetic nervous system. Pupils dilate, digestion halts, muscles get priority blood flow â€” the ancient survival cascade.', rarity: 'Common' },
  { id: 'b2', cond: s => s.o2 < 88, title: 'Hypoxia Warning', entry: 'SpOâ‚‚ below 90% triggers chemoreceptors in the carotid body â€” the brainstem forces breathing to accelerate. Below 85%, cognitive function rapidly deteriorates.', rarity: 'Uncommon' },
  { id: 'b3', cond: s => s.nerve > 82 && s.cortisol < 20, title: 'Flow State', entry: 'Fast neural conduction with low stress cortisol produces peak cognitive and athletic performance â€” the neuroscience of a "flow state". Timing and low anxiety are both essential.', rarity: 'Rare âœ¨' },
  { id: 'b4', cond: s => s.hr < 48, title: 'Athletic Bradycardia', entry: 'Heart rates below 50 bpm in trained athletes mean each stroke volume is massive. Lance Armstrong\'s resting HR was 32 bpm â€” his heart is so efficient it barely needs to beat!', rarity: 'Uncommon' },
  { id: 'b5', cond: s => s.o2 < 84 && s.hr > 155, title: 'Anaerobic Threshold', entry: 'When Oâ‚‚ can\'t meet demand at extreme heart rates, muscles switch to anaerobic glycolysis â€” producing lactic acid and the famous "burn" of intense exercise.', rarity: 'Rare âœ¨' },
];

export default function HumanBodySystemsLab({ scientistMode = false, accentColor = '#FF6B9D', onLabBreaker }) {
  const [hr,       setHr]       = useState(72);   // 40â€“200 bpm
  const [o2,       setO2]       = useState(98);   // 0â€“100 SpO2
  const [nerve,    setNerve]    = useState(50);   // nerve conduction speed
  const [cortisol, setCortisol] = useState(20);  // stress hormone %
  const [frame,    setFrame]    = useState(0);
  const [danger,   setDanger]   = useState(false);
  const [logs,     setLogs]     = useState([]);
  const [hint,     setHint]     = useState('Raise heart rate â€” watch blood cells speed up and lungs expand! Push HR above 170 for danger mode.');
  const [logsOpen, setLogsOpen] = useState(false);
  const [discMode, setDiscMode] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);
  const shakeLoop  = useRef(null);

  // Frame loop â€” speed driven by heart rate
  useEffect(() => {
    const speed = hr / 72;
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.04 * speed) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, [hr]);

  // Danger (extreme HR)
  useEffect(() => {
    const isDanger = hr > 172 || hr < 43;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      shakeLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]));
      shakeLoop.current.start();
      setHint(hr > 172 ? 'ðŸ”¥ CARDIAC EMERGENCY â€” Heart rate critically high!' : 'âš ï¸ Extreme bradycardia â€” heart rate dangerously low!');
    } else {
      dangerLoop.current?.stop();
      shakeLoop.current?.stop();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
    }
  }, [hr]);

  // Discovery checks
  useEffect(() => {
    const id = setInterval(() => {
      const state = { hr, o2, nerve, cortisol };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`ðŸ’¡ Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [hr, o2, nerve, cortisol]);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-5, 0, 5] });

  // Blood cells â€” orbit speed proportional to HR
  const bloodCells = Array.from({ length: 12 }, (_, i) => {
    const speed = hr / 72;
    const t = (frameRef.current * speed + i / 12) % 1;
    const angle = t * Math.PI * 2;
    const orbit = 80 + (i % 3) * 20;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      fill: o2 > 50 ? '#FF4444' : '#880000',
    };
  });

  // Lung expand â€” breathing cycle
  const breathPhase = Math.sin(frameRef.current * Math.PI * 2 * 0.35) * 0.5 + 0.5;
  const lungRx = 28 + breathPhase * 14 * (o2 / 100);
  const lungRy = 42 + breathPhase * 18 * (o2 / 100);
  const lungFill = o2 > 50 ? '#4FC3F7' : '#1A3A4A';

  // Heart beat
  const beatPhase = Math.abs(Math.sin(frameRef.current * Math.PI * 2 * (hr / 60)));
  const heartR = 26 + beatPhase * 10;
  const heartFill = danger ? '#FF0000' : '#FF6B9D';

  // Neural signals â€” move left to right
  const neuralSignals = nerve > 15 ? Array.from({ length: 5 }, (_, i) => {
    const speed = nerve / 100;
    const t = (frameRef.current * speed * 2 + i / 5) % 1;
    return {
      cx: CX - 140 + t * 280,
      cy: CY + 82 + Math.sin(t * Math.PI * 4) * 12,
      opacity: speed > 0.1 ? 0.9 : 0,
    };
  }) : [];

  return (
    <View style={styles.container}>
      {/* VIEWPORT */}
      <Animated.View style={[styles.viewport, { transform: [{ translateX: shakeX }] }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Defs>
            <RadialGradient id="bodyBg" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor="#1A0820" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#080410" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height={VIEWPORT_H} fill="url(#bodyBg)" />

          {/* Lungs */}
          <Ellipse cx={CX - 78} cy={CY - 10} rx={lungRx} ry={lungRy} fill={lungFill} fillOpacity={0.7} />
          <Ellipse cx={CX + 78} cy={CY - 10} rx={lungRx} ry={lungRy} fill={lungFill} fillOpacity={0.7} />
          {discMode && (
            <>
              <SvgText x={CX - 78} y={CY - 56} textAnchor="middle" fill="#4FC3F7" fontSize={10}>L. Lung</SvgText>
              <SvgText x={CX + 78} y={CY - 56} textAnchor="middle" fill="#4FC3F7" fontSize={10}>R. Lung</SvgText>
            </>
          )}

          {/* Blood cells */}
          {bloodCells.map((b, i) => (
            <Circle key={i} cx={b.cx} cy={b.cy} r={5} fill={b.fill} opacity={0.85} />
          ))}

          {/* Heart */}
          <Circle cx={CX} cy={CY} r={heartR} fill={heartFill} opacity={0.9} />
          {discMode && (
            <SvgText x={CX} y={CY + 38} textAnchor="middle" fill="#FF6B9D" fontSize={10}>Heart</SvgText>
          )}

          {/* Neural signals */}
          {neuralSignals.map((ns, i) => (
            <Circle key={i} cx={ns.cx} cy={ns.cy} r={4} fill="#F9CA24" opacity={ns.opacity} />
          ))}
          {discMode && nerve > 15 && (
            <SvgText x={CX} y={CY + 102} textAnchor="middle" fill="#F9CA24" fontSize={10}>Neural Signals</SvgText>
          )}
        </Svg>

        {/* Danger overlay */}
        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF3131',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: danger ? '#FF3131' : hr > 60 ? '#FF6B9D' : '#333' }]} />
        <TouchableOpacity style={styles.magBtn} onPress={() => { setDiscMode(d => !d); soundTap(); }}>
          <Icon name={discMode ? 'close' : 'microscope'} size={22} color="#4FC3F7" />
        </TouchableOpacity>
      </Animated.View>

      {/* CONTROLS */}
      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="ðŸ«€ Heart Rate" value={Math.round((hr - 40) / 1.6)} onChange={v => { setHr(Math.round(40 + v * 1.6)); soundTap(); }} color={danger ? '#FF3131' : '#FF6B9D'} displayVal={`${hr} bpm`} />
          <SliderControl label="ðŸ« SpOâ‚‚ Oxygen" value={o2} onChange={v => { setO2(v); soundTap(); }} color={o2 < 90 ? '#FF9500' : '#4FC3F7'} displayVal={`${o2}%`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="âš¡ Nerve Speed" value={nerve} onChange={v => { setNerve(v); soundTap(); }} color="#F9CA24" displayVal={`${nerve}%`} />
          <SliderControl label="ðŸ’Š Cortisol" value={cortisol} onChange={v => { setCortisol(v); soundTap(); }} color={cortisol > 70 ? '#FF4500' : '#C77DFF'} displayVal={`${cortisol}%`} />
        </View>
      </View>

      {/* READOUT */}
      <View style={styles.readoutBar}>
        <ReadoutPill label="Heart Rate" value={`${hr}bpm`} color={danger ? '#FF3131' : '#FF6B9D'} />
        <ReadoutPill label="SpOâ‚‚" value={`${o2}%`} color={o2 < 90 ? '#FF9500' : '#4FC3F7'} />
        <ReadoutPill label="Status" value={danger ? 'DANGER' : hr > 120 ? 'Active' : hr < 55 ? 'Rest' : 'Normal'} color={danger ? '#FF3131' : '#22C55E'} />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FFD93D" />
      </View>

      {/* HINT */}
      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#FF6B9D" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#FF6B9D' }]}><Text style={styles.logBadgeText}>{logs.length}</Text></View>}
      </TouchableOpacity>

      {/* LOG MODAL */}
      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#110822' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#FF6B9D' }]}>Research Logs ðŸ““</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#FFE0EE" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore controls to unlock discoveries! Try extreme HR, low SpOâ‚‚, or low cortisol + high nerve speed.</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#FF6B9D' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : '#4FC3F7' }]}>{l.rarity}</Text>
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
  container: { flex: 1, backgroundColor: '#080410' },
  viewport: { height: VIEWPORT_H, backgroundColor: '#080410', overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  magBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 16 },
  panel: { backgroundColor: '#110822', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#2A1030' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#0A0612', borderTopWidth: 1, borderTopColor: '#111' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#0C0418', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#666', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#1A0825', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#FFE0EE', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});

const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#666', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#1A0828', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#2A1A3A' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});

const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
