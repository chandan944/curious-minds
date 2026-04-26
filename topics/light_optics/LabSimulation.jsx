import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Line, Rect, Circle, G, Text as SvgText, Marker, Defs, LinearGradient, Stop, Filter, FeGaussianBlur } from 'react-native-svg';
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
const MID_X = CANVAS_W / 2;
const MID_Y = CANVAS_H / 2;

const MATERIALS = [
  { name: 'Air', n: 1.0, color: 'rgba(255,255,255,0.05)' },
  { name: 'Water', n: 1.33, color: 'rgba(0,191,255,0.2)' },
  { name: 'Glass', n: 1.5, color: 'rgba(255,255,255,0.2)' },
  { name: 'Diamond', n: 2.42, color: 'rgba(173,216,230,0.3)' },
];

const CHALLENGES = [
  { id: 1, title: "Total Trap", instruction: "Achieve Total Internal Reflection (TIR) from Diamond back into Air.", target: 'tir', completed: false },
  { id: 2, title: "Precision Bend", instruction: "Set Angle to 45° and bend light through Glass to hit the 60° target.", target: 'bend', completed: false },
  { id: 3, title: "Straight Shot", instruction: "Find the angle where light passes through perfectly straight (θ = 0).", target: 'zero', completed: false },
  { id: 4, title: "Density Hunt", instruction: "Find the material where 30° incidence results in 12° refraction.", target: 'hunt', completed: false },
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
  
  // Controls
  const [angle, setAngle] = useState(30);
  const [materialIndex, setMaterialIndex] = useState(2); // Glass
  const [laserY, setLaserY] = useState(MID_Y - 50);
  
  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(CHALLENGES);
  
  const n1 = 1.0; // Air (Source)
  const n2 = MATERIALS[materialIndex].n;

  // Ray Tracing Logic
  const calcRays = () => {
    const rays = [];
    const rad = (angle * Math.PI) / 180;
    
    // Ray 1: Laser to Boundary (at MID_X)
    const x1 = 20;
    const y1 = laserY;
    const dx = MID_X - x1;
    const dy = dx * Math.tan(rad);
    const hitY = y1 + dy;
    
    if (hitY < 0 || hitY > CANVAS_H) {
         rays.push({ x1, y1, x2: x1 + (y1 < 0 ? y1/Math.tan(rad) : (CANVAS_H-y1)/Math.tan(rad)), y2: (y1 < 0 ? 0 : CANVAS_H) });
         return rays;
    }
    
    rays.push({ x1, y1, x2: MID_X, y2: hitY });

    // Refraction at Boundary
    // Normal is horizontal at the interface (vertical boundary)
    // Angle of incidence rel to Normal:
    const theta_i = rad;
    const sin_r = (n1 / n2) * Math.sin(theta_i);
    
    if (Math.abs(sin_r) > 1) {
       // Total Internal Reflection (Note: Usually TIR is from dense to thin, but for sim we show reflection)
       const theta_r = -theta_i;
       const x3 = x1;
       const y3 = hitY + (MID_X - x1) * Math.tan(theta_r);
       rays.push({ x1: MID_X, y1: hitY, x2: x3, y2: y3, type: 'reflect' });
    } else {
       const theta_r = Math.asin(sin_r);
       const blockWidth = 60;
       const x3 = MID_X + blockWidth;
       const dy2 = blockWidth * Math.tan(theta_r);
       const exitY = hitY + dy2;
       rays.push({ x1: MID_X, y1: hitY, x2: x3, y2: exitY, type: 'refract' });
       
       // Ray 3: Exit to Edge
       const sin_exit = (n2 / n1) * Math.sin(theta_r);
       const theta_exit = Math.asin(sin_exit);
       const dx3 = CANVAS_W - x3;
       const dy3 = dx3 * Math.tan(theta_exit);
       rays.push({ x1: x3, y1: exitY, x2: CANVAS_W, y2: exitY + dy3, type: 'exit' });
    }
    
    return rays;
  };

  const rays = calcRays();

  const checkChallenges = () => {
    const chal = CHALLENGES[activeChallenge];
    let success = false;
    
    if (activeChallenge === 2 && angle === 0) success = true;
    if (activeChallenge === 1 && angle === 45 && materialIndex === 2) {
       // Check if hit target area
       success = true;
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
  }, [angle, materialIndex]);

  return (
    <View style={styles.container}>
      {/* 1. Status Cards */}
      <View style={styles.header}>
        <StatusCard 
          label="INCIDENCE" 
          value={angle} 
          unit="°" 
          icon="activity" 
          color="#4ECDC4" 
        />
        <StatusCard 
          label="INDEX (n)" 
          value={n2.toFixed(2)} 
          unit="" 
          icon="link" 
          color="#FF6B6B" 
        />
        <StatusCard 
          label="SPEED" 
          value={(300000 / n2).toFixed(0)} 
          unit="km/s" 
          icon="lightning" 
          color="#FFD166" 
        />
      </View>

      {/* 2. Simulation Box */}
      <SimBox>
        <Svg width={CANVAS_W} height={CANVAS_H}>
          <Defs>
            <Filter id="glow">
               <FeGaussianBlur stdDeviation="2" result="coloredBlur" />
            </Filter>
          </Defs>

          {/* Optical Medium Block */}
          <Rect 
            x={MID_X} 
            y="0" 
            width="60" 
            height={CANVAS_H} 
            fill={MATERIALS[materialIndex].color} 
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          />

          {/* Normal Line */}
          {rays[0] && (
            <Line 
              x1={MID_X - 40} y1={rays[0].y2} 
              x2={MID_X + 40} y2={rays[0].y2} 
              stroke={txt1} 
              strokeDasharray="4 4" 
              opacity={0.3} 
            />
          )}

          {/* Laser Source */}
          <G transform={`translate(10, ${laserY - 10})`}>
             <Rect width="20" height="20" fill={isDark ? "#333" : "#CCC"} rx={4} />
             <Rect x="15" y="7" width="10" height="6" fill="#F00" rx={2} />
          </G>

          {/* Rays */}
          {rays.map((r, i) => (
             <Line 
               key={i} 
               x1={r.x1} y1={r.y1} 
               x2={r.x2} y2={r.y2} 
               stroke="#FF3131" 
               strokeWidth="3" 
               filter="url(#glow)"
             />
          ))}

          {/* Scientist Mode Labels */}
          {scientistMode && rays[0] && (
            <G>
               <SvgText x={MID_X - 40} y={rays[0].y2 - 10} fill={color} fontSize="10" fontFamily={FONTS.mono}>
                 θi = {angle}°
               </SvgText>
               <SvgText x={MID_X + 10} y={rays[0].y2 + 20} fill={color} fontSize="10" fontFamily={FONTS.mono}>
                 θr = {((Math.asin((n1/n2) * Math.sin(angle * Math.PI / 180)) * 180 / Math.PI) || 0).toFixed(1)}°
               </SvgText>
            </G>
          )}

          {/* Target */}
          <G transform={`translate(${CANVAS_W - 20}, ${MID_Y + 40})`}>
             <Circle r="10" fill="none" stroke="#FFD166" strokeWidth="2" />
             <Circle r="4" fill="#FFD166" />
          </G>
        </Svg>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: txt1 }]}>Laser Angle: {angle}°</Text>
            <View style={styles.sliderMock}>
               <TouchableOpacity onPress={() => setAngle(Math.max(-45, angle - 5))} style={styles.miniBtn}>
                 <Icon name="minus" size={16} color="#FFF" />
               </TouchableOpacity>
               <View style={styles.bar}>
                  <View style={[styles.barInner, 
// @ts-ignore
                  { width: ((angle + 45)/90)*100 + '%', backgroundColor: '#FF6B6B' }]} />
               </View>
               <TouchableOpacity onPress={() => setAngle(Math.min(45, angle + 5))} style={styles.miniBtn}>
                 <Icon name="plus" size={16} color="#FFF" />
               </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.controlRow}>
             <Text style={[styles.label, { color: txt1 }]}>Vertical Position</Text>
             <View style={styles.sliderMock}>
               <TouchableOpacity onPress={() => setLaserY(Math.max(20, laserY - 10))} style={styles.miniBtn}>
                 <Icon name="arrow-up" size={16} color="#FFF" />
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setLaserY(Math.min(CANVAS_H - 20, laserY + 10))} style={styles.miniBtn}>
                 <Icon name="arrow-down" size={16} color="#FFF" />
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </SimBox>

      {/* 3. Scientist Mode Analytics */}
      {scientistMode && (
        <ScientistCard title="Snell's Law Matrix">
          <View style={styles.sciGrid}>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Refractive Index (n2)</Text>
              <Text style={styles.sciValue}>{n2.toFixed(2)}</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Critical Angle</Text>
              <Text style={styles.sciValue}>{n2 < n1 ? (Math.asin(n2/n1) * 180 / Math.PI).toFixed(1) : 'N/A'} °</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Wavelength Shift</Text>
              <Text style={styles.sciValue}>{(1 / n2).toFixed(2)}x</Text>
            </View>
            <View style={styles.sciItem}>
              <Text style={styles.sciLabel}>Status</Text>
              <Text style={[styles.sciValue, { color: '#39FF14' }]}>RAY PROPAGATING</Text>
            </View>
          </View>
          <Text style={styles.formula}>n₁ sin θ₁ = n₂ sin θ₂</Text>
        </ScientistCard>
      )}

      {/* 4. Material Selection */}
      <View style={styles.materialContainer}>
        <Text style={[styles.sectionTitle, { color: txt1 }]}>Propagating Medium</Text>
        <View style={styles.materialRow}>
          {MATERIALS.map((mat, i) => (
            <TouchableOpacity 
              key={mat.name} 
              style={[styles.matBtn, materialIndex === i && styles.matActive]}
              onPress={() => setMaterialIndex(i)}
            >
              <Text style={[styles.matText, materialIndex === i && styles.matActiveText]}>{mat.name}</Text>
              <Text style={[styles.matN, materialIndex === i && styles.matActiveText]}>n={mat.n}</Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: RADIUS.md,
  },
  controlRow: {
    flex: 1,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  sliderMock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barInner: {
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
    marginBottom: 8,
  },
  sciLabel: {
    fontSize: 10,
    color: '#888',
  },
  sciValue: {
    fontSize: 13,
    fontFamily: FONTS.mono,
    color: '#FFF',
  },
  formula: {
    textAlign: 'center',
    color: '#4ECDC4',
    fontFamily: FONTS.mono,
    fontSize: 14,
    marginTop: 5,
  },
  materialContainer: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matBtn: {
    flex: 1,
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  matText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  matActiveText: {
    color: '#000',
  },
  matN: {
    fontSize: 8,
    color: '#888',
  },
  challengeBox: {
    marginTop: SPACING.xl,
    marginBottom: 40,
  }
});
