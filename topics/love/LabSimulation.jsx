import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Polygon, Circle, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_size = width - 80;
const SIM_CX = SIM_size / 2;
const SIM_CY = SIM_size / 2;
const MAX_RADIUS = SIM_size / 2 - 30;

export default function LoveLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [months, setMonths] = useState(0);
  const [intimacy, setIntimacy] = useState(100);
  const [passion, setPassion] = useState(100);
  const [commitment, setCommitment] = useState(100);
  
  const [stress, setStress] = useState(0); // 0 to 100
  const [breakupScore, setBreakupScore] = useState(0); // If 100, game over
  const [currentEvent, setCurrentEvent] = useState('💕 Honeymoon Phase');
  const [gameState, setGameState] = useState('DATING'); // DATING, BREAKUP, CONSUMMATE
  
  const timerRef = useRef(null);

  // Time Engine
  useEffect(() => {
     if (gameState !== 'DATING') return;

     timerRef.current = setInterval(() => {
         setMonths(prev => {
             const next = prev + 1;
             return next >= 48 ? 48 : next;
         });

         // Natural Decay (Entropy of relationships)
         setIntimacy(prev => Math.max(0, prev - (stress > 50 ? 5 : 2)));
         setPassion(prev => Math.max(0, prev - (months > 12 ? 4 : 1))); // Passion drops hard after honeymoon
         setCommitment(prev => Math.max(0, prev - (breakupScore > 50 ? 3 : 1)));

         // Random Events
         if (Math.random() < 0.15 && months > 6) {
             const events = [
                 { n: '💥 Huge Argument! Intimacy Drops!', s: 40, iX: -30, pX: 10, cX: -10 },
                 { n: '💼 Toxic Work Stress! Passion Dies!', s: 50, iX: -10, pX: -40, cX: 0 },
                 { n: '✈️ Long Distance! Commitment Tested!', s: 30, iX: -20, pX: -10, cX: -30 },
             ];
             const ev = events[Math.floor(Math.random() * events.length)];
             setCurrentEvent(ev.n);
             setStress(prev => Math.min(100, prev + ev.s));
             setIntimacy(prev => Math.max(0, prev + ev.iX));
             setPassion(prev => Math.max(0, prev + ev.pX));
             setCommitment(prev => Math.max(0, prev + ev.cX));
             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
             
             setTimeout(() => setCurrentEvent('Normal Daily Grind ☕'), 4000);
         }

         // Calculate Breakup Velocity
         setBreakupScore(prev => {
             let delta = 0;
             if (intimacy < 30) delta += 4;
             if (passion < 20) delta += 3; // Become roommates
             if (commitment < 40) delta += 5; // One foot out the door
             if (stress > 80) delta += 4;
             
             // Healing
             if (intimacy > 70 && passion > 60 && commitment > 70) delta -= 5;
             
             const next = Math.max(0, Math.min(100, prev + delta));
             return next;
         });

         // Natural stress decay
         setStress(prev => Math.max(0, prev - 5));

     }, 400); // Fast simulation

     return () => clearInterval(timerRef.current);
  }, [gameState, intimacy, passion, commitment, stress, breakupScore, months]);

  // Watch for Win / Loss conditions safely outside state updaters
  useEffect(() => {
      if (gameState !== 'DATING') return;

      if (months >= 48) {
          clearInterval(timerRef.current);
          setGameState('CONSUMMATE 👑');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (onLabBreaker) onLabBreaker();
      } else if (breakupScore >= 100) {
          clearInterval(timerRef.current);
          setGameState('HEARTBREAK 💔');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
  }, [months, breakupScore, gameState, onLabBreaker]);
  // Actions
  const handleAction = (type) => {
     if (gameState !== 'DATING') return;
     soundTap();
     if (type === 'DATE') {
         setPassion(prev => Math.min(100, prev + 30));
         setIntimacy(prev => Math.min(100, prev + 10));
         setStress(prev => Math.max(0, prev - 20));
     } else if (type === 'TALK') {
         setIntimacy(prev => Math.min(100, prev + 40));
         setCommitment(prev => Math.min(100, prev + 15));
         setStress(prev => Math.max(0, prev - 30));
     } else if (type === 'PLAN') {
         setCommitment(prev => Math.min(100, prev + 40));
         setIntimacy(prev => Math.min(100, prev + 10));
         setPassion(prev => Math.max(0, prev - 5)); // Planning is boring
     }
  };

  const resetGame = () => {
    soundWhoosh();
    setMonths(0);
    setIntimacy(100);
    setPassion(100);
    setCommitment(100);
    setStress(0);
    setBreakupScore(0);
    setGameState('DATING');
    setCurrentEvent('💕 Honeymoon Phase');
  };

  // SVG Triangle Math 
  // Point 1 (Top) = Intimacy
  // Point 2 (Bottom Right) = Passion
  // Point 3 (Bottom Left) = Commitment

  const p1 = { x: SIM_CX, y: SIM_CY - MAX_RADIUS * (intimacy/100) };
  
  const angle2 = (30 * Math.PI) / 180; // Bottom right
  const p2 = { 
      x: SIM_CX + Math.cos(angle2) * MAX_RADIUS * (passion/100), 
      y: SIM_CY + Math.sin(angle2) * MAX_RADIUS * (passion/100) 
  };

  const angle3 = (150 * Math.PI) / 180; // Bottom left
  const p3 = { 
    x: SIM_CX + Math.cos(angle3) * MAX_RADIUS * (commitment/100), 
    y: SIM_CY + Math.sin(angle3) * MAX_RADIUS * (commitment/100) 
  };

  const triPath = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

  // Area calculation (Heron's formula) for dynamic color
  const a = Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const b = Math.hypot(p2.x - p3.x, p2.y - p3.y);
  const c = Math.hypot(p3.x - p1.x, p3.y - p1.y);
  const sArea = (a + b + c) / 2;
  const area = Math.sqrt(Math.max(0, sArea * (sArea - a) * (sArea - b) * (sArea - c))); // Visual stability

  let loveTypeStr = 'Companionate Love';
  let polyColor = '#FF007F';
  if (passion > 80 && intimacy < 50) { loveTypeStr = 'Crush / Infatuation'; polyColor = '#FF4444'; }
  else if (commitment > 80 && passion < 30) { loveTypeStr = 'Empty Love (Roommates)'; polyColor = '#555'; }
  else if (intimacy > 70 && passion > 70 && commitment > 70) { loveTypeStr = 'Consummate Love 👑'; polyColor = '#FF007F'; }
  else { loveTypeStr = 'Fatuous Love'; polyColor = '#FF8C00'; }

  if (gameState !== 'DATING') {
      loveTypeStr = gameState;
      if (gameState === 'HEARTBREAK 💔') polyColor = '#333';
  }

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1A000A' : '#FFF0F5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>MONTH {months} / 48</Text>
            <Text style={{ fontSize: 13, fontFamily: FONTS.displayBold, color: '#FF007F' }}>{currentEvent}</Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 90 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>BREAKUP RISK</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: breakupScore > 75 ? '#FF4444' : txt1 }}>{Math.floor(breakupScore)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${breakupScore}%`, backgroundColor: '#FF4444' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC TRIANGLE GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: polyColor }}>{loveTypeStr}</Text>

         <Svg width={SIM_size} height={SIM_size}>
            {/* Background Max Triangle */}
            <Polygon points={`${SIM_CX},${SIM_CY - MAX_RADIUS} ${SIM_CX + Math.cos(angle2)*MAX_RADIUS},${SIM_CY + Math.sin(angle2)*MAX_RADIUS} ${SIM_CX + Math.cos(angle3)*MAX_RADIUS},${SIM_CY + Math.sin(angle3)*MAX_RADIUS}`} 
                     fill={glass1} stroke="#333" strokeDasharray="4 4" />
            
            {/* Live Relationship Shape */}
            <Polygon points={triPath} fill={polyColor} fillOpacity="0.4" stroke={polyColor} strokeWidth="3" />

            {/* Anchors */}
            <Circle cx={p1.x} cy={p1.y} r="5" fill="#00D4FF" />
            <Circle cx={p2.x} cy={p2.y} r="5" fill="#FF4444" />
            <Circle cx={p3.x} cy={p3.y} r="5" fill="#D4A74A" />

            {/* Labels Base */}
            <SvgText x={SIM_CX} y={SIM_CY - MAX_RADIUS - 10} fill="#00D4FF" fontSize="10" textAnchor="middle" fontWeight="bold">Intimacy {Math.floor(intimacy)}%</SvgText>
            <SvgText x={SIM_CX + Math.cos(angle2)*MAX_RADIUS + 25} y={SIM_CY + Math.sin(angle2)*MAX_RADIUS + 5} fill="#FF4444" fontSize="10" textAnchor="middle" fontWeight="bold">Passion {Math.floor(passion)}%</SvgText>
            <SvgText x={SIM_CX + Math.cos(angle3)*MAX_RADIUS - 30} y={SIM_CY + Math.sin(angle3)*MAX_RADIUS + 5} fill="#D4A74A" fontSize="10" textAnchor="middle" fontWeight="bold">Commitm. {Math.floor(commitment)}%</SvgText>
         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
              onPress={() => handleAction('DATE')}>
              <Text style={[styles.btnTxt, { color: '#FF4444' }]}>🔥 Romantic Date</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#00D4FF20', borderColor: '#00D4FF' }]}
              onPress={() => handleAction('TALK')}>
              <Text style={[styles.btnTxt, { color: '#00D4FF' }]}>🗣️ Deep Talk (Repair)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#D4A74A20', borderColor: '#D4A74A' }]}
              onPress={() => handleAction('PLAN')}>
              <Text style={[styles.btnTxt, { color: '#D4A74A' }]}>📅 Plan Future</Text>
          </TouchableOpacity>
      </View>

      {gameState !== 'DATING' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Relationship 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>TRI_AREA_DENSITY: {Math.floor(area)}</Text>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>DECAY_ALGO: $\Delta P=-4$ ($t>12$), ENTROPY_BIAS_ACTIVE</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.05, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, minWidth: '45%', alignItems: 'center', marginBottom: 8 },
  btnTxt: { fontSize: 11, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A000A', borderRadius: RADIUS.sm, borderWidth: 1 }
});
