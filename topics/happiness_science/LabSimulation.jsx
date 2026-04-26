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

export default function HappinessLab({ scientistMode = false, onLabBreaker }) {
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
  const [tokens, setTokens] = useState(24);
  const [allocation, setAllocation] = useState({
     sleep: 0,
     work: 0,
     social: 0,
     scrolling: 0
  });

  const [metrics, setMetrics] = useState({
     hedonic: 0,
     eudaimonia: 0,
     health: 0
  });

  // Animations
  const hAnim = useRef(new Animated.Value(0)).current;
  const eAnim = useRef(new Animated.Value(0)).current;
  const mAnim = useRef(new Animated.Value(0)).current;

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     // Calculate complex joy
     let hedonia = (allocation.scrolling * 15) + (allocation.social * 5);
     let eudaimonia = (allocation.work * 10) + (allocation.social * 15);
     let healthBase = (allocation.sleep * 12);

     // Penalties
     if (allocation.sleep < 7) {
        hedonia *= 0.5; // Exhaustion kills joy
        eudaimonia *= 0.5;
     }
     if (allocation.scrolling > 4) {
        hedonia -= ((allocation.scrolling - 4) * 10); // Scrolling overdose
        eudaimonia -= 20; // Upward comparison drain
     }
     if (allocation.social === 0) {
        eudaimonia -= 30; // Isolation penalty
     }

     hedonia = Math.max(0, Math.min(100, hedonia));
     eudaimonia = Math.max(0, Math.min(100, eudaimonia));
     healthBase = Math.max(0, Math.min(100, healthBase));

     setMetrics({ hedonic: hedonia, eudaimonia, health: healthBase });

     Animated.spring(hAnim, { toValue: hedonia, useNativeDriver: false }).start();
     Animated.spring(eAnim, { toValue: eudaimonia, useNativeDriver: false }).start();
     Animated.spring(mAnim, { toValue: healthBase, useNativeDriver: false }).start();

     // Win condition
     if (tokens === 0 && eudaimonia > 80 && healthBase > 80) {
        soundSuccess();
        if (onLabBreaker) onLabBreaker();
     }

  }, [allocation]);

  const addToken = (cat) => {
     if (tokens <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
     }

     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setAllocation(prev => ({ ...prev, [cat]: prev[cat] + 1 }));
     setTokens(prev => prev - 1);
  };

  const removeToken = (cat) => {
     if (allocation[cat] <= 0) return;
     soundWhoosh();
     setAllocation(prev => ({ ...prev, [cat]: prev[cat] - 1 }));
     setTokens(prev => prev + 1);
  };

  const reset = () => {
     setAllocation({ sleep: 0, work: 0, social: 0, scrolling: 0 });
     setTokens(24);
  };

  // ── Render ─────────────────────────────────────
  const renderAllocRow = (cat, label, icon, color) => (
     <View style={styles.allocRow}>
        <View style={styles.allocInfo}>
           <Icon name={icon} size={16} color={color} />
           <Text style={[styles.allocLabel, { color }]}>{label}: {allocation[cat]}h</Text>
        </View>
        <View style={styles.btnGroup}>
           <TouchableOpacity style={[styles.miniBtn, { borderColor: border }]} onPress={() => removeToken(cat)}>
              <Text style={{ color: txt1, fontSize: 16 }}>-</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.miniBtn, { borderColor: border, backgroundColor: color + '20' }]} onPress={() => addToken(cat)}>
              <Text style={{ color: txt1, fontSize: 16 }}>+</Text>
           </TouchableOpacity>
        </View>
     </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Status Header ── */}
      <View style={[styles.headerBox, { borderColor: border }]}>
         <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>HOURS REMAINING TODAY</Text>
         <Text style={{ color: color, fontSize: 28, fontFamily: 'monospace' }}>{tokens}</Text>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#fff' }]}>
         {/* Custom Graph */}
         <View style={{ flex: 1, padding: 20, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', gap: 20 }}>
            {/* Hedonic Bar */}
            <View style={styles.barCol}>
               <Animated.View style={[styles.barFill, { backgroundColor: '#FFD166', height: hAnim.interpolate({ inputRange:[0,100], outputRange:['0%','100%']}) }]} />
               <Text style={[styles.barLabel, { color: '#FFD166' }]}>PLEASURE</Text>
               <Text style={{ color: '#fff', fontSize: 8 }}>{metrics.hedonic.toFixed(0)}</Text>
            </View>
            
            {/* Eudaimonic Bar */}
            <View style={styles.barCol}>
               <Animated.View style={[styles.barFill, { backgroundColor: '#A855F7', height: eAnim.interpolate({ inputRange:[0,100], outputRange:['0%','100%']}) }]} />
               <Text style={[styles.barLabel, { color: '#A855F7' }]}>MEANING</Text>
               <Text style={{ color: '#fff', fontSize: 8 }}>{metrics.eudaimonia.toFixed(0)}</Text>
            </View>

            {/* Health Bar */}
            <View style={styles.barCol}>
               <Animated.View style={[styles.barFill, { backgroundColor: '#00D4A0', height: mAnim.interpolate({ inputRange:[0,100], outputRange:['0%','100%']}) }]} />
               <Text style={[styles.barLabel, { color: '#00D4A0' }]}>HEALTH</Text>
               <Text style={{ color: '#fff', fontSize: 8 }}>{metrics.health.toFixed(0)}</Text>
            </View>
         </View>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>OXYTOCIN RECEPTORS: {(metrics.eudaimonia * 12).toFixed(0)} ng</Text>
              <Text style={styles.sciText}>DEFAULT MODE NET: {allocation.scrolling * 8}%</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controls}>
         {renderAllocRow('sleep', 'Sleep & Rest', 'cloud', '#00D4A0')}
         {renderAllocRow('work', 'Work/Deep Focus', 'target', '#A855F7')}
         {renderAllocRow('social', 'Relationships', 'users', '#FF6B9D')}
         {renderAllocRow('scrolling', 'Digital Scrolling', 'phone', '#FF4444')}
         
         <TouchableOpacity style={[styles.resetBtn, { backgroundColor: glass1, borderColor: border }]} onPress={reset}>
            <Text style={{ color: txt1, fontSize: 11, fontFamily: FONTS.displayBold }}>RESET DAY</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  headerBox: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  
  simBox: { height: 220, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', backgroundColor: '#000' },
  
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  barFill: { width: '60%', borderRadius: 6, marginBottom: 8, opacity: 0.8 },
  barLabel: { fontSize: 8, fontFamily: FONTS.displayBold, marginBottom: 4 },

  sciOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controls: { marginTop: 16, gap: 10 },
  allocRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: RADIUS.sm },
  allocInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allocLabel: { fontSize: 11, fontFamily: FONTS.displayBold },
  btnGroup: { flexDirection: 'row', gap: 8 },
  miniBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  resetBtn: { marginTop: 12, padding: 12, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center' }
});
