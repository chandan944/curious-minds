import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const PATIENTS = [
  { 
    id: 1, 
    quoteEn: "I can't change careers now. I've already spent 10 years as an accountant. It's too late for me.", 
    quoteHi: "मैं अब अपना करियर नहीं बदल सकता। मैं पहले ही 10 साल एक अकाउंटेंट के रूप में बिता चुका हूँ। अब बहुत देर हो चुकी है।", 
    isBadFaith: true,
    analysisEn: "Facticity: 10 years spent. Transcendence: You can still choose a new path. Saying 'It's too late' is an excuse to avoid the terrifying freedom of starting over.",
    analysisHi: "तथ्यात्मकता (अतीत): 10 साल बिताए। ट्रांसेंडेंस (भविष्य): आप अभी भी नया रास्ता चुन सकते हैं। 'बहुत देर हो चुकी है' कहना, 'फिर से शुरू करने' की भयानक स्वतंत्रता से 'बचने' का एक बहाना है।"
  },
  { 
    id: 2, 
    quoteEn: "I hate this relationship, but I'm staying because I choose to prioritize financial stability over my happiness right now.", 
    quoteHi: "मुझे इस रिश्ते से नफरत है, लेकिन मैं यहीं रुक रही हूँ क्योंकि मैं अभी अपनी खुशी से ज्यादा 'वित्तीय सुरक्षा' (पैसों) को प्राथमिकता देना 'चुनती' हूँ।", 
    isBadFaith: false,
    analysisEn: "This is Authentic. They are acknowledging a painful reality, but taking 100% responsibility for their free choice to stay. No excuses are made.",
    analysisHi: "यह प्रामाणिक (Authentic) है। वह दर्दनाक 'वास्तविकता' को स्वीकार कर रही है, लेकिन रुकने के 'अपने फैसले' (Choice) की 100% 'जिम्मेदारी' भी ले रही है। कोई बहाना नहीं।"
  },
  { 
    id: 3, 
    quoteEn: "I naturally have a very short temper because I'm a Scorpio. I just yell at people, I can't help it.", 
    quoteHi: "मेरा स्वभाव 'जन्म से' ही बहुत गुस्सैल है क्योंकि मेरी 'राशि' वृश्चिक (Scorpio) है। मैं लोगों पर चिल्लाता हूँ, मैं खुद को 'रोक' नहीं सकता।", 
    isBadFaith: true,
    analysisEn: "Classic Bad Faith. Using astrology to pretend you are a pre-programmed object like a rock, rather than a conscious human who can choose not to yell.",
    analysisHi: "क्लासिक बैड फेथ। 'ज्योतिष' (Astrology) का उपयोग करके यह नाटक करना कि आप एक 'निर्जीव पत्थर' (object) हैं जिसे 'प्रोग्राम' किया गया है, न कि ऐसा व्यक्ति जो 'चिल्लाने से खुद को रोक' सकता है।"
  },
  { 
    id: 4, 
    quoteEn: "I grew up in poverty with terrible parents. I can never be successful because society is rigged against people like me.", 
    quoteHi: "मैं 'भयानक' माता-पिता के साथ भारी 'गरीबी' में बड़ा हुआ हूँ। मैं कभी सफल नहीं हो सकता क्योंकि 'समाज' मेरे जैसे लोगों के 'खिलाफ' है।", 
    isBadFaith: true,
    analysisEn: "While the systemic oppression (Facticity) is real, declaring 'I can never be successful' surrenders your Transcendence. It uses the past to erase the future.",
    analysisHi: "हालाँकि उसका दर्द और 'उत्पीड़न' वास्तविक है (Facticity), लेकिन यह कहना कि 'मैं कभी सफल नहीं हो सकता', आपकी 'स्वतंत्रता' (Transcendence) को खत्म कर देता है। यह अतीत (Past) का उपयोग करके 'भविष्य' को मिटा रहा है।"
  },
  { 
    id: 5, 
    quoteEn: "I grew up in poverty and society is rigged. The odds are against me, but I am choosing to fight for a better life anyway.", 
    quoteHi: "मैं गरीबी में बड़ा हुआ हूँ और समाज मेरे 'खिलाफ' है। 'किस्मत' मेरे पक्ष में नहीं है, लेकिन फिर भी मैं बेहतर जीवन के लिए 'लड़ने' का विकल्प 'चुनता' हूँ।", 
    isBadFaith: false,
    analysisEn: "Authentic! Acknowledges the brutal facts (Facticity) without letting those facts dictate their choices (Transcendence).",
    analysisHi: "प्रामाणिक! क्रूर 'तथ्यों' (अतीत/Facticity) को पूरी तरह से स्वीकारता है, बिना उन तथ्यों को अपना 'विकल्प' (भविष्य) तय करने दिए।"
  }
];

export default function ExistentialismLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState('diagnosing'); // diagnosing, analysis, won
  const [authenticityScore, setAuthenticityScore] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  
  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const patient = PATIENTS[currentIndex];

  const handleDiagnosis = (userThinksBadFaith) => {
    const isCorrect = userThinksBadFaith === patient.isBadFaith;

    if (isCorrect) {
      setAuthenticityScore(prev => prev + 20);
    }

    setLastFeedback({
      isCorrect,
      isBadFaith: patient.isBadFaith,
      analysisEn: patient.analysisEn,
      analysisHi: patient.analysisHi
    });

    setGameState('analysis');
  };

  const nextPatient = () => {
    if (currentIndex < PATIENTS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setGameState('diagnosing');
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
              {isHindi ? 'प्रामाणिकता (Authenticity):' : 'Authenticity Score:'} {authenticityScore}
            </Text>
            <View style={[styles.hpBadge, { backgroundColor: '#4CAF50' }]}>
               <Feather name="target" size={12} color="#FFF" />
            </View>
         </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${authenticityScore}%`, backgroundColor: '#4CAF50' }]} />
        </View>
        <Text style={[styles.progressText, { color: textColor }]}>
           {isHindi ? 'रोगी' : 'Patient'} {currentIndex + 1} / {PATIENTS.length}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'diagnosing' && (
          <View style={styles.centerBox}>
            <Text style={[styles.eventTag, { color: '#E91E63' }]}>
              {isHindi ? 'रोगी का बयान' : 'PATIENT STATEMENT'}
            </Text>
            
            <Text style={[styles.eventText, { color: textColor }]}>
              "{isHindi ? patient.quoteHi : patient.quoteEn}"
            </Text>

            <View style={styles.sortButtons}>
               <TouchableOpacity 
                 style={[styles.sortBtn, { backgroundColor: '#F44336' }]} 
                 onPress={() => handleDiagnosis(true)}
               >
                 <Feather name="frown" size={24} color="#FFF" />
                 <Text style={styles.sortBtnText}>{isHindi ? 'बैड फेथ (बहाना)' : 'BAD FAITH (EXCUSE)'}</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.sortBtn, { backgroundColor: '#4CAF50' }]} 
                 onPress={() => handleDiagnosis(false)}
               >
                 <Feather name="target" size={24} color="#FFF" />
                 <Text style={styles.sortBtnText}>{isHindi ? 'प्रामाणिक (सच्चा)' : 'AUTHENTIC'}</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState === 'analysis' && (
          <View style={styles.feedbackBox}>
             <Feather 
               name={lastFeedback.isCorrect ? "check-circle" : "x-circle"} 
               size={50} 
               color={lastFeedback.isCorrect ? "#4CAF50" : "#F44336"} 
               style={{ marginBottom: 16 }}
             />
             <Text style={[styles.feedbackTitle, { color: lastFeedback.isCorrect ? '#4CAF50' : '#F44336' }]}>
               {lastFeedback.isCorrect ? (isHindi ? 'सही विश्लेषण' : 'Correct Diagnosis') : (isHindi ? 'गलत' : 'Incorrect')}
             </Text>
             
             <View style={[styles.analysisCard, { backgroundColor: lastFeedback.isBadFaith ? '#F4433622' : '#4CAF5022' }]}>
                <Text style={{ fontWeight: 'bold', color: lastFeedback.isBadFaith ? '#F44336' : '#4CAF50', marginBottom: 8 }}>
                   {lastFeedback.isBadFaith ? (isHindi ? 'स्थिति: बैड फेथ' : 'STATUS: BAD FAITH') : (isHindi ? 'स्थिति: प्रामाणिक' : 'STATUS: AUTHENTIC')}
                </Text>
                <Text style={[styles.feedbackText, { color: textColor }]}>
                  {isHindi ? lastFeedback.analysisHi : lastFeedback.analysisEn}
                </Text>
             </View>

             <TouchableOpacity style={styles.nextBtn} onPress={nextPatient}>
               <Text style={styles.nextBtnText}>{isHindi ? 'अगला रोगी' : 'Next Patient'}</Text>
             </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.feedbackBox}>
             <Feather name="unlock" size={60} color="#FF9800" style={{ marginBottom: 16 }} />
             <Text style={[styles.feedbackTitle, { color: '#FF9800' }]}>
               {isHindi ? 'कट्टरपंथी स्वतंत्रता' : 'Radical Freedom'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? "आपने सफलतापूर्वक बहाने (Bad Faith) और प्रामाणिकता (Authenticity) के बीच अंतर करना सीख लिया है। आप अपने जीवन के एकमात्र लेखक हैं।" 
                 : "You have learned to Pierce the illusion of 'Bad Faith'. You understand that 'Facticity' is out of your control, but your 'Transcendence' is absolute."}
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
  eventText: {
    fontSize: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  analysisCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%'
  },
  feedbackText: {
    fontSize: 15,
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
