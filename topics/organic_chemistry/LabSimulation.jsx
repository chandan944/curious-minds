import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text as SvgText, Defs, RadialGradient, Stop, Line } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundWhoosh, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 400;

export default function OrganicLab({ scientistMode = false }) {
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
  const [chain, setChain] = useState(['C']); // ['C', 'C', 'OH']
  const [lastAction, setLastAction] = useState('Tap a group to add it!');
  
  const anims = useRef({}).current; // { index: Animated.Value }

  // ── Rules ──────────────────────────────────────
  const getMoleculeInfo = () => {
     const carbons = chain.filter(t => t === 'C').length;
     const hydroxyl = chain.filter(t => t === 'OH').length;
     const carboxyl = chain.filter(t => t === 'COOH').length;

     if (carbons === 1 && hydroxyl === 0 && carboxyl === 0) return { name: 'METHANE', use: 'Natural Gas Fuel' };
     if (carbons === 2 && hydroxyl === 0 && carboxyl === 0) return { name: 'ETHANE', use: 'Chemical Feedstock' };
     if (carbons === 2 && hydroxyl === 1 && carboxyl === 0) return { name: 'ETHANOL', use: 'Sanitizer / Alcohol' };
     if (carbons === 1 && hydroxyl === 0 && carboxyl === 1) return { name: 'ACETIC ACID', use: 'Vinegar / Sour taste' };
     if (carbons === 3 && hydroxyl === 0 && carboxyl === 0) return { name: 'PROPANE', use: 'Camping Gas' };
     if (carbons >= 4) return { name: 'LONG POLYMER', use: 'Plastics / Waxes' };
     
     return { name: 'UNKNOWN CHAIN', use: 'Complex Organic Compound' };
  };

  const addGroup = (type) => {
    if (chain.length >= 8) {
       soundBadge();
       setLastAction("Molecular limit reached!");
       return;
    }
    soundTap();
    setChain([...chain, type]);
    setLastAction(`Added ${type}!`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clear = () => {
    soundWhoosh();
    setChain(['C']);
    setLastAction('Reset to single Carbon.');
  };

  // ── Render ─────────────────────────────────────
  const info = getMoleculeInfo();

  const renderAtom = (type, index) => {
    const x = 50 + (index * 60);
    const y = SIM_H / 2;

    let color = '#555'; // Carbon
    let label = 'C';
    let sub = '4 bonds';
    
    if (type === 'OH') { color = '#4ECDC4'; label = 'OH'; sub = 'Alcohol'; }
    if (type === 'COOH') { color = '#FF4444'; label = 'Acid'; sub = 'Carboxyl'; }

    return (
      <G key={index}>
        {/* Connection Line */}
        {index > 0 && (
           <Line x1={x - 60} y1={y} x2={x} y2={y} stroke={txtM} strokeWidth="3" opacity={0.4} />
        )}
        
        {/* Atom Ball */}
        <Circle cx={x} cy={y} r="20" fill={color} />
        <SvgText x={x} y={y + 5} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">
          {label}
        </SvgText>

        {scientistMode && (
           <SvgText x={x} y={y + 35} fill="rgba(255,255,255,0.6)" fontSize="6" textAnchor="middle">
             {type === 'C' ? 'sp3' : 'hybrid'}
           </SvgText>
        )}
      </G>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Top State Card ── */}
      <View style={[styles.infoCard, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#fff' }]}>
         <View style={styles.headerRow}>
            <Text style={[styles.molName, { color: color }]}>{info.name}</Text>
            <Text style={styles.actionText}>{lastAction}</Text>
         </View>
         <Text style={[styles.molUsage, { color: txtM }]}>USE: {info.use}</Text>
      </View>

      {/* ── Virtual Builder ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={color} stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="transparent" />
               </RadialGradient>
            </Defs>
            <Rect width={SIM_W} height={SIM_H} fill="url(#glow)" />
            
            {/* Grid for alignment */}
            {[...Array(10)].map((_, i) => (
               <Line key={i} x1={i*40} y1="0" x2={i*40} y2={SIM_H} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}

            {chain.map((type, i) => renderAtom(type, i))}
            
            {/* Legend for bonds */}
            <G transform={`translate(20, ${SIM_H - 40})`}>
               <Line x1="0" y1="0" x2="30" y2="0" stroke="#888" strokeWidth="2" />
               <SvgText x="35" y="4" fill="#666" fontSize="10">Single Bond (Sigma)</SvgText>
            </G>
         </Svg>

         {/* Scientist Overlay */}
         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>IUPAC: {info.name.toLowerCase()}</Text>
              <Text style={styles.sciText}>TOTAL MASS: {(chain.length * 12).toFixed(1)} u</Text>
           </View>
         )}
      </View>

      {/* ── Toolbar ── */}
      <View style={styles.toolbar}>
         <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#444' }]} onPress={() => addGroup('C')}>
            <Icon name="atom" size={18} color="#fff" />
            <Text style={styles.toolLabel}>+ CARBON</Text>
         </TouchableOpacity>
         
         <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#4ECDC4' }]} onPress={() => addGroup('OH')}>
            <Icon name="flask" size={18} color="#000" />
            <Text style={[styles.toolLabel, { color: '#000' }]}>+ ALCOHOL</Text>
         </TouchableOpacity>

         <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#FF4444' }]} onPress={() => addGroup('COOH')}>
            <Icon name="zap" size={18} color="#fff" />
            <Text style={styles.toolLabel}>+ ACID</Text>
         </TouchableOpacity>

         <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#333' }]} onPress={clear}>
            <Icon name="trash" size={18} color="#888" />
         </TouchableOpacity>
      </View>

      <Text style={styles.footer}>* Simplified carbon-chain visualization for sp3 model *</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  infoCard: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  molName: { fontSize: 18, fontFamily: FONTS.displayBold, letterSpacing: 1 },
  actionText: { fontSize: 9, color: '#888', fontStyle: 'italic' },
  molUsage: { fontSize: 11, fontFamily: FONTS.bodyMedium },

  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  sciOverlay: { position: 'absolute', top: 10, right: 10, alignItems: 'flex-end' },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace', textShadowColor: '#000', textShadowRadius: 2 },

  toolbar: { flexDirection: 'row', gap: 10, marginTop: 16 },
  toolBtn: { flex: 1, height: 50, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 },
  toolLabel: { fontSize: 9, fontFamily: FONTS.displayBold, color: '#fff' },
  
  footer: { textAlign: 'center', fontSize: 8, color: '#666', marginTop: 12, fontStyle: 'italic' }
});
