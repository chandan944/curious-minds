import React, { useEffect, useState, useRef } from 'react';
import { Text, Animated } from 'react-native';

// 🎨 Vibrant colors derived from the user's gradients
const vividColors = [
  '#00ff87', // Neon green
  '#ff6a00', // Orange
  '#fbc2eb', // Pink
  '#2193b0', // Cyan
  '#f5af19', // Gold
];

// 🔥 Animated Text overlay without MaskedView to prevent text overlap in RN
const VibrantText = ({ children, style, italic }) => {
  const [index, setIndex] = useState(0);
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % vividColors.length;

        colorAnim.setValue(0);
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentColor = vividColors[index];
  const nextColor = vividColors[(index + 1) % vividColors.length];

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
            <VibrantText key={index} style={style}>
              {inner}
            </VibrantText>
          );
        }

        // *italic*
        if (part.startsWith('*') && part.endsWith('*')) {
          const inner = part.slice(1, -1);
          return (
            <VibrantText key={index} style={style} italic>
              {inner}
            </VibrantText>
          );
        }

        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}