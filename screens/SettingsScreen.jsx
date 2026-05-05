import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ScrollView,
  Platform, StatusBar, Switch, InteractionManager
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/ui/Icons';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { getLevelForXP } from '../constants/xpSystem';
import { getXP, getStreak } from '../utils/storage';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageToggle from '../components/ui/LanguageToggle';
import api from '../services/api';

const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight || 36) + 10 : 50;

export default function SettingsScreen({ onBack }) {
  const { theme, isDark } = useTheme();
  const { user, logout } = useAuth();

  const bg = theme.bg.base;
  const txt1 = theme.text.primary;
  const txtM = theme.text.muted;
  const accent = theme.accent.primary;
  const border = theme.glass.border;
  const gold = theme.accent.gold;

  // Use global user state synced with backend instead of stale local storage
  const xp = user?.points || 0;
  const streak = user?.streak || 0;

  const level = getLevelForXP(xp);

  const [socialStats, setSocialStats] = useState({
    friends: 0,
    likes: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchSocialData = async () => {
      if (!user?.id) return;
      try {
        const [profileRes, pendingRes] = await Promise.all([
          api.get(`/api/social/profile/${user.id}`),
          api.get('/api/social/requests/pending')
        ]);
        
        setSocialStats({
          friends: profileRes.data.friendCount || 0,
          likes: profileRes.data.likeCount || 0,
          pending: pendingRes.data.length || 0
        });
      } catch (e) {}
    };
    
    const task = InteractionManager.runAfterInteractions(() => {
      fetchSocialData();
    });
    return () => task.cancel();
  }, [user?.id]);

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: 10 }]}>
      {/* ── Top Bar ──────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: isDark ? '#1C1D26' : '#FFFFFF' }]}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: txt1 }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Profile Card ───────────────────────── */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={[styles.profileAvatar, { borderColor: accent }]} />
          ) : (
            <View style={[styles.profileAvatarPh, { borderColor: accent, backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}>
              <Text style={[styles.profileInit, { color: accent }]}>{(user?.name || '?')[0].toUpperCase()}</Text>
              
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: txt1 }]}>{user?.name || 'Explorer'}</Text>
            <Text style={[styles.statSub, { color: txtM }]}>{level.title}</Text>
          </View>
        </View>

        {/* ── Stats Row ──────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <Text style={[styles.statLabel, { color: txtM }]}>Level</Text>
            <Text style={[styles.statVal, { color: accent }]}>{level.level}</Text>
            
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <Text style={[styles.statLabel, { color: txtM }]}>Points</Text>
            <Text style={[styles.statVal, { color: gold }]}>{xp.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <Text style={[styles.statLabel, { color: txtM }]}>Streak</Text>
            <Text style={[styles.statVal, { color: '#FF9F1C' }]}>{streak}</Text>
          </View>
        </View>

        {/* ── Social Stats Row ───────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <Text style={[styles.statLabel, { color: txtM }]}>Friends</Text>
            <Text style={[styles.statVal, { color: accent }]}>{socialStats.friends}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <Text style={[styles.statLabel, { color: txtM }]}>Likes</Text>
            <Text style={[styles.statVal, { color: '#EC4899' }]}>{socialStats.likes}</Text>
          </View>
         
        </View>

        {/* ── Settings Section ───────────────────── */}
        <Text style={[styles.sectionTitle, { color: txtM }]}>Preferences</Text>

        <View style={[styles.settingsGroup, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="settings" size={18} color={accent} />
              <Text style={[styles.settingLabel, { color: txt1 }]}>Dark Mode</Text>
            </View>
            <ThemeToggle size={36} />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="globe" size={18} color={accent} />
              <Text style={[styles.settingLabel, { color: txt1 }]}>Language</Text>
            </View>
            <LanguageToggle size={36} />
          </View>
        </View>

        {/* ── Logout ─────────────────────────────── */}
        <TouchableOpacity 
          onPress={logout}
          style={[styles.logoutBtn, { borderColor: '#EF4444' + '40', backgroundColor: '#EF4444' + '10' }]}
          activeOpacity={0.8}
        >
          <Icon name="power" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: txtM }]}>Curious Minds v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 ,marginTop:-20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontFamily: FONTS.display, fontSize: 22 },

  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: 16,
  },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2 },
  profileAvatarPh: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  profileInit: { fontFamily: FONTS.display, fontSize: 24 },
  profileName: { fontFamily: FONTS.displayMedium, fontSize: 18, marginBottom: 2 },
  profileEmail: { fontFamily: FONTS.body, fontSize: 13 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  statLabel: { fontFamily: FONTS.body, fontSize: 12, marginBottom: 4 },
  statVal: { fontFamily: FONTS.displayMedium, fontSize: 20 },
  statSub: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },

  sectionTitle: { fontFamily: FONTS.displayMedium, fontSize: 14, marginBottom: 12 },

  settingsGroup: { borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontFamily: FONTS.bodyMedium, fontSize: 15 },
  settingDivider: { height: 1, marginHorizontal: 16 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: 24,
  },
  logoutText: { fontFamily: FONTS.displayMedium, fontSize: 15, color: '#EF4444' },

  version: { fontFamily: FONTS.body, fontSize: 12, textAlign: 'center' },
});
