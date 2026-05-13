import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText, Path, LinearGradient, Stop, Defs, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

export default function GreedLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [wealth, setWealth] = useState(10);         // Absolute wealth
  const [baseline, setBaseline] = useState(10);     // Hedonic baseline
  const [happiness, setHappiness] = useState(80);   // Score (0-100)
  
  const [treadmillSpeed, setTreadmillSpeed] = useState(0); 
  const [gameState, setGameState] = useState('RUNNING'); // RUNNING, TRAPPED, FREE
  
  const timerRef = useRef(null);
  const conveyorAnim = useRef(new Animated.Value(0)).current;
  const runnerY = useRef(new Animated.Value(0)).current;

  // Time Engine
  useEffect(() => {
     if (gameState === 'FREE') return;

     timerRef.current = setInterval(() => {
         
         // Hedonic Adaptation: Baseline chases Wealth
         setBaseline(prev => {
             if (prev < wealth) return prev + Math.max(0.5, (wealth - prev) * 0.05); // Rapid adaptation upward
             if (prev > wealth) return prev - 0.2; // Very slow adaptation downward (Loss Aversion)
             return prev;
         });

         // Happiness is determined by the GAP between Wealth and Baseline
         setHappiness(prev => {
             const gap = wealth - baseline;
             let raw = 50 + gap * 5; 
             // Diminishing returns: Wealth inherently makes the baseline sticky
             if (wealth > 100) raw -= (wealth - 100) * 0.1;
             return Math.max(0, Math.min(100, raw));
         });

         // Treadmill speed visuals
         setTreadmillSpeed(Math.min(20, Math.max(1, (wealth / 10))));

         // State
         if (happiness < 20) {
             setGameState('TRAPPED');
         } else if (happiness > 20 && gameState === 'TRAPPED') {
             setGameState('RUNNING');
         }

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [wealth, baseline, happiness, gameState]);

  // Treadmill animation
  useEffect(() => {
      Animated.loop(
          Animated.timing(conveyorAnim, {
             toValue: -20,
             duration: 500 / Math.max(1, treadmillSpeed),
             easing: Easing.linear,
             useNativeDriver: true
          })
      ).start();

      Animated.loop(
          Animated.sequence([
             Animated.timing(runnerY, { toValue: -5, duration: 250 / Math.max(1, treadmillSpeed), useNativeDriver: true }),
             Animated.timing(runnerY, { toValue: 0, duration: 250 / Math.max(1, treadmillSpeed), useNativeDriver: true })
          ])
      ).start();

      return () => {
         conveyorAnim.stopAnimation();
         runnerY.stopAnimation();
      };
  }, [treadmillSpeed]);


  // Actions
  const hustle = () => {
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      
      // Early hustle is easy, late hustle is hard (Diminishing returns)
      const gain = Math.max(1, 10 - (wealth * 0.02));
      setWealth(prev => prev + gain);
  };

  const statusPurchase = () => {
      soundWhoosh();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Buying a watch gives massive short term gap, but instantly skyrockets baseline
      setWealth(prev => Math.max(0, prev - 10)); // Costs money
      // Triggers immediate happiness spike, but the baseline will rapidly chase it
      setHappiness(prev => Math.min(100, prev + 30));
      setBaseline(prev => prev + 20); // Expectation shoots up
  };

  const donate = () => {
      soundSuccess();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Costs wealth
      setWealth(prev => Math.max(0, prev - 15));
      
      // MAGIC TRICK: Giving lowers the baseline artificially, proving to the brain it has "enough"
      setBaseline(prev => Math.max(10, prev - 25));
      setHappiness(prev => Math.min(100, prev + 20));

      if (baseline < 20 && wealth > 50) {
          setGameState('FREE');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if(onLabBreaker) onLabBreaker();
      }
  };

  const resetGame = () => {
      soundWhoosh();
      setWealth(10);
      setBaseline(10);
      setHappiness(80);
      setGameState('RUNNING');
  };

  let joyColor = '#81C784';
  if (happiness < 50) joyColor = '#FFB74D';
  if (happiness < 20) joyColor = '#FF4444';
  if (gameState === 'FREE') joyColor = '#A855F7';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1A1500' : '#FFFDF5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>HAPPINESS GAUGE</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: joyColor }}>
                {gameState === 'FREE' ? 'ABUNDANCE 🕊️' : Math.floor(happiness) + '%'}
            </Text>
            <View style={[styles.barBg, { backgroundColor: glass1, width: '80%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${happiness}%`, backgroundColor: joyColor }} />
             </View>
         </View>
         <View style={{ alignItems: 'flex-end', width: 90 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>RAW WEALTH</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: '#D4A74A' }}>${Math.floor(wealth)}k</Text>
         </View>
      </View>

      {/* DYNAMIC TREADMILL GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
                <LinearGradient id="tread" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#333" />
                    <Stop offset="100%" stopColor="#111" />
                </LinearGradient>
            </Defs>

            {/* Background container */}
            <Rect x="0" y="0" width={SIM_W} height={SIM_H} rx="12" fill={glass1} stroke={border} />

            {/* Baseline Level (Red Line) */}
            <Rect x={10} y={SIM_H - 100 - (baseline)} width={10} height="4" fill="#FF4444" />
            <SvgText x={25} y={SIM_H - 96 - (baseline)} fill="#FF4444" fontSize="10" fontFamily="monospace">Expectations Baseline</SvgText>

            {/* Wealth Level (Gold Line) */}
            <Rect x={SIM_W - 20} y={SIM_H - 100 - (wealth)} width={10} height="4" fill="#D4A74A" />
            <SvgText x={SIM_W - 25} y={SIM_H - 96 - (wealth)} fill="#D4A74A" fontSize="10" fontFamily="monospace" textAnchor="end">Actual Wealth</SvgText>

            {/* The gap connection */}
            <Path d={`M 20 ${SIM_H - 98 - baseline} L ${SIM_W-20} ${SIM_H - 98 - wealth}`} stroke={joyColor} strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />

            <G transform={`translate(0, ${SIM_H - 80})`}>
                {/* Treadmill base */}
                <Rect x="40" y="0" width={SIM_W - 80} height="20" rx="10" fill="url(#tread)" stroke="#555" />
                
                {/* Treadmill belt lines (Animated) */}
                <Animated.View style={{ transform: [{ translateX: conveyorAnim }] }}>
                    <Svg width={SIM_W * 2} height="20">
                         {Array.from({ length: 40 }).map((_, i) => (
                             <Rect key={i} x={i * 20} y="0" width="2" height="20" fill="#666" />
                         ))}
                    </Svg>
                </Animated.View>
            </G>

            {/* The Runner */}
            <Animated.View style={{ transform: [{ translateY: runnerY }, { translateX: SIM_W/2 }] }}>
                <Svg width="50" height="80">
                   {/* Stickman running */}
                   <Circle cx="0" cy={SIM_H - 140} r="10" fill={gameState === 'FREE' ? '#A855F7' : '#CCC'} />
                   <Path d={`M 0 ${SIM_H-130} L 0 ${SIM_H - 100} M 0 ${SIM_H - 120} L -15 ${SIM_H - 110} M 0 ${SIM_H - 120} L 15 ${SIM_H - 130} M 0 ${SIM_H - 100} L -10 ${SIM_H - 80} M 0 ${SIM_H - 100} L 10 ${SIM_H - 90}`} stroke={gameState === 'FREE' ? '#A855F7' : "#CCC"} strokeWidth="4" />
                </Svg>
            </Animated.View>
            
            <SvgText x={SIM_W/2} y={SIM_H - 20} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">
                Speed: {Math.floor(treadmillSpeed)}x (Adaptation Rate)
            </SvgText>
         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#D4A74A20', borderColor: '#D4A74A' }]}
              onPress={hustle}>
              <Text style={[styles.btnTxt, { color: '#D4A74A' }]}>🏃‍♂️ Work (Earn $)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
              onPress={statusPurchase}>
              <Text style={[styles.btnTxt, { color: '#FF4444' }]}>👑 Buy Status ($-)</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#81C78420', borderColor: '#81C784', width: '80%' }]}
                 onPress={donate}>
                 <Text style={[styles.btnTxt, { color: '#81C784' }]}>🕊️ Generosity (Give Away $)</Text>
             </TouchableOpacity>
          </View>
      </View>

      {gameState === 'TRAPPED' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 8 }}>Treadmill Fatigue! Expectations are too high!</Text>
      )}

      {(gameState === 'TRAPPED' || gameState === 'FREE') && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Simulation 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#FFD166', fontSize: 9, fontFamily: 'monospace' }}>UTILITY_GAP: {(wealth - baseline).toFixed(2)} units</Text>
            <Text style={{ color: '#FFD166', fontSize: 9, fontFamily: 'monospace' }}>ADAPTATION_COEFFICIENT: {(Math.max(0.5, (wealth - baseline) * 0.05)).toFixed(2)} Δ/sec</Text>
            <Text style={{ color: '#FFD166', fontSize: 9, fontFamily: 'monospace' }}>MARGINAL_ROI: {(Math.max(1, 10 - (wealth * 0.02))).toFixed(2)} $/click</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, minWidth: '45%', alignItems: 'center', marginBottom: 8 },
  btnTxt: { fontSize: 11, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A1500', borderRadius: RADIUS.sm, borderWidth: 1 }
});
