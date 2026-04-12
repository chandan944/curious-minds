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

// ─────────────────────────────────────────────────────────────────
//  DEBUG LOGGER — prints clearly in Metro/Expo terminal
//  Every step is tagged so you can trace exactly what happens
// ─────────────────────────────────────────────────────────────────
const LOG_TAG = '🟢 [TopicScreen]';
const ERR_TAG = '🔴 [TopicScreen]';
const WRN_TAG = '🟡 [TopicScreen]';

const debugLog  = (...args) => console.log(LOG_TAG, ...args);
const debugWarn = (...args) => console.warn(WRN_TAG, ...args);
const debugErr  = (...args) => console.error(ERR_TAG, ...args);

// ─────────────────────────────────────────────────────────────────
//  TOPIC CONFIGS MAP
//  ⚠️  THE ROOT CAUSE OF YOUR BUG:
//  'photosynthesis' was missing from this map AND from LAB_COMPONENTS.
//  TopicScreen.jsx has these two hardcoded lists. If a topic is
//  registered in topicRegistry.js but not listed here, the screen
//  silently finds no loader → setTopicConfig(null) is never called
//  → the loading spinner shows forever. Added photosynthesis below.
// ─────────────────────────────────────────────────────────────────
const TOPIC_CONFIGS = {
  gravity:               () => require('../topics/gravity/config').default,
  electricity_circuits:  () => require('../topics/electricity_circuits/config').default,
  chemical_bonding:      () => require('../topics/chemical_bonding/config').default,
  brain_structure:       () => require('../topics/brain_structure/config').default,
  ancient_civilizations: () => require('../topics/ancient_civilizations/config').default,
  industrial_revolution: () => require('../topics/industrial_revolution/config').default,
  world_wars:            () => require('../topics/world_wars/config').default,
  dna_genetics:          () => require('../topics/dna_genetics/config').default,
  atoms_molecules:       () => require('../topics/atoms_molecules/config').default,
  evolution_natural:     () => require('../topics/evolution_natural/config').default,
  solar_system:          () => require('../topics/solar_system/config').default,
  binary_computers:      () => require('../topics/binary_computers/config').default,
  internet_how_it_works: () => require('../topics/internet_how_it_works/config').default,

  // ✅ FIX: photosynthesis was missing — this is why it froze on loading forever
  photosynthesis:        () => require('../topics/photosynthesis/config').default,

  // ── Five Biology Lab Suite ───────────────────────────────────
  cell_structure:        () => require('../topics/cell_structure/config').default,
  human_body_systems:    () => require('../topics/human_body_systems/config').default,
  immune_system:         () => require('../topics/immune_system/config').default,
  ecosystems:            () => require('../topics/ecosystems/config').default,

  // ── Five Foundations Lab Suite ───────────────────────────────
  scientific_method:     () => require('../topics/scientific_method/config').default,
  measurement_units:     () => require('../topics/measurement_units/config').default,
  matter_states:         () => require('../topics/matter_states/config').default,
  periodic_table:        () => require('../topics/periodic_table/config').default,
  energy_types:          () => require('../topics/energy_types/config').default,

  // ── Five Physics Master Lab Suite ────────────────────────────
  forces_motion:         () => require('../topics/forces_motion/config').default,
  work_power:            () => require('../topics/work_power/config').default,
  heat_temperature:      () => require('../topics/heat_temperature/config').default,
  waves_sound:           () => require('../topics/waves_sound/config').default,
  light_optics:          () => require('../topics/light_optics/config').default,
  
  // ── Tech Suite ──────────────────────────────────────────────────
  ai_machine_learning:   () => require('../topics/ai_machine_learning/config').default,
  digital_circuits:      () => require('../topics/digital_circuits/config').default,
  cryptography:          () => require('../topics/cryptography/config').default,
  data_science:          () => require('../topics/data_science/config').default,
};
// ─────────────────────────────────────────────────────────────────
//  LAB COMPONENTS MAP
//  Same fix — photosynthesis was missing here too.
// ─────────────────────────────────────────────────────────────────
const LAB_COMPONENTS = {
  gravity:               () => require('../topics/gravity/LabSimulation').default,
  electricity_circuits:  () => require('../topics/electricity_circuits/LabSimulation').default,
  chemical_bonding:      () => require('../topics/chemical_bonding/LabSimulation').default,
  brain_structure:       () => require('../topics/brain_structure/LabSimulation').default,
  ancient_civilizations: () => require('../topics/ancient_civilizations/LabSimulation').default,
  industrial_revolution: () => require('../topics/industrial_revolution/LabSimulation').default,
  world_wars:            () => require('../topics/world_wars/LabSimulation').default,
  dna_genetics:          () => require('../topics/dna_genetics/LabSimulation').default,
  atoms_molecules:       () => require('../topics/atoms_molecules/LabSimulation').default,
  evolution_natural:     () => require('../topics/evolution_natural/LabSimulation').default,
  solar_system:          () => require('../topics/solar_system/LabSimulation').default,
  binary_computers:      () => require('../topics/binary_computers/LabSimulation').default,
  internet_how_it_works: () => require('../topics/internet_how_it_works/LabSimulation').default,
  ai_machine_learning:   () => require('../topics/ai_machine_learning/LabSimulation').default,
  digital_circuits:      () => require('../topics/digital_circuits/LabSimulation').default,
  cryptography:          () => require('../topics/cryptography/LabSimulation').default,
  data_science:          () => require('../topics/data_science/LabSimulation').default,

  // ✅ FIX: photosynthesis was missing here too
  photosynthesis:        () => require('../topics/photosynthesis/LabSimulation').default,

  // ── Five Biology Lab Suite ───────────────────────────────────
  cell_structure:        () => require('../topics/cell_structure/LabSimulation').default,
  human_body_systems:    () => require('../topics/human_body_systems/LabSimulation').default,
  immune_system:         () => require('../topics/immune_system/LabSimulation').default,
  ecosystems:            () => require('../topics/ecosystems/LabSimulation').default,

  // ── Five Foundations Lab Suite ───────────────────────────────
  scientific_method:     () => require('../topics/scientific_method/LabSimulation').default,
  measurement_units:     () => require('../topics/measurement_units/LabSimulation').default,
  matter_states:         () => require('../topics/matter_states/LabSimulation').default,
  periodic_table:        () => require('../topics/periodic_table/LabSimulation').default,
  energy_types:          () => require('../topics/energy_types/LabSimulation').default,

  // ── Five Physics Master Lab Suite ────────────────────────────
  forces_motion:         () => require('../topics/forces_motion/LabSimulation').default,
  work_power:            () => require('../topics/work_power/LabSimulation').default,
  heat_temperature:      () => require('../topics/heat_temperature/LabSimulation').default,
  waves_sound:           () => require('../topics/waves_sound/LabSimulation').default,
  light_optics:          () => require('../topics/light_optics/LabSimulation').default,
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
  const { theme, isDark }             = useTheme();
  const [step, setStep]               = useState('hook');
  const [topicConfig, setTopicConfig] = useState(null);
  const [LabComponent, setLabComponent] = useState(null);
  const [loadError, setLoadError]     = useState(null);   // ← new: capture error message
  const [quizResult, setQuizResult]   = useState(null);
  const [earnedXP, setEarnedXP]       = useState(0);
  const [newBadges, setNewBadges]     = useState([]);
  const [scientistMode, setScientistMode] = useState(false);
  const [labBreakerTriggered, setLabBreakerTriggered] = useState(false);

  const topicMeta = TOPIC_REGISTRY.find(t => t.id === topicId);

  // ── Load config + lab on mount ─────────────────────────────────
  useEffect(() => {
    debugLog(`==== LOADING TOPIC: "${topicId}" ====`);
    debugLog(`Topic found in registry: ${topicMeta ? 'YES ✅' : 'NO ❌'}`);

    if (!topicMeta) {
      const msg = `Topic "${topicId}" not found in TOPIC_REGISTRY`;
      debugErr(msg);
      setLoadError(msg);
      return;
    }

    // ── Load config ──────────────────────────────
    const getConfig = TOPIC_CONFIGS[topicId];
    if (!getConfig) {
      const msg = `"${topicId}" is NOT in TOPIC_CONFIGS map — add it to TopicScreen.jsx`;
      debugErr(msg);
      debugErr('Currently registered config keys:', Object.keys(TOPIC_CONFIGS).join(', '));
      setLoadError(msg);
      // Don't return — still try to load lab, and show error on screen
    } else {
      debugLog(`Config loader found for "${topicId}" ✅`);
      try {
        const cfg = getConfig();
        debugLog(`Config loaded successfully ✅ — title: "${cfg?.title}"`);
        debugLog(`Theory cards: ${cfg?.theory?.length ?? 0}`);
        debugLog(`Quiz questions: ${cfg?.quiz?.length ?? 0}`);
        debugLog(`DYK questions: ${cfg?.doYouKnowWhy?.length ?? 0}`);
        setTopicConfig(cfg);
      } catch (e) {
        const msg = `Config require() crashed for "${topicId}": ${e?.message}`;
        debugErr(msg);
        debugErr('Full error:', e);
        setLoadError(msg);
      }
    }

    // ── Load lab ─────────────────────────────────
    const getLab = LAB_COMPONENTS[topicId];
    if (!getLab) {
      debugWarn(`"${topicId}" is NOT in LAB_COMPONENTS map — lab will show "Coming Soon"`);
      debugWarn('Currently registered lab keys:', Object.keys(LAB_COMPONENTS).join(', '));
      // Not a fatal error — we show "Coming Soon" gracefully
    } else {
      debugLog(`Lab loader found for "${topicId}" ✅`);
      try {
        const LabComp = getLab();
        debugLog(`Lab component loaded successfully ✅`);
        setLabComponent(() => LabComp);
      } catch (e) {
        debugErr(`Lab require() crashed for "${topicId}": ${e?.message}`);
        debugErr('Full error:', e);
        // Not fatal — lab shows "Coming Soon" if component fails
      }
    }

    debugLog(`==== LOAD SEQUENCE COMPLETE for "${topicId}" ====`);
  }, [topicId]);

  // ── Theme tokens ───────────────────────────────
  const bg       = theme.bg.base;
  const glass1   = theme.glass.light;
  const glass2   = theme.glass.medium;
  const border   = theme.glass.border;
  const borderBr = theme.glass.borderBright;
  const txt1     = theme.text.primary;
  const txt2     = theme.text.secondary;
  const txtM     = theme.text.muted;
  const accent   = theme.accent.primary;

  // ── Loading / Error screen ─────────────────────
  if (!topicConfig || !topicMeta) {
    return (
      <View style={[styles.root, { backgroundColor: bg, paddingTop: STATUS_BAR_H }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <View style={styles.center}>

          {loadError ? (
            // Show error details on screen (very helpful for debugging)
            <View style={[styles.errorBox, { borderColor: '#FF4D6D44', backgroundColor: '#FF4D6D11' }]}>
              <Text style={[styles.errorTitle, { color: '#FF4D6D' }]}>⚠️ Load Error</Text>
              <Text style={[styles.errorMsg, { color: txtM }]}>{loadError}</Text>
              <Text style={[styles.errorHint, { color: txtM }]}>
                👉 Check Metro/Expo terminal for full logs{'\n'}
                (look for 🔴 [TopicScreen] lines)
              </Text>
            </View>
          ) : (
            <Text style={[styles.loadingText, { color: txtM }]}>
              Loading {topicId}…
            </Text>
          )}

          <TouchableOpacity
            onPress={() => { soundTap(); onBack(); }}
            style={[styles.backBtnSmall, { borderColor: border, backgroundColor: glass1 }]}
          >
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
    debugLog(`Theory complete → advancing to lab`);
    await updateTopicProgress(topicId, { theoryRead: true });
    await addXP(XP_REWARDS.theoryRead);
    setEarnedXP(p => p + XP_REWARDS.theoryRead);
    setStep('lab');
  };

  const handleLabContinue = async () => {
    debugLog(`Lab continue → advancing to dyk`);
    await updateTopicProgress(topicId, { labVisited: true });
    await addXP(XP_REWARDS.labInteraction);
    setEarnedXP(p => p + XP_REWARDS.labInteraction);
    setStep('dyk');
  };

  const handleDYKComplete = async () => {
    debugLog(`DYK complete → advancing to quiz`);
    await updateTopicProgress(topicId, { dykAnswered: true });
    await addXP(XP_REWARDS.dykAnswered);
    setEarnedXP(p => p + XP_REWARDS.dykAnswered);
    setStep('quiz');
  };

  const handleQuizComplete = async (score, total, timeSeconds, isPerfect) => {
    debugLog(`Quiz complete — score: ${score}/${total}, time: ${timeSeconds}s, perfect: ${isPerfect}`);
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
    debugLog(`Retrying quiz`);
    setQuizResult(null);
    setStep('quiz');
  };

  const currentStepIndex = STEPS.indexOf(step);
  const progressSteps    = STEPS.slice(0, -1);

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {isDark && <StarBackground />}

      <View style={[styles.ambientBlob, { backgroundColor: accentColor + '12' }]} />

      {/* ── Top nav ── */}
      <View style={[styles.topNav, { paddingTop: STATUS_BAR_H + 8, borderBottomColor: border, backgroundColor: bg }]}>
        <TouchableOpacity
          onPress={() => { soundTap(); onBack(); }}
          activeOpacity={0.7}
          style={[styles.backBtn, { borderColor: borderBr, backgroundColor: glass2 }]}
        >
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <View style={[styles.topicIconWrap, { backgroundColor: accentColor + '22', borderColor: accentColor + '50' }]}>
            <Icon name={topicMeta.icon || 'book'} size={16} color={accentColor} />
          </View>
          <Text style={[styles.topicTitle, { color: txt1 }]} numberOfLines={1}>
            {topicMeta.title}
          </Text>
        </View>

        {earnedXP > 0 && (
          <View style={[styles.xpChip, { backgroundColor: theme.accent.gold + '20', borderColor: theme.accent.gold + '40' }]}>
            <Icon name="xp" size={12} color={theme.accent.gold} />
            <Text style={[styles.xpChipText, { color: theme.accent.gold }]}>+{earnedXP}</Text>
          </View>
        )}
      </View>

      {/* ── Step progress bar ── */}
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

      {/* ── Step content ── */}
      {step === 'hook' && (
        <CuriosityHook
          hook={topicConfig.hook}
          accentColor={accentColor}
          topicTitle={topicConfig.title}
          onContinue={() => { debugLog('Hook done → theory'); setStep('theory'); }}
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

          {LabComponent ? (
            <LabComponent
              scientistMode={scientistMode}
              accentColor={accentColor}
              onLabBreaker={() => { debugLog('Lab breaker triggered!'); setLabBreakerTriggered(true); }}
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

          <TouchableOpacity
            onPress={() => { soundWhoosh(); handleLabContinue(); }}
            activeOpacity={0.85}
            style={[styles.continueBtnWrap, { borderColor: accentColor + '60' }]}
          >
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadingText: { fontFamily: FONTS.body, fontSize: 15, marginBottom: 12 },

  // ── Error box (shows on screen when load fails) ──
  errorBox: {
    borderWidth: 1, borderRadius: RADIUS.md,
    padding: 16, gap: 8, width: '100%',
  },
  errorTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  errorMsg:   { fontFamily: FONTS.body, fontSize: 13, lineHeight: 20 },
  errorHint:  { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, marginTop: 4 },

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
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 10,
    gap: 10, borderBottomWidth: 1, zIndex: 10,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  navCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  progressContainer: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 6, gap: 4,
  },
  progressItem: { flex: 1, alignItems: 'center', gap: 4 },
  progressSegment: { width: '100%', height: 3.5, borderRadius: 2 },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  progressLabel: {
    fontFamily: FONTS.body, fontSize: 9,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  labScroll: { flex: 1 },
  labScrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  labHeaderCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.sm, overflow: 'hidden',
  },
  labTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  labIconBadge: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0,
  },
  labTitle: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 4 },
  labDesc:  { fontFamily: FONTS.body, fontSize: 14, lineHeight: 20 },
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: RADIUS.md, padding: 10, marginTop: 4,
  },
  hintText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18, flex: 1 },
  sciBtn: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, marginBottom: SPACING.sm },
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