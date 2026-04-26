import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';
import { soundTap, soundTrophy } from '../../utils/sounds';

// Standard Components
import StatusCard from '../../components/lab/StatusCard';
import SimBox from '../../components/lab/SimBox';
import ChallengeCard from '../../components/lab/ChallengeCard';
import ScientistCard from '../../components/lab/ScientistCard';

const { width } = Dimensions.get('window');
const CANVAS_H = 300;
const CANVAS_W = width - 40;
const MID_Y = CANVAS_H / 2;

const CHALLENGES = [
  { id: 1, title: "Silence is Golden", instruction: "Achieve perfect destructive interference (Resulting amplitude = 0).", target: 'destructive', completed: false },
  { id: 2, title: "Octave Shift", instruction: "Set Wave 2 to exactly double the frequency of Wave 1 (Ratio 2:1).", target: 'octave', completed: false },
  { id: 3, title: "Resonance Peak", instruction: "Maximize the combined amplitude to over 150 units.", target: 'max', completed: false },
  { id: 4, title: "Phase Shift", instruction: "Achieve constructive interference exactly 180 degrees offset.", target: 'phase', completed: false },
];

export default function LabSimulation({ scientistMode }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  
  // Wave 1 State
  const [amp1, setAmp1] = useState(40);
  const [freq1, setFreq1] = useState(2);
  const [phase1, setPhase1] = useState(0);
  
  // Wave 2 State
  const [amp2, setAmp2] = useState(40);
  const [freq2, setFreq2] = useState(2);
  const [phase2, setPhase2] = useState(180);
  
  // UI State
  const [showSum, setShowSum] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(CHALLENGES);
  
  const [time, setTime] = useState(0);
  const requestRef = useRef(null);

  const animate = useCallback((t) => {
    setTime(prev => prev + 0.05);
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Generate Path Data
  const generatePath = (amp, freq, phase, offset = 0) => {
    let d = `M 0 ${MID_Y + offset}`;
    const step = 2;
    for (let x = 0; x <= CANVAS_W; x += step) {
      const y = MID_Y + offset + amp * Math.sin((x / 20) * freq + (phase * Math.PI / 180) + time);
      d += ` L ${x} ${y}`;
    }
    return d;
  };

  const generateSumPath = () => {
    let d = `M 0 ${MID_Y}`;
    const step = 2;
    for (let x = 0; x <= CANVAS_W; x += step) {
      const y1 = amp1 * Math.sin((x / 20) * freq1 + (phase1 * Math.PI / 180) + time);
      const y2 = amp2 * Math.sin((x / 20) * freq2 + (phase2 * Math.PI / 180) + time);
      d += ` L ${x} ${MID_Y + y1 + y2}`;
    }
    return d;
  };

  const checkChallenges = () => {
    const chal = CHALLENGES[activeChallenge];
    let success = false;
    
    if (activeChallenge === 0) { // Destructive
       if (freq1 === freq2 && amp1 === amp2 && Math.abs((phase1 - phase2) % 360) === 180) success = true;
    }
    if (activeChallenge === 1) { // Octave
       if (freq2 / freq1 === 2) success = true;
    }
    if (activeChallenge === 2) { // Max
       if (freq1 === freq2 && phase1 === phase2 && (amp1 + amp2) > 80) success = true;
    }

    if (success) {
      const newStatus = [...challengeStatus];
      if (!newStatus[activeChallenge].completed) {
        newStatus[activeChallenge].completed = true;
        setChallengeStatus(newStatus);
        soundTrophy();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  useEffect(() => {
    checkChallenges();
  }, [amp1, freq1, phase1, amp2, freq2, phase2]);

  return (
    <View style={styles.container}>
      {/* 1. Status Cards */}
      <View style={styles.header}>
        <StatusCard 
          label="FREQUENCY" 
          value={freq1} 
          unit="Hz" 
          icon="activity" 
          color="#4ECDC4" 
        />
        <StatusCard 
          label="AMPLITUDE" 
          value={amp1} 
          unit="px" 
          icon="link" 
          color="#FF6B6B" 
        />
        <StatusCard 
          label="INTERFERENCE" 
          value={Math.abs(phase1 - phase2) === 180 ? "DESTRUCTIVE" : "PHASED"} 
          unit="" 
          icon="grid" 
          color="#FFD166" 
        />
      </View>

      {/* 2. Simulation Box */}
      <SimBox>
        <Svg width={CANVAS_W} height={CANVAS_H}>
          <Defs>
            <LinearGradient id="wave1Grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#4ECDC4" />
              <Stop offset="1" stopColor="#00D4FF" />
            </LinearGradient>
          </Defs>

          {/* Grid Background */}
          {Array.from({ length: 10 }).map((_, i) => (
             <Line key={i} x1="0" y1={(i * CANVAS_H) / 10} x2={CANVAS_W} y2={(i * CANVAS_H) / 10} stroke="#333" strokeOpacity={0.2} />
          ))}
          <Line x1="0" y1={MID_Y} x2={CANVAS_W} y2={MID_Y} stroke={isDark ? "#FFF" : "#000"} strokeOpacity={0.3} />

          {/* Trace 1 */}
          <Path d={generatePath(amp1, freq1, phase1)} stroke="#4ECDC4" strokeWidth="2" fill="none" opacity={0.5} />
          
          {/* Trace 2 */}
          <Path d={generatePath(amp2, freq2, phase2)} stroke="#FF6B6B" strokeWidth="2" fill="none" opacity={0.5} />
          
          {/* Sum Trace */}
          {showSum && (
            <Path d={generateSumPath()} stroke="#FFD166" strokeWidth="3" fill="none" />
          )}

          {/* Scientist Mode Markers */}
          {scientistMode && (
            <G>
              <Circle cx={CANVAS_W / 2} cy={MID_Y} r="4" fill={color} />
              <SvgText x={CANVAS_W / 2 + 10} y={MID_Y - 10} fill={color} fontSize="10" fontFamily={FONTS.mono}>
                NODE (Center)
              </SvgText>
            </G>
          )}
        </Svg>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <Text style={[styles.groupTitle, { color: '#4ECDC4' }]}>WAVE A</Text>
            <View style={styles.miniCtrl}>
              <TouchableOpacity onPress={() => setFreq1(Math.max(1, freq1 - 1))} style={styles.miniBtn}>
                <Icon name="minus" size={12} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.miniVal}>{freq1}Hz</Text>
              <TouchableOpacity onPress={() => setFreq1(Math.min(10, freq1 + 1))} style={styles.miniBtn}>
                <Icon name="plus" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.miniCtrl}>
              <TouchableOpacity onPress={() => setAmp1(Math.max(0, amp1 - 10))} style={styles.miniBtn}>
                <Icon name="minus" size={12} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.miniVal}>±{amp1}</Text>
              <TouchableOpacity onPress={() => setAmp1(Math.min(80, amp1 + 10))} style={styles.miniBtn}>
                <Icon name="plus" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlGroup}>
             <Text style={[styles.groupTitle, { color: '#FF6B6B' }]}>WAVE B</Text>
             <View style={styles.miniCtrl}>
              <TouchableOpacity onPress={() => setFreq2(Math.max(1, freq2 - 1))} style={styles.miniBtn}>
                <Icon name="minus" size={12} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.miniVal}>{freq2}Hz</Text>
              <TouchableOpacity onPress={() => setFreq2(Math.min(10, freq2 + 1))} style={styles.miniBtn}>
                <Icon name="plus" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.miniCtrl}>
              <TouchableOpacity onPress={() => setPhase2((phase2 + 45) % 360)} style={styles.phaseBtn}>
                <Icon name="refresh" size={12} color="#FFF" />
                <Text style={styles.phaseText}>{phase2}°</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.sumToggle, showSum && styles.activeSum]} onPress={() => setShowSum(!showSum)}>
             <Icon name="activity" size={20} color={showSum ? "#000" : "#FFF"} />
          </TouchableOpacity>
        </View>
      </SimBox>

      {/* 3. Scientist Card */}
      {scientistMode && (
        <ScientistCard title="Oscillation Metrics">
          <View style={styles.sciGrid}>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Wavelength (λ)</Text>
              <Text style={styles.sciValue}>{(343 / freq1).toFixed(2)} m</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Peak Superposition</Text>
              <Text style={styles.sciValue}>{amp1 + amp2} px</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Period (T)</Text>
              <Text style={styles.sciValue}>{(1 / freq1).toFixed(3)} s</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Interference</Text>
              <Text style={[styles.sciValue, { color: Math.abs(phase1-phase2) === 180 ? '#FF3131' : '#39FF14' }]}>
                {Math.abs(phase1-phase2) === 180 ? 'DESTRUCTIVE' : 'CONSTRUCTIVE'}
              </Text>
            </View>
          </View>
          <Text style={styles.formulaText}>y = A sin(kx - ωt + φ)</Text>
        </ScientistCard>
      )}

      {/* 4. Challenges */}
      <View style={styles.challengeBox}>
         <ChallengeCard
           title={CHALLENGES[activeChallenge].title}
           instruction={CHALLENGES[activeChallenge].instruction}
           completed={challengeStatus[activeChallenge].completed}
           onNext={() => setActiveChallenge(prev => (prev + 1) % CHALLENGES.length)}
         />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  controls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: RADIUS.md,
  },
  controlGroup: {
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  miniCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  miniVal: {
    fontSize: 10,
    color: '#FFF',
    fontFamily: FONTS.mono,
    marginHorizontal: 4,
    minWidth: 25,
    textAlign: 'center',
  },
  miniBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    borderRadius: 4,
  },
  phaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: 9,
    color: '#FFF',
    marginLeft: 4,
  },
  sumToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSum: {
    backgroundColor: '#FFD166',
  },
  sciGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sciItem: {
    width: '48%',
    marginBottom: 10,
  },
  sciLabel: {
    fontSize: 10,
    color: '#888',
  },
  sciValue: {
    fontSize: 13,
    color: '#FFF',
    fontFamily: FONTS.mono,
  },
  formulaText: {
    textAlign: 'center',
    color: '#4ECDC4',
    fontFamily: FONTS.mono,
    fontSize: 12,
    marginTop: 5,
  },
  challengeBox: {
    marginTop: SPACING.xl,
    marginBottom: 40,
  }
});
