#!/usr/bin/env node
// Run: node scripts/createSoundPlaceholders.js
// Creates empty placeholder .mp3 files so the app doesn't crash before real sounds are added
// Replace each file with a real sound from freesound.org or zapsplat.com

const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });

// Minimal valid MP3 (silent, ~0.1s) as base64
// This is a real minimal MP3 header that won't crash expo-av
const SILENT_MP3_BASE64 = 
  'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA' +
  '//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAA' +
  'CAAADhgCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAA' +
  'AAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';

const sounds = ['tap', 'correct', 'wrong', 'celebration', 'xp', 'badge', 'unlock', 'whoosh', 'tick'];

sounds.forEach(name => {
  const filePath = path.join(soundsDir, `${name}.mp3`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(SILENT_MP3_BASE64, 'base64'));
    console.log(`Created placeholder: ${name}.mp3`);
  } else {
    console.log(`Already exists: ${name}.mp3`);
  }
});

console.log('\nDone! Replace each placeholder with a real sound file.');
console.log('Free sounds: freesound.org | zapsplat.com | mixkit.co');
