import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";

import { COLORS } from "./constants/theme";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import HomeScreen from "./screens/HomeScreen";
import { initSounds } from "./utils/sounds";

export default function App() {
  const [soundsReady, setSoundsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    async function loadSounds() {
      await initSounds();
      setSoundsReady(true);
    }
    loadSounds();
  }, []);

  if (!fontsLoaded || !soundsReady) {
    return (
      <View style={styles.loading}>
        <LottieView
          source={require('./assets/Smooth Triple Dot Loading.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
          colorFilters={[
            { keypath: "Shape Layer 1", color: COLORS.accent },
            { keypath: "Shape Layer 2", color: COLORS.correct },
            { keypath: "Shape Layer 3", color: COLORS.xpGold },
          ]}
        />

        <Text
          style={[
            styles.loadingText,
            {
              fontFamily: "Outfit_600SemiBold",
              letterSpacing: 1,
              marginTop: -20,
            },
          ]}
        >
          Loading Curious Minds...
        </Text>
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <HomeScreen />
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.bg1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
});