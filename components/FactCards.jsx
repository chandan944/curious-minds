import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  FlatList 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './ui/Icons';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../utils/sounds';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// Inspirational taglines that rotate randomly on each share
const SHARE_TAGLINES = [
  'Feed your curiosity',
  'Knowledge is a superpower',
  'Blow someone\'s mind today',
  'Facts that make you think',
  'Your daily dose of brilliance',
  'Share the wonder',
];

const { width, height } = Dimensions.get('window');

// ── 6 Unique 3D Share Designs ──────────────────────────────────
const get3DDesigns = (accentColor, containerHeight) => [
  // 0 ─ Classic Tilt (left lean + glass highlight)
  {
    wrapper: {
      borderRadius: 32,
      overflow: 'hidden',
      width: width - 48,
      height: containerHeight - 120,
      shadowColor: '#000',
      shadowOffset: { width: 15, height: 25 },
      shadowOpacity: 0.7,
      shadowRadius: 35,
      elevation: 20,
      transform: [
        { perspective: 1200 },
        { rotateX: '6deg' },
        { rotateY: '-8deg' },
        { scale: 0.88 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Top glass shine */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 90,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderTopLeftRadius: 32, borderTopRightRadius: 32, zIndex: 1,
        }} />
        {/* Accent line top-left */}
        <View style={{
          position: 'absolute', top: 24, left: 24,
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: color, opacity: 0.7, zIndex: 2,
        }} />
      </>
    ),
  },

  // 1 ─ Dramatic Right Lean (tilted right + bottom glow)
  {
    wrapper: {
      borderRadius: 28,
      overflow: 'hidden',
      width: width - 56,
      height: containerHeight - 140,
      shadowColor: accentColor,
      shadowOffset: { width: -20, height: 30 },
      shadowOpacity: 0.35,
      shadowRadius: 50,
      elevation: 18,
      transform: [
        { perspective: 1000 },
        { rotateX: '4deg' },
        { rotateY: '10deg' },
        { scale: 0.85 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Right edge highlight */}
        <View style={{
          position: 'absolute', top: 30, right: 0, bottom: 30,
          width: 3, backgroundColor: color, opacity: 0.5, zIndex: 2,
          borderTopRightRadius: 28, borderBottomRightRadius: 28,
        }} />
        {/* Bottom glow bar */}
        <View style={{
          position: 'absolute', bottom: 0, left: 40, right: 40, height: 3,
          backgroundColor: color, opacity: 0.4, zIndex: 2,
          borderRadius: 2,
        }} />
      </>
    ),
  },

  // 2 ─ Floating Flat (no tilt, big shadow, elegant)
  {
    wrapper: {
      borderRadius: 36,
      overflow: 'hidden',
      width: width - 64,
      height: containerHeight - 160,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 40 },
      shadowOpacity: 0.8,
      shadowRadius: 60,
      elevation: 24,
      transform: [
        { perspective: 1400 },
        { rotateX: '2deg' },
        { scale: 0.82 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Corner accents - top left & bottom right */}
        <View style={{
          position: 'absolute', top: 20, left: 20,
          width: 24, height: 24,
          borderTopWidth: 2.5, borderLeftWidth: 2.5,
          borderColor: color, opacity: 0.6, zIndex: 2,
          borderTopLeftRadius: 8,
        }} />
        <View style={{
          position: 'absolute', bottom: 50, right: 20,
          width: 24, height: 24,
          borderBottomWidth: 2.5, borderRightWidth: 2.5,
          borderColor: color, opacity: 0.6, zIndex: 2,
          borderBottomRightRadius: 8,
        }} />
        {/* Subtle top shine */}
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'transparent']}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 120, borderTopLeftRadius: 36, borderTopRightRadius: 36, zIndex: 1,
          }}
        />
      </>
    ),
  },

  // 3 ─ Isometric (equal tilt on both axes)
  {
    wrapper: {
      borderRadius: 24,
      overflow: 'hidden',
      width: width - 52,
      height: containerHeight - 130,
      shadowColor: '#000',
      shadowOffset: { width: 25, height: 25 },
      shadowOpacity: 0.65,
      shadowRadius: 40,
      elevation: 20,
      transform: [
        { perspective: 900 },
        { rotateX: '10deg' },
        { rotateY: '-10deg' },
        { scale: 0.86 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Left side ribbon */}
        <View style={{
          position: 'absolute', top: 60, left: 0, bottom: 60,
          width: 4, backgroundColor: color, opacity: 0.5, zIndex: 2,
        }} />
        {/* Diagonal glass streak */}
        <View style={{
          position: 'absolute', top: -20, right: 40, width: 80, height: 300,
          backgroundColor: 'rgba(255,255,255,0.03)',
          transform: [{ rotate: '25deg' }], zIndex: 1,
        }} />
      </>
    ),
  },

  // 4 ─ Book Spine (strong Y rotation, like a page)
  {
    wrapper: {
      borderRadius: 20,
      overflow: 'hidden',
      width: width - 40,
      height: containerHeight - 100,
      shadowColor: '#000',
      shadowOffset: { width: 30, height: 15 },
      shadowOpacity: 0.75,
      shadowRadius: 45,
      elevation: 22,
      transform: [
        { perspective: 800 },
        { rotateX: '3deg' },
        { rotateY: '-14deg' },
        { scale: 0.9 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Spine highlight on left edge */}
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: 60, zIndex: 1,
          }}
        />
        {/* Top accent dot */}
        <View style={{
          position: 'absolute', top: 28, right: 28,
          width: 10, height: 10, borderRadius: 5,
          backgroundColor: color, opacity: 0.6, zIndex: 2,
        }} />
      </>
    ),
  },

  // 5 ─ Top-Down (strong X tilt, hovering above surface)
  {
    wrapper: {
      borderRadius: 30,
      overflow: 'hidden',
      width: width - 48,
      height: containerHeight - 150,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 50 },
      shadowOpacity: 0.85,
      shadowRadius: 55,
      elevation: 24,
      transform: [
        { perspective: 700 },
        { rotateX: '14deg' },
        { rotateY: '0deg' },
        { scale: 0.84 },
      ],
    },
    decorations: (color) => (
      <>
        {/* Top & bottom glow lines */}
        <View style={{
          position: 'absolute', top: 0, left: 30, right: 30, height: 2.5,
          backgroundColor: color, opacity: 0.5, zIndex: 2,
          borderRadius: 2,
        }} />
        <View style={{
          position: 'absolute', bottom: 0, left: 30, right: 30, height: 2.5,
          backgroundColor: color, opacity: 0.3, zIndex: 2,
          borderRadius: 2,
        }} />
        {/* Center glass overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.04)', 'transparent']}
          style={{
            position: 'absolute', top: '30%', left: 0, right: 0,
            height: '40%', zIndex: 1,
          }}
        />
      </>
    ),
  },
];


// Helper to map missing feather/lucide icons to available ones in Icons.jsx
const mapIcon = (name) => {
  const available = [
    'home', 'back', 'forward', 'settings', 'close', 'upload', 'chevron-right', 'chevron-left', 'user-plus', 'search', 'share',
    'star', 'trophy', 'badge', 'zap', 'calendar', 'sun', 'flame', 'lock', 'unlock', 'xp', 'coin', 'activity', 'plus', 'minus', 'repeat', 'power', 'layers', 'droplet',
    'brain', 'book', 'flask', 'telescope', 'atom', 'planet', 'dna', 'microscope', 'ruler', 'robot', 'snowflake', 'beaker', 'trash', 'edit', 'heart', 'shield', 'leaf', 'earth', 'bomb', 'wifi', 'terminal', 'cloud', 'waves', 'magnet', 'fire', 'magnet2', 'wrench', 'cpu', 'molecule', 'lightning', 'pressure', 'thermometer', 'battery', 'link', 'balance', 'water', 'time', 'galaxy', 'rocket', 'blackhole', 'binary', 'key', 'data', 'globe',
    'check', 'check-double', 'cross', 'clock', 'refresh', 'info', 'moon', 'lightbulb', 'target', 'chart', 'grid', 'play', 'download', 'sparkle', 'shovel', 'history', 'flag', 'factory', 'person', 'hammer', 'headphones', 'alert', 'users', 'hash', 'cube', 'question', 'void', 'chaos', 'mountain', 'compass', 'scroll', 'scale', 'eye', 'lotus', 'debate', 'rain', 'storm', 'broken_heart', 'mirror', 'spiral', 'dollar', 'eyes', 'sleep', 'volcano', 'handshake', 'chat', 'send', 'bell', 'heart-filled'
  ];
  if (available.includes(name)) return name;

  const map = {
    'wind': 'cloud',
    'circle': 'planet',
    'loader': 'galaxy',
    'radio': 'lightning',
    'refresh-cw': 'history',
    'smile': 'person',
    'map': 'compass',
    'arrow-down': 'water',
    'archive': 'book',
    'volume-2': 'alert',
    'map-pin': 'globe',
    'trending-up': 'activity',
    'hexagon': 'molecule',
    'alert-triangle': 'alert',
    'x-circle': 'cross',
    'scissors': 'edit',
    'battery-charging': 'battery',
    'feather': 'leaf',
  };
  return map[name] || 'sparkle'; // fallback to sparkle
};

// Helper to parse **bold** text and color it with the accent color
const renderBoldText = (text, accentColor) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={[styles.factTextBold, { color: accentColor }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
};

export default function FactCards({ facts, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // Use the actual layout height of the FlatList if possible, but window height is a decent fallback
    // Since this component is usually flex: 1, we rely on the item layout.
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Auto-complete if reached last card
        if (newIndex === facts.length - 1) {
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 2000); // Give user 2 seconds to read the last card before closing
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }) => {
    return (
      <FactCardItem 
        item={item} 
        index={index} 
        total={facts.length}
        containerHeight={containerHeight}
        isLast={index === facts.length - 1}
        onComplete={onComplete}
      />
    );
  };


  return (
    <View 
      style={styles.container}
      onLayout={(e) => {
        if (e.nativeEvent.layout.height > 0) {
          setContainerHeight(e.nativeEvent.layout.height);
        }
      }}
    >
      {containerHeight > 0 && (
        <FlatList
          ref={flatListRef}
          data={facts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(data, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
        />
      )}
    </View>
  );
}

function FactCardItem({ item, index, total, containerHeight, isLast, onComplete }) {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  // Deterministic but varied design per card index (prime multiply avoids adjacent repeats)
  const designIndex = (index * 7 + 3) % 6;
  const taglineIndex = (index * 11 + 5) % SHARE_TAGLINES.length;
  const tagline = SHARE_TAGLINES[taglineIndex];

  // Get the chosen 3D design (needs containerHeight so compute fresh)
  const designs = containerHeight > 0 ? get3DDesigns(item.color, containerHeight) : [];
  const chosen = designs[designIndex] || designs[0];
  const iconName = mapIcon(item.svgIcon);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setTimeout(async () => {
        try {
          const uri = await captureRef(cardRef, {
            format: 'png',
            quality: 1.0,
            scale: 3,
          });
          setIsSharing(false);
          await Sharing.shareAsync(uri, {
            dialogTitle: `Share Fact`,
            mimeType: 'image/png',
          });
        } catch (error) {
          setIsSharing(false);
          console.error(error);
        }
      }, 150);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View ref={cardRef} collapsable={false} style={[styles.cardContainer, { height: containerHeight }, isSharing && { backgroundColor: '#FFF' }]}>
      {/* ── 3D Card Container ── */}
      <View 
        style={[
          styles.cardContentWrapper, 
          isSharing && chosen?.wrapper,
        ]}
      >
        <LinearGradient
          colors={item.bgGradient || ['#1A1A1A', '#050505']}
          style={[styles.cardBg, isSharing && styles.cardBg3D]}
        />
        
        {/* Design-specific decorations */}
        {isSharing && chosen?.decorations(item.color)}

        {/* Large background icon watermark */}
        <View style={[
          styles.bgIconContainer, 
          isSharing && styles.bgIconContainer3D
        ]} pointerEvents="none">
          <Icon 
            name={iconName} 
            size={isSharing ? width * 0.55 : width * 0.8} 
            color={isSharing ? (item.color + '12') : 'rgba(255,255,255,0.03)'} 
          />
        </View>

        {/* Content Container */}
        <View style={[styles.contentContainer, isSharing && styles.contentContainer3D, { zIndex: 10 }]}>
          <Text style={[styles.factText, isSharing && styles.factText3D]}>
            {renderBoldText(item.content, item.color)}
          </Text>
        </View>

        {/* ── Share Watermark with icon ── */}
        {isSharing && (
          <View style={styles.shareOverlay}>
            <View style={[styles.shareAccentLine, { backgroundColor: item.color }]} />
            <View style={styles.shareWatermarkRow}>
              <Icon name={iconName} size={16} color={item.color + '80'} />
              <Text style={styles.shareAppName}>curious minds</Text>
            </View>
            <Text style={[styles.shareTagline, { color: item.color }]}>{tagline}</Text>
          </View>
        )}
      </View>

      {/* Share Button Floating Right (TikTok style) */}
      {!isSharing && (
        <TouchableOpacity 
          style={[styles.shareFloatBtn, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}
          onPress={handleShare}
        >
          <Icon name="share" size={20} color={item.color} />
        </TouchableOpacity>
      )}

      {/* Footer / Call to action - hidden during share */}
      {!isSharing && (
        <View style={styles.footerContainer}>
          <Text style={styles.progressText}>{index + 1} / {total}</Text>
          {!isLast ? (
            <View style={styles.swipeHint}>
              <Text style={styles.swipeText}>Swipe up for next</Text>
            </View>
          ) : (
            <View style={styles.swipeHint}>
              <Text style={styles.swipeText}>Topic Completed! 🎉</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgIconContainer: {
    position: 'absolute',
    top: '20%',
    right: -width * 0.2,
    transform: [{ rotate: '15deg' }],
  },
  bgIconContainer3D: {
    top: '15%',
    right: -width * 0.05,
    opacity: 1,
    transform: [{ rotate: '20deg' }],
    zIndex: 2,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer3D: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  badgeText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  factText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 44,
  },
  factText3D: {
    fontSize: 16,
    lineHeight: 34,
    textAlign: 'center',
  },
  factTextBold: {
    fontFamily: FONTS.displayBold,
  },
  // ── Base card wrapper ─────────────────────────────
  cardContentWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBg3D: {
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  footerContainer: {
    position: 'absolute',
    bottom: height * 0.10,
    width: '100%',
    alignItems: 'center',
  },
  shareFloatBtn: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: height * 0.25,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  // ── Share Overlay ──────────────────────────────────
  shareOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  shareAccentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
    opacity: 0.8,
  },
  shareWatermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareAppName: {
    fontFamily: FONTS.displayBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  shareTagline: {
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.5,
  },
  // ── Normal UI Styles ─────────────────────────────
  progressText: {
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  swipeHint: {
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONTS.body,
    fontSize: 14,
    marginTop: 4,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  finishBtnText: {
    color: '#000',
    fontFamily: FONTS.displayBold,
    fontSize: 18,
  }
});
