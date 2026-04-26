import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 320;

export default function EthicsLab({ scientistMode = false, onLabBreaker }) {
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
  const [utilWeight, setUtilWeight] = useState(50); // 0 = Deontology, 100 = Utilitarianism
  const [decision, setDecision] = useState('UNDECIDED');
  
  // Physics 
  const trainPosX = useRef(new Animated.Value(0)).current;
  const trainPosY = useRef(new Animated.Value(150)).current;
  
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     if (utilWeight > 60) setDecision('PULL LEVER (Utilitarian)');
     else if (utilWeight < 40) setDecision('DO NOTHING (Deontology)');
     else setDecision('PARALYZED');
  }, [utilWeight]);

  const updateWeight = (delta) => {
     if (running) return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setUtilWeight(Math.max(0, Math.min(100, utilWeight + delta)));
  };

  const executeScenario = () => {
     if (running || decision === 'PARALYZED') return;
     
     setRunning(true);
     soundWhoosh();
     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

     if (decision === 'PULL LEVER (Utilitarian)') {
        // Train diverts UP
        Animated.sequence([
           Animated.timing(trainPosX, { toValue: SIM_W * 0.4, duration: 1000, easing: Easing.linear, useNativeDriver: false }),
           Animated.parallel([
              Animated.timing(trainPosX, { toValue: SIM_W - 50, duration: 1000, easing: Easing.linear, useNativeDriver: false }),
              Animated.timing(trainPosY, { toValue: 50, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false })
           ])
        ]).start(() => {
           setGameOver(true);
           setResultMsg('1 Killed. 5 Saved. (Total deaths minimized mathematically).');
           soundBadge();
           if(onLabBreaker) onLabBreaker();
        });
     } else {
        // Train goes STRAIGHT
        Animated.timing(trainPosX, { toValue: SIM_W - 50, duration: 2000, easing: Easing.linear, useNativeDriver: false }).start(() => {
           setGameOver(true);
           setResultMsg('5 Killed. 1 Saved. (You refused to actively participate in murder).');
           soundSuccess();
        });
     }
  };

  const reset = () => {
     setRunning(false);
     setGameOver(false);
     setResultMsg('');
     trainPosX.setValue(0);
     trainPosY.setValue(150);
  };

  const renderTrolley = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ translateX: trainPosX }, { translateY: Animated.subtract(trainPosY, 150) }] }}>
        <Rect x="10" y="150" width="40" height="20" fill="#FFD166" rx="4" />
        <Rect x="40" y="150" width="10" height="20" fill="#A855F7" rx="2" />
        <Circle cx="20" cy="175" r="4" fill="#6C63FF" />
        <Circle cx="40" cy="175" r="4" fill="#6C63FF" />
        <SvgText x="30" y="140" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">TROLLEY</SvgText>
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>PREDICTED MACHINE OUTPUT</Text>
            <Text style={{ color: utilWeight > 60 ? '#A855F7' : '#FFD166', fontSize: 18, fontFamily: FONTS.displayBold, marginTop: 4 }}>
               {decision}
            </Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Svg width={SIM_W} height={200}>
            {/* Tracks */}
            {/* Main track */}
            <Path d={`M 0 160 L ${SIM_W} 160`} stroke="#555" strokeWidth="4" />
            <Path d={`M 0 170 L ${SIM_W} 170`} stroke="#555" strokeWidth="4" />
            {/* Divert track */}
            <Path d={`M ${SIM_W * 0.4} 160 Q ${SIM_W * 0.6} 60 ${SIM_W} 60`} stroke="#555" strokeWidth="4" />
            <Path d={`M ${SIM_W * 0.4} 170 Q ${SIM_W * 0.6} 70 ${SIM_W} 70`} stroke="#555" strokeWidth="4" />

            {/* People on bottom track (5) */}
            <Circle cx={SIM_W - 30} cy="165" r="4" fill="#FF4444" />
            <Circle cx={SIM_W - 45} cy="165" r="4" fill="#FF4444" />
            <Circle cx={SIM_W - 60} cy="165" r="4" fill="#FF4444" />
            <Circle cx={SIM_W - 75} cy="165" r="4" fill="#FF4444" />
            <Circle cx={SIM_W - 90} cy="165" r="4" fill="#FF4444" />
            <SvgText x={SIM_W - 60} y="195" fill="#fff" fontSize="10" textAnchor="middle">5 PEOPLE</SvgText>

            {/* Person on top track (1) */}
            <Circle cx={SIM_W - 45} cy="65" r="4" fill="#00D4A0" />
            <SvgText x={SIM_W - 45} y="45" fill="#fff" fontSize="10" textAnchor="middle">1 PERSON</SvgText>

            {/* The Train */}
            {renderTrolley()}
         </Svg>

         {gameOver && (
            <View style={styles.overlay}>
               <Text style={styles.overlayText}>{resultMsg}</Text>
            </View>
         )}

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>UTILITARIAN_CALCULUS: {(5 * utilWeight).toFixed(0)} utils</Text>
              <Text style={styles.sciText}>CATEGORICAL_IMPERATIVE: {utilWeight < 40 ? 'MAINTAINED' : 'VIOLATED'}</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 6 }}>CALIBRATE ETHICAL COMPASS</Text>
         
         <View style={styles.sliderRow}>
            <View style={{ alignItems: 'flex-start', flex: 1 }}>
               <Text style={{ color: '#FFD166', fontSize: 10, fontFamily: 'monospace' }}>DEONTOLOGY</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, flex: 1, justifyContent: 'center' }}>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateWeight(-20)}><Text style={{ color: '#fff' }}>-</Text></TouchableOpacity>
               <TouchableOpacity style={styles.miniBtn} onPress={() => updateWeight(20)}><Text style={{ color: '#fff' }}>+</Text></TouchableOpacity>
            </View>
            <View style={{ alignItems: 'flex-end', flex: 1 }}>
               <Text style={{ color: '#A855F7', fontSize: 10, fontFamily: 'monospace' }}>UTILITARIANISM</Text>
            </View>
         </View>

         {!gameOver ? (
            <TouchableOpacity 
               style={[styles.execBtn, { borderColor: decision === 'PARALYZED' ? '#555' : '#00D4FF', backgroundColor: decision === 'PARALYZED' ? '#222' : 'rgba(0,212,255,0.1)' }]} 
               onPress={executeScenario}
               disabled={decision === 'PARALYZED' || running}
            >
               <Text style={[styles.actionText, { color: decision === 'PARALYZED' ? '#555' : '#00D4FF' }]}>
                  {running ? 'EXECUTING...' : 'EXECUTE SCENARIO'}
               </Text>
            </TouchableOpacity>
         ) : (
            <TouchableOpacity style={[styles.execBtn, { borderColor: '#555', backgroundColor: '#333' }]} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET SCENARIO</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 200, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  overlay: { position: 'absolute', top: '40%', width: '90%', backgroundColor: 'rgba(0,0,0,0.9)', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#FF4444' },
  overlayText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 12, textAlign: 'center' },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16, gap: 10 },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: RADIUS.sm },
  miniBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },

  execBtn: { marginTop: 6, paddingVertical: 16, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center' },
  actionText: { fontSize: 12, fontFamily: FONTS.displayBold, letterSpacing: 1 }
});
