// ─────────────────────────────────────────────────────────────
//  LAB: Solar System — 4 Interactive Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, PanResponder
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import { Canvas, useFrame } from '@react-three/fiber';

// ══════════════════════════════════════════════════════════
//  GAME 1: 3D ORRERY MODEL
// ══════════════════════════════════════════════════════════
const PLANETS = [
  { id: 'sun', r: 0, s: 0.8, c: '#FF9F1C', sp: 0 },
  { id: 'mercury', r: 1.2, s: 0.1, c: '#A0A0A0', sp: 4.1 },
  { id: 'venus', r: 1.7, s: 0.2, c: '#E29E4D', sp: 1.6 },
  { id: 'earth', r: 2.3, s: 0.22, c: '#3B82F6', sp: 1.0 },
  { id: 'mars', r: 2.8, s: 0.15, c: '#FF4444', sp: 0.5 },
];

function Orrery3D({ speedFactor }) {
  const planetsRef = useRef();
  
  useFrame((state, delta) => {
    if (planetsRef.current) {
      planetsRef.current.children.forEach((child, i) => {
         // child is the group wrapper for each planet, i corresponds to PLANETS.slice(1)[i]
         // PLANETS.slice(1)[i] maps to index i+1 in PLANETS
         if (PLANETS[i + 1]) {
            child.rotation.y -= delta * PLANETS[i + 1].sp * speedFactor;
         }
      });
    }
  });

  return (
    <group position={[0, -0.5, 0]} rotation={[0.2, 0, 0]}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#FFF" distance={10} />

      {/* The Sun */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#FF9F1C" emissive="#FF9F1C" emissiveIntensity={0.8} />
      </mesh>

      {/* Orbit Rings & Planets */}
      <group ref={planetsRef}>
        {PLANETS.slice(1).map((p, i) => (
          <group key={p.id}>
            {/* Orbital Line */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[p.r, 0.01, 16, 64]} />
              <meshBasicMaterial color="#445566" transparent opacity={0.3} />
            </mesh>
            {/* The Orbiting Planet Platform */}
            <group>
               <mesh position={[p.r, 0, 0]}>
                 <sphereGeometry args={[p.s, 16, 16]} />
                 <meshStandardMaterial color={p.c} roughness={0.7} />
               </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function SolarSystemLab() {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary, border = theme.glass.border;

  // ── G1 STATES ──
  const [speed, setSpeed] = useState(1); // 1, 2, 5, 10

  // ── G2 STATES: GRAVITY SLINGSHOT ──
  const [slingshotStatus, setSlingshotStatus] = useState(0); // 0: Wait, 1: Slingshot, 2: Crash
  const dropAnim = useRef(new Animated.Value(0)).current; 
  const executeSlingshot = (type) => {
    soundWhoosh();
    setSlingshotStatus(type === 'safe' ? 1 : 2);
    
    // Animate satellite
    const toValue = type === 'safe' ? 200 : 80;
    Animated.timing(dropAnim, {
      toValue, duration: 800, useNativeDriver: false
    }).start(() => {
      if (type === 'safe') { soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
    });
  };
  const resetSlingshot = () => { dropAnim.setValue(0); setSlingshotStatus(0); };

  // ── G3 STATES: GOLDILOCKS ──
  const [draggerPos, setDraggerPos] = useState(50); // 0 (Fire) to 100 (Ice), 50 is earth

  // ── G4 STATES: SCALE ──
  const [scaleMode, setScaleMode] = useState(1); // 1: Earth/Jupiter, 2: Jupiter/Sun

  // Helper
  const InstructionCard = ({ gameNum, title, text, color }) => (
    <View style={[s.instCard, { backgroundColor: isDark ? '#1C2733' : '#E6F0FA', borderColor: color+'50' }]}>
      <View style={s.instHeader}>
        <Icon name="help" size={16} color={color} />
        <Text style={[s.instTitle, { color: color }]}>GAME {gameNum}: {title}</Text>
      </View>
      <Text style={[s.instText, { color: txt1 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>

      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 1: ORRERY */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="The 3D Orrery" color="#7B2CBF" text="Observe placing the Sun at the center of the model (Heliocentrism). The closer a planet is to the Sun's massive gravity, the faster it has to spin to avoid falling in! Hit TIME WARP." />
        
        <View style={s.canvasContainer}>
           <Canvas gl={{ alpha: true }} camera={{ position: [0, 4, 6], fov: 40 }}>
              <Orrery3D speedFactor={speed} />
           </Canvas>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
           <TouchableOpacity onPress={() => setSpeed(1)} style={[s.hugeBtn, { flex: 1, backgroundColor: speed===1 ? '#7B2CBF' : theme.glass.medium }]}><Text style={{ color: speed===1 ? '#FFF' : txt1 }}>1x Speed</Text></TouchableOpacity>
           <TouchableOpacity onPress={() => setSpeed(4)} style={[s.hugeBtn, { flex: 1, backgroundColor: speed===4 ? '#7B2CBF' : theme.glass.medium }]}><Text style={{ color: speed===4 ? '#FFF' : txt1 }}>4x Speed</Text></TouchableOpacity>
           <TouchableOpacity onPress={() => setSpeed(10)} style={[s.hugeBtn, { flex: 1, backgroundColor: speed===10 ? '#7B2CBF' : theme.glass.medium }]}><Text style={{ color: speed===10 ? '#FFF' : txt1 }}>TIME WARP</Text></TouchableOpacity>
        </View>
      </View>

      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 2: GRAVITY SLINGSHOT */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={2} title="Gravity Slingshot" color="#FF9F1C" text="NASA saves rocket fuel by flying satellites close behind Jupiter to steal its momentum. Play the game: Choose your trajectory angle!" />
        
        <View style={s.slingStage}>
           {/* Jupiter */}
           <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E29E4D', position: 'absolute', top: 50, left: 100 }} />
           
           {/* Spacecraft */}
           <Animated.View style={{ width: 16, height: 16, backgroundColor: '#FFF', position: 'absolute', left: 20, top: dropAnim.interpolate({inputRange: [0, 100, 200], outputRange: [20, 100, 150]}) }} />
           
           {slingshotStatus === 2 && <Text style={{ position: 'absolute', top: 90, left: 90, fontSize: 32 }}>💥</Text>}
           {slingshotStatus === 1 && <Text style={{ position: 'absolute', top: 150, left: 200, fontSize: 32 }}>☄️</Text>}
        </View>

        {slingshotStatus === 0 ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
             <TouchableOpacity onPress={() => executeSlingshot('crash')} style={[s.hugeBtn, { flex: 1, backgroundColor: '#FF4444' }]}><Text style={{ color: '#FFF' }}>AIM DIRECT</Text></TouchableOpacity>
             <TouchableOpacity onPress={() => executeSlingshot('safe')} style={[s.hugeBtn, { flex: 1, backgroundColor: '#00D4A0' }]}><Text style={{ color: '#000', fontWeight: 'bold' }}>AIM THE EDGE</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
             <Text style={{ color: slingshotStatus === 1 ? '#00D4A0' : '#FF4444', fontFamily: FONTS.displayHeavy, fontSize: 18, marginBottom: 12 }}>
                {slingshotStatus === 1 ? "Slingshot Success! +10,000 MPH" : "CRASHED INTO JUPITER!"}
             </Text>
             <TouchableOpacity onPress={resetSlingshot} style={s.hugeBtn}><Text style={{ color: txt1 }}>TRY AGAIN</Text></TouchableOpacity>
          </View>
        )}
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 3: THE GOLDILOCKS ZONE */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={3} title="The Goldilocks Zone" color="#3B82F6" text="Move the Earth by tapping the zones. Too close = Water Boils. Too far = Water Freezes. Keep it perfectly in the middle!" />
        
        <View style={s.goldStage}>
           <View style={{ width: 60, height: 120, backgroundColor: '#FF9F1C', position: 'absolute', left: -30, borderRadius: 30 }} />
           
           {draggerPos === 20 && <Text style={{ position:'absolute', top: 10, left: 80, fontSize: 40 }}>🔥</Text>}
           {draggerPos === 50 && <Text style={{ position:'absolute', top: 10, left: 140, fontSize: 40 }}>🌍</Text>}
           {draggerPos === 80 && <Text style={{ position:'absolute', top: 10, left: 220, fontSize: 40 }}>🧊</Text>}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
           <TouchableOpacity onPress={()=>setDraggerPos(20)} style={[s.hugeBtn, { flex: 1, backgroundColor: '#FF4444' }]}><Text style={{ color: '#FFF' }}>Too Close</Text></TouchableOpacity>
           <TouchableOpacity onPress={()=>setDraggerPos(50)} style={[s.hugeBtn, { flex: 1, backgroundColor: '#00D4A0' }]}><Text style={{ color: '#000' }}>Perfect</Text></TouchableOpacity>
           <TouchableOpacity onPress={()=>setDraggerPos(80)} style={[s.hugeBtn, { flex: 1, backgroundColor: '#3B82F6' }]}><Text style={{ color: '#FFF' }}>Too Far</Text></TouchableOpacity>
        </View>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 4: CELESTIAL SCALE */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA', marginBottom: 40 }]}>
        <InstructionCard gameNum={4} title="Celestial Scale Match" color="#FF007F" text="Space is terrifyingly large. Toggle the visualizer to see how many Earths fit across Jupiter, and how many Jupiters fit across the Sun." />

        <View style={s.scaleStage}>
           {scaleMode === 1 ? (
             <>
               <View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: '#E29E4D', position: 'absolute', top: 20, right: -40 }} />
               <View style={{ position: 'absolute', top: 80, left: 20, flexDirection: 'row', gap: 2 }}>
                  {/* 11 Earths fit across Jupiter */}
                  {[...Array(11)].map((_, i) => <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' }} />)}
               </View>
               <Text style={{ position: 'absolute', top: 20, left: 20, color: txt1, fontFamily: FONTS.displayHeavy }}>11 Earths = 1 Jupiter</Text>
             </>
           ) : (
             <>
                <View style={{ width: 250, height: 250, borderRadius: 125, backgroundColor: '#FF9F1C', position: 'absolute', top: 0, right: -100 }} />
                <View style={{ position: 'absolute', top: 90, left: 0, flexDirection: 'row', gap: 2 }}>
                  {/* 10 Jupiters fit across the Sun */}
                  {[...Array(10)].map((_, i) => <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#E29E4D' }} />)}
               </View>
               <Text style={{ position: 'absolute', top: 20, left: 20, color: txt1, fontFamily: FONTS.displayHeavy }}>10 Jupiters = 1 Sun</Text>
             </>
           )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
           <TouchableOpacity onPress={()=>setScaleMode(1)} style={[s.hugeBtn, { flex: 1, backgroundColor: scaleMode===1 ? '#7B2CBF' : theme.glass.medium }]}><Text style={{ color: scaleMode===1 ? '#FFF' : txt1 }}>Earth vs Jupiter</Text></TouchableOpacity>
           <TouchableOpacity onPress={()=>setScaleMode(2)} style={[s.hugeBtn, { flex: 1, backgroundColor: scaleMode===2 ? '#7B2CBF' : theme.glass.medium }]}><Text style={{ color: scaleMode===2 ? '#FFF' : txt1 }}>Jupiter vs Sun</Text></TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: SPACING.md, gap: SPACING.lg },
  gameBox: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 16, overflow: 'hidden' },
  instCard: { borderWidth: 1, borderRadius: RADIUS.md, padding: 16, marginBottom: 20 },
  instHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  instTitle: { fontFamily: FONTS.displayHeavy, fontSize: 13, letterSpacing: 1 },
  instText: { fontFamily: FONTS.bodyMedium, fontSize: 13, lineHeight: 18 },
  hugeBtn: { paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  canvasContainer: { height: 250, backgroundColor: '#050510', borderRadius: RADIUS.md, marginBottom: 16 },
  slingStage: { height: 200, backgroundColor: '#050510', borderRadius: RADIUS.md, marginBottom: 16, overflow: 'hidden' },
  goldStage: { height: 80, backgroundColor: '#050510', borderRadius: RADIUS.md, overflow: 'hidden' },
  scaleStage: { height: 180, backgroundColor: '#050510', borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
});
