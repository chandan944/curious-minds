import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
//  storage.js — Local persistence for user data
//  Optimized with memory caching and batch reads
// ─────────────────────────────────────────────

const KEYS = {
  XP_TOTAL:         '@curious_xp_total',
  STREAK:           '@curious_streak',
  LAST_LOGIN:       '@curious_last_login',
  BADGES:           '@curious_badges',
  TOPIC_PROGRESS:   '@curious_topic_progress',
  COMPLETED_ITEMS:  '@curious_completed_items',
  SOUND_MUTED:      '@curious_sound_muted',
};

// ── In-memory cache for hot data ──────────────
const cache = {};

// ── Helpers ──────────────────────────────────────
const safeGet = async (key) => {
  // Check memory cache first
  if (cache[key] !== undefined) return cache[key];
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw != null ? JSON.parse(raw) : null;
    cache[key] = parsed; // Populate cache
    return parsed;
  } catch { return null; }
};

const safeSet = async (key, val) => {
  try {
    cache[key] = val; // Update cache immediately
    await AsyncStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// ── XP ─────────────────────────────────────────
export const getXP = () => safeGet(KEYS.XP_TOTAL);
export const setXP = (xp) => safeSet(KEYS.XP_TOTAL, xp);
export const addXP = async (amount) => {
  const current = (await getXP()) || 0;
  const newXP = current + amount;
  await setXP(newXP);
  return newXP;
};

// ── Streak ─────────────────────────────────────
export const getStreak = () => safeGet(KEYS.STREAK);
export const setStreak = (s) => safeSet(KEYS.STREAK, s);

// ── Last Login ─────────────────────────────────
export const getLastLogin = () => safeGet(KEYS.LAST_LOGIN);
export const setLastLogin = (d) => safeSet(KEYS.LAST_LOGIN, d);

// ── Badges ─────────────────────────────────────
export const getBadges = async () => (await safeGet(KEYS.BADGES)) || [];
export const addBadge = async (badge) => {
  const current = await getBadges();
  if (current.find(b => b.id === badge.id)) return current;
  const updated = [...current, { ...badge, unlockedAt: new Date().toISOString() }];
  await safeSet(KEYS.BADGES, updated);
  return updated;
};

export const awardBadge = async (badgeId) => {
  const current = await getBadges();
  if (current.find(b => b.id === badgeId)) return false; // Already awarded
  const newBadge = { id: badgeId, unlockedAt: new Date().toISOString() };
  const updated = [...current, newBadge];
  await safeSet(KEYS.BADGES, updated);
  return true; // Newly awarded
};

// ── Topic Progress ─────────────────────────────
export const getTopicProgress = async (topicId) => {
  const all = (await safeGet(KEYS.TOPIC_PROGRESS)) || {};
  return all[topicId] || null;
};

export const updateTopicProgress = async (topicId, data) => {
  const all = (await safeGet(KEYS.TOPIC_PROGRESS)) || {};
  all[topicId] = { ...(all[topicId] || {}), ...data, lastUpdated: new Date().toISOString() };
  await safeSet(KEYS.TOPIC_PROGRESS, all);
  return all[topicId];
};

export const getAllTopicProgress = async () => {
  return (await safeGet(KEYS.TOPIC_PROGRESS)) || {};
};

// ── Completed Items ────────────────────────────
export const getCompletedItems = async () => {
  return (await safeGet(KEYS.COMPLETED_ITEMS)) || [];
};

export const toggleCompletedItem = async (itemId) => {
  const current = await getCompletedItems();
  let updated;
  if (current.includes(itemId)) {
    updated = current.filter(id => id !== itemId);
  } else {
    updated = [...current, itemId];
  }
  await safeSet(KEYS.COMPLETED_ITEMS, updated);
  return updated;
};

// ── Sound ──────────────────────────────────────
export const getSoundMuted = async () => {
  const val = await safeGet(KEYS.SOUND_MUTED);
  return val === true;
};
export const setSoundMuted = (muted) => safeSet(KEYS.SOUND_MUTED, muted);

// ── Full Stats (batch read for speed) ──────────
export const getFullStats = async () => {
  try {
    // Use multiGet to batch all AsyncStorage reads into a single operation
    const keys = [KEYS.XP_TOTAL, KEYS.STREAK, KEYS.BADGES, KEYS.LAST_LOGIN, KEYS.TOPIC_PROGRESS, KEYS.COMPLETED_ITEMS];
    const pairs = await AsyncStorage.multiGet(keys);
    const result = {};
    pairs.forEach(([key, value]) => {
      try {
        const parsed = value != null ? JSON.parse(value) : null;
        result[key] = parsed;
        cache[key] = parsed; // Warm the cache
      } catch {
        result[key] = null;
      }
    });

    return {
      xp:             result[KEYS.XP_TOTAL] || 0,
      streak:         result[KEYS.STREAK] || 0,
      badges:         result[KEYS.BADGES] || [],
      lastLogin:      result[KEYS.LAST_LOGIN] || null,
      topicProgress:  result[KEYS.TOPIC_PROGRESS] || {},
      completedItems: result[KEYS.COMPLETED_ITEMS] || [],
    };
  } catch {
    return { xp: 0, streak: 0, badges: [], lastLogin: null, topicProgress: {}, completedItems: [] };
  }
};

// ── Streak Check (called on app open) ─────────
export const checkAndUpdateStreak = async () => {
  const now    = new Date();
  const last   = await getLastLogin();
  const streak = (await getStreak()) || 0;

  if (last) {
    const lastDate = new Date(last);
    
    // Compare calendar dates (not raw timestamps) to handle midnight edge cases
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const daysDiff = Math.round((todayDate - lastDateOnly) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day — increment streak
      const newStreak = streak + 1;
      await setStreak(newStreak);
      await setLastLogin(now.toISOString());
      return { streak: newStreak, isNew: true };
    } else if (daysDiff > 1) {
      // Missed a day — reset streak
      await setStreak(1);
      await setLastLogin(now.toISOString());
      return { streak: 1, isNew: true, wasReset: true };
    } else {
      // Same day (daysDiff === 0)
      return { streak, isNew: false };
    }
  } else {
    // First ever login
    await setStreak(1);
    await setLastLogin(now.toISOString());
    return { streak: 1, isNew: true, isFirst: true };
  }
};

// ── Reset All (for debugging) ──────────────────
export const resetAll = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    // Clear memory cache
    Object.keys(cache).forEach(k => delete cache[k]);
  } catch {}
};
