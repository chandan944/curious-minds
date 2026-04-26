import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 360;

export default function SatyagrahaLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const bg = (_themeObj || {}).bg?.base || '#0A0A0A';

  // ── State ──────────────────────────────────────
  const [empireEconomy, setEmpireEconomy] = useState(100);
  const [empirePanic, setEmpirePanic] = useState(0);
  const [radicalization, setRadicalization] = useState(0); // If hits 100, extreme violence triggers
  
  const [activeMovement, setActiveMovement] = useState(null); // 'boycott', 'salt_march', 'quit_india'
  const [gameOver, setGameOver] = useState(false);
  const [resultMsg, setResultMsg] = useState('THE EMPIRE RULES INDIA.');
  const [year, setYear] = useState(1920);

  // ── Game Loop ──────────────────────────────────────
  useEffect(() => {
     let interval;

     if (!gameOver && activeMovement) {
        interval = setInterval(() => {
           setEmpireEconomy(prev => {
              const newEco = prev - (activeMovement === 'boycott' ? 2 : activeMovement === 'salt_march' ? 4 : 8);
              if (newEco <= 0) {
                 setGameOver(true);
                 setResultMsg('BRITISH ECONOMY COLLAPSED. INDIA IS FREE! 🎆🇮🇳');
                 soundSuccess();
                 if(onLabBreaker) onLabBreaker();
                 return 0;
              }
              return newEco;
           });

           setEmpirePanic(prev => {
              const newPanic = prev + (activeMovement === 'boycott' ? 3 : activeMovement === 'salt_march' ? 5 : 10);
              return Math.min(100, newPanic);
           });

           setRadicalization(prev => {
              // Radialization goes up faster if Panic is high
              const inc = empirePanic > 70 ? 4 : 2;
              const newRad = prev + inc;
              if (newRad >= 100 && !gameOver) {
                 setGameOver(true);
                 setResultMsg('PROTESTS TURNED VIOLENT. IMPERIAL ARMY CRACKDOWN. MOVEMENT CRUSHED. 🩸');
                 soundWhoosh();
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                 return 100;
              }
              return newRad;
           });

           setYear(y => Math.min(1947, y + 1));
        }, 800); 
     } else if (!gameOver && !activeMovement) {
         // Resting state (Calling off the movement)
         interval = setInterval(() => {
            setEmpirePanic(prev => Math.max(0, prev - 5));
            setRadicalization(prev => Math.max(0, prev - 10)); // Rad drops fast when paused
            setYear(y => Math.min(1947, y + 1));
         }, 800);
     }

     return () => clearInterval(interval);
  }, [activeMovement, gameOver, empirePanic]);

  // ── Actions ──────────────────────────────────────
  const triggerMovement = (type) => {
     if (gameOver) return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     setActiveMovement(type);
     if(type === 'boycott') setResultMsg('NON-COOPERATION ACTIVE. BURNING BRITISH CLOTH. 🚫🧶');
     if(type === 'salt_march') setResultMsg('SALT MARCH ACTIVE. BREAKING THE MONOPOLY. 🧂🚶‍♂️');
     if(type === 'quit_india') setResultMsg('QUIT INDIA ACTIVE. DO OR DIE. 🚪🔥');
  };

  const callOffMovement = () => {
     if (gameOver) return;
     soundBadge();
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
     setActiveMovement(null);
     setResultMsg('GANDHI FASTS. MOVEMENT TEMPORARILY SUSPENDED. 🧘‍♂️');
  };

  const reset = () => {
     setEmpireEconomy(100);
     setEmpirePanic(0);
     setRadicalization(0);
     setActiveMovement(null);
     setGameOver(false);
     setResultMsg('THE EMPIRE RULES INDIA. START THE RESISTANCE.');
     setYear(1920);
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>YEAR</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontFamily: 'monospace' }}>{year}</Text>
         </View>
         <View style={{ flex: 2, alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>HEADLINES</Text>
            <Text style={{ color: gameOver ? (empireEconomy <= 0 ? '#00FF7F' : '#FF4444') : '#FFD166', fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'right', marginTop: 4 }}>
               {resultMsg}
            </Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Svg width={SIM_W} height={180}>
            {/* Grid bg */}
            {[20, 60, 100, 140].map(y => (
               <Path key={y} d={`M 0 ${y} L ${SIM_W} ${y}`} stroke="#333" strokeWidth="1" />
            ))}

            {/* Economy Bar (British) */}
            <Rect x="20" y="20" width={SIM_W - 40} height="30" fill="rgba(85,85,85,0.3)" rx="4" />
            <Rect x="20" y="20" width={(empireEconomy/100) * (SIM_W - 40)} height="30" fill="#00D4FF" rx="4" />
            <SvgText x={SIM_W/2} y="40" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">BRITISH TREASURY (DRAINS TO WIN)</SvgText>

            {/* Panic Bar (British) */}
            <Rect x="20" y="70" width={SIM_W - 40} height="30" fill="rgba(85,85,85,0.3)" rx="4" />
            <Rect x="20" y="70" width={(empirePanic/100) * (SIM_W - 40)} height="30" fill="#FFD166" rx="4" />
            <SvgText x={SIM_W/2} y="90" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">EMPIRE PANIC (TRIGGERS RADICALIZATION)</SvgText>

            {/* Radicalization Bar (Indian) */}
            <Rect x="20" y="120" width={SIM_W - 40} height="30" fill="rgba(85,85,85,0.3)" rx="4" />
            <Rect x="20" y="120" width={(radicalization/100) * (SIM_W - 40)} height="30" fill="#FF4444" rx="4" />
            <SvgText x={SIM_W/2} y="140" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">RADICALIZATION / VIOLENCE (REACH 100 TO LOSE)</SvgText>
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>SATYAGRAHA_INDEX: {activeMovement ? 'ACTIVE_DRAIN' : 'DORMANT'}</Text>
              <Text style={styles.sciText}>PANIC_DELTA: {(empirePanic/10).toFixed(1)}x</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 8 }}>LAUNCH NON-VIOLENT CAMPAIGNS</Text>
         
         {!gameOver ? (
            <>
               <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#00D4FF', flex: 1, backgroundColor: activeMovement === 'boycott' ? 'rgba(0,212,255,0.3)' : 'transparent' }]}
                     onPress={() => triggerMovement('boycott')}
                  >
                     <Text style={[styles.actionText, { color: '#00D4FF' }]}>NON-COOPERATION (Eco Drain)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#FFD166', flex: 1, backgroundColor: activeMovement === 'salt_march' ? 'rgba(255,209,102,0.3)' : 'transparent' }]}
                     onPress={() => triggerMovement('salt_march')}
                  >
                     <Text style={[styles.actionText, { color: '#FFD166' }]}>SALT MARCH (Med Drain)</Text>
                  </TouchableOpacity>
               </View>

               <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#FF4444', flex: 1, backgroundColor: activeMovement === 'quit_india' ? 'rgba(255,68,68,0.3)' : 'transparent' }]}
                     onPress={() => triggerMovement('quit_india')}
                  >
                     <Text style={[styles.actionText, { color: '#FF4444' }]}>QUIT INDIA (Massive Drain / Max Panic)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#A855F7', flex: 1, backgroundColor: '#1A0830' }]}
                     onPress={callOffMovement}
                  >
                     <Text style={[styles.actionText, { color: '#A855F7' }]}>PAUSE MOVEMENT (Lower Panic & Radicalization)</Text>
                  </TouchableOpacity>
               </View>
            </>
         ) : (
            <TouchableOpacity style={[styles.execBtn, { borderColor: '#555', backgroundColor: '#333' }]} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET TIMELINE</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 180, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16 },
  actionBtn: { paddingVertical: 12, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center' },

  execBtn: { marginTop: 10, paddingVertical: 16, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center' }
});
