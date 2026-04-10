#!/usr/bin/env node
/**
 * Run: node scripts/createSoundPlaceholders.js
 * Creates silent placeholder .mp3 files so require() in sounds.js doesn't crash.
 * Replace each file with a real sound from freesound.org or zapsplat.com
 */

const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Minimal valid MP3 (silent ~0.1s) — real MP3 header, won't crash expo-av
const SILENT_MP3_HEX =
  'fffb9000000000000000000000000000000000000000000000000000000000000000' +
  '0000000000000000000000000000000000000000000000000000000000000000000000' +
  '000000000000000000000000000000000000000000000000000000000000';

const SILENT_MP3 = Buffer.from(SILENT_MP3_HEX, 'hex');

const sounds = ['tap', 'correct', 'wrong', 'celebration', 'xp', 'badge', 'unlock', 'whoosh', 'tick'];

sounds.forEach(name => {
  const filePath = path.join(soundsDir, `${name}.mp3`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, SILENT_MP3);
    console.log(`✅ Created placeholder: ${name}.mp3`);
  } else {
    console.log(`⏭  Already exists:     ${name}.mp3`);
  }
});

console.log('\nDone! Replace each with a real .mp3 from:');
console.log('  freesound.org | zapsplat.com | mixkit.co\n');