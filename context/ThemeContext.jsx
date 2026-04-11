// ─────────────────────────────────────────────
//  ThemeContext — Global Dark/Light Mode State
//  Wrap your app in <ThemeProvider> and consume
//  via useTheme() hook anywhere.
// ─────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createTheme } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = createTheme(isDark);

  const toggleTheme = useCallback(() => setIsDark(d => !d), []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
