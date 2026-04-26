import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';

export default function ConsistencyLab({ isScientistMode }) {
  const { theme, isDark } = useTheme();
  const color = '#2ECC71';

  const [frictionLevel, setFrictionLevel] = useState(80); // 0 to 100
  const [day, setDay] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [habitState, setHabitState] = useState([]); // Array of { day, motivation, success }

  // We'll simulate 30 days. Motivation naturally fluctuates (sine wave + random noise)
  useEffect(() => {
    let interval;
    if (isRunning && day <= 30) {
      interval = setInterval(() => {
        setDay(d => {
          if (d >= 30) {
            setIsRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 30;
          }
          
          const nextDay = d + 1;
          
          // Motivation starts high (100) on day 1, drops, fluctuates
          let motivation = 0;
          if (nextDay === 1) motivation = 100;
          else {
            // Base motivation follows a drop-off, then a wave
            const base = 50 + Math.cos(nextDay * 0.5) * 30; 
            const noise = (Math.random() * 20) - 10;
            motivation = Math.max(0, Math.min(100, base + noise));
          }

          // Habit succeeds if Motivation > Friction
          const success = motivation >= frictionLevel;

          setHabitState(prev => [...prev, { day: nextDay, motivation, success }]);
          
          if (!success) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          return nextDay;
        });
      }, 300); // 300ms per day
    }
    return () => clearInterval(interval);
  }, [isRunning, day, frictionLevel]);

  const startSimulation = () => {
    setDay(0);
    setHabitState([]);
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const adjustFriction = (val) => {
    if (isRunning) return;
    setFrictionLevel(val);
    Haptics.selectionAsync();
  };

  const successfulDays = habitState.filter(s => s.success).length;

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Habit Survival Simulator
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        Will your habit survive 30 days when motivation drops?
      </Text>

      {/* The Timeline Graph */}
      <View style={[styles.graphArea, { backgroundColor: theme.bg.elevated, borderColor: theme.glass.border }]}>
        
        {/* Y-Axis Label */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisText, { color: theme.text.muted }]}>100</Text>
          <Text style={[styles.axisText, { color: theme.text.muted }]}>0</Text>
        </View>

        <View style={styles.graphContent}>
          {/* Friction Line */}
          <View style={[styles.frictionLine, { bottom: `${frictionLevel}%`, borderColor: '#E74C3C' }]}>
            <Text style={styles.frictionLabel}>Friction Boundary</Text>
          </View>

          {/* Motivation Bars */}
          <View style={styles.barsRow}>
            {habitState.map((state, i) => (
              <View key={i} style={styles.barWrap}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${state.motivation}%`, 
                      backgroundColor: state.success ? color : theme.glass.border 
                    }
                  ]} 
                />
                {state.success ? null : <View style={styles.failDot} />}
              </View>
            ))}
          </View>
        </View>

        {/* X-Axis Label */}
        <Text style={[styles.xAxisText, { color: theme.text.muted }]}>
          Day 1 → Day 30
        </Text>
      </View>

      {/* Stats */}
      {day > 0 && (
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>
            Day: {day}/30
          </Text>
          <Text style={[styles.statText, { color: successfulDays > 20 ? color : '#E74C3C' }]}>
            Success Rate: {Math.round((successfulDays / (day || 1)) * 100)}%
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={[styles.sliderLabel, { color: theme.text.primary }]}>
          Environment Friction: {frictionLevel}%
        </Text>
        <Text style={[styles.sliderSub, { color: theme.text.secondary }]}>
          (How hard the habit is to do)
        </Text>
        
        <View style={styles.frictionBtns}>
          <TouchableOpacity 
            onPress={() => adjustFriction(80)} 
            style={[styles.fBtn, frictionLevel === 80 && { backgroundColor: theme.glass.medium, borderColor: '#E74C3C' }]}
          >
            <Text style={[styles.fBtnText, { color: frictionLevel === 80 ? '#E74C3C' : theme.text.secondary }]}>High (80%)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => adjustFriction(50)} 
            style={[styles.fBtn, frictionLevel === 50 && { backgroundColor: theme.glass.medium, borderColor: '#F39C12' }]}
          >
            <Text style={[styles.fBtnText, { color: frictionLevel === 50 ? '#F39C12' : theme.text.secondary }]}>Med (50%)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => adjustFriction(20)} 
            style={[styles.fBtn, frictionLevel === 20 && { backgroundColor: theme.glass.medium, borderColor: color }]}
          >
            <Text style={[styles.fBtnText, { color: frictionLevel === 20 ? color : theme.text.secondary }]}>Low (20%)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={startSimulation} 
          disabled={isRunning}
          style={[
            styles.runBtn, 
            { backgroundColor: isRunning ? theme.glass.light : color }
          ]}
        >
          <Icon name={isRunning ? "clock" : "play"} size={20} color="#FFF" />
          <Text style={styles.runBtnText}>
            {isRunning ? "SIMULATING..." : day === 30 ? "RUN AGAIN" : "START 30 DAYS"}
          </Text>
        </TouchableOpacity>
      </View>

      {isScientistMode && (
        <View style={[styles.sciPanel, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
          <Text style={[styles.sciTitle, { color: color }]}>System Math</Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Success Condition: Motivation >= Friction
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Motivation Decay: Base = 50 + cos(t*0.5)*30
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Avg Expected Success: {frictionLevel === 80 ? "15%" : frictionLevel === 50 ? "45%" : "95%"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, paddingBottom: 100 },
  title: { fontFamily: FONTS.displayMedium, fontSize: 22, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', marginBottom: SPACING.xl },

  graphArea: {
    height: 250,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    marginBottom: SPACING.md,
    position: 'relative'
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderColor: '#ffffff20'
  },
  axisText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
  },
  graphContent: {
    flex: 1,
    position: 'relative',
    marginLeft: SPACING.sm,
  },
  frictionLine: {
    position: 'absolute',
    left: 0, right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    zIndex: 0,
  },
  frictionLabel: {
    position: 'absolute',
    top: -16,
    right: 0,
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: '#E74C3C'
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  barWrap: {
    width: '3%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  failDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#E74C3C',
    position: 'absolute',
    bottom: -6
  },
  xAxisText: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    marginTop: 10,
    paddingHorizontal: SPACING.sm,
  },
  statText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },

  controls: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  sliderLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  sliderSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: -4,
  },
  frictionBtns: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  fBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#ffffff20'
  },
  fBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },

  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.full,
  },
  runBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 1
  },

  sciPanel: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  sciTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    marginBottom: 8
  },
  sciText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    marginBottom: 4,
    fontVariant: ['tabular-nums']
  }
});
