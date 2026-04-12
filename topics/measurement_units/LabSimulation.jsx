/**
 * Measurement Units Lab — Unit Converter & Precision Simulator
 * Scientist Mode: dimensional analysis equations, sig figs, uncertainty propagation
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, Line, G, Text as SvgText, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 230);
const CX = width / 2;

const PREFIXES = [
  { name: 'Giga', sym: 'G', exp: 9 },
  { name: 'Mega', sym: 'M', exp: 6 },
  { name: 'Kilo', sym: 'k', exp: 3 },
  { name: 'Base', sym: '', exp: 0 },
  { name: 'Milli', sym: 'm', exp: -3 },
  { name: 'Micro', sym: 'μ', exp: -6 },
  { name: 'Nano', sym: 'n', exp: -9 },
];

const CONVERSIONS = [
  { from: 'km/h', to: 'm/s', factor: 1 / 3.6, formula: '÷ 3.6', label: 'Speed' },
  { from: 'kg', to: 'lbs', factor: 2.20462, formula: '× 2.205', label: 'Mass' },
  { from: '°C', to: 'K', factor: 1, offset: 273.15, formula: '+ 273.15', label: 'Temp' },
  { from: 'm²', to: 'cm²', factor: 10000, formula: '× 10,000', label: 'Area' },
];

const DISCOVERIES = [
  { id: 'm1', cond: s => s.precision > 85 && s.sigFigs > 4, title: 'False Precision Trap', entry: 'More decimal places don\'t equal more accuracy. Reporting 60 miles as 96,560.64 metres implies measuring to 0.01 miles precision — you almost certainly didn\'t! Significant figures express the actual precision of your measurement.', rarity: 'Common' },
  { id: 'm2', cond: s => s.unit === 3 && s.value > 200, title: 'Unit Mismatch Error', entry: 'The Mars Climate Orbiter ($327M) was destroyed because one team used Newtons and another used pound-force. This exact type of mismatch — large values in wrong units — caused the catastrophic navigation error.', rarity: 'Uncommon' },
  { id: 'm3', cond: s => s.value < 1 && s.precision > 70, title: 'Scientific Notation Power', entry: 'For values far below 1, scientific notation prevents precision errors. 0.000000082 metres is error-prone; 8.2×10⁻⁸ m is unambiguous. Chemists use 6.022×10²³ to express Avogadro\'s number daily!', rarity: 'Common' },
  { id: 'm4', cond: s => s.precision < 10 && s.uncertainty > 70, title: 'Measurement Uncertainty', entry: 'ALL measurements have uncertainty. Scientists express this as value ± uncertainty. A thermometer reading 36.6°C ± 0.5°C is honest science. A reading of exactly 36.6°C with no uncertainty is physically impossible — every instrument has limits.', rarity: 'Uncommon' },
  { id: 'm5', cond: s => s.conversion === 2 && s.value > 280, title: 'Kelvin Absolute Zero', entry: 'Converting above 280°C → 553K reveals why Kelvin matters: no negative values. At 0K (−273.15°C), particle motion is minimal. Kelvins are required in gas law equations — using Celsius in PV=nRT gives completely wrong answers!', rarity: 'Rare ✨' },
];

export default function MeasurementUnitsLab({ scientistMode = false, accentColor = '#FFD166', onLabBreaker }) {
  const [value,      setValue]      = useState(60);   // input value 1–500
  const [unit,       setUnit]       = useState(0);    // conversion index
  const [precision,  setPrecision]  = useState(50);   // decimal precision %
  const [uncertainty, setUncert]    = useState(30);   // measurement uncertainty %
  const [prefixIdx,  setPrefixIdx]  = useState(3);    // SI prefix index (0=Giga, 6=Nano)

  const [frame, setFrame]   = useState(0);
  const [danger, setDanger] = useState(false);
  const [logs,  setLogs]    = useState([]);
  const [hint,  setHint]    = useState('Slide Value up — then switch Unit type to convert! In Scientist Mode, see the full dimensional analysis equations.');
  const [logsOpen, setLogsOpen] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);

  const currentConv = CONVERSIONS[unit];
  const converted   = value * currentConv.factor + (currentConv.offset || 0);
  const sigFigs     = Math.max(1, Math.round(precision / 20));
  const uncertaintyV = (uncertainty / 100) * 0.5 * value;
  const prefix      = PREFIXES[prefixIdx];
  const prefixValue = value / Math.pow(10, prefix.exp);

  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.03) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const isDanger = unit === 3 && value > 400;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      setHint('⚠️ Extremely large area! This is where unit confusion (cm² vs m²) causes catastrophic engineering errors!');
    } else {
      dangerLoop.current?.stop();
      dangerAnim.setValue(0);
    }
  }, [unit, value]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = { value, unit, precision, uncertainty, conversion: unit, sigFigs };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`📏 Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [value, unit, precision, uncertainty]);

  // Scale animation (ruler tick marks)
  const tickCount = 18;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const progress = i / (tickCount - 1);
    const x = 16 + progress * (width - 32);
    const major = i % 3 === 0;
    const val = (value / 10) * i;
    return { x, major, val };
  });

  // Animated measurement bar
  const barW = (value / 500);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.viewport]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Rect width="100%" height={VIEWPORT_H} fill="#0A0900" />

          {/* Ruler baseline */}
          <Line x1={16} y1={VIEWPORT_H * 0.45} x2={width - 16} y2={VIEWPORT_H * 0.45} stroke="#333" strokeWidth={2} />
          {ticks.map((t, i) => (
            <G key={i}>
              <Line x1={t.x} y1={VIEWPORT_H * 0.45} x2={t.x} y2={VIEWPORT_H * 0.45 + (t.major ? 18 : 9)} stroke="#444" strokeWidth={t.major ? 2 : 1} />
              {t.major && <SvgText x={t.x} y={VIEWPORT_H * 0.45 + 30} textAnchor="middle" fill="#555" fontSize={9}>{Math.round(t.val)}</SvgText>}
            </G>
          ))}

          {/* Value measurement bar */}
          <Rect x={16} y={VIEWPORT_H * 0.32} width={(width - 32) * barW} height={18} fill="#FFD166" fillOpacity={0.8} rx={4} />

          {/* Uncertainty range indicator */}
          {uncertainty > 10 && (
            <G>
              <Line
                x1={16 + (width - 32) * barW - (uncertainty / 200) * (width - 32) * barW}
                y1={VIEWPORT_H * 0.32 + 9}
                x2={16 + (width - 32) * barW + (uncertainty / 200) * (width - 32) * barW}
                y2={VIEWPORT_H * 0.32 + 9}
                stroke="#FF9500" strokeWidth={6} strokeOpacity={0.6}
              />
              {scientistMode && (
                <SvgText
                  x={16 + (width - 32) * barW}
                  y={VIEWPORT_H * 0.32 - 5}
                  textAnchor="middle" fill="#FF9500" fontSize={9} fontFamily="monospace"
                >±{uncertaintyV.toFixed(2)}</SvgText>
              )}
            </G>
          )}

          {/* Prefix scale */}
          <Rect x={8} y={VIEWPORT_H * 0.62} width={width - 16} height={50} fill="#0C0A00" rx={5} />
          {PREFIXES.map((p, i) => {
            const px = 22 + i * ((width - 44) / 6);
            const active = i === prefixIdx;
            return (
              <G key={i}>
                <Circle cx={px} cy={VIEWPORT_H * 0.62 + 14} r={active ? 9 : 6} fill={active ? '#FFD166' : '#222'} />
                <SvgText x={px} y={VIEWPORT_H * 0.62 + 33} textAnchor="middle" fill={active ? '#FFD166' : '#555'} fontSize={8}>{p.sym || 'SI'}</SvgText>
              </G>
            );
          })}

          {/* Big converted value display */}
          <SvgText x={CX} y={VIEWPORT_H * 0.2} textAnchor="middle" fill="#FFD166" fontSize={26} fontWeight="bold">
            {converted.toFixed(sigFigs)} {currentConv.to}
          </SvgText>
          <SvgText x={CX} y={VIEWPORT_H * 0.2 + 20} textAnchor="middle" fill="#777" fontSize={11}>
            from {value} {currentConv.from}    {currentConv.formula}
          </SvgText>

          {scientistMode && (
            <G>
              <Rect x={8} y={VIEWPORT_H - 56} width={width - 16} height={46} fill="#0A0900" rx={4} />
              <SvgText x={14} y={VIEWPORT_H - 42} fill="#C8A600" fontSize={9} fontFamily="monospace">
                {`${value} ${currentConv.from} × (${currentConv.formula}) = ${converted.toFixed(4)} ${currentConv.to}`}
              </SvgText>
              <SvgText x={14} y={VIEWPORT_H - 29} fill="#C8A600" fontSize={9} fontFamily="monospace">
                {`Sig figs: ${sigFigs}  |  Prefix: ${prefix.name} = 10^${prefix.exp}`}
              </SvgText>
              <SvgText x={14} y={VIEWPORT_H - 16} fill="#C8A600" fontSize={9} fontFamily="monospace">
                {`${prefixValue.toFixed(3)} ${prefix.sym}[unit] = ${value} [base unit]`}
              </SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF9500',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.20] }),
          }]} />
        )}

        <View style={[styles.led, { backgroundColor: danger ? '#FF9500' : '#FFD166' }]} />
      </Animated.View>

      {/* Unit type selector */}
      <View style={styles.tabBar}>
        {CONVERSIONS.map((c, i) => (
          <TouchableOpacity key={i} style={[styles.tab, unit === i && styles.tabActive]}
            onPress={() => { setUnit(i); soundTap(); Haptics.selectionAsync(); }}>
            <Text style={[styles.tabText, unit === i && { color: '#FFD166' }]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelRow}>
          <SliderControl label={`📏 Value (${currentConv.from})`} value={Math.round((value - 1) / 4.99)} onChange={v => setValue(Math.round(1 + v * 4.99))} color="#FFD166" displayVal={`${value}`} />
          <SliderControl label="🔬 Decimal Precision" value={precision} onChange={setPrecision} color="#06C57E" displayVal={`${sigFigs} sig figs`} />
        </View>
        <View style={styles.panelRow}>
          <SliderControl label="📉 Uncertainty" value={uncertainty} onChange={setUncert} color="#FF9500" displayVal={`±${uncertaintyV.toFixed(1)}`} />
          <SliderControl label="🔢 SI Prefix" value={Math.round((prefixIdx / 6) * 100)} onChange={v => setPrefixIdx(Math.round((v / 100) * 6))} color="#C77DFF" displayVal={`${prefix.name}`} />
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label="Converted" value={`${converted.toFixed(sigFigs)}`} color="#FFD166" />
        <ReadoutPill label="Prefix" value={`${prefixValue.toFixed(2)}${prefix.sym}`} color="#C77DFF" />
        <ReadoutPill label="Uncertainty" value={`±${uncertaintyV.toFixed(1)}`} color="#FF9500" />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#06C57E" />
      </View>

      {scientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciPanelTitle}>📐 Scientist Mode — Dimensional Analysis</Text>
          <Text style={styles.sciFormula}>{`${value} ${currentConv.from} × (conversion factor) = ${converted.toFixed(6)} ${currentConv.to}`}</Text>
          <Text style={styles.sciFormula}>{`Significant figures rule: result has ${sigFigs} sig fig(s)`}</Text>
          <Text style={styles.sciFormula}>{`Final answer: ${converted.toFixed(sigFigs)} ${currentConv.to} ± ${(uncertaintyV * currentConv.factor).toFixed(sigFigs)} ${currentConv.to}`}</Text>
          <Text style={styles.sciFormula}>{`Relative uncertainty: ${((uncertaintyV / value) * 100).toFixed(1)}%`}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color="#FFD166" />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: '#FFD166' }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#0C0900' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#FFD166' }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#FFF8D0" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore unit conversions! Try temperature to Kelvin, or huge area values in m² vs cm².</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: '#FFD166' }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FF9500' : '#FFD166' }]}>{l.rarity}</Text>
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
  container: { flex: 1, backgroundColor: '#0A0900' },
  viewport: { height: VIEWPORT_H, overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  tabBar: { flexDirection: 'row', backgroundColor: '#0C0A00', borderTopWidth: 1, borderTopColor: '#222' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FFD166' },
  tabText: { color: '#555', fontSize: 11, fontFamily: 'monospace' },
  panel: { backgroundColor: '#0C0A00', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1A1800' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#0A0800', borderTopWidth: 1, borderTopColor: '#111' },
  sciPanel: { backgroundColor: '#0C0A00', padding: 10, borderTopWidth: 1, borderTopColor: '#2A2800' },
  sciPanelTitle: { color: '#C8A600', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sciFormula: { color: '#806800', fontFamily: 'monospace', fontSize: 10, marginVertical: 1.5 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#080700', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#110F00', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#FFF8D0', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});
const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#181400', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2000' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
