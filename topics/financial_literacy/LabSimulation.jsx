import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundBadge, soundSuccess } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 260;
const YEARS = 40;

export default function CompoundLab({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const color = _themeObj.accent?.primary || '#A855F7';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── State ──────────────────────────────────────
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(7); // default 7% market return

  // Computed Arrays for Graphing
  const [principalData, setPrincipalData] = useState([]);
  const [compoundData, setCompoundData] = useState([]);

  // ── Logic ──────────────────────────────────────
  useEffect(() => {
     let tempPrincipal = [];
     let tempCompound = [];
     
     let currentPrincipal = 0;
     let currentCompound = 0;
     
     const monthlyRate = (annualReturn / 100) / 12;

     for (let y = 0; y <= YEARS; y++) {
         tempPrincipal.push(currentPrincipal);
         tempCompound.push(currentCompound);
         
         // Advance 1 year (12 months)
         for (let m = 0; m < 12; m++) {
            currentPrincipal += monthlyContribution;
            currentCompound = (currentCompound + monthlyContribution) * (1 + monthlyRate);
         }
     }
     
     setPrincipalData(tempPrincipal);
     setCompoundData(tempCompound);

     if (currentCompound > 1000000 && onLabBreaker) onLabBreaker(); // Millionaire trigger

  }, [monthlyContribution, annualReturn]);

  const updateContrib = (delta) => {
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setMonthlyContribution(prev => Math.max(50, Math.min(2000, prev + delta)));
  };

  const updateReturn = (delta) => {
     soundTap();
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     setAnnualReturn(prev => Math.max(1, Math.min(15, prev + delta)));
  };

  // ── Rendering Graph Paths ─────────────────────────────────
  const maxVal = compoundData[YEARS] || 1;
  
  const getPath = (dataArray) => {
     if (dataArray.length === 0) return '';
     
     let d = `M 0 ${SIM_H}`; // start bottom left
     
     dataArray.forEach((val, i) => {
        const x = (i / YEARS) * SIM_W;
        const normalizedY = (val / maxVal) * (SIM_H - 40); // Leave top padding
        const y = SIM_H - normalizedY;
        d += ` L ${x} ${y}`;
     });
     
     return d;
  };

  const formatCurrency = (val) => {
     if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
     if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'k';
     return '$' + val.toFixed(0);
  };

  return (
    <View style={styles.container}>
      {/* ── Dashboard ── */}
      <View style={[styles.dashHeader, { borderColor: border }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>YOUR SAVED CASH (Principal)</Text>
            <Text style={{ color: '#00D4FF', fontSize: 18, fontFamily: 'monospace' }}>
               {formatCurrency(principalData[YEARS] || 0)}
            </Text>
         </View>
         <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold }}>COMPOUNDED MARKET WEALTH</Text>
            <Text style={{ color: '#00FF7F', fontSize: 24, fontFamily: 'monospace' }}>
               {formatCurrency(compoundData[YEARS] || 0)}
            </Text>
         </View>
      </View>

      {/* ── Graph Area ── */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: isDark ? '#050A15' : '#111' }]}>
         <Svg width={SIM_W} height={SIM_H}>
            <Defs>
               <LinearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00FF7F" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#00FF7F" stopOpacity="0" />
               </LinearGradient>
               <LinearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00D4FF" stopOpacity="0.5" />
                  <Stop offset="1" stopColor="#00D4FF" stopOpacity="0" />
               </LinearGradient>
            </Defs>

            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map(tick => (
               <Path key={`h-${tick}`} d={`M 0 ${SIM_H * tick} L ${SIM_W} ${SIM_H * tick}`} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
            ))}
            {[0.25, 0.5, 0.75].map(tick => (
               <Path key={`v-${tick}`} d={`M ${SIM_W * tick} 0 L ${SIM_W * tick} ${SIM_H}`} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
            ))}

            {/* X-Axis Labels */}
            <SvgText x={SIM_W * 0.25} y={SIM_H - 10} fill="#666" fontSize="10" textAnchor="middle">Yr 10</SvgText>
            <SvgText x={SIM_W * 0.50} y={SIM_H - 10} fill="#666" fontSize="10" textAnchor="middle">Yr 20</SvgText>
            <SvgText x={SIM_W * 0.75} y={SIM_H - 10} fill="#666" fontSize="10" textAnchor="middle">Yr 30</SvgText>
            <SvgText x={SIM_W - 15} y={SIM_H - 10} fill="#666" fontSize="10" textAnchor="middle">Yr 40</SvgText>

            {/* Fill Area for Compound */}
            <Path d={`${getPath(compoundData)} L ${SIM_W} ${SIM_H} Z`} fill="url(#gradGreen)" />
            {/* Compound Line */}
            <Path d={getPath(compoundData)} fill="none" stroke="#00FF7F" strokeWidth="3" />

            {/* Fill Area for Principal */}
            <Path d={`${getPath(principalData)} L ${SIM_W} ${SIM_H} Z`} fill="url(#gradBlue)" />
            {/* Principal Line */}
            <Path d={getPath(principalData)} fill="none" stroke="#00D4FF" strokeWidth="2" strokeDasharray="5,5" />
         </Svg>

         {scientistMode && (
           <View style={styles.sciOverlay}>
              <Text style={styles.sciText}>$A = P \left(1 + \frac{
// @ts-ignore
              r}{n}\right)^{nt}$</Text>
              <Text style={styles.sciText}>PRINCIPAL_RATIO: {((principalData[YEARS] / compoundData[YEARS]) * 100).toFixed(1)}%</Text>
           </View>
         )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsGrid}>
         
         <View style={styles.controlRow}>
            <View style={{ flex: 1 }}>
               <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, marginBottom: 4 }}>MONTHLY INVESTED ($)</Text>
               <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateContrib(-50)}><Text style={styles.btnTxt}>-</Text></TouchableOpacity>
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'monospace', width: 60, textAlign: 'center' }}>${monthlyContribution}</Text>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateContrib(50)}><Text style={styles.btnTxt}>+</Text></TouchableOpacity>
               </View>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
               <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, marginBottom: 4 }}>ANNUAL RETURN (%)</Text>
               <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateReturn(-1)}><Text style={styles.btnTxt}>-</Text></TouchableOpacity>
                  <Text style={{ color: annualReturn > 5 ? '#00FF7F' : '#FF4444', fontSize: 16, fontFamily: 'monospace', width: 60, textAlign: 'center' }}>{annualReturn}%</Text>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => updateReturn(1)}><Text style={styles.btnTxt}>+</Text></TouchableOpacity>
               </View>
            </View>
         </View>

         <View style={styles.infoBox}>
            <Text style={{ color: '#FFD166', fontSize: 11, fontFamily: FONTS.displayBold, textAlign: 'center' }}>
               {annualReturn === 1 ? '1% = Savings Account. Your money gets eaten by inflation.' : 
                annualReturn === 7 ? '7% = Historic S&P 500 Index Fund (Inflation Adjusted).' : 
                annualReturn > 10 ? 'High Risk! Equivalent to picking individual volatile stocks.' : 
                'Moderate Return. Equivalent to a bond-heavy portfolio.'}
            </Text>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md },
  dashHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: RADIUS.md, marginBottom: 16 },
  
  simBox: { height: SIM_H, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },

  sciOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 6, borderRadius: RADIUS.sm },
  sciText: { color: '#00FF00', fontSize: 8, fontFamily: 'monospace' },

  controlsGrid: { marginTop: 16, gap: 16 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  infoBox: { padding: 12, backgroundColor: 'rgba(255, 209, 102, 0.1)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 209, 102, 0.3)' }
});
