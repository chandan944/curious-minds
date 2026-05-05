import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, Platform, Modal, 
  TextInput, KeyboardAvoidingView, ScrollView, Animated, Dimensions, Keyboard, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../components/ui/Icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONTS, RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PdfViewerScreen({ url, title, onBack }) {
  const { theme, isDark } = useTheme();

  // ----- STATES -----
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Stopwatch & Pomodoro State
  const [timeSpent, setTimeSpent] = useState(0); 
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 mins
  const [isTiming, setIsTiming] = useState(true);
  
  // Eye-Care State
  const [isEyeCare, setIsEyeCare] = useState(false);
  
  // Notes State
  const [notesVisible, setNotesVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState('');

  // AI Assistant State
  const [aiVisible, setAiVisible] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { id: 1, role: 'ai', text: 'Hi! I am your AI reading assistant. Ask me anything about this book!' }
  ]);

  const bg = theme?.bg?.base || '#08090F';
  const txt = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  const cardBg = theme?.bg?.card || '#1C1D26';

  // ----- EFFECTS -----
  useEffect(() => {
    loadNotes();
  }, [title]);

  useEffect(() => {
    let interval;
    if (isTiming) {
      interval = setInterval(() => {
        if (isPomodoro) {
          setPomodoroTime((prev) => {
            if (prev <= 1) {
              setIsTiming(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimeSpent((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming, isPomodoro]);

  // ----- HANDLERS -----
  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(`@notes_${title}`);
      if (saved !== null) {
        setNotes(saved);
        setLastSaved('Loaded');
      }
    } catch(e) {}
  };

  const saveNotes = async (text) => {
    setNotes(text);
    try {
      await AsyncStorage.setItem(`@notes_${title}`, text);
      const now = new Date();
      setLastSaved(`Saved at ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    } catch(e) {}
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleTimer = () => setIsTiming(!isTiming);

  const insertBullet = () => {
    saveNotes(notes + (notes.length > 0 && !notes.endsWith('\n') ? '\n• ' : '• '));
  };
  
  const insertHighlight = () => {
    saveNotes(notes + (notes.length > 0 && !notes.endsWith('\n') ? '\n💡 ' : '💡 '));
  };

  const handleExportNotes = async () => {
    try {
      await Share.share({
        message: `My Smart Notes for "${title}":\n\n${notes}`,
      });
    } catch (error) {}
  };

  const handleAskAI = () => {
    if (!aiInput.trim()) return;
    const newMsg = { id: Date.now(), role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, newMsg]);
    setAiInput('');
    
    // Mock response
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: 'That is a great question! Based on this book, it suggests focusing on core fundamentals and applying them consistently.'
      }]);
    }, 1500);
  };

  const viewerUrl = Platform.OS === 'android' 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : url;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      
      {/* HEADER */}
      {!isFullscreen && (
        <View style={[styles.header, { borderBottomColor: border, backgroundColor: bg }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="back" size={24} color={txt} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            
          </View>

          {/* Stopwatch */}
          <TouchableOpacity 
            style={[
              styles.stopwatchBtn, 
              { backgroundColor: isTiming ? accent + '20' : cardBg, borderColor: border }
            ]}
            onPress={toggleTimer}
            onLongPress={() => {
              setIsPomodoro(!isPomodoro);
              if (!isPomodoro) setPomodoroTime(25 * 60);
            }}
          >
            <Icon name="clock" size={14} color={isTiming ? accent : txtM} />
            <Text style={[styles.timerText, { color: isTiming ? accent : txt }]}>
              {isPomodoro ? formatTime(pomodoroTime) : formatTime(timeSpent)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PDF VIEWER */}
      <View style={styles.webviewContainer}>
        {isEyeCare && (
          <View style={styles.eyeCareOverlay} pointerEvents="none" />
        )}
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          onContextMenu={(event) => event.preventDefault()}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={`
            (function() {
              function hidePopout() {
                var popoutBtn = document.querySelector('.ndfHFb-c4YZDc-Wrql6b');
                if (popoutBtn) popoutBtn.style.display = 'none';
                
                var allDivs = document.querySelectorAll('div[title="Pop-out"], a[target="_blank"]');
                for (var i = 0; i < allDivs.length; i++) {
                  allDivs[i].style.display = 'none';
                }
              }
              setInterval(hidePopout, 500);
              hidePopout();
            })();
            true;
          `}
          onShouldStartLoadWithRequest={(request) => {
            // Allow the initial viewer URL or the direct PDF URL to load
            if (request.url.startsWith('https://docs.google.com/viewer') || request.url === url) {
              // Block if it's the docs URL but not embedded
              if (request.url.includes('docs.google.com') && !request.url.includes('embedded=true')) {
                return false;
              }
              return true;
            }
            // Block all other navigations (e.g., clicking the pop-out)
            return false;
          }}
        />
      </View>

      {/* FLOATING ACTION BUTTONS */}
      {!isFullscreen ? (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={[styles.fabCircle, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => setIsEyeCare(!isEyeCare)}
          >
            <Text style={{ fontSize: 20 }}>{isEyeCare ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.fabRect, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => setIsFullscreen(true)}
          >
            <Text style={[styles.fabText, { color: txtM }]}>Focus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.fabRectMain, { backgroundColor: accent, shadowColor: accent }]}
            onPress={() => setNotesVisible(true)}
          >
            <Text style={[styles.fabTextMain, { color: '#FFF' }]}>Notes</Text>
          </TouchableOpacity>

        
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.fabExitFullscreen, { backgroundColor: cardBg, borderColor: border }]}
          onPress={() => setIsFullscreen(false)}
        >
          <Icon name="cross" size={20} color={txt} />
        </TouchableOpacity>
      )}

      {/* PREMIUM SMART NOTES MODAL */}
      <Modal
        visible={notesVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotesVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <BlurView intensity={isDark ? 90 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { Keyboard.dismiss(); setNotesVisible(false); }} />
          
          <View style={[styles.notesPanel, { backgroundColor: bg, borderColor: border }]}>
            
            {/* Notes Header */}
            <View style={[styles.notesHeader, { borderBottomColor: border }]}>
              <View style={styles.notesHeaderLeft}>
                
                <View>
                  <Text style={[styles.notesTitle, { color: txt }]}>Smart Notes</Text>
                  <Text style={[styles.notesSub, { color: txtM }]}>{lastSaved || 'Start typing...'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setNotesVisible(false); }} style={[styles.closeBtn, { backgroundColor: cardBg }]}>
                <Icon name="cross" size={14} color={txt} />
              </TouchableOpacity>
            </View>

            {/* Quick Format Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity style={[styles.toolBtn, { backgroundColor: cardBg, borderColor: border }]} onPress={insertBullet}>
                <Text style={{ color: txt, fontSize: 16 }}>•</Text>
                <Text style={[styles.toolText, { color: txtM }]}>Bullet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toolBtn, { backgroundColor: cardBg, borderColor: border }]} onPress={insertHighlight}>
                <Text style={{ color: txt, fontSize: 16 }}>💡</Text>
                <Text style={[styles.toolText, { color: txtM }]}>Idea</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              
            </View>

            {/* Rich Input Area */}
            <ScrollView style={styles.inputScroll} showsVerticalScrollIndicator={false}>
              <TextInput
                style={[styles.notesInput, { color: txt }]}
                value={notes}
                onChangeText={saveNotes}
                placeholder="Capture your brilliant thoughts here..."
                placeholderTextColor={txtM}
                multiline
                autoFocus
                textAlignVertical="top"
                selectionColor={accent}
              />
            </ScrollView>

          </View>
        </KeyboardAvoidingView>
      </Modal>



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
  },
  stopwatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  timerText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    alignItems: 'flex-end',
    gap: 12,
  },
  fabRect: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabRectMain: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },
  fabTextMain: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
  },
  fabExitFullscreen: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    opacity: 0.8,
  },
  
  // Premium Notes Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  notesPanel: {
    height: height * 0.75, // Taller for better writing
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    marginBottom: 2,
  },
  notesSub: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 10,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  toolText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  inputScroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  notesInput: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
    paddingBottom: 40,
    paddingTop: SPACING.sm,
  },
  
  // Premium Features Additions
  eyeCareOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 147, 41, 0.15)', // Warm orange tint
    zIndex: 5,
  },
  fabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiFabBtn: {
    borderRadius: RADIUS.full,
    elevation: 8,
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  aiFabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiFabText: {
    color: '#FFF',
    fontFamily: FONTS.displayBold,
    fontSize: 16,
  },
  chatScroll: {
    flex: 1,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    backgroundColor: '#7B6FFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.md,
    borderTopWidth: 1,
    gap: 12,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
