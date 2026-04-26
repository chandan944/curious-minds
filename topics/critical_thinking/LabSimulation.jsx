import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 260;

const SCENARIOS = [
  {
    id: 1,
    quote: "If we let people walk on the grass today, tomorrow they will sleep on it, and next week our beautiful park will be completely destroyed and overrun by terrifying criminals!",
    correctFallacy: "Slippery Slope",
    explanation: "Assuming a tiny first step inevitably leads to a massive, extreme disaster without any logical proof linking the chain of events."
  },
  {
    id: 2,
    quote: "My opponent wants to build a new hospital? Well, my opponent has been divorced three times and clearly hates the concept of family!",
    correctFallacy: "Ad Hominem",
    explanation: "Attacking the person's character (their divorce) instead of addressing the actual argument (building a hospital)."
  },
  {
    id: 3,
    quote: "Look, I know my economic plan works. Just ask the famous Hollywood actor who played a genius on TV, he agrees with me!",
    correctFallacy: "Appeal to Authority",
    explanation: "Using an irrelevant 'expert' (an actor) to bypass logic and force agreement."
  },
  {
    id: 4,
    quote: "You either support my war completely, or you are deeply in love with the enemy terrorists. There is no middle ground!",
    correctFallacy: "False Dilemma",
    explanation: "Trapping the audience into purely black/white binary choices, ignoring the nuanced gray area."
  },
  {
    id: 5,
    quote: "They asked me about the missing tax money. Look, I grew up poor on a farm. I love my dogs, and I love this country. God bless!",
    correctFallacy: "Red Herring",
    explanation: "Throwing an emotional distraction to completely derail the argument and avoid the actual question."
  }
];

export default function FallacyLab({ scientistMode = false, onLabBreaker }) {
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
  const [level, setLevel] = useState(0);
  const [manipulationMeter, setManipulationMeter] = useState(0); // If hits 100, Game Over
  const [gameOver, setGameOver] = useState(false);
  const [msg, setMsg] = useState('ANALYZE THE POLITICAL RHETORIC.');
  
  // Timer for manipulation rise
  useEffect(() => {
     let interval;
     if (!gameOver && level < SCENARIOS.length) {
        interval = setInterval(() => {
           setManipulationMeter(prev => {
              const next = prev + 5;
              if (next >= 100) {
                 setGameOver(true);
                 setMsg('MANIPULATION CRITICAL. POPULATION BRAINWASHED. 🧠💥');
                 soundWhoosh();
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                 return 100;
              }
              return next;
           });
        }, 1000); // Rises every second
     }
     return () => clearInterval(interval);
  }, [gameOver, level]);

  const selectFallacy = (fallacyName) => {
     if (gameOver) return;
     soundTap();

     const current = SCENARIOS[level];
     if (current.correctFallacy === fallacyName) {
        // Correct
        soundBadge();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setManipulationMeter(Math.max(0, manipulationMeter - 40)); // Drop meter
        setMsg(`CORRECT! ${current.explanation}`);
        
        if (level + 1 < SCENARIOS.length) {
           setTimeout(() => setLevel(l => l + 1), 2500);
        } else {
           setGameOver(true);
           setMsg('DEBATE SURVIVED! YOU ARE IMMUNE TO MANIPULATION! 🛡️🏆');
           soundSuccess();
           if(onLabBreaker) onLabBreaker();
        }
     } else {
        // Wrong
        soundWhoosh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setManipulationMeter(prev => Math.min(100, prev + 25)); // Penalty jump
        setMsg(`WRONG FALLACY! THEY ARE GETTING INTO YOUR HEAD! 🚨`);
     }
  };

  const reset = () => {
     setLevel(0);
     setManipulationMeter(0);
     setGameOver(false);
     setMsg('ANALYZE THE POLITICAL RHETORIC.');
  };

  const currentScenario = SCENARIOS[level] || SCENARIOS[SCENARIOS.length-1];

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>CURRENT TARGET</Text>
            <Text style={{ color: '#00D4FFF', fontSize: 18, fontFamily: 'monospace' }}>POLITICIAN {level + 1}</Text>
         </View>
         <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>MANIPULATION RISK</Text>
            <Text style={{ color: manipulationMeter > 75 ? '#FF4444' : '#FFD166', fontSize: 24, fontFamily: 'monospace' }}>
               {manipulationMeter}%
            </Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Svg width={SIM_W} height={100}>
             {/* The Podiums */}
             <Rect x="20" y="60" width="40" height="40" fill="#333" />
             <SvgText x="40" y="50" fill="#fff" fontSize="24" textAnchor="middle">👨‍💼</SvgText>

             {/* Speech Bubble */}
             <Path d="M 70 20 Q 70 10 80 10 L 300 10 Q 310 10 310 20 L 310 80 Q 310 90 300 90 L 90 90 L 70 100 Z" fill="rgba(85,85,85,0.2)" stroke="#555" strokeWidth="1" />
         </Svg>
         
         <View style={styles.quoteBox}>
            <Text style={{ color: txt1, fontSize: 12, fontStyle: 'italic', lineHeight: 18 }}>
                "{currentScenario.quote}"
            </Text>
         </View>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>EPISTEMIC_THREAT_LVL: {(manipulationMeter * 0.8).toFixed(1)}</Text>
              <Text style={styles.sciText}>COGNITIVE_DISSONANCE: DETECTED</Text>
           </View>
         )}
      </View>

      <Text style={[styles.msgText, { color: msg.includes('WRONG') || msg.includes('CRITICAL') ? '#FF4444' : '#00FF7F' }]}>
         {msg}
      </Text>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 8 }}>VETO THE FALLACY</Text>
         
         {!gameOver ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
               {/* Fixed buttons for the 5 fallacies */}
               {["Ad Hominem", "Slippery Slope", "False Dilemma", "Appeal to Authority", "Red Herring"].map(fallacy => (
                  <TouchableOpacity 
                     key={fallacy}
                     style={[styles.actionBtn, { borderColor: '#A855F7' }]}
                     onPress={() => selectFallacy(fallacy)}
                  >
                     <Text style={[styles.actionText, { color: '#fff' }]}>{fallacy}</Text>
                  </TouchableOpacity>
               ))}
            </View>
         ) : (
            <TouchableOpacity style={[styles.execBtn, { borderColor: '#555', backgroundColor: '#333' }]} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET DEBATE STAGE</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 12 },
  
  simBox: { height: 160, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  quoteBox: { position: 'absolute', top: 15, left: 75, width: SIM_W - 90, padding: 10 },

  msgText: { marginTop: 10, fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center', minHeight: 30 },

  sciOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace', textAlign: 'right' },

  controlsGrid: { marginTop: 4 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: RADIUS.sm, backgroundColor: 'rgba(168,85,247,0.1)' },
  actionText: { fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center' },

  execBtn: { marginTop: 10, paddingVertical: 16, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center' }
});
