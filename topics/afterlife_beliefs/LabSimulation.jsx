import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Line, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;

const ASPECTS = [
  {
    question: "What MECHANISM determines your afterlife?",
    options: [
      { label: '⚖️ Divine Judgment', value: 'judgment', match: ['Christianity', 'Islam', 'Egypt'] },
      { label: '🔄 Karma (Actions)', value: 'karma', match: ['Hinduism', 'Buddhism'] },
      { label: '⚔️ How You Die', value: 'death_type', match: ['Norse'] },
      { label: '🌑 Nothing — Just Oblivion', value: 'nothing', match: ['Materialism'] },
      { label: '🌊 Merge Into Everything', value: 'merge', match: ['Hinduism (Moksha)', 'Taoism'] },
    ],
  },
  {
    question: "What CRITERIA should determine your fate?",
    options: [
      { label: '🙏 Faith / Belief', value: 'faith', match: ['Protestant Christianity'] },
      { label: '📋 Moral Deeds', value: 'deeds', match: ['Islam', 'Judaism'] },
      { label: '🧠 Wisdom / Enlightenment', value: 'wisdom', match: ['Buddhism', 'Gnosticism'] },
      { label: '❤️ Character / Heart', value: 'character', match: ['Egypt', 'Universal'] },
      { label: '🎲 Nothing — Random or None', value: 'random', match: ['Greek (Fate)', 'Materialism'] },
    ],
  },
  {
    question: "Is punishment ETERNAL or temporary?",
    options: [
      { label: '♾️ Eternal — Forever punishment', value: 'eternal', match: ['Traditional Christianity', 'Traditional Islam'] },
      { label: '⏳ Temporary — Cleansing, then release', value: 'temporary', match: ['Purgatory', 'Judaism (Gehinnom)'] },
      { label: '💨 Annihilation — Soul ceases to exist', value: 'annihilation', match: ['Egypt', 'Some Christianity'] },
      { label: '🔄 Rebirth — Keep trying until you learn', value: 'rebirth', match: ['Hinduism', 'Buddhism'] },
      { label: '🚫 No punishment needed', value: 'none', match: ['Universalism', 'Some Buddhism'] },
    ],
  },
  {
    question: "What does 'paradise' look like?",
    options: [
      { label: '🌿 A perfect garden (physical)', value: 'garden', match: ['Islam (Jannah)', 'Christianity'] },
      { label: '👨‍👩‍👧‍👦 Reunion with loved ones', value: 'reunion', match: ['Christianity', 'East Asian'] },
      { label: '🌌 Merging with cosmic consciousness', value: 'cosmic', match: ['Hinduism (Moksha)', 'Mysticism'] },
      { label: '🕯️ Cessation of all suffering (peace)', value: 'cessation', match: ['Buddhism (Nirvana)'] },
      { label: '💀 No paradise — just ending', value: 'no_paradise', match: ['Materialism', 'Epicureanism'] },
    ],
  },
  {
    question: "Can you get a SECOND CHANCE?",
    options: [
      { label: '❌ No — one life, one judgment', value: 'no', match: ['Christianity', 'Islam'] },
      { label: '♻️ Yes — infinite rebirths to learn', value: 'infinite', match: ['Hinduism', 'Buddhism'] },
      { label: '⏳ Yes — temporary cleansing fixes you', value: 'cleansing', match: ['Purgatory', 'Gehinnom'] },
      { label: '🤷 Unknown — nobody can say', value: 'unknown', match: ['Agnosticism', 'Judaism'] },
      { label: '🧊 Frozen — wait for future tech', value: 'frozen', match: ['Cryonics', 'Transhumanism'] },
    ],
  },
  {
    question: "What happens to your BODY?",
    options: [
      { label: '🦴 Resurrected — you get it back', value: 'resurrect', match: ['Christianity', 'Islam'] },
      { label: '♻️ Recycled — reborn in new form', value: 'recycled', match: ['Hinduism', 'Buddhism'] },
      { label: '🪦 Preserved — mummified/frozen', value: 'preserved', match: ['Egypt', 'Cryonics'] },
      { label: '🦅 Returned to nature', value: 'nature', match: ['Tibetan', 'Indigenous'] },
      { label: '🔥 Destroyed — irrelevant', value: 'irrelevant', match: ['Materialism', 'Cremation'] },
    ],
  },
];

const TRADITION_EMOJIS = {
  'Christianity': '✝️', 'Islam': '☪️', 'Hinduism': '🕉️', 'Buddhism': '☸️',
  'Judaism': '✡️', 'Egypt': '🏛️', 'Norse': '⚔️', 'Materialism': '🔬',
  'Taoism': '☯️', 'Mysticism': '🌀', 'Transhumanism': '🤖',
};

export default function AfterlifeArchitectLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border1 = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [choices, setChoices] = useState({});
  const [currentAspect, setCurrentAspect] = useState(0);
  const [gameState, setGameState] = useState('DESIGNING'); // DESIGNING, RESULTS

  const aspect = ASPECTS[currentAspect];

  const handleChoice = (val) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChoices(prev => ({ ...prev, [currentAspect]: val }));
  };

  const nextAspect = () => {
    if (currentAspect >= ASPECTS.length - 1) {
      setGameState('RESULTS');
      soundSuccess();
      if (onLabBreaker) onLabBreaker();
      return;
    }
    soundWhoosh();
    setCurrentAspect(prev => prev + 1);
  };

  const prevAspect = () => {
    if (currentAspect <= 0) return;
    soundWhoosh();
    setCurrentAspect(prev => prev - 1);
  };

  const resetGame = () => {
    soundWhoosh();
    setChoices({}); setCurrentAspect(0); setGameState('DESIGNING');
  };

  // Calculate tradition matches
  const getMatches = () => {
    const scores = {};
    Object.values(choices).forEach(choiceVal => {
      ASPECTS.forEach(asp => {
        const opt = asp.options.find(o => o.value === choiceVal);
        if (opt) {
          opt.match.forEach(tradition => {
            const baseTradition = tradition.split(' (')[0];
            scores[baseTradition] = (scores[baseTradition] || 0) + 1;
          });
        }
      });
    });
    return Object.entries(scores).sort((a, b) => b[1] - a[1]);
  };

  const matches = gameState === 'RESULTS' ? getMatches() : [];
  const topMatch = matches[0];

  const accentColors = ['#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];

  return (
    <View style={styles.container}>
      {gameState === 'DESIGNING' && (
        <>
          <View style={[styles.headerBox, { borderColor: border1, backgroundColor: isDark ? '#0A0818' : '#F8F5FF' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>
                DESIGN ASPECT {currentAspect + 1} / {ASPECTS.length}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: '#E91E63' }}>
                💀 Build Your Afterlife
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {ASPECTS.map((_, i) => (
                <View key={i} style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: choices[i] ? '#4CAF50' : i === currentAspect ? '#FFF' : '#333',
                }} />
              ))}
            </View>
          </View>

          {/* QUESTION */}
          <View style={[styles.questionCard, { borderColor: border1, backgroundColor: isDark ? '#111118' : '#FAFAFF' }]}>
            <Text style={{ fontSize: 15, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center', lineHeight: 22 }}>
              {aspect.question}
            </Text>
          </View>

          {/* OPTIONS */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {aspect.options.map(opt => {
              const isSelected = choices[currentAspect] === opt.value;
              const color = accentColors[aspect.options.indexOf(opt) % accentColors.length];
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optBtn, {
                    borderColor: isSelected ? color : border1,
                    backgroundColor: isSelected ? color + '18' : glass1,
                  }]}
                  onPress={() => handleChoice(opt.value)}
                >
                  <Text style={{ fontSize: 13, fontFamily: FONTS.displayBold, color: isSelected ? color : txt2, flex: 1 }}>
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={{ fontSize: 14, color }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Matching Traditions Preview */}
          {choices[currentAspect] && (
            <View style={[styles.matchPreview, { borderColor: border1 }]}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>ALIGNS WITH:</Text>
              <Text style={{ fontSize: 10, color: txt2, marginTop: 2 }}>
                {aspect.options.find(o => o.value === choices[currentAspect])?.match.join(' • ')}
              </Text>
            </View>
          )}

          {/* NAV */}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            {currentAspect > 0 && (
              <TouchableOpacity style={[styles.navBtn, { borderColor: border1 }]} onPress={prevAspect}>
                <Text style={{ color: txt2, fontFamily: FONTS.displayBold }}>← Back</Text>
              </TouchableOpacity>
            )}
            {choices[currentAspect] && (
              <TouchableOpacity style={[styles.navBtn, { borderColor: '#E91E6360', backgroundColor: '#E91E6315' }]} onPress={nextAspect}>
                <Text style={{ color: '#E91E63', fontFamily: FONTS.displayBold }}>
                  {currentAspect >= ASPECTS.length - 1 ? 'See My Afterlife →' : 'Next Aspect →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {gameState === 'RESULTS' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 18, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center', marginBottom: 4 }}>
            Your Afterlife Design
          </Text>
          <Text style={{ fontSize: 11, color: txtM, textAlign: 'center', marginBottom: 16 }}>
            matches closest to...
          </Text>

          {/* TOP MATCH */}
          {topMatch && (
            <View style={[styles.topMatchCard, { borderColor: '#E91E6340', backgroundColor: '#E91E6308' }]}>
              <Text style={{ fontSize: 36, textAlign: 'center' }}>{TRADITION_EMOJIS[topMatch[0]] || '🌐'}</Text>
              <Text style={{ fontSize: 20, fontFamily: FONTS.displayBold, color: '#E91E63', textAlign: 'center', marginVertical: 4 }}>
                {topMatch[0]}
              </Text>
              <Text style={{ fontSize: 11, color: txt2, textAlign: 'center' }}>
                {topMatch[1]} / {ASPECTS.length} aspects aligned
              </Text>
            </View>
          )}

          {/* ALL MATCHES */}
          <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: txt1, marginBottom: 8 }}>Tradition Alignment:</Text>
          {matches.map(([tradition, score], i) => (
            <View key={tradition} style={[styles.matchRow, { borderColor: border1 }]}>
              <Text style={{ fontSize: 16, width: 24 }}>{TRADITION_EMOJIS[tradition] || '🌐'}</Text>
              <Text style={{ fontSize: 11, fontFamily: FONTS.displayBold, color: txt1, flex: 1 }}>{tradition}</Text>
              <View style={[styles.miniBar, { backgroundColor: glass1, width: 80 }]}>
                <View style={{ height: '100%', width: `${(score / ASPECTS.length) * 100}%`, backgroundColor: accentColors[i % accentColors.length], borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 10, fontFamily: 'monospace', color: txtM, width: 20, textAlign: 'right' }}>{score}</Text>
            </View>
          ))}

          {/* CHOICE SUMMARY */}
          <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: txt1, marginTop: 16, marginBottom: 8 }}>Your Choices:</Text>
          {ASPECTS.map((asp, i) => {
            const chosen = asp.options.find(o => o.value === choices[i]);
            return (
              <View key={i} style={[styles.choiceSummary, { borderColor: border1 }]}>
                <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>{asp.question}</Text>
                <Text style={{ fontSize: 11, color: txt1, marginTop: 2 }}>{chosen?.label || '—'}</Text>
              </View>
            );
          })}

          <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: '#FFF', fontFamily: FONTS.displayBold }}>Redesign Afterlife 🔄</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border1 }]}>
          <Text style={{ color: '#E91E63', fontSize: 9, fontFamily: 'monospace' }}>TMT_ANXIETY_BUFFER: {topMatch ? (topMatch[1] / ASPECTS.length * 100).toFixed(0) : '—'}%</Text>
          <Text style={{ color: '#E91E63', fontSize: 9, fontFamily: 'monospace' }}>TRADITION_ENTROPY: {matches.length > 0 ? (-matches.reduce((s, [, c]) => { const p = c / Object.values(choices).length; return s + (p > 0 ? p * Math.log2(p) : 0); }, 0)).toFixed(2) : '—'} bits</Text>
          <Text style={{ color: '#E91E63', fontSize: 9, fontFamily: 'monospace' }}>CONSISTENCY_SCORE: {matches.length > 0 && topMatch ? ((topMatch[1] / ASPECTS.length) * 100).toFixed(0) : '—'}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  questionCard: { padding: 18, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 14, justifyContent: 'center' },
  optBtn: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  matchPreview: { padding: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.02)' },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md, borderWidth: 1 },
  topMatchCard: { padding: 20, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 4 },
  miniBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  choiceSummary: { padding: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.02)' },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#0A0818', borderRadius: RADIUS.sm, borderWidth: 1 },
});
