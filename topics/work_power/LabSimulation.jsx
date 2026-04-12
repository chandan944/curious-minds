/**
 * Work & Power Lab — Kinematic Incline Simulator
 * Scientist Mode: W=Fd, Friction Vectors
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Polygon
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#0A1515',
  panel: '#122020',
  cyan: '#00D4FF',
  green: '#39FF14',
  amber: '#FFD166',
  red: '#FF4D6D',
  text: '#E8E0D0',
  steel: '#1A3535'
};

export default function WorkLab({ scientistMode = false, accentColor = '#39FF14', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [pushForce, setPushForce] = useState(0); // 0 to 100 Newtons
  const [frictionOn, setFrictionOn] = useState(true);
  const [mass, setMass] = useState(10); // kg
  
  const discovered = useRef(new Set());

  // Kinematic state
  const [blockPos, setBlockPos] = useState(0); // 0 to 1 distance up ramp
  const [workDone, setWorkDone] = useState(0);

  // Logic Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const loop = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(loop);
  }, []);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  // Physics Engine
  useEffect(() => {
    // Ramp properties
    const rampLength = 10; // meters
    const rampAngle = 30 * (Math.PI / 180);
    const g = 9.81;
    
    // Forces parallel to ramp (up is positive)
    const gravityForce = - (mass * g * Math.sin(rampAngle));
    let frictionForce = 0;
    
    if (frictionOn) {
      // kinetic friction coefficient 0.3
      const normalForce = mass * g * Math.cos(rampAngle);
      frictionForce = -0.3 * normalForce * Math.sign(pushForce + gravityForce);
      // Static friction edge case: if push isn't strong enough
      if (Math.abs(pushForce) < Math.abs(gravityForce) && pushForce > 0) {
        frictionForce = -pushForce; // static matching
      }
    }

    const netForce = pushForce + gravityForce + frictionForce;
    const acceleration = netForce / mass;

    // We do simple kinematic step
    const dt = 0.05; // 50ms step
    let newPos = blockPos;

    if (netForce > 5) {
      newPos += 0.02 * (netForce/100); 
    } else if (netForce < -5) {
      newPos -= 0.04; // slides down fast
    }
    
    if (newPos > 1) { 
        newPos = 1; 
        if (!discovered.current.has('d1')) {
           addLog('d1', {
             title: "Summit Secured (Work Done)",
             entry: `You pushed a ${mass}kg block to the top! Your total mechanical Work done was precisely ${Math.round(pushForce * rampLength)} Joules! W=Fd.`,
             color: PALETTE.green
           });
        }
    }
    if (newPos < 0) newPos = 0;
    
    setBlockPos(newPos);
    
    // Calculate live Work (F * d)
    if (newPos > 0 && newPos <= 1 && pushForce > 0) {
       setWorkDone((pushForce * (newPos * rampLength)));
    }

    // Discoveries
    if (!frictionOn && newPos === 0 && pushForce === 0) {
      addLog('d2', {
        title: "Frictionless Vacuum",
        entry: "With zero friction, the only force resisting you is Gravity. This mathematically simulates deep space conditions!",
        color: PALETTE.cyan
      });
    }

    if (mass === 100 && pushForce === 100 && frictionOn) {
       addLog('d3', {
        title: "Static Friction Deadlock",
        entry: "The heavy block refuses to move! The 100N of push force you are applying is being perfectly violently counter-acted by static friction locking it down.",
        color: PALETTE.red
      });
    }

    // DANGER: Massive Kinetic Impact returning to 0
    if (newPos === 0 && mass === 100 && acceleration < -10) {
      if (shakeAnim._value === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
        ]).start();
      }
    }

  }, [pushForce, mass, frictionOn, tick]);


  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Rendering Mechanics
  const cx = width / 2;
  const cy = H_VIEWPORT / 1.5;
  
  // Ramp coords
  const rampW = 200;
  const rampH = 115; // roughly 30 degree angle
  const rStartX = cx - 100;
  const rStartY = cy + 50;
  
  const blockX = rStartX + blockPos * rampW;
  const blockY = rStartY - blockPos * rampH;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#112222" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
          
          {/* Ground */}
          <Line x1={0} y1={rStartY} x2={width} y2={rStartY} stroke={PALETTE.steel} strokeWidth={4} />

          {/* Ramp */}
          <Polygon points={`${rStartX},${rStartY} ${rStartX+rampW},${rStartY} ${rStartX+rampW},${rStartY-rampH}`} fill="#1A3535" stroke={PALETTE.cyan} strokeWidth={2} opacity={0.6}/>

          {/* The Block */}
          <G x={blockX} y={blockY - 35} rotation={-30} origin="15, 35">
            <Rect x={0} y={5} width={30} height={30} fill={mass > 50 ? PALETTE.amber : PALETTE.text} stroke="#000" strokeWidth={2} />
            
            {/* Action Force Vector (Push) */}
            {pushForce > 0 && <Line x1={-30} y1={20} x2={0} y2={20} stroke={PALETTE.green} strokeWidth={pushForce/20 + 1} markerEnd="url(#arrow)" />}
            
            {/* Discovery Physics Vectors */}
            {discoveryMode && (
              <G>
                {/* Gravity Vector Down */}
                <Line x1={15} y1={20} x2={15} y2={50} stroke={PALETTE.cyan} strokeWidth={2} strokeDasharray="4 4" />
                <SvgText x={20} y={60} fill={PALETTE.cyan} fontSize={8}>mg</SvgText>
                {/* Friction opposite to direction */}
                {frictionOn && <Line x1={15} y1={35} x2={15 - 30} y2={35} stroke={PALETTE.red} strokeWidth={2} />}
                {frictionOn && <SvgText x={-20} y={45} fill={PALETTE.red} fontSize={8}>Fk</SvgText>}
              </G>
            )}
          </G>

          {scientistMode && (
            <G>
              <SvgText x={15} y={30} fill={PALETTE.green} fontSize={12} fontFamily="monospace">
                Push: {Math.round(pushForce)} N
              </SvgText>
              <SvgText x={15} y={50} fill={PALETTE.amber} fontSize={12} fontFamily="monospace">
                Mass: {mass} kg
              </SvgText>
              <SvgText x={15} y={70} fill={PALETTE.cyan} fontSize={14} fontFamily="monospace">
                WORK: {Math.round(workDone)} J
              </SvgText>
            </G>
          )}

          {/* Steam from friction if fast moving */}
          {frictionOn && pushForce > 50 && blockPos > 0.1 && blockPos < 0.9 && (
            <Circle cx={blockX} cy={blockY} r={pushForce/10 + (tick%5)} fill={PALETTE.red} opacity={0.2} />
          )}

        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.cyan : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>PUSH FORCE: {Math.round(pushForce)} Newtons</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.green}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setPushForce((x / (width-40)) * 100);
            }}>
              <View style={[styles.sliderFill, { width: `${pushForce}%`, backgroundColor: PALETTE.green }]} />
              <View style={[styles.sliderThumb, { left: `${pushForce}%` }]} />
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>BLOCK MASS: {Math.round(mass)} kg</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.amber}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setMass((x / (width-40)) * 100);
            }}>
              <View style={[styles.sliderFill, { width: `${mass}%`, backgroundColor: PALETTE.amber }]} />
              <View style={[styles.sliderThumb, { left: `${mass}%` }]} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 15 }}>
            <Text style={{ color: PALETTE.text, fontFamily: 'Outfit_500Medium' }}>KINETIC FRICTION</Text>
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => { soundTap(); setFrictionOn(!frictionOn); }}>
               <View style={[styles.switchTrack, frictionOn && { backgroundColor: PALETTE.red }]}>
                 <View style={[styles.switchThumb, frictionOn ? { alignSelf: 'flex-end'} : { alignSelf: 'flex-start'}]} />
               </View>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Push the block to calculate work...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.green : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
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
                <Text style={styles.emptyLog}>No discoveries yet. Try pushing massive blocks up the ramp!</Text>
              ) : (
                logs.map((l, i) => (
                  <View key={i} style={[styles.logCard, { borderLeftColor: l.color }]}>
                    <Text style={styles.logCardTitle}>{l.title}</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  viewport: { width: '100%', overflow: 'hidden' },
  discoveryBtn: { position: 'absolute', bottom: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 20 },
  sliderWrap: { width: '100%', marginBottom: 20 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 20, backgroundColor: '#050A0A', borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 10 },
  sliderThumb: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF', marginLeft: -13 },
  switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#20202A', padding: 2, justifyContent: 'center' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: PALETTE.text },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#050A0A', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#050A0A', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
