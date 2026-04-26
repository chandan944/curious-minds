import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';

export default function MeditationLab({ isScientistMode }) {
  const { theme, isDark } = useTheme();
  const color = '#2ECC71';

  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [focusLevel, setFocusLevel] = useState(0); // 0 to 100
  const [isFocusing, setIsFocusing] = useState(false);

  const breathAnim = useRef(new Animated.Value(1)).current;
  const dmnAnim = useRef(new Animated.Value(1)).current;

  // Breathing Loop
  useEffect(() => {
    let isActive = true;

    const runBreathingCycle = () => {
      if (!isActive) return;

      // Inhale
      setPhase('Inhale');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(breathAnim, {
        toValue: 1.8,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!isActive) return;
        // Hold
        setPhase('Hold');
        setTimeout(() => {
          if (!isActive) return;
          // Exhale
          setPhase('Exhale');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (isActive) runBreathingCycle();
          });
        }, 2000);
      });
    };

    runBreathingCycle();
    return () => { isActive = false; };
  }, []);

  // Focus level logic
  useEffect(() => {
    const interval = setInterval(() => {
      setFocusLevel(prev => {
        let next = prev;
        if (isFocusing) {
          next = Math.min(100, prev + 2);
        } else {
          next = Math.max(0, prev - 4);
        }
        
        // Update DMN brightness based on focus
        // Focus 100 = DMN 0. Focus 0 = DMN 1
        const targetDmn = 1 - (next / 100);
        Animated.timing(dmnAnim, {
          toValue: targetDmn,
          duration: 300,
          useNativeDriver: true
        }).start();

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isFocusing]);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Neuro-Focus Visualizer
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        Hold the button to focus. Release to let the mind wander.
      </Text>

      <View style={styles.brainContainer}>
        {/* The DMN (Monkey Mind) Indicator */}
        <Animated.View style={[styles.dmnIndicator, { opacity: dmnAnim, backgroundColor: '#E74C3C' }]}>
          <Icon name="alert" size={24} color="#FFF" />
          <Text style={styles.dmnText}>Default Mode Network (Anxiety) Active</Text>
        </Animated.View>

        {/* The Breathing Circle */}
        <View style={styles.breathWrap}>
          <Animated.View style={[
            styles.breathCircle,
            {
              borderColor: color,
              backgroundColor: color + '20',
              transform: [{ scale: breathAnim }]
            }
          ]} />
          <Text style={[styles.phaseText, { color: theme.text.primary }]}>{phase}</Text>
        </View>

        {/* The TPN (Focus) Indicator */}
        <Animated.View style={[styles.tpnIndicator, { opacity: Animated.subtract(1, dmnAnim), backgroundColor: '#3498DB' }]}>
          <Icon name="brain" size={24} color="#FFF" />
          <Text style={styles.dmnText}>Task-Positive Network Active</Text>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <Text style={[styles.focusLabel, { color: theme.text.primary }]}>
          Focus Level: {focusLevel}%
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.glass.light }]}>
          <View style={[styles.progressFill, { width: `${focusLevel}%`, backgroundColor: color }]} />
        </View>

        <TouchableOpacity
          onPressIn={() => {
            setIsFocusing(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => {
            setIsFocusing(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }}
          activeOpacity={0.8}
          style={[styles.focusBtn, { backgroundColor: isFocusing ? color : theme.glass.medium, borderColor: color }]}
        >
          <Text style={[styles.focusBtnText, { color: isFocusing ? '#FFF' : color }]}>
            {isFocusing ? "HOLDING FOCUS..." : "HOLD TO FOCUS"}
          </Text>
        </TouchableOpacity>
      </View>

      {isScientistMode && (
        <View style={[styles.sciPanel, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
          <Text style={[styles.sciTitle, { color: color }]}>Neuro Metrics</Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Amygdala Volume: {100 - (focusLevel * 0.4)}%
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Vagal Tone (HRV): {30 + (focusLevel * 0.7)} ms
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Prefrontal Cortex Activation: {focusLevel}%
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
  
  brainContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative'
  },
  breathWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    position: 'absolute'
  },
  phaseText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
  },

  dmnIndicator: {
    position: 'absolute',
    top: 0,
    padding: 12,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tpnIndicator: {
    position: 'absolute',
    bottom: 0,
    padding: 12,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dmnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    color: '#FFF'
  },

  controls: {
    alignItems: 'center'
  },
  focusLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    marginBottom: 8
  },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.xl
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },

  focusBtn: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center'
  },
  focusBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
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
