// ─────────────────────────────────────────────────────────
//  LAB: Special Relativity v2.0 (Extreme)
//  Relativistic Chronometer & Space-Time Warp
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

const VELOCITIES = [
  { val: 0.1, label: '0.1c', desc: 'Solar Sail Speed', color: '#39FF14' },
  { val: 0.5, label: '0.5c', desc: 'Inner System Jump', color: '#FFD166' },
  { val: 0.9, label: '0.9c', desc: 'Interstellar Cruise', color: '#00E5FF' },
  { val: 0.99, label: '0.99c', desc: 'Time Jumper', color: '#A855F7' },
  { val: 0.999, label: '0.999c', desc: 'Photon Barrier', color: '#FF3131' },
];

const CHALLENGES = [
  { id: 'time_skip', title: 'Century Jumper', desc: 'Achieve a speed where 100 years pass on Earth while you age < 10 years', icon: 'clock', color: '#FF3131' },
  { id: 'contract_king', title: 'The Shrinking Ship', desc: 'Contract your spaceship to < 10% of its normal length', icon: 'zap', color: '#A855F7' },
  { id: 'gamma_master', title: 'Gamma Master', desc: 'Reach a Lorentz Factor (γ) of 20 or higher', icon: 'shield', color: '#00E5FF' },
  { id: 'photon_edge', title: 'Edge of Light', desc: 'Operate at 0.999c velocity', icon: 'key', color: '#FFD166' },
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

export default function RelativityLab({ scientistMode = false, accentColor = '#A855F7' }) {
  const { isDark } = useTheme();
  
  // State
  const [velocity, setVelocity] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [earthTime, setEarthTime] = useState(0);
  const [shipTime, setShipTime] = useState(0);
  const [completedChallenges, setCompleted] = useState([]);
  
  // Anim Refs
  const shipPos = useRef(new Animated.Value(0)).current;
  const loopInterval = useRef(null);

  // ── Physics Calculations ───────────────────────────────

  const gamma = useMemo(() => {
    return 1 / Math.sqrt(1 - Math.pow(velocity, 2));
  }, [velocity]);

  const shipLength = useMemo(() => {
    // Length Contraction: L = L0 / gamma
    return 80 / gamma;
  }, [gamma]);

  // ── Engine ─────────────────────────────────────────────

  const startMission = () => {
    soundWhoosh();
    setRunning(true);
    setEarthTime(0);
    setShipTime(0);
    
    // Animate ship movement loop
    Animated.loop(
      Animated.timing(shipPos, {
        toValue: 1,
        duration: 2000 / gamma, // Move faster visually too
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    loopInterval.current = setInterval(() => {
      setEarthTime(prev => {
        const nextEarth = prev + 1;
        const nextShip = shipTime + (1 / gamma);
        setShipTime(nextShip);

        // Challenge Checks
        checkRelChallenges(nextEarth, nextShip);

        if (nextEarth >= 500) { // Limit sim
          stopMission();
          return 500;
        }
        return nextEarth;
      });
    }, 100);
  };

  const stopMission = () => {
    setRunning(false);
    clearInterval(loopInterval.current);
    shipPos.stopAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const checkRelChallenges = (eT, sT) => {
    const freshDone = [...completedChallenges];
    if (eT >= 100 && sT < 10 && !freshDone.includes('time_skip')) {
       freshDone.push('time_skip');
       soundTrophy();
    }
    if (shipLength < 8 && !freshDone.includes('contract_king')) {
       freshDone.push('contract_king');
       soundTrophy();
    }
    if (gamma >= 20 && !freshDone.includes('gamma_master')) {
       freshDone.push('gamma_master');
       soundTrophy();
    }
    if (velocity === 0.999 && !freshDone.includes('photon_edge')) {
       freshDone.push('photon_edge');
       soundTrophy();
    }
    if (freshDone.length > completedChallenges.length) setCompleted(freshDone);
  };

  useEffect(() => () => clearInterval(loopInterval.current), []);

  // ── Render Helpers ─────────────────────────────────────

  const renderShip = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ 
        transform: [{ 
          translateX: shipPos.interpolate({ inputRange: [0, 1], outputRange: [60, SIM_W - 100] }) 
        }] 
      }}>
         <Rect 
            x={0} y={SIM_H/2 - 10} 
            width={shipLength} height={20} 
            fill="#FFF" rx={4} 
         />
         <Rect x={shipLength-5} y={SIM_H/2 - 5} width={10} height={10} fill="#A855F7" rx={2} />
         {running && (
            <Path d={`M -20 -5 L 0 0 L -20 5`} fill="#FFF" opacity={0.5} transform="translate(0, 150)" />
         )}
      </AnimatedG>
    );
  };

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="EARTH PASSAGE" value={earthTime.toFixed(0)} unit="YRS" color="#00E5FF" icon="globe" />
        <StatusCard label="SHIP PASSAGE" value={shipTime.toFixed(1)} unit="YRS" color="#FFD166" icon="clock" />
        <StatusCard label="CONTRACTION" value={(100/gamma).toFixed(0)} unit="%" color="#A855F7" icon="target" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
        <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
          {/* Starfield */}
          {[...Array(20)].map((_, i) => (
             <Circle key={i} cx={Math.random() * SIM_W} cy={Math.random() * SIM_H} r={1} fill="#FFF" opacity={0.3} />
          ))}

          {/* Earth & Destination */}
          <G transform={`translate(40, ${SIM_H/2})`}>
             <Circle r={20} fill="#00E5FF20" stroke="#00E5FF" strokeWidth="2" />
             <SvgText y={35} x={-15} fill="#666" fontSize="8">EARTH</SvgText>
          </G>
          <G transform={`translate(${SIM_W-40}, ${SIM_H/2})`}>
             <Circle r={15} fill="#FF4D6D20" stroke="#FF4D6D" strokeWidth="2" />
             <SvgText y={30} x={-15} fill="#666" fontSize="8">ALPHA C.</SvgText>
          </G>

          {/* Relativistic Ship */}
          {renderShip()}
        </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>MISSION VELOCITY: {velocity}c</Text>
        <View style={styles.vOptions}>
           {VELOCITIES.map(v => (
             <TouchableOpacity 
               key={v.val} 
               onPress={() => { soundTap(); setVelocity(v.val); if(running) stopMission(); }} 
               style={[styles.vBtn, velocity === v.val && { borderColor: v.color, backgroundColor: v.color + '20' }]}
             >
                <Text style={[styles.vText, { color: velocity === v.val ? v.color : '#666' }]}>{v.label}</Text>
             </TouchableOpacity>
           ))}
        </View>

        <TouchableOpacity 
          onPress={running ? stopMission : startMission} 
          style={[styles.runBtn, { backgroundColor: running ? '#FF4D6D' : accentColor }]}
        >
          <Icon name={running ? 'square' : 'play'} size={20} color="#FFF" />
          <Text style={styles.runText}>{running ? 'END JUMP' : 'INITIATE JUMP'}</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Scientist Mode */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>RELATIVISTIC ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="γ = 1 / √(1 - v²/c²)" 
              description="Lorentz Transformation Factor" 
              value={`Current γ (Gamma): ${gamma.toFixed(4)}`}
              color="#A855F7"
            />
            <ScientistCard 
              formula="Δt' = Δt / γ" 
              description="Time Dilation Equation" 
              value={`Ship Time: ${shipTime.toFixed(2)} yrs / Earth Time: ${earthTime.toFixed(2)} yrs`}
              color="#FFD166"
            />
            <ScientistCard 
              formula="L = L0 / γ" 
              description="Lorentz Length Contraction" 
              value={`Proper Length: 80 units / Relativistic: ${shipLength.toFixed(1)} units`}
              color="#00E5FF"
            />
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>SPACE-TIME CHALLENGES</Text>
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
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayMedium, letterSpacing: 1 },
  statusValue: { fontSize: 16, fontFamily: FONTS.displayMedium, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvasWrap: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' },
  svg: { ...StyleSheet.absoluteFillObject },

  controlPanel: { marginTop: 20, gap: 16 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayMedium, color: '#444', letterSpacing: 2, marginBottom: 10, marginTop: 16 },
  vOptions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  vBtn: { flex: 1, minWidth: '28%', height: 40, borderRadius: 10, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  vText: { fontSize: 11, fontFamily: FONTS.displayMedium },

  runBtn: { height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  runText: { color: '#FFF', fontFamily: FONTS.displayMedium, fontSize: 15 },

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
  challTitle: { fontSize: 12, fontFamily: FONTS.displayMedium },
  challDesc: { fontSize: 10, color: '#666' }
});
