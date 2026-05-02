// ─────────────────────────────────────────────
//  leaderboardService.js — API calls for leaderboard + XP sync
// ─────────────────────────────────────────────
import api from './api';

/**
 * Fetch leaderboard for a given time period.
 * @param {'all'|'week'|'day'|'hour'} period
 * @param {number} page  zero-indexed page
 * @param {number} size  items per page
 */
export const fetchLeaderboard = async (period = 'all', page = 0, size = 20) => {
  const response = await api.get(`/leaderboard/${period}`, {
    params: { page, size },
  });
  return response.data; // { content, totalPages, totalElements, currentPage }
};

/**
 * Push locally earned XP to the backend.
 * @param {string} token  JWT token
 * @param {number} points  XP amount to add
 * @param {string} reason  e.g. 'quiz_correct', 'theory_read'
 * @param {number} streak  current streak count
 */
export const syncXpToServer = async (token, points, reason, streak = 0) => {
  const response = await api.post(
    '/user/sync-xp',
    { points, reason, streak },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // { success, totalPoints, level, title, streak }
};
