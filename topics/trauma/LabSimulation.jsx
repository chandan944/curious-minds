import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BALL_SIZE = 40;
const TRACK_WIDTH = width - 80;

export default function TraumaLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('intro'); // intro, playing, won, failed
  const [memoryVividness, setMemoryVividness] = useState(100);
  const [amygdalaLoad, setAmygdalaLoad] = useState(0); // If this hits 100 before Vividness hits 0, failed.
  
  // Need to track ball position visually or through taps. 
  // In EMDR, the eyes track. Here we will make the user tap the ball as it reaches the edges.
  const [ballPosition] = useState(new Animated.Value(0)); 
  const [targetSide, setTargetSide] = useState('right'); // Where the ball is heading
  const [consecutiveHits, setConsecutiveHits] = useState(0);

  const bgColor = isDarkMode ? '#121212' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  // The Ball Animation Loop
  const animateBall = (toValue, duration) => {
    Animated.timing(ballPosition, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // If the ball completes its journey WITHOUT the user tapping it in time, it's a miss
      if (finished && gameState === 'playing') {
         handleMiss();
      }
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      // Start moving towards right
      setTargetSide('right');
      animateBall(TRACK_WIDTH - BALL_SIZE, computeSpeed());
    } else {
      ballPosition.stopAnimation();
    }
  }, [gameState]);

  const computeSpeed = () => {
    // Speed increases slightly as memory dims, making it a focus task
    return Math.max(700, 1500 - (100 - memoryVividness) * 8);
  };

  // The constant 'threat' of the traumatic memory fighting back
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setAmygdalaLoad(prev => {
          const next = prev + 5; // Automatic stress increase
          if (next >= 100) {
            setGameState('failed');
            clearInterval(interval);
            return 100;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleTap = () => {
    if (gameState !== 'playing') return;

    ballPosition.stopAnimation((value) => {
       // Check if ball is close enough to the target edge
       const hitRight = targetSide === 'right' && value > TRACK_WIDTH - BALL_SIZE - 30;
       const hitLeft = targetSide === 'left' && value < 30;

       if (hitRight || hitLeft) {
         // Success tap
         setConsecutiveHits(prev => prev + 1);
         setAmygdalaLoad(prev => Math.max(0, prev - 15)); // Distracts amygdala significantly
         
         // Every successful tap lowers the memory vividness
         setMemoryVividness(prev => {
            const next = prev - 8;
            if (next <= 0) {
              setGameState('won');
              if (onComplete) setTimeout(onComplete, 2000);
              return 0;
            }
            return next;
         });

         // Turn around
         const newSide = targetSide === 'right' ? 'left' : 'right';
         setTargetSide(newSide);
         animateBall(newSide === 'right' ? TRACK_WIDTH - BALL_SIZE : 0, computeSpeed());

       } else {
         // Missed tap (too early)
         handleMiss();
       }
    });
  };

  const handleMiss = () => {
    setConsecutiveHits(0);
    setAmygdalaLoad(prev => {
       const next = prev + 25; // Large spike for losing focus
       if (next >= 100) {
         setGameState('failed');
         return 100;
       }
       return next;
    });
    
    // Turn around anyway to keep game moving
    const newSide = targetSide === 'right' ? 'left' : 'right';
    setTargetSide(newSide);
    animateBall(newSide === 'right' ? TRACK_WIDTH - BALL_SIZE : 0, computeSpeed());
  };

  const restart = () => {
    setMemoryVividness(100);
    setAmygdalaLoad(0);
    setConsecutiveHits(0);
    setGameState('playing');
    ballPosition.setValue(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD Bar */}
      <View style={styles.hud}>
        <View style={styles.hudRow}>
          <Text style={[styles.hudLabel, { color: textColor }]}>
            {isHindi ? 'याद की तीव्रता (फ़्लैशबैक):' : 'Flashback Memory Vividness:'} {Math.ceil(memoryVividness)}%
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${memoryVividness}%`, backgroundColor: '#F44336' }]} />
        </View>
        
        <View style={[styles.hudRow, { marginTop: 10 }]}>
          <Text style={[styles.hudLabel, { color: textColor }]}>
            {isHindi ? 'एमिग्डाला पैनिक लोड:' : 'Amygdala Panic Load:'} {Math.ceil(amygdalaLoad)}%
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${amygdalaLoad}%`, backgroundColor: '#FF9800' }]} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'intro' && (
          <View style={styles.centerContent}>
            <Feather name="eye" size={48} color="#FF5722" style={styles.icon} />
            <Text style={[styles.title, { color: textColor }]}>
              {isHindi ? 'EMDR सिम्युलेटर' : 'EMDR Simulator'}
            </Text>
            <Text style={[styles.desc, { color: textColor }]}>
              {isHindi 
                ? 'हिप्पोकैम्पस में याद अटक गई है। जब गेंद ट्रैक के छोर (किनारों) पर पहुँचे तो टार्गेट को टैप (Tap) करें। यह वर्किंग मेमोरी को व्यस्त रखता है, जिससे याद की तीव्रता कम होती है।' 
                : 'The memory is stuck playing loudly. You must perform Bilateral Stimulation (tracking left to right) to tax the working memory. TAP the area right as the ball hits the edge.'}
            </Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => setGameState('playing')}>
              <Text style={styles.startBtnText}>{isHindi ? 'शुरू करें' : 'Begin Processing'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'playing' && (
          <View style={styles.gameArea}>
            <Text style={[styles.gameInstruction, { color: textColor }]}>
              {isHindi ? 'जब गेंद किनारे पर आए तो कहीं भी टैप करें!' : 'TAP anywhere when ball hits the edge!'}
            </Text>
            
            {/* Tap surface covering the track area */}
            <TouchableOpacity style={styles.tapSurface} onPress={handleTap} activeOpacity={0.9}>
              <View style={styles.track}>
                {/* Visual target markers */}
                <View style={styles.targetLeft} />
                <View style={styles.targetRight} />
                
                {/* The Moving Ball */}
                <Animated.View style={[styles.ball, { transform: [{ translateX: ballPosition }] }]}>
                  <View style={styles.innerBall} />
                </Animated.View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.comboCounter}>
              <Text style={{ color: '#888', fontSize: 16 }}>
                {isHindi ? 'लगातार हिट:' : 'Streak:'} <Text style={{ fontWeight: 'bold', color: '#00BCD4' }}>{consecutiveHits}</Text>
              </Text>
            </View>
          </View>
        )}

        {gameState === 'failed' && (
          <View style={styles.centerContent}>
             <Feather name="alert-triangle" size={56} color="#F44336" style={styles.icon} />
             <Text style={[styles.title, { color: '#F44336' }]}>
               {isHindi ? 'विंडो ऑफ टॉलरेंस टूट गई!' : 'Window of Tolerance Breached!'}
             </Text>
             <Text style={[styles.desc, { color: textColor }]}>
               {isHindi 
                 ? 'एमिग्डाला बहुत अधिक लोड हो गया और दिमाग डिसोसिएट (सुन्न) हो गया। थेरेपी को रोकने और ग्राउंडिंग करने की आवश्यकता है।' 
                 : 'The Amygdala load hit 100% and logic went offline (Hyperarousal). In a real session, the therapist would stop and ground you. Try again.'}
             </Text>
             <TouchableOpacity style={[styles.startBtn, { backgroundColor: '#FF9800' }]} onPress={restart}>
               <Text style={styles.startBtnText}>{isHindi ? 'पुनः शुरू करें' : 'Reset & Ground'}</Text>
             </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
             <Feather name="archive" size={56} color="#4CAF50" style={styles.icon} />
             <Text style={[styles.title, { color: '#4CAF50' }]}>
               {isHindi ? 'याद सफलतापूर्वक फाइल की गई!' : 'Memory Successfully Filed!'}
             </Text>
             <Text style={[styles.desc, { color: textColor }]}>
               {isHindi 
                 ? 'बधाई हो। ध्यान भटकाने से हिप्पोकैम्पस को याद पर PAST मुहर लगाने का समय मिल गया। अब यह सिर्फ एक कहानी है, फ्लैशबैक नहीं।' 
                 : 'Outstanding. The bilateral stimulation kept your alarm system offline long enough for the Hippocampus to stamp the memory with "PAST". It is now just a bad memory, not an active threat.'}
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
    padding: 16,
    borderRadius: 16,
  },
  hud: {
    marginBottom: 24,
  },
  hudRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  hudLabel: {
    fontSize: 14,
    fontWeight: 'bold',
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
    minHeight: 300,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  startBtn: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInstruction: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  tapSurface: {
    width: '100%',
    paddingVertical: 40, // Generous hit area
  },
  track: {
    width: TRACK_WIDTH,
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  targetLeft: {
    position: 'absolute',
    left: -10,
    width: 20,
    height: 40,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  targetRight: {
    position: 'absolute',
    right: -10,
    width: 20,
    height: 40,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: 'rgba(255, 87, 34, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  innerBall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5722',
    elevation: 4,
  },
  comboCounter: {
    marginTop: 40,
  }
});
