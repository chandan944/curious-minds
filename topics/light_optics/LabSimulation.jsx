/**
 * Light & Optics Lab — Optical Bench Simulator
 * Scientist Mode: Snell's Law matrices, Refractive Indices
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Polygon, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#050A15',
  panel: '#0B1220',
  red: '#FF3131',
  blue: '#00D4FF',
  green: '#39FF14',
  text: '#E8E0D0',
  steel: '#1A2135',
  amber: '#FFD166'
};

export default function OpticsLab({ scientistMode = false, accentColor = '#00D4FF', onLabBreaker }) {
  // Discovery layer overlay
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Component local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  // Controls State
  const [laserAngle, setLaserAngle] = useState(45); // 0 to 90 degrees
  const [medium, setMedium] = useState(1.52); // Glass=1.52, Water=1.33, Diamond=2.42
  const [wavelength, setWavelength] = useState(650); // Red=650nm, Green=532nm, Blue=450nm

  // Discoveries discovered flags
  const discovered = useRef(new Set());

  // Logic Tick (for lively animations)
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

  const checkDiscoveries = useCallback(() => {
    // Critical Angle calculation for TIR
    const criticalAngle = Math.asin(1 / medium) * (180 / Math.PI);
    
    // Total Internal Reflection (TIR)
    if (laserAngle > criticalAngle && medium === 1.52) {
      addLog('d1', {
        title: "Total Internal Reflection (TIR)",
        entry: `In Glass (n=1.52), the critical angle is ~41.1°. At ${Math.round(laserAngle)}°, the laser is perfectly trapped inside! Fiber optic internet uses this physical hack to bounce light across oceans without losing signal.`,
        color: PALETTE.cyan
      });
    }

    if (medium === 2.42) {
      addLog('d2', {
        title: "Diamond Refraction",
        entry: "Diamond has an extreme refractive index (n=2.42). Notice how aggressively it bends the laser compared to water! This extreme bending is what gives diamonds their famous 'sparkle'.",
        color: PALETTE.amber
      });
    }

    if (wavelength === 450 && medium === 1.52 && laserAngle > 30) {
      addLog('d3', {
        title: "High Energy Dispersion",
        entry: "Blue light (450nm) has a shorter wavelength and higher energy than Red. Therefore, it mathematically bends SLIGHTLY MORE than red light when hitting the glass. This slight difference is what causes prisms to fan out white light into rainbows!",
        color: PALETTE.green
      });
    }

    // Danger overload
    if (medium === 2.42 && laserAngle > 80 && wavelength === 450) {
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
  }, [laserAngle, medium, wavelength, addLog]);

  useEffect(() => { checkDiscoveries(); }, [checkDiscoveries]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Rendering the Laser Math
  const cx = width / 2;
  const cy = H_VIEWPORT / 2;
  
  // Laser source position
  const sourceRadius = 120;
  const radIncidence = laserAngle * (Math.PI / 180);
  
  // Source is bottom-left, aiming at center (cy)
  // Let's make flat boundary at Cy. Air above, Medium below.
  const sourceX = cx - Math.sin(radIncidence) * sourceRadius;
  const sourceY = cy - Math.cos(radIncidence) * sourceRadius;

  // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  // Air n1 = 1.00
  const n1 = 1.0;
  const n2 = medium;
  
  let refractAngle = 0;
  let isTIR = false;
  
  // Wait, if source is in air, light ALWAYS enters denser medium.
  // We want to demonstrate TIR! So source must be IN the medium!
  // Let's put the laser source below the boundary (in the medium).
  // And it tries to exit into the air (above).
  const raySourceX = cx - Math.sin(radIncidence) * sourceRadius;
  const raySourceY = cy + Math.cos(radIncidence) * sourceRadius; // Below boundary
  
  const sinTheta2 = (n2 / n1) * Math.sin(radIncidence);
  
  if (sinTheta2 > 1) {
    isTIR = true;
    refractAngle = radIncidence; // Reflects back down perfectly
  } else {
    refractAngle = Math.asin(sinTheta2);
  }

  const exitRayLength = 150;
  // If TIR, it bounces down-right. If refracting, it goes up-right.
  const exitX = isTIR 
    ? cx + Math.sin(refractAngle) * exitRayLength
    : cx + Math.sin(refractAngle) * exitRayLength;
    
  const exitY = isTIR
    ? cy + Math.cos(refractAngle) * exitRayLength
    : cy - Math.cos(refractAngle) * exitRayLength;

  let laserColor = PALETTE.red;
  if (wavelength === 532) laserColor = PALETTE.green;
  if (wavelength === 450) laserColor = PALETTE.blue;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="air" cx="50%" cy="20%" r="50%">
              <Stop offset="0%" stopColor="#0B1220" />
              <Stop offset="100%" stopColor="#050A15" />
            </SvgRadial>
            <SvgRadial id="med" cx="50%" cy="80%" r="50%">
              <Stop offset="0%" stopColor={medium === 1.33 ? '#003366' : medium === 2.42 ? '#333333' : '#1A2A3A'} opacity={0.6}/>
              <Stop offset="100%" stopColor="#050A15" />
            </SvgRadial>
          </Defs>
          
          {/* Backgrounds */}
          <Rect x={0} y={0} width={width} height={cy} fill="url(#air)" />
          <Rect x={0} y={cy} width={width} height={height} fill="url(#med)" />
          
          {/* The Boundary */}
          <Line x1={0} y1={cy} x2={width} y2={cy} stroke={PALETTE.steel} strokeWidth={2} />
          {/* Normal Line */}
          <Line x1={cx} y1={cy - 60} x2={cx} y2={cy + 60} stroke="#444" strokeWidth={1} strokeDasharray="5 5" />
          
          {/* The Incoming Laser */}
          <Line x1={raySourceX} y1={raySourceY} x2={cx} y2={cy} stroke={laserColor} strokeWidth={4} opacity={0.8} />
          {/* Pulse animation for incoming */}
          <Circle cx={cx - Math.sin(radIncidence) * (sourceRadius - (tick*4)%sourceRadius)} 
                  cy={cy + Math.cos(radIncidence) * (sourceRadius - (tick*4)%sourceRadius)} 
                  r={3} fill="#FFF" />

          {/* The Outgoing/Refracted/Reflected Laser */}
          <Line x1={cx} y1={cy} x2={exitX} y2={exitY} stroke={laserColor} strokeWidth={isTIR ? 4 : 2} opacity={0.8} />

          {/* Partial reflection if refracting */}
          {!isTIR && (
            <Line x1={cx} y1={cy} x2={cx + Math.sin(radIncidence)*exitRayLength} y2={cy + Math.cos(radIncidence)*exitRayLength} 
                  stroke={laserColor} strokeWidth={1} opacity={0.3} />
          )}

          {/* Draw Laser Head Component at bottom-left */}
          <Rect x={raySourceX - 10} y={raySourceY - 10} width={20} height={20} fill={PALETTE.steel} rotation={-laserAngle} origin={`${raySourceX},${raySourceY}`} rx={3} />
          <Circle cx={raySourceX} cy={raySourceY} r={5} fill={laserColor} />

          {scientistMode && (
            <G>
              <SvgText x={cx + 10} y={cy - 40} fill="#666" fontSize={10}>Air (n₁ = 1.00)</SvgText>
              <SvgText x={cx + 10} y={cy + 40} fill="#666" fontSize={10}>Medium (n₂ = {medium})</SvgText>
              <SvgText x={raySourceX + 20} y={raySourceY} fill={laserColor} fontSize={10}>θ₁ = {Math.round(laserAngle)}°</SvgText>
              <SvgText x={exitX - 40} y={exitY + 20} fill={laserColor} fontSize={10}>θ₂ = {Math.round(refractAngle * 180/Math.PI)}°</SvgText>
            </G>
          )}

          {discoveryMode && (
            // Wavefront analysis overlay
            <Circle cx={cx} cy={cy} r={tick%100} stroke={PALETTE.green} strokeWidth={0.5} opacity={1 - (tick%100)/100} fill="none" />
          )}
        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.green : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>
          
          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>INCIDENCE ANGLE (θ) : {Math.round(laserAngle)}°</Text>
            <View style={styles.sliderBg} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-60, e.nativeEvent.locationX));
              setLaserAngle((x / (width-60)) * 89);
            }}>
              <View style={[styles.sliderFill, { width: `${(laserAngle/89)*100}%`, backgroundColor: PALETTE.cyan }]} />
              <View style={[styles.sliderThumb, { left: `${(laserAngle/89)*100}%` }]} />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.optLabel}>MEDIUM:</Text>
            <TouchableOpacity style={[styles.pill, medium===1.33 && styles.pillActive]} onPress={() => { soundTap(); setMedium(1.33); }}>
              <Text style={styles.pillTxt}>Water (1.33)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, medium===1.52 && styles.pillActive]} onPress={() => { soundTap(); setMedium(1.52); }}>
              <Text style={styles.pillTxt}>Glass (1.52)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, medium===2.42 && styles.pillActive]} onPress={() => { soundTap(); setMedium(2.42); }}>
              <Text style={styles.pillTxt}>Diamond (2.42)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.optLabel}>LASER:</Text>
            <TouchableOpacity style={[styles.pill, wavelength===650 && {backgroundColor: PALETTE.red}]} onPress={() => { soundTap(); setWavelength(650); }}>
              <Text style={styles.pillTxt}>Red (650nm)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, wavelength===532 && {backgroundColor: PALETTE.green}]} onPress={() => { soundTap(); setWavelength(532); }}>
              <Text style={styles.pillTxt}>Green (532nm)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, wavelength===450 && {backgroundColor: PALETTE.blue}]} onPress={() => { soundTap(); setWavelength(450); }}>
              <Text style={styles.pillTxt}>Blue (450nm)</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Experiment to discover optics...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.amber : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
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
                <Text style={styles.emptyLog}>No discoveries yet. Try pushing the laser to total internal reflection!</Text>
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
  panelInner: { flex: 1, padding: 20, justifyContent: 'space-around' },
  sliderWrap: { width: '100%', marginBottom: 15 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'Outfit_500Medium', marginBottom: 8 },
  sliderBg: { height: 24, backgroundColor: '#050A15', borderRadius: 12, borderWidth: 1, borderColor: PALETTE.steel, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 12 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  optLabel: { color: '#888', fontSize: 10, fontFamily: 'monospace' },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: PALETTE.steel, backgroundColor: '#050A15' },
  pillActive: { backgroundColor: PALETTE.cyan, borderColor: PALETTE.cyan },
  pillTxt: { color: '#FFF', fontSize: 11, fontFamily: 'Outfit_500Medium' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#050A15', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0E0E08', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
