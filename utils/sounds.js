import { createAudioPlayer } from 'expo-audio';

// ─────────────────────────────────────────────
//  SOUND MANAGER — lazy-load version
//  Sounds are loaded on first use, not at startup.
//  Missing sound files are silently ignored.
// ─────────────────────────────────────────────

let sounds = {};
let isMuted = false;

// Sound file references (lazy — not loaded until first play)
const SOUND_FILES = {
  tap:         () => require('../assets/sounds/tap.mp3'),
  correct:     () => require('../assets/sounds/correct.mp3'),
  wrong:       () => require('../assets/sounds/wrong.mp3'),
  celebration: () => require('../assets/sounds/celebration.mp3'),
  xp:          () => require('../assets/sounds/xp.mp3'),
  badge:       () => require('../assets/sounds/badge.mp3'),
  unlock:      () => require('../assets/sounds/unlock.mp3'),
  whoosh:      () => require('../assets/sounds/whoosh.mp3'),
  tick:        () => require('../assets/sounds/tick.mp3'),
};

// Lazy-load a sound on first use instead of loading all at startup
const getOrLoadSound = (name) => {
  if (sounds[name]) return sounds[name];
  const getFile = SOUND_FILES[name];
  if (!getFile) return null;
  try {
    const file = getFile();
    const player = createAudioPlayer(file);
    sounds[name] = player;
    return player;
  } catch (e) {
    // Sound file missing or failed — just skip it
    return null;
  }
};

// initSounds is kept for backward compatibility but is now a no-op
// (sounds are loaded lazily on first use for faster cold start)
export const initSounds = async () => {};

export const playSound = async (name) => {
  if (isMuted) return;
  try {
    const player = getOrLoadSound(name);
    if (!player) return;
    player.seekTo(0);
    player.play();
  } catch (e) {
    // Ignore — sound is non-critical
  }
};

export const setMuted = (val) => { isMuted = val; };
export const getMuted = () => isMuted;

export const unloadSounds = async () => {
  for (const player of Object.values(sounds)) {
    try { player.release(); } catch {}
  }
  sounds = {};
};

// Convenience helpers
export const soundTap         = () => playSound('tap');
export const soundCorrect     = () => playSound('correct');
export const soundWrong       = () => playSound('wrong');
export const soundCelebration = () => playSound('celebration');
export const soundXP          = () => playSound('xp');
export const soundBadge       = () => playSound('badge');
export const soundUnlock      = () => playSound('unlock');
export const soundWhoosh      = () => playSound('whoosh');
export const soundTick        = () => playSound('tick');
// ── Aliases used by lab files ──
export const soundSuccess     = () => playSound('celebration');
export const soundTrophy      = () => playSound('badge');
