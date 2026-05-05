import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import Svg, {
  Circle, Line, Text as SvgText, Rect, Path,
  Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Ellipse,
import Svg, { Rect, Line, Defs, Stop, RadialGradient, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');

const SIM_W    = width - SPACING.md * 4;
const SIM_H    = 320;
const GROUND_Y = SIM_H - 40;
const OBJ_START = 40;

// â”€â”€ Planet data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PLANETS = [
  { name: 'Moon',    g: 1.6,  color: '#A8EDEA', icon: 'moon'   },
  { name: 'Mars',    g: 3.7,  color: '#FF6B4A', icon: 'planet' },
  { name: 'Earth',   g: 9.8,  color: '#00E5A0', icon: 'earth'  },
  { name: 'Venus',   g: 8.9,  color: '#FFD166', icon: 'star'   },
  { name: 'Jupiter', g: 24.8, color: '#FF9F1C', icon: 'galaxy' },
  { name: 'Custom',  g: null, color: '#C3B1E1', icon: 'settings'},
];

// â”€â”€ Object data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OBJECTS = [
  { name: 'Ball',    mass: 1,    color: '#FF9F1C', size: 24, icon: 'target',   dragCoeff: 0.47 },
  { name: 'Feather', mass: 0.01, color: '#E8E8E8', size: 16, icon: 'leaf',     dragCoeff: 2.0  },
  { name: 'Hammer',  mass: 5,    color: '#888888', size: 28, icon: 'wrench',   dragCoeff: 0.8  },
  { name: 'Balloon', mass: 0.1,  color: '#FF6B9D', size: 22, icon: 'heart',    dragCoeff: 0.5  },
  { name: 'Rock',    mass: 50,   color: '#4ECDC4', size: 30, icon: 'blackhole', dragCoeff: 0.6  },
];

const CUSTOM_G_PRESETS = [0, 2, 5, 9.8, 15, 24.8, 30];
const AIR_PRESETS      = [0, 0.2, 0.5, 0.8, 1.0];
const HEIGHT_PRESETS   = [
  { label: '5m',    value: 5 },
  { label: '10m',   value: 10 },
  { label: '50m',   value: 50 },
  { label: '100m',  value: 100 },
  { label: '500m',  value: 500 },
  { label: '1km',   value: 1000 },
  { label: '10km',  value: 10000 },
];

// â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CHALLENGES = [
  { id: 'slow_fall', title: 'Slow Motion', desc: 'Make an object fall for more than 4 seconds', icon: 'clock', color: '#A8EDEA' },
  { id: 'speed_demon', title: 'Speed Demon', desc: 'Reach a velocity above 80 m/s', icon: 'zap', color: '#FF6B4A' },
  { id: 'multi_drop', title: 'Multiâ€‘Drop Master', desc: 'Drop 3+ objects at once', icon: 'balance', color: '#FFD166' },
  { id: 'zero_g', title: 'Zero Gravity', desc: 'Drop an object with gravity = 0', icon: 'rocket', color: '#C3B1E1' },
  { id: 'high_drop', title: 'Sky Diver', desc: 'Drop from 1km or higher', icon: 'flag', color: '#FF6B9D' },
];

export default function GravityLab({
  scientistMode = false,
  accentColor   = '#7B6FFF',
  onLabBreaker,
}) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const bg = (_themeObj || {}).bg?.base || '#0A0A0A';


  const [selPlanet,   setSelPlanet]   = useState(2);
  const [customG,     setCustomG]     = useState(9.8);
  const [airRes,      setAirRes]      = useState(0);
  const [dropHeight,  setDropHeight]  = useState(10); // meters
  const [dropping,    setDropping]    = useState(false);
  const [hasDropped,  setHasDropped]  = useState(false);
  const [dropCount,   setDropCount]   = useState(0);
  const [completedChallenges, setCompleted] = useState([]);
  const [showChallenges, setShowChallenges] = useState(false);
  const [lastChallengeMsg, setLastChallengeMsg] = useState(null);

  // Multi-object selection (indices into OBJECTS)
  const [selectedObjs, setSelectedObjs] = useState([0]);
  // Results for each dropped object
  const [dropResults, setDropResults] = useState([]);
  // Show insights panel
  const [showInsights, setShowInsights] = useState(false);

  // Animated values for up to 5 objects
  const objYAnims = useRef(OBJECTS.map(() => new Animated.Value(OBJ_START))).current;

  const particleAnims = useRef([...Array(10)].map(() => ({
    x: new Animated.Value(0), y: new Animated.Value(0), op: new Animated.Value(0),
  }))).current;

  const impactAnim = useRef(new Animated.Value(0)).current;
  const dropBtnScale = useRef(new Animated.Value(1)).current;
  const challengePopAnim = useRef(new Animated.Value(0)).current;

  const interval  = useRef(null);
  const startTs   = useRef(null);
  // Per-object sim state
  const simState  = useRef([]);

  const getG = () => PLANETS[selPlanet].g ?? customG;

  const toggleObject = (idx) => {
    soundTap();
    setSelectedObjs(prev => {
      if (prev.includes(idx)) {
        return prev.length > 1 ? prev.filter(i => i !== idx) : prev;
      }
      return [...prev, idx];
    });
    resetSim();
  };

  const resetSim = () => {
    clearInterval(interval.current);
    objYAnims.forEach(a => a.setValue(OBJ_START));
    impactAnim.setValue(0);
    setDropping(false);
    setHasDropped(false);
    setDropResults([]);
    setShowInsights(false);
    simState.current = [];
  };

  // Check and award challenges
  const checkChallenges = useCallback((results) => {
    const g = getG();
    const newDone = [...completedChallenges];
    let msg = null;

    const anySlowFall = results.some(r => r.time > 4);
    if (anySlowFall && !newDone.includes('slow_fall')) {
      newDone.push('slow_fall');
      msg = CHALLENGES.find(c => c.id === 'slow_fall');
    }
    const anyFast = results.some(r => r.finalVel > 80);
    if (anyFast && !newDone.includes('speed_demon')) {
      newDone.push('speed_demon');
      msg = CHALLENGES.find(c => c.id === 'speed_demon');
    }
    if (selectedObjs.length >= 3 && !newDone.includes('multi_drop')) {
      newDone.push('multi_drop');
      msg = CHALLENGES.find(c => c.id === 'multi_drop');
    }
    if (g === 0 && !newDone.includes('zero_g')) {
      newDone.push('zero_g');
      msg = CHALLENGES.find(c => c.id === 'zero_g');
    }
    if (dropHeight >= 1000 && !newDone.includes('high_drop')) {
      newDone.push('high_drop');
      msg = CHALLENGES.find(c => c.id === 'high_drop');
    }

    if (msg) {
      setLastChallengeMsg(msg);
      soundBadge();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      challengePopAnim.setValue(0);
      Animated.sequence([
        Animated.spring(challengePopAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(challengePopAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setLastChallengeMsg(null));
    }
    setCompleted(newDone);
  }, [completedChallenges, selectedObjs.length, dropHeight]);

  const triggerImpact = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(impactAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(impactAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    particleAnims.forEach((p, i) => {
      const angle = (i / 10) * Math.PI * 2;
      p.op.setValue(1); p.x.setValue(0); p.y.setValue(0);
      Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * 45, duration: 500, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * 35, duration: 500, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const pulseDrop = () => {
    Animated.sequence([
      Animated.spring(dropBtnScale, { toValue: 0.93, tension: 300, friction: 8, useNativeDriver: true }),
      Animated.spring(dropBtnScale, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const startDrop = () => {
    soundWhoosh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseDrop();
    resetSim();

    const g = getG();
    if ((g <= 0.5 || g >= 20) && onLabBreaker) setTimeout(onLabBreaker, 500);

    setDropping(true);
    setHasDropped(true);
    setDropCount(c => c + 1);
    startTs.current = Date.now();

    // Visual fall distance in px
    const fallDistPx = GROUND_Y - OBJ_START - 30;
    // Scale factor: map real height (m) to pixels
    const pixPerMeter = fallDistPx / dropHeight;
    const DT = 0.016; // sim timestep

    // Init per-object state
    simState.current = selectedObjs.map(idx => ({
      idx,
      vel: 0,
      pos: 0, // meters fallen
      posPx: 0,
      done: false,
      startTime: Date.now(),
      endTime: null,
      finalVel: 0,
    }));

    interval.current = setInterval(() => {
      const gNow = getG();
      let allDone = true;

      simState.current.forEach(s => {
        if (s.done) return;
        allDone = false;

        const obj = OBJECTS[s.idx];
        const drag = airRes * obj.dragCoeff * s.vel * s.vel * 0.001 / Math.max(obj.mass, 0.001);
        s.vel += (gNow - drag) * DT;
        if (s.vel < 0) s.vel = 0;
        s.pos += s.vel * DT;
        s.posPx = Math.min(s.pos * pixPerMeter, fallDistPx);

        objYAnims[s.idx].setValue(OBJ_START + s.posPx);

        if (s.pos >= dropHeight) {
          s.pos = dropHeight;
          s.posPx = fallDistPx;
          s.done = true;
          s.endTime = Date.now();
          s.finalVel = s.vel;
          objYAnims[s.idx].setValue(OBJ_START + fallDistPx);
        }
      });

      if (allDone) {
        clearInterval(interval.current);
        setDropping(false);
        triggerImpact();

        // Build results
        const results = simState.current.map(s => {
          const obj = OBJECTS[s.idx];
          const time = Math.round((s.endTime - s.startTime) / 10) / 100;
          const physicsTime = Math.sqrt(2 * dropHeight / Math.max(gNow, 0.01));
          return {
            name: obj.name,
            icon: obj.icon,
            color: obj.color,
            mass: obj.mass,
            time,
            physicsTime: Math.round(physicsTime * 100) / 100,
            finalVel: Math.round(s.finalVel * 10) / 10,
            finalVelKmh: Math.round(s.finalVel * 3.6),
            kineticEnergy: Math.round(0.5 * obj.mass * s.finalVel * s.finalVel * 10) / 10,
          };
        });
        setDropResults(results);
        setShowInsights(true);
        checkChallenges(results);
      }
    }, 16);
  };

  useEffect(() => () => clearInterval(interval.current), []);

  const planet = PLANETS[selPlanet];
  const g      = getG();

  const ringScale = impactAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const ringOp    = impactAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });

  const formatHeight = (h) => {
    if (h >= 1000) return `${(h / 1000).toFixed(h >= 10000 ? 0 : 1)} km`;
    return `${h} m`;
  };

  // Theory-based estimated time (no air)
  const estTime = Math.sqrt(2 * dropHeight / Math.max(g, 0.01)).toFixed(2);
  const estVel  = Math.round(Math.sqrt(2 * g * dropHeight) * 10) / 10;

  const getFunFact = () => {
    if (g === 0) return "No gravity! The objects float forever â€” just like deep space.";
    if (dropHeight >= 10000) return `From ${formatHeight(dropHeight)}, that's almost as high as a commercial airplane!`;
    if (dropHeight >= 1000) return `From ${formatHeight(dropHeight)}, a free-falling human would reach terminal velocity (~53 m/s).`;
    if (g < 3)   return `On ${planet.name}, you could jump ${(3.5 / g * 1.5).toFixed(1)}Ã— higher than on Earth!`;
    if (g > 20)  return `On ${planet.name}, you'd feel ${(g / 9.8).toFixed(1)}Ã— heavier. Standing would be exhausting!`;
    return `From ${formatHeight(dropHeight)}, objects hit at ~${Math.round(estVel * 3.6)} km/h â€” ${estVel > 50 ? 'deadly fast!' : 'pretty quick!'}`;
  };

  return (
    <View style={styles.container}>

      {/* â”€â”€ Challenge popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {lastChallengeMsg && (
        <Animated.View style={[styles.challengePopup, {
          opacity: challengePopAnim,
          backgroundColor: lastChallengeMsg.color + '20',
          borderColor: lastChallengeMsg.color + '60',
          transform: [{ translateY: challengePopAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <Icon name="trophy" size={18} color={lastChallengeMsg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengePopTitle, { color: lastChallengeMsg.color }]}>Challenge Complete!</Text>
            <Text style={[styles.challengePopDesc, { color: txt2 }]}>{lastChallengeMsg.title}</Text>
          </View>
        </Animated.View>
      )}

      {/* â”€â”€ Planet selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionLabel icon="planet" label="Choose a Planet ðŸª" color={accentColor} txtM={txtM} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {PLANETS.map((p, i) => {
          const active = selPlanet === i;
          return (
            <TouchableOpacity key={p.name} onPress={() => { soundTap(); setSelPlanet(i); resetSim(); }} activeOpacity={0.75}>
              <LinearGradient
                colors={active ? [p.color + '30', p.color + '12'] : [glass2, glass1]}
                style={[styles.chip, { borderColor: active ? p.color + '80' : border }]}
              >
                <View style={[styles.chipIconWrap, { backgroundColor: p.color + '20' }]}>
                  <Icon name={p.icon} size={18} color={active ? p.color : txtM} />
                </View>
                <Text style={[styles.chipName, { color: active ? p.color : txtM }]}>{p.name}</Text>
                {p.g != null && (
                  <Text style={[styles.chipSub, { color: active ? p.color + 'AA' : txtM }]}>{p.g} m/sÂ²</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* â”€â”€ Custom gravity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {selPlanet === 5 && (
        <View style={[styles.controlCard, { backgroundColor: glass1, borderColor: border }]}>
          <View style={styles.controlLabelRow}>
            <Icon name="settings" size={14} color={planet.color} />
            <Text style={[styles.controlLabel, { color: txt2 }]}>
              Custom Gravity ðŸŽ›ï¸: <Text style={{ color: txt1 }}>{customG.toFixed(1)}</Text> m/sÂ²
            </Text>
          </View>
          <View style={[styles.fillTrack, { backgroundColor: glass2 }]}>
            <View style={[styles.fillBar, { width: `${(customG / 30) * 100}%`, backgroundColor: planet.color }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
            {CUSTOM_G_PRESETS.map(v => (
              <Preset key={v} label={String(v)} active={customG === v} activeColor={planet.color}
                txtM={txtM} glass1={glass1} border={border}
                onPress={() => { soundTap(); setCustomG(v); resetSim(); }} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* â”€â”€ Drop Height selector ðŸ†• â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SectionLabel icon="ruler" label="Drop Height ðŸ“" color={accentColor} txtM={txtM} />
      <View style={[styles.controlCard, { backgroundColor: glass1, borderColor: border }]}>
        <View style={styles.controlLabelRow}>
          <Icon name="drop" size={14} color={accentColor} />
          <Text style={[styles.controlLabel, { color: txt2 }]}>
            Height: <Text style={{ color: txt1, fontFamily: FONTS.displayMedium }}>{formatHeight(dropHeight)}</Text>
          </Text>
        </View>
        <View style={[styles.fillTrack, { backgroundColor: glass2 }]}>
          <View style={[styles.fillBar, {
            width: `${(Math.log10(dropHeight) / Math.log10(10000)) * 100}%`,
            backgroundColor: accentColor,
          }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
          {HEIGHT_PRESETS.map(h => (
            <Preset key={h.value} label={h.label} active={dropHeight === h.value}
              activeColor={accentColor} txtM={txtM} glass1={glass1} border={border}
              onPress={() => { soundTap(); setDropHeight(h.value); resetSim(); }} />
          ))}
        </ScrollView>
      </View>

      {/* â”€â”€ Object selector (multi-select) ðŸ†• â”€â”€ */}
      <SectionLabel icon="target" label="Select Objects ðŸŽ¯ (tap multiple)" color={accentColor} txtM={txtM} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.objectRow}>
        {OBJECTS.map((o, i) => {
          const active = selectedObjs.includes(i);
          return (
            <TouchableOpacity key={o.name} onPress={() => toggleObject(i)} activeOpacity={0.75}>
              <LinearGradient
                colors={active ? [o.color + '30', o.color + '12'] : [glass2, glass1]}
                style={[styles.objectChip, { borderColor: active ? o.color + '80' : border }]}
              >
                {/* Multi-select check badge */}
                {active && (
                  <View style={[styles.checkBadge, { backgroundColor: o.color }]}>
                    <Icon name="check" size={10} color="#fff" />
                  </View>
                )}
                <View style={[styles.chipIconWrap, { backgroundColor: o.color + '20' }]}>
                  <Icon name={o.icon} size={16} color={active ? o.color : txtM} />
                </View>
                <Text style={[styles.objName, { color: active ? o.color : txtM }]}>{o.name}</Text>
                <Text style={[styles.objMass, { color: txtM }]}>{o.mass}kg</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected count */}
      <View style={[styles.selCountRow, { borderColor: border }]}>
        <Icon name="balance" size={13} color={accentColor} />
        <Text style={[styles.selCountText, { color: txt2 }]}>
          {selectedObjs.length} object{selectedObjs.length > 1 ? 's' : ''} selected
          {selectedObjs.length > 1 ? ' â€” will drop simultaneously!' : ''}
        </Text>
      </View>

      {/* â”€â”€ Air resistance (scientist mode) â”€â”€â”€â”€ */}
      {scientistMode && (
        <View style={[styles.controlCard, { backgroundColor: glass1, borderColor: border }]}>
          <View style={styles.controlLabelRow}>
            <Icon name="waves" size={14} color="#4ECDC4" />
            <Text style={[styles.controlLabel, { color: txt2 }]}>
              Air Resistance ðŸŒªï¸: <Text style={{ color: txt1 }}>{Math.round(airRes * 100)}%</Text>
            </Text>
          </View>
          <View style={[styles.fillTrack, { backgroundColor: glass2 }]}>
            <View style={[styles.fillBar, { width: `${airRes * 100}%`, backgroundColor: '#4ECDC4' }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
            {AIR_PRESETS.map(v => (
              <Preset key={v} label={`${Math.round(v * 100)}%`} active={airRes === v}
                activeColor="#4ECDC4" txtM={txtM} glass1={glass1} border={border}
                onPress={() => { soundTap(); setAirRes(v); resetSim(); }} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* â”€â”€ Simulation canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[styles.simBox, { borderColor: accentColor + '40', backgroundColor: isDark ? 'rgba(8,8,20,0.85)' : 'rgba(230,235,250,0.95)' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="bg" cx="50%" cy="0%" r="90%">
              <Stop offset="0%" stopColor={accentColor} stopOpacity="0.10" />
              <Stop offset="100%" stopColor={isDark ? '#000' : '#fff'} stopOpacity="0" />
            </RadialGradient>
            <SvgLinearGradient id="ground" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={accentColor} stopOpacity="0.0" />
              <Stop offset="50%" stopColor={accentColor} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </SvgLinearGradient>
          </Defs>

          <Rect x="0" y="0" width={SIM_W} height={SIM_H} fill="url(#bg)" />

          {/* Grid lines with height labels */}
          {[0, 1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <Line x1="0" y1={i * 60 + OBJ_START} x2={SIM_W} y2={i * 60 + OBJ_START}
                stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
              <SvgText x={6} y={i * 60 + OBJ_START + 12}
                fontSize="8" fill={isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)'} fontFamily="monospace">
                {formatHeight(Math.round(dropHeight * (1 - i / 4)))}
              </SvgText>
            </React.Fragment>
          ))}

          <Line x1="0" y1={GROUND_Y} x2={SIM_W} y2={GROUND_Y} stroke="url(#ground)" strokeWidth="2" />
          <Rect x="0" y={GROUND_Y} width={SIM_W} height={40} fill={accentColor} fillOpacity="0.03" />
          <SvgText x={SIM_W / 2} y={GROUND_Y + 22} fontSize="9"
            fill={accentColor} fillOpacity="0.5" fontFamily="monospace" textAnchor="middle" letterSpacing={3}>
            GROUND
          </SvgText>

          {/* Planet + height badge */}
          <Rect x={SIM_W - 130} y={8} width={122} height={24} rx="6" fill={planet.color} fillOpacity="0.12" />
          <SvgText x={SIM_W - 8} y={24} fontSize="10" fill={planet.color} fillOpacity="0.90"
            textAnchor="end" fontFamily="monospace">
            {planet.name} g={g} h={formatHeight(dropHeight)}
          </SvgText>
        </Svg>

        {/* Animated falling objects â€” all selected */}
        {selectedObjs.map((objIdx, lane) => {
          const obj = OBJECTS[objIdx];
          const laneOffset = selectedObjs.length > 1
            ? -((selectedObjs.length - 1) * 20) + lane * 40
            : 0;
          return (
            <Animated.View key={objIdx} style={[styles.ball, {
              top: objYAnims[objIdx],
              left: SIM_W / 2 - obj.size / 2 + laneOffset,
              width: obj.size + 8, height: obj.size + 8,
              borderRadius: (obj.size + 8) / 2,
              backgroundColor: obj.color + '25',
              borderColor: obj.color + 'AA',
              shadowColor: obj.color,
            }]}>
              <Icon name={obj.icon} size={obj.size - 4} color={obj.color} />
            </Animated.View>
          );
        })}

        {/* Impact ring */}
        <Animated.View pointerEvents="none" style={[styles.impactRing, {
          left: SIM_W / 2 - 30, top: GROUND_Y - 30,
          borderColor: accentColor, transform: [{ scale: ringScale }], opacity: ringOp,
        }]} />

        {/* Particles */}
        {particleAnims.map((p, i) => (
          <Animated.View key={i} style={[styles.particle, {
            left: SIM_W / 2, top: GROUND_Y - 6,
            backgroundColor: OBJECTS[selectedObjs[0]].color,
            transform: [{ translateX: p.x }, { translateY: p.y }], opacity: p.op,
          }]} />
        ))}
      </View>

      {/* â”€â”€ Stats row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={styles.statsBar}>
        <StatPill icon="planet" iconColor={planet.color} label="Gravity" value={`${g} m/sÂ²`} color={planet.color} txtM={txtM} txt1={txt1} />
        <StatPill icon="ruler" iconColor={accentColor} label="Height" value={formatHeight(dropHeight)} color={accentColor} txtM={txtM} txt1={txt1} />
        <StatPill icon="clock" iconColor={accentColor} label="Est." value={`~${estTime}s`} color={accentColor} txtM={txtM} txt1={txt1} />
        <StatPill icon="balance" iconColor={txt2} label="Objects" value={String(selectedObjs.length)} color={txt1} txtM={txtM} txt1={txt1} />
      </View>

      {/* â”€â”€ Drop counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {dropCount > 0 && (
        <View style={[styles.dropCountBadge, { backgroundColor: glass1, borderColor: border }]}>
          <Icon name="flask" size={12} color={accentColor} />
          <Text style={[styles.dropCountText, { color: txt2 }]}>Experiments: {dropCount}</Text>
        </View>
      )}

      {/* â”€â”€ Drop button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View style={[styles.dropBtnWrap, { transform: [{ scale: dropBtnScale }] }]}>
        <TouchableOpacity onPress={dropping ? undefined : startDrop} activeOpacity={dropping ? 1 : 0.85}
          style={{ borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1,
            borderColor: dropping ? border : accentColor + '80' }}>
          <LinearGradient
            colors={dropping ? [glass1, glass1] : [accentColor + '40', accentColor + '20']}
            style={styles.dropBtnGrad}>
            <View style={styles.dropBtnInner}>
              <Icon name={dropping ? 'drop' : hasDropped ? 'refresh' : 'zap'} size={20}
                color={dropping ? txtM : txt1} />
              <Text style={[styles.dropBtnText, { color: dropping ? txtM : txt1 }]}>
                {dropping ? 'Fallingâ€¦' : hasDropped ? 'Drop Again' : selectedObjs.length > 1 ? `Drop ${selectedObjs.length} Objects!` : 'Drop!'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* â”€â”€ Comparison Insights Table ðŸ†• â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showInsights && dropResults.length > 0 && (
        <View style={[styles.insightsCard, { backgroundColor: glass1, borderColor: border }]}>
          <View style={styles.insightsHeader}>
            <Icon name="balance" size={16} color={accentColor} />
            <Text style={[styles.insightsTitle, { color: txt1 }]}>
              {dropResults.length > 1 ? 'Comparison Insights' : 'Drop Results'}
            </Text>
          </View>

          {/* Table header */}
          <View style={[styles.tableRow, styles.tableHeaderRow, { borderBottomColor: border }]}>
            <Text style={[styles.thCell, styles.thObject, { color: txtM }]}>Object</Text>
            <Text style={[styles.thCell, { color: txtM }]}>Time</Text>
            <Text style={[styles.thCell, { color: txtM }]}>Velocity</Text>
            <Text style={[styles.thCell, { color: txtM }]}>Energy</Text>
          </View>

          {/* Rows sorted by time (fastest first) */}
          {dropResults
            .sort((a, b) => a.time - b.time)
            .map((r, i) => {
              const isFastest = i === 0 && dropResults.length > 1;
              const isSlowest = i === dropResults.length - 1 && dropResults.length > 1;
              return (
                <View key={r.name} style={[styles.tableRow, { borderBottomColor: border }]}>
                  <View style={[styles.tdObject]}>
                    <View style={[styles.tdIcon, { backgroundColor: r.color + '20' }]}>
                      <Icon name={r.icon} size={12} color={r.color} />
                    </View>
                    <View>
                      <Text style={[styles.tdName, { color: r.color }]}>{r.name}</Text>
                      {isFastest && <Text style={[styles.tdBadge, { color: '#00D4A0' }]}>âš¡ Fastest</Text>}
                      {isSlowest && <Text style={[styles.tdBadge, { color: '#FF9F1C' }]}>ðŸ¢ Slowest</Text>}
                    </View>
                  </View>
                  <Text style={[styles.tdCell, { color: txt1 }]}>{r.time}s</Text>
                  <View>
                    <Text style={[styles.tdCell, { color: txt1 }]}>{r.finalVel} m/s</Text>
                    <Text style={[styles.tdCellSub, { color: txtM }]}>{r.finalVelKmh} km/h</Text>
                  </View>
                  <Text style={[styles.tdCell, { color: txt1 }]}>{r.kineticEnergy}J</Text>
                </View>
              );
            })}

          {/* Analysis section for multi-drop */}
          {dropResults.length > 1 && (
            <View style={[styles.analysisBox, { backgroundColor: glass2, borderColor: border }]}>
              <Icon name="lightbulb" size={14} color={accentColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.analysisTitle, { color: accentColor }]}>Key Insight</Text>
                {airRes === 0 ? (
                  <Text style={[styles.analysisText, { color: txt2 }]}>
                    Without air resistance, all objects hit the ground at the same time! Mass doesn't affect fall speed in a vacuum â€” Galileo proved this ~400 years ago.
                  </Text>
                ) : (
                  <Text style={[styles.analysisText, { color: txt2 }]}>
                    With air resistance ({Math.round(airRes * 100)}%), lighter objects with higher drag slow down more. The heavier {dropResults[0].name} ({dropResults[0].mass}kg) reached the ground {Math.abs(dropResults[dropResults.length - 1].time - dropResults[0].time).toFixed(2)}s faster than {dropResults[dropResults.length - 1].name} ({dropResults[dropResults.length - 1].mass}kg).
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* â”€â”€ Fun fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {hasDropped && !dropping && (
        <View style={[styles.funFact, { borderColor: border, backgroundColor: glass1 }]}>
          <View style={[styles.funFactIcon, { backgroundColor: accentColor + '20', borderColor: accentColor + '30' }]}>
            <Icon name="lightbulb" size={16} color={accentColor} />
          </View>
          <Text style={[styles.funFactText, { color: txt2 }]}>{getFunFact()}</Text>
        </View>
      )}

      {/* â”€â”€ Challenges panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TouchableOpacity onPress={() => { setShowChallenges(!showChallenges); soundTap(); }} activeOpacity={0.75}
        style={[styles.challengeToggle, { borderColor: border, backgroundColor: glass1 }]}>
        <View style={styles.challengeToggleInner}>
          <Icon name="trophy" size={16} color={accentColor} />
          <Text style={[styles.challengeToggleText, { color: txt1 }]}>
            Challenges ({completedChallenges.length}/{CHALLENGES.length})
          </Text>
          <Icon name={showChallenges ? 'close' : 'forward'} size={14} color={txtM} />
        </View>
        <View style={[styles.challengeProgress, { backgroundColor: glass2 }]}>
          <View style={[styles.challengeProgressFill, { width: `${(completedChallenges.length / CHALLENGES.length) * 100}%`, backgroundColor: accentColor }]} />
        </View>
      </TouchableOpacity>

      {showChallenges && (
        <View style={[styles.challengeList, { borderColor: border, backgroundColor: glass1 }]}>
          {CHALLENGES.map(c => {
            const done = completedChallenges.includes(c.id);
            return (
              <View key={c.id} style={[styles.challengeItem, { borderBottomColor: border }]}>
                <View style={[styles.challengeIcon, {
                  backgroundColor: done ? c.color + '20' : glass2,
                  borderColor: done ? c.color + '40' : border,
                }]}>
                  <Icon name={done ? 'check' : c.icon} size={16} color={done ? c.color : txtM} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.challengeTitle, { color: done ? c.color : txt1, textDecorationLine: done ? 'line-through' : 'none' }]}>
                    {c.title}
                  </Text>
                  <Text style={[styles.challengeDesc, { color: txtM }]}>{c.desc}</Text>
                </View>
                {done && <Icon name="star" size={14} color={c.color} filled />}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 24 }} />
    </View>
  );
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionLabel({ icon, label, color, txtM }) {
  return (
    <View style={sl.row}>
      <Icon name={icon} size={12} color={color || txtM} />
      <Text style={[sl.label, { color: txtM }]}>{label}</Text>
    </View>
  );
}
const sl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 10 },
  label: { fontFamily: FONTS.bodyMedium, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
});

function Preset({ label, active, activeColor, onPress, txtM, glass1, border }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={active ? [activeColor + '28', activeColor + '10'] : [glass1, glass1]}
        style={[presetS.btn, { borderColor: active ? activeColor + '70' : border }]}
      >
        <Text style={[presetS.text, { color: active ? activeColor : txtM }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const presetS = StyleSheet.create({
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1 },
  text: { fontFamily: FONTS.body, fontSize: 12 },
});

function StatPill({ icon, iconColor, label, value, color, txtM, txt1 }) {
  return (
    <View style={spS.wrap}>
      <Icon name={icon} size={14} color={iconColor || txtM} />
      <Text style={[spS.label, { color: txtM }]}>{label}</Text>
      <Text style={[spS.value, { color: color || txt1 }]}>{value}</Text>
    </View>
  );
}
const spS = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 64, gap: 2 },
  label: { fontFamily: FONTS.body, fontSize: 10, letterSpacing: 0.3 },
  value: { fontFamily: FONTS.displayMedium, fontSize: 13 },
});

// â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md },
  chipRow: { gap: 8, paddingRight: SPACING.sm, paddingBottom: 4 },
  chip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: RADIUS.md, borderWidth: 1, minWidth: 72,
  },
  chipIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  chipName: { fontFamily: FONTS.bodyMedium, fontSize: 11, marginTop: 2 },
  chipSub: { fontFamily: FONTS.body, fontSize: 10, marginTop: 2 },
  controlCard: { borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginBottom: 4 },
  controlLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  controlLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  fillTrack: { height: 4, borderRadius: 2, marginBottom: 10, overflow: 'hidden' },
  fillBar: { height: 4, borderRadius: 2 },
  presetRow: { flexDirection: 'row', gap: 6, paddingRight: SPACING.sm },
  objectRow: { flexDirection: 'row', gap: 8, paddingRight: SPACING.sm, paddingBottom: 4 },
  objectChip: {
    alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: RADIUS.md, borderWidth: 1, minWidth: 60,
    position: 'relative', overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute', top: 4, right: 4, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  objName: { fontFamily: FONTS.body, fontSize: 10, marginTop: 2, textAlign: 'center' },
  objMass: { fontFamily: FONTS.body, fontSize: 9, marginTop: 1 },
  selCountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 4, marginTop: 4,
  },
  selCountText: { fontFamily: FONTS.body, fontSize: 12 },

  toggleWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 12 },
  toggleBtn: {
    borderWidth: 1, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  toggleIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleText: { fontFamily: FONTS.body, fontSize: 13, flex: 1 },
  togglePill: {
    width: 38, height: 21, borderRadius: 11,
    backgroundColor: 'rgba(128,128,128,0.20)',
    borderWidth: 1, padding: 2, justifyContent: 'center',
  },
  toggleThumb: {
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.40)', alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end', backgroundColor: '#FFFFFF' },

  simBox: {
    width: SIM_W, height: SIM_H,
    borderRadius: RADIUS.lg, borderWidth: 1,
    marginTop: 16, position: 'relative', overflow: 'hidden',
  },
  ball: {
    position: 'absolute', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, shadowOpacity: 0.7, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  impactRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  particle: { position: 'absolute', width: 5, height: 5, borderRadius: 3 },

  statsBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4, marginTop: 12, marginBottom: 8, flexWrap: 'wrap', gap: 8,
  },

  dropCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', borderRadius: RADIUS.full, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6,
  },
  dropCountText: { fontFamily: FONTS.body, fontSize: 11 },

  dropBtnWrap: { marginTop: 4 },
  dropBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  dropBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, letterSpacing: 0.3 },

  // â”€â”€ Insights Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  insightsCard: {
    marginTop: 12, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden',
  },
  insightsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, paddingBottom: 8,
  },
  insightsTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeaderRow: { paddingVertical: 6 },
  thCell: { fontFamily: FONTS.bodyMedium, fontSize: 10, flex: 1, letterSpacing: 0.5, textTransform: 'uppercase' },
  thObject: { flex: 1.5 },
  tdObject: { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tdIcon: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  tdName: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  tdBadge: { fontFamily: FONTS.body, fontSize: 9, marginTop: 1 },
  tdCell: { fontFamily: FONTS.displayMedium, fontSize: 12, flex: 1 },
  tdCellSub: { fontFamily: FONTS.body, fontSize: 9 },

  analysisBox: {
    flexDirection: 'row', gap: 8, padding: 12, margin: 8,
    borderRadius: RADIUS.sm, borderWidth: 1, alignItems: 'flex-start',
  },
  analysisTitle: { fontFamily: FONTS.displayMedium, fontSize: 12, marginBottom: 2 },
  analysisText: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },

  // â”€â”€ Fun fact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  funFact: {
    marginTop: 12, borderRadius: RADIUS.md, borderWidth: 1, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  funFactIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0, marginTop: 1,
  },
  funFactText: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 21, flex: 1 },

  // â”€â”€ Challenge popup/list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  challengePopup: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, borderWidth: 1.5, padding: 12, marginBottom: 8,
  },
  challengePopTitle: { fontFamily: FONTS.displayMedium, fontSize: 13 },
  challengePopDesc: { fontFamily: FONTS.body, fontSize: 12 },
  challengeToggle: {
    borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginTop: 12,
  },
  challengeToggleInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeToggleText: { fontFamily: FONTS.bodyMedium, fontSize: 14, flex: 1 },
  challengeProgress: { height: 3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  challengeProgressFill: { height: 3, borderRadius: 2 },
  challengeList: { borderRadius: RADIUS.md, borderWidth: 1, marginTop: 6, overflow: 'hidden' },
  challengeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 1,
  },
  challengeIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  challengeTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  challengeDesc: { fontFamily: FONTS.body, fontSize: 11 },
});
