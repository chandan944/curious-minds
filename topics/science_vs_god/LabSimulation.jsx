import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Line, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundSuccess, soundWhoosh } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;
const SIM_H = 200;

const CLAIMS = [
  { text: "Water boils at 100°C at sea level", category: 'SCIENTIFIC', why: "Testable, measurable, falsifiable. Classic science." },
  { text: "God created the universe", category: 'METAPHYSICAL', why: "Unfalsifiable by any known experiment. Beyond science's tools." },
  { text: "Torturing innocents is objectively wrong", category: 'PHILOSOPHICAL', why: "A moral claim. Logic supports it, but no lab can test 'wrongness'." },
  { text: "The universe had a first cause", category: 'PHILOSOPHICAL', why: "Logical argument (cosmological), but no experiment can reach 'before' time." },
  { text: "E = mc²", category: 'SCIENTIFIC', why: "Einstein's equation. Tested, measured, verified by nuclear reactions." },
  { text: "The soul survives bodily death", category: 'METAPHYSICAL', why: "No experiment can detect a soul or track it after death." },
  { text: "Evolution by natural selection explains biodiversity", category: 'SCIENTIFIC', why: "Testable via fossils, DNA, observed speciation. Falsifiable." },
  { text: "Free will is an illusion", category: 'PHILOSOPHICAL', why: "Neither provable nor disprovable by experiment. A logical inference." },
  { text: "Prayer heals illness", category: 'SCIENTIFIC', why: "Testable! Controlled studies exist (most show no effect beyond placebo)." },
  { text: "Beauty exists objectively in the universe", category: 'PHILOSOPHICAL', why: "Aesthetics cannot be measured with instruments. It's a value judgment." },
  { text: "There are infinite parallel universes", category: 'METAPHYSICAL', why: "The Multiverse is untestable, unobservable, and unfalsifiable — like God." },
  { text: "Life on Earth began 3.8 billion years ago", category: 'SCIENTIFIC', why: "Dated via radiometric isotopes. Measurable, testable, falsifiable." },
  { text: "Consciousness is non-physical", category: 'METAPHYSICAL', why: "Science can study neural correlates, but cannot test 'non-physicality'." },
  { text: "Slavery is morally wrong", category: 'PHILOSOPHICAL', why: "A moral truth most agree on, but no physics experiment can prove 'wrongness'." },
  { text: "The fine-tuning of constants PROVES design", category: 'METAPHYSICAL', why: "The tuning is measured scientifically. 'Proves design' is an untestable leap." },
];

const CATEGORY_COLORS = {
  SCIENTIFIC: '#00BCD4',
  PHILOSOPHICAL: '#FF9800',
  METAPHYSICAL: '#9C27B0',
};

export default function ScienceVsGodLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border1 = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gameState, setGameState] = useState('PLAYING');
  const [history, setHistory] = useState([]);

  const claim = CLAIMS[currentIndex];

  const handleSelect = (cat) => {
    if (answered || gameState !== 'PLAYING') return;
    soundTap();
    setSelectedCategory(cat);
    setAnswered(true);
    const correct = cat === claim.category;
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setHistory(prev => [...prev, { claim: claim.text, correct, selected: cat, actual: claim.category }]);
  };

  const handleNext = () => {
    if (currentIndex >= CLAIMS.length - 1) {
      setGameState('COMPLETE');
      if (score >= 12 && onLabBreaker) onLabBreaker();
      soundSuccess();
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setAnswered(false);
    setSelectedCategory(null);
    soundWhoosh();
  };

  const resetGame = () => {
    soundWhoosh();
    setCurrentIndex(0); setScore(0); setStreak(0); setAnswered(false);
    setSelectedCategory(null); setGameState('PLAYING'); setHistory([]);
  };

  const pct = ((currentIndex + (answered ? 1 : 0)) / CLAIMS.length) * 100;

  // Visualization: domain circles
  const sciCount = history.filter(h => h.actual === 'SCIENTIFIC').length;
  const philCount = history.filter(h => h.actual === 'PHILOSOPHICAL').length;
  const metaCount = history.filter(h => h.actual === 'METAPHYSICAL').length;

  return (
    <View style={styles.container}>
      {/* STATUS */}
      <View style={[styles.headerBox, { borderColor: border1, backgroundColor: isDark ? '#0A0A20' : '#F0F0FF' }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>CLAIM {currentIndex + 1} / {CLAIMS.length}</Text>
          <Text style={{ fontSize: 14, fontFamily: FONTS.displayBold, color: txt1 }}>Score: {score} | Streak: {streak}🔥</Text>
        </View>
        <View style={{ alignItems: 'flex-end', width: 80 }}>
          <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>PROGRESS</Text>
          <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 4 }]}>
            <View style={{ height: '100%', width: `${pct}%`, backgroundColor: '#6366F1' }} />
          </View>
        </View>
      </View>

      {gameState === 'PLAYING' && (
        <>
          {/* CLAIM CARD */}
          <View style={[styles.claimCard, { borderColor: border1, backgroundColor: isDark ? '#111122' : '#FAFAFE' }]}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM, marginBottom: 6 }}>CLASSIFY THIS CLAIM:</Text>
            <Text style={{ fontSize: 15, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center', lineHeight: 22 }}>{`"${claim.text}"`}</Text>
          </View>

          {/* CATEGORY BUTTONS */}
          <View style={{ gap: 8, marginBottom: 12 }}>
            {['SCIENTIFIC', 'PHILOSOPHICAL', 'METAPHYSICAL'].map(cat => {
              const color = CATEGORY_COLORS[cat];
              const isCorrect = answered && cat === claim.category;
              const isWrong = answered && cat === selectedCategory && cat !== claim.category;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, {
                    borderColor: isCorrect ? '#4CAF50' : isWrong ? '#FF4444' : color + '60',
                    backgroundColor: isCorrect ? '#4CAF5020' : isWrong ? '#FF444420' : color + '10',
                  }]}
                  onPress={() => handleSelect(cat)}
                  activeOpacity={answered ? 1 : 0.7}
                >
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <Text style={[styles.catBtnTxt, { color: isCorrect ? '#4CAF50' : isWrong ? '#FF4444' : color }]}>
                    {cat === 'SCIENTIFIC' ? '🧪 Scientific' : cat === 'PHILOSOPHICAL' ? '🧠 Philosophical' : '🔮 Metaphysical'}
                  </Text>
                  {isCorrect && <Text style={{ color: '#4CAF50', fontSize: 11 }}>✓</Text>}
                  {isWrong && <Text style={{ color: '#FF4444', fontSize: 11 }}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FEEDBACK */}
          {answered && (
            <View style={[styles.feedbackBox, { borderColor: selectedCategory === claim.category ? '#4CAF5040' : '#FF444440', backgroundColor: selectedCategory === claim.category ? '#4CAF5010' : '#FF444410' }]}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: selectedCategory === claim.category ? '#4CAF50' : '#FF4444', marginBottom: 4 }}>
                {selectedCategory === claim.category ? '✓ Correct!' : `✗ Wrong! It's ${claim.category}`}
              </Text>
              <Text style={{ fontSize: 11, color: txt2, lineHeight: 17 }}>{claim.why}</Text>
            </View>
          )}

          {answered && (
            <TouchableOpacity style={[styles.nextBtn, { borderColor: '#6366F160', backgroundColor: '#6366F120' }]} onPress={handleNext}>
              <Text style={{ color: '#6366F1', fontFamily: FONTS.displayBold, fontSize: 13 }}>
                {currentIndex >= CLAIMS.length - 1 ? 'See Results →' : 'Next Claim →'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {gameState === 'COMPLETE' && (
        <View style={{ alignItems: 'center' }}>
          {/* DOMAIN DISTRIBUTION */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Svg width={SIM_W} height={SIM_H}>
              <Rect x={0} y={0} width={SIM_W} height={SIM_H} rx={12} fill={glass1} stroke={border1} />
              <SvgText x={SIM_W/2} y={25} fill={txt1} fontSize={12} textAnchor="middle" fontWeight="bold">Knowledge Domain Distribution</SvgText>
              
              {/* Three circles representing domains */}
              <Circle cx={SIM_W * 0.2} cy={110} r={20 + sciCount * 5} fill="#00BCD4" opacity={0.35} />
              <SvgText x={SIM_W * 0.2} y={115} fill="#00BCD4" fontSize={10} textAnchor="middle" fontWeight="bold">{sciCount}</SvgText>
              <SvgText x={SIM_W * 0.2} y={165} fill="#00BCD4" fontSize={8} textAnchor="middle">Scientific</SvgText>
              
              <Circle cx={SIM_W * 0.5} cy={110} r={20 + philCount * 5} fill="#FF9800" opacity={0.35} />
              <SvgText x={SIM_W * 0.5} y={115} fill="#FF9800" fontSize={10} textAnchor="middle" fontWeight="bold">{philCount}</SvgText>
              <SvgText x={SIM_W * 0.5} y={165} fill="#FF9800" fontSize={8} textAnchor="middle">Philosophical</SvgText>
              
              <Circle cx={SIM_W * 0.8} cy={110} r={20 + metaCount * 5} fill="#9C27B0" opacity={0.35} />
              <SvgText x={SIM_W * 0.8} y={115} fill="#9C27B0" fontSize={10} textAnchor="middle" fontWeight="bold">{metaCount}</SvgText>
              <SvgText x={SIM_W * 0.8} y={165} fill="#9C27B0" fontSize={8} textAnchor="middle">Metaphysical</SvgText>

              {/* Overlapping circles to show blurry boundaries */}
              <Circle cx={SIM_W * 0.35} cy={110} r={15} fill="#FF9800" opacity={0.1} />
              <Circle cx={SIM_W * 0.65} cy={110} r={15} fill="#9C27B0" opacity={0.1} />
            </Svg>
          </View>

          <Text style={{ fontSize: 20, fontFamily: FONTS.displayBold, color: score >= 12 ? '#4CAF50' : '#FF9800', marginBottom: 8 }}>
            {score >= 12 ? '🏆 Epistemology Master!' : score >= 8 ? '🎯 Good Judgment!' : '📚 Keep Learning!'}
          </Text>
          <Text style={{ fontSize: 14, color: txt2, marginBottom: 16 }}>
            You correctly classified {score} / {CLAIMS.length} claims
          </Text>
          
          <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: '#FFF', fontFamily: FONTS.displayBold }}>Try Again 🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border1 }]}>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>POPPER_FALSIFIABILITY: {answered ? (claim.category === 'SCIENTIFIC' ? 'HIGH' : claim.category === 'PHILOSOPHICAL' ? 'LOW' : 'NONE') : '—'}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>BAYESIAN_CONF: {(score / Math.max(1, currentIndex + 1) * 100).toFixed(1)}%</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>EPISTEMIC_STREAK: {streak} | DOMAIN_BIAS: {sciCount > philCount + metaCount ? 'EMPIRICAL' : 'RATIONALIST'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10 },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  claimCard: { padding: 20, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 14, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  catBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catBtnTxt: { fontSize: 13, fontFamily: FONTS.displayBold, flex: 1 },
  feedbackBox: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12 },
  nextBtn: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', marginBottom: 8 },
  resetBtn: { marginTop: 8, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center', width: '80%' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#0A0A20', borderRadius: RADIUS.sm, borderWidth: 1 },
});
