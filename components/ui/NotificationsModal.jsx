// ─────────────────────────────────────────────────────────────────────────────
//  NotificationsModal.jsx — Slide-up notification center
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Modal, Animated, FlatList, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from './Icons';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import socialService from '../../services/socialService';
import chatService from '../../services/chatService';

// ── Relative time formatter ──────────────────────────────────
const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString();
};

// ── Icon for notification type ──────────────────────────────
const getNotifIcon = (type) => {
  switch (type) {
    case 'LIKE': return { name: 'heart-filled', color: '#FF6B6B' };
    case 'FRIEND_REQUEST': return { name: 'user-plus', color: '#22C55E' };
    case 'FRIEND_ACCEPT': return { name: 'users', color: '#7B6FFF' };
    case 'MESSAGE': return { name: 'chat', color: '#38BDF8' };
    default: return { name: 'bell', color: '#F59E0B' };
  }
};

export default function NotificationsModal({ visible, onClose, onAcceptFriend }) {
  const { theme, isDark } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const slideAnim = useRef(new Animated.Value(500)).current;

  const bg = theme.bg.base;
  const txt1 = theme.text.primary;
  const txtM = theme.text.muted;
  const accent = theme.accent.primary;
  const border = theme.glass.border;

  // ── Load & subscribe ─────────────────────────────────────
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(500);
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }).start();

      loadNotifications();

      // Subscribe to real-time notifications
      const unsub = chatService.addNotificationListener((notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      return () => unsub();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await socialService.getNotifications(0, 30);
      setNotifications(res.content || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Close ─────────────────────────────────────
  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 500, duration: 200, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  // ── Mark all read ─────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await socialService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Mark all read failed:', err?.message);
    }
  };

  // ── Accept friend from notification ─────────────────────────────────────
  const handleAcceptFriend = async (senderId, notifId) => {
    try {
      await socialService.acceptFriendRequest(senderId);
      // Mark notification as read
      await socialService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n =>
        n.id === notifId ? { ...n, isRead: true, message: 'You are now friends!' } : n
      ));
      if (onAcceptFriend) onAcceptFriend(senderId);
    } catch (err) {
      console.warn('Accept friend failed:', err?.message);
    }
  };

  // ── Render notification item ─────────────────────────────────────
  const renderNotifItem = ({ item }) => {
    const iconInfo = getNotifIcon(item.type);
    const isUnread = !item.isRead;

    return (
      <View style={[
        styles.notifRow,
        {
          backgroundColor: isUnread ? (isDark ? '#1A1B30' : '#F0F4FF') : (isDark ? '#1C1D26' : '#FFFFFF'),
          borderColor: isUnread ? (accent + '30') : border,
        },
      ]}>
        {/* Left indicator */}
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}

        {/* Avatar / Icon */}
        <View style={[styles.notifIconWrap, { backgroundColor: iconInfo.color + '18' }]}>
          {item.senderImage ? (
            <Image source={{ uri: item.senderImage }} style={styles.notifAvatar} />
          ) : (
            <Icon name={iconInfo.name} size={20} color={iconInfo.color} />
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.notifMsg, { color: txt1 }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.notifTime, { color: txtM }]}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>

        {/* Accept button for friend requests */}
        {item.type === 'FRIEND_REQUEST' && !item.isRead && (
          <TouchableOpacity
            onPress={() => handleAcceptFriend(item.senderId, item.id)}
            style={[styles.acceptBtn, { backgroundColor: '#22C55E' }]}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.content, { backgroundColor: bg, borderColor: border, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.dragHandle} />

            {/* ── Header ─────────────────── */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: txt1 }]}>Notifications</Text>
                {unreadCount > 0 && (
                  <Text style={[styles.headerSub, { color: accent }]}>
                    {unreadCount} unread
                  </Text>
                )}
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} style={[styles.markAllBtn, { borderColor: border }]}>
                  <Text style={[styles.markAllText, { color: accent }]}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── List ─────────────────── */}
            {loading ? (
              <ActivityIndicator color={accent} style={{ paddingVertical: 40 }} />
            ) : notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Icon name="bell" size={44} color={txtM} />
                <Text style={[styles.emptyText, { color: txtM }]}>No notifications yet</Text>
                <Text style={[styles.emptySubText, { color: txtM }]}>
                  When someone likes your profile or{'\n'}sends you a friend request, it'll show here
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item, idx) => (item.id || idx).toString()}
                renderItem={renderNotifItem}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  content: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40,
    maxHeight: '80%',
  },
  dragHandle: { width: 40, height: 4, backgroundColor: '#6B7280', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontFamily: FONTS.display, fontSize: 22 },
  headerSub: { fontFamily: FONTS.bodyMedium, fontSize: 13, marginTop: 2 },
  markAllBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
  markAllText: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // Notification Item
  notifRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1,
    marginBottom: 8,
  },
  unreadDot: {
    position: 'absolute', left: 6, top: '50%', marginTop: -4,
    width: 8, height: 8, borderRadius: 4,
  },
  notifIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  notifAvatar: { width: 44, height: 44, borderRadius: 22 },
  notifMsg: { fontFamily: FONTS.bodyMedium, fontSize: 14, lineHeight: 20 },
  notifTime: { fontFamily: FONTS.body, fontSize: 11, marginTop: 3 },
  acceptBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full },
  acceptBtnText: { fontFamily: FONTS.displayMedium, fontSize: 12, color: '#FFFFFF' },

  // Empty
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 12 },
  emptyText: { fontFamily: FONTS.displayMedium, fontSize: 16 },
  emptySubText: { fontFamily: FONTS.body, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  list: { maxHeight: 400 },
});
