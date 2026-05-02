import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
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

const STATUS_BAR_H = Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 50;

// Time formatter
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatRoomScreen({ onBack, targetId, chatTitle, onStartDirectChat }) {
  const { theme, isDark } = useTheme();
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile Modal State
  const [profileTargetId, setProfileTargetId] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  
  const flatListRef = useRef(null);

  // Colours
  const bg = theme?.bg?.base || '#08090F';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || '#94A3B8';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';

  const isGlobal = targetId === null;

  // ── 1. Fetch History & Connect WS ──────────────────────────────────────────
  useEffect(() => {
    const initChat = async () => {
      try {
        const endpoint = isGlobal ? '/chat/global' : `/chat/direct/${targetId}`;
        const res = await api.get(endpoint);
        setMessages(res.data.content || []);
      } catch (e) {
        console.warn('Failed to fetch chat history', e?.message);
      } finally {
        setLoading(false);
      }

      if (token) {
        chatService.connect(token);
      }
    };

    initChat();

    const unsubscribe = chatService.addListener((msg) => {
      if (msg.type === 'READ_RECEIPT') {
        setMessages(prev => prev.map(m => 
          m.id === msg.messageId ? { ...m, status: 'READ' } : m
        ));
        return;
      }

      if (isGlobal && msg.target !== 'GLOBAL') return;
      if (!isGlobal) {
        if (msg.target !== 'GLOBAL' && 
            msg.senderId !== targetId && 
            msg.target !== targetId.toString() && 
            msg.senderId !== user.id) {
          return;
        }
      }

      setMessages(prev => [msg, ...prev]);
    });

    return () => unsubscribe();
  }, [targetId]);

  // Mark incoming messages as read
  useEffect(() => {
    messages.forEach(m => {
      if (m.senderId !== user.id && m.status !== 'READ') {
        chatService.markAsRead(m.id);
        m.status = 'READ'; // Optimistic local mute to prevent spamming
      }
    });
  }, [messages, user.id]);

  // ── 2. Sending Messages ──────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim()) return;

    const success = isGlobal 
      ? chatService.sendGlobal(input.trim())
      : chatService.sendDirect(targetId, input.trim());
      
    if (success) {
      setInput('');
    }
  };

  // ── 3. Profile Viewing ───────────────────────────────────────────────────
  const handleAvatarPress = (userId) => {
    if (userId === user.id) return;
    setProfileTargetId(userId);
    setProfileVisible(true);
  };

  const handleStartDirectChat = (pId, pName) => {
    setProfileVisible(false);
    if (onStartDirectChat) {
      setTimeout(() => onStartDirectChat(pId, pName), 100);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.id;
    const timeStr = formatTime(item.timestamp);

    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <TouchableOpacity onPress={() => handleAvatarPress(item.senderId)} activeOpacity={0.8} style={styles.avatarContainer}>
            {item.senderImage ? (
              <Image source={{ uri: item.senderImage }} style={[styles.msgAvatar, { borderColor: border }]} />
            ) : (
              <View style={[styles.msgAvatarPh, { borderColor: border, backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}>
                <Text style={[styles.msgAvatarInit, { color: txt1 }]}>{(item.senderName || '?')[0]}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.bubbleContainer}>
          {isMe ? (
            <LinearGradient
              colors={[accent, accent + 'CC']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.msgBubble, styles.msgBubbleMe]}
            >
              <Text style={[styles.msgText, { color: '#FFFFFF' }]}>{item.content}</Text>
              <View style={styles.timeTickRow}>
                {timeStr ? <Text style={[styles.msgTime, { color: 'rgba(255,255,255,0.7)' }]}>{timeStr}</Text> : null}
                <View style={{ marginLeft: 4 }}>
                  <Icon 
                    name={item.status === 'READ' ? 'check-double' : (item.status === 'DELIVERED' ? 'check-double' : 'check')} 
                    size={14} 
                    color={item.status === 'READ' ? '#38BDF8' : 'rgba(255,255,255,0.6)'} 
                  />
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.msgBubble, styles.msgBubbleThem(isDark, border)]}>
              <Text style={[styles.msgText, { color: txt1 }]}>{item.content}</Text>
              {timeStr ? (
                <View style={styles.timeTickRow}>
                  <Text style={[styles.msgTime, { color: txtM }]}>{timeStr}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.root, { backgroundColor: bg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : STATUS_BAR_H}
    >
      {/* ── Top Bar ───────────────────────────────── */}
      <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={styles.headerBlur}>
        <View style={[styles.topBar, { paddingTop: STATUS_BAR_H, borderBottomColor: border }]}>
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: isDark ? 'rgba(28,29,38,0.7)' : 'rgba(255,255,255,0.7)' }]}>
            <Icon name="back" size={20} color={txt1} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.pageTitle, { color: txt1 }]} numberOfLines={1}>{chatTitle}</Text>
            {isGlobal && <Text style={[styles.pageSub, { color: accent }]}>Public Room</Text>}
          </View>
        </View>
      </BlurView>

      {/* ── Messages List ─────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted // Messages render bottom-up
        keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
        renderItem={renderMessage}
        contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* ── Floating Input Area ───────────────────── */}
      <View style={styles.floatingInputWrapper}>
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', 
            borderColor: isDark ? '#2D2E3C' : '#E2E8F0',
            shadowColor: isDark ? '#000' : '#64748B'
          }
        ]}>
          <TextInput
            style={[styles.input, { color: txt1 }]}
            placeholder="Type a message..."
            placeholderTextColor={txtM}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={!input.trim()}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? accent : (isDark ? '#2A2C3A' : '#F1F5F9') }]}
            activeOpacity={0.8}
          >
            <Icon name="forward" size={16} color={input.trim() ? '#FFFFFF' : txtM} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Profile Modal (unified) ─────────────────────────── */}
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

const styles = StyleSheet.create({
  root: { flex: 1, },
  headerBlur: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: SPACING.lg, paddingBottom: 16, paddingTop: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  headerTextWrap: { flex: 1 },
  pageTitle: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 2 },
  pageSub: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  listContent: { 
    paddingHorizontal: SPACING.md, 
    paddingBottom: STATUS_BAR_H + 80, // Pad logical bottom (physical top) for header
    paddingTop: 16 // Pad logical top (physical bottom) near input
  },
  
  msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5, width: '100%' },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },

  avatarContainer: { marginRight: 8, paddingBottom: 4 },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1 },
  msgAvatarPh: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  msgAvatarInit: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  bubbleContainer: { maxWidth: '78%' },
  msgSenderName: { fontFamily: FONTS.displayMedium, fontSize: 12, marginBottom: 4, marginLeft: 4 },
  msgBubble: {
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  msgBubbleMe: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 6,
  },
  msgBubbleThem: (isDark, border) => ({
    backgroundColor: isDark ? 'rgba(28,29,38,0.85)' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : border,
    borderWidth: 1,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 6,
  }),
  msgText: { fontFamily: FONTS.bodyMedium, fontSize: 15, lineHeight: 22 },
  timeTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  msgTime: {
    fontFamily: FONTS.body, fontSize: 10,
  },

  // Floating Input Area
  floatingInputWrapper: {
    paddingHorizontal: SPACING.lg, 
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 8, paddingVertical: 8,
    borderWidth: 1, borderRadius: 30,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontFamily: FONTS.bodyMedium, fontSize: 15,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});
