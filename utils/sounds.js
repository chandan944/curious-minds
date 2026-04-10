import { Audio } from 'expo-av';

// ─────────────────────────────────────────────
//  SOUND MANAGER
//  All sounds use expo-av Audio.Sound
//  Sound files live in assets/sounds/
//  Uses short synthesized tones if files not found
// ─────────────────────────────────────────────

let sounds = {};
let isMuted = false;

// Sound file map — add your .mp3 files to assets/sounds/
const SOUND_FILES = {
  tap:         require('../assets/sounds/tap.mp3'),
  correct:     require('../assets/sounds/correct.mp3'),
  wrong:       require('../assets/sounds/wrong.mp3'),
  celebration: require('../assets/sounds/celebration.mp3'),
  xp:          require('../assets/sounds/xp.mp3'),
  badge:       require('../assets/sounds/badge.mp3'),
  unlock:      require('../assets/sounds/unlock.mp3'),
  whoosh:      require('../assets/sounds/whoosh.mp3'),
  tick:        require('../assets/sounds/tick.mp3'),
};

export const initSounds = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
    });
    // Preload all sounds
    for (const [key, file] of Object.entries(SOUND_FILES)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, { volume: 1.0 });
        sounds[key] = sound;
      } catch (e) {
        console.log(`Sound ${key} not loaded (file missing), skipping`);
      }
    }
  } catch (e) {
    console.log('Sound init error:', e);
  }
};

export const playSound = async (name) => {
  if (isMuted) return;
  const sound = sounds[name];
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    // Silently ignore — sound is non-critical
  }
};

export const setMuted = (val) => { isMuted = val; };
export const getMuted = () => isMuted;

export const unloadSounds = async () => {
  for (const sound of Object.values(sounds)) {
    try { await sound.unloadAsync(); } catch {}
  }
  sounds = {};
};

// Convenience helpers
export const soundTap = () => playSound('tap');
export const soundCorrect = () => playSound('correct');
export const soundWrong = () => playSound('wrong');
export const soundCelebration = () => playSound('celebration');
export const soundXP = () => playSound('xp');
export const soundBadge = () => playSound('badge');
export const soundUnlock = () => playSound('unlock');
export const soundWhoosh = () => playSound('whoosh');
export const soundTick = () => playSound('tick');
