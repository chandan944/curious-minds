import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText, Path, G, LinearGradient, Stop, Defs } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 360;
const LADDER_X = SIM_W / 2;

export default function EnvyLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [absoluteValue, setAbsoluteValue] = useState(20);      // Real internal skill
  const [peerStatus, setPeerStatus] = useState(30);            // Competitor's status
  const [billionaireStatus, setBillionaireStatus] = useState(90); 
  const [showBillionaire, setShowBillionaire] = useState(false);
  
  const [perceivedStatus, setPerceivedStatus] = useState(20);  // Emotional reality
  const [gameState, setGameState] = useState('NORMAL');        // NORMAL, THREATENED, CRUSHED, TRANSCENDED

  const timerRef = useRef(null);
  const playerYAnim = useRef(new Animated.Value(SIM_H - 40)).current;

  // Time Engine
  useEffect(() => {
     timerRef.current = setInterval(() => {
         
         // In social media world, peers randomly jump up
         if (Math.random() > 0.8 && gameState !== 'TRANSCENDED') {
             setPeerStatus(prev => Math.min(85, prev + Math.random() * 5));
         }

         // The Comparison Algorithm (Relative Deprivation)
         setPerceivedStatus(prev => {
              if (gameState === 'TRANSCENDED') return absoluteValue; // You escape the trap
              
              // Base status is your true value
              let perceived = absoluteValue;
              
              // Penalty for peers being higher than you
              if (peerStatus > absoluteValue) {
                  // Direct peer comparison HURTS massively
                  perceived -= (peerStatus - absoluteValue) * 0.8;
              }

              // Penalty for billionaires
              if (showBillionaire) {
                  // Billionaires hurt a little, but the gap is so big it's mostly background noise
                  perceived -= (billionaireStatus - absoluteValue) * 0.1;
              }

              // Schadenfreude boost (if peer falls)
              if (absoluteValue > peerStatus && gameState !== 'TRANSCENDED') {
                  perceived += (absoluteValue - peerStatus) * 0.2;
              }

              return Math.max(0, Math.min(100, perceived));
         });

         // Check States
         if (perceivedStatus < 10 && gameState !== 'TRANSCENDED') {
             if (gameState !== 'CRUSHED') {
                 setGameState('CRUSHED');
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
             }
         } else if (peerStatus > absoluteValue + 20 && gameState !== 'TRANSCENDED') {
             setGameState('THREATENED');
         } else if (gameState !== 'TRANSCENDED') {
             setGameState('NORMAL');
         }

     }, 600);

     return () => clearInterval(timerRef.current);
  }, [absoluteValue, peerStatus, showBillionaire, perceivedStatus, gameState]);

  // Animate the avatars on the ladder
  useEffect(() => {
      Animated.timing(playerYAnim, {
          toValue: SIM_H - 40 - (perceivedStatus / 100) * 280,
          duration: 300,
          useNativeDriver: true
      }).start();
  }, [perceivedStatus]);

  // Actions
  const internalGrowth = () => {
      if (gameState === 'TRANSCENDED') return;
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Building real absolute value takes time and lowers comparative anxiety
      setAbsoluteValue(prev => Math.min(100, prev + 8));
  };

  const schadenfreudeGossip = () => {
      if (gameState === 'TRANSCENDED') return;
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Bringing someone down raises relative status, but lowers your absolute value (toxic trait)
      setPeerStatus(prev => Math.max(10, prev - 15));
      setAbsoluteValue(prev => Math.max(5, prev - 5)); // Costs your soul
  };

  const toggleInstagram = () => {
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowBillionaire(!showBillionaire);
  };

  const transcendComparison = () => {
      if (absoluteValue < 50) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return; // Must have some real value to abandon comparison
      }
      soundSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setGameState('TRANSCENDED');
      // Set Perceived to Absolute
      setPerceivedStatus(absoluteValue);
      setShowBillionaire(false);
      
      if(onLabBreaker) onLabBreaker();
  };

  const resetGame = () => {
      soundWhoosh();
      setAbsoluteValue(20);
      setPeerStatus(30);
      setShowBillionaire(false);
      setGameState('NORMAL');
  };

  const ladderY = (val) => SIM_H - 40 - (val / 100) * 280;

  let vibeColor = '#4ECDC4';
  if (gameState === 'THREATENED') vibeColor = '#FF9F1C';
  if (gameState === 'CRUSHED') vibeColor = '#FF4444';
  if (gameState === 'TRANSCENDED') vibeColor = '#A855F7';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#11151A' : '#F5FAFF' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>MINDSET STATUS</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: vibeColor }}>
                {gameState === 'CRUSHED' ? 'CRUSHED BY ENVY 🐍' : gameState}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 110 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>INTERNAL VALUE</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: txt1 }}>{Math.floor(absoluteValue)} LVL</Text>
         </View>
      </View>

      {/* DYNAMIC LADDER GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_W} height={SIM_H}>
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} rx="12" fill={glass1} stroke={border} />
            
            {/* The Hierarchy Ladder */}
            <Rect x={LADDER_X - 20} y="20" width="4" height={SIM_H - 40} fill="#555" />
            <Rect x={LADDER_X + 16} y="20" width="4" height={SIM_H - 40} fill="#555" />
            {Array.from({ length: 15 }).map((_, i) => (
                <Rect key={`rung-${i}`} x={LADDER_X - 16} y={30 + (i * 20)} width="32" height="2" fill="#555" />
            ))}

            {/* Peer Avatar */}
            <Circle cx={LADDER_X + 50} cy={ladderY(peerStatus)} r="15" fill="#FF9F1C" />
            <Text x={LADDER_X + 75} y={ladderY(peerStatus) + 4} fill="#FF9F1C" fontSize="12" fontFamily="monospace">Peer {Math.floor(peerStatus)}</Text>
            
            {/* Instagram Highlight Reel / Billionaire */}
            {showBillionaire && (
                <G>
                   <Circle cx={LADDER_X + 90} cy={ladderY(billionaireStatus)} r="20" fill="#00E5FF" opacity="0.8" />
                   <Path d={`M ${LADDER_X + 90} ${ladderY(billionaireStatus) + 20} L ${LADDER_X} ${ladderY(perceivedStatus)}`} stroke="#00E5FF" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                   <Text x={LADDER_X + 120} y={ladderY(billionaireStatus) + 4} fill="#00E5FF" fontSize="10" fontFamily="monospace">Celeb 99</Text>
                </G>
            )}

            {/* Player Avatar (Animated) */}
            <Animated.View style={{ transform: [{ translateX: LADDER_X - 60 }, { translateY: playerYAnim }] }}>
                <Svg width="40" height="40">
                   <Circle cx="20" cy="20" r="15" fill={vibeColor} />
                   <Text x="20" y="24" fill="#000" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">YOU</Text>
                </Svg>
            </Animated.View>

            {/* Comparison line */}
            {gameState !== 'TRANSCENDED' && (
                <Path 
                    d={`M ${LADDER_X - 40} ${ladderY(perceivedStatus)} L ${LADDER_X + 40} ${ladderY(peerStatus)}`} 
                    stroke={peerStatus > perceivedStatus ? '#FF4444' : '#81C784'} 
                    strokeWidth="1" strokeDasharray="3 3" opacity="0.6" 
                />
            )}
            
            <SvgText x={10} y={20} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily={FONTS.displayBold}>Perceived Realities</SvgText>
         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#4ECDC420', borderColor: '#4ECDC4' }]}
              onPress={internalGrowth}>
              <Text style={[styles.btnTxt, { color: '#4ECDC4' }]}>📚 Focus on Self</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
              onPress={schadenfreudeGossip}>
              <Text style={[styles.btnTxt, { color: '#FF4444' }]}>😈 Malicious Gossip</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: showBillionaire ? '#00E5FF40' : '#00E5FF20', borderColor: '#00E5FF', width: '80%' }]}
                 onPress={toggleInstagram}>
                 <Text style={[styles.btnTxt, { color: '#00E5FF' }]}>📱 Open Instagram App</Text>
             </TouchableOpacity>
          </View>
          
          {absoluteValue >= 50 && gameState !== 'TRANSCENDED' && (
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#A855F720', borderColor: '#A855F7', width: '80%' }]}
                 onPress={transcendComparison}>
                 <Text style={[styles.btnTxt, { color: '#A855F7' }]}>🧘‍♂️ Unplug 'Comparison Engine'</Text>
             </TouchableOpacity>
          )}
      </View>

      {absoluteValue < 50 && gameState !== 'TRANSCENDED' && (
          <Text style={{ textAlign: 'center', color: txtM, fontSize: 10, marginTop: 4 }}>Build Absolute Value to &gt; 50 to Transcend comparison.</Text>
      )}

      {gameState === 'TRANSCENDED' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Hierarchy 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: vibeColor, fontSize: 9, fontFamily: 'monospace' }}>ABSOLUTE_VALUE: {absoluteValue.toFixed(1)}</Text>
            <Text style={{ color: vibeColor, fontSize: 9, fontFamily: 'monospace' }}>RELATIVE_DEPRIVATION_IDX: {((absoluteValue - perceivedStatus)).toFixed(1)}</Text>
            <Text style={{ color: vibeColor, fontSize: 9, fontFamily: 'monospace' }}>COMPARISON_ENGINE_STATUS: {gameState === 'TRANSCENDED' ? 'OFFLINE' : 'ONLINE'}</Text>
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
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#11151A', borderRadius: RADIUS.sm, borderWidth: 1 }
});
