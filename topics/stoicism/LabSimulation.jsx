import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const EVENTS = [
  { id: 1, textEn: "A sudden rainstorm ruins your outdoor plans.", textHi: "अचानक आई बारिश आपके घर से बाहर के सारे प्लान (Plans) बर्बाद कर देती है।", controllable: false },
  { id: 2, textEn: "Whether you choose to complain about the rainstorm.", textHi: "चाहे आप बारिश की 'शिकायत' (Complain) करना चुनें या न चुनें।", controllable: true },
  { id: 3, textEn: "What your coworkers secretly think about your presentation.", textHi: "आपके सहकर्मी गुप्त रूप से आपके 'प्रेजेंटेशन' (Presentation) के बारे में क्या सोचते हैं।", controllable: false },
  { id: 4, textEn: "The amount of effort you put into preparing the presentation.", textHi: "वह मेहनत और प्रयास जो आपने 'प्रेजेंटेशन' तैयार करने में लगाया।", controllable: true },
  { id: 5, textEn: "Getting a viral sickness from someone on the train.", textHi: "ट्रेन में किसी (रोगी) से वायरल बीमारी पकड़ना।", controllable: false },
  { id: 6, textEn: "Your decision to eat healthy and sleep well while recovering.", textHi: "बीमारी से ठीक होते समय 'स्वस्थ खाना' खाने और 'अच्छी नींद' लेने का आपका निर्णय।", controllable: true },
  { id: 7, textEn: "The stock market crashing right after you invest.", textHi: "आपके निवेश (Invest) करने के ठीक बाद शेयर बाजार (Stock market) का क्रैश होना।", controllable: false },
  { id: 8, textEn: "Choosing not to panic sell your stock.", textHi: "घबराहट (Panic) में अपना स्टॉक 'न' बेचने का चुनाव करना।", controllable: true },
];

export default function StoicismLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [gameState, setGameState] = useState('sorting'); // sorting, feedback, won, lose
  const [peaceOfMind, setPeaceOfMind] = useState(100);
  const [lastFeedback, setLastFeedback] = useState(null);
  
  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  // Shake animation on wrong answer
  const [shakeAnim] = useState(new Animated.Value(0));

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
    ]).start();
  };

  const handleSort = (userThinksControllable) => {
    const event = EVENTS[currentEventIndex];
    const isCorrect = userThinksControllable === event.controllable;

    if (isCorrect) {
      setLastFeedback({
        success: true,
        textEn: "Correct. The Inner Citadel holds strong.",
        textHi: "सही। भीतरी 'किले की दीवारें' मजबूत हैं।"
      });
    } else {
      triggerShake();
      setPeaceOfMind(prev => Math.max(0, prev - 25));
      setLastFeedback({
        success: false,
        textEn: userThinksControllable ? 
          "Error! Trying to control the external world causes immediate suffering." : 
          "Error! You surrendered control over your own mind. That is cowardly.",
        textHi: userThinksControllable ?
          "त्रुटि (Error)! बाहरी दुनिया (External world) को 'नियंत्रित' करने का प्रयास 'पीड़ा' का कारण बनता है।" :
          "त्रुटि! आपने 'अपने मन' पर नियंत्रण भी छोड़ दिया। यह कायरता है।"
      });
    }

    setGameState('feedback');
  };

  const nextEvent = () => {
    if (peaceOfMind <= 0) {
      setGameState('lose');
      return;
    }

    if (currentEventIndex < EVENTS.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
      setGameState('sorting');
    } else {
      setGameState('won');
      if (onComplete) setTimeout(onComplete, 3000);
    }
  };

  const restart = () => {
    setPeaceOfMind(100);
    setCurrentEventIndex(0);
    setGameState('sorting');
  };

  const event = EVENTS[currentEventIndex];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.hudLabel, { color: textColor }]}>
              {isHindi ? 'मन की शांति (Inner Citadel):' : 'Peace of Mind:'} {peaceOfMind}%
            </Text>
            <View style={[styles.hpBadge, { backgroundColor: peaceOfMind > 50 ? '#4CAF50' : '#F44336' }]}>
               <Feather name="shield" size={12} color="#FFF" />
            </View>
         </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${peaceOfMind}%`, backgroundColor: peaceOfMind > 50 ? '#4CAF50' : '#F44336' }]} />
        </View>
        <Text style={[styles.progressText, { color: textColor }]}>
           {currentEventIndex + 1} / {EVENTS.length}
        </Text>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
        
        {gameState === 'sorting' && (
          <View style={styles.centerBox}>
            <Text style={[styles.eventTag, { color: '#607D8B' }]}>
              {isHindi ? 'घटना (EVENT)' : 'EVENT'}
            </Text>
            
            <Text style={[styles.eventText, { color: textColor }]}>
              "{isHindi ? event.textHi : event.textEn}"
            </Text>

            <View style={styles.sortButtons}>
               <TouchableOpacity 
                 style={[styles.sortBtn, { backgroundColor: '#F44336' }]} 
                 onPress={() => handleSort(false)}
               >
                 <Feather name="cloud-rain" size={24} color="#FFF" />
                 <Text style={styles.sortBtnText}>{isHindi ? 'मेरे नियंत्रण से बाहर' : 'OUTSIDE MY CONTROL'}</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.sortBtn, { backgroundColor: '#4CAF50' }]} 
                 onPress={() => handleSort(true)}
               >
                 <Feather name="user-check" size={24} color="#FFF" />
                 <Text style={styles.sortBtnText}>{isHindi ? 'मेरे नियंत्रण में है' : 'WITHIN MY CONTROL'}</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState === 'feedback' && (
          <View style={styles.feedbackBox}>
             <Feather 
               name={lastFeedback.success ? "check-circle" : "alert-octagon"} 
               size={50} 
               color={lastFeedback.success ? "#4CAF50" : "#F44336"} 
               style={{ marginBottom: 16 }}
             />
             <Text style={[styles.feedbackTitle, { color: lastFeedback.success ? '#4CAF50' : '#F44336' }]}>
               {lastFeedback.success ? (isHindi ? 'तर्कसंगत (Rational)' : 'Rational') : (isHindi ? 'तार्किक त्रुटि (Delusion)' : 'Delusion')}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi ? lastFeedback.textHi : lastFeedback.textEn}
             </Text>
             <TouchableOpacity style={styles.nextBtn} onPress={nextEvent}>
               <Text style={styles.nextBtnText}>{isHindi ? 'जारी रखें' : 'Continue'}</Text>
             </TouchableOpacity>
          </View>
        )}

        {gameState === 'lose' && (
          <View style={styles.feedbackBox}>
             <Feather name="shield-off" size={60} color="#F44336" style={{ marginBottom: 16 }} />
             <Text style={[styles.feedbackTitle, { color: '#F44336' }]}>
               {isHindi ? 'किला गिर गया (Citadel Breached)' : 'Citadel Breached'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? "आप उन चीज़ों को नियंत्रित करने की कोशिश करते रहे जिन्हें आप नहीं कर सकते थे, और अपने आप को नियंत्रित करने में विफल रहे। आपका मन अब चिंतित है।" 
                 : "You tried to control the uncontrollable, exhausting your mental energy. Your peace of mind has been destroyed."}
             </Text>
             <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#2196F3' }]} onPress={restart}>
               <Text style={styles.nextBtnText}>{isHindi ? 'पुनः प्रयास करें (Restart)' : 'Rebuild Citadel'}</Text>
             </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.feedbackBox}>
             <Feather name="award" size={60} color="#FF9800" style={{ marginBottom: 16 }} />
             <Text style={[styles.feedbackTitle, { color: '#FF9800' }]}>
               {isHindi ? 'अजेय मन (Invincible Mind)' : 'Invincible Mind'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? "आपने अपनी ऊर्जा को केवल उसी पर केंद्रित किया जिसे 'आप नियंत्रित' कर सकते हैं। बाहरी दुनिया चाहे कितनी भी पागल क्यों न हो जाए, आप शांत रहेंगे।" 
                 : "You aggressively separated reality from your reaction to it. The world can burn down, but your Inner Citadel remains untouched."}
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  hpBadge: {
    padding: 4,
    borderRadius: 10,
    marginBottom: 6,
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
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
    fontWeight: 'bold',
    opacity: 0.5
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 350,
  },
  centerBox: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between'
  },
  eventTag: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 30,
  },
  sortButtons: {
    gap: 16,
    width: '100%'
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  sortBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  feedbackBox: {
    padding: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    lineHeight: 24,
    marginBottom: 32,
  },
  nextBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
