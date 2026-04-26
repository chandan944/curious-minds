import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 340;

const TRAITS = [
   { id: 't1', text: "Your hidden childhood fear", target: 'hidden' },
   { id: 't2', text: "Your hair color (everyone sees)", target: 'open' },
   { id: 't3', text: "Annoying foot tap you don't notice", target: 'blind' },
   { id: 't4', text: "Your secret crush", target: 'hidden' },
   { id: 't5', text: "Your job title", target: 'open' },
   { id: 't6', text: "Unrealized artistic potential", target: 'unknown' }
];

export default function JohariLab({ scientistMode = false, onLabBreaker }) {
    const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const bg = (_themeObj || {}).bg?.base || '#0A0A0A';

  // ── State ──────────────────────────────────────
  const [activeTraitIdx, setActiveTraitIdx] = useState(0);
  const [placements, setPlacements] = useState({ open: 0, blind: 0, hidden: 0, unknown: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [feedbackLevel, setFeedbackLevel] = useState(0);

  // ── Logic ──────────────────────────────────────
  const placeTrait = (area) => {
     if (gameOver) return;

     const currentTrait = TRAITS[activeTraitIdx];
     if (currentTrait.target === area) {
        soundBadge();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setErrorMsg('CORRECT MAP!');
        setPlacements(prev => ({ ...prev, [area]: prev[area] + 1 }));

        if (activeTraitIdx + 1 < TRAITS.length) {
           setActiveTraitIdx(activeTraitIdx + 1);
        } else {
           setGameOver(true);
           setErrorMsg('MATRIX COMPLETE. SELF-AWARENESS ACHIEVED.');
           soundSuccess();
           if(onLabBreaker) onLabBreaker();
        }
     } else {
        soundWhoosh();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMsg('INCORRECT. Re-evaluate.');
     }
  };

  const receiveFeedback = () => {
     if (gameOver || feedbackLevel >= 3) return;
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     setFeedbackLevel(prev => prev + 1);
  };

  const reset = () => {
     setActiveTraitIdx(0);
     setPlacements({ open: 0, blind: 0, hidden: 0, unknown: 0 });
     setErrorMsg('');
     setGameOver(false);
     setFeedbackLevel(0);
  };

  // Dimensions of the rooms shift based on Feedback Level
  // Feedback expands Open, shrinks Blind.
  const cx = SIM_W / 2;
  const cy = SIM_H / 2;
  
  const vLineX = cx + (feedbackLevel * 20); // vertical line moves right, shrinking blind
  const hLineY = cy - (feedbackLevel * 10); // horiz line moves up, expanding open (and hidden goes up)

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>CURRENT TRAIT TO MAP</Text>
            {gameOver ? (
               <Text style={{ color: '#00D4A0', fontSize: 14, fontFamily: FONTS.displayBold }}>JOHARI WINDOW MASTERED</Text>
            ) : (
               <Text style={{ color: '#FFD166', fontSize: 14, fontFamily: FONTS.displayBold }}>
                  "{TRAITS[activeTraitIdx].text}"
               </Text>
            )}
            <Text style={{ color: errorMsg.includes('INCORRECT') ? '#FF4444' : '#00D4A0', fontSize: 10 }}>{errorMsg}</Text>
         </View>
      </View>

      {/* ── Visualizer ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            {/* The 4 Quadrants */}
            {/* 1. Open (Top Left) */}
            <Rect x="0" y="0" width={vLineX} height={hLineY} fill="rgba(0, 212, 160, 0.2)" stroke="#00D4A0" strokeWidth="2" />
            <SvgText x={vLineX/2} y={hLineY/2 - 10} fill="#00D4A0" fontSize="14" fontWeight="bold" textAnchor="middle">OPEN</SvgText>
            <SvgText x={vLineX/2} y={hLineY/2 + 10} fill="#fff" fontSize="12" textAnchor="middle">({placements.open})</SvgText>

            {/* 2. Blind (Top Right) */}
            <Rect x={vLineX} y="0" width={SIM_W - vLineX} height={hLineY} fill="rgba(255, 68, 68, 0.2)" stroke="#FF4444" strokeWidth="2" />
            <SvgText x={vLineX + (SIM_W - vLineX)/2} y={hLineY/2 - 10} fill="#FF4444" fontSize="14" fontWeight="bold" textAnchor="middle">BLIND</SvgText>
            <SvgText x={vLineX + (SIM_W - vLineX)/2} y={hLineY/2 + 10} fill="#fff" fontSize="12" textAnchor="middle">({placements.blind})</SvgText>

            {/* 3. Hidden (Bottom Left) */}
            <Rect x="0" y={hLineY} width={vLineX} height={SIM_H - hLineY} fill="rgba(168, 85, 247, 0.2)" stroke="#A855F7" strokeWidth="2" />
            <SvgText x={vLineX/2} y={hLineY + (SIM_H - hLineY)/2 - 10} fill="#A855F7" fontSize="14" fontWeight="bold" textAnchor="middle">HIDDEN</SvgText>
            <SvgText x={vLineX/2} y={hLineY + (SIM_H - hLineY)/2 + 10} fill="#fff" fontSize="12" textAnchor="middle">({placements.hidden})</SvgText>

            {/* 4. Unknown (Bottom Right) */}
            <Rect x={vLineX} y={hLineY} width={SIM_W - vLineX} height={SIM_H - hLineY} fill="rgba(85, 85, 85, 0.2)" stroke="#555" strokeWidth="2" />
            <SvgText x={vLineX + (SIM_W - vLineX)/2} y={hLineY + (SIM_H - hLineY)/2 - 10} fill="#aaa" fontSize="14" fontWeight="bold" textAnchor="middle">UNKNOWN</SvgText>
            <SvgText x={vLineX + (SIM_W - vLineX)/2} y={hLineY + (SIM_H - hLineY)/2 + 10} fill="#fff" fontSize="12" textAnchor="middle">({placements.unknown})</SvgText>
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>OPEN_AREA_COEFFICIENT: {(vLineX * hLineY).toFixed(0)}</Text>
              <Text style={styles.sciText}>FEEDBACK_DELTA: {feedbackLevel}</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         {!gameOver ? (
            <>
               <Text style={{ color: txt1, fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center', marginBottom: 6 }}>SELECT ROOM FOR TRAIT</Text>
               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#00D4A0' }]} onPress={() => placeTrait('open')}>
                     <Text style={[styles.actionText, { color: '#00D4A0' }]}>OPEN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#FF4444' }]} onPress={() => placeTrait('blind')}>
                     <Text style={[styles.actionText, { color: '#FF4444' }]}>BLIND</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#A855F7' }]} onPress={() => placeTrait('hidden')}>
                     <Text style={[styles.actionText, { color: '#A855F7' }]}>HIDDEN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#aaa' }]} onPress={() => placeTrait('unknown')}>
                     <Text style={[styles.actionText, { color: '#aaa' }]}>UNKNOWN</Text>
                  </TouchableOpacity>
               </View>

               <TouchableOpacity 
                  style={[styles.feedbackBtn, { borderColor: feedbackLevel >= 3 ? '#555' : '#00D4FF', backgroundColor: feedbackLevel >= 3 ? '#222' : 'rgba(0,212,255,0.1)' }]} 
                  onPress={receiveFeedback}
                  disabled={feedbackLevel >= 3}
               >
                  <Icon name={feedbackLevel >= 3 ? "lock" : "message-circle"} size={16} color={feedbackLevel >= 3 ? "#555" : "#00D4FF"} />
                  <Text style={[styles.actionText, { color: feedbackLevel >= 3 ? '#555' : '#00D4FF' }]}>
                     {feedbackLevel >= 3 ? 'MAX FEEDBACK RECEIVED' : 'RECEIVE CRITICAL FEEDBACK'}
                  </Text>
               </TouchableOpacity>
            </>
         ) : (
            <TouchableOpacity style={[styles.resetBtn, { backgroundColor: '#333' }]} onPress={reset}>
               <Text style={{ color: '#fff', fontSize: 12, fontFamily: FONTS.displayBold }}>RESET MATRIX</Text>
            </TouchableOpacity>
         )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16, alignItems: 'center' },
  
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  sciOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace', textAlign: 'right' },

  controlsGrid: { marginTop: 16 },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderRadius: RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  actionText: { fontSize: 10, fontFamily: FONTS.displayBold, textAlign: 'center' },

  feedbackBtn: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderWidth: 1, borderRadius: RADIUS.md },
  resetBtn: { marginTop: 10, padding: 16, borderRadius: RADIUS.md, alignItems: 'center' }
});
