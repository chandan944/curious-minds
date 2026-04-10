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

// ✅ FIXED: correct font name
import { SpaceGrotesk_400Regular } from "@expo-google-fonts/space-grotesk";

import { COLORS } from "./constants/theme";
import HomeScreen from "./screens/HomeScreen";
// import { initSounds } from "./utils/sounds"; ❌ disabled for now

export default function App() {
  const [soundsReady, setSoundsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    SpaceGrotesk_400Regular, // ✅ fixed
  });

  useEffect(() => {
    // ❌ Disable sounds temporarily (can fix later)
    // initSounds().finally(() => setSoundsReady(true));

    setSoundsReady(true); // ✅ prevents app from hanging
  }, []);

  // 🧠 SAFE loading condition (important)
  if (!fontsLoaded || !soundsReady) {
    console.log("⏳ Loading...", { fontsLoaded, soundsReady });

    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingText}>Loading app...</Text>
      </View>
    );
  }

  console.log("✅ App Loaded Successfully");

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* 🔥 If crash happens, replace this with <Text>Test</Text> */}
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
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
    fontFamily: "System",
  },
});