/**
 * Periodic Table Lab — Element Builder
 * Scientist Mode: electron configuration, ionisation energy, orbital notation
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import Svg, { Circle, Ellipse, G, Rect, Text as SvgText, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const VIEWPORT_H = Math.min(height * 0.38, 230);
const CX = width / 2;
const CY = VIEWPORT_H / 2 - 10;

// Elements up to Z=36 (Krypton)
const ELEMENTS = [
  null, // Z=0 placeholder
  { sym: 'H',  name: 'Hydrogen',   period: 1, group: 1,  type: 'nonmetal',     color: '#74B9FF', shells: [1] },
  { sym: 'He', name: 'Helium',     period: 1, group: 18, type: 'noble gas',    color: '#B2BEC3', shells: [2] },
  { sym: 'Li', name: 'Lithium',    period: 2, group: 1,  type: 'alkali metal', color: '#FD79A8', shells: [2,1] },
  { sym: 'Be', name: 'Beryllium',  period: 2, group: 2,  type: 'alkaline earth',color: '#E17055',shells: [2,2] },
  { sym: 'B',  name: 'Boron',      period: 2, group: 13, type: 'metalloid',    color: '#6C5CE7', shells: [2,3] },
  { sym: 'C',  name: 'Carbon',     period: 2, group: 14, type: 'nonmetal',     color: '#00B894', shells: [2,4] },
  { sym: 'N',  name: 'Nitrogen',   period: 2, group: 15, type: 'nonmetal',     color: '#00CEC9', shells: [2,5] },
  { sym: 'O',  name: 'Oxygen',     period: 2, group: 16, type: 'nonmetal',     color: '#74B9FF', shells: [2,6] },
  { sym: 'F',  name: 'Fluorine',   period: 2, group: 17, type: 'halogen',      color: '#FDCB6E', shells: [2,7] },
  { sym: 'Ne', name: 'Neon',       period: 2, group: 18, type: 'noble gas',    color: '#B2BEC3', shells: [2,8] },
  { sym: 'Na', name: 'Sodium',     period: 3, group: 1,  type: 'alkali metal', color: '#FD79A8', shells: [2,8,1] },
  { sym: 'Mg', name: 'Magnesium',  period: 3, group: 2,  type: 'alkaline earth',color: '#E17055',shells: [2,8,2] },
  { sym: 'Al', name: 'Aluminium',  period: 3, group: 13, type: 'post-transition metal',color:'#A0A0A0',shells:[2,8,3]},
  { sym: 'Si', name: 'Silicon',    period: 3, group: 14, type: 'metalloid',    color: '#6C5CE7', shells: [2,8,4] },
  { sym: 'P',  name: 'Phosphorus', period: 3, group: 15, type: 'nonmetal',     color: '#E84393', shells: [2,8,5] },
  { sym: 'S',  name: 'Sulfur',     period: 3, group: 16, type: 'nonmetal',     color: '#FDCB6E', shells: [2,8,6] },
  { sym: 'Cl', name: 'Chlorine',   period: 3, group: 17, type: 'halogen',      color: '#00B894', shells: [2,8,7] },
  { sym: 'Ar', name: 'Argon',      period: 3, group: 18, type: 'noble gas',    color: '#B2BEC3', shells: [2,8,8] },
  { sym: 'K',  name: 'Potassium',  period: 4, group: 1,  type: 'alkali metal', color: '#FD79A8', shells: [2,8,8,1] },
  { sym: 'Ca', name: 'Calcium',    period: 4, group: 2,  type: 'alkaline earth',color:'#E17055', shells:[2,8,8,2]},
  { sym: 'Sc', name: 'Scandium',   period: 4, group: 3,  type: 'transition metal',color:'#FDCB6E',shells:[2,8,9,2]},
  { sym: 'Ti', name: 'Titanium',   period: 4, group: 4,  type: 'transition metal',color:'#4ECDC4',shells:[2,8,10,2]},
  { sym: 'V',  name: 'Vanadium',   period: 4, group: 5,  type: 'transition metal',color:'#A8E6CF',shells:[2,8,11,2]},
  { sym: 'Cr', name: 'Chromium',   period: 4, group: 6,  type: 'transition metal',color:'#88D8B0',shells:[2,8,13,1]},
  { sym: 'Mn', name: 'Manganese',  period: 4, group: 7,  type: 'transition metal',color:'#A29BFE',shells:[2,8,13,2]},
  { sym: 'Fe', name: 'Iron',       period: 4, group: 8,  type: 'transition metal',color:'#FF7675',shells:[2,8,14,2]},
  { sym: 'Co', name: 'Cobalt',     period: 4, group: 9,  type: 'transition metal',color:'#FD79A8',shells:[2,8,15,2]},
  { sym: 'Ni', name: 'Nickel',     period: 4, group: 10, type: 'transition metal',color:'#55EFC4',shells:[2,8,16,2]},
  { sym: 'Cu', name: 'Copper',     period: 4, group: 11, type: 'transition metal',color:'#E17055',shells:[2,8,18,1]},
  { sym: 'Zn', name: 'Zinc',       period: 4, group: 12, type: 'transition metal',color:'#74B9FF',shells:[2,8,18,2]},
  { sym: 'Ga', name: 'Gallium',    period: 4, group: 13, type: 'post-transition metal',color:'#A0A0A0',shells:[2,8,18,3]},
  { sym: 'Ge', name: 'Germanium',  period: 4, group: 14, type: 'metalloid',    color: '#6C5CE7', shells: [2,8,18,4] },
  { sym: 'As', name: 'Arsenic',    period: 4, group: 15, type: 'metalloid',    color: '#9B59B6', shells: [2,8,18,5] },
  { sym: 'Se', name: 'Selenium',   period: 4, group: 16, type: 'nonmetal',     color: '#E84393', shells: [2,8,18,6] },
  { sym: 'Br', name: 'Bromine',    period: 4, group: 17, type: 'halogen',      color: '#D35400', shells: [2,8,18,7] },
  { sym: 'Kr', name: 'Krypton',    period: 4, group: 18, type: 'noble gas',    color: '#B2BEC3', shells: [2,8,18,8] },
];

const DISCOVERIES = [
  { id: 'el1', cond: s => [2,10,18,36].includes(s.z), title: 'Noble Gas Configuration', entry: 'Noble gas shells are completely full (2, 8, 8, 8...). The octet rule drives ALL chemistry — every atom seeks this configuration. Helium (2), Neon (10), Argon (18), Krypton (36) are chemically inert because they\'re already there!', rarity: 'Common' },
  { id: 'el2', cond: s => s.z === 6, title: 'Carbon — The Basis of Life', entry: 'Carbon (Z=6) forms 4 covalent bonds in any geometry — chains, rings, branches. This creates 10+ million organic compounds. Without carbon\'s unique bonding, life as we know it would be chemically impossible.', rarity: 'Rare ✨' },
  { id: 'el3', cond: s => [3,11,19].includes(s.z), title: 'Alkali Metal — Explosive Reactivity', entry: 'Group 1 elements with one lonely valence electron are explosively reactive with water. Potassium (K) burns purple. Cesium (Cs) explodes even with ice at −100°C. One electron too many = enormous chemical drive to react!', rarity: 'Common' },
  { id: 'el4', cond: s => [14,32].includes(s.z), title: 'Semiconductor — Silicon Revolution', entry: 'Silicon (Z=14) and Germanium (Z=32) are metalloids — their 4 valence electrons can be precisely doped to become conductors or insulators. Every transistor, processor, and solar cell is built on this quantum property!', rarity: 'Uncommon' },
  { id: 'el5', cond: s => s.z > 30 && s.z <= 36, title: 'Beyond the 3rd Period', entry: 'Period 4 elements have d-orbitals between their outer s and p orbitals. This creates transition metals with multiple oxidation states (iron: Fe, Fe²⁺, Fe³⁺) and coloured compounds. The 18-electron rule governs transition metal chemistry.', rarity: 'Rare ✨' },
];

// SHELL radii
const SHELL_RADII = [30, 55, 78, 100];

export default function PeriodicTableLab({ scientistMode = false, accentColor = '#FDCB6E', onLabBreaker }) {
  const [z,       setZ]       = useState(1);     // atomic number 1–36
  const [frame,   setFrame]   = useState(0);
  const [danger,  setDanger]  = useState(false);
  const [logs,    setLogs]    = useState([]);
  const [hint,    setHint]    = useState('Slide Atomic Number to build any element! Watch electron shells fill. Try Z=6 (Carbon), Z=10 (Neon — noble gas), or Z=11 (Sodium — explosive alkali metal)!');
  const [logsOpen, setLogsOpen] = useState(false);

  const frameRef  = useRef(0);
  const discLocks = useRef({});
  const dangerAnim = useRef(new Animated.Value(0)).current;
  const dangerLoop = useRef(null);

  const el = ELEMENTS[Math.min(36, Math.max(1, z))] || ELEMENTS[1];

  const valenceE = el.shells[el.shells.length - 1];
  const isNoble  = [2, 10, 18, 36].includes(z);
  const isAlkali = [3, 11, 19].includes(z);

  // Ionisation energy approximation (eV) — rough trend
  const ie1 = (() => {
    const base = 5 + (z / 36) * 20;
    const groupBoost = isNoble ? 15 : isAlkali ? -4 : 0;
    return Math.max(3.9, base + groupBoost).toFixed(1);
  })();

  // Electronegativity (Pauling scale approx)
  const en = ((el.group / 18) * 3.5 * (1 / el.period)).toFixed(2);

  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 0.025) % 1;
      setFrame(frameRef.current);
    }, 33);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const isDanger = z > 26 && el.type === 'transition metal';
    setDanger(isDanger);
    if (isDanger) {
      if (onLabBreaker) onLabBreaker();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      dangerLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(dangerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dangerAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]));
      dangerLoop.current.start();
    } else {
      dangerLoop.current?.stop();
      dangerAnim.setValue(0);
    }
  }, [z]);

  useEffect(() => {
    const id = setInterval(() => {
      DISCOVERIES.forEach(d => {
        if (discLocks.current[d.id]) return;
        if (d.cond({ z })) {
          discLocks.current[d.id] = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLogs(p => [d, ...p]);
          setHint(`⚛️ Discovery: ${d.title}`);
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [z]);

  // Electron orbit animations
  const electronDots = [];
  el.shells.forEach((count, shellIdx) => {
    const r = SHELL_RADII[shellIdx] || 100 + (shellIdx - 3) * 22;
    for (let e = 0; e < Math.min(count, 18); e++) {
      const offset = (frameRef.current + e / count) % 1;
      const angle  = offset * Math.PI * 2 + (shellIdx * 0.7);
      electronDots.push({
        cx: CX + Math.cos(angle) * r,
        cy: CY + Math.sin(angle) * r,
        r: 4,
        fill: el.color,
        shellIdx,
      });
    }
  });

  // Config string like "2, 8, 4" for Carbon
  const configStr = el.shells.join(', ');

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.viewport]}>
        <Svg width="100%" height={VIEWPORT_H}>
          <Rect width="100%" height={VIEWPORT_H} fill="#050510" />

          {/* Shell rings */}
          {el.shells.map((count, i) => (
            <Circle key={i} cx={CX} cy={CY} r={SHELL_RADII[i] || 100 + (i - 3) * 22}
              fill="none" stroke={el.color} strokeWidth={1} strokeOpacity={0.22} strokeDasharray="4 3" />
          ))}

          {/* Nucleus */}
          <Circle cx={CX} cy={CY} r={18} fill={el.color} opacity={0.9} />
          <SvgText x={CX} y={CY + 5} textAnchor="middle" fill="#000" fontSize={13} fontWeight="bold">{z}</SvgText>

          {/* Electrons */}
          {electronDots.map((e, i) => (
            <Circle key={i} cx={e.cx} cy={e.cy} r={e.r} fill={e.fill} opacity={0.85} />
          ))}

          {/* Element name top right */}
          <Rect x={width - 100} y={8} width={92} height={40} fill="#0A0814" rx={5} />
          <SvgText x={width - 54} y={24} textAnchor="middle" fill={el.color} fontSize={18} fontWeight="bold">{el.sym}</SvgText>
          <SvgText x={width - 54} y={40} textAnchor="middle" fill="#666" fontSize={9}>{el.name}</SvgText>

          {/* Config label */}
          <Rect x={8} y={8} width={140} height={26} fill="#0A0814" rx={4} />
          <SvgText x={14} y={25} fill={el.color} fontSize={10} fontFamily="monospace">e⁻ config: {configStr}</SvgText>

          {/* Valence electrons */}
          <Rect x={8} y={38} width={140} height={20} fill="#0A0814" rx={4} />
          <SvgText x={14} y={52} fill={isNoble ? '#B2BEC3' : isAlkali ? '#FD79A8' : '#AAA'} fontSize={10} fontFamily="monospace">
            valence e⁻: {valenceE}  {isNoble ? '✅ FULL' : isAlkali ? '💥 1' : ''}
          </SvgText>

          {scientistMode && (
            <G>
              <Rect x={8} y={VIEWPORT_H - 60} width={200} height={52} fill="#08060C" rx={4} />
              <SvgText x={14} y={VIEWPORT_H - 46} fill="#C8A600" fontSize={9} fontFamily="monospace">IE₁ ≈ {ie1} eV  |  EN ≈ {en}</SvgText>
              <SvgText x={14} y={VIEWPORT_H - 33} fill="#C8A600" fontSize={9} fontFamily="monospace">Period: {el.period}  |  Group: {el.group}  |  {el.type}</SvgText>
              <SvgText x={14} y={VIEWPORT_H - 20} fill="#C8A600" fontSize={9} fontFamily="monospace">Atomic mass ≈ {(z * 2.1).toFixed(0)} u  |  Shells: {el.shells.length}</SvgText>
            </G>
          )}
        </Svg>

        {danger && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, {
            backgroundColor: el.color,
            opacity: dangerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }),
          }]} />
        )}
        <View style={[styles.led, { backgroundColor: el.color }]} />
      </Animated.View>

      <View style={styles.panel}>
        <SliderControl label="⚛️ Atomic Number (Z)" value={Math.round(((z - 1) / 35) * 100)} onChange={v => { setZ(Math.max(1, Math.min(36, Math.round(1 + (v / 100) * 35)))); soundTap(); Haptics.selectionAsync(); }} color={el.color} displayVal={`Z = ${z} (${el.sym})`} wide />
      </View>

      {/* Type badge row */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: el.color + '60', backgroundColor: el.color + '18' }]}>
          <Text style={[styles.badgeText, { color: el.color }]}>{el.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.badge, { borderColor: '#555' }]}>
          <Text style={styles.badgeText}>Period {el.period}</Text>
        </View>
        <View style={[styles.badge, { borderColor: '#555' }]}>
          <Text style={styles.badgeText}>Group {el.group}</Text>
        </View>
      </View>

      <View style={styles.readoutBar}>
        <ReadoutPill label="Symbol" value={el.sym} color={el.color} />
        <ReadoutPill label="Valence e⁻" value={`${valenceE}`} color={isNoble ? '#B2BEC3' : isAlkali ? '#FD79A8' : '#FFD166'} />
        <ReadoutPill label="IE₁ (eV)" value={ie1} color="#FDCB6E" />
        <ReadoutPill label="Logs" value={`${logs.length}/5`} color="#6C5CE7" />
      </View>

      {scientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciPanelTitle}>⚛️ Scientist Mode — Electron Configuration & Trends</Text>
          <Text style={styles.sciFormula}>{`${el.name}: e⁻ config = [${configStr}]  ←  ${el.shells.length} shell(s)`}</Text>
          <Text style={styles.sciFormula}>{`1st Ionisation Energy ≈ ${ie1} eV  |  Electronegativity ≈ ${en} (Pauling)`}</Text>
          <Text style={styles.sciFormula}>{`Octet rule: needs ${8 - valenceE} more e⁻ to be stable  ${isNoble ? '(Already FULL!)' : ''}`}</Text>
          <Text style={styles.sciFormula}>{`Atomic radius trend: ${el.period > 1 ? 'larger than Period 1' : 'smallest period'}  |  ${el.group > 9 ? 'right side' : 'left/centre'}`}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logBar} onPress={() => { setLogsOpen(true); soundTap(); }}>
        <Icon name="book" size={18} color={el.color} />
        <Text style={styles.logHintText} numberOfLines={1}>{hint}</Text>
        {logs.length > 0 && <View style={[styles.logBadge, { backgroundColor: el.color }]}><Text style={[styles.logBadgeText, { color: '#000' }]}>{logs.length}</Text></View>}
      </TouchableOpacity>

      <Modal visible={logsOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: '#080610' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: el.color }]}>Research Logs 📓</Text>
              <TouchableOpacity onPress={() => { setLogsOpen(false); soundTap(); }}>
                <Icon name="close" size={22} color="#E0D8FF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0
                ? <Text style={styles.emptyLog}>Explore elements! Try Z=2 (noble gas), Z=6 (carbon — life!), Z=11 (sodium — explosion!), Z=14 (silicon — computers!).</Text>
                : logs.map(l => (
                  <View key={l.id} style={[styles.logCard, { borderLeftColor: el.color }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                      <Text style={[styles.logRarity, { color: l.rarity.includes('Rare') ? '#FFD93D' : '#FDCB6E' }]}>{l.rarity}</Text>
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

function SliderControl({ label, value, onChange, color, displayVal, wide }) {
  const trackRef = useRef(null);
  return (
    <View style={[sliderS.wrap, wide && { width: '100%' }]}>
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
  container: { flex: 1, backgroundColor: '#050510' },
  viewport: { height: VIEWPORT_H, overflow: 'hidden' },
  led: { position: 'absolute', top: 10, right: 12, width: 9, height: 9, borderRadius: 5 },
  panel: { backgroundColor: '#0C0A18', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A1530' },
  badgeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0A0816' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { color: '#888', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5 },
  readoutBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#080615', borderTopWidth: 1, borderTopColor: '#111' },
  sciPanel: { backgroundColor: '#0C0A18', padding: 10, borderTopWidth: 1, borderTopColor: '#1A1530' },
  sciPanelTitle: { color: '#A090D0', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sciFormula: { color: '#554880', fontFamily: 'monospace', fontSize: 10, marginVertical: 1.5 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#060414', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#555', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0E0A18', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: '#E8E0FF', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  logRarity: { fontSize: 11, fontFamily: 'monospace' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 },
});
const sliderS = StyleSheet.create({
  wrap: { width: '48%' },
  label: { color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 5 },
  track: { height: 22, borderRadius: 11, backgroundColor: '#0F0C1C', overflow: 'visible', position: 'relative', justifyContent: 'center', borderWidth: 1, borderColor: '#1A1530' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, top: 2, marginLeft: -9 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 4 },
});
const rS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 60 },
  val: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  label: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
});
