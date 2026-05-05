import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/ui/Icons';
import ProfileModal from '../components/ui/ProfileModal';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import chatService from '../services/chatService';
import api from '../services/api';

// Removed hardcoded DARK/LIGHT tokens to dynamically map from theme context below.

const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ── Typing Indicator dots ─────────────────────────────────────
function TypingDots({ color }) {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(150, anims.map(a =>
        Animated.sequence([
          Animated.timing(a, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0,  duration: 300, useNativeDriver: true }),
        ])
      ))
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.typingDots}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: a }] }]} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────
export default function ChatRoomScreen({ onBack, targetId, chatTitle, onStartDirectChat }) {
  const { theme, isDark } = useTheme();
  const { user, token } = useAuth();
  
  // Dynamic theme mapping
  const C = {
    bg:           theme?.bg?.base || (isDark ? '#080B14' : '#F4F6FB'),
    surface:      theme?.bg?.surface || (isDark ? '#0F1320' : '#FFFFFF'),
    border:       theme?.glass?.border || (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
    accent:       theme?.accent?.primary || '#7B6FFF',
    accentSoft:   theme?.accent?.secondary || (isDark ? '#A78BFA' : '#7B6FFF'),
    accentGlow:   isDark ? 'rgba(108,99,255,0.45)' : 'rgba(108,99,255,0.25)',
    text:         theme?.text?.primary || (isDark ? '#F0F2FF' : '#0F1320'),
    muted:        theme?.text?.muted || (isDark ? '#9CA3AF' : '#9CA3AF'),
    muted2:       isDark ? '#6B7280' : '#6B7280',
    green:        '#34D399',
    bubbleMe1:    theme?.accent?.primary || '#7B6FFF',
    bubbleMe2:    isDark ? '#8B83FF' : '#8B83FF',
    bubbleThem:   isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    replyBorder:  theme?.glass?.border || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
  };

  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [profileTargetId, setProfileTargetId] = useState(null);
  const [profileVisible, setProfileVisible]   = useState(false);
  const [isOnline, setIsOnline]               = useState(false);

  const flatListRef = useRef(null);
  const isGlobal    = targetId === null;

  // ── Fetch history + connect WS ──
  useEffect(() => {
    const initChat = async () => {
      try {
        const endpoint = isGlobal ? '/chat/global' : `/chat/direct/${targetId}`;
        const res = await api.get(endpoint);
        setMessages(res.data.content || []);

        if (!isGlobal && targetId) {
          try {
            const onlineRes = await api.get(`/chat/online/${targetId}`);
            setIsOnline(onlineRes.data);
          } catch (err) {
            console.warn('Failed to fetch online status', err?.message);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch chat history', e?.message);
      } finally {
        setLoading(false);
      }
      if (token) chatService.connect(token);
    };

    initChat();

    const unsubscribe = chatService.addListener((msg) => {
      if (msg.type === 'READ_RECEIPT') {
        setMessages(prev => prev.map(m => m.id === msg.messageId ? { ...m, status: 'READ' } : m));
        return;
      }
      if (isGlobal && msg.target !== 'GLOBAL') return;
      if (!isGlobal && msg.target !== 'GLOBAL' && msg.senderId !== targetId &&
          msg.target !== targetId.toString() && msg.senderId !== user.id) return;

      setMessages(prev => [msg, ...prev]);
    });

    return () => unsubscribe();
  }, [targetId]);

  // ── Mark as read ──
  useEffect(() => {
    messages.forEach(m => {
      if (m.senderId !== user.id && m.status !== 'READ') {
        chatService.markAsRead(m.id);
        m.status = 'READ';
      }
    });
  }, [messages, user.id]);

  const handleSend = () => {
    if (!input.trim()) return;
    const success = isGlobal
      ? chatService.sendGlobal(input.trim(), replyingTo)
      : chatService.sendDirect(targetId, input.trim(), replyingTo);
    if (success) { setInput(''); setReplyingTo(null); }
  };

  const handleAvatarPress = (userId) => {
    if (userId === user.id) return;
    setProfileTargetId(userId);
    setProfileVisible(true);
  };

  const handleStartDirectChat = (pId, pName) => {
    setProfileVisible(false);
    if (onStartDirectChat) setTimeout(() => onStartDirectChat(pId, pName), 100);
  };

  // ─────────────────────────────────────────────────────────
  // RENDER MESSAGE
  // ─────────────────────────────────────────────────────────
  const renderMessage = ({ item, index }) => {
    const isMe   = item.senderId === user.id;
    const timeStr = formatTime(item.timestamp);
    const isRead = item.status === 'READ';
    const isDelivered = item.status === 'DELIVERED';

    // Avatar: show only for first message in a group from same sender
    const nextItem = messages[index - 1]; // FlatList is inverted
    const showAvatar = !isMe && (!nextItem || nextItem.senderId !== item.senderId);

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>

        {/* Avatar column (left side only) */}
        {!isMe && (
          <TouchableOpacity onPress={() => handleAvatarPress(item.senderId)} activeOpacity={0.8}
            style={[styles.avatarSlot, !showAvatar && styles.avatarHidden]}>
            {item.senderImage ? (
              <Image source={{ uri: item.senderImage }} style={[styles.avatar, { borderColor: C.border }]} />
            ) : (
              <LinearGradient colors={[C.accent, C.accentSoft]} style={styles.avatar}>
                <Text style={styles.avatarInit}>{(item.senderName || '?')[0].toUpperCase()}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}

        {/* Bubble column */}
        <TouchableOpacity
          style={[styles.bubbleCol, isMe ? styles.bubbleColMe : styles.bubbleColThem]}
          activeOpacity={0.85}
          onLongPress={() => setReplyingTo(item)}
        >
          {/* Sender name (global room only, other person) */}
          {isGlobal && !isMe && (
            <Text style={[styles.senderLabel, { color: C.accentSoft }]}>{item.senderName}</Text>
          )}

          {isMe ? (
            <LinearGradient
              colors={[C.bubbleMe1, C.bubbleMe2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMe, { shadowColor: C.accentGlow }]}
            >
              {/* Reply snippet */}
              {item.replyToId && (
                <View style={[
                  styles.replySnippet,
                  { backgroundColor: 'rgba(255,255,255,0.15)', borderLeftColor: 'rgba(255,255,255,0.7)' }
                ]}>
                  <Text style={[styles.replySnippetName, { color: 'rgba(255,255,255,0.9)' }]}
                    numberOfLines={1}>{item.replyToSenderName}</Text>
                  <Text style={[styles.replySnippetText, { color: 'rgba(255,255,255,0.8)' }]}
                    numberOfLines={2}>{item.replyToContent}</Text>
                </View>
              )}
              
              <Text style={[styles.bubbleText, { color: '#FFFFFF' }]}>{item.content}</Text>

              {/* Time + ticks */}
              <View style={styles.metaRow}>
                <Text style={[styles.metaTime, { color: 'rgba(255,255,255,0.6)' }]}>{timeStr}</Text>
                {/* Double tick = delivered/read, single = sent */}
                <View style={styles.tickIcon}>
                  {isRead ? (
                    // Blue double tick = read
                    <Icon name="check-double" size={13} color="#93C5FD" />
                  ) : isDelivered ? (
                    // White double tick = delivered
                    <Icon name="check-double" size={13} color="rgba(255,255,255,0.6)" />
                  ) : (
                    // Single tick = sent
                    <Icon name="check" size={13} color="rgba(255,255,255,0.6)" />
                  )}
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleThem, {
              backgroundColor: C.bubbleThem,
              borderColor: C.replyBorder,
              shadowColor: isDark ? '#000' : '#C7D2E0',
            }]}>
              {/* Reply snippet */}
              {item.replyToId && (
                <View style={[
                  styles.replySnippet,
                  { backgroundColor: isDark ? 'rgba(108,99,255,0.08)' : '#EEF0F8', borderLeftColor: C.accent }
                ]}>
                  <Text style={[styles.replySnippetName, { color: C.accentSoft }]}
                    numberOfLines={1}>{item.replyToSenderName}</Text>
                  <Text style={[styles.replySnippetText, { color: C.muted }]}
                    numberOfLines={2}>{item.replyToContent}</Text>
                </View>
              )}
              
              <Text style={[styles.bubbleText, { color: C.text }]}>{item.content}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaTime, { color: C.muted }]}>{timeStr}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : STATUS_BAR_H}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={[C.bg, C.bg]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── HEADER ───────────────────────────────────────── */}
      <BlurView intensity={isDark ? 50 : 90} tint={isDark ? 'dark' : 'light'} style={styles.headerBlur}>
        <View style={[styles.header, { paddingTop: STATUS_BAR_H + 12, borderBottomColor: C.border }]}>

          {/* Back */}
          <TouchableOpacity onPress={onBack} style={[styles.iconBtn, { borderColor: C.border, backgroundColor: C.surface }]}>
            <Icon name="back" size={18} color={C.text} />
          </TouchableOpacity>

          {/* Avatar + name */}
          <TouchableOpacity onPress={() => handleAvatarPress(targetId)} activeOpacity={0.85} style={styles.headerCenter}>
            <View style={styles.headerAvatarWrap}>
              <LinearGradient colors={[C.accent, C.accentSoft]} style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{chatTitle ? chatTitle[0].toUpperCase() : '?'}</Text>
              </LinearGradient>
              {/* Online indicator */}
              {(!isGlobal && isOnline) && (
                <View style={[styles.onlineDot, { backgroundColor: C.green, borderColor: C.bg }]} />
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: C.text }]} numberOfLines={1}>{chatTitle}</Text>
              {isGlobal
                ? <Text style={[styles.headerSub, { color: C.accentSoft }]}>Public Room</Text>
                : <Text style={[styles.headerSub, { color: isOnline ? C.green : C.muted }]}>{isOnline ? 'Online' : 'Offline'}</Text>}
            </View>
          </TouchableOpacity>

        </View>
      </BlurView>

      {/* ── MESSAGES LIST ────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
        renderItem={renderMessage}
        contentContainerStyle={[styles.listContent, { paddingBottom: replyingTo ? 180 : 120 }]}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* ── REPLY BANNER ─────────────────────────────────── */}
      {replyingTo && (
        <BlurView intensity={isDark ? 60 : 90} tint={isDark ? 'dark' : 'light'} style={[styles.replyBanner, { borderTopColor: C.border }]}>
          <View style={[styles.replyBar, { backgroundColor: C.accent }]} />
          <View style={styles.replyInfo}>
            <Text style={[styles.replyName, { color: C.accentSoft }]}>{replyingTo.senderName}</Text>
            <Text style={[styles.replyText, { color: C.muted2 }]} numberOfLines={1}>{replyingTo.content}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.replyClose}>
            <Icon name="close" size={18} color={C.muted2} />
          </TouchableOpacity>
        </BlurView>
      )}

      {/* ── INPUT AREA ───────────────────────────────────── */}
      <BlurView intensity={isDark ? 50 : 90} tint={isDark ? 'dark' : 'light'} style={styles.inputBlur}>
        <View style={styles.inputRow}>

          <View style={[styles.inputBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder={replyingTo ? `Reply to ${replyingTo.senderName}…` : 'Type a message…'}
              placeholderTextColor={C.muted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity 
            onPress={handleSend} 
            activeOpacity={0.85}
            disabled={!input.trim()}
          >
            <LinearGradient
              colors={input.trim() ? [C.accent, C.accentSoft] : [C.surface, C.surface]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[
                styles.roundBtn, 
                styles.sendBtn, 
                { shadowColor: input.trim() ? C.accentGlow : 'transparent', borderColor: input.trim() ? 'transparent' : C.border }
              ]}
            >
              <Icon name="forward" size={17} color={input.trim() ? "#FFFFFF" : C.muted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Profile modal */}
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        targetUserId={profileTargetId}
        onStartChat={isGlobal ? handleStartDirectChat : undefined}
        showMessageButton={isGlobal}
      />
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 , marginTop:-12},

  // ── Header ──
  headerBlur: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontFamily: FONTS.displayBold || FONTS.displayMedium, fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  onlineDot: {
    width: 11, height: 11, borderRadius: 5.5,
    position: 'absolute', bottom: 0, right: 0,
    borderWidth: 2,
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerName: { fontFamily: FONTS.displayMedium, fontSize: 16, fontWeight: '600', marginBottom: 1 },
  headerSub:  { fontFamily: FONTS.body, fontSize: 11, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Messages ──
  listContent: {
    paddingHorizontal: 14,
    paddingTop: STATUS_BAR_H + 80,   // clear the header
  },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, width: '100%' },
  msgRowMe:   { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },

  avatarSlot: { marginRight: 8, width: 32 },
  avatarHidden: { opacity: 0 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontFamily: FONTS.displayMedium, fontSize: 13, color: '#FFFFFF', fontWeight: '700' },

  bubbleCol:    { maxWidth: '74%', flexDirection: 'column' },
  bubbleColMe:  { alignItems: 'flex-end' },
  bubbleColThem:{ alignItems: 'flex-start' },

  senderLabel: { fontFamily: FONTS.displayMedium, fontSize: 11, fontWeight: '600', marginBottom: 3, marginLeft: 4 },

  // Reply snippet inside a bubble
  replySnippet: {
    borderLeftWidth: 3, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    marginBottom: 6, maxWidth: 220,
  },
  replySnippetName: { fontFamily: FONTS.displayMedium, fontSize: 11, fontWeight: '600', marginBottom: 1 },
  replySnippetText: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 16 },

  // Bubble shapes
  bubble: { paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: {
    borderRadius: 20, borderBottomRightRadius: 4,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
  },
  bubbleThem: {
    borderRadius: 20, borderBottomLeftRadius: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  bubbleText: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 21 },

  // Time + tick
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  metaTime: { fontFamily: FONTS.body, fontSize: 10 },
  tickIcon: {},

  // ── Reply Banner ──
  replyBanner: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 96 : 76,
    left: 0, right: 0, zIndex: 9,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1,
  },
  replyBar: { width: 3, height: 38, borderRadius: 2, marginRight: 10 },
  replyInfo: { flex: 1, minWidth: 0 },
  replyName: { fontFamily: FONTS.displayMedium, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  replyText: { fontFamily: FONTS.body, fontSize: 12 },
  replyClose: { padding: 6 },

  // ── Input ──
  inputBlur: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    paddingTop: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  roundBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtn: {
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8,
    borderWidth: 0,
  },
  inputBox: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    borderWidth: 1, borderRadius: 24,
    paddingLeft: 14, paddingRight: 8, paddingVertical: 6,
    minHeight: 44,
  },
  input: {
    flex: 1, fontFamily: FONTS.body, fontSize: 14, lineHeight: 20,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    maxHeight: 100,
  },
  emojiBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },

  // ── Typing dots ──
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 2 },
  typingDot:  { width: 7, height: 7, borderRadius: 3.5 },
});