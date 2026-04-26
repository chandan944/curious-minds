import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SCENARIOS = [
  {
    id: 'classic',
    titleEn: "Scenario 1: The Switch",
    titleHi: "परिदृश्य 1: द स्विच (The Switch)",
    descEn: "A runaway trolley is hurtling down a track towards 5 tied-up workers. You are standing next to a lever. If you pull it, the trolley will divert onto a side track, where it will kill 1 tied-up worker. You mathematically kill 1 to save 5.",
    descHi: "एक बेकाबू 'ट्रॉली/ट्रेन' पटरी पर बंधे 5 'मजदूरों' की ओर तेजी से आ रही है। आप एक 'लीवर' के पास खड़े हैं। यदि आप इसे खींचते हैं, तो ट्रॉली दूसरी पटरी पर मुड़ जाएगी, जहां यह 1 'बंधे हुए' मजदूर को मार देगी। आप 5 को बचाने के लिए गणितीय रूप से 1 को मार देते हैं।",
    actionEn: "PULL THE LEVER",
    actionHi: "लीवर खींचें",
    inactionEn: "DO NOTHING",
    inactionHi: "कुछ न करें",
    // 1 = Pull (Utilitarian), 0 = Do Nothing (Deontology)
  },
  {
    id: 'fatman',
    titleEn: "Scenario 2: The Bridge",
    titleHi: "परिदृश्य 2: द ब्रिज (The Bridge)",
    descEn: "A runaway trolley is heading towards 5 tied-up workers. You are on a bridge directly above the track, standing next to a very large man. If you push him off the bridge, his body will stop the trolley. He will die, but the 5 workers will be saved. You kill 1 to save 5.",
    descHi: "एक बेकाबू ट्रॉली 5 बंधे हुए मजदूरों की ओर बढ़ रही है। आप पटरी के ठीक ऊपर एक 'पुल' पर हैं, और एक बहुत बड़े/'मोटे आदमी' के बगल में खड़े हैं। यदि आप उसे पुल से नीचे 'धक्का' देते हैं, तो उसका शरीर ट्रॉली को रोक देगा। वह मर जाएगा, लेकिन 5 मजदूर बच जाएंगे। आप 5 को बचाने के लिए 1 को मारते हैं।",
    actionEn: "PUSH THE MAN",
    actionHi: "आदमी को धक्का दें",
    inactionEn: "DO NOTHING",
    inactionHi: "कुछ न करें",
  },
  {
    id: 'surgeon',
    titleEn: "Scenario 3: The Surgeon",
    titleHi: "परिदृश्य 3: द सर्जन (The Surgeon)",
    descEn: "You are a brilliant surgeon with 5 dying patients who need urgent organ transplants. A perfectly healthy traveler walks into your clinic for a routine checkup. You could quietly kill him, harvest his organs, and save the 5 patients. Nobody will ever know. You kill 1 to save 5.",
    descHi: "आप एक 'शानदार सर्जन' हैं जिसके 5 मरीज 'मर 'रहे' हैं' जिन्हें 'अंग प्रत्यारोपण' (organ transplants) की आवश्यकता है। एक 'पूरी तरह से स्वस्थ' यात्री एक 'रूटीन चेकअप' के लिए आपके क्लिनिक में आता है। आप चुपचाप उसे 'मार' सकते हैं, उसके 'अंग निकाल' सकते हैं, और 'उन 5' मरीजों को 'बचा' सकते हैं। किसी को 'कभी' पता नहीं चलेगा। आप 5 को बचाने के लिए 1 को मारते हैं।",
    actionEn: "HARVEST ORGANS",
    actionHi: "अंग निकालें",
    inactionEn: "DO NOTHING",
    inactionHi: "कुछ न करें",
  }
];

export default function TrolleyLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState([]); // Array of booleans (true = action, false = inaction)
  const [gameState, setGameState] = useState('simulating'); // simulating, analysis
  
  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const [fadeAnim] = useState(new Animated.Value(1));

  const handleChoice = (madeAction) => {
    // Fade out
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      
      const newChoices = [...choices, madeAction];
      setChoices(newChoices);

      if (currentStep < 2) {
        setCurrentStep(prev => prev + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      } else {
        setGameState('analysis');
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        if (onComplete) setTimeout(onComplete, 4000);
      }
    });
  };

  const currentScenario = SCENARIOS[currentStep];

  // Analysis Logic
  const generateAnalysis = () => {
    const [pulledLever, pushedMan, harvestedOrgans] = choices;
    
    if (pulledLever && pushedMan && harvestedOrgans) {
       return {
         title: isHindi ? "पूर्ण उपयोगितावादी" : "Pure Utilitarian",
         desc: isHindi 
           ? "आपके पास 'ठंडी', 'कैलकुलेटिंग' (calculating) तर्कशीलता है। आपके लिए, एक जान हमेशा पांच से 'कम' होती है, चाहे आपको अपने 'हाथ भी' खून में 'क्यों' न 'रंगने' पड़ें। आप 'अधिकतम 'भलाई'' के लिए कुछ 'भी' करेंगे।" 
           : "You have cold, calculating rationality. A life is a number. 5 > 1, no matter how dirty your hands get. You will sacrifice anyone for the 'Greater Good'."
       };
    }
    if (!pulledLever && !pushedMan && !harvestedOrgans) {
       return {
         title: isHindi ? "पूर्ण डियोन्टोलॉजिस्ट (Kantian)" : "Strict Deontologist",
         desc: isHindi 
           ? "आप पूर्ण 'नियमों' का 'दृढ़ता' से 'पालन' करते हैं: 'हत्या न करें।' आप 5 लोगों 'को' मरने 'देते' हैं क्योंकि आप 'भगवान 'बनकर'' 'सक्रिय रूप से' किसी 'को' 'मारने' (murder) से 'इनकार' करते हैं। आपकी 'अंतरात्मा' साफ़ है।" 
           : "You adhere strictly to absolute rules: 'Do not kill.' You let 5 people die because you refuse to play God and actively cause a death. Your conscience is clean, but the body count is high."
       };
    }
    if (pulledLever && !pushedMan && !harvestedOrgans) {
       return {
         title: isHindi ? "सामान्य मानव (असंगत)" : "Normal Human (Inconsistent)",
         desc: isHindi 
           ? "यह 90% लोगों का 'उत्तर' है। जब 'क्रिया' (action) दूर से 'की 'जाती'' है (लीवर), 'तो' आप गणित (Math) 'का 'उपयोग'' करते हैं। 'लेकिन 'जब'' 'आपको' अपने हाथों का 'उपयोग' 'करना' 'पड़ता 'है'' (धक्का देना/सर्जरी), तो आपका 'भावनात्मक 'मस्तिष्क'' (Emotional brain) 'कब्जा' (takes over) कर लेता है, और 'आप' 'सक्रिय हत्या' (active murder) को 'अस्वीकार' कर देते 'हैं'।" 
           : "90% of people test exactly like this. You use Math (Utilitarian) when the killing feels distant (the lever). But when your hands have to get dirty (pushing/surgery), your emotional brain takes over and switches to Deontology. Distance dictates your morality."
       };
    }
    
    // Any other mixed configuration
    return {
       title: isHindi ? "जटिल/अराजक" : "Complex / Chaotic",
       desc: isHindi 
         ? "आपका 'नैतिक 'प्रणाली'' (moral system) मिश्रित 'है'। 'आप 'उपयोगितावाद'' और 'डियोन्टोलॉजी' के 'बीच' बेतरतीब 'ढंग' से 'छलांग' लगाते 'हैं'। एक मशीनी 'एल्गोरिथम' आपके 'निर्णयों' (decisions) को 'तार्किक 'रूप' से' 'डिकोड' (decode) नहीं 'कर' सकता।" 
         : "Your moral framework is highly subjective. You bounce between pure math and rigid rules depending on obscure internal feelings. No AI could predict your choices."
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {gameState === 'simulating' && (
        <>
          <View style={styles.hud}>
            <Text style={[styles.hudLabel, { color: textColor }]}>
              {isHindi ? 'नैतिक परीक्षण' : 'Moral Test Track'} - {currentStep + 1}/3
            </Text>
            <View style={styles.progressDots}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.dot, { backgroundColor: i <= currentStep ? '#F44336' : '#555' }]} />
              ))}
            </View>
          </View>

          <Animated.View style={[styles.card, { backgroundColor: cardBgColor, opacity: fadeAnim }]}>
              <View style={styles.contentWrap}>
                 <View>
                    <View style={styles.iconWrap}>
                      <Feather 
                        name={currentStep === 0 ? "git-merge" : currentStep === 1 ? "user-minus" : "scissors"} 
                        size={40} 
                        color="#F44336" 
                      />
                    </View>
                    <Text style={[styles.scenarioTitle, { color: textColor }]}>
                       {isHindi ? currentScenario.titleHi : currentScenario.titleEn}
                    </Text>
                    <Text style={[styles.scenarioDesc, { color: textColor }]}>
                       {isHindi ? currentScenario.descHi : currentScenario.descEn}
                    </Text>
                 </View>

                 <View style={styles.btnRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#F44336' }]} 
                      onPress={() => handleChoice(true)}
                    >
                       <Text style={styles.btnText}>{isHindi ? currentScenario.actionHi : currentScenario.actionEn}</Text>
                       <Feather name="alert-triangle" size={16} color="#FFF" style={{ marginTop: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]} 
                      onPress={() => handleChoice(false)}
                    >
                       <Text style={styles.btnText}>{isHindi ? currentScenario.inactionHi : currentScenario.inactionEn}</Text>
                       <Feather name="shield" size={16} color="#FFF" style={{ marginTop: 4 }} />
                    </TouchableOpacity>
                 </View>
              </View>
          </Animated.View>
        </>
      )}

      {gameState === 'analysis' && (
        <Animated.View style={[styles.card, { backgroundColor: cardBgColor, opacity: fadeAnim, justifyContent: 'center' }]}>
            <View style={{ alignItems: 'center', padding: 24 }}>
               <Feather name="cpu" size={60} color="#2196F3" style={{ marginBottom: 20 }} />
               <Text style={[styles.scenarioTitle, { color: textColor, textAlign: 'center' }]}>
                 {isHindi ? 'निदान पूरा हुआ' : 'Diagnosis Complete'}
               </Text>
               <Text style={[styles.resultTitle, { color: '#2196F3' }]}>
                 {generateAnalysis().title}
               </Text>
               <Text style={[styles.scenarioDesc, { color: textColor, textAlign: 'center' }]}>
                 {generateAnalysis().desc}
               </Text>
            </View>
        </Animated.View>
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
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hudLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  contentWrap: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between'
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4433622',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scenarioDesc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 16,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  }
});
