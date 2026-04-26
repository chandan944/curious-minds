import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Svg, { Path, Rect, Circle, Line, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';
import { soundTap, soundSuccess, soundTrophy } from '../../utils/sounds';

// Standard Components
import StatusCard from '../../components/lab/StatusCard';
import SimBox from '../../components/lab/SimBox';
import ChallengeCard from '../../components/lab/ChallengeCard';
import ScientistCard from '../../components/lab/ScientistCard';

const { width } = Dimensions.get('window');
const CANVAS_H = 300;
const CANVAS_W = width - 40;
const RAMP_START_X = 50;
const RAMP_END_X = CANVAS_W - 50;
const RAMP_BASE_Y = CANVAS_H - 60;

const CHALLENGES = [
  { id: 1, title: "Minimalist", instruction: "Climb the 30° ramp using exactly 150N of force or less.", angle: 30, mass: 40, mu: 0.1, completed: false },
  { id: 2, title: "Power Burst", instruction: "Generate over 500 Watts of power during a high-speed climb.", angle: 15, mass: 50, mu: 0.2, completed: false },
  { id: 3, title: "Static Hold", instruction: "Find the friction coefficient where a 45kg block stops sliding down a 20° ramp.", angle: 20, mass: 45, mu: 0.36, completed: false },
  { id: 4, title: "Gravity Balance", instruction: "Match the downward gravity component exactly to freeze the block.", angle: 25, mass: 20, mu: 0, completed: false },
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
  
  // Sim State
  const [active, setActive] = useState(false);
  const [angle, setAngle] = useState(30);
  const [mass, setMass] = useState(20);
  const [mu, setMu] = useState(0.2); // friction
  const [appliedForce, setAppliedForce] = useState(0);
  
  // Physics State
  const [pos, setPos] = useState(0); // distance along ramp (0 to max)
  const [vel, setVel] = useState(0);
  const [workDone, setWorkDone] = useState(0);
  const [power, setPower] = useState(0);
  
  // UI State
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(CHALLENGES);
  
  const timerRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  // Calculations
  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const rampLength = (RAMP_END_X - RAMP_START_X) / Math.cos(rad);
  const height = (RAMP_END_X - RAMP_START_X) * Math.tan(rad);
  
  const fg_parallel = mass * g * Math.sin(rad);
  const fn = mass * g * Math.cos(rad);
  const ff = vel === 0 && appliedForce < fg_parallel ? Math.min(mu * fn, Math.abs(appliedForce - fg_parallel)) : mu * fn;
  const f_net = appliedForce - fg_parallel - (vel > 0 ? ff : (vel < 0 ? -ff : 0));

  const step = useCallback(() => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    if (active) {
      setPos(p => {
        const accel = f_net / mass;
        const newVel = vel + accel * dt;
        setVel(newVel);
        
        const newPos = p + newVel * dt * 20; // Scale for visual
        
        // Metrics
        const instantWork = appliedForce * (newVel * dt);
        setWorkDone(w => w + Math.max(0, instantWork));
        setPower(instantWork / dt);

        // Bounds
        if (newPos <= 0) {
           setVel(0);
           return 0;
        }
        if (newPos >= rampLength) {
           setVel(0);
           setActive(false);
           checkChallengeCompletion();
           return rampLength;
        }
        return newPos;
      });
    }
  }, [active, f_net, mass, rampLength, vel, appliedForce]);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(step, 16);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [active, step]);

  const toggleSim = () => {
    soundTap();
    if (!active) {
      lastTimeRef.current = Date.now();
      setActive(true);
    } else {
      setActive(false);
    }
  };

  const resetSim = () => {
    soundTap();
    setActive(false);
    setPos(0);
    setVel(0);
    setWorkDone(0);
    setPower(0);
  };

  const checkChallengeCompletion = () => {
    const chal = CHALLENGES[activeChallenge];
    let success = false;
    
    if (activeChallenge === 0 && appliedForce <= 150 && pos >= rampLength - 5) success = true;
    if (activeChallenge === 1 && power > 500) success = true;
    if (activeChallenge === 2 && Math.abs(f_net) < 1) success = true;
    
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

  // SVG Coordinates for Block
  const blockX = RAMP_START_X + pos * Math.cos(rad);
  const blockY = RAMP_BASE_Y - pos * Math.sin(rad);

  return (
    <View style={styles.container}>
      {/* 1. Status Bar */}
      <View style={styles.header}>
        <StatusCard 
          label="NET FORCE" 
          value={f_net.toFixed(1)} 
          unit="N" 
          icon="activity" 
          color="#FF6B6B" 
        />
        <StatusCard 
          label="WORK" 
          value={workDone.toFixed(0)} 
          unit="J" 
          icon="zap" 
          color="#FFD166" 
        />
        <StatusCard 
          label="POWER" 
          value={Math.abs(power).toFixed(0)} 
          unit="W" 
          icon="activity" 
          color="#4ECDC4" 
        />
      </View>

      {/* 2. Main Simulation Box */}
      <SimBox>
        <Svg width={CANVAS_W} height={CANVAS_H}>
          {/* Ramp */}
          <Path 
            d={`M ${RAMP_START_X} ${RAMP_BASE_Y} L ${RAMP_END_X} ${RAMP_BASE_Y} L ${RAMP_END_X} ${RAMP_BASE_Y - height} Z`}
            fill={isDark ? '#2A2A3E' : '#ECEFF1'}
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Block */}
          <G transform={`translate(${blockX}, ${blockY}) rotate(${-angle})`}>
             <Rect x="-15" y="-15" width="30" height="15" fill="#FF4D6D" rx={2} />
             {scientistMode && (
               <G>
                 {/* Vector Arrows */}
                 <Line x1="0" y1="0" x2="0" y2="30" stroke="#FF6B6B" strokeWidth="2" /> {/* Gravity */}
                 <Line x1="0" y1="0" x2="0" y2="-25" stroke="#4ECDC4" strokeWidth="2" /> {/* Normal */}
                 <Line x1="0" y1="0" x2={-30} y2="0" stroke="#FFD166" strokeWidth="2" /> {/* Friction */}
                 <Line x1="0" y1="0" x2={appliedForce/5} y2="0" stroke="#39FF14" strokeWidth="2" /> {/* Applied */}
               </G>
             )}
          </G>
        </Svg>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: txt1 }]}>Angle: {angle}°</Text>
            <TouchableOpacity onPress={() => setAngle(Math.max(0, angle - 5))} style={styles.miniBtn}>
              <Icon name="minus" size={14} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAngle(Math.min(60, angle + 5))} style={styles.miniBtn}>
              <Icon name="plus" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: txt1 }]}>Push: {appliedForce}N</Text>
            <TouchableOpacity onPress={() => setAppliedForce(f => Math.max(-200, f - 20))} style={styles.miniBtn}>
              <Icon name="minus" size={14} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAppliedForce(f => Math.min(500, f + 20))} style={styles.miniBtn}>
              <Icon name="plus" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.mainBtns}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetSim}>
              <Icon name="refresh" size={18} color={txt1} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: active ? '#FF4D6D' : '#39FF14' }]} 
              onPress={toggleSim}
            >
              <Icon name={active ? "pause" : "play"} size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </SimBox>

      {/* 3. Scientist Analytics */}
      {scientistMode && (
        <ScientistCard title="Free Body Analysis">
          <View style={styles.sciGrid}>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Normal Force (Fn)</Text>
              <Text style={styles.sciValue}>{fn.toFixed(1)} N</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Friction (Ff)</Text>
              <Text style={styles.sciValue}>{ff.toFixed(1)} N</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Gravity (Fg ||)</Text>
              <Text style={styles.sciValue}>{fg_parallel.toFixed(1)} N</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Mech Advantage</Text>
              <Text style={styles.sciValue}>{(1 / Math.sin(rad)).toFixed(2)}x</Text>
            </View>
          </View>
          <Text style={styles.formula}>ΣF = F_app - Fg_sinθ - Ff</Text>
        </ScientistCard>
      )}

      {/* 4. Toggles */}
      <View style={styles.configContainer}>
        <View style={styles.toggleRow}>
           <TouchableOpacity style={[styles.toggleBtn, mu === 0 && styles.activeToggle]} onPress={() => setMu(0)}>
             <Text style={styles.toggleBtnText}>Ice (μ=0)</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.toggleBtn, mu === 0.2 && styles.activeToggle]} onPress={() => setMu(0.2)}>
             <Text style={styles.toggleBtnText}>Wood (μ=0.2)</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.toggleBtn, mu === 0.6 && styles.activeToggle]} onPress={() => setMu(0.6)}>
             <Text style={styles.toggleBtnText}>Rubber (μ=0.6)</Text>
           </TouchableOpacity>
        </View>
        <View style={styles.massRow}>
          <Text style={[styles.massLabel, { color: txt1 }]}>Mass: {mass}kg</Text>
          <TouchableOpacity onPress={() => setMass(Math.max(5, mass - 5))} style={styles.miniBtn}>
            <Icon name="minus" size={14} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMass(Math.min(100, mass + 5))} style={styles.miniBtn}>
            <Icon name="plus" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Challenge Card */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: RADIUS.md,
  },
  controlRow: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  miniBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  mainBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sciGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sciItem: {
    width: '48%',
    marginBottom: 8,
  },
  sciLabel: {
    fontSize: 10,
    color: '#888',
    fontFamily: FONTS.regular,
  },
  sciValue: {
    fontSize: 14,
    fontFamily: FONTS.mono,
    color: '#FFF',
  },
  formula: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    color: '#4ECDC4',
    textAlign: 'center',
    marginTop: 4,
  },
  configContainer: {
    marginTop: SPACING.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeToggle: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  toggleBtnText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  massRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  massLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginRight: 10,
  },
  challengeBox: {
    marginTop: SPACING.xl,
    marginBottom: 40,
  }
});
