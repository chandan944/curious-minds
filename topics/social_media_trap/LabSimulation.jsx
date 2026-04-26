import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

export default function AlgorithmLab({ scientistMode = false, onLabBreaker }) {
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

  // ── AI Target / System State ──────────────────
  const [retentionTime, setRetentionTime] = useState(0); // Score
  const [dopamine, setDopamine] = useState(50); // Need high spikes 
  const [cortisol, setCortisol] = useState(30); // Need some for engagement, too much = rage quit
  const [boredom, setBoredom] = useState(0);    // Continual same content raises boredom
  
  const [userState, setUserState] = useState('Scrolling Mindlessly... 📱');
  const [lastFeedItem, setLastFeedItem] = useState(null);

  const timerRef = useRef(null);

  // ── Animations ─────────────────────────────────
  const dopAnim = useRef(new Animated.Value(50)).current;
  const corAnim = useRef(new Animated.Value(30)).current;
  const screenScrollAnim = useRef(new Animated.Value(0)).current;

  const borAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
     Animated.spring(dopAnim, { toValue: dopamine, useNativeDriver: false }).start();
     Animated.spring(corAnim, { toValue: cortisol, useNativeDriver: false }).start();
     Animated.spring(borAnim, { toValue: boredom, useNativeDriver: false }).start();

     // Background retention counter
     timerRef.current = setInterval(() => {
        if (userState !== 'RAGE QUIT 💥' && userState !== 'FELL ASLEEP 😴') {
           setRetentionTime(prev => prev + 1);
           // Decay params over time
           setDopamine(prev => Math.max(10, prev - 2));
           setBoredom(prev => Math.min(100, prev + 3));
           
           if (boredom > 80) setUserState('Bored... Getting ready to close app 🥱');
           if (boredom >= 100) setUserState('FELL ASLEEP 😴');
           if (cortisol > 95) setUserState('RAGE QUIT 💥');
        }
     }, 1000);

     return () => clearInterval(timerRef.current);
  }, [dopamine, cortisol, boredom, userState]);

  // ── Feed Actions (The Algorithm) ───────────────
  const injectContent = (type) => {
    if (userState === 'RAGE QUIT 💥' || userState === 'FELL ASLEEP 😴') return;

    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scroll effect
    screenScrollAnim.setValue(50);
    Animated.timing(screenScrollAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();

    if (type === 'CUTE') {
       setLastFeedItem('Puppy Video 🐶');
       setDopamine(prev => Math.min(100, prev + 25));
       setCortisol(prev => Math.max(0, prev - 15));
       setBoredom(prev => Math.max(0, prev - 20));
       setUserState('Aww.. scrolling more! 😍');
    }
    else if (type === 'RAGE') {
       if (lastFeedItem === 'Political Rant 😡') setBoredom(prev => prev + 10); // Repetitive rage
       else {
          soundBadge();
          setLastFeedItem('Political Rant 😡');
          setDopamine(prev => Math.min(100, prev + 40)); // Anger is highly engaging
          setCortisol(prev => Math.min(100, prev + 35)); // High stress
          setBoredom(0);
          setUserState('Furious! Typing an angry comment ⌨️🔥');
       }
    }
    else if (type === 'SOCIAL') {
       setLastFeedItem('Friend got a promotion 🏆');
       setCortisol(prev => Math.min(100, prev + 10)); // Slight FOMO
       setBoredom(prev => Math.max(0, prev - 15));
       setUserState('Feeling a bit jealous... checking profile 👀');
    }

    // Check achievement 
    if (retentionTime > 45 && !userState.includes('QUIT')) {
       if (onLabBreaker) onLabBreaker();
    }
  };

  const resetTarget = () => {
     soundWhoosh();
     setRetentionTime(0);
     setDopamine(50);
     setCortisol(30);
     setBoredom(0);
     setUserState('Scrolling Mindlessly... 📱');
     setLastFeedItem(null);
  };

  // ── Render Helpers ─────────────────────────────
  const renderMeter = (label, val, anim, color) => (
     <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
           <Text style={{ fontSize: 8, fontFamily: FONTS.displayBold, color }}>{label}</Text>
           {scientistMode && <Text style={{ fontSize: 8, fontFamily: 'monospace', color }}>{val.toFixed(0)}</Text>}
        </View>
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
           <Animated.View style={{ height: '100%', borderRadius: 3, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
        </View>
     </View>
  );

  const renderScreenContent = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ translateY: screenScrollAnim }] }}>
         {/* Content Blocks */}
         <Rect x={(SIM_W - 90)/2} y="40" width="90" height="50" rx="5" fill={lastFeedItem ? (lastFeedItem.includes('RAGE') ? '#FF4444' : '#00D4A0') : '#444'} opacity={0.8} />
         <Rect x={(SIM_W - 90)/2} y="100" width="90" height="50" rx="5" fill="#333" />
         <Rect x={(SIM_W - 90)/2} y="160" width="90" height="50" rx="5" fill="#333" />
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── ALGORITHM DASHBOARD ── */}
      <View style={[styles.dashHeader, { borderColor: border, backgroundColor: isDark ? '#0A0A10' : '#F0F0F5' }]}>
         <View>
            <Text style={{ color: txtM, fontSize: 8, fontFamily: FONTS.displayBold }}>TARGET RETENTION TIME</Text>
            <Text style={{ color: color, fontSize: 24, fontFamily: 'monospace' }}>{retentionTime}s</Text>
         </View>
         <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 8, fontFamily: FONTS.displayBold }}>USER STATE</Text>
            <Text style={{ color: userState.includes('QUIT') || userState.includes('ASLEEP') ? '#FF4444' : '#00D4A0', fontSize: 10, fontFamily: FONTS.displayBold }}>{userState}</Text>
         </View>
      </View>

      {/* ── THE TARGET'S PHONE SIM ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
         <Svg width={SIM_W} height={200}>
            <Defs>
               <LinearGradient id="screenGlare" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
               </LinearGradient>
            </Defs>

            {/* Glowing Phone Frame */}
            <Rect x={(SIM_W - 120)/2} y="10" width="120" height="180" rx="15" fill="#111" stroke="#333" strokeWidth="2" />
            <Rect x={(SIM_W - 110)/2} y="15" width="110" height="170" rx="10" fill="#222" />
            
            {/* Camera notch */}
            <Rect x={(SIM_W - 30)/2} y="15" width="30" height="10" rx="5" fill="#000" />

            {renderScreenContent()}

            <Rect x={(SIM_W - 110)/2} y="15" width="110" height="170" rx="10" fill="url(#screenGlare)" pointerEvents="none" />
         </Svg>

         <View style={styles.metricsOverlay}>
            {renderMeter('DOPAMINE (ENGAGEMENT)', dopamine, dopAnim, '#FFD166')}
            {renderMeter('CORTISOL (STRESS/RAGE)', cortisol, corAnim, '#FF4444')}
            {renderMeter('BOREDOM (QUIT RISK)', boredom, borAnim, '#A855F7')}
         </View>

         {scientistMode && (
           <View style={styles.sciPanel}>
              <Text style={{ color: '#00FF00', fontSize: 7, fontFamily: 'monospace' }}>RETENTION_PROB: {(Math.max(0, 100 - boredom - (cortisol > 80 ? 50 : 0))).toFixed(1)}%</Text>
              <Text style={{ color: '#00FF00', fontSize: 7, fontFamily: 'monospace' }}>DOPAMINE_VOLATILITY: {(dopamine * 0.14).toFixed(2)} $\Delta$</Text>
           </View>
         )}
      </View>

      {/* ── ALGORITHM CONTROLS ── */}
      <View style={styles.controlsGrid}>
         <TouchableOpacity style={[styles.controlBtn, { backgroundColor: 'rgba(0, 212, 160, 0.1)', borderColor: '#00D4A0' }]} onPress={() => injectContent('CUTE')}>
            <Icon name="heart" size={16} color="#00D4A0" />
            <Text style={[styles.ctrlBtnText, { color: '#00D4A0' }]}>Inject "Cute Animal"</Text>
         </TouchableOpacity>

         <TouchableOpacity style={[styles.controlBtn, { backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: '#FF4444' }]} onPress={() => injectContent('RAGE')}>
            <Icon name="alert-triangle" size={16} color="#FF4444" />
            <Text style={[styles.ctrlBtnText, { color: '#FF4444' }]}>Inject "Moral Outrage"</Text>
         </TouchableOpacity>

         <TouchableOpacity style={[styles.controlBtn, { backgroundColor: 'rgba(78, 205, 196, 0.1)', borderColor: '#4ECDC4' }]} onPress={() => injectContent('SOCIAL')}>
            <Icon name="users" size={16} color="#4ECDC4" />
            <Text style={[styles.ctrlBtnText, { color: '#4ECDC4' }]}>Inject "Friend flexing"</Text>
         </TouchableOpacity>
      </View>

      {(userState.includes('QUIT') || userState.includes('ASLEEP')) && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetTarget}>
            <Text style={styles.resetText}>Find New Target (Reset)</Text>
         </TouchableOpacity>
      )}

      <Text style={styles.footerInfo}>Balance dopamine spikes with outrage to keep retention high without crossing the quit-threshold.</Text>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  
  simBox: { height: 200, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  metricsOverlay: { position: 'absolute', right: 10, top: 20, width: 120, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: RADIUS.md },
  
  sciPanel: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },

  controlsGrid: { marginTop: 16, gap: 8 },
  controlBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, gap: 12 },
  ctrlBtnText: { fontSize: 11, fontFamily: FONTS.displayBold, flex: 1 },

  resetBtn: { marginTop: 16, backgroundColor: '#333', padding: 12, borderRadius: RADIUS.md, alignItems: 'center' },
  resetText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 11 },

  footerInfo: { marginTop: 16, textAlign: 'center', fontSize: 9, color: '#888', fontStyle: 'italic', paddingHorizontal: 20 }
});
