import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundBadge, soundWhoosh } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 260;

export default function StudyTipsLabExt({ scientistMode = false, onLabBreaker, accentColor = '#4ECDC4' }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── Game State ──
  const [day, setDay] = useState(0); 
  const [retention, setRetention] = useState(0); 
  const [fatigue, setFatigue] = useState(0);
  const [baseStrength, setBaseStrength] = useState(1.0); // Synaptic strength S in Ebbinghaus
  
  const [history, setHistory] = useState([]); // [{ day, retention, action }]
  const [status, setStatus] = useState("Awaiting first study session... 📚");

  // Animations
  const brainPulse = useRef(new Animated.Value(1)).current;
  const dayAnim = useRef(new Animated.Value(0)).current;

  // Real-time decay tick
  const timerRef = useRef(null);
  
  useEffect(() => {
     timerRef.current = setInterval(() => {
        setDay(prev => {
            const nextDay = prev + 0.5;
            return nextDay >= 30 ? 30 : nextDay;
        });
        
        // Fatigue decays naturally over time
        setFatigue(prev => Math.max(0, prev - 2));

     }, 400); // 1 day = 0.8 seconds

     return () => clearInterval(timerRef.current);
  }, []);

  // Watch `day` to trigger game over side-effects safely
  useEffect(() => {
      if (day >= 30) {
          clearInterval(timerRef.current);
          setStatus(retention > 60 ? "EXAM PASSED! 🎓" : "EXAM FAILED! 💥");
          if (retention > 60 && onLabBreaker) {
             onLabBreaker();
          }
      }
  }, [day, retention, onLabBreaker]);

  // Handle Retention Decay 
  useEffect(() => {
      if (day >= 30) return;
      // Exponential decay: e ^ (-time / strength)
      // Since it ticks every 0.5 days, we just drop it slightly based on baseStrength
      setRetention(prev => {
          let drop = (4.0 / baseStrength); 
          if (fatigue > 80) drop *= 1.5; // High fatigue accelerates memory loss
          const next = Math.max(0, prev - drop);
          
          if (day % 1 === 0 && day > 0) {
             setHistory(h => [...h, { day, retention: next }]);
          }
          return next;
      });
  }, [day]);

  // Actions
  const handleAction = (type) => {
      soundTap();
      if (day >= 30) return;
      if (fatigue >= 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setStatus("BURN OUT! You must rest. 🤕");
          return;
      }

      // Pulse brain
      brainPulse.setValue(1.2);
      Animated.timing(brainPulse, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      let boost = 0;
      if (type === 'PASSIVE') {
          // Passive Read
          boost = 30; // Quick jump
          setFatigue(prev => Math.min(100, prev + 10)); // Low effort
          // Barely touches base strength
          setBaseStrength(prev => prev + 0.2);
          setStatus("Passive Reading... Fast boost, but fades quickly. 👁️");
      } 
      else if (type === 'ACTIVE') {
          // Active Recall
          soundBadge();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          boost = 80; 
          setFatigue(prev => Math.min(100, prev + 35)); // High effort!
          setBaseStrength(prev => prev + 2.5); // Massive strength increase!
          setStatus("Active Recall! High strain, massive permanent retention! 💪");
      }
      else if (type === 'REST') {
           soundWhoosh();
           setFatigue(0);
           setStatus("Deep Sleep... Fatigue wiped! Memory consolidating. 🛌");
      }

      if (type !== 'REST') {
          setRetention(prev => Math.min(100, prev + boost));
      }
      
      setHistory(h => [...h, { day, retention: Math.min(100, retention + boost), action: type }]);
  };

  const resetGame = () => {
      soundWhoosh();
      setDay(0);
      setRetention(0);
      setFatigue(0);
      setBaseStrength(1.0);
      setHistory([]);
      setStatus("Game reset. 30 days to exam. Go! 🏁");
  };

  // Build SVG Path
  const getGraphPath = () => {
      if (history.length === 0) return `M 0,${SIM_H}`;
      let path = `M 0,${SIM_H - (history[0].retention/100)*SIM_H}`;
      for (const h of history) {
          const x = (h.day / 30) * SIM_W;
          const y = SIM_H - (h.retention / 100) * SIM_H;
          path += ` L ${x},${y}`;
      }
      // Add current point
      const cx = (day/30)*SIM_W;
      const cy = SIM_H - (retention/100)*SIM_H;
      path += ` L ${cx},${cy}`;
      return path;
  };

  return (
    <View style={styles.container}>
      {/* HEADER TILE */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#0A0A10' : '#F0F0F5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txt1, fontSize: 13, fontFamily: FONTS.displayBold, marginBottom: 4 }}>Exam Day {Math.floor(day)} / 30</Text>
            <Text style={{ color: fatigue > 80 ? '#FF4444' : txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>{status}</Text>
         </View>
         <Animated.View style={{ transform: [{ scale: brainPulse }], alignItems: 'center' }}>
            <Icon name="brain" size={28} color={fatigue > 80 ? '#FF4444' : accentColor} />
            <Text style={{ color: fatigue > 80 ? '#FF4444' : txt1, fontSize: 9, fontFamily: 'monospace', marginTop: 2 }}>Fatigue: {Math.floor(fatigue)}%</Text>
         </Animated.View>
      </View>

      {/* PRIMARY GRAPH */}
      <View style={[styles.simBox, { borderColor: border }]}>
         {/* Live Retention Meter Background */}
         <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000' }} />

         <Svg width={SIM_W} height={SIM_H}>
           <Defs>
              <LinearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0%" stopColor={accentColor} stopOpacity="0.5"/>
                 <Stop offset="100%" stopColor={accentColor} stopOpacity="0.0"/>
              </LinearGradient>
           </Defs>
           {/* Grid */}
           {[0, 0.25, 0.5, 0.75, 1].map(f => (
               <Line key={f} x1="0" y1={SIM_H*f} x2={SIM_W} y2={SIM_H*f} stroke={border} strokeDasharray="3 3"/>
           ))}
           <SvgText x={5} y={15} fill="rgba(255,255,255,0.6)" fontSize="10">100% Mastered</SvgText>
           <SvgText x={5} y={SIM_H - 5} fill="rgba(255,255,255,0.6)" fontSize="10">0% Forgotten</SvgText>

           {/* X Axis */}
           <Line x1={(10/30)*SIM_W} y1={0} x2={(10/30)*SIM_W} y2={SIM_H} stroke={border} />
           <Line x1={(20/30)*SIM_W} y1={0} x2={(20/30)*SIM_W} y2={SIM_H} stroke={border} />

           {/* Path */}
           {history.length > 0 && (
               <>
               <Path d={`${getGraphPath()} L ${(day/30)*SIM_W},${SIM_H} L 0,${SIM_H} Z`} fill="url(#graphGrad)" />
               <Path d={getGraphPath()} fill="none" stroke={accentColor} strokeWidth="3" />
               </>
           )}

           {/* Current Target */}
           <Circle cx={(day/30)*SIM_W} cy={SIM_H - (retention/100)*SIM_H} r="6" fill="#FFF" stroke={accentColor} strokeWidth="3" />
         </Svg>
         
         {/* Overlay Stats */}
         <View style={styles.metricsOver}>
            <Text style={{color: txtM, fontSize: 8, fontFamily: FONTS.displayBold}}>CURRENT RETENTION</Text>
            <Text style={{color: txt1, fontSize: 18, fontFamily: 'monospace'}}>{retention.toFixed(0)}%</Text>
         </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controlsRow}>
         <TouchableOpacity 
             style={[styles.btn, { backgroundColor: '#FFD16620', borderColor: '#FFD166' }]} 
             onPress={() => handleAction('PASSIVE')}>
             <Icon name="eye" size={16} color="#FFD166" />
             <Text style={[styles.btnText, { color: '#FFD166' }]}>Passive Read +30%</Text>
         </TouchableOpacity>

         <TouchableOpacity 
             style={[styles.btn, { backgroundColor: accentColor + '20', borderColor: accentColor }]} 
             onPress={() => handleAction('ACTIVE')}>
             <Icon name="zap" size={16} color={accentColor} />
             <Text style={[styles.btnText, { color: accentColor }]}>Active Recall +80%</Text>
         </TouchableOpacity>

         <TouchableOpacity 
             style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]} 
             onPress={() => handleAction('REST')}>
             <Icon name="cloud" size={16} color="#FF4444" />
             <Text style={[styles.btnText, { color: '#FF4444' }]}>Deep Rest (Wipe Fatigue)</Text>
         </TouchableOpacity>
      </View>

      {day >= 30 && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: '#000', fontFamily: FONTS.displayBold }}>Reset Semester</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#00D4A0', fontSize: 9, fontFamily: 'monospace' }}>SYNAPTIC_STRENGTH (S): {baseStrength.toFixed(2)}</Text>
            <Text style={{ color: '#00D4A0', fontSize: 9, fontFamily: 'monospace' }}>DECAY_RATE: (4.0 / S) * F_coeff</Text>
         </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.05, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', backgroundColor: '#000', marginBottom: 16 },
  metricsOver: { position: 'absolute', right: 10, top: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: RADIUS.sm },
  controlsRow: { gap: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, gap: 10, justifyContent: 'center' },
  btnText: { fontFamily: FONTS.displayBold, fontSize: 13 },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#00D4A0', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#051A10', borderRadius: RADIUS.sm, borderWidth: 1 }
});
