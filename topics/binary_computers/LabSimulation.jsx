// ─────────────────────────────────────────────────────────────
//  LAB: Binary & Computers — 4 Interactive Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, TextInput
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import Svg, { Line } from 'react-native-svg';

// ══════════════════════════════════════════════════════════
//  GAMES
// ══════════════════════════════════════════════════════════

// GAME 1: 8-BIT DECODER
function EightBitGame({ txt1, isDark }) {
  const [bits, setBits] = useState([0,0,0,0,0,0,0,0]);
  const vals = [128, 64, 32, 16, 8, 4, 2, 1];
  
  const total = bits.reduce((acc, curr, idx) => acc + (curr ? vals[idx] : 0), 0);
  const target = 170; // 10101010

  const toggleBit = (i) => {
    soundTap(); Haptics.selectionAsync();
    const next = [...bits];
    next[i] = next[i] === 0 ? 1 : 0;
    setBits(next);
    if(next.reduce((acc, curr, idx) => acc + (curr ? vals[idx] : 0), 0) === target) {
      setTimeout(()=> { soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, 300);
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ marginBottom: 20 }}>
          <Text style={{ color: txt1, fontFamily: FONTS.displayHeavy }}>TARGET DECIMAL: <Text style={{ color: '#FF007F' }}>{target}</Text></Text>
          <Text style={{ color: txt1, fontFamily: FONTS.displayHeavy }}>CURRENT: <Text style={{ color: total===target? '#00D4A0':'#FF9F1C' }}>{total}</Text></Text>
       </View>
       
       <View style={{ flexDirection: 'row', gap: 6 }}>
         {bits.map((b, i) => (
           <View key={i} style={{ alignItems: 'center' }}>
             <Text style={{ color: txt1, fontSize: 10, marginBottom: 8 }}>{vals[i]}</Text>
             <TouchableOpacity onPress={()=>toggleBit(i)} style={{ width: 34, height: 60, backgroundColor: b ? '#FF007F' : (isDark ? '#222' : '#DDD'), borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: b ? '#FFF' : '#888', fontFamily: 'monospace', fontWeight: 'bold' }}>{b}</Text>
             </TouchableOpacity>
           </View>
         ))}
       </View>

       {total === target && (
         <View style={[s.wonBanner, { backgroundColor: '#FF007F20', marginTop: 20 }]}>
            <Text style={{ color: '#FF007F', fontFamily: FONTS.displayHeavy }}>DECODED!</Text>
         </View>
       )}
    </View>
  );
}


// GAME 2: LOGIC GATES
function LogicGatesGame({ txt1 }) {
  const [inA, setInA] = useState(0);
  const [inB, setInB] = useState(0);
  const [gate, setGate] = useState('AND'); // AND, OR, XOR

  // Calculate out
  let out = 0;
  if (gate === 'AND') out = (inA && inB) ? 1 : 0;
  else if (gate === 'OR') out = (inA || inB) ? 1 : 0;
  else if (gate === 'XOR') out = (inA !== inB) ? 1 : 0;

  const toggleA = () => { soundTap(); Haptics.selectionAsync(); setInA(a => a===0?1:0); };
  const toggleB = () => { soundTap(); Haptics.selectionAsync(); setInB(b => b===0?1:0); };
  const cycleGate = () => { soundWhoosh(); Haptics.impactAsync(); setGate(g => g==='AND'?'OR':g==='OR'?'XOR':'AND'); };

  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ flexDirection: 'row', alignItems: 'center', height: 180, width: '100%', maxWidth: 300 }}>
          
          {/* Inputs */}
          <View style={{ flex: 1, justifyContent: 'space-around', height: '100%' }}>
             <TouchableOpacity onPress={toggleA} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: inA ? '#00D4A0' : '#444', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>{inA}</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={toggleB} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: inB ? '#00D4A0' : '#444', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>{inB}</Text>
             </TouchableOpacity>
          </View>

          <View style={{ position: 'absolute', left: 50, top: 0, width: 200, height: 180, zIndex: -1 }}>
             <Svg width="200" height="180">
                <Line x1="0" y1="45" x2="80" y2="45" stroke={inA ? '#00D4A0' : '#444'} strokeWidth="6" />
                <Line x1="0" y1="135" x2="80" y2="135" stroke={inB ? '#00D4A0' : '#444'} strokeWidth="6" />
                <Line x1="160" y1="90" x2="200" y2="90" stroke={out ? '#00E5FF' : '#444'} strokeWidth="6" />
             </Svg>
          </View>
          
          {/* Gate */}
          <View style={{ width: 80, height: 100, backgroundColor: '#3B82F6', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#00E5FF' }}>
             <TouchableOpacity onPress={cycleGate}>
                <Text style={{ color: '#FFF', fontFamily: FONTS.displayHeavy, fontSize: 18 }}>{gate}</Text>
                <Text style={{ color: '#FFF', fontSize: 10, textAlign: 'center', marginTop: 4 }}>TAP TO{'\n'}CHANGE</Text>
             </TouchableOpacity>
          </View>

          {/* Output */}
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
             <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: out ? '#00E5FF' : '#444', alignItems: 'center', justifyContent: 'center', shadowColor: '#00E5FF', shadowOpacity: out?0.8:0, shadowRadius: 10 }}>
                <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold' }}>{out}</Text>
             </View>
          </View>

       </View>
       <Text style={{ color: txt1, marginTop: 10 }}>Toggle the red inputs. Can you light up the blue output?</Text>
    </View>
  );
}


// GAME 3: HALF ADDER
function HalfAdderGame({ txt1 }) {
  const [inA, setInA] = useState(0);
  const [inB, setInB] = useState(0);

  // Math logic for half adder
  const sum = (inA !== inB) ? 1 : 0; // XOR
  const carry = (inA && inB) ? 1 : 0; // AND

  const toggleA = () => { soundTap(); Haptics.selectionAsync(); setInA(a => a===0?1:0); };
  const toggleB = () => { soundTap(); Haptics.selectionAsync(); setInB(b => b===0?1:0); };

  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
          <TouchableOpacity onPress={toggleA} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: inA ? '#FF007F' : '#444', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>{inA}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 30, color: txt1, alignSelf: 'center' }}>+</Text>
          <TouchableOpacity onPress={toggleB} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: inB ? '#FF007F' : '#444', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>{inB}</Text>
          </TouchableOpacity>
       </View>
       
       <Text style={{ color: txt1, fontFamily: FONTS.displayHeavy, fontSize: 24 }}>= {carry}{sum}</Text>
       <Text style={{ color: txt1, fontFamily: FONTS.bodyMedium, fontSize: 12, marginTop: 10, textAlign: 'center' }}>
         By combining gates, the computer just did math!{'\n'}1+1 in Binary is 10 (which equals 2 in Decimal).
       </Text>
    </View>
  );
}


// GAME 4: ASCII PULSE
function AsciiGame({ txt1, glass2 }) {
  const [text, setText] = useState('HI');
  
  // Create binary string representation
  const binaryString = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('  ');

  return (
    <View>
      <TextInput 
        style={{ backgroundColor: glass2, color: txt1, padding: 16, borderRadius: RADIUS.md, fontFamily: FONTS.displayHeavy, fontSize: 20, textAlign: 'center', marginBottom: 20 }}
        maxLength={3}
        value={text}
        onChangeText={(t) => { setText(t.toUpperCase()); Haptics.selectionAsync(); }}
      />
      
      <View style={{ backgroundColor: '#050505', padding: 20, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#00D4A0' }}>
         <Text style={{ color: '#00D4A0', fontFamily: 'monospace', fontSize: 18, textAlign: 'center', letterSpacing: 2 }}>
           {binaryString || '00000000'}
         </Text>
      </View>
      
      <Text style={{ color: txt1, textAlign: 'center', marginTop: 16, fontSize: 12 }}>
         The CPU turns those exact 1s and 0s into pulses of electricity crossing the motherboard wire to correctly draw your word on the screen!
      </Text>
    </View>
  );
}


// ══════════════════════════════════════════════════════════
//  MAIN LAYOUT
// ══════════════════════════════════════════════════════════
export default function BinaryMiniGamesLab() {
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
         <Text style={[s.instTitle, { color: color }]}>MODULE {gameNum}: {title}</Text>
      </View>
      <Text style={[s.instText, { color: txt1 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: (isDark ? '#0A0A0F' : '#FFFFFF') }]}>
      
      {/* GAME 1 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="8-Bit Lightbulb Decoder" color="#FF007F" text="You have an 8-bit Byte register. Each bit represents a number (1, 2, 4, 8...). Toggle the bits ON (1) to add up exactly to the target Decimal 170!" />
        <EightBitGame txt1={txt1} isDark={isDark} />
      </View>

      {/* GAME 2 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={2} title="Logic Gate Wiring" color="#00E5FF" text="Toggle the green inputs to send electricity down the wires. Tap the Gate to change its rules (AND / OR). Wire it correctly to power up the blue output!" />
        <LogicGatesGame txt1={txt1} />
      </View>

      {/* GAME 3 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={3} title="The Half-Adder CPU Core" color="#FF9F1C" text="A CPU doesn't know math. It just pushes electricity. Toggle the inputs to literally add 1+1. Watch the combined gates calculate the binary jump to '10'!" />
        <HalfAdderGame txt1={txt1} />
      </View>

      {/* GAME 4 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA', marginBottom: 40 }]}>
        <InstructionCard gameNum={4} title="ASCII Translator" color="#00D4A0" text="Type a new 3-letter word into the box and see exactly what electrical pulses the CPU fires to the screen using the ASCII alphabet decoder ring." />
        <AsciiGame txt1={txt1} glass2={glass2} />
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
  wonBanner: { padding: 16, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 2, borderColor: '#FF007F' },
});
