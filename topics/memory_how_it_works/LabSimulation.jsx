import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, PanResponder, Easing } from 'react-native';
import Svg, { Circle, Path, G, Line, Defs, RadialGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

// ── Animated Components ──────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function NeuralMemoryLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const glass = glass2;

  // ── State ──────────────────────────────────────
  const [workingMemory, setWorkingMemory] = useState([]); // [{id, x, y, val, anim}]
  const [longTermCount, setLongTermCount] = useState(0);
  const [interferenceActive, setInterference] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsRunning] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [lastMessage, setLastMessage] = useState("Tap 'INITIATE SENSES' to start");

  // Physics & Refs
  const packets = useRef([]).current;
  const spawnTimer = useRef(null);
  const gameLoop = useRef(null);
  
  // ── Handlers ───────────────────────────────────

  const spawnPacket = useCallback(() => {
    if (!isGameRunning) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    const newPacket = {
      id,
      x: new Animated.Value(Math.random() * (SIM_W - 40) + 20),
      y: new Animated.Value(-20),
      val: Math.floor(Math.random() * 10),
      type: Math.random() > 0.8 ? 'semantic' : 'sensory', // Semantic is worth more
      active: true
    };

    setWorkingMemory(prev => [...prev, newPacket]);

    // Animate falling into "Working Memory" area
    Animated.timing(newPacket.y, {
      toValue: SIM_H - 150 - (Math.random() * 80),
      duration: 2000 / difficulty,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: false
    }).start(() => {
      // Once it arrives, it stays in WM until consolidated or interference hits
    });
  }, [isGameRunning, difficulty]);

  const startGame = () => {
    soundWhoosh();
    setIsRunning(true);
    setScore(0);
    setLongTermCount(0);
    setWorkingMemory([]);
    setLastMessage("Consolidate packets to the Hippocampus!");
    
    spawnTimer.current = setInterval(spawnPacket, 1500);
  };

  const stopGame = () => {
    setIsRunning(false);
    clearInterval(spawnTimer.current);
    setWorkingMemory([]);
  };

  const consolidate = (id) => {
    const packet = workingMemory.find(p => p.id === id);
    if (!packet) return;

    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate to Hippocampus (Center Bottom)
    Animated.parallel([
      Animated.timing(packet.x, { toValue: SIM_W / 2, duration: 400, useNativeDriver: false }),
      Animated.timing(packet.y, { toValue: SIM_H - 40, duration: 400, useNativeDriver: false })
    ]).start(() => {
      setWorkingMemory(prev => prev.filter(p => p.id !== id));
      setLongTermCount(c => c + 1);
      setScore(s => s + (packet.type === 'semantic' ? 20 : 10));
      
      if (longTermCount % 5 === 4) {
        soundSuccess();
        setDifficulty(d => d + 0.2);
        setLastMessage("Learning highway widened! Speed up! ⚡");
      }
    });
  };

  const triggerInterference = () => {
    if (interferenceActive || !isGameRunning) return;
    setInterference(true);
    setLastMessage("INTERFERENCE! Distraction wiping WM! 🧠⚡");
    soundBadge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Visual shockwave
    setTimeout(() => {
      setWorkingMemory(prev => prev.filter(p => {
         // Keep semantic items 50% of the time (stronger encoding)
         if (p.type === 'semantic' && Math.random() > 0.5) return true;
         return false;
      }));
      setInterference(false);
    }, 1000);
  };

  useEffect(() => {
    if (workingMemory.length > 9) { // WM Bottleneck
      triggerInterference();
    }
  }, [workingMemory]);

  useEffect(() => {
    return () => {
      clearInterval(spawnTimer.current);
    };
  }, []);

  // ── Render Helpers ─────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        <View style={[styles.stat, { borderLeftColor: '#A855F7' }]}>
           <Text style={styles.statLabel}>WM CAPACITY</Text>
           <Text style={[styles.statVal, { color: workingMemory.length > 7 ? '#FF4444' : '#00E5FF' }]}>
             {workingMemory.length} / 9
           </Text>
        </View>
        <View style={[styles.stat, { borderLeftColor: '#6C63FF' }]}>
           <Text style={styles.statLabel}>CONSOLIDATED</Text>
           <Text style={[styles.statVal, { color: '#6C63FF' }]}>{longTermCount}</Text>
        </View>
        <View style={[styles.stat, { borderLeftColor: '#FFD166' }]}>
           <Text style={styles.statLabel}>SCORE</Text>
           <Text style={[styles.statVal, { color: '#FFD166' }]}>{score}</Text>
        </View>
      </View>

      {/* ── Simulation ── */}
      <View style={[styles.simWindow, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H}>
           <Defs>
             <RadialGradient id="hipGrad" cx="50%" cy="50%" r="50%">
               <Stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
               <Stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
             </RadialGradient>
             <RadialGradient id="wmGrad" cx="50%" cy="50%" r="50%">
               <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
               <Stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
             </RadialGradient>
           </Defs>

           {/* Hippocampus Zone (Target) */}
           <Circle cx={SIM_W/2} cy={SIM_H - 40} r="60" fill="url(#hipGrad)" />
           <Path d={`M ${SIM_W/2 - 30} ${SIM_H - 10} Q ${SIM_W/2} ${SIM_H - 70} ${SIM_W/2 + 30} ${SIM_H - 10}`} 
                 stroke="#6C63FF" strokeWidth="2" fill="none" opacity={0.5} />
           <SvgText x={SIM_W/2} y={SIM_H - 20} fill="#6C63FF" fontSize="10" textAnchor="middle" fontFamily={FONTS.displayBold}>HIPPOCAMPUS</SvgText>

           {/* Interference Visual */}
           {interferenceActive && (
              <Circle cx={SIM_W/2} cy={SIM_H/2} r={200} fill="none" stroke="#FF4444" strokeWidth="4" opacity={0.3} />
           )}

           {/* Working Memory Zone Info */}
           <Rect x="20" y={SIM_H - 220} width={SIM_W - 40} height="120" rx="10" fill="url(#wmGrad)" stroke="#00E5FF" strokeDasharray="5,5" opacity={0.3} />
           <SvgText x={SIM_W/2} y={SIM_H - 180} fill="#00E5FF" fontSize="10" textAnchor="middle" opacity={0.5}>WORKING MEMORY SCRATCHPAD</SvgText>

           {/* Packets */}
           {workingMemory.map((p) => {
              return (
                 <AnimatedG key={p.id} 
// @ts-ignore
                 style={
                  // @ts-ignore
                  { transform: [{ translateX: p.x }, { translateY: p.y }] }}>
                    <TouchableOpacity onPress={() => consolidate(p.id)} activeOpacity={0.7}>
                       <Circle cx="0" cy="0" r={p.type === 'semantic' ? 18 : 15} fill={p.type === 'semantic' ? '#FFD166' : '#00E5FF'} />
                       <SvgText x="0" y="5" fontSize="10" fill="#000" textAnchor="middle" fontWeight="bold">
                         {p.val}
                       </SvgText>
                       {p.type === 'semantic' && (
                          <Circle cx="0" cy="0" r="22" stroke="#FFD166" strokeWidth="1" opacity={0.5} />
                       )}
                    </TouchableOpacity>
                 </AnimatedG>
              );
           })}

           {/* Scientist Mode Overlays */}
           {scientistMode && (
             <G>
               <SvgText x="10" y="20" fill="rgba(255,255,255,0.6)" fontSize="8">LATENCY: {(200 / difficulty).toFixed(0)}ms</SvgText>
               <SvgText x="10" y="32" fill="rgba(255,255,255,0.6)" fontSize="8">SYNAPTIC TENSION: {(workingMemory.length / 9 * 100).toFixed(0)}%</SvgText>
               {workingMemory.map(p => {
                  // @ts-ignore
                  return <Line key={`l-${p.id}`} x1={p.x} y1={p.y} x2={SIM_W/2} y2={SIM_H - 40} stroke={txtM} strokeWidth="1" strokeDasharray="2,2" opacity={0.2} />;
               })}
             </G>
           )}
        </Svg>

        {!isGameRunning && (
           <View style={styles.overlay}>
              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                 <Text style={styles.startBtnText}>INITIATE SENSES</Text>
              </TouchableOpacity>
           </View>
        )}
      </View>

      {/* ── Status Message ── */}
      <View style={[styles.msgBox, { backgroundColor: glass, borderColor: border }]}>
         <Icon name={interferenceActive ? "alert-circle" : "info"} size={16} color={interferenceActive ? "#FF4444" : "#00E5FF"} />
         <Text style={[styles.msgText, { color: txt2 }]}>{lastMessage}</Text>
      </View>

      {/* ── Controls / Legend ── */}
      <View style={styles.legend}>
         <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#00E5FF' }]} />
            <Text style={[styles.legendText, { color: txtM }]}>Sensory (10 pts)</Text>
         </View>
         <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FFD166' }]} />
            <Text style={[styles.legendText, { color: txtM }]}>Semantic (20 pts)</Text>
         </View>
         <View style={styles.legendItem}>
            <Icon name="zap" size={10} color="#FF4444" />
            <Text style={[styles.legendText, { color: txtM }]}>Overload at 9 items</Text>
         </View>
      </View>

      {isGameRunning && (
        <TouchableOpacity style={styles.stopBtn} onPress={stopGame}>
           <Text style={styles.stopBtnText}>STOP CONSOLIDATION</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: RADIUS.sm, borderLeftWidth: 3 },
  statLabel: { fontSize: 8, color: '#888', fontFamily: FONTS.displayBold, marginBottom: 2 },
  statVal: { fontSize: 16, fontFamily: FONTS.displayBold },
  
  simWindow: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  startBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.full },
  startBtnText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 14, letterSpacing: 1 },
  
  msgBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 16 },
  msgText: { fontSize: 12, fontFamily: FONTS.bodyMedium, flex: 1 },
  
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: FONTS.body },
  
  stopBtn: { marginTop: 20, alignSelf: 'center', padding: 8 },
  stopBtnText: { color: '#FF4444', fontSize: 11, fontFamily: FONTS.displayBold, letterSpacing: 1 }
});
