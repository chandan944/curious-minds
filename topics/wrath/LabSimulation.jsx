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

export default function WrathLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [grudgeCount, setGrudgeCount] = useState(0);     // How many heavy weights are attached to YOU
  const [enemyPain, setEnemyPain] = useState(0);         // How much you've hurt them
  const [mentalBandwidth, setMentalBandwidth] = useState(100); // Your energy
  const [cortisol, setCortisol] = useState(0);           // Damage done to you
  
  const [gameState, setGameState] = useState('PEACEFUL'); // PEACEFUL, RUMINATING, CRASHED, FREE
  
  const timerRef = useRef(null);
  const playerAnimY = useRef(new Animated.Value(SIM_H / 2)).current;
  const enemyAnimY = useRef(new Animated.Value(SIM_H / 2)).current;

  // Time Engine
  useEffect(() => {
     timerRef.current = setInterval(() => {
         
         // Grudges drain bandwidth constantly (Rumination)
         if (grudgeCount > 0) {
             setMentalBandwidth(prev => Math.max(0, prev - (grudgeCount * 2)));
             setCortisol(prev => Math.min(100, prev + (grudgeCount * 1.5)));
         }

         // Game States
         if (grudgeCount === 0 && gameState === 'RUMINATING') {
             setGameState('FREE');
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
             if(onLabBreaker) onLabBreaker();
         } else if (mentalBandwidth === 0) {
             if (gameState !== 'CRASHED') {
                 setGameState('CRASHED');
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
             }
         } else if (grudgeCount > 0 && gameState !== 'CRASHED') {
             setGameState('RUMINATING');
         }

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [grudgeCount, mentalBandwidth, gameState]);

  // Animate the avatars sinking based on weight
  useEffect(() => {
      // You sink based on grudges + cortisol
      Animated.timing(playerAnimY, {
          toValue: (SIM_H / 2) - 30 + (grudgeCount * 15) + (cortisol * 0.5),
          duration: 400,
          useNativeDriver: true
      }).start();

      // Enemy sinks based on vengeance
      Animated.timing(enemyAnimY, {
          toValue: (SIM_H / 2) - 30 + (enemyPain * 10),
          duration: 400,
          useNativeDriver: true
      }).start();
  }, [grudgeCount, cortisol, enemyPain]);


  // Actions
  const ruminate = () => {
      // Thinking about it adds a grudge weight
      if (gameState === 'CRASHED' || gameState === 'FREE') return;
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setGrudgeCount(prev => prev + 1);
  };

  const takeVengeance = () => {
      if (gameState === 'CRASHED' || gameState === 'FREE') return;
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Vengeance hurts them, but requires you to Ruminate heavily
      setEnemyPain(prev => prev + 2);
      setGrudgeCount(prev => prev + 2); // Double punishment for you
      setCortisol(prev => Math.min(100, prev + 10)); // Spike of stress
  };

  const forgive = () => {
      if (grudgeCount === 0 || gameState === 'FREE') return;
      soundSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Forgiveness cuts the tethers. It doesn't heal the enemy, but it heals YOU.
      setGrudgeCount(0);
      setCortisol(0);
      setMentalBandwidth(100);
  };

  const resetSimulation = () => {
      soundWhoosh();
      setGrudgeCount(0);
      setEnemyPain(0);
      setMentalBandwidth(100);
      setCortisol(0);
      setGameState('PEACEFUL');
  };

  let boxColor = '#FF9F1C';
  if (gameState === 'CRASHED') boxColor = '#FF4444';
  if (gameState === 'FREE') boxColor = '#00E5FF';
  if (gameState === 'PEACEFUL') boxColor = '#81C784';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1F0A0A' : '#FFFDF5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>NERVOUS SYSTEM</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: boxColor }}>
                {gameState}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 110 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>MENTAL BANDWIDTH</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: mentalBandwidth > 50 ? '#81C784' : '#FF4444' }}>{Math.floor(mentalBandwidth)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${mentalBandwidth}%`, backgroundColor: mentalBandwidth > 50 ? '#81C784' : '#FF4444' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC SCENE GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_W} height={SIM_H}>
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} rx="12" fill={glass1} stroke={border} />
            
            {/* The Water/Abyss level indicator */}
            <Rect x="0" y={SIM_H / 2} width={SIM_W} height={SIM_H / 2} fill="#FF4444" opacity={0.1} />
            <Path d={`M 0 ${SIM_H/2} Q ${SIM_W/4} ${(SIM_H/2)-10} ${SIM_W/2} ${SIM_H/2} T ${SIM_W} ${SIM_H/2}`} fill="none" stroke="#FF4444" strokeWidth="1" opacity="0.3" />
            <SvgText x={SIM_W / 2} y={SIM_H - 10} fill="#FF4444" opacity="0.5" fontSize="10" fontFamily="monospace" textAnchor="middle">Cortisol Sea (Burnout)</SvgText>

            {/* ENEMY AVATAR */}
            <Animated.View style={{ transform: [{ translateX: SIM_W - 80 }, { translateY: enemyAnimY }] }}>
                <Svg width="60" height="150" style={{ overflow: 'visible' }}>
                   {/* Tether line */}
                   <Rect x="28" y="40" width="4" height={enemyPain * 10} fill="#555" />
                   {/* Weights */}
                   {Array.from({ length: enemyPain }).map((_, i) => (
                       <Rect key={i} x="10" y={40 + (i * 12)} width="40" height="10" fill="#FF4444" rx="2" />
                   ))}
                   <Circle cx="30" cy="20" r="16" fill="#555" />
                   <Text x="30" y="24" fill="#111" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">ENEMY</Text>
                </Svg>
            </Animated.View>

            {/* PLAYER AVATAR */}
            <Animated.View style={{ transform: [{ translateX: 20 }, { translateY: playerAnimY }] }}>
                <Svg width="60" height="200" style={{ overflow: 'visible' }}>
                   {/* Tether line */}
                   {grudgeCount > 0 && <Rect x="28" y="40" width="4" height={grudgeCount * 15} fill="#D4A74A" />}
                   
                   {/* Grudge Weights */}
                   {Array.from({ length: grudgeCount }).map((_, i) => (
                       <G key={i} y={40 + (i * 15)}>
                           <Rect x="10" width="40" height="14" fill="#D4A74A" rx="4" />
                           <Text x="30" y="10" fill="#111" fontSize="8" fontFamily="monospace" textAnchor="middle">GRUDGE</Text>
                       </G>
                   ))}
                   
                   <Circle cx="30" cy="20" r="16" fill={boxColor} />
                   <Text x="30" y="24" fill={isDark ? '#000' : '#FFF'} fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">YOU</Text>
                </Svg>
            </Animated.View>

            {/* Rumination Connection Line */}
            {grudgeCount > 0 && (
                <Path 
                    d={`M 60 ${SIM_H/2} Q ${SIM_W/2} ${(SIM_H/2) - 50} ${SIM_W - 60} ${SIM_H/2}`} 
                    fill="none" stroke="#FF9F1C" strokeWidth="2" strokeDasharray="4 6" opacity="0.5" 
                />
            )}
            
            {grudgeCount > 0 && (
                <SvgText x={SIM_W/2} y={(SIM_H/2) - 60} fill="#FF9F1C" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">Rumination Tether</SvgText>
            )}

         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF9F1C20', borderColor: '#FF9F1C' }]}
              onPress={ruminate}
              disabled={gameState === 'FREE' || gameState === 'CRASHED'}>
              <Text style={[styles.btnTxt, { color: '#FF9F1C' }]}>🔄 Ruminate (Relive it)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
              onPress={takeVengeance}
              disabled={gameState === 'FREE' || gameState === 'CRASHED'}>
              <Text style={[styles.btnTxt, { color: '#FF4444' }]}>⚔️ Take Vengeance</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: grudgeCount === 0 ? '#333' : '#00E5FF20', borderColor: grudgeCount === 0 ? '#555' : '#00E5FF', width: '90%' }]}
                 onPress={forgive}
                 disabled={grudgeCount === 0 || gameState === 'FREE'}>
                 <Text style={[styles.btnTxt, { color: grudgeCount === 0 ? '#777' : '#00E5FF' }]}>✂️ Forgive (Sever Tether)</Text>
             </TouchableOpacity>
          </View>
      </View>

      {gameState === 'CRASHED' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 4 }}>You crashed your nervous system into the Cortisol Sea. They won.</Text>
      )}

      {(gameState === 'FREE' || gameState === 'CRASHED') && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetSimulation}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Timeline 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: boxColor, fontSize: 9, fontFamily: 'monospace' }}>CORTISOL_LOAD: {Math.floor(cortisol)}% mg/dL</Text>
            <Text style={{ color: boxColor, fontSize: 9, fontFamily: 'monospace' }}>AMYGDALA_DRAIN: -{(grudgeCount * 2)} mb/s</Text>
            <Text style={{ color: boxColor, fontSize: 9, fontFamily: 'monospace' }}>PARASYMPATHETIC_STATE: {grudgeCount === 0 ? 'ACTIVE' : 'SUPPRESSED'}</Text>
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
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1F0A0A', borderRadius: RADIUS.sm, borderWidth: 1 }
});
