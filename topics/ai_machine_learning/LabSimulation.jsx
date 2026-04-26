import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Circle, G, Path, Line, Text as SvgText, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const DATA_POINTS = [
  { x: 0.2, y: 0.2, c: 0 }, { x: 0.3, y: 0.4, c: 0 }, { x: 0.1, y: 0.5, c: 0 },
  { x: 0.4, y: 0.2, c: 0 }, { x: 0.2, y: 0.6, c: 0 }, { x: 0.45, y: 0.45, c: 0 },
  { x: 0.8, y: 0.8, c: 1 }, { x: 0.7, y: 0.9, c: 1 }, { x: 0.9, y: 0.7, c: 1 },
  { x: 0.85, y: 0.6, c: 1 }, { x: 0.6, y: 0.7, c: 1 }, { x: 0.55, y: 0.9, c: 1 },
];

const CHALLENGES = [
  { id: 'separate', title: 'Perfect Separation', desc: 'Achieve a Loss of < 0.05 by adjusting weights', icon: 'star', color: '#10B981' },
  { id: 'overfit', title: 'The Chaos Boundary', desc: 'Force the line into a high-error zone (> 0.8 Loss)', icon: 'zap', color: '#FF3131' },
  { id: 'grad_descent', title: 'Auto-Optimizer', desc: 'Let the Gradient Descent algorithm find the solution', icon: 'terminal', color: '#A855F7' },
  { id: 'bias_shift', title: 'The Bias Lever', desc: 'Shift the entire decision plane using only the Bias slider', icon: 'layers', color: '#FFD166' },
];

export default function AILab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(-1);
  const [b, setB] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [training, setTraining] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const challengePopAnim = useRef(new Animated.Value(0)).current;

  const triggerChallenge = useCallback((cid) => {
    if (completedChallenges.includes(cid)) return;
    const ch = CHALLENGES.find(c => c.id === cid);
    setLastChallengeMsg(ch);
    soundBadge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    challengePopAnim.setValue(0);
    Animated.sequence([
      Animated.spring(challengePopAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(challengePopAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLastChallengeMsg(null));
    setCompleted(prev => [...prev, cid]);
  }, [completedChallenges]);

  const calculateLoss = useCallback(() => {
    let currentLoss = 0;
    DATA_POINTS.forEach(pt => {
      const z = pt.x * w1 + pt.y * w2 + b;
      const a = 1 / (1 + Math.exp(-z));
      currentLoss += Math.pow(pt.c - a, 2);
    });
    const avgLoss = currentLoss / DATA_POINTS.length;
    setLoss(avgLoss);

    if (avgLoss < 0.05) triggerChallenge('separate');
    if (avgLoss > 0.8) triggerChallenge('overfit');
  }, [w1, w2, b, triggerChallenge]);

  useEffect(() => {
    calculateLoss();
  }, [w1, w2, b, calculateLoss]);

  const runGradientDescent = () => {
    soundWhoosh();
    setTraining(true);
    let iter = 0;
    const interval = setInterval(() => {
      const lr = 0.5;
      let dw1 = 0, dw2 = 0, db = 0;
      DATA_POINTS.forEach(pt => {
        const z = pt.x * w1 + pt.y * w2 + b;
        const a = 1 / (1 + Math.exp(-z));
        const dz = a - pt.c;
        dw1 += dz * pt.x;
        dw2 += dz * pt.y;
        db += dz;
      });
      setW1(p => p - (lr * dw1) / DATA_POINTS.length);
      setW2(p => p - (lr * dw2) / DATA_POINTS.length);
      setB(p => p - (lr * db) / DATA_POINTS.length);
      iter++;
      if (iter > 50 || loss < 0.03) {
        clearInterval(interval);
        setTraining(false);
        triggerChallenge('grad_descent');
      }
    }, 50);
  };

  const mapCoor = (val, size) => 30 + val * (size - 60);

  return (
    <View style={styles.container}>
      {lastChallengeMsg && (
        <Animated.View style={[styles.challengePopup, {
          opacity: challengePopAnim, backgroundColor: lastChallengeMsg.color + '20', borderColor: lastChallengeMsg.color + '60',
          transform: [{ translateY: challengePopAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <Icon name="trophy" size={18} color={lastChallengeMsg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengePopTitle, { color: lastChallengeMsg.color }]}>Challenge Complete!</Text>
            <Text style={[styles.challengePopDesc, { color: txt2 }]}>{lastChallengeMsg.title}</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Model HUD ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <Icon name="cpu" size={24} color="#A855F7" />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>LOSS METRIC (MSE)</Text>
               <View style={styles.lossBarBg}>
                  <View style={[styles.lossBarFill, { width: `${(1 - loss) * 100}%`, backgroundColor: loss < 0.1 ? '#10B981' : (loss < 0.4 ? '#FFD166' : '#FF3131') }]} />
               </View>
            </View>
            <Text style={[styles.lossValue, { color: loss < 0.1 ? '#10B981' : txt1 }]}>{(loss * 100).toFixed(1)}%</Text>
         </View>
      </View>

      {/* ── Decision Boundary Viz ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050D0A' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           {/* Grid */}
           {[...Array(6)].map((_, i) => (
             <React.Fragment key={i}>
                <Line x1={30 + i * (SIM_W - 60) / 5} y1="30" x2={30 + i * (SIM_W - 60) / 5} y2={SIM_H - 30} stroke={isDark ? '#FFF2' : '#0001'} />
                <Line x1="30" y1={30 + i * (SIM_H - 60) / 5} x2={SIM_W - 30} y2={30 + i * (SIM_H - 60) / 5} stroke={isDark ? '#FFF2' : '#0001'} />
             </React.Fragment>
           ))}

           {/* Decision Line: x*w1 + y*w2 + b = 0 => y = -(w1/w2)x - b/w2 */}
           <Line 
             x1={mapCoor(0, SIM_W)} y1={mapCoor(-(w1/w2)*0 - b/w2 || 0, SIM_H)}
             x2={mapCoor(1, SIM_W)} y2={mapCoor(-(w1/w2)*1 - b/w2 || 0, SIM_H)}
             stroke="#A855F7" strokeWidth="4" opacity={0.8} />

           {/* Data Points */}
           {DATA_POINTS.map((pt, i) => (
             <Circle key={i} cx={mapCoor(pt.x, SIM_W)} cy={mapCoor(pt.y, SIM_H)} r="6" fill={pt.c === 0 ? '#00E5FF' : '#FF3131'} />
           ))}
        </Svg>
      </View>

      {/* ── Weights & Bias Sliders ── */}
      <View style={styles.controlPanel}>
         <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: txtM }]}>WEIGHT 1 (X)</Text>
            <View style={styles.sliderTrack}>
               <TouchableOpacity 
                 onPress={() => { setW1(p => p - 0.2); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="minus" size={14} color={txt1} /></TouchableOpacity>
               <View style={styles.valBox}><Text style={[styles.valText, { color: '#00E5FF' }]}>{w1.toFixed(1)}</Text></View>
               <TouchableOpacity 
                 onPress={() => { setW1(p => p + 0.2); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="plus" size={14} color={txt1} /></TouchableOpacity>
            </View>
         </View>

         <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: txtM }]}>WEIGHT 2 (Y)</Text>
            <View style={styles.sliderTrack}>
               <TouchableOpacity 
                 onPress={() => { setW2(p => p - 0.2); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="minus" size={14} color={txt1} /></TouchableOpacity>
               <View style={styles.valBox}><Text style={[styles.valText, { color: '#FF3131' }]}>{w2.toFixed(1)}</Text></View>
               <TouchableOpacity 
                 onPress={() => { setW2(p => p + 0.2); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="plus" size={14} color={txt1} /></TouchableOpacity>
            </View>
         </View>

         <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: txtM }]}>BIAS (OFFSET)</Text>
            <View style={styles.sliderTrack}>
               <TouchableOpacity 
                 onPress={() => { setB(p => p - 0.2); triggerChallenge('bias_shift'); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="minus" size={14} color={txt1} /></TouchableOpacity>
               <View style={styles.valBox}><Text style={[styles.valText, { color: '#FFD166' }]}>{b.toFixed(1)}</Text></View>
               <TouchableOpacity 
                 onPress={() => { setB(p => p + 0.2); triggerChallenge('bias_shift'); Haptics.impactAsync(); }} 
                 style={[styles.miniBtn, { backgroundColor: glass2 }]}><Icon name="plus" size={14} color={txt1} /></TouchableOpacity>
            </View>
         </View>
      </View>

      <TouchableOpacity onPress={runGradientDescent} disabled={training}
        style={[styles.trainBtn, { backgroundColor: training ? '#A855F740' : '#A855F7' }]}>
         <Icon name="terminal" size={18} color="#FFF" />
         <Text style={styles.trainBtnText}>{training ? 'TRAINING MODEL...' : 'AUTO-OPTIMIZE (STOCHASTIC)'}</Text>
      </TouchableOpacity>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="search" size={14} color="#00E5FF" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Inference Logic 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>ACTIVATION</Text>
                 <Text style={[styles.statValue, { color: '#10B981' }]}>SIGMOID</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>LR (RATE)</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>0.5</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>DECISION Z</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{((w1+w2)/2).toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>SQUASHING</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>NON-LINEAR</Text>
              </View>
           </View>
           <View style={styles.sciNote}>
             <Icon name="info" size={12} color={txtM} />
             <Text style={[styles.sciNoteText, { color: txtM }]}>
               {"Equation: σ(w₁x₁ + w₂x₂ + b)"}
             </Text>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>AI Missions ({completedChallenges.length}/4)</Text>
        </View>
        {CHALLENGES.map(c => {
          const done = completedChallenges.includes(c.id);
          return (
            <View key={c.id} style={styles.challengeItem}>
              <View style={[styles.cIcon, { backgroundColor: done ? c.color + '20' : '#334444' }]}>
                <Icon name={done ? 'check' : c.icon} size={14} color={done ? c.color : txtM} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cTitle, { color: done ? c.color : txt1, textDecorationLine: done ? 'line-through' : 'none' }]}>{c.title}</Text>
                <Text style={[styles.cDesc, { color: txtM }]}>{c.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md },
  statusCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  lossBarBg: { height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  lossBarFill: { height: '100%' },
  lossValue: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden' },
  controlPanel: { marginTop: 16, gap: 12 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sliderLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10, flex: 1 },
  sliderTrack: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  valBox: { width: 50, alignItems: 'center' },
  valText: { fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
  trainBtn: { marginTop: 20, paddingVertical: 14, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  trainBtnText: { color: '#FFF', fontFamily: FONTS.displayMedium, fontSize: 12, letterSpacing: 1 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  sciNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  sciNoteText: { fontFamily: FONTS.body, fontSize: 11 },
  challengeCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  challengeCardTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  challengeItem: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  cIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  cDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  challengePopup: { position: 'absolute', top: 20, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 100 },
  challengePopTitle: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  challengePopDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 1 },
});
