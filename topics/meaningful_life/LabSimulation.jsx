import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function IkigaiLab({ scientistMode = false, onLabBreaker }) {
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
  const [sliders, setSliders] = useState({
     passion: 20, // What you love
     mission: 20, // What world needs
     vocation: 20, // Good at
     profession: 20 // Paid for
  });

  const [ikigaiScore, setIkigaiScore] = useState(0);
  const [diagnosis, setDiagnosis] = useState("Adjust your life balance.");

  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     const { passion, mission, vocation, profession } = sliders;
     
     // Ikigai is the intersection. If one is 0, Ikigai is 0.
     // The score is based on the lowest value (the bottleneck).
     const bottleneck = Math.min(passion, mission, vocation, profession);
     const avg = (passion + mission + vocation + profession) / 4;
     
     // Calculate a score out of 100
     let newScore = bottleneck * (avg / 100);
     if (bottleneck > 80 && avg > 85) newScore = 100; // Snap to 100 if balanced high

     setIkigaiScore(newScore);
     Animated.timing(glowAnim, {
        toValue: newScore / 100,
        duration: 500,
        useNativeDriver: false
     }).start();

     // Diagnosis logic based on actual Ikigai Venn diagram overlaps
     if (newScore === 100) {
        setDiagnosis("✨ FULL IKIGAI ACHIEVED ✨\nDeep joy, wealth, mastery, and impact.");
        soundSuccess();
        if (onLabBreaker) onLabBreaker();
     } else if (passion > 80 && mission > 80 && profession < 30) {
        setDiagnosis("DELIGHT AND FULLNESS, BUT NO WEALTH 💸");
     } else if (profession > 80 && vocation > 80 && mission < 30) {
        setDiagnosis("COMFORTABLE, BUT FEELING OF EMPTINESS 🕳️");
     } else if (mission > 80 && vocation > 80 && passion < 30) {
        setDiagnosis("EXCITEMENT AND COMPLACENCY, BUT SENSE OF UNCERTAINTY ⚖️");
     } else if (passion > 80 && profession > 80 && vocation < 30) {
        setDiagnosis("SATISFIED, BUT FEELING OF USELESSNESS 📉");
     } else if (profession > 90 && avg < 40) {
        setDiagnosis("SUNDAY NEUROSIS: Wealthy but meaningless. 🕰️");
     } else {
        setDiagnosis("Fragmented focus. Keep building all 4 pillars.");
     }

  }, [sliders]);

  const updateSlider = (key, delta) => {
     soundTap();
     Haptics.impactAsync(delta > 0 ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Rigid);
     setSliders(prev => ({
        ...prev,
        [key]: Math.max(0, Math.min(100, prev[key] + delta))
     }));
  };

  // ── Render ─────────────────────────────────────
  // Dynamic radius based on slider value
  const getR = (val) => 40 + (val * 0.6);

  return (
    <View style={styles.container}>
      {/* ── Status Header ── */}
      <View style={[styles.headerBox, { borderColor: border }]}>
         <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center' }}>{diagnosis}</Text>
      </View>

      {/* ── Venn Diagram Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#fff' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <RadialGradient id="ikigaiGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            <G transform={`translate(${SIM_W/2}, ${SIM_H/2})`}>
               {/* Passion (Top) */}
               <Circle cx="0" cy="-30" r={getR(sliders.passion)} fill="#FF6B9D" opacity="0.5" />
               <SvgText x="0" y={-30 - getR(sliders.passion) - 10} fill="#FF6B9D" fontSize="10" textAnchor="middle" fontWeight="bold">WHAT YOU LOVE</SvgText>

               {/* Mission (Right) */}
               <Circle cx="30" cy="10" r={getR(sliders.mission)} fill="#00D4A0" opacity="0.5" />
               <SvgText x={30 + getR(sliders.mission) + 10} y="15" fill="#00D4A0" fontSize="10" textAnchor="start" fontWeight="bold">WORLD NEEDS</SvgText>

               {/* Vocation (Left) */}
               <Circle cx="-30" cy="10" r={getR(sliders.vocation)} fill="#4ECDC4" opacity="0.5" />
               <SvgText x={-30 - getR(sliders.vocation) - 10} y="15" fill="#4ECDC4" fontSize="10" textAnchor="end" fontWeight="bold">GOOD AT</SvgText>

               {/* Profession (Bottom) */}
               <Circle cx="0" cy="40" r={getR(sliders.profession)} fill="#FFD166" opacity="0.5" />
               <SvgText x="0" y={40 + getR(sliders.profession) + 20} fill="#FFD166" fontSize="10" textAnchor="middle" fontWeight="bold">PAID FOR</SvgText>
               
               {/* Center Glow (Ikigai) */}
               <AnimatedCircle cx="0" cy="5" r={glowAnim.interpolate({ inputRange:[0,1], outputRange:[0, 40]})} fill="url(#ikigaiGlow)" />
            </G>
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>IKIGAI RESONANCE: {ikigaiScore.toFixed(1)}%</Text>
              <Text style={styles.sciText}>EXISTENTIAL VACUUM: {(100 - ikigaiScore).toFixed(1)} depth</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         {[
            { key: 'passion', label: 'PASSION ❤️', color: '#FF6B9D' },
            { key: 'mission', label: 'MISSION 🌍', color: '#00D4A0' },
            { key: 'vocation', label: 'VOCATION 🛠️', color: '#4ECDC4' },
            { key: 'profession', label: 'PROFESSION 💰', color: '#FFD166' }
         ].map(item => (
            <View key={item.key} style={styles.sliderRow}>
               <Text style={[styles.sliderLabel, { color: item.color }]}>{item.label}</Text>
               <View style={styles.btnGroup}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateSlider(item.key, -10)}>
                     <Text style={{ color: txt1, fontFamily: FONTS.displayBold }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ color: txt1, width: 30, textAlign: 'center', fontFamily: 'monospace' }}>{sliders[item.key]}</Text>
                  <TouchableOpacity style={[styles.miniBtn, { backgroundColor: item.color + '30' }]} onPress={() => updateSlider(item.key, 10)}>
                     <Text style={{ color: txt1, fontFamily: FONTS.displayBold }}>+</Text>
                  </TouchableOpacity>
               </View>
            </View>
         ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  headerBox: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', marginBottom: 16, height: 70, justifyContent: 'center' },
  
  simBox: { height: 280, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  
  sciOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16, gap: 10 },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  sliderLabel: { fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  
  btnGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }
});
