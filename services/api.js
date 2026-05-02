// ─────────────────────────────────────────────
//  api.js — Axios instance pointing to Spring Boot backend
//
//  ⚠️  UPDATE THE IP below to your machine's local IP
//      when testing on a physical device via Expo Go / dev build.
//      For Android emulator use: http://10.0.2.2:8080
// ─────────────────────────────────────────────
// https://curiousminds.dpdns.org
import axios from 'axios';

// 🔧 Change this to your PC's local IP when on a physical device
export const BACKEND_URL = 'http://192.168.43.112:8080';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
