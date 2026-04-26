import React, { useEffect, useState, useRef } from 'react';
import { Text, Animated } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

// 🎨 Vibrant colors derived from the user's gradients
const darkColors = [
  '#00ff87', // Neon green
  '#ff6a00', // Orange
  '#fbc2eb', // Pink
  '#2193b0', // Cyan
  '#f5af19', // Gold
];

const lightColors = [
  '#008a40', // Dark green
  '#c74b00', // Dark orange
  '#8a005c', // Dark magenta
  '#0f5a70', // Dark cyan
  '#b27300', // Dark gold/brown
];

// 🔥 Animated Text overlay without MaskedView to prevent text overlap in RN
const VibrantText = ({ children, style, italic, isDark }) => {
  const [index, setIndex] = useState(0);
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % (isDark ? darkColors.length : lightColors.length);

        colorAnim.setValue(0);
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 300000, // 5 minutes transition
          useNativeDriver: false,
        }).start();

        return next;
      });
    }, 300000); // 5 minutes interval

    return () => clearInterval(interval);
  }, []);

  const colors = isDark ? darkColors : lightColors;
  const currentColor = colors[index];
  const nextColor = colors[(index + 1) % colors.length];

  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentColor, nextColor],
  });

  return (
    <Animated.Text
      style={[
        style,
        {
          color: animatedColor,
          fontFamily: 'Outfit_600SemiBold', // ✅ little bold (perfect)
          letterSpacing: 0.8, // ✨ improved readability
        },
        italic && { fontStyle: 'italic' },
      ]}
    >
      {children}
    </Animated.Text>
  );
};

// 🧠 Markdown Parser
export default function MarkdownText({ children, style, ...props }) {
  const { isDark } = useTheme();

  if (typeof children !== 'string') {
    return <Text style={style} {...props}>{children}</Text>;
  }

  const parts = children.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return (
    <Text style={style} {...props}>
      {parts.map((part, index) => {
        // **bold**
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return (
            <VibrantText key={index} style={style} isDark={isDark}>
              {inner}
            </VibrantText>
          );
        }

        // *italic*
        if (part.startsWith('*') && part.endsWith('*')) {
          const inner = part.slice(1, -1);
          return (
            <VibrantText key={index} style={style} italic isDark={isDark}>
              {inner}
            </VibrantText>
          );
        }

        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}