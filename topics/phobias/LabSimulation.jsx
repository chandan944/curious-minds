import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

export default function PhobiaLab({ scientistMode = false, onLabBreaker }) {
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
  const [distance, setDistance] = useState(10); // 10 = far, 0 = touch
  const [cortisol, setCortisol] = useState(10); // 0-100 Panic meter
  const [heartRate, setHeartRate] = useState(70); 
  const [breathPhase, setBreathPhase] = useState('Idle');

  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Reference for previous distance to calculate delta
  const prevDistRef = useRef(10);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     if (gameOver || win) return;

     // Calculate panic spike based on distance changed rapidly
     const distChange = prevDistRef.current - distance;
     prevDistRef.current = distance;

     if (distChange > 0) {
        // Moving closer spikes panic depending on how close we are
        const multiplier = (10 - distance) * 2; // Closer = bigger spike
        const newPanic = Math.min(100, cortisol + (distChange * multiplier) + 10);
        setCortisol(newPanic);
        
        if (newPanic >= 100) {
           triggerHijack();
        }
     }

     // Background heartbeat loop based on cortisol
     setHeartRate(70 + (cortisol * 0.8));
     const speed = 1000 - (cortisol * 6);
     
     Animated.loop(
        Animated.sequence([
           Animated.timing(pulseAnim, { toValue: 1.2 + (cortisol * 0.005), duration: speed * 0.2, useNativeDriver: true }),
           Animated.timing(pulseAnim, { toValue: 1, duration: speed * 0.8, useNativeDriver: true })
        ])
     ).start();

     // Win check
     if (distance === 0 && cortisol < 60) {
        setWin(true);
        soundSuccess();
        if(onLabBreaker) onLabBreaker();
     }

  }, [distance]);

  const triggerHijack = () => {
     setGameOver(true);
     soundWhoosh();
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const moveCloser = () => {
     if (gameOver || win || distance <= 0) return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     setDistance(prev => Math.max(0, prev - 1));
  };

  const moveAway = () => {
     if (gameOver || win || distance >= 10) return;
     soundTap();
     setDistance(prev => Math.min(10, prev + 1));
     setCortisol(prev => Math.max(0, prev - 10)); // Relief (Avoidance trap)
  };

  const takeBreath = () => {
     if (gameOver || win) return;
     soundWhoosh();
     setBreathPhase('Inhale...');
     
     Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.5, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1, duration: 4000, easing: Easing.in(Easing.ease), useNativeDriver: true })
     ]).start(() => {
        setBreathPhase('Idle');
        setCortisol(prev => Math.max(10, prev - 25)); // Huge relief
     });

     setTimeout(() => setBreathPhase('Exhale... (Vagus Nerve)'), 2000);
  };

  const reset = () => {
     setGameOver(false);
     setWin(false);
     setDistance(10);
     setCortisol(10);
     prevDistRef.current = 10;
     pulseAnim.stopAnimation();
     breathAnim.stopAnimation();
  };

  const renderTarget = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ scale: 1 + ((10 - distance) * 0.2) }, { translateX: SIM_W/2 }, { translateY: 100 }] }}>
        <Circle r="20" fill="url(#redGlow)" />
        <Path d="M -10 10 L -20 20 M -5 10 L -10 25 M 5 10 L 10 25 M 10 10 L 20 20" stroke="#FFD166" strokeWidth="2" fill="none" />
        <Circle cx="0" cy="0" r="10" fill="#222" stroke="#FFD166" strokeWidth="2" />
        <Circle cx="-3" cy="-3" r="2" fill="#FF4444" />
        <Circle cx="3" cy="-3" r="2" fill="#FF4444" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>FEAR LADDER</Text>
            <Text style={{ color: color, fontSize: 24, fontFamily: 'monospace' }}>DIST: {distance}m</Text>
         </View>
         <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>AMYGDALA</Text>
            <Text style={{ color: cortisol > 80 ? '#FF4444' : '#00D4A0', fontSize: 24, fontFamily: 'monospace' }}>{cortisol.toFixed(0)}%</Text>
         </View>
      </View>

      {/* ── VR Arena Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         {/* Status Overlays */}
         {gameOver && <Text style={[styles.statusMsg, { color: '#FF4444' }]}>AMYGDALA HIJACK! PANIC ATTACK.</Text>}
         {win && <Text style={[styles.statusMsg, { color: '#00D4A0' }]}>PHOBIA OVERWRITTEN! YOU TOUCHED IT.</Text>}

         <Svg width={SIM_W} height={200}>
            <Defs>
               <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FF4444" stopOpacity={cortisol / 100} />
                  <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            {/* The Target (Spider/Trigger) moving closer */}
            {renderTarget()}
            
            {/* Vitals Graphing overlay */}
            <Path d={`M ${SIM_W-100} 180 L ${SIM_W-80} 180 L ${SIM_W-70} ${180 - (cortisol * 0.5)} L ${SIM_W-60} 180 L ${SIM_W} 180`} stroke={cortisol > 80 ? "#FF4444" : "#00D4A0"} strokeWidth="2" fill="none" />
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>HEART_RATE: {heartRate.toFixed(1)} bpm</Text>
              <Text style={styles.sciText}>CORTISOL_DENSITY: {(cortisol * 4.2).toFixed(0)} nmol/L</Text>
              <Text style={styles.sciText}>PREFRONTAL_CORTEX: {cortisol > 85 ? 'OFFLINE' : 'ONLINE'}</Text>
           </View>
         )}
      </View>

      {/* ── Therapy Controls ── */}
      <View style={styles.controlsGrid}>
         {!gameOver && !win ? (
            <>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#A855F7', flex: 1 }]} onPress={moveAway}>
                     <Text style={[styles.actionText, { color: '#A855F7' }]}>AVOID (Move Away)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#FF4444', flex: 1, backgroundColor: 'rgba(255,68,68,0.1)' }]} onPress={moveCloser}>
                     <Text style={[styles.actionText, { color: '#FF4444' }]}>EXPOSE (Move Closer)</Text>
                  </TouchableOpacity>
               </View>

               <Animated.View style={{ transform: [{ scale: breathAnim }] }}>
                  <TouchableOpacity style={[styles.breathBtn, { borderColor: '#00D4FF', backgroundColor: 'rgba(0, 212, 255, 0.1)' }]} onPress={takeBreath}>
                     <Icon name="wind" size={16} color="#00D4FF" />
                     <Text style={[styles.actionText, { color: '#00D4FF' }]}>VAGUS NERVE BREATH ({breathPhase})</Text>
                  </TouchableOpacity>
               </Animated.View>
            </>
         ) : (
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESTART THERAPY</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 200, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  statusMsg: { position: 'absolute', top: 20, fontSize: 12, fontFamily: FONTS.displayBold, letterSpacing: 1, textAlign: 'center', width: '100%', zIndex: 10 },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16, gap: 16 },
  actionBtn: { paddingVertical: 14, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center' },
  actionText: { fontSize: 10, fontFamily: FONTS.displayBold },

  breathBtn: { paddingVertical: 14, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },

  resetBtn: { marginTop: 10, padding: 16, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: '#333' }
});
