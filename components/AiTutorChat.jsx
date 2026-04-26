// ─────────────────────────────────────────────────────────────
//  AI TUTOR CHAT  — Powered by Gemini 2.0
//  Topic-locked intelligent assistant with rich formatted
//  responses matching TheoryCards visual style.
// ─────────────────────────────────────────────────────────────

import React, {
  useState, useRef, useCallback, useEffect,
} from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Animated, KeyboardAvoidingView, Platform,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../constants/theme';
import { soundTap, soundBadge, soundWhoosh } from '../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from './ui/Icons';
import MarkdownText from './ui/MarkdownText';

const { width } = Dimensions.get('window');

const GEMINI_API_KEY = 'AIzaSyDxUn9Zgulb4-ZBLkF3Q2tIArDbU3dbQXE';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// ── Rate limiter (prevents 429) ───────────────────────────────
const lastRequestTime = { current: 0 };
const canSend = () => {
  const now = Date.now();
  if (now - lastRequestTime.current < 1500) return false;
  lastRequestTime.current = now;
  return true;
};

// ── Suggested quick questions per category ────────────────────
const QUICK_QUESTIONS = [
  'Explain this simply 🧠',
  'Give me a real-life example 🌍',
  'Why does this matter? 💡',
  "What's the formula? 🔢",
  'Quiz me on this! 🎯',
];

// ── Parse AI text into rich structured blocks ─────────────────
function parseAIResponse(text) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Heading: ## Title
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', text: line.slice(3) });
    }
    // Sub-heading: ### or **bold line**
    else if (line.startsWith('### ')) {
      blocks.push({ type: 'subheading', text: line.slice(4) });
    }
    // Bullet
    else if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      blocks.push({ type: 'bullet', text: line.slice(2) });
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'numbered', text: line.replace(/^\d+\.\s/, ''), num: blocks.filter(b => b.type === 'numbered').length + 1 });
    }
    // Formula / code block
    else if (line.startsWith('```') || line.startsWith('`')) {
      const formula = line.replace(/`/g, '').trim();
      if (formula) blocks.push({ type: 'formula', text: formula });
    }
    // Emoji highlight line (starts with emoji)
    else if (/^[\u{1F300}-\u{1FAFF}]/u.test(line)) {
      blocks.push({ type: 'highlight', text: line });
    }
    // Normal paragraph
    else {
      // Merge consecutive paragraph lines
      let para = line;
      while (i + 1 < lines.length && lines[i + 1].trim() &&
        !lines[i + 1].startsWith('##') && !lines[i + 1].startsWith('*') &&
        !lines[i + 1].startsWith('-') && !/^\d+\./.test(lines[i + 1])) {
        i++;
        para += ' ' + lines[i].trim();
      }
      blocks.push({ type: 'paragraph', text: para });
    }
    i++;
  }
  return blocks;
}

// ── Single rendered block inside an AI message ────────────────
function RichBlock({ block, accentColor, isDark, txt1, txt2, txtM }) {
  const colors = {
    heading:    accentColor,
    subheading: '#FFD166',
    bullet:     '#00E5FF',
    numbered:   '#A855F7',
    formula:    '#10B981',
    highlight:  '#FF9F1C',
    paragraph:  txt2,
  };

  if (block.type === 'heading') {
    return (
      <View style={[ss.headingRow, { borderLeftColor: accentColor }]}>
        <Text style={[ss.headingText, { color: accentColor }]}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === 'subheading') {
    return (
      <Text style={[ss.subheadingText, { color: '#FFD166' }]}>{block.text}</Text>
    );
  }

  if (block.type === 'formula') {
    return (
      <View style={[ss.formulaBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)', borderColor: '#10B981' + '40' }]}>
        <Icon name="flask" size={12} color="#10B981" />
        <Text style={[ss.formulaText, { color: '#10B981' }]}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === 'bullet') {
    return (
      <View style={ss.bulletRow}>
        <View style={[ss.bulletDot, { backgroundColor: '#00E5FF' }]} />
        <MarkdownText style={[ss.bulletText, { color: txt2 }]} highlightColor="#FFD166">
          {block.text}
        </MarkdownText>
      </View>
    );
  }

  if (block.type === 'numbered') {
    return (
      <View style={ss.bulletRow}>
        <View style={[ss.numBadge, { backgroundColor: accentColor + '30' }]}>
          <Text style={[ss.numText, { color: accentColor }]}>{block.num}</Text>
        </View>
        <MarkdownText style={[ss.bulletText, { color: txt2 }]} highlightColor="#FFD166">
          {block.text}
        </MarkdownText>
      </View>
    );
  }

  if (block.type === 'highlight') {
    return (
      <View style={[ss.highlightBox, { backgroundColor: '#FF9F1C' + '18', borderLeftColor: '#FF9F1C' }]}>
        <MarkdownText style={[ss.highlightText, { color: '#FF9F1C' }]} highlightColor="#FFD166">
          {block.text}
        </MarkdownText>
      </View>
    );
  }

  // paragraph (default)
  return (
    <MarkdownText style={[ss.paraText, { color: txt2 }]} highlightColor="#FFD166">
      {block.text}
    </MarkdownText>
  );
}

// ── Message Bubble ────────────────────────────────────────────
function MessageBubble({ msg, accentColor, isDark, txt1, txt2, txtM, glass1, border }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 90, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  if (msg.role === 'user') {
    return (
      <Animated.View style={[ss.userBubbleWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={[accentColor + 'CC', accentColor + '88']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={ss.userBubble}
        >
          <Text style={ss.userText}>{msg.text}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  if (msg.role === 'loading') {
    return (
      <Animated.View style={[ss.aiBubbleWrap, { opacity: fadeAnim }]}>
        <View style={[ss.aiBubble, { backgroundColor: glass1, borderColor: border }]}>
          <View style={ss.typingRow}>
            {[0, 150, 300].map((delay, i) => (
              <TypingDot key={i} delay={delay} color={accentColor} />
            ))}
            <Text style={[ss.typingLabel, { color: txtM }]}>Tutor is thinking...</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  const blocks = parseAIResponse(msg.text);

  return (
    <Animated.View style={[ss.aiBubbleWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* AI avatar */}
      <View style={[ss.aiAvatar, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
        <Icon name="robot" size={14} color={accentColor} />
      </View>
      <View style={[ss.aiBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)', borderColor: accentColor + '30' }]}>
        {/* Top accent line */}
        <View style={[ss.aiBubbleAccent, { backgroundColor: accentColor }]} />
        <View style={ss.aiBubbleContent}>
          {blocks.map((block, i) => (
            <RichBlock
              key={i}
              block={block}
              accentColor={accentColor}
              isDark={isDark}
              txt1={txt1}
              txt2={txt2}
              txtM={txtM}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Typing indicator dot ──────────────────────────────────────
function TypingDot({ delay, color }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(bounce, { toValue: -6, tension: 120, friction: 5, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 0, tension: 120, friction: 5, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[ss.typingDot, { backgroundColor: color, transform: [{ translateY: bounce }] }]} />
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AiTutorChat({ topicTitle, topicId, accentColor, onClose }) {
  const { theme, isDark } = useTheme();
  const txt1 = theme.text.primary;
  const txt2 = theme.text.secondary;
  const txtM = theme.text.muted;
  const glass1 = theme.glass.light;
  const glass2 = theme.glass.medium;
  const border = theme.glass.border;

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `🤖 Hey, I'm your **${topicTitle}** Tutor!\n\nAsk me anything about this topic — I'll explain concepts, give examples, and help you understand deeply. I'm *only* here to help with **${topicTitle}**, so let's dive in! 🚀\n\n• Tap a quick question below to start\n• Or type your own question`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Slide in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const buildSystemPrompt = () =>
    `You are a brilliant, enthusiastic AI tutor for the topic: "${topicTitle}" (id: ${topicId}).

RULES:
1. You ONLY answer questions related to "${topicTitle}". If asked anything off-topic, politely redirect back.
2. Use rich formatting in your responses:
   - ** for main headings
   - *for sub-headings  
   - * for bullet points
   - **bold** for key terms
   - *italic* for emphasis
   - Numbered lists (1. 2. 3.) for steps
   - Use emojis liberally to make it engaging 🎯🔥💡⚡
3. Keep responses educational, fun and concise (not too long).
4. Include real-life examples.
5. Celebrate when students show understanding.
6. Target audience: school/college students aged 13-22.
7. End responses with a follow-up question or encouragement.`;

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (!canSend()) {
      console.log("⏳ Too fast, wait...");
      return;
    }

    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');

    const userMsg = { role: 'user', text: trimmed };
    const loadingMsg = { role: 'loading', text: '' };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      let response;
      let retries = 3;
      let delay = 1000;

      while (retries > 0) {
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: {
              role: "user",
              parts: [{ text: buildSystemPrompt() }],
            },
            contents: [
              ...chatHistory,
              { role: "user", parts: [{ text: trimmed }] }
            ],
            generationConfig: {
              temperature: 0.85,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 800,
            },
          }),
        });

        if (response.ok) break;

        // If the error isn't a temporary server issue, fail immediately
        if (response.status !== 503 && response.status !== 500 && response.status !== 429) {
          const errorData = await response.json().catch(() => null);
          const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
          throw new Error(errMsg);
        }

        retries--;
        if (retries === 0) throw new Error(`HTTP ${response.status} (Service Unavailable)`);

        await new Promise(res => setTimeout(res, response.status === 429 ? 2000 : delay));
        delay *= 2;
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I had trouble generating a response. Please try again! 🙏';

      const aiMsg = { role: 'ai', text: aiText };

      setMessages(prev => {
        const updated = [...prev];
        const i = updated.findLastIndex(m => m.role === 'loading');
        if (i !== -1) updated.splice(i, 1);
        return [...updated, aiMsg];
      });

      setChatHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: trimmed }] },
        { role: "model", parts: [{ text: aiText }] }
      ]);

      soundBadge();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const i = updated.findLastIndex(m => m.role === 'loading');
        if (i !== -1) updated.splice(i, 1);

        return [
          ...updated,
          { role: 'ai', text: `## ⚠️ Connection Error\n\nSorry, I couldn't reach the server. Please check your internet and try again!\n\n*Error: ${err.message}*` }
        ];
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [isLoading, chatHistory, topicTitle, topicId]);

  const handleClose = () => {
    soundWhoosh();
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 80, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onClose?.());
  };

  return (
    <Animated.View style={[ss.root, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <KeyboardAvoidingView
        style={ss.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={[accentColor + '22', accentColor + '08']}
          style={[ss.header, { borderBottomColor: accentColor + '30' }]}
        >
          <View style={[ss.headerIcon, { backgroundColor: accentColor + '25', borderColor: accentColor + '50' }]}>
            <Icon name="robot" size={20} color={accentColor} />
          </View>
          <View style={ss.headerText}>
            <Text style={[ss.headerTitle, { color: txt1 }]}>AI Tutor</Text>
            <Text style={[ss.headerSub, { color: accentColor }]} numberOfLines={1}>{topicTitle}</Text>
          </View>
          <View style={[ss.statusDot, { backgroundColor: '#00E5A0' }]} />
          <TouchableOpacity onPress={handleClose} style={[ss.closeBtn, { backgroundColor: glass2, borderColor: border }]}>
            <Icon name="close" size={16} color={txtM} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          style={ss.messages}
          contentContainerStyle={ss.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              accentColor={accentColor}
              isDark={isDark}
              txt1={txt1}
              txt2={txt2}
              txtM={txtM}
              glass1={glass1}
              border={border}
            />
          ))}
        </ScrollView>

        {/* ── Quick questions ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={ss.quickScroll}
          contentContainerStyle={ss.quickContent}
        >
          {QUICK_QUESTIONS.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => sendMessage(q)}
              disabled={isLoading}
              style={[ss.quickChip, { backgroundColor: accentColor + '15', borderColor: accentColor + '40' }]}
            >
              <Text style={[ss.quickChipText, { color: accentColor }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={[ss.inputBar, { backgroundColor: isDark ? '#0E1018' : '#FFFFFF', borderTopColor: border }]}>
          <TextInput
            ref={inputRef}
            style={[ss.input, {
              color: txt1,
              backgroundColor: glass2,
              borderColor: isLoading ? border : accentColor + '50',
            }]}
            placeholder={`Ask about ${topicTitle}...`}
            placeholderTextColor={txtM}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            style={[ss.sendBtn, {
              backgroundColor: (!input.trim() || isLoading) ? glass2 : accentColor,
              borderColor: (!input.trim() || isLoading) ? border : accentColor,
            }]}
          >
            {isLoading
              ? (
                <LottieView
                  source={require('../assets/Smooth Triple Dot Loading.json')}
                  autoPlay
                  loop
                  style={{ width: 30, height: 30 }}
                  colorFilters={[
                    { keypath: "Shape Layer 1", color: accentColor },
                    { keypath: "Shape Layer 2", color: accentColor },
                    { keypath: "Shape Layer 3", color: accentColor },
                  ]}
                />
              )
              : <Icon name="forward" size={18} color={(!input.trim()) ? txtM : '#FFF'} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const ss = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  headerText: { flex: 1 },
  headerTitle: { fontFamily: FONTS.displayMedium, fontSize: 15 },
  headerSub: { fontFamily: FONTS.body, fontSize: 11, marginTop: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },

  // Messages
  messages: { flex: 1 },
  messagesContent: { padding: SPACING.md, gap: 12, paddingBottom: 8  },

  // User bubble
  userBubbleWrap: { alignItems: 'flex-end', marginLeft: 40 },
  userBubble: { borderRadius: 18, borderBottomRightRadius: 4, padding: 12, maxWidth: width * 0.78 },
  userText: { fontFamily: FONTS.body, fontSize: 14, color: '#FFF', lineHeight: 20 },

  // AI bubble
  aiBubbleWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginRight: 20 },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0, marginTop: 4,
  },
  aiBubble: {
    flex: 1, borderRadius: 18, borderTopLeftRadius: 4,
    borderWidth: 1, overflow: 'hidden',
  },
  aiBubbleAccent: { height: 2 },
  aiBubbleContent: { padding: 12, gap: 8 },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },
  typingLabel: { fontFamily: FONTS.body, fontSize: 11, marginLeft: 4 },

  // Rich blocks inside AI bubble
  headingRow: { borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 2 },
  headingText: { fontFamily: FONTS.displayMedium, fontSize: 15, lineHeight: 22 },
  subheadingText: { fontFamily: FONTS.bodyMedium, fontSize: 13, lineHeight: 18 },
  formulaBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: RADIUS.md, borderWidth: 1,
  },
  formulaText: { fontFamily: FONTS.bodyMedium, fontSize: 13, flex: 1 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  bulletText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 19, flex: 1 },
  numBadge: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  numText: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  highlightBox: { borderLeftWidth: 3, borderRadius: RADIUS.sm, padding: 10 },
  highlightText: { fontFamily: FONTS.bodyMedium, fontSize: 13, lineHeight: 19 },
  paraText: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 19 },

  // Quick chips
  quickScroll: { maxHeight: 44 },
  quickContent: { paddingHorizontal: SPACING.md, gap: 8, paddingVertical: 6 },
  quickChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  quickChipText: { fontFamily: FONTS.bodyMedium, fontSize: 11 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    gap: 10, borderTopWidth: 1,
  },
  input: {
    flex: 1, borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: FONTS.body, fontSize: 14,
    maxHeight: 100, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
});
