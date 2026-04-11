import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
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
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingText}>Loading Curious Minds...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <HomeScreen />
    </ThemeProvider>
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