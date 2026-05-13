// ─────────────────────────────────────────────────────────
//  LAB: Chemical Reactions v2.0 (Extreme)
//  The Stoichiometric Reactor
// ─────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, { Circle, Rect, G, Defs, Stop, RadialGradient, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

// ── Reaction Data ─────────────────────────────────────

const REACTIONS = [
  {
    id: 'water',
    title: 'Synthesis of Water',
    equation: 'H₂ + O₂ → H₂O',
    balanced: [2, 1, 2],
    reactants: [{ id: 'H2', color: '#FF9F1C' }, { id: 'O2', color: '#00D4FF' }],
    product: { id: 'H2O', color: '#3B82F6' },
    type: 'Synthesis',
    enthalpy: 'Exothermic (ΔH = -484 kJ)',
    animation: 'merge'
  },
  {
    id: 'methane',
    title: 'Combustion of Methane',
    equation: 'CH₄ + O₂ → CO₂ + H₂O',
    balanced: [1, 2, 1, 2],
    reactants: [{ id: 'CH4', color: '#FF3131' }, { id: 'O2', color: '#00D4FF' }],
    product: { id: 'CO2 + H2O', color: '#888' },
    type: 'Combustion',
    enthalpy: 'Exothermic (ΔH = -891 kJ)',
    animation: 'explode'
  },
  {
    id: 'ammonia',
    title: 'Haber Process (Ammonia)',
    equation: 'N₂ + H₂ → NH₃',
    balanced: [1, 3, 2],
    reactants: [{ id: 'N2', color: '#A855F7' }, { id: 'H2', color: '#FF9F1C' }],
    product: { id: 'NH3', color: '#39FF14' },
    type: 'Synthesis',
    enthalpy: 'Exothermic (ΔH = -92 kJ)',
    animation: 'merge'
  }
];

const CHALLENGES = [
  { id: 'water_master', title: 'Hydro Genesis', desc: 'Balance the Water Synthesis equation', icon: 'droplet', color: '#00D4FF' },
  { id: 'fire_starter', title: 'Fire Starter', desc: 'Ignite Methane with correct coefficients', icon: 'zap', color: '#FF3131' },
  { id: 'habers_luck', title: 'Industrial Giant', desc: 'Balance the Haber Ammonia process', icon: 'activity', color: '#A855F7' },
  { id: 'perfect_ignite', title: 'Stoic Perfection', desc: 'Ignite a reaction on the first try', icon: 'check', color: '#F59E0B' },
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

const CoefficientControl = ({ value, onChange, label, color }) => (
  <View style={styles.coeffBox}>
     <Text style={[styles.coeffLabel, { color }]}>{label}</Text>
     <View style={styles.coeffRow}>
        <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))} style={styles.coeffBtn}>
           <Text style={styles.coeffBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.coeffValue}>{value}</Text>
        <TouchableOpacity onPress={() => onChange(value + 1)} style={styles.coeffBtn}>
           <Text style={styles.coeffBtnText}>+</Text>
        </TouchableOpacity>
     </View>
  </View>
);

// ── AnimatedCircle must be defined before JSX use ──────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

// ── Main Component ─────────────────────────────────────

export default function ReactionLab({ scientistMode = false }) {
  const { isDark } = useTheme();
  
  // State
  const [activeReactionIdx, setActiveIdx] = useState(0);
  const [coeffs, setCoeffs] = useState([1, 1, 1, 1]);
  const [igniting, setIgniting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  
  const reaction = REACTIONS[activeReactionIdx];
  const isCorrect = useMemo(() => {
    return reaction.balanced.every((val, i) => val === coeffs[i]);
  }, [reaction, coeffs]);

  // Animations
  const reactAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Functions ────────────────────────────────────────

  const updateCoeff = (idx, val) => {
    soundTap();
    const newCoeffs = [...coeffs];
    newCoeffs[idx] = val;
    setCoeffs(newCoeffs);
    setSuccess(false);
  };

  const handleIgnite = () => {
    if (igniting) return;
    
    if (!isCorrect) {
       soundWhoosh();
       Animated.sequence([
         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
         Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
       ]).start();
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       return;
    }

    // Success Sequence
    setIgniting(true);
    soundSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.timing(reactAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
       setSuccess(true);
       setIgniting(false);
       reactAnim.setValue(0);
       checkChallenges();
    });
  };

  const checkChallenges = () => {
    const list = [...completedChallenges];
    if (reaction.id === 'water' && !list.includes('water_master')) list.push('water_master');
    if (reaction.id === 'methane' && !list.includes('fire_starter')) list.push('fire_starter');
    if (reaction.id === 'ammonia' && !list.includes('habers_luck')) list.push('habers_luck');
    
    if (list.length > completedChallenges.length) {
       setCompleted(list);
       soundTrophy();
    }
  };

  // ── Render Parts ─────────────────────────────────────

  const renderParticles = (color, offsetX) => {
    const opacity = reactAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.5, 0]
    });
    const translateX = reactAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [offsetX, 0]
    });

    // @ts-ignore
    return (
      <AnimatedG 
        // @ts-ignore
        style={{ opacity, transform: [{ translateX }] }}>
        <Circle cx={SIM_W/2} cy={SIM_H/2} r={15} fill={color} />
        <Circle cx={SIM_W/2 - 20} cy={SIM_H/2 + 20} r={10} fill={color} opacity={0.6} />
        <Circle cx={SIM_W/2 + 20} cy={SIM_H/2 - 20} r={10} fill={color} opacity={0.6} />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Analytics */}
      <View style={styles.header}>
         <StatusCard label="REACTION TYPE" value={reaction.type} unit="" color="#A855F7" icon="activity" />
         <StatusCard label="ENTHALPY" value={reaction.enthalpy.split('(')[0]} unit="" color="#FF3131" icon="zap" />
      </View>

      {/* 2. Simulation Canvas */}
      <View style={[styles.canvas, { borderColor: isDark ? '#333' : '#ddd' }]}>
         <Animated.View style={[styles.innerCanvas, { transform: [{ translateX: shakeAnim }] }]}>
            <Svg width={SIM_W} height={SIM_H}>
               <Defs>
                  <RadialGradient id="chamber" cx="50%" cy="50%" r="50%">
                     <Stop offset="0" stopColor="#0A0A1F" stopOpacity="1" />
                     <Stop offset="1" stopColor="#000" stopOpacity="1" />
                  </RadialGradient>
               </Defs>
               
               <Rect width={SIM_W} height={SIM_H} fill="url(#chamber)" />
               
               {/* Igniting Animation Overlay */}
               {igniting && (
                 <AnimatedCircle 
                    cx={SIM_W/2} cy={SIM_H/2} 
                    r={reactAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] })} 
                    fill={reaction.type === 'Combustion' ? '#FF4400' : reaction.product.color} 
                    opacity={reactAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.3, 0.8, 0] })}
                 />
               )}

               {/* Reactants arriving */}
               {!success && !igniting && (
                 <G>
                   {renderParticles(reaction.reactants[0].color, -100)}
                   {renderParticles(reaction.reactants[1].color, 100)}
                 </G>
               )}

               {/* Resulting Product */}
               {success && (
                 <G>
                    <Circle cx={SIM_W/2} cy={SIM_H/2} r={40} fill={reaction.product.color} opacity={0.8} />
                    <SvgText x={SIM_W/2} y={SIM_H/2 + 5} fontSize="14" fill="#FFF" textAnchor="middle" fontWeight="bold">
                       {reaction.product.id}
                    </SvgText>
                 </G>
               )}

               {/* Chamber Label */}
               <SvgText x="20" y="30" fontSize="9" fill="#444" fontFamily="monospace">STOCHIOMETRIC CHAMBER V2.0</SvgText>
            </Svg>
         </Animated.View>

         {/* Equation Overlay */}
         <View style={styles.eqOverlay}>
            <Text style={styles.eqText}>{reaction.equation}</Text>
         </View>
      </View>

      {/* 3. Coefficient Controls */}
      <View style={styles.controlSection}>
         <Text style={styles.sectionTitle}>BALANCE THE EQUATION</Text>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {reaction.balanced.map((_, i) => (
              <CoefficientControl 
                 key={i} 
                 label={i < reaction.reactants.length ? reaction.reactants[i].id : (i === 2 ? 'Prod 1' : 'Prod 2')} 
                 value={coeffs[i]} 
                 color={i < reaction.reactants.length ? reaction.reactants[i].color : '#FFF'}
                 onChange={(v) => updateCoeff(i, v)}
              />
            ))}
         </ScrollView>
      </View>

      {/* 4. Action Bar */}
      <TouchableOpacity 
         onPress={handleIgnite} 
         activeOpacity={0.8}
         style={[styles.igniteBtn, { borderColor: isCorrect ? '#39FF14' : '#FF3131' }]}
      >
         <Icon name={success ? 'rotate-cw' : 'zap'} size={20} color={isCorrect ? '#39FF14' : '#FF3131'} />
         <Text style={[styles.igniteText, { color: isCorrect ? '#39FF14' : '#FF3131' }]}>
            {success ? 'RESET REACTOR' : igniting ? 'IGNITING...' : isCorrect ? 'STABLE - IGNITE REACTION' : 'UNBALANCED - DANGER'}
         </Text>
      </TouchableOpacity>

      {/* 5. Scientist Mode (Analytics) */}
      {scientistMode && (
        <View style={styles.sciMode}>
           <Text style={styles.sectionTitle}>REACTION KINETICS</Text>
           <View style={styles.sciGrid}>
              <View style={[styles.sciCard, { borderColor: '#FF313160' }]}>
                 <Text style={styles.sciFormula}>ΔH = ΣHpdts - ΣHrctnts</Text>
                 <Text style={styles.sciDesc}>Enthalpy change determines energy release.</Text>
                 <View style={styles.barWrap}><View style={[styles.bar, { width: '80%', backgroundColor: '#FF3131' }]} /></View>
              </View>
              <View style={[styles.sciCard, { borderColor: '#A855F760' }]}>
                 <Text style={styles.sciFormula}>k = A exp(-Ea / RT)</Text>
                 <Text style={styles.sciDesc}>Arrhenius Equation for reaction rates.</Text>
                 <View style={styles.barWrap}><View style={[styles.bar, { width: '40%', backgroundColor: '#A855F7' }]} /></View>
              </View>
           </View>
        </View>
      )}

      {/* 6. Missions */}
      <View style={styles.missionSection}>
         <Text style={styles.sectionTitle}>REACTION MISSIONS</Text>
         {CHALLENGES.map(c => (
            <View key={c.id} style={[styles.missionItem, { borderColor: completedChallenges.includes(c.id) ? c.color : '#222' }]}>
               <Icon name={completedChallenges.includes(c.id) ? 'check' : c.icon} size={14} color={completedChallenges.includes(c.id) ? c.color : '#444'} />
               <View>
                  <Text style={[styles.missionTitle, { color: completedChallenges.includes(c.id) ? c.color : '#888' }]}>{c.title}</Text>
                  <Text style={styles.missionDesc}>{c.desc}</Text>
               </View>
            </View>
         ))}
      </View>

      <View style={{ height: 100 }} />
    </View>
  );
}

// AnimatedCircle and AnimatedG are defined above the component (see top of file)

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4, borderWidth: 1, borderColor: '#222' },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayMedium, letterSpacing: 1 },
  statusValue: { fontSize: 13, fontFamily: FONTS.displayMedium, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  canvas: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#000', overflow: 'hidden' },
  innerCanvas: { ...StyleSheet.absoluteFillObject },
  eqOverlay: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  eqText: { color: '#AAA', fontFamily: 'monospace', fontSize: 14, letterSpacing: 2 },

  controlSection: { marginTop: 24 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayMedium, color: '#444', letterSpacing: 2, marginBottom: 12 },
  scroll: { gap: 12 },
  coeffBox: { width: 100, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#222' },
  coeffLabel: { fontSize: 8, fontFamily: FONTS.displayMedium, marginBottom: 8, textAlign: 'center' },
  coeffRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coeffBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  coeffBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  coeffValue: { color: '#FFF', fontSize: 18, fontFamily: FONTS.displayMedium },

  igniteBtn: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: RADIUS.lg, borderWidth: 2, backgroundColor: '#111' },
  igniteText: { fontSize: 12, fontFamily: FONTS.displayMedium, letterSpacing: 1 },

  sciMode: { marginTop: 24 },
  sciGrid: { gap: 10 },
  sciCard: { padding: 12, borderRadius: RADIUS.md, backgroundColor: '#111', borderWidth: 1 },
  sciFormula: { color: '#FFF', fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { color: '#666', fontSize: 9, marginBottom: 8 },
  barWrap: { height: 4, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 2 },

  missionSection: { marginTop: 24 },
  missionItem: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 12, borderRadius: RADIUS.md, backgroundColor: '#111', borderWidth: 1, marginBottom: 8 },
  missionTitle: { fontSize: 12, fontFamily: FONTS.displayMedium },
  missionDesc: { fontSize: 10, color: '#666' }
});
