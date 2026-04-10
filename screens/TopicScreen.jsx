import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { TOPIC_REGISTRY } from '../constants/topicRegistry';
import { updateTopicProgress, addXP, awardBadge } from '../utils/storage';
import { XP_REWARDS, BADGES } from '../constants/xpSystem';
import CuriosityHook from '../components/CuriosityHook';
import TheoryCards from '../components/TheoryCards';
import DoYouKnowWhy from '../components/DoYouKnowWhy';
import QuizEngine from '../components/QuizEngine';
import QuizResults from '../components/QuizResults';
import StarBackground from '../components/ui/StarBackground';

// Dynamic import for topic configs
const TOPIC_CONFIGS = {
  gravity: () => require('../topics/gravity/config').default,
};

// Dynamic import for lab simulations
const LAB_COMPONENTS = {
  gravity: () => require('../topics/gravity/LabSimulation').default,
};

const STEPS = ['hook', 'theory', 'lab', 'dyk', 'quiz', 'results'];

export default function TopicScreen({ topicId, onBack }) {
  const [step, setStep] = useState('hook');
  const [topicConfig, setTopicConfig] = useState(null);
  const [LabComponent, setLabComponent] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [scientistMode, setScientistMode] = useState(false);
  const [labBreakerTriggered, setLabBreakerTriggered] = useState(false);

  const topicMeta = TOPIC_REGISTRY.find(t => t.id === topicId);

  useEffect(() => {
    // Load topic config
    const getConfig = TOPIC_CONFIGS[topicId];
    if (getConfig) {
      try {
        setTopicConfig(getConfig());
      } catch (e) {
        console.warn('Could not load topic config:', topicId, e);
      }
    }

    // Load lab component
    const getLab = LAB_COMPONENTS[topicId];
    if (getLab) {
      try {
        setLabComponent(() => getLab());
      } catch (e) {
        console.warn('Could not load lab component:', topicId, e);
      }
    }
  }, [topicId]);

  if (!topicConfig || !topicMeta) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading topic...</Text>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = COLORS.topicColors[topicConfig.accentKey]?.primary || COLORS.accent;

  const handleTheoryComplete = async () => {
    await updateTopicProgress(topicId, { theoryRead: true });
    const newXP = await addXP(XP_REWARDS.theoryRead);
    setEarnedXP(prev => prev + XP_REWARDS.theoryRead);
    setStep('lab');
  };

  const handleLabContinue = async () => {
    await updateTopicProgress(topicId, { labVisited: true });
    const newXP = await addXP(XP_REWARDS.labInteraction);
    setEarnedXP(prev => prev + XP_REWARDS.labInteraction);
    setStep('dyk');
  };

  const handleDYKComplete = async () => {
    await updateTopicProgress(topicId, { dykAnswered: true });
    const newXP = await addXP(XP_REWARDS.dykAnswered);
    setEarnedXP(prev => prev + XP_REWARDS.dykAnswered);
    setStep('quiz');
  };

  const handleQuizComplete = async (score, total, timeSeconds, isPerfect) => {
    const xpEarned = score * XP_REWARDS.quizCorrect
      + XP_REWARDS.quizComplete
      + (isPerfect ? XP_REWARDS.quizPerfect : 0)
      + (timeSeconds < 60 ? 20 : 0);

    await addXP(xpEarned);
    setEarnedXP(prev => prev + xpEarned);

    const badges = [];

    // Check badges
    if (isPerfect) {
      const awarded = await awardBadge(BADGES.perfect_quiz.id);
      if (awarded) badges.push(BADGES.perfect_quiz);
    }
    if (timeSeconds < 60 && score === total) {
      const awarded = await awardBadge(BADGES.speed_demon.id);
      if (awarded) badges.push(BADGES.speed_demon);
    }
    if (labBreakerTriggered) {
      const awarded = await awardBadge(BADGES.lab_breaker.id);
      if (awarded) badges.push(BADGES.lab_breaker);
    }

    await updateTopicProgress(topicId, {
      quizBestScore: score,
      quizAttempts: 1,
      completedAt: Date.now(),
    });

    setNewBadges(badges);
    setQuizResult({ score, total, timeSeconds, isPerfect, xpEarned });
    setStep('results');
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
    setStep('quiz');
  };

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <SafeAreaView style={styles.root}>
      <StarBackground />

      {/* Top nav bar */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.topicTitle, { color: accentColor }]}>
          {topicMeta.emoji} {topicMeta.title}
        </Text>
        {/* Step indicator */}
        <View style={styles.stepDots}>
          {STEPS.slice(0, -1).map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= currentStepIndex
                    ? accentColor
                    : COLORS.glass3,
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Step content */}
      {step === 'hook' && (
        <CuriosityHook
          hook={topicConfig.hook}
          accentColor={accentColor}
          topicTitle={topicConfig.title}
          onContinue={() => setStep('theory')}
        />
      )}

      {step === 'theory' && (
        <TheoryCards
          theory={topicConfig.theory}
          accentColor={accentColor}
          onComplete={handleTheoryComplete}
        />
      )}

      {step === 'lab' && (
        <View style={styles.labContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Lab header */}
            <View style={styles.labHeader}>
              <Text style={[styles.labTitle, { color: accentColor }]}>
                🔬 {topicConfig.lab?.title || 'Lab Simulation'}
              </Text>
              <Text style={styles.labDesc}>
                {topicConfig.lab?.description || 'Interactive simulation'}
              </Text>
              {topicConfig.lab?.hint && (
                <View style={[styles.hintBox, { borderColor: accentColor + '40' }]}>
                  <Text style={styles.hintText}>💡 {topicConfig.lab.hint}</Text>
                </View>
              )}
            </View>

            {/* Scientist mode toggle */}
            <TouchableOpacity
              onPress={() => setScientistMode(v => !v)}
              style={[styles.sciBtn, scientistMode && { borderColor: accentColor, backgroundColor: accentColor + '15' }]}
            >
              <Text style={[styles.sciBtnText, scientistMode && { color: accentColor }]}>
                🔬 {scientistMode ? 'Scientist Mode: ON' : 'Unlock Scientist Mode'}
              </Text>
            </TouchableOpacity>

            {/* Render the lab */}
            {LabComponent ? (
              <LabComponent
                scientistMode={scientistMode}
                accentColor={accentColor}
                onLabBreaker={() => setLabBreakerTriggered(true)}
              />
            ) : (
              <View style={styles.noLab}>
                <Text style={styles.noLabText}>Lab simulation coming soon!</Text>
              </View>
            )}

            {/* Continue button */}
            <TouchableOpacity
              onPress={handleLabContinue}
              style={[styles.continueBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '15' }]}
            >
              <Text style={[styles.continueBtnText, { color: accentColor }]}>
                Continue to Questions →
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}

      {step === 'dyk' && (
        <DoYouKnowWhy
          questions={topicConfig.doYouKnowWhy || []}
          accentColor={accentColor}
          onComplete={handleDYKComplete}
        />
      )}

      {step === 'quiz' && (
        <QuizEngine
          quiz={topicConfig.quiz}
          accentColor={accentColor}
          onComplete={handleQuizComplete}
        />
      )}

      {step === 'results' && quizResult && (
        <QuizResults
          score={quizResult.score}
          total={quizResult.total}
          timeSeconds={quizResult.timeSeconds}
          xpEarned={quizResult.xpEarned}
          newBadges={newBadges}
          accentColor={accentColor}
          topicTitle={topicConfig.title}
          isPerfect={quizResult.isPerfect}
          onRetry={handleRetryQuiz}
          onContinue={onBack}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
  },
  backBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  topicTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
    flex: 1,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Lab styles
  labContainer: {
    flex: 1,
  },
  labHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  labTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    marginBottom: 6,
  },
  labDesc: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  hintBox: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.glass1,
    padding: 12,
    marginBottom: 12,
  },
  hintText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sciBtn: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass1,
    alignSelf: 'flex-start',
  },
  sciBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  noLab: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noLabText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  continueBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  continueBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
  },
});
