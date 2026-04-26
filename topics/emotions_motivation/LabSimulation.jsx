import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export default function EmotionalLab({ scientistMode = false }) {
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

  // ── State (0 - 100) ───────────────────────────
  const [dopamine, setDopamine] = useState(50);
  const [serotonin, setSerotonin] = useState(50);
  const [cortisol, setCortisol] = useState(20);
  const [currentEvent, setEvent] = useState("Resting State");

  // Animations for chemicals
  const dAnim = useRef(new Animated.Value(50)).current;
  const sAnim = useRef(new Animated.Value(50)).current;
  const cAnim = useRef(new Animated.Value(20)).current;
  const brainGlow = useRef(new Animated.Value(0)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
    Animated.spring(dAnim, { toValue: dopamine, tension: 20, useNativeDriver: false }).start();
    Animated.spring(sAnim, { toValue: serotonin, tension: 20, useNativeDriver: false }).start();
    Animated.spring(cAnim, { toValue: cortisol, tension: 20, useNativeDriver: false }).start();
  }, [dopamine, serotonin, cortisol]);

  const triggerEvent = (type) => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Brain glow effect
    Animated.sequence([
      Animated.timing(brainGlow, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(brainGlow, { toValue: 0, duration: 600, useNativeDriver: false })
    ]).start();

    switch(type) {
      case 'WIN':
        setEvent("WINNING A COMPETITION 🏆");
        setDopamine(prev => Math.min(100, prev + 40));
        setCortisol(prev => Math.max(0, prev - 10));
        break;
      case 'FAIL':
        setEvent("FAILING A TEST 📉");
        setDopamine(prev => Math.max(0, prev - 30));
        setCortisol(prev => Math.min(100, prev + 50));
        break;
      case 'BREATH':
        setEvent("MINDFUL BREATHING 🧘");
        setSerotonin(prev => Math.min(100, prev + 30));
        setCortisol(prev => Math.max(0, prev - 40));
        break;
      case 'SOCIAL':
        setEvent("GETTING SOCIAL LIKES ❤️");
        setDopamine(prev => Math.min(100, prev + 15));
        setSerotonin(prev => Math.min(100, prev + 10));
        break;
    }
  };

  const getMood = () => {
    if (cortisol > 70) return { label: 'ANXIOUS / STRESSED', color: '#FF4444' };
    if (dopamine > 80) return { label: 'EUPHORIC / MOTIVATED', color: '#FFD166' };
    if (serotonin > 80) return { label: 'CALM / CONTENT', color: '#00D4A0' };
    if (dopamine < 20 && serotonin < 20) return { label: 'APATHETIC / TIRED', color: '#888' };
    return { label: 'BALANCED', color: color };
  };

  const mood = getMood();

  // ── Render Helpers ─────────────────────────────
  const renderGauge = (label, val, color, anim) => (
    <View style={styles.gaugeContainer}>
       <View style={styles.gaugeHeader}>
          <Text style={[styles.gaugeLabel, { color }]}>{label}</Text>
          <Animated.Text style={[styles.gaugeVal, { color }]}>{val.toFixed(0)}%</Animated.Text>
       </View>
       <View style={styles.gaugeTrack}>
          <Animated.View style={[styles.gaugeBar, { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🧠 Brain Visualization */}
      <View style={[styles.brainSim, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={200} viewBox="0 0 200 120">
           <G transform="translate(100, 60)">
              {/* Brain Silhouette */}
              <Path d="M -60 -20 Q -80 -60 0 -60 Q 80 -60 60 -20 Q 80 40 0 40 Q -80 40 -60 -20" 
                    fill={isDark ? '#111' : '#eee'} stroke={txtM} strokeWidth="1" />
              
              {/* PFC (Front) */}
              <AnimatedPath d="M -40 -50 Q -60 -40 -55 -10 L -30 -10 Q -25 -40 -40 -50" 
                    fill={mood.color} opacity={brainGlow} />

              {/* Amygdala (Center) */}
              <AnimatedCircle cx="10" cy="5" r="8" fill="#FF4444" opacity={cortisol / 100} />
              
              {/* VTA/Rewards Path */}
              <AnimatedPath d="M 0 30 Q 30 10 5 0" stroke="#FFD166" strokeWidth="2" fill="none" 
                    opacity={dopamine / 100} strokeDasharray="4,2" />
           </G>
           <SvgText x="100" y="110" fill="rgba(255,255,255,0.6)" fontSize="8" textAnchor="middle" fontFamily={FONTS.displayBold}>NEURAL ACTIVATION MAP</SvgText>
        </Svg>

        <View style={[styles.moodBadge, { backgroundColor: mood.color + '20', borderColor: mood.color }]}>
           <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
        </View>
        <Text style={[styles.eventText, { color: txt1 }]}>{currentEvent}</Text>
      </View>

      {/* 🎛️ Dashboard Controls */}
      <View style={styles.dashboard}>
         {renderGauge('DOPAMINE (REWARD)', dopamine, '#FFD166', dAnim)}
         {renderGauge('SEROTONIN (MOOD)', serotonin, '#00D4A0', sAnim)}
         {renderGauge('CORTISOL (STRESS)', cortisol, '#FF4444', cAnim)}
      </View>

      {/* ⚡ Event Triggers */}
      <View style={styles.eventTray}>
         <TouchableOpacity style={styles.eventBtn} onPress={() => triggerEvent('WIN')}>
            <Icon name="award" size={16} color="#FFD166" /><Text style={styles.evBtnText}>WIN</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.eventBtn} onPress={() => triggerEvent('FAIL')}>
            <Icon name="alert-triangle" size={16} color="#FF4444" /><Text style={styles.evBtnText}>FAIL</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.eventBtn} onPress={() => triggerEvent('BREATH')}>
            <Icon name="wind" size={16} color="#4ECDC4" /><Text style={styles.evBtnText}>CALM</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.eventBtn} onPress={() => triggerEvent('SOCIAL')}>
            <Icon name="heart" size={16} color="#FF6B9D" /><Text style={styles.evBtnText}>LIKE</Text>
         </TouchableOpacity>
      </View>

      {scientistMode && (
         <View style={styles.sciPanel}>
            <Text style={styles.sciHeader}>LIMBIC SYSTEM METRICS 🧑‍🔬</Text>
            <Text style={styles.sciText}>AMYGDALA FIRING: {(cortisol * 1.2).toFixed(1)} Hz</Text>
            <Text style={styles.sciText}>VTA REWARD DENSITY: {(dopamine / 10).toFixed(2)} ρ</Text>
            <Text style={styles.sciText}>PFC INHIBITION: {(serotonin > 70 ? 'ACTIVE' : 'LOW')}</Text>
         </View>
      )}
    </View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  brainSim: { height: 220, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  moodBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, marginTop: -30, marginBottom: 10 },
  moodLabel: { fontSize: 9, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  eventText: { fontSize: 13, fontFamily: FONTS.displayBold, textAlign: 'center' },

  dashboard: { marginTop: 20, gap: 12 },
  gaugeContainer: { width: '100%' },
  gaugeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gaugeLabel: { fontSize: 8, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  gaugeVal: { fontSize: 10, fontFamily: 'monospace' },
  gaugeTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  gaugeBar: { height: '100%', borderRadius: 3 },

  eventTray: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 8 },
  eventBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 4 },
  evBtnText: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#888' },

  sciPanel: { marginTop: 24, padding: 12, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: RADIUS.sm, borderWidth: 0.5, borderColor: '#333' },
  sciHeader: { fontSize: 8, color: '#FFD166', fontFamily: FONTS.displayBold, marginBottom: 6 },
  sciText: { color: '#00FF00', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 }
});
