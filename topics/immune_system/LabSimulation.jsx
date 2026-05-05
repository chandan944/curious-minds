/**
 * Immune System Lab â€” interactive simulation
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
import Svg, { Circle, Rect, G, Defs, Stop, RadialGradient, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 240);
const CX = width / 2;
const CY = VIEWPORT_H / 2;

const DISCOVERIES = [
  { id: 'i1', cond: s => s.threat > 80 && s.response < 38, title: 'Immune Overwhelm', entry: 'When pathogen replication outpaces immune cell production, a cytokine storm develops â€” the immune system attacks host tissue, causing organ damage worse than the infection itself.', rarity: 'Common' },
  { id: 'i2', cond: s => s.antibody > 82 && s.threat < 18, title: 'Humoral Immunity', entry: 'High antibody levels with low pathogen presence equals immunological memory. The next exposure is neutralised before symptoms appear â€” the scientific basis of vaccination.', rarity: 'Uncommon' },
  { id: 'i3', cond: s => s.inflam > 82, title: 'Chronic Inflammation', entry: 'Sustained inflammation causes collateral tissue damage â€” the underlying mechanism of autoimmune diseases like rheumatoid arthritis, lupus, and multiple sclerosis.', rarity: 'Common' },
  { id: 'i4', cond: s => s.response > 80 && s.antibody > 80 && s.threat > 60, title: 'Peak Immune Response', entry: 'T-cells, B-cells, and antibodies simultaneously activated in a coordinated response. Plasma cells produce 2,000 antibodies per second â€” maximum immune capacity.', rarity: 'Rare âœ¨' },
  { id: 'i5', cond: s => s.threat < 10 && s.antibody > 52, title: 'Clonal Selection', entry: 'In the absence of pathogens, B-cells with matching antibodies are selected and proliferate â€” the fundamental principle behind why vaccines create long-term immunity.', rarity: 'Rare âœ¨' },
];

export default function ImmuneSystemLab({ scientistMode = false, accentColor = '#00D4FF', onLabBreaker }) {
  const [threat,   setThreat]   = useState(20);  // pathogen load %
  const [response, setResponse] = useState(40);  // T/B cell activity %
  const [antibody, setAntibody] = useState(30);  // antibody level %
  const [inflam,   setInflam]   = useState(25);  // inflammation %
  const [frame,    setFrame]    = useState(0);
  const [danger,   setDanger]   = useState(false);
  const [logs,     setLogs]     = useState([]);
  const [hint,     setHint]     = useState('Increase pathogen load â€” then deploy T-cells and antibodies to fight back! Watch the lymph node pulse.');
  const [logsOpen, setLogsOpen] = useState(false);
  const [discMode, setDiscMode] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);
  const shakeLoop  = useRef(null);

  useEffect(() => {
    const speed = 0.3 + (threat / 100) * 1.2;
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.038 * speed) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, [threat]);

  useEffect(() => {
    const overwhelmed = threat > 80 && response < 38;
    setDanger(overwhelmed);
    if (overwhelmed) {
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
      setHint('ðŸš¨ CYTOKINE STORM â€” Immune system overwhelmed! Raise T-cell response immediately!');
    } else {
      dangerLoop.current?.stop();
      shakeLoop.current?.stop();
      dangerAnim.setValue(0);
      shakeAnim.setValue(0);
      if (!overwhelmed && threat > 60 && response < 50) setHint('âš ï¸ Pathogen load high â€” boost immune response!');
    }
  }, [threat, response]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = { threat, response, antibody, inflam };
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
  }, [threat, response, antibody, inflam]);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  // Pathogens orbit
  const pathogens = Array.from({ length: 8 }, (_, i) => {
    const speed = 0.3 + (threat / 100) * 1.2;
    const t = (frameRef.current * speed + i / 8) % 1;
    const angle = t * Math.PI * 2;
    const orbit = 60 + (i % 4) * 28;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      r: 5 + (threat / 100) * 4,
      fill: danger ? '#FF3131' : '#FF6600',
    };
  });

  // T-cells chase
  const tCells = response > 25 ? Array.from({ length: 6 }, (_, i) => {
    const speed = response / 60;
    const t = (frameRef.current * speed + i / 6 + 0.5) % 1;
    const angle = t * Math.PI * 2;
    const orbit = 52 + (i % 3) * 36;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      opacity: 0.9,
    };
  }) : [];

  // Antibodies
  const antibodies = antibody > 18 ? Array.from({ length: 10 }, (_, i) => {
    const spread = antibody / 100;
    const t = (frameRef.current * 0.6 + i / 10) % 1;
    const angle = t * Math.PI * 2;
    const orbit = 38 + i * 10 * spread;
    return {
      cx: CX + Math.cos(angle) * orbit,
      cy: CY + Math.sin(angle) * orbit,
      opacity: spread > 0.2 ? 0.7 : 0,
    };
  }) : [];

  // Inflammation ring pulse
  const infPulse = Math.sin(frameRef.current * Math.PI * 6) * 8;
  const infOrbit = 112 + infPulse * (inflam / 100);

  // Lymph node pulse
  const lymphPulse = Math.sin(frameRef.current * Math.PI * 4) * 3;
  const lymphR = 20 + lymphPulse * (response / 100);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.viewport, { transform: [{ translateX: shakeX }] }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Defs>
            <RadialGradient id="immuneBg" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor="#081828" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#040A12" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height={VIEWPORT_H} fill="url(#immuneBg)" />

          {/* Inflammation ring */}
          {inflam > 15 && (
            <Circle cx={CX} cy={CY} r={infOrbit} fill="none"
              stroke={danger ? '#FF3131' : '#FF4500'}
              strokeWidth={5}
              strokeOpacity={(inflam / 100) * 0.55}
            />
          )}

          {/* Pathogens */}
          {pathogens.map((p, i) => (
            <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={0.85} />
          ))}

          {/* T-Cells */}
          {tCells.map((t, i) => (
            <Circle key={i} cx={t.cx} cy={t.cy} r={7} fill="#00D4FF" opacity={t.opacity} />
          ))}

          {/* Antibodies */}
          {antibodies.map((a, i) => (
            <Circle key={i} cx={a.cx} cy={a.cy} r={3} fill="#FF9500" opacity={a.opacity} />
          ))}

          {/* Lymph node centre */}
          <Circle cx={CX} cy={CY} r={lymphR} fill="#081828" stroke="#00D4FF" strokeWidth={2} strokeOpacity={0.7} />
          <SvgText x={CX} y={CY + 4} textAnchor="middle" fill="#00D4FF" fontSize={9} fontWeight="bold">LYMPH</SvgText>

          {discMode && (
            <G>
              <SvgText x={CX} y={25} textAnchor="middle" fill="#AAA" fontSize={9}>ORANGE=Antibodies Â· CYAN=T-cells Â· ORANGE/RED=Pathogens</SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF3131',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: danger ? '#FF3131' : response > 30 ? '#00D4FF' : '#333' }]} />
        <TouchableOpacity style={styles.magBtn} onPress={() => { setDiscMode(d => !d); soundTap(); }}>
          <Icon name={discMode ? 'close' : 'microscope'} size={22} color="#FF9500" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="ðŸ¦  Pathogen Load" value={threat} onChange={v => { setThreat(v); soundTap(); }} color={threat > 80 ? '#FF3131' : '#FF6600'} displayVal={`${threat}%`} />
          <SliderControl label="ðŸ›¡ï¸ T-Cell Response" value={response} onChange={v => { setResponse(v); soundTap(); }} color="#00D4FF" displayVal={`${response}%`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="ðŸ’‰ Antibodies" value={antibody} onChange={v => { setAntibody(v); soundTap(); }} color="#FF9500" displayVal={`${antibody}%`} />
          <SliderControl label="ðŸ”¥ Inflammation" value={inflam} onChange={v => { setInflam(v); soundTap(); }} color={inflam > 80 ? '#FF3131' : '#FF4500'} displayVal={`${inflam}%`} />
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label="Threat" value={threat > 80 ? 'CRITICAL' : threat > 50 ? 'High' : 'Low'} color={threat > 80 ? '#FF3131' : '#FF9500'} />
        <ReadoutPill label="T-Cells" value={`${response}%`} color="#00D4FF" />
        <ReadoutPill label="Status" value={danger ? 'STORM!' : antibody > 60 ? 'Immune' : 'Fighting'} color={danger ? '#FF3131' : '#22C55E'} />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FF9500" />
      </View>

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#00D4FF" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#00D4FF' }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#091220' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#00D4FF' }]}>Research Logs ðŸ““</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#D0EEFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore controls! Try high pathogen + low response, or build antibodies with no threat.</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#00D4FF' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FF9500' : '#00D4FF' }]}>{l.rarity}</Text>
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
  container: { flex: 1, backgroundColor: '#040A12' },
  viewport: { height: VIEWPORT_H, backgroundColor: '#040A12', overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  magBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 16 },
  panel: { backgroundColor: '#091220', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#0D2030' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#070E18', borderTopWidth: 1, borderTopColor: '#111' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#060C16', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#666', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0D1828', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#D0EEFF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});

const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#666', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#0D1828', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#0D2030' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});

const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
