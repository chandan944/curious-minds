import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Rect, Group } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const MAX_ENERGY = 100;
const DRAIN_RATE = 2.5;

// Scenarios mapping negative thoughts to CBT concepts
const SCENARIOS = [
  {
    thought: "My friend canceled our plans. They secretly hate me.",
    distortion: "Mind Reading",
    options: [
      { text: "They probably found something better to do.", correct: false, energyEffect: -15 },
      { text: "They might just be tired. I should ask if they're okay.", correct: true, energyEffect: 20 },
      { text: "I'll just never make plans with them again.", correct: false, energyEffect: -10 }
    ],
    truth: "You can't read minds. Canceling plans is often about the other person's energy, not your worth."
  },
  {
    thought: "I made a mistake at work. I'm going to get fired and lose everything.",
    distortion: "Catastrophizing",
    options: [
      { text: "I need to start looking for a new job today.", correct: false, energyEffect: -15 },
      { text: "I am a total failure.", correct: false, energyEffect: -20 },
      { text: "Everyone makes mistakes. I will learn from this and fix it.", correct: true, energyEffect: 20 }
    ],
    truth: "Catastrophizing jumps to the worst possible outcome. Reality is usually much more forgiving."
  },
  {
    thought: "I didn't exercise today. The whole day is ruined and I'm lazy.",
    distortion: "All-Or-Nothing Thinking",
    options: [
      { text: "I'll just eat junk food since today is ruined anyway.", correct: false, energyEffect: -15 },
      { text: "I might not have exercised, but I still got some work done.", correct: true, energyEffect: 20 },
      { text: "I'll never get into shape. It's pointless.", correct: false, energyEffect: -20 }
    ],
    truth: "Life isn't black and white. Missing one habit doesn't erase your other achievements."
  },
  {
    thought: "They didn't text back immediately. I must have said something annoying.",
    distortion: "Personalization",
    options: [
      { text: "They are probably just busy or their phone is away.", correct: true, energyEffect: 20 },
      { text: "I should text them again and apologize.", correct: false, energyEffect: -10 },
      { text: "Nobody ever wants to talk to me.", correct: false, energyEffect: -15 }
    ],
    truth: "Personalization makes you take the blame for things entirely out of your control."
  },
  {
    thought: "I feel incredibly guilty right now, so I must be a terrible person.",
    distortion: "Emotional Reasoning",
    options: [
      { text: "I deserve to feel this way.", correct: false, energyEffect: -20 },
      { text: "Feelings aren't facts. Why exactly do I feel guilty?", correct: true, energyEffect: 20 },
      { text: "I'm a toxic person.", correct: false, energyEffect: -15 }
    ],
    truth: "Emotional reasoning assumes that because you feel a negative emotion, it must reflect reality."
  }
];

export default function DepressionLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [energy, setEnergy] = useState(60); // Start with partial spoons
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, feedback, gameover, won
  const [feedback, setFeedback] = useState(null);
  
  const [cloudAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));

  const pulseCloud = () => {
    Animated.sequence([
      Animated.timing(cloudAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
      Animated.timing(cloudAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ]).start(() => {
      if (gameState === 'playing') pulseCloud();
    });
  };

  const shakeScreen = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    pulseCloud();
    
    // Constant energy drain representing the "Black Dog" / Depression tax
    const drainInterval = setInterval(() => {
      if (gameState === 'playing') {
        setEnergy(prev => {
          const newEnergy = prev - DRAIN_RATE;
          if (newEnergy <= 0) {
            clearInterval(drainInterval);
            setGameState('gameover');
            return 0;
          }
          return newEnergy;
        });
      }
    }, 1000);

    return () => clearInterval(drainInterval);
  }, [gameState]);

  useEffect(() => {
    if (energy >= 100) {
      setGameState('won');
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    }
  }, [energy]);

  const handleOptionSelect = (option) => {
    const newEnergy = Math.min(Math.max(energy + option.energyEffect, 0), MAX_ENERGY);
    setEnergy(newEnergy);
    
    if (option.correct) {
      setFeedback({
        title: isHindi ? 'सुंदर रीफ्रेम!' : 'Excellent Reframe!',
        message: SCENARIOS[currentScenarioIndex].truth,
        isSuccess: true
      });
    } else {
      shakeScreen();
      setFeedback({
        title: isHindi ? 'यह अवसाद बोल रहा है' : 'That\'s the Depression Talking',
        message: isHindi ? `यह एक '${SCENARIOS[currentScenarioIndex].distortion}' है। फिर से कोशिश करें!` : `This is a classic case of '${SCENARIOS[currentScenarioIndex].distortion}'. The thought drained your energy.`,
        isSuccess: false
      });
    }
    
    setGameState('feedback');
  };

  const handleNext = () => {
    if (feedback.isSuccess) {
      if (currentScenarioIndex < SCENARIOS.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('won');
        if (onComplete) onComplete();
      }
    } else {
      setGameState('playing'); // Let them try again
    }
  };

  const restartLab = () => {
    setEnergy(60);
    setCurrentScenarioIndex(0);
    setGameState('playing');
  };

  const scenario = SCENARIOS[currentScenarioIndex];

  // Theme colors
  const bgColor = isDarkMode ? '#121212' : '#F5F7FA';
  const textColor = isDarkMode ? '#E0E0E0' : '#333333';
  const cardBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  
  // Dynamic color based on energy level
  const energyColor = energy > 70 ? '#4CAF50' : energy > 30 ? '#FFC107' : '#F44336';
  
  // Cloud color gets darker as energy gets lower
  const cloudColor = energy > 70 ? (isDarkMode ? '#555' : '#CCC') : 
                     energy > 30 ? (isDarkMode ? '#333' : '#888') : 
                     (isDarkMode ? '#111' : '#444');

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* Energy / Spoon Meter */}
      <View style={styles.header}>
        <View style={styles.energyLabelRow}>
          <Feather name="battery" size={20} color={energyColor} />
          <Text style={[styles.energyLabel, { color: textColor }]}>
            {isHindi ? 'मानसिक ऊर्जा (Spoons):' : 'Mental Energy (Spoons):'} {Math.ceil(energy)}%
          </Text>
        </View>
        <View style={styles.energyBarContainer}>
          <View style={[styles.energyBar, { width: `${energy}%`, backgroundColor: energyColor }]} />
        </View>
      </View>

      <Animated.View style={{ flex: 1, transform: [{ scale: cloudAnim }, { translateX: shakeAnim }] }}>
        
        {/* Visualizer - The heavy cloud */}
        <View style={styles.visualizer}>
           <Svg height="150" width="100%" viewBox="0 0 200 150">
             <Defs>
               <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%">
                 <Stop offset="0%" stopColor={cloudColor} stopOpacity="0.8" />
                 <Stop offset="100%" stopColor={bgColor} stopOpacity="0" />
               </RadialGradient>
             </Defs>
             
             {/* The Rumination Cloud */}
             <Circle cx="100" cy="75" r={60 + (100 - energy)/2} fill="url(#grad)" />
             
             {/* Floating bad thoughts if energy is low */}
             {energy <= 60 && <Circle cx="50" cy="50" r="5" fill="#F44336" opacity="0.6" />}
             {energy <= 40 && <Circle cx="150" cy="90" r="8" fill="#F44336" opacity="0.6" />}
             {energy <= 20 && <Circle cx="80" cy="120" r="6" fill="#F44336" opacity="0.6" />}
             
             <Text x="100" y="80" fill={energy < 30 ? '#fff' : textColor} fontSize="14" textAnchor="middle" fontWeight="bold">
                {scenario.distortion}
             </Text>
           </Svg>
        </View>

        {/* Game Area */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {gameState === 'playing' && (
            <>
              <Text style={[styles.scenarioThought, { color: textColor }]}>
                "{scenario.thought}"
              </Text>
              <Text style={styles.instruction}>
                {isHindi ? 'इस अस्वस्थ विचार को चुनौती दें:' : 'Challenge this distorted thought:'}
              </Text>
              
              {scenario.options.map((opt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.optionBtn, { borderColor: isDarkMode ? '#444' : '#E0E0E0' }]}
                  onPress={() => handleOptionSelect(opt)}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {gameState === 'feedback' && feedback && (
            <View style={styles.feedbackContainer}>
              <Feather 
                name={feedback.isSuccess ? 'check-circle' : 'alert-circle'} 
                size={48} 
                color={feedback.isSuccess ? '#4CAF50' : '#F44336'} 
                style={styles.feedbackIcon}
              />
              <Text style={[styles.feedbackTitle, { color: feedback.isSuccess ? '#4CAF50' : '#F44336' }]}>
                {feedback.title}
              </Text>
              <Text style={[styles.feedbackMessage, { color: textColor }]}>
                {feedback.message}
              </Text>
              <TouchableOpacity 
                style={[styles.nextBtn, { backgroundColor: feedback.isSuccess ? '#4CAF50' : '#F44336' }]}
                onPress={handleNext}
              >
                <Text style={styles.nextBtnText}>{isHindi ? 'आगे बढ़ें' : 'Continue'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'gameover' && (
            <View style={styles.feedbackContainer}>
              <Feather name="battery-x" size={48} color="#F44336" style={styles.feedbackIcon} />
              <Text style={[styles.feedbackTitle, { color: '#F44336' }]}>
                {isHindi ? 'ऊर्जा समाप्त' : 'Energy Depleted'}
              </Text>
              <Text style={[styles.feedbackMessage, { color: textColor }]}>
                {isHindi 
                  ? 'अवसाद के भारीपन ने आपकी सारी ऊर्जा (Spoons) खत्म कर दी है। यह आपकी गलती नहीं है। जब आप तैयार हों, तो फिर से कोशिश करें।' 
                  : 'The weight of the depression drained all your spoons. It happens, and it\'s not your fault. Rest, and try again.'}
              </Text>
              <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#2196F3' }]} onPress={restartLab}>
                <Text style={styles.nextBtnText}>{isHindi ? 'पुनः प्रयास करें' : 'Try Again'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'won' && (
            <View style={styles.feedbackContainer}>
              <Feather name="sun" size={48} color="#FFC107" style={styles.feedbackIcon} />
              <Text style={[styles.feedbackTitle, { color: '#FFC107' }]}>
                {isHindi ? 'कोहरा छंट रहा है!' : 'The Fog is Lifting!'}
              </Text>
              <Text style={[styles.feedbackMessage, { color: textColor }]}>
                {isHindi 
                  ? 'आपने अपनी ऊर्जा बचाई और अवसाद के झूठ को तार्किक विचारों से सफलतापूर्वक चुनौती दी। यही न्यूरोप्लास्टिसिटी है!' 
                  : 'You successfully defended your energy and rewired those negative pathways using CBT principles. This is neuroplasticity in action!'}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 20,
  },
  energyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  energyBarContainer: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  energyBar: {
    height: '100%',
    borderRadius: 6,
  },
  visualizer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scenarioThought: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 15,
  },
  feedbackContainer: {
    alignItems: 'center',
    padding: 20,
  },
  feedbackIcon: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  nextBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
