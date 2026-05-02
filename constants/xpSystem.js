// ─────────────────────────────────────────────
//  XP & PROGRESSION SYSTEM — Redesigned (Harder)
//  Points are now significantly harder to earn.
//  Level thresholds are much steeper.
// ─────────────────────────────────────────────

export const XP_REWARDS = {
  theoryRead:     5,    // Was 10 — must actually read to earn this
  labInteraction: 8,    // Was 15 — reduced; labs are accessible
  quizCorrect:    10,   // Was 20 — per question, fair but not generous
  quizPerfect:    50,   // Was 100 — bonus for 10/10 perfect score
  quizComplete:   20,   // Was 50 — just for finishing is not huge
  dykAnswered:    12,   // Was 25 — curiosity should be modestly rewarded
  firstVisit:     2,    // Was 5 — almost nothing for just opening a topic
  streakBonus:    15,   // Was 30 — daily consistency is still valued
  scientistMode:  25,   // Was 40 — unlocking is effort
  labBreaker:     30,   // Was 50 — extreme lab testing
};

export const LEVELS = [
  { level: 1,  title: 'Curious Kid',    minXP: 0,       color: '#98D8C8' },
  { level: 2,  title: 'Explorer',       minXP: 300,     color: '#85C1E9' },
  { level: 3,  title: 'Thinker',        minXP: 800,     color: '#A8EDEA' },
  { level: 4,  title: 'Investigator',   minXP: 1800,    color: '#C3B1E1' },
  { level: 5,  title: 'Scientist',      minXP: 4000,    color: '#6C63FF' },
  { level: 6,  title: 'Researcher',     minXP: 8000,    color: '#4ECDC4' },
  { level: 7,  title: 'Innovator',      minXP: 15000,   color: '#00E5A0' },
  { level: 8,  title: 'Genius',         minXP: 28000,   color: '#FFD166' },
  { level: 9,  title: 'Mastermind',     minXP: 50000,   color: '#FF9F1C' },
  { level: 10, title: 'Einstein Mode',  minXP: 100000,  color: '#FF6B9D' },
];

export const BADGES = {
  // Topic badges (earned per topic)
  topic_complete:    { id: 'topic_complete',    name: 'Topic Master',    emoji: '🎓', description: 'Completed a topic' },
  perfect_quiz:      { id: 'perfect_quiz',      name: 'Perfect Score',   emoji: '💯', description: '10/10 on a quiz' },
  scientist_mode:    { id: 'scientist_mode',    name: 'Scientist',       emoji: '🔬', description: 'Unlocked Scientist Mode' },
  lab_breaker:       { id: 'lab_breaker',       name: 'Lab Breaker',     emoji: '💥', description: 'Tested extreme values in the lab' },
  speed_demon:       { id: 'speed_demon',       name: 'Speed Demon',     emoji: '⚡', description: 'Finished quiz in under 60 seconds' },
  // Global badges
  streak_3:          { id: 'streak_3',          name: '3-Day Streak',    emoji: '🔥', description: '3 days in a row' },
  streak_7:          { id: 'streak_7',          name: 'Week Warrior',    emoji: '🗓️', description: '7 days in a row' },
  topic_5:           { id: 'topic_5',           name: 'Five Topics',     emoji: '🌟', description: 'Completed 5 topics' },
  topic_10:          { id: 'topic_10',           name: 'Ten Topics',      emoji: '🏆', description: 'Completed 10 topics' },
  first_step:        { id: 'first_step',        name: 'First Step',      emoji: '👣', description: 'Completed your first topic' },
};

export const getLevelForXP = (xp) => {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
};

export const getNextLevel = (xp) => {
  const current = getLevelForXP(xp);
  const idx = LEVELS.findIndex(l => l.level === current.level);
  return LEVELS[idx + 1] || null;
};

export const getLevelProgress = (xp) => {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 1; // Max level
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.min(earned / range, 1);
};
