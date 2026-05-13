// ─────────────────────────────────────────────
//  LoginScreen.jsx — Google OAuth Login
//  Styled to match Curious Minds design system
// ─────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Animated,
  Dimensions, StatusBar, Platform, Image, ScrollView, Linking,
} from 'react-native';
import { LinearGradient }     from 'expo-linear-gradient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth }   from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, COLORS } from '../constants/theme';
import Icon from '../components/ui/Icons';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';

const { width, height } = Dimensions.get('window');

// ── Google Client ID (same as backend) ────────
const GOOGLE_WEB_CLIENT_ID =
  '451993711369-jif291jkvlv3b1eoov2m2pvdtgs5f3r1.apps.googleusercontent.com';

// ── Floating ambient orb ───────────────────────
function FloatingOrb({ delay, size, top, left, colors }) {
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -30, duration: 3500 + delay, useNativeDriver: true }),
        Animated.timing(floatY, { toValue:   0, duration: 3500 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { position: 'absolute', top, left, width: size, height: size, transform: [{ translateY: floatY }] },
      ]}
    >
      <LinearGradient colors={colors} style={{ flex: 1, borderRadius: size / 2 }} />
    </Animated.View>
  );
}

// ── Minimal Pill Tag ──────────────────────────
function PillTag({ icon, color, text, delay }) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.spring(translateY,  { toValue: 0, delay, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.pillTag, { opacity, transform: [{ translateY }] }]}>
      <Icon name={icon} size={14} color={color} />
      <Text style={styles.pillText}>{text}</Text>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────
export default function LoginScreen() {
  const { handleGoogleAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Animation refs
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const btnScale    = useRef(new Animated.Value(0.9)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;
  const glowPulse   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configure Google Sign-In — SAME web client ID as the backend
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(btnScale,   { toValue: 1, friction: 7, useNativeDriver: true }),
        Animated.timing(btnOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  // ── Sign-in handler ──────────────────────────
  const handleSignIn = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      // Handle both old and new SDK response shapes
      const user    = result?.data?.user    ?? result?.user    ?? result;
      const idToken = result?.data?.idToken ?? result?.idToken;

      if (!idToken) {
        Alert.alert(
          'Configuration Error',
          'Google did not return an ID token. Please check your Web Client ID and SHA-1 fingerprint in Google Cloud Console.'
        );
        return;
      }

      const authData = {
        idToken,
        email:    user.email,
        name:     user.name || user.givenName || 'User',
        imageUrl: user.photo || user.photoUrl || '',
      };

      const result2 = await handleGoogleAuth(authData);
      if (!result2.success) {
        Alert.alert('Login Failed', result2.message || 'Could not authenticate. Please try again.');
      }

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user dismissed — do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Please wait', 'Sign-in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available. Please update it from the Play Store.');
      } else {
        Alert.alert('Error', error.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showPrivacyPolicy) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicy(false)} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC', '#EFF6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.root}
      >
        {/* Ambient orbs - Light vibrant colors */}
        <FloatingOrb delay={0}    size={250} top={-60}           left={-80}       colors={['rgba(139,92,246,0.15)', 'transparent']} />
        <FloatingOrb delay={600}  size={200} top={height * 0.3}  left={width - 100} colors={['rgba(59,130,246,0.12)', 'transparent']} />
        <FloatingOrb delay={1200} size={160} top={height * 0.6}  left={-40}       colors={['rgba(236,72,153,0.1)', 'transparent']} />
        <FloatingOrb delay={1800} size={140} top={height * 0.8}  left={width - 80} colors={['rgba(16,185,129,0.1)', 'transparent']} />

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* ── Logo section ────────────────────── */}
            <Animated.View style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
              {/* Glow ring */}
              <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

              {/* Brain icon orb */}
              <LinearGradient
                colors={['#FFFFFF', '#F1F5F9']}
                style={styles.logoOrb}
              >
                <Image source={require('../assets/icon.png')} style={styles.logoImage} />
              </LinearGradient>

              <Text style={styles.appName}>Curious Minds</Text>
              <Text style={styles.tagline}>Expand your universe of knowledge</Text>
            </Animated.View>

            {/* ── Pills Section (Minimal features) ── */}
          
          </View>

          {/* ── Auth section ─────────────────────── */}
          <Animated.View style={[styles.authSection, { opacity: btnOpacity, transform: [{ scale: btnScale }] }]}>
            
            {/* ── Privacy Checkbox ──────────────── */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setPolicyAccepted(!policyAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, policyAccepted && styles.checkboxChecked]}>
                {policyAccepted && <Icon name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.disclaimerLink} onPress={() => setShowPrivacyPolicy(true)}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Google button */}
            <TouchableOpacity
              style={[styles.googleBtn, (loading || !policyAccepted) && styles.googleBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading || !policyAccepted}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.googleBtnGrad}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#0F172A" />
                    <Text style={styles.googleBtnText}>Signing you in...</Text>
                  </>
                ) : (
                  <>
                    {/* Google "G" logo */}
                    <View style={styles.googleIconWrap}>
                      <Text style={styles.googleG}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </>
  );
}

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 44;

const styles = StyleSheet.create({
  root:    { flex: 1 },
  content: {
    flexGrow: 1,
    paddingTop:    STATUS_H + 20,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 30 },
  glowRing: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(139,92,246,0.2)',
    top: -20,
  },
  logoOrb: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.6)', // slate-300 with opacity
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    height: 140,
    width: 140,
    borderRadius: 70,
  },
  appName: {
    fontFamily: FONTS.display,
    fontSize: 36,
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  tagline: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: '#64748B',
    letterSpacing: 0.2,
  },

  // Pills
  pillsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pillText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: '#334155',
  },

  // Auth section
  authSection: { alignItems: 'center', marginTop: 40 },

  // Google button
  googleBtn: {
    width: '100%', borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  googleBtnDisabled: { opacity: 0.65 },
  googleBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  googleIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
    lineHeight: 22,
  },
  googleBtnText: {
    flex: 1,
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginRight: 32, // to balance the G icon
  },

  disclaimer: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  disclaimerLink: {
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
  
  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkboxText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
});

