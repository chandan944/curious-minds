import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput,
  ActivityIndicator, RefreshControl, Dimensions, Animated, Alert, Platform, StatusBar,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import Icon from '../components/ui/Icons';
import api from '../services/api';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.42;
const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

const TABS = [
  { key: 'suggestions', label: 'Suggested', icon: 'sparkle' },
  { key: 'requests', label: 'Requests', icon: 'bell' },
  { key: 'friends', label: 'Friends', icon: 'users' },
];

export default function DiscoverScreen({ onOpenProfile, onStartChat }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const bg      = theme?.bg?.base || '#08090F';
  const card    = theme?.bg?.card || '#181B28';
  const txt1    = theme?.text?.primary || '#FFFFFF';
  const txt2    = theme?.text?.secondary || 'rgba(232,234,255,0.85)';
  const txtM    = theme?.text?.muted || 'rgba(232,234,255,0.6)';
  const accent  = theme?.accent?.primary || '#7B6FFF';
  const gold    = theme?.accent?.gold || '#FFD166';
  const coral   = theme?.accent?.coral || '#FF6B6B';
  const mint    = theme?.accent?.mint || '#4ECDC4';
  const glass1  = theme?.glass?.light || 'rgba(255,255,255,0.04)';
  const glass2  = theme?.glass?.medium || 'rgba(255,255,255,0.07)';
  const border  = theme?.glass?.border || 'rgba(255,255,255,0.09)';

  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 12, useNativeDriver: true }).start();
    // Defer heavy API calls until after tab-switch animation completes
    const task = InteractionManager.runAfterInteractions(() => {
      loadInitialData();
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    if (activeTab === 'friends') fetchFriendsList();
    if (activeTab === 'requests') fetchPendingRequests();
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchRecommendations(), fetchPendingRequests(), fetchFriendsList()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/api/social/recommendations?limit=5');
      const recs = res.data;
      const detailed = await Promise.all(recs.map(async (rec) => {
        try {
          const p = await api.get(`/api/social/profile/${rec.id}`).then(r => r.data);
          return { ...rec, ...p };
        } catch { return rec; }
      }));
      setRecommendations(detailed);
    } catch (e) { console.error('Recs failed', e); }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get('/api/social/requests/pending');
      setPendingRequests(res.data);
    } catch (e) { console.error('Pending failed', e); }
  };

  const fetchFriendsList = async () => {
    try {
      const res = await api.get('/api/social/friends');
      setFriendsList(res.data);
    } catch (e) { console.error('Friends failed', e); }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/api/social/search?q=${text}`);
      setSearchResults(res.data);
    } catch (e) { console.error('Search failed', e); }
  };

  const sendFriendRequest = async (targetUserId) => {
    const markPending = u => u.id === targetUserId ? { ...u, friendshipStatus: 'PENDING' } : u;
    setSearchResults(prev => prev.map(markPending));
    setRecommendations(prev => prev.map(markPending));
    try {
      await api.post(`/api/social/friend-request/${targetUserId}`);
    } catch (e) { 
      const revert = u => u.id === targetUserId ? { ...u, friendshipStatus: null } : u;
      setSearchResults(prev => prev.map(revert));
      setRecommendations(prev => prev.map(revert));
      Alert.alert('Error', e.response?.data?.error || 'Could not send request'); 
    }
  };

  const acceptRequest = async (requesterId, friendshipId) => {
    const requestItem = pendingRequests.find(r => r.friendshipId === friendshipId);
    setPendingRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
    if (requestItem) {
      setFriendsList(prev => [...prev, { ...requestItem, friendshipStatus: 'ACCEPTED' }]);
    }
    try {
      await api.post(`/api/social/friend-accept/${requesterId}`);
      fetchFriendsList();
    } catch (e) { 
      if (requestItem) setPendingRequests(prev => [...prev, requestItem]);
      Alert.alert('Error', 'Could not accept request'); 
    }
  };

  const toggleLike = async (targetUserId) => {
    const optUpdate = u => {
      if (u.id === targetUserId) {
        const isLiked = u.liked || u.isLikedByMe;
        const count = Math.max(0, (u.likeCount || u.totalLikes || 0) + (isLiked ? -1 : 1));
        return { ...u, liked: !isLiked, isLikedByMe: !isLiked, likeCount: count, totalLikes: count };
      }
      return u;
    };
    setRecommendations(prev => prev.map(optUpdate));
    setSearchResults(prev => prev.map(optUpdate));
    setFriendsList(prev => prev.map(optUpdate));

    try {
      const res = await api.post(`/api/social/like/${targetUserId}`);
      const update = u => u.id === targetUserId
        ? { ...u, liked: res.data.liked, isLikedByMe: res.data.liked, likeCount: res.data.likeCount, totalLikes: res.data.likeCount }
        : u;
      setRecommendations(prev => prev.map(update));
      setSearchResults(prev => prev.map(update));
      setFriendsList(prev => prev.map(update));
    } catch (e) { 
      console.warn('Like failed', e?.message); 
      fetchRecommendations();
    }
  };

  const startChat = (item) => {
    if (onStartChat) {
      onStartChat(item.id, item.name);
    }
  };

  // ── Suggestion Card ───────────────────────────────
  const renderSuggestionCard = ({ item }) => {
    const isPending = item.friendshipStatus === 'PENDING';
    const isLiked = item.liked || item.isLikedByMe;
    return (
      <TouchableOpacity
        style={[styles.sCard, { backgroundColor: card, borderColor: border }]}
        onPress={() => onOpenProfile(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={[accent + '18', 'transparent']} style={styles.sGlow} />
        {/* Avatar */}
        <View style={styles.sAvatarWrap}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={[styles.sAvatar, { borderColor: accent + '60' }]} />
          ) : (
            <LinearGradient colors={[accent + '30', accent + '10']} style={[styles.sAvatarPh, { borderColor: accent + '40' }]}>
              <Text style={[styles.sAvatarInit, { color: accent }]}>{(item.name || '?')[0].toUpperCase()}</Text>
            </LinearGradient>
          )}
        </View>
        <Text style={[styles.sName, { color: txt1 }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.sSub, { color: txtM }]} numberOfLines={1}>{item.title || 'Explorer'}</Text>

        {/* Stats row */}
        <View style={[styles.sStatsRow, { backgroundColor: glass1, borderColor: border }]}>
          <View style={styles.sStat}>
            <Icon name="heart" size={11} color={coral} />
            <Text style={[styles.sStatVal, { color: txt2 }]}>{item.likeCount || item.totalLikes || 0}</Text>
          </View>
          <View style={[styles.sStatDiv, { backgroundColor: border }]} />
          <View style={styles.sStat}>
            <Icon name="users" size={11} color={mint} />
            <Text style={[styles.sStatVal, { color: txt2 }]}>{item.friendCount || item.friendsCount || 0}</Text>
          </View>
          <View style={[styles.sStatDiv, { backgroundColor: border }]} />
          <View style={styles.sStat}>
            <Icon name="star" size={11} color={gold} />
            <Text style={[styles.sStatVal, { color: gold }]}>{item.points || 0}</Text>
          </View>
        </View>

        {(item.mutualFriendsCount || 0) > 0 && (
          <Text style={[styles.sMutual, { color: txtM }]}>{item.mutualFriendsCount} mutual</Text>
        )}

        {/* Action Buttons */}
        <View style={styles.sActions}>
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={[styles.sIconBtn, { backgroundColor: glass2, borderColor: border }]}>
            <Icon name="heart" size={15} color={isLiked ? coral : txtM} filled={!!isLiked} />
          </TouchableOpacity>
          {onStartChat && (
            <TouchableOpacity onPress={() => startChat(item)} style={[styles.sIconBtn, { backgroundColor: glass2, borderColor: border }]}>
              <Icon name="chat" size={15} color={accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Friend Button */}
        {isPending ? (
          <View style={[styles.sBtn, { backgroundColor: glass2, borderColor: border }]}>
            <Text style={[styles.sBtnText, { color: txtM }]}>Pending</Text>
          </View>
        ) : item.friendshipStatus === 'ACCEPTED' ? (
          <View style={[styles.sBtn, { backgroundColor: mint + '15', borderColor: mint + '30' }]}>
            <Text style={[styles.sBtnText, { color: mint }]}>Friends</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.sBtn, { backgroundColor: accent }]} onPress={() => sendFriendRequest(item.id)}>
            <Icon name="user-plus" size={12} color="#FFF" />
            <Text style={[styles.sBtnText, { color: '#FFF' }]}>Add</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // ── User Row (search results, friends, requests) ──────────
  const renderUserRow = ({ item, showLike = true, showChat = true, showAction = true, actionType = 'add' }) => {
    const isPending = item.friendshipStatus === 'PENDING';
    const isFriend = item.friendshipStatus === 'ACCEPTED';
    const isLiked = item.liked || item.isLikedByMe;

    return (
      <TouchableOpacity
        style={[styles.uRow, { backgroundColor: card, borderColor: border }]}
        onPress={() => onOpenProfile(item.id)}
        activeOpacity={0.75}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={[styles.uAvatar, { borderColor: accent + '50' }]} />
        ) : (
          <View style={[styles.uAvatarPh, { backgroundColor: accent + '15', borderColor: accent + '30' }]}>
            <Text style={[styles.uAvatarInit, { color: accent }]}>{(item.name || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.uInfo}>
          <Text style={[styles.uName, { color: txt1 }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.uSub, { color: txtM }]} numberOfLines={1}>{item.title || 'Explorer'} • Lv {item.level || 1}</Text>
        </View>
        {showLike && (
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.uIconBtn}>
            <Icon name="heart" size={18} color={isLiked ? coral : txtM} filled={!!isLiked} />
          </TouchableOpacity>
        )}
        {showChat && onStartChat && (
          <TouchableOpacity onPress={() => startChat(item)} style={styles.uIconBtn}>
            <Icon name="chat" size={18} color={accent} />
          </TouchableOpacity>
        )}
        {showAction && (
          actionType === 'accept' ? (
            <TouchableOpacity
              style={[styles.uActionBtn, { backgroundColor: '#22C55E' }]}
              onPress={() => acceptRequest(item.senderId || item.id, item.friendshipId)}
            >
              <Text style={styles.uActionText}>Accept</Text>
            </TouchableOpacity>
          ) : (!isFriend && !isPending) ? (
            <TouchableOpacity
              style={[styles.uActionBtn, { backgroundColor: accent + '18', borderColor: accent + '40', borderWidth: 1 }]}
              onPress={() => sendFriendRequest(item.id)}
            >
              <Icon name="user-plus" size={15} color={accent} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.uBadge, { backgroundColor: glass2, borderColor: border }]}>
              <Text style={[styles.uBadgeText, { color: txtM }]}>{isFriend ? 'Friend' : 'Pending'}</Text>
            </View>
          )
        )}
      </TouchableOpacity>
    );
  };

  // ── Tab Content ───────────────────────────────────
  const renderTabContent = () => {
    if (searchQuery.length >= 2) {
      return (
        <FlatList
          key="search-results"
          data={searchResults}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => renderUserRow({ item })}
          contentContainerStyle={styles.listPad}
          initialNumToRender={5}
          windowSize={3}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          ListEmptyComponent={<EmptyState icon="search" title="No results" sub={`No users found for "${searchQuery}"`} txtM={txtM} txt1={txt1} glass2={glass2} border={border} />}
        />
      );
    }

    if (activeTab === 'suggestions') {
      return (
        <FlatList
          key="suggestions-grid"
          data={recommendations}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={renderSuggestionCard}
          contentContainerStyle={styles.gridPad}
          columnWrapperStyle={styles.gridRow}
          initialNumToRender={6}
          windowSize={3}
          maxToRenderPerBatch={4}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          ListEmptyComponent={loading ? <ActivityIndicator size="large" color={accent} style={{ marginTop: 40 }} /> : <EmptyState icon="users" title="No suggestions yet" sub="Check back later for recommendations" txtM={txtM} txt1={txt1} glass2={glass2} border={border} />}
        />
      );
    }

    if (activeTab === 'requests') {
      const data = pendingRequests.map(r => ({
        ...r,
        id: r.senderId,
        name: r.senderName,
        imageUrl: r.senderImage,
        title: r.senderTitle,
      }));
      return (
        <FlatList
          key="requests-list"
          data={data}
          keyExtractor={item => (item.friendshipId || item.id).toString()}
          renderItem={({ item }) => renderUserRow({ item, showLike: false, showChat: false, actionType: 'accept' })}
          contentContainerStyle={styles.listPad}
          initialNumToRender={5}
          windowSize={3}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          ListEmptyComponent={<EmptyState icon="bell" title="No pending requests" sub="You're all caught up!" txtM={txtM} txt1={txt1} glass2={glass2} border={border} />}
        />
      );
    }

    if (activeTab === 'friends') {
      return (
        <FlatList
          key="friends-list"
          data={friendsList}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => renderUserRow({ item, showAction: false })}
          contentContainerStyle={styles.listPad}
          initialNumToRender={5}
          windowSize={3}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          ListEmptyComponent={<EmptyState icon="users" title="No friends yet" sub="Add friends from the suggestions tab" txtM={txtM} txt1={txt1} glass2={glass2} border={border} />}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={[styles.orb1, { backgroundColor: accent }]} />
      <View style={[styles.orb2, { backgroundColor: mint }]} />

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: 10, opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <View>
          
          <Text style={[styles.pageSub, { color: txtM }]}>Find your curious tribe</Text>
        </View>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: glass2, borderColor: border }]}>
          <Icon name="search" size={18} color={txtM} />
          <TextInput style={[styles.searchInput, { color: txt1 }]} placeholder="Search by name..." placeholderTextColor={txtM} value={searchQuery} onChangeText={handleSearch} />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={[styles.clearBtn, { backgroundColor: glass1 }]}>
              <Icon name="cross" size={12} color={txtM} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {searchQuery.length < 2 && (
        <View style={styles.tabRow}>
          {TABS.map(t => {
            const active = activeTab === t.key;
            const count = t.key === 'requests' ? pendingRequests.length : t.key === 'friends' ? friendsList.length : 0;
            return (
              <TouchableOpacity key={t.key} style={[styles.tab, active && { backgroundColor: accent + '18', borderColor: accent }]} onPress={() => setActiveTab(t.key)}>
                <Icon name={t.icon} size={14} color={active ? accent : txtM} />
                <Text style={[styles.tabLabel, { color: active ? accent : txtM }]}>{t.label}</Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: t.key === 'requests' ? coral : mint }]}>
                    <Text style={styles.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Content */}
      {renderTabContent()}
    </View>
  );
}

// ── Empty State Component ─────────────────────────
function EmptyState({ icon, title, sub, txtM, txt1, glass2, border }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: glass2, borderColor: border }]}>
        <Icon name={icon} size={32} color={txtM} />
      </View>
      <Text style={[styles.emptyTitle, { color: txt1 }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: txtM }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: 100, opacity: 0.06 },
  orb2: { position: 'absolute', bottom: 100, left: -80, width: 180, height: 180, borderRadius: 90, opacity: 0.05 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: 12 },
  pageTitle: { fontFamily: FONTS.display, fontSize: 26 },
  pageSub: { fontFamily: FONTS.body, fontSize: 23, marginTop: 2 },
  searchWrap: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: RADIUS.lg, borderWidth: 1, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 15 },
  clearBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.sm, gap: 2, marginBottom: SPACING.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'transparent' },
  tabLabel: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  tabBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontFamily: FONTS.displayMedium, fontSize: 10, color: '#FFF' },

  // Suggestion grid cards
  gridPad: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  sCard: { width: (width - SPACING.lg * 2 - 12) / 2, borderRadius: RADIUS.xl, borderWidth: 1, padding: 14, alignItems: 'center', overflow: 'hidden' },
  sGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 70, borderRadius: RADIUS.xl },
  sAvatarWrap: { marginBottom: 8 },
  sAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5 },
  sAvatarPh: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  sAvatarInit: { fontFamily: FONTS.display, fontSize: 20 },
  sName: { fontFamily: FONTS.displayMedium, fontSize: 14, textAlign: 'center', marginBottom: 2 },
  sSub: { fontFamily: FONTS.body, fontSize: 11, textAlign: 'center', marginBottom: 8 },
  sStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, borderWidth: 1, paddingVertical: 5, paddingHorizontal: 6, width: '100%', marginBottom: 6, gap: 4 },
  sStat: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'center' },
  sStatDiv: { width: 1, height: 14 },
  sStatVal: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  sMutual: { fontFamily: FONTS.body, fontSize: 10, marginBottom: 6, textAlign: 'center' },
  sActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sIconBtn: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'transparent' },
  sBtnText: { fontFamily: FONTS.displayMedium, fontSize: 12 },

  // User rows
  listPad: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  uRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, padding: 12, borderRadius: RADIUS.lg, borderWidth: 1 },
  uAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  uAvatarPh: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  uAvatarInit: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  uInfo: { flex: 1 },
  uName: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  uSub: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  uIconBtn: { padding: 6 },
  uActionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  uActionText: { color: '#FFF', fontFamily: FONTS.displayMedium, fontSize: 12 },
  uBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  uBadgeText: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  emptyText: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center' },
});
