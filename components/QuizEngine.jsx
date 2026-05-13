import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundCorrect, soundWrong, soundCelebration, soundTap, soundTick, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import XPToast from './ui/XPToast';
import { XP_REWARDS } from '../constants/xpSystem';
import Icon from './ui/Icons';
import MarkdownText from './ui/MarkdownText';

const { width } = Dimensions.get('window');

const QUESTION_TIME = 30;
const MAX_OPTIONS   = 4;

export default function QuizEngine({ quiz, accentColor, onComplete }) {
  const { theme, isDark } = useTheme();

  // Theme tokens
  const bg     = theme.bg.surface;
  const txt1   = theme.text.primary;
  const txt2   = theme.text.secondary;
  const txtM   = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const glass3 = theme.glass.strong;
  const border = theme.glass.border;
  const correct    = theme.status.correct;
  const correctGlow = theme.status.correctGlow;
  const wrong      = theme.status.wrong;
  const wrongGlow  = theme.status.wrongGlow;
  const warning    = theme.status.warning;
  const gold       = theme.accent.gold;

  const [currentQ, setCurrentQ]     = useState(0);
  const [selected, setSelected]     = useState(null);
  const [answered, setAnswered]     = useState(false);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [maxStreak, setMaxStreak]   = useState(0);
  const [answers, setAnswers]       = useState([]);
  const [timeLeft, setTimeLeft]     = useState(QUESTION_TIME);
  const [showXP, setShowXP]         = useState(false);
  const [xpAmount, setXpAmount]     = useState(0);
  const [finished, setFinished]     = useState(false);
  const [startTime]                 = useState(Date.now());

  const timerRef      = useRef(null);
  const questionAnim  = useRef(new Animated.Value(0)).current;
  const correctAnim   = useRef(new Animated.Value(1)).current;
  const progressAnim  = useRef(new Animated.Value(0)).current;
  const streakAnim    = useRef(new Animated.Value(1)).current;
  const explainAnim   = useRef(new Animated.Value(0)).current;

  const optionAnims = useMemo(
    () => Array.from({ length: MAX_OPTIONS }, () => new Animated.Value(0)),
    []
  );

  useEffect(() => {
    animateIn();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentQ]);

  const animateIn = () => {
    questionAnim.setValue(0);
    explainAnim.setValue(0);
    optionAnims.forEach((a, i) => {
      a.setValue(0);
      Animated.spring(a, {
        toValue: 1, tension: 60, friction: 14, delay: 100 + i * 60, useNativeDriver: true,
      }).start();
    });
    Animated.spring(questionAnim, {
      toValue: 1, tension: 60, friction: 14, useNativeDriver: true,
    }).start();
  };

  const startTimer = () => {
    setTimeLeft(QUESTION_TIME);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 10) soundTick();
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (!answeredRef.current) handleAnswer(-1);
  };

  const answeredRef = useRef(false);
  useEffect(() => { answeredRef.current = answered; }, [answered]);

  const handleAnswer = (optionIndex) => {
    if (answeredRef.current) return;
    clearInterval(timerRef.current);
    soundTap();
    setSelected(optionIndex);
    setAnswered(true);
    answeredRef.current = true;

    const q = quiz[currentQ];
    const isCorrect = optionIndex === q.answer;
    setAnswers(prev => [...prev, { correct: isCorrect }]);

    Animated.timing(explainAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(s => Math.max(s, newStreak));
      setScore(s => s + 1);
      soundCorrect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const xp = 10;
      setXpAmount(xp);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2000);

      Animated.sequence([
        Animated.spring(correctAnim, { toValue: 1.05, tension: 200, friction: 8, useNativeDriver: true }),
        Animated.spring(correctAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();

      if (newStreak > 1) {
        Animated.sequence([
          Animated.spring(streakAnim, { toValue: 1.3, tension: 300, friction: 6, useNativeDriver: true }),
          Animated.spring(streakAnim, { toValue: 1, tension: 300, friction: 6, useNativeDriver: true }),
        ]).start();
      }
    } else {
      setStreak(0);
      soundWrong();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Animated.sequence([
        Animated.timing(questionAnim, { toValue: 0.97, duration: 60, useNativeDriver: true }),
        Animated.timing(questionAnim, { toValue: 1.02, duration: 60, useNativeDriver: true }),
        Animated.timing(questionAnim, { toValue: 0.98, duration: 60, useNativeDriver: true }),
        Animated.spring(questionAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();
    }

    Animated.spring(progressAnim, {
      toValue: (currentQ + 1) / quiz.length,
      tension: 60, friction: 14, useNativeDriver: false,
    }).start();
  };

  const onNextQuestion = () => {
    soundWhoosh();
    advanceQuestion();
  };

  const advanceQuestion = () => {
    const isLast = currentQ === quiz.length - 1;
    if (isLast) {
      // Score is already updated by handleAnswer, so use the answers array
      // to compute the final score accurately (avoids double-counting).
      const finalScore = answers.reduce((sum, a) => sum + (a.correct ? 1 : 0), 0);
      const timeTaken  = Math.round((Date.now() - startTime) / 1000);
      const isPerfect  = finalScore === quiz.length;
      if (isPerfect) soundCelebration();
      setFinished(true);
      onComplete(finalScore, quiz.length, timeTaken, isPerfect);
    } else {
      answeredRef.current = false;
      setCurrentQ(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished || !quiz || quiz.length === 0) return null;

  const q = quiz[currentQ];
  const timerPct   = timeLeft / QUESTION_TIME;
  const timerColor = timerPct > 0.5 ? accentColor : timerPct > 0.25 ? warning : wrong;

  const isCorrectAnswer = selected === q.answer;
  const isTimeout       = selected === -1;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <XPToast amount={xpAmount} label="Correct!" visible={showXP} accentColor={accentColor} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Top bar ──────────────────────────── */}
        <View style={styles.topBar}>
          <View style={[styles.progressWrap, { backgroundColor: glass3 }]}>
            <Animated.View style={[
              styles.progressFill,
              { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: accentColor }
            ]} />
          </View>
          <Text style={[styles.qCounter, { color: accentColor }]}>
            {currentQ + 1}/{quiz.length}
          </Text>
        </View>

        {/* ── Stats row ──────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statBubble, { backgroundColor: glass1, borderColor: border }]}>
            <Icon name="trophy" size={14} color={gold} />
            <Text style={[styles.statBubbleLabel, { color: txtM }]}>Score</Text>
            <Text style={[styles.statBubbleValue, { color: correct }]}>{score}</Text>
          </View>

          <View style={[styles.timerCircle, { borderColor: timerColor, backgroundColor: glass1 }]}>
            <Icon name="clock" size={14} color={timerColor} />
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
          </View>

          <Animated.View style={[styles.statBubble, { backgroundColor: glass1, borderColor: border, transform: [{ scale: streakAnim }] }]}>
            <Icon name="flame" size={14} color={streak > 0 ? '#FF9F1C' : txtM} />
            <Text style={[styles.statBubbleLabel, { color: txtM }]}>Streak</Text>
            <Text style={[styles.statBubbleValue, { color: streak > 0 ? warning : txtM }]}>
              {streak > 0 ? `×${streak}` : '—'}
            </Text>
          </Animated.View>
        </View>

        {/* ── Question card ──────────────────────── */}
        <Animated.View style={[
          styles.questionCard,
          {
            opacity: questionAnim,
            borderColor: accentColor + '30',
            backgroundColor: glass2,
            transform: [
              { scale: correctAnim },
              { translateY: questionAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            ],
          }
        ]}>
          <View style={styles.questionNumRow}>
            <View style={[styles.questionNumBadge, { backgroundColor: accentColor + '20', borderColor: accentColor + '35' }]}>
              <Text style={[styles.questionNum, { color: accentColor }]}>Q{currentQ + 1}</Text>
            </View>
            <View style={styles.questionDiffRow}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.diffDot, { backgroundColor: i < 2 ? accentColor : accentColor + '30' }]} />
              ))}
            </View>
          </View>
          <MarkdownText style={[styles.questionText, { color: txt1 }]} highlightColor="#FFD166">{q.question}</MarkdownText>
        </Animated.View>

        {/* ── Options ──────────────────────────────── */}
        <View style={styles.optionsWrap}>
          {q.options.map((opt, i) => {
            const isSelected   = selected === i;
            const isCorrectOpt = i === q.answer;
            const showCorrectO = answered && isCorrectOpt;
            const showWrongO   = answered && isSelected && !isCorrectOpt;

            let borderC = border;
            let bgColor = glass1;
            let textC   = txt2;

            if (showCorrectO) {
              borderC = correct; bgColor = correctGlow; textC = correct;
            } else if (showWrongO) {
              borderC = wrong; bgColor = wrongGlow; textC = wrong;
            } else if (!answered && isSelected) {
              borderC = accentColor; bgColor = accentColor + '15'; textC = accentColor;
            }

            const anim = optionAnims[i] || new Animated.Value(1);

            return (
              <Animated.View key={i} style={{
                opacity: anim,
                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              }}>
                <TouchableOpacity
                  onPress={() => handleAnswer(i)}
                  disabled={answered}
                  style={[styles.option, { borderColor: borderC, backgroundColor: bgColor }]}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionLetter, {
                    borderColor: borderC,
                    backgroundColor: showCorrectO ? correct + '20' : showWrongO ? wrong + '20' : glass1,
                  }]}>
                    <Text style={[styles.optionLetterText, { color: textC }]}>
                      {['A', 'B', 'C', 'D'][i]}
                    </Text>
                  </View>

                  <MarkdownText style={[styles.optionText, { color: textC }]} highlightColor="#FFD166">{opt}</MarkdownText>

                  {showCorrectO && (
                    <View style={[styles.resultIconWrap, { backgroundColor: correct + '20' }]}>
                      <Icon name="check" size={14} color={correct} />
                    </View>
                  )}
                  {showWrongO && (
                    <View style={[styles.resultIconWrap, { backgroundColor: wrong + '20' }]}>
                      <Icon name="cross" size={14} color={wrong} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Explanation ─────────────────────────── */}
        {answered && (
          <Animated.View style={[
            styles.explanationCard,
            {
              opacity: explainAnim,
              borderColor: isCorrectAnswer ? correct + '40' : wrong + '40',
              backgroundColor: glass2,
              transform: [{ translateY: explainAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            }
          ]}>
            <View style={styles.explanationHeader}>
              {isTimeout ? (
                <>
                  <View style={[styles.explanationIconWrap, { backgroundColor: warning + '20' }]}>
                    <Icon name="clock" size={16} color={warning} />
                  </View>
                  <Text style={[styles.explanationLabel, { color: warning }]}>Time's Up!</Text>
                </>
              ) : isCorrectAnswer ? (
                <>
                  <View style={[styles.explanationIconWrap, { backgroundColor: correct + '20' }]}>
                    <Icon name="check" size={16} color={correct} />
                  </View>
                  <Text style={[styles.explanationLabel, { color: correct }]}>Correct!</Text>
                </>
              ) : (
                <>
                  <View style={[styles.explanationIconWrap, { backgroundColor: wrong + '20' }]}>
                    <Icon name="cross" size={16} color={wrong} />
                  </View>
                  <Text style={[styles.explanationLabel, { color: wrong }]}>Not quite...</Text>
                </>
              )}
            </View>
            <MarkdownText style={[styles.explanationText, { color: txt2 }]} highlightColor="#FFD166">{q.explanation}</MarkdownText>
            
            <TouchableOpacity onPress={onNextQuestion} style={[styles.nextQBtn, { backgroundColor: accentColor }]}>
              <Text style={styles.nextQBtnText}>
                {currentQ === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.md },
  progressWrap: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  qCounter: { fontSize: 13, minWidth: 36, textAlign: 'right', fontFamily: FONTS.bodyMedium },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md, gap: 8,
  },
  statBubble: {
    flex: 1, alignItems: 'center', borderRadius: RADIUS.md,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 2,
  },
  statBubbleLabel: { fontFamily: FONTS.body, fontSize: 10, marginTop: 2 },
  statBubbleValue: { fontFamily: FONTS.displayMedium, fontSize: 18 },

  timerCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: 2,
  },
  timerNum: { fontFamily: FONTS.display, fontSize: 18, lineHeight: 20 },

  questionCard: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg,
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  questionNumRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  questionNumBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1,
  },
  questionNum: { fontFamily: FONTS.bodyMedium, fontSize: 11, letterSpacing: 0.5 },
  questionDiffRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  questionText: { fontFamily: FONTS.displayMedium, fontSize: 18, lineHeight: 28 },

  optionsWrap: { gap: 10, marginBottom: SPACING.md },
  option: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.lg, borderWidth: 1, padding: 14, gap: 12,
  },
  optionLetter: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optionLetterText: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  optionText: { flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 15, lineHeight: 22 },
  resultIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  explanationCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', padding: SPACING.md,
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  explanationIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  explanationLabel: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  explanationText: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 22, paddingBottom: 16 },
  nextQBtn: {
    paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 10,
  },
  nextQBtnText: {
    fontFamily: FONTS.displayMedium, fontSize: 15, color: '#FFFFFF',
  },
});