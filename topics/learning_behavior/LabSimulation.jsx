import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, RadialGradient, Stop, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

// Maze nodes for simple learning
const NODES = [
  { id: 0, x: 50, y: 350, type: 'START' },
  { id: 1, x: 50, y: 200, type: 'JUNCTION' },
  { id: 2, x: 200, y: 200, type: 'JUNCTION' },
  { id: 3, x: 200, y: 50, type: 'GOAL' }
];

export default function LearningLab({ scientistMode = false }) {
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
  const [currentNode, setCurrentNode] = useState(0);
  const [learningScore, setScore] = useState(0);
  const [trials, setTrials] = useState(0);
  const [weights, setWeights] = useState({ '1_to_2': 0.5 }); // Probability of correct turn
  const [lastAction, setAction] = useState('Guide the creature to the GOAL!');
  
  const moveAnim = useRef(new Animated.ValueXY({ x: 50, y: 350 })).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // ── AI Logic ───────────────────────────────────
  const moveTo = (nodeIdx) => {
     Animated.timing(moveAnim, {
        toValue: { x: NODES[nodeIdx].x, y: NODES[nodeIdx].y },
        duration: 800,
        useNativeDriver: false
     }).start(() => {
        setCurrentNode(nodeIdx);
        if (NODES[nodeIdx].type === 'GOAL') {
           soundSuccess();
           setAction("Success! Reward the behavior to reinforce it!");
           setTimeout(resetPosition, 2000);
        }
     });
  };

  const resetPosition = () => {
    setCurrentNode(0);
    moveAnim.setValue({ x: NODES[0].x, y: NODES[0].y });
    setTrials(t => t + 1);
  };

  const handleAction = (type) => {
    if (type === 'REWARD') {
       soundBadge();
       setWeights(prev => ({ ...prev, '1_to_2': Math.min(1, prev['1_to_2'] + 0.2) }));
       setAction("Positive Reinforcement! Connection strengthens.");
       setScore(s => Math.min(100, s + 10));
    } else {
       soundTap();
       setWeights(prev => ({ ...prev, '1_to_2': Math.max(0.1, prev['1_to_2'] - 0.2) }));
       setAction("Punishment/Extinction. Connection weakens.");
       setScore(s => Math.max(0, s - 5));
    }
  };

  const simulateStep = () => {
    if (currentNode === 0) {
       moveTo(1);
    } else if (currentNode === 1) {
       // Decide based on weights
       const roll = Math.random();
       if (roll < weights['1_to_2']) {
          moveTo(2);
       } else {
          setAction("Wrong turn! Needs training.");
          // Stay or move back slightly etc
       }
    } else if (currentNode === 2) {
       moveTo(3);
    }
  };

  // ── Render ─────────────────────────────────────

  const renderCreature = () => {
    return (
      <AnimatedG transform={[{ translateX: moveAnim.x }, { translateY: moveAnim.y }]}>
        <Circle r="12" fill={color} stroke="#fff" strokeWidth="2" />
        <Circle cx="-4" cy="-4" r="2" fill="#fff" />
        <Circle cx="4" cy="-4" r="2" fill="#fff" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Learning Stats ── */}
      <View style={styles.statsRow}>
         <View style={styles.stat}>
            <Text style={styles.statLabel}>LEARNING ACCURACY</Text>
            <Text style={[styles.statVal, { color: '#00D4A0' }]}>{learningScore}%</Text>
         </View>
         <View style={styles.stat}>
            <Text style={styles.statLabel}>TOTAL TRIALS</Text>
            <Text style={[styles.statVal, { color: '#A855F7' }]}>{trials}</Text>
         </View>
      </View>

      {/* ── The Maze Window ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H}>
           {/* Maze Walls */}
           <G opacity={0.3}>
              <Path d="M 30 380 L 70 380 L 70 220 L 220 220 L 220 30" stroke={txtM} strokeWidth="40" fill="none" />
           </G>

           {/* Synaptic Weights (Visualized) */}
           <Line x1={NODES[1].x} y1={NODES[1].y} x2={NODES[2].x} y2={NODES[2].y} 
                 stroke="#00D4FF" strokeWidth={weights['1_to_2'] * 15} opacity={weights['1_to_2']} strokeDasharray="5,3" />

           {/* Points of interest */}
           <Circle cx={NODES[0].x} cy={NODES[0].y} r="10" fill="#888" />
           <Rect x={NODES[3].x - 15} y={NODES[3].y - 15} width="30" height="30" fill="#FFD166" rx="5" />
           <SvgText x={NODES[3].x} y={NODES[3].y + 40} fill="#FFD166" fontSize="10" textAnchor="middle" fontWeight="bold">GOAL! 🧀</SvgText>

           {/* The Creature */}
           {renderCreature()}

           {scientistMode && (
             <G x="20" y="30">
                <SvgText fill="#00FF00" fontSize="8" fontFamily="monospace">WEIGHT (W1): {weights['1_to_2'].toFixed(2)}</SvgText>
                <SvgText y={12} fill="#00FF00" fontSize="8" fontFamily="monospace">PREDICTION ERROR: {((1 - weights['1_to_2']) * 0.5).toFixed(2)}</SvgText>
             </G>
           )}
        </Svg>

        <View style={styles.actionCenter}>
           <Text style={[styles.infoText, { color: txt1 }]}>{lastAction}</Text>
           <TouchableOpacity style={styles.stepBtn} onPress={simulateStep}>
              <Text style={styles.stepBtnText}>RUN NEXT TRIAL</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* ── Training Controls ── */}
      <View style={styles.controls}>
         <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#00D4A0' }]} onPress={() => handleAction('REWARD')}>
            <Icon name="award" size={18} color="#000" />
            <Text style={styles.ctrlText}>REWARD 🧀</Text>
         </TouchableOpacity>
         
         <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#FF4444' }]} onPress={() => handleAction('PUNISH')}>
            <Icon name="zap" size={18} color="#fff" />
            <Text style={[styles.ctrlText, { color: '#fff' }]}>PUNISH ⚡</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: RADIUS.md, alignItems: 'center' },
  statLabel: { fontSize: 8, color: '#888', fontFamily: FONTS.displayBold, marginBottom: 4 },
  statVal: { fontSize: 20, fontFamily: FONTS.displayBold },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  actionCenter: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 11, textAlign: 'center', paddingHorizontal: 40, fontFamily: FONTS.bodyMedium },
  stepBtn: { backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.full },
  stepBtnText: { color: '#fff', fontSize: 13, fontFamily: FONTS.displayBold },

  controls: { flexDirection: 'row', gap: 12, marginTop: 16 },
  ctrlBtn: { flex: 1, height: 50, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctrlText: { fontSize: 11, fontFamily: FONTS.displayBold, color: '#000' }
});
