// ─────────────────────────────────────────────
//  api.js — Axios instance pointing to Spring Boot backend
//
//  ⚠️  UPDATE THE IP below to your machine's local IP
//      when testing on a physical device via Expo Go / dev build.
//      For Android emulator use: http://10.0.2.2:8080
// ─────────────────────────────────────────────
// http://192.168.43.112:8080
import axios from 'axios';

// 🔧 Change this to your PC's local IP when on a physical device
export const BACKEND_URL = 'https://curiousminds.dpdns.org';
// export const BACKEND_URL = 'http://192.168.43.112:8080';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000, // 15s default — fast fail for normal API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload-specific timeout (used by EbookScreen file uploads)
export const UPLOAD_TIMEOUT = 600000; // 10 minutes for large PDFs

// Auto-handle 401 responses (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear auth header to prevent stale requests
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default api;
