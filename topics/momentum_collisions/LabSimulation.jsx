// ─────────────────────────────────────────────────────────
//  LAB: Momentum & Collisions v2.0 (Extreme)
//  Billiard Physics Engine & Conservation of P
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, {
  Circle, Line, Rect, Path, Defs, RadialGradient, Stop, G, Text as SvgText
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

const OBJECT_TYPES = [
  { id: 'marble', name: 'Marble', mass: 1, color: '#00E5FF', radius: 10, icon: 'circle' },
  { id: 'steel', name: 'Steel Ball', mass: 5, color: '#888', radius: 15, icon: 'shield' },
  { id: 'billiard', name: 'Billiard', mass: 2, color: '#FF3131', radius: 12, icon: 'target' },
  { id: 'truck', name: 'Lead Block', mass: 20, color: '#A855F7', radius: 25, icon: 'square' },
];

const COLLISION_TYPES = [
  { id: 'elastic', name: 'Elastic', e: 1.0, icon: 'corner-down-right' },
  { id: 'inelastic', name: 'Inelastic', e: 0.1, icon: 'activity' },
];

const CHALLENGES = [
  { id: 'perfect_bounce', title: 'Perfect Bounce', desc: 'Perform a head-on Elastic collision between equal masses', icon: 'repeat', color: '#00E5FF' },
  { id: 'heavy_hit', title: 'Momentum Transfer', desc: 'Hit a stationary heavy block with a light marble', icon: 'zap', color: '#FFD166' },
  { id: 'crunch', title: 'Thermal Waste', desc: 'Trigger a max-speed Inelastic crash', icon: 'fire', color: '#FF3131' },
  { id: 'total_p', title: 'Conserver', desc: 'Maintain system momentum for 5+ collisions', icon: 'shield', color: '#A855F7' },
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

export default function MomentumLab({ scientistMode = false, accentColor = '#FF3131' }) {
  const { isDark } = useTheme();
  
  // State
  const [objects, setObjects] = useState([
    { id: 0, type: OBJECT_TYPES[0], x: 60, y: SIM_H/2, vx: 5, vy: 0 },
    { id: 1, type: OBJECT_TYPES[2], x: SIM_W - 60, y: SIM_H/2, vx: -2, vy: 0 }
  ]);
  const [collType, setCollType] = useState(COLLISION_TYPES[0]); // Elastic
  const [running, setRunning] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [forceLog, setForceLog] = useState([]);

  // Refs
  const interval = useRef(null);
  const objectsRef = useRef(objects);

  // ── Physics Engine ─────────────────────────────────────

  const resolveCollision = (o1, o2) => {
    const dx = o2.x - o1.x;
    const dy = o2.y - o1.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if (distance < o1.type.radius + o2.type.radius) {
       // Collision detected
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       
       const nx = dx / distance;
       const ny = dy / distance;
       
       const relativeVelocityX = o1.vx - o2.vx;
       const relativeVelocityY = o1.vy - o2.vy;
       
       const velocityInNormal = relativeVelocityX * nx + relativeVelocityY * ny;
       
       if (velocityInNormal < 0) return; // Already moving apart

       const e = collType.e;
       const impulseMag = -(1 + e) * velocityInNormal / (1/o1.type.mass + 1/o2.type.mass);
       
       const impulseX = impulseMag * nx;
       const impulseY = impulseMag * ny;
       
       o1.vx += impulseX / o1.type.mass;
       o1.vy += impulseY / o1.type.mass;
       o2.vx -= impulseX / o2.type.mass;
       o2.vy -= impulseY / o2.type.mass;

       // Challenge Logic
       checkCollChallenges(o1, o2, impulseMag);
    }
  };

  const checkCollChallenges = (o1, o2, mag) => {
    const freshDone = [...completedChallenges];
    if (collType.id === 'elastic' && o1.type.mass === o2.type.mass && !freshDone.includes('perfect_bounce')) {
      freshDone.push('perfect_bounce');
      soundTrophy();
    }
    if (o2.type.mass >= 15 && !freshDone.includes('heavy_hit')) {
      freshDone.push('heavy_hit');
      soundTrophy();
    }
    if (collType.id === 'inelastic' && mag > 10 && !freshDone.includes('crunch')) {
      freshDone.push('crunch');
      soundTrophy();
    }
    if (freshDone.length > completedChallenges.length) setCompleted(freshDone);
  };

  const step = useCallback(() => {
    const newObjs = [...objectsRef.current];
    
    // Move
    newObjs.forEach(o => {
      o.x += o.vx;
      o.y += o.vy;
      
      // Wall Bounce
      if (o.x < o.type.radius || o.x > SIM_W - o.type.radius) {
        o.vx *= -1;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (o.y < o.type.radius || o.y > SIM_H - o.type.radius) {
        o.vy *= -1;
      }
    });

    // Check Pairwise Collisions
    for (let i = 0; i < newObjs.length; i++) {
      for (let j = i + 1; j < newObjs.length; j++) {
        resolveCollision(newObjs[i], newObjs[j]);
      }
    }

    objectsRef.current = newObjs;
    setObjects([...newObjs]);
  }, [collType]);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(step, 16);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [running, step]);

  // ── Stats ───────────────────────────────────────────────

  const systemStats = useMemo(() => {
    let totalP = 0;
    let totalKE = 0;
    objects.forEach(o => {
      const v = Math.sqrt(o.vx*o.vx + o.vy*o.vy);
      totalP += o.type.mass * v;
      totalKE += 0.5 * o.type.mass * v * v;
    });
    return { p: totalP, ke: totalKE };
  }, [objects]);

  // ── Interactions ────────────────────────────────────────

  const toggleRun = () => {
    soundTap();
    setRunning(!running);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const reset = () => {
    soundWhoosh();
    setRunning(false);
    objectsRef.current = [
      { id: 0, type: OBJECT_TYPES[0], x: 60, y: SIM_H/2, vx: 5, vy: 0 },
      { id: 1, type: OBJECT_TYPES[2], x: SIM_W - 60, y: SIM_H/2, vx: -2, vy: 0 }
    ];
    setObjects([...objectsRef.current]);
  };

  const changeType = (idx, type) => {
    soundTap();
    const newObjs = [...objects];
    newObjs[idx].type = type;
    setObjects(newObjs);
    objectsRef.current = newObjs;
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="TOTAL MOMENTUM" value={systemStats.p.toFixed(1)} unit="p" color="#00E5FF" icon="repeat" />
        <StatusCard label="KINETIC ENERGY" value={systemStats.ke.toFixed(0)} unit="J" color="#FF3131" icon="zap" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
        <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
          {/* Grid lines */}
          {[1,2,3].map(i => <Line key={i} x1={i * (SIM_W/4)} y1={0} x2={i * (SIM_W/4)} y2={SIM_H} stroke="#111" strokeWidth="1" />)}
          {[1,2].map(i => <Line key={i} x1={0} y1={i * (SIM_H/3)} x2={SIM_W} y2={i * (SIM_H/3)} stroke="#111" strokeWidth="1" />)}

          {objects.map(o => (
            <G key={o.id}>
              <Circle cx={o.x} cy={o.y} r={o.type.radius} fill={o.type.color} />
              {/* Velocity Vector */}
              {running && (
                <Line 
                   x1={o.x} y1={o.y} 
                   x2={o.x + (o.vx * 10)} y2={o.y + (o.vy * 10)} 
                   stroke={o.type.color} strokeWidth="2"
                />
              )}
            </G>
          ))}
        </Svg>
      </View>

      {/* 3. Controls */}
      <View style={styles.controlPanel}>
        <View style={styles.topControls}>
           <TouchableOpacity onPress={toggleRun} style={[styles.runBtn, { backgroundColor: running ? '#FF4D6D' : accentColor }]}>
              <Icon name={running ? 'pause' : 'play'} size={20} color="#FFF" />
              <Text style={styles.runText}>{running ? 'PAUSE' : 'LAUNCH'}</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={reset} style={styles.resetBtn}>
              <Icon name="refresh-cw" size={18} color="#666" />
           </TouchableOpacity>
        </View>

        <View style={styles.configArea}>
           <Text style={styles.sectionTitle}>COLLISION TYPE</Text>
           <View style={styles.row}>
              {COLLISION_TYPES.map(t => (
                <TouchableOpacity key={t.id} onPress={() => { soundTap(); setCollType(t); }} style={[styles.typeBtn, collType.id === t.id && styles.typeBtnActive]}>
                   <Icon name={t.icon} size={14} color={collType.id === t.id ? '#000' : '#666'} />
                   <Text style={[styles.typeText, collType.id === t.id && { color: '#000' }]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <Text style={styles.sectionTitle}>REPLACE OBJECTS</Text>
           <View style={styles.objectSwapRow}>
               <View style={styles.swapSide}>
                  <Text style={styles.swapLabel}>OBJ 1</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swapScroll}>
                     {OBJECT_TYPES.map(t => (
                        <TouchableOpacity key={t.id} onPress={() => changeType(0, t)} style={[styles.miniChip, objects[0].type.id === t.id && { borderColor: t.color }]}>
                           <Icon name={t.icon} size={12} color={objects[0].type.id === t.id ? t.color : '#444'} />
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>
               <View style={styles.swapSide}>
                  <Text style={styles.swapLabel}>OBJ 2</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swapScroll}>
                     {OBJECT_TYPES.map(t => (
                        <TouchableOpacity key={t.id} onPress={() => changeType(1, t)} style={[styles.miniChip, objects[1].type.id === t.id && { borderColor: t.color }]}>
                           <Icon name={t.icon} size={12} color={objects[1].type.id === t.id ? t.color : '#444'} />
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>
           </View>
        </View>
      </View>

      {/* 4. Scientist Mode */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>SCIENTIFIC ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="Σp_initial = Σp_final" 
              description="Conservation of System Momentum" 
              value={`Total Momentum: ${systemStats.p.toFixed(3)} kg·m/s`}
              color="#00E5FF"
            />
            <ScientistCard 
              formula="J = Δp = F * Δt" 
              description="Impulse & Crash Dynamics" 
              value={`Elasticity Ratio: ${collType.e * 100}% Recovery`}
              color="#FFD166"
            />
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>CRASH CHALLENGES</Text>
         {CHALLENGES.map(c => (
           <ChallengeCard key={c.id} challenge={c} isDone={completedChallenges.includes(c.id)} />
         ))}
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

  controlPanel: { marginTop: 20, gap: 16 },
  topControls: { flexDirection: 'row', gap: 10 },
  runBtn: { flex: 1, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  runText: { color: '#FFF', fontFamily: FONTS.displayBold, fontSize: 14 },
  resetBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },

  configArea: { marginTop: 10 },
  row: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
  typeBtnActive: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  typeText: { fontSize: 11, fontFamily: FONTS.displayBold, color: '#666' },

  objectSwapRow: { flexDirection: 'row', gap: 10 },
  swapSide: { flex: 1, backgroundColor: '#111', padding: 8, borderRadius: 10 },
  swapLabel: { fontSize: 8, fontFamily: FONTS.displayBold, color: '#444', marginBottom: 6 },
  swapScroll: { gap: 6 },
  miniChip: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },

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
