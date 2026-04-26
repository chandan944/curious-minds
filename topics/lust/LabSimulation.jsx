import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_size = width - 60;
const SIM_CX = SIM_size / 2;
const SIM_CY = SIM_size / 2;

export default function LustLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME STATE ──
  const [dopamine, setDopamine] = useState(50);      // Current hit level (0-100)
  const [receptors, setReceptors] = useState(100);   // Capacity/Health (0-100)
  const [oxytocin, setOxytocin] = useState(50);      // Long term joy (0-100)
  const [gameState, setGameState] = useState('NORMAL'); // NORMAL, HIGH, NUMB, RECOVERED

  const [dopamineDrops, setDopamineDrops] = useState([]);

  const timerRef = useRef(null);
  const surgeAnim = useRef(new Animated.Value(1)).current;

  // Time Engine
  useEffect(() => {
     timerRef.current = setInterval(() => {
         
         // Dopamine fades FAST
         setDopamine(prev => Math.max(0, prev - 5));

         // If dopamine is constantly high, receptors down-regulate
         if (dopamine > 80) {
             setReceptors(prev => Math.max(10, prev - 2)); 
         } 
         // If dopamine is low, receptors heal
         else if (dopamine < 30) {
             setReceptors(prev => Math.min(100, prev + 1));
         }

         // Oxytocin fades slowly, disrupted by high dopamine
         setOxytocin(prev => {
             if (dopamine > 70) return Math.max(0, prev - 2); // Cannot bond while frantically chasing
             return Math.max(0, prev - 1);
         });

         // Game State
         if (receptors < 30) {
             if (gameState !== 'NUMB') {
                 setGameState('NUMB');
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
             }
         } else if (dopamine > 80) {
             setGameState('HIGH');
         } else if (receptors >= 95 && oxytocin > 80) {
             if (gameState !== 'RECOVERED') {
                setGameState('RECOVERED');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                if(onLabBreaker) onLabBreaker();
             }
         } else {
             setGameState('NORMAL');
         }

         // Animate drops
         setDopamineDrops(prev => prev.map(d => ({ ...d, y: d.y + 10, opacity: d.opacity - 0.05 })).filter(d => d.opacity > 0));

     }, 500);

     return () => clearInterval(timerRef.current);
  }, [dopamine, receptors, oxytocin, gameState]);

  const addDopamineDrop = () => {
      const drop = { id: Math.random(), x: SIM_CX + (Math.random() * 40 - 20), y: SIM_CY - 50, opacity: 1, type: 'dopamine' };
      setDopamineDrops(prev => [...prev, drop]);
  };
  const addOxytocinDrop = () => {
      const drop = { id: Math.random(), x: SIM_CX + (Math.random() * 80 - 40), y: SIM_CY, opacity: 1, type: 'oxytocin' };
      setDopamineDrops(prev => [...prev, drop]);
  };

  // Actions
  const fastDopamine = () => {
     if (gameState === 'RECOVERED') return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
     
     // The amount of dopamine you FEEL is limited by your surviving receptors
     const hitValue = 30 * (receptors / 100); 
     
     setDopamine(prev => Math.min(100, prev + hitValue));
     
     Animated.sequence([
        Animated.timing(surgeAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(surgeAnim, { toValue: 1.0, duration: 300, useNativeDriver: true })
     ]).start();

     for(let i=0; i<3; i++) addDopamineDrop();
  };

  const hardWork = () => {
     if (gameState === 'RECOVERED') return;
     soundWhoosh();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     // Doing hard work/boredom Lowers immediate dopamine but heals receptors faster
     setDopamine(prev => Math.max(0, prev - 15));
     setReceptors(prev => Math.min(100, prev + 5));
     
     Animated.sequence([
        Animated.timing(surgeAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(surgeAnim, { toValue: 1.0, duration: 200, useNativeDriver: true })
     ]).start();
  };

  const deepConnection = () => {
     if (gameState === 'RECOVERED') return;
     soundSuccess();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     // If you are too high on dopamine, you can't connect
     if (dopamine > 60) {
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         return; 
     }
     setOxytocin(prev => Math.min(100, prev + 15));
     for(let i=0; i<3; i++) addOxytocinDrop();
  };

  const resetGame = () => {
    soundWhoosh();
    setDopamine(50);
    setReceptors(100);
    setOxytocin(50);
    setGameState('NORMAL');
  };

  let glowColor = '#00D4FF';
  if (gameState === 'HIGH') glowColor = '#FF007F';
  if (gameState === 'NUMB') glowColor = '#555555';
  if (gameState === 'RECOVERED') glowColor = '#FFD166';

  return (
    <View style={styles.container}>
      
      {/* STATUS HEADER */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#1A0010' : '#FFF0F5' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>MIND STATE</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: glowColor }}>
                {gameState === 'NUMB' ? 'NUMB (Tolerance)' : gameState}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 90 }}>
             <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM }}>RECEPTOR HEALTH</Text>
             <Text style={{ fontSize: 16, fontFamily: 'monospace', color: receptors < 40 ? '#FF4444' : txt1 }}>{Math.floor(receptors)}%</Text>
             <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
                 <View style={{ height: '100%', width: `${receptors}%`, backgroundColor: receptors < 40 ? '#FF4444' : '#00E5FF' }} />
             </View>
         </View>
      </View>

      {/* DYNAMIC BRAIN GRAPHIC */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
         <Svg width={SIM_size} height={SIM_size}>
            <Defs>
                <SvgLinear id="brainGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#111" stopOpacity="0.8" />
                </SvgLinear>
                <SvgLinear id="oxyGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
                    <Stop offset="100%" stopColor="#111" stopOpacity="0.1" />
                </SvgLinear>
            </Defs>

            {/* Background Container */}
            <Circle cx={SIM_CX} cy={SIM_CY} r={SIM_size/2 - 10} fill={isDark ? '#111' : '#EEE'} stroke={border} />
            
            {/* Oxytocin Field (Base Joy) */}
            <Circle cx={SIM_CX} cy={SIM_CY + 20} r={(oxytocin/100) * (SIM_size/2 - 20)} fill="url(#oxyGrad)" />

            {/* Dopamine Heat (Spikes) */}
            <Animated.View style={{ 
                position: 'absolute', width: SIM_size, height: SIM_size, alignItems: 'center', justifyContent: 'center',
                transform: [{ scale: surgeAnim }] 
            }}>
                <Svg width={SIM_size} height={SIM_size}>
                    <Circle cx={SIM_CX} cy={SIM_CY - 20} r={(dopamine/100) * (SIM_size/2 - 30)} fill="url(#brainGrad)" />
                </Svg>
            </Animated.View>

            {/* Falling Drops */}
            {dopamineDrops.map(d => (
                <Circle key={d.id} cx={d.x} cy={d.y} r={d.type === 'dopamine' ? 4 : 6} 
                        fill={d.type === 'dopamine' ? '#FF007F' : '#A855F7'} opacity={d.opacity} />
            ))}

            {/* Receptor representation */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const r = SIM_size/2 - 40;
                const alive = (i / 8) * 100 < receptors;
                return (
                    <Circle key={`rec-${i}`} cx={SIM_CX + Math.cos(angle)*r} cy={SIM_CY + Math.sin(angle)*r} 
                            r={alive ? 6 : 2} fill={alive ? '#00E5FF' : '#444'} />
                );
            })}

            {/* Labels */}
            <SvgText x={SIM_CX} y={SIM_CY - 10} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">Current Dopamine</SvgText>
            <SvgText x={SIM_CX} y={SIM_CY + 5} fill={glowColor} fontSize="14" fontFamily="monospace" textAnchor="middle">{Math.floor(dopamine)} / 100</SvgText>
            
            <SvgText x={SIM_CX} y={SIM_CY + 30} fill="#A855F7" fontSize="10" fontFamily={FONTS.displayBold} textAnchor="middle">Oxytocin: {Math.floor(oxytocin)}</SvgText>
         </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
             <TouchableOpacity 
                 style={[styles.btn, { backgroundColor: '#FF007F20', borderColor: '#FF007F', width: '80%' }]}
                 onPress={fastDopamine}>
                 <Text style={[styles.btnTxt, { color: '#FF007F' }]}>⚡ Supernormal Stimulus (Scroll/Junk)</Text>
             </TouchableOpacity>
          </View>

          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#FFD16620', borderColor: '#FFD166' }]}
              onPress={hardWork}>
              <Text style={[styles.btnTxt, { color: '#FFD166' }]}>🏋️‍♂️ Hard Work (Heal)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={[styles.btn, { backgroundColor: dopamine > 60 ? '#555555' : '#A855F720', borderColor: dopamine > 60 ? '#333' : '#A855F7' }]}
              onPress={deepConnection}
              activeOpacity={dopamine > 60 ? 1 : 0.7}>
              <Text style={[styles.btnTxt, { color: dopamine > 60 ? '#777' : '#A855F7' }]}>🤝 Deep Connection</Text>
          </TouchableOpacity>
      </View>

      {dopamine > 60 && gameState !== 'RECOVERED' && (
          <Text style={{ textAlign: 'center', color: '#FF4444', fontSize: 10, marginTop: 8 }}>Too distracted by Dopamine to Connect!</Text>
      )}

      {gameState === 'RECOVERED' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Brain Chemistry 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>TARGET_PLEASURE_YIELD: {(30 * (receptors/100)).toFixed(1)} units</Text>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>DOWN_REG_MULTIPLIER: {dopamine > 80 ? 'ACTIVE (-2/t)' : 'DORMANT'}</Text>
            <Text style={{ color: '#FF007F', fontSize: 9, fontFamily: 'monospace' }}>OXYTOCIN_SUPPRESSION: {dopamine > 60 ? 'TRUE' : 'FALSE'}</Text>
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
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A0010', borderRadius: RADIUS.sm, borderWidth: 1 }
});
