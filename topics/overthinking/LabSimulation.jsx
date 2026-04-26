import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const THOUGHTS = [
  { id: 1, textEn: "What if I fail the interview tomorrow?", textHi: "क्या होगा अगर मैं कल के इंटरव्यू में फेल हो गया?", type: "catastrophizing", speed: 4000 },
  { id: 2, textEn: "They didn't smile when I walked in. They hate me.", textHi: "जब मैं अंदर आया तो वे नहीं मुस्कुराए। वे मुझसे नफरत करते हैं।", type: "mind_reading", speed: 5000 },
  { id: 3, textEn: "I shouldn't have said that joke 5 years ago.", textHi: "मुझे 5 साल पहले वो जोक नहीं मारना चाहिए था।", type: "past", speed: 4500 },
  { id: 4, textEn: "I have a headache. What if it is a rare terminal illness?", textHi: "मुझे सिरदर्द है। क्या होगा अगर यह कोई दुर्लभ जानलेवा बीमारी हो?", type: "catastrophizing", speed: 3800 },
  { id: 5, textEn: "If I don't check my email again, I'll miss something catastrophic.", textHi: "अगर मैंने अपना ईमेल दोबारा चेक नहीं किया, तो कुछ भयानक छूट जाएगा।", type: "control", speed: 4200 },
];

export default function OverthinkingLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('playing'); // playing, busted, won
  const [dmnActivity, setDmnActivity] = useState(10); // Default Mode Network activity level (load)
  const [activeThoughts, setActiveThoughts] = useState([]);
  const [interceptedCount, setInterceptedCount] = useState(0);
  
  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';
  const thoughtBubbleColor = isDarkMode ? '#2C2C2C' : '#E0E0E0';

  // Game Loop: Spawn thoughts periodically
  useEffect(() => {
    let spawnInterval;
    if (gameState === 'playing') {
      spawnInterval = setInterval(() => {
        const randomThought = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];
        const newThought = { ...randomThought, uniqueId: Date.now() + Math.random() };
        
        setActiveThoughts(prev => [...prev, newThought]);
      }, 2500); // New thought every 2.5 seconds
    }
    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Game Loop: Manage thoughts falling and network overload
  useEffect(() => {
    let tickInterval;
    if (gameState === 'playing') {
      tickInterval = setInterval(() => {
         // Thoughts 'cost' DMN activity just by existing.
         setDmnActivity(prev => {
            const next = prev + (activeThoughts.length * 2);
            if (next >= 100) {
              setGameState('busted');
              clearInterval(tickInterval);
              return 100;
            }
            return next;
         });
      }, 1000);
    }
    return () => clearInterval(tickInterval);
  }, [gameState, activeThoughts]);

  // DMN naturally drains very slowly if there are no thoughts (relaxation)
  useEffect(() => {
    let relaxInterval;
    if (gameState === 'playing' && activeThoughts.length === 0) {
      relaxInterval = setInterval(() => {
         setDmnActivity(prev => Math.max(0, prev - 5));
      }, 500);
    }
    return () => clearInterval(relaxInterval);
  }, [gameState, activeThoughts]);

  const handleIntercept = (id) => {
    if (gameState !== 'playing') return;

    setActiveThoughts(prev => prev.filter(t => t.uniqueId !== id));
    setDmnActivity(prev => Math.max(0, prev - 10)); // Reward for discarding
    setInterceptedCount(prev => {
      const next = prev + 1;
      if (next >= 10) {
         setGameState('won');
         if (onComplete) setTimeout(onComplete, 2000);
      }
      return next;
    });
  };

  const restart = () => {
    setDmnActivity(10);
    setActiveThoughts([]);
    setInterceptedCount(0);
    setGameState('playing');
  };

  const getDMNColor = () => {
    if (dmnActivity > 75) return '#F44336';
    if (dmnActivity > 40) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'DMN अधिभार (Anxiety):' : 'DMN Overload (Anxiety):'} {Math.ceil(dmnActivity)}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${dmnActivity}%`, backgroundColor: getDMNColor() }]} />
        </View>

        <View style={styles.scoreRow}>
          <Text style={{ color: textColor, fontWeight: 'bold' }}>
            {isHindi ? 'त्यागे गए विचार:' : 'Thoughts Discarded:'} {interceptedCount} / 10
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'playing' && (
          <View style={styles.gameArea}>
            <Text style={[styles.gameTitle, { color: textColor }]}>
               {isHindi ? 'विचारों का भंवर' : 'Thought Stream'}
            </Text>
            
            <ScrollView style={styles.streamContainer} contentContainerStyle={{ paddingBottom: 20 }}>
              {activeThoughts.map((thought) => (
                <View key={thought.uniqueId} style={[styles.thoughtBubble, { backgroundColor: thoughtBubbleColor }]}>
                  <Text style={[styles.thoughtText, { color: textColor }]}>
                    {isHindi ? thought.textHi : thought.textEn}
                  </Text>
                  
                  {/* Action Buttons to 'Label' and discard the thought */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.discardBtn} onPress={() => handleIntercept(thought.uniqueId)}>
                      <Feather name="trash-2" size={14} color="#FFF" />
                      <Text style={styles.discardText}>
                         {isHindi ? 'यह बस एक कहानी है (Discard)' : 'It is just a story (Discard)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {activeThoughts.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
                   {isHindi ? 'दिमाग अभी शांत (Present) है...' : 'Mind is anchored in the present...'}
                </Text>
              )}
            </ScrollView>
          </View>
        )}

        {gameState === 'busted' && (
          <View style={styles.centerContent}>
            <Feather name="alert-octagon" size={64} color="#F44336" style={styles.iconMargin} />
            <Text style={[styles.feedbackTitle, { color: '#F44336' }]}>
              {isHindi ? 'एनालिसिस पैरालिसिस (Analysis Paralysis)' : 'Analysis Paralysis'}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {isHindi 
                ? "DMN 100% पर पहुँच गया। आपने इतने सारे 'अगर मगर' को इकट्ठा होने दिया कि आपके दिमाग ने पैनिक अटैक (Panic Attack) का ट्रिगर दबा दिया।" 
                : "DMN hit 100% Overload. You allowed too many uncontrolled 'What Ifs' to pile up in your working memory, triggering an anxiety spiral."}
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#FF9800' }]} onPress={restart}>
              <Text style={styles.btnText}>{isHindi ? '5-4-3-2-1 ग्राउंडिंग करें (Restart)' : 'Apply 5-4-3-2-1 Grounding'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
            <Feather name="wind" size={64} color="#00BCD4" style={styles.iconMargin} />
            <Text style={[styles.feedbackTitle, { color: '#00BCD4' }]}>
              {isHindi ? 'सचेतन शांति (Mindful Clarity)' : 'Mindful Clarity'}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {isHindi 
                ? 'आपने सफलतापूर्वक विचारों को खुद से अलग कर दिया। आपने महसूस किया कि आपको अपने हर विचार पर प्रतिक्रिया (Engage) देने की आवश्यकता नहीं है।' 
                : 'You successfully created psychological distance. By labeling the thoughts rather than engaging with them, you starved the DMN of its anxiety fuel.'}
            </Text>
          </View>
        )}

      </View>

      <Text style={[styles.hint, { color: textColor }]}>
        {isHindi ? 'टिप: विचारों से मत लड़ें; 5-4-3-2-1 विधि का उपयोग करके बस उन पर लेबल लगायें और उन्हें जाने दें।' : 'Hack: Do not argue with the thoughts. Just label them as "glitches" and let them pass to drop the DMN load.'}
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
    marginBottom: 24,
  },
  hudLabel: {
    fontSize: 14,
    fontWeight: 'bold',
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
  scoreRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 400,
    justifyContent: 'center',
    padding: 16,
  },
  gameArea: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  streamContainer: {
    flex: 1,
  },
  thoughtBubble: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  thoughtText: {
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  discardBtn: {
    flexDirection: 'row',
    backgroundColor: '#607D8B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  discardText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconMargin: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  }
});
