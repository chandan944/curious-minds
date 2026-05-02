import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncXpToServer } from '../services/leaderboardService';
import { getToken } from './authStorage';

const KEYS = {
  BADGES: '@cm_badges',
  PROGRESS: '@cm_progress',  // per-topic progress
  LAST_OPEN: '@cm_last_open',
  QUIZ_SCORES: '@cm_quiz_scores',
  LAB_DATA: '@cm_lab_data',
};

// ── Max XP allowed per action type (must match backend) ──
const MAX_XP_PER_REASON = {
  quiz_correct:   15,
  quiz_perfect:   50,
  theory_read:    10,
  lab_complete:   20,
  dyk_complete:   10,
  streak_bonus:   25,
  topic_complete: 30,
  local_earn:     15,
};
const MAX_SINGLE_SYNC = 100;

// ── XP ──────────────────────────────────────

export const getXP = async () => {
  return 0; // Legacy function, points are now managed via AuthContext & Backend
};

export const addXP = async (amount, reason = 'topic_complete') => {
  try {
    // ── Client-side validation ───────────────────────────────
    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      console.warn('⚠️ Invalid XP amount:', amount);
      return 0;
    }

    const validAmount = Math.floor(amount);

    if (validAmount <= 0) {
      console.warn('⚠️ XP amount rounded to 0, skipping');
      return 0;
    }

    // Sync with server directly
    const token = await getToken();
    if (token) {
      // Send 0 for streak to let backend manage it exclusively
      const serverRes = await syncXpToServer(token, validAmount, reason, 0);
      if (serverRes && serverRes.success && typeof serverRes.totalPoints === 'number') {
        return serverRes.totalPoints;
      }
    } else {
      console.warn('⚠️ Cannot add XP: User not logged in.');
    }
    
    return 0;
  } catch (e) { 
    console.warn('Error syncing XP to server', e?.message);
    return 0; 
  }
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
  // Legacy function, streak is now managed by the backend exclusively.
  return 0;
};

export const getStreak = async () => {
  return 0; // Legacy function, streak is managed via AuthContext & Backend
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
