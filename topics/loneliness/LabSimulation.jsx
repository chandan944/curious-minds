import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SCENARIOS = [
  {
    sender: "Alex",
    message: "Hey, can't make it to lunch today. Sorry!",
    hyperVigilantThought: "They are avoiding me. They probably hate me.",
    healthyThought: "They are probably just busy with work or personal stuff.",
    options: [
      { text: "Are you mad at me? What did I do?", isHealthy: false, feedback: "This is defensive and needy. It creates the drama the lonely brain fears." },
      { text: "No worries! Let's catch up next week when you're free.", isHealthy: true, feedback: "Perfect. This assumes positive intent and leaves the door open." },
      { text: "Fine. Whatever.", isHealthy: false, feedback: "Passive-aggressive. This pushes them away, fueling the loneliness spiral." }
    ]
  },
  {
    sender: "Group Chat",
    message: "Who wants to go to the movies tonight?",
    hyperVigilantThought: "They only asked the group so they wouldn't have to ask me directly.",
    healthyThought: "They want to hang out and are inviting everyone, including me.",
    options: [
      { text: "(Say nothing/Ignore)", isHealthy: false, feedback: "Avoidance. You feel rejected, so you reject them first. You remain lonely." },
      { text: "I can't go, but you guys have fun without me.", isHealthy: false, feedback: "Martyr syndrome. You are fishing for someone to beg you to come." },
      { text: "I'm in! What time are we meeting?", isHealthy: true, feedback: "Great! You bypassed the hyper-vigilance and accepted the connection." }
    ]
  },
  {
    sender: "Jamie",
    message: "K.",
    hyperVigilantThought: "That period means they are furious. I ruined the friendship.",
    healthyThought: "They are probably driving, walking, or just typing quickly.",
    options: [
      { text: "(Call them immediately to apologize)", isHealthy: false, feedback: "Anxious overreaction. This suffocates the other person." },
      { text: "Is everything okay? You seem annoyed.", isHealthy: false, feedback: "Projecting your own insecurity onto their neutral text." },
      { text: "Cool, see ya later! 😊", isHealthy: true, feedback: "Excellent. You didn't let the 'Hyper-Vigilance' lens distort a neutral interaction." }
    ]
  }
];

export default function LonelinessLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, feedback, won
  const [lastFeedback, setLastFeedback] = useState(null);
  const [connectionLevel, setConnectionLevel] = useState(20); // Starts low
  const [shakeAnim] = useState(new Animated.Value(0));

  const bgColor = isDarkMode ? '#121212' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';
  const bubbleColor = isDarkMode ? '#2C2C2C' : '#E9ECEF';

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleOption = (option) => {
    if (option.isHealthy) {
      setConnectionLevel(prev => Math.min(100, prev + 35));
      setLastFeedback({ success: true, text: isHindi ? "सही चुनाव! (Translation unavailable for feedback detail)" : option.feedback });
    } else {
      triggerShake();
      setConnectionLevel(prev => Math.max(0, prev - 15));
      setLastFeedback({ success: false, text: isHindi ? "यह 'अति-सतर्कता' बोल रही है। (Translation unavailable for feedback detail)" : option.feedback });
    }
    setGameState('feedback');
  };

  const handleNext = () => {
    if (lastFeedback.success) {
      if (currentScenario < SCENARIOS.length - 1) {
        setCurrentScenario(prev => prev + 1);
        setGameState('playing');
      } else {
        setGameState('won');
        if (onComplete) setTimeout(onComplete, 2000);
      }
    } else {
      setGameState('playing'); // Try again
    }
  };

  const scenario = SCENARIOS[currentScenario];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* Connection HUD */}
      <View style={styles.hud}>
        <Text style={[styles.hudText, { color: textColor }]}>
          {isHindi ? 'कनेक्शन/ऑक्सीटोसिन स्तर' : 'Connection/Oxytocin Level:'} {Math.ceil(connectionLevel)}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${connectionLevel}%`, backgroundColor: connectionLevel > 60 ? '#4CAF50' : '#FF9800' }]} />
        </View>
      </View>

      <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
        
        {gameState === 'playing' && (
          <>
            {/* Phone Message Simulation */}
            <View style={styles.phoneHeader}>
              <Feather name="message-circle" size={20} color="#888" />
              <Text style={styles.phoneHeaderText}>{scenario.sender}</Text>
            </View>
            <View style={[styles.messageBubble, { backgroundColor: bubbleColor }]}>
              <Text style={[styles.messageText, { color: textColor }]}>{scenario.message}</Text>
            </View>

            {/* Inner Monologue */}
            <View style={styles.monologueBox}>
              <Text style={styles.monologueTitle}>
                <Feather name="eye" size={14} color="#F44336" /> {isHindi ? 'अकेला दिमाग (अति-सतर्क):' : 'Lonely Brain (Hyper-Vigilance):'}
              </Text>
              <Text style={styles.monologueText}>"{scenario.hyperVigilantThought}"</Text>
            </View>

            <Text style={[styles.instruction, { color: textColor }]}>
              {isHindi ? 'अपनी प्रतिक्रिया चुनें:' : 'Choose your response:'}
            </Text>

            {/* Options */}
            {scenario.options.map((opt, i) => (
              <TouchableOpacity key={i} style={[styles.optionBtn, { borderColor: isDarkMode ? '#444' : '#DDD' }]} onPress={() => handleOption(opt)}>
                <Text style={[styles.optionText, { color: textColor }]}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {gameState === 'feedback' && (
          <View style={styles.centerContent}>
            <Feather 
              name={lastFeedback.success ? "check-circle" : "alert-octagon"} 
              size={64} 
              color={lastFeedback.success ? "#4CAF50" : "#F44336"} 
              style={styles.iconMargin} 
            />
            <Text style={[styles.feedbackTitle, { color: lastFeedback.success ? "#4CAF50" : "#F44336" }]}>
              {lastFeedback.success ? (isHindi ? "जुड़ाव सफल!" : "Connection Maintained!") : (isHindi ? "विनाशकारी व्यवहार!" : "Self-Sabotage!")}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {lastFeedback.text}
            </Text>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: lastFeedback.success ? "#4CAF50" : "#F44336" }]} 
              onPress={handleNext}
            >
              <Text style={styles.btnText}>{isHindi ? 'जारी रखें' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
            <Feather name="heart" size={64} color="#E91E63" style={styles.iconMargin} />
            <Text style={[styles.feedbackTitle, { color: '#E91E63' }]}>
              {isHindi ? 'सर्पिल टूट गया!' : 'The Spiral is Broken!'}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {isHindi 
                ? 'आपने सफलतापूर्वक अपने दिमाग को धोखा देकर सकारात्मक इरादे (Positive Intent) मान लिए। ऐसा करने से, आपने लोगों को अपने करीब आने दिया।' 
                : 'You successfully overrode the lonely brain\'s hyper-vigilance by assuming positive intent. By not acting defensively, you allowed genuine connection to happen.'}
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
    marginBottom: 20,
  },
  hudText: {
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
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 350,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  phoneHeaderText: {
    color: '#888',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '85%',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
  },
  monologueBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 24,
  },
  monologueTitle: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  monologueText: {
    color: '#F44336',
    fontStyle: 'italic',
  },
  instruction: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionBtn: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 15,
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
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
