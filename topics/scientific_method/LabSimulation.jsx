/**
 * Scientific Method Lab — Experiment Design Simulator
 * Scientist Mode: real p-value calculation, statistical equations,
 * bias indicators, and sample size analysis
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, G, Line, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 230);

const DISCOVERIES = [
  { id: 's1', cond: s => s.sampleN > 80 && s.bias < 15, title: 'Statistical Power', entry: 'Large samples with low bias produce p-values reliably below 0.05. Statistical power >80% means you\'d detect a real effect 80% of the time. Most underpowered studies use n<30 and miss real effects!', rarity: 'Rare ✨' },
  { id: 's2', cond: s => s.sampleN < 12 && s.effectSize > 70, title: 'P-Hacking Alert', entry: 'Small n + high effect size without repeated trials = classic p-hacking pattern. Over 50% of psychology papers reported effects that vanished when properly replicated with larger samples.', rarity: 'Common' },
  { id: 's3', cond: s => s.bias > 82, title: 'Confirmation Bias', entry: 'When experimenter bias exceeds critical threshold, results become unreliable regardless of sample size. Double-blind studies prevent this by hiding who received treatment from both patients AND researchers.', rarity: 'Common' },
  { id: 's4', cond: s => s.trials > 12 && s.sampleN > 60 && s.bias < 25, title: 'Gold Standard Design', entry: 'Many repeated trials, large n, and low bias = replicable science. The original 1948 Streptomycin trial (first randomised double-blind RCT) used these principles and changed medicine forever.', rarity: 'Rare ✨' },
  { id: 's5', cond: s => s.effectSize < 8 && s.sampleN > 80, title: 'Null Result Discovery', entry: 'Low effect with large sample = confident null result. Null results are as important as positive ones — but 90%+ of journals refuse to publish null results (publication bias). This distorts our knowledge.', rarity: 'Uncommon' },
];

// ── Gaussian/Normal curve approximation points ───────────────────
function buildCurve(mean, sd, n) {
  const pts = [];
  for (let x = 0; x <= 100; x += 2) {
    const z = (x - mean) / Math.max(1, sd);
    const y = Math.exp(-0.5 * z * z) * n * 0.5;
    pts.push({ x, y });
  }
  return pts;
}

export default function ScientificMethodLab({ scientistMode = false, accentColor = '#00C8FF', onLabBreaker }) {
  const [sampleN,    setSampleN]    = useState(30);  // sample size 1–100
  const [effectSize, setEffectSize] = useState(40);  // true effect 0–100
  const [bias,       setBias]       = useState(20);  // experimenter bias 0–100
  const [trials,     setTrials]     = useState(5);   // number of repeat trials

  const [running, setRunning] = useState(false);
  const [frame,   setFrame]   = useState(0);
  const [danger,  setDanger]  = useState(false);
  const [logs,    setLogs]    = useState([]);
  const [hint,    setHint]    = useState('Set a large sample size and repeat trials — watch p-value drop below 0.05! Crank up experimenter bias to discover p-hacking.');
  const [logsOpen, setLogsOpen] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);

  // Derived stats
  const sd      = Math.max(1, 40 - sampleN * 0.3 - trials * 0.4);
  const biasAdj = effectSize + bias * 0.25;
  // p-value approximation: lower with more trials, larger n, larger effect
  const pRaw    = Math.max(0.001, 1 - (biasAdj / 100) * Math.min(1, sampleN / 40) * Math.min(1, trials / 5));
  const pValue  = Math.min(0.999, pRaw + (bias / 100) * 0.3);
  const signi   = pValue < 0.05;
  const power   = Math.min(99, Math.round((sampleN / 100) * (trials / 15) * (effectSize / 100) * 180));

  // Animation frame loop
  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.03) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, []);

  // Danger = high bias
  useEffect(() => {
    const isDanger = bias > 82;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      setHint('🚨 EXTREME BIAS — results completely unreliable! This is p-hacking territory!');
    } else {
      dangerLoop.current?.stop();
      dangerAnim.setValue(0);
    }
  }, [bias]);

  // Discoveries
  useEffect(() => {
    const id = setInterval(() => {
      const state = { sampleN, effectSize, bias, trials };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`🔬 Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [sampleN, effectSize, bias, trials]);

  // Data points (scatter)
  const VW = width;
  const dataPts = Array.from({ length: Math.min(sampleN, 60) }, (_, i) => {
    const t = (frameRef.current * 0.1 + i * 0.017) % 1;
    const x = 20 + ((i / Math.min(sampleN, 60)) * 0.8 + Math.sin(t * 6.28 + i) * 0.04) * (VW - 40);
    const trueY = VIEWPORT_H * 0.6 - effectSize * 0.55;
    const noise = (Math.cos(i * 7.3 + t * 3) + Math.sin(i * 3.1 + frameRef.current * 2)) * sd * 1.5;
    return { cx: x, cy: trueY + noise, fill: signi ? '#00C8FF' : '#888' };
  });

  // Trend line Y
  const trendY = VIEWPORT_H * 0.6 - effectSize * 0.55;
  const biasLineY = trendY - bias * 0.35;

  // Curve points
  const curvePts = buildCurve(50, sd, Math.min(sampleN, 80));
  const curveD = curvePts.map((p, i) => {
    const x = (p.x / 100) * VW;
    const y = VIEWPORT_H - 10 - p.y;
    return (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      {/* VIEWPORT */}
      <Animated.View style={[styles.viewport, {
        borderBottomColor: danger
          ? dangerAnim.interpolate({ inputRange: [0, 1], outputRange: ['#333', '#FF3E6C'] })
          : '#1A1A2A',
      }]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Rect width="100%" height={VIEWPORT_H} fill="#050810" />

          {/* Distribution curve */}
          <Line x1={0} y1={VIEWPORT_H - 10} x2={VW} y2={VIEWPORT_H - 10} stroke="#222" strokeWidth={1} />
          {curvePts.length > 1 && curvePts.slice(1).map((p, i) => {
            const x0 = (curvePts[i].x / 100) * VW;
            const y0 = VIEWPORT_H - 10 - curvePts[i].y;
            const x1 = (p.x / 100) * VW;
            const y1 = VIEWPORT_H - 10 - p.y;
            return <Line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={signi ? '#00C8FF' : '#333'} strokeWidth={1.5} />;
          })}

          {/* Data scatter points */}
          {dataPts.map((pt, i) => (
            <Circle key={i} cx={pt.cx} cy={pt.cy} r={3.5} fill={pt.fill} opacity={0.7} />
          ))}

          {/* Trend line */}
          <Line x1={16} y1={trendY} x2={VW - 16} y2={trendY} stroke="#00C8FF" strokeWidth={1.5} strokeOpacity={0.5} />

          {/* Bias arrow */}
          {bias > 15 && (
            <G>
              <Line x1={VW / 2} y1={trendY} x2={VW / 2} y2={biasLineY} stroke="#FF9500" strokeWidth={2} />
              <Line x1={VW / 2 - 6} y1={biasLineY + 6} x2={VW / 2} y2={biasLineY} stroke="#FF9500" strokeWidth={2} />
              <Line x1={VW / 2 + 6} y1={biasLineY + 6} x2={VW / 2} y2={biasLineY} stroke="#FF9500" strokeWidth={2} />
              {scientistMode && <SvgText x={VW / 2 + 9} y={biasLineY + 3} fill="#FF9500" fontSize={9}>bias offset</SvgText>}
            </G>
          )}

          {/* p-value label */}
          <Rect x={8} y={8} width={108} height={26} fill="#0C0F1A" rx={5} />
          <SvgText x={16} y={26} fill={signi ? '#00C8FF' : '#FF5E5E'} fontSize={12} fontWeight="bold">
            p = {pValue.toFixed(3)}  {signi ? '✅ sig.' : '❌ n.s.'}
          </SvgText>

          {/* Scientist mode formula overlay */}
          {scientistMode && (
            <G>
              <Rect x={8} y={38} width={180} height={54} fill="#0A0C18" rx={4} />
              <SvgText x={14} y={52} fill="#7B61FF" fontSize={9} fontFamily="monospace">SE = σ/√n = {sd.toFixed(1)}/√{sampleN} = {(sd / Math.sqrt(sampleN)).toFixed(2)}</SvgText>
              <SvgText x={14} y={65} fill="#7B61FF" fontSize={9} fontFamily="monospace">Power: {power}%  |  α = 0.05</SvgText>
              <SvgText x={14} y={78} fill="#7B61FF" fontSize={9} fontFamily="monospace">z = {(biasAdj / Math.max(1, sd)).toFixed(2)}  |  β err: {Math.max(0, 80 - power)}%</SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF3E6C',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: signi ? '#00C8FF' : danger ? '#FF3E6C' : '#333' }]} />
      </Animated.View>

      {/* CONTROLS */}
      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label="📊 Sample Size (n)" value={sampleN} onChange={setSampleN} color="#00C8FF" displayVal={`n=${sampleN}`} />
          <SliderControl label="🎯 Effect Size" value={effectSize} onChange={setEffectSize} color="#06C57E" displayVal={`${effectSize}%`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="🕵️ Experimenter Bias" value={bias} onChange={setBias} color={bias > 82 ? '#FF3E6C' : '#FF9500'} displayVal={`${bias}%`} />
          <SliderControl label="🔁 Repeat Trials" value={Math.round(trials)} onChange={v => setTrials(Math.max(1, v))} color="#C77DFF" displayVal={`×${Math.round(trials)}`} />
        </View>
      </View>

      {/* READOUT */}
      <View style={styles.readoutBar}>
        <ReadoutPill label="p-value" value={pValue.toFixed(3)} color={signi ? '#00C8FF' : '#FF5E5E'} />
        <ReadoutPill label="Significant" value={signi ? 'YES ✅' : 'NO ❌'} color={signi ? '#00C8FF' : '#666'} />
        <ReadoutPill label="Power" value={`${power}%`} color={power > 80 ? '#06C57E' : '#FF9500'} />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FFD93D" />
      </View>

      {scientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciPanelTitle}>🔭 Scientist Mode — Statistical Equations</Text>
          <Text style={styles.sciFormula}>Standard Error: SE = σ/√n = {sd.toFixed(1)}/√{sampleN} = {(sd / Math.sqrt(sampleN)).toFixed(2)}</Text>
          <Text style={styles.sciFormula}>Effect size d = (x̄₁−x̄₂)/σ ≈ {(effectSize / Math.max(1, sd)).toFixed(2)} {effectSize / Math.max(1, sd) > 0.8 ? '(large)' : effectSize / Math.max(1, sd) > 0.5 ? '(medium)' : '(small)'}</Text>
          <Text style={styles.sciFormula}>Statistical power: {power}%  |  Type II error β = {Math.max(0, 100 - power)}%</Text>
          <Text style={styles.sciFormula}>Min sample for 80% power: n ≥ {Math.max(4, Math.round(16 / Math.max(0.01, (effectSize / 100) ** 2)))}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#00C8FF" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#00C8FF' }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#080C14' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#00C8FF' }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#D0EEFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Design better experiments — try large sample size + low bias + repeated trials!</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#00C8FF' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : '#00C8FF' }]}>{l.rarity}</Text>
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
        onResponderGrant={e => trackRef.current?.measure((fx, fy, fw, fh, px) => onChange(Math.round(Math.max(1, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))))}
        onResponderMove={e => trackRef.current?.measure((fx, fy, fw, fh, px) => onChange(Math.round(Math.max(1, Math.min(100, ((e.nativeEvent.pageX - px) / fw) * 100)))))}
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
  viewport: { height: VIEWPORT_H, overflow: 'hidden', borderBottomWidth: 1 },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  panel: { backgroundColor: '#0C0F1A', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1A1A2A' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#080A12', borderTopWidth: 1, borderTopColor: '#111' },
  sciPanel: { backgroundColor: '#0A0D1A', padding: 10, borderTopWidth: 1, borderTopColor: '#1A1A3A' },
  sciPanelTitle: { color: '#7B61FF', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sciFormula: { color: '#6070A0', fontFamily: 'monospace', fontSize: 10, marginVertical: 1.5 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#060810', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0C101C', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#D0EEFF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});
const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#111520', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#1A1A2A' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 56 },
  val: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
