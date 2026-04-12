/**
 * Energy Types Lab — Energy Transformer / Conservation Simulator
 * Scientist Mode: KE=½mv², GPE=mgh, Q=mcΔT, efficiency equations
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Rect, Line, G, Text as SvgText, Path, Ellipse } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 230);
const CX = width / 2;
const CY = VIEWPORT_H / 2;

const ENERGY_MODES = [
  { id: 'mech',  label: '⚙️ Mechanical', color: '#FDCB6E', desc: 'Drop mass: GPE → KE → Thermal' },
  { id: 'elec',  label: '⚡ Electrical', color: '#74B9FF', desc: 'Circuit: Chemical → Electrical → Light' },
  { id: 'nucl',  label: '☢️ Nuclear',    color: '#FD79A8', desc: 'Fusion: Mass → Thermal → Kinetic' },
  { id: 'solar', label: '☀️ Solar',      color: '#FFD166', desc: 'Photovoltaic: Radiant → Electrical' },
];

const DISCOVERIES = [
  { id: 'en1', cond: s => s.mode === 'mech' && s.height > 90, title: 'Terminal Velocity', entry: 'At maximum height, the falling object\'s KE at impact = mgh only in a vacuum. In air, drag force equals gravity at terminal velocity (~9m/s for a human! ~55m/s for a skydiver). Drag converts KE to thermal via air molecule collisions.', rarity: 'Common' },
  { id: 'en2', cond: s => s.mode === 'elec' && s.efficiency < 15, title: 'Joule Heating Waste', entry: 'Extremely low electrical efficiency = almost all energy wasted as heat (P=I²R). This is why incandescent bulbs (5% efficient) were banned — LED technology delivers 40-50% efficiency (same light, 10x less energy).', rarity: 'Common' },
  { id: 'en3', cond: s => s.mode === 'nucl' && s.input > 75, title: 'E=mc² in Action', entry: 'Nuclear fusion converts 0.7% of hydrogen mass directly to energy via E=mc². The Sun converts 4 million tonnes of mass to energy every SECOND. One gram fully converted = 9×10¹³ joules — equivalent to 21,000 tonnes of TNT!', rarity: 'Rare ✨' },
  { id: 'en4', cond: s => s.mode === 'solar' && s.efficiency > 35, title: 'Exceeding Conventional Solar', entry: 'Standard silicon solar panels max at 26% (Shockley-Queisser limit). Multi-junction cells reach 46% by stacking semiconductors tuned to different light wavelengths. Research cells have hit 47.6% — the race to break 50% is on!', rarity: 'Rare ✨' },
  { id: 'en5', cond: s => s.loss > 82, title: 'Maximum Entropy', entry: 'When 83%+ of input becomes waste heat — maximum entropy state. The 2nd Law of Thermodynamics guarantees some energy always degrades to unusable heat. The universe tends toward states of maximum entropy — this is why heat flows hot → cold, not the reverse.', rarity: 'Uncommon' },
];

const EFFIC = { mech: 70, elec: 52, nucl: 33, solar: 22 };

export default function EnergyTypesLab({ scientistMode = false, accentColor = '#FDCB6E', onLabBreaker }) {
  const [mode,     setMode]     = useState('mech');
  const [input,    setInput]    = useState(50);     // input energy %
  const [mass,     setMass]     = useState(10);     // kg (1–100)
  const [height,   setHeight]   = useState(50);     // drop height 0–100
  const [efficiency, setEfficiency] = useState(45); // % efficiency
  const [frame,    setFrame]    = useState(0);

  const [danger, setDanger]  = useState(false);
  const [logs,   setLogs]    = useState([]);
  const [hint,   setHint]    = useState('Drop a mass from height — watch GPE convert to KE then thermal! Switch modes to explore electrical, nuclear, and solar energy chains.');
  const [logsOpen, setLogsOpen] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);

  const modeConfig  = ENERGY_MODES.find(m => m.id === mode);
  const g           = 9.81;
  const h           = height * 0.5;           // metres
  const m           = mass;
  const gpe         = m * g * h;              // Joules
  const actualEff   = efficiency / 100;
  const usefulOut   = gpe * actualEff;
  const wasteOut    = gpe * (1 - actualEff);
  const loss        = 100 - efficiency;

  // KE at bottom if mechanical
  const ke = mode === 'mech' ? m * g * h : input * actualEff * 10;

  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.03) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const isDanger = loss > 82;
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
      setHint('🔥 Maximum entropy! Almost all energy degraded to waste heat — 2nd Law of Thermodynamics at work!');
    } else {
      dangerLoop.current?.stop();
      dangerAnim.setValue(0);
    }
  }, [loss]);

  useEffect(() => {
    const id = setInterval(() => {
      const state = { mode, input, height, efficiency, loss };
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond(state)) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`⚡ Discovery: ${d.title}`);
        }
      });
    }, 1200);
    return () => clearInterval(id);
  }, [mode, input, height, efficiency, loss]);

  // Falling object
  const dropPhase = (frameRef.current * 0.7) % 1;
  const ballY     = 30 + dropPhase * (VIEWPORT_H - 80);
  const ballSpeed = dropPhase * 2 * g * h;
  const ballColor = modeConfig.color;

  // Energy bar heights
  const barMaxH   = VIEWPORT_H * 0.6;
  const gpeH      = (height / 100) * barMaxH;
  const keH       = mode === 'mech' ? (dropPhase * actualEff) * barMaxH : actualEff * barMaxH * (input / 100);
  const heatH     = barMaxH * (1 - actualEff) * (input / 100);

  // Electrical sparks
  const sparks = mode === 'elec' ? Array.from({ length: 12 }, (_, i) => {
    const t = (frameRef.current + i / 12) % 1;
    return {
      cx: CX - 60 + t * 120,
      cy: CY + Math.sin(t * Math.PI * 6 + i) * 20,
      r: 3 + efficiency * 0.02,
      opacity: Math.sin(t * Math.PI) * actualEff,
    };
  }) : [];

  // Solar photons
  const photons = mode === 'solar' ? Array.from({ length: 8 }, (_, i) => {
    const t = (frameRef.current * 1.5 + i / 8) % 1;
    return {
      cx: 20 + i * (width / 8),
      cy: t * VIEWPORT_H * 0.6,
      r: 4,
      opacity: Math.max(0, 1 - t) * 0.9,
    };
  }) : [];

  return (
    <View style={styles.container}>
      <Animated.View style={styles.viewport}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Rect width="100%" height={VIEWPORT_H} fill="#070805" />

          {mode === 'mech' && (
            <G>
              {/* Falling ball */}
              <Circle cx={CX} cy={ballY} r={12} fill={ballColor} opacity={0.9} />
              {/* Trail */}
              {dropPhase > 0.05 && (
                <Circle cx={CX} cy={ballY - 22} r={8} fill={ballColor} opacity={0.3} />
              )}
              {/* Ground */}
              <Line x1={16} y1={VIEWPORT_H - 16} x2={width - 16} y2={VIEWPORT_H - 16} stroke="#333" strokeWidth={2} />
              {/* Height arrow */}
              <Line x1={CX + 24} y1={30} x2={CX + 24} y2={VIEWPORT_H - 16} stroke="#555" strokeWidth={1} strokeDasharray="4 3" />
              <SvgText x={CX + 32} y={(30 + VIEWPORT_H - 16) / 2} fill="#666" fontSize={10}>{h.toFixed(1)}m</SvgText>

              {/* Energy bars */}
              {/* GPE bar */}
              <Rect x={14} y={VIEWPORT_H - 16 - gpeH * (1 - dropPhase)} width={22} height={gpeH * (1 - dropPhase)} fill="#FDCB6E" rx={3} />
              <SvgText x={25} y={VIEWPORT_H - 22} textAnchor="middle" fill="#FDCB6E" fontSize={8}>GPE</SvgText>
              {/* KE bar */}
              <Rect x={40} y={VIEWPORT_H - 16 - keH * dropPhase} width={22} height={keH * dropPhase} fill="#00C8FF" rx={3} />
              <SvgText x={51} y={VIEWPORT_H - 22} textAnchor="middle" fill="#00C8FF" fontSize={8}>KE</SvgText>
              {/* Heat bar */}
              <Rect x={66} y={VIEWPORT_H - 16 - heatH * dropPhase} width={22} height={heatH * dropPhase} fill="#FF7675" rx={3} />
              <SvgText x={77} y={VIEWPORT_H - 22} textAnchor="middle" fill="#FF7675" fontSize={8}>HEAT</SvgText>

              {scientistMode && dropPhase > 0.05 && (
                <G>
                  <Rect x={CX - 52} y={ballY - 30} width={105} height={38} fill="#0A0A05" rx={4} />
                  <SvgText x={CX - 46} y={ballY - 18} fill="#FDCB6E" fontSize={8} fontFamily="monospace">{`KE = ½mv² = ${(0.5 * m * (dropPhase * 2 * g * h)).toFixed(0)} J`}</SvgText>
                  <SvgText x={CX - 46} y={ballY - 7} fill="#74B9FF" fontSize={8} fontFamily="monospace">{`GPE = mgh = ${(m * g * h * (1 - dropPhase)).toFixed(0)} J`}</SvgText>
                  <SvgText x={CX - 46} y={ballY + 4} fill="#FF7675" fontSize={8} fontFamily="monospace">{`Loss = ${(gpe * (1 - actualEff) * dropPhase).toFixed(0)} J (${loss}%)`}</SvgText>
                </G>
              )}
            </G>
          )}

          {mode === 'elec' && (
            <G>
              {sparks.map((s, i) => (
                <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#74B9FF" opacity={s.opacity} />
              ))}
              <Circle cx={CX - 70} cy={CY} r={20} fill="#1A3050" stroke="#74B9FF" strokeWidth={1.5} />
              <SvgText x={CX - 70} y={CY + 5} textAnchor="middle" fill="#74B9FF" fontSize={10}>🔋</SvgText>
              <Circle cx={CX + 70} cy={CY} r={20} fill="#1A3050" stroke={efficiency > 35 ? '#FFD166' : '#333'} strokeWidth={1.5} />
              <SvgText x={CX + 70} y={CY + 5} textAnchor="middle" fill={efficiency > 35 ? '#FFD166' : '#555'} fontSize={12}>{efficiency > 35 ? '💡' : '●'}</SvgText>
              {scientistMode && (
                <G>
                  <Rect x={8} y={12} width={185} height={36} fill="#060808" rx={4} />
                  <SvgText x={14} y={26} fill="#74B9FF" fontSize={9} fontFamily="monospace">{`P = IV = I²R  |  η = ${efficiency}%`}</SvgText>
                  <SvgText x={14} y={40} fill="#74B9FF" fontSize={9} fontFamily="monospace">{`Useful: ${(input * actualEff).toFixed(0)}W  |  Waste: ${(input * (1-actualEff)).toFixed(0)}W`}</SvgText>
                </G>
              )}
            </G>
          )}

          {mode === 'nucl' && (
            <G>
              <Circle cx={CX} cy={CY} r={28} fill="#3D0020" stroke="#FD79A8" strokeWidth={2} />
              <SvgText x={CX} y={CY + 5} textAnchor="middle" fill="#FD79A8" fontSize={14}>⚛️</SvgText>
              {Array.from({ length: 12 }, (_, i) => {
                const t = (frameRef.current * 3 + i / 12) % 1;
                const angle = (i / 12) * Math.PI * 2 + frameRef.current * 2;
                const r = 40 + t * 90;
                return <Circle key={i} cx={CX + Math.cos(angle) * r} cy={CY + Math.sin(angle) * r} r={3} fill="#FD79A8" opacity={1 - t} />;
              })}
              {scientistMode && (
                <G>
                  <Rect x={8} y={12} width={200} height={36} fill="#0A0308" rx={4} />
                  <SvgText x={14} y={26} fill="#FD79A8" fontSize={9} fontFamily="monospace">{`E = mc² | Δm = ${(input * 0.07e-3).toFixed(4)}g → ${(input * 0.07e-3 * 9e13 / 1e6).toFixed(0)} MJ`}</SvgText>
                  <SvgText x={14} y={40} fill="#FD79A8" fontSize={9} fontFamily="monospace">{`η = ${efficiency}%  |  Waste heat: ${(100-efficiency)}%`}</SvgText>
                </G>
              )}
            </G>
          )}

          {mode === 'solar' && (
            <G>
              {photons.map((p, i) => (
                <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FFD166" opacity={p.opacity} />
              ))}
              <Rect x={16} y={VIEWPORT_H * 0.55} width={width - 32} height={28} fill={`#${Math.round(40 * actualEff).toString(16).padStart(2,'0')}3000`} stroke="#FDCB6E" strokeWidth={1.5} rx={4} />
              <SvgText x={CX} y={VIEWPORT_H * 0.55 + 19} textAnchor="middle" fill="#FFD166" fontSize={10} fontFamily="monospace">SOLAR PANEL — η = {efficiency}%</SvgText>
              {scientistMode && (
                <G>
                  <Rect x={8} y={12} width={200} height={36} fill="#0A0900" rx={4} />
                  <SvgText x={14} y={26} fill="#FFD166" fontSize={9} fontFamily="monospace">{`P_out = P_sun × η = ${(input * actualEff).toFixed(0)}W`}</SvgText>
                  <SvgText x={14} y={40} fill="#FFD166" fontSize={9} fontFamily="monospace">{`Shockley-Queisser max: 33%  |  Record: 47.6%`}</SvgText>
                </G>
              )}
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: '#FF7675',
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
          }]} />
        )}
        <View style={[styles.led, { backgroundColor: danger ? '#FF7675' : modeConfig.color }]} />
      </Animated.View>

      {/* Mode selector */}
      <View style={styles.modeBar}>
        {ENERGY_MODES.map(m => (
          <TouchableOpacity key={m.id} style={[styles.modeBtn, mode === m.id && { borderBottomColor: m.color, borderBottomWidth: 2 }]}
            onPress={() => { setMode(m.id); soundTap(); Haptics.selectionAsync(); }}>
            <Text style={[styles.modeBtnText, { color: mode === m.id ? m.color : '#555' }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.panel}>
        {mode === 'mech' && (
          <View style={styles.panelRow}>
            <SliderControl label="⚖️ Mass (kg)" value={Math.round((mass - 1) / 0.99)} onChange={v => { setMass(Math.round(1 + v * 0.99)); soundTap(); }} color="#FDCB6E" displayVal={`${mass}kg`} />
            <SliderControl label="📐 Drop Height" value={height} onChange={v => { setHeight(v); soundTap(); }} color="#00C8FF" displayVal={`${h.toFixed(1)}m`} />
          </View>
        )}
        {mode !== 'mech' && (
          <View style={styles.panelRow}>
            <SliderControl label="⚡ Input Power" value={input} onChange={v => { setInput(v); soundTap(); }} color={modeConfig.color} displayVal={`${input}W`} />
          </View>
        )}
        <View style={styles.panelRow}>
          <SliderControl label="🔧 Efficiency" value={efficiency} onChange={v => { setEfficiency(v); soundTap(); }} color={efficiency < 20 ? '#FF7675' : '#06C57E'} displayVal={`${efficiency}%`} />
          <View style={[styles.energyLossBox, { borderColor: modeConfig.color + '40' }]}>
            <Text style={[styles.energyLossLabel, { color: modeConfig.color }]}>Loss: {loss}% HEAT</Text>
            <View style={[styles.energyLossBar, { width: `${loss}%`, backgroundColor: '#FF7675' }]} />
          </View>
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label={mode === 'mech' ? 'GPE (J)' : 'Input (W)'} value={mode === 'mech' ? gpe.toFixed(0) : input.toString()} color={modeConfig.color} />
        <ReadoutPill label="Useful Out" value={mode === 'mech' ? usefulOut.toFixed(0) + 'J' : (input * actualEff).toFixed(0) + 'W'} color="#06C57E" />
        <ReadoutPill label="Wasted" value={mode === 'mech' ? wasteOut.toFixed(0) + 'J' : (input * (1 - actualEff)).toFixed(0) + 'W'} color="#FF7675" />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#FFD93D" />
      </View>

      {scientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciPanelTitle}>⚡ Scientist Mode — Energy Conservation Equations</Text>
          {mode === 'mech' && (
            <>
              <Text style={styles.sciFormula}>{`GPE = mgh = ${mass} × 9.81 × ${h.toFixed(1)} = ${gpe.toFixed(1)} J`}</Text>
              <Text style={styles.sciFormula}>{`KE = ½mv² → v = √(2gh) = ${(Math.sqrt(2 * g * h)).toFixed(2)} m/s at bottom`}</Text>
              <Text style={styles.sciFormula}>{`Useful KE = GPE × η = ${gpe.toFixed(0)} × ${actualEff.toFixed(2)} = ${usefulOut.toFixed(0)} J`}</Text>
              <Text style={styles.sciFormula}>{`Thermal loss = ${wasteOut.toFixed(0)} J (ΔH = mcΔT for ground impact)`}</Text>
            </>
          )}
          {mode === 'elec' && (
            <>
              <Text style={styles.sciFormula}>{`P_useful = P_in × η = ${input} × ${actualEff.toFixed(2)} = ${(input * actualEff).toFixed(0)} W`}</Text>
              <Text style={styles.sciFormula}>{`P_waste = I²R = ${(input * (1-actualEff)).toFixed(0)} W (Joule heating)`}</Text>
              <Text style={styles.sciFormula}>{`In 1hr: E_useful = ${(input * actualEff * 3.6e3).toFixed(0)} J | Waste = ${(input * (1-actualEff) * 3.6e3).toFixed(0)} J`}</Text>
            </>
          )}
          {mode === 'nucl' && (
            <>
              <Text style={styles.sciFormula}>{`E = Δmc² | 1g fusion: ${(1e-3 * 0.007 * 9e16 / 1e9).toFixed(0)} GJ`}</Text>
              <Text style={styles.sciFormula}>{`Plasma T required: ≥150 million K (10× Sun core!)`}</Text>
              <Text style={styles.sciFormula}>{`Lawson criterion: n_e × τ_E × T > 3×10²¹ m⁻³·s·keV`}</Text>
            </>
          )}
          {mode === 'solar' && (
            <>
              <Text style={styles.sciFormula}>{`P_out = A × G × η = panel_area × 1000 W/m² × ${actualEff.toFixed(2)}`}</Text>
              <Text style={styles.sciFormula}>{`Shockley-Queisser limit: 33% (single-junction)  |  Multi-junction: 46%`}</Text>
              <Text style={styles.sciFormula}>{`At ${efficiency}% efficiency: ${efficiency < 33 ? 'below' : 'above'} S-Q limit → ${efficiency > 33 ? 'multi-junction cell' : 'conventional silicon'}`}</Text>
            </>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color={modeConfig.color} />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: modeConfig.color }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#0A0905' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: modeConfig.color }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#FFF8D0" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Change energy modes! Drop mass at full height, set electrical efficiency below 10%, push nuclear to max input, or achieve 35% solar efficiency!</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: modeConfig.color }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : modeConfig.color }]}>{l.rarity}</Text>
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
  container: { flex: 1, backgroundColor: '#070805' },
  viewport: { height: VIEWPORT_H, overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  modeBar: { flexDirection: 'row', backgroundColor: '#0A0A06', borderTopWidth: 1, borderTopColor: '#222' },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  modeBtnText: { fontSize: 10, fontFamily: 'monospace' },
  panel: { backgroundColor: '#0C0C08', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1A1A10' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
  energyLossBox: { width: '48%', borderWidth: 1, borderRadius: 8, padding: 8, overflow: 'hidden', backgroundColor: '#0A0A06' },
  energyLossLabel: { fontSize: 10, fontFamily: 'monospace', marginBottom: 4 },
  energyLossBar: { height: 6, borderRadius: 3 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#080806', borderTopWidth: 1, borderTopColor: '#111' },
  sciPanel: { backgroundColor: '#0C0C08', padding: 10, borderTopWidth: 1, borderTopColor: '#1A1A10' },
  sciPanelTitle: { color: '#A0A028', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sciFormula: { color: '#505020', fontFamily: 'monospace', fontSize: 10, marginVertical: 1.5 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#060606', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0E0E08', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#FFFFD0', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});
const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#141408', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#222210' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
