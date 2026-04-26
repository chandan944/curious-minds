import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText, Path, G, LinearGradient, Stop, Defs } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;
const SIM_CY = SIM_H / 2;

export default function SlothLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [momentum, setMomentum] = useState(0);       // The train moving toward work
  const [anxiety, setAnxiety] = useState(20);        // Resistance of the big task
  const [limbicEnergy, setLimbicEnergy] = useState(80); // Urge to doomscroll/distract
  
  const [gameState, setGameState] = useState('REST'); // REST, SCROLLING, STRUGGLING, FLOW
  
  const timerRef = useRef(null);
  const trainAnim = useRef(new Animated.Value(0)).current;

  // Time Engine
  useEffect(() => {
     timerRef.current = setInterval(() => {
         
         // Anxiety naturally grows when you are avoiding work (REST or SCROLLING)
         if (gameState === 'REST' || gameState === 'SCROLLING') {
             setAnxiety(prev => Math.min(100, prev + 2));
         }

         // Momentum naturally decays due to friction unless you are in STRUGGLING/FLOW
         if (gameState === 'REST' || gameState === 'SCROLLING') {
             setMomentum(prev => Math.max(0, prev - 5));
         }

         // In Flow, momentum fuels itself and burns anxiety!
         if (gameState === 'FLOW') {
             setAnxiety(prev => Math.max(0, prev - 4));
         }

         // Game States
         if (momentum >= 100 && gameState !== 'FLOW') {
             setGameState('FLOW');
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
             if(onLabBreaker) onLabBreaker();
         } else if (momentum > 10 && momentum < 100) {
             setGameState('STRUGGLING');
         } else if (momentum === 0 && limbicEnergy > 90) {
             setGameState('SCROLLING');
         } else if (momentum === 0) {
             setGameState('REST');
         }

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [momentum, anxiety, limbicEnergy, gameState]);

  // Train animation based on momentum
  useEffect(() => {
      Animated.timing(trainAnim, {
          toValue: (momentum / 100) * (SIM_W - 80),
          duration: 400,
          useNativeDriver: true
      }).start();
  }, [momentum]);

  // Actions
  const doomscroll = () => {
      if (gameState === 'FLOW') return;
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Doomscrolling temporarily drops anxiety (relief), but drops momentum to 0
      setAnxiety(prev => Math.max(0, prev - 15));
      setMomentum(0);
      setLimbicEnergy(100);
      setGameState('SCROLLING');
  };

  const forceHardWork = () => {
      if (gameState === 'FLOW') return;
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // If anxiety is too high, hard work is IMPOSSIBLE (Limbic block)
      if (anxiety > 80) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
      }

      // Hard work takes immense effort and spikes anxiety temporarily, but yields high momentum
      setAnxiety(prev => Math.min(100, prev + 10));
      setMomentum(prev => Math.min(100, prev + 20));
      setLimbicEnergy(prev => Math.max(0, prev - 10));
  };

  const twoMinuteRule = () => {
      if (gameState === 'FLOW') return;
      soundSuccess();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Magic Hack: Bypasses anxiety! The Limbic system isn't afraid of 2 minutes.
      setAnxiety(prev => Math.max(0, prev - 5));
      setMomentum(prev => Math.min(100, prev + 8)); // Small, safe momentum
      setLimbicEnergy(prev => Math.max(0, prev - 5));
  };

  const resetSimulation = () => {
      soundWhoosh();
      setMomentum(0);
      setAnxiety(20);
      setLimbicEnergy(80);
      setGameState('REST');
  };

  let headerColor = '#FF9F1C';
  if (gameState === 'SCROLLING') headerColor = '#FF4444';
  if (gameState === 'FLOW') headerColor = '#00E5FF';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1A1000' : '#FFFDF5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>MINDSET STATUS</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: headerColor }}>
                {gameState} {gameState === 'FLOW' ? '🚀' : gameState === 'SCROLLING' ? '🧟‍♂️' : ''}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 100 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>WORK MOMENTUM</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: momentum > 80 ? '#00E5FF' : txt1 }}>{Math.floor(momentum)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${momentum}%`, backgroundColor: momentum > 80 ? '#00E5FF' : '#FF9F1C' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC SCENE GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_W} height={SIM_H}>
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} rx="12" fill={glass1} stroke={border} />
            
            {/* The Wall of Activation Energy (Anxiety) */}
            <Rect x={SIM_W - 60} y={SIM_H - 120} width={40} height={40 + (anxiety/100) * 80} fill="#FF4444" opacity="0.8" rx="4" />
            <SvgText x={SIM_W - 40} y={SIM_H - 130} fill="#FF4444" fontSize="10" fontFamily="monospace" textAnchor="middle">Anxiety Wall: {Math.floor(anxiety)}</SvgText>

            {/* The Track */}
            <Rect x="20" y={SIM_H - 40} width={SIM_W - 40} height="4" fill="#555" />

            {/* The Brain/Train */}
            <Animated.View style={{ transform: [{ translateX: trainAnim }] }}>
                <Svg width="60" height="60" style={{ marginTop: SIM_H - 96, marginLeft: 20 }}>
                   {/* Trolley cart */}
                   <Rect x="0" y="20" width="40" height="30" fill={gameState === 'FLOW' ? '#00E5FF' : '#D4A74A'} rx="4" />
                   <Circle cx="10" cy="54" r="6" fill="#888" />
                   <Circle cx="30" cy="54" r="6" fill="#888" />
                   {/* Brain symbol */}
                   <Path d="M 12 30 C 8 20, 32 20, 28 30" fill="#FF9F1C" />
                </Svg>
            </Animated.View>

            {/* Gravity/Friction indicators */}
            {gameState === 'STRUGGLING' && (
                <Path d="M 40 180 L 10 180 M 30 170 L 10 180 L 30 190" stroke="#FF4444" strokeWidth="2" fill="none" opacity="0.5" />
            )}
            
            {/* Target Area */}
            <Rect x={SIM_W - 60} y={SIM_H - 40} width={40} height="40" fill="#00E5FF" opacity="0.3" />
            <SvgText x={SIM_W - 40} y={SIM_H - 15} fill="#00E5FF" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">FLOW</SvgText>

         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
              onPress={doomscroll}>
              <Text style={[styles.btnTxt, { color: '#FF4444' }]}>📱 Doomscroll (Relief)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: anxiety > 80 ? '#555555' : '#D4A74A20', borderColor: anxiety > 80 ? '#333' : '#D4A74A' }]}
              onPress={forceHardWork}
              activeOpacity={anxiety > 80 ? 1 : 0.7}>
              <Text style={[styles.btnTxt, { color: anxiety > 80 ? '#777' : '#D4A74A' }]}>🏋️‍♂️ Force Hard Work</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#4ECDC420', borderColor: '#4ECDC4', width: '90%' }]}
                 onPress={twoMinuteRule}>
                 <Text style={[styles.btnTxt, { color: '#4ECDC4' }]}>⏱️ 'Just 2 Minutes' Hack</Text>
             </TouchableOpacity>
          </View>
      </View>

      {anxiety > 80 && gameState !== 'FLOW' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 4 }}>Anxiety too high! Limbic System is blocking hard work!</Text>
      )}

      {gameState === 'FLOW' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetSimulation}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Simulation 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: headerColor, fontSize: 9, fontFamily: 'monospace' }}>ACTIVATION_ENERGY_REQD: {(anxiety * 1.5).toFixed(1)} J</Text>
            <Text style={{ color: headerColor, fontSize: 9, fontFamily: 'monospace' }}>MOMENTUM_VELOCITY: {(momentum * 0.8).toFixed(1)} m/s</Text>
            <Text style={{ color: headerColor, fontSize: 9, fontFamily: 'monospace' }}>PFC_DOMINANCE_RATIO: {(momentum / Math.max(1, limbicEnergy)).toFixed(2)}</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, minWidth: '45%', alignItems: 'center' },
  btnTxt: { fontSize: 11, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A1000', borderRadius: RADIUS.sm, borderWidth: 1 }
});
