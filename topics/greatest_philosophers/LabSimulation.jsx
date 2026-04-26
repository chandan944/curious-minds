import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const QUOTES = [
  {
    textEn: "A leader must be both a lion and a fox. It is much safer to be feared than loved.",
    textHi: "एक नेता को शेर और लोमड़ी 'दोनों' होना चाहिए। प्यार किए जाने से बेहतर है कि लोग आपसे 'डरें' (feared)।",
    answer: "Machiavelli",
    options: ["Kant", "Socrates", "Machiavelli", "Spinoza"],
    color: "#F44336",
    analysisEn: "Machiavelli famously separated ethics from politics, focusing purely on power and survival.",
    analysisHi: "मैकियावेली ने राजनीति को 'नैतिकता' से अलग कर दिया, केवल सत्ता (Power) और 'अस्तित्व' (Survival) पर ध्यान केंद्रित किया।"
  },
  {
    textEn: "I think, therefore I am. (Cogito, ergo sum)",
    textHi: "मैं 'सोचता' हूँ, इसलिए मैं 'हूँ'।",
    answer: "Descartes",
    options: ["Plato", "Descartes", "Marx", "Hume"],
    color: "#00BCD4",
    analysisEn: "Descartes doubted everything ( حتى his own reality) until he found one truth impossible to doubt: his own thinking mind.",
    analysisHi: "डेसकार्टेस ने 'सब कुछ' पर संदेह किया जब तक कि उसे एक ऐसा सत्य नहीं मिला जिस पर संदेह करना असंभव था: खुद का सोचने वाला दिमाग।"
  },
  {
    textEn: "God is dead. And we have killed him.",
    textHi: "ईश्वर 'मर' चुका है। और हमने (इंसानों ने) उसे 'मारा' है।",
    answer: "Nietzsche",
    options: ["Nietzsche", "Aristotle", "Locke", "Kant"],
    color: "#FF5722",
    analysisEn: "Nietzsche wasn't celebrating; he was warning that science had killed humanity's religious moral foundation.",
    analysisHi: "नीत्शे 'जश्न' नहीं मना रहा था; वह 'चेतावनी' दे रहा था कि 'विज्ञान' ने मानवता की धार्मिक 'नैतिक नींव' को मार डाला है।"
  },
  {
    textEn: "I know that I know nothing.",
    textHi: "मुझे 'बस' इतना पता है कि मैं 'कुछ 'नहीं' ' जानता।",
    answer: "Socrates",
    options: ["Marx", "Schopenhauer", "Socrates", "Aristotle"],
    color: "#9C27B0",
    analysisEn: "Socrates' ultimate wisdom was recognizing his own ignorance. It made him the smartest man in Athens.",
    analysisHi: "सुकरात का 'अंतिम ज्ञान' अपनी स्वयं की 'अज्ञानता' को पहचानना था। इसने उसे एथेंस का सबसे 'चतुर' व्यक्ति बना दिया।"
  },
  {
    textEn: "Life swings like a pendulum backward and forward between pain and boredom.",
    textHi: "जीवन एक पेंडुलम की तरह 'दर्द' (Pain) और 'बोरियत' (Boredom) के बीच 'पीछे और आगे' झूलता है।",
    answer: "Schopenhauer",
    options: ["Descartes", "Schopenhauer", "Plato", "Kant"],
    color: "#607D8B",
    analysisEn: "Schopenhauer's extreme pessimism believed that human 'desire' only guarantees suffering.",
    analysisHi: "शोपेनहावर का 'चरम निराशावाद' इस बात पर 'टिका' था कि मानवीय 'इच्छाएँ' केवल दुःख (suffering) की 'गारंटी' देती हैं।"
  }
];

export default function GreatestPhilosophersLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState('reading'); // reading, feedback, won
  const [score, setScore] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  
  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const [shakeAnim] = useState(new Animated.Value(0));

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
    ]).start();
  };

  const currentQuote = QUOTES[currentIndex];

  const handleGuess = (selectedVal) => {
    const isCorrect = selectedVal === currentQuote.answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      triggerShake();
    }

    setLastFeedback({
      isCorrect,
      correctAnswer: currentQuote.answer
    });
    setGameState('feedback');
  };

  const nextQuote = () => {
    if (currentIndex < QUOTES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setGameState('reading');
    } else {
      setGameState('won');
      if (onComplete) setTimeout(onComplete, 3000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.hudLabel, { color: textColor }]}>
              {isHindi ? 'ज्ञान स्कोर (Wisdom Score):' : 'Wisdom Score:'} {score}/{QUOTES.length}
            </Text>
            <View style={[styles.badge, { backgroundColor: '#FFB300' }]}>
               <Feather name="award" size={14} color="#FFF" />
            </View>
         </View>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
        
        {gameState === 'reading' && (
          <View style={styles.centerBox}>
            <Text style={[styles.eventTag, { color: currentQuote.color }]}>
              {isHindi ? 'कोट डिकोडर' : 'QUOTE DECODER'}
            </Text>
            
            <Text style={[styles.quoteText, { color: textColor }]}>
              "{isHindi ? currentQuote.textHi : currentQuote.textEn}"
            </Text>

            <View style={styles.optionsWrap}>
               {currentQuote.options.map(opt => (
                 <TouchableOpacity 
                   key={opt}
                   style={[styles.optBtn, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}
                   onPress={() => handleGuess(opt)}
                 >
                   <Text style={[styles.optBtnText, { color: textColor }]}>{opt}</Text>
                 </TouchableOpacity>
               ))}
            </View>
          </View>
        )}

        {gameState === 'feedback' && (
          <View style={styles.feedbackBox}>
             <Feather 
               name={lastFeedback.isCorrect ? "check-circle" : "x-circle"} 
               size={50} 
               color={lastFeedback.isCorrect ? "#4CAF50" : "#F44336"} 
               style={{ marginBottom: 16 }}
             />
             <Text style={[styles.feedbackTitle, { color: lastFeedback.isCorrect ? '#4CAF50' : '#F44336' }]}>
               {lastFeedback.isCorrect ? (isHindi ? 'सही!' : 'Correct!') : (isHindi ? 'गलत!' : 'Incorrect!')}
             </Text>
             
             <Text style={[styles.correctAnswerText, { color: textColor }]}>
               {isHindi ? 'यह कहा था:' : 'This was said by:'} <Text style={{ fontWeight: 'bold' }}>{lastFeedback.correctAnswer}</Text>
             </Text>

             <View style={[styles.analysisBox, { backgroundColor: currentQuote.color + '22' }]}>
                <Text style={[styles.analysisText, { color: textColor }]}>
                  {isHindi ? currentQuote.analysisHi : currentQuote.analysisEn}
                </Text>
             </View>

             <TouchableOpacity style={styles.nextBtn} onPress={nextQuote}>
               <Text style={styles.nextBtnText}>{isHindi ? 'अगला कोट' : 'Next Quote'}</Text>
             </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.feedbackBox}>
             <Feather name="users" size={60} color="#FF9800" style={{ marginBottom: 16 }} />
             <Text style={[styles.feedbackTitle, { color: '#FF9800' }]}>
               {isHindi ? 'दार्शनिक मास्टर' : 'Philosopher Master'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? `आपने ${QUOTES.length} में से ${score} पहचान लिए। आप सफलतापूर्वक 2,500 साल पुरानी 'महान बातचीत' का हिस्सा बन गए हैं।` 
                 : `You successfully identified ${score}/${QUOTES.length}. You have joined the 2,500-year-old Great Conversation.`}
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
  },
  badge: {
    padding: 6,
    borderRadius: 12,
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
  quoteText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 32,
    marginBottom: 30,
  },
  optionsWrap: {
    gap: 12,
  },
  optBtn: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  correctAnswerText: {
    fontSize: 18,
    marginBottom: 24,
  },
  analysisBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%'
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center'
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
