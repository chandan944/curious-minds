// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  LAB: Electricity & Circuits v2.0 (Extreme)
//  Interactive Circuit Matrix & Real-time Ohm's Law Engine
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, {
  Circle, Line, Rect, Path, Defs, RadialGradient, Stop, G
import Svg, { Circle, Rect, G, Defs, Stop, RadialGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 300;

// â”€â”€ Components & Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COMPONENT_TYPES = [
  { id: 'resistor', name: 'Resistor', resistance: 100, color: '#6C63FF', icon: 'link' },
  { id: 'led', name: 'LED', resistance: 50, color: '#FF4D6D', icon: 'lightbulb' },
  { id: 'motor', name: 'Motor', resistance: 200, color: '#00E5FF', icon: 'refresh-cw' },
  { id: 'buzzer', name: 'Buzzer', resistance: 500, color: '#FFD166', icon: 'waves' },
];

const VOLTAGES = [1.5, 3.0, 5.0, 9.0, 12.0];

const CHALLENGES = [
  { id: 'high_power', title: 'Power Surge', desc: 'Overload the circuit with >1W of power', icon: 'zap', color: '#FF4D6D' },
  { id: 'balanced', title: 'Load Balancer', desc: 'Balance 3+ branches perfectly', icon: 'grid', color: '#00E5FF' },
  { id: 'short_circ', title: 'Controlled Burn', desc: 'Trigger a Short Circuit protection', icon: 'fire', color: '#FF9F1C' },
  { id: 'mixed_master', title: 'Circuit Master', desc: 'Use 4 different components types', icon: 'award', color: '#A855F7' },
];

// â”€â”€ Unified UI Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StatusCard = ({ label, value, unit, color, icon }) => (
  <View style={[styles.statusCard, { borderLeftColor: color }]}>
    <View style={styles.statusIconWrap}>
      <Icon name={icon} size={14} color={color} />
      <Text style={[styles.statusLabel, { color }]}>{label}</Text>
    </View>
    <Text style={styles.statusValue}>{value}<Text style={styles.statusUnit}> {unit}</Text></Text>
  </View>
);

const ScientistCard = ({ formula, value, description, color }) => (
  <View style={[styles.sciCard, { backgroundColor: color + '10', borderColor: color + '30' }]}>
    <Text style={[styles.sciFormula, { color }]}>{formula}</Text>
    <Text style={styles.sciDesc}>{description}</Text>
    <View style={styles.sciDivider} />
    <Text style={[styles.sciValue, { color }]}>{value}</Text>
  </View>
);

const ChallengeCard = ({ challenge, isDone }) => (
  <View style={[styles.challCard, { borderColor: isDone ? challenge.color : '#333' }]}>
    <View style={[styles.challIcon, { backgroundColor: isDone ? challenge.color : '#222' }]}>
      <Icon name={isDone ? 'check' : challenge.icon} size={14} color={isDone ? '#fff' : '#666'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.challTitle, { color: isDone ? challenge.color : '#eee' }]}>{challenge.title}</Text>
      <Text style={styles.challDesc}>{challenge.desc}</Text>
    </View>
  </View>
);

// â”€â”€ Animated SVG components must be defined before JSX use â”€â”€
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// â”€â”€ Main Simulation Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ElectricityLab({ scientistMode = false, accentColor = '#6C63FF' }) {
  const { isDark } = useTheme();
  
  // State
  const [voltage, setVoltage] = useState(5.0);
  const [slots, setSlots] = useState([null, null, null, null]); // 4 slots
  const [topology, setTopology] = useState('series'); // series, parallel
  const [running, setRunning] = useState(false);
  const [shortCircuit, setShortCircuit] = useState(false);
  const [results, setResults] = useState({ current: 0, power: 0, resistance: 0 });
  const [completedChallenges, setCompleted] = useState([]);

  // Anim Refs
  const currentAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkAnim = useRef(new Animated.Value(0)).current;

  // â”€â”€ Physics Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const calculatePhysics = useCallback(() => {
    let totalR = 0;
    const filledComps = slots.filter(s => s !== null).map(id => COMPONENT_TYPES.find(c => c.id === id));
    
    if (filledComps.length === 0) {
      setResults({ current: 0, power: 0, resistance: 0 });
      return;
    }

    if (topology === 'series') {
      totalR = filledComps.reduce((acc, c) => acc + c.resistance, 0);
    } else {
      // Parallel: 1/Rt = 1/R1 + 1/R2...
      const reciprocalSum = filledComps.reduce((acc, c) => acc + (1 / c.resistance), 0);
      totalR = 1 / reciprocalSum;
    }

    const current = voltage / totalR;
    const power = voltage * current;

    // Check for "Short Circuit" (using arbitrary threshold for logic)
    if (current > 0.5) { // 500mA threshold for simulation safety
      setShortCircuit(true);
      setRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerSpark();
    } else {
      setShortCircuit(false);
    }

    setResults({ current, power, resistance: totalR });
    
    // Check Challenges
    const freshDone = [...completedChallenges];
    if (power > 1.0 && !freshDone.includes('high_power')) {
       freshDone.push('high_power');
       soundTrophy();
    }
    if (topology === 'parallel' && filledComps.length >= 3 && !freshDone.includes('balanced')) {
       freshDone.push('balanced');
       soundTrophy();
    }
    if (shortCircuit && !freshDone.includes('short_circ')) {
       freshDone.push('short_circ');
       soundTrophy();
    }
    const uniqueTypes = new Set(slots.filter(s => s !== null)).size;
    if (uniqueTypes >= 4 && !freshDone.includes('mixed_master')) {
       freshDone.push('mixed_master');
       soundTrophy();
    }
    if (freshDone.length > completedChallenges.length) setCompleted(freshDone);

  }, [slots, topology, voltage, completedChallenges, shortCircuit]);

  useEffect(() => {
    calculatePhysics();
  }, [slots, topology, voltage, calculatePhysics]);

  // â”€â”€ Animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const triggerSpark = () => {
    sparkAnim.setValue(0);
    Animated.sequence([
      Animated.timing(sparkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(sparkAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(sparkAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(sparkAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (running && results.current > 0) {
      Animated.loop(
        Animated.timing(currentAnim, {
          toValue: 1,
          duration: Math.max(200, 2000 - (results.current * 4000)),
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      currentAnim.stopAnimation();
    }
  }, [running, results.current, currentAnim]);

  // â”€â”€ Interaction Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const placeComponent = (slotIdx, typeId) => {
    soundTap();
    const newSlots = [...slots];
    newSlots[slotIdx] = typeId;
    setSlots(newSlots);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeComponent = (slotIdx) => {
    soundWhoosh();
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
  };

  const toggleRunning = () => {
    if (shortCircuit) {
      setShortCircuit(false);
      calculatePhysics();
      return;
    }
    soundTap();
    setRunning(!running);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // â”€â”€ Render Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const renderCircuitLayout = () => {
    const isSeries = topology === 'series';
    const wireColor = isDark ? '#333' : '#ddd';
    const activeWire = running ? accentColor : wireColor;

    return (
      <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.4" />
            <Stop offset="100" stopColor={accentColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Outer Frame / Rails */}
        <Rect x={40} y={60} width={SIM_W-80} height={180} fill="none" stroke={activeWire} strokeWidth={3} rx={10} />
        
        {/* Battery Hub */}
        <G transform={`translate(${40}, ${150-30})`}>
          <Rect width={15} height={60} fill={running ? accentColor : '#444'} rx={3} />
          <Rect x={-10} y={15} width={10} height={30} fill={running ? accentColor : '#444'} rx={2} />
          <Text style={[styles.svgLabel, { color: running ? accentColor : '#666' }]}>+ -</Text>
        </G>

        {/* Electrons (Flowing dots) */}
        {running && [0,1,2,3,4,5].map(i => {
           const inputPath = isSeries ? [0, 1] : [0, 1];
           return (
             <AnimatedCircle 
               key={i}
               cx={currentAnim.interpolate({
                 inputRange: [0, 1],
                 outputRange: [40 + (i * 40), 40 + (i * 40) + (SIM_W-80)]
               })}
               cy={60}
               r={3}
               fill="#FFF"
               opacity={0.8}
             />
           );
        })}

        {/* Short Circuit Spark Overlay */}
        <AnimatedRect 
          x={0} y={0} width={SIM_W} height={SIM_H} 
          fill="#FFF" opacity={sparkAnim.interpolate({ inputRange:[0,1], outputRange:[0, 0.4]})} 
        />
      </Svg>
    );
  };

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="CURRENT" value={results.current.toFixed(3)} unit="A" color="#FF4D6D" icon="zap" />
        <StatusCard label="POWER" value={results.power.toFixed(3)} unit="W" color="#FFD166" icon="sun" />
        <StatusCard label="LOAD" value={results.resistance.toFixed(0)} unit="Î©" color="#00E5FF" icon="grid" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: shortCircuit ? '#FF4D6D' : '#333' }]}>
        {renderCircuitLayout()}
        
        {/* Interactive Slots Overlaid on SVG */}
        <View style={styles.slotsOverlay}>
          {slots.map((comp, idx) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => comp ? removeComponent(idx) : null}
              style={[
                styles.slot, 
                { backgroundColor: comp ? COMPONENT_TYPES.find(c => c.id === comp).color + '20' : '#111' },
                { borderColor: comp ? COMPONENT_TYPES.find(c => c.id === comp).color : '#333' }
              ]}
            >
              {comp ? (
                <Icon name={COMPONENT_TYPES.find(c => c.id === comp).icon} size={24} color={COMPONENT_TYPES.find(c => c.id === comp).color} />
              ) : (
                <Text style={styles.slotEmpty}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {shortCircuit && (
          <View style={styles.warningOverlay}>
            <Icon name="alert-triangle" size={30} color="#FF4D6D" />
            <Text style={styles.warningText}>CIRCUIT BREAKER TRIPPED!</Text>
            <Text style={styles.warningSub}>Too much current. Adjust resistance.</Text>
          </View>
        )}
      </View>

      {/* 3. Controls */}
      <View style={styles.controlPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compScroll}>
           {COMPONENT_TYPES.map(type => (
             <TouchableOpacity 
               key={type.id} 
               onPress={() => {
                 const firstEmpty = slots.indexOf(null);
                 if (firstEmpty !== -1) placeComponent(firstEmpty, type.id);
               }}
               style={[styles.compChip, { borderColor: type.color + '40' }]}
             >
               <Icon name={type.icon} size={18} color={type.color} />
               <Text style={[styles.compName, { color: type.color }]}>{type.name}</Text>
               <Text style={styles.compDetails}>{type.resistance}Î©</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        <View style={styles.configRow}>
           <View style={{ flex: 1 }}>
              <Text style={styles.sliderLabel}>VOLTAGE: {voltage}V</Text>
              <View style={styles.voltageOptions}>
                 {VOLTAGES.map(v => (
                   <TouchableOpacity key={v} onPress={() => { soundTap(); setVoltage(v); }} style={[styles.vBtn, voltage === v && styles.vBtnActive]}>
                      <Text style={[styles.vText, voltage === v && { color: '#000' }]}>{v}V</Text>
                   </TouchableOpacity>
                 ))}
              </View>
           </View>
           <TouchableOpacity 
             onPress={toggleRunning} 
             style={[styles.runBtn, { backgroundColor: running ? '#FF4D6D' : accentColor }]}
           >
             <Icon name={running ? 'pause' : 'play'} size={20} color="#FFF" />
             <Text style={styles.runText}>{running ? 'STOP' : shortCircuit ? 'RESET' : 'RUN'}</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.topoToggle}>
           <TouchableOpacity onPress={() => setTopology('series')} style={[styles.topoBtn, topology === 'series' && styles.topoActive]}>
              <Icon name="link" size={14} color={topology === 'series' ? '#FFF' : '#666'} />
              <Text style={[styles.topoText, topology === 'series' && { color: '#FFF' }]}>SERIES</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => setTopology('parallel')} style={[styles.topoBtn, topology === 'parallel' && styles.topoActive]}>
              <Icon name="grid" size={14} color={topology === 'parallel' ? '#FFF' : '#666'} />
              <Text style={[styles.topoText, topology === 'parallel' && { color: '#FFF' }]}>PARALLEL</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* 4. Scientist Mode Analytics */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>SCIENTIFIC ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="I = V / R" 
              description="Ohm's Law (Current Calculation)" 
              value={`${voltage} / ${results.resistance.toFixed(0)} = ${results.current.toFixed(4)} A`}
              color="#FF4D6D"
            />
            <ScientistCard 
              formula="P = V * I" 
              description="Joule Heating (Power Usage)" 
              value={`${voltage} * ${results.current.toFixed(4)} = ${results.power.toFixed(3)} W`}
              color="#FFD166"
            />
            {topology === 'parallel' && (
              <ScientistCard 
                formula="1/Rt = Î£(1/Rn)" 
                description="Parallel Equivalent Resistance" 
                value={`Rt = ${(1/results.resistance).toFixed(4)}^-1 = ${results.resistance.toFixed(1)} Î©`}
                color="#00E5FF"
              />
            )}
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>LAB CHALLENGES</Text>
         {CHALLENGES.map(c => (
           <ChallengeCard key={c.id} challenge={c} isDone={completedChallenges.includes(c.id)} />
         ))}
      </View>
      
      <View style={{ height: 100 }} />
    </View>
  );
}

// AnimatedCircle and AnimatedRect are defined above the component (see top of file)

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4 },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 9, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  statusValue: { fontSize: 18, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvasWrap: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' },
  svg: { position: 'absolute' },
  slotsOverlay: { position: 'absolute', top: 60, left: 40, width: SIM_W-80, height: 180, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  slot: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  slotEmpty: { color: '#333', fontSize: 24, fontWeight: '300' },
  svgLabel: { fontSize: 8, fontFamily: FONTS.mono, textAlign: 'center', marginTop: 4 },
  
  warningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,77,109,0.1)', justifyContent: 'center', alignItems: 'center' },
  warningText: { color: '#FF4D6D', fontFamily: FONTS.displayBold, fontSize: 16, marginTop: 10 },
  warningSub: { color: '#FF4D6D', fontSize: 12, opacity: 0.8 },

  controlPanel: { marginTop: 20, gap: 16 },
  compScroll: { gap: 10 },
  compChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A1A1A', padding: 10, borderRadius: RADIUS.md, borderWidth: 1 },
  compName: { fontSize: 13, fontFamily: FONTS.displayMedium },
  compDetails: { fontSize: 10, color: '#555' },

  configRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sliderLabel: { fontSize: 10, color: '#666', marginBottom: 6, fontFamily: FONTS.displayBold },
  voltageOptions: { flexDirection: 'row', gap: 6 },
  vBtn: { width: 40, height: 35, borderRadius: 8, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  vBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  vText: { fontSize: 12, color: '#888', fontWeight: 'bold' },

  runBtn: { flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50, borderRadius: RADIUS.md },
  runText: { color: '#FFF', fontFamily: FONTS.displayBold, fontSize: 15 },

  topoToggle: { flexDirection: 'row', gap: 8 },
  topoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: RADIUS.md, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
  topoActive: { backgroundColor: '#333', borderColor: '#6C63FF' },
  topoText: { fontSize: 12, color: '#666', fontFamily: FONTS.displayBold },

  sectionTitle: { fontSize: 11, fontFamily: FONTS.displayBold, color: '#555', letterSpacing: 2, marginBottom: 12, marginTop: 20 },
  scientistSection: { marginTop: 10 },
  sciGrid: { gap: 10 },
  sciCard: { padding: 15, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 16, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 10, color: '#999', marginBottom: 10 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10 },
  sciValue: { fontSize: 14, fontFamily: 'monospace' },

  challengeSection: { marginTop: 10 },
  challCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#151515', padding: 12, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 1 },
  challIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  challTitle: { fontSize: 14, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 11, color: '#666' }
});
