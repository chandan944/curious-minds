import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Polygon, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Ellipse, Mask
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');

// ── PALETTE ──────────────────────────────────────────────
const PALETTE = {
  bg: '#0A0A0F',
  panel: '#12121A',
  amber: '#FFB347',
  cyan: '#00D4FF',
  green: '#39FF14',
  red: '#FF3131',
  text: '#E8E0D0',
  steel: '#2A2D3A',
  glass: 'rgba(232,224,208,0.1)'
};

// ── FIXED LAYOUT HEIGHTS ──────────────────────────────────
const H_HEADER = height * 0.08;
const H_VIEWPORT = height * 0.52;
const H_PANEL = height * 0.30;
const H_LOG = height * 0.10;

// ── COMPONENT ─────────────────────────────────────────────
export default function PhysicsMultiLab({ scientistMode = false, accentColor = '#00D4FF', onLabBreaker }) {
  // Discovery layer overlay
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;

  // Danger Shake
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Component local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [angle, setAngle] = useState(25); // 20 to 70
  const [freq, setFreq] = useState(440); // 20 to 20000
  const [heat, setHeat] = useState(25); // 0 to 300
  const [gravOn, setGravOn] = useState(true);
  const [fricOn, setFricOn] = useState(true);
  const [airOn, setAirOn] = useState(true);

  // Discoveries discovered flags
  const discovered = useRef(new Set());

  // Logic Tick (for physics simulations)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setTick(t => t + 1);
    }, 50); // 20 FPS physics updates
    return () => clearInterval(loop);
  }, []);

  // ── Discovery Checks ──
  const checkDiscoveries = useCallback(() => {
    // 1. Rainbow Threshold (Angle 42)
    if (Math.abs(angle - 42) <= 1 && !discovered.current.has('d1')) {
      discovered.current.add('d1');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, {
        title: "Total Internal Reflection",
        entry: "Light cannot exit glass above the critical angle (42°) — this is how fiber-optic cables carry the internet! 🌈",
        color: PALETTE.cyan,
      }]);
    }

    // 2. Concert A (Freq 440)
    if (Math.abs(freq - 440) <= 5 && !discovered.current.has('d2')) {
      discovered.current.add('d2');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLogs(prev => [...prev, {
        title: "Resonance (440 Hz)",
        entry: "Concert A! When energy input matches a system's natural frequency, amplitude explodes. 🔊",
        color: PALETTE.amber,
      }]);
    }

    // 3. Gravity Off
    if (!gravOn && !discovered.current.has('d3')) {
      discovered.current.add('d3');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setLogs(prev => [...prev, {
        title: "Newton's First Law",
        entry: "Without gravity, projectiles travel in straight lines forever! Curved paths only exist because Earth pulls continuously. 🪐",
        color: PALETTE.text,
      }]);
    }

    // 4. Heat Drives Work
    if (heat > 200 && !fricOn && !discovered.current.has('d4')) {
      discovered.current.add('d4');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setLogs(prev => [...prev, {
        title: "Heat Engine Principle",
        entry: "Thermal Energy → Mechanical Work! This powers every steam engine, car, and rocket ever built. 🔥⚙️",
        color: PALETTE.amber,
      }]);
    }

    // 5. Ultrasonic
    if (freq >= 18000 && !discovered.current.has('d5')) {
      discovered.current.add('d5');
      setLogs(prev => [...prev, {
        title: "Ultrasound Mode",
        entry: "Frequencies above >18kHz are inaudible to humans, but bats & medical scanners use them to 'see'! 🦇",
        color: PALETTE.green,
      }]);
    }

    // DANGER STATE Check
    if (heat >= 290 && freq >= 19000 && angle <= 22) {
      if (shakeAnim._value === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
      }
    }
  }, [angle, freq, heat, gravOn, fricOn, airOn]);

  useEffect(() => {
    checkDiscoveries();
  }, [checkDiscoveries]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false
    }).start();
  };

  return (
    <View style={styles.root}>
      {/* 8% Header */}
      <View style={[styles.header, { height: H_HEADER }]}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>PHYSICS MASTER LAB</Text>
        </View>
        <Icon name="zap" size={16} color={PALETTE.amber} />
      </View>

      {/* 52% Viewport */}
      <Animated.View style={[
        styles.viewport,
        { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }
      ]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bgGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1A1A2E" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* S1: Optics */}
          <SceneOptics angle={angle} discoveryAnim={discoveryAnim} scientistMode={scientistMode} />
          {/* S2: Sound */}
          <SceneSound freq={freq} discoveryAnim={discoveryAnim} scientistMode={scientistMode} />
          {/* S3: Heat */}
          <SceneHeat heat={heat} tick={tick} discoveryAnim={discoveryAnim} scientistMode={scientistMode} />
          {/* S4: Work */}
          <SceneWork heat={heat} fricOn={fricOn} tick={tick} discoveryAnim={discoveryAnim} scientistMode={scientistMode} />
          {/* S5: Motion */}
          <SceneMotion gravOn={gravOn} airOn={airOn} tick={tick} discoveryAnim={discoveryAnim} scientistMode={scientistMode} />
          
        </Svg>
        <View style={styles.vignette} pointerEvents="none" />
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.green : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* 30% Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <ControlPanel
          angle={angle} setAngle={setAngle}
          freq={freq} setFreq={setFreq}
          heat={heat} setHeat={setHeat}
          gravOn={gravOn} setGravOn={setGravOn}
          fricOn={fricOn} setFricOn={setFricOn}
          airOn={airOn} setAirOn={setAirOn}
        />
      </View>

      {/* 10% Research Log Bar */}
      <TouchableOpacity 
        style={[styles.logBar, { height: H_LOG }]} 
        activeOpacity={0.8}
        onPress={() => { soundTap(); setLogsOpen(true); }}
      >
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>
          {logs.length > 0 
            ? `Latest: ${logs[logs.length - 1].title}` 
            : 'Experiment to discover laws of physics...'}
        </Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.amber : '#333' }]}>
          <Text style={[styles.logBadgeText, { color: logs.length > 0 ? '#000' : '#888' }]}>{logs.length}</Text>
        </View>
      </TouchableOpacity>

      {/* Logs Modal */}
      <Modal visible={logsOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: PALETTE.text }]}>Research Log</Text>
              <TouchableOpacity onPress={() => { soundTap(); setLogsOpen(false); }}>
                <Icon name="x" size={24} color={PALETTE.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>No discoveries yet. Try pushing the instruments to their limits!</Text>
              ) : (
                logs.map((l, i) => (
                  <View key={i} style={[styles.logCard, { borderLeftColor: l.color }]}>
                    <View style={styles.logCardHeader}>
                      <Text style={styles.logCardTitle}>{l.title}</Text>
                    </View>
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

// ── SUBCOMPONENTS: SCENES ─────────────────────────────────

function SceneOptics({ angle, discoveryAnim, scientistMode }) {
  // Top-left
  const isCritical = angle > 41 && angle < 43;
  const spread = isCritical ? 90 : 20 + (angle - 20);
  
  return (
    <G x={30} y={30}>
      <Polygon points="0,40 20,0 40,40" fill={PALETTE.cyan} opacity={0.3} stroke={PALETTE.cyan} />
      {/* Incoming ray */}
      <Line x1={-30} y1={20} x2={10} y2={20} stroke={PALETTE.text} strokeWidth={1.5} />
      {/* Refracted rays */}
      <Line x1={30} y1={20} x2={30 + Math.cos(spread*Math.PI/180)*40} y2={20 + Math.sin(spread*Math.PI/180)*40} stroke={PALETTE.red} strokeWidth={2} />
      <Line x1={30} y1={20} x2={30 + Math.cos(-spread*Math.PI/180)*40} y2={20 + Math.sin(-spread*Math.PI/180)*40} stroke={PALETTE.green} strokeWidth={2} />
      
      {scientistMode && (
        <SvgText x={40} y={60} fill={PALETTE.cyan} fontSize={10}>n₁sin(θ₁)=n₂sin(θ₂)</SvgText>
      )}
    </G>
  );
}

function SceneSound({ freq, discoveryAnim, scientistMode }) {
  // Top-right
  const isUltra = freq > 15000;
  return (
    <G x={width - 80} y={30}>
      <Path d="M10,0 Q0,20 10,40 M30,0 Q40,20 30,40" fill="none" stroke="#888" strokeWidth={3} />
      {!isUltra && (
        <>
          <Circle cx={20} cy={20} r={15} stroke={PALETTE.cyan} strokeWidth={1} fill="none" opacity={0.6} />
          <Circle cx={20} cy={20} r={25} stroke={PALETTE.cyan} strokeWidth={1} fill="none" opacity={0.3} />
        </>
      )}
      {isUltra && scientistMode && <SvgText x={0} y={55} fill={PALETTE.red} fontSize={10}>ULTRASONIC</SvgText>}
    </G>
  );
}

function SceneHeat({ heat, tick, discoveryAnim, scientistMode }) {
  // Center
  const cx = width / 2;
  const cy = H_VIEWPORT / 2;
  const isBoiling = heat >= 100;
  
  // Predictable pseudo-random motion based on tick and heat
  const p1y = cy + 15 * Math.sin(tick * 0.1 * (heat/50 + 1));
  const p2y = cy - 15 * Math.cos(tick * 0.12 * (heat/50 + 1));

  return (
    <G x={0} y={0}>
      <Rect x={cx - 20} y={cy - 25} width={40} height={50} rx={5} fill="none" stroke={PALETTE.text} strokeWidth={2} opacity={0.4} />
      <Line x1={cx - 15} y1={cy + 5} x2={cx + 15} y2={cy + 5} stroke={PALETTE.cyan} strokeWidth={2} opacity={0.6} />
      
      <Circle cx={cx - 5} cy={p1y} r={3} fill={heat > 150 ? PALETTE.red : PALETTE.amber} />
      <Circle cx={cx + 5} cy={p2y} r={3} fill={heat > 250 ? PALETTE.red : PALETTE.amber} />
      
      {isBoiling && <Circle cx={cx} cy={cy - 30 - (tick % 20)} r={2} fill={PALETTE.text} opacity={0.5} />}
      {scientistMode && <SvgText x={cx - 20} y={cy + 40} fill={PALETTE.amber} fontSize={10}>Q = mcΔT</SvgText>}
    </G>
  );
}

function SceneWork({ heat, fricOn, tick, discoveryAnim, scientistMode }) {
  // Bottom-left
  const basex = 40;
  const basey = H_VIEWPORT - 60;
  
  // Slide logic: repeats every ~60 ticks, sped up by heat
  const speed = 1 + (heat / 100);
  const slideProg = ((tick * speed) % 60) / 60;
  const slideX = basex + slideProg * 40;
  const slideY = basey - slideProg * 20;

  return (
    <G>
      <Polygon points={`${basex},${basey} ${basex+60},${basey} ${basex+60},${basey-30}`} fill="none" stroke={PALETTE.steel} strokeWidth={2} />
      <Rect x={slideX} y={slideY - 10} width={10} height={10} fill={PALETTE.green} rotation={-25} origin={`${slideX},${slideY}`} />
      
      {scientistMode && <SvgText x={basex} y={basey + 20} fill={PALETTE.green} fontSize={10}>W = F·d</SvgText>}
    </G>
  );
}

function SceneMotion({ gravOn, airOn, tick, discoveryAnim, scientistMode }) {
  // Bottom-right
  const startX = width - 80;
  const startY = H_VIEWPORT - 50;

  // Parabola logic
  const t = (tick % 50) / 50; // 0 to 1
  let projX = startX + t * -60;
  let projY = startY;
  
  if (gravOn) {
    // Parabola: y = a*x^2
    const arch = 0.5 - Math.abs(t - 0.5); // Peak at t=0.5
    projY = startY - arch * 80;
  } else {
    // Straight line
    projY = startY - t * 80;
  }

  return (
    <G>
      {gravOn && <Path d={`M${startX},${startY} Q${startX-30},${startY-80} ${startX-60},${startY}`} fill="none" stroke={PALETTE.amber} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />}
      {!gravOn && <Line x1={startX} y1={startY} x2={startX-60} y2={startY-80} stroke={PALETTE.text} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />}
      
      <Circle cx={projX} cy={projY} r={4} fill={PALETTE.text} />
      {scientistMode && <SvgText x={startX - 40} y={startY + 20} fill={PALETTE.cyan} fontSize={10}>y=x*tan(θ)-gx²/(2v²)</SvgText>}
    </G>
  );
}

// ── SUBCOMPONENTS: PANEL ──────────────────────────────────
function ControlPanel(props) {
  return (
    <View style={styles.panelInner}>
      <View style={styles.panelRow}>
        <Dial InstrumentName="PRISM ANGLE" val={props.angle} setVal={props.setAngle} min={20} max={70} color={PALETTE.cyan} />
        <Dial InstrumentName="HEAT DIAL" val={props.heat} setVal={props.setHeat} min={0} max={300} color={PALETTE.amber} />
      </View>
      <View style={styles.panelRow}>
        <SwitchBank label="GRAVITY" val={props.gravOn} setVal={props.setGravOn} />
        <SwitchBank label="FRICTION" val={props.fricOn} setVal={props.setFricOn} />
        <SwitchBank label="AIR RES" val={props.airOn} setVal={props.setAirOn} />
      </View>
    </View>
  );
}

function Dial({ InstrumentName, val, setVal, min, max, color }) {
  // Simple dial approximation using PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gs) => {
        let update = val + gs.dx * 0.2;
        if (update > max) update = max;
        if (update < min) update = min;
        setVal(update);
      }
    })
  ).current;

  const rot = ((val - min) / (max - min)) * 270 - 135;

  return (
    <View style={styles.instWrap}>
      <Text style={[styles.instLabel, { color }]}>{InstrumentName}</Text>
      <View style={styles.dialBase} {...panResponder.panHandlers}>
        <View style={[styles.dialPointer, { transform: [{ rotate: `${rot}deg` }] }]} />
      </View>
      <Text style={styles.instVal}>{Math.floor(val)}</Text>
    </View>
  );
}

function SwitchBank({ label, val, setVal }) {
  return (
    <TouchableOpacity style={styles.switchBox} onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setVal(!val);
    }} activeOpacity={0.8}>
      <Text style={styles.switchLabel}>{label}</Text>
      <View style={[styles.switchTrack, val && { backgroundColor: PALETTE.green }]}>
        <View style={[styles.switchThumb, val ? { alignSelf: 'flex-end'} : { alignSelf: 'flex-start'}]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, backgroundColor: '#050508', borderBottomWidth: 1, borderBottomColor: PALETTE.panel 
  },
  headerTitle: { color: PALETTE.text, fontFamily: 'Outfit_700Bold', letterSpacing: 2 },
  viewport: { width: '100%', overflow: 'hidden' },
  vignette: { 
    ...StyleSheet.absoluteFillObject, 
    borderWidth: 20, borderColor: 'rgba(0,0,0,0.5)', opacity: 0.5 
  },
  discoveryBtn: {
    position: 'absolute', bottom: 15, right: 15,
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel
  },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 10, justifyContent: 'space-around' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  instWrap: { alignItems: 'center', gap: 5 },
  instLabel: { fontSize: 10, fontFamily: 'Outfit_500Medium' },
  instVal: { fontSize: 14, color: PALETTE.text, fontFamily: 'Outfit_700Bold' },
  dialBase: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A1C25', borderWidth: 2, borderColor: PALETTE.steel, alignItems: 'center', justifyContent: 'center' },
  dialPointer: { width: 4, height: 30, backgroundColor: PALETTE.text, borderTopEndRadius: 2, borderTopStartRadius: 2, position: 'absolute', top: 5 },
  switchBox: { alignItems: 'center', gap: 5 },
  switchLabel: { fontSize: 10, color: PALETTE.text, fontFamily: 'Outfit_500Medium' },
  switchTrack: { width: 40, height: 20, borderRadius: 10, backgroundColor: '#20202A', padding: 2, justifyContent: 'center' },
  switchThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: PALETTE.text },
  
  // Log bar & Modal styling
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#060606', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  logBadgeText: { fontSize: 11, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0E0E08', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
