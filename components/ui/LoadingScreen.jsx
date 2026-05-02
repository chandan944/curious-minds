import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from './Icons';

const { width } = Dimensions.get('window');

const QUOTES = [
  "Stay hungry, stay foolish. — Steve Jobs",
  "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
  "I have no special talent. I am only passionately curious. — Albert Einstein",
  "Learning never exhausts the mind. — Leonardo da Vinci",
  "Curiosity is the wick in the candle of learning. — William Arthur Ward",
  "The important thing is not to stop questioning. — Albert Einstein",
];

export default function LoadingScreen({ isFontsReady }) {
  const { theme } = useTheme();
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const quoteOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Brain Breathing/Pulsing Animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 2. Quote Cycling Animation
    const quoteInterval = setInterval(() => {
      // Fade out
      Animated.timing(quoteOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change quote
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        // Fade in
        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(quoteInterval);
  }, [glowAnim, pulseAnim, quoteOpacity]);

  // Design Tokens
  const bg = theme.bg.base;
  const accent = theme.accent.primary;
  const txtPrim = theme.text.primary;
  const txtMut = theme.text.muted;
  
  // Use custom font ONLY if it's loaded, otherwise fallback to system font
  const titleFont = isFontsReady ? { fontFamily: 'Outfit_700Bold' } : { fontWeight: 'bold' };
  const quoteFont = isFontsReady ? { fontFamily: 'Outfit_400Regular' } : {};

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.centerBox}>
        {/* Glowing Aura */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: accent,
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        
        {/* Brain Logo */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.bg.surface, borderColor: theme.glass.border }]}>
            <Icon name="brain" size={48} color={accent} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, titleFont, { color: txtPrim }]}>Curious Minds</Text>
      </View>

      {/* Rotating Quotes */}
      <Animated.View style={[styles.quoteContainer, { opacity: quoteOpacity }]}>
        <Text style={[styles.quoteText, quoteFont, { color: txtMut }]}>
          {QUOTES[quoteIndex]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    filter: 'blur(30px)', // Only works on web, but Native uses opacity scaling to fake it
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    letterSpacing: 1.5,
  },
  quoteContainer: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.8,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
