import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

export default function SyndromeLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── State ──────────────────────────────────────
  const [competence, setCompetence] = useState(10); // True Skill
  const [confidence, setConfidence] = useState(90); // Self Perception
  const [attribution, setAttribution] = useState('internal'); // internal vs external

  const [diagnosis, setDiagnosis] = useState({ label: 'Mount Stupid', color: '#A855F7', desc: 'Dunning-Kruger Effect' });

  // Animations
  const dotAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     // Map values to graph coords (Competence = X, Confidence = Y)
     const x = (competence / 100) * SIM_W;
     const y = SIM_H - ((confidence / 100) * SIM_H) - 20;

     Animated.spring(dotAnim, {
        toValue: { x, y },
        useNativeDriver: false
     }).start();

     let newDiag = { label: 'Normal Baseline', color: '#888', desc: 'Average Alignment' };

     if (competence < 30 && confidence > 70) {
        newDiag = { label: 'Peak of Mount Stupid', color: '#FF4444', desc: 'Dunning-Kruger Peak' };
     } else if (competence >= 70 && confidence < 40) {
        if (attribution === 'external') {
           newDiag = { label: 'Imposter Syndrome', color: '#00D4FF', desc: 'High Skill, Extreme Self-Doubt' };
        } else {
           newDiag = { label: 'Valley of Despair', color: '#A855F7', desc: 'Realizing how much you don\'t know' };
        }
     } else if (competence > 70 && confidence > 70) {
        newDiag = { label: 'Mastery / Guru', color: '#00D4A0', desc: 'True aligned expertise.' };
     } else if (competence < 20 && confidence < 20) {
        if (attribution === 'external') {
           newDiag = { label: 'Learned Helplessness', color: '#333', desc: 'Complete loss of agency' };
        } else {
           newDiag = { label: 'Beginner Phase', color: '#FFD166', desc: 'Unconscious Incompetence' };
        }
     }

     setDiagnosis(newDiag);

     if (newDiag.label === 'Imposter Syndrome') {
        soundSuccess();
        if(onLabBreaker) onLabBreaker();
     }

  }, [competence, confidence, attribution]);

  const updateVal = (setter, delta) => {
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setter(prev => Math.max(5, Math.min(95, prev + delta)));
  };

  const toggleAttribution = () => {
     soundWhoosh();
     setAttribution(prev => prev === 'internal' ? 'external' : 'internal');
  };

  const renderMarker = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG {...{ style: { transform: [{ translateX: dotAnim.x }, { translateY: dotAnim.y }] } }}>
        <Circle r={40} fill="url(#glow)" />
        <Circle r={8} fill={diagnosis.color} stroke="#fff" strokeWidth="2" />
        <SvgText x="12" y="4" fill="#fff" fontSize="10" fontWeight="bold">YOU</SvgText>
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>CURRENT STATE</Text>
            <Text style={{ color: diagnosis.color, fontSize: 18, fontFamily: FONTS.displayBold }}>{diagnosis.label}</Text>
            <Text style={{ color: txt1, fontSize: 10 }}>{diagnosis.desc}</Text>
         </View>
      </View>

      {/* ── Matrix Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#fff' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={diagnosis.color} stopOpacity="0.5" />
                  <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            {/* The Dunning Kruger Curve Background Path */}
            <Path d={`M 0 ${SIM_H - 20} Q ${SIM_W * 0.2} 20 ${SIM_W * 0.4} ${SIM_H/2} T ${SIM_W} 40`} 
                  stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" strokeDasharray="5,5" />

            <SvgText x={SIM_W/2} y={SIM_H - 5} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">ACTUAL COMPETENCE $\rightarrow$</SvgText>
            <SvgText x="15" y={SIM_H - 60} fill="rgba(255,255,255,0.6)" fontSize="10" transform={`rotate(-90, 15, ${SIM_H - 60})`}>$\leftarrow$ SELF-CONFIDENCE</SvgText>

            {/* Marker */}
            {renderMarker()}
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>EPISTEMIC_BLINDNESS: {Math.max(0, confidence - competence)}</Text>
              <Text style={styles.sciText}>ATTRIBUTION_LOCUS: {attribution.toUpperCase()}</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controls}>
         <Text style={{ color: txtM, fontSize: 9, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 10 }}>ADJUST PSYCHOLOGICAL VARIABLES</Text>
         
         <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Skill (Competence)</Text>
            <View style={styles.btns}>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateVal(setCompetence, -20)}><Text style={{ color: '#fff' }}>-</Text></TouchableOpacity>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateVal(setCompetence, 20)}><Text style={{ color: '#fff' }}>+</Text></TouchableOpacity>
            </View>
         </View>

         <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Ego (Confidence)</Text>
            <View style={styles.btns}>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateVal(setConfidence, -20)}><Text style={{ color: '#fff' }}>-</Text></TouchableOpacity>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateVal(setConfidence, 20)}><Text style={{ color: '#fff' }}>+</Text></TouchableOpacity>
            </View>
         </View>

         <TouchableOpacity style={[styles.attrBtn, { borderColor: border, backgroundColor: attribution === 'internal' ? 'rgba(0,212,160,0.1)' : 'rgba(255,68,68,0.1)' }]} onPress={toggleAttribution}>
            <Text style={{ color: txt1, fontSize: 11, fontFamily: FONTS.displayBold }}>
               ATTRIBUTION: {attribution === 'internal' ? 'INTERNAL (My Fault/Skill)' : 'EXTERNAL (Luck/Others)'}
            </Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  sciOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace', textAlign: 'right' },

  controls: { marginTop: 16, gap: 10 },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: RADIUS.sm },
  sliderLabel: { color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold },
  btns: { flexDirection: 'row', gap: 10 },
  miniBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },

  attrBtn: { padding: 14, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 4 }
});
