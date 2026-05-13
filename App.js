// ─────────────────────────────────────────────
//  App.js — Root with Auth-gated navigation
//  Production-hardened with ErrorBoundary + global handlers
// ─────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, StyleSheet, LogBox } from 'react-native';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from './constants/theme';
import { ThemeProvider }    from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import HomeScreen  from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { initSounds } from './utils/sounds';
import { getHasOnboarded, setHasOnboarded } from './utils/authStorage';

// ── Production: Suppress non-critical yellow box warnings ──
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
  'Setting a timer for a long period',
  'Require cycle:',
]);

// ── Global unhandled promise rejection handler ──
// Prevents the app from crashing on unhandled async errors
const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('🚨 Global error caught:', error);
    // Don't crash the app for non-fatal errors
    if (!isFatal) return;
    // For fatal errors, call the original handler which will show the red screen in dev
    if (originalHandler) originalHandler(error, isFatal);
  });
}

function MainAppContent({ isFontsReady }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasOnboarded, setHasOnboardedState] = useState(null);

  useEffect(() => {
    getHasOnboarded().then(setHasOnboardedState).catch(() => setHasOnboardedState(false));
  }, []);

  if (!isFontsReady || isLoading || hasOnboarded === null) {
    return (
      <View style={styles.loading}>
        <LottieView
          source={require('./assets/Smooth Triple Dot Loading.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
          colorFilters={[
            { keypath: 'Shape Layer 1', color: '#FF6B6B' },
            { keypath: 'Shape Layer 2', color: '#FFD166' },
            { keypath: 'Shape Layer 3', color: '#4ADE80' },
          ]}
        />
      </View>
    );
  }

  if (!hasOnboarded) {
    return (
      <OnboardingScreen 
        onFinish={() => {
          setHasOnboarded(true).then(() => setHasOnboardedState(true));
        }} 
      />
    );
  }

  return isAuthenticated ? <HomeScreen /> : <LoginScreen />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes — data stays fresh, avoids refetch on tab switch
      gcTime: 1000 * 60 * 10,      // 10 minutes — garbage collect unused cache
      retry: 2,                     // retry failed queries twice
      refetchOnWindowFocus: false,  // don't refetch when app returns to foreground
    },
  },
});


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
    initSounds().catch(() => {});

    // Fallback: If fonts take longer than 5 seconds, force the app to load anyway
    const timer = setTimeout(() => {
      setForceLoad(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const isFontsReady = fontsLoaded || forceLoad;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AuthProvider>
              <LanguageProvider>
                <ProgressProvider>
                  <ThemeProvider>
                    <StatusBar style="auto" />
                    <MainAppContent isFontsReady={isFontsReady} />
                  </ThemeProvider>
                </ProgressProvider>
              </LanguageProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
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