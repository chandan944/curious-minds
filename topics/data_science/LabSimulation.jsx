import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const INITIAL_DATA = [
  { x: 0.1, y: 0.15 }, { x: 0.2, y: 0.25 }, { x: 0.3, y: 0.35 },
  { x: 0.4, y: 0.45 }, { x: 0.5, y: 0.55 }, { x: 0.6, y: 0.65 },
  { x: 0.7, y: 0.75 }, { x: 0.8, y: 0.85 }, { x: 0.9, y: 0.95 },
];

const CHALLENGES = [
  { id: 'chaos_theory', title: 'Noise Injection', desc: 'Add chaos until variance exceeds 0.5', icon: 'zap', color: '#FF3131' },
  { id: 'perfect_fit', title: 'R² Master', desc: 'Clean the dataset to achieve > 95% correlation', icon: 'star', color: '#10B981' },
  { id: 'outlier_hunt', title: 'The Janitor', desc: 'Manually remove exactly 3 outliers from the plot', icon: 'search', color: '#00E5FF' },
  { id: 'regression_king', title: 'Linear Legend', desc: 'Identify the trend line with 10+ points active', icon: 'chart', color: '#FFD166' },
];

export default function DataScienceLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [data, setData] = useState(INITIAL_DATA);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);
  const [metrics, setMetrics] = useState({ r2: 1, sd: 0 });

  const challengePopAnim = useRef(new Animated.Value(0)).current;

  // Linear Regression Logic: y = mx + c
  const calculateRegression = useCallback(() => {
    if (data.length < 2) return { m: 0, c: 0, r2: 0, sd: 0 };
    let n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    data.forEach(p => {
      sumX += p.x; sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const c = (sumY - m * sumX) / n;
    
    // R-Squared
    const num = (n * sumXY - sumX * sumY);
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = den === 0 ? 0 : num / den;
    const r2 = r * r;

    // SD
    let sqDiff = 0;
    data.forEach(p => sqDiff += Math.pow(p.y - (m * p.x + c), 2));
    const sd = Math.sqrt(sqDiff / n);

    setMetrics({ r2, sd });

    return { m, c };
  }, [data]);

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

  const { m, c } = calculateRegression();

  useEffect(() => {
    if (metrics.r2 > 0.95 && data.length > 5) triggerChallenge('perfect_fit');
    if (metrics.sd > 0.1) triggerChallenge('chaos_theory');
    if (data.length >= 10) triggerChallenge('regression_king');
  }, [metrics, data.length]);

  const injectNoise = () => {
    soundTap();
    Haptics.impactAsync();
    setData(prev => prev.map(p => ({
      ...p,
      y: Math.max(0, Math.min(1, p.y + (Math.random() - 0.5) * 0.2))
    })));
  };

  const addPoint = () => {
    if (data.length > 20) return;
    soundWhoosh();
    setData(prev => [...prev, { x: Math.random(), y: Math.random() }]);
  };

  const clearOutliers = () => {
    soundWhoosh();
    setData(prev => prev.filter(p => {
        const expectedY = m * p.x + c;
        return Math.abs(p.y - expectedY) < 0.2;
    }));
    triggerChallenge('outlier_hunt');
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

      {/* ── Data HUD ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <Icon name="chart" size={24} color="#00E5FF" />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>CORRELATION (R²)</Text>
               <Text style={[styles.sValue, { color: metrics.r2 > 0.9 ? '#10B981' : (metrics.r2 > 0.5 ? '#FFD166' : '#FF3131') }]}>
                 {(metrics.r2 * 100).toFixed(1)}% {metrics.r2 > 0.9 ? 'STABLE' : 'UNSTABLE'}
               </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={[styles.sLabel, { color: txtM }]}>SAMPLE SIZE</Text>
               <Text style={[styles.sValue, { color: txt1 }]}>{data.length}</Text>
            </View>
         </View>
      </View>

      {/* ── Scatter Plot Viz ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           {/* Axes */}
           <Line x1="30" y1={SIM_H-30} x2={SIM_W-30} y2={SIM_H-30} stroke={txtM} strokeWidth="1" />
           <Line x1="30" y1="30" x2="30" y2={SIM_H-30} stroke={txtM} strokeWidth="1" />
           
           {/* Trend Line */}
           {data.length > 1 && (
             <Line 
               x1={mapCoor(0, SIM_W)} y1={mapCoor(c, SIM_H)}
               x2={mapCoor(1, SIM_W)} y2={mapCoor(m + c, SIM_H)}
               stroke="#00E5FF" strokeWidth="3" opacity={0.6} />
           )}

           {/* Data Points */}
           {data.map((p, i) => {
              const expectedY = m * p.x + c;
              const isOutlier = Math.abs(p.y - expectedY) > 0.2;
              return (
                <Circle key={i} cx={mapCoor(p.x, SIM_W)} cy={mapCoor(p.y, SIM_H)} r="5" fill={isOutlier ? '#FF3131' : '#10B981'} opacity={0.8} />
              );
           })}
        </Svg>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.btnRow}>
         <TouchableOpacity onPress={injectNoise} style={[styles.btn, { backgroundColor: '#FF313120', borderColor: '#FF313160' }]}>
            <Icon name="zap" size={16} color="#FF3131" />
            <Text style={[styles.btnText, { color: '#FF3131' }]}>INJECT NOISE</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={clearOutliers} style={[styles.btn, { backgroundColor: '#10B98120', borderColor: '#10B98160' }]}>
            <Icon name="wrench" size={16} color="#10B981" />
            <Text style={[styles.btnText, { color: '#10B981' }]}>CLEAN DATA</Text>
         </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={addPoint} style={[styles.addBtn, { backgroundColor: glass1, borderColor: border }]}>
         <Icon name="plus" size={18} color={txt1} />
         <Text style={[styles.addBtnText, { color: txt1 }]}>CAPTURE NEW DATA POINT</Text>
      </TouchableOpacity>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="terminal" size={14} color="#00E5FF" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Linear Stats 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>SLOPE (M)</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>{m.toFixed(3)}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>INTERCEPT (C)</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>{c.toFixed(3)}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>VARIANCE (σ)</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{metrics.sd.toFixed(3)}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>Z-SCORE ZONE</Text>
                 <Text style={[styles.statValue, { color: '#A855F7' }]}>95% CONF.</Text>
              </View>
           </View>
           <View style={{ marginTop: 12 }}>
              <Text style={[styles.sciNoteText, { color: txtM, textAlign: 'center' }]}>
                {"Goal: Minimizing the Residual Squared Error."}
              </Text>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Analytics Missions ({completedChallenges.length}/4)</Text>
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
  sValue: { fontFamily: FONTS.displayMedium, fontSize: 15, marginTop: 2 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden' },
  btnRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontFamily: FONTS.displayMedium, fontSize: 10, letterSpacing: 0.5 },
  addBtn: { marginTop: 12, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  addBtnText: { fontFamily: FONTS.displayMedium, fontSize: 11, letterSpacing: 1 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  sciNoteText: { fontFamily: 'monospace', fontSize: 11 },
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
