// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  LAB: Industrial Revolution â€” Steam, Steel & Cities
//
//  MODE 1 â€” 3D Engine: True 3D Steam Engine using @react-three/fiber
//  MODE 2 â€” Factory: Connect transmission belts from engine to looms
//  MODE 3 â€” Urbanization: Timeline map showing city population growth
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, PanResponder
} from 'react-native';
import Svg, { Circle, Rect, Line, Path, Defs, Stop, Text as SvgText, LinearGradient as SvgLG } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

// 3D Imports
import { Canvas, useFrame } from '@react-three/fiber';

const { width: W_SCREEN } = Dimensions.get('window');
const SIM_W = W_SCREEN - SPACING.md * 4;
const SIM_H = 300;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  3D STEAM ENGINE (REACT-THREE-FIBER)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function SteamEngine3D({ heatLevel, isDark }) {
  const flywheelRef = useRef(null);
  const pistonRef = useRef(null);
  const steamRef = useRef(null);

  useFrame((state, delta) => {
    // RPM scales quadratically with heat for visual impact
    const rpm = heatLevel === 0 ? 0 : 2 + Math.pow(heatLevel, 2) * 15;
    
    if (flywheelRef.current) {
      flywheelRef.current.rotation.x -= delta * rpm;
    }
    
    if (pistonRef.current) {
      // Piston moves up and down
      pistonRef.current.position.y = Math.sin(state.clock.elapsedTime * rpm) * 0.45;
    }

    if (steamRef.current && heatLevel > 0.2) {
      // Steam particles pulsating
      steamRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * rpm * 2) * 0.1);
      steamRef.current.opacity = 0.3 + Math.sin(state.clock.elapsedTime * rpm) * 0.2;
    }
  });

  const metalColor = isDark ? '#7a7a7a' : '#555555';
  const boilerColor = isDark ? '#9B5B3E' : '#B87353'; // Copper/Bronze look

  return (
    <group position={[0, -0.5, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.4 : 0.8} />
      <pointLight position={[3, 5, 3]} intensity={isDark ? 6 : 4} color="#FFF5E1" />
      <pointLight position={[-2, -1, 0]} intensity={heatLevel * 8} color="#FF3A00" distance={5} />

      {/* Furnace / Firebox */}
      <mesh position={[-1.5, -0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      <mesh position={[-1.5, -0.9, 0]}>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <meshStandardMaterial 
          color={heatLevel > 0.1 ? '#FF2200' : '#442222'} 
          emissive="#FF2200" 
          emissiveIntensity={heatLevel * 2} 
        />
      </mesh>

      {/* Boiler */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-1.5, 0.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
        <meshStandardMaterial color={boilerColor} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Steam pipe */}
      <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
         <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
         <meshStandardMaterial color={metalColor} metalness={0.8} />
      </mesh>

      {/* Cylinder Shell (Transparent to see piston) */}
      <mesh position={[1.5, 0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
        <meshStandardMaterial color="#AAA" transparent opacity={0.3} metalness={0.9} />
      </mesh>

      {/* Steam visually expanding */}
      <mesh ref={steamRef} position={[1.5, 0.8, 0]}>
        <sphereGeometry args={[0.48, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Piston */}
      <mesh ref={pistonRef} position={[1.5, 0.6, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
        <meshStandardMaterial color="#EAEAEA" metalness={0.6} />
      </mesh>

      {/* Platform */}
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[6, 0.2, 2.5]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* Flywheel Stand */}
      <mesh position={[3.2, -0.3, 0]}>
         <boxGeometry args={[0.8, 1.5, 0.6]} />
         <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>

      {/* Flywheel */}
      <mesh ref={flywheelRef} rotation={[Math.PI / 2, 0, 0]} position={[3.2, 0.5, 0.5]}>
        <torusGeometry args={[0.8, 0.15, 16, 32]} />
        <meshStandardMaterial color="#FF9F1C" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Flywheel spokes */}
      <mesh position={[3.2, 0.5, 0.5]}>
         <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
         <meshStandardMaterial color="#FF9F1C" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[3.2, 0.5, 0.5]}>
         <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
         <meshStandardMaterial color="#FF9F1C" metalness={0.5} roughness={0.4} />
      </mesh>

    </group>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DATA & CONSTANTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const MODES = [
  { id: 'engine',  name: '3D Steam Engine', icon: 'fire',    color: '#FF4444' },
  { id: 'factory', name: 'Factory Floor',   icon: 'factory', color: '#FF9F1C' },
  { id: 'urban',   name: 'Urbanization',    icon: 'globe',   color: '#00D4A0' },
];

const CHALLENGES = [
  { id: 'explore_3d', title: 'Inspector',      desc: 'View the 3D Steam Engine at 100% heat', icon: 'search',  color: '#FF4444' },
  { id: 'factory_5',  title: 'Tycoon',         desc: 'Power all 5 looms simultaneously',      icon: 'factory', color: '#FF9F1C' },
  { id: 'time_travel',title: 'Time Traveler',  desc: 'Watch the map reach the year 1900',     icon: 'clock',   color: '#00D4A0' },
];

// Factory Looms Grid
const LOOMS = [
  { id: 1, cx: 40,  cy: 50 },
  { id: 2, cx: 40,  cy: 140 },
  { id: 3, cx: 40,  cy: 230 },
  { id: 4, cx: SIM_W - 40, cy: 90 },
  { id: 5, cx: SIM_W - 40, cy: 190 },
];

// UK Map Path (Simplified)
const UK_MAP_PATH = "M120 280 L140 270 L160 275 L180 260 L190 280 L230 270 L250 250 L240 200 L260 180 L250 140 L210 120 L200 80 L180 40 L160 10 L140 20 L130 60 L100 100 L120 140 L80 180 L60 240 Z";

const CITIES = [
  { id: 'london',     name: 'London',     cx: 210, cy: 230, basePop: 7, maxPop: 30 }, // 700k to 3M
  { id: 'manchester', name: 'Manchester', cx: 160, cy: 150, basePop: 1, maxPop: 15 }, // Exploded
  { id: 'birmingham', name: 'Birmingham', cx: 165, cy: 185, basePop: 1, maxPop: 12 },
  { id: 'liverpool',  name: 'Liverpool',  cx: 140, cy: 155, basePop: 1, maxPop: 14 },
];

const COAL_MINES = [
  { cx: 165, cy: 140 }, { cx: 175, cy: 160 }, { cx: 130, cy: 120 }, { cx: 200, cy: 100 }
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function IndustrialRevolutionLab({
  scientistMode = false,
  accentColor   = '#FF7A59',
}) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const wire = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [modeIdx, setModeIdx] = useState(0);
  const [heatLevel, setHeatLevel] = useState(0); // 0 to 1
  
  // Factory Mode
  const [connectedLooms, setConnectedLooms] = useState(new Set());
  
  // Urban Map
  const [year, setYear] = useState(1750); // 1750 to 1900

  // Tracking & Challenges
  const [completedCh, setCompletedCh] = useState([]);
  const [lastChMsg, setLastChMsg]     = useState(null);
  const [showCh, setShowCh]           = useState(false);
  const chAnim    = useRef(new Animated.Value(0)).current;
  const [runCount, setRunCount]       = useState(0);

  // Derived
  const mode = MODES[modeIdx];

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const unlockCh = (id) => {
    if (completedCh.includes(id)) return;
    const next = [...completedCh, id];
    setCompletedCh(next); setLastChMsg(CHALLENGES.find(c => c.id === id)?.title);
    soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(chAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(chAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const switchMode = (i) => {
    soundTap(); Haptics.selectionAsync();
    setModeIdx(i); setRunCount(c => c + 1);
  };

  const changeHeat = (val) => {
    setHeatLevel(val);
    if (!completedCh.includes('explore_3d') && val >= 0.9) unlockCh('explore_3d');
  };

  const toggleLoom = (id) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = new Set(connectedLooms);
    if (next.has(id)) next.delete(id); else next.add(id);
    setConnectedLooms(next);
    setRunCount(c => c + 1);
    if (next.size >= 5 && !completedCh.includes('factory_5')) unlockCh('factory_5');
  };

  const handleYearScroll = (evt) => {
    const p = Math.max(0, Math.min(1, evt.nativeEvent.locationX / (SIM_W - 32)));
    const y = Math.round(1750 + p * 150);
    setYear(y);
    if (y >= 1900 && !completedCh.includes('time_travel')) unlockCh('time_travel');
  };

  // â”€â”€ Fun fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const funFact = (() => {
    if (mode.id === 'engine') return "The steam engine allowed us to convert stored chemical energy (coal) into kinetic energy (motion).";
    if (mode.id === 'factory') return "One massive steam engine via leather belts could power hundreds of looms simultaneously.";
    if (mode.id === 'urban') return "Manchester's population exploded from 25,000 to over 300,000, creating massive slums.";
    return "Industrialization fundamentally changed how humans work, travel, and live.";
  })();

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  RENDER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <View style={s.root}>

      {/* â”€â”€ Mode Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity key={m.id} onPress={() => switchMode(i)}
            style={[s.tab, { borderColor: modeIdx === i ? m.color + '80' : border, backgroundColor: modeIdx === i ? m.color + '12' : glass1 }]}>
            <Icon name={m.icon} size={16} color={modeIdx === i ? m.color : txtM} />
            <Text style={[s.tabTxt, { color: modeIdx === i ? txt1 : txtM }]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* â”€â”€ MAIN CANVAS AREA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[s.canvasOuter, { borderColor: border }]}>

        {/* MODE 1: 3D ENGINE */}
        {mode.id === 'engine' && (
          <View style={s.canvas}>
              <Canvas
                gl={{ localClippingEnabled: true, alpha: true }}
                camera={{ position: [0, 2, 5], fov: 50 }}
                style={{ width: '100%', height: '100%', backgroundColor: isDark ? '#0A0C10' : '#E8EBED' }}
              >
                <SteamEngine3D heatLevel={heatLevel} isDark={isDark} />
              </Canvas>
              
              {/* Overlays */}
              <View style={s.overlayTopRight}>
                 <Text style={[s.badgeTxt, { color: txt1 }]}>Auto-Rotating Engine</Text>
              </View>

              <View style={[s.engineControls, { backgroundColor: glass1, borderColor: border }]}>
                 <View style={s.sliderRow}>
                    <Icon name="fire" size={16} color="#FF4444" />
                    <Text style={[s.sliderLabel, { color: txt1 }]}>Furnace Heat: {Math.round(heatLevel * 100)}%</Text>
                 </View>
                 <View style={[s.sliderTrack, { backgroundColor: glass2 }]} 
                    onStartShouldSetResponder={() => true}
                    onResponderMove={(e) => changeHeat(Math.max(0, Math.min(1, e.nativeEvent.locationX / ((SIM_W - 40) - 24))))}>
                    <View style={[s.sliderFill, { width: `${heatLevel * 100}%`, backgroundColor: '#FF4444' }]} />
                    <View style={[s.sliderThumb, { left: `${heatLevel * 100}%`, backgroundColor: '#fff', borderColor: '#FF4444' }]} pointerEvents="none" />
                 </View>
                 {scientistMode && (
                   <View style={s.scienceRow}>
                     <SLabel icon="pressure" label={`Psi: ${Math.round(heatLevel * 120)}`} color="#00D4A0" txtM={txtM} />
                     <SLabel icon="refresh" label={`RPM: ${Math.round(heatLevel * 600)}`} color="#FF9F1C" txtM={txtM} />
                     <SLabel icon="thermometer" label={`Temp: ${Math.round(100 + heatLevel * 300)}Â°C`} color="#FF4444" txtM={txtM} />
                   </View>
                 )}
              </View>
          </View>
        )}

        {/* MODE 2: FACTORY SVG SIMULATION */}
        {mode.id === 'factory' && (
          <View style={[s.canvas, { backgroundColor: isDark ? '#151520' : '#F4F5F7' }]}>
            <Svg width={SIM_W} height={SIM_H}>
               <Defs>
                 <SvgLG id="bgFade" x1="0" y1="0" x2="0" y2="1">
                   <Stop offset="0" stopColor={isDark ? '#0D0D14' : '#EAEAEA'} />
                   <Stop offset="1" stopColor={isDark ? '#1C1C29' : '#FFFFFF'} />
                 </SvgLG>
               </Defs>
               <Rect width={SIM_W} height={SIM_H} fill="url(#bgFade)" />

               {/* Central Overhead Shaft */}
               <Rect x={SIM_W / 2 - 20} y={20} width={40} height={260} fill="#333" rx={4} />
               <Rect x={SIM_W / 2 - 15} y={30} width={30} height={240} fill="#555" rx={2} />
               <SvgText x={SIM_W / 2} y={150} textAnchor="middle" fill="#FFF" fontSize="10" transform={`rotate(-90, ${SIM_W/2}, 150)`}>MAIN ENGINE SHAFT</SvgText>

               {/* Belts */}
               {LOOMS.map(L => {
                 if (!connectedLooms.has(L.id)) return null;
                 // Draw a belt from shaft to loom
                 return (
                   <Line key={`belt_${L.id}`} 
                     x1={SIM_W / 2} y1={L.cy} x2={L.cx} y2={L.cy} 
                     stroke="#8B4513" strokeWidth={6} strokeDasharray="10, 5" />
                 );
               })}

               {/* Looms */}
               {LOOMS.map(L => {
                 const isOn = connectedLooms.has(L.id);
                 return (
                   <React.Fragment key={`loom_${L.id}`}>
                      {isOn && <Circle cx={L.cx} cy={L.cy} r={28} fill="#FF9F1C" fillOpacity={0.2} />}
                      <Rect x={L.cx - 20} y={L.cy - 15} width={40} height={30} fill={isOn ? '#FF9F1C' : metalColor(isDark)} rx={4} />
                      <Circle cx={L.cx} cy={L.cy} r={8} fill={isOn ? "#FFF" : "#333"} />
                      <SvgText x={L.cx} y={L.cy + 25} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontWeight="bold">LOOM {L.id}</SvgText>
                   </React.Fragment>
                 );
               })}

            </Svg>

            {/* Clickable regions for Looms */}
            {LOOMS.map(L => (
              <TouchableOpacity key={`touch_${L.id}`} 
                 style={{ position: 'absolute', left: L.cx - 25, top: L.cy - 25, width: 50, height: 50 }}
                 onPress={() => toggleLoom(L.id)} activeOpacity={0.7}
              />
            ))}

            <View style={s.overlayTopRight}>
               <Text style={[s.badgeTxt, { color: txt1 }]}>Tap looms to connect belts</Text>
               <Text style={[s.badgeData, { color: '#FF9F1C' }]}>Output: {connectedLooms.size * 120} yards/hr</Text>
            </View>
          </View>
        )}

        {/* MODE 3: URBANIZATION MAP */}
        {mode.id === 'urban' && (() => {
          const progress = (year - 1750) / 150; // 0 to 1
          
          return (
          <View style={[s.canvas, { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' }]}>
            <Svg width={SIM_W} height={SIM_H}>
               {/* Map Path */}
               <Path d={UK_MAP_PATH} fill={isDark ? '#1E293B' : '#CBD5E1'} stroke={wire} strokeWidth={2} />
               
               {/* Coal Mines - Glow based on year */}
               {COAL_MINES.map((c, i) => (
                  <Circle key={`coal_${i}`} cx={c.cx} cy={c.cy} r={4 + progress * 6} fill="#FF4444" fillOpacity={0.3 + progress * 0.5} />
               ))}

               {/* Cities */}
               {CITIES.map(c => {
                  const pop = c.basePop + progress * progress * (c.maxPop - c.basePop);
                  return (
                    <React.Fragment key={c.id}>
                       <Circle cx={c.cx} cy={c.cy} r={pop} fill="#00D4A0" fillOpacity={isDark ? 0.6 : 0.8} />
                       <Circle cx={c.cx} cy={c.cy} r={2} fill="#FFF" />
                       <SvgText x={c.cx} y={c.cy - pop - 2} textAnchor="middle" fill="#FFF" fontSize="10">{c.name}</SvgText>
                    </React.Fragment>
                  );
               })}

               {/* Year display massive */}
               <SvgText x={SIM_W - 20} y={50} textAnchor="end" fill="#FFF" fontSize="36" fontWeight="bold" opacity={0.8}>{year}</SvgText>
            </Svg>

            {/* Timeline Slider Overlay */}
            <View style={[s.timelineContainer, { backgroundColor: glass1, borderColor: border }]}>
                <View style={s.sliderRow}>
                    <Icon name="clock" size={16} color="#00D4A0" />
                    <Text style={[s.sliderLabel, { color: txt1 }]}>Year: {year}</Text>
                 </View>
                 <View style={[s.sliderTrack, { backgroundColor: glass2 }]} 
                    onStartShouldSetResponder={() => true}
                    onResponderMove={handleYearScroll}>
                    <View style={[s.sliderFill, { width: `${progress * 100}%`, backgroundColor: '#00D4A0' }]} />
                    <View style={[s.sliderThumb, { left: `${progress * 100}%`, backgroundColor: '#fff', borderColor: '#00D4A0' }]} pointerEvents="none" />
                 </View>
            </View>
          </View>
        )})()}
      </View>

      {/* â”€â”€ Stats Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={s.statsRow}>
        <Stat icon="fire" color="#FF4444" label="Steam PSI" val={Math.round(heatLevel * 120)} t1={txt1} tM={txtM} />
        <Stat icon="factory" color="#FF9F1C" label="Active Looms" val={connectedLooms.size} t1={txt1} tM={txtM} />
        <Stat icon="person" color="#00D4A0" label="Pop. Growth" val={`+${Math.round(((year-1750)/150)*400)}%`} t1={txt1} tM={txtM} />
      </View>

      {/* â”€â”€ Fun Fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[s.fact, { borderColor: accentColor + '25', backgroundColor: accentColor + '08' }]}>
        <View style={[s.factIco, { backgroundColor: accentColor + '18' }]}>
          <Icon name="lightbulb" size={14} color={accentColor} />
        </View>
        <Text style={[s.factTxt, { color: txt2 }]}>{funFact}</Text>
      </View>

      {/* â”€â”€ Challenge toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View style={[s.toast, { backgroundColor: accentColor + '18', borderColor: accentColor + '50',
        opacity: chAnim, transform: [{ translateY: chAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }]}>
        <Icon name="trophy" size={16} color={accentColor} />
        <Text style={[s.toastTxt, { color: accentColor }]}>{lastChMsg}</Text>
      </Animated.View>

      {/* â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TouchableOpacity onPress={() => { soundTap(); setShowCh(v => !v); }}
        style={[s.chToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={s.chToggleInner}>
          <Icon name="target" size={14} color={accentColor} />
          <Text style={[s.chToggleTxt, { color: txt1 }]}>Challenges ({completedCh.length}/{CHALLENGES.length})</Text>
          <View style={[s.chBar, { backgroundColor: glass2 }]}>
            <View style={[s.chBarFill, { width: `${(completedCh.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Icon name={showCh ? 'close' : 'forward'} size={12} color={txtM} />
        </View>
      </TouchableOpacity>
      {showCh && CHALLENGES.map(ch => {
        const done = completedCh.includes(ch.id);
        return (
          <View key={ch.id} style={[s.chItem, { borderColor: done ? ch.color + '40' : border, backgroundColor: done ? ch.color + '0A' : glass1 }]}>
            <View style={[s.chIcoW, { backgroundColor: (done ? ch.color : txtM) + '18' }]}>
              <Icon name={ch.icon} size={14} color={done ? ch.color : txtM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.chN, { color: done ? txt1 : txtM }]}>{ch.title}</Text>
              <Text style={[s.chD, { color: done ? txt2 : txtM }]}>{ch.desc}</Text>
            </View>
            {done && <Icon name="check" size={14} color={ch.color} />}
          </View>
        );
      })}

      {runCount > 0 && (
        <View style={s.cntRow}>
          <Icon name="flask" size={11} color={txtM} />
          <Text style={[s.cntTxt, { color: txtM }]}>{runCount} interaction{runCount > 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SUB-COMPONENTS & HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function SLabel({ icon, label, color, txtM }) {
  return (
    <View style={s.sLabel}>
      <Icon name={icon} size={11} color={color} />
      <Text style={[s.sLabelTxt, { color: txtM }]}>{label}</Text>
    </View>
  );
}

function Stat({ icon, color, label, val, t1, tM }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={12} color={color} />
      <View>
        <Text style={[s.statVal, { color: t1 }]}>{val}</Text>
        <Text style={[s.statLbl, { color: tM }]}>{label}</Text>
      </View>
    </View>
  );
}

function metalColor(isDark) { return isDark ? '#7a7a7a' : '#555555'; }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STYLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const s = StyleSheet.create({
  root: { gap: SPACING.sm },
  tabRow: { gap: 8, paddingRight: SPACING.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1 },
  tabTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  canvasOuter: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', height: SIM_H },
  canvas: { flex: 1, position: 'relative' },

  overlayTopRight: { position: 'absolute', top: 10, right: 10, alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 },
  badgeTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  badgeData: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  engineControls: { position: 'absolute', bottom: 10, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  timelineContainer: { position: 'absolute', bottom: 10, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sliderLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  sliderTrack: { height: 24, borderRadius: 12, position: 'relative', overflow: 'hidden', justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  sliderThumb: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginLeft: -10 },

  scienceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  sLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sLabelTxt: { fontFamily: FONTS.bodyMedium, fontSize: 10, textTransform: 'uppercase' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statVal: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  statLbl: { fontFamily: FONTS.body, fontSize: 9 },

  // Fun fact
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: 12 },
  factIco: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  factTxt: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, flex: 1 },

  // Challenges
  toast: { position: 'absolute', top: 10, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, zIndex: 999 },
  toastTxt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  chToggle: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12 },
  chToggleInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chToggleTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  chBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  chBarFill: { height: 4, borderRadius: 2 },
  chItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 4 },
  chIcoW: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chN: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  chD: { fontFamily: FONTS.body, fontSize: 10 },
  cntRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 4 },
  cntTxt: { fontFamily: FONTS.body, fontSize: 11 },
});
