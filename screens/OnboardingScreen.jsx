// ─────────────────────────────────────────────────────────────
//  OnboardingScreen.jsx — Balanced Premium Onboarding
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/ui/Icons';
import { FONTS, RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

const SLIDES = [
  {
    id: '1',
    headline: 'Learn anything.\nAnytime.',
    sub: '150+ interactive topics across science, philosophy, psychology, and technology — crafted for the deeply curious.',
    icon: 'compass',
    accent: '#7B6FFF',
    highlights: [
      { icon: 'flask', label: 'Interactive Labs' },
      { icon: 'brain', label: 'Bite-sized Lessons' },
      { icon: 'atom', label: 'Real Simulations' },
    ],
  },
  {
    id: '2',
    headline: 'Read. Chat.\nGrow together.',
    sub: 'A premium e-book library, global community chat, and an AI tutor that never sleeps — your complete learning companion.',
    icon: 'book',
    accent: '#34D399',
    highlights: [
      { icon: 'book', label: 'Premium E-Books' },
      { icon: 'chat', label: 'Global Community' },
     
    ],
  },
  {
    id: '3',
    headline: 'Compete.\nClimb. Conquer.',
    sub: 'Earn XP from quizzes, climb the global leaderboard, collect badges, and prove you are the sharpest mind.',
    icon: 'trophy',
    accent: '#F59E0B',
    highlights: [
      { icon: 'question', label: 'Smart Quizzes' },
      { icon: 'trophy', label: 'Leaderboard' },
      
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

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#08090F', '#0F1019']} style={StyleSheet.absoluteFill} />

      {/* Soft accent glow behind icon area */}
      <View style={[styles.glow, { backgroundColor: slide.accent }]} />

      {/* ── Header ───────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: entranceAnim }]}>  
        <View style={styles.logoRow}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          
        </View>
        <TouchableOpacity onPress={onFinish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Slides ───────────────────────────────── */}
      <FlatList
        ref={slidesRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: item.accent + '12', borderColor: item.accent + '20' }]}>
              <Icon name={item.icon} size={36} color={item.accent} />
            </View>

            {/* Headline */}
           

          
            {/* Highlight Row */}
            <View style={styles.highlightRow}>
              {item.highlights.map((h, i) => (
                <View key={i} style={[styles.highlightItem, { borderColor: 'rgba(255,255,255,0.06)' }]}>
                  <View style={[styles.highlightIcon, { backgroundColor: item.accent + '12' }]}>
                    <Icon name={h.icon} size={18} color={item.accent} />
                  </View>
                  <Text style={styles.highlightLabel}>{h.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />

      {/* ── Bottom ───────────────────────────────── */}
      <View style={styles.bottom}>
        {/* Dots */}
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

        {/* Button */}
        <TouchableOpacity onPress={scrollToNext} activeOpacity={0.85} style={styles.btnWrap}>
          <LinearGradient
            colors={[slide.accent, slide.accent + 'BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: STATUS_BAR_H + 14,
    paddingBottom: 4,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 30, height: 30, borderRadius: 9 },
  brand: { fontFamily: FONTS.displayMedium, fontSize: 15, color: 'rgba(255,255,255,0.65)' },
  skipText: { fontFamily: FONTS.body, fontSize: 14, color: 'rgba(255,255,255,0.3)' },

  // Slide
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 152,
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

  // Bottom
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 30,
    gap: 20,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 5, borderRadius: 3 },
  btnWrap: { width: '100%' },
  btn: {
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
