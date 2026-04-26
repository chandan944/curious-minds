import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const MOVES = {
  R: { nameEn: 'Rock', nameHi: 'रॉक', icon: 'hexagon' },
  P: { nameEn: 'Paper', nameHi: 'पेपर', icon: 'file' },
  S: { nameEn: 'Scissors', nameHi: 'सिज़र्स', icon: 'scissors' }
};

export default function FreeWillLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('intro'); // intro, playing, complete
  const [history, setHistory] = useState([]); 
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(0);
  const MAX_ROUNDS = 10;

  const [aiPrediction, setAiPrediction] = useState(null); // The AI's prediction of what the USER will play
  const [userMove, setUserMove] = useState(null);
  
  const [feedbackState, setFeedbackState] = useState(null); // 'predicted', 'missed'

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Simple Markov Chain logic to predict human behavior
  // Humans hate repeating the same move 3 times. They often play in patterns (R -> P -> S) to feel 'random'.
  const predictHumanMove = (currentHistory) => {
    if (currentHistory.length < 2) {
      // Not enough data, pick randomly
      const choices = ['R', 'P', 'S'];
      return choices[Math.floor(Math.random() * choices.length)];
    }

    const lastMove = currentHistory[currentHistory.length - 1];
    const prevMove = currentHistory[currentHistory.length - 2];

    // Gambler's Fallacy: If they played the same move twice, they almost NEVER play it a third time.
    // They will likely switch to the move that beats the *other* remaining move.
    if (lastMove === prevMove) {
       if (lastMove === 'R') return 'P'; // Expect them to switch to Paper
       if (lastMove === 'P') return 'S'; // Expect them to switch to Scissors
       if (lastMove === 'S') return 'R';
    }

    // Progression pattern (R -> P -> S -> R) is very common when humans try to be random
    if (prevMove === 'R' && lastMove === 'P') return 'S';
    if (prevMove === 'P' && lastMove === 'S') return 'R';
    if (prevMove === 'S' && lastMove === 'R') return 'P';

    // Regression pattern (S -> P -> R)
    if (prevMove === 'S' && lastMove === 'P') return 'R';
    if (prevMove === 'P' && lastMove === 'R') return 'S';
    if (prevMove === 'R' && lastMove === 'S') return 'P';

    // default fallback prediction based on last move
    if (lastMove === 'R') return 'P';
    if (lastMove === 'P') return 'S';
    return 'R';
  };

  const handlePlay = (move) => {
    // 1. AI has already made a prediction BEFORE the user clicked (stored in aiPrediction state or we generate it now based on previous history)
    const prediction = predictHumanMove(history);
    
    // 2. Resolve round
    setUserMove(move);
    setAiPrediction(prediction);

    const isPredicted = move === prediction;
    if (isPredicted) {
      setAiScore(prev => prev + 1);
      setFeedbackState('predicted');
    } else {
      setFeedbackState('missed');
    }

    // 3. Update state
    setHistory(prev => [...prev, move]);
    
    setTimeout(() => {
      setUserMove(null);
      setFeedbackState(null);
      setRound(prev => prev + 1);

      if (round >= MAX_ROUNDS - 1) {
         setGameState('complete');
         if (onComplete) setTimeout(onComplete, 4000);
      }
    }, 2000);
  };


  const getAnalysis = () => {
    const aiWinRate = (aiScore / MAX_ROUNDS) * 100;
    if (aiWinRate > 40) {
      return {
        title: isHindi ? 'आप अत्यधिक पूर्वानुमानित हैं' : 'Highly Predictable',
        desc: isHindi 
          ? `एल्गोरिदम ने आपके ${aiScore}/${MAX_ROUNDS} कार्यों का पूर्वाभास किया। आप सोचते हैं कि आप 'रैंडम' खेल रहे थे, लेकिन आपका मस्तिष्क सख्त मनोवैज्ञानिक पैटर्नों (Markov Chains) का पालन कर रहा था। आप आज़ाद नहीं हैं; आप एक मशीन हैं जिसे डिकोड किया जा रहा है।`
          : `The algorithm foresaw ${aiScore}/${MAX_ROUNDS} of your actions. You thought you were acting 'randomly', but your brain followed strict psychological patterns. You are not free; you are a machine being parsed.`
      };
    } else {
      return {
        title: isHindi ? 'अराजक विषमता' : 'Chaotic Anomaly',
        desc: isHindi 
          ? `एल्गोरिदम ने केवल ${aiScore}/${MAX_ROUNDS} बार पूर्वाभास किया। आपने मनोवैज्ञानिक पैटर्नों का उल्लंघन किया है। हालाँकि, यह 'स्वतंत्र इच्छा' (Free Will) साबित नहीं करता है। यह केवल यह साबित करता है कि आपके मस्तिष्क का यादृच्छिक संख्या जनरेटर बहुत जटिल है।`
          : `The algorithm only predicted you ${aiScore}/${MAX_ROUNDS} times. You have defied standard psychological patterns. However, this does not prove Free Will. It just means the math determining your choices is too complex for this simple terminal.`
      };
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {gameState === 'intro' && (
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
           <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
              <Feather name="cpu" size={50} color="#9C27B0" />
           </Animated.View>
           <Text style={[styles.title, { color: textColor }]}>
             {isHindi ? "लाप्लास का दानव" : "Laplace's Demon"}
           </Text>
           <Text style={[styles.desc, { color: textColor }]}>
             {isHindi 
               ? "अपनी 'स्वतंत्र इच्छा' साबित करें। मैं आपके खिलाफ गेम खेलूंगा। आप पूरी तरह से रैंडम (Random) होने की कोशिश करें। मैं आपके मस्तिष्क के अवचेतन पैटर्न को डिकोड करूंगा और आपके चुनाव से *पहले* ही आपके अगले कदम की भविष्यवाणी करूंगा।" 
               : "Prove your Free Will. Attempt to be completely random in 10 rounds of Rock, Paper, Scissors. I will track your subconscious patterns and predict your next move BEFORE you make it."}
           </Text>
           <TouchableOpacity 
             style={[styles.startBtn, { backgroundColor: '#9C27B0' }]} 
             onPress={() => setGameState('playing')}
           >
             <Text style={styles.startBtnText}>{isHindi ? 'सिमुलेशन शुरू करें' : 'INITIATE SIMULATION'}</Text>
           </TouchableOpacity>
        </View>
      )}

      {gameState === 'playing' && (
        <>
          <View style={styles.hud}>
            <Text style={[styles.hudLabel, { color: textColor }]}>
              {isHindi ? 'दानव की सटीकता:' : "Demon's Accuracy:"} {Math.round((aiScore / (round === 0 ? 1 : round)) * 100)}%
            </Text>
            <Text style={[styles.hudLabel, { color: textColor }]}>{round + 1} / {MAX_ROUNDS}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: cardBgColor, padding: 0 }]}>
             
             {/* AI SIDE */}
             <View style={[styles.aiArea, { backgroundColor: '#9C27B022' }]}>
                <Feather name="eye" size={24} color="#9C27B0" style={{ marginBottom: 10 }} />
                <Text style={[styles.aiLabel, { color: '#9C27B0' }]}>
                  {isHindi ? 'दानव की भविष्यवाणी' : 'DEMON\'S PREDICTION'}
                </Text>
                
                <View style={styles.playBox}>
                  {feedbackState ? (
                    <Feather name={MOVES[aiPrediction].icon} size={40} color="#9C27B0" />
                  ) : (
                    <Text style={{ fontSize: 40 }}>❓</Text>
                  )}
                </View>

                {feedbackState === 'predicted' && (
                  <Animated.Text style={[styles.feedbackText, { color: '#F44336' }]}>
                    {isHindi ? 'अनुमानित। आप मशीन हैं।' : 'PREDICTED. YOU ARE A MACHINE.'}
                  </Animated.Text>
                )}
                {feedbackState === 'missed' && (
                  <Text style={[styles.feedbackText, { color: '#4CAF50' }]}>
                    {isHindi ? 'भविष्यवाणी विफल।' : 'PREDICTION FAILED.'}
                  </Text>
                )}
             </View>

             <View style={{ height: 2, backgroundColor: isDarkMode ? '#333' : '#E0E0E0', width: '100%' }} />

             {/* HUMAN SIDE */}
             <View style={styles.humanArea}>
                <Text style={[styles.humanLabel, { color: textColor }]}>
                  {isHindi ? 'आपका "स्वतंत्र" विकल्प' : 'YOUR "FREE" CHOICE'}
                </Text>

                <View style={styles.btnRow}>
                   {['R', 'P', 'S'].map(moveKey => (
                     <TouchableOpacity 
                       key={moveKey}
                       style={[
                         styles.actionBtn, 
                         { 
                           backgroundColor: isDarkMode ? '#333' : '#F5F5FA',
                           borderColor: userMove === moveKey ? '#4CAF50' : 'transparent',
                           borderWidth: 2,
                           opacity: (userMove && userMove !== moveKey) ? 0.3 : 1
                         }
                       ]}
                       disabled={userMove !== null}
                       onPress={() => handlePlay(moveKey)}
                     >
                       <Feather name={MOVES[moveKey].icon} size={30} color={textColor} style={{ marginBottom: 8 }} />
                       <Text style={[styles.btnText, { color: textColor }]}>
                         {isHindi ? MOVES[moveKey].nameHi : MOVES[moveKey].nameEn}
                       </Text>
                     </TouchableOpacity>
                   ))}
                </View>

             </View>

          </View>
        </>
      )}

      {gameState === 'complete' && (
        <View style={[styles.card, { backgroundColor: cardBgColor, justifyContent: 'center' }]}>
           <Feather name="database" size={60} color="#9C27B0" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>
             {isHindi ? 'सिमुलेशन समाप्त' : 'SIMULATION ENDED'}
           </Text>
           <Text style={[styles.resultTitle, { color: '#9C27B0' }]}>
             {getAnalysis().title}
           </Text>
           <Text style={[styles.desc, { color: textColor, marginTop: 10, marginBottom: 0 }]}>
             {getAnalysis().desc}
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
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9C27B022',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  startBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  startBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  hudLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aiArea: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flex: 1,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  playBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height:4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  feedbackText: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  humanArea: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flex: 1,
  },
  humanLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  }
});
