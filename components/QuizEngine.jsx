import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { soundCorrect, soundWrong, soundCelebration, soundTap, soundTick } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import XPToast from './ui/XPToast';
import { XP_REWARDS } from '../constants/xpSystem';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
//  QUIZ ENGINE — 10 questions, gamified
// ─────────────────────────────────────────────

const QUESTION_TIME = 30; // seconds per question

export default function QuizEngine({
  quiz,
  accentColor,
  onComplete,   // (score, total, timeSeconds, isPerfect) => void
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answers, setAnswers] = useState([]); // {correct: bool}[]
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  const timerRef = useRef(null);
  const questionAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = quiz.map(() => useRef(new Animated.Value(0)).current);
  const correctAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animateIn();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [currentQ]);

  const animateIn = () => {
    questionAnim.setValue(0);
    Animated.parallel([
      Animated.spring(questionAnim, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
      ...optionAnims.map((a, i) => {
        a.setValue(0);
        return Animated.spring(a, {
          toValue: 1, tension: 60, friction: 14,
          delay: 100 + i * 60,
          useNativeDriver: true,
        });
      }),
    ]).start();
  };

  const startTimer = () => {
    setTimeLeft(QUESTION_TIME);
    timerAnim.setValue(1);
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
    if (!answered) {
      handleAnswer(-1); // -1 = timed out
    }
  };

  const handleAnswer = (optionIndex) => {
    if (answered) return;
    clearInterval(timerRef.current);
    soundTap();
    setSelected(optionIndex);
    setAnswered(true);

    const q = quiz[currentQ];
    const isCorrect = optionIndex === q.answer;

    setAnswers(prev => [...prev, { correct: isCorrect }]);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(s => Math.max(s, newStreak));
      setScore(s => s + 1);
      soundCorrect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // XP reward
      const xp = XP_REWARDS.quizCorrect + (newStreak > 2 ? newStreak * 5 : 0);
      setXpAmount(xp);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2000);

      // Scale animation
      Animated.sequence([
        Animated.spring(correctAnim, { toValue: 1.05, tension: 200, friction: 8, useNativeDriver: true }),
        Animated.spring(correctAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();

      // Streak bounce
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

      // Shake animation
      Animated.sequence([
        Animated.timing(questionAnim, { toValue: 0.97, duration: 60, useNativeDriver: true }),
        Animated.timing(questionAnim, { toValue: 1.02, duration: 60, useNativeDriver: true }),
        Animated.timing(questionAnim, { toValue: 0.98, duration: 60, useNativeDriver: true }),
        Animated.spring(questionAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();
    }

    // Update progress bar
    Animated.spring(progressAnim, {
      toValue: (currentQ + 1) / quiz.length,
      tension: 60, friction: 14, useNativeDriver: false,
    }).start();

    // Auto-advance after delay
    setTimeout(() => advanceQuestion(isCorrect), 2000);
  };

  const advanceQuestion = (wasCorrect) => {
    const isLast = currentQ === quiz.length - 1;
    if (isLast) {
      const finalScore = score + (wasCorrect ? 1 : 0);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const isPerfect = finalScore === quiz.length;
      if (isPerfect) soundCelebration();
      setFinished(true);
      onComplete(finalScore, quiz.length, timeTaken, isPerfect);
    } else {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) return null;

  const q = quiz[currentQ];
  const timerPct = timeLeft / QUESTION_TIME;
  const timerColor = timerPct > 0.5 ? accentColor : timerPct > 0.25 ? COLORS.warning : COLORS.wrong;

  return (
    <View style={styles.root}>
      {/* XP Toast */}
      <XPToast amount={xpAmount} label="Correct!" visible={showXP} accentColor={accentColor} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          {/* Progress */}
          <View style={styles.progressWrap}>
            <Animated.View style={[
              styles.progressFill,
              { width: progressAnim.interpolate({ inputRange: [0,1], outputRange: ['0%', '100%'] }), backgroundColor: accentColor }
            ]} />
          </View>
          <Text style={[styles.qCounter, { color: accentColor }]}>
            {currentQ + 1}/{quiz.length}
          </Text>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {/* Score */}
          <View style={styles.statBubble}>
            <Text style={styles.statBubbleLabel}>Score</Text>
            <Text style={[styles.statBubbleValue, { color: COLORS.correct }]}>{score}</Text>
          </View>

          {/* Timer */}
          <View style={[styles.timerCircle, { borderColor: timerColor }]}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}</Text>
          </View>

          {/* Streak */}
          <Animated.View style={[styles.statBubble, { transform: [{ scale: streakAnim }] }]}>
            <Text style={styles.statBubbleLabel}>Streak</Text>
            <Text style={[styles.statBubbleValue, { color: streak > 0 ? COLORS.warning : COLORS.textMuted }]}>
              {streak > 0 ? `🔥${streak}` : '—'}
            </Text>
          </Animated.View>
        </View>

        {/* ── Question ── */}
        <Animated.View style={[
          styles.questionCard,
          {
            opacity: questionAnim,
            transform: [
              { scale: correctAnim },
              { translateY: questionAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) },
            ],
            borderColor: accentColor + '30',
          }
        ]}>
          <BlurView intensity={18} tint="dark" style={styles.questionBlur}>
            <Text style={styles.questionNum}>Question {currentQ + 1}</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </BlurView>
        </Animated.View>

        {/* ── Options ── */}
        <View style={styles.optionsWrap}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === q.answer;
            const showCorrect = answered && isCorrectAnswer;
            const showWrong = answered && isSelected && !isCorrectAnswer;
            const isTimedOut = answered && selected === -1;

            let borderColor = COLORS.glassBorder;
            let bgColor = COLORS.glass1;
            let textColor = COLORS.textSecondary;

            if (showCorrect) {
              borderColor = COLORS.correct;
              bgColor = COLORS.correctGlow;
              textColor = COLORS.correct;
            } else if (showWrong) {
              borderColor = COLORS.wrong;
              bgColor = COLORS.wrongGlow;
              textColor = COLORS.wrong;
            } else if (!answered && isSelected) {
              borderColor = accentColor;
              bgColor = accentColor + '15';
              textColor = accentColor;
            }

            return (
              <Animated.View key={i} style={{
                opacity: optionAnims[i] || 1,
                transform: [{
                  translateX: (optionAnims[i] || { interpolate: () => 0 }).interpolate
                    ? optionAnims[i].interpolate({ inputRange: [0,1], outputRange: [30, 0] })
                    : 0,
                }],
              }}>
                <TouchableOpacity
                  onPress={() => handleAnswer(i)}
                  disabled={answered}
                  style={[
                    styles.option,
                    { borderColor, backgroundColor: bgColor },
                  ]}
                  activeOpacity={0.75}
                >
                  {/* Option letter */}
                  <View style={[
                    styles.optionLetter,
                    { borderColor, backgroundColor: showCorrect ? COLORS.correct + '20' : showWrong ? COLORS.wrong + '20' : COLORS.glass1 }
                  ]}>
                    <Text style={[styles.optionLetterText, { color: textColor }]}>
                      {['A','B','C','D'][i]}
                    </Text>
                  </View>

                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>

                  {/* Result icon */}
                  {showCorrect && <Text style={styles.resultIcon}>✓</Text>}
                  {showWrong && <Text style={styles.resultIcon}>✗</Text>}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Explanation (after answer) ── */}
        {answered && (
          <Animated.View style={[
            styles.explanationCard,
            { borderColor: answered && selected === q.answer ? COLORS.correct + '40' : COLORS.wrong + '40' }
          ]}>
            <BlurView intensity={15} tint="dark" style={styles.explanationBlur}>
              <Text style={styles.explanationLabel}>
                {selected === q.answer ? '✅ Correct!' : selected === -1 ? '⏰ Time's up!' : '❌ Not quite...'}
              </Text>
              <Text style={styles.explanationText}>{q.explanation}</Text>
            </BlurView>
          </Animated.View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.md,
  },
  progressWrap: {
    flex: 1, height: 6,
    backgroundColor: COLORS.glass3,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  qCounter: { fontFamily: FONTS.mono, fontSize: 13 },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statBubble: {
    alignItems: 'center',
    backgroundColor: COLORS.glass1,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    paddingHorizontal: 16, paddingVertical: 8,
    minWidth: 70,
  },
  statBubbleLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted },
  statBubbleValue: { fontFamily: FONTS.displayMedium, fontSize: 18 },

  timerCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.glass1,
  },
  timerNum: { fontFamily: FONTS.display, fontSize: 20 },

  // Question
  questionCard: {
    borderRadius: RADIUS.xl, borderWidth: 1,
    overflow: 'hidden', marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  questionBlur: {
    padding: SPACING.lg,
    backgroundColor: COLORS.glass1,
  },
  questionNum: {
    fontFamily: FONTS.bodyMedium, fontSize: 12,
    color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 10,
  },
  questionText: {
    fontFamily: FONTS.displayMedium, fontSize: 18,
    color: COLORS.textPrimary, lineHeight: 26,
  },

  // Options
  optionsWrap: { gap: 10, marginBottom: SPACING.md },
  option: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: 14, gap: 12,
    ...SHADOWS.soft,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  optionLetterText: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  optionText: { flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 15, lineHeight: 20 },
  resultIcon: { fontSize: 18 },

  // Explanation
  explanationCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    overflow: 'hidden', ...SHADOWS.soft,
  },
  explanationBlur: { padding: SPACING.md, backgroundColor: COLORS.glass1 },
  explanationLabel: {
    fontFamily: FONTS.displayMedium, fontSize: 14,
    color: COLORS.textPrimary, marginBottom: 8,
  },
  explanationText: {
    fontFamily: FONTS.body, fontSize: 14,
    color: COLORS.textSecondary, lineHeight: 22,
  },
});
