// ─────────────────────────────────────────────────────────────
//  LAB: Evolution & Natural Selection — 4 Interactive Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ══════════════════════════════════════════════════════════
//  GAME 1: GALAPAGOS SIMULATOR (Beak Sizes)
// ══════════════════════════════════════════════════════════
function GalapagosSim({ isDark, txt1, glass2 }) {
  const [rainfall, setRainfall] = useState(50); // 0 (Dry, Hard nuts) to 100 (Wet, soft seeds)
  const [avgBeak, setAvgBeak] = useState(50); // 0 (Small) to 100 (Massive)
  const [generation, setGeneration] = useState(1);

  const simulateGen = () => {
    soundTap(); Haptics.impactAsync();
    setGeneration(g => g + 1);
    
    // Logic: Beak size naturally drifts towards the optimal size for the rainfall
    // High rainfall (100) -> small beaks (0)
    // Low rainfall (0) -> large beaks (100)
    const optimalBeak = 100 - rainfall;
    
    // Move average beak 30% closer to optimal per generation
    setAvgBeak(prev => {
      const diff = optimalBeak - prev;
      return Math.min(100, Math.max(0, prev + diff * 0.3));
    });
  };

  const getFoodText = () => rainfall > 70 ? "Abundant Soft Seeds" : rainfall < 30 ? "Only Hard Rock-Nuts" : "Mixed Seeds & Nuts";
  const beakScale = 0.5 + (avgBeak / 100);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
         <Text style={{ color: txt1, fontFamily: FONTS.bodyMedium }}>Env: {getFoodText()}</Text>
         <Text style={{ color: '#4CA050', fontFamily: FONTS.displayHeavy }}>Gen: {generation}</Text>
      </View>

      <View style={{ height: 140, backgroundColor: isDark ? '#11151A' : '#EAF4E8', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
         <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: `rgba(0,100,255,${rainfall/300})` }} />
         
         <Svg width="120" height="120" viewBox="0 0 100 100">
           <Circle cx="40" cy="50" r="25" fill={isDark ? '#444' : '#888'} />
           <Circle cx="70" cy="40" r="15" fill={isDark ? '#444' : '#888'} />
           <Circle cx="75" cy="35" r="2" fill="#FFF" />
           <Path d="M85,40 L100,45 L85,50 Z" fill="#D4A74A" transform={`scale(${beakScale}) translate(${((1-beakScale)*100)-10}, 0)`} />
         </Svg>
      </View>

      <View style={{ marginTop: 16 }}>
         <Text style={{ color: txt1, fontFamily: FONTS.displayHeavy, fontSize: 12 }}>ADJUST RAINFALL: {rainfall}%</Text>
         <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity onPress={()=>{setRainfall(Math.max(0, rainfall-20)); Haptics.selectionAsync()}} style={[s.hugeBtn, { flex: 1, backgroundColor: glass2 }]}><Text style={{ color: txt1 }}>Drier</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>{setRainfall(Math.min(100, rainfall+20)); Haptics.selectionAsync()}} style={[s.hugeBtn, { flex: 1, backgroundColor: glass2 }]}><Text style={{ color: txt1 }}>Wetter</Text></TouchableOpacity>
         </View>
      </View>
      <TouchableOpacity onPress={simulateGen} style={[s.hugeBtn, { backgroundColor: '#4CA050', marginTop: 12 }]}>
         <Icon name="timer" size={18} color="#FFF" />
         <Text style={{ color: '#FFF', fontFamily: FONTS.displayHeavy }}>SIMULATE GENERATION</Text>
      </TouchableOpacity>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  GAME 2: PEPPERED MOTH CAMOUFLAGE
// ══════════════════════════════════════════════════════════
function MothGame({ txt1, glass2 }) {
  const [pollution, setPollution] = useState(0); // 0 or 1
  const [moths, setMoths] = useState([ {id:1, c:'W'}, {id:2, c:'B'}, {id:3, c:'W'}, {id:4, c:'W'}, {id:5, c:'B'} ]);

  const bgCol = pollution === 1 ? '#222' : '#CCC'; // Tree trunk color

  const eatMoth = (id) => {
    soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoths(moths.filter(m => m.id !== id));
  };

  const reproduce = () => {
    soundWhoosh(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // double whatever is left
    let newId = 100;
    const babies = moths.map(m => ({ id: newId++, c: m.c }));
    setMoths([...moths, ...babies].slice(0, 10)); // Max 10
  };

  const togglePollution = () => {
    soundTap(); Haptics.selectionAsync();
    setPollution(p => p === 0 ? 1 : 0);
  };

  const resetP = () => { setMoths([ {id:1, c:'W'}, {id:2, c:'B'}, {id:3, c:'W'}, {id:4, c:'W'}, {id:5, c:'B'} ]) };

  return (
    <View>
      <TouchableOpacity onPress={togglePollution} style={[s.hugeBtn, { backgroundColor: pollution === 1 ? '#444' : '#E0E0E0', marginBottom: 12 }]}>
         <Text style={{ color: pollution === 1 ? '#FFF' : '#000', fontFamily: FONTS.displayHeavy }}>{pollution === 1 ? "POLLUTED TREE (Soot)" : "CLEAN TREE (Lichen)"}</Text>
      </TouchableOpacity>

      <View style={{ height: 160, backgroundColor: bgCol, borderRadius: RADIUS.md, flexWrap: 'wrap', flexDirection: 'row', padding: 10, gap: 10 }}>
         {moths.length === 0 && <Text style={{ color: pollution===1?'#FFF':'#000' }}>Extinction!</Text>}
         {moths.map(m => {
            const isWhite = m.c === 'W';
            const mothColor = isWhite ? '#FFFFFF' : '#111111';
            const borderCol = isWhite ? '#DDDDDD' : '#000000';
            return (
              <TouchableOpacity key={m.id} onPress={()=>eatMoth(m.id)} style={{ width: 40, height: 30, backgroundColor: mothColor, borderColor: borderCol, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                 <Text style={{ fontSize: 10 }}>🦋</Text>
              </TouchableOpacity>
            )
         })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
         <TouchableOpacity onPress={resetP} style={[s.hugeBtn, { flex: 1, backgroundColor: glass2 }]}><Text style={{ color: txt1 }}>RESET</Text></TouchableOpacity>
         <TouchableOpacity onPress={reproduce} disabled={moths.length===0} style={[s.hugeBtn, { flex: 2, backgroundColor: '#3B82F6' }]}>
            <Text style={{ color: '#FFF', fontFamily: FONTS.displayHeavy }}>SURVIVORS REPRODUCE</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  GAME 3: ANTIBIOTIC RESISTANCE
// ══════════════════════════════════════════════════════════
function BacteriaGame({ txt1, glass2 }) {
  // 0: Normal, 1: Resistant
  const [grid, setGrid] = useState(Array(25).fill(0).map((_, i) => i === 12 ? 1 : 0)); // 1 mutant in center
  
  const applyAntibiotic = () => {
    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setGrid(prev => prev.map(cell => cell === 1 ? 1 : (Math.random() > 0.9 ? 0 : null))); // 90% chance to die if 0
  };

  const reproduce = () => {
    soundTap(); Haptics.selectionAsync();
    setGrid(prev => prev.map(cell => {
       if (cell === null) {
          // Empty slot, 50% chance to be filled by a resistant strain if there is one
          const hasResistant = prev.includes(1);
          return hasResistant && Math.random() > 0.5 ? 1 : 0;
       }
       return cell;
    }));
  };

  return (
    <View>
      <View style={{ height: 180, backgroundColor: '#1A0D05', borderRadius: 100, padding: 20, alignSelf:'center', width: 180, flexWrap: 'wrap', flexDirection: 'row', gap: 2, justifyContent: 'center', alignContent: 'center' }}>
         {grid.map((c, i) => (
            <View key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c === null ? 'transparent' : c === 1 ? '#FF007F' : '#00E5FF', opacity: c === null ? 0 : 0.8 }} />
         ))}
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginVertical: 12 }}>
         <Text style={{ color: '#00E5FF', fontFamily: FONTS.displayHeavy }}>{grid.filter(c=>c===0).length} NORMAL</Text>
         <Text style={{ color: '#FF007F', fontFamily: FONTS.displayHeavy }}>{grid.filter(c=>c===1).length} MUTANT</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
         <TouchableOpacity onPress={applyAntibiotic} style={[s.hugeBtn, { flex: 1, backgroundColor: '#FF4444' }]}><Text style={{ color: '#FFF', fontFamily: FONTS.displayHeavy }}>APPLY ANTIBIOTIC</Text></TouchableOpacity>
         <TouchableOpacity onPress={reproduce} style={[s.hugeBtn, { flex: 1, backgroundColor: glass2 }]}><Text style={{ color: txt1, fontFamily: FONTS.displayHeavy }}>MULTIPLY</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  GAME 4: PHYLOGENETIC TREE
// ══════════════════════════════════════════════════════════
function AncestorTree({ txt1, isDark }) {
  const [sel, setSel] = useState(0); // 0: None, 1: Common, 2: Chimp, 3: Human

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width="300" height="150" viewBox="0 0 300 150">
        <Line x1="150" y1="130" x2="150" y2="90" stroke={isDark ? '#555' : '#CCC'} strokeWidth="4" />
        <Line x1="150" y1="90" x2="70" y2="40" stroke={isDark ? '#555' : '#CCC'} strokeWidth="4" />
        <Line x1="150" y1="90" x2="230" y2="40" stroke={isDark ? '#555' : '#CCC'} strokeWidth="4" />
        <Circle cx="150" cy="130" r="16" fill={sel === 1 ? '#D4A74A' : (isDark ? '#333' : '#EEE')} onPress={()=>{setSel(1); soundTap()}} />
        <Circle cx="70" cy="40" r="24" fill={sel === 2 ? '#3B82F6' : (isDark ? '#333' : '#EEE')} onPress={()=>{setSel(2); soundTap()}} />
        <Circle cx="230" cy="40" r="24" fill={sel === 3 ? '#4CA050' : (isDark ? '#333' : '#EEE')} onPress={()=>{setSel(3); soundTap()}} />
      </Svg>

      <View style={{ position: 'absolute', top: 30, left: Dimensions.get('window').width/2 - 100 }}><Text style={{ fontSize: 24 }} pointerEvents="none">🐒</Text></View>
      <View style={{ position: 'absolute', top: 30, left: Dimensions.get('window').width/2 + 20 }}><Text style={{ fontSize: 24 }} pointerEvents="none">🧑🏽</Text></View>
      <View style={{ position: 'absolute', top: 120, left: Dimensions.get('window').width/2 - 40 }}><Text style={{ fontSize: 16 }} pointerEvents="none">🦠</Text></View>

      <View style={{ height: 60, marginTop: 10, justifyContent: 'center' }}>
         <Text style={{ color: txt1, fontFamily: FONTS.displayHeavy, textAlign: 'center' }}>
            {sel === 0 ? "Tap the nodes on the tree" : 
             sel === 1 ? "Common Ancestor (Lived 6-8 Million Years Ago)" :
             sel === 2 ? "Chimpanzee (Our closest living relative)" :
             "Homo Sapiens (Humans)"}
         </Text>
         <Text style={{ color: txt1, fontFamily: FONTS.bodyMedium, textAlign: 'center', opacity: 0.8, marginTop: 4 }}>
            {sel === 0 ? "" : 
             sel === 1 ? "We did NOT evolve from chimps. We both split from THIS guy." :
             sel === 2 ? "Shares 98.8% of DNA with humans." :
             "Bipedal, extremely large brains."}
         </Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN LAYOUT
// ══════════════════════════════════════════════════════════
export default function EvolutionMiniGamesLab() {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

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
    <View style={[s.root, { backgroundColor: (isDark ? '#0A0A0F' : '#FFFFFF') }]}>
      
      {/* GAME 1 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="The Galapagos Simulator" color="#4CA050" text="Adjust the rainfall. If it's very dry, only hard nuts grow! Press 'Simulate' and watch how the Bird Population is literally forced to mutate a massive, crushing beak to survive!" />
        <GalapagosSim isDark={isDark} txt1={txt1} glass2={glass2} />
      </View>

      {/* GAME 2 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={2} title="Peppered Moth Camouflage" color="#3B82F6" text="During the Industrial Revolution, trees turned black from coal soot. Tap the Moths to ACT AS THE PREDATOR. Who do you eat? Hit 'Reproduce' to see who survives to pass on their genes!" />
        <MothGame txt1={txt1} glass2={glass2} />
      </View>

      {/* GAME 3 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={3} title="Antibiotic Resistance" color="#FF007F" text="You have an infection. You take Antibiotics (RED BUTTON). It kills 90% of bacteria. BUT, what if 1 mutant (pink) survives? Hit MULTIPLY and see why overuse of medicine creates 'Superbugs'!" />
        <BacteriaGame txt1={txt1} glass2={glass2} />
      </View>

      {/* GAME 4 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA', marginBottom: 40 }]}>
        <InstructionCard gameNum={4} title="Phylogenetic Tree" color="#D4A74A" text="People say 'If humans evolved from monkeys, why are there still monkeys?' Tap the nodes to learn the truth: We didn't evolve FROM them, we are cousins!" />
        <AncestorTree txt1={txt1} isDark={isDark} />
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
  hugeBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});
