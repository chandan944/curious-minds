// ─────────────────────────────────────────────────────────────
//  LAB: Atoms & Molecules — 4 Interactive Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView, PanResponder
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import { Canvas, useFrame } from '@react-three/fiber';

// ══════════════════════════════════════════════════════════
//  3D COMPONENTS FOR GAME 1 & 2
// ══════════════════════════════════════════════════════════

function Nucleus3D({ protons, neutrons }) {
  const groupRef = useRef();
  
  // Calculate stability: roughly N/P ratio. Stable roughly 1.0 to 1.5.
  // For this simple logic: if neutrons much less than protons, or much more, it's unstable.
  const isUnstable = (protons > 0 && (neutrons < protons - 1 || neutrons > protons + 2));

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x += delta * 0.3;
      if (isUnstable) {
        groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 30) * 0.05;
        groupRef.current.position.y = Math.cos(state.clock.elapsedTime * 35) * 0.05;
      } else {
        groupRef.current.position.set(0,0,0);
      }
    }
  });

  // Generate particle positions randomly within a sphere
  const particles = useMemo(() => {
    const pts = [];
    let id = 0;
    const addParticle = (type) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 1/3) * (0.3 + (protons+neutrons)*0.02); // Grow radius slightly
      pts.push({
        id: id++, type,
        pos: [ r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi) ]
      });
    };
    for(let i=0; i<protons; i++) addParticle('proton');
    for(let i=0; i<neutrons; i++) addParticle('neutron');
    return pts;
  }, [protons, neutrons]);

  return (
    <group ref={groupRef} scale={[2.5, 2.5, 2.5]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 10, 5]} intensity={2} color="#FFFFFF" />
      {isUnstable && <pointLight position={[0, 0, 0]} intensity={5} color="#FF0000" distance={5} />}

      {particles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={p.type === 'proton' ? '#FF4444' : '#3B82F6'} 
            roughness={0.2} metalness={0.8}
            emissive={isUnstable && p.type === 'neutron' ? '#440000' : '#000'}
          />
        </mesh>
      ))}
    </group>
  );
}

function ElectronShells3D({ electrons }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
      groupRef.current.rotation.z += delta * 0.2;
    }
  });

  // Shell 1 (max 2), Shell 2 (max 8)
  const shell1Count = Math.min(electrons, 2);
  const shell2Count = Math.max(0, Math.min(electrons - 2, 8));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      
      {/* Center Nucleus representation */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FF007F" emissive="#FF007F" emissiveIntensity={0.5} />
      </mesh>

      {/* SHELL 1 RING */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00D4A0" transparent opacity={0.3} />
      </mesh>
      {/* Shell 1 Electrons */}
      {Array.from({length: shell1Count}).map((_, i) => {
         const angle = (i / 2) * Math.PI * 2;
         return (
           <mesh key={`s1_${i}`} position={[Math.cos(angle)*1.5, Math.sin(angle)*1.5, 0]}>
             <sphereGeometry args={[0.15, 16, 16]} />
             <meshStandardMaterial color="#00D4A0" emissive="#00D4A0" emissiveIntensity={0.8} />
           </mesh>
         )
      })}

      {/* SHELL 2 RING */}
      {(electrons > 2) && (
        <group>
          <mesh rotation={[Math.PI/4, Math.PI/4, 0]}>
            <torusGeometry args={[3.0, 0.02, 16, 100]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} />
          </mesh>
          {/* Shell 2 Electrons */}
          {Array.from({length: shell2Count}).map((_, i) => {
             const angle = (i / shell2Count) * Math.PI * 2;
             // Rotate to match the torus
             const x = Math.cos(angle)*3.0; const y = Math.sin(angle)*3.0; // on flat plane
             // Approximate tilted positions for visual flair
             return (
               <mesh key={`s2_${i}`} position={[x, y, 0]} rotation={[Math.PI/4, Math.PI/4, 0]}>
                 <sphereGeometry args={[0.15, 16, 16]} />
                 <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} />
               </mesh>
             )
          })}
        </group>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function AtomsMiniGamesLab() {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary, txt2 = theme.text.secondary, txtM = theme.text.muted;
  const glass1 = theme.glass.light, glass2 = theme.glass.medium, border = theme.glass.border;

  // ── GAME 1 STATES (Nucleus Builder) ──
  const [protons, setProtons] = useState(1);
  const [neutrons, setNeutrons] = useState(0);

  // Helper to identify element
  const getElementName = (p) => {
    const table = ['None', 'Hydrogen (H)', 'Helium (He)', 'Lithium (Li)', 'Beryllium (Be)', 'Boron (B)', 'Carbon (C)'];
    return table[p] || 'Unknown';
  };
  const isG1Unstable = (protons > 0 && (neutrons < protons - 1 || neutrons > protons + 2));

  // ── GAME 2 STATES (Quantum Shells) ──
  const [electrons, setElectrons] = useState(1);
  const maxRules = electrons > 2 && electrons <= 10;
  
  // ── GAME 3 STATES (Molecule Combiner) ──
  // Just a logical sequence. State tracking if pieces are snapped.
  const [molStep, setMolStep] = useState(0); // 0: None, 1: H1, 2: H2 (H2O formed)

  // ── GAME 4: Scale Grid ──
  const [scaleLvl, setScaleLvl] = useState(1); // 1 to 5

  // ── HANDLERS ──
  const addProton = () => { if(protons < 6) { soundTap(); Haptics.selectionAsync(); setProtons(p=>p+1); } };
  const subProton = () => { if(protons > 1) { soundTap(); Haptics.selectionAsync(); setProtons(p=>p-1); } };
  const addNeutron = () => { if(neutrons < 8) { soundTap(); Haptics.selectionAsync(); setNeutrons(n=>n+1); } };
  const subNeutron = () => { if(neutrons > 0) { soundTap(); Haptics.selectionAsync(); setNeutrons(n=>n-1); } };

  React.useEffect(() => {
    if (isG1Unstable) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [protons, neutrons, isG1Unstable]);

  const addElectron = () => { if(electrons < 10) { soundTap(); Haptics.selectionAsync(); setElectrons(e=>e+1); } };
  const subElectron = () => { if(electrons > 1) { soundTap(); Haptics.selectionAsync(); setElectrons(e=>e-1); } };

  const handleMolTap = () => {
    if(molStep < 2) {
      soundBadge(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setMolStep(s => s + 1);
    }
  };
  const resetMol = () => { soundWhoosh(); setMolStep(0); };

  const incScale = () => { if(scaleLvl < 5) setScaleLvl(s=>s+1); Haptics.selectionAsync(); soundTap(); };
  const decScale = () => { if(scaleLvl > 1) setScaleLvl(s=>s-1); Haptics.selectionAsync(); soundTap(); };

  // Helper
  const InstructionCard = ({ gameNum, title, text }) => (
    <View style={[s.instCard, { backgroundColor: isDark ? '#1C2733' : '#E6F0FA', borderColor: '#3B82F650' }]}>
      <View style={s.instHeader}>
        <Icon name="help" size={16} color="#00E5FF" />
        <Text style={[s.instTitle, { color: '#00E5FF' }]}>GAME {gameNum}: {title}</Text>
      </View>
      <Text style={[s.instText, { color: txt1 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 1: THE NUCLEUS BUILDER                               */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="The 3D Nucleus Builder" 
          text="The number of Protons (Red) decides the Element. Neutrons (Blue) act as nuclear glue. WARNING: If you add too many or too few Neutrons, the atom becomes a wildly unstable radioactive Isotope!" />

        <View style={s.canvasContainer}>
           <Canvas gl={{ alpha: true }}>
              <Nucleus3D protons={protons} neutrons={neutrons} />
           </Canvas>
        </View>

        <View style={[s.elementBadge, { backgroundColor: isG1Unstable ? '#FF444420' : '#00D4A020', borderColor: isG1Unstable ? '#FF4444' : '#00D4A0' }]}>
           <Icon name={isG1Unstable ? "radiation" : "shield"} size={20} color={isG1Unstable ? '#FF4444' : '#00D4A0'} />
           <Text style={[s.elemTxt, { color: isG1Unstable ? '#FF4444' : '#00D4A0' }]}>
             {getElementName(protons)} {isG1Unstable ? '(UNSTABLE ISOTOPE)' : '(Stable)'}
           </Text>
        </View>

        <View style={s.controlsRow}>
           <View style={s.ctrlCol}>
             <Text style={[s.ctrlLbl, { color: '#FF4444' }]}>Protons (+)</Text>
             <View style={s.incBox}>
                <TouchableOpacity onPress={subProton} style={[s.incBtn, { backgroundColor: glass2 }]}><Text style={[s.incTxt, { color: txt1 }]}>-</Text></TouchableOpacity>
                <Text style={[s.incVal, { color: txt1 }]}>{protons}</Text>
                <TouchableOpacity onPress={addProton} style={[s.incBtn, { backgroundColor: glass2 }]}><Text style={[s.incTxt, { color: txt1 }]}>+</Text></TouchableOpacity>
             </View>
           </View>
           <View style={s.ctrlCol}>
             <Text style={[s.ctrlLbl, { color: '#3B82F6' }]}>Neutrons (0)</Text>
             <View style={s.incBox}>
                <TouchableOpacity onPress={subNeutron} style={[s.incBtn, { backgroundColor: glass2 }]}><Text style={[s.incTxt, { color: txt1 }]}>-</Text></TouchableOpacity>
                <Text style={[s.incVal, { color: txt1 }]}>{neutrons}</Text>
                <TouchableOpacity onPress={addNeutron} style={[s.incBtn, { backgroundColor: glass2 }]}><Text style={[s.incTxt, { color: txt1 }]}>+</Text></TouchableOpacity>
             </View>
           </View>
        </View>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 2: QUANTUM SHELLS                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={2} title="Quantum Electron Shells" 
          text="Electrons (-) orbit the nucleus in strict 'Shells'. Shell 1 can only hold EXACTLY 2 electrons. Once full, they MUST jump to Shell 2 (which holds 8). Tap to add electrons and watch quantum mechanics in action." />

        <View style={[s.canvasContainer, { height: 280 }]}>
           <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 8] }}>
              <ElectronShells3D electrons={electrons} />
           </Canvas>
        </View>

        <View style={s.centeredRow}>
           <TouchableOpacity onPress={subElectron} style={[s.hugeBtn, { backgroundColor: glass2 }]}><Text style={[s.hugeBtnTxt, { color: txt1 }]}>- REMOVE e⁻</Text></TouchableOpacity>
           <Text style={[s.countBadge, { color: txt1, borderColor: border, backgroundColor: glass1 }]}>{electrons}</Text>
           <TouchableOpacity onPress={addElectron} style={[s.hugeBtn, { backgroundColor: glass2 }]}><Text style={[s.hugeBtnTxt, { color: txt1 }]}>+ ADD e⁻</Text></TouchableOpacity>
        </View>
        
        <Text style={[s.hintTxt, { color: txtM, marginTop: 16, textAlign: 'center' }]}>
          Shell 1 filling: {Math.min(electrons, 2)}/2  |  Shell 2 filling: {Math.max(0, electrons-2)}/8
        </Text>
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 3: THE MOLECULE COMBINER                             */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: glass1 }]}>
        <InstructionCard gameNum={3} title="The Molecule Combiner" 
          text="Hydrogen (H) is violently explosive gas. Oxygen (O) is fire-fueling air. But tap the 'BOND' button to snap 2 Hydrogen atoms to 1 Oxygen atom... and you create liquid Water (H₂O)!" />

        <View style={s.molStage}>
           {/* Center Oxygen */}
           <View style={[s.atomSphere, { width: 80, height: 80, backgroundColor: '#FF4444', borderColor: '#CC0000', zIndex: 2 }]}>
             <Text style={s.atomTxt}>O</Text>
           </View>

           {/* Left Hydrogen (Snaps in space) */}
           <View style={[s.atomSphere, { width: 50, height: 50, backgroundColor: '#E0E0E0', borderColor: '#AAAAAA', position: 'absolute', 
              top: molStep >= 1 ? 70 : 20, 
              left: molStep >= 1 ? 60 : 10,
              opacity: 1 }]}><Text style={[s.atomTxt, { color: '#000' }]}>H</Text></View>

           {/* Right Hydrogen */}
           <View style={[s.atomSphere, { width: 50, height: 50, backgroundColor: '#E0E0E0', borderColor: '#AAAAAA', position: 'absolute', 
              top: molStep >= 2 ? 70 : 20, 
              right: molStep >= 2 ? 60 : 10,
              opacity: molStep >= 1 ? 1 : 0.2 }]}><Text style={[s.atomTxt, { color: '#000' }]}>H</Text></View>
        </View>

        {molStep < 2 ? (
          <TouchableOpacity onPress={handleMolTap} style={[s.actionBtnBig, { backgroundColor: '#3B82F6' }]}>
            <Icon name="link" size={24} color="#FFF" />
            <Text style={[s.actionBtnTxt, { color: '#FFF' }]}>BOND HYDROGEN</Text>
          </TouchableOpacity>
        ) : (
          <View style={[s.wonBanner, { backgroundColor: '#00E5FF20', borderWidth: 1, borderColor: '#00E5FF' }]}>
             <Text style={[s.wonTxt, { color: '#00E5FF' }]}>H₂O (WATER) SYNTHESIZED! 💧</Text>
             <TouchableOpacity onPress={resetMol} style={{ marginTop: 10, padding: 8, backgroundColor: 'rgba(0,229,255,0.2)', borderRadius: 8 }}>
                <Text style={{ color: '#00E5FF', fontWeight: 'bold' }}>SPLIT MOLECULE</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>


      {/* ───────────────────────────────────────────────────────── */}
      {/* GAME 4: THE SCALE OF THE UNIVERSE                         */}
      {/* ───────────────────────────────────────────────────────── */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#1C2733' : '#E6F0FA', marginBottom: 40 }]}>
        <InstructionCard gameNum={4} title="Scale of the Micro-Universe" 
          text="Use the magnifying glass buttons to continually zoom in, step-by-step, from the size of a human finger down to the terrifying emptiness of a Quark." />

        <View style={s.scaleWindow}>
           {scaleLvl === 1 && <Text style={s.scaleEmoji}>🖐️</Text>}
           {scaleLvl === 2 && <Text style={s.scaleEmoji}>🩸</Text>}
           {scaleLvl === 3 && <Text style={s.scaleEmoji}>🧬</Text>}
           {scaleLvl === 4 && <Text style={s.scaleEmoji}>⚛️</Text>}
           {scaleLvl === 5 && <Text style={s.scaleEmoji}>🌌</Text>}
        </View>
        <Text style={[s.scaleTitle, { color: txt1 }]}>
           {scaleLvl === 1 && "Human Finger (1 Meter)"}
           {scaleLvl === 2 && "Red Blood Cell (Micro-Meter)"}
           {scaleLvl === 3 && "DNA Strand (Nano-Meter)"}
           {scaleLvl === 4 && "Carbon Atom (Pico-Meter)"}
           {scaleLvl === 5 && "Empty Space & Quarks (Femto-Meter)"}
        </Text>

        <View style={s.scaleNav}>
           <TouchableOpacity onPress={decScale} disabled={scaleLvl===1} style={[s.navBtn, { opacity: scaleLvl===1?0.3:1, backgroundColor: glass2 }]}><Icon name="arrow-back" size={24} color={txt1}/></TouchableOpacity>
           <Text style={[s.navLbl, { color: txt1 }]}>Magnification Level {scaleLvl}/5</Text>
           <TouchableOpacity onPress={incScale} disabled={scaleLvl===5} style={[s.navBtn, { opacity: scaleLvl===5?0.3:1, backgroundColor: glass2 }]}><Icon name="search" size={24} color={txt1}/></TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════

const s = StyleSheet.create({
  root: { flex: 1, padding: SPACING.md, gap: SPACING.lg },
  
  gameBox: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 16, overflow: 'hidden' },

  instCard: { borderWidth: 1, borderRadius: RADIUS.md, padding: 16, marginBottom: 20 },
  instHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  instTitle: { fontFamily: FONTS.displayHeavy, fontSize: 13, letterSpacing: 1 },
  instText: { fontFamily: FONTS.bodyMedium, fontSize: 13, lineHeight: 18 },

  canvasContainer: { height: 220, width: '100%', marginBottom: 16 },
  
  // Game 1 Elements
  elementBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 20 },
  elemTxt: { fontFamily: FONTS.displayHeavy, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  ctrlCol: { flex: 1, alignItems: 'center' },
  ctrlLbl: { fontFamily: FONTS.displayHeavy, fontSize: 14, marginBottom: 8 },
  incBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  incTxt: { fontSize: 24, fontWeight: 'bold' },
  incVal: { fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },

  // Game 2 Elements
  centeredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  hugeBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: RADIUS.md },
  hugeBtnTxt: { fontFamily: FONTS.displayHeavy, fontSize: 14 },
  countBadge: { fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', padding: 10, borderWidth: 1, borderRadius: RADIUS.sm, minWidth: 60, textAlign: 'center' },

  // Game 3 Elements
  molStage: { height: 180, width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  atomSphere: { borderRadius: 100, borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset:{width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 4 },
  atomTxt: { fontFamily: FONTS.displayHeavy, fontSize: 24, color: '#FFF' },
  actionBtnBig: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: RADIUS.md },
  actionBtnTxt: { fontFamily: FONTS.displayHeavy, fontSize: 16, letterSpacing: 1 },
  wonBanner: { padding: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  wonTxt: { fontFamily: FONTS.displayHeavy, fontSize: 16 },

  // Game 4 Elements
  scaleWindow: { height: 160, backgroundColor: '#000', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  scaleEmoji: { fontSize: 80 },
  scaleTitle: { fontFamily: FONTS.displayHeavy, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  scaleNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  navLbl: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
});
