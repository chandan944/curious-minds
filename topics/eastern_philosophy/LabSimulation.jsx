import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function EasternPhilosophyLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('intro'); // intro, playing, success, failure
  const [reason, setReason] = useState('');

  // Values for the game
  const currentFriction = useRef(0); // 0 to 100. Over 100 = flip. Under 0 = crash.
  const frictionAnim = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // We need a ref to track the game loop
  const gameLoopRef = useRef(null);

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    currentFriction.current = 50; // Start perfectly balanced
    currentProgress.current = 0;
    frictionAnim.setValue(50);
    progressAnim.setValue(0);
    
    // Constant drift downwards towards rock (requires SOME effort)
    gameLoopRef.current = setInterval(() => {
      currentFriction.current -= 2; // Drifting to lazy
      currentProgress.current += 1.5; // Moving forward

      Animated.spring(frictionAnim, {
        toValue: currentFriction.current,
        useNativeDriver: false,
      }).start();

      Animated.timing(progressAnim, {
        toValue: currentProgress.current,
        duration: 100,
        useNativeDriver: false,
      }).start();

      checkWinCondition();
    }, 100);
  };

  const handleTap = () => {
    // Tapping aggressively adds too much effort
    currentFriction.current += 8; 
  };

  const checkWinCondition = () => {
    if (currentFriction.current <= 0) {
      // Too lazy
      clearInterval(gameLoopRef.current);
      setGameState('failure');
      setReason('lazy');
    } else if (currentFriction.current >= 100) {
      // Too much effort
      clearInterval(gameLoopRef.current);
      setGameState('failure');
      setReason('forced');
    } else if (currentProgress.current >= 100) {
      // Reached the ocean!
      clearInterval(gameLoopRef.current);
      setGameState('success');
      if (onComplete) setTimeout(onComplete, 4000);
    }
  };


  const indicatorColor = frictionAnim.interpolate({
    inputRange: [0, 20, 50, 80, 100],
    outputRange: ['#F44336', '#FF9800', '#4CAF50', '#FF9800', '#F44336']
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {gameState === 'intro' && (
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
           <Feather name="wind" size={60} color="#009688" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: textColor }]}>
             {isHindi ? 'वू वेई (Wu Wei) सिमुलेटर' : 'The Wu Wei Simulator'}
           </Text>
           <Text style={[styles.desc, { color: textColor }]}>
             {isHindi 
               ? "आप ताओ (Tao) नदी पर एक छोटी नाव हैं। आपका लक्ष्य नदी के मुहाने (Ocean) तक पहुंचना है। यदि आप कुछ नहीं करते (Zero Effort), तो आप चट्टानों से टकरा जाएंगे। यदि आप बहुत अधिक प्रयास करते हैं (लगातार टैप करना), तो आपका 'अहंकार' घर्षण पैदा करेगा और नाव पलट जाएगी। संतुलन खोजें।" 
               : "You are a small boat on the Tao River. Your goal is to reach the Ocean. If you do absolutely nothing (Zero Effort), you will hit the rocks. If you try too hard (tapping violently), your 'Ego' creates too much friction and you capsize. Find the balance."}
           </Text>

           <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#333' : '#E0F2F1' }]}>
              <Text style={{ textAlign: 'center', fontSize: 13, color: textColor, fontWeight: 'bold' }}>
                 {isHindi ? "संकेत: बस हल्का सा टैप करें। पानी को काम करने दें।" : "HINT: Tap only gently. Let the water do the work."}
              </Text>
           </View>

           <TouchableOpacity 
             style={[styles.btn, { backgroundColor: '#009688' }]} 
             onPress={startGame}
           >
             <Text style={styles.btnText}>{isHindi ? 'नदी में प्रवेश करें' : 'ENTER THE RIVER'}</Text>
           </TouchableOpacity>
        </View>
      )}

      {gameState === 'playing' && (
        <View style={[styles.card, { backgroundColor: cardBgColor, padding: 10 }]}>
           
           <Text style={[styles.title, { color: textColor, marginBottom: 10, fontSize: 18 }]}>
             {isHindi ? 'प्रवाह के साथ बहें (Flow)' : 'FLOW WITH THE RIVER'}
           </Text>

           {/* PROGRESS BAR */}
           <View style={{ width: '100%', alignItems: 'center', marginBottom: 30 }}>
             <Text style={{ color: textColor, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
               {isHindi ? 'समुद्र तक की दूरी' : 'DISTANCE TO OCEAN'}
             </Text>
             <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#444' : '#E0E0E0' }]}>
               <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
             </View>
           </View>

           {/* FRICTION METER */}
           <View style={{ flex: 1, flexDirection: 'row', width: '100%', paddingHorizontal: 20 }}>
              
              {/* Labels */}
              <View style={{ justifyContent: 'space-between', paddingVertical: 10, marginRight: 20 }}>
                 <Text style={[styles.meterLabel, { color: '#F44336' }]}>{isHindi ? 'अहंकार' : 'EGO'}</Text>
                 <Text style={[styles.meterLabel, { color: '#4CAF50' }]}>{isHindi ? 'ताओ' : 'TAO'}</Text>
                 <Text style={[styles.meterLabel, { color: '#F44336' }]}>{isHindi ? 'चट्टानें' : 'ROCKS'}</Text>
              </View>

              {/* Bar */}
              <View style={[styles.verticalTrack, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}>
                 {/* Neutral Zone indicator */}
                 <View style={[styles.neutralZone, { borderColor: '#4CAF50' }]} />
                 
                 {/* The Boat (Indicator) */}
                 <Animated.View style={[
                   styles.boatIndicator, 
                   { 
                     backgroundColor: indicatorColor,
                     bottom: frictionAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) 
                   }
                 ]}>
                    <Feather name="navigation" size={16} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />
                 </Animated.View>
              </View>

              {/* Instructions */}
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 20 }}>
                {/* @ts-ignore */}
                <AnimatedTouchable 
                  style={[styles.tapZone, { borderColor: indicatorColor }]}
                  activeOpacity={0.5}
                  onPress={handleTap}
                >
                  <Text style={[styles.tapText, { color: textColor }]}>
                    {isHindi ? 'टैप/TAP' : 'TAP'}
                  </Text>
                </AnimatedTouchable>
              </View>

           </View>
        </View>
      )}

      {gameState === 'failure' && (
        <View style={[styles.card, { backgroundColor: cardBgColor, justifyContent: 'center' }]}>
           <Feather name={reason === 'lazy' ? 'alert-octagon' : 'zap'} size={60} color="#F44336" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>
             {isHindi ? 'सामंजस्य टूट गया' : 'HARMONY BROKEN'}
           </Text>
           <Text style={[styles.desc, { color: textColor }]}>
             {reason === 'lazy' 
               ? (isHindi ? "आपने बिल्कुल प्रयास नहीं किया। आप चट्टानों से टकरा गए। 'वू वेई' का अर्थ 'कुछ न करना' नहीं है, इसका अर्थ 'बिना बल के कार्य करना' है।" : "You put in zero effort and crashed into the rocks. Wu Wei does not mean 'doing nothing'. It means 'action without force'.")
               : (isHindi ? "आपने बहुत अधिक प्रयास किया। आपके अत्यधिक नियंत्रण (अहंकार) ने घर्षण पैदा किया और नाव पलट गई। नदी को धकेलना बंद करें।" : "You tried too hard. Your excessive need for control (Ego) created destructive friction. Stop pushing the river.")
             }
           </Text>
           <TouchableOpacity 
             style={[styles.btn, { backgroundColor: '#F44336', marginTop: 20 }]} 
             onPress={startGame}
           >
             <Text style={styles.btnText}>{isHindi ? 'पुनः प्रयास करें' : 'TRY AGAIN'}</Text>
           </TouchableOpacity>
        </View>
      )}

      {gameState === 'success' && (
        <View style={[styles.card, { backgroundColor: cardBgColor, justifyContent: 'center' }]}>
           <Feather name="anchor" size={60} color="#4CAF50" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: '#4CAF50', marginBottom: 8 }]}>
             {isHindi ? 'आप समुद्र तक पहुँच गए' : 'YOU REACHED THE OCEAN'}
           </Text>
           <Text style={[styles.desc, { color: textColor }]}>
             {isHindi 
               ? "आपने 'वू वेई' (Wu Wei) हासिल कर लिया है। आपने केवल उतना ही कार्य किया जितना आवश्यक था, परिणामों को मजबूर किए बिना। अहंकार के बिना कार्रवाई ही शांति (Peace) का मार्ग है।" 
               : "You achieved Wu Wei. You acted only when necessary, and applied just enough effort without forcing outcomes. Action without ego is the path to peace."}
           </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 30,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center'
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#009688',
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: '900',
  },
  verticalTrack: {
    width: 20,
    height: '100%',
    borderRadius: 10,
    position: 'relative',
  },
  neutralZone: {
    position: 'absolute',
    top: '35%',
    height: '30%',
    width: '100%',
    borderWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    zIndex: 1,
  },
  boatIndicator: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    left: -5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tapZone: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed'
  },
  tapText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
