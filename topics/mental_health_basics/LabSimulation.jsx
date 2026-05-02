import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import { soundTap } from '../../utils/sounds';

const { width } = Dimensions.get('window');

const LENSES = [
  {
    id: 'clarity',
    title: 'Clarity (Baseline)',
    titleHi: 'स्पष्टता (बेसलाइन)',
    color: '#00D4A0',
    bgGradient: ['#0A1A1A', '#050D0A'],
    scenario: "Your boss sends a message: 'Can we chat later?'",
    scenarioHi: "आपका बॉस एक संदेश भेजता है: 'क्या हम बाद में बात कर सकते हैं?'",
    interpretation: "They probably just want to discuss the new project update or catch up.",
    interpretationHi: "वे शायद सिर्फ नए प्रोजेक्ट अपडेट पर चर्चा करना चाहते हैं।",
    sciText: "AMYGDALA: Baseline\nSEROTONIN: Balanced\nDISTORTION: None"
  },
  {
    id: 'anxiety',
    title: 'Anxiety (Threat Filter)',
    titleHi: 'चिंता (खतरा फ़िल्टर)',
    color: '#FF4444',
    bgGradient: ['#3A0A0A', '#1A0000'],
    scenario: "Your boss sends a message: 'Can we chat later?'",
    scenarioHi: "आपका बॉस एक संदेश भेजता है: 'क्या हम बाद में बात कर सकते हैं?'",
    interpretation: "I'M GETTING FIRED! What did I do wrong? I need to defend myself right now!",
    interpretationHi: "मुझे निकाला जा रहा है! मैंने क्या गलत किया? मुझे अपना बचाव करना होगा!",
    sciText: "AMYGDALA: Hyper-vigilant\nCORTISOL: Spiking\nDISTORTION: Catastrophizing"
  },
  {
    id: 'depression',
    title: 'Depression (Gray Filter)',
    titleHi: 'अवसाद (ग्रे फ़िल्टर)',
    color: '#6C63FF',
    bgGradient: ['#0A0A1A', '#000010'],
    scenario: "Your boss sends a message: 'Can we chat later?'",
    scenarioHi: "आपका बॉस एक संदेश भेजता है: 'क्या हम बाद में बात कर सकते हैं?'",
    interpretation: "They've finally realized I'm not good enough. Why do I even try? It's pointless.",
    interpretationHi: "उन्हें आखिरकार एहसास हो गया है कि मैं काफी अच्छा नहीं हूं। कोई फायदा नहीं।",
    sciText: "AMYGDALA: Suppressed\nSEROTONIN: Depleted\nDISTORTION: Personalization"
  }
];

export default function MentalHealthLab({ scientistMode = false, isHindi = false }) {
  const { theme } = useTheme();
  const [activeLens, setActiveLens] = useState(0);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Heartbeat interval for anxiety
  useEffect(() => {
    let interval;
    if (activeLens === 1) { // Anxiety
      interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [activeLens]);

  const selectLens = (index) => {
    if (index === activeLens) return;
    soundTap();
    
    if (index === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (index === 1) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (index === 2) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setActiveLens(index);
    
    // Animate color transition
    Animated.timing(colorAnim, {
      toValue: index,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  };

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [LENSES[0].bgGradient[0], LENSES[1].bgGradient[0], LENSES[2].bgGradient[0]]
  });

  const lensData = LENSES[activeLens];

  return (
    <View style={styles.container}>
      {/* 🧠 The Cognitive Filter View */}
      <Animated.View style={[styles.simBox, { backgroundColor: bgColor }]}>
        
        {scientistMode && (
          <View style={styles.sciOverlay}>
            <Text style={styles.sciText}>{lensData.sciText}</Text>
          </View>
        )}

        <Animated.View style={[
          styles.lensContainer,
          { borderColor: lensData.color },
          activeLens === 1 && { transform: [{ translateX: shakeAnim }] },
          activeLens === 2 && { opacity: 0.7 } // Dimmer for depression
        ]}>
          <Icon name="eye" size={24} color={lensData.color} style={{ alignSelf: 'center', marginBottom: 10 }} />
          
          <Text style={styles.scenarioLabel}>
            {isHindi ? "उद्देश्य परिदृश्य (Objective Scenario):" : "Objective Scenario:"}
          </Text>
          <Text style={styles.scenarioText}>
            {isHindi ? lensData.scenarioHi : lensData.scenario}
          </Text>

          <View style={[styles.interpretationBox, { backgroundColor: lensData.color + '20' }]}>
            <Text style={[styles.interpretationLabel, { color: lensData.color }]}>
              {isHindi ? "फ़िल्टर की गई धारणा:" : "Filtered Perception:"}
            </Text>
            <Text style={[styles.interpretationText, { color: lensData.color }]}>
              {isHindi ? lensData.interpretationHi : lensData.interpretation}
            </Text>
          </View>

        </Animated.View>

      </Animated.View>

      {/* 🔘 Lens Selectors */}
      <View style={styles.selectorRow}>
        {LENSES.map((lens, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[
              styles.selectorBtn, 
              activeLens === idx && { borderColor: lens.color, backgroundColor: lens.color + '20' }
            ]}
            onPress={() => selectLens(idx)}
          >
            <Text style={[styles.selectorTxt, activeLens === idx && { color: lens.color }]}>
              {isHindi ? lens.titleHi.split(' ')[0] : lens.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footerInfo}>
        <Icon name="info" size={14} color="#888" />
        <Text style={styles.footerText}>
          {isHindi 
            ? "संज्ञानात्मक व्यवहार थेरेपी (सीबीटी) हमें अपने 'लेंस' को पहचानने और विकृत विचारों को फिर से परिभाषित करने में मदद करती है।"
            : "Cognitive Behavioral Therapy (CBT) helps us recognize our 'lens' and reframe distorted thoughts."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  simBox: { 
    height: 380, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden'
  },
  lensContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  scenarioLabel: { color: '#888', fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 5 },
  scenarioText: { color: '#fff', fontSize: 16, fontFamily: FONTS.displayBold, marginBottom: 20, lineHeight: 24 },
  
  interpretationBox: { padding: 15, borderRadius: RADIUS.sm },
  interpretationLabel: { fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 5 },
  interpretationText: { fontSize: 18, fontFamily: FONTS.displayBold, lineHeight: 26 },

  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 15 },
  selectorBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, alignItems: 'center' },
  selectorTxt: { color: '#aaa', fontFamily: FONTS.displayBold, fontSize: 12 },

  sciOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 9, fontFamily: 'monospace', textAlign: 'right', lineHeight: 14 },

  footerInfo: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 10 },
  footerText: { flex: 1, fontSize: 10, color: '#666', fontStyle: 'italic', lineHeight: 14 }
});
