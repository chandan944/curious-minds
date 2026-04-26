import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Path, Line, Polygon } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;
const SIM_H = SIM_W * 0.85;

const ERAS = [
  { name: 'Animism', year: '50,000 BCE', color: '#4CAF50', popReq: 0, sciReq: 0 },
  { name: 'Shamanism', year: '30,000 BCE', color: '#9C27B0', popReq: 200, sciReq: 5 },
  { name: 'Ancestor Worship', year: '10,000 BCE', color: '#FF9800', popReq: 1000, sciReq: 10 },
  { name: 'Polytheism', year: '4,000 BCE', color: '#FF5722', popReq: 5000, sciReq: 20 },
  { name: 'Monotheism', year: '600 BCE', color: '#2196F3', popReq: 50000, sciReq: 35 },
  { name: 'Reformation', year: '1517 CE', color: '#E91E63', popReq: 500000, sciReq: 55 },
  { name: 'Secularism', year: '1700 CE', color: '#607D8B', popReq: 5000000, sciReq: 75 },
  { name: 'Post-Religion?', year: '2100 CE', color: '#6366F1', popReq: 50000000, sciReq: 95 },
];

export default function ReligionEvolutionLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [era, setEra] = useState(0);
  const [population, setPopulation] = useState(50);
  const [science, setScience] = useState(0);
  const [faith, setFaith] = useState(80);
  const [socialCohesion, setSocialCohesion] = useState(60);
  const [event, setEvent] = useState('🌿 The tribe gathers around the fire…');
  const [gameState, setGameState] = useState('RUNNING'); // RUNNING, COLLAPSED, TRANSCEND
  const [tick, setTick] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (gameState !== 'RUNNING') return;

    timerRef.current = setInterval(() => {
      setTick(prev => prev + 1);

      // Population growth
      setPopulation(prev => {
        const growth = Math.max(1, Math.floor(prev * 0.03 * (socialCohesion / 100)));
        return prev + growth;
      });

      // Science passive growth
      setScience(prev => {
        const gain = Math.max(0.1, population / 50000);
        return Math.min(100, prev + gain);
      });

      // Faith decay as science rises
      setFaith(prev => {
        const decay = science > 50 ? 0.5 : 0.1;
        const gain = socialCohesion < 40 ? 0.3 : 0; // people turn to faith in crises
        return Math.max(0, Math.min(100, prev - decay + gain));
      });

      // Social cohesion depends on balance
      setSocialCohesion(prev => {
        let delta = 0;
        if (faith > 30 && faith < 90) delta += 1; // moderate faith helps
        if (faith > 90) delta -= 0.5; // fundamentalism hurts
        if (faith < 15 && science < 70) delta -= 2; // no meaning system = chaos
        if (science > 60 && faith < 50) delta += 0.5; // secular stability
        return Math.max(0, Math.min(100, prev + delta));
      });

      // Random events
      if (Math.random() < 0.12) {
        const events = [
          { n: '🌊 Flood destroys settlements!', fX: 10, sX: -15, scX: -10 },
          { n: '⚔️ Tribe war erupts!', fX: -5, sX: 5, scX: -20 },
          { n: '🌾 Great harvest! Population booms!', fX: 5, sX: 0, scX: 10 },
          { n: '📜 A prophet speaks!', fX: 20, sX: -5, scX: 15 },
          { n: '🔬 A thinker questions tradition!', fX: -15, sX: 15, scX: -5 },
          { n: '🤝 Trade with strangers!', fX: -5, sX: 10, scX: 5 },
        ];
        const ev = events[Math.floor(Math.random() * events.length)];
        setEvent(ev.n);
        setFaith(prev => Math.max(0, Math.min(100, prev + ev.fX)));
        setScience(prev => Math.max(0, Math.min(100, prev + ev.sX)));
        setSocialCohesion(prev => Math.max(0, Math.min(100, prev + ev.scX)));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setTimeout(() => setEvent('☀️ Life goes on…'), 4000);
      }

    }, 600);

    return () => clearInterval(timerRef.current);
  }, [gameState, faith, science, socialCohesion, population]);

  // Era progression
  useEffect(() => {
    if (gameState !== 'RUNNING') return;
    for (let i = ERAS.length - 1; i >= 0; i--) {
      if (population >= ERAS[i].popReq && science >= ERAS[i].sciReq) {
        if (i > era) {
          setEra(i);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setEvent(`🏛️ Era shift: ${ERAS[i].name}!`);
        }
        break;
      }
    }

    if (socialCohesion <= 0) {
      setGameState('COLLAPSED');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      clearInterval(timerRef.current);
    }

    if (era >= 7) {
      setGameState('TRANSCEND');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearInterval(timerRef.current);
      if (onLabBreaker) onLabBreaker();
    }
  }, [population, science, era, socialCohesion, gameState]);

  const handleAction = (type) => {
    if (gameState !== 'RUNNING') return;
    soundTap();
    if (type === 'RITUAL') {
      setFaith(prev => Math.min(100, prev + 15));
      setSocialCohesion(prev => Math.min(100, prev + 10));
      setScience(prev => Math.max(0, prev - 3));
    } else if (type === 'INNOVATE') {
      setScience(prev => Math.min(100, prev + 12));
      setFaith(prev => Math.max(0, prev - 8));
    } else if (type === 'UNITE') {
      setSocialCohesion(prev => Math.min(100, prev + 20));
      setFaith(prev => Math.min(100, prev + 5));
    }
  };

  const resetGame = () => {
    soundWhoosh();
    setEra(0); setPopulation(50); setScience(0); setFaith(80);
    setSocialCohesion(60); setGameState('RUNNING'); setEvent('🌿 The tribe gathers…'); setTick(0);
  };

  const curEra = ERAS[era];
  const fmtPop = population >= 1000000 ? `${(population/1000000).toFixed(1)}M` : population >= 1000 ? `${(population/1000).toFixed(1)}K` : `${population}`;

  // Timeline bar positions
  const barW = SIM_W - 40;

  return (
    <View style={styles.container}>
      {/* STATUS */}
      <View style={[styles.headerBox, { borderColor: border, backgroundColor: isDark ? '#0A0A18' : '#F0F0FF' }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>CURRENT ERA</Text>
          <Text style={{ fontSize: 14, fontFamily: FONTS.displayBold, color: curEra.color }}>{curEra.name}</Text>
          <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>{curEra.year} · Pop: {fmtPop}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', width: 100 }}>
          <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>COHESION</Text>
          <Text style={{ fontSize: 14, fontFamily: 'monospace', color: socialCohesion < 25 ? '#FF4444' : txt1 }}>{Math.floor(socialCohesion)}%</Text>
          <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 2 }]}>
            <View style={{ height: '100%', width: `${socialCohesion}%`, backgroundColor: socialCohesion < 25 ? '#FF4444' : '#4CAF50' }} />
          </View>
        </View>
      </View>

      {/* EVENT */}
      <View style={[styles.eventBox, { borderColor: curEra.color + '40', backgroundColor: curEra.color + '10' }]}>
        <Text style={{ fontSize: 11, fontFamily: FONTS.displayBold, color: curEra.color }}>{event}</Text>
      </View>

      {/* TIMELINE VISUALIZATION */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Svg width={SIM_W} height={SIM_H}>
          <Rect x={0} y={0} width={SIM_W} height={SIM_H} rx={12} fill={glass1} stroke={border} />
          
          {/* Era Timeline */}
          <Line x1={20} y1={30} x2={SIM_W - 20} y2={30} stroke={border} strokeWidth={2} />
          {ERAS.map((e, i) => {
            const x = 20 + (barW * i) / (ERAS.length - 1);
            const isActive = i <= era;
            const isCurrent = i === era;
            return (
              <G key={e.name}>
                <Circle cx={x} cy={30} r={isCurrent ? 8 : 5} fill={isActive ? e.color : '#333'} stroke={isCurrent ? '#FFF' : 'none'} strokeWidth={isCurrent ? 2 : 0} />
                <SvgText x={x} y={50} fill={isActive ? e.color : txtM} fontSize={7} textAnchor="middle" fontWeight={isCurrent ? 'bold' : 'normal'}>{e.name.substring(0, 8)}</SvgText>
              </G>
            );
          })}

          {/* Faith vs Science Bars */}
          <SvgText x={20} y={80} fill="#FF9800" fontSize={9} fontWeight="bold">Faith</SvgText>
          <Rect x={60} y={70} width={Math.max(2, (SIM_W - 100) * (faith / 100))} height={12} rx={3} fill="#FF9800" opacity={0.7} />
          <SvgText x={SIM_W - 20} y={80} fill="#FF9800" fontSize={9} textAnchor="end">{Math.floor(faith)}%</SvgText>

          <SvgText x={20} y={105} fill="#00BCD4" fontSize={9} fontWeight="bold">Science</SvgText>
          <Rect x={60} y={95} width={Math.max(2, (SIM_W - 100) * (science / 100))} height={12} rx={3} fill="#00BCD4" opacity={0.7} />
          <SvgText x={SIM_W - 20} y={105} fill="#00BCD4" fontSize={9} textAnchor="end">{Math.floor(science)}%</SvgText>

          {/* Population Pyramid (Simple) */}
          <SvgText x={SIM_W / 2} y={135} fill={txtM} fontSize={9} textAnchor="middle" fontWeight="bold">POPULATION: {fmtPop}</SvgText>
          
          {/* Era Visualization: Symbolic Temple */}
          {era >= 3 && (
            <G>
              {/* Temple columns */}
              <Rect x={SIM_W/2 - 40} y={160} width={8} height={60} fill={curEra.color} opacity={0.5} />
              <Rect x={SIM_W/2 - 20} y={155} width={8} height={65} fill={curEra.color} opacity={0.6} />
              <Rect x={SIM_W/2 + 12} y={155} width={8} height={65} fill={curEra.color} opacity={0.6} />
              <Rect x={SIM_W/2 + 32} y={160} width={8} height={60} fill={curEra.color} opacity={0.5} />
              {/* Roof */}
              <Polygon points={`${SIM_W/2 - 50},${160} ${SIM_W/2},${140} ${SIM_W/2 + 50},${160}`} fill={curEra.color} opacity={0.4} />
            </G>
          )}
          {era < 3 && (
            <G>
              {/* Campfire for early eras */}
              <Circle cx={SIM_W/2} cy={190} r={15 + era * 5} fill={curEra.color} opacity={0.3} />
              <Circle cx={SIM_W/2} cy={190} r={8 + era * 3} fill={curEra.color} opacity={0.5} />
              <SvgText x={SIM_W/2} y={195} fill="#FFF" fontSize={20} textAnchor="middle">🔥</SvgText>
            </G>
          )}

          {/* Game Over / Win Text */}
          {gameState === 'COLLAPSED' && (
            <SvgText x={SIM_W/2} y={SIM_H - 20} fill="#FF4444" fontSize={14} textAnchor="middle" fontWeight="bold">CIVILIZATION COLLAPSED 💀</SvgText>
          )}
          {gameState === 'TRANSCEND' && (
            <SvgText x={SIM_W/2} y={SIM_H - 20} fill="#6366F1" fontSize={14} textAnchor="middle" fontWeight="bold">POST-RELIGIOUS ERA REACHED 🔮</SvgText>
          )}
        </Svg>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#FF980020', borderColor: '#FF9800' }]}
          onPress={() => handleAction('RITUAL')}>
          <Text style={[styles.btnTxt, { color: '#FF9800' }]}>🕯️ Hold Ritual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#00BCD420', borderColor: '#00BCD4' }]}
          onPress={() => handleAction('INNOVATE')}>
          <Text style={[styles.btnTxt, { color: '#00BCD4' }]}>🔬 Innovate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#4CAF5020', borderColor: '#4CAF50', width: '80%' }]}
          onPress={() => handleAction('UNITE')}>
          <Text style={[styles.btnTxt, { color: '#4CAF50' }]}>🤝 Unite the People</Text>
        </TouchableOpacity>
      </View>

      {gameState !== 'RUNNING' && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Text style={{ color: '#FFF', fontFamily: FONTS.displayBold }}>Restart Civilization 🔄</Text>
        </TouchableOpacity>
      )}

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border }]}>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>HADD_ACTIVATION: {(faith / 100).toFixed(3)}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>DURKHEIM_SOLIDARITY: {(socialCohesion / 100).toFixed(3)}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>COGNITIVE_LOAD: {((population / 1000) * (1 - science / 200)).toFixed(1)} kBits</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>ERA_INDEX: {era}/7 | TICK: {tick}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10 },
  eventBox: { padding: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, minWidth: '45%', alignItems: 'center', marginBottom: 8 },
  btnTxt: { fontSize: 11, fontFamily: FONTS.displayBold },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#0A0A18', borderRadius: RADIUS.sm, borderWidth: 1 },
});
