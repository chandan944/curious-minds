import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SCALES = [
  { level: 1, name: "The Presentation Room", nameHi: "प्रेजेंटेशन रूम (The Room)", significance: 100, color: "#F44336", icon: "user", text: "You stuttered badly during a meeting. Everyone is looking at you. This feels like the end of the world.", textHi: "आपने एक मीटिंग के दौरान बुरी तरह हकलाट की। हर कोई आपको देख रहा है। यह दुनिया के अंत जैसा महसूस होता है।" },
  { level: 2, name: "The City", nameHi: "आपका शहर (The City)", significance: 8.5, color: "#FF9800", icon: "map-pin", text: "Zooming out. Zoom past the building. Millions of people are in this city. They are stressed about their own lives and have no idea you exist.", textHi: "ज़ूम आउट। इमारत के पार ज़ूम करें। इस शहर में लाखों लोग हैं। वे अपने जीवन को लेकर ही तनाव में हैं और उन्हें पता भी नहीं है कि आप मौजूद हैं।" },
  { level: 3, name: "Planet Earth", nameHi: "पृथ्वी (Planet Earth)", significance: 0.001, color: "#4CAF50", icon: "globe", text: "Zooming out to orbit. 8 billion humans. A 4.5 billion-year-old rock. World wars, dying empires, ice ages. Your stutter is dissolving.", textHi: "कक्षा (Orbit) में ज़ूम आउट। 8 अरब इंसान। 4.5 अरब साल पुरानी चट्टान। विश्व युद्ध, मरते साम्राज्य, हिमयुग। आपकी 'हकलाहट' अब घुल रही है।" },
  { level: 4, name: "Solar System", nameHi: "सौर मंडल (Solar System)", significance: 0.000001, color: "#00BCD4", icon: "sun", text: "Passing Jupiter. The Sun dominates. In 5 billion years, it will swallow the Earth. Every memory of that meeting will be incinerated.", textHi: "बृहस्पति (Jupiter) से गुजरते हुए। 5 अरब वर्षों में, सूर्य पृथ्वी को निगल जाएगा। उस मीटिंग की 'हर याद' जलकर राख हो जाएगी।" },
  { level: 5, name: "Milky Way Galaxy", nameHi: "मिल्की वे गैलेक्सी (Milky Way)", significance: 0.000000001, color: "#3F51B5", icon: "aperture", text: "100 billion stars. Our entire solar system is just a microscopic speck on one spiral arm. Time itself operates differently here.", textHi: "100 अरब तारे। हमारा संपूर्ण सौरमंडल दूर के अक्षांश पर एक सूक्ष्म (Microscopic) कण मात्र है। यहाँ 'समय' ही अलग तरह से काम करता है।" },
  { level: 6, name: "Laniakea Supercluster", nameHi: "लैनियाकेया सुपरक्लस्टर", significance: 0.000000000001, color: "#9C27B0", icon: "share-2", text: "100,000 galaxies flowing toward the Great Attractor. You cannot even perceive humanity from here.", textHi: "1 लाख आकाशगंगाएँ जो 'ग्रेट अट्रैक्टर' की ओर बह रही हैं। आप यहाँ से मानवता (Humanity) की कल्पना भी नहीं कर सकते।" },
  { level: 7, name: "Observable Universe", nameHi: "अवलोकनीय ब्रह्मांड (The Universe)", significance: 0, color: "#212121", icon: "maximize", text: "2 trillion galaxies. 93 billion light-years across. The meeting. The stutter. The shame. It is mathematically zero. You are free.", textHi: "2 ट्रिलियन आकाशगंगाएँ। 93 अरब प्रकाश-वर्ष चौड़ा। वो मीटिंग। वो हकलाना। सब शून्य (Zero) है। अब आप पूरी तरह आज़ाद (Free) हैं।" },
];

export default function NihilismLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState('zooming'); // zooming, liberated
  const scale = SCALES[currentLevel];

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [anxietyFill] = useState(new Animated.Value(100)); // 100 to 0

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  useEffect(() => {
    Animated.timing(anxietyFill, {
      toValue: scale.significance,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
  }, [currentLevel]);

  const handleZoomOut = () => {
    if (currentLevel < SCALES.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true })
      ]).start(() => {
        setCurrentLevel(prev => prev + 1);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true })
        ]).start();
      });
    } else {
      setGameState('liberated');
      if (onComplete) setTimeout(onComplete, 3000);
    }
  };

  const getDreadColor = () => {
    if (scale.significance > 50) return '#F44336';
    if (scale.significance > 0.001) return '#FF9800';
    if (scale.significance > 0) return '#4CAF50';
    return '#00BCD4'; // Liberated color
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'घटना का ब्रह्मांडीय महत्व:' : 'Cosmic Significance of Mistake:'} {scale.significance > 0 ? scale.significance + '%' : '0%'}
        </Text>
        <View style={styles.barContainer}>
          <Animated.View style={[styles.barFill, { 
            width: anxietyFill.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), 
            backgroundColor: getDreadColor() 
          }]} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'zooming' && (
          <View style={styles.centerBox}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
              <View style={[styles.iconWrapper, { backgroundColor: scale.color + '22' }]}>
                {/* @ts-ignore */}
                <Feather name={scale.icon} size={48} color={scale.color} />
              </View>
              
              <Text style={[styles.levelTitle, { color: scale.color }]}>
                {isHindi ? scale.nameHi : scale.name}
              </Text>
              
              <Text style={[styles.levelText, { color: textColor }]}>
                {isHindi ? scale.textHi : scale.text}
              </Text>
            </Animated.View>

            <TouchableOpacity 
              style={[styles.zoomBtn, { backgroundColor: scale.color }]} 
              onPress={handleZoomOut}
            >
              <Feather name="zoom-out" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>{isHindi ? 'ज़ूम आउट करें' : 'Zoom Out'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'liberated' && (
          <View style={styles.centerBox}>
             <Feather name="wind" size={64} color="#00BCD4" style={styles.iconMargin} />
             <Text style={[styles.feedbackTitle, { color: '#00BCD4' }]}>
               {isHindi ? 'आशावादी शून्यवाद' : 'Optimistic Nihilism'}
             </Text>
             <Text style={[styles.feedbackText, { color: textColor }]}>
               {isHindi 
                 ? "जब आप ब्रह्मांडीय पैमाने को समझते हैं, तो मानवीय शर्मिंदगी टूट जाती है। आपका दर्द 'महत्वहीन' है, जो निराशाजनक नहीं, बल्कि बेहद शांतिपूर्ण है। आप स्वतंत्र हैं।" 
                 : "By zooming out, the ego dissolves. If the universe doesn't care about your failures, you are perfectly free to just enjoy the ride without fear."}
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
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 400,
    justifyContent: 'center',
    padding: 20,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: 20
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10
  },
  zoomBtn: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconMargin: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  }
});
