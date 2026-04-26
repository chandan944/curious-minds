import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import Svg, { Circle, Rect, Line, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
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
const GROUND_Y = CANVAS_H - 40;

const OBJECT_TYPES = {
  cannonball: { mass: 10, radius: 10, color: '#4A4A4A', drag: 0.1, icon: '⚽' },
  feather: { mass: 0.1, radius: 8, color: '#E0E0E0', drag: 0.9, icon: '🪶' },
  bowling: { mass: 25, radius: 12, color: '#1A237E', drag: 0.05, icon: '🎳' },
};

const CHALLENGES = [
  { id: 1, title: "Hit the Target", instruction: "Hit the target at 150m with 10m/s² gravity.", target: 200, g: 10, completed: false },
  { id: 2, title: "Moon Shot", instruction: "Hit the target at 100m using Moon gravity (1.6m/s²).", target: 140, g: 1.6, completed: false },
  { id: 3, title: "Zero-G Inertia", instruction: "Switch gravity to 0 mid-flight and clear the platform.", target: 250, g: 0, completed: false },
  { id: 4, title: "Air Drag", instruction: "Hit the target with max air resistance active.", target: 120, g: 10, completed: false },
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
  
  // Simulation State
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 40, y: GROUND_Y });
  const [vel, setVel] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(20);
  const [g, setG] = useState(10);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [objType, setObjType] = useState('cannonball');
  const [path, setPath] = useState([]);
  
  // UI State
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(CHALLENGES);
  const [impactTime, setImpactTime] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [distance, setDistance] = useState(0);
  
  const timerRef = useRef(null);
  const frameRef = useRef(0);

  // Physics Step
  const step = useCallback(() => {
    setPos(prev => {
      const mass = OBJECT_TYPES[objType].mass;
      const k = dragEnabled ? OBJECT_TYPES[objType].drag : 0;
      
      // Calculate Forces
      const dragForceX = -k * vel.x;
      const dragForceY = -k * vel.y;
      
      const ax = dragForceX / mass;
      const ay = g + (dragForceY / mass);
      
      // Update Velocity
      const newVx = vel.x + ax * 0.16;
      const newVy = vel.y + ay * 0.16;
      setVel({ x: newVx, y: newVy });
      
      // Update Position
      const newX = prev.x + newVx;
      const newY = prev.y + newVy;
      
      // Metrics
      const currentH = (GROUND_Y - newY) / 2;
      if (currentH > maxHeight) setMaxHeight(currentH);
      
      // Path recording
      if (frameRef.current % 5 === 0) {
        setPath(p => [...p.slice(-20), { x: newX, y: newY }]);
      }
      frameRef.current++;

      // Collision Check
      if (newY >= GROUND_Y) {
        setActive(false);
        checkChallengeCompletion(newX);
        return { x: newX, y: GROUND_Y };
      }
      
      return { x: newX, y: newY };
    });
  }, [vel, g, dragEnabled, objType, maxHeight]);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(step, 16);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [active, step]);

  const launch = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Reset
    setPath([]);
    setPos({ x: 40, y: GROUND_Y - 20 });
    setMaxHeight(0);
    setImpactTime(0);
    frameRef.current = 0;
    
    // Calculate initial velocity components
    const rad = (angle * Math.PI) / 180;
    const vx0 = Math.cos(rad) * power;
    const vy0 = -Math.sin(rad) * power; // Negative is up in SVG
    
    setVel({ x: vx0, y: vy0 });
    setActive(true);
  };

  const checkChallengeCompletion = (finalX) => {
    const d = (finalX - 40) / 2;
    setDistance(d);
    
    const chal = CHALLENGES[activeChallenge];
    const threshold = 15; // margin of error
    
    if (Math.abs(d - chal.target) < threshold) {
      const newStatus = [...challengeStatus];
      if (!newStatus[activeChallenge].completed) {
        newStatus[activeChallenge].completed = true;
        setChallengeStatus(newStatus);
        soundTrophy();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Status Bar */}
      <View style={styles.header}>
        <StatusCard 
          label="VELOCITY" 
          value={`${Math.sqrt(vel.x**2 + vel.y**2).toFixed(1)}`} 
          unit="m/s" 
          icon="activity" 
          color="#4ECDC4" 
        />
        <StatusCard 
          label="GRAVITY" 
          value={g.toFixed(1)} 
          unit="m/s²" 
          icon="planet" 
          color="#FF6B6B" 
        />
        <StatusCard 
          label="DISTANCE" 
          value={distance.toFixed(0)} 
          unit="m" 
          icon="target" 
          color="#FFD166" 
        />
      </View>

      {/* 2. Main Simulation Box */}
      <SimBox style={{}}>
       <Svg width={CANVAS_W} height={CANVAS_H}>
          <Defs>
            <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isDark ? '#1A1A2E' : '#E3F2FD'} />
              <Stop offset="1" stopColor={isDark ? '#16213E' : '#BBDEFB'} />
            </LinearGradient>
          </Defs>

          {/* Background & Ground */}
          <Rect x="0" y="0" width={CANVAS_W} height={CANVAS_H} fill="url(#skyGrad)" rx={10} />
          <Rect x="0" y={GROUND_Y} width={CANVAS_W} height={40} fill={isDark ? '#0F3460' : '#455A64'} />
          
          {/* Target for active challenge */}
          <G transform={`translate(${40 + CHALLENGES[activeChallenge].target * 2}, ${GROUND_Y - 5})`}>
             <Rect x="-15" y="0" width="30" height="5" fill="#FF3131" rx={2} />
             <Circle cx="0" cy="0" r="4" fill="#FFF" />
          </G>

          {/* Path Tracing */}
          {path.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={1.5} fill={color} opacity={0.3} />
          ))}

          {/* Cannon */}
          <G transform={`translate(40, ${GROUND_Y}) rotate(${-angle}, 0, 0)`}>
            <Rect x="-5" y="-30" width="40" height="15" fill={isDark ? '#E94560' : '#37474F'} rx={4} />
            <Circle cx="0" cy="-7.5" r="12" fill={isDark ? '#16213E' : '#263238'} />
          </G>

          {/* Projectile Object */}
          <G transform={`translate(${pos.x}, ${pos.y - 10})`}>
            <Circle cx="0" cy="0" r={OBJECT_TYPES[objType].radius} fill={OBJECT_TYPES[objType].color} />
            {scientistMode && (
              <G>
                {/* Velocity Vectors */}
                <Line x1="0" y1="0" x2={vel.x * 2} y2="0" stroke="#4ECDC4" strokeWidth="2" />
                <Line x1="0" y1="0" x2="0" y2={vel.y * 2} stroke="#FF6B6B" strokeWidth="2" />
                {/* Accel Vector */}
                <Line x1="0" y1="0" x2="0" y2={g * 4} stroke="#FFD166" strokeWidth="2" strokeDasharray="4 2" />
              </G>
            )}
          </G>

          {/* Ground Markings */}
          <Line x1="40" y1={GROUND_Y} x2="40" y2={GROUND_Y + 10} stroke="#FFF" opacity={0.5} />
        </Svg>

        {/* Controls Overlay */}
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: txt1 }]}>Angle: {angle}°</Text>
            <TouchableOpacity onPress={() => setAngle(Math.max(0, angle - 5))} style={styles.miniBtn}>
              <Icon name="minus" size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAngle(Math.min(90, angle + 5))} style={styles.miniBtn}>
              <Icon name="plus" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: txt1 }]}>Power: {power}</Text>
            <TouchableOpacity onPress={() => setPower(Math.max(5, power - 5))} style={styles.miniBtn}>
              <Icon name="minus" size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPower(Math.min(60, power + 5))} style={styles.miniBtn}>
              <Icon name="plus" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.launchBtn, { backgroundColor: active ? '#FF4D6D' : '#39FF14' }]} 
            onPress={active ? () => setActive(false) : launch}
          >
            <Icon name={active ? "refresh" : "play"} size={20} color="#000" />
            <Text style={styles.launchText}>{active ? "RESET" : "LAUNCH"}</Text>
          </TouchableOpacity>
        </View>
      </SimBox>

      {/* 3. Scientist Mode Analytics */}
      {scientistMode && (
        <ScientistCard title="Projectile Matrix">
          <View style={styles.sciGrid}>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Vx (Horizontal)</Text>
              <Text style={styles.sciValue}>{vel.x.toFixed(2)} m/s</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Vy (Vertical)</Text>
              <Text style={styles.sciValue}>{(-vel.y).toFixed(2)} m/s</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Max Altitude</Text>
              <Text style={styles.sciValue}>{maxHeight.toFixed(2)} m</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Flight Status</Text>
              <Text style={[styles.sciValue, { color: active ? '#39FF14' : '#FF3131' }]}>
                {active ? 'IN FLIGHT' : 'IDLE'}
              </Text>
            </View>
          </View>
          <Text style={styles.sciNote}>
            F_net_y = m * g {dragEnabled ? '+ F_drag' : ''}
          </Text>
        </ScientistCard>
      )}

      {/* 4. Configuration Toggles */}
      <View style={styles.configContainer}>
        <Text style={[styles.sectionTitle, { color: txt1 }]}>Environment Setup</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, g === 0 && styles.toggleActive]}
            onPress={() => setG(g === 0 ? 9.8 : 0)}
          >
            <Icon name="planet" size={18} color={g === 0 ? '#000' : txt1} />
            <Text style={[styles.toggleText, { color: g === 0 ? '#000' : txt1 }]}>Zero-G</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleBtn, dragEnabled && styles.toggleActive]}
            onPress={() => setDragEnabled(!dragEnabled)}
          >
            <Icon name="shield" size={18} color={dragEnabled ? '#000' : txt1} />
            <Text style={[styles.toggleText, { color: dragEnabled ? '#000' : txt1 }]}>Atmosphere</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleBtn, objType === 'feather' && styles.toggleActive]}
            onPress={() => setObjType(objType === 'cannonball' ? 'feather' : 'cannonball')}
          >
            <Text style={styles.objEmoji}>{OBJECT_TYPES[objType].icon}</Text>
            <Text style={[styles.toggleText, { color: objType === 'feather' ? '#000' : txt1 }]}>
               {objType === 'feather' ? 'Feather' : 'Steel Ball'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Challenges */}
      <View style={styles.challengeList}>
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
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: RADIUS.md,
  },
  controlRow: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  miniBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  launchText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginLeft: 6,
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
  sciNote: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    color: '#4ECDC4',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  configContainer: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleActive: {
    backgroundColor: '#39FF14',
    borderColor: '#39FF14',
  },
  toggleText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    marginLeft: 6,
  },
  objEmoji: {
    fontSize: 16,
  },
  challengeList: {
    marginTop: SPACING.xl,
    marginBottom: 40,
  }
});
