// ─────────────────────────────────────────────
//  authStorage.js — JWT token + user persistence
// ─────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@curious_minds_token';
const USER_KEY  = '@curious_minds_user';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
};

export const getUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthStorage = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (e) {
    console.error('clearAuthStorage error:', e);
  }
};
