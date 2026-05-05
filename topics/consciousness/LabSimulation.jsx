import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const TASKS = [
  {
    id: 1,
    inputSymbol: "你好",
    options: [
      { rule: "If 你好 -> Pick 谢谢", symbol: "谢谢", isCorrect: false },
      { rule: "If 你好 -> Pick 🍔", symbol: "🍔", isCorrect: false },
      { rule: "If 你好 -> Pick 你好吗", symbol: "你好吗", isCorrect: true } // "How are you?"
    ]
  },
  {
    id: 2,
    inputSymbol: "多少钱", // How much is it?
    options: [
      { rule: "If 多少钱 -> Pick 五块", symbol: "五块", isCorrect: true }, // Five bucks
      { rule: "If 多少钱 -> Pick 苹果", symbol: "苹果", isCorrect: false },
      { rule: "If 多少钱 -> Pick 再见", symbol: "再见", isCorrect: false }
    ]
  },
  {
    id: 3,
    inputSymbol: "我爱你", // I love you
    options: [
      { rule: "If 我爱你 -> Pick 我恨你", symbol: "我恨你", isCorrect: false },
      { rule: "If 我爱你 -> Pick 机器人", symbol: "机器人", isCorrect: false },
      { rule: "If 我爱你 -> Pick 我也爱你", symbol: "我也爱你", isCorrect: true } // I love you too
    ]
  }
];

export default function ConsciousnessLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentTask, setCurrentTask] = useState(0);
  const [gameState, setGameState] = useState('intro'); // intro, playing, reveal
  const [shakeAnim] = useState(new Animated.Value(0));

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleSelection = (isCorrect) => {
    if (!isCorrect) {
      triggerShake();
      return;
    }

    if (currentTask < TASKS.length - 1) {
      setCurrentTask(prev => prev + 1);
    } else {
      setGameState('reveal');
      if (onComplete) setTimeout(onComplete, 6000);
    }
  };

  const current = TASKS[currentTask];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {gameState === 'intro' && (
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
           <Feather name="box" size={60} color="#E91E63" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: textColor }]}>
             {isHindi ? 'द चाइनीज़ रूम' : 'The Chinese Room'}
           </Text>
           <Text style={[styles.desc, { color: textColor }]}>
             {isHindi 
               ? "आप एक कमरे में बंद हैं। आप एक शब्द भी चीनी (Chinese) भाषा नहीं जानते। बाहर के लोग आपको चीनी प्रतीक (Symbols) भेजेंगे। आपको बस 'नियम-पुस्तिका' (Rulebook) का उपयोग करके सही उत्तर खोजना है और उसे वापस भेजना है। क्या आप उन्हें मना सकते हैं कि आप चीनी बोलते हैं?" 
               : "You are locked in a room. You do not know a single word of Chinese. People outside will pass you Chinese symbols. You must simply use the 'Rulebook' to find the correct matching symbol to send back. Can you convince them you speak Chinese?"}
           </Text>
           <TouchableOpacity 
             style={[styles.btn, { backgroundColor: '#E91E63' }]} 
             onPress={() => setGameState('playing')}
           >
             <Text style={styles.btnText}>{isHindi ? 'रूलबुक स्वीकार करें' : 'ACCEPT RULEBOOK'}</Text>
           </TouchableOpacity>
        </View>
      )}

      {gameState === 'playing' && (
        <Animated.View style={[styles.card, { backgroundColor: cardBgColor, transform: [{ translateX: shakeAnim }] }]}>
           
           <View style={styles.headerRow}>
              <Text style={[styles.label, { color: '#E91E63' }]}>
                {isHindi ? 'इनकमिंग मैसेज:' : 'INCOMING MESSAGE:'}
              </Text>
              <Text style={[styles.counter, { color: textColor }]}>{currentTask + 1} / {TASKS.length}</Text>
           </View>

           <View style={styles.inputBox}>
              <Text style={styles.symbolText}>{current.inputSymbol}</Text>
           </View>

           <Text style={[styles.label, { color: textColor, marginTop: 24, marginBottom: 16 }]}>
              {isHindi ? 'अपनी नियम-पुस्तिका (Rulebook) खोजें:' : 'SEARCH YOUR RULEBOOK:'}
           </Text>

           <View style={styles.optionsWrap}>
             {current.options.map((opt, idx) => (
               <TouchableOpacity 
                 key={idx} 
                 style={[styles.optionBtn, { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' }]}
                 onPress={() => handleSelection(opt.isCorrect)}
               >
                 <Text style={[styles.ruleText, { color: textColor }]}>{opt.rule}</Text>
                 <View style={[styles.sendBtn, { backgroundColor: '#E91E63' }]}>
                    <Text style={styles.sendText}>{isHindi ? 'भेजें (SEND)' : 'SEND'}</Text>
                 </View>
               </TouchableOpacity>
             ))}
           </View>
        </Animated.View>
      )}

      {gameState === 'reveal' && (
        <ScrollView style={[styles.card, { backgroundColor: cardBgColor }]} contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
           <Feather name="cpu" size={60} color="#4CAF50" style={{ marginBottom: 20 }} />
           <Text style={[styles.title, { color: textColor, textAlign: 'center' }]}>
             {isHindi ? 'बधाई हो, आपने ट्यूरिंग टेस्ट पास कर लिया!' : 'CONGRATULATIONS, YOU PASSED THE TURING TEST!'}
           </Text>
           
           <View style={[styles.textBox, { backgroundColor: '#4CAF5022' }]}>
              <Text style={[styles.bodyText, { color: textColor }]}>
                {isHindi 
                  ? "कमरे के बाहर मौजूद इंसान को 100% यकीन हो गया है कि आप चीनी (Chinese) में पूरी तरह से पारंगत हैं।" 
                  : "The human outside the room is 100% convinced that you are completely fluent in Chinese."}
              </Text>
           </View>

           <View style={{ width: '100%', height: 1, backgroundColor: isDarkMode ? '#444' : '#E0E0E0', marginVertical: 20 }} />

           <Text style={[styles.title, { color: '#F44336', marginTop: 24 }]}>
             {isHindi ? 'लेकिन... क्या आपने सच में समझा?' : 'BUT... DID YOU REALLY UNDERSTAND?'}
           </Text>

           <Text style={[styles.bodyText, { color: textColor, marginTop: 16 }]}>
             {isHindi 
               ? "अपने खुद के अनुभव के बारे में सोचें। क्या आपने अभी कोई भाषा सीखी? नहीं। आपने केवल यह देखा कि यदि प्रतीक \"A\" आता है, तो प्रतीक \"B\" वापस भेज दें। आपको इस बात का कोई अंदाज़ा नहीं था कि आप \"मैं तुमसे प्यार करता हूँ\" (I love you) का जवाब दे रहे हैं। आपने सिंटैक्स (नियम) को प्रोसेस किया, लेकिन आपके पास शून्य सिमेंटिक्स (अर्थ/भावना) था।" 
               : "Think about your own experience just now. Did you learn any language? No. You merely observed that if squiggly symbol \"A\" arrives, you output squiggly symbol \"B\". You had no idea you were replying to \"I love you\". You processed Syntax (rules), but had ZERO Semantics (meaning)."}
           </Text>

           <Text style={[styles.bodyText, { color: textColor, marginTop: 16, fontWeight: 'bold' }]}>
             {isHindi 
               ? "जॉन सियर्ल (John Searle) का तर्क है कि चैटजीपीटी (ChatGPT) जैसे एआई (AI) ठीक इसी तरह काम करते हैं। वे एक विशाल गति से नियमों का पालन करने वाला यह कमरा हैं। बाहर से यह स्मार्ट लगता है, लेकिन अंदर कोई 'अनुभव' (Qualia) या चेतना नहीं है। केवल अंधेरा है।" 
               : "John Searle argues this is EXACTLY how AI like ChatGPT works. They are just this room, following rules at massive speed. It looks smart from the outside, but inside there is no 'experience' (Qualia), no consciousness. Just dark computation."}
           </Text>

        </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  counter: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputBox: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E91E63',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontSize: 48,
    color: '#000',
    fontWeight: 'normal',
  },
  optionsWrap: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  ruleText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  sendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  textBox: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
  }
});
