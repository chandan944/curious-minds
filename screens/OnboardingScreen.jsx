import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/ui/Icons';
import { FONTS, RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Explore the Universe',
    description: 'Dive into interactive labs and bite-sized lessons across Science, Philosophy, Technology, and Society.',
    icon: 'compass',
    colors: ['#0F1320', '#1C1A3A'],
    accent: '#7B6FFF',
  },
  {
    id: '2',
    title: 'Your Personal AI Tutor',
    description: 'Stuck on a complex concept? Ask your AI guide anytime for instant, personalized explanations.',
    icon: 'message-circle',
    colors: ['#1C1A3A', '#2E1534'],
    accent: '#FF6B6B',
  },
  {
    id: '3',
    title: 'Compete & Connect',
    description: 'Earn points, unlock achievements, climb the global leaderboard, and chat with fellow curious minds.',
    icon: 'trophy',
    colors: ['#2E1534', '#0F1320'],
    accent: '#FFD166',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const skip = () => {
    onFinish();
  };

  // Interpolate background color
  const bgAnim = scrollX.interpolate({
    inputRange: SLIDES.map((_, i) => i * width),
    outputRange: SLIDES.map((s) => s.colors[1]),
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.root, { backgroundColor: bgAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Bar with Skip */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        ref={slidesRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // color interpolation needs false
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item, index }) => {
          // Individual slide content
          return (
            <View style={styles.slide}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconRing, { backgroundColor: item.accent + '20' }]}>
                  <View style={[styles.iconInner, { backgroundColor: item.accent + '40' }]}>
                    <Icon name={item.icon} size={64} color={item.accent} />
                  </View>
                </View>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Bottom Control Section */}
      <View style={styles.bottomControls}>
        {/* Paginator */}
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const activeColor = SLIDES[i].accent;

            return (
              <Animated.View
                key={i.toString()}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: activeColor }
                ]}
              />
            );
          })}
        </View>

        {/* Next / Start Button */}
        <TouchableOpacity
          onPress={scrollToNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[SLIDES[currentIndex].accent, SLIDES[currentIndex].accent + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>
              {currentIndex === SLIDES.length - 1 ? "Let's Begin" : "Next"}
            </Text>
            <Icon 
              name={currentIndex === SLIDES.length - 1 ? 'check' : 'arrow-right'} 
              size={20} 
              color="#FFF" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: FONTS.displayMedium,
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingTop: 20,
  },
  paginator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  actionText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
