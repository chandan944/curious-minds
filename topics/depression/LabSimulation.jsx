import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, Easing, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MAX_ENERGY = 100;
const START_ENERGY = 60;
const DRAIN_RATE = 2; // Energy drains per tick

// Translated Scenarios
const SCENARIOS = [
  {
    distortion_en: "Mind Reading", distortion_hi: "माइंड रीडिंग (मन पढ़ना)",
    thought_en: "My friend canceled our plans. They secretly hate me.",
    thought_hi: "मेरे दोस्त ने प्लान कैंसिल कर दिया। वे अंदर ही अंदर मुझसे नफरत करते हैं।",
    options: [
      { text_en: "They probably found something better to do.", text_hi: "शायद उन्हें कोई बेहतर काम मिल गया है।", correct: false, energyEffect: -15 },
      { text_en: "They might just be tired. I should ask if they're okay.", text_hi: "शायद वे थके हुए हों। मुझे पूछना चाहिए कि क्या वे ठीक हैं।", correct: true, energyEffect: 25 },
      { text_en: "I'll just never make plans with them again.", text_hi: "मैं अब उनके साथ कभी कोई प्लान नहीं बनाऊंगा।", correct: false, energyEffect: -10 }
    ],
    truth_en: "You can't read minds. Canceling plans is often about the other person's energy, not your worth.",
    truth_hi: "आप मन नहीं पढ़ सकते। प्लान कैंसिल करना अक्सर दूसरे व्यक्ति की ऊर्जा पर निर्भर करता है, आपकी अहमियत पर नहीं।"
  },
  {
    distortion_en: "Catastrophizing", distortion_hi: "विनाशकारी सोच",
    thought_en: "I made a mistake at work. I'm going to get fired and lose everything.",
    thought_hi: "मुझसे काम पर एक गलती हो गई। मुझे निकाल दिया जाएगा और मैं सब कुछ खो दूंगा।",
    options: [
      { text_en: "I need to start looking for a new job today.", text_hi: "मुझे आज ही नई नौकरी खोजना शुरू कर देना चाहिए।", correct: false, energyEffect: -15 },
      { text_en: "Everyone makes mistakes. I will learn from this and fix it.", text_hi: "गलतियां सबसे होती हैं। मैं इससे सीखूंगा और इसे ठीक करूंगा।", correct: true, energyEffect: 25 },
      { text_en: "I am a total failure.", text_hi: "मैं पूरी तरह से असफल इंसान हूं।", correct: false, energyEffect: -20 }
    ],
    truth_en: "Catastrophizing jumps to the worst possible outcome. Reality is usually much more forgiving.",
    truth_hi: "विनाशकारी सोच आपको सबसे बुरे परिणाम की कल्पना कराती है। असल जिंदगी अक्सर कहीं अधिक क्षमाशील होती है।"
  },
  {
    distortion_en: "All-Or-Nothing", distortion_hi: "सब-कुछ या कुछ-नहीं की सोच",
    thought_en: "I didn't exercise today. The whole day is ruined and I'm lazy.",
    thought_hi: "मैंने आज व्यायाम नहीं किया। पूरा दिन बर्बाद हो गया और मैं आलसी हूं।",
    options: [
      { text_en: "I might not have exercised, but I still got some work done.", text_hi: "भले ही मैंने व्यायाम नहीं किया, लेकिन मैंने अपना कुछ काम तो किया है।", correct: true, energyEffect: 25 },
      { text_en: "I'll just eat junk food since today is ruined anyway.", text_hi: "मैं जंक फूड खा लेता हूं क्योंकि आज का दिन वैसे भी बर्बाद हो चुका है।", correct: false, energyEffect: -15 },
      { text_en: "I'll never get into shape. It's pointless.", text_hi: "मैं कभी फिट नहीं हो पाऊंगा। यह सब बेकार है।", correct: false, energyEffect: -20 }
    ],
    truth_en: "Life isn't black and white. Missing one habit doesn't erase your other achievements.",
    truth_hi: "जीवन केवल सफेद या काला नहीं है। एक आदत चूकने से आपकी बाकी उपलब्धियां खत्म नहीं होतीं।"
  },
  {
    distortion_en: "Personalization", distortion_hi: "व्यक्तिगतकरण",
    thought_en: "They didn't text back immediately. I must have said something annoying.",
    thought_hi: "उन्होंने तुरंत मैसेज का जवाब नहीं दिया। मैंने जरूर कुछ परेशान करने वाला कहा होगा।",
    options: [
      { text_en: "They are probably just busy or their phone is away.", text_hi: "वे शायद व्यस्त होंगे या उनका फोन दूर होगा।", correct: true, energyEffect: 25 },
      { text_en: "I should text them again and apologize.", text_hi: "मुझे उन्हें फिर से मैसेज करके माफी मांगनी चाहिए।", correct: false, energyEffect: -10 },
      { text_en: "Nobody ever wants to talk to me.", text_hi: "मुझसे कोई बात करना ही नहीं चाहता।", correct: false, energyEffect: -15 }
    ],
    truth_en: "Personalization makes you take the blame for things entirely out of your control.",
    truth_hi: "व्यक्तिगतकरण आपको उन चीजों के लिए खुद को दोषी मानने पर मजबूर करता है जो पूरी तरह से आपके नियंत्रण से बाहर हैं।"
  },
  {
    distortion_en: "Emotional Reasoning", distortion_hi: "भावनात्मक तर्क",
    thought_en: "I feel incredibly guilty right now, so I must be a terrible person.",
    thought_hi: "मुझे इस वक्त बहुत अपराधबोध हो रहा है, इसलिए मैं जरूर एक भयानक इंसान हूं।",
    options: [
      { text_en: "I deserve to feel this way.", text_hi: "मैं ऐसा ही महसूस करने के लायक हूं।", correct: false, energyEffect: -20 },
      { text_en: "I'm a toxic person.", text_hi: "मैं एक जहरीला (टॉक्सिक) इंसान हूं।", correct: false, energyEffect: -15 },
      { text_en: "Feelings aren't facts. Why exactly do I feel guilty?", text_hi: "भावनाएं तथ्य नहीं होतीं। मुझे असल में अपराधबोध क्यों हो रहा है?", correct: true, energyEffect: 25 }
    ],
    truth_en: "Emotional reasoning assumes that because you feel a negative emotion, it must reflect reality.",
    truth_hi: "भावनात्मक तर्क यह मान लेता है कि अगर आप कोई नकारात्मक भावना महसूस करते हैं, तो वह सच्चाई ही होगी।"
  }
];

export default function DepressionLab({ onComplete, isScientistMode, isHindi }) {
  const { theme, isDark } = useTheme();
  
  const [energy, setEnergy] = useState(START_ENERGY); 
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, feedback, gameover, won
  const [feedback, setFeedback] = useState(null);
  
  // Animated Values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const energyAnim = useRef(new Animated.Value(START_ENERGY)).current;
  const lightAnim = useRef(new Animated.Value(0)).current; // 0 = dark cloud, 1 = bright light

  // ── Core Loop (The Black Dog Drain) ──
  useEffect(() => {
    let drainInterval;
    if (gameState === 'playing') {
      drainInterval = setInterval(() => {
        setEnergy(prev => {
          const newEnergy = prev - DRAIN_RATE;
          if (newEnergy <= 0) {
            clearInterval(drainInterval);
            handleGameOver();
            return 0;
          }
          return newEnergy;
        });
      }, 1000); // drain every second
    }
    return () => clearInterval(drainInterval);
  }, [gameState]);

  // Sync Animated Energy
  useEffect(() => {
    Animated.timing(energyAnim, {
      toValue: energy,
      duration: 500,
      useNativeDriver: false
    }).start();

    // Map energy (0-100) to lightAnim (0-1)
    Animated.timing(lightAnim, {
      toValue: Math.max(0, Math.min(1, energy / 100)),
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();

    if (energy >= MAX_ENERGY && gameState !== 'won') {
      setGameState('won');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (onComplete) setTimeout(onComplete, 4000);
    }
  }, [energy]);

  const handleGameOver = () => {
    setGameState('gameover');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
    ]).start();
  };

  const handleOptionSelect = (option) => {
    const newEnergy = Math.min(Math.max(energy + option.energyEffect, 0), MAX_ENERGY);
    setEnergy(newEnergy);
    
    if (option.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback({
        title_en: 'Beautiful Reframe!', title_hi: 'शानदार रीफ्रेम!',
        message_en: SCENARIOS[currentScenarioIndex].truth_en,
        message_hi: SCENARIOS[currentScenarioIndex].truth_hi,
        isSuccess: true
      });
    } else {
      triggerShake();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setFeedback({
        title_en: "That's the Depression Talking", title_hi: 'यह अवसाद बोल रहा है',
        message_en: `This is '${SCENARIOS[currentScenarioIndex].distortion_en}'. The thought drained your energy.`,
        message_hi: `यह '${SCENARIOS[currentScenarioIndex].distortion_hi}' है। इस विचार ने आपकी ऊर्जा खींच ली।`,
        isSuccess: false
      });
    }
    setGameState('feedback');
  };

  const handleNext = () => {
    if (feedback.isSuccess) {
      if (currentScenarioIndex < SCENARIOS.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
        setGameState('playing');
      } else {
        setEnergy(MAX_ENERGY); // Force win state
      }
    } else {
      // If wrong, they must try again, energy keeps draining from where it left off
      if (energy <= 0) handleGameOver();
      else setGameState('playing'); 
    }
  };

  const restartLab = () => {
    setEnergy(START_ENERGY);
    setCurrentScenarioIndex(0);
    setGameState('playing');
  };

  const scenario = SCENARIOS[currentScenarioIndex];

  // Colors Interpolation for Background Visualizer
  const bgDark = '#0a0f1c'; // Deep depressive blue-black
  const bgCloud = '#1c2538'; // Heavy cloud color
  const bgLight = theme.accent.gold; // Sunlight breakthrough

  const overlayBg1 = lightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bgDark, '#2c3e50']
  });

  const overlayBg2 = lightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [bgCloud, '#4ca1af', bgLight]
  });

  const energyColor = energy > 60 ? '#4CAF50' : energy > 30 ? theme.accent.gold : '#FF4D6D';

  return (
    <View style={[styles.root, { backgroundColor: theme.bg.base }]}>
      
      {/* ── Visual Metaphor: The Cloud vs The Light ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: overlayBg1, transform: [{ translateX: shakeAnim }] }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.8 }]}>
           {/* We use a simple Animated View wrapping a LinearGradient since we can't easily animate gradient stops directly in RN without reanimated.
               We overlay two colors and fade them. */}
           <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: overlayBg2, opacity: lightAnim }]} />
        </Animated.View>
        
        {/* Subtle noise/texture overlay for the cloud */}
        <View style={styles.noiseOverlay} />
      </Animated.View>

      {/* ── Energy "Spoons" HUD ── */}
      <View style={styles.hudArea}>
        <View style={styles.hudLabelRow}>
          <Feather name="battery" size={20} color={energyColor} />
          <Text style={[styles.hudLabel, { color: '#FFF' }]}>
            {isHindi ? 'मानसिक ऊर्जा (Spoons):' : 'Mental Energy (Spoons):'} {Math.ceil(energy)}%
          </Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Animated.View style={[styles.barFill, { 
              width: energyAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), 
              backgroundColor: energyColor 
            }]} 
          />
        </View>
      </View>

      {/* ── Main Content Area ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.glassCard, { backgroundColor: 'rgba(25,30,45,0.7)', borderColor: 'rgba(255,255,255,0.1)' }]}>
          
          {gameState === 'playing' && (
            <>
              <View style={styles.thoughtBox}>
                <Feather name="cloud-rain" size={24} color="#A0AAB5" style={{ marginBottom: 12 }} />
                <Text style={[styles.distortionLabel, { color: theme.accent.gold }]}>
                  {isHindi ? scenario.distortion_hi : scenario.distortion_en}
                </Text>
                <Text style={styles.thoughtText}>
                  "{isHindi ? scenario.thought_hi : scenario.thought_en}"
                </Text>
              </View>
              
              <Text style={styles.instructionText}>
                {isHindi ? 'इस अस्वस्थ विचार को चुनौती दें (समय बीत रहा है):' : 'Challenge this dark thought (time is draining):'}
              </Text>
              
              <View style={styles.optionsWrap}>
                {scenario.options.map((opt, idx) => (
                  <Pressable 
                    key={idx} 
                    style={({pressed}) => [
                      styles.optionBtn, 
                      { 
                        backgroundColor: pressed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        borderColor: pressed ? theme.accent.gold : 'rgba(255,255,255,0.1)'
                      }
                    ]}
                    onPress={() => handleOptionSelect(opt)}
                  >
                    <Text style={styles.optionText}>{isHindi ? opt.text_hi : opt.text_en}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {gameState === 'feedback' && feedback && (
            <View style={styles.feedbackWrap}>
              <Feather 
                name={feedback.isSuccess ? 'sun' : 'cloud-lightning'} 
                size={54} 
                color={feedback.isSuccess ? theme.accent.gold : '#FF4D6D'} 
                style={{ marginBottom: 20 }}
              />
              <Text style={[styles.feedbackTitle, { color: feedback.isSuccess ? theme.accent.gold : '#FF4D6D' }]}>
                {isHindi ? feedback.title_hi : feedback.title_en}
              </Text>
              <Text style={styles.feedbackMessage}>
                {isHindi ? feedback.message_hi : feedback.message_en}
              </Text>
              <Pressable 
                style={({pressed}) => [
                  styles.continueBtn, 
                  { backgroundColor: feedback.isSuccess ? theme.accent.gold : '#FF4D6D', opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={handleNext}
              >
                <Text style={styles.continueBtnText}>
                  {feedback.isSuccess 
                    ? (isHindi ? 'आगे बढ़ें' : 'CONTINUE') 
                    : (isHindi ? 'पुनः प्रयास करें' : 'TRY AGAIN')}
                </Text>
              </Pressable>
            </View>
          )}

          {gameState === 'gameover' && (
            <View style={styles.feedbackWrap}>
              <Feather name="zap-off" size={54} color="#FF4D6D" style={{ marginBottom: 20 }} />
              <Text style={[styles.feedbackTitle, { color: '#FF4D6D' }]}>
                {isHindi ? 'ऊर्जा समाप्त' : 'ENERGY DEPLETED'}
              </Text>
              <Text style={styles.feedbackMessage}>
                {isHindi 
                  ? 'अवसाद के भारीपन ने आपकी सारी मानसिक ऊर्जा खत्म कर दी है। यह आपकी गलती नहीं है। जब आप तैयार हों, तो आराम करें और फिर से कोशिश करें।' 
                  : "The weight of the depression drained all your spoons. It happens, and it's not your fault. Rest, and try again when you're ready."}
              </Text>
              <Pressable 
                style={({pressed}) => [styles.continueBtn, { backgroundColor: '#FF4D6D', opacity: pressed ? 0.8 : 1 }]}
                onPress={restartLab}
              >
                <Text style={styles.continueBtnText}>{isHindi ? 'पुनः प्रयास करें' : 'RESTART BATTLE'}</Text>
              </Pressable>
            </View>
          )}

          {gameState === 'won' && (
            <View style={styles.feedbackWrap}>
              <Feather name="sun" size={64} color={theme.accent.gold} style={{ marginBottom: 20 }} />
              <Text style={[styles.feedbackTitle, { color: theme.accent.gold }]}>
                {isHindi ? 'कोहरा छंट रहा है!' : 'THE FOG IS LIFTING!'}
              </Text>
              <Text style={styles.feedbackMessage}>
                {isHindi 
                  ? 'आपने अपनी ऊर्जा बचाई और अवसाद के झूठ को तार्किक विचारों से सफलतापूर्वक चुनौती दी। आपने अंधेरे को पीछे धकेल दिया है। यही न्यूरोप्लास्टिसिटी है!' 
                  : 'You successfully defended your energy and rewired those negative pathways using CBT principles. You pushed back the dark cloud. This is neuroplasticity in action!'}
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Scientist Mode ── */}
      {isScientistMode && (
        <View style={styles.sciPanel}>
          <Text style={styles.sciText}>State: {gameState}</Text>
          <Text style={styles.sciText}>Drain Rate: {DRAIN_RATE}/sec</Text>
          <Text style={styles.sciText}>Energy: {energy}</Text>
          <Text style={styles.sciText}>Scenario: {currentScenarioIndex + 1}/{SCENARIOS.length}</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingBottom: 100 },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  
  hudArea: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    zIndex: 10
  },
  hudLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  hudLabel: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  barTrack: {
    height: 12,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },

  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center'
  },
  glassCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },

  thoughtBox: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  distortionLabel: {
    fontFamily: FONTS.displayBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm
  },
  thoughtText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    lineHeight: 28,
    color: '#FFF',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  instructionText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: '#A0AAB5',
    textAlign: 'center',
    marginBottom: SPACING.md
  },

  optionsWrap: { gap: SPACING.sm },
  optionBtn: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  optionText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 22,
    color: '#FFF'
  },

  feedbackWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.md
  },
  feedbackTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  feedbackMessage: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: SPACING.xl
  },
  continueBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: RADIUS.full,
  },
  continueBtnText: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 1
  },

  sciPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8
  },
  sciText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: '#0F0'
  }
});
