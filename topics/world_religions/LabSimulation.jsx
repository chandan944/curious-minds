import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;

const RELIGIONS = [
  { name: 'Christianity', emoji: '✝️', color: '#2196F3', followers: '2.4B' },
  { name: 'Islam', emoji: '☪️', color: '#4CAF50', followers: '1.9B' },
  { name: 'Hinduism', emoji: '🕉️', color: '#FF9800', followers: '1.2B' },
  { name: 'Buddhism', emoji: '☸️', color: '#FF5722', followers: '500M' },
  { name: 'Judaism', emoji: '✡️', color: '#6366F1', followers: '15M' },
  { name: 'Sikhism', emoji: '☬', color: '#FFC107', followers: '30M' },
];

const QUESTIONS = [
  {
    topic: 'Is there a God?',
    emoji: '🔮',
    answers: {
      Christianity: 'Yes — a personal God (Trinity: Father, Son, Holy Spirit)',
      Islam: 'Yes — one indivisible God (Allah). No Trinity.',
      Hinduism: 'One ultimate reality (Brahman) with infinite manifestations.',
      Buddhism: 'The question is irrelevant to ending suffering.',
      Judaism: 'Yes — one God with a covenant with the Jewish people.',
      Sikhism: 'Yes — one formless God for ALL of humanity.',
    },
    convergence: 40,
  },
  {
    topic: 'What happens after death?',
    emoji: '💀',
    answers: {
      Christianity: 'Heaven or Hell based on faith in Jesus Christ.',
      Islam: 'Jannah (Paradise) or Jahannam (Hell) based on deeds + faith.',
      Hinduism: 'Reincarnation until Moksha (liberation from cycle).',
      Buddhism: 'Rebirth until Nirvana (cessation of suffering).',
      Judaism: 'Ambiguous — focus is on this life. Some believe in Olam Ha-Ba.',
      Sikhism: 'Reincarnation until union with God through righteous living.',
    },
    convergence: 25,
  },
  {
    topic: 'What is the purpose of life?',
    emoji: '🧭',
    answers: {
      Christianity: 'To love God, follow Jesus, earn eternal salvation.',
      Islam: 'To submit to Allah\'s will and live righteously.',
      Hinduism: 'To fulfill Dharma (duty), accumulate good Karma, achieve Moksha.',
      Buddhism: 'To understand suffering and liberate yourself through the Eightfold Path.',
      Judaism: 'To follow Torah, repair the world (Tikkun Olam), serve God.',
      Sikhism: 'To remember God, serve humanity, and merge with the divine.',
    },
    convergence: 55,
  },
  {
    topic: 'Is violence ever justified?',
    emoji: '⚔️',
    answers: {
      Christianity: 'Turn the other cheek. Just War theory later developed.',
      Islam: 'Self-defense only (Jihad = struggle, not holy war). No aggression.',
      Hinduism: 'Dharma Yuddha (righteous war) for duty, not revenge.',
      Buddhism: 'Non-violence (Ahimsa) is absolute. No exceptions.',
      Judaism: 'Self-defense permitted. Saving a life overrides almost all laws.',
      Sikhism: 'Only as last resort to defend the oppressed (Sant-Sipahi).',
    },
    convergence: 60,
  },
  {
    topic: 'How should we treat the poor?',
    emoji: '🤝',
    answers: {
      Christianity: 'Give generously. "Whatever you did for the least of these, you did for me."',
      Islam: 'Zakat (mandatory 2.5% of wealth to the poor) is a pillar of faith.',
      Hinduism: 'Dana (charity) is sacred duty. Serving others serves God.',
      Buddhism: 'Generosity (Dana) is the first of the Six Perfections.',
      Judaism: 'Tzedakah (charity = justice). Giving is an obligation, not optional.',
      Sikhism: 'Seva (selfless service) and Langar (free food to ALL) are core.',
    },
    convergence: 95,
  },
  {
    topic: 'Is there a holy book?',
    emoji: '📖',
    answers: {
      Christianity: 'The Bible (Old + New Testaments). Inspired by God.',
      Islam: 'The Quran. Believed to be God\'s literal, unaltered word.',
      Hinduism: 'Vedas, Upanishads, Bhagavad Gita — many sacred texts.',
      Buddhism: 'Pali Canon, various Sutras. Teacher\'s words, not divine dictation.',
      Judaism: 'Torah + Talmud. Law + extensive rabbinic commentary.',
      Sikhism: 'Guru Granth Sahib. Treated as a living Guru.',
    },
    convergence: 35,
  },
];

export default function WorldReligionsLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border1 = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [qIndex, setQIndex] = useState(0);
  const [selectedReligion, setSelectedReligion] = useState(null);
  const [questionsExplored, setQuestionsExplored] = useState(new Set());

  const question = QUESTIONS[qIndex];

  const selectReligion = (name) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReligion(name === selectedReligion ? null : name);
    setQuestionsExplored(prev => new Set([...prev, qIndex]));
  };

  const nextQuestion = () => {
    soundWhoosh();
    setSelectedReligion(null);
    setQIndex(prev => (prev + 1) % QUESTIONS.length);
  };
  
  const prevQuestion = () => {
    soundWhoosh();
    setSelectedReligion(null);
    setQIndex(prev => (prev - 1 + QUESTIONS.length) % QUESTIONS.length);
  };

  if (questionsExplored.size >= QUESTIONS.length && onLabBreaker) {
    onLabBreaker();
  }

  // Convergence bar color
  const convColor = question.convergence > 70 ? '#4CAF50' : question.convergence > 40 ? '#FF9800' : '#F44336';

  return (
    <View style={styles.container}>
      {/* QUESTION HEADER */}
      <View style={[styles.questionCard, { borderColor: border1, backgroundColor: isDark ? '#111120' : '#FAFAFF' }]}>
        <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>QUESTION {qIndex + 1} / {QUESTIONS.length}</Text>
        <Text style={{ fontSize: 22, textAlign: 'center', marginVertical: 4 }}>{question.emoji}</Text>
        <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center' }}>{question.topic}</Text>
        
        {/* Convergence meter */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
          <Text style={{ fontSize: 8, fontFamily: FONTS.displayBold, color: txtM }}>AGREEMENT</Text>
          <View style={[styles.barBg, { backgroundColor: glass1, flex: 1 }]}>
            <View style={{ height: '100%', width: `${question.convergence}%`, backgroundColor: convColor, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 9, fontFamily: 'monospace', color: convColor }}>{question.convergence}%</Text>
        </View>
      </View>

      {/* RELIGION BUTTONS */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
        {RELIGIONS.map(r => {
          const isActive = selectedReligion === r.name;
          return (
            <TouchableOpacity
              key={r.name}
              style={[styles.relBtn, {
                borderColor: isActive ? r.color : border1,
                backgroundColor: isActive ? r.color + '20' : glass1,
              }]}
              onPress={() => selectReligion(r.name)}
            >
              <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
              <Text style={{ fontSize: 8, fontFamily: FONTS.displayBold, color: isActive ? r.color : txtM }}>{r.name.substring(0, 6)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ANSWER DISPLAY */}
      {selectedReligion && (
        <View style={[styles.answerCard, { borderColor: RELIGIONS.find(r => r.name === selectedReligion)?.color + '40' || border1, backgroundColor: isDark ? '#0A0A18' : '#F5F5FF' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 18 }}>{RELIGIONS.find(r => r.name === selectedReligion)?.emoji}</Text>
            <Text style={{ fontSize: 13, fontFamily: FONTS.displayBold, color: RELIGIONS.find(r => r.name === selectedReligion)?.color }}>
              {selectedReligion}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: txt2, lineHeight: 19 }}>{question.answers[selectedReligion]}</Text>
        </View>
      )}

      {!selectedReligion && (
        <View style={[styles.answerCard, { borderColor: border1, backgroundColor: isDark ? '#0A0A18' : '#F5F5FF', alignItems: 'center' }]}>
          <Text style={{ fontSize: 12, color: txtM, fontStyle: 'italic' }}>👆 Tap a religion to see its answer</Text>
        </View>
      )}

      {/* COMPARE ALL VIEW */}
      <TouchableOpacity
        onPress={() => {
          soundTap();
          setSelectedReligion(selectedReligion === 'ALL' ? null : 'ALL');
          setQuestionsExplored(prev => new Set([...prev, qIndex]));
        }}
        style={[styles.compareBtn, { borderColor: '#6366F140', backgroundColor: '#6366F110' }]}
      >
        <Text style={{ fontSize: 11, fontFamily: FONTS.displayBold, color: '#6366F1' }}>
          {selectedReligion === 'ALL' ? '🔼 Collapse' : '📊 Compare All Answers'}
        </Text>
      </TouchableOpacity>

      {selectedReligion === 'ALL' && (
        <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
          {RELIGIONS.map(r => (
            <View key={r.name} style={[styles.miniAnswer, { borderColor: r.color + '30' }]}>
              <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: r.color }}>{r.emoji} {r.name}</Text>
              <Text style={{ fontSize: 10, color: txt2, lineHeight: 15, marginTop: 2 }}>{question.answers[r.name]}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* NAVIGATION */}
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: border1 }]} onPress={prevQuestion}>
          <Text style={{ color: txt2, fontFamily: FONTS.displayBold, fontSize: 12 }}>← Prev</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: questionsExplored.has(i) ? '#4CAF50' : i === qIndex ? '#6366F1' : '#333',
              }}
            />
          ))}
        </View>
        <TouchableOpacity style={[styles.navBtn, { borderColor: border1 }]} onPress={nextQuestion}>
          <Text style={{ color: txt2, fontFamily: FONTS.displayBold, fontSize: 12 }}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* EXPLORED STATUS */}
      <Text style={{ textAlign: 'center', fontSize: 9, color: txtM, marginTop: 8 }}>
        {questionsExplored.size} / {QUESTIONS.length} questions explored
      </Text>

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border1 }]}>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>CONVERGENCE_IDX: {question.convergence}% | THEOLOGY_OVERLAP: {(question.convergence / 100 * 0.7 + 0.15).toFixed(3)}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>DEMOGRAPHIC_ENTROPY: {(Math.log2(RELIGIONS.length)).toFixed(2)} bits | EXPLORATION: {((questionsExplored.size / QUESTIONS.length) * 100).toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  questionCard: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  barBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  relBtn: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.sm, borderWidth: 1, minWidth: 55 },
  answerCard: { padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10, minHeight: 70 },
  compareBtn: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', marginBottom: 8 },
  miniAnswer: { padding: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.02)' },
  navBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.sm, borderWidth: 1 },
  sciPanel: { marginTop: 12, padding: 12, backgroundColor: '#0A0A18', borderRadius: RADIUS.sm, borderWidth: 1 },
});
