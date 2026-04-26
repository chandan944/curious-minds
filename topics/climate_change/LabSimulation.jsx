import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ClimateLab({ scientistMode = false, onLabBreaker }) {
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
  const [co2Level, setCo2Level] = useState(280); // Pre-industrial ppm
  const [temperature, setTemperature] = useState(14.0); // Baseline global temp 14C
  const [albedoIce, setAlbedoIce] = useState(100); // 100% baseline ice
  const [running, setRunning] = useState(true);

  // Particles: Incoming (Yellow, Shortwave), Outgoing (Red, Longwave)
  const [incoming] = useState([...Array(3)].map(() => new Animated.Value(0)));
  const [outgoing] = useState([...Array(3)].map(() => new Animated.Value(0)));

  // ── Physics Engine ──────────────────────────────────────
  useEffect(() => {
     let heatInterval;
     if (running) {
        heatInterval = setInterval(() => {
           // Base Temp is 14.0. CO2 forcing pushes it up.
           // Radiative Forcing approx: 5.35 * ln(C/C0)
           const forcing = 5.35 * Math.log(co2Level / 280);
           
           // Ice melts linearly as temp passes 14.5
           let newIce = 100;
           if (temperature > 14.5) {
              newIce = Math.max(0, 100 - ((temperature - 14.5) * 40));
           }

           // Albedo Feedback: Less ice = more heat absorption
           const albedoForcing = (100 - newIce) * 0.05; 

           setTemperature(prev => {
              const targetTemp = 14 + (forcing * 0.8) + albedoForcing; // rough climate sensitivity
              // Smooth transition to target
              const delta = (targetTemp - prev) * 0.05;
              const nextTemp = prev + delta;
              
              if (nextTemp > 16.0 && onLabBreaker) onLabBreaker();
              
              return parseFloat(nextTemp.toFixed(2));
           });

           setAlbedoIce(parseFloat(newIce.toFixed(1)));
        }, 100);
     }
     return () => clearInterval(heatInterval);
  }, [running, co2Level, temperature]);

  // ── Animations ──────────────────────────────────────
  useEffect(() => {
     const animateSun = (p, delay) => {
        Animated.loop(
           Animated.timing(p, {
              toValue: 1, duration: 2500, delay, easing: Easing.linear, useNativeDriver: false
           })
        ).start();
     };

     const animateHeat = (p, delay) => {
        // High CO2 = Heat bounces back instead of escaping
        const isTrapped = Math.random() < ((co2Level - 200) / 400); // Probability of trap

        Animated.loop(
           Animated.timing(p, {
              toValue: isTrapped ? 0.5 : 1, // Stop halfway (at the CO2 layer)
              duration: 3500, delay, easing: Easing.linear, useNativeDriver: false
           })
        ).start();
     };

     if (running) {
        incoming.forEach((p, i) => animateSun(p, i * 800));
        outgoing.forEach((p, i) => animateHeat(p, i * 1200));
     } else {
        incoming.forEach(p => p.stopAnimation());
        outgoing.forEach(p => p.stopAnimation());
     }
  }, [running, co2Level]); // Re-trigger outgoing when CO2 changes to update trap probability

  // ── Actions ──────────────────────────────────────
  const adjustCO2 = (delta) => {
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setCo2Level(prev => Math.max(100, Math.min(800, prev + delta)));
  };

  const getStatusColor = () => {
     if (temperature < 14.5) return '#00FF7F'; // Safe
     if (temperature < 15.5) return '#FFD166'; // Danger
     return '#FF4444'; // Catastrophe
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>GLOBAL TEMP OVER AVERAGE</Text>
            <Text style={{ color: getStatusColor(), fontSize: 24, fontFamily: 'monospace' }}>
               +{Math.max(0, temperature - 14.0).toFixed(2)}°C
            </Text>
         </View>
         <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>ARCTIC ALBEDO ICE</Text>
            <Text style={{ color: albedoIce < 20 ? '#FF4444' : '#00D4FF', fontSize: 24, fontFamily: 'monospace' }}>
               {albedoIce.toFixed(1)}%
            </Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Svg width={SIM_W} height={200}>
            {/* Space bg */}
            <Rect x="0" y="0" width={SIM_W} height="100" fill="#000" />
            
            {/* Atmosphere (Opacity based on CO2 level) */}
            <Rect 
                x="0" y="60" width={SIM_W} height="40" 
                fill={`rgba(255, 68, 68, ${(co2Level - 200)/1000})`} 
            />
            <SvgText x={SIM_W/2} y="85" fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle" fontWeight="bold">CO2 LAYER</SvgText>

            {/* Ocean */}
            <Rect x="0" y="100" width={SIM_W} height="100" fill="#0A2A4A" />
            
            {/* Ice (Width based on Albedo) */}
            <Rect 
                x={(SIM_W / 2) - ((albedoIce / 100) * (SIM_W/2))} 
                y="100" 
                width={(albedoIce / 100) * SIM_W} 
                height="20" 
                fill="#FFF" 
                rx="4" 
            />

            {/* Sun Particles (Shortwave) */}
            {incoming.map((p, i) => (
                <AnimatedCircle 
                   key={`inc-${i}`}
                   cx={p.interpolate({ inputRange: [0, 1], outputRange: [20 + (i*50), 100 + (i*50)] })}
                   cy={p.interpolate({ inputRange: [0, 1], outputRange: [0, 100] })}
                   r="3" fill="#FFE500"
                />
            ))}

            {/* Heat Particles (Longwave) */}
            {outgoing.map((p, i) => {
                 // Trap mechanics: if particle stops at 0.5 (CO2 layer), it should reverse
                 return (
                    <AnimatedCircle 
                       key={`out-${i}`}
                       cx={p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [150 + (i*40), 150 + (i*40), 150 + (i*40)] })}
                       cy={p.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [100, 60, 60, 0] })}
                       r="5" fill="rgba(255,0,0,0.8)" opacity={0.6}
                    />
                 );
            })}
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>FORCING: {(5.35 * Math.log(co2Level/280)).toFixed(2)} W/m²</Text>
              <Text style={styles.sciText}>ICE_ALBEDO_FF: {(100 - albedoIce).toFixed(1)}</Text>
              <Text style={styles.sciText}>PPM: {co2Level}</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 12 }}>ADJUST ATMOSPHERIC CARBON (CO2)</Text>
         
         <View style={styles.btnRow}>
            <TouchableOpacity style={styles.miniBtn} onPress={() => adjustCO2(-20)}>
               <Text style={styles.btnTxt}>-</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 32, fontFamily: 'monospace', fontWeight: 'bold' }}>{co2Level} <Text style={{ fontSize: 14 }}>ppm</Text></Text>
            </View>

            <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#FF4444' }]} onPress={() => adjustCO2(20)}>
               <Text style={styles.btnTxt}>+</Text>
            </TouchableOpacity>
         </View>

         <View style={styles.infoBox}>
            <Text style={{ color: getStatusColor(), fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center' }}>
               {co2Level <= 280 ? 'PRE-INDUSTRIAL: Earth is in delicate, perfect homeostasis.' : 
                co2Level < 400 ? 'RISING: Heat absorption increasing. Ice begins melting.' : 
                co2Level < 500 ? 'DANGER: (We are here). Accelerating Albedo feedback loop.' : 
                'CATASTROPHIC: Runaway Greenhouse Effect. Goodbye coastal cities.'}
            </Text>
         </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 200, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  miniBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  infoBox: { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#333' }
});
