import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────
//  StarBackground — subtle animated particles
//  Optimized: reduced count, memoized
// ─────────────────────────────────────────────

const NUM_STARS = 20;

const Star = React.memo(function Star({ x, y, size, opacity, duration, delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [opacity * 0.3, opacity],
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: animOpacity,
        },
      ]}
    />
  );
});

const stars = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 1.5,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.6 + 0.1,
  duration: Math.random() * 3000 + 2000,
  delay: Math.random() * 4000,
}));

const StarBackground = React.memo(function StarBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map(s => <Star key={s.id} {...s} />)}
    </View>
  );
});

export default StarBackground;

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});

