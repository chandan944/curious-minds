// ─────────────────────────────────────────────────────────────────────────────
//  ProfileModal.jsx — Unified Profile Modal with Like & Add Friend
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Modal, Animated, ActivityIndicator, Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from './Icons';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import socialService from '../../services/socialService';

export default function ProfileModal({
  visible,
  onClose,
  targetUserId,
  onStartChat,      // (userId, userName) => void — optional
  showMessageButton = true,
}) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const bg = theme.bg.base;
  const txt1 = theme.text.primary;
  const txtM = theme.text.muted;
  const accent = theme.accent.primary;
  const gold = theme.accent.gold;
  const border = theme.glass.border;

  // ── Load Profile ─────────────────────────────────────
  useEffect(() => {
    if (visible && targetUserId) {
      setLoading(true);
      setProfile(null);
      slideAnim.setValue(400);
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }).start();

      socialService.getSocialProfile(targetUserId)
        .then(data => setProfile(data))
        .catch(err => {
          console.warn('Failed to load social profile:', err?.message);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, targetUserId]);

  // ── Close ─────────────────────────────────────
  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  // ── Toggle Like ─────────────────────────────────────
  const handleLike = async () => {
    if (!profile || likeLoading) return;
    setLikeLoading(true);

    // Bounce animation
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, friction: 3, tension: 200, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();

    try {
      const res = await socialService.toggleLike(targetUserId);
      setProfile(prev => ({
        ...prev,
        isLikedByMe: res.liked,
        likeCount: res.likeCount,
      }));
    } catch (err) {
      console.warn('Like failed:', err?.message);
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Friend Request ─────────────────────────────────────
  const handleFriendAction = async () => {
    if (!profile || friendLoading) return;
    setFriendLoading(true);

    try {
      const status = profile.friendshipStatus;
      if (status === 'NONE') {
        const res = await socialService.sendFriendRequest(targetUserId);
        setProfile(prev => ({ ...prev, friendshipStatus: res.status === 'REQUEST_SENT' ? 'PENDING' : prev.friendshipStatus }));
      } else if (status === 'PENDING') {
        // Accept if we are the addressee
        const res = await socialService.acceptFriendRequest(targetUserId);
        if (res.status === 'ACCEPTED') {
          setProfile(prev => ({
            ...prev,
            friendshipStatus: 'ACCEPTED',
            friendCount: (prev.friendCount || 0) + 1,
          }));
        }
      }
    } catch (err) {
      console.warn('Friend action failed:', err?.message);
    } finally {
      setFriendLoading(false);
    }
  };

  // ── DM ─────────────────────────────────────
  const handleDirectMessage = () => {
    if (profile && onStartChat) {
      if (profile.isPrivateProfile && profile.friendshipStatus !== 'ACCEPTED') {
        Alert.alert(
          'Private Profile',
          'This user has a private profile. You must be friends with them to send a direct message.',
          [{ text: 'OK' }]
        );
        return;
      }

      const pId = profile.id;
      const pName = profile.name;
      handleClose();
      setTimeout(() => onStartChat(pId, pName), 250);
    }
  };

  // ── Friend button text ─────────────────────────────────────
  const getFriendButtonInfo = () => {
    if (!profile) return { label: 'Add Friend', icon: 'user-plus', color: '#22C55E' };
    const s = profile.friendshipStatus;
    if (s === 'ACCEPTED') return { label: 'Friends ✓', icon: 'users', color: '#22C55E' };
    if (s === 'PENDING') return { label: 'Pending...', icon: 'clock', color: '#F59E0B' };
    return { label: 'Add Friend', icon: 'user-plus', color: '#22C55E' };
  };

  if (!visible) return null;

  const friendBtn = getFriendButtonInfo();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.content, { backgroundColor: bg, borderColor: border, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.dragHandle} />

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={accent} size="large" />
              </View>
            ) : profile ? (
              <>
                {/* ── Avatar & Basic Info ─────────────────── */}
                <View style={styles.header}>
                  {profile.imageUrl ? (
                    <Image source={{ uri: profile.imageUrl }} style={[styles.avatar, { borderColor: accent }]} />
                  ) : (
                    <View style={[styles.avatarPh, { borderColor: accent, backgroundColor: isDark ? '#1C1D26' : '#F8FAFC' }]}>
                      <Text style={[styles.avatarInit, { color: accent }]}>{(profile.name || '?')[0]}</Text>
                    </View>
                  )}
                  <Text style={[styles.name, { color: txt1 }]}>{profile.name}</Text>
                  <Text style={[styles.title, { color: txtM }]}>{profile.title}</Text>
                </View>

                {/* ── Stats Row ─────────────────── */}
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
                    <Text style={[styles.statLabel, { color: txtM }]}>Level</Text>
                    <Text style={[styles.statVal, { color: txt1 }]}>{profile.level}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
                    <Text style={[styles.statLabel, { color: txtM }]}>Points</Text>
                    <Text style={[styles.statVal, { color: gold }]}>{(profile.points || 0).toLocaleString()}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
                    <Text style={[styles.statLabel, { color: txtM }]}>Streak</Text>
                    <Text style={[styles.statVal, { color: '#FF9F1C' }]}>{profile.streak || 0} 🔥</Text>
                  </View>
                </View>

                {/* ── Social Stats ─────────────────── */}
                <View style={styles.socialRow}>
                  <View style={[styles.socialBadge, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
                    <Icon name={profile.isLikedByMe ? 'heart-filled' : 'heart'} size={16} color="#FF6B6B" />
                    <Text style={[styles.socialNum, { color: txt1 }]}>{profile.likeCount || 0}</Text>
                    <Text style={[styles.socialLabel, { color: txtM }]}>Likes</Text>
                  </View>
                  <View style={[styles.socialBadge, { backgroundColor: isDark ? '#1C1D26' : '#F8FAFC', borderColor: border }]}>
                    <Icon name="users" size={16} color={accent} />
                    <Text style={[styles.socialNum, { color: txt1 }]}>{profile.friendCount || 0}</Text>
                    <Text style={[styles.socialLabel, { color: txtM }]}>Friends</Text>
                  </View>
                </View>

                {/* ── Action Buttons ─────────────────── */}
                <View style={styles.actionRow}>
                  {/* Like Button */}
                  <TouchableOpacity
                    onPress={handleLike}
                    disabled={likeLoading}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: profile.isLikedByMe ? '#FF6B6B' : (isDark ? '#1C1D26' : '#F8FAFC'), borderColor: profile.isLikedByMe ? '#FF6B6B' : border },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                      <Icon name={profile.isLikedByMe ? 'heart-filled' : 'heart'} size={18} color={profile.isLikedByMe ? '#FFFFFF' : '#FF6B6B'} />
                    </Animated.View>
                    <Text style={[styles.actionBtnText, { color: profile.isLikedByMe ? '#FFFFFF' : '#FF6B6B' }]}>
                      {profile.isLikedByMe ? 'Liked' : 'Like'}
                    </Text>
                  </TouchableOpacity>

                  {/* Friend Button */}
                  <TouchableOpacity
                    onPress={handleFriendAction}
                    disabled={friendLoading || profile.friendshipStatus === 'ACCEPTED'}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: profile.friendshipStatus === 'ACCEPTED' ? friendBtn.color : (isDark ? '#1C1D26' : '#F8FAFC'),
                        borderColor: profile.friendshipStatus === 'ACCEPTED' ? friendBtn.color : border,
                        opacity: friendLoading ? 0.6 : 1,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    {friendLoading ? (
                      <ActivityIndicator size="small" color={friendBtn.color} />
                    ) : (
                      <>
                        <Icon name={friendBtn.icon} size={18} color={profile.friendshipStatus === 'ACCEPTED' ? '#FFFFFF' : friendBtn.color} />
                        <Text style={[styles.actionBtnText, { color: profile.friendshipStatus === 'ACCEPTED' ? '#FFFFFF' : friendBtn.color }]}>
                          {friendBtn.label}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* ── DM Button ─────────────────── */}
                {showMessageButton && onStartChat && (
                  <TouchableOpacity onPress={handleDirectMessage} style={[styles.dmBtn, { backgroundColor: (profile.isPrivateProfile && profile.friendshipStatus !== 'ACCEPTED') ? '#374151' : accent }]} activeOpacity={0.8}>
                    <Icon name={(profile.isPrivateProfile && profile.friendshipStatus !== 'ACCEPTED') ? 'lock' : 'chat'} size={18} color="#FFFFFF" />
                    <Text style={styles.dmBtnText}>{(profile.isPrivateProfile && profile.friendshipStatus !== 'ACCEPTED') ? 'Private Message' : 'Message Directly'}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.loadingWrap}>
                <Icon name="alert" size={36} color={txtM} />
                <Text style={[styles.errorText, { color: txtM }]}>Could not load profile</Text>
              </View>
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
    padding: SPACING.lg, paddingBottom: 40,
  },
  dragHandle: { width: 40, height: 4, backgroundColor: '#6B7280', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  errorText: { fontFamily: FONTS.body, fontSize: 14, marginTop: 12 },

  // Header
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, marginBottom: 12 },
  avatarPh: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontFamily: FONTS.displayMedium, fontSize: 32 },
  name: { fontFamily: FONTS.display, fontSize: 22, marginBottom: 4 },
  title: { fontFamily: FONTS.body, fontSize: 14 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  statLabel: { fontFamily: FONTS.body, fontSize: 11, marginBottom: 4 },
  statVal: { fontFamily: FONTS.displayMedium, fontSize: 17 },

  // Social Row
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  socialBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1,
  },
  socialNum: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  socialLabel: { fontFamily: FONTS.body, fontSize: 12 },

  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.full, borderWidth: 1,
  },
  actionBtnText: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  // DM Button
  dmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.full,
  },
  dmBtnText: { fontFamily: FONTS.displayMedium, fontSize: 16, color: '#FFFFFF' },
});
