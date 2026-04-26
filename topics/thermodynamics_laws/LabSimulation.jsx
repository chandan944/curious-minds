// ─────────────────────────────────────────────────────────
//  LAB: Thermodynamics v2.0 (Extreme)
//  The Adiabatic Engine
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing, PanResponder
} from 'react-native';
import Svg, {
  Circle, Path, Rect, G, Line, Polyline, Defs, RadialGradient, Stop,
  Text as SvgText, LinearGradient as SvgLinearGradient
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 360;

// ── Physics Constants ─────────────────────────────────

const PARTICLE_COUNT = 15;
const INITIAL_V = 200; // Pixels from top
const MIN_V = 60;
const MAX_V = 300;

const CHALLENGES = [
  { id: 'adiabatic_spike', title: 'Adiabatic Spike', desc: 'Compress gas quickly to reach > 500K', icon: 'zap', color: '#FF3131' },
  { id: 'perfect_isotherm', title: 'Isothermal Path', desc: 'Expand volume while keeping Temp stable', icon: 'activity', color: '#00D4FF' },
  { id: 'work_master', title: 'Workhorse', desc: 'Generate 1000J of total Work (W)', icon: 'cpu', color: '#A855F7' },
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

// ── Particle Simulation Logic ──────────────────────────

class Particle {
  constructor(w, h, pY) {
    this.x = Math.random() * (w - 20) + 10;
    this.y = Math.random() * (h - pY - 20) + pY + 10;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.r = 4;
  }
}

// ── Main Component ─────────────────────────────────────

export default function ThermodynamicsLab({ scientistMode = false }) {
  const { isDark } = useTheme();
  
  // State
  const [pistonY, setPistonY] = useState(INITIAL_V);
  const [temp, setTemp] = useState(300); // Kelvin
  const [pressure, setPressure] = useState(1.0); // atm
  const [history, setHistory] = useState([]); // [{V, P}]
  const [completedChallenges, setCompleted] = useState([]);
  const [totalWork, setTotalWork] = useState(0);

  // Derived
  const volume = SIM_H - pistonY;
  
  // Ref for continuous animation
  const reqRef = useRef(null);
  const particles = useRef([]);

  // ── Physics Engine Loop ────────────────────────────────

  useEffect(() => {
    // Initialize Particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => new Particle(SIM_W, SIM_H, pistonY));

    const loop = () => {
      particles.current.forEach(p => {
        // Update velocity based on Temp
        const speedMultiplier = Math.sqrt(temp / 300);
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Collision detection
        if (p.x < 10 || p.x > SIM_W - 10) p.vx *= -1;
        if (p.y > SIM_H - 10) p.vy *= -1;
        if (p.y < pistonY + 10) {
           p.vy *= -1;
           p.y = pistonY + 10;
        }
      });
      reqRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(reqRef.current);
  }, [pistonY, temp]);

  // ── Handlers ─────────────────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(MIN_V, Math.min(MAX_V, INITIAL_V + gestureState.dy));
        
        // Physics: Ideal Gas Law simplified (P V = n R T)
        // If we compress (V down), we assume Adiabatic if moving fast
        setPistonY(prev => {
           const dy = newY - prev;
           if (Math.abs(dy) > 1) {
              // Work done on gas (Adiabatic approximation)
              const dV = -dy;
              const dW = pressure * dV * 0.1;
              setTemp(t => Math.max(10, t + dW * 2));
              setTotalWork(w => w + Math.abs(dW));
           }
           return newY;
        });

        setPressure( (300 / volume) * (temp / 300) );
      },
      onPanResponderRelease: () => {
         checkChallenges();
      }
    })
  ).current;

  const checkChallenges = () => {
    const list = [...completedChallenges];
    if (temp > 500 && !list.includes('adiabatic_spike')) list.push('adiabatic_spike');
    if (totalWork > 1000 && !list.includes('work_master')) list.push('work_master');
    
    if (list.length > completedChallenges.length) {
       setCompleted(list);
       soundTrophy();
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const adjustHeat = (delta) => {
    soundTap();
    setTemp(t => Math.max(10, t + delta));
    setPressure( (150 / volume) * ( (temp + delta) / 300 ) );
  };

  // ── Graph ───────────────────────────────────────────

  useEffect(() => {
     setHistory(prev => [...prev.slice(-30), { v: volume, p: pressure }]);
  }, [volume, pressure]);

  // ── Render ──────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* 1. Metrics */}
      <View style={styles.header}>
         <StatusCard label="TEMPERATURE" value={temp.toFixed(0)} unit="K" color="#FF3131" icon="zap" />
         <StatusCard label="PRESSURE" value={pressure.toFixed(2)} unit="atm" color="#00D4FF" icon="activity" />
         <StatusCard label="VOLUME" value={volume.toFixed(0)} unit="L" color="#A855F7" icon="layers" />
      </View>

      {/* 2. Simulation Piston Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <RadialGradient id="gasGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={temp > 400 ? '#FF3131' : '#00D4FF'} stopOpacity="0.1" />
                  <Stop offset="1" stopColor="#000" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            <Rect width={SIM_W} height={SIM_H} fill="#050505" />
            
            {/* Gas Glow */}
            <Rect x={0} y={pistonY} width={SIM_W} height={volume} fill="url(#gasGlow)" />

            {/* Particles */}
            {particles.current.map((p, i) => (
               <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={temp > 400 ? '#FF3131' : '#00D4FF'} opacity={0.6} />
            ))}

            {/* Piston Head */}
            <G {...panResponder.panHandlers}>
               <Rect x={10} y={pistonY} width={SIM_W - 20} height={20} fill="#333" rx={5} stroke="#FFF" strokeWidth="1" />
               {/* Piston Handle */}
               <Rect x={SIM_W/2 - 10} y={pistonY - 60} width={20} height={60} fill="#222" stroke="#444" />
               <Rect x={SIM_W/2 - 25} y={pistonY - 70} width={50} height={10} fill="#444" rx={5} />
            </G>

            {/* Boundary */}
            <Path d={`M 10,0 L 10,${SIM_H} L ${SIM_W - 10},${SIM_H} L ${SIM_W - 10},0`} fill="none" stroke="#444" strokeWidth="2" />

            {/* Scale Markings */}
            <SvgText x={25} y={MIN_V + 20} fill="#444" fontSize="8" fontFamily="monospace">MIN VOL</SvgText>
            <SvgText x={25} y={MAX_V + 20} fill="#444" fontSize="8" fontFamily="monospace">MAX VOL</SvgText>
         </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controls}>
         <Text style={styles.sectionTitle}>EXTERNAL THERMAL CONTROL</Text>
         <View style={styles.btnRow}>
            <TouchableOpacity onPress={() => adjustHeat(50)} style={[styles.ctrlBtn, { borderColor: '#FF3131' }]}>
               <Icon name="sun" size={18} color="#FF3131" />
               <Text style={styles.btnText}>ADD HEAT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => adjustHeat(-50)} style={[styles.ctrlBtn, { borderColor: '#00D4FF' }]}>
               <Icon name="snowflake" size={18} color="#00D4FF" />
               <Text style={styles.btnText}>REFRIGERATE</Text>
            </TouchableOpacity>
         </View>
      </View>

      {/* 4. Scientist Analytics (Graph) */}
      {scientistMode && (
        <View style={styles.sciSection}>
           <Text style={styles.sectionTitle}>P-V INDICATOR DIAGRAM</Text>
           <View style={styles.graphCard}>
              <Svg width={SIM_W - 32} height={120}>
                 <Line x1="20" y1="10" x2="20" y2="100" stroke="#444" strokeWidth="1" />
                 <Line x1="20" y1="100" x2={SIM_W - 50} y2="100" stroke="#444" strokeWidth="1" />
                 <Polyline 
                    points={history.map((h, i) => `${20 + (h.v/MAX_V)*(SIM_W-80)},${100 - (h.p/5)*90}`).join(' ')} 
                    fill="none" stroke="#39FF14" strokeWidth="2" 
                 />
                 <SvgText x={10} y={15} fill="#444" fontSize="8">P</SvgText>
                 <SvgText x={SIM_W - 60} y={115} fill="#444" fontSize="8">V</SvgText>
              </Svg>
              <View style={styles.sciMetrics}>
                 <ScientistCard 
                    formula="PV = nRT" 
                    description="Ideal Gas State" 
                    value={`R_n: ${(pressure * volume / temp).toFixed(3)}`}
                    color="#FF9F1C"
                 />
                 <ScientistCard 
                    formula="W = ∫ P dV" 
                    description="Work Performed" 
                    value={`Sum W: ${totalWork.toFixed(0)} J`}
                    color="#A855F7"
                 />
              </View>
           </View>
        </View>
      )}

      {/* 5. Missions */}
      <View style={styles.missionSection}>
         <Text style={styles.sectionTitle}>ENTROPY MISSIONS</Text>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {CHALLENGES.map(c => (
               <View key={c.id} style={[styles.challCard, { borderColor: completedChallenges.includes(c.id) ? c.color : '#222' }]}>
                  <View style={[styles.challIcon, { backgroundColor: completedChallenges.includes(c.id) ? c.color : '#1A1A1A' }]}>
                     <Icon name={completedChallenges.includes(c.id) ? 'check' : c.icon} size={14} color={completedChallenges.includes(c.id) ? '#FFF' : '#444'} />
                  </View>
                  <View>
                     <Text style={[styles.challTitle, { color: completedChallenges.includes(c.id) ? c.color : '#EEE' }]}>{c.title}</Text>
                     <Text style={styles.challDesc}>{c.desc}</Text>
                  </View>
               </View>
            ))}
         </ScrollView>
      </View>

      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4, borderWidth: 1, borderColor: '#222' },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  statusValue: { fontSize: 13, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvasWrap: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#000', overflow: 'hidden' },
  
  controls: { marginTop: 24 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#444', letterSpacing: 2, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 12 },
  ctrlBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, backgroundColor: '#111', borderWidth: 1 },
  btnText: { color: '#FFF', fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 },

  sciSection: { marginTop: 24 },
  graphCard: { backgroundColor: '#111', padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#222' },
  sciMetrics: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sciCard: { flex: 1, padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 10, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 8, color: '#666', marginBottom: 6 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 10, fontFamily: 'monospace' },

  missionSection: { marginTop: 24 },
  scroll: { gap: 12 },
  challCard: { width: 220, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  challIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  challTitle: { fontSize: 11, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 9, color: '#666' }
});
