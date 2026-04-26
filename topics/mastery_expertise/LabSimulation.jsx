import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundBadge, soundWhoosh } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 300;

export default function MasteryGauntlet({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const accentColor = _themeObj.accent?.primary || '#6C63FF';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAUNTLET STATE ──
  const [hours, setHours] = useState(0); 
  const [skill, setSkill] = useState(0); // 0 to 10k max
  const [frustration, setFrustration] = useState(0); 
  const [plateauWarning, setPlateauWarning] = useState(0);

  // User Controls
  const [focusLevel, setFocusLevel] = useState(1); // 1 = Low (Passive), 2 = High (Deliberate)
  const [difficulty, setDifficulty] = useState(500); // Target skill rating they are trying to tackle
  
  const [gameState, setGameState] = useState('PRACTICING ⏳');
  const [history, setHistory] = useState([]); // { hour, skill }

  const timerRef = useRef(null);

  // Flow State logic
  // Flow = (Difficulty is slightly > Skill) + (High Focus)
  const isFlow = focusLevel === 2 && difficulty > skill && difficulty <= skill + 1500;
  const isBored = difficulty <= skill;
  const isPanicked = difficulty > skill + 1500;

  useEffect(() => {
    if (gameState === 'QUIT 💥' || gameState === 'WORLD CLASS 🏆') return;

    timerRef.current = setInterval(() => {
        setHours(prev => {
            const nextH = prev + 50; 
            return nextH >= 10000 ? 10000 : nextH;
        });
        
        // Complex skill growth math
        setSkill(prevSkill => {
            let growth = 0;
            if (isFlow) growth = 45; // Massive compound growth
            else if (isBored) growth = focusLevel === 1 ? 2 : 5; // Flatlining
            else if (isPanicked) growth = 5; // Too hard, learning very little

            // High frustration kills growth
            if (frustration > 80) growth *= 0.2;

            const nextSkill = Math.min(10000, prevSkill + growth);
            
            if (hours % 250 === 0 && hours > 0) {
                setHistory(h => [...h, { hour: hours, skill: nextSkill }]);
            }
            return nextSkill;
        });

        // Frustration Engine
        setFrustration(prev => {
            if (isPanicked) return Math.min(100, prev + 8);
            if (isFlow) return Math.max(0, prev - 4);
            return prev;
        });

        // Plateau warning
        setPlateauWarning(prev => {
           if (isBored) return Math.min(100, prev + 5);
           return 0; // Reset if they increase difficulty
        });

    }, 150); // Fast simulation

    return () => clearInterval(timerRef.current);
  }, [hours, skill, focusLevel, difficulty, isFlow, isBored, isPanicked, frustration, gameState]);

  // Check Quit condition
  useEffect(() => {
     if (frustration >= 100 && gameState !== 'QUIT 💥') {
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         setGameState('QUIT 💥');
         clearInterval(timerRef.current);
     }
  }, [frustration, gameState]);

  // Check Win condition
  useEffect(() => {
     if (hours >= 10000 && gameState !== 'WORLD CLASS 🏆' && gameState !== 'PERMANENT PLATEAU ⛰️' && gameState !== 'QUIT 💥') {
         clearInterval(timerRef.current);
         const win = skill > 8000;
         setGameState(win ? 'WORLD CLASS 🏆' : 'PERMANENT PLATEAU ⛰️');
         if (win && onLabBreaker) onLabBreaker();
     }
  }, [hours, skill, gameState, onLabBreaker]);

  const handleDifficulty = (val) => {
     soundTap();
     setDifficulty(val);
  };

  const resetGauntlet = () => {
      soundWhoosh();
      setHours(0);
      setSkill(0);
      setFrustration(0);
      setPlateauWarning(0);
      setHistory([]);
      setGameState('PRACTICING ⏳');
      setDifficulty(500);
      setFocusLevel(1);
  };

  const getPath = () => {
    if (history.length === 0) return `M 0,${SIM_H}`;
    let path = `M 0,${SIM_H}`;
    for (const h of history) {
        const x = (h.hour / 10000) * SIM_W;
        const y = SIM_H - (h.skill / 10000) * SIM_H;
        path += ` L ${x},${y}`;
    }
    const curX = (hours/10000) * SIM_W;
    const curY = SIM_H - (skill/10000) * SIM_H;
    path += ` L ${curX},${curY}`;
    return path;
  };

  // Status mapping
  let activeColor = accentColor;
  let statusText = "Building Skill...";
  if (isFlow) { activeColor = '#00D4A0'; statusText = "FLOW STATE! Exponential Growth 🚀"; }
  else if (isPanicked) { activeColor = '#FF4444'; statusText = "PANIC ZONE! Too Hard! 😫"; }
  else if (isBored) { activeColor = '#D4A74A'; statusText = "AUTOPILOT. Plateau incoming... ⛰️"; }
  
  if (gameState !== 'PRACTICING ⏳') {
      statusText = gameState;
      activeColor = '#888';
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER DASHBOARD */}
      <View style={[styles.dash, { borderColor: border, backgroundColor: isDark ? '#0A0A10' : '#F5F5F5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, color: txtM, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>{statusText}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 24, color: txt1, fontFamily: 'monospace' }}>{Math.floor(skill)}</Text>
                <Text style={{ fontSize: 12, color: txt2, fontFamily: 'monospace' }}>Skill Pts</Text>
            </View>
         </View>
         <View style={{ alignItems: 'flex-end', width: 90 }}>
            <Text style={{ fontSize: 9, color: txtM, fontFamily: FONTS.monospace }}>HOURS LOGGED</Text>
            <Text style={{ fontSize: 16, color: accentColor, fontFamily: 'monospace' }}>{hours}</Text>
            <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 4 }]}>
               <View style={{ height: '100%', width: `${(hours/10000)*100}%`, backgroundColor: accentColor }} />
            </View>
         </View>
      </View>

      {/* METRICS ROW */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
         <View style={[styles.miniMeter, { borderColor: border }]}>
             <Text style={{ fontSize: 9, color: txtM, fontFamily: FONTS.displayBold }}>FRUSTRATION</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, height: 6, marginTop: 4 }]}>
                 <View style={{ height: '100%', width: `${frustration}%`, backgroundColor: '#FF4444' }} />
             </View>
         </View>
         <View style={[styles.miniMeter, { borderColor: border }]}>
             <Text style={{ fontSize: 9, color: txtM, fontFamily: FONTS.displayBold }}>PLATEAU RISK</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, height: 6, marginTop: 4 }]}>
                 <View style={{ height: '100%', width: `${plateauWarning}%`, backgroundColor: '#D4A74A' }} />
             </View>
         </View>
      </View>

      {/* GRAPH CHART */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
          <Svg width={SIM_W} height={SIM_H}>
            <Defs>
              <LinearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0%" stopColor={activeColor} stopOpacity="0.5"/>
                 <Stop offset="100%" stopColor={activeColor} stopOpacity="0.0"/>
              </LinearGradient>
            </Defs>
            {/* Grid */}
            {[0.25, 0.5, 0.75].map(f => (
               <Line key={f} x1="0" y1={SIM_H*f} x2={SIM_W} y2={SIM_H*f} stroke={border} strokeDasharray="3 3"/>
            ))}
            <SvgText x={5} y={15} fill="rgba(255,255,255,0.6)" fontSize="10">Grandmaster (10k)</SvgText>
            
            {/* Target Difficulty Highlight */}
            <Rect x="0" y={SIM_H - (difficulty/10000)*SIM_H - 15} width={SIM_W} height="30" fill="rgba(255,255,255,0.05)" />
            <Line x1="0" y1={SIM_H - (difficulty/10000)*SIM_H} x2={SIM_W} y2={SIM_H - (difficulty/10000)*SIM_H} stroke="#FFF" strokeOpacity="0.2" strokeDasharray="5 5" />
            <SvgText x={SIM_W - 60} y={SIM_H - (difficulty/10000)*SIM_H - 4} fill="#FFF" opacity={0.4} fontSize="9">Target Diff</SvgText>

            {history.length > 0 && (
                <>
                <Path d={`${getPath()} L ${(hours/10000)*SIM_W},${SIM_H} L 0,${SIM_H} Z`} fill="url(#gGrad)" />
                <Path d={getPath()} fill="none" stroke={activeColor} strokeWidth="3" />
                </>
            )}
            <Circle cx={(hours/10000)*SIM_W} cy={SIM_H - (skill/10000)*SIM_H} r="6" fill="#FFF" stroke={activeColor} strokeWidth="3" />
          </Svg>
      </View>

      {/* CONTROLS */}
      <View style={[styles.controlBox, { borderColor: border, backgroundColor: isDark ? '#0A0A10' : '#FAFAFA' }]}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 11, fontFamily: FONTS.displayBold, color: txt1 }}><Icon name="target" size={12}/> SET DIFFICULTY TARGET</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: accentColor }}>lvl {Math.floor(difficulty)}</Text>
         </View>
         <Slider
            style={{ width: '100%', height: 30, marginBottom: 10 }}
            minimumValue={0} maximumValue={10000} value={difficulty} onValueChange={handleDifficulty}
            minimumTrackTintColor="#FFF" maximumTrackTintColor={border} thumbTintColor={accentColor}
            disabled={gameState !== 'PRACTICING ⏳'}
         />

         <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
               style={[styles.focusBtn, focusLevel===1 ? {backgroundColor: '#FF444430', borderColor: '#FF4444'} : {borderColor: border}]} 
               onPress={() => { soundTap(); setFocusLevel(1); }}>
               <Text style={[styles.fbText, { color: focusLevel===1 ? '#FF4444' : txtM }]}>Mindless Auto-Pilot</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={[styles.focusBtn, focusLevel===2 ? {backgroundColor: '#00D4A030', borderColor: '#00D4A0'} : {borderColor: border}]} 
               onPress={() => { soundTap(); setFocusLevel(2); }}>
               <Text style={[styles.fbText, { color: focusLevel===2 ? '#00D4A0' : txtM }]}>Intense Deliberate Focus</Text>
            </TouchableOpacity>
         </View>
      </View>

      {gameState !== 'PRACTICING ⏳' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGauntlet}>
            <Text style={{ color: '#000', fontFamily: FONTS.displayBold }}>Reset Gauntlet 🥊</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#A855F7', fontSize: 9, fontFamily: 'monospace' }}>DELTA_DIFF = {Math.abs(difficulty - skill).toFixed(2)}</Text>
            <Text style={{ color: '#A855F7', fontSize: 9, fontFamily: 'monospace' }}>IS_FLOW_TUPLE: [{isFlow?'TRUE':'FALSE'}, M:{focusLevel}]</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.05, paddingBottom: 20 },
  dash: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  miniMeter: { flex: 1, padding: 8, borderRadius: RADIUS.sm, borderWidth: 1 },
  simBox: { height: SIM_H, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  controlBox: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  focusBtn: { flex: 1, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, alignItems: 'center' },
  fbText: { fontSize: 10, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#00D4A0', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A0830', borderRadius: RADIUS.sm, borderWidth: 1 }
});
