import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ScrollView,
  Platform, StatusBar, Switch, InteractionManager, Alert, Linking,
  Modal, TextInput
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
const APP_VERSION = '1.0.0';
const PRIVACY_URL = 'https://chandan944.github.io/privacy-policy';
const SUPPORT_EMAIL = 'chandanprajapati6307@gmail.com';

export default function SettingsScreen({ onBack, onOpenPrivacyPolicy }) {
  const { theme, isDark } = useTheme();
  const { user, logout, updateAvatar } = useAuth();

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

  const [isPrivate, setIsPrivate] = useState(!!user?.isPrivateProfile);
  
  // Custom Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Avatar Picker State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarOffset, setAvatarOffset] = useState(0);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account & All Data',
      'WARNING: If you delete your account, you will no longer be able to access your data. This will permanently erase your XP, level, friends, and chat history. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => {
            setDeleteInput('');
            setShowDeleteModal(true);
          }
        }
      ]
    );
  };

  const executeDeletion = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/auth/delete-account');
      await logout(true);
    } catch (e) {
      setShowDeleteModal(false);
      Alert.alert(
        'Request Sent',
        `Your deletion request has been received. If you face any issues, email us at ${SUPPORT_EMAIL}`,
        [{ text: 'OK', onPress: () => logout(true) }]
      );
    }
  };
  const handleTogglePrivacy = async (value) => {
    setIsPrivate(value);
    try {
      await api.put('/auth/privacy', { isPrivateProfile: value });
    } catch (e) {
      setIsPrivate(!value);
      Alert.alert('Error', 'Failed to update privacy settings.');
    }
  };

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
          <TouchableOpacity 
            style={{ position: 'relative' }} 
            onPress={() => { setAvatarOffset(0); setShowAvatarModal(true); }}
            activeOpacity={0.8}
          >
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={[styles.profileAvatar, { borderColor: accent }]} />
            ) : (
              <View style={[styles.profileAvatarPh, { borderColor: accent, backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}>
                <Text style={[styles.profileInit, { color: accent }]}>{(user?.name || '?')[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: accent, borderRadius: 12, padding: 4, borderWidth: 2, borderColor: isDark ? '#1C1D26' : '#FFFFFF' }}>
              <Icon name="edit" size={10} color="#FFF" />
            </View>
          </TouchableOpacity>
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

          <View style={[styles.settingDivider, { backgroundColor: border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="lock" size={18} color={accent} />
              <Text style={[styles.settingLabel, { color: txt1 }]}>Private Profile</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={handleTogglePrivacy}
              trackColor={{ false: '#374151', true: accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── Legal & Support ────────────────────── */}
        <Text style={[styles.sectionTitle, { color: txtM }]}>Legal & Support</Text>

        <View style={[styles.settingsGroup, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>

          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => Linking.openURL(`whatsapp://send?phone=916307663592&text=*Hi* 👋,%20I%20need%20help%20with%20Curious%20Minds.I%20am%20facing%20a%20problem%20related%20to%20`).catch(() => {
              Alert.alert('WhatsApp Not Found', 'Could not open WhatsApp. Please make sure it is installed.');
            })}
          >
            <View style={styles.settingLeft}>
              <Icon name="send" size={18} color={accent} />
              <Text style={[styles.settingLabel, { color: txt1 }]}>Get Help</Text>
            </View>
            <Icon name="chevron-right" size={16} color={txtM} />
          </TouchableOpacity>
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

        {/* ── Delete Account (Play Store Required) ── */}
        <TouchableOpacity 
          onPress={handleDeleteAccount}
          style={[styles.deleteBtn, { borderColor: border }]}
          activeOpacity={0.8}
        >
          <Icon name="trash" size={16} color={txtM} />
          <Text style={[styles.deleteText, { color: txtM }]}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: txtM }]}>Curious Minds v{APP_VERSION}</Text>
      </ScrollView>

      {/* ── Avatar Picker Modal ── */}
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border, alignItems: 'center' }]}>
            <Text style={[styles.modalTitle, { color: txt1, marginBottom: 20 }]}>Choose Avatar</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 30 }}>
              <TouchableOpacity 
                style={{ padding: 10, backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB', borderRadius: 20 }}
                onPress={() => setAvatarOffset(prev => prev - 1)}
              >
                <Icon name="back" size={24} color={txt1} />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: `https://api.dicebear.com/9.x/adventurer/png?seed=${user?.id}_${avatarOffset}` }}
                style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: accent }}
              />

              <TouchableOpacity 
                style={{ padding: 10, backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB', borderRadius: 20 }}
                onPress={() => setAvatarOffset(prev => prev + 1)}
              >
                <Icon name="play" size={24} color={txt1} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}
                onPress={() => setShowAvatarModal(false)}
                disabled={isSavingAvatar}
              >
                <Text style={[styles.modalBtnText, { color: txt1 }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: accent }]}
                onPress={async () => {
                  setIsSavingAvatar(true);
                  const newUrl = `https://api.dicebear.com/9.x/adventurer/png?seed=${user?.id}_${avatarOffset}`;
                  try {
                    await api.put('/auth/avatar', { imageUrl: newUrl });
                    await updateAvatar(newUrl);
                    setShowAvatarModal(false);
                  } catch (e) {
                    Alert.alert('Error', 'Failed to update avatar');
                  }
                  setIsSavingAvatar(false);
                }}
                disabled={isSavingAvatar}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>
                  {isSavingAvatar ? 'Saving...' : 'Save Avatar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Deletion Modal ── */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1D26' : '#FFFFFF', borderColor: border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalWarningIcon}>
                <Icon name="alert-triangle" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.modalTitle, { color: txt1 }]}>Final Confirmation</Text>
            </View>
            
            <Text style={[styles.modalText, { color: txtM }]}>
              This action is completely irreversible. To confirm you want to permanently delete your account, please type <Text style={{ color: '#EF4444', fontFamily: FONTS.displayMedium }}>DELETE</Text> below.
            </Text>

            <TextInput
              style={[styles.modalInput, { color: txt1, borderColor: border, backgroundColor: bg }]}
              value={deleteInput}
              onChangeText={setDeleteInput}
              placeholder="Type DELETE"
              placeholderTextColor={txtM}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: isDark ? '#2A2C3A' : '#E5E7EB' }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.modalBtnText, { color: txt1 }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  { backgroundColor: '#EF4444', flex: 1.5 },
                  (deleteInput.trim() !== 'DELETE' || isDeleting) && { opacity: 0.5 }
                ]}
                onPress={executeDeletion}
                disabled={deleteInput.trim() !== 'DELETE' || isDeleting}
              >
                <Text style={styles.modalBtnTextRed}>
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  logoutText: { fontFamily: FONTS.displayMedium, fontSize: 15, color: '#EF4444' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1,
    marginBottom: 24,
  },
  deleteText: { fontFamily: FONTS.bodyMedium, fontSize: 13 },

  version: { fontFamily: FONTS.body, fontSize: 12, textAlign: 'center' },

  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalWarningIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
  },
  modalText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalInput: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },
  modalBtnTextRed: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
