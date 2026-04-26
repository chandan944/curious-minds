import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

export default function BiasLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const bg = (_themeObj || {}).bg?.base || '#0A0A0A';

  // ── State ──────────────────────────────────────
  const [step, setStep] = useState(0); // 0: Start, 1: Anchoring, 2: Framing, 3: Result
  const [anchorValue, setAnchor] = useState(0);
  const [userEstimate, setUserEstimate] = useState(50);
  const [choices, setChoices] = useState({ framing: null });
  const [biasScore, setScore] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Handlers ───────────────────────────────────
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [step]);

  const nextStep = () => {
    soundWhoosh();
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setStep(prev => prev + 1);
        fadeAnim.setValue(0);
    });
  };

  const startAnchoring = () => {
    const val = Math.random() > 0.5 ? 850 : 15;
    setAnchor(val);
    nextStep();
  };

  const submitEstimate = (val) => {
    setUserEstimate(val);
    // Real value is 54. If anchor is high, user estimate usually drifts high.
    const expectedDrift = anchorValue > 400 ? 60 : 40;
    if ((anchorValue > 400 && val > 54) || (anchorValue < 400 && val < 54)) {
       setScore(prev => prev + 1);
    }
    nextStep();
  };

  const selectFraming = (id) => {
    setChoices(prev => ({ ...prev, framing: id }));
    if (id === 'A') setScore(prev => prev + 1); // A is framed positively
    nextStep();
  };

  const reset = () => {
    setStep(0);
    setScore(0);
    // @ts-ignore
    setChoices({});
  };

  // ── Render Helpers ─────────────────────────────

  const renderStart = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Icon name="brain" size={60} color="#A855F7" />
      <Text style={[styles.header, { color: txt1 }]}>Ready for a Mind Games? 🕵️‍♂️</Text>
      <Text style={[styles.desc, { color: txt2 }]}>
        I will put your brain through 2 rapid tests. Be honest—don't think too hard. Let's see if your System 1 brain is calling the shots!
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={startAnchoring}>
         <Text style={styles.btnText}>BEGIN ASSESSMENT</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAnchoring = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.subHeader}>TASK 1: SPEED ESTIMATION</Text>
      <View style={styles.anchorBox}>
         <Text style={styles.anchorLabel}>TRANSACTION ID:</Text>
         <Text style={styles.anchorNum}>#{anchorValue}</Text>
      </View>
      <Text style={[styles.question, { color: txt1 }]}>
        How many countries do you think are in the continent of Africa? 🌍
      </Text>
      <View style={styles.sliderBox}>
         <Text style={[styles.valText, { color: '#A855F7' }]}>{userEstimate} Countries</Text>
         <View style={styles.tickRow}>
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity key={i} onPress={() => { submitEstimate(i * 20 + 15); soundTap(); }} style={styles.tick}>
                 <Text style={{ color: txtM, fontSize: 10 }}>{i * 20 + 15}</Text>
              </TouchableOpacity>
            ))}
         </View>
      </View>
      <Text style={styles.hintText}>* Just pick your best guess from the numbers above *</Text>
    </Animated.View>
  );

  const renderFraming = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.subHeader}>TASK 2: PREFERENCE CHOICE</Text>
      <Text style={[styles.question, { color: txt1 }]}>
        You are feeling hungry. Choose your snack:
      </Text>
      <View style={styles.optionRow}>
         <TouchableOpacity style={[styles.choiceBtn, { borderColor: '#00D4A0' }]} onPress={() => selectFraming('A')}>
            <Icon name="check-circle" size={24} color="#00D4A0" />
            <Text style={styles.choiceTitle}>Option Alpha</Text>
            <Text style={styles.choiceDesc}>"This protein bar is 95% FAT FREE!"</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.choiceBtn, { borderColor: '#FF4444' }]} onPress={() => selectFraming('B')}>
            <Icon name="zap" size={24} color="#FF4444" />
            <Text style={styles.choiceTitle}>Option Beta</Text>
            <Text style={styles.choiceDesc}>"This protein bar contains 5% FAT."</Text>
         </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderResult = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Icon name="award" size={50} color="#FFD166" />
      <Text style={[styles.header, { color: txt1 }]}>Bias Sensitivity: {biasScore > 1 ? 'HIGH' : 'LOW'}</Text>
      
      <View style={styles.resultBox}>
         <View style={styles.resultItem}>
            <Text style={styles.resType}>ANCHORING</Text>
            <Text style={[styles.resDesc, { color: txt2 }]}>
              {anchorValue > 500 ? "Because I showed you a high ID number (#850), your brain 'anchored' and estimated a higher count!" : "Because your ID number was low (#15), your brain likely estimated a lower count."}
            </Text>
         </View>
         <View style={styles.resultItem}>
            <Text style={styles.resType}>FRAMING</Text>
            <Text style={[styles.resDesc, { color: txt2 }]}>
               {choices.framing === 'A' ? "You chose the 'Fat Free' option—the positive frame blinded you to the fact they were identical snacks!" : "You saw through the framing—congratulations on using System 2 logic!"}
            </Text>
         </View>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#333' }]} onPress={reset}>
         <Text style={styles.btnText}>RE-TEST BRAIN</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.simWindow, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#F8FAFC' }]}>
        <Svg width={SIM_W} height={SIM_H} style={StyleSheet.absoluteFill}>
           <Defs>
              <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0" stopColor={_themeObj.accent?.secondary || color} stopOpacity="0.05" />
                 <Stop offset="1" stopColor="transparent" />
              </LinearGradient>
           </Defs>
           <Rect width={SIM_W} height={SIM_H} fill="url(#bg)" />
           
           {/* Abstract logic nodes */}
           {[...Array(6)].map((_, i) => (
              <Circle key={i} cx={20 + (i*60)} cy={20 + (i*10)} r="2" fill={color} opacity={0.3} />
           ))}
        </Svg>

        <View style={styles.content}>
           {step === 0 && renderStart()}
           {step === 1 && renderAnchoring()}
           {step === 2 && renderFraming()}
           {step === 3 && renderResult()}
        </View>

        {scientistMode && (
           <View style={styles.sciBar}>
              <Text style={styles.sciText}>NEURAL LATENCY: 22ms | PREDICTED BIAS VARIANCE: ±4%</Text>
           </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  simWindow: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  stepContainer: { width: '100%', alignItems: 'center' },
  header: { fontSize: 20, fontFamily: FONTS.displayBold, textAlign: 'center', marginVertical: 16 },
  desc: { fontSize: 13, fontFamily: FONTS.body, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  primaryBtn: { backgroundColor: '#A855F7', paddingHorizontal: 30, paddingVertical: 14, borderRadius: RADIUS.full },
  btnText: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 13, letterSpacing: 1 },
  
  subHeader: { fontSize: 8, color: '#A855F7', fontFamily: FONTS.displayBold, letterSpacing: 2, marginBottom: 12 },
  anchorBox: { backgroundColor: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: RADIUS.sm, marginBottom: 20, alignItems: 'center' },
  anchorLabel: { fontSize: 7, color: '#666', fontFamily: FONTS.displayBold },
  anchorNum: { fontSize: 24, fontFamily: 'monospace', color: '#ff4444', fontWeight: 'bold' },
  question: { fontSize: 14, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 24 },
  
  sliderBox: { width: '100%', alignItems: 'center' },
  valText: { fontSize: 24, fontFamily: FONTS.displayBold, marginBottom: 16 },
  tickRow: { flexDirection: 'row', gap: 10 },
  tick: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, minWidth: 50, alignItems: 'center' },
  hintText: { fontSize: 8, color: '#666', marginTop: 12, fontStyle: 'italic' },
  
  optionRow: { width: '100%', gap: 12 },
  choiceBtn: { width: '100%', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  choiceTitle: { color: '#fff', fontFamily: FONTS.displayBold, fontSize: 13, marginTop: 10 },
  choiceDesc: { color: '#888', fontSize: 11, textAlign: 'center', marginTop: 4 },
  
  resultBox: { width: '100%', gap: 10, marginBottom: 24 },
  resultItem: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: RADIUS.sm },
  resType: { fontSize: 8, fontFamily: FONTS.displayBold, color: '#FFD166', marginBottom: 4 },
  resDesc: { fontSize: 11, fontFamily: FONTS.body, lineHeight: 16 },
  
  sciBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', padding: 6 },
  sciText: { color: '#00FF00', fontSize: 8, textAlign: 'center', fontFamily: 'monospace' }
});
