import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Circle, G, Path, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - SPACING.md * 4;
const SIM_H = 340;

const NODES = [
  { id: 'NY', x: 60, y: 150, label: 'New York', color: '#00E5FF' },
  { id: 'LON', x: 200, y: 100, label: 'London', color: '#10B981' },
  { id: 'PAR', x: 230, y: 130, label: 'Paris', color: '#FFD166' },
  { id: 'TOKY', x: 300, y: 180, label: 'Tokyo', color: '#FF3131' },
  { id: 'SYD', x: 280, y: 280, label: 'Sydney', color: '#A855F7' },
];

const CABLES = [
  { from: 'NY', to: 'LON', type: 'Submarine-Primary', latency: 65 },
  { from: 'LON', to: 'PAR', type: 'Terrestrial', latency: 12 },
  { from: 'PAR', to: 'TOKY', type: 'Inter-Continental', latency: 140 },
  { from: 'NY', to: 'SYD', type: 'Deep-Sea-Alt', latency: 190 },
  { from: 'TOKY', to: 'SYD', type: 'Pacific-Fiber', latency: 90 },
];

const CHALLENGES = [
  { id: 'trans_atlantic', title: 'Trans-Atlantic Sync', desc: 'Deliver 100% of packets from New York to Paris', icon: 'globe', color: '#00E5FF' },
  { id: 'redirect', title: 'Route Ninja', desc: 'Secure the connection after a fiber-cut outage', icon: 'zap', color: '#FFD166' },
  { id: 'ping_master', title: 'Low Latency King', desc: 'Achieve < 80ms ping to London', icon: 'activity', color: '#10B981' },
  { id: 'subsea_expert', title: 'Deep-Sea Mechanic', desc: 'Tap the submarine cable to view raw throughput', icon: 'wrench', color: '#A855F7' },
];

export default function InternetNetworkingLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  const [activePackets, setActivePackets] = useState([]);
  const [cableCut, setCableCut] = useState(false);
  const [completedChallenges, setCompleted] = useState([]);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);
  const [metrics, setMetrics] = useState({ ping: 0, drops: 0 });

  const challengePopAnim = useRef(new Animated.Value(0)).current;

  // Simulation loop for packets
  useEffect(() => {
    let interval;
    if (activePackets.length > 0) {
      interval = setInterval(() => {
        setActivePackets(prev => prev.map(p => ({
          ...p,
          progress: p.progress + 0.02
        })).filter(p => p.progress < 1));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [activePackets]);

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

  const sendPacket = () => {
    if (cableCut) {
        setMetrics(prev => ({ ...prev, drops: prev.drops + 1 }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        triggerChallenge('redirect');
    } else {
        setMetrics({ ping: 68, drops: 0 });
    }
    
    soundWhoosh();
    const newPacket = { id: Date.now(), progress: 0 };
    setActivePackets(prev => [...prev, newPacket]);
    if (!cableCut) triggerChallenge('trans_atlantic');
    if (!cableCut && metrics.ping < 80) triggerChallenge('ping_master');
  };

  const toggleCable = () => {
    soundTap();
    setCableCut(!cableCut);
    if (!cableCut) {
        setMetrics(prev => ({ ...prev, ping: 0 }));
    }
  };

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

      {/* ── Network Hub ── */}
      <View style={[styles.statusCard, { backgroundColor: glass1, borderColor: border }]}>
         <View style={styles.statusRow}>
            <Icon name="globe" size={24} color="#00E5FF" />
            <View style={{ flex: 1 }}>
               <Text style={[styles.sLabel, { color: txtM }]}>NETWORK STATUS</Text>
               <Text style={[styles.sValue, { color: cableCut ? '#FF3131' : '#10B981' }]}>
                 {cableCut ? 'OUTAGE DETECTED' : 'BACKBONE OPERATIONAL'}
               </Text>
            </View>
            <TouchableOpacity onPress={sendPacket} style={styles.sendBtn}>
               <Icon name="zap" size={20} color="#000" />
            </TouchableOpacity>
         </View>
      </View>

      {/* ── Global Routing Simulation ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#000' : '#111' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
             <RadialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFF" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
             </RadialGradient>
           </Defs>
           
           {/* Submarine Cables */}
           {CABLES.map((c, i) => {
             const n1 = NODES.find(n => n.id === c.from);
             const n2 = NODES.find(n => n.id === c.to);
             const isMainTrunk = c.from === 'NY' && c.to === 'LON';
             const isBroken = isMainTrunk && cableCut;
             
             return (
               <G key={i}>
                 <Line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                   stroke={isBroken ? '#FF313160' : (isDark ? '#334444' : '#E2E8F0')} 
                   strokeWidth={isMainTrunk ? 4 : 2}
                   strokeDasharray={isBroken ? "5,5" : "0"} />
                 
                 {/* Packets moving along the line */}
                 {!isBroken && activePackets.map(p => (
                   <Circle key={`${i}-${p.id}`} 
                     cx={n1.x + (n2.x - n1.x) * p.progress} 
                     cy={n1.y + (n2.y - n1.y) * p.progress} 
                     r="3" fill="#00E5FF" />
                 ))}
               </G>
             );
           })}

           {/* Continent Nodes */}
           {NODES.map(n => (
             <G key={n.id}>
                <Circle cx={n.x} cy={n.y} r="15" fill="url(#nodeGlow)" />
                <Circle cx={n.x} cy={n.y} r="6" fill={n.color} />
                <SvgText x={n.x} y={n.y + 20} fontSize="9" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontFamily="monospace">
                  {n.label}
                </SvgText>
             </G>
           ))}
        </Svg>

        {cableCut && (
          <View style={styles.alertBox}>
             <Icon name="activity" size={24} color="#FF3131" />
             <Text style={styles.alertText}>PACKET LOSS: 98.2%</Text>
          </View>
        )}
      </View>

      {/* ── Control Center ── */}
      <View style={styles.btnRow}>
         <TouchableOpacity onPress={toggleCable} style={[styles.btn, { flex: 1, backgroundColor: cableCut ? '#10B98120' : '#FF313120', borderColor: cableCut ? '#10B98160' : '#FF313160' }]}>
            <Text style={[styles.btnText, { color: cableCut ? '#10B981' : '#FF3131' }]}>
               {cableCut ? 'FIX SUBMARINE CABLE' : 'CUT TRANS-ATLANTIC'}
            </Text>
         </TouchableOpacity>
      </View>

      {/* ── Scholar Analytics 🧑‍🔬 ── */}
      {scientistMode && (
        <View style={[styles.sciCard, { backgroundColor: glass1, borderColor: border }]}>
           <View style={styles.sciHeader}>
             <Icon name="terminal" size={14} color="#A855F7" />
             <Text style={[styles.sciTitle, { color: txt1 }]}>Ping Diagnostics 🧑‍🔬</Text>
           </View>
           <View style={styles.statGrid}>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>LATENT PING (ms)</Text>
                 <Text style={[styles.statValue, { color: '#00E5FF' }]}>{cableCut ? 'TIMEOUT' : `${metrics.ping} ms`}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>PACKET DROPS</Text>
                 <Text style={[styles.statValue, { color: '#FF3131' }]}>{metrics.drops}</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>PROTOCOL</Text>
                 <Text style={[styles.statValue, { color: '#FFD166' }]}>TCP/IP v6</Text>
              </View>
              <View style={styles.statItem}>
                 <Text style={[styles.statLabel, { color: txtM }]}>ENCRYPTION</Text>
                 <Text style={[styles.statValue, { color: '#10B981' }]}>AES-256</Text>
              </View>
           </View>
           <View style={styles.sciNote}>
             <Icon name="info" size={12} color={txtM} />
             <Text style={[styles.sciNoteText, { color: txtM }]}>
               {"Note: Packet rerouting is handled by the BGP (Border Gateway Protocol)."}
             </Text>
           </View>
        </View>
      )}

      {/* ── Challenges ── */}
      <View style={[styles.challengeCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.challengeCardTitle, { color: txt1 }]}>Network Missions ({completedChallenges.length}/4)</Text>
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
  sendBtn: { backgroundColor: '#FFD166', padding: 8, borderRadius: RADIUS.sm },
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  alertBox: { position: 'absolute', top: 20, backgroundColor: 'rgba(255,49,49,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#FF3131' },
  alertText: { color: '#FF3131', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', marginTop: 16 },
  btn: { paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1 },
  btnText: { fontFamily: FONTS.displayMedium, fontSize: 12, letterSpacing: 1 },
  sciCard: { marginTop: 16, padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  sciHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sciTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { flex: 1, minWidth: '45%', padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm },
  statLabel: { fontFamily: FONTS.bodyMedium, fontSize: 8, marginBottom: 2 },
  statValue: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  sciNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  sciNoteText: { fontFamily: FONTS.body, fontSize: 11 },
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
