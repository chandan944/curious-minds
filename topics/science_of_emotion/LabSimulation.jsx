import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Text as SvgText, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

const AFFECT_MAP = [
   // High Arousal, High Valence
   { a: 90, v: 90, ctx: 'Party', emotion: 'Ecstasy 🎉', color: '#FFD166' },
   { a: 80, v: 60, ctx: 'Speech', emotion: 'Excitement 🚀', color: '#00D4FF' },
   
   // High Arousal, Low Valence
   { a: 90, v: -90, ctx: 'Dark Alley', emotion: 'Terror 😱', color: '#FF4444' },
   { a: 80, v: -50, ctx: 'Speech', emotion: 'Anxiety 😰', color: '#A855F7' },
   { a: 90, v: -80, ctx: 'Traffic', emotion: 'Rage 😡', color: '#FF0000' },

   // Low Arousal, High Valence
   { a: -80, v: 80, ctx: 'Beach', emotion: 'Serenity 🌅', color: '#00D4A0' },
   { a: -50, v: 50, ctx: 'Couch', emotion: 'Contentment ☕', color: '#4ECDC4' },

   // Low Arousal, Low Valence
   { a: -80, v: -80, ctx: 'Isolated', emotion: 'Depression 🪹', color: '#333333' },
   { a: -60, v: -50, ctx: 'Couch', emotion: 'Boredom 🥱', color: '#666666' }
];

export default function EmotionLab({ scientistMode = false, onLabBreaker }) {
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
  const [arousal, setArousal] = useState(0); // -100 to 100
  const [valence, setValence] = useState(0); // -100 to 100
  const [context, setContext] = useState('Neutral Room');

  const [constructedEmotion, setEmotion] = useState({ label: 'Calm Baseline', color: '#888' });

  const dotAnim = useRef(new Animated.ValueXY({ x: SIM_W/2, y: SIM_H/2 })).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     Animated.spring(dotAnim, {
        toValue: { 
           x: (SIM_W/2) + (valence * (SIM_W/2) / 100), 
           y: (SIM_H/2) - (arousal * (SIM_H/2) / 100) 
        },
        useNativeDriver: false
     }).start();

     // Heartbeat pulse depends on arousal
     const speed = 1500 - (Math.abs(arousal) * 10);
     Animated.loop(
        Animated.sequence([
           Animated.timing(pulseAnim, { toValue: 1.5, duration: speed * 0.2, useNativeDriver: true }),
           Animated.timing(pulseAnim, { toValue: 1, duration: speed * 0.8, useNativeDriver: true })
        ])
     ).start();

     // Find closest emotion by Euclidean distance
     let closest = { label: 'Affect (Raw Feeling)', color: '#888' };
     let minDist = 999;

     AFFECT_MAP.forEach(em => {
        if (context === 'Neutral Room' || em.ctx === context || context === 'IGNORE_CTX') {
           const dist = Math.sqrt(Math.pow(arousal - em.a, 2) + Math.pow(valence - em.v, 2));
           if (dist < minDist && dist < 60) {
              minDist = dist;
              closest = { label: em.emotion, color: em.color };
           }
        }
     });

     setEmotion(closest);

     if (minDist < 20 && context === 'Speech' && arousal > 70 && valence > 50) {
        soundSuccess();
        if(onLabBreaker) onLabBreaker();
     }

  }, [arousal, valence, context]);

  const updateAttr = (attr, val) => {
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     if (attr === 'a') setArousal(prev => Math.max(-100, Math.min(100, prev + val)));
     if (attr === 'v') setValence(prev => Math.max(-100, Math.min(100, prev + val)));
  };

  const changeContext = () => {
     soundWhoosh();
     const ctxList = ['Neutral Room', 'Speech', 'Dark Alley', 'Beach', 'Traffic'];
     const nextIdx = (ctxList.indexOf(context) + 1) % ctxList.length;
     setContext(ctxList[nextIdx]);
  };

  const renderAffectPoint = () => {
    // @ts-ignore: style prop on AnimatedG/AnimatedCircle causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ translateX: dotAnim.x }, { translateY: dotAnim.y }] }}>
        <AnimatedCircle r={150} fill="url(#affectGlow)" style={{ transform: [{ scale: pulseAnim }] }} />
        <Circle r="10" fill={constructedEmotion.color} stroke="#fff" strokeWidth="2" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>CONSTRUCTED EMOTION</Text>
            <Text style={{ color: constructedEmotion.color, fontSize: 22, fontFamily: FONTS.displayBold }}>{constructedEmotion.label || 'Unknown Affect'}</Text>
         </View>
         <TouchableOpacity onPress={changeContext} style={[styles.ctxBtn, { borderColor: border }]}>
            <Text style={{ color: txtM, fontSize: 8 }}>CONTEXT LENS</Text>
            <Text style={{ color: color, fontSize: 12, fontFamily: FONTS.displayBold }}>{context}</Text>
         </TouchableOpacity>
      </View>

      {/* ── Circumplex Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#fff' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <RadialGradient id="affectGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={constructedEmotion.color} stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            {/* Axes */}
            <Path d={`M ${SIM_W/2} 0 L ${SIM_W/2} ${SIM_H}`} stroke={txtM} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
            <Path d={`M 0 ${SIM_H/2} L ${SIM_W} ${SIM_H/2}`} stroke={txtM} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />

            <SvgText x={SIM_W/2} y="15" fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">HIGH AROUSAL (Energy)</SvgText>
            <SvgText x={SIM_W/2} y={SIM_H - 10} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">LOW AROUSAL</SvgText>
            <SvgText x="10" y={SIM_H/2 - 5} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="start">UNPLEASANT</SvgText>
            <SvgText x={SIM_W - 10} y={SIM_H/2 - 5} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="end">PLEASANT</SvgText>

            {/* The Affect Point */}
            {renderAffectPoint()}
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>VALENCE_X: {valence.toFixed(0)} | AROUSAL_Y: {arousal.toFixed(0)}</Text>
              <Text style={styles.sciText}>CTX_PREDICTION_WEIGHT: 0.85</Text>
              <Text style={styles.sciText}>HEART_RATE_BPM: {(70 + (arousal * 0.8)).toFixed(0)}</Text>
           </View>
         )}
      </View>

      {/* ── Biology Controls ── */}
      <View style={styles.controls}>
         <Text style={{ color: txt1, fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 6 }}>BIOLOGICAL AFFECT (RAW DATA)</Text>
         
         <View style={styles.btnRow}>
            <View style={styles.ctrlGroup}>
               <Text style={{ fontSize: 9, color: '#888' }}>ENERGY (AROUSAL)</Text>
               <View style={styles.btns}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateAttr('a', -20)}><Text style={{ color: txt1, fontSize: 16 }}>-</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateAttr('a', 20)}><Text style={{ color: txt1, fontSize: 16 }}>+</Text></TouchableOpacity>
               </View>
            </View>

            <View style={styles.ctrlGroup}>
               <Text style={{ fontSize: 9, color: '#888' }}>PLEASURE (VALENCE)</Text>
               <View style={styles.btns}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateAttr('v', -20)}><Text style={{ color: txt1, fontSize: 16 }}>-</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateAttr('v', 20)}><Text style={{ color: txt1, fontSize: 16 }}>+</Text></TouchableOpacity>
               </View>
            </View>
         </View>
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  ctxBtn: { padding: 10, borderWidth: 1, borderRadius: RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controls: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ctrlGroup: { alignItems: 'center', gap: 6 },
  btns: { flexDirection: 'row', gap: 10 },
  miniBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }
});
