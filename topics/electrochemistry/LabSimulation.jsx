import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

const METALS = [
  { id: 'Li', name: 'Lithium', volts: -3.04, color: '#FF4444' },
  { id: 'Zn', name: 'Zinc', volts: -0.76, color: '#A855F7' },
  { id: 'Cu', name: 'Copper', volts: 0.34, color: '#D4A74A' },
  { id: 'Ag', name: 'Silver', volts: 0.80, color: '#E2E8F0' },
  { id: 'F', name: 'Fluorine', volts: 2.87, color: '#00D4FF' }
];

export default function BatteryLab({ scientistMode = false, onLabBreaker }) {
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
  const [anode, setAnode] = useState(METALS[1]); // Zinc
  const [cathode, setCathode] = useState(METALS[2]); // Copper
  const [running, setRunning] = useState(false);
  const [voltage, setVoltage] = useState(0);
  const [msg, setMsg] = useState('CONFIGURE YOUR ELECTRODES');
  const [glow, setGlow] = useState(new Animated.Value(0));
  const [particles] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
    // E_cell = E_cathode - E_anode
    const v = cathode.volts - anode.volts;
    setVoltage(v);

    if (v < 0) {
       setMsg('REVERSE POLARITY! ELECTRONS FLOWING BACKWARDS ⚠️');
    } else if (v < 1.0) {
       setMsg('WEAK VOLTAGE. BARELY A TRICKLE. 💧');
    } else if (v > 2.0 && v < 4.0) {
       setMsg('STRONG BATTERY! LED IS BRIGHT! 💡');
    } else if (v >= 4.0) {
       setMsg('MAXIMUM POWER! EXPLOSIVE LITHIUM POTENTIAL! 🌋');
    }
  }, [anode, cathode]);

  const testBattery = () => {
    if (running) return;
    setRunning(true);
    soundTap();

    let v = cathode.volts - anode.volts;
    if (v < 0) {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       setTimeout(() => setRunning(false), 2000);
       return;
    }

    if (v >= 4.0 && onLabBreaker) onLabBreaker();

    // Start Glow
    Animated.timing(glow, {
       toValue: Math.min(1, v / 4.0),
       duration: 1000,
       easing: Easing.out(Easing.ease),
       useNativeDriver: false
    }).start();

    // Particle Flow Animation (Electrons)
    const animateParticle = (p, delay) => {
       Animated.loop(
          Animated.timing(p, {
             toValue: 1,
             duration: 1500 - (v * 100), // higher voltage = faster
             delay: delay,
             easing: Easing.linear,
             useNativeDriver: false
          })
       ).start();
    };

    if (v > 0) {
       soundWhoosh();
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
       particles.forEach((p, i) => animateParticle(p, i * 400));
    }

    setTimeout(() => {
       particles.forEach(p => p.stopAnimation());
       particles.forEach(p => p.setValue(0));
       Animated.timing(glow, { toValue: 0, duration: 1000, useNativeDriver: false }).start(() => {
          setRunning(false);
          soundBadge();
       });
    }, 4000);
  };

  const getWirePath = () => {
     // Start at Anode (x=75), go up to x=75 y=50, go across to x=SIM_W-75, go down to Cathode
     const startX = 75;
     const startY = 150;
     const midY = 50;
     const endX = SIM_W - 75;
     const endY = 150;
     return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>CELL VOLTAGE ($E^\circ$)</Text>
            <Text style={{ color: voltage > 0 ? '#00FF7F' : '#FF4444', fontSize: 24, fontFamily: 'monospace' }}>
               {voltage > 0 ? '+' : ''}{voltage.toFixed(2)}V
            </Text>
         </View>
         <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>STATUS</Text>
            <Text style={{ color: '#fff', fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'right', marginTop: 4 }}>
               {msg}
            </Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         
         <Svg width={SIM_W} height={220}>
            <Defs>
               <RadialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFA0" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FFFFA0" stopOpacity="0" />
               </RadialGradient>
            </Defs>

            {/* Cups */}
            {/* Anode Cup */}
            <Rect x="25" y="140" width="100" height="70" fill="rgba(255,255,255,0.05)" stroke="#555" strokeWidth="2" />
            <Path d="M 25 150 Q 75 145 125 150" fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.5" />
            <SvgText x="75" y="200" fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="middle">OXIDATION</SvgText>

            {/* Cathode Cup */}
            <Rect x={SIM_W - 125} y="140" width="100" height="70" fill="rgba(255,255,255,0.05)" stroke="#555" strokeWidth="2" />
            <Path d={`M ${SIM_W-125} 150 Q ${SIM_W-75} 145 ${SIM_W-25} 150`} fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.5" />
            <SvgText x={SIM_W - 75} y="200" fill="rgba(255,255,255,0.6)" fontSize="12" textAnchor="middle">REDUCTION</SvgText>

            {/* Salt Bridge */}
            <Path d={`M 100 160 L 100 130 C 100 110 ${SIM_W-100} 110 ${SIM_W-100} 130 L ${SIM_W-100} 160`} fill="none" stroke="#A855F7" strokeWidth="16" opacity="0.2" />
            <Path d={`M 100 160 L 100 130 C 100 110 ${SIM_W-100} 110 ${SIM_W-100} 130 L ${SIM_W-100} 160`} fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="5,5" />
            <SvgText x={SIM_W / 2} y="115" fill="#A855F7" fontSize="10" textAnchor="middle">SALT BRIDGE</SvgText>

            {/* Wire */}
            <Path d={getWirePath()} fill="none" stroke="#888" strokeWidth="4" />
            <Circle cx={SIM_W/2} cy="50" r="16" fill="#222" stroke="#444" strokeWidth="2" />
            
            {/* Glow Animation */}
            <AnimatedCircle 
               cx={SIM_W/2} 
               cy="50" 
               r={glow.interpolate({ inputRange: [0, 1], outputRange: [16, 40] })} 
               fill="url(#bulbGlow)" 
               opacity={glow} 
            />
            <SvgText x={SIM_W/2} y="54" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">LED</SvgText>

            {/* Electrodes */}
            {/* Anode */}
            <Rect x="60" y="130" width="30" height="60" fill={anode.color} stroke="#fff" strokeWidth="1" />
            <SvgText x="75" y="165" fill="#000" fontSize="12" textAnchor="middle" fontWeight="bold">{anode.id}</SvgText>
            <SvgText x="75" y="120" fill="#FF4444" fontSize="16" textAnchor="middle" fontWeight="bold">(-)</SvgText>

            {/* Cathode */}
            <Rect x={SIM_W - 90} y="130" width="30" height="60" fill={cathode.color} stroke="#fff" strokeWidth="1" />
            <SvgText x={SIM_W - 75} y="165" fill="#000" fontSize="12" textAnchor="middle" fontWeight="bold">{cathode.id}</SvgText>
            <SvgText x={SIM_W - 75} y="120" fill="#00FF7F" fontSize="16" textAnchor="middle" fontWeight="bold">(+)</SvgText>

            {/* Electron Flow Particles (only visible when running) */}
            {running && voltage > 0 && particles.map((p, i) => (
                <AnimatedCircle 
                   key={i}
                   cx={p.interpolate({ inputRange: [0, 0.4, 0.6, 1], outputRange: [75, 75, SIM_W-75, SIM_W-75] })}
                   cy={p.interpolate({ inputRange: [0, 0.4, 0.6, 1], outputRange: [150, 50, 50, 150] })}
                   r="4" fill="#00D4FF"
                />
            ))}
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>{"NERNST: $E = E^\\circ - \\frac{RT}{nF} \\ln Q$"}</Text>
              <Text style={styles.sciText}>{"$\\Delta G = -nFE^\\circ$"}</Text>
              <Text style={styles.sciText}>MOLARITY: 1.0M STANDARD STATE</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         
         <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
               <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, marginBottom: 4 }}>SELECT ANODE (-)</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {METALS.map(m => (
                     <TouchableOpacity 
                        key={`a-${m.id}`} 
                        style={[styles.metalBtn, anode.id === m.id && { backgroundColor: m.color }]}
                        onPress={() => setAnode(m)}
                        disabled={running}
                     >
                        <Text style={{ color: anode.id === m.id ? '#000' : txtM, fontSize: 12, fontWeight: 'bold' }}>{m.id}</Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
               <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, marginBottom: 4 }}>SELECT CATHODE (+)</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {METALS.map(m => (
                     <TouchableOpacity 
                        key={`c-${m.id}`} 
                        style={[styles.metalBtn, cathode.id === m.id && { backgroundColor: m.color }]}
                        onPress={() => setCathode(m)}
                        disabled={running}
                     >
                        <Text style={{ color: cathode.id === m.id ? '#000' : txtM, fontSize: 12, fontWeight: 'bold' }}>{m.id}</Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>
         </View>

         <TouchableOpacity 
            style={[styles.execBtn, { borderColor: voltage > 0 ? '#00FF7F' : '#FF4444', backgroundColor: running ? '#333' : 'rgba(0,255,127,0.1)' }]} 
            onPress={testBattery}
            disabled={running || voltage < 0}
         >
            <Text style={[styles.actionText, { color: voltage > 0 ? '#00FF7F' : '#555' }]}>
               {running ? 'DISCHARGING BATTERY...' : 'TEST BATTERY ⚡'}
            </Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: 220, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  sciOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16 },
  metalBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },

  execBtn: { marginTop: 10, paddingVertical: 16, borderWidth: 1, borderRadius: RADIUS.md, alignItems: 'center' },
  actionText: { fontSize: 14, fontFamily: FONTS.displayBold, letterSpacing: 1 }
});
