// ─────────────────────────────────────────────────────────────
//  LAB: How the Internet Works — 4 Interactive Games
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, TextInput, PanResponder
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';
import Svg, { Line, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ══════════════════════════════════════════════════════════
//  GAMES
// ══════════════════════════════════════════════════════════

// GAME 1: PACKET ROUTING HACKER
function PacketRouterGame({ txt1 }) {
  const [cableCut, setCableCut] = useState(false);
  const [packetPos, setPacketPos] = useState({ x: 40, y: 150 });
  const [run, setRun] = useState(false);
  
  const cutAnim = useRef(new Animated.Value(0)).current;

  // Nodes: Client(40,150) -> R1(120,40) -> R2(220,150) -> Server(300,100)
  // Alt path: Client(40,150) -> R3(150,220) -> R2(220,150)
  const routePaths = {
    normal: [{x:40,y:150}, {x:120,y:40}, {x:220,y:150}, {x:310,y:100}],
    reroute: [{x:40,y:150}, {x:150,y:220}, {x:220,y:150}, {x:310,y:100}]
  };

  const simulate = () => {
    soundWhoosh();
    setRun(true);
    let step = 0;
    const path = cableCut ? routePaths.reroute : routePaths.normal;
    
    const interval = setInterval(() => {
      step++;
      if (step < path.length) {
        setPacketPos(path[step]);
        Haptics.impactAsync();
      } else {
        clearInterval(interval);
        soundBadge();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => { setPacketPos(path[0]); setRun(false); }, 1000);
      }
    }, 400);
  };

  const cutCable = () => {
    soundTap(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCableCut(true);
  };
  const fixCable = () => {
    soundTap(); setCableCut(false);
  };

  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ width: '100%', height: 260, backgroundColor: '#0A1220', borderRadius: RADIUS.md, position: 'relative', overflow: 'hidden' }}>
          
          <Svg width="100%" height="260">
             {/* Fast Primary Cable (Client -> R1 -> R2 -> Server) */}
             <Line x1="40" y1="150" x2="120" y2="40" stroke={cableCut ? '#FF4444' : '#00D4A0'} strokeWidth="6" strokeDasharray={cableCut ? "10,10" : ""} />
             <Line x1="120" y1="40" x2="220" y2="150" stroke={cableCut ? '#FF4444' : '#00D4A0'} strokeWidth="6" strokeDasharray={cableCut ? "10,10" : ""} />
             
             {/* Slow Alt Cable (Client -> R3 -> R2) */}
             <Line x1="40" y1="150" x2="150" y2="220" stroke="#3B82F6" strokeWidth="4" />
             <Line x1="150" y1="220" x2="220" y2="150" stroke="#3B82F6" strokeWidth="4" />
             
             {/* Final leg (R2 -> Server) */}
             <Line x1="220" y1="150" x2="310" y2="100" stroke="#00D4A0" strokeWidth="6" />

             {/* Nodes */}
             <Circle cx="40" cy="150" r="16" fill="#FFF" />
             <Circle cx="120" cy="40" r="14" fill="#666" />
             <Circle cx="150" cy="220" r="14" fill="#666" />
             <Circle cx="220" cy="150" r="14" fill="#666" />
             <Circle cx="310" cy="100" r="20" fill="#FF9F1C" />
             
             {/* Moving Packet (Only render when running) */}
             {run && <Circle cx={packetPos.x} cy={packetPos.y} r="8" fill="#FF007F" />}
          </Svg>

          <Text style={{ position: 'absolute', top: 120, left: 10, color: '#FFF', fontSize: 10 }}>CLIENT</Text>
          <Text style={{ position: 'absolute', top: 70, left: 290, color: '#FF9F1C', fontSize: 10 }}>SERVER</Text>
          {cableCut && <Text style={{ position: 'absolute', top: 20, left: 60, fontSize: 30 }}>✂️</Text>}
       </View>

       <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity onPress={simulate} disabled={run} style={[s.btn, { flex: 1, backgroundColor: run ? '#444' : '#00D4A0' }]}><Text style={{ color: '#000', fontWeight: 'bold' }}>SEND PACKETS</Text></TouchableOpacity>
          <TouchableOpacity onPress={cableCut ? fixCable : cutCable} style={[s.btn, { flex: 1, backgroundColor: cableCut ? '#3B82F6' : '#FF4444' }]}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>{cableCut ? 'FIX CABLE' : 'CUT MAIN FIBER'}</Text></TouchableOpacity>
       </View>
       <Text style={{ color: txt1, marginTop: 10, textAlign: 'center', fontSize: 13 }}>
          {cableCut ? 'TCP/IP detects the outage and dynamically re-routes traffic through the slower southern network!' : 'Packets are flowing optimally over the high-speed northern line.'}
       </Text>
    </View>
  );
}


// GAME 2: SUBMARINE CABLE EXPLORER
function SubmarineMap({ txt1, isDark }) {
  // Simplified SVG world map interaction
  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ width: '100%', height: 200, backgroundColor: isDark ? '#001A20' : '#E0F7FA', borderRadius: RADIUS.md, justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center', fontSize: 80, opacity: 0.3 }}>🗺️</Text>
          <Svg width="100%" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
             <Path d="M 50 100 Q 150 150 250 80" stroke="#FF007F" strokeWidth="3" fill="none" />
             <Path d="M 60 120 Q 180 180 300 130" stroke="#00E5FF" strokeWidth="2" fill="none" />
             <Path d="M 250 80 Q 280 50 320 60" stroke="#FF9F1C" strokeWidth="3" fill="none" />
             <Circle cx="150" cy="120" r="4" fill="#FFF" opacity="0.5" />
             <Circle cx="200" cy="140" r="3" fill="#FFF" opacity="0.5" />
          </Svg>
          <Text style={{ position: 'absolute', top: 80, left: 20, color: txt1, fontSize: 10, fontWeight: 'bold' }}>NEW YORK</Text>
          <Text style={{ position: 'absolute', top: 60, left: 230, color: txt1, fontSize: 10, fontWeight: 'bold' }}>LONDON</Text>
          <Text style={{ position: 'absolute', top: 130, left: 290, color: txt1, fontSize: 10, fontWeight: 'bold' }}>TOKYO</Text>
       </View>
       <Text style={{ color: txt1, marginTop: 10, textAlign: 'center', fontSize: 13 }}>
          Over 500 massive armored fiber-optic cables lie on the bottom of the ocean floor right now, wrapped in steel and shark-proof kevlar!
       </Text>
    </View>
  );
}


// GAME 3: DNS LOOKUP
function DnsSimulator({ txt1, glass2 }) {
  const [url, setUrl] = useState('youtube.com');
  const [step, setStep] = useState(0); // 0: Wait, 1: Browser, 2: DNS, 3: IP
  const [ipStr, setIpStr] = useState('');

  const executeDns = () => {
    soundTap(); Haptics.selectionAsync();
    setStep(1);
    setTimeout(() => { soundWhoosh(); setStep(2); }, 800);
    setTimeout(() => { 
      soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
      // Generate fake IP based on length
      setIpStr(`142.250.${url.length * 10}.${(url.length * 7) % 255}`);
    }, 1800);
  };

  const resetDns = () => { setStep(0); };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
         <TextInput 
           style={{ flex: 1, backgroundColor: glass2, color: txt1, padding: 16, borderRadius: RADIUS.md, fontFamily: 'monospace', fontSize: 16 }}
           value={url}
           onChangeText={setUrl}
           autoCapitalize="none"
         />
         <TouchableOpacity onPress={executeDns} style={[s.btn, { backgroundColor: '#3B82F6' }]}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>GO</Text></TouchableOpacity>
      </View>

      <View style={{ height: 160, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: RADIUS.md, padding: 16, gap: 10 }}>
         {step >= 1 && <Text style={{ color: txt1, fontFamily: FONTS.bodyMedium }}>💻 Browser: "Hey DNS, what is the IP number for <Text style={{color:'#3B82F6'}}>{url}</Text>?"</Text>}
         {step >= 2 && <Text style={{ color: txt1, fontFamily: FONTS.bodyMedium }}>📖 DNS Phonebook: "Let me check the .com server records..."</Text>}
         {step >= 3 && (
            <View style={{ marginTop: 10, padding: 16, backgroundColor: '#00D4A020', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#00D4A0' }}>
               <Text style={{ color: '#00D4A0', fontFamily: FONTS.displayHeavy }}>CONNECTION SUCCESS!</Text>
               <Text style={{ color: txt1, fontFamily: 'monospace', fontSize: 20 }}>IP: {ipStr}</Text>
            </View>
         )}
      </View>
      {step === 3 && <TouchableOpacity onPress={resetDns} style={{ marginTop: 10, alignSelf:'center' }}><Text style={{ color: '#3B82F6' }}>Clear DNS Cache</Text></TouchableOpacity>}
    </View>
  );
}


// GAME 4: ENCRYPTION
function EncryptionGame({ txt1 }) {
  const [scrambled, setScrambled] = useState(true);
  const realText = "CREDIT CARD 4400-XXXX";
  const fakeText = "XJ9@!L$P^MZQK8#B*VWCY";

  const toggleEncrypt = () => {
    soundTap(); Haptics.impactAsync();
    setScrambled(!scrambled);
  };

  return (
    <View style={{ alignItems: 'center' }}>
       <View style={{ width: '100%', padding: 24, backgroundColor: '#11151A', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', minHeight: 120, borderWidth: 2, borderColor: scrambled ? '#A855F7' : '#00E5FF' }}>
          {scrambled && <Icon name="lock" size={32} color="#A855F7" style={{ marginBottom: 10 }} />}
          {!scrambled && <Icon name="unlock" size={32} color="#00E5FF" style={{ marginBottom: 10 }} />}
          
          <Text style={{ fontFamily: 'monospace', fontSize: 22, color: scrambled ? '#A855F7' : '#00E5FF', fontWeight: 'bold', textAlign: 'center' }}>
             {scrambled ? fakeText : realText}
          </Text>
       </View>

       <TouchableOpacity onPress={toggleEncrypt} style={[s.hugeBtn, { backgroundColor: scrambled ? '#552277' : '#007788', width: '100%', marginTop: 16 }]}>
          <Text style={{ color: '#FFF', fontFamily: FONTS.displayHeavy }}>{scrambled ? 'APPLY PRIVATE KEY (DECRYPT)' : 'SCRAMBLE DATA (ENCRYPT)'}</Text>
       </TouchableOpacity>
       
       <Text style={{ color: txt1, marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          {scrambled ? 'If a hacker intercepts your Wi-Fi, this gibberish is all they see. It takes a supercomputer millions of years to guess the math formula.' : 'When the Amazon Server receives it, it applies its secret Private Key to instantly unscramble the message!'}
       </Text>
    </View>
  );
}


// ══════════════════════════════════════════════════════════
//  MAIN LAYOUT
// ══════════════════════════════════════════════════════════
export default function InternetMiniGamesLab() {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary, border = theme.glass.border, glass2 = theme.glass.medium;

  const InstructionCard = ({ gameNum, title, text, color }) => (
    <View style={[s.instCard, { backgroundColor: isDark ? '#1C2733' : '#E6F0FA', borderColor: color+'50' }]}>
      <View style={s.instHeader}>
         <Icon name="help" size={16} color={color} />
         <Text style={[s.instTitle, { color: color }]}>TERMINAL {gameNum}: {title}</Text>
      </View>
      <Text style={[s.instText, { color: txt1 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      
      {/* GAME 1 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={1} title="The Packet Routing Hacker" color="#00D4A0" text="Hit 'Send Packets' to trace the fastest route. But what if a Shark bites the main fiber optic line? Hit 'Cut Main Fiber' to test the internet's decentralized self-healing TCP/IP algorithm!" />
        <PacketRouterGame txt1={txt1} />
      </View>

      {/* GAME 2 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={2} title="Submarine Cable Explorer" color="#3B82F6" text="99% of global internet relies on physical, armored glass wires lying at the absolute bottom of the freezing ocean." />
        <SubmarineMap txt1={txt1} isDark={isDark} />
      </View>

      {/* GAME 3 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA' }]}>
        <InstructionCard gameNum={3} title="DNS Directory Simulator" color="#D4A74A" text="Computers don't know what 'youtube.com' is. They only understand numbers. Type a URL and watch the DNS Phonebook translate it into a raw IP address." />
        <DnsSimulator txt1={txt1} glass2={glass2} />
      </View>

      {/* GAME 4 */}
      <View style={[s.gameBox, { borderColor: border, backgroundColor: isDark ? '#0F1218' : '#F5F7FA', marginBottom: 40 }]}>
        <InstructionCard gameNum={4} title="HTTPS Encryption Sandbox" color="#A855F7" text="Sending unencrypted credit card data is like writing it on a postcard. HTTPS scrambles the card using insane math so that only the destination server can read it!" />
        <EncryptionGame txt1={txt1} />
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
  btn: { padding: 16, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  hugeBtn: { paddingVertical: 18, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
});
