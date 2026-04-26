import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, TextInput, ScrollView } from 'react-native';
import Svg, { Circle, G, Path, Line, Text as SvgText, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const CHALLENGES = [
  { id: 'cipher_sync', title: 'The Enigma Code', desc: 'Encrypt a message of at least 10 characters', icon: 'lock', color: '#FFD166' },
  { id: 'brute_force', title: 'Hacker Spirit', desc: 'Launch a Brute Force attack on the current rotors', icon: 'zap', color: '#FF3131' },
  { id: 'ascii_master', title: 'Hexadecimal Vision', desc: 'View raw ASCII bytes in Scientist Mode', icon: 'terminal', color: '#A855F7' },
  { id: 'reset_rotors', title: 'Zero State', desc: 'Reset all rotors to position 0', icon: 'refresh', color: '#00E5FF' },
];

export default function CryptographyLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [inputChar, setInputChar] = useState('');
  const [cipherText, setCipherText] = useState('');
  const [rotors, setRotors] = useState([0, 0, 0]);
  const [bruteActive, setBruteActive] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  const challengePopAnim = useRef(new Animated.Value(0)).current;

  const encryptChar = (char, pos) => {
    const code = char.charCodeAt(0);
    // Simple shifting algorithm for simulation
    const shifted = String.fromCharCode(((code - 32 + pos) % 94) + 32);
    return shifted;
  };

  const handleInput = (char) => {
    if (!char) return;
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Rotate rotors
    setRotors(prev => {
      const next = [...prev];
      next[0] = (next[0] + 1) % 26;
      if (next[0] === 0) next[1] = (next[1] + 1) % 26;
      if (next[1] === 0 && next[0] === 0) next[2] = (next[2] + 1) % 26;
      return next;
    });

    const encrypted = encryptChar(char, rotors[0] + rotors[1] + rotors[2]);
    setCipherText(prev => (prev + encrypted).slice(-15));
    setInputChar('');

    if (cipherText.length > 8) triggerChallenge('cipher_sync');
  };

  const runBruteForce = () => {
    if (bruteActive) return;
    soundWhoosh();
    setBruteActive(true);
    let count = 0;
    const interval = setInterval(() => {
      setRotors([Math.floor(Math.random()*26), Math.floor(Math.random()*26), Math.floor(Math.random()*26)]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setBruteActive(false);
        triggerChallenge('brute_force');
      }
    }, 80);
  };

  const triggerChallenge = useCallback((cid) => {
    if (completedChallenges.includes(cid)) return;
    const ch = CHALLENGES.find(c => c.id === cid);
    setLastChallengeMsg(ch);
    soundBadge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    challengePopAnim.setValue(0);
    Animated.sequence([
      Animated.spring(challengePopAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(challengePopAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLastChallengeMsg(null));
    setCompleted(prev => [...prev, cid]);
  }, [completedChallenges]);

  return (
    <View style={styles.container}>
      {lastChallengeMsg && (
        <Animated.View style={[styles.challengePopup, {
          opacity: challengePopAnim, backgroundColor: lastChallengeMsg.color + '20', borderColor: lastChallengeMsg.color + '60',
          transform: [{ translateY: challengePopAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <Icon name="trophy" size={18} color={lastChallengeMsg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengePopTitle, { color: lastChallengeMsg.color }]}>Challenge Complete!</Text>
            <Text style={[styles.challengePopDesc, { color: txt2 }]}>{lastChallengeMsg.title}</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Security HUD ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <Icon name="shield" size={24} color="#FFD166" />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>ENCRYPTION DEPTH</Text>
               <Text style={[styles.sValue, { color: '#FFD166' }]}>256-BIT SYMBOLIC</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={[styles.sLabel, { color: txtM }]}>ENTROPY</Text>
               <Text style={[styles.sValue, { color: '#00E5FF' }]}>{(rotors.reduce((a,b)=>a+b,0)/78 * 100).toFixed(0)}%</Text>
            </View>
         </View>
      </View>

      {/* ── Mechanical Machine Viz ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <SvgGradient id="rotorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
               <Stop offset="0%" stopColor="#334444" />
               <Stop offset="50%" stopColor="#667777" />
               <Stop offset="100%" stopColor="#334444" />
             </SvgGradient>
           </Defs>
           
           {/* Mechanical Rotors */}
           {[0, 1, 2].map(i => (
             <G key={i} transform={`translate(${60 + i * 80}, 60)`}>
                <Rect x="0" y="0" width="60" height="150" rx="10" fill="url(#rotorGrad)" stroke="#0002" />
                <Line x1="0" y1="75" x2="60" y2="75" stroke="#FFF4" strokeWidth="2" />
                {[...Array(5)].map((_, j) => {
                  const val = (rotors[i] + j - 2 + 26) % 26;
                  return (
                    <SvgText key={j} x="30" y={35 + j * 30} fontSize="14" fill={j === 2 ? '#FFD166' : '#888'} textAnchor="middle" fontWeight={j === 2 ? 'bold' : 'normal'} fontFamily="monospace">
                      {String.fromCharCode(65 + val)}
                    </SvgText>
                  );
                })}
             </G>
           ))}

           {/* Cipher Stream */}
           <G transform={`translate(20, 240)`}>
              <Rect x="0" y="0" width={SIM_W - 40} height={60} rx="12" fill={isDark ? '#000' : '#FFF'} stroke="#A855F760" />
              <SvgText x="15" y="35" fontSize="16" fill="#A855F7" fontWeight="bold" fontFamily="monospace">
                {"> " + (cipherText || "AWAITING INPUT...")}
              </SvgText>
           </G>
        </Svg>
      </View>

      {/* ── Terminal Input ── */}
      <View style={styles.inputArea}>
         <TextInput 
            style={[styles.input, { color: txt1, backgroundColor: glass2, borderColor: border }]}
            placeholder="TYPE HERE TO SCRAMBLE..."
            placeholderTextColor={txtM}
            value={inputChar}
            onChangeText={t => handleInput(t.slice(-1))}
            autoCapitalize="characters"
         />
         <TouchableOpacity onPress={runBruteForce} style={[styles.hackerBtn, { backgroundColor: bruteActive ? '#FF3131' : '#1F2937' }]}>
            <Icon name="terminal" size={18} color={bruteActive ? '#FFF' : '#FF3131'} />
            <Text style={[styles.hackerBtnText, { color: bruteActive ? '#FFF' : '#FF3131' }]}>{bruteActive ? 'CRACKING...' : 'BRUTE FORCE'}</Text>
         </TouchableOpacity>
      </View>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="star" size={14} color="#A855F7" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Byte Matrix 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>INPUT ASCII</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>0x41 (A)</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>POSITIONS</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>{rotors.join(':')}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>XOR MASK</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>1011001</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>KEYSPACE</Text>
                 <Text style={[styles.statValue, { color: '#10B981' }]}>17,576</Text>
              </View>
           </View>
           <View style={{ marginTop: 12 }}>
              <Text style={[styles.sciNoteText, { color: txtM, textAlign: 'center' }]}>
                {"Equation: Cᵢ = (Pᵢ + Kᵢ) mod 26"}
              </Text>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Cipher Missions ({completedChallenges.length}/4)</Text>
        </View>
        {CHALLENGES.map(c => {
          const done = completedChallenges.includes(c.id);
          return (
            <View key={c.id} style={styles.challengeItem}>
              <View style={[styles.cIcon, { backgroundColor: done ? c.color + '20' : '#334444' }]}>
                <Icon name={done ? 'check' : c.icon} size={14} color={done ? c.color : txtM} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cTitle, { color: done ? c.color : txt1, textDecorationLine: done ? 'line-through' : 'none' }]}>{c.title}</Text>
                <Text style={[styles.cDesc, { color: txtM }]}>{c.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md },
  statusCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  sValue: { fontFamily: FONTS.displayMedium, fontSize: 15, marginTop: 2 },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden' },
  inputArea: { marginTop: 16, gap: 12 },
  input: { height: 50, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, fontFamily: 'monospace', fontSize: 14 },
  hackerBtn: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: RADIUS.md },
  hackerBtnText: { fontFamily: FONTS.displayMedium, fontSize: 13, letterSpacing: 1 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  sciNoteText: { fontFamily: 'monospace', fontSize: 11 },
  challengeCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  challengeCardTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  challengeItem: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  cIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  cDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  challengePopup: { position: 'absolute', top: 20, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 100 },
  challengePopTitle: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  challengePopDesc: { fontFamily: FONTS.body, fontSize: 11, marginTop: 1 },
});
