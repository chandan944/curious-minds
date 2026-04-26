import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

export default function CommonsLab({ scientistMode = false, onLabBreaker }) {
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
  const [round, setRound] = useState(1);
  const [lakeFish, setLakeFish] = useState(25); // Max capacity 25
  const [playerWealth, setPlayerWealth] = useState(0);
  const [aiWealth, setAiWealth] = useState(0);

  const [aiTrust, setAiTrust] = useState(50); // High trust = they take less, low trust = they take max
  const [gameOver, setGameOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState('THE LAKE IS FULL. CHOOSE YOUR CATCH.');

  // Visual Animations
  const lakeAnim = useRef(new Animated.Value(25)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     Animated.timing(lakeAnim, { toValue: lakeFish, duration: 500, useNativeDriver: false }).start();

     if (lakeFish <= 0 && !gameOver) {
        setGameOver(true);
        setStatusMsg('ECOLOGICAL COLLAPSE. THE VILLAGE DIES. 💀');
        soundWhoosh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
     } else if (round > 10 && lakeFish > 0) {
        setGameOver(true);
        if (playerWealth > 15) {
           setStatusMsg('VILLAGE SURVIVED & PROSPERED! YOU WIN! 🏆');
           soundSuccess();
           if(onLabBreaker) onLabBreaker();
        } else {
           setStatusMsg('VILLAGE SURVIVED... BUT YOU ARE POOR. 🏚️');
           soundBadge();
        }
     }
  }, [lakeFish, round]);

  const endRound = (playerCatch) => {
     if (gameOver) return;

     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

     // Determine AI Catch based on Trust and previous Player Catch
     let newTrust = aiTrust;
     if (playerCatch === 3) newTrust -= 20; // Selfish player destroys trust
     if (playerCatch === 1) newTrust += 15; // Altruistic player builds trust
     newTrust = Math.max(0, Math.min(100, newTrust));
     setAiTrust(newTrust);

     // AI takes 1, 2, or 3 based on Trust
     let aiCatch = 2; // Default 2
     if (newTrust < 30) aiCatch = 3; // Panic, Tragedy kicks in
     if (newTrust > 70) aiCatch = 1; // High trust, conservation

     // Total drawn this round (3 AIs)
     const totalAiCatch = aiCatch * 3;
     const totalCatch = playerCatch + totalAiCatch;

     // Calculate new lake status
     const lakeAfterCatch = lakeFish - totalCatch;
     let nextLake = 0;

     if (lakeAfterCatch > 0) {
        // Regeneration: Lake regrows +5 fish per round if not completely dead
        nextLake = Math.min(25, lakeAfterCatch + 5);
        setPlayerWealth(prev => prev + playerCatch);
        setAiWealth(prev => prev + totalAiCatch);
        
        let msg = `You caught ${playerCatch}. AIs caught ${totalAiCatch}. Lake regenerated.`;
        if (newTrust < 30) msg = `AIs are PANICKING and overfishing! Trust is broken! 🚨`;
        if (newTrust > 70) msg = `High-Trust Society: Everyone is conserving naturally. 🤝`;
        setStatusMsg(msg);
        setLakeFish(nextLake);
        setRound(r => r + 1);
     } else {
        // Ded
        setLakeFish(0);
     }
  };

  const reset = () => {
     setRound(1);
     setLakeFish(25);
     setPlayerWealth(0);
     setAiWealth(0);
     setAiTrust(50);
     setGameOver(false);
     setStatusMsg('THE LAKE IS FULL. CHOOSE YOUR CATCH.');
     lakeAnim.setValue(25);
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>YOUR WEALTH</Text>
            <Text style={{ color: '#00D4A0', fontSize: 22, fontFamily: 'monospace' }}>${playerWealth * 100}</Text>
         </View>
         <View style={{ alignItems: 'center' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>YEAR / ROUND</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontFamily: FONTS.displayBold }}>{round}/10</Text>
         </View>
         <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>VILLAGE TRUST</Text>
            <Text style={{ color: aiTrust > 60 ? '#00D4FF' : '#FF4444', fontSize: 22, fontFamily: 'monospace' }}>{aiTrust.toFixed(0)}%</Text>
         </View>
      </View>

      {/* ── Arena Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Text style={[styles.statusMsg, { color: lakeFish === 0 ? '#FF4444' : '#fff' }]}>{statusMsg}</Text>

         <Svg width={SIM_W} height={200}>
            <Defs>
               <RadialGradient id="waterGlow" cx="50%" cy="60%" r="50%">
                  <Stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#001A30" stopOpacity="0.2" />
               </RadialGradient>
            </Defs>

            {/* The Lake */}
            <Path d={`M 20 180 Q ${SIM_W/2} 180 ${SIM_W-20} 180 L ${SIM_W-40} 100 Q ${SIM_W/2} 80 40 100 Z`} fill="url(#waterGlow)" />
            
            <AnimatedCircle 
               cx={SIM_W/2} 
               cy="140" 
               // Map 0-25 fish to 0-60 radius
               r={lakeAnim.interpolate({ inputRange:[0,25], outputRange:[0,60]})} 
               fill="#00D4A0" opacity="0.6" 
            />

            <SvgText x={SIM_W/2} y="145" fill="#000" fontSize="16" fontWeight="bold" textAnchor="middle">{lakeFish} FISH</SvgText>

            {/* Actors */}
            <SvgText x="30" y="60" fill="#fff" fontSize="20" textAnchor="middle">🧑‍🌾</SvgText>
            <SvgText x="30" y="80" fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">YOU</SvgText>

            <SvgText x={SIM_W - 30} y="60" fill="#fff" fontSize="20" textAnchor="middle">🤖</SvgText>
            <SvgText x={SIM_W - 30} y="80" fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">3x AI</SvgText>
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>NASH_EQUILIBRIUM: DEFECTION_RISK</Text>
              <Text style={styles.sciText}>CARRYING_CAPACITY: 25 | REGEN: +5/y</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         <Text style={{ color: txt1, fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 6 }}>HOW MANY FISH DO YOU TAKE THIS YEAR?</Text>
         
         {!gameOver ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TouchableOpacity style={[styles.actionBtn, { borderColor: '#00D4A0', flex: 1 }]} onPress={() => endRound(1)}>
                  <Text style={[styles.actionText, { color: '#00D4A0' }]}>TAKE 1 (Conserve)</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.actionBtn, { borderColor: '#FFD166', flex: 1 }]} onPress={() => endRound(2)}>
                  <Text style={[styles.actionText, { color: '#FFD166' }]}>TAKE 2 (Balanced)</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.actionBtn, { borderColor: '#FF4444', flex: 1, backgroundColor: 'rgba(255,68,68,0.1)' }]} onPress={() => endRound(3)}>
                  <Text style={[styles.actionText, { color: '#FF4444' }]}>TAKE 3 (Selfish!)</Text>
               </TouchableOpacity>
            </View>
         ) : (
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET COMMONS</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 230, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  statusMsg: { position: 'absolute', top: 15, fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center', width: '100%', zIndex: 10, paddingHorizontal: 20 },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16 },
  actionBtn: { paddingVertical: 14, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center' },
  actionText: { fontSize: 10, fontFamily: FONTS.displayBold },

  resetBtn: { marginTop: 4, padding: 16, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: '#333' }
});
