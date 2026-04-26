import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ATTACKS = [
  {
    criticVoice: "You failed that test. You are completely stupid and useless.",
    fallacy: "Overgeneralization",
    options: [
      { text: "I am actually a genius, I just didn't care about the test.", isHealthy: false, feedback: "Toxic Positivity. Your brain knows you are lying to protect your ego." },
      { text: "I failed one test. It is a single data point, not my whole identity.", isHealthy: true, feedback: "Excellent Neutrality. You acknowledged the fact (failure) without attaching it to your worth." },
      { text: "It's the teacher's fault! They hate me.", isHealthy: false, feedback: "Deflection. Refusing accountability prevents growth." }
    ]
  },
  {
    criticVoice: "They didn't text back. They hate you. You are unlovable.",
    fallacy: "Mind Reading / Catastrophizing",
    options: [
      { text: "They are probably just busy or forgot. My worth isn't determined by a text.", isHealthy: true, feedback: "Perfect. You decoupled your fundamental worth from an external, uncontrollable event." },
      { text: "Fine, I hate them too. I don't need anyone.", isHealthy: false, feedback: "Defensive isolation. The critic wins by making you push people away." },
      { text: "I must be so annoying. I should apologize immediately.", isHealthy: false, feedback: "People-Pleasing. This validates the core belief that you are a burden." }
    ]
  },
  {
    criticVoice: "Look in the mirror. You are ugly. No one will ever want you.",
    fallacy: "Filtering / Core Belief Projection",
    options: [
      { text: "I am the most beautiful person in the world!", isHealthy: false, feedback: "Toxic Positivity. Forced extreme statements trigger cognitive dissonance." },
      { text: "I am so gross. I shouldn't go outside.", isHealthy: false, feedback: "Surrendering. The Critic takes full control of your actions." },
      { text: "I have a body. Its main job is to keep me alive, not just look perfect.", isHealthy: true, feedback: "Self-Neutrality. You removed the 'performance' aspect of your physical body." }
    ]
  }
];

export default function SelfEsteemLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentAttack, setCurrentAttack] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, feedback, won
  const [lastFeedback, setLastFeedback] = useState(null);
  const [selfReliance, setSelfReliance] = useState(10); // Start low

  // Shake animation for incorrect choices
  const [shakeAnim] = useState(new Animated.Value(0));

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
    ]).start();
  };

  const handleOption = (option) => {
    if (option.isHealthy) {
      setSelfReliance(prev => Math.min(100, prev + 30));
      setLastFeedback({ success: true, text: option.feedback });
    } else {
      triggerShake();
      setSelfReliance(prev => Math.max(0, prev - 10));
      setLastFeedback({ success: false, text: option.feedback });
    }
    setGameState('feedback');
  };

  const nextStep = () => {
    if (lastFeedback.success) {
      if (currentAttack < ATTACKS.length - 1) {
        setCurrentAttack(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('won');
        if (onComplete) setTimeout(onComplete, 2000);
      }
    } else {
      setGameState('playing'); // Try again
    }
  };

  const attack = ATTACKS[currentAttack];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD Tracker */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'आत्म-निर्भरता (Self-Reliance):' : 'Self-Reliance / Neutrality:'} {Math.ceil(selfReliance)}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${selfReliance}%`, backgroundColor: selfReliance > 50 ? '#4CAF50' : '#FFC107' }]} />
        </View>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
        
        {gameState === 'playing' && (
          <View>
            <View style={styles.criticBubble}>
              <View style={styles.criticHeader}>
                <Feather name="mic" size={18} color="#FFF" />
                <Text style={styles.criticTitle}>{isHindi ? 'आंतरिक आलोचक' : 'Inner Critic'}</Text>
              </View>
              <Text style={styles.criticText}>"{attack.criticVoice}"</Text>
              <View style={styles.fallacyBox}>
                <Text style={styles.fallacyText}>
                  {isHindi ? 'संज्ञानात्मक त्रुटि:' : 'Detected Fallacy:'} {attack.fallacy}
                </Text>
              </View>
            </View>

            <Text style={[styles.instruction, { color: textColor }]}>
              {isHindi ? 'तहे दिल से तर्कसंगत प्रतिक्रिया चुनें:' : 'Select the grounded, neutral response:'}
            </Text>

            {attack.options.map((opt, i) => (
              <TouchableOpacity key={i} style={[styles.optionBtn, { borderColor: isDarkMode ? '#444' : '#E0E0E0' }]} onPress={() => handleOption(opt)}>
                <Text style={[styles.optionText, { color: textColor }]}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {gameState === 'feedback' && (
          <View style={styles.centerContent}>
            <Feather 
              name={lastFeedback.success ? "shield" : "alert-circle"} 
              size={64} 
              color={lastFeedback.success ? "#4CAF50" : "#F44336"} 
              style={styles.iconMargin} 
            />
            <Text style={[styles.feedbackTitle, { color: lastFeedback.success ? "#4CAF50" : "#F44336" }]}>
              {lastFeedback.success ? (isHindi ? "सीमा निर्धारित!" : "Boundary Set!") : (isHindi ? "आलोचक जीत गया!" : "Critic Breached Defenses!")}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {isHindi ? (lastFeedback.success ? "सही। आपने लॉज़िक का इस्तेमाल किया।" : "गलत। यह प्रतिक्रिया बचाव तंत्र है।") : lastFeedback.text}
            </Text>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: lastFeedback.success ? "#4CAF50" : "#F44336" }]} 
              onPress={nextStep}
            >
              <Text style={styles.btnText}>{isHindi ? 'जारी रखें' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
             <Feather name="anchor" size={64} color="#00BCD4" style={styles.iconMargin} />
             <Text style={[styles.feedbackTitle, { color: '#00BCD4' }]}>
               {isHindi ? 'न्यूट्रैलिटी हासिल की!' : 'Neutrality Achieved!'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? 'आपने अपने आलोचक को ख़ामोश नहीं किया; आपने बस उसकी बकवास पर विश्वास करना बंद कर दिया। यही सच्चा आत्म-सम्मान है।' 
                 : 'You didn\'t silence the critic; you just stopped believing its nonsense. You separated your inherent worth from external events.'}
             </Text>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  hud: {
    marginBottom: 24,
  },
  hudLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barContainer: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 400,
  },
  criticBubble: {
    backgroundColor: '#300808', // Dark red tint
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 24,
  },
  criticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  criticTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  criticText: {
    color: '#FFCDD2',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 26,
  },
  fallacyBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  fallacyText: {
    color: '#FFAB91',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionBtn: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    flex: 1,
  },
  iconMargin: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    width: '80%',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
