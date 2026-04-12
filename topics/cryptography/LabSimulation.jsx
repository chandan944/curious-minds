/**
 * Cryptography Lab — Cyber-Decryption Terminal & Brute Force
 * Scientist Mode: Raw Hexadecimal strings and XOR
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView, TextInput
} from 'react-native';
import Svg, {
  Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Circle, Path
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#050A05',
  panel: '#0B150B',
  cyan: '#00FFCC',
  green: '#39FF14',
  red: '#FF3131',
  text: '#E8F0E8',
  steel: '#1A251A',
  purple: '#A855F7',
  alert: '#FFD166'
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function CryptoLab({ scientistMode = false, accentColor = '#39FF14', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const discovered = useRef(new Set());

  // Cypher State
  const [plaintext, setPlaintext] = useState("HELLO");
  const [shift, setShift] = useState(3);
  const [bruteForceActive, setBruteForceActive] = useState(false);
  const [bruteShift, setBruteShift] = useState(0);

  // Logic Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const loop = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(loop);
  }, []);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  // Compute Ciphertext
  const applyCaesar = (text, key) => {
    let result = "";
    const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
    for (let i = 0; i < clean.length; i++) {
       const charCode = clean.charCodeAt(i);
       const s = (charCode - 65 + key) % 26;
       // Handle negative modulo correctly
       const mapped = s < 0 ? s + 26 : s;
       result += String.fromCharCode(mapped + 65);
    }
    return result;
  };

  const trueCipher = applyCaesar(plaintext, shift);
  const bruteCipher = applyCaesar(trueCipher, -bruteShift);

  // Discovery Triggers
  useEffect(() => {
    if (shift === 13 && !discovered.current.has('d1')) {
      addLog('d1', {
        title: "ROT13 Protocol",
        entry: "You selected Shift 13. This is the famous 'ROT13' cipher! Because the alphabet has 26 letters, shifting by exactly 13 means encrypting and decrypting use the exact same algorithm.",
        color: PALETTE.purple
      });
    }
  }, [shift, addLog]);

  // Brute Force Engine
  useEffect(() => {
    let bruteLoop;
    if (bruteForceActive) {
      bruteLoop = setInterval(() => {
        setBruteShift(prev => {
          const next = prev + 1;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          if (next >= 26 || next === shift) {
            setIsCracked(next === shift);
            setBruteForceActive(false);
            if (next === shift) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              addLog('d2', {
                title: "Brute Force Success",
                entry: "The algorithm cycled through every possible combination until it recognized the English word. Caesar ciphers take a computer 0.001 seconds to crack!",
                color: PALETTE.green
              });
            }
            return next;
          }
          return next;
        });
      }, 100); // 100ms per attempt
    }
    return () => clearInterval(bruteLoop);
  }, [bruteForceActive, shift, addLog]);

  const triggerBruteForce = () => {
    soundTap();
    setBruteShift(0);
    setBruteForceActive(true);
  };

  const [isCracked, setIsCracked] = useState(false);

  // Layout math
  const cx = width / 2;
  const cy = H_VIEWPORT / 2;
  const rad = 80;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0B150B" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />

          {/* Core Crypto Wheel */}
          <G x={cx} y={cy}>
            {/* Outer Static Wheel */}
            <Circle cx={0} cy={0} r={rad + 30} fill="none" stroke={PALETTE.steel} strokeWidth={2} />
            {Array.from({length:26}).map((_, i) => {
               const angle = (i * (360/26) - 90) * (Math.PI/180);
               const px = Math.cos(angle) * (rad + 15);
               const py = Math.sin(angle) * (rad + 15);
               return (
                 <SvgText key={`out-${i}`} x={px} y={py+4} fill="#888" fontSize={12} textAnchor="middle" fontFamily="monospace">
                   {ALPHABET[i]}
                 </SvgText>
               );
            })}

            {/* Inner Rotating Wheel */}
            <G rotation={(bruteForceActive ? bruteShift : shift) * (360/26)}>
              <Circle cx={0} cy={0} r={rad} fill="#0A100A" stroke={PALETTE.green} strokeWidth={2} />
              {Array.from({length:26}).map((_, i) => {
                 const angle = (i * (360/26) - 90) * (Math.PI/180);
                 const px = Math.cos(angle) * (rad - 15);
                 const py = Math.sin(angle) * (rad - 15);
                 return (
                   <SvgText key={`in-${i}`} x={px} y={py+4} fill={bruteForceActive ? PALETTE.red : PALETTE.cyan} fontSize={12} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                     {ALPHABET[i]}
                   </SvgText>
                 );
              })}
            </G>

            {/* Target Reticle */}
            <Rect x={-15} y={-rad-35} width={30} height={70} fill="none" stroke={PALETTE.alert} strokeWidth={2} rx={4} />
          </G>

          {/* Scientist Mode Hex Dump Overlay */}
          {scientistMode && (
            <G x={15} y={20}>
              <SvgText x={0} y={0} fill={PALETTE.purple} fontSize={10} fontFamily="monospace">
                HEX DUMP -> {trueCipher.split('').map(c => '\\x'+c.charCodeAt(0).toString(16)).join('')}
              </SvgText>
              <SvgText x={0} y={15} fill={PALETTE.purple} fontSize={10} fontFamily="monospace">
                XOR LAYER -> {trueCipher.split('').map(c => (c.charCodeAt(0) ^ 42).toString(2).padStart(8,'0')).slice(0,3).join(' ')}...
              </SvgText>
            </G>
          )}

          {/* Current Status HUD */}
          <G x={width - 150} y={15}>
            <Rect x={0} y={0} width={135} height={40} fill="#000" rx={5} stroke={bruteForceActive ? PALETTE.red : PALETTE.green} strokeWidth={1} />
            <SvgText x={10} y={18} fill={bruteForceActive ? PALETTE.red : PALETTE.text} fontSize={10} fontFamily="monospace" fontWeight="bold">
              {bruteForceActive ? 'ATTACKING SERVER...' : 'CONNECTION SECURE'}
            </SvgText>
             <SvgText x={10} y={30} fill="#666" fontSize={9} fontFamily="monospace">
              ALG: CAESAR(ROT_26)
            </SvgText>
          </G>

        </Svg>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>

          <View style={styles.ioWrap}>
             <View style={styles.ioBox}>
                <Text style={styles.ioLabel}>PLAINTEXT (INPUT)</Text>
                <TextInput 
                  style={styles.input} 
                  value={plaintext} 
                  onChangeText={t => setPlaintext(t.toUpperCase())}
                  maxLength={10}
                  editable={!bruteForceActive}
                />
             </View>
             <Icon name="arrow-right" size={20} color={PALETTE.green} />
             <View style={[styles.ioBox, { borderColor: bruteForceActive ? PALETTE.red : PALETTE.cyan }]}>
                <Text style={styles.ioLabel}>CIPHERTEXT (OUTPUT)</Text>
                <Text style={[styles.input, { color: PALETTE.cyan }]}>
                  {bruteForceActive ? bruteCipher : trueCipher}
                </Text>
             </View>
          </View>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>ENCRYPTION KEY (SHIFT): ROT_{shift}</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.green}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              if (bruteForceActive) return;
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setShift(Math.round((x / (width-40)) * 25));
              setIsCracked(false); // Reset crack status if key changes
            }}>
              <View style={[styles.sliderFill, { width: `${(shift/25)*100}%`, backgroundColor: PALETTE.green }]} />
              <View style={[styles.sliderThumb, { left: `${(shift/25)*100}%` }]} />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, bruteForceActive && { backgroundColor: '#441111' }, isCracked && { backgroundColor: PALETTE.green }]} 
            activeOpacity={0.8} 
            onPress={triggerBruteForce}
            disabled={bruteForceActive || isCracked}
          >
            <Text style={styles.actionBtnTxt}>
              {bruteForceActive ? `BRUTE FORCING (ATTEMPT ${bruteShift}/26)` : isCracked ? 'CIPHER CRACKED!' : 'LAUNCH BRUTE FORCE ATTACK'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Launch a cyber attack...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.green : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
      </TouchableOpacity>

      {/* Logs Modal */}
      <Modal visible={logsOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: PALETTE.text }]}>Research Log</Text>
              <TouchableOpacity onPress={() => { soundTap(); setLogsOpen(false); }}>
                <Icon name="x" size={24} color={PALETTE.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>No discoveries yet. Try shifting to 13!</Text>
              ) : (
                logs.map((l, i) => (
                  <View key={i} style={[styles.logCard, { borderLeftColor: l.color }]}>
                    <Text style={styles.logCardTitle}>{l.title}</Text>
                    <Text style={styles.logCardDesc}>{l.entry}</Text>
                  </View>
                ))
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  viewport: { width: '100%', overflow: 'hidden' },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 20 },
  ioWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  ioBox: { flex: 1, backgroundColor: '#000', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#222', marginHorizontal: 5 },
  ioLabel: { color: '#666', fontSize: 9, fontFamily: 'monospace', marginBottom: 5 },
  input: { color: '#FFF', fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold' },
  sliderWrap: { width: '100%', marginBottom: 15 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 16, backgroundColor: '#051015', borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  actionBtn: { marginTop: 10, backgroundColor: PALETTE.red, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  actionBtnTxt: { color: '#FFF', fontFamily: 'Outfit_700Bold', letterSpacing: 1, fontSize: 14 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#051005', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#051005', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
