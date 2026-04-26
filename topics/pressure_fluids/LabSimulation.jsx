// ─────────────────────────────────────────────────────────
//  LAB: Pressure & Fluid Mechanics v2.0 (Extreme)
//  Archimedes Tank & Hydraulic Press Engine
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, {
  Circle, Line, Rect, Path, Defs, RadialGradient, Stop, G, Text as SvgText, LinearGradient as SvgLinearGradient
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

// ── Constants & Data ─────────────────────────────────

const FLUIDS = [
  { id: 'air', name: 'Air', density: 1.2, color: '#FFFFFF20', icon: 'wind' },
  { id: 'water', name: 'Freshwater', density: 1000, color: '#00E5FF40', icon: 'droplet' },
  { id: 'saltwater', name: 'Saltwater', density: 1025, color: '#00D4FF60', icon: 'waves' },
  { id: 'honey', name: 'Honey', density: 1420, color: '#FFD16640', icon: 'layers' },
  { id: 'mercury', name: 'Mercury', density: 13600, color: '#A855F740', icon: 'thermometer' },
];

const OBJECTS = [
  { id: 'cork', name: 'Cork', density: 240, color: '#FF9F1C', size: 30, icon: 'circle' },
  { id: 'wood', name: 'Oak Wood', density: 700, color: '#B46B39', size: 40, icon: 'square' },
  { id: 'ice', name: 'Ice', density: 917, color: '#E0F2FE', size: 40, icon: 'box' },
  { id: 'iron', name: 'Iron Ball', density: 7870, color: '#444', size: 30, icon: 'shield' },
  { id: 'gold', name: 'Gold Bar', density: 19300, color: '#FFD166', size: 30, icon: 'award' },
];

const CHALLENGES = [
  { id: 'immortal_iron', title: 'The Mercury Miracle', desc: 'Make an Iron Ball float in a liquid', icon: 'thermometer', color: '#A855F7' },
  { id: 'iceberg', title: 'Iceberg Alert', desc: 'Observe Ice floating with 90% displacement', icon: 'box', color: '#E0F2FE' },
  { id: 'dense_sink', title: 'Belly Flop', desc: 'Sink a Gold Bar in every available liquid', icon: 'award', color: '#FFD166' },
  { id: 'pressure_cook', title: 'Hydro-Static', desc: 'Achieve max depth with a Cork', icon: 'target', color: '#00E5FF' },
];

// ── Unified UI Components ──────────────────────────────

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

// ── AnimatedG must be defined before JSX use ───────────
const AnimatedG = Animated.createAnimatedComponent(G);

// ── Main Simulation Component ───────────────────────────

export default function PressureLab({ scientistMode = false, accentColor = '#00E5FF' }) {
  const { isDark } = useTheme();
  
  // State
  const [fluid, setFluid] = useState(FLUIDS[1]); // Water
  const [activeObj, setActiveObj] = useState(OBJECTS[1]); // Wood
  const [running, setRunning] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  
  // Anim / Physics Refs
  const objY = useRef(new Animated.Value(50)).current;
  const submergedP = useRef(0);
  const [stats, setStats] = useState({ buoyancy: 0, gravity: 0, status: 'Air' });

  // ── Physics Engine ─────────────────────────────────────

  const calculatePhysics = useCallback(() => {
    const G = 9.81;
    const VOLUME = Math.pow(activeObj.size / 100, 3); // pseudo volume
    const mass = activeObj.density * VOLUME;
    const gravityForce = mass * G;

    // Archimedes: Fb = rho * V_disp * g
    const fluidDensity = fluid.density;
    
    // Animate to equilibrium
    let targetY = 50;
    let status = 'Sinking';

    if (activeObj.density < fluidDensity) {
      // Floats
      const displacedVolume = mass / fluidDensity;
      const percentSubmerged = displacedVolume / VOLUME;
      submergedP.current = percentSubmerged;
      
      const waterLine = SIM_H * 0.4;
      targetY = waterLine - (activeObj.size * (1 - percentSubmerged));
      status = 'Floating';
    } else {
      // Sinks
      targetY = SIM_H - activeObj.size - 10;
      submergedP.current = 1.0;
      status = 'Sunk';
    }

    setStats({ 
      buoyancy: (fluidDensity * VOLUME * submergedP.current * G),
      gravity: gravityForce,
      status
    });

    Animated.spring(objY, {
      toValue: targetY,
      tension: 20,
      friction: 5,
      useNativeDriver: true
    }).start();

    // Challenge Checks
    const freshDone = [...completedChallenges];
    if (activeObj.id === 'iron' && fluid.id === 'mercury' && !freshDone.includes('immortal_iron')) {
       freshDone.push('immortal_iron');
       soundTrophy();
    }
    if (activeObj.id === 'ice' && submergedP.current > 0.8 && !freshDone.includes('iceberg')) {
       freshDone.push('iceberg');
       soundTrophy();
    }
    if (activeObj.id === 'gold' && status === 'Sunk' && !freshDone.includes('dense_sink')) {
       // logic for multiple liquids would need a history state, skipping complex check for now
    }
    if (freshDone.length > completedChallenges.length) setCompleted(freshDone);

  }, [activeObj, fluid, completedChallenges]);

  useEffect(() => {
    calculatePhysics();
  }, [activeObj, fluid, calculatePhysics]);

  // ── Render ─────────────────────────────────────────────

  const renderFloatingObject = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ translateY: objY }] }}>
         <Rect 
            x={SIM_W/2 - activeObj.size/2} 
            y={0} 
            width={activeObj.size} 
            height={activeObj.size} 
            fill={activeObj.color} 
            rx={activeObj.id === 'cork' ? activeObj.size/2 : 4} 
         />
         {scientistMode && (
            <G transform={`translate(${SIM_W/2 + activeObj.size/2 + 10}, 0)`}>
               <Line x1={0} y1={activeObj.size/2} x2={0} y2={-30} stroke="#00E5FF" strokeWidth="2" />
               <Path d="M -5 -25 L 0 -30 L 5 -25" stroke="#00E5FF" strokeWidth="2" fill="none" />
               <Line x1={0} y1={activeObj.size/2} x2={0} y2={activeObj.size + 30} stroke="#FF3131" strokeWidth="2" />
               <Path d="M -5 30 L 0 35 L 5 30" stroke="#FF3131" strokeWidth="2" fill="none" transform={`translate(0, ${activeObj.size})`} />
            </G>
         )}
      </AnimatedG>
    );
  };

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="BUOYANT FORCE" value={stats.buoyancy.toFixed(3)} unit="N" color="#00E5FF" icon="arrow-up" />
        <StatusCard label="WEIGHT" value={stats.gravity.toFixed(3)} unit="N" color="#FF3131" icon="arrow-down" />
        <StatusCard label="STATUS" value={stats.status} unit="" color="#FFD166" icon="activity" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
        <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
          <Defs>
             <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={fluid.color.substring(0,7)} stopOpacity="0.6" />
                <Stop offset="1" stopColor={fluid.color.substring(0,7)} stopOpacity="0.2" />
             </SvgLinearGradient>
          </Defs>
          
          {/* Tank Outlines */}
          <Rect x={10} y={10} width={SIM_W-20} height={SIM_H-20} fill="none" stroke="#222" strokeWidth="2" rx={10} />
          
          {/* Fluid Body */}
          <Rect x={10} y={SIM_H * 0.4} width={SIM_W-20} height={SIM_H * 0.6 - 10} fill="url(#grad)" rx={1} />
          <Line x1={10} y1={SIM_H * 0.4} x2={SIM_W-10} y2={SIM_H * 0.4} stroke={fluid.color.substring(0,7)} strokeWidth="2" />

          {/* Floating Object */}
          {renderFloatingObject()}
          
          <SvgText x={20} y={SIM_H - 25} fill="#444" fontSize="10" fontFamily="monospace">Pressure: {(fluid.density * 9.81 * 0.5).toFixed(0)} Pa @ Floor</SvgText>
        </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>SELECT TEST OBJECT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compScroll}>
           {OBJECTS.map(o => (
              <TouchableOpacity key={o.id} onPress={() => { soundTap(); setActiveObj(o); }} style={[styles.compChip, activeObj.id === o.id && { borderColor: o.color }]}>
                 <Icon name={o.icon} size={18} color={activeObj.id === o.id ? o.color : '#666'} />
                 <Text style={[styles.compName, { color: activeObj.id === o.id ? o.color : '#666' }]}>{o.name}</Text>
              </TouchableOpacity>
           ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>CHANGING FLUID RECEPTACLE</Text>
        <View style={styles.fluidRow}>
           {FLUIDS.map(f => (
              <TouchableOpacity key={f.id} onPress={() => { soundWhoosh(); setFluid(f); }} style={[styles.fluidBtn, fluid.id === f.id && { backgroundColor: f.color.substring(0,7) }]}>
                 <Icon name={f.icon} size={16} color={fluid.id === f.id ? '#000' : '#666'} />
                 <Text style={[styles.fluidText, fluid.id === f.id && { color: '#000' }]}>{f.name}</Text>
              </TouchableOpacity>
           ))}
        </View>
      </View>

      {/* 4. Scientist Mode */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>ARCHIMEDES ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="Fb = ρ * V_disp * g" 
              description="Buoyant Force Principle" 
              value={`${fluid.density} * ${(submergedP.current * 100).toFixed(1)}% Vol * 9.81 = ${stats.buoyancy.toFixed(3)} N`}
              color="#00E5FF"
            />
            <ScientistCard 
              formula="P = ρ * g * h" 
              description="Hydrostatic Pressure Calculation" 
              value={`Fluid Pressure @ Depth: ${(fluid.density * 9.81 * (submergedP.current * 0.5)).toFixed(1)} Pascal`}
              color="#A855F7"
            />
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>BUOYANCY MISSIONS</Text>
         {CHALLENGES.map(c => (
           <ChallengeCard key={c.id} challenge={c} isDone={completedChallenges.includes(c.id)} />
         ))}
      </View>
      
      <View style={{ height: 100 }} />
    </View>
  );
}

// AnimatedG is now defined above the component (see top of file)

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4 },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  statusValue: { fontSize: 16, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvasWrap: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' },
  svg: { ...StyleSheet.absoluteFillObject },

  controlPanel: { marginTop: 20, gap: 16 },
  compScroll: { gap: 10 },
  compChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A1A1A', padding: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#333' },
  compName: { fontSize: 11, fontFamily: FONTS.displayBold },

  fluidRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fluidBtn: { flex: 1, minWidth: '30%', height: 40, borderRadius: 10, backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#333' },
  fluidText: { fontSize: 10, fontFamily: FONTS.displayBold, color: '#666' },

  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#444', letterSpacing: 2, marginBottom: 10, marginTop: 16 },
  scientistSection: { marginTop: 10 },
  sciGrid: { gap: 8 },
  sciCard: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 13, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 9, color: '#888', marginBottom: 6 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 11, fontFamily: 'monospace' },

  challengeSection: { marginTop: 10 },
  challCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#151515', padding: 12, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 1 },
  challIcon: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  challTitle: { fontSize: 12, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 10, color: '#666' }
});
