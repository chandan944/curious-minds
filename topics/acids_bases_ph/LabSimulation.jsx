// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  LAB: Acids & Bases v2.0 (Extreme)
//  The Titration Station
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing
} from 'react-native';
import Svg, { Circle, Path, Rect, G, Line, Polyline, Defs, RadialGradient, Stop, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess, soundTrophy } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 380;

// â”€â”€ Titration Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SAMPLES = [
  { id: 'hcl', name: 'Stomach Acid (HCl)', type: 'Strong Acid', ph: 1.5, color: '#FF3131' },
  { id: 'lemon', name: 'Lemon Juice', type: 'Weak Acid', ph: 2.2, color: '#FFD166' },
  { id: 'coffee', name: 'Black Coffee', type: 'Weak Acid', ph: 5.0, color: '#8B4513' },
  { id: 'soap', name: 'Soap Water', type: 'Weak Base', ph: 9.5, color: '#10B981' },
  { id: 'cleaner', name: 'Drain Cleaner (NaOH)', type: 'Strong Base', ph: 13.5, color: '#A855F7' },
];

const CHALLENGES = [
  { id: 'perfect_neutral', title: 'Perfect 7.0', desc: 'Reach exactly pH 7.0 during titration', icon: 'target', color: '#00D4FF' },
  { id: 'flash_flip', title: 'Indicator Flip', desc: 'See the color change in a single drop', icon: 'zap', color: '#F59E0B' },
  { id: 'extreme_analyst', title: 'Extreme Analyst', desc: 'Neutralize the Strongest Acid (HCl)', icon: 'activity', color: '#FF3131' },
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

// â”€â”€ AnimatedCircle must be defined before JSX use â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function TitrationLab({ scientistMode = false }) {
  const { isDark } = useTheme();
  
  // State
  const [activeSample, setSample] = useState(SAMPLES[0]);
  const [currentPH, setCurrentPH] = useState(SAMPLES[0].ph);
  const [volumeAdded, setVolume] = useState(0); // in ml
  const [isDripping, setIsDripping] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [history, setHistory] = useState([]); // [{vol, ph}]

  // Refs for animations
  const dripAnim = useRef(new Animated.Value(0)).current;
  const dripInterval = useRef(null);

  // Derived
  const isNeutral = currentPH > 6.8 && currentPH < 7.2;
  const indicatorColor = useMemo(() => {
    // Universal Indicator Logic
    if (currentPH <= 2) return '#FF0000';
    if (currentPH <= 4) return '#FF8C00';
    if (currentPH <= 6) return '#FFD700';
    if (currentPH <= 8) return '#00FF00';
    if (currentPH <= 10) return '#00CED1';
    if (currentPH <= 12) return '#1E90FF';
    return '#8A2BE2';
  }, [currentPH]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleReset = () => {
    soundWhoosh();
    setCurrentPH(activeSample.ph);
    setVolume(0);
    setHistory([]);
  };

  const addTitrant = useCallback(() => {
    setVolume(prev => {
      const newVol = prev + 0.1; // 0.1ml per drop
      
      setCurrentPH(oldPH => {
        let delta = 0;
        // Strong Acid -> Base Titration Curve Metaphor
        // Near 7 the spikes are massive
        const distTo7 = Math.abs(oldPH - 7);
        const intensity = activeSample.id === 'hcl' || activeSample.id === 'cleaner' ? 0.8 : 0.3;
        
        if (activeSample.ph < 7) {
           // Adding Base
           delta = distTo7 < 1 ? intensity * 5 : intensity;
           const next = Math.min(14, oldPH + delta * 0.1);
           return next;
        } else {
           // Adding Acid
           delta = distTo7 < 1 ? intensity * 5 : intensity;
           const next = Math.max(0, oldPH - delta * 0.1);
           return next;
        }
      });

      return newVol;
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate Drip
    dripAnim.setValue(0);
    Animated.timing(dripAnim, {
       toValue: 1,
       duration: 150,
       easing: Easing.linear,
       useNativeDriver: true
    }).start();

  }, [activeSample]);

  useEffect(() => {
    if (isDripping) {
      dripInterval.current = setInterval(addTitrant, 200);
    } else {
      clearInterval(dripInterval.current);
    }
    return () => clearInterval(dripInterval.current);
  }, [isDripping, addTitrant]);

  // Challenge check
  useEffect(() => {
    const list = [...completedChallenges];
    if (currentPH >= 6.95 && currentPH <= 7.05 && !list.includes('perfect_neutral')) {
      list.push('perfect_neutral');
      soundTrophy();
    }
    if (list.length > completedChallenges.length) {
       setCompleted(list);
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentPH, completedChallenges]);

  // Keep history for graph
  useEffect(() => {
     setHistory(prev => [...prev.slice(-40), { vol: volumeAdded, ph: currentPH }]);
  }, [volumeAdded]);

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <View style={styles.container}>
      {/* 1. Header Metrics */}
      <View style={styles.header}>
         <StatusCard label="CURRENT pH" value={currentPH.toFixed(2)} unit="" color={indicatorColor} icon="activity" />
         <StatusCard label="VOLUME" value={volumeAdded.toFixed(1)} unit="mL" color="#A855F7" icon="droplet" />
      </View>

      {/* 2. Simulation Area */}
      <View style={[styles.simArea, { borderColor: isDark ? '#333' : '#ddd' }]}>
         <Svg width={SIM_W} height={SIM_H} style={styles.svg}>
            {/* Burette Background */}
            <Rect x={SIM_W/2 - 10} y={20} width={20} height={180} fill="#111" rx={5} stroke="#333" />
            <Rect x={SIM_W/2 - 8} y={20} width={16} height={180 - (volumeAdded * 2)} fill="#00D4FF" opacity={0.3} rx={4} />
            
            {/* Drip Animation */}
            <AnimatedCircle 
               cx={SIM_W/2} 
               cy={dripAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 300] })} 
               r={3} fill="#00D4FF" 
               opacity={dripAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] })} 
            />

            {/* Flask */}
            <Path 
               d={`M ${SIM_W/2 - 20},240 L ${SIM_W/2 + 20},240 L ${SIM_W/2 + 70},340 Q ${SIM_W/2},360 ${SIM_W/2 - 70},340 Z`} 
               fill="#1A1A1A" stroke="#444" strokeWidth="2" 
            />
            {/* Liquid in Flask */}
            <Path 
               d={`M ${SIM_W/2 - 45},290 L ${SIM_W/2 + 45},290 L ${SIM_W/2 + 68},338 Q ${SIM_W/2},358 ${SIM_W/2 - 68},338 Z`} 
               fill={indicatorColor} opacity={0.4} 
            />

            {/* Graph Overlay (Scientist Only) */}
            {scientistMode && (
              <G transform={`translate(20, 40)`}>
                 <Rect width={100} height={80} fill="#000" opacity={0.5} rx={5} />
                 <Polyline 
                    points={history.map((h, i) => `${i*2.5},${80 - (h.ph/14)*80}`).join(' ')} 
                    fill="none" stroke="#FFD166" strokeWidth="1" 
                 />
                 <SvgText x={50} y={15} fill="#666" fontSize="8" textAnchor="middle">pH CURVE</SvgText>
              </G>
            )}

            <SvgText x={SIM_W/2} y={375} fill="#444" fontSize="9" textAnchor="middle" fontFamily="monospace">TITRATION FLASK UNIT v2.0</SvgText>
         </Svg>

         {/* Equivalence Marker */}
         {isNeutral && (
           <View style={styles.neutralSeal}>
              <Icon name="check-circle" size={14} color="#00FF00" />
              <Text style={styles.neutralText}>NEUTRALIZED</Text>
           </View>
         )}
      </View>

      {/* 3. Controls */}
      <View style={styles.controls}>
         <View style={styles.sampleGrid}>
            <Text style={styles.sectionTitle}>SELECT SAMPLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
               {SAMPLES.map(s => (
                 <TouchableOpacity key={s.id} onPress={() => { setSample(s); setCurrentPH(s.ph); setVolume(0); setHistory([]); }}
                    style={[styles.sampleBtn, activeSample.id === s.id && { borderColor: s.color }]}>
                    <Text style={[styles.sampleBtnText, { color: activeSample.id === s.id ? s.color : '#666' }]}>{s.id.toUpperCase()}</Text>
                 </TouchableOpacity>
               ))}
            </ScrollView>
         </View>

         <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
               <Icon name="rotate-cw" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
               onPressIn={() => setIsDripping(true)} 
               onPressOut={() => setIsDripping(false)}
               activeOpacity={0.8}
               style={[styles.dripBtn, { backgroundColor: isDripping ? '#00D4FF' : '#111' }]}
            >
               <Text style={[styles.dripBtnText, { color: isDripping ? '#000' : '#00D4FF' }]}>HOLD TO DRIP TITRANT</Text>
            </TouchableOpacity>
         </View>
      </View>

      {/* 4. Scientist Analytics */}
      {scientistMode && (
        <View style={styles.sciArea}>
           <Text style={styles.sectionTitle}>MOLAR ANALYTICS</Text>
           <View style={styles.sciGrid}>
              <ScientistCard 
                 formula="[H+] = 10^-pH" 
                 description="Hydrogen Ion Concentration" 
                 value={`Conc: ${Math.pow(10, -currentPH).toExponential(2)} M`}
                 color="#FF3131"
              />
              <ScientistCard 
                 formula="pOH = 14 - pH" 
                 description="Hydroxide Ion Measure" 
                 value={`pOH: ${(14 - currentPH).toFixed(2)}`}
                 color="#A855F7"
              />
           </View>
        </View>
      )}

      {/* 5. Challenges */}
      <View style={styles.missionArea}>
         <Text style={styles.sectionTitle}>PRECISION MISSIONS</Text>
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

// AnimatedCircle is defined above the component (see top of file)

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderLeftWidth: 4, borderWidth: 1, borderColor: '#222' },
  statusIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: { fontSize: 8, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  statusValue: { fontSize: 13, fontFamily: FONTS.displayBold, color: '#FFF' },
  statusUnit: { fontSize: 10, color: '#666' },

  simArea: { height: SIM_H, borderRadius: RADIUS.xl, borderWidth: 1, backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' },
  svg: { ...StyleSheet.absoluteFillObject },
  
  neutralSeal: { position: 'absolute', top: 250, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#00331a', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#00FF00' },
  neutralText: { color: '#00FF00', fontSize: 10, fontFamily: FONTS.displayBold },

  controls: { marginTop: 24 },
  sampleGrid: { marginBottom: 20 },
  sectionTitle: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#444', letterSpacing: 2, marginBottom: 12 },
  scroll: { gap: 10 },
  sampleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: '#111', borderWidth: 1, borderColor: '#333' },
  sampleBtnText: { fontSize: 12, fontFamily: FONTS.displayBold },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  resetBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  dripBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#00D4FF', alignItems: 'center', justifyContent: 'center' },
  dripBtnText: { fontSize: 12, fontFamily: FONTS.displayBold, letterSpacing: 1 },

  sciArea: { marginTop: 24 },
  sciGrid: { gap: 10 },
  sciCard: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sciFormula: { fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },
  sciDesc: { fontSize: 9, color: '#888', marginBottom: 8 },
  sciDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  sciValue: { fontSize: 11, fontFamily: 'monospace' },

  missionArea: { marginTop: 24 },
  challItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8 },
  challTitle: { fontSize: 12, fontFamily: FONTS.displayBold },
  challDesc: { fontSize: 10, color: '#666' }
});
