import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 320;

const SCENARIOS = [
   {
      id: 1,
      botDial: "Hey, I just manually upgraded your account to Premium for free for a week! So, you'll definitely sign up for the $100/yr plan today, right?",
      tactic: "Reciprocity",
      logic: "A gift with strings attached is a bribe.",
      correct: "DEF_RECIPROCITY"
   },
   {
      id: 2,
      botDial: "WARNING: Only 2 spots left at this price! Deal expires in 30 seconds! Act NOW or lose it forever!",
      tactic: "Scarcity",
      logic: "Artificial panic shuts down logic.",
      correct: "DEF_SCARCITY"
   },
   {
      id: 3,
      botDial: "Our product was rated #1 by Dr. Smith (Ph.D. in Generic Science). You wouldn't question a Doctor, would you?",
      tactic: "Authority",
      logic: "Symbols of authority (titles) can be faked.",
      correct: "DEF_AUTHORITY"
   },
   {
      id: 4,
      botDial: "Plan A is $50. Plan B (Premium) is $150. Plan C (Premium + 1 sticker) is $155. Plan C is such a steal!",
      tactic: "Decoy Effect",
      logic: "Plan B exists solely to make C look cheap.",
      correct: "DEF_DECOY"
   }
];

export default function ManipulationLab({ scientistMode = false, onLabBreaker }) {
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
  const [level, setLevel] = useState(0);
  const [shieldHP, setShieldHP] = useState(100);
  const [botHP, setBotHP] = useState(100);
  const [stateMsg, setStateMsg] = useState('ANALYZE THE ATTACK!');
  const [gameOver, setGameOver] = useState(false);

  // Animations
  const botShakeY = useRef(new Animated.Value(0)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     Animated.loop(
        Animated.sequence([
           Animated.timing(botShakeY, { toValue: 10, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
           Animated.timing(botShakeY, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
     ).start();
  }, []);

  const triggerDeflection = (isCorrect) => {
     if (gameOver) return;

     // Show shield
     Animated.sequence([
        Animated.timing(shieldOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shieldOpacity, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true })
     ]).start();

     // Laser strike
     laserAnim.setValue(0);
     Animated.timing(laserAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

     if (isCorrect) {
        soundBadge();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStateMsg('TACTIC DEFLECTED! Bot damaged.');
        
        setBotHP(prev => {
           const newHP = prev - 25;
           if (newHP <= 0) {
              setGameOver(true);
              soundSuccess();
              setStateMsg('BOT DEFEATED! FIREWALL SECURE.');
              if(onLabBreaker) onLabBreaker();
           } else {
              setTimeout(() => {
                 setLevel(l => Math.min(SCENARIOS.length - 1, l + 1));
                 setStateMsg('ANALYZE NEXT ATTACK!');
              }, 1500);
           }
           return newHP;
        });
     } else {
        soundWhoosh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setStateMsg('FELL FOR IT! Shield Damaged.');
        setShieldHP(prev => Math.max(0, prev - 34));
        if (shieldHP <= 34) {
           setGameOver(true);
           setStateMsg('WALLET EMPTIED. YOU LOSE.');
        }
     }
  };

  const handleDefend = (defenseCode) => {
     const currentScenario = SCENARIOS[level];
     const isCorrect = (defenseCode === currentScenario.correct);
     triggerDeflection(isCorrect);
  };

  const reset = () => {
     setLevel(0);
     setShieldHP(100);
     setBotHP(100);
     setStateMsg('ANALYZE THE ATTACK!');
     setGameOver(false);
  };

  const renderBot = () => {
    return (
      <AnimatedG transform={[{ translateY: botShakeY }]}>
        <Rect x={SIM_W/2 - 40} y="30" width="80" height="80" fill="#333" stroke="#A855F7" strokeWidth="3" rx="10" />
        <Rect x={SIM_W/2 - 25} y="50" width="20" height="10" fill="#FF4444" />
        <Rect x={SIM_W/2 + 5} y="50" width="20" height="10" fill="#FF4444" />
        <Rect x={SIM_W/2 - 15} y="80" width="30" height="10" fill="#A855F7" opacity="0.5" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>SHIELD HP</Text>
            <Text style={{ color: shieldHP > 50 ? '#00D4A0' : '#FF4444', fontSize: 24, fontFamily: 'monospace' }}>{shieldHP}%</Text>
         </View>
         <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>BOT HP</Text>
            <Text style={{ color: '#A855F7', fontSize: 24, fontFamily: 'monospace' }}>{botHP}%</Text>
         </View>
      </View>

      {/* ── Battle Arena ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Text style={styles.stateMsg}>{stateMsg}</Text>

         <Svg width={SIM_W} height={200}>
            {/* The Bot */}
            {renderBot()}

            {/* Laser Attack */}
            <AnimatedPath d={`M ${SIM_W/2} 110 L ${SIM_W/2} 180`} stroke="#FF4444" strokeWidth="4" 
               opacity={laserAnim.interpolate({ inputRange:[0,0.5,1], outputRange:[0,1,0]})} 
            />

            {/* Player Shield */}
            <AnimatedPath d={`M ${SIM_W/2 - 60} 180 Q ${SIM_W/2} 150 ${SIM_W/2 + 60} 180`} fill="none" stroke="#00D4A0" strokeWidth="6" opacity={shieldOpacity} />
         </Svg>

         {/* Bot Dialogue */}
         {!gameOver && (
            <View style={styles.dialogueBox}>
               <Text style={styles.dialogueText}>"{SCENARIOS[level].botDial}"</Text>
            </View>
         )}

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>AMYGDALA_HIJACK_PROB: {((100 - shieldHP) * 0.8).toFixed(1)}%</Text>
              <Text style={styles.sciText}>BIAS_EXPLOITATION_VECTOR: {SCENARIOS[level]?.tactic || 'NULL'}</Text>
           </View>
         )}
      </View>

      {/* ── Defense Controls ── */}
      {!gameOver ? (
         <View style={styles.controlsGrid}>
            <Text style={{ color: txt1, fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 6 }}>SELECT COGNITIVE SHIELD</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
               <TouchableOpacity style={[styles.defBtn, { borderColor: '#FF6B9D' }]} onPress={() => handleDefend('DEF_RECIPROCITY')}>
                  <Text style={[styles.defText, { color: '#FF6B9D' }]}>Block: Reciprocity</Text>
               </TouchableOpacity>
               
               <TouchableOpacity style={[styles.defBtn, { borderColor: '#FFD166' }]} onPress={() => handleDefend('DEF_SCARCITY')}>
                  <Text style={[styles.defText, { color: '#FFD166' }]}>Block: Scarcity</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.defBtn, { borderColor: '#4ECDC4' }]} onPress={() => handleDefend('DEF_AUTHORITY')}>
                  <Text style={[styles.defText, { color: '#4ECDC4' }]}>Block: Authority</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.defBtn, { borderColor: '#A855F7' }]} onPress={() => handleDefend('DEF_DECOY')}>
                  <Text style={[styles.defText, { color: '#A855F7' }]}>Block: Decoy Effect</Text>
               </TouchableOpacity>
            </View>
         </View>
      ) : (
         <TouchableOpacity style={[styles.resetBtn, { backgroundColor: '#333' }]} onPress={reset}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET / TRY AGAIN</Text>
         </TouchableOpacity>
      )}
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 260, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center' },
  stateMsg: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 12, marginTop: 10, letterSpacing: 1 },

  dialogueBox: { position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: RADIUS.md },
  dialogueText: { color: '#000', fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center' },

  sciOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16 },
  defBtn: { paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  defText: { fontSize: 10, fontFamily: FONTS.displayBold },

  resetBtn: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, alignItems: 'center' }
});
