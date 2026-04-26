// ─────────────────────────────────────────────────────────────
//  LAB: Genetic Engineering — 5 Mini-Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import { Canvas, useFrame } from '@react-three/fiber/native';

// ══════════════════════════════════════════════════════════
//  3D HELIX COMPONENT (GAME 1)
// ══════════════════════════════════════════════════════════
const SEQUENCE = [
  { p1: 'A', p2: 'T', c1: '#00D4A0', c2: '#FF4444' },
  { p1: 'C', p2: 'G', c1: '#3B82F6', c2: '#FF9F1C' },
  { p1: 'G', p2: 'C', c1: '#FF9F1C', c2: '#3B82F6' },
  { p1: 'T', p2: 'A', c1: '#FF4444', c2: '#00D4A0' },
  { p1: 'A', p2: 'T', c1: '#00D4A0', c2: '#FF4444' },
  { p1: 'C', p2: 'G', c1: '#3B82F6', c2: '#FF9F1C' },
  { p1: 'T', p2: 'A', c1: '#FF4444', c2: '#00D4A0' },
  { p1: 'G', p2: 'C', c1: '#FF9F1C', c2: '#3B82F6' },
];

function DNAHelix3D({ isUnzipped, isMutated, isDark }) {
  const groupRef = useRef(null);
  const animOffset = useRef(0);

  useFrame((state, delta) => {
    const speed = isMutated ? 3.0 : 1.0;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
      if (isMutated) groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.15;
      else groupRef.current.rotation.z = 0;
    }
    const targetOffset = isUnzipped ? 1.5 : 0;
    animOffset.current += (targetOffset - animOffset.current) * 0.1;
  });

  const backboneMat = isDark ? '#445566' : '#99AABB';
  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={[1.5, 1.5, 1.5]}>
      <ambientLight intensity={isDark ? 0.6 : 0.9} />
      <pointLight position={[5, 0, 5]} intensity={isDark ? 4 : 2} color="#FFFFFF" />
      <pointLight position={[-5, 5, -5]} intensity={isMutated ? 12 : 2} color={isMutated ? "#FF0000" : "#00D4A0"} distance={10} />

      {SEQUENCE.map((pair, i) => {
        const yPos = (i - SEQUENCE.length / 2) * 0.6;
        const rot = i * 0.6;
        const x1 = Math.sin(rot) * 1.2; const z1 = Math.cos(rot) * 1.2;
        const x2 = Math.sin(rot + Math.PI) * 1.2; const z2 = Math.cos(rot + Math.PI) * 1.2;

        return (
          <group key={i}>
            <mesh position={[x1 + animOffset.current, yPos, z1]}>
               <sphereGeometry args={[0.2, 16, 16]} />
               <meshStandardMaterial color={isMutated ? '#880000' : backboneMat} metalness={0.5} roughness={0.2} />
               <mesh position={[-(x1/2) - (animOffset.current/2), 0, -(z1/2)]} rotation={[0, -rot, Math.PI/2]}>
                 <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
                 <meshStandardMaterial color={isMutated ? '#220000' : pair.c1} emissive={isMutated ? '#000' : pair.c1} emissiveIntensity={0.5} />
               </mesh>
            </mesh>
            <mesh position={[x2 - animOffset.current, yPos, z2]}>
               <sphereGeometry args={[0.2, 16, 16]} />
               <meshStandardMaterial color={isMutated ? '#880000' : backboneMat} metalness={0.5} roughness={0.2} />
               <mesh position={[-(x2/2) + (animOffset.current/2), 0, -(z2/2)]} rotation={[0, -rot, Math.PI/2]}>
                 <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
                 <meshStandardMaterial color={isMutated ? '#220000' : pair.c2} emissive={isMutated ? '#000' : pair.c2} emissiveIntensity={0.5} />
               </mesh>
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function GeneticMiniGamesLab() {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── GAME 1 STATES ──
  const [g1_unzipped, setG1Unzipped] = useState(false);
  const [g1_mutated, setG1Mutated] = useState(false);

  // ── GAME 2 STATES ──
  const BP_TARGET = ['T', 'A', 'C', 'G']; 
  const [g2_answers, setG2Answers] = useState([]); 
  const [g2_won, setG2Won] = useState(false);
  const flashAnimG2 = useRef(new Animated.Value(0)).current;

  // ── GAME 3 STATES ──
  const G3_GENES = ['AA', 'Aa', 'aa'];
  const [g3_mom, setG3Mom] = useState(0); // AA
  const [g3_dad, setG3Dad] = useState(1); // Aa
  const [g3_won, setG3Won] = useState(false);

  // ── GAME 4 STATES ──
  const G4_BLOODS = ['A', 'B', 'AB', 'O'];
  const [g4_mom, setG4Mom] = useState(0); // A
  const [g4_dad, setG4Dad] = useState(1); // B

  // ── GAME 5 STATES ──
  const T_STRING = "ATCG...AAA...GTAC...TAG...XXX...CTGA...GAT...CCA...XXX...AAT..";
  const [g5_offset, setG5Offset] = useState(0);
  const [g5_won, setG5Won] = useState(false);
  const flashAnimG5 = useRef(new Animated.Value(0)).current;

  // ── GAME 1 HANDLERS ──
  const toggleG1Unzip = () => { soundWhoosh(); Haptics.impactAsync(); setG1Unzipped(!g1_unzipped); };
  const toggleG1Mutate = () => { soundTap(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setG1Mutated(!g1_mutated); };

  // ── GAME 2 HANDLERS ──
  const handleG2Tap = (l) => {
    if (g2_won) return;
    const idx = g2_answers.length;
    if (l === BP_TARGET[idx]) {
      soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextArr = [...g2_answers, l];
      setG2Answers(nextArr);
      if (nextArr.length === 4) {
        soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setG2Won(true);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(flashAnimG2, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(flashAnimG2, { toValue: 0, duration: 300, useNativeDriver: false })
      ]).start();
    }
  };
  const resetG2 = () => { soundWhoosh(); setG2Answers([]); setG2Won(false); };

  // ── GAME 3 HANDLERS ──
  const getRecessiveProb = (mIdx, dIdx) => {
    const m1 = G3_GENES[mIdx][0], m2 = G3_GENES[mIdx][1];
    const f1 = G3_GENES[dIdx][0], f2 = G3_GENES[dIdx][1];
    const mix = [m1+f1, m1+f2, m2+f1, m2+f2];
    let rec = 0;
    mix.forEach(c => { if(c === 'aa') rec++; });
    return (rec/4)*100;
  };
  const handleG3Mom = () => { soundTap(); Haptics.selectionAsync(); const next=(g3_mom+1)%3; setG3Mom(next); checkG3(next, g3_dad); };
  const handleG3Dad = () => { soundTap(); Haptics.selectionAsync(); const next=(g3_dad+1)%3; setG3Dad(next); checkG3(g3_mom, next); };
  const checkG3 = (m, d) => {
    if (getRecessiveProb(m, d) === 100 && !g3_won) {
      setTimeout(() => { soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setG3Won(true); }, 300);
    }
  };

  // ── GAME 4 HANDLERS ──
  const handleG4Mom = () => { soundTap(); Haptics.selectionAsync(); setG4Mom((g4_mom+1)%4); };
  const handleG4Dad = () => { soundTap(); Haptics.selectionAsync(); setG4Dad((g4_dad+1)%4); };
  const getG4Out = () => {
    const m = G4_BLOODS[g4_mom], d = G4_BLOODS[g4_dad];
    if (m === 'O' && d === 'O') return 'Type O';
    if ((m === 'A' && d === 'B') || (m === 'B' && d === 'A')) return 'Type AB';
    if (m === 'AB' || d === 'AB') return 'Type AB';
    if (m === 'A' || d === 'A') return 'Type A';
    if (m === 'B' || d === 'B') return 'Type B';
    return 'Type O';
  };

  // ── GAME 5 HANDLERS ──
  useEffect(() => {
    const interval = setInterval(() => { if(!g5_won) setG5Offset(prev => (prev + 1) % T_STRING.length); }, 150);
    return () => clearInterval(interval);
  }, [g5_won]);

  const handleG5Snip = () => {
    if (g5_won) return;
    const centerChar = T_STRING[(g5_offset + 5) % T_STRING.length];
    if (centerChar === 'X') {
      soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setG5Won(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(flashAnimG5, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(flashAnimG5, { toValue: 0, duration: 300, useNativeDriver: false })
      ]).start();
    }
  };

  // Reusable Instruction Component
  const InstructionCard = ({ gameNum, title, text }) => (
    <View style={[s.instCard, { backgroundColor: isDark ? '#1C2733' : '#E6F0FA', borderColor: '#3B82F650' }]}>
      <View style={s.instHeader}>
        <Icon name="help" size={16} color="#3B82F6" />
        <Text style={[s.instTitle, { color: '#3B82F6' }]}>GAME {gameNum}: {title}</Text>
      </View>
      <Text style={[s.instText, { color: txt1 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: (isDark ? '#0A0A0F' : '#FFFFFF') }]}>
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 1: THE RADIATION CHAMBER                             */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="The Radiation Chamber" 
          text="DNA is a twisted ladder. Tap 'UNZIP' to see how the Helicase enzyme separates the ladder for copying. Tap 'RADIATE' to see how UV radiation breaks the bonds and severely speeds up toxic mutation spin!" />

        <View style={s.g1Canvas}>
           <Canvas gl={{ alpha: true }}>
              <DNAHelix3D isUnzipped={g1_unzipped} isMutated={g1_mutated} isDark={isDark} />
           </Canvas>
        </View>

        <View style={s.g1Controls}>
           <TouchableOpacity onPress={toggleG1Unzip} style={[s.hugeBtn, { backgroundColor: g1_unzipped ? '#00D4A0' : glass2, flex: 1 }]}>
             <Icon name="swap" size={20} color={g1_unzipped ? '#FFF' : txt1} />
             <Text style={[s.hugeBtnTxt, { color: g1_unzipped ? '#FFF' : txt1 }]}>{g1_unzipped ? "RE-ZIP" : "UNZIP"}</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={toggleG1Mutate} style={[s.hugeBtn, { backgroundColor: g1_mutated ? '#FF4444' : glass2, flex: 1 }]}>
             <Icon name="radiation" size={20} color={g1_mutated ? '#FFF' : txt1} />
             <Text style={[s.hugeBtnTxt, { color: g1_mutated ? '#FFF' : txt1 }]}>{g1_mutated ? "CURE" : "RADIATE!"}</Text>
           </TouchableOpacity>
        </View>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 2: THE BASE PAIR HACKER                              */}
      {/* ───────────────────────────────────────────────────────── */}
      <Animated.View style={[s.gameBox, { borderColor: border, backgroundColor: flashAnimG2.interpolate({ inputRange: [0,1], outputRange: [glass1, 'rgba(255,0,0,0.2)'] }) }]}>
        <InstructionCard gameNum={2} title="Base-Pair Hacker" 
          text="DNA uses exactly 4 letters. Rule: 'A' always pairs with 'T'. 'C' always pairs with 'G'. Look at the TOP row (A-T-G-C). Tap the correct buttons below to spell the complementary BOTTOM row! Watch out, wrong taps buzz!" />
        
        {g2_won && (
          <View style={[s.wonBanner, { backgroundColor: '#00D4A020' }]}>
             <Icon name="checkmark" size={20} color="#00D4A0" />
             <Text style={[s.wonTxt, { color: '#00D4A0' }]}>SEQUENCE COMPLETE!</Text>
          </View>
        )}

        <View style={s.g2Board}>
           {/* Top Sequence */}
           <View style={{ flexDirection: 'row', gap: 12 }}>
             {['A','T','G','C'].map((l, i) => (
                <View key={i} style={[s.ntBox, { backgroundColor: '#3B82F630', borderColor: '#3B82F6' }]}><Text style={s.ntTxt}>{l}</Text></View>
             ))}
           </View>
           <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
             {[0,1,2,3].map(i => <View key={i} style={{ width: 44, height: 16, borderLeftWidth: 2, borderRightWidth: 2, borderColor: 'rgba(150,150,150,0.3)' }}/>)}
           </View>
           {/* Bottom Sequence (Answers) */}
           <View style={{ flexDirection: 'row', gap: 12 }}>
             {[0,1,2,3].map(i => (
                <View key={i} style={[s.ntBox, { backgroundColor: g2_answers[i] ? '#00D4A030' : glass2, borderColor: g2_answers[i] ? '#00D4A0' : border }]}>
                   <Text style={s.ntTxt}>{g2_answers[i] || '?'}</Text>
                </View>
             ))}
           </View>
        </View>

        {!g2_won ? (
          <View style={s.g2Keypad}>
             {['A','T','C','G'].map(l => (
               <TouchableOpacity key={l} onPress={() => handleG2Tap(l)} style={[s.g2Btn, { backgroundColor: glass2, borderColor: border }]}>
                 <Text style={[s.g2BtnTxt, { color: txt1 }]}>{l}</Text>
               </TouchableOpacity>
             ))}
          </View>
        ) : (
          <TouchableOpacity onPress={resetG2} style={[s.g2BtnBig, { backgroundColor: glass2, borderColor: border }]}>
             <Text style={[s.g2BtnTxt, { color: txt1 }]}>RESET GAME</Text>
          </TouchableOpacity>
        )}
      </Animated.View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 3: THE PUNNETT BREEDER                               */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: glass1 }]}>
        <InstructionCard gameNum={3} title="The Punnett Breeder" 
          text="Capital (A) is Dominant. Lowercase (a) is Recessive. Because 'A' overpowers 'a', getting a purely recessive child is hard. PUZZLE: Tap the Mom and Dad genes until the Recessive (aa) child probability bar hits exactly 100%!" />

        {g3_won && (
          <View style={[s.wonBanner, { backgroundColor: '#FF9F1C20' }]}>
             <Icon name="star" size={20} color="#FF9F1C" />
             <Text style={[s.wonTxt, { color: '#FF9F1C' }]}>PUZZLE SOLVED: 100% RECESSIVE!</Text>
          </View>
        )}

        <View style={s.g3ParentRow}>
           <TouchableOpacity onPress={handleG3Mom} style={[s.g3ParentBtn, { backgroundColor: '#FF007F15', borderColor: '#FF007F' }]}>
             <Text style={[s.g3ParentLbl, { color: '#FF007F' }]}>MOM</Text>
             <Text style={[s.g3ParentVal, { color: txt1 }]}>{G3_GENES[g3_mom]}</Text>
           </TouchableOpacity>
           <Icon name="close" size={20} color={txtM} />
           <TouchableOpacity onPress={handleG3Dad} style={[s.g3ParentBtn, { backgroundColor: '#3B82F615', borderColor: '#3B82F6' }]}>
             <Text style={[s.g3ParentLbl, { color: '#3B82F6' }]}>DAD</Text>
             <Text style={[s.g3ParentVal, { color: txt1 }]}>{G3_GENES[g3_dad]}</Text>
           </TouchableOpacity>
        </View>

        <View style={s.g3ProbBox}>
           <Text style={[s.g3ProbLbl, { color: txt1 }]}>Chance of Recessive Child (aa):</Text>
           <Text style={[s.g3ProbHuge, { color: getRecessiveProb(g3_mom, g3_dad) === 100 ? '#FF9F1C' : txt1 }]}>
             {getRecessiveProb(g3_mom, g3_dad)}%
           </Text>
           <View style={[s.g3BarBg, { backgroundColor: glass2 }]}>
              <View style={[s.g3BarFill, { width: `${getRecessiveProb(g3_mom, g3_dad)}%`, backgroundColor: '#FF9F1C' }]} />
           </View>
        </View>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 4: THE BLOOD MIXER LAB                               */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: glass1 }]}>
        <InstructionCard gameNum={4} title="The Blood Mixer Lab" 
          text="Blood doesn't follow normal rules. Types A and B are Co-Dominant, meaning if you mix them, they BOTH show up! Tap Mom and Dad to see what happens when you mix their blood types." />

        <View style={s.g3ParentRow}>
           <TouchableOpacity onPress={handleG4Mom} style={[s.g3ParentBtn, { backgroundColor: '#FF444415', borderColor: '#FF4444' }]}>
             <Text style={[s.g3ParentLbl, { color: '#FF4444' }]}>MOM</Text>
             <Text style={[s.g3ParentVal, { color: txt1, fontSize: 18 }]}>{G4_BLOODS[g4_mom]}</Text>
           </TouchableOpacity>
           <Icon name="add" size={20} color={txtM} />
           <TouchableOpacity onPress={handleG4Dad} style={[s.g4ParentBtn, { backgroundColor: '#FF444415', borderColor: '#FF4444' }]}>
             <Text style={[s.g3ParentLbl, { color: '#FF4444' }]}>DAD</Text>
             <Text style={[s.g3ParentVal, { color: txt1, fontSize: 18 }]}>{G4_BLOODS[g4_dad]}</Text>
           </TouchableOpacity>
        </View>

        <View style={[s.g4OutBox, { borderColor: border }]}>
           <Text style={[s.g3ProbLbl, { color: txt2 }]}>Child's Final Blood Type</Text>
           <Text style={[s.g4OutHuge, { color: '#FF4444' }]}>{getG4Out()}</Text>
        </View>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 5: CRISPR SEQUENCE SNIPER                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <Animated.View style={[s.gameBox, { borderColor: border, backgroundColor: flashAnimG5.interpolate({ inputRange: [0,1], outputRange: [glass1, 'rgba(255,0,0,0.2)'] }), marginBottom: 40 }]}>
        <InstructionCard gameNum={5} title="CRISPR Sequence Sniper" 
          text="A massive genetic error 'XXX' is scrolling through the code! Wait until 'XXX' enters the white brackets EXACTLY, then tap SNIP to execute the CRISPR cut and heal the cell!" />

        {!g5_won && (
          <View style={s.g5TickerOut}>
             <View style={[s.g5Focal, { borderColor: txt1 }]} />
             <Text style={[s.g5Tape, { color: txt1 }]}>
               {T_STRING.substring(g5_offset, g5_offset + 11).padEnd(11, ' ')}
             </Text>
          </View>
        )}

        {g5_won ? (
          <View style={[s.wonBanner, { backgroundColor: '#00D4A020', marginVertical: 20 }]}>
             <Icon name="shield" size={40} color="#00D4A0" />
             <Text style={[s.wonTxt, { color: '#00D4A0', fontSize: 18, marginTop: 10 }]}>MUTATION SURGICALLY REMOVED</Text>
             <Text style={[s.instText, { color: '#00D4A0' }]}>Cell is 100% Healthy</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleG5Snip} style={[s.g5SnipBtn, { backgroundColor: '#FF007F' }]}>
            <Icon name="cut" size={24} color="#FFF" />
            <Text style={[s.hugeBtnTxt, { color: '#FFF' }]}>SNIP TARGET NOW</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════

const s = StyleSheet.create({
  root: { flex: 1, padding: SPACING.md, gap: SPACING.lg },
  
  // Game Box Container
  gameBox: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 16, overflow: 'hidden' },

  // Instruction Card Look
  instCard: { borderWidth: 1, borderRadius: RADIUS.md, padding: 16, marginBottom: 20 },
  instHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  instTitle: { fontFamily: FONTS.displayHeavy, fontSize: 14, letterSpacing: 1 },
  instText: { fontFamily: FONTS.bodyMedium, fontSize: 12, lineHeight: 18 },

  // G1: 3D Chamber
  g1Canvas: { height: 250, width: '100%', marginBottom: 16 },
  g1Controls: { flexDirection: 'row', gap: 10 },
  hugeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: RADIUS.md },
  hugeBtnTxt: { fontFamily: FONTS.displayHeavy, fontSize: 14, letterSpacing: 1 },

  // Shared Win Banner
  wonBanner: { padding: 16, borderRadius: RADIUS.md, alignItems: 'center', marginBottom: 16 },
  wonTxt: { fontFamily: FONTS.displayHeavy, fontSize: 14, letterSpacing: 1, marginTop: 4 },

  // G2: Base Pair Hacker
  g2Board: { paddingVertical: 20, alignItems: 'center' },
  ntBox: { width: 44, height: 44, borderRadius: RADIUS.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  ntTxt: { fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  g2Keypad: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  g2Btn: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  g2BtnTxt: { fontFamily: FONTS.displayHeavy, fontSize: 20 },
  g2BtnBig: { paddingVertical: 16, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', marginHorizontal: 20 },

  // G3: Punnett
  g3ParentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 },
  g3ParentBtn: { width: 100, paddingVertical: 16, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  g3ParentLbl: { fontFamily: FONTS.bodyMedium, fontSize: 12, marginBottom: 4 },
  g3ParentVal: { fontFamily: 'monospace', fontSize: 28, fontWeight: 'bold' },
  g3ProbBox: { alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: RADIUS.md },
  g3ProbLbl: { fontFamily: FONTS.bodyMedium, fontSize: 13, marginBottom: 4 },
  g3ProbHuge: { fontFamily: FONTS.displayHeavy, fontSize: 36, marginVertical: 8 },
  g3BarBg: { width: '100%', height: 12, borderRadius: 6, overflow: 'hidden' },
  g3BarFill: { height: '100%' },

  // G4: Blood
  g4ParentBtn: { width: 100, paddingVertical: 16, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  g4OutBox: { alignItems: 'center', padding: 24, backgroundColor: '#FF444410', borderRadius: RADIUS.md, borderWidth: 1 },
  g4OutHuge: { fontFamily: FONTS.displayHeavy, fontSize: 40, marginTop: 8 },

  // G5: CRISPR
  g5TickerOut: { height: 80, backgroundColor: '#000', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 20 },
  g5Focal: { position: 'absolute', width: 90, height: 60, borderWidth: 4, borderRadius: 8, zIndex: 10 },
  g5Tape: { fontFamily: 'monospace', fontSize: 36, letterSpacing: 8, color: '#00D4A0', fontWeight: 'bold' },
  g5SnipBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderRadius: RADIUS.md },
});
