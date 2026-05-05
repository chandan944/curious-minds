// ─────────────────────────────────────────────────────────────────────────────
//  LeaderboardScreen.jsx — Premium Leaderboard with profile cards & DM
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  Animated, ActivityIndicator, Platform, StatusBar, Dimensions,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboard } from '../services/leaderboardService';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import Icon from '../components/ui/Icons';
import ProfileModal from '../components/ui/ProfileModal';
import NotificationsModal from '../components/ui/NotificationsModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import socialService from '../services/socialService';
import chatService from '../services/chatService';

const { width } = Dimensions.get('window');
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

const PERIODS = [
  { key: 'all',  label: 'All Time', icon: 'trophy'  },
  { key: 'month', label: 'This Month', icon: 'calendar' },
  { key: 'week', label: 'This Week', icon: 'zap' },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PAGE_SIZE   = 20;

// ── Skeleton row while loading ───────────────────────────────────────────────
function SkeletonRow() {
  return (
    <View style={styles.skeletonRow}>
      <SkeletonLoader width={36} height={28} borderRadius={8} />
      <SkeletonLoader width={40} height={40} circle />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonLoader width="60%" height={12} />
        <SkeletonLoader width="40%" height={12} />
      </View>
      <SkeletonLoader width={60} height={20} borderRadius={8} />
    </View>
  );
}

// ── Single leaderboard row ───────────────────────────────────────────────────
const LeaderRow = React.memo(function LeaderRow({ item, isMe, isDark, gold, onAvatarPress }) {
  const rankColor = item.rank <= 3 ? RANK_COLORS[item.rank - 1] : (isDark ? '#52525B' : '#9CA3AF');
  const isTop3 = item.rank <= 3;

  return (
    <TouchableOpacity
      onPress={() => onAvatarPress(item)}
      activeOpacity={0.75}
      style={[
        styles.row,
        { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: isDark ? '#2A2C3A' : '#E5E7EB' },
        isMe && { borderColor: gold, borderWidth: 1.5 },
      ]}
    >
      {/* Rank */}
      <View style={[styles.rankBox, isTop3 && { backgroundColor: rankColor + '20' }]}>
        {isTop3 ? (
          <Text style={[styles.rankCrown, { color: rankColor }]}>
            {item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text style={[styles.rankNum, { color: rankColor }]}>#{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={[styles.avatar, { borderColor: isTop3 ? rankColor : (isDark ? '#3A3C4A' : '#D1D5DB') }]} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB', borderColor: isDark ? '#3A3C4A' : '#D1D5DB' }]}>
          <Text style={styles.avatarInitial}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
      )}

      {/* Name + Title */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { color: isDark ? '#F1F5F9' : '#0F172A' }]} numberOfLines={1}>
          {item.name} {isMe ? '(You)' : ''}
        </Text>
        <Text style={[styles.userTitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      {/* Points */}
      <View style={styles.pointsBox}>
        <Text style={[styles.pointsNum, { color: gold }]}>{(item.points || 0).toLocaleString()}</Text>
        <Icon name="coin" size={14} color={gold} />
      </View>
    </TouchableOpacity>
  );
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function LeaderboardScreen({ onBack, onStartChat }) {
  const { theme, isDark } = useTheme();
  const { user, token } = useAuth();

  const [period, setPeriod]       = useState('all');

  const {
    data: queryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['leaderboard', period],
    queryFn: ({ pageParam = 0 }) => fetchLeaderboard(period, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      return (lastPage.currentPage + 1 < lastPage.totalPages) ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const data = queryData ? queryData.pages.flatMap(page => page.content) : [];

  // Profile modal
  const [profileTargetId, setProfileTargetId] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);

  // Notifications
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Colours
  const bg     = theme?.bg?.base || '#08090F';
  const txt1   = theme?.text?.primary || '#FFFFFF';
  const txtM   = theme?.text?.muted || 'rgba(232,234,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const gold   = theme?.accent?.gold || '#FFD166';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';


  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }).start();
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Profile Modal ─────────────────────────────
  const handleAvatarPress = (item) => {
    if (item.id === user?.id) return;
    setProfileTargetId(item.id);
    setProfileVisible(true);
  };

  const handleStartChat = (pId, pName) => {
    setProfileVisible(false);
    if (onStartChat) {
      setTimeout(() => onStartChat(pId, pName), 100);
    }
  };

  const renderItem = useCallback(({ item }) => (
    <LeaderRow
      item={item}
      isMe={user && item.id === user.id}
      isDark={isDark}
      gold={gold}
      onAvatarPress={handleAvatarPress}
    />
  ), [user, isDark, gold]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator color={accent} style={{ paddingVertical: 20 }} />;
  };

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: 10 }]}>
      <View style={[styles.orb1, { backgroundColor: accent }]} />
      <View style={[styles.orb2, { backgroundColor: gold }]} />

      {/* ── Top nav ─────────────────────────────── */}
      <Animated.View style={[styles.topBar, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: isDark ? '#1C1D26' : '#FFFFFF' }]} activeOpacity={0.7}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: txt1 }]}>Leaderboard</Text>
          
        </View>

        {/* ── Bell Icon ─────────────────────────────── */}
        
      </Animated.View>

      {/* ── Period Tabs ──────────────────────────── */}
      <View style={styles.tabRow}>
        {PERIODS.map(p => {
          const isActive = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[
                styles.tab,
                { borderColor: border, backgroundColor: isDark ? '#1C1D26' : '#FFFFFF' },
                isActive && { backgroundColor: accent, borderColor: accent },
              ]}
              activeOpacity={0.8}
            >
              <Icon name={p.icon} size={13} color={isActive ? '#FFFFFF' : txtM} />
              <Text style={[styles.tabLabel, { color: isActive ? '#FFFFFF' : txtM }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Top 3 Podium ──────────────────────────── */}
      {!isLoading && data.length >= 3 && (
        <LinearGradient
          colors={isDark ? ['#1A1B23', '#13141C'] : ['#F8FAFC', '#FFFFFF']}
          style={[styles.podium, { borderColor: border }]}
        >
          {[1, 0, 2].map(idx => {
            const d = data[idx];
            if (!d) return null;
            const isFirst = idx === 0;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.podiumSlot, idx === 1 && { marginTop: 30 }, idx === 2 && { marginTop: 50 }]}
                onPress={() => handleAvatarPress(d)}
                activeOpacity={0.75}
              >
                {d.imageUrl ? (
                  <Image source={{ uri: d.imageUrl }} style={[isFirst ? styles.podiumAvatarLg : styles.podiumAvatar, { borderColor: RANK_COLORS[idx] }]} />
                ) : (
                  <View style={[isFirst ? styles.podiumAvatarLgPh : styles.podiumAvatarPh, { borderColor: RANK_COLORS[idx], backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}>
                    <Text style={isFirst ? styles.podiumInitialLg : styles.podiumInitial}>{(d.name || '?')[0]}</Text>
                  </View>
                )}
                <Text style={isFirst ? styles.podiumCrown : styles.podiumMedal}>
                  {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                </Text>
                <Text style={[styles.podiumName, { color: txt1 }]} numberOfLines={1}>{d.name?.split(' ')[0]}</Text>
                <Text style={[styles.podiumPts, { color: RANK_COLORS[idx] }]}>{(d.points || 0).toLocaleString()}</Text>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      )}

      {/* ── Full List ───────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: 8 }}>
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Icon name="alert" size={36} color={txtM} />
          <Text style={[styles.errorText, { color: txtM }]}>Could not load leaderboard. Check your connection.</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: accent }]}>
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🏜️</Text>
          <Text style={[styles.errorText, { color: txtM }]}>No activity in this window yet.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => `${item.rank}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: 8, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          initialNumToRender={5}
          windowSize={3}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
        />
      )}

      {/* ── Profile Modal (unified) ─────────────────────────── */}
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        targetUserId={profileTargetId}
        onStartChat={handleStartChat}
        showMessageButton={!!onStartChat}
      />

      {/* ── Notifications Modal ─────────────────────────── */}
      <NotificationsModal
        visible={notifVisible}
        onClose={() => {
          setNotifVisible(false);
          setUnreadCount(0); // reset badge after viewing
        }}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 ,marginTop:-20},
  orb1: { position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: 100, opacity: 0.06 },
  orb2: { position: 'absolute', top: 120, left: -80, width: 180, height: 180, borderRadius: 90, opacity: 0.05 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 22 },
  pageSub:   { fontFamily: FONTS.body, fontSize: 12 },

  // Bell
  bellWrap: { position: 'relative', marginRight: 4 },
  bellBadge: {
    position: 'absolute', top: -5, right: -6,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { fontFamily: FONTS.displayMedium, fontSize: 10, color: '#FFFFFF' },

  tabRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: SPACING.lg, marginBottom: 12,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: RADIUS.full, borderWidth: 1,
  },
  tabLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  // Podium
  podium: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    marginHorizontal: SPACING.lg, marginBottom: 12,
    borderRadius: RADIUS.lg, borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingTop: 16, paddingBottom: 14,
    gap: 8,
  },
  podiumSlot: { flex: 1, alignItems: 'center', gap: 4 },
  podiumAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2 },
  podiumAvatarPh: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarLg: { width: 68, height: 68, borderRadius: 34, borderWidth: 2.5 },
  podiumAvatarLgPh: { width: 68, height: 68, borderRadius: 34, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  podiumInitial:   { fontFamily: FONTS.displayMedium, fontSize: 20, color: '#9CA3AF' },
  podiumInitialLg: { fontFamily: FONTS.displayMedium, fontSize: 26, color: '#9CA3AF' },
  podiumCrown: { fontSize: 20 },
  podiumMedal: { fontSize: 16 },
  podiumName: { fontFamily: FONTS.bodyMedium, fontSize: 12, textAlign: 'center' },
  podiumPts:  { fontFamily: FONTS.displayMedium, fontSize: 13 },

  // Rows
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8,
  },
  rankBox: {
    width: 36, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, borderRadius: 8,
  },
  rankCrown: { fontSize: 20 },
  rankNum:   { fontFamily: FONTS.displayMedium, fontSize: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: FONTS.displayMedium, fontSize: 16, color: '#9CA3AF' },
  userName:  { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  userTitle: { fontFamily: FONTS.body, fontSize: 11 },
  pointsBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pointsNum: { fontFamily: FONTS.displayMedium, fontSize: 15 },

  // Skeleton
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 12 },
  skeletonRank:   { width: 36, height: 28, borderRadius: 8 },
  skeletonAvatar: { width: 40, height: 40, borderRadius: 20 },
  skeletonLine:   { height: 12, borderRadius: 6 },
  skeletonPoints: { width: 60, height: 20, borderRadius: 8 },

  // States
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  errorText: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: RADIUS.full },
  retryLabel: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#FFFFFF' },
});
