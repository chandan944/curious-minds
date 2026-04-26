// ─────────────────────────────────────────────────────────
//  LAB: Chemical Bonding v2.0 (Extreme)
//  The Atomic Matchmaker Engine
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing, PanResponder
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
const SIM_H = 360;

// ── Constants & Data ─────────────────────────────────

const ELEMENTS = [
  { id: 'Na', name: 'Sodium', en: 0.9, valence: 1, color: '#A855F7', type: 'Metal' },
  { id: 'Cl', name: 'Chlorine', en: 3.0, valence: 7, color: '#39FF14', type: 'Non-Metal' },
  { id: 'C', name: 'Carbon', en: 2.5, valence: 4, color: '#FF3131', type: 'Non-Metal' },
  { id: 'O', name: 'Oxygen', en: 3.5, valence: 6, color: '#00E5FF', type: 'Non-Metal' },
  { id: 'H', name: 'Hydrogen', en: 2.1, valence: 1, color: '#FF9F1C', type: 'Non-Metal' },
  { id: 'F', name: 'Fluorine', en: 4.0, valence: 7, color: '#FFD166', type: 'Non-Metal' },
];

const CHALLENGES = [
  { id: 'ionic_theft', title: 'Grand Theft Electron', desc: 'Create an Ionic bond with ΔEN > 2.0', icon: 'zap', color: '#FFD166' },
  { id: 'covalent_share', title: 'Atomic Handshake', desc: 'Create a Covalent bond between two Carbon atoms', icon: 'link', color: '#FF3131' },
  { id: 'polar_dipole', title: 'Polar Power', desc: 'Create a Polar Covalent bond (ΔEN 0.5 - 1.7)', icon: 'activity', color: '#00E5FF' },
  { id: 'perfect_octet', title: 'The Octet Goal', desc: 'Form a stable molecule where all atoms reach 8/2 electrons', icon: 'target', color: '#39FF14' },
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

export default function BondingLab({ scientistMode = false, accentColor = '#4ECDC4' }) {
  const { isDark } = useTheme();
  
  // State
  const [atomA, setAtomA] = useState(ELEMENTS[0]); // Sodium
  const [atomB, setAtomB] = useState(ELEMENTS[1]); // Chlorine
  const [atomAPos, setAtomAPos] = useState({ x: SIM_W * 0.25, y: SIM_H * 0.5 });
  const [atomBPos, setAtomBPos] = useState({ x: SIM_W * 0.75, y: SIM_H * 0.5 });
  const [completedChallenges, setCompleted] = useState([]);
  
  // Derived Stats
  const deltaEN = Math.abs(atomA.en - atomB.en);
  const distance = Math.sqrt(Math.pow(atomBPos.x - atomAPos.x, 2) + Math.pow(atomBPos.y - atomAPos.y, 2));
  const isBonded = distance < 120;
  
  const bondType = useMemo(() => {
    if (!isBonded) return 'Weak Interaction';
    if (deltaEN >= 1.7) return 'Ionic';
    if (deltaEN > 0.4) return 'Polar Covalent';
    return 'Non-Polar Covalent';
  }, [isBonded, deltaEN]);

  // ── Handlers ──────────────────────────────────────────

  const panResponderA = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setAtomAPos(prev => ({ 
          x: Math.max(40, Math.min(SIM_W - 40, prev.x + gestureState.dx/1.5)), 
          y: Math.max(40, Math.min(SIM_H - 40, prev.y + gestureState.dy/1.5)) 
        }));
      },
      onPanResponderRelease: () => {
         checkBondingChallenges();
      }
    })
  ).current;

  const panResponderB = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setAtomBPos(prev => ({ 
          x: Math.max(40, Math.min(SIM_W - 40, prev.x + gestureState.dx/1.5)), 
          y: Math.max(40, Math.min(SIM_H - 40, prev.y + gestureState.dy/1.5)) 
        }));
      },
      onPanResponderRelease: () => {
        checkBondingChallenges();
      }
    })
  ).current;

  const checkBondingChallenges = useCallback(() => {
    if (!isBonded) return;
    
    const freshDone = [...completedChallenges];
    if (deltaEN > 2.0 && !freshDone.includes('ionic_theft')) {
       freshDone.push('ionic_theft');
       soundTrophy();
    }
    if (atomA.id === 'C' && atomB.id === 'C' && !freshDone.includes('covalent_share')) {
       freshDone.push('covalent_share');
       soundTrophy();
    }
    if (deltaEN > 0.5 && deltaEN < 1.7 && !freshDone.includes('polar_dipole')) {
       freshDone.push('polar_dipole');
       soundTrophy();
    }
    
    if (freshDone.length > completedChallenges.length) {
       setCompleted(freshDone);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isBonded, deltaEN, atomA, atomB, completedChallenges]);

  // ── Render Helpers ─────────────────────────────────────

  const renderValenceElectrons = (atom, pos, rotationOffset) => {
    const electrons = [];
    const r = 25;
    for (let i = 0; i < atom.valence; i++) {
      const angle = (i * (360 / atom.valence) + rotationOffset) * (Math.PI / 180);
      electrons.push(
        <Circle 
           key={i} 
           cx={pos.x + r * Math.cos(angle)} 
           cy={pos.y + r * Math.sin(angle)} 
           r={3} 
           fill={atom.color} 
        />
      );
    }
    return electrons;
  };

  return (
    <View style={styles.root}>
      {/* 1. Header Metrics */}
      <View style={styles.metricsRow}>
        <StatusCard label="Δ EN (DIFF)" value={deltaEN.toFixed(1)} unit="ΔEN" color="#00E5FF" icon="activity" />
        <StatusCard label="BOND TYPE" value={bondType} unit="" color="#A855F7" icon="link" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.canvasWrap, { borderColor: isDark ? '#333' : '#ddd' }]}>
        <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
          <Defs>
             <RadialGradient id="gradA" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={atomA.color} stopOpacity="0.4" />
                <Stop offset="1" stopColor={atomA.color} stopOpacity="0.05" />
             </RadialGradient>
             <RadialGradient id="gradB" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={atomB.color} stopOpacity="0.4" />
                <Stop offset="1" stopColor={atomB.color} stopOpacity="0.05" />
             </RadialGradient>
          </Defs>

          {/* Atomic Backgrounds (Electron Clouds) */}
          <Circle cx={atomAPos.x} cy={atomAPos.y} r={60} fill="url(#gradA)" />
          <Circle cx={atomBPos.x} cy={atomBPos.y} r={60} fill="url(#gradB)" />

          {/* Bond Line in Covalent mode */}
          {isBonded && bondType !== 'Ionic' && (
             <Line 
               x1={atomAPos.x} y1={atomAPos.y} 
               x2={atomBPos.x} y2={atomBPos.y} 
               stroke={deltaEN > 0.4 ? 'url(#dipoleGrad)' : '#FFF'} 
               strokeWidth="4" 
               strokeDasharray="8,4"
             />
          )}

          {/* Atom A */}
          <G {...panResponderA.panHandlers}>
            <Circle cx={atomAPos.x} cy={atomAPos.y} r={20} fill={atomA.color} stroke="#FFF" strokeWidth="2" />
            <SvgText x={atomAPos.x - 8} y={atomAPos.y + 6} fill="#FFF" fontSize="14" fontWeight="bold">{atomA.id}</SvgText>
            {renderValenceElectrons(atomA, atomAPos, 0)}
          </G>

          {/* Atom B */}
          <G {...panResponderB.panHandlers}>
            <Circle cx={atomBPos.x} cy={atomBPos.y} r={20} fill={atomB.color} stroke="#FFF" strokeWidth="2" />
            <SvgText x={atomBPos.x - 8} y={atomBPos.y + 6} fill="#FFF" fontSize="14" fontWeight="bold">{atomB.id}</SvgText>
            {renderValenceElectrons(atomB, atomBPos, 45)}
          </G>

          {/* Ionic Arrow Helper */}
          {isBonded && bondType === 'Ionic' && (
             <G>
               <Path 
                 d={`M ${atomAPos.x} ${atomAPos.y} L ${atomBPos.x} ${atomBPos.y}`} 
                 stroke={atomB.en > atomA.en ? atomB.color : atomA.color} 
                 strokeWidth="3" 
                 markerEnd="url(#arrow)"
               />
               <SvgText 
                  x={(atomAPos.x + atomBPos.x)/2} 
                  y={(atomAPos.y + atomBPos.y)/2 - 10} 
                  fill="#FFF" fontSize="10" 
                  textAnchor="middle"
               >ELECTRON THEFT</SvgText>
             </G>
          )}
        </Svg>
      </View>

      {/* 3. Controls (Element Selector) */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>SELECT ATOMS</Text>
        <View style={styles.swapRow}>
           <View style={styles.atomSelector}>
              <Text style={styles.selectorLabel}>ATOM 1</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                 {ELEMENTS.map(e => (
                   <TouchableOpacity key={e.id} onPress={() => setAtomA(e)} style={[styles.miniAtom, atomA.id === e.id && { borderColor: e.color }]}>
                      <Text style={[styles.miniText, { color: atomA.id === e.id ? e.color : '#666' }]}>{e.id}</Text>
                   </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
           <View style={styles.atomSelector}>
              <Text style={styles.selectorLabel}>ATOM 2</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                 {ELEMENTS.map(e => (
                   <TouchableOpacity key={e.id} onPress={() => setAtomB(e)} style={[styles.miniAtom, atomB.id === e.id && { borderColor: e.color }]}>
                      <Text style={[styles.miniText, { color: atomB.id === e.id ? e.color : '#666' }]}>{e.id}</Text>
                   </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
        </View>
      </View>

      {/* 4. Scientist Mode */}
      {scientistMode && (
        <View style={styles.scientistSection}>
          <Text style={styles.sectionTitle}>BONDING ANALYTICS</Text>
          <View style={styles.sciGrid}>
            <ScientistCard 
              formula="% Ionic = [1 - e^(-0.25ΔEN²)]" 
              description="Pauling Ionic Character Formula" 
              value={`Ionic Character: ${( (1 - Math.exp(-0.25 * Math.pow(deltaEN, 2))) * 100).toFixed(1)}%`}
              color="#A855F7"
            />
            <ScientistCard 
              formula="U = - (k Q1 Q2) / r" 
              description="Lattice Potential Energy" 
              value={`Distance: ${distance.toFixed(1)} pm (unscaled)`}
              color="#00E5FF"
            />
          </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.challengeSection}>
         <Text style={styles.sectionTitle}>VALENCE MISSIONS</Text>
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
  statusValue: { fontSize: 13, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvasWrap: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' },
  svg: { ...StyleSheet.absoluteFillObject },

  controlPanel: { marginTop: 20 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#444', letterSpacing: 2, marginBottom: 10, marginTop: 16 },
  swapRow: { flexDirection: 'row', gap: 12 },
  atomSelector: { flex: 1, backgroundColor: '#111', padding: 10, borderRadius: 12 },
  selectorLabel: { fontSize: 8, fontFamily: FONTS.displayBold, color: '#444', marginBottom: 8 },
  scroll: { gap: 8 },
  miniAtom: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  miniText: { fontSize: 12, fontFamily: FONTS.displayBold },

  scientistSection: { marginTop: 10 },
  sciGrid: { gap: 8 },
  sciCard: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 9, color: '#888', marginBottom: 6 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 11, fontFamily: 'monospace' },

  challengeSection: { marginTop: 10 },
  challCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#151515', padding: 12, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 1 },
  challIcon: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  challTitle: { fontSize: 12, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 10, color: '#666' }
});
