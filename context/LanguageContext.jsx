// ─────────────────────────────────────────────
//  LanguageContext — Global Language State (EN / HI)
//  Wrap your app in <LanguageProvider> and consume
//  via useLanguage() hook anywhere.
// ─────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = '@curious_minds_language';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en'); // 'en' | 'hi'
  const [ready, setReady] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(saved => {
      if (saved === 'hi' || saved === 'en') setLanguageState(saved);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const isHindi = language === 'hi';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isHindi, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
