// ─────────────────────────────────────────────
//  HomeScreen v5 — Performance-optimized navigation
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  Dimensions, Animated, Platform, StatusBar, Image,
  InteractionManager, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';
import chatService from '../services/chatService';

const STATUS_BAR_H = Platform.OS === 'android' ? ((StatusBar.currentHeight || 36) + 10) : 0;
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, RADIUS, COLORS } from '../constants/theme';
import { TOPIC_REGISTRY, CATEGORIES } from '../constants/topicRegistry';

import { getLevelForXP, getLevelProgress, getNextLevel } from '../constants/xpSystem';
import { soundTap, soundWhoosh } from '../utils/sounds';

// ── Lazy-loaded heavy screens (only loaded when actually navigated to) ──
const TopicScreen = lazy(() => import('./TopicScreen'));
const PdfViewerScreen = lazy(() => import('./PdfViewerScreen'));
const ChatRoomScreen = lazy(() => import('./ChatRoomScreen'));

// ── Lightweight tab screens (kept as eager since they use display:none persistence) ──
import ChatHubScreen from './ChatHubScreen';
import LeaderboardScreen from './LeaderboardScreen';
import SettingsScreen from './SettingsScreen';
import EbookScreen from './EbookScreen';
import DiscoverScreen from './DiscoverScreen';

import Icon from '../components/ui/Icons';
import { useTheme } from '../context/ThemeContext';
import ProfileModal from '../components/ui/ProfileModal';
import NotificationsModal from '../components/ui/NotificationsModal';

// ── Minimal loading fallback for lazy screens ──
const ScreenLoader = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#08090F' }}>
    <ActivityIndicator size="large" color="#7B6FFF" />
  </View>
);

const { width } = Dimensions.get('window');
const CARD_W = width * 0.75;

export default function HomeScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, isDark } = useTheme();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [visitedTabs, setVisitedTabs] = useState(['home']);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false); // Prevents double-tap lag
  
  // User Stats
  const xp = user?.points || 0;
  const streak = user?.streak || 0;
  
  // UI State
  const [headerFade] = useState(new Animated.Value(0));
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [notifsVisible, setNotifsVisible] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [chatConfig, setChatConfig] = useState(null); // { targetId, chatTitle }
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    // Defer network calls so the UI renders instantly
    const task = InteractionManager.runAfterInteractions(() => {
      refreshUser();
      fetchPendingFriendCount();
    });
    return () => task.cancel();
  }, []);

  // Re-fetch counts when switching tabs
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'discover') {
      fetchPendingFriendCount();
    }
    if (activeTab === 'home' || activeTab === 'chat') {
      fetchUnreadChatCount();
    }
    
    // Lazy-load mechanism: Add newly visited tab to our tracker
    if (!visitedTabs.includes(activeTab)) {
      setVisitedTabs(prev => [...prev, activeTab]);
    }
  }, [activeTab]);

  const lastFetchTime = useRef(0);
  const fetchPendingFriendCount = () => {
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) return; // 10 second cooldown
    lastFetchTime.current = now;
    
    api.get('/api/social/requests/pending')
      .then(res => setPendingFriendCount(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => {});
  };

  const lastChatFetchTime = useRef(0);
  const fetchUnreadChatCount = () => {
    if (!user?.id) return;
    const now = Date.now();
    if (now - lastChatFetchTime.current < 5000) return; // 5 second cooldown
    lastChatFetchTime.current = now;

    api.get('/chat/unread-count')
      .then(res => setUnreadChatCount(res.data.unreadCount || 0))
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.id) {
      fetchUnreadChatCount();
      fetchPendingFriendCount();
    }
    const unsubscribe = chatService.addListener((msg) => {
      // Real-time unread increment for direct messages
      if (msg.type === 'MESSAGE' && msg.target !== 'GLOBAL' && msg.senderId !== user?.id) {
        setUnreadChatCount(prev => prev + 1);
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Fetch unread count when user is available or when modal closes
  useEffect(() => {
    if (user?.id && !notifsVisible) {
      const task = InteractionManager.runAfterInteractions(() => {
        api.get('/api/social/notifications/unread-count')
          .then(res => setUnreadNotifs(res.data.unreadCount || 0))
          .catch(() => {});
      });
      return () => task.cancel();
    }
  }, [user?.id, notifsVisible]);

  const refreshData = async () => {
    refreshUser();
  };

  const openProfile = (userId) => {
    setSelectedUserId(userId);
    setProfileVisible(true);
  };

  const openChat = useCallback((targetId, chatTitle) => {
    setChatConfig({ targetId, chatTitle });
    setActiveTab('chatRoom');
  }, []);

  // ── Deferred topic navigation (prevents UI freeze) ──
  const navigateToTopic = useCallback((topic) => {
    if (isNavigating) return;
    setIsNavigating(true);
    soundWhoosh();
    // Let the UI breathe before mounting the heavy TopicScreen
    requestAnimationFrame(() => {
      setSelectedTopic(topic);
      setIsNavigating(false);
    });
  }, [isNavigating]);

  if (selectedTopic) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <TopicScreen topicId={selectedTopic.id} onBack={() => setSelectedTopic(null)} />
      </Suspense>
    );
  }


  if (viewingPdf) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <PdfViewerScreen 
          url={viewingPdf.url} 
          title={viewingPdf.title} 
          onBack={() => setViewingPdf(null)} 
        />
      </Suspense>
    );
  }

  // ── Render Helpers ──────────────────────────
  
  if (activeTab === 'chatRoom') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <ChatRoomScreen 
          targetId={chatConfig?.targetId} 
          chatTitle={chatConfig?.chatTitle || 'Chat'} 
          onBack={() => setActiveTab('chat')}
          onStartDirectChat={openChat}
        />
      </Suspense>
    );
  }

  // Theme-reactive colors
  const bg       = theme?.bg?.base || '#08090F';
  const surface  = theme?.bg?.surface || '#13141C';
  const card     = theme?.bg?.card || '#1C1D26';
  const glass1   = theme?.glass?.light || 'rgba(255,255,255,0.03)';
  const border   = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  const txt1     = theme?.text?.primary || '#FFFFFF';
  const txtM     = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent   = theme?.accent?.primary || '#7B6FFF';
  const gold     = theme?.accent?.gold || '#FFD166';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]}>
      {/* Ambient background orbs */}
      <View style={[styles.orb1, { backgroundColor: accent }]} />
      <View style={[styles.orb2, { backgroundColor: theme?.accent?.mint || '#4ECDC4' }]} />

      <View style={{ flex: 1, display: activeTab === 'home' ? 'flex' : 'none' }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md }}>
            {/* ── Header ─────────────────────────── */}
            <Animated.View style={[styles.header, { opacity: headerFade }]}>
              <View style={styles.headerLeft}>
                <View style={styles.logoRow}>
                  <Image
                      source={require('../assets/icon.png')}
                      style={{ width: 45, height: 45 , borderRadius: 12}}
                    />
                  <View style={{ marginLeft: 12 }}>
                    {user ? (
                      <Text style={[styles.tagline, { color: txt1 }]} numberOfLines={1}>
                        Hi, {user.name?.split(' ')[0] || 'Explorer'} 👋 
                      </Text>
                    ) : (
                      <Text style={[styles.tagline, { color: txt1 }]}>Curious Minds</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => setNotifsVisible(true)} style={styles.notifBtn}>
                  <Icon name="bell" size={22} color={txt1} />
                  {unreadNotifs > 0 && (
                    <View style={styles.notifBadge} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity>
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={[styles.avatar, { borderColor: accent }]}
                    />
                  ) : (
                    <View style={[styles.avatarPh, { borderColor: accent, backgroundColor: glass1 }]}>
                      <Text style={[styles.avatarInit, { color: accent }]}>{(user?.name || '?')[0]}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ── Concise Golden XP Card ─────────────────── */}
            <LinearGradient
              colors={['#FFD166', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.xpCardConcise}
            >
              <View style={styles.xpRow}>
                <View style={styles.levelBadge}>
                  <Icon name="star" size={14} color="#FFF" filled />
                  <Text style={styles.levelBadgeText}>Lv {getLevelForXP(xp)?.level || 1}</Text>
                </View>
                
                <View style={styles.xpProgressWrap}>
                  <View style={styles.xpProgressBarBg}>
                    <View style={[styles.xpProgressBarFill, { width: `${getLevelProgress(xp) * 100}%` }]} />
                  </View>
                  <Text style={styles.xpProgressText}>
                    {xp.toLocaleString()} / {getNextLevel(xp)?.minXP?.toLocaleString() || 'MAX'} XP
                  </Text>
                </View>

                <View style={styles.streakBadgeConcise}>
                  <Text style={styles.streakTextConcise}>{streak} 🔥</Text>
                </View>
              </View>
            </LinearGradient>

          </View>

          {/* ── Categories & Topics ─────────────────────────── */}
          {CATEGORIES.map(cat => {
            const catTopics = TOPIC_REGISTRY.filter(t => t.category === cat);
            if (catTopics.length === 0) return null;
            
            return (
              <View key={cat} style={{ marginBottom: SPACING.xl }}>
                <Text style={[styles.sectionTitle, { color: txt1, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }]}>
                  {cat}
                </Text>
                <FlatList
                  data={catTopics}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_W + 20}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
                  keyExtractor={keyExtractor}
                  renderItem={({ item }) => (
                    <TopicCard
                      topic={item}
                      onPress={() => navigateToTopic(item)}
                      theme={theme}
                    />
                  )}
                  initialNumToRender={3}
                  maxToRenderPerBatch={5}
                  windowSize={5}
                  removeClippedSubviews={true}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flex: 1, display: activeTab === 'discover' ? 'flex' : 'none' }}>
        {visitedTabs.includes('discover') && <DiscoverScreen onOpenProfile={openProfile} onStartChat={openChat} />}
      </View>

      <View style={{ flex: 1, display: activeTab === 'chat' ? 'flex' : 'none' }}>
        {visitedTabs.includes('chat') && <ChatHubScreen onOpenChat={openChat} />}
      </View>

      <View style={{ flex: 1, display: activeTab === 'leaderboard' ? 'flex' : 'none' }}>
        {visitedTabs.includes('leaderboard') && <LeaderboardScreen onBack={() => setActiveTab('home')} onStartChat={openChat} />}
      </View>

      <View style={{ flex: 1, display: activeTab === 'settings' ? 'flex' : 'none' }}>
        {visitedTabs.includes('settings') && <SettingsScreen onBack={() => setActiveTab('home')} />}
      </View>

      <View style={{ flex: 1, display: activeTab === 'ebook' ? 'flex' : 'none' }}>
        {visitedTabs.includes('ebook') && <EbookScreen onOpenPdf={(url, title) => setViewingPdf({ url, title })} />}
      </View>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} isDark={isDark} pendingFriendCount={pendingFriendCount} unreadChatCount={unreadChatCount} />

      <ProfileModal 
        visible={profileVisible} 
        targetUserId={selectedUserId} 
        onClose={() => setProfileVisible(false)} 
        onStartChat={openChat}
        showMessageButton={true}
      />

      
      <NotificationsModal 
        visible={notifsVisible} 
        onClose={() => setNotifsVisible(false)} 
      />
    </SafeAreaView>
  );
}

// ── Stable keyExtractor (avoids inline arrow) ──
const keyExtractor = (item) => item.id;

// ── Topic Card Component (Memoized) ──────────────────────
const TopicCard = React.memo(function TopicCard({ topic, onPress, theme }) {
  const cardBg = theme?.bg?.card || '#1C1D26';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  
  const topicColors = theme?.topics || {};
  const colorKey = Object.keys(topicColors).find(k => topic.id.startsWith(k)) || 'default';
  const topicAccent = (topicColors[colorKey] || topicColors.default || { primary: '#7B6FFF' }).primary;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.topicCard, { backgroundColor: cardBg, borderColor: border }]}
    >
      <View style={[styles.cardIconBox, { backgroundColor: topicAccent + '15' }]}>
        <Icon name={topic.icon || 'book'} size={32} color={topicAccent} />
      </View>
      <Text style={[styles.cardTitle, { color: txt1 }]} numberOfLines={1}>{topic.title}</Text>
      <Text style={[styles.cardSub, { color: txtM }]} numberOfLines={1}>{topic.subtitle}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.tag}>
          <Text style={[styles.tagText, { color: topicAccent }]}>{topic.category}</Text>
        </View>
        <Icon name="chevron-right" size={16} color={txtM} />
      </View>
    </TouchableOpacity>
  );
});


// ── Bottom Navigation Bar (Memoized) ──────────────────────
const BottomNav = React.memo(function BottomNav({ activeTab, setActiveTab, theme, isDark, pendingFriendCount = 0, unreadChatCount = 0 }) {
  const accent = theme?.accent?.primary || '#7B6FFF';
  const txtM = theme?.text?.muted || '#9CA3AF';
  const bg = isDark ? '#13141C' : '#FFFFFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';

  const NavItem = useCallback(({ id, icon, label, badge }) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => { soundTap(); setActiveTab(id); }}
      >
        <View style={[styles.navIconWrap, isActive && { backgroundColor: accent + '15' }]}>
          <Icon name={icon} size={22} color={isActive ? accent : txtM} />
          {badge > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, { color: isActive ? accent : txtM }]}>{label}</Text>
      </TouchableOpacity>
    );
  }, [activeTab, accent, txtM]);

  return (
    <View style={[styles.bottomNav, { backgroundColor: bg, borderTopColor: border }]}>
      <NavItem id="home" icon="home" label="Home" />
      <NavItem id="chat" icon="chat" label="Chat" badge={unreadChatCount} />
      <NavItem id="discover" icon="users" label="People" badge={pendingFriendCount} />
      <NavItem id="leaderboard" icon="trophy" label="Ranking" />
      <NavItem id="ebook" icon="book" label="Library" />
      <NavItem id="settings" icon="grid" label="Menu" />
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  orb1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orb2: { position: 'absolute', bottom: -50, left: -100, width: 250, height: 250, borderRadius: 125, opacity: 0.1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerLeft: { flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  tagline: { fontFamily: FONTS.display, fontSize: 18 },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  notifBadge: {
    position: 'absolute', top: 8, right: 8, width: 10, height: 10, 
    borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#08090F'
  },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2 },
  avatarPh: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontFamily: FONTS.displayBold, fontSize: 18 },

  xpCardConcise: {
    padding: 16,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeText: {
    color: '#FFF',
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },
  xpProgressWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  xpProgressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  xpProgressText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    textAlign: 'center',
  },
  streakBadgeConcise: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakTextConcise: {
    color: '#FFF',
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },



  sectionTitle: { fontFamily: FONTS.display, fontSize: 22, marginBottom: SPACING.lg },

  topicCard: {
    width: CARD_W,
    padding: 20,
    borderRadius: RADIUS.xl,
    marginRight: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardIconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cardTitle: { fontFamily: FONTS.display, fontSize: 20, marginBottom: 4 },
  cardSub: { fontFamily: FONTS.body, fontSize: 14, marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  tagText: { fontFamily: FONTS.bodyMedium, fontSize: 11, textTransform: 'uppercase' },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIconWrap: { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  navLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11 },
  navBadge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: '#13141C',
  },
  navBadgeText: { fontFamily: FONTS.displayMedium, fontSize: 9, color: '#FFFFFF' },
});