import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const MAX_PANIC = 100;

export default function AnxietyLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [panicLevel, setPanicLevel] = useState(40); // Starts slightly elevated
  const [gameState, setGameState] = useState('intro'); // intro, breathing, grounding, won, gameover
  
  // Phase 1: Breathing
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [breathCount, setBreathCount] = useState(0);
  const [successfulBreaths, setSuccessfulBreaths] = useState(0);
  
  // Phase 2: Grounding
  const [groundingStage, setGroundingStage] = useState(5); // 5 to 1
  
  // Animations
  const heartRateAnim = useRef(new Animated.Value(1)).current;
  const breathScaleAnim = useRef(new Animated.Value(1)).current;

  // Background Panic Escalator (The "Threat")
  useEffect(() => {
    let interval;
    if (gameState === 'breathing' || gameState === 'grounding') {
      interval = setInterval(() => {
        setPanicLevel(prev => {
          const newLevel = prev + (gameState === 'breathing' ? 1.5 : 1); // Grounding slows the rise slightly
          if (newLevel >= MAX_PANIC) {
            setGameState('gameover');
            clearInterval(interval);
            return MAX_PANIC;
          }
          return newLevel;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Heartbeat Animation based on panic level
  useEffect(() => {
    const duration = 1200 - (panicLevel * 10); // Faster as panic increases
    const beat = () => {
      Animated.sequence([
        Animated.timing(heartRateAnim, { toValue: 1.3, duration: duration * 0.15, useNativeDriver: true }),
        Animated.timing(heartRateAnim, { toValue: 1, duration: duration * 0.85, useNativeDriver: true })
      ]).start(() => {
        if (gameState !== 'won' && gameState !== 'gameover') beat();
      });
    };
    heartRateAnim.stopAnimation();
    beat();
  }, [panicLevel, gameState]);

  const startBreathingPhase = () => {
    setGameState('breathing');
    runBreathCycle();
  };

  const runBreathCycle = () => {
    if (gameState === 'breathing') {
      // Inhale (4s)
      setBreathPhase(isHindi ? 'सांस अंदर लें' : 'Inhale');
      Animated.timing(breathScaleAnim, {
        toValue: 2,
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
      }).start(() => {
        // Hold (2s)
        setBreathPhase(isHindi ? 'रोकें' : 'Hold');
        setTimeout(() => {
          // Exhale (6s) - The Vagus Nerve trigger
          setBreathPhase(isHindi ? 'धीरे-धीरे छोड़ें (रिलैक्स)' : 'Exhale Slowly (Relax)');
          Animated.timing(breathScaleAnim, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true
          }).start();
        }, 2000);
      });
    }
  };

  // User must tap the button WHEN it says Exhale to simulate "doing the work"
  const handleBreathTap = () => {
    if ((breathPhase === 'Exhale Slowly (Relax)' || breathPhase === 'धीरे-धीरे छोड़ें (रिलैक्स)')) {
      setPanicLevel(prev => Math.max(prev - 8, 0)); // Major drop on correct exhale tap
      
      const newSuccessfulBreaths = successfulBreaths + 1;
      setSuccessfulBreaths(newSuccessfulBreaths);
      
      if (newSuccessfulBreaths >= 4) { // 4 successful breaths moves to grounding
        setGameState('grounding');
      }
    } else {
      // Tapping at wrong time increases panic slightly (simulating forcing/rushing)
      setPanicLevel(prev => Math.min(prev + 3, MAX_PANIC));
    }
  };

  // Keep looping breath visually while in breathing state
  useEffect(() => {
    let interval;
    if (gameState === 'breathing') {
      interval = setInterval(() => {
        runBreathCycle();
      }, 12000); // 4 + 2 + 6 = 12s cycle
    }
    return () => clearInterval(interval);
  }, [gameState]);


  const handleGroundingTap = () => {
    setPanicLevel(prev => Math.max(prev - 10, 0)); // Drop panic
    if (groundingStage > 1) {
      setGroundingStage(prev => prev - 1);
    } else {
      setGameState('won');
      if (onComplete) setTimeout(onComplete, 2500);
    }
  };

  const restart = () => {
    setPanicLevel(40);
    setSuccessfulBreaths(0);
    setGroundingStage(5);
    setGameState('intro');
  };

  // Theming
  const bgColor = isDarkMode ? '#121212' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBg = isDarkMode ? '#1E1E1E' : '#FFF';
  
  // Dynamic Panic Color
  const panicColor = panicLevel > 80 ? '#F44336' : panicLevel > 50 ? '#FF9800' : '#4CAF50';
  const amydgalaColor = panicLevel > 80 ? 'red' : panicLevel > 50 ? 'orange' : 'green';

  const groundingContent = {
    5: { icon: 'eye', text: isHindi ? '5 चीजें जो आप देख सकते हैं' : '5 Things you can SEE' },
    4: { icon: 'hand', text: isHindi ? '4 चीजें जिन्हें आप छू सकते हैं' : '4 Things you can FEEL' },
    3: { icon: 'headphones', text: isHindi ? '3 चीजें जो आप सुन सकते हैं' : '3 Things you can HEAR' },
    2: { icon: 'wind', text: isHindi ? '2 चीजें जिन्हें आप सूंघ सकते हैं' : '2 Things you can SMELL' },
    1: { icon: 'coffee', text: isHindi ? '1 चीज जिसका आप स्वाद ले सकते हैं' : '1 Thing you can TASTE' }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* Panic Meter Header */}
      <View style={styles.header}>
        <View style={styles.meterRow}>
          <Text style={[styles.meterTitle, { color: textColor }]}>
            {isHindi ? 'पैनिक मीटर' : 'Panic Meter'}
          </Text>
          <Animated.View style={{ transform: [{ scale: heartRateAnim }] }}>
            <Feather name="heart" size={24} color={panicColor} />
          </Animated.View>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${panicLevel}%`, backgroundColor: panicColor }]} />
        </View>
      </View>

      <View style={styles.visualAid}>
         <Svg height="150" width="100%" viewBox="0 0 200 150">
           <Defs>
             <RadialGradient id="amygdalaGrad" cx="50%" cy="50%" rx="50%" ry="50%">
               <Stop offset="0%" stopColor={amydgalaColor} stopOpacity="0.8" />
               <Stop offset="100%" stopColor={bgColor} stopOpacity="0" />
             </RadialGradient>
           </Defs>
           {/* Visualizing the "Alarm System" */}
           <Circle cx="100" cy="75" r={30 + (panicLevel/2)} fill="url(#amygdalaGrad)" />
           {gameState === 'breathing' && (
             <Animated.Circle 
               cx="100" 
               cy="75" 
               r="15" 
               stroke="#00BCD4" 
               strokeWidth="2" 
               fill="none" 
               scale={breathScaleAnim} 
               origin="100, 75" 
             />
           )}
         </Svg>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        
        {gameState === 'intro' && (
          <View style={styles.centerContent}>
            <Feather name="alert-triangle" size={48} color="#FF9800" style={styles.iconMargin} />
            <Text style={[styles.title, { color: textColor }]}>
              {isHindi ? 'एमिग्डाला सक्रिय!' : 'Amygdala Activated!'}
            </Text>
            <Text style={[styles.description, { color: textColor }]}>
              {isHindi 
                ? 'आपका अलार्म सिस्टम चालू हो गया है और पैनिक का स्तर बढ़ रहा है। आपको सिस्टम को ओवरराइड करने के लिए बायोलॉजिकल टूल्स का उपयोग करना होगा।' 
                : 'Your alarm system went off and panic is rising. You must use biological tools to override the system before it hits 100%.'}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={startBreathingPhase}>
              <Text style={styles.btnText}>{isHindi ? 'प्रोटोकॉल शुरू करें' : 'Initiate Protocol'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'breathing' && (
          <View style={styles.centerContent}>
            <Text style={[styles.phaseTitle, { color: '#00BCD4' }]}>
              {isHindi ? 'चरण 1: वेगस नर्व स्टिमुलेशन' : 'Phase 1: Vagus Nerve Stimulation'}
            </Text>
            <Text style={[styles.breatheInstruction, { color: textColor }]}>
              {breathPhase}
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.actionBtn, 
                { 
                  backgroundColor: (breathPhase === 'Exhale Slowly (Relax)' || breathPhase === 'धीरे-धीरे छोड़ें (रिलैक्स)') ? '#00BCD4' : isDarkMode ? '#333' : '#E0E0E0' 
                }
              ]}
              onPress={handleBreathTap}
            >
              <Text style={[styles.actionBtnText, { color: (breathPhase === 'Exhale Slowly (Relax)' || breathPhase === 'धीरे-धीरे छोड़ें (रिलैक्स)') ? '#FFF' : '#888' }]}>
                {isHindi ? 'छोड़ते समय टैप करें!' : 'TAP DURING EXHALE!'}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.progressText, { color: textColor }]}>
              {successfulBreaths} / 4 {isHindi ? 'सफल सांसें' : 'Successful Breaths'}
            </Text>
          </View>
        )}

        {gameState === 'grounding' && (
          <View style={styles.centerContent}>
            <Text style={[styles.phaseTitle, { color: '#FFC107' }]}>
              {isHindi ? 'चरण 2: 5-4-3-2-1 ग्राउंडिंग' : 'Phase 2: 5-4-3-2-1 Grounding'}
            </Text>
            <Feather name={groundingContent[groundingStage].icon} size={48} color={textColor} style={styles.iconMargin} />
            <Text style={[styles.groundingText, { color: textColor }]}>
              {groundingContent[groundingStage].text}
            </Text>
            
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFC107' }]} onPress={handleGroundingTap}>
              <Text style={[styles.actionBtnText, { color: '#000' }]}>
                {isHindi ? 'मैंने नाम लिया!' : 'I Named Them!'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'gameover' && (
          <View style={styles.centerContent}>
            <Feather name="zap-off" size={48} color="#F44336" style={styles.iconMargin} />
            <Text style={[styles.title, { color: '#F44336' }]}>
              {isHindi ? 'लड़ो या भागो ट्रिगर!' : 'Fight or Flight Triggered!'}
            </Text>
            <Text style={[styles.description, { color: textColor }]}>
              {isHindi 
                ? 'पैनिक मीटर 100% पर पहुंच गया। यह शारीरिक रूप से हानिरहित है, लेकिन बहुत थका देने वाला है। इसे रोकने के लिए उच्छ्वास (Exhale) पर ध्यान दें।' 
                : 'Panic hit 100%. Remember, a panic attack is physically harmless, but exhausting. Next time, focus deeply on the EXHALE to apply the brakes.'}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.btnText}>{isHindi ? 'पुनः प्रयास करें' : 'Try Again'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
            <Feather name="shield" size={48} color="#4CAF50" style={styles.iconMargin} />
            <Text style={[styles.title, { color: '#4CAF50' }]}>
              {isHindi ? 'अलार्म बंद!' : 'Alarm Deactivated!'}
            </Text>
            <Text style={[styles.description, { color: textColor }]}>
              {isHindi 
                ? 'शानदार! आपने अपनी सांस और इंद्रियों के माध्यम से मस्तिष्क को सफलतापूर्वक संदेश दिया कि आप सुरक्षित हैं। आपने एमिग्डाला को ओवरराइड कर दिया।' 
                : 'Outstanding! By using your breath and senses, you successfully sent a biological signal to your brain that you are safe. You overrode the Amygdala.'}
            </Text>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  header: {
    marginBottom: 10,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  barContainer: {
    height: 14,
    backgroundColor: '#333',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 7,
  },
  visualAid: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 250,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  iconMargin: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  breatheInstruction: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  actionBtn: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 14,
    marginTop: 10,
  },
  groundingText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  }
});
