import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLG, Stop, Text as SvgText, Rect, Line, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import CurrencyToggle, { formatCurrency } from '../../components/ui/CurrencyToggle';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const W = width - 48;
const TABS = [
  { id: 'A', label: 'Amortize', icon: 'chart' },
  { id: 'B', label: 'CC Trap', icon: 'alert' },
  { id: 'C', label: 'Snowball', icon: 'rocket' },
];

export default function DebtCreditLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#FF4444';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [loanAmt, setLoanAmt] = useState(5000000);
  const [loanYears, setLoanYears] = useState(20);
  const [ccBalance, setCcBalance] = useState(100000);
  const [ccApr, setCcApr] = useState(36);
  const [extraPay, setExtraPay] = useState(5000);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); Animated.sequence([Animated.spring(pulseAnim, { toValue: 0.96, tension: 300, friction: 8, useNativeDriver: true }), Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true })]).start(); };

  // ── MODE A: Amortization ──
  const renderAmort = () => {
    const rate = 9, P = loanAmt, r = (rate / 100) / 12, n = loanYears * 12;
    const EMI = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const princD = [], intD = [];
    let bal = P;
    for (let y = 1; y <= loanYears; y++) {
      let yP = 0, yI = 0;
      for (let m = 0; m < 12; m++) { const i = bal * r; yI += i; yP += EMI - i; bal -= EMI - i; }
      princD.push(yP); intD.push(yI);
    }
    const mx = Math.max(...princD.map((p, i) => p + intD[i]));
    const totalInt = intD.reduce((s, v) => s + v, 0);

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 2 }} label="HOME LOAN" txtM={txtM}>
            <SlRow v={formatCurrency(loanAmt, currency, true)} dec={() => bump(() => setLoanAmt(Math.max(1000000, loanAmt - 1000000)))} inc={() => bump(() => setLoanAmt(loanAmt + 1000000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YEARS (9%)" txtM={txtM}>
            <SlRow v={`${loanYears}Y`} dec={() => bump(() => setLoanYears(Math.max(5, loanYears - 5)))} inc={() => bump(() => setLoanYears(Math.min(30, loanYears + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={260}>
            <Defs>
              <SvgLG id="bgG" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={accent} stopOpacity="0.06" /><Stop offset="1" stopColor={accent} stopOpacity="0" /></SvgLG>
            </Defs>
            <Rect x={0} y={0} width={W} height={260} fill="url(#bgG)" />
            {princD.map((p, i) => {
              const bW = (W - 20) / loanYears * 0.75;
              const gap = (W - 20) / loanYears;
              const x = 10 + i * gap;
              const hP = (p / mx) * 180, hI = (intD[i] / mx) * 180;
              return (
                <G key={i}>
                  <Rect x={x} y={240 - hI} width={bW} height={hI} fill="#FF4444" fillOpacity={0.7} rx={3} />
                  <Rect x={x} y={240 - hI - hP} width={bW} height={hP} fill="#00D4FF" fillOpacity={0.85} rx={3} />
                  {i % Math.max(1, Math.floor(loanYears / 5)) === 0 && <SvgText x={x + bW / 2} y={255} fill={txtM} fontSize="8" textAnchor="middle">Y{i + 1}</SvgText>}
                </G>
              );
            })}
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00D4FF18', '#00D4FF05']} style={[styles.resultCard, { borderColor: '#00D4FF40' }]}>
            <View style={[styles.dot, { backgroundColor: '#00D4FF' }]} />
            <Text style={[styles.resLabel, { color: txtM }]}>Principal</Text>
            <Text style={[styles.resVal, { color: '#00D4FF' }]}>{formatCurrency(P, currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FF444418', '#FF444405']} style={[styles.resultCard, { borderColor: '#FF444440' }]}>
            <View style={[styles.dot, { backgroundColor: '#FF4444' }]} />
            <Text style={[styles.resLabel, { color: txtM }]}>Interest</Text>
            <Text style={[styles.resVal, { color: '#FF4444' }]}>{formatCurrency(totalInt, currency, true)}</Text>
          </LinearGradient>
        </View>

        <Insight accent={accent} glass1={glass1} border={border} txt2={txt2}>
          In the early years, you aren't even paying for your house! 🏚️ Almost every rupee goes to the bank's profit first. This is the 'Interest Cliff.' One extra payment now is worth 10x later! 🛡️
        </Insight>
      </View>
    );
  };

  // ── MODE B: Credit Card Trap ──
  const renderCCTrap = () => {
    let bal = ccBalance;
    const mr = (ccApr / 100) / 12;
    let months = 0, totalInt = 0;
    while (bal > 0 && months < 600) {
      let mp = Math.max(bal * 0.05, 1000);
      if (bal + bal * mr < mp) mp = bal + bal * mr;
      const i = bal * mr; totalInt += i; bal = bal + i - mp; months++;
    }
    const yrs = (months / 12).toFixed(1);
    const multiplier = ((ccBalance + totalInt) / ccBalance).toFixed(1);

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="CREDIT CARD BALANCE" txtM={txtM}>
          <SlRow v={formatCurrency(ccBalance, currency, true)} dec={() => bump(() => setCcBalance(Math.max(10000, ccBalance - 20000)))} inc={() => bump(() => setCcBalance(ccBalance + 20000))} t={txt1} g={glass2} />
        </Ctrl>
        <Ctrl border={border} glass1={glass1} label={`APR (ANNUAL RATE) — ${ccApr}%`} txtM={txtM}>
          <SlRow v={`${ccApr}%`} dec={() => bump(() => setCcApr(Math.max(12, ccApr - 6)))} inc={() => bump(() => setCcApr(Math.min(48, ccApr + 6)))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 20, alignItems: 'center' }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>IF YOU ONLY PAY THE MINIMUM</Text>
          <Text style={{ color: '#FFD166', fontFamily: FONTS.displayBold, fontSize: 13, marginTop: 4 }}>5% of balance or ₹1,000 (whichever is higher)</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: border, marginVertical: 16 }} />
          <Text style={{ color: txtM, fontSize: 11 }}>Time to pay off</Text>
          <Text style={{ color: accent, fontSize: 42, fontFamily: FONTS.displayBold }}>{yrs} <Text style={{ fontSize: 16 }}>YEARS</Text></Text>
          <View style={{ width: '100%', height: 1, backgroundColor: border, marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1 }}><Text style={{ color: txtM, fontSize: 10 }}>Total Interest</Text><Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 18 }}>{formatCurrency(totalInt, currency, true)}</Text></View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}><Text style={{ color: txtM, fontSize: 10 }}>Pay Multiplier</Text><Text style={{ color: '#FFD166', fontFamily: FONTS.displayBold, fontSize: 18 }}>{multiplier}×</Text></View>
          </View>
        </View>

        <LinearGradient colors={['#FF444420', '#FF444408']} style={[styles.alertCard, { borderColor: '#FF444440' }]}>
          <Icon name="alert" size={18} color="#FF4444" />
          <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
            You're buying ONE laptop but paying for THREE! 💻💻💻 The 'Minimum Payment' is the bait in the trap. If you don't pay in full, the bank owns your future self. 🪤
          </Text>
        </LinearGradient>
      </View>
    );
  };

  // ── MODE C: Debt Snowball ──
  const renderSnowball = () => {
    const debts = [
      { name: 'Credit Card', bal: 50000, min: 2500, color: '#FF4444', icon: 'alert' },
      { name: 'Car Loan', bal: 300000, min: 8000, color: '#FFD166', icon: 'rocket' },
      { name: 'Student Loan', bal: 800000, min: 12000, color: '#00D4FF', icon: 'book' },
    ];
    debts.sort((a, b) => a.bal - b.bal);
    const totalDebt = debts.reduce((s, d) => s + d.bal, 0);

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="EXTRA MONTHLY SNOWBALL" txtM={txtM}>
          <SlRow v={`+${formatCurrency(extraPay, currency, true)}`} dec={() => bump(() => setExtraPay(Math.max(0, extraPay - 1000)))} inc={() => bump(() => setExtraPay(extraPay + 1000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 4 }}>PAYOFF ORDER: SMALLEST → LARGEST</Text>
          <Text style={{ color: txt2, fontSize: 11, marginBottom: 16 }}>Total Debt: {formatCurrency(totalDebt, currency, true)}</Text>

          {debts.map((d, i) => {
            const isTarget = i === 0;
            return (
              <View key={i} style={{ marginBottom: 16, opacity: isTarget ? 1 : 0.55 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.barIcon, { backgroundColor: d.color + '20' }]}><Icon name={d.icon} size={14} color={d.color} /></View>
                    <View>
                      <Text style={{ color: d.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{i + 1}. {d.name}</Text>
                      <Text style={{ color: txtM, fontSize: 9 }}>Min: {formatCurrency(d.min, currency)}/mo {isTarget ? `+ ${formatCurrency(extraPay, currency)} snowball` : ''}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 14 }}>{formatCurrency(d.bal, currency, true)}</Text>
                    {isTarget && <View style={[styles.targetBadge, { backgroundColor: '#00E5A020', borderColor: '#00E5A050' }]}><Text style={{ color: '#00E5A0', fontSize: 9, fontFamily: FONTS.displayBold }}>⚡ TARGET</Text></View>}
                  </View>
                </View>
                <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                  <LinearGradient colors={[d.color, d.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(d.bal / totalDebt) * 100}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        <LinearGradient colors={['#00E5A015', '#00E5A005']} style={[styles.alertCard, { borderColor: '#00E5A040' }]}>
          <Icon name="zap" size={16} color="#00E5A0" />
          <Text style={{ color: '#00E5A0', fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 18 }}>
            The Snowball Effect! ⛄ Once the first debt is crushed, you use its entire power to smash the second one. Each victory makes you stronger and faster until you are debt-free! 🏔️
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CurrencyToggle currentCurrency={currency} onCurrencyChange={setCurrency} />
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(tab => { const a = activeTab === tab.id; return (
          <TouchableOpacity key={tab.id} onPress={() => handleTab(tab.id)} style={styles.tab}>
            <LinearGradient colors={a ? [accent + '25', accent + '08'] : ['transparent', 'transparent']} style={[styles.tabInner, a && { borderColor: accent + '60' }]}>
              <Icon name={tab.icon} size={14} color={a ? accent : txtM} />
              <Text style={[styles.tabTxt, { color: a ? accent : txtM }]}>{tab.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ); })}
      </View>
      <View style={styles.content}>
        {activeTab === 'A' && renderAmort()}
        {activeTab === 'B' && renderCCTrap()}
        {activeTab === 'C' && renderSnowball()}
      </View>
    </View>
  );
}

function Ctrl({ children, border, glass1, label, txtM, style = {} }) { return (<View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}><Text style={[styles.cLabel, { color: txtM }]}>{label}</Text>{children}</View>); }
function SlRow({ v, dec, inc, t, g, s = false }) { return (<View style={styles.sliderRow}><TouchableOpacity onPress={dec} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>−</Text></TouchableOpacity><Text style={[s ? styles.vSm : styles.vLg, { color: t }]}>{v}</Text><TouchableOpacity onPress={inc} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>+</Text></TouchableOpacity></View>); }
function Insight({ children, accent, glass1, border, txt2 }) { return (<View style={[styles.insightBox, { backgroundColor: glass1, borderColor: border }]}><View style={[styles.insightIcon, { backgroundColor: accent + '15' }]}><Icon name="lightbulb" size={14} color={accent} /></View><Text style={[styles.insightText, { color: txt2 }]}>{children}</Text></View>); }

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16, paddingHorizontal: 12, gap: 6 },
  tab: { flex: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'transparent' },
  tabTxt: { fontFamily: FONTS.displayBold, fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: SPACING.md },
  chartBox: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
  controlBox: { padding: 14, borderWidth: 1, borderRadius: RADIUS.lg, marginBottom: 4 },
  cLabel: { fontFamily: FONTS.displayBold, fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
  controlGrid: { flexDirection: 'row', gap: 6 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  btn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  vLg: { fontSize: 20, fontFamily: FONTS.displayBold },
  vSm: { fontSize: 13, fontFamily: FONTS.displayMedium },
  resultRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  resultCard: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  resLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  resVal: { fontFamily: FONTS.displayBold, fontSize: 16 },
  barIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  targetBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
