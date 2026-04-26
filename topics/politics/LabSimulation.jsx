import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import Icon from '../../components/ui/Icons';
import * as Haptics from 'expo-haptics';

// Simulated Content Database
const CONTENT = [
  { id: 1, side: 'left', type: 'mild', text: "New policy proposed to increase funding for public schools and teachers." },
  { id: 2, side: 'right', type: 'mild', text: "Local business owner explains how lower taxes helped them hire more staff." },
  { id: 3, side: 'left', type: 'mild', text: "Study shows renewable energy transition is creating new jobs." },
  { id: 4, side: 'right', type: 'mild', text: "Mayor argues for stricter enforcement of city laws to ensure public safety." },
  
  { id: 5, side: 'left', type: 'extreme', text: "OUTRAGE: Greedy billionaires are literally destroying the working class!" },
  { id: 6, side: 'right', type: 'extreme', text: "OUTRAGE: Radical activists want to completely destroy our traditional way of life!" },
  { id: 7, side: 'left', type: 'extreme', text: "SHOCKING: If you disagree with this new law, you are basically an evil person." },
  { id: 8, side: 'right', type: 'extreme', text: "SHOCKING: They are coming for your freedom and everything you care about!" },
];

export default function EchoChamberLab({ isScientistMode }) {
  const { theme, isDark } = useTheme();
  
  const [chamberScore, setChamberScore] = useState(0); // 0 = Neutral, 100 = Echo Chamber
  const [userBias, setUserBias] = useState(0); // -10 to +10 (-Left, +Right)
  const [currentPost, setCurrentPost] = useState(null);
  const [swipes, setSwipes] = useState(0);
  
  const [engagementRevenue, setEngagementRevenue] = useState(0); // The algorithm's goal

  // Feed Algorithm
  const getNextPost = () => {
    // If neutral, show mild content from either side
    if (Math.abs(userBias) < 3) {
      const mildPosts = CONTENT.filter(c => c.type === 'mild');
      return mildPosts[Math.floor(Math.random() * mildPosts.length)];
    }
    
    // If biased, algorithm starts favoring that side
    const targetSide = userBias < 0 ? 'left' : 'right';
    
    // If highly biased (Echo Chamber), show extreme outrage content to maximize engagement
    if (chamberScore > 70) {
      const extremePosts = CONTENT.filter(c => c.side === targetSide && c.type === 'extreme');
      return extremePosts[Math.floor(Math.random() * extremePosts.length)];
    }
    
    // Medium bias: mix of mild and extreme from their side
    const sidePosts = CONTENT.filter(c => c.side === targetSide);
    return sidePosts[Math.floor(Math.random() * sidePosts.length)];
  };

  useEffect(() => {
    setCurrentPost(getNextPost());
  }, []);

  const handleAction = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update Bias
    let newBias = userBias;
    if (action === 'agree') {
      newBias += currentPost.side === 'right' ? 2 : -2;
      setEngagementRevenue(prev => prev + (currentPost.type === 'extreme' ? 5 : 1)); // Extreme makes more money
    } else {
      // Disagreeing with own side slightly reduces bias, disagreeing with opposite increases it
      if ((currentPost.side === 'right' && userBias > 0) || (currentPost.side === 'left' && userBias < 0)) {
        newBias += currentPost.side === 'right' ? -1 : 1;
      } else {
        newBias += currentPost.side === 'right' ? -2 : 2; 
        setEngagementRevenue(prev => prev + (currentPost.type === 'extreme' ? 5 : 1)); // Angry engagement is still revenue
      }
    }
    
    // Cap bias
    newBias = Math.max(-10, Math.min(10, newBias));
    setUserBias(newBias);
    
    // Update Chamber Score (based on how strong the bias is)
    const newChamber = Math.min(100, Math.abs(newBias) * 10);
    setChamberScore(newChamber);
    
    setSwipes(prev => prev + 1);
    
    // Load next post with a tiny delay
    setTimeout(() => {
      setCurrentPost(getNextPost());
    }, 150);
  };

  const resetSim = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChamberScore(0);
    setUserBias(0);
    setSwipes(0);
    setEngagementRevenue(0);
    setCurrentPost(CONTENT[0]);
  };

  if (!currentPost) return null;

  const isEchoChamber = chamberScore >= 80;
  const algColor = isEchoChamber ? '#E74C3C' : '#3498DB';

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Echo Chamber Algorithm
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        Interact with the feed. Watch how the algorithm traps you to maximize ad revenue.
      </Text>

      {/* Stats Header */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.text.muted }]}>Echo Chamber</Text>
          <Text style={[styles.statValue, { color: algColor }]}>{chamberScore}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: theme.text.muted }]}>Ad Revenue</Text>
          <Text style={[styles.statValue, { color: '#2ECC71' }]}>${engagementRevenue}</Text>
        </View>
      </View>

      {/* The Social Feed Post */}
      <View style={[styles.postCard, { backgroundColor: theme.bg.elevated, borderColor: isEchoChamber ? '#E74C3C50' : theme.glass.border }]}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Icon name="user" size={20} color={theme.text.muted} />
          </View>
          <Text style={[styles.postUser, { color: theme.text.secondary }]}>
            {currentPost.type === 'extreme' ? 'ANGRY_USER_99' : 'Daily_News'}
          </Text>
        </View>
        
        <Text style={[
          styles.postText, 
          { color: theme.text.primary, fontFamily: currentPost.type === 'extreme' ? FONTS.displayMedium : FONTS.body }
        ]}>
          "{currentPost.text}"
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => handleAction('disagree')}
            style={[styles.actionBtn, { backgroundColor: '#E74C3C15', borderColor: '#E74C3C' }]}
          >
            <Icon name="close" size={20} color="#E74C3C" />
            <Text style={[styles.actionText, { color: '#E74C3C' }]}>Disagree</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleAction('agree')}
            style={[styles.actionBtn, { backgroundColor: '#2ECC7115', borderColor: '#2ECC71' }]}
          >
            <Icon name="check" size={20} color="#2ECC71" />
            <Text style={[styles.actionText, { color: '#2ECC71' }]}>Agree</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Algorithm Status */}
      <View style={[styles.algStatus, { backgroundColor: theme.glass.light }]}>
        <Icon name="target" size={20} color={algColor} />
        <Text style={[styles.algText, { color: theme.text.secondary }]}>
          {chamberScore < 30 ? "Algorithm: Learning your preferences..." :
           chamberScore < 80 ? "Algorithm: Showing you content you agree with." :
           "Algorithm: ECHO CHAMBER ACTIVE. Maximizing outrage to keep you engaged!"}
        </Text>
      </View>

      <TouchableOpacity onPress={resetSim} style={[styles.resetBtn, { borderColor: theme.glass.border }]}>
        <Icon name="refresh" size={16} color={theme.text.muted} />
        <Text style={[styles.resetText, { color: theme.text.muted }]}>Clear History & Reset</Text>
      </TouchableOpacity>

      {isScientistMode && (
        <View style={[styles.sciPanel, { backgroundColor: theme.glass.light, borderColor: theme.glass.border }]}>
          <Text style={[styles.sciTitle, { color: '#3498DB' }]}>Algorithm Weights</Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Internal Bias Score: {userBias} (-10 to +10)
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Content Served: {currentPost.side.toUpperCase()} / {currentPost.type.toUpperCase()}
          </Text>
          <Text style={[styles.sciText, { color: theme.text.secondary }]}>
            Engagement Multiplier: {currentPost.type === 'extreme' ? '5x (Outrage)' : '1x (Mild)'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, paddingBottom: 100 },
  title: { fontFamily: FONTS.displayMedium, fontSize: 22, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', marginBottom: SPACING.xl },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#ffffff20',
    marginHorizontal: 4,
  },
  statLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.displayMedium,
    fontSize: 24,
  },

  postCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#ffffff20',
    alignItems: 'center', justifyContent: 'center'
  },
  postUser: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  postText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 15,
  },

  algStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  algText: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  resetText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },

  sciPanel: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  sciTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    marginBottom: 8
  },
  sciText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    marginBottom: 4,
    fontVariant: ['tabular-nums']
  }
});
