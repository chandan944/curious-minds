import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function AbsurdismLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('pushing'); // pushing, rolled_back, enlightened
  const [despair, setDespair] = useState(0); // 0 to 100
  const [pushCount, setPushCount] = useState(0);
  const [rebelliousJoy, setRebelliousJoy] = useState(false);

  // Animated values
  const boulderY = useRef(new Animated.Value(300)).current; // Bottom of hill
  const boulderRotate = useRef(new Animated.Value(0)).current;

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  // Boulder slowly slides back down if not pushed
  useEffect(() => {
    let slideDownInterval;
    if (gameState === 'pushing' && !rebelliousJoy) {
      slideDownInterval = setInterval(() => {
        boulderY.stopAnimation(currentY => {
           if (currentY < 300) {
              const newY = Math.min(300, currentY + 15);
              if (newY >= 300) triggerRollBack();
              else {
                Animated.timing(boulderY, {
                  toValue: newY,
                  duration: 200,
                  useNativeDriver: true
                }).start();
              }
           }
        });
      }, 500); // Gravity effect
    }
    return () => clearInterval(slideDownInterval);
  }, [gameState, rebelliousJoy]);

  const triggerRollBack = () => {
    setPushCount(prev => prev + 1);
    
    // Boulder crashes to bottom
    Animated.spring(boulderY, {
      toValue: 300,
      friction: 4,
      tension: 20,
      useNativeDriver: true
    }).start();

    if (!rebelliousJoy) {
      setDespair(prev => Math.min(100, prev + 25)); // Despair increases on failure
      setGameState('rolled_back');
      setTimeout(() => setGameState('pushing'), 1500);
    }
  };

  const handlePush = () => {
    if (gameState !== 'pushing') return;

    boulderY.stopAnimation(currentY => {
        const newY = Math.max(0, currentY - 30);
        
        Animated.parallel([
          Animated.timing(boulderY, {
            toValue: newY,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(boulderRotate, {
             toValue: currentY - 30, // Just purely to make it spin
             duration: 150,
             useNativeDriver: true
          })
        ]).start(() => {
           if (newY <= 0) {
              // Reached top! But it's an absurd universe...
              triggerRollBack();
           }
        });
    });
  };

  const toggleJoy = () => {
    setRebelliousJoy(true);
    setDespair(0);
    setGameState('enlightened');
    if (onComplete) setTimeout(onComplete, 3000);
  };

  const getDespairColor = () => {
    if (despair > 75) return '#F44336';
    if (despair > 40) return '#FF9800';
    return '#8BC34A';
  };

  const rotateString = boulderRotate.interpolate({
    inputRange: [0, 300],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'निराशा (Despair):' : 'Despair Meter:'} {rebelliousJoy ? '0%' : `${despair}%`}
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${rebelliousJoy ? 0 : despair}%`, backgroundColor: getDespairColor() }]} />
        </View>

        <Text style={[styles.hudSub, { color: textColor }]}>
          {isHindi ? 'असफलताएं (Failures):' : 'Rollbacks:'} {pushCount}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {/* Mountain Scene */}
        <View style={styles.mountainArea}>
           {/* The Slope */}
           <View style={styles.slope} />

           {/* The Boulder */}
           <Animated.View style={[
               styles.boulderWrapper, 
               { transform: [{ translateY: boulderY }, { translateX: Animated.multiply(boulderY, -0.6) }] }
           ]}>
              <Animated.View style={{ transform: [{ rotate: rotateString }] }}>
                  <Text style={{ fontSize: 50 }}>🪨</Text>
              </Animated.View>
           </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controlArea}>
           
           {gameState === 'enlightened' ? (
              <View style={styles.enlightenedBox}>
                 <Text style={[styles.feedbackTitle, { color: '#FFC107' }]}>
                   {isHindi ? '"सिसिफस को खुश होना चाहिए"' : '"One Must Imagine Sisyphus Happy"'}
                 </Text>
                 <Text style={[styles.feedbackText, { color: textColor }]}>
                   {isHindi 
                     ? 'आपने अर्थहीनता को स्वीकार कर लिया और इसके बावजूद मुस्कुराने का विकल्प चुना। निरर्थक संघर्ष में आपकी खुशी ही आपका अंतिम विद्रोह है।' 
                     : 'You accepted the meaningless struggle and chose to smile anyway. Your joy in the face of the absurd is your ultimate rebellion.'}
                 </Text>
              </View>
           ) : (
             <>
               <TouchableOpacity 
                 style={[styles.pushBtn, { opacity: gameState === 'pushing' ? 1 : 0.5 }]} 
                 onPress={handlePush}
                 activeOpacity={0.7}
               >
                 <Text style={styles.pushBtnText}>{isHindi ? 'धक्का दें (Push)' : 'PUSH BOULDER'}</Text>
               </TouchableOpacity>

               {despair >= 50 && !rebelliousJoy && (
                 <TouchableOpacity 
                   style={styles.rebelBtn} 
                   onPress={toggleJoy}
                 >
                   <Feather name="smile" size={20} color="#FFC107" style={{ marginRight: 8 }} />
                   <Text style={styles.rebelBtnText}>{isHindi ? 'विद्रोह करें (मुस्कुराएं)' : 'REBEL (SMILE)'}</Text>
                 </TouchableOpacity>
               )}
             </>
           )}

        </View>

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
  hudLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  hudSub: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
    fontWeight: 'bold'
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
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  mountainArea: {
    height: 350,
    backgroundColor: '#87CEEB', // Sky color
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden'
  },
  slope: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 600,
    height: 400,
    backgroundColor: '#5D4037', // Mountain brown
    transform: [{ rotate: '-30deg' }],
  },
  boulderWrapper: {
    position: 'absolute',
    right: 150, // Starting X at bottom of hill
    top: 50,    // Top margin
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlArea: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  pushBtn: {
    backgroundColor: '#795548',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 2,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center'
  },
  pushBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  rebelBtn: {
    flexDirection: 'row',
    backgroundColor: '#212121',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  rebelBtnText: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: 'bold',
  },
  enlightenedBox: {
    alignItems: 'center',
    paddingHorizontal: 10
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
