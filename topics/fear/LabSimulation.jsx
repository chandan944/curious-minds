import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const MAX_STRESS = 100;
const STAGES = [
  { level: 1, labelEn: 'Cartoon Spider', labelHi: 'कार्टून मकड़ी', type: 'safe' },
  { level: 2, labelEn: 'Photo of a Spider', labelHi: 'मकड़ी की तस्वीर', type: 'moderate' },
  { level: 3, labelEn: 'Video of a Spider', labelHi: 'मकड़ी का वीडियो', type: 'elevated' },
  { level: 4, labelEn: 'Spider in a Box', labelHi: 'डिब्बे में मकड़ी', type: 'high' },
  { level: 5, labelEn: 'Holding the Spider', labelHi: 'मकड़ी को हाथ में लेना', type: 'extreme' }
];

export default function FearLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentStage, setCurrentStage] = useState(0);
  const [stress, setStress] = useState(20);
  const [gameState, setGameState] = useState('playing'); // playing, busted, won
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Exhale

  // Animations
  const heartbeatAnim = useRef(new Animated.Value(1)).current;
  const exposureAnim = useRef(new Animated.Value(0)).current; 
  const breathAnim = useRef(new Animated.Value(1)).current;

  const bgGradient = isDarkMode ? ['#1A0000', '#000000'] : ['#FFEBEB', '#FFFFFF'];
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';
  const stressColor = stress > 80 ? '#F44336' : stress > 50 ? '#FF9800' : '#4CAF50';

  // Heartbeat speed based on stress
  useEffect(() => {
    let speed = 1000 - (stress * 8);
    if (speed < 150) speed = 150;

    const beat = () => {
      Animated.sequence([
        Animated.timing(heartbeatAnim, { toValue: 1.2, duration: speed * 0.2, useNativeDriver: true }),
        Animated.timing(heartbeatAnim, { toValue: 1, duration: speed * 0.8, useNativeDriver: true }),
      ]).start(() => {
        if (gameState === 'playing') beat();
      });
    };
    heartbeatAnim.stopAnimation();
    if (gameState === 'playing') beat();
    
    return () => heartbeatAnim.stopAnimation();
  }, [stress, gameState]);

  // Constant minor stress drain (representing safe environment) but large spikes on exposure
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && !showBreathing) {
      interval = setInterval(() => {
        setStress(prev => {
          const next = prev - 0.5; // Natural decay
          return next < 0 ? 0 : next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [gameState, showBreathing]);

  const handleExpose = () => {
    if (currentStage >= STAGES.length) return;

    // The harder the stage, the more it spikes stress
    const spike = 20 + (currentStage * 15);
    const newStress = stress + spike;

    // Flash animation
    Animated.sequence([
      Animated.timing(exposureAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(exposureAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    if (newStress >= MAX_STRESS) {
      setStress(MAX_STRESS);
      setGameState('busted');
    } else {
      setStress(newStress);
      setCurrentStage(prev => prev + 1);
      
      if (currentStage + 1 >= STAGES.length) {
         setGameState('won');
         if (onComplete) setTimeout(onComplete, 2000);
      }
    }
  };

  const startBreathing = () => {
    setShowBreathing(true);
    setBreathPhase('Inhale');
    
    Animated.timing(breathAnim, {
      toValue: 2,
      duration: 3000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true
    }).start(() => {
      setBreathPhase('Exhale');
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
      }).start(() => {
        // Reduced stress after full breath
        setStress(prev => Math.max(0, prev - 25));
        setShowBreathing(false);
      });
    });
  };

  const restart = () => {
    setStress(20);
    setCurrentStage(0);
    setGameState('playing');
    setShowBreathing(false);
  };

  // Renders the virtual "Spider" based on the level.
  const renderThreat = () => {
    if (currentStage === 0) return <Feather name="image" size={50} color={textColor} />;
    if (currentStage === 1) return <Feather name="smile" size={60} color="#FF9800" />; // Cartoon spider analog
    if (currentStage === 2) return <Feather name="camera" size={60} color="#F44336" />;
    if (currentStage === 3) return <Feather name="video" size={70} color="#F44336" />;
    if (currentStage === 4) return <Feather name="box" size={80} color="#D32F2F" />;
    return <Feather name="crosshair" size={90} color="#B71C1C" />;
  };

  const curStageData = STAGES[Math.min(currentStage, STAGES.length - 1)];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]}>
      
      {/* Header/HUD */}
      <View style={styles.hud}>
         <View style={styles.hudRow}>
            <Text style={[styles.hudText, { color: textColor }]}>
              {isHindi ? 'एमिग्डाला तनाव:' : 'Amygdala Stress:'}
            </Text>
            <View style={styles.meterContainer}>
               <View style={[styles.meterFill, { width: `${stress}%`, backgroundColor: stressColor }]} />
            </View>
         </View>
         <View style={styles.hudRow}>
            <Text style={[styles.hudText, { color: textColor }]}>
              {isHindi ? 'वर्तमान लक्ष्य:' : 'Current Target:'} {currentStage < STAGES.length ? (isHindi ? curStageData.labelHi : curStageData.labelEn) : (isHindi ? 'पूर्ण!' : 'Complete!')}
            </Text>
         </View>
      </View>

      {/* Main Visual Arena */}
      <View style={[styles.arena, { backgroundColor: cardBgColor }]}>
        
        {/* Flash overlay for exposure shock */}
        <Animated.View style={[styles.flashOverlay, { opacity: exposureAnim }]} pointerEvents="none" />

        {gameState === 'playing' && !showBreathing && (
          <View style={styles.threatContainer}>
            <Animated.View style={{ transform: [{ scale: heartbeatAnim }] }}>
              {renderThreat()}
            </Animated.View>
            <Text style={[styles.stageIndicator, { color: textColor }]}>
              {isHindi ? 'चरण' : 'Stage'} {currentStage + 1} / 5
            </Text>
          </View>
        )}

        {gameState === 'playing' && showBreathing && (
          <View style={styles.threatContainer}>
            <Text style={[styles.breathText, { color: '#00BCD4' }]}>
               {isHindi ? (breathPhase === 'Inhale' ? 'सांस लें...' : 'छोड़ें...') : breathPhase + '...'}
            </Text>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathAnim }] }]} />
          </View>
        )}

        {gameState === 'busted' && (
          <View style={styles.threatContainer}>
            <Feather name="alert-octagon" size={64} color="#F44336" />
            <Text style={styles.bustedTitle}>{isHindi ? 'पैनिक अटैक!' : 'Panic Attack!'}</Text>
            <Text style={[styles.bustedDesc, { color: textColor }]}>
              {isHindi ? 'तनाव 100% पर पहुँच गया। आपने कोर्टेक्स को आराम दिए बिना बहुत जल्दी अगली चुनौती का सामना कर लिया।' : 'Stress hit 100%. You advanced too quickly without letting the Cortex lower the Amygdala\'s response.'}
            </Text>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.threatContainer}>
            <Feather name="shield" size={64} color="#4CAF50" />
            <Text style={[styles.bustedTitle, { color: '#4CAF50' }]}>{isHindi ? 'भय विलुप्त!' : 'Phobia Extinguished!'}</Text>
            <Text style={[styles.bustedDesc, { color: textColor }]}>
              {isHindi ? 'मस्तिष्क ने सीख लिया है कि यह सुरक्षित है। नया न्यूरल मार्ग स्थापित हो गया है।' : 'The brain has learned it is safe. A new neural pathway has been established.'}
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
         {gameState === 'playing' && !showBreathing && (
           <>
             <TouchableOpacity 
               style={[styles.btn, styles.exposeBtn]} 
               onPress={handleExpose}
             >
               <Text style={styles.btnText}>{isHindi ? 'सामना करें (Exposure)' : 'Take Exposure Step'}</Text>
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.btn, styles.calmBtn, { opacity: stress < 30 ? 0.5 : 1 }]} 
               onPress={startBreathing}
               disabled={stress < 30}
             >
               <Text style={styles.btnText}>{isHindi ? 'तार्किक दिमाग का प्रयोग करें (सांस)' : 'Activate Cortex (Breathe)'}</Text>
             </TouchableOpacity>
           </>
         )}

         {(gameState === 'busted' || gameState === 'won') && (
           <TouchableOpacity style={[styles.btn, styles.restartBtn]} onPress={restart}>
             <Text style={styles.btnText}>{isHindi ? 'पुनः प्रयास करें' : 'Restart Therapy'}</Text>
           </TouchableOpacity>
         )}
      </View>

      <Text style={[styles.hint, { color: textColor }]}>
        {isHindi ? 'टिप: अगला सामना करने से पहले सांस लेकर पैनिक को शांत होने दें।' : 'Bio-Hack: Lower the stress meter with breathing before attempting harder exposures.'}
      </Text>

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
    marginBottom: 20,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hudText: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 130,
  },
  meterContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#444',
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  arena: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 250,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'red',
    zIndex: 10,
  },
  threatContainer: {
    alignItems: 'center',
  },
  stageIndicator: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  breathText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  breathCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#00BCD4',
  },
  bustedTitle: {
    color: '#F44336',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  bustedDesc: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  controls: {
    marginTop: 20,
    gap: 12,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exposeBtn: {
    backgroundColor: '#F44336',
  },
  calmBtn: {
    backgroundColor: '#00BCD4',
  },
  restartBtn: {
    backgroundColor: '#9E9E9E',
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  }
});
