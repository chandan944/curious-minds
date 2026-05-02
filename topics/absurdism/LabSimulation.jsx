import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  {
    id: 1,
    q_en: "You build a magnificent sandcastle, but you know the tide will wash it away in an hour. What do you do?",
    q_hi: "आप एक शानदार रेत का महल बनाते हैं, लेकिन आप जानते हैं कि लहरें इसे एक घंटे में बहा ले जाएंगी। आप क्या करते हैं?",
    options: [
      { text_en: "Leave it half-finished. What's the point?", text_hi: "इसे आधा अधूरा छोड़ दें। इसका क्या फायदा?", type: "N" },
      { text_en: "Take a picture and declare it your personal masterpiece.", text_hi: "एक तस्वीर लें और इसे अपनी व्यक्तिगत उत्कृष्ट कृति घोषित करें।", type: "E" },
      { text_en: "Finish it beautifully, watch the tide destroy it, and smile.", text_hi: "इसे खूबसूरती से पूरा करें, लहरों को इसे नष्ट करते हुए देखें और मुस्कुराएं।", type: "A" }
    ]
  },
  {
    id: 2,
    q_en: "You realize the universe will eventually end in heat death, erasing all human achievements. How do you react?",
    q_hi: "आपको एहसास होता है कि ब्रह्मांड अंततः नष्ट हो जाएगा, जिससे सभी मानवीय उपलब्धियां मिट जाएंगी। आप कैसे प्रतिक्रिया करते हैं?",
    options: [
      { text_en: "Feel a crushing sense of pointlessness.", text_hi: "निरर्थकता की कुचलने वाली भावना महसूस करें।", type: "N" },
      { text_en: "Focus on creating a legacy that matters *now*.", text_hi: "*अभी* मायने रखने वाली विरासत बनाने पर ध्यान दें।", type: "E" },
      { text_en: "Accept the cosmic joke and go eat a really good sandwich.", text_hi: "लौकिक मजाक को स्वीकार करें और एक बहुत अच्छा सैंडविच खाएं।", type: "A" }
    ]
  },
  {
    id: 3,
    q_en: "You are stuck in a repetitive, unfulfilling job with no chance of escape.",
    q_hi: "आप एक ऐसे दोहराए जाने वाले, असंतोषजनक काम में फंस गए हैं जिससे बचने की कोई संभावना नहीं है।",
    options: [
      { text_en: "Give up mentally and let the misery consume you.", text_hi: "मानसिक रूप से हार मान लें और दुख को खुद को निगलने दें।", type: "N" },
      { text_en: "Find a side-hustle or hobby to give your life purpose.", text_hi: "अपने जीवन को उद्देश्य देने के लिए कोई साइड-हसल या शौक खोजें।", type: "E" },
      { text_en: "Do the repetitive work with intense, rebellious joy just to spite the universe.", text_hi: "ब्रह्मांड को चिढ़ाने के लिए तीव्र, विद्रोही खुशी के साथ काम करें।", type: "A" }
    ]
  },
  {
    id: 4,
    q_en: "You suffer a completely unfair and random tragedy.",
    q_hi: "आप पूरी तरह से अनुचित और यादृच्छिक त्रासदी का शिकार होते हैं।",
    options: [
      { text_en: "Curse the cruel world. Nothing is fair.", text_hi: "क्रूर दुनिया को कोसें। कुछ भी उचित नहीं है।", type: "N" },
      { text_en: "Learn from it to become a stronger, better person.", text_hi: "एक मजबूत, बेहतर इंसान बनने के लिए इससे सीखें।", type: "E" },
      { text_en: "Accept that the universe doesn't owe you fairness, and continue living passionately.", text_hi: "स्वीकार करें कि ब्रह्मांड निष्पक्षता का ऋणी नहीं है, और जुनून से जीना जारी रखें।", type: "A" }
    ]
  },
  {
    id: 5,
    q_en: "What is the ultimate meaning of life?",
    q_hi: "जीवन का अंतिम अर्थ क्या है?",
    options: [
      { text_en: "There is absolutely no meaning. It's a void.", text_hi: "बिल्कुल कोई अर्थ नहीं है। यह एक शून्य है।", type: "N" },
      { text_en: "There is no inherent meaning, so I must create my own.", text_hi: "कोई अंतर्निहित अर्थ नहीं है, इसलिए मुझे अपना खुद का बनाना होगा।", type: "E" },
      { text_en: "Looking for meaning is absurd. The struggle to live *is* the meaning.", text_hi: "अर्थ खोजना बेतुका है। जीने का संघर्ष ही *अर्थ* है।", type: "A" }
    ]
  }
];

const DIAGNOSIS = {
  N: {
    title_en: "You are leaning towards Nihilism 🌑",
    title_hi: "आप शून्यवाद की ओर झुक रहे हैं 🌑",
    desc_en: "You see the lack of inherent meaning in the universe as a tragedy. You feel crushed by the weight of pointlessness. While this is a logical response to a cold universe, it leads to despair. Absurdism suggests you take the next step: rebel against this emptiness by living joyfully anyway.",
    desc_hi: "आप ब्रह्मांड में अंतर्निहित अर्थ की कमी को एक त्रासदी के रूप में देखते हैं। आप निरर्थकता के भार से कुचला हुआ महसूस करते हैं। हालांकि यह एक तार्किक प्रतिक्रिया है, लेकिन यह निराशा की ओर ले जाती है। बेतुकापन सुझाव देता है कि आप अगला कदम उठाएं: वैसे भी खुशी से जीकर इस खालीपन के खिलाफ विद्रोह करें।"
  },
  E: {
    title_en: "You are leaning towards Existentialism 🌟",
    title_hi: "आप अस्तित्ववाद की ओर झुक रहे हैं 🌟",
    desc_en: "You accept that the universe has no inherent meaning, but you refuse to fall into despair. Instead, you believe it is your profound responsibility to *create* your own meaning through your choices, art, and legacy. You are the author of your own life.",
    desc_hi: "आप स्वीकार करते हैं कि ब्रह्मांड का कोई अंतर्निहित अर्थ नहीं है, लेकिन आप निराशा में पड़ने से इनकार करते हैं। इसके बजाय, आप मानते हैं कि अपनी पसंद, कला और विरासत के माध्यम से अपना अर्थ *बनाना* आपकी जिम्मेदारी है। आप अपने जीवन के स्वयं लेखक हैं।"
  },
  A: {
    title_en: "You are living as an Absurdist 🪨",
    title_hi: "आप एक बेतुके (Absurdist) के रूप में जी रहे हैं 🪨",
    desc_en: "You don't try to find meaning, and you don't fall into despair. You recognize that the universe is silent, and you laugh at it. Like Sisyphus pushing his boulder, you find complete, rebellious joy in the pure act of living, experiencing, and struggling. One must imagine you happy.",
    desc_hi: "आप अर्थ खोजने की कोशिश नहीं करते हैं, और आप निराशा में नहीं पड़ते हैं। आप पहचानते हैं कि ब्रह्मांड चुप है, और आप उस पर हंसते हैं। सिसिफस की तरह अपना पत्थर धकेलते हुए, आप जीने, अनुभव करने और संघर्ष करने के शुद्ध कार्य में पूर्ण, विद्रोही आनंद पाते हैं।"
  }
};

export default function AbsurdismLab({ onComplete, isHindi }) {
  const { theme, isDark } = useTheme();
  
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ N: 0, E: 0, A: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Animated values for the scale
  const nAnim = useRef(new Animated.Value(0)).current;
  const eAnim = useRef(new Animated.Value(0)).current;
  const aAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleOption = (type) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    // Animate scales
    const total = newScores.N + newScores.E + newScores.A;
    Animated.spring(nAnim, { toValue: (newScores.N / total) * 100, useNativeDriver: false }).start();
    Animated.spring(eAnim, { toValue: (newScores.E / total) * 100, useNativeDriver: false }).start();
    Animated.spring(aAnim, { toValue: (newScores.A / total) * 100, useNativeDriver: false }).start();

    // Next Question Transition
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      } else {
        setIsFinished(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        if (onComplete) setTimeout(onComplete, 4000); // unlock next after reading
      }
    });
  };

  const getWinner = () => {
    if (scores.A >= scores.E && scores.A >= scores.N) return 'A';
    if (scores.E >= scores.N) return 'E';
    return 'N';
  };

  const c_n = '#4A5568'; // Nihilism gray
  const c_e = '#4299E1'; // Existentialism blue
  const c_a = '#ED8936'; // Absurdism orange

  return (
    <View style={styles.root}>
      
      {/* ── Progress Header ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          {isHindi ? 'दार्शनिक संरेखण परीक्षण' : 'Philosophical Alignment Test'}
        </Text>
        <Text style={[styles.headerSub, { color: theme.text.secondary }]}>
          {isFinished ? (isHindi ? 'परिणाम' : 'RESULTS') : `${currentQ + 1} / ${QUESTIONS.length}`}
        </Text>
      </View>

      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        {!isFinished ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
            <View style={[styles.qCard, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
              <Text style={[styles.questionText, { color: theme.text.primary }]}>
                {isHindi ? QUESTIONS[currentQ].q_hi : QUESTIONS[currentQ].q_en}
              </Text>
            </View>

            <View style={styles.optionsWrap}>
              {QUESTIONS[currentQ].options.sort(() => Math.random() - 0.5).map((opt, i) => (
                <Pressable
                  key={i}
                  style={({pressed}) => [
                    styles.optBtn, 
                    { 
                      backgroundColor: pressed ? theme.glass.strong : theme.glass.medium,
                      borderColor: pressed ? theme.accent.gold : theme.glass.border
                    }
                  ]}
                  onPress={() => handleOption(opt.type)}
                >
                  <Text style={[styles.optText, { color: theme.text.secondary }]}>
                    {isHindi ? opt.text_hi : opt.text_en}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.resultArea}>
            <LinearGradient
              colors={[theme.glass.strong, theme.bg.card]}
              style={[styles.resultCard, { borderColor: theme.glass.borderBright }]}
            >
              <Text style={[styles.resultTitle, { color: getWinner() === 'A' ? c_a : getWinner() === 'E' ? c_e : c_n }]}>
                {isHindi ? DIAGNOSIS[getWinner()].title_hi : DIAGNOSIS[getWinner()].title_en}
              </Text>
              <Text style={[styles.resultDesc, { color: theme.text.primary }]}>
                {isHindi ? DIAGNOSIS[getWinner()].desc_hi : DIAGNOSIS[getWinner()].desc_en}
              </Text>
              {getWinner() === 'A' && (
                <View style={styles.orbWrap}>
                  <Feather name="sun" size={40} color={theme.accent.gold} />
                </View>
              )}
            </LinearGradient>
          </View>
        )}
      </Animated.View>

      {/* ── Live Scale UI ── */}
      <View style={[styles.scaleArea, { backgroundColor: theme.bg.elevated, borderColor: theme.glass.border }]}>
        <Text style={[styles.scaleHeader, { color: theme.text.muted }]}>
          {isHindi ? 'आपका विश्वदृष्टि स्पेक्ट्रम' : 'Your Worldview Spectrum'}
        </Text>
        
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: c_n }]}>Nihilism</Text>
          <View style={[styles.barTrack, { backgroundColor: theme.glass.light }]}>
            <Animated.View style={[styles.barFill, { backgroundColor: c_n, width: nAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: c_e }]}>Existentialism</Text>
          <View style={[styles.barTrack, { backgroundColor: theme.glass.light }]}>
            <Animated.View style={[styles.barFill, { backgroundColor: c_e, width: eAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: c_a }]}>Absurdism</Text>
          <View style={[styles.barTrack, { backgroundColor: theme.glass.light }]}>
            <Animated.View style={[styles.barFill, { backgroundColor: c_a, width: aAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.md, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: SPACING.lg },
  headerTitle: { fontFamily: FONTS.displayMedium, fontSize: 20 },
  headerSub: { fontFamily: FONTS.displayBold, fontSize: 14, marginTop: 4, letterSpacing: 2 },
  
  contentArea: { flex: 1 },
  qCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  questionText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26
  },
  optionsWrap: { gap: SPACING.sm },
  optBtn: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  optText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 22
  },

  resultArea: { flex: 1, justifyContent: 'center' },
  resultCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center'
  },
  resultTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  resultDesc: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center'
  },
  orbWrap: {
    marginTop: SPACING.xl,
    padding: 16,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)'
  },

  scaleArea: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  scaleHeader: {
    fontFamily: FONTS.displayBold,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  barLabel: {
    width: 100,
    fontFamily: FONTS.displayBold,
    fontSize: 11,
    letterSpacing: 0.5
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: RADIUS.full,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full
  }
});

