// ─────────────────────────────────────────────────────────
//  LAB: Quantum Basics v2.0 (Extreme)
//  The Probability Forge
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, { Circle, Rect, G, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

// ── Quantum Data ───────────────────────────────────────

const CHALLENGES = [
  { id: 'wave_fringe', title: 'Wave Master', desc: 'Create a perfect 5-fringe interference pattern', icon: 'wind', color: '#00D4FF' },
  { id: 'collapse_now', title: 'The Watcher', desc: 'Observe and collapse a wave mid-flight', icon: 'eye', color: '#FF3131' },
  { id: 'pure_probability', title: 'Probability Pro', desc: 'Fire 100 electrons in unobserved mode', icon: 'activity', color: '#A855F7' },
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

// ── AnimatedElectron must be defined before JSX use ───
const AnimatedElectron = Animated.createAnimatedComponent(Circle);

// ── Main Component ─────────────────────────────────────

export default function QuantumLab({ scientistMode = false }) {
  const { isDark } = useTheme();
  
  // State
  const [isObserving, setIsObserving] = useState(false);
  const [electronCount, setCount] = useState(0);
  const [amplitude, setAmplitude] = useState(1.0);
  const [completedChallenges, setCompleted] = useState([]);
  const [impacts, setImpacts] = useState([]); // [{x, y, opacity}]

  // Refs for animations
  const gunAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // ── Handlers ─────────────────────────────────────────

  const fireElectron = useCallback(() => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(prev => prev + 1);

    // Animate Electron Path
    gunAnim.setValue(0);
    Animated.timing(gunAnim, {
       toValue: 1,
       duration: 300,
       easing: Easing.linear,
       useNativeDriver: true
    }).start(() => {
       // Logic for Impact Point
       let impactX;
       if (isObserving) {
          // Particle Logic (Two Bands)
          impactX = Math.random() < 0.5 ? (SIM_W/2 - 40) : (SIM_W/2 + 40);
          impactX += (Math.random() - 0.5) * 20;
       } else {
          // Wave Logic (Interference Fringe)
          const fringes = [-80, -40, 0, 40, 80];
          impactX = SIM_W/2 + fringes[Math.floor(Math.random() * fringes.length)];
          impactX += (Math.random() - 0.5) * 15;
       }

       setImpacts(prev => [{ x: impactX, y: 300, id: Date.now() }, ...prev.slice(0, 50)]);
    });
  }, [isObserving]);

  useEffect(() => {
    // Challenge Logic
    if (electronCount >= 100 && !isObserving && !completedChallenges.includes('pure_probability')) {
      setCompleted(prev => [...prev, 'pure_probability']);
      soundTrophy();
    }
  }, [electronCount, isObserving]);

  // ── Render Helpers ────────────────────────────────────

  const renderInterferencePattern = () => {
    if (isObserving) return null;
    const paths = [];
    for(let i = 0; i < 5; i++) {
       paths.push(
         <Rect key={i} x={SIM_W/2 - 100 + (i*40)} y={300} width={20} height={10} fill="#00D4FF" opacity={0.3} />
       );
    }
    return paths;
  };

  // ── Main Render ───────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* 1. Metrics */}
      <View style={styles.header}>
         <StatusCard label="OBSERVER" value={isObserving ? 'ACTIVE' : 'OFF'} unit="" color={isObserving ? '#FF3131' : '#00D4FF'} icon="eye" />
         <StatusCard label="ELECTRONS" value={electronCount} unit="fired" color="#A855F7" icon="zap" />
         <StatusCard label="AMPLITUDE" value={amplitude.toFixed(1)} unit="ψ" color="#FFD166" icon="activity" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.simArea, { borderColor: isDark ? '#333' : '#ddd' }]}>
         <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
            {/* Background */}
            <Rect width={SIM_W} height={SIM_H} fill="#050505" />

            {/* Interference Pattern (Glow) */}
            {!isObserving && (
              <G opacity={0.2}>
                 {renderInterferencePattern()}
              </G>
            )}

            {/* Two Bands (Particle Mode) */}
            {isObserving && (
               <G opacity={0.3}>
                  <Rect x={SIM_W/2 - 50} y={300} width={20} height={10} fill="#FF3131" />
                  <Rect x={SIM_W/2 + 30} y={300} width={20} height={10} fill="#FF3131" />
               </G>
            )}

            {/* The Slits */}
            <Rect x={0} y={150} width={SIM_W/2 - 30} height={10} fill="#333" />
            <Rect x={SIM_W/2 + 30} y={150} width={SIM_W/2} height={10} fill="#333" />
            <Rect x={SIM_W/2 - 10} y={150} width={20} height={10} fill="#333" />

            {/* Impacts */}
            {impacts.map(impact => (
               <Circle key={impact.id} cx={impact.x} cy={impact.y} r={3} fill={isObserving ? '#FF3131' : '#00D4FF'} opacity={0.8} />
            ))}

            {/* Electron Wave/Particle Animation */}
            <AnimatedElectron 
               cx={SIM_W/2} 
               cy={gunAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 300] })} 
               r={isObserving ? 4 : 8}
               fill={isObserving ? '#FF3131' : '#00D4FF'}
               opacity={gunAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] })}
            />

            {/* The "Eye" Observer Icon Position */}
            {isObserving && (
               <G transform={`translate(${SIM_W/2 + 60}, 120)`}>
                  <Circle r={15} fill="#111" stroke="#FF3131" />
                  <Circle r={6} fill="#FF3131" />
               </G>
            )}

            <SvgText x={SIM_W/2} y={30} fill="#444" fontSize="10" textAnchor="middle" fontFamily="monospace">PROBABILITY FORGE UNIT v2.0</SvgText>
         </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controls}>
         <View style={styles.actionRow}>
            <TouchableOpacity 
               onPress={() => { setIsObserving(!isObserving); soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
               style={[styles.toggleBtn, { borderColor: isObserving ? '#FF3131' : '#444' }]}
            >
               <Icon name={isObserving ? 'eye' : 'eye-off'} size={20} color={isObserving ? '#FF3131' : '#888'} />
               <Text style={[styles.btnText, { color: isObserving ? '#FF3131' : '#888' }]}>{isObserving ? 'COLLAPSE WAVE' : 'OBSERVE'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={fireElectron} style={styles.fireBtn}>
               <Icon name="zap" size={20} color="#000" />
               <Text style={styles.fireBtnText}>FIRE ELECTRON</Text>
            </TouchableOpacity>
         </View>

         <View style={styles.sliderRow}>
            <Text style={styles.sectionTitle}>PROBABILITY AMPLITUDE (ψ)</Text>
            <View style={styles.sliderTrack}>
               <TouchableOpacity onPress={() => setAmplitude(Math.max(0.1, amplitude - 0.2))} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></TouchableOpacity>
               <View style={styles.barWrap}><View style={[styles.bar, { width: `${amplitude * 100}%` }]} /></View>
               <TouchableOpacity onPress={() => setAmplitude(Math.min(2.0, amplitude + 0.2))} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
         </View>
      </View>

      {/* 4. Scientist Mode */}
      {scientistMode && (
        <View style={styles.sciSection}>
           <Text style={styles.sectionTitle}>WAVEFUNCTION ANALYTICS</Text>
           <View style={styles.sciGrid}>
              <ScientistCard 
                 formula="|ψ(x,t)|²" 
                 description="Probability Density" 
                 value={isObserving ? "Dirac Delta Distribution" : "Sine Interference Matrix"}
                 color="#00D4FF"
              />
              <ScientistCard 
                 formula="Δx Δp ≥ h/4π" 
                 description="Heisenberg Constraint" 
                 value={`Uncertainty Index: ${isObserving ? 'Critical Collapse' : 'Stable Wave'}`}
                 color="#FFD166"
              />
           </View>
        </View>
      )}

      {/* 5. Missions */}
      <View style={styles.missionSection}>
         <Text style={styles.sectionTitle}>QUANTUM MISSIONS</Text>
         {CHALLENGES.map(c => (
            <View key={c.id} style={[styles.challItem, { borderColor: completedChallenges.includes(c.id) ? c.color : '#222' }]}>
               <Icon name={completedChallenges.includes(c.id) ? 'check' : c.icon} size={14} color={completedChallenges.includes(c.id) ? c.color : '#444'} />
               <View>
                  <Text style={[styles.challTitle, { color: completedChallenges.includes(c.id) ? c.color : '#888' }]}>{c.title}</Text>
                  <Text style={styles.challDesc}>{c.desc}</Text>
               </View>
            </View>
         ))}
      </View>

      <View style={{ height: 100 }} />
    </View>
  );
}

// AnimatedElectron is now defined above the component (see top of file)

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4, borderWidth: 1, borderColor: '#222' },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  statusValue: { fontSize: 13, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  simArea: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#000', overflow: 'hidden' },
  svg: { ...StyleSheet.absoluteFillObject },

  controls: { marginTop: 24 },
  actionRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#111' },
  fireBtn: { flex: 1.5, flexDirection: 'row', height: 50, borderRadius: 25, backgroundColor: '#00D4FF', alignItems: 'center', justifyContent: 'center', gap: 10 },
  fireBtnText: { fontSize: 12, fontFamily: FONTS.displayBold, color: '#000' },
  btnText: { fontSize: 10, fontFamily: FONTS.displayBold },

  sliderRow: { marginTop: 24 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#444', letterSpacing: 2, marginBottom: 12 },
  sliderTrack: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#FFF', fontSize: 18 },
  barWrap: { flex: 1, height: 6, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#00D4FF' },

  sciSection: { marginTop: 24 },
  sciGrid: { gap: 10 },
  sciCard: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 9, color: '#888', marginBottom: 8 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 11, fontFamily: 'monospace' },

  missionSection: { marginTop: 24 },
  challItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8 },
  challTitle: { fontSize: 12, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 10, color: '#666' }
});
