import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../constants/theme';
import Icon from '../components/ui/Icons';

const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight || 36) + 10 : 0;


const SUPPORT_EMAIL = 'chandanprajapati6307@gmail.com';
const LAST_UPDATED = 'May 11, 2026';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `When you use Curious Minds, we collect the following information:

• **Account Information**: Your Google account name, email address, and profile photo (used for login and social features).
• **Usage Data**: Quiz scores, progress data, reading history, streaks, and XP points (used to personalize your learning experience).
• **Social Data**: Friend connections, chat messages, and likes (used for the social features you opt into).
• **Device Information**: Device type and operating system version (used for crash prevention and compatibility).

We do NOT collect any financial, location, health, or biometric data.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to:

• Provide and maintain the educational service.
• Track your learning progress and streaks.
• Enable social features (friends, chat, leaderboard).
• Send push notifications (only if you grant permission).
• Improve app stability and fix bugs.

We never sell your personal information to third parties.`,
  },
  {
    title: '3. AI-Generated Content',
    content: `Curious Minds contains educational content that was generated with AI assistance, including facts, quiz questions, and learning modules. All AI-generated content has been reviewed for accuracy and age-appropriateness. The educational ebooks available in the app are curated by our team.`,
  },
  {
    title: '4. Data Storage & Security',
    content: `• Your data is stored securely on our servers using industry-standard encryption (HTTPS/TLS).
• Authentication tokens are stored locally on your device using encrypted storage.
• Learning progress is stored both locally (for offline access) and on our servers (for sync).
• We implement reasonable security measures to protect your data from unauthorized access.`,
  },
  {
    title: '5. Third-Party Services',
    content: `We use the following third-party services:

• **Google Sign-In**: For authentication (governed by Google's Privacy Policy).
• **Expo Push Notifications**: For sending learning reminders.
• **Google Docs Viewer**: For rendering PDF ebooks within the app.

Each third-party service has its own privacy policy. We encourage you to review them.`,
  },
  {
    title: '6. Children\'s Privacy',
    content: `Curious Minds is designed as an educational app suitable for all ages. We do not knowingly collect personal information from children under 13 without parental consent. If you are a parent or guardian and believe your child has provided personal information, please contact us and we will delete it promptly.`,
  },
  {
    title: '7. Data Deletion',
    content: `You can request deletion of your account and all associated data at any time:

• Open the app → Settings → Delete Account.
• Or email us at ${SUPPORT_EMAIL}.

⚠️ **WARNING**: Account deletion is completely irreversible. If you delete your account, you will permanently lose access to all your learning progress, XP points, friends, and chat history. This data cannot be recovered.

Upon deletion, all your personal data, progress, and social connections will be permanently removed within 30 days.`,
  },
  {
    title: '8. Your Rights',
    content: `You have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your account and data.
• Opt out of push notifications via device settings.
• Export your learning progress data.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this privacy policy from time to time. We will notify you of any material changes via in-app notification or email. Continued use of the app after changes constitutes acceptance of the updated policy.`,
  }
];

export default function PrivacyPolicyScreen({ onBack }) {
  const { theme, isDark } = useTheme();

  const bg = theme?.bg?.base || '#08090F';
  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  const cardBg = theme?.bg?.card || '#1C1D26';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: border, backgroundColor: cardBg }]}>
          <Icon name="back" size={20} color={txt1} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: txt1 }]}>Privacy Policy</Text>
        <TouchableOpacity 
          onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})} 
          style={[styles.backBtn, { borderColor: border, backgroundColor: cardBg }]}
        >
          <Icon name="globe" size={18} color={accent} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Banner */}
        <View style={[styles.banner, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={styles.bannerEmoji}>🛡️</Text>
          <Text style={[styles.bannerTitle, { color: txt1 }]}>Your Privacy Matters</Text>
          <Text style={[styles.bannerSub, { color: txtM }]}>
            Curious Minds is committed to protecting your personal information.
          </Text>
          <Text style={[styles.updated, { color: accent }]}>Last Updated: {LAST_UPDATED}</Text>
        </View>

        {/* Policy Sections */}
        {SECTIONS.map((section, index) => (
          <View key={index} style={[styles.section, { borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: txt1 }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: txtM }]}>{section.content}</Text>
          </View>
        ))}

        

        <Text style={[styles.footer, { color: txtM }]}>
          © 2026 Curious Minds. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: FONTS.display, fontSize: 20 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },

  // Banner
  banner: {
    alignItems: 'center',
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: 24,
  },
  bannerEmoji: { fontSize: 40, marginBottom: 12 },
  bannerTitle: { fontFamily: FONTS.displayBold, fontSize: 20, marginBottom: 6 },
  bannerSub: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  updated: { fontFamily: FONTS.bodyMedium, fontSize: 12 },

  // Sections
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    marginBottom: 10,
  },
  sectionContent: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },

  // Contact
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 20,
  },
  contactText: { fontFamily: FONTS.displayMedium, fontSize: 14 },

  footer: {
    fontFamily: FONTS.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});
