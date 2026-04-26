import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';

export default function LifeHacksLab({ isScientistMode }) {
  const { theme, isDark } = useTheme();
  const color = '#F39C12'; // Gold/Energy

  // Timeline from 6AM to 10PM (16 hours)
  // We'll track energy levels (0-100) based on choices
  const [choices, setChoices] = useState({
    coffeeTime: null, // 'wake', '90min', 'afternoon'
    shower: null, // 'hot', 'cold'
    workStyle: null, // 'cram', 'pomodoro'
    evening: null // 'screens', 'reading'
  });

  const [simulationRun, setSimulationRun] = useState(false);
  const [energyData, setEnergyData] = useState([]);

  const handleChoice = (category, value) => {
    setChoices(prev => ({ ...prev, [category]: value }));
    setSimulationRun(false);
    Haptics.selectionAsync();
  };

  const runSimulation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Calculate energy curve based on choices
    let data = [];
    let currentEnergy = 40; // Waking up slightly groggy
    let adenosine = 50; // High in morning
    let cortisol = 10;

    for (let hour = 6; hour <= 22; hour++) {
      // Base biological changes
      cortisol += (hour <= 9) ? 20 : -10; // Spikes early, drops later
      if (cortisol < 0) cortisol = 0;
      
      // Accumulate sleepiness
      adenosine += 5; 

      // Apply Hacks
      // Morning Shower
      if (hour === 7) {
        if (choices.shower === 'cold') currentEnergy += 30; // Massive boost
        if (choices.shower === 'hot') currentEnergy += 10; // Relaxing, slightly sleepy
      }

      // Coffee
      if (choices.coffeeTime === 'wake' && hour === 7) {
        currentEnergy += 40; // Big boost early
        adenosine += 20; // Hiding adenosine, builds up faster behind the scenes
      }
      if (choices.coffeeTime === '90min' && hour === 8) {
        currentEnergy += 30; // Smooth boost
      }
      if (choices.coffeeTime === 'wake' && hour === 14) {
        // The afternoon crash from early coffee
        currentEnergy -= 40;
      }

      // Work Style (10 AM to 4 PM)
      if (hour >= 10 && hour <= 16) {
        if (choices.workStyle === 'cram') {
          currentEnergy -= 15; // Drain
        } else if (choices.workStyle === 'pomodoro') {
          currentEnergy -= 5; // Sustained
        }
      }

      // Evening
      if (hour >= 20) {
        if (choices.evening === 'screens') {
          currentEnergy += 10; // Artificial blue light boost
        } else if (choices.evening === 'reading') {
          currentEnergy -= 15; // Natural wind down
        }
      }

      // Calculate final energy for this hour
      let finalEnergy = Math.max(0, Math.min(100, currentEnergy - (adenosine * 0.2) + cortisol));
      data.push({ hour, energy: finalEnergy });
    }

    setEnergyData(data);
    setSimulationRun(true);
  };

  const isComplete = Object.values(choices).every(val => val !== null);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          24-Hour Energy Optimizer
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Design your day. Choose your hacks and see how your energy levels respond.
        </Text>

        {!simulationRun ? (
          <View style={styles.builderArea}>
            
            {/* Coffee Choice */}
            <View style={styles.choiceGroup}>
              <Text style={[styles.choiceTitle, { color: theme.text.primary }]}>
                1. When do you drink your first coffee? ☕
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  onPress={() => handleChoice('coffeeTime', 'wake')}
                  style={[styles.optBtn, choices.coffeeTime === 'wake' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.coffeeTime === 'wake' ? color : theme.text.secondary }]}>Immediately</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleChoice('coffeeTime', '90min')}
                  style={[styles.optBtn, choices.coffeeTime === '90min' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.coffeeTime === '90min' ? color : theme.text.secondary }]}>After 90 Mins</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shower Choice */}
            <View style={styles.choiceGroup}>
              <Text style={[styles.choiceTitle, { color: theme.text.primary }]}>
                2. Morning Shower Temp? 🚿
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  onPress={() => handleChoice('shower', 'hot')}
                  style={[styles.optBtn, choices.shower === 'hot' && { borderColor: '#E74C3C', backgroundColor: '#E74C3C20' }]}
                >
                  <Text style={[styles.optText, { color: choices.shower === 'hot' ? '#E74C3C' : theme.text.secondary }]}>Hot & Relaxing</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleChoice('shower', 'cold')}
                  style={[styles.optBtn, choices.shower === 'cold' && { borderColor: '#3498DB', backgroundColor: '#3498DB20' }]}
                >
                  <Text style={[styles.optText, { color: choices.shower === 'cold' ? '#3498DB' : theme.text.secondary }]}>Ice Cold</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Work Choice */}
            <View style={styles.choiceGroup}>
              <Text style={[styles.choiceTitle, { color: theme.text.primary }]}>
                3. How do you work/study? 💻
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  onPress={() => handleChoice('workStyle', 'cram')}
                  style={[styles.optBtn, choices.workStyle === 'cram' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.workStyle === 'cram' ? color : theme.text.secondary }]}>Cram (4 hrs straight)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleChoice('workStyle', 'pomodoro')}
                  style={[styles.optBtn, choices.workStyle === 'pomodoro' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.workStyle === 'pomodoro' ? color : theme.text.secondary }]}>Pomodoro (Breaks)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Evening Choice */}
            <View style={styles.choiceGroup}>
              <Text style={[styles.choiceTitle, { color: theme.text.primary }]}>
                4. Evening wind-down? 🌙
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  onPress={() => handleChoice('evening', 'screens')}
                  style={[styles.optBtn, choices.evening === 'screens' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.evening === 'screens' ? color : theme.text.secondary }]}>Scrolling Phone</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleChoice('evening', 'reading')}
                  style={[styles.optBtn, choices.evening === 'reading' && { borderColor: color, backgroundColor: color + '20' }]}
                >
                  <Text style={[styles.optText, { color: choices.evening === 'reading' ? color : theme.text.secondary }]}>Reading a Book</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={runSimulation}
              disabled={!isComplete}
              style={[styles.runBtn, { backgroundColor: isComplete ? color : theme.glass.light }]}
            >
              <Text style={[styles.runBtnText, { color: isComplete ? '#FFF' : theme.text.muted }]}>
                {isComplete ? "RUN SIMULATION" : "MAKE ALL CHOICES FIRST"}
              </Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.resultsArea}>
            
            {/* The Graph */}
            <View style={[styles.graphBox, { backgroundColor: theme.bg.elevated, borderColor: theme.glass.border }]}>
              <Text style={[styles.graphTitle, { color: theme.text.primary }]}>Your Daily Energy Graph 📈</Text>
              
              <View style={styles.graphInner}>
                {energyData.map((d, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={[
                      styles.energyBar, 
                      { 
                        height: `${d.energy}%`,
                        backgroundColor: d.energy > 60 ? '#2ECC71' : d.energy > 30 ? '#F39C12' : '#E74C3C' 
                      }
                    ]} />
                    <Text style={[styles.hourText, { color: theme.text.muted }]}>
                      {d.hour > 12 ? d.hour - 12 : d.hour}{d.hour >= 12 ? 'p' : 'a'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Analysis */}
            <View style={[styles.analysisBox, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
              <Text style={[styles.analysisTitle, { color: color }]}>Lab Analysis</Text>
              
              {choices.coffeeTime === 'wake' ? (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>❌ Early coffee caused an afternoon adenosine crash around 2 PM.</Text>
              ) : (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>✅ Delayed coffee allowed cortisol to wake you up naturally, smoothing your afternoon energy.</Text>
              )}

              {choices.workStyle === 'cram' ? (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>❌ Cramming depleted your prefrontal cortex, leading to exhaustion by 4 PM.</Text>
              ) : (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>✅ Pomodoro breaks kept your brain oxygenated, maintaining steady focus.</Text>
              )}

              {choices.evening === 'screens' ? (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>❌ Evening blue light blocked melatonin. You will sleep poorly tonight.</Text>
              ) : (
                <Text style={[styles.analysisText, { color: theme.text.secondary }]}>✅ Reading allowed natural melatonin production. You're ready for deep sleep.</Text>
              )}
            </View>

            <TouchableOpacity 
              onPress={() => setSimulationRun(false)}
              style={[styles.resetBtn, { borderColor: color }]}
            >
              <Text style={[styles.resetBtnText, { color }]}>RE-CONFIGURE DAY</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, paddingBottom: 100 },
  title: { fontFamily: FONTS.displayMedium, fontSize: 22, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', marginBottom: SPACING.xl },

  builderArea: {
    gap: SPACING.xl,
  },
  choiceGroup: {
    gap: SPACING.md,
  },
  choiceTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  optBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    textAlign: 'center'
  },
  
  runBtn: {
    marginTop: SPACING.xl,
    paddingVertical: 18,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  runBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    letterSpacing: 1
  },

  resultsArea: {
    gap: SPACING.xl,
  },
  graphBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  graphTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    marginBottom: SPACING.lg,
    textAlign: 'center'
  },
  graphInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingBottom: 20, // space for text
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  energyBar: {
    width: '60%',
    borderRadius: 4,
  },
  hourText: {
    position: 'absolute',
    bottom: -20,
    fontFamily: FONTS.bodyMedium,
    fontSize: 9,
  },

  analysisBox: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 10,
  },
  analysisTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    marginBottom: 4,
  },
  analysisText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
  },

  resetBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
    letterSpacing: 1
  }
});
