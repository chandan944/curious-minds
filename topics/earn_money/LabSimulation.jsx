import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap, soundBadge, soundWhoosh } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 40;
const SIM_H = 260;

export default function EarnMoneyLabExt({ scientistMode = false, onLabBreaker }) {
  const { theme, isDark } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const accentColor = _themeObj.accent?.primary || '#00D4A0';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txt2 = _themeObj.text?.secondary || '#AAAAAA';
  const txtM = _themeObj.text?.muted || '#888888';
  const glass1 = _themeObj.glass?.light || 'rgba(255,255,255,0.05)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';

  // ── SIMULATION STATE (Ticks every month) ──
  // User sets profile: Low (Bonds), Medium (Index Funds), High (Crypto/Tech Stocks)
  // Low = 3% return, low volatility
  // Med = 8% return, med volatility
  // High = 15% return, extreme volatility (Crashes)

  const [months, setMonths] = useState(0); 
  const [netWorth, setNetWorth] = useState(0);
  const [cashInvested, setCashInvested] = useState(0);

  const [riskProfile, setRiskProfile] = useState('MED'); // LOW, MED, HIGH
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  const [gameState, setGameState] = useState('INVESTING 💸');
  const [marketEvent, setMarketEvent] = useState('Normal Market Conditions 🌤️');
  const [history, setHistory] = useState([]); // { month, nw, totalInv }

  const timerRef = useRef(null);
  
  // Real-time market tick
  useEffect(() => {
     if (gameState === 'FIRED! 🔥' || gameState === 'AGE 65 REACHED 🛑') return;

     timerRef.current = setInterval(() => {
        setMonths(prev => {
           const nextM = prev + 1;
           if (nextM >= 40 * 12) { // 40 years
                setGameState('AGE 65 REACHED 🛑');
                clearInterval(timerRef.current);
                return 40 * 12;
           }
           return nextM;
        });

        // Market Engine
        let baseReturnAnn = 0.08;
        let volatility = 0.05;

        if (riskProfile === 'LOW') { baseReturnAnn = 0.03; volatility = 0.01; }
        if (riskProfile === 'MED') { baseReturnAnn = 0.08; volatility = 0.15; }
        if (riskProfile === 'HIGH') { baseReturnAnn = 0.14; volatility = 0.40; }

        let monthReturn = baseReturnAnn / 12;

        // Apply random volatility events occasionally
        const rand = Math.random();
        let eventStr = 'Normal Market Conditions 🌤️';

        if (rand < 0.02) { 
           // Major Crash!
           monthReturn -= (volatility * 1.5); 
           eventStr = 'MARKET CRASH! Panic Selling! 📉😰';
           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (rand > 0.98) {
           // Massive Bull Run!
           monthReturn += (volatility * 1.0);
           eventStr = 'BULL RUN! Irrational Exuberance! 🚀🤑';
           if (months % 10 === 0) soundBadge();
        } else if (rand < 0.1 && riskProfile === 'LOW') {
           // Inflation eats bonds
           monthReturn -= 0.005;
           eventStr = 'High Inflation! Cash is losing value... 💸';
        }

        if (eventStr !== 'Normal Market Conditions 🌤️') {
           setMarketEvent(eventStr);
           setTimeout(() => setMarketEvent('Normal Market Conditions 🌤️'), 3000);
        }

        setCashInvested(prev => prev + monthlyContribution);

        setNetWorth(prev => {
            const nextNW = (prev + monthlyContribution) * (1 + monthReturn);
            
            if (months % 12 === 0) { // log every year to smooth graph
                setHistory(h => [...h, { month: months, nw: nextNW, totalInv: cashInvested + monthlyContribution }]);
            }

            return Math.max(0, nextNW); // Cannot go below zero
        });

     }, 100); // 1 month = 0.1 sec (40 years = ~48 seconds)

     return () => clearInterval(timerRef.current);
  }, [months, riskProfile, monthlyContribution, cashInvested, gameState]);

  // Win condition checker outside setState
  useEffect(() => {
      if (netWorth >= 1000000 && gameState !== 'FIRED! 🔥') {
          clearInterval(timerRef.current);
          setGameState('FIRED! 🔥'); 
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (onLabBreaker) onLabBreaker();
      }
  }, [netWorth, gameState, onLabBreaker]);


  const resetSim = () => {
     soundWhoosh();
     setMonths(0);
     setNetWorth(0);
     setCashInvested(0);
     setHistory([]);
     setGameState('INVESTING 💸');
     setMarketEvent('Normal Market Conditions 🌤️');
  };

  const handleRisk = (risk) => {
     soundTap();
     setRiskProfile(risk);
  };

  const handleContrib = (delta) => {
     soundTap();
     setMonthlyContribution(prev => Math.max(0, Math.min(5000, prev + delta)));
  };


  const formatMoney = (val) => {
     if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
     if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'k';
     return '$' + Math.floor(val);
  };

  // SVGs paths constraints
  const MAX_YEARS = 40;
  const MAX_VALUE = 2000000; // 2 Million graph ceiling

  const getPath = (key) => {
    if (history.length === 0) return `M 0,${SIM_H}`;
    let path = `M 0,${SIM_H}`;
    for (const h of history) {
        const x = (h.month / (MAX_YEARS*12)) * SIM_W;
        const val = Math.min(MAX_VALUE, h[key]);
        const y = SIM_H - (val / MAX_VALUE) * SIM_H;
        path += ` L ${x},${y}`;
    }
    const curX = (months / (MAX_YEARS*12)) * SIM_W;
    const curVal = Math.min(MAX_VALUE, key === 'nw' ? netWorth : cashInvested);
    const curY = SIM_H - (curVal / MAX_VALUE) * SIM_H;
    path += ` L ${curX},${curY}`;
    return path;
  };

  const yearsLabel = Math.floor(months / 12);

  return (
    <View style={styles.container}>
      {/* HEADER DASHBOARD */}
      <View style={[styles.dash, { borderColor: border, backgroundColor: isDark ? '#050A05' : '#F0FDF4' }]}>
         <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, color: txtM, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>NET WORTH (COMPOUNDED)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 26, color: accentColor, fontFamily: 'monospace' }}>{formatMoney(netWorth)}</Text>
            </View>
            <Text style={{ fontSize: 9, color: '#FF6B6B', fontFamily: FONTS.displayBold, marginTop: 4 }}>
                CASH INVESTED: {formatMoney(cashInvested)}
            </Text>
         </View>
         <View style={{ alignItems: 'flex-end', width: 80, justifyContent: 'center' }}>
            <Text style={{ fontSize: 10, color: txtM, fontFamily: FONTS.displayBold, textAlign: 'right' }}>YEAR</Text>
            <Text style={{ fontSize: 24, color: txt1, fontFamily: 'monospace' }}>{yearsLabel}</Text>
            <Text style={{ fontSize: 10, color: txtM, fontFamily: FONTS.monospace }}>/ 40</Text>
         </View>
      </View>

      {/* MARKET NOTIFIER EVENT */}
      <View style={{ marginBottom: 12, alignItems: 'center' }}>
         <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: 11, color: marketEvent.includes('CRASH') ? '#FF4444' : (marketEvent.includes('BULL') ? accentColor : txtM) }}>
            {marketEvent}
         </Text>
      </View>

      {/* GRAPH CHART */}
      <View style={[styles.simBox, { borderColor: border, backgroundColor: '#000' }]}>
          <Svg width={SIM_W} height={SIM_H}>
            <Defs>
              <LinearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                 <Stop offset="0%" stopColor={accentColor} stopOpacity="0.6"/>
                 <Stop offset="100%" stopColor={accentColor} stopOpacity="0.0"/>
              </LinearGradient>
            </Defs>

            {/* Grid */}
            {[0.5, 1.0].map(f => (
               <React.Fragment key={f}>
                   <Line x1="0" y1={SIM_H - (f * 1000000 / MAX_VALUE)*SIM_H} x2={SIM_W} y2={SIM_H - (f * 1000000 / MAX_VALUE)*SIM_H} stroke={border} strokeDasharray="4 4"/>
                   <SvgText x={5} y={SIM_H - (f * 1000000 / MAX_VALUE)*SIM_H - 4} fill="rgba(255,255,255,0.6)" fontSize="9">${f}M</SvgText>
               </React.Fragment>
            ))}

            {/* 1 Million FI Target Line */}
            <Line x1="0" y1={SIM_H - (1000000 / MAX_VALUE)*SIM_H} x2={SIM_W} y2={SIM_H - (1000000 / MAX_VALUE)*SIM_H} stroke="#FFD166" strokeOpacity="0.5" strokeDasharray="5 5" />
            <SvgText x={SIM_W - 55} y={SIM_H - (1000000 / MAX_VALUE)*SIM_H - 4} fill="#FFD166" opacity={0.8} fontSize="9" fontWeight="bold">FIRE Target</SvgText>

            {history.length > 0 && (
                <>
                {/* Cash Invested Area */}
                <Path d={`${getPath('totalInv')} L ${(months/(MAX_YEARS*12))*SIM_W},${SIM_H} L 0,${SIM_H} Z`} fill="#FF6B6B" fillOpacity="0.2" />
                <Path d={getPath('totalInv')} fill="none" stroke="#FF6B6B" strokeWidth="2" />
                
                {/* Net Worth Compounding Curve */}
                <Path d={`${getPath('nw')} L ${(months/(MAX_YEARS*12))*SIM_W},${SIM_H} L 0,${SIM_H} Z`} fill="url(#nwGrad)" />
                <Path d={getPath('nw')} fill="none" stroke={accentColor} strokeWidth="3" />
                </>
            )}
            <Circle cx={(months/(MAX_YEARS*12))*SIM_W} cy={SIM_H - (Math.min(MAX_VALUE, netWorth)/MAX_VALUE)*SIM_H} r="5" fill="#FFF" stroke={accentColor} strokeWidth="2" />
          </Svg>
          
          {gameState.includes('FIRED') && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center'}]}>
                 <Text style={{ fontSize: 30 }}>🎉</Text>
                 <Text style={{ color: '#00D4A0', fontFamily: FONTS.displayBold, fontSize: 18, marginTop: 8 }}>FINANCIAL FREEDOM!</Text>
                 <Text style={{ color: '#FFF', fontFamily: FONTS.bodyMedium, fontSize: 11, marginTop: 4 }}>You beat the 40-year rat race.</Text>
                 <TouchableOpacity style={{ marginTop: 16, backgroundColor: '#00D4A0', padding: 10, borderRadius: RADIUS.sm}} onPress={resetSim}>
                    <Text style={{color: '#000', fontFamily: FONTS.displayBold}}>Play Again</Text>
                 </TouchableOpacity>
              </View>
          )}
      </View>

      {/* CONTROLS */}
      <View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }]}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 10, color: txt2, fontFamily: FONTS.displayBold }}>MONTHLY SAVINGS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => handleContrib(-50)}><Icon name="minus-circle" size={20} color={txtM} /></TouchableOpacity>
                <Text style={{ fontSize: 16, color: txt1, fontFamily: 'monospace' }}>${monthlyContribution}</Text>
                <TouchableOpacity onPress={() => handleContrib(50)}><Icon name="plus-circle" size={20} color={txt1} /></TouchableOpacity>
            </View>
         </View>

         <Text style={{ fontSize: 10, color: txt2, fontFamily: FONTS.displayBold, marginBottom: 8 }}>ASSET RISK PROFILE</Text>
         <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
               style={[styles.riskBtn, riskProfile==='LOW' ? {backgroundColor: '#FF444430', borderColor: '#FF4444'} : {borderColor: border}]} 
               onPress={() => handleRisk('LOW')}>
               <Text style={[styles.fbText, { color: riskProfile==='LOW' ? '#FF4444' : txtM }]}>Savings/Bonds (Low)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={[styles.riskBtn, riskProfile==='MED' ? {backgroundColor: '#00D4A030', borderColor: '#00D4A0'} : {borderColor: border}]} 
               onPress={() => handleRisk('MED')}>
               <Text style={[styles.fbText, { color: riskProfile==='MED' ? '#00D4A0' : txtM }]}>Index Funds (Med)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
               style={[styles.riskBtn, riskProfile==='HIGH' ? {backgroundColor: '#A855F730', borderColor: '#A855F7'} : {borderColor: border}]} 
               onPress={() => handleRisk('HIGH')}>
               <Text style={[styles.fbText, { color: riskProfile==='HIGH' ? '#A855F7' : txtM }]}>Crypto/Tech (High)</Text>
            </TouchableOpacity>
         </View>
      </View>

      {gameState === 'AGE 65 REACHED 🛑' && (
         <TouchableOpacity style={styles.resetBtn} onPress={resetSim}>
            <Text style={{ color: "#FFF", fontFamily: FONTS.displayBold }}>Reset Simulation 🔄</Text>
         </TouchableOpacity>
      )}

      {scientistMode && (
         <View style={[styles.sciPanel, { borderColor: border }]}>
            <Text style={{ color: '#FFD166', fontSize: 9, fontFamily: 'monospace' }}>MONTE_CARLO ENGINE: TICK_RATE_MS = 100</Text>
            <Text style={{ color: '#FFD166', fontSize: 9, fontFamily: 'monospace' }}>STOCHASTIC_EVENTS: NORMAL_DIST($\mu$=8%, $\sigma$=15%)</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: width * 0.05, paddingBottom: 20 },
  dash: { flexDirection: 'row', padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12 },
  simBox: { height: SIM_H, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  controlBox: { padding: 16, borderRadius: RADIUS.md, borderWidth: 1 },
  riskBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.sm, borderWidth: 1, alignItems: 'center' },
  fbText: { fontSize: 8, fontFamily: FONTS.displayBold, textAlign: 'center' },
  resetBtn: { marginTop: 16, padding: 16, backgroundColor: '#333', borderRadius: RADIUS.md, alignItems: 'center' },
  sciPanel: { marginTop: 16, padding: 12, backgroundColor: '#1A1505', borderRadius: RADIUS.sm, borderWidth: 1 }
});
