import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;

const QUESTIONS = [
  { text: "I feel connected to something larger than myself", dimension: 'spiritual' },
  { text: "I attend organized religious services regularly", dimension: 'religious' },
  { text: "I find meaning through meditation or nature, not scripture", dimension: 'spiritual' },
  { text: "I believe in specific religious doctrines (resurrection, karma, etc.)", dimension: 'religious' },
  { text: "I've had experiences of awe that felt transcendent or sacred", dimension: 'spiritual' },
  { text: "Community worship is essential to my spiritual life", dimension: 'religious' },
  { text: "I prefer exploring many traditions rather than following one", dimension: 'spiritual' },
  { text: "Sacred texts contain literal divine truth", dimension: 'religious' },
  { text: "I practice mindfulness, breathwork, or contemplation regularly", dimension: 'spiritual' },
  { text: "I follow specific religious moral rules (dietary, dress, Sabbath)", dimension: 'religious' },
  { text: "I feel the divine most strongly in nature, art, or silence", dimension: 'spiritual' },
  { text: "Being part of a religious community gives my life structure", dimension: 'religious' },
];

const SCALE_OPTIONS = [
  { label: 'Strongly Disagree', value: 1, color: '#F44336' },
  { label: 'Disagree', value: 2, color: '#FF9800' },
  { label: 'Neutral', value: 3, color: '#FFC107' },
  { label: 'Agree', value: 4, color: '#8BC34A' },
  { label: 'Strongly Agree', value: 5, color: '#4CAF50' },
];

export default function SpiritualityVsReligionLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border1 = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [gameState, setGameState] = useState('QUIZ'); // QUIZ, RESULTS

  const q = QUESTIONS[currentQ];
  const answered = answers[currentQ] !== undefined;

  const handleAnswer = (val) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers(prev => ({ ...prev, [currentQ]: val }));
  };

  const nextQ = () => {
    if (currentQ >= QUESTIONS.length - 1) {
      setGameState('RESULTS');
      soundSuccess();
      if (onLabBreaker) onLabBreaker();
      return;
    }
    soundWhoosh();
    setCurrentQ(prev => prev + 1);
  };

  const prevQ = () => {
    if (currentQ <= 0) return;
    soundWhoosh();
    setCurrentQ(prev => prev - 1);
  };

  const resetGame = () => {
    soundWhoosh();
    setAnswers({}); setCurrentQ(0); setGameState('QUIZ');
  };

  // Calculate scores
  const spiritualScore = QUESTIONS.reduce((sum, q, i) => q.dimension === 'spiritual' ? sum + (answers[i] || 3) : sum, 0);
  const religiousScore = QUESTIONS.reduce((sum, q, i) => q.dimension === 'religious' ? sum + (answers[i] || 3) : sum, 0);
  const maxScore = 6 * 5; // 6 questions per dimension * max 5

  const sPct = (spiritualScore / maxScore) * 100;
  const rPct = (religiousScore / maxScore) * 100;

  let quadrant = 'Seeker';
  let quadEmoji = '🔍';
  let quadColor = '#6366F1';
  let quadDesc = '';

  if (sPct > 55 && rPct > 55) {
    quadrant = 'Integrated Mystic'; quadEmoji = '🌀'; quadColor = '#E91E63';
    quadDesc = 'You value both personal experience AND communal tradition. This is historically the position of the great mystics across all religions.';
  } else if (sPct > 55 && rPct <= 55) {
    quadrant = 'Free Spirit'; quadEmoji = '✨'; quadColor = '#9C27B0';
    quadDesc = 'You seek direct experience of the sacred outside of institutions. Your path is personal, fluid, and experiential. Watch out for lack of structure!';
  } else if (sPct <= 55 && rPct > 55) {
    quadrant = 'Faithful Institutionalist'; quadEmoji = '🏛️'; quadColor = '#2196F3';
    quadDesc = 'You find meaning through community, tradition, and structure. Your rootedness gives stability. Seek deeper personal experience to complement it.';
  } else {
    quadrant = 'Secular Humanist'; quadEmoji = '🌍'; quadColor = '#607D8B';
    quadDesc = 'You find meaning through reason, human connection, and this-worldly pursuits. Ethics and community matter more than metaphysics to you.';
  }

  return (
    <View style={styles.container}>
      {gameState === 'QUIZ' && (
        <>
          <View style={[styles.headerBox, { borderColor: border1, backgroundColor: isDark ? '#0A0A18' : '#F5F5FF' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>
                QUESTION {currentQ + 1} / {QUESTIONS.length}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: q.dimension === 'spiritual' ? '#9C27B0' : '#2196F3' }}>
                {q.dimension === 'spiritual' ? '✨ Spiritual Dimension' : '🏛️ Religious Dimension'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
              {QUESTIONS.map((_, i) => (
                <View key={i} style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: answers[i] !== undefined ? '#4CAF50' : i === currentQ ? '#FFF' : '#333',
                }} />
              ))}
            </View>
          </View>

          {/* QUESTION */}
          <View style={[styles.questionCard, { borderColor: border1, backgroundColor: isDark ? '#111120' : '#FAFAFF' }]}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center', lineHeight: 21 }}>
              "{q.text}"
            </Text>
          </View>

          {/* SCALE */}
          <View style={{ gap: 6, marginBottom: 14 }}>
            {SCALE_OPTIONS.map(opt => {
              const isSelected = answers[currentQ] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.scaleBtn, {
                    borderColor: isSelected ? opt.color : border1,
                    backgroundColor: isSelected ? opt.color + '20' : glass1,
                  }]}
                  onPress={() => handleAnswer(opt.value)}
                >
                  <View style={[styles.scaleDot, { backgroundColor: isSelected ? opt.color : '#333', width: isSelected ? 16 : 12, height: isSelected ? 16 : 12 }]} />
                  <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: isSelected ? opt.color : txtM, flex: 1 }}>{opt.label}</Text>
                  {isSelected && <Text style={{ fontSize: 12 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* NAV */}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            {currentQ > 0 && (
              <TouchableOpacity style={[styles.navBtn, { borderColor: border1 }]} onPress={prevQ}>
                <Text style={{ color: txt2, fontFamily: FONTS.displayBold }}>← Back</Text>
              </TouchableOpacity>
            )}
            {answered && (
              <TouchableOpacity style={[styles.navBtn, { borderColor: '#6366F160', backgroundColor: '#6366F115' }]} onPress={nextQ}>
                <Text style={{ color: '#6366F1', fontFamily: FONTS.displayBold }}>
                  {currentQ >= QUESTIONS.length - 1 ? 'See My Compass →' : 'Next →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {gameState === 'RESULTS' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* COMPASS VISUALIZATION */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Svg width={SIM_W} height={SIM_W * 0.7}>
              <Rect x={0} y={0} width={SIM_W} height={SIM_W * 0.7} rx={12} fill={glass1} stroke={border1} />
              
              {/* Quadrant Grid */}
              <Line x1={SIM_W/2} y1={20} x2={SIM_W/2} y2={SIM_W * 0.7 - 20} stroke={border1} strokeDasharray="4 4" />
              <Line x1={20} y1={SIM_W * 0.35} x2={SIM_W - 20} y2={SIM_W * 0.35} stroke={border1} strokeDasharray="4 4" />

              {/* Axis Labels */}
              <SvgText x={SIM_W/2} y={15} fill={txtM} fontSize={8} textAnchor="middle">HIGH RELIGIOUS →</SvgText>
              <SvgText x={15} y={SIM_W * 0.35} fill={txtM} fontSize={8} textAnchor="middle" rotation="-90" originX={15} originY={SIM_W * 0.35}>↑ SPIRITUAL</SvgText>

              {/* Quadrant Labels */}
              <SvgText x={SIM_W * 0.25} y={SIM_W * 0.2} fill="#9C27B0" fontSize={8} textAnchor="middle" opacity={0.6}>Free Spirit</SvgText>
              <SvgText x={SIM_W * 0.75} y={SIM_W * 0.2} fill="#E91E63" fontSize={8} textAnchor="middle" opacity={0.6}>Mystic</SvgText>
              <SvgText x={SIM_W * 0.25} y={SIM_W * 0.55} fill="#607D8B" fontSize={8} textAnchor="middle" opacity={0.6}>Secular</SvgText>
              <SvgText x={SIM_W * 0.75} y={SIM_W * 0.55} fill="#2196F3" fontSize={8} textAnchor="middle" opacity={0.6}>Institutional</SvgText>

              {/* User Position */}
              <Circle
                cx={20 + (SIM_W - 40) * (rPct / 100)}
                cy={SIM_W * 0.7 - 20 - (SIM_W * 0.7 - 40) * (sPct / 100)}
                r={12}
                fill={quadColor}
                stroke="#FFF"
                strokeWidth={2}
              />
              <SvgText
                x={20 + (SIM_W - 40) * (rPct / 100)}
                y={SIM_W * 0.7 - 15 - (SIM_W * 0.7 - 40) * (sPct / 100)}
                fill="#FFF"
                fontSize={10}
                textAnchor="middle"
              >YOU</SvgText>
            </Svg>
          </View>

          {/* RESULT */}
          <View style={[styles.resultCard, { borderColor: quadColor + '40', backgroundColor: quadColor + '08' }]}>
            <Text style={{ fontSize: 30, textAlign: 'center' }}>{quadEmoji}</Text>
            <Text style={{ fontSize: 18, fontFamily: FONTS.displayBold, color: quadColor, textAlign: 'center', marginVertical: 6 }}>{quadrant}</Text>
            <Text style={{ fontSize: 12, color: txt2, textAlign: 'center', lineHeight: 18 }}>{quadDesc}</Text>
          </View>

          {/* SCORES */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={[styles.scoreBox, { borderColor: '#9C27B040', flex: 1 }]}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>SPIRITUAL</Text>
              <Text style={{ fontSize: 20, fontFamily: FONTS.displayBold, color: '#9C27B0' }}>{sPct.toFixed(0)}%</Text>
              <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 4 }]}>
                <View style={{ height: '100%', width: `${sPct}%`, backgroundColor: '#9C27B0', borderRadius: 2 }} />
              </View>
            </View>
            <View style={[styles.scoreBox, { borderColor: '#2196F340', flex: 1 }]}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>RELIGIOUS</Text>
              <Text style={{ fontSize: 20, fontFamily: FONTS.displayBold, color: '#2196F3' }}>{rPct.toFixed(0)}%</Text>
              <View style={[styles.barBg, { backgroundColor: glass1, width: '100%', marginTop: 4 }]}>
                <View style={{ height: '100%', width: `${rPct}%`, backgroundColor: '#2196F3', borderRadius: 2 }} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: '#FFF', fontFamily: FONTS.displayBold }}>Retake Assessment 🔄</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border1 }]}>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>SPIRITUAL_RAW: {spiritualScore}/{maxScore} | RELIGIOUS_RAW: {religiousScore}/{maxScore}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>QUADRANT: {quadrant} | CERTAINTY: {Math.abs(sPct - rPct).toFixed(0)}%</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>JUNG_ARCHETYPE: {sPct > rPct ? 'INTROVERTED_INTUITIVE' : 'EXTROVERTED_SENSING'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  questionCard: { padding: 20, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 14, minHeight: 80, justifyContent: 'center' },
  scaleBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, gap: 10 },
  scaleDot: { borderRadius: 8 },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md, borderWidth: 1 },
  resultCard: { padding: 20, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16 },
  scoreBox: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  barBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  resetBtn: { marginTop: 8, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#0A0A18', borderRadius: RADIUS.sm, borderWidth: 1 },
});
