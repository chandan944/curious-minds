import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, Platform, StatusBar, InteractionManager
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/ui/Icons';
import NotificationsModal from '../components/ui/NotificationsModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import api from '../services/api';
import socialService from '../services/socialService';
import chatService from '../services/chatService';
import { useQuery } from '@tanstack/react-query';

const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

export default function ChatHubScreen({ onBack, onOpenChat }) {
  const { theme, isDark } = useTheme();
  const { token } = useAuth();

  const { data: inbox = [], isLoading: loading } = useQuery({
    queryKey: ['chatInbox'],
    queryFn: async () => {
      const res = await api.get('/chat/inbox');
      return res.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  // Notifications
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Colours - Refined Premium Palette
  const bg = theme?.bg?.base || '#08090F';
  const cardBg = isDark ? '#12141D' : '#FFFFFF';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(232,234,255,0.50)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      socialService.getUnreadCount()
        .then(res => setUnreadCount(res.unreadCount || 0))
        .catch(() => {});
    });

    const unsub = chatService.addNotificationListener(() => {
      setUnreadCount(prev => prev + 1);
    });
    return () => { task.cancel(); unsub(); };
  }, []);

  const renderInboxItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: border }]}
        onPress={() => onOpenChat(item.id, item.name)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={[styles.avatar, { borderColor: border }]} />
          ) : (
            <LinearGradient
              colors={[accent + '40', accent + '10']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.avatarPh, { borderColor: accent + '30' }]}
            >
              <Text style={[styles.avatarInit, { color: accent }]}>{(item.name || '?')[0].toUpperCase()}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Name + Title */}
        <View style={styles.rowContent}>
          <Text style={[styles.name, { color: txt1 }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.subtitle, { color: txtM }]} numberOfLines={1}>
            {item.title} 
          </Text>
        </View>

        {/* Arrow */}
        
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* ── Top Bar ───────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: STATUS_BAR_H + 10, paddingBottom: 20 }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: txt1 }]}>Messages</Text>
        </View>
      </View>

      {/* ── Global Hub Premium Card ─────────────────────── */}
      <View style={styles.featuredContainer}>
        <TouchableOpacity
          onPress={() => onOpenChat(null, 'Global Community')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isDark ? ['#1A1D2B', '#12141D'] : ['#F8FAFC', '#F1F5F9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.globalCard, { borderColor: border }]}
          >
            <View style={styles.globalCardContent}>
              <LinearGradient
                colors={[accent, '#9F94FF']}
                style={styles.globalIconWrap}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Icon name="globe" size={24} color="#FFFFFF" />
              </LinearGradient>
              
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.globalTitleRow}>
                  <Text style={[styles.globalTitle, { color: txt1 }]}>Global Community</Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                </View>
                <Text style={[styles.globalSub, { color: txtM }]}>Join the worldwide discussion</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Direct Messages Section ───────────────── */}
      <View style={[styles.listContainer, { backgroundColor: cardBg, borderColor: border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: txt1 }]}>Messages</Text>
          {inbox.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
              <Text style={[styles.countText, { color: accent }]}>{inbox.length}</Text>
            </View>
          )}
        </View>
        
        {loading ? (
          <View style={{ paddingTop: 10 }}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[styles.row, { borderBottomColor: border }]}>
                <SkeletonLoader width={48} height={48} circle style={{ marginRight: 16 }} />
                <View style={{ flex: 1, gap: 8 }}>
                  <SkeletonLoader width="60%" height={16} />
                  <SkeletonLoader width="40%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : inbox.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderColor: border }]}>
              <Icon name="chat" size={32} color={txtM} />
            </View>
            <Text style={[styles.emptyTitle, { color: txt1 }]}>No Conversations</Text>
            <Text style={[styles.emptySub, { color: txtM }]}>
              Connect with others from the Leaderboard.
            </Text>
          </View>
        ) : (
          <FlatList
            data={inbox}
            keyExtractor={item => item.id.toString()}
            renderItem={renderInboxItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* ── Notifications Modal ─────────────────────────── */}
      <NotificationsModal
        visible={notifVisible}
        onClose={() => {
          setNotifVisible(false);
          setUnreadCount(0);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 , marginTop: -45 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: SPACING.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 26 },

  // ── Featured Global Card ──
  featuredContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 24,
  },
  globalCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  globalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalIconWrap: {
    width: 54, height: 54, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  globalTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  globalTitle: { fontFamily: FONTS.displayMedium, fontSize: 17 },
  globalSub: { fontFamily: FONTS.body, fontSize: 13 },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { fontFamily: FONTS.displayBold, fontSize: 10, color: '#22C55E', letterSpacing: 1 },

  // ── Inbox List ──
  listContainer: {
    flex: 1,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: SPACING.lg, marginBottom: 16,
  },
  sectionTitle: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  countText: { fontFamily: FONTS.displayMedium, fontSize: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  avatarWrapper: { marginRight: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1 },
  avatarPh: { 
    width: 48, height: 48, borderRadius: 24, borderWidth: 1, 
    alignItems: 'center', justifyContent: 'center' 
  },
  avatarInit: { fontFamily: FONTS.displayMedium, fontSize: 18 },
  rowContent: { flex: 1, paddingRight: 16 },
  name: { fontFamily: FONTS.displayMedium, fontSize: 16, marginBottom: 3 },
  subtitle: { fontFamily: FONTS.body, fontSize: 13 },

  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
