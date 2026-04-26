import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const CLAIMS = [
  {
    id: 1,
    claim: "There is an invisible, silent, heatless dragon living in my garage.",
    claimHi: "मेरे गैरेज में एक अदृश्य, मूक, और गर्मी रहित ड्रैगन रहता है।",
    type: "unfalsifiable",
    feedback: "Russell's Teapot: A claim that is arranged so it cannot possibly be proven false (unfalsifiable) has zero logical value. Dismissed.",
    feedbackHi: "रसेल की चायदानी: एक ऐसा दावा जिसे किसी भी तरह से 'झूठा' साबित नहीं किया जा सकता, उसका 'शून्य' तार्किक मूल्य होता है। खारिज।"
  },
  {
    id: 2,
    claim: "You can't prove that God doesn't exist!",
    claimHi: "आप साबित नहीं कर सकते कि भगवान मौजूद नहीं है!",
    type: "shifting_burden",
    feedback: "Shifting the Burden: It is not your job to 'prove a negative'. The burden of proof lies on the person saying God DOES exist. Dismissed.",
    feedbackHi: "सबूत का भार टालना: 'नकारात्मक' को साबित करना आपका काम नहीं है। सबूत का भार उस व्यक्ति पर है जो कहता है कि भगवान है। खारिज।"
  },
  {
    id: 3,
    claim: "We don't know how the universe started, so God must have done it.",
    claimHi: "हम नहीं जानते कि ब्रह्मांड कैसे शुरू हुआ, इसलिए भगवान ने ही इसे बनाया होगा।",
    type: "god_of_gaps",
    feedback: "God of the Gaps Fallacy: Using God as a placeholder for 'we don't know yet'. Ignorance is not evidence of a Creator.",
    feedbackHi: "रिक्तियों का ईश्वर (God of the Gaps): 'हम अभी तक नहीं जानते' के लिए भगवान का उपयोग करना अज्ञानता है, निर्माता का प्रमाण नहीं।"
  },
  {
    id: 4,
    claim: "Water boils at 100°C at sea level. Here are my lab notes showing the experiment 50 times.",
    claimHi: "पानी समुद्र तल पर 100°C पर उबलता है। ये रहे मेरे लैब नोट्स जो इस प्रयोग को 50 बार दिखाते हैं।",
    type: "valid",
    feedback: "Accepted! This claim is falsifiable, repeatable, and provides empirical evidence.",
    feedbackHi: "स्वीकृत! यह दावा परीक्षण योग्य, दोहराने योग्य है और अनुभवजन्य साक्ष्य प्रदान करता है।"
  }
];

export default function AtheismLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentClaim, setCurrentClaim] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, feedback, won
  const [lastFeedback, setLastFeedback] = useState(null);
  const [logicScore, setLogicScore] = useState(0);

  // Shake animation for incorrect choices
  const [shakeAnim] = useState(new Animated.Value(0));

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
    ]).start();
  };

  const handleChoice = (action) => { // 'accept' or 'reject'
    const claim = CLAIMS[currentClaim];
    let isCorrect = false;

    if (claim.type === 'valid' && action === 'accept') isCorrect = true;
    if (claim.type !== 'valid' && action === 'reject') isCorrect = true;

    if (isCorrect) {
      setLogicScore(prev => prev + 25);
      setLastFeedback({ 
        success: true, 
        text: isHindi ? claim.feedbackHi : claim.feedback 
      });
    } else {
      triggerShake();
      setLogicScore(Math.max(0, logicScore - 10));
      setLastFeedback({ 
        success: false, 
        text: isHindi ? "तार्किक त्रुटि! बिना सबूत के स्वीकार किया या सबूत को अस्वीकार किया।" : "Logical Error! You accepted a claim without evidence or rejected a valid one." 
      });
    }

    setGameState('feedback');
  };

  const nextStep = () => {
    if (lastFeedback.success) {
      if (currentClaim < CLAIMS.length - 1) {
        setCurrentClaim(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('won');
        if (onComplete) setTimeout(onComplete, 2000);
      }
    } else {
      setGameState('playing'); // Try again
    }
  };

  const claim = CLAIMS[currentClaim];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD Tracker */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'तर्कसंगतता (Logic Ratio):' : 'Logical Rigor:'} {logicScore}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${logicScore}%`, backgroundColor: '#2196F3' }]} />
        </View>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
        
        {gameState === 'playing' && (
          <View>
            <View style={styles.scaleHeader}>
              <Feather name="anchor" size={24} color="#FF9800" />
              <Text style={[styles.scaleTitle, { color: textColor }]}>
                {isHindi ? 'सबूत का भार' : 'The Burden of Proof'}
              </Text>
            </View>

            <View style={styles.claimBox}>
              <Text style={styles.claimTag}>{isHindi ? 'दावा (Claim)' : 'CLAIM'}</Text>
              <Text style={styles.claimText}>"{isHindi ? claim.claimHi : claim.claim}"</Text>
            </View>

            <Text style={[styles.instruction, { color: textColor }]}>
              {isHindi ? 'क्या इस दावे में साक्ष्य (Evidence) का भार है?' : 'Does this claim meet the burden of proof?'}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleChoice('reject')}>
                <Feather name="x-circle" size={20} color="#FFF" />
                <Text style={styles.btnText}>{isHindi ? 'खारिज करें' : 'Reject (Demand Proof)'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleChoice('accept')}>
                <Feather name="check-circle" size={20} color="#FFF" />
                <Text style={styles.btnText}>{isHindi ? 'स्वीकार करें' : 'Accept Claim'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState === 'feedback' && (
          <View style={styles.centerContent}>
            <Feather 
              name={lastFeedback.success ? "check-circle" : "alert-circle"} 
              size={64} 
              color={lastFeedback.success ? "#4CAF50" : "#F44336"} 
              style={styles.iconMargin} 
            />
            <Text style={[styles.feedbackTitle, { color: lastFeedback.success ? "#4CAF50" : "#F44336" }]}>
              {lastFeedback.success ? (isHindi ? "तार्किक रूप से वैध!" : "Logically Valid!") : (isHindi ? "अनुचित निर्णय!" : "Unjustified!")}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
               {lastFeedback.text}
            </Text>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: lastFeedback.success ? "#4CAF50" : "#F44336" }]} 
              onPress={nextStep}
            >
              <Text style={styles.btnText}>{isHindi ? 'जारी रखें' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
             <Feather name="shield" size={64} color="#00BCD4" style={styles.iconMargin} />
             <Text style={[styles.feedbackTitle, { color: '#00BCD4' }]}>
               {isHindi ? 'बौद्धिक ईमानदारी (Intellectual Honesty)' : 'Intellectual Honesty'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? 'आपने बिना सबूत के किए गए दावों को खारिज कर दिया। नास्तिकता यही है: असाधारण दावों के लिए असाधारण साक्ष्य की मांग करना।' 
                 : 'You correctly rejected baseless claims while accepting empirical ones. Atheism is not a counter-claim; it is simply the demand for evidence.'}
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
    marginBottom: 8,
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
    minHeight: 350,
  },
  scaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center'
  },
  scaleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  claimBox: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 24,
  },
  claimTag: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  claimText: {
    color: '#E3F2FD',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  instruction: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12
  },
  actionBtn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
  },
  btnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    flex: 1,
  },
  iconMargin: {
    marginBottom: 24,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    width: '80%',
    alignItems: 'center',
  }
});
