import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';

export default function AddictionLab({ isScientistMode }) {
  const { theme, isDark } = useTheme();
  const color = '#E74C3C';

  const [receptors, setReceptors] = useState(10); // Max 10
  const [joy, setJoy] = useState(0); // Total joy accumulated
  const [isDetoxing, setIsDetoxing] = useState(false);

  // Joy animation for floating numbers
  const [floatText, setFloatText] = useState(null);

  useEffect(() => {
    let interval;
    if (isDetoxing) {
      interval = setInterval(() => {
        setReceptors(prev => {
          if (prev >= 10) {
            setIsDetoxing(false);
            return 10;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return prev + 1;
        });
      }, 1000); // Regenerate 1 receptor per second during detox
    }
    return () => clearInterval(interval);
  }, [isDetoxing]);

  const triggerFloat = (amount, colorType) => {
    setFloatText({ amount, colorType, id: Date.now() });
    setTimeout(() => setFloatText(null), 800);
  };

  const handleCheapDopamine = () => {
    if (isDetoxing) setIsDetoxing(false);
    
    // Calculates joy based on current receptors. Cheap dopamine triggers ALL available receptors intensely.
    const joyGained = receptors * 2;
    setJoy(prev => prev + joyGained);
    triggerFloat(`+${joyGained} JOY`, color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Down-regulation: The brain protects itself by deleting a receptor
    setReceptors(prev => Math.max(1, prev - 1));
  };

  const handleHealthyActivity = () => {
    if (isDetoxing) setIsDetoxing(false);

    // Healthy activities only trigger a normal amount per receptor.
    // If receptors are low, joy is almost zero.
    const joyGained = Math.floor(receptors * 0.5);
    setJoy(prev => prev + joyGained);
    triggerFloat(`+${joyGained} JOY`, '#2ECC71');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startDetox = () => {
    setIsDetoxing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Dopamine Receptor Simulator
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        Watch how cheap dopamine destroys your baseline joy.
      </Text>

      {/* Brain Area */}
      <View style={[styles.brainArea, { backgroundColor: theme.bg.elevated, borderColor: theme.glass.border }]}>
        <View style={styles.joyOverlay}>
          <Text style={[styles.joyTotal, { color: theme.text.primary }]}>Total Joy: {joy}</Text>
        </View>

        {floatText && (
          <Text key={floatText.id} style={[styles.floatText, { color: floatText.colorType }]}>
            {floatText.amount}
          </Text>
        )}

        <Text style={[styles.receptorLabel, { color: theme.text.secondary }]}>
          Active Receptors: {receptors}/10
        </Text>
        <View style={styles.receptorRow}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.receptorIcon, 
                { opacity: i < receptors ? 1 : 0.2 }
              ]}
            >
              <Icon name="magnet" size={24} color={i < receptors ? '#F39C12' : theme.text.muted} />
            </View>
          ))}
        </View>
        
        {receptors <= 3 && !isDetoxing && (
          <Text style={[styles.warningText, { color: color }]}>
            WARNING: Severe Down-Regulation. You are numb to normal activities.
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={handleCheapDopamine} 
          style={[styles.btn, { backgroundColor: color + '20', borderColor: color }]}
          activeOpacity={0.7}
        >
          <Icon name="smartphone" size={20} color={color} />
          <View>
            <Text style={[styles.btnText, { color: color }]}>Cheap Dopamine</Text>
            <Text style={[styles.btnSub, { color: color }]}>High impact, destroys receptors</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleHealthyActivity} 
          style={[styles.btn, { backgroundColor: '#2ECC7120', borderColor: '#2ECC71' }]}
          activeOpacity={0.7}
        >
          <Icon name="book" size={20} color="#2ECC71" />
          <View>
            <Text style={[styles.btnText, { color: '#2ECC71' }]}>Healthy Activity</Text>
            <Text style={[styles.btnSub, { color: '#2ECC71' }]}>Needs active receptors to feel good</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          onPress={startDetox} 
          disabled={receptors === 10 || isDetoxing}
          style={[
            styles.detoxBtn, 
            { 
              backgroundColor: isDetoxing ? '#3498DB' : (receptors === 10 ? theme.glass.light : '#3498DB20'),
              borderColor: isDetoxing ? '#3498DB' : (receptors === 10 ? theme.glass.border : '#3498DB')
            }
          ]}
        >
          <Icon name="shield" size={20} color={isDetoxing || receptors === 10 ? '#FFF' : '#3498DB'} />
          <Text style={[
            styles.detoxBtnText, 
            { color: isDetoxing || receptors === 10 ? '#FFF' : '#3498DB' }
          ]}>
            {isDetoxing ? "DETOXING (REBUILDING...)" : "START DOPAMINE DETOX"}
          </Text>
        </TouchableOpacity>
      </View>

      {isScientistMode && (
        <View style={[styles.sciPanel, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
          <Text style={[styles.sciTitle, { color: color }]}>Neuro Metrics</Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Baseline Dopamine: {receptors * 10}%
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Receptor Down-Regulation: {(10 - receptors) * 10}%
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Anhedonia Risk: {receptors <= 3 ? "CRITICAL" : receptors <= 6 ? "MODERATE" : "LOW"}
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

  brainArea: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
    height: 180,
    justifyContent: 'center'
  },
  joyOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  joyTotal: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  floatText: {
    position: 'absolute',
    top: '30%',
    fontFamily: FONTS.displayMedium,
    fontSize: 32,
    zIndex: 10,
  },
  receptorLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    marginBottom: SPACING.md
  },
  receptorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  warningText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    marginTop: SPACING.md,
    textAlign: 'center'
  },

  controls: {
    gap: SPACING.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
  },
  btnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  btnSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    opacity: 0.8
  },
  divider: {
    height: 10
  },
  detoxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
  },
  detoxBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
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
