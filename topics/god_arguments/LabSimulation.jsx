import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, G, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap, soundWhoosh, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 60;
const SIM_H = 180;

const ARGUMENTS = [
  { name: 'Cosmological', side: 'FOR', color: '#2196F3', emoji: '🌌', summary: 'Everything needs a cause → uncaused First Cause = God' },
  { name: 'Design / Fine-Tuning', side: 'FOR', color: '#4CAF50', emoji: '🎯', summary: 'Universal constants are impossibly calibrated for life → implies a designer' },
  { name: 'Moral', side: 'FOR', color: '#E91E63', emoji: '🧭', summary: 'Objective morality exists → requires a moral lawgiver (God)' },
  { name: 'Ontological', side: 'FOR', color: '#9C27B0', emoji: '🧠', summary: 'Greatest conceivable being must exist in reality, not just imagination' },
  { name: 'Religious Experience', side: 'FOR', color: '#FF9800', emoji: '✨', summary: 'Billions report personal divine encounters across all cultures' },
  { name: 'Problem of Evil', side: 'AGAINST', color: '#F44336', emoji: '💀', summary: 'If God is all-powerful + all-good → suffering should not exist. It does.' },
  { name: 'Occam\'s Razor', side: 'AGAINST', color: '#607D8B', emoji: '✂️', summary: 'Natural explanations suffice → God is an unnecessary addition' },
  { name: 'Divine Hiddenness', side: 'AGAINST', color: '#6366F1', emoji: '🫥', summary: 'A loving God would not hide from sincere seekers' },
  { name: 'Poor Design', side: 'AGAINST', color: '#FF5722', emoji: '🦷', summary: 'Biological flaws (blind spots, wisdom teeth) suggest evolution, not design' },
  { name: 'Problem of Hell', side: 'AGAINST', color: '#D32F2F', emoji: '🔥', summary: 'Infinite punishment for finite sins is infinitely disproportionate' },
];

export default function GodArgumentsLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _t = typeof theme !== 'undefined' && theme ? theme : {};
  const txt1 = _t.text?.primary || '#FFFFFF';
  const txt2 = _t.text?.secondary || '#AAAAAA';
  const txtM = _t.text?.muted || '#888888';
  const glass1 = _t.glass?.light || 'rgba(255,255,255,0.05)';
  const border1 = _t.glass?.border || 'rgba(255,255,255,0.15)';

  const [ratings, setRatings] = useState({});
  const [currentArg, setCurrentArg] = useState(0);
  const [gameState, setGameState] = useState('RATING'); // RATING, RESULTS

  const arg = ARGUMENTS[currentArg];
  const currentRating = ratings[arg.name] || 5;

  const setRating = (val) => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRatings(prev => ({ ...prev, [arg.name]: val }));
  };

  const nextArg = () => {
    if (currentArg >= ARGUMENTS.length - 1) {
      setGameState('RESULTS');
      soundSuccess();
      if (Object.keys(ratings).length >= ARGUMENTS.length && onLabBreaker) onLabBreaker();
      return;
    }
    soundWhoosh();
    setCurrentArg(prev => prev + 1);
  };

  const prevArg = () => {
    if (currentArg <= 0) return;
    soundWhoosh();
    setCurrentArg(prev => prev - 1);
  };

  const resetGame = () => {
    soundWhoosh();
    setRatings({}); setCurrentArg(0); setGameState('RATING');
  };

  // Calculate belief spectrum
  const forScore = ARGUMENTS.filter(a => a.side === 'FOR').reduce((sum, a) => sum + (ratings[a.name] || 5), 0);
  const againstScore = ARGUMENTS.filter(a => a.side === 'AGAINST').reduce((sum, a) => sum + (ratings[a.name] || 5), 0);
  const totalFor = ARGUMENTS.filter(a => a.side === 'FOR').length * 10;
  const totalAgainst = ARGUMENTS.filter(a => a.side === 'AGAINST').length * 10;
  const forPct = (forScore / totalFor) * 100;
  const againstPct = (againstScore / totalAgainst) * 100;
  const beliefIndex = ((forPct - againstPct) + 100) / 2; // 0 = strong atheist, 100 = strong theist

  let beliefLabel = 'Agnostic';
  if (beliefIndex > 75) beliefLabel = 'Strong Theist';
  else if (beliefIndex > 60) beliefLabel = 'Leaning Theist';
  else if (beliefIndex > 40) beliefLabel = 'Agnostic';
  else if (beliefIndex > 25) beliefLabel = 'Leaning Atheist';
  else beliefLabel = 'Strong Atheist';

  return (
    <View style={styles.container}>
      {gameState === 'RATING' && (
        <>
          {/* PROGRESS */}
          <View style={[styles.headerBox, { borderColor: border1, backgroundColor: isDark ? '#0A0A18' : '#F5F5FF' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: txtM }}>
                ARGUMENT {currentArg + 1} / {ARGUMENTS.length}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: arg.side === 'FOR' ? '#4CAF50' : '#F44336' }}>
                {arg.side === 'FOR' ? '✓ FOR God' : '✗ AGAINST God'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {ARGUMENTS.map((a, i) => (
                <View key={i} style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: i < currentArg ? (a.side === 'FOR' ? '#4CAF50' : '#F44336') : i === currentArg ? '#FFF' : '#333',
                }} />
              ))}
            </View>
          </View>

          {/* ARGUMENT CARD */}
          <View style={[styles.argCard, { borderColor: arg.color + '40', backgroundColor: arg.color + '08' }]}>
            <Text style={{ fontSize: 28, textAlign: 'center' }}>{arg.emoji}</Text>
            <Text style={{ fontSize: 16, fontFamily: FONTS.displayBold, color: arg.color, textAlign: 'center', marginVertical: 6 }}>{arg.name}</Text>
            <Text style={{ fontSize: 12, color: txt2, textAlign: 'center', lineHeight: 18 }}>{arg.summary}</Text>
          </View>

          {/* RATING SLIDER */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: txtM, marginBottom: 8 }}>
              How STRONG is this argument? (1 = Weak, 10 = Devastating)
            </Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(val => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setRating(val)}
                  style={[styles.ratingDot, {
                    backgroundColor: val <= currentRating ? arg.color : glass1,
                    borderColor: val <= currentRating ? arg.color : border1,
                    width: val <= currentRating ? 28 : 24,
                    height: val <= currentRating ? 28 : 24,
                  }]}
                >
                  <Text style={{ fontSize: 9, fontFamily: FONTS.displayBold, color: val <= currentRating ? '#FFF' : txtM }}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 14, fontFamily: FONTS.displayBold, color: arg.color, marginTop: 6 }}>
              {currentRating}/10
            </Text>
          </View>

          {/* NAVIGATION */}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            {currentArg > 0 && (
              <TouchableOpacity style={[styles.navBtn, { borderColor: border1 }]} onPress={prevArg}>
                <Text style={{ color: txt2, fontFamily: FONTS.displayBold }}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.navBtn, { borderColor: arg.color + '60', backgroundColor: arg.color + '15' }]} onPress={nextArg}>
              <Text style={{ color: arg.color, fontFamily: FONTS.displayBold }}>
                {currentArg >= ARGUMENTS.length - 1 ? 'See My Spectrum →' : 'Next Argument →'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {gameState === 'RESULTS' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 18, fontFamily: FONTS.displayBold, color: txt1, textAlign: 'center', marginBottom: 16 }}>
            Your Belief Spectrum
          </Text>

          {/* SPECTRUM BAR */}
          <Svg width={SIM_W} height={SIM_H}>
            <Rect x={0} y={0} width={SIM_W} height={SIM_H} rx={12} fill={glass1} stroke={border1} />
            
            {/* Spectrum gradient bar */}
            <Rect x={20} y={30} width={SIM_W - 40} height={24} rx={12} fill="#333" />
            <Rect x={20} y={30} width={(SIM_W - 40) * 0.5} height={24} rx={12} fill="#F44336" opacity={0.3} />
            <Rect x={20 + (SIM_W - 40) * 0.5} y={30} width={(SIM_W - 40) * 0.5} height={24} fill="#4CAF50" opacity={0.3} />
            
            {/* Marker */}
            <Circle cx={20 + (SIM_W - 40) * (beliefIndex / 100)} cy={42} r={10} fill="#FFF" stroke="#6366F1" strokeWidth={3} />
            
            {/* Labels */}
            <SvgText x={25} y={72} fill="#F44336" fontSize={8} fontWeight="bold">Strong Atheist</SvgText>
            <SvgText x={SIM_W / 2} y={72} fill={txtM} fontSize={8} textAnchor="middle">Agnostic</SvgText>
            <SvgText x={SIM_W - 25} y={72} fill="#4CAF50" fontSize={8} textAnchor="end" fontWeight="bold">Strong Theist</SvgText>

            {/* Result */}
            <SvgText x={SIM_W / 2} y={100} fill={txt1} fontSize={14} textAnchor="middle" fontWeight="bold">{beliefLabel}</SvgText>
            <SvgText x={SIM_W / 2} y={120} fill={txtM} fontSize={9} textAnchor="middle">Belief Index: {beliefIndex.toFixed(1)} / 100</SvgText>

            {/* Scores */}
            <SvgText x={SIM_W * 0.25} y={150} fill="#4CAF50" fontSize={9} textAnchor="middle">FOR: {forPct.toFixed(0)}%</SvgText>
            <SvgText x={SIM_W * 0.75} y={150} fill="#F44336" fontSize={9} textAnchor="middle">AGAINST: {againstPct.toFixed(0)}%</SvgText>
          </Svg>

          {/* ARGUMENT BREAKDOWN */}
          <Text style={{ fontSize: 12, fontFamily: FONTS.displayBold, color: txt1, marginTop: 16, marginBottom: 8 }}>Your Ratings:</Text>
          {ARGUMENTS.map(a => (
            <View key={a.name} style={[styles.resultRow, { borderColor: a.color + '30' }]}>
              <Text style={{ fontSize: 14, width: 22 }}>{a.emoji}</Text>
              <Text style={{ fontSize: 10, fontFamily: FONTS.displayBold, color: a.color, flex: 1 }}>{a.name}</Text>
              <View style={[styles.miniBar, { backgroundColor: glass1, width: 60 }]}>
                <View style={{ height: '100%', width: `${(ratings[a.name] || 5) * 10}%`, backgroundColor: a.color, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 10, fontFamily: 'monospace', color: a.color, width: 24, textAlign: 'right' }}>{ratings[a.name] || 5}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
            <Text style={{ color: '#FFF', fontFamily: FONTS.displayBold }}>Re-evaluate Arguments 🔄</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {scientistMode && (
        <View style={[styles.sciPanel, { borderColor: border1 }]}>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>BAYESIAN_FOR: {forPct.toFixed(1)}% | BAYESIAN_AGAINST: {againstPct.toFixed(1)}%</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>BELIEF_IDX: {beliefIndex.toFixed(2)} | LABEL: {beliefLabel}</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontFamily: 'monospace' }}>EPISTEMIC_CONFIDENCE: {Math.abs(beliefIndex - 50) < 15 ? 'LOW (Uncertain)' : 'HIGH (Committed)'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.02, paddingBottom: 20 },
  headerBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  argCard: { padding: 20, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  ratingDot: { borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md, borderWidth: 1 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.sm, borderWidth: 1, marginBottom: 4 },
  miniBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#0A0A18', borderRadius: RADIUS.sm, borderWidth: 1 },
});
