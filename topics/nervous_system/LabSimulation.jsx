import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 360;

// Path constants
const HAND_P = { x: 50, y: 300 };
const SPINE_P = { x: 280, y: 150 };
const BRAIN_P = { x: 280, y: 40 };

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export default function NervousLab({ scientistMode = false }) {
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
  const [hasMyelin, setMyelin] = useState(false);
  const [lastLatency, setLatency] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [viewState, setViewState] = useState('IDLE'); // IDLE, REFLEX, BRAIN_RESPONSE
  
  const sensoryAnim = useRef(new Animated.Value(0)).current; 
  const reflexAnim = useRef(new Animated.Value(0)).current;
  const brainAnim = useRef(new Animated.Value(0)).current;
  const handShake = useRef(new Animated.Value(0)).current;

  // ── Handlers ───────────────────────────────────
  const triggerReflex = () => {
    if (isFiring) return;
    setIsFiring(true);
    setViewState('REFLEX');
    soundWhoosh();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const speedBase = hasMyelin ? 400 : 1500;
    const startTime = Date.now();

    // 1. Sensory Pulse to Spine
    Animated.timing(sensoryAnim, {
      toValue: 1,
      duration: speedBase,
      easing: Easing.linear,
      useNativeDriver: false // Animating circle along path is easier with nativeDriver false here
    }).start(() => {
      // 2. Split! Reflex back to Hand
      setLatency(Date.now() - startTime);
      soundTap();
      
      Animated.parallel([
        // Reflex back
        Animated.timing(reflexAnim, { toValue: 1, duration: speedBase * 0.8, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        // Signal to brain
        Animated.timing(brainAnim, { toValue: 1, duration: speedBase * 1.5, easing: Easing.linear, useNativeDriver: false })
      ]).start(() => {
        setViewState('BRAIN_RESPONSE');
        soundSuccess();
        
        // Hand Pull Away
        Animated.sequence([
           Animated.timing(handShake, { toValue: 1, duration: 100, useNativeDriver: true }),
           Animated.timing(handShake, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => {
           setTimeout(reset, 1500);
        });
      });
    });
  };

  const reset = () => {
    setIsFiring(false);
    setViewState('IDLE');
    sensoryAnim.setValue(0);
    reflexAnim.setValue(0);
    brainAnim.setValue(0);
  };

  const toggleMyelin = () => {
    setMyelin(!hasMyelin);
    soundTap();
  };

  // ── Render Helpers ─────────────────────────────
  
  // Interpolate positions
  const sensoryX = sensoryAnim.interpolate({ inputRange: [0, 1], outputRange: [HAND_P.x, SPINE_P.x] });
  const sensoryY = sensoryAnim.interpolate({ inputRange: [0, 1], outputRange: [HAND_P.y, SPINE_P.y] });
  
  const reflexX = reflexAnim.interpolate({ inputRange: [0, 1], outputRange: [SPINE_P.x, HAND_P.x] });
  const reflexY = reflexAnim.interpolate({ inputRange: [0, 1], outputRange: [SPINE_P.y, HAND_P.y] });

  const brainY = brainAnim.interpolate({ inputRange: [0, 1], outputRange: [SPINE_P.y, BRAIN_P.y] });

  const renderHand = () => {
    // @ts-ignore: style prop on AnimatedG causes false positive TS error
    return (
      <AnimatedG style={{ transform: [{ translateX: handShake.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }] }}>
        <Circle cx={HAND_P.x} cy={HAND_P.y} r="30" fill="url(#fireGrad)" />
        <Icon name="hand-pointing-up" size={30} x={HAND_P.x - 15} y={HAND_P.y - 15} color={isDark ? '#fff' : '#333'} />
        <SvgText x={HAND_P.x} y={HAND_P.y + 40} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">SENSORY RECEPTOR</SvgText>
      </AnimatedG>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
           <Text style={styles.statLabel}>LATENCY</Text>
           <Text style={[styles.statVal, { color: hasMyelin ? '#00D4FF' : '#FF9F1C' }]}>{lastLatency} ms</Text>
        </View>
        <View style={styles.statBox}>
           <Text style={styles.statLabel}>INSULATION</Text>
           <Text style={[styles.statVal, { color: hasMyelin ? '#00D4A0' : '#888' }]}>{hasMyelin ? 'MYELINATED' : 'NONE'}</Text>
        </View>
      </View>

      {/* ── Simulation Window ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H}>
           <Defs>
              <RadialGradient id="fireGrad" cx="50%" cy="50%" r="50%">
                 <Stop offset="0%" stopColor="#FF4444" stopOpacity="0.6" />
                 <Stop offset="100%" stopColor="#FF4444" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                 <Stop offset="0%" stopColor="#A855F7" stopOpacity={viewState === 'BRAIN_RESPONSE' ? 0.3 : 0} />
                 <Stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
              </RadialGradient>
           </Defs>

           {/* Anatomy Nodes */}
           <G opacity={0.3}>
              <Path d={`M ${HAND_P.x} ${HAND_P.y} L ${SPINE_P.x} ${SPINE_P.y} L ${BRAIN_P.x} ${BRAIN_P.y}`} 
                    stroke={txtM} strokeWidth="1" strokeDasharray="4,4" fill="none" />
           </G>

           {/* Hand Area */}
           {renderHand()}

           {/* Spinal Cord Node */}
           <Rect x={SPINE_P.x - 20} y={SPINE_P.y - 40} width="40" height="80" rx="20" fill={isDark ? '#222' : '#ddd'} stroke={border} />
           <SvgText x={SPINE_P.x + 30} y={SPINE_P.y} fill="rgba(255,255,255,0.6)" fontSize="10">SPINAL CORD (REFLEX HUB)</SvgText>

           {/* Brain Node */}
           <Circle cx={BRAIN_P.x} cy={BRAIN_P.y} r="40" fill="url(#brainGlow)" />
           <Icon name="brain" size={32} x={BRAIN_P.x - 16} y={BRAIN_P.y - 16} color={viewState === 'BRAIN_RESPONSE' ? '#A855F7' : '#555'} />
           <SvgText x={BRAIN_P.x + 45} y={BRAIN_P.y} fill="rgba(255,255,255,0.6)" fontSize="10">CONSCIOUS BRAIN</SvgText>

           {/* Signal Pulses */}
           {/* Sensory --> Spine */}
           <AnimatedCircle cx={sensoryX} cy={sensoryY} r={isFiring ? 6 : 0} fill="#FF9F1C" />
           
           {/* Spine --> Hand (Reflex) */}
           <AnimatedCircle cx={reflexX} cy={reflexY} r={viewState !== 'IDLE' ? 6 : 0} fill="#00FF00" />
           
           {/* Spine --> Brain (Conscious) */}
           <AnimatedCircle cx={BRAIN_P.x} cy={brainY} r={viewState !== 'IDLE' ? 6 : 0} fill="#A855F7" />

           {/* Myelin Visual */}
           {hasMyelin && (
              <G opacity={0.4}>
                 <Path d={`M ${HAND_P.x+10} ${HAND_P.y-10} L ${SPINE_P.x} ${SPINE_P.y}`} stroke="#00D4FF" strokeWidth="8" strokeDasharray="10,2" />
              </G>
           )}

           {scientistMode && (
             <G>
               <SvgText x="10" y="20" fill="#00D4FF" fontSize="8" fontFamily="monospace">VELOCITY: {hasMyelin ? '120 m/s' : '0.5 m/s'}</SvgText>
               <SvgText x="10" y="32" fill="#00D4FF" fontSize="8" fontFamily="monospace">SYNAPTIC DELAY: 2ms</SvgText>
             </G>
           )}
        </Svg>

        <TouchableOpacity style={styles.stimBtn} onPress={triggerReflex} disabled={isFiring}>
           <Text style={styles.stimText}>{isFiring ? 'TRANSMITTING...' : 'TRIGGER HEAT STIMULUS'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlRow}>
          <TouchableOpacity style={[styles.toggleBtn, hasMyelin && { backgroundColor: '#00D4FF' }]} onPress={toggleMyelin}>
             <Icon name="zap" size={16} color={hasMyelin ? '#000' : '#888'} />
             <Text style={[styles.toggleText, { color: hasMyelin ? '#000' : '#888' }]}>ADD MYELIN INSULATION</Text>
          </TouchableOpacity>
      </View>

      {/* ── Legend ── */}
      <View style={styles.legend}>
         <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FF9F1C' }]} /><Text style={styles.legText}>Sensory Signal</Text></View>
         <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#00FF00' }]} /><Text style={styles.legText}>Reflex Ordered</Text></View>
         <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#A855F7' }]} /><Text style={styles.legText}>Pain Awareness</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: RADIUS.md, borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.1)' },
  statLabel: { fontSize: 8, color: '#888', fontFamily: FONTS.displayBold, marginBottom: 4 },
  statVal: { fontSize: 16, fontFamily: FONTS.displayBold },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  stimBtn: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#FF4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: RADIUS.full, elevation: 5 },
  stimText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 12, letterSpacing: 1 },

  controlRow: { marginTop: 16 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' },
  toggleText: { fontSize: 12, fontFamily: FONTS.displayBold },

  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legText: { fontSize: 10, color: '#888', fontFamily: FONTS.body }
});
