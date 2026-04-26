import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Circle, G, Line, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';
// @ts-ignore
import { soundTap, soundTrophy } from '../../utils/sounds';

// Standard Components
import StatusCard from '../../components/lab/StatusCard';
import SimBox from '../../components/lab/SimBox';
import ChallengeCard from '../../components/lab/ChallengeCard';
import ScientistCard from '../../components/lab/ScientistCard';

const { width } = Dimensions.get('window');
const CANVAS_H = 300;
const CANVAS_W = width - 40;
const CHAMBER_X = 40;
const CHAMBER_Y = 40;
const CHAMBER_W = CANVAS_W - 80;
const CHAMBER_H = CANVAS_H - 80;

const CHALLENGES = [
  { id: 1, title: "Absolute Zero", instruction: "Drop the temperature to exactly 0 Kelvin.", targetT: 0, completed: false },
  { id: 2, title: "Boiling Point", instruction: "Reach 373K and sustain gas state for 3 seconds.", targetT: 373, completed: false },
  { id: 3, title: "High Pressure", instruction: "Compress the volume while at 600K to reach P > 80.", targetP: 80, completed: false },
  { id: 4, title: "Lattice Locking", instruction: "Synchronize all 40 molecules into a solid lattice at 50K.", targetT: 50, completed: false },
];

export default function LabSimulation({ scientistMode }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  // @ts-ignore
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  // @ts-ignore
  const txtM = _themeObj.text?.muted || '#888888';
  // @ts-ignore
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  // @ts-ignore
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  // @ts-ignore
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  
  // Controls State
  const [temp, setTemp] = useState(300); // Kelvin
  const [volume, setVolume] = useState(1); // 0.2 to 1.0 (multiplier for height)
  
  // Physics State
  const [particles, setParticles] = useState([]);
  const [pressure, setPressure] = useState(0);
  const [collisionCount, setCollisionCount] = useState(0);
  
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(CHALLENGES);
  
  const particlesRef = useRef([]);
  const requestRef = useRef(null);

  // Initialize Particles
  useEffect(() => {
    const pArr = [];
    for (let i = 0; i < 40; i++) {
      pArr.push({
        x: CHAMBER_X + Math.random() * CHAMBER_W,
        y: CHAMBER_Y + Math.random() * CHAMBER_H,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        id: i
      });
    }
    particlesRef.current = pArr;
    setParticles([...pArr]);
  }, []);

  // @ts-ignore
  const animate = useCallback((time) => {
    const currentH = CHAMBER_H * volume;
    const currentYFloor = CHAMBER_Y + CHAMBER_H;
    const currentYTop = currentYFloor - currentH;
    
    // Thermal speed scaling
    const speedScale = Math.sqrt(temp / 300);
    let wallStrike = 0;

    const nextParticles = particlesRef.current.map(p => {
      let newVx = p.vx;
      let newVy = p.vy;
      
      // Update Position
      let newX = p.x + p.vx * speedScale;
      let newY = p.y + p.vy * speedScale;

      // Wall Collisions (X)
      if (newX < CHAMBER_X) {
        newX = CHAMBER_X;
        newVx = Math.abs(newVx);
        wallStrike++;
      } else if (newX > CHAMBER_X + CHAMBER_W) {
        newX = CHAMBER_X + CHAMBER_W;
        newVx = -Math.abs(newVx);
        wallStrike++;
      }

      // Wall Collisions (Y) - Respect volume lid
      if (newY < currentYTop) {
        newY = currentYTop;
        newVy = Math.abs(newVy);
        wallStrike++;
      } else if (newY > currentYFloor) {
        newY = currentYFloor;
        newVy = -Math.abs(newVy);
        wallStrike++;
      }

      // State Behavior: clumping if cold
      if (temp < 100) {
          // Slow drift towards lattice structure
          const targetX = CHAMBER_X + (p.id % 8) * (CHAMBER_W / 8) + (CHAMBER_W/16);
          const targetY = currentYFloor - Math.floor(p.id / 8) * 15 - 10;
          newX += (targetX - newX) * 0.05 * (1 - temp/100);
          newY += (targetY - newY) * 0.05 * (1 - temp/100);
      } else if (temp < 250) {
          // Liquid: heavy gravity pull
          newVy += 0.2 * (1 - temp/250);
      }

      return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
    });

    particlesRef.current = nextParticles;
    setParticles([...nextParticles]);
    setCollisionCount(c => c + wallStrike);
    
    requestRef.current = requestAnimationFrame(animate);
  }, [temp, volume]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Pressure Calculation (Rolling Average)
  useEffect(() => {
    const interval = setInterval(() => {
      setPressure(collisionCount * 2 * (1/volume));
      setCollisionCount(0);
      checkChallenges();
    }, 1000);
    return () => clearInterval(interval);
  }, [collisionCount, volume]);

  const checkChallenges = () => {
    // @ts-ignore
    const chal = CHALLENGES[activeChallenge];
    let success = false;
    
    if (activeChallenge === 0 && temp === 0) success = true;
    if (activeChallenge === 1 && temp >= 373) success = true;
    if (activeChallenge === 2 && pressure > 80) success = true;
    
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

  const currentH = CHAMBER_H * volume;
  const currentYFloor = CHAMBER_Y + CHAMBER_H;
  const currentYTop = currentYFloor - currentH;

  return (
    <View style={styles.container}>
      {/* 1. Status Cards */}
      <View style={styles.header}>
        <StatusCard 
          label="TEMP" 
          value={temp} 
          unit="K" 
          icon="thermometer" 
          color="#FF6B6B" 
        />
        <StatusCard 
          label="PRESSURE" 
          value={pressure.toFixed(1)} 
          unit="P" 
          icon="activity" 
          color="#FFD166" 
        />
        <StatusCard 
          label="STATE" 
          value={temp < 100 ? "SOLID" : (temp < 373 ? "LIQUID" : "GAS")} 
          unit="" 
          icon="cube" 
          color="#4ECDC4" 
        />
      </View>

      {/* 2. Simulation Box */}
      <SimBox>
        <Svg width={CANVAS_W} height={CANVAS_H}>
          <Defs>
            <LinearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={temp > 400 ? "#4A0000" : "#1A1A2E"} />
              <Stop offset="1" stopColor="#05050A" />
            </LinearGradient>
          </Defs>
          
          {/* Chamber Walls */}
          <Path 
            d={`M ${CHAMBER_X - 2} ${CHAMBER_Y} V ${CHAMBER_Y + CHAMBER_H + 2} H ${CHAMBER_X + CHAMBER_W + 2} V ${CHAMBER_Y}`}
            stroke={color}
            strokeWidth="3"
            fill="none"
          />
          
          {/* Volume Lid */}
          <G transform={`translate(0, ${currentYTop - 5})`}>
              <Rect x={CHAMBER_X - 5} y="0" width={CHAMBER_W + 10} height="10" fill={isDark ? '#E94560' : '#455A64'} rx={2} />
              <Rect x={CHAMBER_X + CHAMBER_W/2 - 2} y="-15" width="4" height="15" fill="#888" />
          </G>

          {/* Burner/Cooler Effect */}
          <G transform={`translate(${CHAMBER_X}, ${CHAMBER_Y + CHAMBER_H + 5})`}>
             <Rect width={CHAMBER_W} height={10} fill={temp > 300 ? "#F00" : "#0AF"} opacity={Math.abs(temp - 300) / 400} />
          </G>

          {/* Particles */}
          {particles.map((p, i) => (
            <Circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r={p.id === 0 && scientistMode ? 6 : 4} 
              fill={p.id === 0 && scientistMode ? color : (temp > 373 ? '#FF6B6B' : (temp < 100 ? '#A2D2FF' : '#FFF'))}
            />
          ))}

          {/* Scientist Mode Vectors */}
          {scientistMode && particles[0] && (
            <G transform={`translate(${particles[0].x}, ${particles[0].y})`}>
               <Line x1="0" y1="0" x2={particles[0].vx * 5} y2={particles[0].vy * 5} stroke={color} strokeWidth="2" />
               <SvgText x={10} y={-10} fill={color} fontSize="10" fontFamily={FONTS.mono}>
                 v = {Math.sqrt(particles[0].vx**2 + particles[0].vy**2).toFixed(1)}k
               </SvgText>
            </G>
          )}
        </Svg>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: txt1 }]}>Heat Energy</Text>
            <View style={styles.sliderMock}>
               <TouchableOpacity onPress={() => setTemp(Math.max(0, temp - 50))} style={styles.miniBtn}>
                 <Icon name="minus" size={16} color="#FFF" />
               </TouchableOpacity>
               <View style={styles.tempBar}>
                  <View style={[styles.tempInner, 
// @ts-ignore
                  { width: (temp/1000)*100 + '%', backgroundColor: temp > 300 ? '#FF4D6D' : '#00D4FF' }]} />
               </View>
               <TouchableOpacity onPress={() => setTemp(Math.min(1000, temp + 50))} style={styles.miniBtn}>
                 <Icon name="plus" size={16} color="#FFF" />
               </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: txt1 }]}>Chamber Volume</Text>
            <View style={styles.sliderMock}>
               <TouchableOpacity onPress={() => setVolume(Math.min(1.0, volume + 0.1))} style={styles.miniBtn}>
                 <Icon name="plus" size={16} color="#FFF" />
               </TouchableOpacity>
               <View style={styles.tempBar}>
                  <View style={[styles.tempInner, 
// @ts-ignore
                  { width: volume*100 + '%', backgroundColor: '#39FF14' }]} />
               </View>
               <TouchableOpacity onPress={() => setVolume(Math.max(0.2, volume - 0.1))} style={styles.miniBtn}>
                 <Icon name="minus" size={16} color="#FFF" />
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </SimBox>

      {/* 3. Scientist Mode Analytics */}
      {scientistMode && (
        <ScientistCard title="Gas Law Matrix">
          <View style={styles.sciGrid}>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Particle Kinetic E</Text>
              <Text style={styles.sciValue}>{(1.5 * 1.38e-23 * temp * 1e20).toFixed(2)} J</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Entropy (ΔS)</Text>
              <Text style={styles.sciValue}>{(temp / 300).toFixed(2)} J/K</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Density (n/V)</Text>
              <Text style={styles.sciValue}>{(40 / volume).toFixed(0)} atoms/m³</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Lattice Bond</Text>
              <Text style={[styles.sciValue, { color: temp < 100 ? '#39FF14' : '#FF3131' }]}>
                {temp < 100 ? 'CRYSTALLINE' : 'THERMAL BREAK'}
              </Text>
            </View>
          </View>
          <Text style={styles.lawText}>P ∝ (N * T) / V</Text>
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
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: RADIUS.md,
  },
  controlRow: {
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 5,
  },
  sliderMock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tempInner: {
    height: '100%',
  },
  miniBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 4,
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
    fontFamily: FONTS.regular,
  },
  sciValue: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: FONTS.mono,
  },
  lawText: {
    textAlign: 'center',
    color: '#FFD166',
    fontFamily: FONTS.mono,
    fontSize: 14,
    marginTop: 5,
  },
  challengeBox: {
    marginTop: SPACING.xl,
    marginBottom: 40,
  }
});
