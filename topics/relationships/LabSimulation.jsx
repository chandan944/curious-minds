import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

export default function RelationshipsLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [anxiousPos, setAnxiousPos] = useState(40);     // Left side -> moves right (towards Avoidant)
  const [avoidantPos, setAvoidantPos] = useState(250);  // Right side -> moves right (away from Anxious)
  
  const [anxiousPanic, setAnxiousPanic] = useState(50);
  const [avoidantPanic, setAvoidantPanic] = useState(0);
  const [secureTrust, setSecureTrust] = useState(10);
  
  const [gameState, setGameState] = useState('DANCING'); // DANCING, BROKEN, SECURE
  
  const timerRef = useRef(null);
  
  const anxiousXAnim = useRef(new Animated.Value(40)).current;
  const avoidantXAnim = useRef(new Animated.Value(250)).current;

  // The Dance Engine
  useEffect(() => {
     if (gameState === 'BROKEN' || gameState === 'SECURE') return;

     timerRef.current = setInterval(() => {
         
         const distance = Math.abs(avoidantPos - anxiousPos);

         // Avoidant mechanics
         if (distance < 100) {
             // Too close! Avoidant panics and pulls away
             setAvoidantPanic(prev => Math.min(100, prev + 15));
             setAvoidantPos(prev => Math.min(SIM_W - 30, prev + 20));
         } else {
             // Safe distance, Avoidant calms down
             setAvoidantPanic(prev => Math.max(0, prev - 5));
         }

         // Anxious mechanics
         if (distance > 150) {
             // Too far! Anxious panics
             setAnxiousPanic(prev => Math.min(100, prev + 15));
         } else {
             // Safe distance, Anxious calms down
             setAnxiousPanic(prev => Math.max(0, prev - 10));
         }

         // Tension Snapping Limits
         if (distance > 260) {
             setGameState('BROKEN');
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         }

         // Secure Trust Decay (Need consistent maintenance)
         setSecureTrust(prev => Math.max(0, prev - 1));

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [anxiousPos, avoidantPos, anxiousPanic, avoidantPanic, secureTrust, gameState]);

  // Animate Avatars
  useEffect(() => {
      Animated.spring(anxiousXAnim, { toValue: anxiousPos, useNativeDriver: true, tension: 40 }).start();
      Animated.spring(avoidantXAnim, { toValue: avoidantPos, useNativeDriver: true, tension: 40 }).start();
  }, [anxiousPos, avoidantPos]);

  // Actions
  const chaseAggressively = () => {
      if (gameState !== 'DANCING') return;
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Anxious moves rapidly toward Avoidant to reduce panic
      setAnxiousPos(prev => Math.min(avoidantPos - 20, prev + 40));
      setAnxiousPanic(0); // Temporary relief for Anxious, but...
      // Avoidant threshold triggers on next tick!
  };

  const withdrawCompletely = () => {
      if (gameState !== 'DANCING') return;
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Avoidant rapidly retreats
      setAvoidantPos(prev => Math.min(SIM_W - 30, prev + 40));
  };

  const secureVulnerability = () => {
      if (gameState !== 'DANCING') return;
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Slow, consistent approach without breaching the Avoidant's bubble immediately
      // Lowers both panics and builds Trust
      setAnxiousPanic(prev => Math.max(0, prev - 10));
      setAvoidantPanic(prev => Math.max(0, prev - 10));
      setSecureTrust(prev => {
          const next = prev + 15;
          if (next >= 100) {
              setGameState('SECURE');
              soundSuccess();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if(onLabBreaker) onLabBreaker();
          }
          return Math.min(100, next);
      });
  };

  const resetSim = () => {
      soundWhoosh();
      setAnxiousPos(40);
      setAvoidantPos(250);
      setAnxiousPanic(50);
      setAvoidantPanic(0);
      setSecureTrust(10);
      setGameState('DANCING');
  };

  const distance = Math.abs(avoidantPos - anxiousPos);
  
  // Dynamic styling
  let tetherColor = '#D4A74A';
  if (distance > 200) tetherColor = '#FF4444';
  if (gameState === 'SECURE') tetherColor = '#81C784';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#110F20' : '#F5FAFF' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>RELATIONSHIP STATE</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: gameState === 'BROKEN' ? '#FF4444' : gameState === 'SECURE' ? '#81C784' : '#4ECDC4' }}>
                {gameState === 'BROKEN' ? 'TETHER SNAPPED 💔' : gameState === 'SECURE' ? 'SECURE BASE ⚓' : 'THE TOXIC DANCE 🌪️'}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 100 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>TRUST METRIC</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: secureTrust > 80 ? '#81C784' : txt1 }}>{Math.floor(secureTrust)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${secureTrust}%`, backgroundColor: secureTrust > 80 ? '#81C784' : '#00E5FF' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC SCENE GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_W} height={SIM_H}>
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} rx="12" fill={glass1} stroke={border} />
            
            {/* The Tether */}
            {gameState !== 'BROKEN' && (
                <Animated.View style={{ opacity: gameState === 'SECURE' ? 1 : 0.8 }}>
                    <Svg width={SIM_W} height={SIM_H} style={{ position: 'absolute' }}>
                        <Path 
                            d={`M ${anxiousPos} ${SIM_H/2} L ${avoidantPos} ${SIM_H/2}`} 
                            stroke={tetherColor} 
                            strokeWidth={gameState === 'SECURE' ? "8" : Math.max(1, 4 - (distance/100))} 
                            strokeDasharray={gameState === 'SECURE' ? "" : "5 5"} 
                        />
                    </Svg>
                </Animated.View>
            )}

            {gameState === 'BROKEN' && (
                <Path d={`M ${anxiousPos} ${SIM_H/2} L ${anxiousPos + 20} ${(SIM_H/2)+20} M ${avoidantPos} ${SIM_H/2} L ${avoidantPos - 20} ${(SIM_H/2)+20}`} stroke="#FF4444" strokeWidth="2" />
            )}

            {/* AVOIDANT AVATAR */}
            <Animated.View style={{ transform: [{ translateX: avoidantXAnim }, { translateY: (SIM_H/2) - 40 }] }}>
                <Svg width="80" height="80" style={{ marginLeft: -40 }}>
                   <Circle cx="40" cy="40" r="30" fill={gameState === 'SECURE' ? '#81C784' : '#A855F7'} opacity={0.3} />
                   <Circle cx="40" cy="40" r="20" fill={gameState === 'SECURE' ? '#81C784' : '#A855F7'} />
                   <Text x="40" y="44" fill="#000" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">AVOID</Text>
                   
                   {/* Panic indicator */}
                   {avoidantPanic > 50 && gameState !== 'SECURE' && (
                       <Path d="M 40 10 L 35 0 L 45 0 Z" fill="#FF4444" />
                   )}
                </Svg>
            </Animated.View>

            {/* ANXIOUS AVATAR */}
            <Animated.View style={{ transform: [{ translateX: anxiousXAnim }, { translateY: (SIM_H/2) - 40 }] }}>
                <Svg width="80" height="80" style={{ marginLeft: -40 }}>
                   <Circle cx="40" cy="40" r="30" fill={gameState === 'SECURE' ? '#81C784' : '#FF9F1C'} opacity={0.3} />
                   <Circle cx="40" cy="40" r="20" fill={gameState === 'SECURE' ? '#81C784' : '#FF9F1C'} />
                   <Text x="40" y="44" fill="#000" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">ANX</Text>
                   
                   {/* Panic indicator */}
                   {anxiousPanic > 50 && gameState !== 'SECURE' && (
                       <Path d="M 40 10 L 35 0 L 45 0 Z" fill="#FF4444" />
                   )}
                </Svg>
            </Animated.View>
            
            {/* Context Labels */}
            <SvgText x={SIM_W/2} y={SIM_H - 10} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">Tension: {Math.floor(distance)}m (Max 260m)</SvgText>

         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF9F1C20', borderColor: '#FF9F1C' }]}
              onPress={chaseAggressively}
              disabled={gameState !== 'DANCING'}>
              <Text style={[styles.btnTxt, { color: '#FF9F1C' }]}>🌪️ Anxious Chase</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#A855F720', borderColor: '#A855F7' }]}
              onPress={withdrawCompletely}
              disabled={gameState !== 'DANCING'}>
              <Text style={[styles.btnTxt, { color: '#A855F7' }]}>🧊 Avoidant Withdraw</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#4ECDC420', borderColor: '#4ECDC4', width: '90%' }]}
                 onPress={secureVulnerability}
                 disabled={gameState !== 'DANCING'}>
                 <Text style={[styles.btnTxt, { color: '#4ECDC4' }]}>💬 Emotional Bid (Build Trust)</Text>
             </TouchableOpacity>
          </View>
      </View>

      {gameState === 'BROKEN' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 4 }}>The distance became too great. The tether snapped.</Text>
      )}

      {(gameState === 'BROKEN' || gameState === 'SECURE') && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetSim}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Relationship 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#4ECDC4', fontSize: 9, fontFamily: 'monospace' }}>TETHER_TENSION_COEFFICIENT: {(distance * 0.4).toFixed(1)} N</Text>
            <Text style={{ color: '#FF9F1C', fontSize: 9, fontFamily: 'monospace' }}>ANXIOUS_CORTISOL_RATE: {anxiousPanic}%</Text>
            <Text style={{ color: '#A855F7', fontSize: 9, fontFamily: 'monospace' }}>AVOIDANT_DEACTIVATION_RATE: {avoidantPanic}%</Text>
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
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#110F20', borderRadius: RADIUS.sm, borderWidth: 1 }
});
