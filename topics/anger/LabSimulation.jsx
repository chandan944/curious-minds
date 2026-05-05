import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');
const SIM_size = width - 60;
const SIM_CX = SIM_size / 2;
const SIM_CY = SIM_size / 2 + 30;

export default function AngerLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [stress, setStress] = useState(20);          // 0 to 100
  const [heartRate, setHeartRate] = useState(70);    // 60 to 180
  const [cortisol, setCortisol] = useState(150);     // 100 to 1000 nmol/L
  const [logicPower, setLogicPower] = useState(100); // 0 to 100
  const [gameState, setGameState] = useState('CALM'); // CALM, ELEVATED, HIJACKED, EXPLODED, ZEN
  
  const [triggerStack, setTriggerStack] = useState(0); 

  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Time Engine
  useEffect(() => {
     if (gameState === 'EXPLODED' || gameState === 'ZEN') return;

     timerRef.current = setInterval(() => {
         // Natural Stress Growth (Life happens)
         setStress(prev => {
             const next = prev + (triggerStack > 3 ? 3 : 1);
             return next > 100 ? 100 : next;
         });
         
         // Logic dies as Stress exceeds threshhold
         if (stress > 60) {
             setLogicPower(prev => Math.max(0, prev - 4));
         } else {
             setLogicPower(prev => Math.min(100, prev + 2));
         }

         // Cortisol Follows Stress
         setCortisol(prev => {
             const target = 100 + (stress * 8) + (triggerStack * 100);
             return prev < target ? prev + 15 : prev > target ? prev - 5 : prev;
         });

         // HR Follows Cortisol
         setHeartRate(prev => {
             let base = 70 + (cortisol / 10);
             // Jitter
             base += Math.random() * 5 - 2.5;
             return Math.max(60, Math.min(180, base));
         });

         // Check States
         if (stress > 90 || cortisol > 900) {
             if (gameState !== 'HIJACKED') {
                setGameState('HIJACKED');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
             }
         } else if (stress > 60) {
             setGameState('ELEVATED');
         } else {
             setGameState('CALM');
         }
         
         // Boom?
         if (gameState === 'HIJACKED' && logicPower <= 0) {
              setGameState('EXPLODED');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              clearInterval(timerRef.current);
         }

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [gameState, stress, logicPower, triggerStack, cortisol]);

  // HR Pulsation
  useEffect(() => {
      if (gameState === 'EXPLODED' || gameState === 'ZEN') return;
      const beatDur = 60000 / heartRate;
      
      const pulse = Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: beatDur * 0.2, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: beatDur * 0.8, useNativeDriver: true })
      ]);
      Animated.loop(pulse).start();
      
      return () => pulseAnim.stopAnimation();
  }, [heartRate, gameState]);


  // Actions
  const addTrigger = () => {
     if (gameState === 'EXPLODED') return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
     setTriggerStack(prev => prev + 1);
     setStress(prev => Math.min(100, prev + 15));
  };

  const breathe = () => {
     if (gameState === 'EXPLODED') return;
     soundWhoosh();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setHeartRate(prev => Math.max(60, prev - 15));
     setStress(prev => Math.max(0, prev - 10));
     
     // Zen Master Achievement
     if (triggerStack > 5 && stress < 50 && gameState !== 'EXPLODED') {
         if (logicPower === 100) {
            setGameState('ZEN');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if(onLabBreaker) onLabBreaker();
         }
     }
  };

  const reframe = () => {
     if (gameState === 'EXPLODED') return;
     if (logicPower < 40) {
         // Can't reframe if logic is offline!
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         return; 
     }
     soundSuccess();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     setTriggerStack(0); // Clear triggers!
     setStress(prev => Math.max(0, prev - 25));
  };

  const resetGame = () => {
    soundWhoosh();
    setStress(20);
    setHeartRate(70);
    setCortisol(150);
    setLogicPower(100);
    setTriggerStack(0);
    setGameState('CALM');
  };

  let volcanoColor = '#81C784';
  if (gameState === 'ELEVATED') volcanoColor = '#FFB74D';
  if (gameState === 'HIJACKED') volcanoColor = '#FF4444';
  if (gameState === 'EXPLODED') volcanoColor = '#991B1B';
  if (gameState === 'ZEN') volcanoColor = '#A855F7';

  // Volcano math
  const lavaY = SIM_CY - 10 - ((stress / 100) * 120);

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1A0505' : '#FFF5F5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>SYSTEM STATUS</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: volcanoColor }}>{gameState}</Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 90 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>PREFRONTAL LOGIC</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: logicPower < 30 ? '#FF4444' : txt1 }}>{Math.floor(logicPower)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${logicPower}%`, backgroundColor: logicPower < 30 ? '#FF4444' : '#00D4FF' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC VOLCANO GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_size} height={SIM_size}>
            <Defs>
                <SvgLinear id="lava" x1="0" y1="1" x2="0" y2="0">
                    <Stop offset="0%" stopColor="#FF0000" />
                    <Stop offset="100%" stopColor="#FF9F1C" />
                </SvgLinear>
            </Defs>

            {/* Background Sky */}
            <Rect x="0" y="0" width={SIM_size} height={SIM_size} rx="12" fill={glass1} stroke={border} />

            {/* Volcano Body */}
            <Path d={`M ${SIM_CX - 70} ${SIM_CY + 80} L ${SIM_CX - 40} ${SIM_CY - 20} L ${SIM_CX + 40} ${SIM_CY - 20} L ${SIM_CX + 70} ${SIM_CY + 80} Z`} fill={isDark ? '#222' : '#CCC'} stroke="#555" strokeWidth="2" />
            
            {/* Lava Level */}
            <Path d={`M ${SIM_CX - 40} ${SIM_CY - 20} L ${SIM_CX - 40 + ((lavaY - (SIM_CY-20))/100)*30} ${lavaY} L ${SIM_CX + 40 - ((lavaY - (SIM_CY-20))/100)*30} ${lavaY} L ${SIM_CX + 40} ${SIM_CY - 20} Z`} fill="url(#lava)" />
            
            <Rect x={SIM_CX - 20} y={lavaY} width="40" height={Math.max(0, SIM_CY + 80 - lavaY)} fill="url(#lava)" />

            {/* Amygdala Core (Pulsing) */}
            <AnimatedCircle cx={SIM_CX} cy={SIM_CY + 20} r="15" fill={volcanoColor} 
                {...{ style: { transform: [{ scale: pulseAnim }, { translateX: SIM_CX }, { translateY: SIM_CY + 20 }] } }} 
                translateX={-SIM_CX} translateY={-(SIM_CY + 20)}
            />

            {/* Labels */}
            <SvgText x={10} y={20} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily={FONTS.displayBold}>Blood Cortisol</SvgText>
            <SvgText x={10} y={35} fill={volcanoColor} fontSize="14" fontFamily="monospace">{Math.floor(cortisol)} nmol/L</SvgText>

            <SvgText x={SIM_size - 10} y={20} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="end" fontFamily={FONTS.displayBold}>Heart Rate</SvgText>
            <SvgText x={SIM_size - 10} y={35} fill={heartRate > 100 ? '#FF4444' : txt1} fontSize="14" textAnchor="end" fontFamily="monospace">{Math.floor(heartRate)} BPM</SvgText>

            {gameState === 'EXPLODED' && (
               <Circle cx={SIM_CX} cy={SIM_CY - 40} r="50" fill="#FF0000" opacity="0.6" />
            )}
         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444', width: '80%' }]}
                 onPress={addTrigger}>
                 <Text style={[styles.btnTxt, { color: '#FF4444' }]}>⚡ Life Happens (Add Trigger) [x{triggerStack}]</Text>
             </TouchableOpacity>
          </View>

          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#00D4FF20', borderColor: '#00D4FF' }]}
              onPress={breathe}>
              <Text style={[styles.btnTxt, { color: '#00D4FF' }]}>🫁 Deep Breath</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: logicPower < 40 ? '#555555' : '#D4A74A20', borderColor: logicPower < 40 ? '#333' : '#D4A74A' }]}
              onPress={reframe}
              activeOpacity={logicPower < 40 ? 1 : 0.7}>
              <Text style={[styles.btnTxt, { color: logicPower < 40 ? '#777' : '#D4A74A' }]}>🧠 Reframe Story</Text>
          </TouchableOpacity>
      </View>

      {logicPower < 40 && gameState !== 'EXPLODED' && gameState !== 'ZEN' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 8 }}>Logic Offline! Cannot Reframe!</Text>
      )}

      {(gameState === 'EXPLODED' || gameState === 'ZEN') && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Nervous System 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>AMY_ACTIVATION_IDX: {(stress / 100).toFixed(2)}</Text>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>PFC_SUPPRESSION_DELTA: {-(100 - logicPower).toFixed(1)}%</Text>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>VAGAL_TONE_INFLUENCE: {heartRate < 80 ? 'HIGH' : 'LOW'}</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, minWidth: '45%', alignItems: 'center', marginBottom: 8 },
  btnTxt: { fontSize: 11, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A0505', borderRadius: RADIUS.sm, borderWidth: 1 }
});
