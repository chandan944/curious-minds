// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  LAB: Global Conflict Strategy â€” World Wars
//
//  MODE 1 â€” Alliance Web (WWI): Chain-reaction network graph
//  MODE 2 â€” Enigma Simulator (WWII): 3-rotor cryptography keyboard
//  MODE 3 â€” Shifting Fronts (WWII): Timeline map of Axis expansion
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Defs, Stop, Text as SvgText, LinearGradient as SvgLG } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width: W_SCREEN } = Dimensions.get('window');
const SIM_W = W_SCREEN - SPACING.md * 4;
const SIM_H = 320;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DATA & CONSTANTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const MODES = [
  { id: 'alliance', name: 'WWI Alliance Web', icon: 'grid', color: '#D4A74A' },
  { id: 'enigma',   name: 'Enigma Simulator', icon: 'lock', color: '#00E5A0' },
  { id: 'fronts',   name: 'Shifting Fronts',  icon: 'globe', color: '#FF4444' },
];

const CHALLENGES = [
  { id: 'spark_wwi', title: 'The Spark',        desc: 'Trigger the WWI Alliance Web',         icon: 'bomb',  color: '#D4A74A' },
  { id: 'crypto',    title: 'Codebreaker',      desc: 'Type a 10-letter coded message',       icon: 'lock',  color: '#00E5A0' },
  { id: 'dday',      title: 'Operation Overlord',desc: 'Scrub timeline to 1944 (D-Day)',      icon: 'globe', color: '#FF4444' },
];

const QWERTY = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M']
];

// â”€â”€ WWI ALLIANCE DATA â”€â”€
const NATIONS = [
  { id: 'serbia',  name: 'Serbia',  cx: SIM_W*0.65, cy: 220, color: '#4D5A46', ally: 'russia' },
  { id: 'austria', name: 'Austria', cx: SIM_W*0.5,  cy: 160, color: '#B42B2B', ally: 'germany' },
  { id: 'russia',  name: 'Russia',  cx: SIM_W*0.85, cy: 90,  color: '#4D5A46', ally: 'france' },
  { id: 'germany', name: 'Germany', cx: SIM_W*0.4,  cy: 100, color: '#B42B2B', ally: 'austria' },
  { id: 'france',  name: 'France',  cx: SIM_W*0.2,  cy: 150, color: '#4D5A46', ally: 'britain' },
  { id: 'britain', name: 'Britain', cx: SIM_W*0.15, cy: 70,  color: '#4D5A46', ally: 'france' },
  // Treaties (lines): [from, to, reason]
];
const TREATIES = [
  { n1: 'serbia', n2: 'russia',  type: 'defense' },
  { n1: 'austria',n2: 'germany', type: 'defense' },
  { n1: 'russia', n2: 'france',  type: 'defense' },
  { n1: 'france', n2: 'britain', type: 'defense' },
  { n1: 'serbia', n2: 'austria', type: 'conflict', dotted: true },
];

// â”€â”€ WWII FRONTS DATA â”€â”€
const MAP_PATH = "M60 40 L160 20 L240 10 L300 40 L320 120 L280 280 L200 300 L110 310 L40 280 L20 180 Z";
// Simplified polygon areas representing Axis control by year
const AXIS_POLYS = {
  1939: "M140 120 L180 110 L190 150 L150 160 Z", // Germany
  1940: "M80 100 L180 80 L200 160 L100 200 Z",  // Falls of France & Low Countries
  1941: "M80 100 L240 60 L260 220 L100 200 Z",  // Invasion of USSR starts
  1942: "M80 100 L300 40 L310 260 L80 240 Z",   // Peak expansion
  1943: "M80 100 L260 80 L250 200 L80 220 Z",   // Pushed back from Stalingrad
  1944: "M120 100 L200 100 L190 180 L130 180 Z",// D-Day & Soviet advance
  1945: "M150 120 L170 120 L165 140 L155 140 Z",// Collapse to Berlin
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function WorldWarsLab({
  scientistMode = false,
  accentColor   = '#B42B2B',
}) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  // @ts-ignore
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const wire = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [modeIdx, setModeIdx] = useState(0);

  // Alliance Mode
  const [warState, setWarState] = useState([]); // Array of nation IDs at war
  const [warAnim] = useState(new Animated.Value(0));

  // Enigma Mode
  const [rotors, setRotors] = useState([0, 0, 0]); // 0-25
  const [tape, setTape]     = useState([]); // { in, out }
  const [litKey, setLitKey] = useState(null);

  // Fronts Mode
  const [year, setYear] = useState(1939);

  // Tracking
  const [completedCh, setCompletedCh] = useState([]);
  const [lastChMsg, setLastChMsg]     = useState(null);
  const [showCh, setShowCh]           = useState(false);
  const chAnim    = useRef(new Animated.Value(0)).current;
  const [runCount, setRunCount]       = useState(0);

  const mode = MODES[modeIdx];

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const unlockCh = (id) => {
    if (completedCh.includes(id)) return;
    const next = [...completedCh, id];
    setCompletedCh(next); setLastChMsg(CHALLENGES.find(c => c.id === id)?.title);
    soundBadge(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(chAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(chAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const switchMode = (i) => {
    soundTap(); Haptics.selectionAsync();
    setModeIdx(i); setRunCount(c => c + 1);
  };

  // Trigger Alliance Web Domino Effect
  const triggerWar = (nationId) => {
    if (nationId !== 'serbia' && warState.length === 0) {
      // Must start at the spark!
      soundTap(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (warState.length > 0) {
      // Reset
      setWarState([]);
      warAnim.setValue(0);
      return;
    }

    soundWhoosh(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRunCount(c => c + 1);
    unlockCh('spark_wwi');

    const sequence = ['serbia', 'austria', 'russia', 'germany', 'france', 'britain'];
    
    // Animate the dominos
    sequence.forEach((nat, idx) => {
      setTimeout(() => {
        setWarState(prev => [...prev, nat]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, idx * 800);
    });
  };

  // Enigma Logic
  const pressEnigmaKey = (char) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 1. Advance Rotors
    let newR = [...rotors];
    newR[2] = (newR[2] + 1) % 26;
    if (newR[2] === 0) {
      newR[1] = (newR[1] + 1) % 26;
      if (newR[1] === 0) newR[0] = (newR[0] + 1) % 26;
    }
    setRotors(newR);

    // 2. Cipher Logic (Simplified shift based on rotors)
    const charCode = char.charCodeAt(0) - 65;
    const shift = newR[0] + newR[1] + newR[2] + 7; // Custom offset
    const outCode = (charCode + shift) % 26;
    const outChar = String.fromCharCode(outCode + 65);

    setLitKey(outChar);
    setTape(prev => [...prev, { in: char, out: outChar }]);
    setRunCount(c => c + 1);

    if (tape.length + 1 >= 10) unlockCh('crypto');
  };

  const releaseEnigmaKey = () => {
    setLitKey(null);
  };

  const clearEnigma = () => {
    soundWhoosh(); Haptics.selectionAsync();
    setTape([]); setRotors([0,0,0]);
  };

  // Timeline Slider
  const handleYearScroll = (evt) => {
    const p = Math.max(0, Math.min(1, evt.nativeEvent.locationX / (SIM_W - 32)));
    const y = Math.round(1939 + p * 6);
    if (y !== year) {
      setYear(y);
      Haptics.selectionAsync();
      setRunCount(c => c + 1);
      if (y === 1944) unlockCh('dday');
    }
  };

  // â”€â”€ Fun fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const funFact = (() => {
    if (mode.id === 'alliance') return "The assassination of Archduke Ferdinand was the spark, but the secret defense treaties were the dynamite.";
    if (mode.id === 'enigma') return "The Enigma code had over 158 quintillion settings and changed every single time you pressed a key.";
    if (mode.id === 'fronts') return "In 1942, Nazi Germany controlled almost the entirely of Europe, but over-expanded into the brutal Russian winter.";
    return "The World Wars completely erased the ancient world of Kings and Empires.";
  })();

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  RENDER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <View style={s.root}>

      {/* â”€â”€ Mode Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity key={m.id} onPress={() => switchMode(i)}
            style={[s.tab, { borderColor: modeIdx === i ? m.color + '80' : border, backgroundColor: modeIdx === i ? m.color + '12' : glass1 }]}>
            <Icon name={m.icon} size={16} color={modeIdx === i ? m.color : txtM} />
            <Text style={[s.tabTxt, { color: modeIdx === i ? txt1 : txtM }]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* â”€â”€ MAIN CANVAS AREA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[s.canvasOuter, { borderColor: border }]}>

        {/* MODE 1: ALLIANCE DOMINO WEB */}
        {mode.id === 'alliance' && (
          <View style={[s.canvas, { backgroundColor: isDark ? '#1A1815' : '#F5F2EB' }]}>
            <Svg width={SIM_W} height={SIM_H}>
               {/* Draw treaty lines */}
               {TREATIES.map((t, i) => {
                 const n1 = NATIONS.find(n => n.id === t.n1);
                 const n2 = NATIONS.find(n => n.id === t.n2);
                 const isActive = warState.includes(t.n1) && warState.includes(t.n2);
                 return (
                   <Line key={`L${i}`} x1={n1.cx} y1={n1.cy} x2={n2.cx} y2={n2.cy}
                      stroke={isActive ? '#FF4444' : (isDark ? '#444' : '#BBB')} 
                      strokeWidth={isActive ? 4 : 2}
                      strokeDasharray={t.dotted ? "8,8" : ""} />
                 );
               })}

               {/* Draw Nations */}
               {NATIONS.map(nat => {
                 const isAtWar = warState.includes(nat.id);
                 return (
                   <React.Fragment key={nat.id}>
                      {isAtWar && <Circle cx={nat.cx} cy={nat.cy} r={35} fill="#FF4444" fillOpacity={0.2} />}
                      <Circle cx={nat.cx} cy={nat.cy} r={20} fill={isAtWar ? '#FF4444' : nat.color} 
                         stroke={isAtWar ? '#FF9999' : '#FFF'} strokeWidth={isAtWar ? 3 : 1} />
                      <SvgText x={nat.cx} y={nat.cy + 35} textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="bold">
                        {nat.name}
                      </SvgText>
                   </React.Fragment>
                 );
               })}
            </Svg>

            {/* Interactions */}
            {NATIONS.map(nat => (
              <TouchableOpacity key={`T${nat.id}`} style={{ position: 'absolute', left: nat.cx-25, top: nat.cy-25, width: 50, height: 50 }}
                onPress={() => triggerWar(nat.id)} activeOpacity={0.7} />
            ))}

            <View style={s.overlayTopRight}>
               <Text style={[s.badgeTxt, { color: txt1 }]}>{warState.length > 0 ? 'WAR DECLARED!' : 'Tap Serbia (Spark)'}</Text>
               <Text style={[s.badgeData, { color: warState.length > 0 ? '#FF4444' : txtM }]}>
                  {warState.length} Nations at War
               </Text>
            </View>
          </View>
        )}

        {/* MODE 2: ENIGMA SIMULATOR */}
        {mode.id === 'enigma' && (
          <View style={[s.canvas, { backgroundColor: isDark ? '#1C1F22' : '#E8EBE9', padding: SPACING.sm }]}>
            
            {/* Output Tape */}
            <View style={[s.enigmaTape, { backgroundColor: '#F9F1DC', borderColor: '#D4C49A' }]}>
               <ScrollView horizontal ref={r => r?.scrollToEnd()} showsHorizontalScrollIndicator={false}>
                  <Text style={s.tapeText}>{tape.map(t => t.out).join('')}</Text>
               </ScrollView>
               {tape.length > 0 && (
                 <TouchableOpacity onPress={clearEnigma} style={s.clearBtn}>
                   <Icon name="close" size={14} color="#888" />
                 </TouchableOpacity>
               )}
            </View>

            {/* Rotors */}
            <View style={s.rotorRow}>
               {rotors.map((r, i) => (
                 <View key={i} style={[s.rotor, { backgroundColor: isDark ? '#111' : '#DDD', borderColor: isDark ? '#333' : '#AAA' }]}>
                    <Text style={[s.rotorText, { color: txt1 }]}>{r.toString().padStart(2, '0')}</Text>
                 </View>
               ))}
            </View>

            {/* Lampboard & Keyboard combined visually */}
            <View style={s.keyboard}>
               {QWERTY.map((row, rIdx) => (
                 <View key={rIdx} style={s.keyRow}>
                    {row.map(char => {
                      const isLit = litKey === char;
                      return (
                        <View key={char} 
                          style={[s.keyWrapper, { 
                             backgroundColor: isDark ? '#2A2E33' : '#FFF',
                             borderColor: isLit ? '#00E5A0' : border,
                             shadowColor: isLit ? '#00E5A0' : 'transparent',
                             shadowOpacity: isLit ? 0.8 : 0, shadowRadius: 10
                          }]}
                          onStartShouldSetResponder={() => true}
                          onResponderGrant={() => pressEnigmaKey(char)}
                          onResponderRelease={releaseEnigmaKey}
                        >
                           <Text style={[s.keyText, { color: isLit ? '#00E5A0' : txt1, fontWeight: isLit ? 'bold' : 'normal' }]}>
                             {char}
                           </Text>
                        </View>
                      )
                    })}
                 </View>
               ))}
            </View>
          </View>
        )}

        {/* MODE 3: SHIFTING FRONTS (MAP) */}
        {mode.id === 'fronts' && (() => {
          const progress = (year - 1939) / 6; 
          return (
          <View style={[s.canvas, { backgroundColor: isDark ? '#0A1220' : '#D0DAE5' }]}>
            <Svg width={SIM_W} height={SIM_H}>
               {/* Background Land */}
               <Path d={MAP_PATH} fill={isDark ? '#152233' : '#BAC6D4'} stroke={wire} strokeWidth={2} />
               
               {/* Axis Expansion Area */}
               <Defs>
                 <SvgLG id="axisGrad" x1="0" y1="0" x2="1" y2="1">
                   <Stop offset="0" stopColor="#B42B2B" stopOpacity="0.8" />
                   <Stop offset="1" stopColor="#FF4444" stopOpacity="0.6" />
                 </SvgLG>
               </Defs>
               <Path d={AXIS_POLYS[year]} fill="url(#axisGrad)" stroke="#FFAAAA" strokeWidth={2} />

               {/* Allies Pushback Arrows (Visually appear 1943+) */}
               {year >= 1943 && (
                 <>
                   {/* D-Day / Western Front */}
                   <Line x1={20} y1={140} x2={80} y2={140} stroke="#4C80F1" strokeWidth={6} strokeDasharray="6,4" />
                   <Polygon points="80,130 95,140 80,150" fill="#4C80F1" />
                   {/* Eastern Front (Soviets) */}
                   <Line x1={SIM_W-20} y1={120} x2={SIM_W-60} y2={120} stroke="#4CA050" strokeWidth={6} strokeDasharray="6,4" />
                   <Polygon points="260,110 245,120 260,130" fill="#4CA050" />
                 </>
               )}

               {/* Year display massive */}
               <SvgText x={SIM_W / 2} y={50} textAnchor="middle" fill="#FFF" fontSize="36" fontWeight="bold" opacity={0.8}>{year}</SvgText>
            </Svg>

            {/* Timeline Overlay */}
            <View style={[s.timelineContainer, { backgroundColor: glass1, borderColor: border }]}>
                 <View style={s.sliderRow}>
                    <Icon name="history" size={16} color="#FF4444" />
                    <Text style={[s.sliderLabel, { color: txt1 }]}>Timeline: {year}</Text>
                 </View>
                 <View style={[s.sliderTrack, { backgroundColor: glass2 }]} 
                    onStartShouldSetResponder={() => true}
                    onResponderMove={handleYearScroll}>
                    <View style={[s.sliderFill, { width: `${progress * 100}%`, backgroundColor: '#FF4444' }]} />
                    <View style={[s.sliderThumb, { left: `${progress * 100}%`, backgroundColor: '#fff', borderColor: '#FF4444' }]} pointerEvents="none" />
                 </View>
                 {scientistMode && (
                   <Text style={[s.scienceData, { color: txtM }]}>
                      {year === 1939 && "Invasion of Poland."}
                      {year === 1940 && "Blitzkrieg & Fall of France."}
                      {year === 1941 && "Pearl Harbor & Operation Barbarossa."}
                      {year === 1942 && "Axis reaches maximum territorial expansion."}
                      {year === 1943 && "Battle of Stalingrad ends - Soviets push back."}
                      {year === 1944 && "Operation Overlord (D-Day)."}
                      {year === 1945 && "Fall of Berlin. Atomic bombs dropped."}
                   </Text>
                 )}
            </View>
          </View>
        )})()}
      </View>

      {/* â”€â”€ Stats Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={s.statsRow}>
        <Stat icon="shield" color="#D4A74A" label="Treaties" val={TREATIES.length} t1={txt1} tM={txtM} />
        <Stat icon="lock" color="#00E5A0" label="Rotors" val="3" t1={txt1} tM={txtM} />
        <Stat icon="bomb" color="#FF4444" label="Global War" val="2" t1={txt1} tM={txtM} />
      </View>

      {/* â”€â”€ Fun Fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[s.fact, { borderColor: accentColor + '25', backgroundColor: accentColor + '08' }]}>
        <View style={[s.factIco, { backgroundColor: accentColor + '18' }]}>
          <Icon name="lightbulb" size={14} color={accentColor} />
        </View>
        <Text style={[s.factTxt, { color: txt2 }]}>{funFact}</Text>
      </View>

      {/* â”€â”€ Challenge toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View style={[s.toast, { backgroundColor: accentColor + '18', borderColor: accentColor + '50',
        opacity: chAnim, transform: [{ translateY: chAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
      }]}>
        <Icon name="trophy" size={16} color={accentColor} />
        <Text style={[s.toastTxt, { color: accentColor }]}>{lastChMsg}</Text>
      </Animated.View>

      {/* â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TouchableOpacity onPress={() => { soundTap(); setShowCh(v => !v); }}
        style={[s.chToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={s.chToggleInner}>
          <Icon name="target" size={14} color={accentColor} />
          <Text style={[s.chToggleTxt, { color: txt1 }]}>Challenges ({completedCh.length}/{CHALLENGES.length})</Text>
          <View style={[s.chBar, { backgroundColor: glass2 }]}>
            <View style={[s.chBarFill, { width: `${(completedCh.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Icon name={showCh ? 'close' : 'forward'} size={12} color={txtM} />
        </View>
      </TouchableOpacity>
      {showCh && CHALLENGES.map(ch => {
        const done = completedCh.includes(ch.id);
        return (
          <View key={ch.id} style={[s.chItem, { borderColor: done ? ch.color + '40' : border, backgroundColor: done ? ch.color + '0A' : glass1 }]}>
            <View style={[s.chIcoW, { backgroundColor: (done ? ch.color : txtM) + '18' }]}>
              <Icon name={ch.icon} size={14} color={done ? ch.color : txtM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.chN, { color: done ? txt1 : txtM }]}>{ch.title}</Text>
              <Text style={[s.chD, { color: done ? txt2 : txtM }]}>{ch.desc}</Text>
            </View>
            {done && <Icon name="check" size={14} color={ch.color} />}
          </View>
        );
      })}

      {runCount > 0 && (
        <View style={s.cntRow}>
          <Icon name="flask" size={11} color={txtM} />
          <Text style={[s.cntTxt, { color: txtM }]}>{runCount} interaction{runCount > 1 ? 's' : ''}</Text>
        </View>
      )}
    </View>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SUB-COMPONENTS & HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function Stat({ icon, color, label, val, t1, tM }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={12} color={color} />
      <View>
        <Text style={[s.statVal, { color: t1 }]}>{val}</Text>
        <Text style={[s.statLbl, { color: tM }]}>{label}</Text>
      </View>
    </View>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STYLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const s = StyleSheet.create({
  root: { gap: SPACING.sm },
  tabRow: { gap: 8, paddingRight: SPACING.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, borderWidth: 1 },
  tabTxt: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  canvasOuter: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', height: SIM_H },
  canvas: { flex: 1, position: 'relative' },

  overlayTopRight: { position: 'absolute', top: 10, right: 10, alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 },
  badgeTxt: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  badgeData: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  // Enigma
  enigmaTape: { height: 44, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 15 },
  tapeText: { fontFamily: 'monospace', fontSize: 18, color: '#333', letterSpacing: 4 },
  clearBtn: { padding: 4 },
  rotorRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  rotor: { width: 44, height: 60, borderRadius: RADIUS.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rotorText: { fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold' },
  keyboard: { gap: 10, alignItems: 'center' },
  keyRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  keyWrapper: { width: 28, height: 40, borderRadius: RADIUS.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  // Timeline Slider
  timelineContainer: { position: 'absolute', bottom: 10, left: 10, right: 10, padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sliderLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  sliderTrack: { height: 24, borderRadius: 12, position: 'relative', overflow: 'hidden', justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  sliderThumb: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginLeft: -10 },
  scienceData: { fontFamily: FONTS.body, fontSize: 11, marginTop: 8, textAlign: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statVal: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  statLbl: { fontFamily: FONTS.body, fontSize: 9 },

  // Fact & Challenges
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: 12 },
  factIco: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  factTxt: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, flex: 1 },

  toast: { position: 'absolute', top: 10, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1, zIndex: 999 },
  toastTxt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  chToggle: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12 },
  chToggleInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chToggleTxt: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  chBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  chBarFill: { height: 4, borderRadius: 2 },
  chItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, marginTop: 4 },
  chIcoW: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chN: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  chD: { fontFamily: FONTS.body, fontSize: 10 },
  cntRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 4 },
  cntTxt: { fontFamily: FONTS.body, fontSize: 11 },
});
