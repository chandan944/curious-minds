import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 420;

const H2_MASS = 2.02;
const O2_MASS = 32.00;
const H2O_MASS = 18.02;

export default function StoichiometryLab({ scientistMode = false }) {
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
  const [h2Grams, setH2Grams] = useState(4.0);
  const [o2Grams, setO2Grams] = useState(32.0);
  const [reactionState, setReactionState] = useState('IDLE'); // IDLE, IGNITING, RESULT
  const [yieldData, setYieldData] = useState(null);

  const igniteAnim = useRef(new Animated.Value(0)).current;
  const waterLevel = useRef(new Animated.Value(0)).current;
  const molecules = useRef([...Array(20)].map(() => ({
     x: new Animated.Value(Math.random() * (SIM_W - 100) + 50),
     y: new Animated.Value(Math.random() * 200 + 50),
     type: Math.random() > 0.5 ? 'H2' : 'O2'
  }))).current;

  // ── Logic ──────────────────────────────────────
  const calculations = useMemo(() => {
    const h2Moles = h2Grams / H2_MASS;
    const o2Moles = o2Grams / O2_MASS;

    // Reaction: 2H2 + O2 -> 2H2O
    // Need 2 mole H2 for 1 mole O2
    const neededH2ForO2 = o2Moles * 2;
    
    let limiting;
    let theoreticalH2OMoles;
    let excessType;
    let excessGrams;

    if (h2Moles < neededH2ForO2) {
      limiting = 'H2';
      theoreticalH2OMoles = h2Moles; // 2:2 ratio
      excessType = 'O2';
      const o2Consumed = h2Moles / 2;
      excessGrams = (o2Moles - o2Consumed) * O2_MASS;
    } else {
      limiting = 'O2';
      theoreticalH2OMoles = o2Moles * 2; // 1:2 ratio
      excessType = 'H2';
      const h2Consumed = o2Moles * 2;
      excessGrams = (h2Moles - h2Consumed) * H2_MASS;
    }

    return {
      h2Moles, o2Moles, limiting, 
      theoreticalH2OMoles, 
      theoreticalH2OGrams: theoreticalH2OMoles * H2O_MASS,
      excessType, excessGrams
    };
  }, [h2Grams, o2Grams]);

  const ignite = () => {
    soundWhoosh();
    setReactionState('IGNITING');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Flash animation
    Animated.sequence([
      Animated.timing(igniteAnim, { toValue: 1, duration: 400, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(igniteAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ]).start(() => {
      setReactionState('RESULT');
      setYieldData(calculations);
      soundSuccess();
      
      // Fill water
      const fillPercentage = Math.min(100, (calculations.theoreticalH2OGrams / 50) * 100);
      Animated.timing(waterLevel, { toValue: fillPercentage, duration: 1500, useNativeDriver: false }).start();
    });
  };

  const reset = () => {
    setReactionState('IDLE');
    setYieldData(null);
    waterLevel.setValue(0);
    igniteAnim.setValue(0);
  };

  // ── Render ─────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Top Panel: Ingredients ── */}
      <View style={styles.controlPanel}>
         <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: '#00E5FF' }]}>HYDROGEN ($H_2$)</Text>
            <View style={styles.sliderRow}>
               <TouchableOpacity onPress={() => setH2Grams(Math.max(0, h2Grams-2))}><Icon name="minus-circle" size={20} color="#00E5FF" /></TouchableOpacity>
               <Text style={[styles.valText, { color: txt1 }]}>{h2Grams.toFixed(1)} g</Text>
               <TouchableOpacity onPress={() => setH2Grams(Math.min(20, h2Grams+2))}><Icon name="plus-circle" size={20} color="#00E5FF" /></TouchableOpacity>
            </View>
            <Text style={styles.moleSub}>({(h2Grams/H2_MASS).toFixed(2)} mol)</Text>
         </View>

         <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: '#FF4444' }]}>OXYGEN ($O_2$)</Text>
            <View style={styles.sliderRow}>
               <TouchableOpacity onPress={() => setO2Grams(Math.max(0, o2Grams-4))}><Icon name="minus-circle" size={20} color="#FF4444" /></TouchableOpacity>
               <Text style={[styles.valText, { color: txt1 }]}>{o2Grams.toFixed(1)} g</Text>
               <TouchableOpacity onPress={() => setO2Grams(Math.min(64, o2Grams+4))}><Icon name="plus-circle" size={20} color="#FF4444" /></TouchableOpacity>
            </View>
            <Text style={styles.moleSub}>({(o2Grams/O2_MASS).toFixed(2)} mol)</Text>
         </View>
      </View>

      {/* ── Simulation Window ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H}>
          <Defs>
            <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
               <Stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
               <Stop offset="100%" stopColor="#0055FF" stopOpacity="0.9" />
            </LinearGradient>
            <ClipPath id="flaskClip">
               <Path d="M 120 100 L 120 50 L 180 50 L 180 100 L 260 280 Q 280 320 150 320 Q 20 320 40 280 Z" />
            </ClipPath>
          </Defs>

          {/* Flask Body */}
          <G transform={`translate(${SIM_W/2 - 150}, 0)`}>
             {/* The Fluid */}
             <AnimatedRect 
                x={40} y={waterLevel.interpolate({ inputRange: [0, 100], outputRange: [320, 100] })} 
                width={220} height={320} fill="url(#waterGrad)" clipPath="url(#flaskClip)" 
             />

             {/* Flask Outline */}
             <Path d="M 120 100 L 120 50 L 180 50 L 180 100 L 260 280 Q 280 320 150 320 Q 20 320 40 280 Z" 
                   fill="none" stroke={txtM} strokeWidth="3" opacity={0.5} />
             
             {/* Labels */}
             <SvgText x={150} y={345} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" fontFamily={FONTS.displayBold}>REACTION CHAMBER</SvgText>

             {/* Ignite Flash */}
             <AnimatedCircle cx={150} cy={200} r={igniteAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] })} fill="#FFD166" opacity={0.6} />
          </G>

          {/* Theoretical Results UI */}
          {reactionState === 'RESULT' && yieldData && (
             <G x={SIM_W - 130} y={30}>
                <Rect width={120} height={140} rx={10} fill={isDark ? '#111' : '#eee'} opacity={0.8} />
                <SvgText x={10} y={20} fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="bold">REACTION SUMMARY</SvgText>
                
                <SvgText x={10} y={45} fill="#FFF" fontSize="10">PRODUCT:</SvgText>
                <SvgText x={10} y={58} fill="#00D4FF" fontSize="14" fontWeight="bold">{(yieldData.theoreticalH2OGrams).toFixed(1)}g Water</SvgText>
                
                <SvgText x={10} y={85} fill="#FFF" fontSize="10">LIMITING:</SvgText>
                <SvgText x={10} y={98} fill="#FF4444" fontSize="14" fontWeight="bold">{yieldData.limiting}</SvgText>

                <SvgText x={10} y={120} fill="rgba(255,255,255,0.6)" fontSize="8">EXCESS: {yieldData.excessGrams.toFixed(1)}g {yieldData.excessType}</SvgText>
             </G>
          )}

          {/* Scientist Mode Overlays */}
          {scientistMode && (
             <G x={20} y={30}>
                <SvgText fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="monospace">PARTICLES: {(calculations.h2Moles * 6.022).toFixed(2)} x 10^23</SvgText>
                <SvgText y={12} fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="monospace">STP VOLUME: {(calculations.h2Moles * 22.4).toFixed(1)} L</SvgText>
                <SvgText y={24} fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="monospace">RATIO: 2H2 : 1O2</SvgText>
             </G>
          )}
        </Svg>

        <View style={styles.actionRow}>
           {reactionState === 'IDLE' ? (
              <TouchableOpacity style={styles.igniteBtn} onPress={ignite}>
                 <Icon name="zap" size={20} color="#000" />
                 <Text style={styles.igniteText}>IGNITE REACTION</Text>
              </TouchableOpacity>
           ) : reactionState === 'RESULT' ? (
              <TouchableOpacity style={[styles.igniteBtn, { backgroundColor: '#333' }]} onPress={reset}>
                 <Text style={[styles.igniteText, { color: '#fff' }]}>RESET CHAMBER</Text>
              </TouchableOpacity>
           ) : null}
        </View>
      </View>

      {/* ⚖️ Real-time Ratio Bar */}
      <View style={styles.ratioBarContainer}>
         <Text style={styles.ratioLabel}>STOICHIOMETRIC BALANCE</Text>
         <View style={styles.ratioBar}>
            <View style={[styles.ratioFill, { 
               flex: calculations.h2Moles, 
               backgroundColor: '#00E5FF' 
            }]} />
            <View style={[styles.ratioPoint, { left: '66.6%' }]} /> 
            <View style={[styles.ratioFill, { 
               flex: calculations.o2Moles * 2, 
               backgroundColor: '#FF4444' 
            }]} />
         </View>
         <Text style={styles.ratioSub}>Ideal Ratio: 2 parts H : 1 part O</Text>
      </View>
    </View>
  );
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  controlPanel: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  inputGroup: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: RADIUS.md, alignItems: 'center' },
  label: { fontSize: 8, fontFamily: FONTS.displayBold, marginBottom: 8, letterSpacing: 1 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  valText: { fontSize: 18, fontFamily: FONTS.displayBold },
  moleSub: { fontSize: 9, color: '#888', marginTop: 4, fontFamily: 'monospace' },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  actionRow: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  igniteBtn: { flexDirection: 'row', backgroundColor: '#FFD166', paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.full, gap: 10, alignItems: 'center', elevation: 5 },
  igniteText: { color: '#000', fontFamily: FONTS.displayBold, fontSize: 13, letterSpacing: 1 },

  ratioBarContainer: { marginTop: 24 },
  ratioLabel: { fontSize: 8, color: '#888', fontFamily: FONTS.displayBold, marginBottom: 8, textAlign: 'center' },
  ratioBar: { height: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, flexDirection: 'row', overflow: 'hidden', position: 'relative' },
  ratioFill: { height: '100%' },
  ratioPoint: { position: 'absolute', width: 2, height: '100%', backgroundColor: '#fff', zIndex: 10, opacity: 0.5 },
  ratioSub: { fontSize: 9, color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 6 }
});
