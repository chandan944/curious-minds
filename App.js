// ─────────────────────────────────────────────
//  App.js — Root with Auth-gated navigation
// ─────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './constants/theme';
import { ThemeProvider }    from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomeScreen  from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import { initSounds } from './utils/sounds';

function MainAppContent({ isFontsReady }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isFontsReady || isLoading) {
    return (
      <View style={styles.loading}>
        <LottieView
          source={require('./assets/Smooth Triple Dot Loading.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
          colorFilters={[
            { keypath: 'Shape Layer 1', color: COLORS.accent },
            { keypath: 'Shape Layer 2', color: COLORS.correct },
            { keypath: 'Shape Layer 3', color: COLORS.xpGold },
          ]}
        />
      </View>
    );
  }

  return isAuthenticated ? <HomeScreen /> : <LoginScreen />;
}

// ── Root component ────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const [forceLoad, setForceLoad] = useState(false);

  useEffect(() => {
    initSounds().catch(console.error);

    // Fallback: If fonts take longer than 5 seconds, force the app to load anyway
    const timer = setTimeout(() => {
      setForceLoad(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const isFontsReady = fontsLoaded || forceLoad;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <StatusBar style="auto" />
            <MainAppContent isFontsReady={isFontsReady} />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});