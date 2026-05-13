// ─────────────────────────────────────────────────────────
//  LAB: Magnetism & Electromagnetism v2.0 (Extreme)
//  Lorentz Force Particle Accelerator & B-Field Simulator
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, { Rect, Path, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 320;

// ── Particle Data & Config ──────────────────────────────

const PARTICLES = [
  { id: 'electron', name: 'Electron', mass: 1, charge: -1, color: '#00E5FF', icon: 'zap' },
  { id: 'proton', name: 'Proton', mass: 1836, charge: 1, color: '#FF4D6D', icon: 'power' },
  { id: 'alpha', name: 'Alpha Particle', mass: 7294, charge: 2, color: '#FFD166', icon: 'target' },
  { id: 'ion', name: 'Heavy Ion', mass: 20000, charge: 10, color: '#A855F7', icon: 'shield' },
  { id: 'neutron', name: 'Neutron', mass: 1838, charge: 0, color: '#888', icon: 'circle' },
];

const B_FIELDS = [0, 0.5, 1.0, 5.0, 10.0, -5.0];

const CHALLENGES = [
  { id: 'ghost', title: 'Ghost Particle', desc: 'Shoot a Neutron unaffected by magnetic fields', icon: 'eye-off', color: '#888' },
  { id: 'spiral', title: 'Cyclotron Trap', desc: 'Trap an Electron in a tight spiral orbit', icon: 'refresh-cw', color: '#00E5FF' },
  { id: 'repulse', title: 'The Repulsor', desc: 'Reverse the B-Field to deflect a Proton left', icon: 'arrow-left', color: '#FF4D6D' },
  { id: 'mass_driver', title: 'Mass Driver', desc: 'Fire a Heavy Ion at max velocity', icon: 'truck', color: '#A855F7' },
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

// ── Main Simulation Component ───────────────────────────

export default function MagnetismLab({ scientistMode = false, accentColor = '#00E5FF' }) {
  const { isDark } = useTheme();
  
  // State
  const [bField, setBField] = useState(1.0);
  const [velocity, setVelocity] = useState(50);
  const [selectedParticle, setSelectedParticle] = useState(PARTICLES[0]);
  const [firing, setFiring] = useState(false);
  const [paths, setPaths] = useState([]); // Array of { d, color }
  const [completedChallenges, setCompleted] = useState([]);
  
  // Physics Refs
  const interval = useRef(null);
  const posRef = useRef({ x: SIM_W/2, y: SIM_H - 40, vx: 0, vy: -5 });
  const pathRef = useRef('');

  // ── Physics Engine ─────────────────────────────────────

  const calculateLorentz = useCallback(() => {
    if (!firing) return;

    const q = selectedParticle.charge;
    const m = selectedParticle.mass;
    const DT = 0.5;

    // F = q(v x B)
    // In our 2D plane with B coming OUT of screen (Z axis):
    // ax = (q * vy * B) / m
    // ay = (-q * vx * B) / m
    
    // Scaling for visualization
    const SCALE_B = bField * 0.1;
    const vMag = velocity * 0.1;

    let { x, y, vx, vy } = posRef.current;

    const ax = (q * vy * SCALE_B) / (m / 100);
    const ay = (-q * vx * SCALE_B) / (m / 100);

    vx += ax * DT;
    vy += ay * DT;
    x += vx * DT;
    y += vy * DT;

    posRef.current = { x, y, vx, vy };
    pathRef.current += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;

    // Boundary check
    if (x < 0 || x > SIM_W || y < 0 || y > SIM_H) {
      stopFiring();
      checkChallengesInternal();
    }
  }, [firing, selectedParticle, bField, velocity]);

  const startFiring = () => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    pathRef.current = `M ${SIM_W/2} ${SIM_H - 40}`;
    posRef.current = { 
      x: SIM_W/2, 
      y: SIM_H - 40, 
      vx: 0, 
      vy: -velocity * 0.1 
    };
    setPaths([]);
    setFiring(true);
  };

  const stopFiring = () => {
    setFiring(false);
    clearInterval(interval.current);
    setPaths(prev => [...prev.slice(-4), { d: pathRef.current, color: selectedParticle.color }]);
  };

  const checkChallengesInternal = () => {
    const freshDone = [...completedChallenges];
    if (selectedParticle.id === 'neutron' && !freshDone.includes('ghost')) {
      freshDone.push('ghost');
      soundTrophy();
    }
    const r = (selectedParticle.mass * velocity) / (Math.abs(selectedParticle.charge) * bField || 1);
    if (selectedParticle.id === 'electron' && bField >= 5.0 && !freshDone.includes('spiral')) {
      freshDone.push('spiral');
      soundTrophy();
    }
    if (selectedParticle.id === 'proton' && bField < 0 && !freshDone.includes('repulse')) {
      freshDone.push('repulse');
      soundTrophy();
    }
    if (selectedParticle.id === 'ion' && velocity >= 90 && !freshDone.includes('mass_driver')) {
      freshDone.push('mass_driver');
      soundTrophy();
    }
    if (freshDone.length > completedChallenges.length) setCompleted(freshDone);
  };

  useEffect(() => {
    if (firing) {
      interval.current = setInterval(calculateLorentz, 16);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [firing, calculateLorentz]);

  // ── Render ─────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="CHARGE" value={selectedParticle.charge.toString()} unit="q" color={selectedParticle.color} icon="zap" />
        <StatusCard label="MAGNETIC FIELD" value={bField.toFixed(1)} unit="T" color="#00E5FF" icon="magnet" />
        <StatusCard label="VELOCITY" value={velocity.toString()} unit="% c" color="#FFD166" icon="fast-forward" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
        <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
          {/* Injector Base */}
          <Rect x={SIM_W/2 - 15} y={SIM_H - 40} width={30} height={40} fill="#222" rx={5} />
          
          {/* Field Patterns (Dots/Crosses) */}
          {[...Array(12)].map((_, i) => (
            <SvgText 
              key={i} 
              x={(i % 4) * (SIM_W/4) + 30} 
              y={Math.floor(i / 4) * (SIM_H/4) + 40} 
              fill={bField >= 0 ? '#00E5FF40' : '#FF4D6D40'} 
              fontSize="12"
            >
              {bField > 0 ? '•' : bField < 0 ? 'x' : ''}
            </SvgText>
          ))}

          {/* Paths */}
          {paths.map((p, i) => (
            <Path key={i} d={p.d} stroke={p.color} strokeWidth="2" fill="none" opacity={0.4} />
          ))}
          {firing && <Path d={pathRef.current} stroke={selectedParticle.color} strokeWidth="3" fill="none" />}
        </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>PARTICLE INJECTOR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compScroll}>
          {PARTICLES.map(p => (
            <TouchableOpacity 
              key={p.id} 
              onPress={() => { soundTap(); setSelectedParticle(p); }}
              style={[styles.compChip, selectedParticle.id === p.id && { borderColor: p.color, backgroundColor: p.color + '15' }]}
            >
              <Icon name={p.icon} size={18} color={selectedParticle.id === p.id ? p.color : '#666'} />
              <Text style={[styles.compName, { color: selectedParticle.id === p.id ? p.color : '#666' }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.configRow}>
           <View style={{ flex: 1 }}>
              <Text style={styles.sliderLabel}>MAG FIELD (TESTLA): {bField}T</Text>
              <View style={styles.vOptions}>
                 {B_FIELDS.map(f => (
                   <TouchableOpacity key={f} onPress={() => { soundTap(); setBField(f); }} style={[styles.vBtn, bField === f && styles.vBtnActive]}>
                      <Text style={[styles.vText, bField === f && { color: '#000' }]}>{f}</Text>
                   </TouchableOpacity>
                 ))}
              </View>
           </View>
           <TouchableOpacity 
             onPress={firing ? stopFiring : startFiring} 
             style={[styles.runBtn, { backgroundColor: firing ? '#FF4D6D' : accentColor }]}
           >
             <Icon name={firing ? 'square' : 'play'} size={20} color="#FFF" />
             <Text style={styles.runText}>{firing ? 'ABORT' : 'FIRE'}</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.velocityRow}>
            <Text style={styles.sliderLabel}>VELOCITY: {velocity}% c</Text>
            <View style={styles.vOptions}>
               {[10, 50, 90, 99].map(v => (
                 <TouchableOpacity key={v} onPress={() => { soundTap(); setVelocity(v); }} style={[styles.vBtn, velocity === v && styles.vBtnActive]}>
                    <Text style={[styles.vText, velocity === v && { color: '#000' }]}>{v}%</Text>
                 </TouchableOpacity>
               ))}
            </View>
        </View>
      </View>

      {/* 4. Scientist Mode Analytics */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>SCIENTIFIC ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="F = q(v × B)" 
              description="Lorentz Force (Vector Cross Product)" 
              value={`${selectedParticle.charge} * (${velocity} * ${bField}) = Force Vector`}
              color={selectedParticle.color}
            />
            <ScientistCard 
              formula="r = mv / qB" 
              description="Cyclotron Radius (Curvature)" 
              value={`Calculated Radius: ${((selectedParticle.mass * velocity) / (Math.abs(selectedParticle.charge) * bField || 0.01)).toFixed(2)} units`}
              color="#FFD166"
            />
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>LAB CHALLENGES</Text>
         <View style={styles.challGrid}>
           {CHALLENGES.map(c => (
             <ChallengeCard key={c.id} challenge={c} isDone={completedChallenges.includes(c.id)} />
           ))}
         </View>
      </View>
      
      <View style={{ height: 100 }} />
    </View>
  );
}

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
  svgLabel: { fontSize: 8, fontFamily: 'monospace' },

  controlPanel: { marginTop: 20, gap: 16 },
  compScroll: { gap: 10 },
  compChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A1A1A', padding: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#333' },
  compName: { fontSize: 11, fontFamily: FONTS.displayBold },

  configRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  velocityRow: { marginTop: 10 },
  sliderLabel: { fontSize: 9, color: '#666', marginBottom: 6, fontFamily: FONTS.displayBold, textTransform: 'uppercase' },
  vOptions: { flexDirection: 'row', gap: 6 },
  vBtn: { flex: 1, height: 35, borderRadius: 8, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  vBtnActive: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },
  vText: { fontSize: 10, color: '#888', fontWeight: 'bold' },

  runBtn: { flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50, borderRadius: RADIUS.md },
  runText: { color: '#FFF', fontFamily: FONTS.displayBold, fontSize: 15 },

  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#555', letterSpacing: 2, marginBottom: 12, marginTop: 20 },
  scientistSection: { marginTop: 10 },
  sciGrid: { gap: 10 },
  sciCard: { padding: 15, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 14, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 10, color: '#999', marginBottom: 6 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 12, fontFamily: 'monospace' },

  challengeSection: { marginTop: 10 },
  challGrid: { gap: 8 },
  challCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#151515', padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  challIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  challTitle: { fontSize: 13, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 10, color: '#666' }
});
