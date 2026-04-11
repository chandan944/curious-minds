import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { TOPIC_REGISTRY } from '../constants/topicRegistry';
import { updateTopicProgress, addXP, awardBadge } from '../utils/storage';
import { XP_REWARDS, BADGES } from '../constants/xpSystem';
import { soundTap, soundWhoosh } from '../utils/sounds';
import CuriosityHook from '../components/CuriosityHook';
import TheoryCards from '../components/TheoryCards';
import DoYouKnowWhy from '../components/DoYouKnowWhy';
import QuizEngine from '../components/QuizEngine';
import QuizResults from '../components/QuizResults';
import StarBackground from '../components/ui/StarBackground';
import Icon from '../components/ui/Icons';

const { width } = Dimensions.get('window');
const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 50;

// Dynamic import for topic configs
const TOPIC_CONFIGS = {
  gravity: () => require('../topics/gravity/config').default,
};

// Dynamic import for lab simulations
const LAB_COMPONENTS = {
  gravity: () => require('../topics/gravity/LabSimulation').default,
};

const STEPS       = ['hook', 'theory', 'lab', 'dyk', 'quiz', 'results'];
const STEP_LABELS = ['Hook', 'Learn', 'Lab', 'Why', 'Quiz', 'Done'];
const STEP_ICONS  = {
  hook:    'sparkle',
  theory:  'book',
  lab:     'flask',
  dyk:     'lightbulb',
  quiz:    'target',
  results: 'trophy',
};

export default function TopicScreen({ topicId, onBack }) {
  const { theme, isDark }         = useTheme();
  const [step, setStep]           = useState('hook');
  const [topicConfig, setTopicConfig] = useState(null);
  const [LabComponent, setLabComponent] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [earnedXP, setEarnedXP]   = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [scientistMode, setScientistMode] = useState(false);
  const [labBreakerTriggered, setLabBreakerTriggered] = useState(false);

  const topicMeta = TOPIC_REGISTRY.find(t => t.id === topicId);

  useEffect(() => {
    const getConfig = TOPIC_CONFIGS[topicId];
    if (getConfig) {
      try { setTopicConfig(getConfig()); }
      catch (e) { console.warn('Could not load topic config:', topicId, e); }
    }
    const getLab = LAB_COMPONENTS[topicId];
    if (getLab) {
      try { setLabComponent(() => getLab()); }
      catch (e) { console.warn('Could not load lab:', topicId, e); }
    }
  }, [topicId]);

  // ── Theme-reactive tokens ───────────────────
  const bg       = theme.bg.base;
  const glass1   = theme.glass.light;
  const glass2   = theme.glass.medium;
  const border   = theme.glass.border;
  const borderBr = theme.glass.borderBright;
  const txt1     = theme.text.primary;
  const txt2     = theme.text.secondary;
  const txtM     = theme.text.muted;
  const accent   = theme.accent.primary;

  if (!topicConfig || !topicMeta) {
    return (
      <View style={[styles.root, { backgroundColor: bg, paddingTop: STATUS_BAR_H }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: txtM }]}>Loading topic…</Text>
          <TouchableOpacity onPress={() => { soundTap(); onBack(); }} style={[styles.backBtnSmall, { borderColor: border, backgroundColor: glass1 }]}>
            <Icon name="back" size={18} color={txt2} />
            <Text style={[styles.backBtnSmallText, { color: txt2 }]}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const topicColors = theme.topics;
  const colorKey    = Object.keys(topicColors).find(k => topicId.startsWith(k)) || 'default';
  const accentColor = (topicColors[colorKey] || topicColors.default).primary;

  // ── Handlers ──────────────────────────────────
  const handleTheoryComplete = async () => {
    await updateTopicProgress(topicId, { theoryRead: true });
    await addXP(XP_REWARDS.theoryRead);
    setEarnedXP(p => p + XP_REWARDS.theoryRead);
    setStep('lab');
  };

  const handleLabContinue = async () => {
    await updateTopicProgress(topicId, { labVisited: true });
    await addXP(XP_REWARDS.labInteraction);
    setEarnedXP(p => p + XP_REWARDS.labInteraction);
    setStep('dyk');
  };

  const handleDYKComplete = async () => {
    await updateTopicProgress(topicId, { dykAnswered: true });
    await addXP(XP_REWARDS.dykAnswered);
    setEarnedXP(p => p + XP_REWARDS.dykAnswered);
    setStep('quiz');
  };

  const handleQuizComplete = async (score, total, timeSeconds, isPerfect) => {
    const xpEarned =
      score * XP_REWARDS.quizCorrect +
      XP_REWARDS.quizComplete +
      (isPerfect ? XP_REWARDS.quizPerfect : 0) +
      (timeSeconds < 60 ? 20 : 0);

    await addXP(xpEarned);
    setEarnedXP(p => p + xpEarned);

    const badges = [];
    if (isPerfect) {
      const a = await awardBadge(BADGES.perfect_quiz.id);
      if (a) badges.push(BADGES.perfect_quiz);
    }
    if (timeSeconds < 60 && score === total) {
      const a = await awardBadge(BADGES.speed_demon.id);
      if (a) badges.push(BADGES.speed_demon);
    }
    if (labBreakerTriggered) {
      const a = await awardBadge(BADGES.lab_breaker.id);
      if (a) badges.push(BADGES.lab_breaker);
    }
    await updateTopicProgress(topicId, {
      quizBestScore: score, quizAttempts: 1, completedAt: Date.now(),
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
  const progressSteps    = STEPS.slice(0, -1);

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {isDark && <StarBackground />}

      {/* Ambient blob */}
      <View style={[styles.ambientBlob, { backgroundColor: accentColor + '12' }]} />

      {/* ── Top nav — with explicit safe-area padding ─── */}
      <View style={[styles.topNav, { paddingTop: STATUS_BAR_H + 8, borderBottomColor: border, backgroundColor: bg }]}>
        {/* Back button — large, visible touch target */}
        <TouchableOpacity onPress={() => { soundTap(); onBack(); }} activeOpacity={0.7}
          style={[styles.backBtn, { borderColor: borderBr, backgroundColor: glass2 }]}
        >
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>

        {/* Title with SVG icon */}
        <View style={styles.navCenter}>
          <View style={[styles.topicIconWrap, { backgroundColor: accentColor + '22', borderColor: accentColor + '50' }]}>
            <Icon name={topicMeta.icon || 'book'} size={16} color={accentColor} />
          </View>
          <Text style={[styles.topicTitle, { color: txt1 }]} numberOfLines={1}>
            {topicMeta.title}
          </Text>
        </View>

        {/* XP earned chip */}
        {earnedXP > 0 && (
          <View style={[styles.xpChip, { backgroundColor: theme.accent.gold + '20', borderColor: theme.accent.gold + '40' }]}>
            <Icon name="xp" size={12} color={theme.accent.gold} />
            <Text style={[styles.xpChipText, { color: theme.accent.gold }]}>+{earnedXP}</Text>
          </View>
        )}
      </View>

      {/* ── Step progress bar ──────────────── */}
      <View style={[styles.progressContainer, { backgroundColor: bg }]}>
        {progressSteps.map((s, i) => {
          const done   = i < currentStepIndex;
          const active = i === currentStepIndex;
          return (
            <View key={s} style={styles.progressItem}>
              <View style={[
                styles.progressSegment,
                { backgroundColor: done ? accentColor : active ? accentColor : glass2 },
                done && { opacity: 0.5 },
                active && { shadowColor: accentColor, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
              ]} />
              {active && (
                <View style={styles.progressLabelRow}>
                  <Icon name={STEP_ICONS[s] || 'sparkle'} size={9} color={accentColor} />
                  <Text style={[styles.progressLabel, { color: accentColor }]}>
                    {STEP_LABELS[i]}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Step content ─────────────────────── */}
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
        <ScrollView
          style={styles.labScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.labScrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Lab header card */}
          <LinearGradient
            colors={[accentColor + '18', glass1]}
            style={[styles.labHeaderCard, { borderColor: accentColor + '30' }]}
          >
            <View style={styles.labTitleRow}>
              <View style={[styles.labIconBadge, { backgroundColor: accentColor + '25', borderColor: accentColor + '45' }]}>
                <Icon name="flask" size={22} color={accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.labTitle, { color: txt1 }]}>
                  {topicConfig.lab?.title || 'Lab Simulation'}
                </Text>
                <Text style={[styles.labDesc, { color: txt2 }]}>
                  {topicConfig.lab?.description || 'Interactive simulation'}
                </Text>
              </View>
            </View>
            {topicConfig.lab?.hint && (
              <View style={[styles.hintBox, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }]}>
                <Icon name="lightbulb" size={14} color={accentColor} />
                <Text style={[styles.hintText, { color: txt2 }]}>{topicConfig.lab.hint}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Scientist mode toggle */}
          <TouchableOpacity
            onPress={() => { soundTap(); setScientistMode(v => !v); }}
            activeOpacity={0.75}
            style={[styles.sciBtn, { borderColor: scientistMode ? accentColor + '60' : border }]}
          >
            <LinearGradient
              colors={scientistMode ? [accentColor + '25', accentColor + '10'] : [glass2, glass1]}
              style={styles.sciBtnGrad}
            >
              <View style={styles.sciBtnInner}>
                <View style={[styles.sciBtnIconWrap, { backgroundColor: accentColor + '20', borderColor: accentColor + '30' }]}>
                  <Icon name="microscope" size={16} color={scientistMode ? accentColor : txtM} />
                </View>
                <Text style={[styles.sciBtnText, { color: scientistMode ? txt1 : txtM }]}>
                  Scientist Mode
                </Text>
                <View style={[styles.togglePill, { borderColor: border }, scientistMode && { backgroundColor: accentColor, borderColor: accentColor }]}>
                  <View style={[styles.toggleThumb, scientistMode && styles.toggleThumbOn]} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Lab simulation */}
          {LabComponent ? (
            <LabComponent
              scientistMode={scientistMode}
              accentColor={accentColor}
              onLabBreaker={() => setLabBreakerTriggered(true)}
            />
          ) : (
            <View style={styles.noLab}>
              <View style={[styles.noLabIconWrap, { backgroundColor: accentColor + '15', borderColor: accentColor + '25' }]}>
                <Icon name="construction" size={36} color={accentColor} />
              </View>
              <Text style={[styles.noLabTitle, { color: txt1 }]}>Coming Soon!</Text>
              <Text style={[styles.noLabText, { color: txtM }]}>Lab simulation is being built</Text>
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity onPress={() => { soundWhoosh(); handleLabContinue(); }} activeOpacity={0.85}
            style={[styles.continueBtnWrap, { borderColor: accentColor + '60' }]}>
            <LinearGradient
              colors={[accentColor + '40', accentColor + '20']}
              style={styles.continueBtn}
            >
              <Icon name="forward" size={18} color={txt1} />
              <Text style={[styles.continueBtnText, { color: txt1 }]}>Continue to Questions</Text>
              <Icon name="zap" size={14} color={accentColor} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontFamily: FONTS.body, fontSize: 15, marginBottom: 12 },
  backBtnSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  backBtnSmallText: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  ambientBlob: {
    position: 'absolute', top: -100, right: -80,
    width: 300, height: 300, borderRadius: 150,
  },

  // Top nav — large visible back button
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 10,
    gap: 10, borderBottomWidth: 1,
    zIndex: 10,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  navCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  topicIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  topicTitle: { fontFamily: FONTS.displayMedium, fontSize: 15, flex: 1 },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  xpChipText: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // Progress
  progressContainer: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8, paddingBottom: 6, gap: 4,
  },
  progressItem: { flex: 1, alignItems: 'center', gap: 4 },
  progressSegment: { width: '100%', height: 3.5, borderRadius: 2 },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  progressLabel: {
    fontFamily: FONTS.body, fontSize: 9,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },

  // Lab scroll
  labScroll: { flex: 1 },
  labScrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  labHeaderCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  labTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8,
  },
  labIconBadge: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0,
  },
  labTitle: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 4 },
  labDesc: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 20 },
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: RADIUS.md, padding: 10, marginTop: 4,
  },
  hintText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18, flex: 1 },

  sciBtn: {
    borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  sciBtnGrad: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: RADIUS.md },
  sciBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sciBtnIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  sciBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 14, flex: 1 },

  togglePill: {
    width: 40, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(128,128,128,0.20)',
    borderWidth: 1, padding: 2, justifyContent: 'center',
  },
  toggleThumb: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.40)', alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end', backgroundColor: '#FFFFFF' },

  noLab: { alignItems: 'center', paddingVertical: SPACING.xl, gap: 12 },
  noLabIconWrap: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  noLabTitle: { fontFamily: FONTS.displayMedium, fontSize: 17 },
  noLabText:  { fontFamily: FONTS.body, fontSize: 14 },

  continueBtnWrap: {
    borderRadius: RADIUS.md, overflow: 'hidden',
    borderWidth: 1, marginTop: SPACING.lg, marginHorizontal: SPACING.md,
  },
  continueBtn: {
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  continueBtnText: { fontFamily: FONTS.displayMedium, fontSize: 15 },
});
