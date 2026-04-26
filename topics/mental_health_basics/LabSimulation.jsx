import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 420;

export default function MentalHealthLab({ scientistMode = false }) {
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
  const [stage, setStage] = useState(0); // 0: Storm, 1: Grounding, 2: Calm
  const [itemsFound, setItemsFound] = useState(0);
  const [cortisol, setCortisol] = useState(85);
  
  const stormOpacity = useRef(new Animated.Value(1)).current;
  const sunOpacity = useRef(new Animated.Value(0)).current;
  const itemsAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

  // ── Handlers ───────────────────────────────────
  useEffect(() => {
    if (stage === 1) {
       // Pop in items
       itemsAnims.forEach((anim, i) => {
          Animated.delay(i * 300).start(() => {
             Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
          });
       });
    }
    if (itemsFound >= 8) {
       transitionToCalm();
    }
  }, [stage, itemsFound]);

  const findItem = (index) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(itemsAnims[index], { toValue: 0, duration: 300, useNativeDriver: true }).start();
    setItemsFound(prev => prev + 1);
    setCortisol(prev => Math.max(15, prev - 10));
  };

  const transitionToCalm = () => {
    soundSuccess();
    setStage(2);
    Animated.parallel([
      Animated.timing(stormOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
      Animated.timing(sunOpacity, { toValue: 1, duration: 2000, useNativeDriver: true })
    ]).start();
  };

  const startGrounding = () => {
    soundWhoosh();
    setStage(1);
  };

  const reset = () => {
     setStage(0);
     setItemsFound(0);
     setCortisol(85);
     stormOpacity.setValue(1);
     sunOpacity.setValue(0);
  };

  // ── Render ─────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* 📊 Bio-Meter */}
      <View style={styles.meterRow}>
         <View style={styles.meter}>
            <Text style={styles.meterLabel}>CORTISOL (STRESS)</Text>
            <View style={styles.barTrack}>
               <View style={[styles.barFill, { width: `${cortisol}%`, backgroundColor: cortisol > 50 ? '#FF4444' : '#00D4A0' }]} />
            </View>
         </View>
      </View>

      {/* 🏞️ Garden Simulation */}
      <View style={[styles.simBox, { borderColor: border }]}>
        <Svg width={SIM_W} height={SIM_H}>
           <Defs>
              <LinearGradient id="stormBg" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0" stopColor="#222" />
                 <Stop offset="1" stopColor="#444" />
              </LinearGradient>
              <LinearGradient id="calmBg" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0" stopColor="#FF9F1C" stopOpacity="0.4" />
                 <Stop offset="1" stopColor="#00D4A0" stopOpacity="0.8" />
              </LinearGradient>
           </Defs>

           {/* Storm Layer */}
           <AnimatedRect width={SIM_W} height={SIM_H} fill="url(#stormBg)" 
// @ts-ignore
           style={
              // @ts-ignore
              { opacity: stormOpacity }} />
           
           {/* Calm Layer */}
           <AnimatedRect width={SIM_W} height={SIM_H} fill="url(#calmBg)" 
// @ts-ignore
           style={
              // @ts-ignore
              { opacity: sunOpacity }} />

           {/* Items to Find (Stage 1) */}
           {stage === 1 && itemsAnims.map((anim, i) => {
              const x = (i % 3) * 100 + 60;
              const y = Math.floor(i / 3) * 80 + 100;
              // @ts-ignore
              return (
                 <AnimatedG key={i} 
// @ts-ignore
                 style={{ opacity: anim, transform: [{ scale: anim }] }}>
                    <TouchableOpacity onPress={() => findItem(i)}>
                       <Circle cx={x} cy={y} r="25" fill="rgba(255,255,255,0.1)" />
                       <Icon name={i % 2 === 0 ? "flower" : "music"} size={20} 
// @ts-ignore
                       x={x-10} y={y-10} color={i % 2 === 0 ? "#FF69B4" : "#00D4FF"} />
                    </TouchableOpacity>
                 </AnimatedG>
              );
           })}

           {/* Labels */}
           {stage === 0 && (
              <G transform={`translate(${SIM_W/2}, ${SIM_H/2})`}>
                 <SvgText fill="#fff" fontSize="16" fontFamily={FONTS.displayBold} textAnchor="middle">THE OVERWHELMED MIND</SvgText>
                 <SvgText y="20" fill="#888" fontSize="10" textAnchor="middle">THOUGHTS ARE RACING...</SvgText>
              </G>
           )}

           {stage === 2 && (
              <G transform={`translate(${SIM_W/2}, ${SIM_H/2})`}>
                 <SvgText fill="#fff" fontSize="18" fontFamily={FONTS.displayBold} textAnchor="middle">RESILIENCE ACHIEVED</SvgText>
                 <SvgText y="24" fill="rgba(255,255,255,0.8)" fontSize="12" textAnchor="middle">THE STORM HAS PASSED. ☀️</SvgText>
              </G>
           )}
        </Svg>

        <View style={styles.uiOverlay}>
           {stage === 0 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={startGrounding}>
                 <Text style={styles.btnText}>PRACTICE GROUNDING (5-4-3-2-1)</Text>
              </TouchableOpacity>
           )}
           {stage === 1 && (
              <View style={styles.groundingHint}>
                 <Text style={styles.hintText}>FIND 8 SENSORY CUES TO CALM THE STORM ({itemsFound}/8)</Text>
              </View>
           )}
           {stage === 2 && (
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#333' }]} onPress={reset}>
                 <Text style={styles.btnText}>RESET SIMULATION</Text>
              </TouchableOpacity>
           )}
        </View>

        {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>VAGUS ACTIVATION: {(itemsFound * 12).toFixed(1)}%</Text>
              <Text style={styles.sciText}>HRV INDEX: {(1.5 + (itemsFound*0.2)).toFixed(2)} ms</Text>
           </View>
        )}
      </View>

      <View style={styles.footerInfo}>
         <Icon name="info" size={14} color="#888" />
         <Text style={styles.footerText}>Grounding exercises work by shifting focus from the Amygdala to the Sensory Cortex.</Text>
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  meterRow: { marginBottom: 16 },
  meter: { width: '100%' },
  meterLabel: { fontSize: 8, fontFamily: FONTS.displayBold, color: '#888', marginBottom: 6, letterSpacing: 1 },
  barTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  uiOverlay: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  primaryBtn: { backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.full, elevation: 5 },
  btnText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 13 },
  
  groundingHint: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: RADIUS.md },
  hintText: { color: '#fff', fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 },

  sciOverlay: { position: 'absolute', top: 10, right: 10 },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace', textAlign: 'right' },

  footerInfo: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center', paddingHorizontal: 10 },
  footerText: { flex: 1, fontSize: 10, color: '#666', fontStyle: 'italic', lineHeight: 14 }
});
