import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  XP: '@cm_xp',
  BADGES: '@cm_badges',
  PROGRESS: '@cm_progress',  // per-topic progress
  STREAK: '@cm_streak',
  LAST_OPEN: '@cm_last_open',
  QUIZ_SCORES: '@cm_quiz_scores',
  LAB_DATA: '@cm_lab_data',
};

// ── XP ──────────────────────────────────────

export const getXP = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.XP);
    return val ? parseInt(val) : 0;
  } catch { return 0; }
};

export const addXP = async (amount) => {
  try {
    const current = await getXP();
    const newXP = current + amount;
    await AsyncStorage.setItem(KEYS.XP, String(newXP));
    return newXP;
  } catch { return 0; }
};

// ── BADGES ──────────────────────────────────

export const getBadges = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.BADGES);
    return val ? JSON.parse(val) : [];
  } catch { return []; }
};

export const awardBadge = async (badgeId) => {
  try {
    const badges = await getBadges();
    if (badges.includes(badgeId)) return false; // already have it
    await AsyncStorage.setItem(KEYS.BADGES, JSON.stringify([...badges, badgeId]));
    return true; // newly awarded
  } catch { return false; }
};

// ── TOPIC PROGRESS ───────────────────────────

export const getTopicProgress = async (topicId) => {
  try {
    const val = await AsyncStorage.getItem(KEYS.PROGRESS);
    const all = val ? JSON.parse(val) : {};
    return all[topicId] || {
      theoryRead: false,
      labVisited: false,
      dykAnswered: false,
      quizBestScore: 0,
      quizAttempts: 0,
      scientistModeUnlocked: false,
      completedAt: null,
    };
  } catch {
    return { theoryRead: false, labVisited: false, dykAnswered: false, quizBestScore: 0, quizAttempts: 0, scientistModeUnlocked: false, completedAt: null };
  }
};

export const updateTopicProgress = async (topicId, update) => {
  try {
    const val = await AsyncStorage.getItem(KEYS.PROGRESS);
    const all = val ? JSON.parse(val) : {};
    all[topicId] = { ...(all[topicId] || {}), ...update };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
    return all[topicId];
  } catch {}
};

export const getAllProgress = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.PROGRESS);
    return val ? JSON.parse(val) : {};
  } catch { return {}; }
};

// ── QUIZ SCORES ──────────────────────────────

export const saveQuizScore = async (topicId, score, total, timeSeconds) => {
  try {
    const val = await AsyncStorage.getItem(KEYS.QUIZ_SCORES);
    const all = val ? JSON.parse(val) : {};
    if (!all[topicId]) all[topicId] = [];
    all[topicId].push({ score, total, timeSeconds, date: Date.now() });
    await AsyncStorage.setItem(KEYS.QUIZ_SCORES, JSON.stringify(all));
  } catch {}
};

export const getQuizScores = async (topicId) => {
  try {
    const val = await AsyncStorage.getItem(KEYS.QUIZ_SCORES);
    const all = val ? JSON.parse(val) : {};
    return all[topicId] || [];
  } catch { return []; }
};

export const getAllQuizScores = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.QUIZ_SCORES);
    return val ? JSON.parse(val) : {};
  } catch { return {}; }
};

// ── STREAK ───────────────────────────────────

export const checkAndUpdateStreak = async () => {
  try {
    const streakVal = await AsyncStorage.getItem(KEYS.STREAK);
    const lastOpenVal = await AsyncStorage.getItem(KEYS.LAST_OPEN);
    const streak = streakVal ? parseInt(streakVal) : 0;
    const lastOpen = lastOpenVal ? parseInt(lastOpenVal) : 0;
    const now = Date.now();
    const oneDayMs = 86400000;
    const daysSince = Math.floor((now - lastOpen) / oneDayMs);

    let newStreak = streak;
    if (daysSince === 1) {
      newStreak = streak + 1; // Consecutive day
    } else if (daysSince > 1) {
      newStreak = 1; // Reset
    } else if (daysSince === 0 && streak === 0) {
      newStreak = 1; // First time
    }

    await AsyncStorage.setItem(KEYS.STREAK, String(newStreak));
    await AsyncStorage.setItem(KEYS.LAST_OPEN, String(now));
    return newStreak;
  } catch { return 0; }
};

export const getStreak = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.STREAK);
    return val ? parseInt(val) : 0;
  } catch { return 0; }
};

// ── FULL STATS (for Progress Dashboard) ──────

export const getFullStats = async () => {
  const [xp, badges, allProgress, streak, allScores] = await Promise.all([
    getXP(),
    getBadges(),
    getAllProgress(),
    getStreak(),
    getAllQuizScores(),
  ]);

  const completedTopics = Object.values(allProgress).filter(p => p.completedAt).length;
  const totalQuizAttempts = Object.values(allScores).reduce((s, arr) => s + arr.length, 0);
  const perfectScores = Object.values(allScores).reduce((s, arr) =>
    s + arr.filter(q => q.score === q.total).length, 0);

  return { xp, badges, allProgress, streak, allScores, completedTopics, totalQuizAttempts, perfectScores };
};

// ── RESET (dev/testing) ───────────────────────

export const resetAll = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
