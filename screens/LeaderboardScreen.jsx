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
  { key: 'month', label: 'Monthly',  icon: 'calendar' },
  { key: 'week', label: 'Weekly',   icon: 'zap' },
];

const RANK_COLORS = ['#FFD700', '#A8B4C2', '#CD7F32'];
const PAGE_SIZE   = 20;

// ── Skeleton row while loading ───────────────────────────────────────────────
function SkeletonRow({ isDark }) {
  return (
    <View style={[styles.skeletonRow, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF' }]}>
      <SkeletonLoader width={36} height={28} borderRadius={8} />
      <SkeletonLoader width={42} height={42} circle />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonLoader width="60%" height={12} />
        <SkeletonLoader width="40%" height={10} />
      </View>
      <SkeletonLoader width={60} height={22} borderRadius={12} />
    </View>
  );
}

// ── Single leaderboard row ───────────────────────────────────────────────────
const LeaderRow = React.memo(function LeaderRow({ item, isMe, isDark, gold, accent, onAvatarPress }) {
  const rankColor = item.rank <= 3 ? RANK_COLORS[item.rank - 1] : (isDark ? '#4B5563' : '#9CA3AF');
  const isTop3 = item.rank <= 3;

  return (
    <TouchableOpacity
      onPress={() => onAvatarPress(item)}
      activeOpacity={0.7}
      style={[
        styles.row,
        {
          backgroundColor: isDark ? '#16171F' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
        isMe && {
          borderColor: accent + '60',
          backgroundColor: isDark ? '#1A1B2A' : '#F0EDFF',
        },
      ]}
    >
      {/* Rank */}
      <View style={[styles.rankBox, isTop3 && { backgroundColor: rankColor + '18' }]}>
        {isTop3 ? (
          <Icon name={item.rank === 1 ? 'crown' : 'medal'} size={item.rank === 1 ? 18 : 15} color={rankColor} />
        ) : (
          <Text style={[styles.rankNum, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={[styles.avatar, { borderColor: isTop3 ? rankColor : (isDark ? '#2A2C3A' : '#E5E7EB') }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#23242E' : '#F1F5F9', borderColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}>
            <Text style={[styles.avatarInitial, { color: isDark ? '#6B7280' : '#94A3B8' }]}>{(item.name || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        {isTop3 && (
          <View style={[styles.rowRankDot, { backgroundColor: rankColor }]}>
            <Text style={styles.rowRankDotText}>{item.rank}</Text>
          </View>
        )}
      </View>

      {/* Name + Title */}
      <View style={{ flex: 1, marginLeft: 2 }}>
        <Text style={[styles.userName, { color: isDark ? '#F1F5F9' : '#0F172A' }]} numberOfLines={1}>
          {item.name}{isMe ? ' (You)' : ''}
        </Text>
        <Text style={[styles.userTitle, { color: isDark ? '#4B5563' : '#94A3B8' }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      {/* Points pill */}
      <View style={[styles.pointsPill, { backgroundColor: isDark ? '#1E1F2C' : '#F8FAFC' }]}>
        <Text style={[styles.pointsNum, { color: gold }]}>{(item.points || 0).toLocaleString()}</Text>
        <Icon name="coin" size={12} color={gold} />
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
      accent={accent}
      onAvatarPress={handleAvatarPress}
    />
  ), [user, isDark, gold, accent]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator color={accent} style={{ paddingVertical: 20 }} />;
  };

  // ── My rank info bar ──────────────────────────
  const myEntry = data.find(d => d.id === user?.id);

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: 10 }]}>
      {/* Ambient orbs */}
      <View style={[styles.orb1, { backgroundColor: accent }]} />
      <View style={[styles.orb2, { backgroundColor: gold }]} />

      {/* ── Top nav ─────────────────────────────── */}
      <Animated.View style={[styles.topBar, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? '#16171F' : '#FFFFFF' }]} activeOpacity={0.7}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: txt1 }]}>Leaderboard</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: isDark ? '#16171F' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
          <Icon name="trophy" size={18} color={gold} />
        </View>
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
                {
                  backgroundColor: isDark ? '#16171F' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                },
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
        <View style={[styles.podium, { backgroundColor: isDark ? '#16171F' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
          {[1, 0, 2].map(idx => {
            const d = data[idx];
            if (!d) return null;
            const isFirst = idx === 0;
            const rankColor = RANK_COLORS[idx];
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.podiumSlot, isFirst && styles.podiumSlotFirst, !isFirst && styles.podiumSlotSecondary]}
                onPress={() => handleAvatarPress(d)}
                activeOpacity={0.75}
              >
                {/* Avatar with overlapping badge */}
                <View style={styles.podiumAvatarWrap}>
                  {isFirst && (
                    <View style={[styles.podiumCrownFloat]}>
                      <Icon name="crown" size={20} color="#FFD700" />
                    </View>
                  )}
                  {d.imageUrl ? (
                    <Image source={{ uri: d.imageUrl }} style={[isFirst ? styles.podiumAvatarLg : styles.podiumAvatar, { borderColor: rankColor }]} />
                  ) : (
                    <View style={[isFirst ? styles.podiumAvatarLgPh : styles.podiumAvatarPh, { borderColor: rankColor, backgroundColor: isDark ? '#23242E' : '#F1F5F9' }]}>
                      <Text style={[isFirst ? styles.podiumInitialLg : styles.podiumInitial, { color: isDark ? '#6B7280' : '#94A3B8' }]}>{(d.name || '?')[0]}</Text>
                    </View>
                  )}
                  {/* Rank badge */}
                  <View style={[styles.podiumBadge, { backgroundColor: rankColor }]}>
                    <Text style={styles.podiumBadgeText}>{idx === 0 ? '1' : idx === 1 ? '2' : '3'}</Text>
                  </View>
                </View>

                <Text style={[styles.podiumName, { color: txt1 }]} numberOfLines={1}>{d.name?.split(' ')[0]}</Text>

                {/* Points */}
                <View style={styles.podiumPtsRow}>
                  <Icon name="coin" size={11} color={rankColor} />
                  <Text style={[styles.podiumPts, { color: rankColor }]}>{(d.points || 0).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── My Rank Bar ────────────────────────────── */}
      {myEntry && (
        <View style={[styles.myRankBar, { backgroundColor: isDark ? accent + '15' : accent + '0D', borderColor: accent + '30' }]}>
          <Icon name="person" size={14} color={accent} />
          <Text style={[styles.myRankText, { color: accent }]}>Your Rank</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.myRankValue, { color: accent }]}>#{myEntry.rank}</Text>
          <View style={styles.myRankDivider} />
          <Text style={[styles.myRankPts, { color: gold }]}>{(myEntry.points || 0).toLocaleString()}</Text>
          <Icon name="coin" size={12} color={gold} />
        </View>
      )}

      {/* ── Full List ───────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: 8 }}>
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} isDark={isDark} />)}
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1C1D26' : '#F1F5F9' }]}>
            <Icon name="alert" size={32} color={txtM} />
          </View>
          <Text style={[styles.errorTitle, { color: txt1 }]}>Connection Error</Text>
          <Text style={[styles.errorText, { color: txtM }]}>Could not load leaderboard. Check your connection.</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: accent }]}>
            <Icon name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1C1D26' : '#F1F5F9' }]}>
            <Icon name="trophy" size={36} color={txtM} />
          </View>
          <Text style={[styles.errorTitle, { color: txt1 }]}>No Activity Yet</Text>
          <Text style={[styles.errorText, { color: txtM }]}>Be the first to earn points!</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => `${item.rank}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: 4, paddingBottom: 80 }}
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
  root: { flex: 1, marginTop: -20 },
  orb1: { position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: 100, opacity: 0.05 },
  orb2: { position: 'absolute', top: 140, left: -80, width: 160, height: 160, borderRadius: 80, opacity: 0.04 },

  // ── Top Bar ──────────────────────────────
  topBar: {
    marginTop: 25,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 22 },

  // ── Tabs ──────────────────────────────
  tabRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: SPACING.lg, marginBottom: 14,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1,
  },
  tabLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // ── Podium ──────────────────────────────
  podium: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    marginHorizontal: SPACING.lg, marginBottom: 14,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingTop: 24, paddingBottom: 18,
    gap: 6,
  },
  podiumSlot: { flex: 1, alignItems: 'center', gap: 6 },
  podiumSlotFirst: { marginTop: 0 },
  podiumSlotSecondary: { marginTop: 32 },
  podiumAvatarWrap: { position: 'relative', alignItems: 'center', marginBottom: 4 },
  podiumCrownFloat: {
    position: 'absolute',
    top: -18,
    zIndex: 10,
  },
  podiumAvatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2.5 },
  podiumAvatarPh: { width: 54, height: 54, borderRadius: 27, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarLg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3 },
  podiumAvatarLgPh: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  podiumInitial:   { fontFamily: FONTS.displayMedium, fontSize: 20 },
  podiumInitialLg: { fontFamily: FONTS.displayMedium, fontSize: 26 },
  podiumBadge: {
    position: 'absolute',
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBadgeText: { fontFamily: FONTS.displayMedium, fontSize: 10, color: '#FFFFFF' },
  podiumName: { fontFamily: FONTS.bodyMedium, fontSize: 12, textAlign: 'center', maxWidth: 80 },
  podiumPtsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  podiumPts:  { fontFamily: FONTS.displayMedium, fontSize: 13 },

  // ── My Rank Bar ──────────────────────────
  myRankBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginBottom: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  myRankText: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  myRankValue: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  myRankDivider: { width: 1, height: 16, backgroundColor: 'rgba(128,128,128,0.2)', marginHorizontal: 4 },
  myRankPts: { fontFamily: FONTS.displayMedium, fontSize: 14, marginRight: 4 },

  // ── Rows ──────────────────────────────
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 8,
  },
  rankBox: {
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  rankNum:   { fontFamily: FONTS.displayMedium, fontSize: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  rowRankDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  rowRankDotText: { fontFamily: FONTS.displayMedium, fontSize: 8, color: '#FFFFFF' },
  userName:  { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  userTitle: { fontFamily: FONTS.body, fontSize: 11, marginTop: 1 },
  pointsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12,
  },
  pointsNum: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  // ── Skeleton ──────────────────────────────
  skeletonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 8, paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 16,
  },

  // ── States ──────────────────────────────
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  errorTitle: { fontFamily: FONTS.displayMedium, fontSize: 17, textAlign: 'center' },
  errorText: { fontFamily: FONTS.body, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 11, borderRadius: RADIUS.full, marginTop: 4,
  },
  retryLabel: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#FFFFFF' },
});
