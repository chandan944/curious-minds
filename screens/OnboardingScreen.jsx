// ─────────────────────────────────────────────────────────────
//  OnboardingScreen.jsx — Balanced Premium Onboarding
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../utils/sounds';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/ui/Icons';
import { FONTS, RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

// ── Cosmic floating orbs ─────────────────────────────────────
const ORB_COLORS = ['#3B82F6', '#A78BFA', '#F472B6', '#4ADE80', '#F59E0B', '#818CF8', '#FB7185', '#34D399'];
const ORB_COUNT = 18;

function useOrbs() {
  return useMemo(() => {
    const corners = [
      { xMin: -10, xMax: width * 0.25, yMin: -10, yMax: height * 0.18 },   // top-left
      { xMin: width * 0.75, xMax: width + 10, yMin: -10, yMax: height * 0.18 }, // top-right
      { xMin: -10, xMax: width * 0.25, yMin: height * 0.82, yMax: height + 10 }, // bottom-left
      { xMin: width * 0.75, xMax: width + 10, yMin: height * 0.82, yMax: height + 10 }, // bottom-right
    ];
    return Array.from({ length: ORB_COUNT }, (_, i) => {
      const c = corners[i % 4];
      return {
        id: i,
        size: 4 + Math.random() * 14,
        x: c.xMin + Math.random() * (c.xMax - c.xMin),
        y: c.yMin + Math.random() * (c.yMax - c.yMin),
        color: ORB_COLORS[i % ORB_COLORS.length],
        opacity: 0.15 + Math.random() * 0.3,
        duration: 3000 + Math.random() * 5000,
        drift: 10 + Math.random() * 25,
      };
    });
  }, []);
}

const FloatingOrb = React.memo(({ orb }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: orb.duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: orb.duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -orb.drift] });
  const translateX = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, orb.drift * 0.4, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', left: orb.x, top: orb.y,
      width: orb.size, height: orb.size, borderRadius: orb.size / 2,
      backgroundColor: orb.color, opacity: orb.opacity,
      transform: [{ translateY }, { translateX }],
    }} />
  );
});

function CosmicOrbs() {
  const orbs = useOrbs();
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]} pointerEvents="none">
      {orbs.map(o => <FloatingOrb key={o.id} orb={o} />)}
    </View>
  );
}

const SLIDES = [
  {
    id: '1',
    headline: 'Master the World\nfrom First Principles',
    sub: 'Move beyond surface-level trivia. Deep-dive into the fundamental laws of science, finance, and history with academic rigor.',
    image: require('../assets/onboarding_screen/theory.png'),
    accent: '#3B82F6', // Science Blue
    highlights: [
      { icon: 'flask', label: 'Theory Cards' },
      { icon: 'atom', label: 'Fundamental Laws' },
      { icon: 'zap', label: 'Quick Insights' },
    ],
  },
  {
    id: '2',
    headline: 'Theory Meets\nInteractive Labs',
    sub: 'Learn through high-fidelity theory cards and test your intuition in our immersive, interactive labs.',
    image: require('../assets/onboarding_screen/lab.png'),
    accent: '#4ADE80', // Nature Green
    highlights: [
      { icon: 'cpu', label: 'Real Simulations' },
      { icon: 'target', label: 'Interactive Tests' },
      { icon: 'layers', label: 'Deep Learning' },
    ],
  },
  {
    id: '3',
    headline: 'The Daily\nFacts Hub',
    sub: 'Access 1,000+ premium educational facts. Stunningly designed, dual-language (EN/HI), and ready to share.',
    image: require('../assets/onboarding_screen/fact.png'),
    accent: '#F472B6', // Pink Fact
    highlights: [
      { icon: 'share', label: 'Shareable Facts' },
      { icon: 'message-circle', label: 'Hindi Support' },
      { icon: 'star', label: 'Daily Wisdom' },
    ],
  },
  {
    id: '4',
    headline: 'Mind-Blowing\nGlitch eBooks',
    sub: 'A revolutionary reading experience. Immerse yourself in deep insights with animated layouts and profound knowledge.',
    image: require('../assets/onboarding_screen/ebook.png'),
    accent: '#A78BFA', // Purple Book
    highlights: [
      { icon: 'book-open', label: 'Deep Insights' },
      { icon: 'galaxy', label: 'Premium Design' },
      { icon: 'moon', label: 'Dark Reading' },
    ],
  },
  {
    id: '5',
    headline: 'Compete, Chat\nand Conquer',
    sub: 'Challenge yourself in quizzes, climb the global leaderboard, and connect with a community of bright minds.',
    image: require('../assets/onboarding_screen/quiz.png'),
    accent: '#F59E0B', // Gold
    highlights: [
      { icon: 'award', label: 'Global Rank' },
      { icon: 'users', label: 'Chat Hub' },
      { icon: 'badge', label: 'Collect XP' },
    ],
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const [hasFinished, setHasFinished] = useState(false);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    if (currentIndex === SLIDES.length && !hasFinished) {
      setHasFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFinish();
    }
  }, [currentIndex, hasFinished, onFinish]);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < SLIDES.length) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex] || SLIDES[SLIDES.length - 1];

  const bgColors = [
    '#0B132B', // Theory: Dark Blue
    '#0B2416', // Lab: Dark Green
    '#2E0B20', // Fact: Dark Pink
    '#1A0B2E', // eBook: Dark Purple
    '#2E1C0B', // Quiz: Dark Gold
  ];

  const animatedBg = scrollX.interpolate({
    inputRange: [...SLIDES.map((_, i) => i * width), SLIDES.length * width],
    outputRange: [...bgColors, '#08090F'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: animatedBg }]} />


      {/* ── Header Overlay (Z-Index) ── */}
      <Animated.View style={[styles.header, { opacity: entranceAnim }]}>  
        
        <TouchableOpacity onPress={onFinish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Full Screen Slides ── */}
      <FlatList
        ref={slidesRef}
        data={[...SLIDES, { id: 'finish' }]} // Append dummy slide to trigger onFinish when scrolled
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={true}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => {
          if (item.id === 'finish') {
            return (
              <View style={{ width, height, backgroundColor: '#08090F', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            );
          }
          return (
            <View style={styles.slide}>
              <Image 
                source={item.image} 
                style={styles.slideImage} 
                resizeMode="cover"
              />
            </View>
          );
        }}
      />

      {/* ── Bottom Overlay Dots (Z-Index) ── */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const w = scrollX.interpolate({ inputRange, outputRange: [6, 24, 6], extrapolate: 'clamp' });
            const o = scrollX.interpolate({ inputRange, outputRange: [0.2, 1, 0.2], extrapolate: 'clamp' });
            return (
              <Animated.View key={i} style={[styles.dot, { width: w, opacity: o, backgroundColor: s.accent }]} />
            );
          })}
        </View>

        <TouchableOpacity onPress={scrollToNext} style={styles.nextBtn} activeOpacity={0.8}>
          <Icon name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Cosmic Orbs (above slides, below controls) ── */}
      <CosmicOrbs />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090F' },

  glow: {
    position: 'absolute',
    top: height * 0.18,
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.06,
  },

  // Header Overlay
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: STATUS_BAR_H + 14,
    paddingBottom: 4,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 30, height: 30, borderRadius: 9 },
  skipText: { fontFamily: FONTS.body, fontSize: 16, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 },

  // Full Screen Slide
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  sub: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 310,
    marginBottom: 36,
  },

  // Highlights
  highlightRow: {
    flexDirection: 'row',
    gap: 10,
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  highlightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },

  // Bottom Overlay
  bottom: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: 6, borderRadius: 3 },
  nextBtn: {
    position: 'absolute',
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
