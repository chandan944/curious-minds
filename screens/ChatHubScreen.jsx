import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/ui/Icons';
import NotificationsModal from '../components/ui/NotificationsModal';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import api from '../services/api';
import socialService from '../services/socialService';
import chatService from '../services/chatService';

const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

export default function ChatHubScreen({ onBack, onOpenChat }) {
  const { theme, isDark } = useTheme();
  const { token } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Colours
  // Colours
  const bg = theme?.bg?.base || '#08090F';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(232,234,255,0.60)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.09)';
  const gold = theme?.accent?.gold || '#FFD166';


  useEffect(() => {
    fetchInbox();
    // Fetch unread count
    socialService.getUnreadCount()
      .then(res => setUnreadCount(res.unreadCount || 0))
      .catch(() => {});

    // Subscribe to real-time notifications for badge count
    const unsub = chatService.addNotificationListener(() => {
      setUnreadCount(prev => prev + 1);
    });
    return () => unsub();
  }, []);

  const fetchInbox = async () => {
    try {
      const res = await api.get('/chat/inbox');
      setInbox(res.data);
    } catch (e) {
      console.warn('Failed to load inbox', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInboxItem = ({ item, index }) => {
    // Alternate subtle accent colors for visual variety
    const colors = [accent, '#FF9F1C', theme?.accent?.mint || '#4ECDC4', '#E879F9'];
    const itemAccent = colors[index % colors.length];
    
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}
        onPress={() => onOpenChat(item.id, item.name)}
        activeOpacity={0.7}
      >
        {/* Avatar with online dot */}
        <View>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={[styles.avatar, { borderColor: itemAccent }]} />
          ) : (
            <View style={[styles.avatarPh, { borderColor: itemAccent, backgroundColor: itemAccent + '15' }]}>
              <Text style={[styles.avatarInit, { color: itemAccent }]}>{(item.name || '?')[0].toUpperCase()}</Text>
            </View>
          )}
          <View style={[styles.onlineDot, { backgroundColor: '#22C55E', borderColor: isDark ? '#1C1D26' : '#FFFFFF' }]} />
        </View>

        {/* Name + Title */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: txt1 }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.subtitle, { color: txtM }]} numberOfLines={1}>
            {item.title} • Level {item.level}
          </Text>
        </View>

        {/* Arrow */}
        <View style={[styles.arrowWrap, { backgroundColor: isDark ? '#2A2C3A' : '#F1F5F9' }]}>
          <Icon name="forward" size={14} color={txtM} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: 10 }]}>
      {/* ── Top Bar ───────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: isDark ? '#1C1D26' : '#FFFFFF' }]}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { color: txt1 }]}>Messages</Text>
          <Text style={[styles.pageSub, { color: txtM }]}>Chat with curious minds</Text>
        </View>

       

        
      </View>

      {/* ── Global Hub Button ─────────────────────── */}
      <TouchableOpacity
        style={[styles.globalBtn, { backgroundColor: accent + '12', borderColor: accent + '30' }]}
        onPress={() => onOpenChat(null, 'Global Community')}
        activeOpacity={0.8}
      >
        <View style={[styles.globalIcon, { backgroundColor: accent }]}>
          <Icon name="globe" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.globalTitle, { color: accent }]}>Community Hub</Text>
          <Text style={[styles.globalSub, { color: txtM }]}>Join the global discussion</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: '#22C55E' }]}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </TouchableOpacity>

      {/* ── Direct Messages Section ───────────────── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: txtM }]}>Messages</Text>
        {inbox.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: accent + '20' }]}>
            <Text style={[styles.countText, { color: accent }]}>{inbox.length}</Text>
          </View>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator color={accent} style={{ marginTop: 40 }} />
      ) : inbox.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
            <Icon name="chat" size={36} color={txtM} />
          </View>
          <Text style={[styles.emptyTitle, { color: txt1 }]}>No conversations yet</Text>
          <Text style={[styles.emptySub, { color: txtM }]}>
            Tap on someone's profile in the{'\n'}Community Hub or Leaderboard to start chatting!
          </Text>
        </View>
      ) : (
        <FlatList
          data={inbox}
          keyExtractor={item => item.id.toString()}
          renderItem={renderInboxItem}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  root: { flex: 1,marginTop:-20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 22 },
  pageSub: { fontFamily: FONTS.body, fontSize: 12 },

  // Bell
  bellWrap: { position: 'relative', marginRight: 4 },
  bellBadge: {
    position: 'absolute', top: -5, right: -6,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { fontFamily: FONTS.displayMedium, fontSize: 10, color: '#FFFFFF' },

  globalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: SPACING.lg, marginVertical: 12,
    padding: 16, borderRadius: RADIUS.lg, borderWidth: 1,
  },
  globalIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  globalTitle: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  globalSub: { fontFamily: FONTS.body, fontSize: 13 },
  liveBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  liveText: { fontFamily: FONTS.displayMedium, fontSize: 10, color: '#FFFFFF', letterSpacing: 1 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginBottom: 12, marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium, fontSize: 14,
  },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  countText: { fontFamily: FONTS.displayMedium, fontSize: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: 8,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2 },
  avatarPh: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontFamily: FONTS.displayMedium, fontSize: 20 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6, borderWidth: 2,
  },
  name: { fontFamily: FONTS.displayMedium, fontSize: 15, marginBottom: 3 },
  subtitle: { fontFamily: FONTS.body, fontSize: 12 },
  arrowWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },

  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
