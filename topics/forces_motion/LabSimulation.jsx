/**
 * Forces & Motion Lab — Projectile Kinematics Simulator
 * Scientist Mode: Trajectory vectors, Gravity Constants
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
  bg: '#0A0A15',
  panel: '#121220',
  cyan: '#00D4FF',
  green: '#39FF14',
  amber: '#FFD166',
  red: '#FF4D6D',
  purple: '#A855F7',
  text: '#E8E0D0',
  steel: '#1A1A35'
};

export default function ForcesLab({ scientistMode = false, accentColor = '#A855F7', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [velocity, setVelocity] = useState(50); // m/s
  const [angle, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(1); // 0 (Zero G), 1 (Earth), 2 (Jupiter scale)
  
  const discovered = useRef(new Set());

  // Kinematic state
  const [time, setTime] = useState(0); // simulation time
  const [isFiring, setIsFiring] = useState(false);
  const [trajectory, setTrajectory] = useState([]);

  // Physics Engine Loop
  useEffect(() => {
    let loop;
    if (isFiring) {
      loop = setInterval(() => {
        setTime(t => {
          const next = t + 0.1; // 100ms sim steps
          
          // Calculate pos
          const v0 = velocity;
          const theta = angle * (Math.PI / 180);
          const g = gravity === 0 ? 0 : gravity === 1 ? 9.81 : 24.79; // Earth vs Jupiter
          
          const x = (v0 * Math.cos(theta)) * next;
          const y = (v0 * Math.sin(theta)) * next - (0.5 * g * next * next);
          
          setTrajectory(curr => {
            // Keep trail
            if (curr.length > 50) curr.shift();
            return [...curr, { x, y }];
          });

          // Ground hit detection
          if (y < 0 && next > 0) {
            setIsFiring(false);
            if (gravity > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              // Max range log
              if (!discovered.current.has('d1') && angle === 45) {
                addLog('d1', {
                  title: "Maximum Range Angle (45°)",
                  entry: "You fired at exactly 45 degrees! In a vacuum, 45° provides the absolute maximum horizontal distance a projectile can possibly travel.",
                  color: PALETTE.green
                });
              }
            }
          }

          // Zero-G infinity detection
          if (gravity === 0 && x > 2500 && !discovered.current.has('d2')) {
            addLog('d2', {
              title: "Newton's First Law (Deep Space)",
              entry: "Without gravity pulling it down, the projectile will fly in a perfectly straight line literally forever until it hits something. You have achieved deep space inertia!",
              color: PALETTE.purple
            });
            setIsFiring(false); // Stop sim so it doesn't run forever in memory
          }

          return next;
        });
      }, 30); // Real time 30ms render
    }
    return () => clearInterval(loop);
  }, [isFiring, velocity, angle, gravity]);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  const fireCannon = () => {
    soundTap();
    setTime(0);
    setTrajectory([{x: 0, y: 0}]);
    setIsFiring(true);
    
    if (gravity === 2 && !discovered.current.has('d3')) {
      addLog('d3', {
        title: "Jupiter Gravity Well",
        entry: "Jupiter's gravity is 2.5x stronger than Earth's. Notice how aggressively the trajectory is crushed downward, drastically shortening the projectile's range!",
        color: PALETTE.red
      });
    }
    
    // Danger: Max Velocity, Zero G
    if (velocity >= 95 && gravity === 0 && !discovered.current.has('d4')) {
      if (shakeAnim._value === 0) {
        discovered.current.add('d4');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onLabBreaker && onLabBreaker();
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
        ]).start();
        setLogs(prev => [...prev, {
          title: "Supersonic Escape Velocity",
          entry: "Max speed with no gravity! Projectile has structurally escaped the engine tracking bounds.",
          color: PALETTE.red
        }]);
      }
    }
  };

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Rendering Mechanics
  const cx = 40; // bottom left
  const cy = H_VIEWPORT - 50;

  // Scale down physics meters to SVG pixels (1m = 2px)
  const scale = 2;
  
  // Current projectile coords
  let px = cx;
  let py = cy;
  if (trajectory.length > 0) {
    const last = trajectory[trajectory.length - 1];
    px = cx + (last.x * scale);
    py = cy - (last.y * scale);
  }

  // Calculate live vectors for Discovery mode
  const rad = angle * (Math.PI / 180);
  const vx = velocity * Math.cos(rad);
  const vy = velocity * Math.sin(rad) - (gravity === 0 ? 0 : gravity === 1 ? 9.81 : 24.79) * time;
  
  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#221133" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
          
          {/* Ground */}
          <Line x1={0} y1={cy} x2={width} y2={cy} stroke={gravity === 2 ? PALETTE.red : PALETTE.steel} strokeWidth={4} />

          {/* Trajectory Trail */}
          {trajectory.length > 1 && (
            <Path 
              d={`M ${cx} ${cy} ` + trajectory.map(p => `L ${cx + p.x*scale} ${cy - p.y*scale}`).join(' ')} 
              fill="none" stroke={PALETTE.text} strokeWidth={2} opacity={0.4} strokeDasharray="5 5" 
            />
          )}

          {/* Cannon Base */}
          <G x={cx} y={cy}>
            <Rect x={-15} y={-10} width={30} height={10} fill="#444" />
            <Circle cx={0} cy={0} r={12} fill="#666" />
            {/* Cannon Barrel */}
            <Rect x={0} y={-4} width={40} height={8} fill={PALETTE.purple} rotation={-angle} origin="0,0" rx={4} />
          </G>

          {/* The Projectile */}
          {(isFiring || trajectory.length > 0) && (
            <Circle cx={px} cy={py} r={6} fill={PALETTE.cyan} />
          )}

          {/* Discovery Vectors */}
          {discoveryMode && (isFiring || trajectory.length > 0) && (
            <G x={px} y={py}>
               {/* Velocity X */}
               <Line x1={0} y1={0} x2={vx} y2={0} stroke={PALETTE.green} strokeWidth={2} />
               {/* Velocity Y */}
               <Line x1={0} y1={0} x2={0} y2={-vy} stroke={PALETTE.red} strokeWidth={2} />
               
               <SvgText x={vx + 5} y={5} fill={PALETTE.green} fontSize={8}>Vx</SvgText>
               <SvgText x={5} y={-vy - 5} fill={PALETTE.red} fontSize={8}>Vy</SvgText>
            </G>
          )}

          {scientistMode && (
            <G>
              <SvgText x={cx + 60} y={40} fill={PALETTE.purple} fontSize={12} fontFamily="monospace">
                X = (v₀cosθ)t
              </SvgText>
              <SvgText x={cx + 60} y={60} fill={PALETTE.purple} fontSize={12} fontFamily="monospace">
                Y = (v₀sinθ)t - ½gt²
              </SvgText>
              
              {(isFiring || trajectory.length > 0) && (
                 <SvgText x={px - 20} y={py - 15} fill={PALETTE.cyan} fontSize={10} fontFamily="monospace">
                   {trajectory[trajectory.length-1]?.y.toFixed(1)}m↑
                 </SvgText>
              )}
            </G>
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
            <Text style={styles.sliderLabel}>VELOCITY (v₀): {Math.round(velocity)} m/s</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.cyan}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setVelocity((x / (width-40)) * 100);
            }}>
              <View style={[styles.sliderFill, { width: `${velocity}%`, backgroundColor: PALETTE.cyan }]} />
              <View style={[styles.sliderThumb, { left: `${velocity}%` }]} />
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>LAUNCH ANGLE (θ): {Math.round(angle)}°</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.purple}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setAngle((x / (width-40)) * 90);
            }}>
              <View style={[styles.sliderFill, { width: `${(angle/90)*100}%`, backgroundColor: PALETTE.purple }]} />
              <View style={[styles.sliderThumb, { left: `${(angle/90)*100}%` }]} />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.optLabel}>PLANETARY GRAVITY:</Text>
            <TouchableOpacity style={[styles.pill, gravity===0 && {backgroundColor: '#333'}]} onPress={() => { soundTap(); setGravity(0); }}>
              <Text style={styles.pillTxt}>0G Space</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, gravity===1 && {backgroundColor: PALETTE.green}]} onPress={() => { soundTap(); setGravity(1); }}>
              <Text style={styles.pillTxt}>Earth (9.8)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, gravity===2 && {backgroundColor: PALETTE.red}]} onPress={() => { soundTap(); setGravity(2); }}>
              <Text style={styles.pillTxt}>Jupiter (24.7)</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.fireBtn, isFiring && { opacity: 0.5 }]} 
            activeOpacity={0.8} 
            onPress={fireCannon}
            disabled={isFiring}
          >
            <Text style={styles.fireBtnTxt}>{isFiring ? 'CALCULATING TRAJECTORY...' : 'FIRE CANNON'}</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Fire at different angles & planets...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.purple : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
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
                <Text style={styles.emptyLog}>No discoveries yet. Try turning off gravity entirely!</Text>
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
  discoveryBtn: { position: 'absolute', top: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 20 },
  sliderWrap: { width: '100%', marginBottom: 15 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 20, backgroundColor: '#050A0A', borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 10 },
  sliderThumb: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF', marginLeft: -13 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  optLabel: { color: '#888', fontSize: 10, fontFamily: 'monospace' },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: PALETTE.steel, backgroundColor: '#0A0A15' },
  pillTxt: { color: '#FFF', fontSize: 10, fontFamily: 'Outfit_500Medium' },
  fireBtn: { marginTop: 10, backgroundColor: PALETTE.purple, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  fireBtnTxt: { color: '#FFF', fontFamily: 'Outfit_700Bold', letterSpacing: 2, fontSize: 13 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#050A15', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#050A15', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
