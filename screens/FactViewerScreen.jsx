import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, StatusBar, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useProgress } from "../context/ProgressContext";
import { FONTS, SPACING, RADIUS } from "../constants/theme";
import Icon from "../components/ui/Icons";
import { soundTap } from "../utils/sounds";
import FactCards from "../components/FactCards";
import { FACT_CONFIGS, FACT_CONFIGS_HI, FACT_REGISTRY } from "../constants/factRegistry";
import LottieView from 'lottie-react-native';

const STATUS_BAR_H = Platform.OS === "android" ? ((StatusBar.currentHeight || 36) + 10) : 0;

export default function FactViewerScreen({ topicId, onClose }) {
  const { theme, isDark } = useTheme();
  const { isCompleted, toggleCompletion, markAsCompleted } = useProgress();
  const [lang, setLang] = useState('en');
  const [config, setConfig] = useState(null);
  const isDone = isCompleted(topicId);

  useEffect(() => {
    try {
      // Load config dynamically based on language
      const registry = lang === 'hi' ? FACT_CONFIGS_HI : FACT_CONFIGS;
      const loader = registry[topicId];
      if (loader) {
        const loadedConfig = loader();
        setConfig(loadedConfig);
      }
    } catch (e) {
      console.warn('Failed to load fact config for:', topicId, e);
      // Show fallback instead of crashing
      setConfig({
        accentKey: 'default',
        facts: [{
          id: 'error',
          content: 'This topic is being updated. Please check back soon! 🔄',
          color: '#7B6FFF',
          bgGradient: ['#1A1A1A', '#050505'],
          svgIcon: 'info',
        }],
      });
    }
  }, [topicId, lang]);

  if (!config) {
    return (
      <View style={[styles.root, { backgroundColor: theme?.bg?.base || '#08090F', justifyContent: 'center', alignItems: 'center' }]}>
        <LottieView
          source={require('../assets/Smooth Triple Dot Loading.json')}
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

  // Find theme colors for this topic
  const topicColors = theme?.topics || {};
  const accentColor = (topicColors[config.accentKey] || topicColors.default || { primary: '#F59E0B' }).primary;

  const handleClose = () => {
    soundTap();
    onClose();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme?.bg?.base || '#08090F' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Full screen Fact Cards */}
      <FactCards 
        facts={config.facts} 
        onComplete={() => {
          markAsCompleted(topicId);
          handleClose();
        }} 
      />

      {/* Floating Header */}
      <View style={styles.headerAbsolute}>
        <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
          <Icon name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>


      {/* Language Toggle Button */}
      <TouchableOpacity
        onPress={() => { soundTap(); setLang(lang === 'en' ? 'hi' : 'en'); }}
        style={styles.langToggleBtn}
      >
        <Text style={styles.langToggleText}>{lang.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, zIndex: 200, backgroundColor: '#000' },
  headerAbsolute: {
    position: 'absolute',
    top: STATUS_BAR_H + 10,
    left: SPACING.lg,
    zIndex: 10,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  langToggleBtn: {
    position: 'absolute',
    top: STATUS_BAR_H + 10,
    right: SPACING.lg,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  langToggleText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
