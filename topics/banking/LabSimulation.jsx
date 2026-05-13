import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
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
const CH = 260;

const TABS = [
  { id: 'A', label: 'Accounts', icon: 'wallet' },
  { id: 'B', label: 'Compound', icon: 'chart' },
  { id: 'C', label: 'EMI Math', icon: 'calculator' },
];

export default function BankingLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#00D4FF';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [baseAmount, setBaseAmount] = useState(100000);
  const [years, setYears] = useState(5);
  const [cvsRate, setCvsRate] = useState(8);
  const [loanAmt, setLoanAmt] = useState(1000000);
  const [loanRate, setLoanRate] = useState(9);
  const [loanYears, setLoanYears] = useState(10);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); Animated.sequence([Animated.spring(pulseAnim, { toValue: 0.96, tension: 300, friction: 8, useNativeDriver: true }), Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true })]).start(); };

  // ── MODE A: Account Compare ──
  const renderAccounts = () => {
    const savings = baseAmount * Math.pow(1.03, years);
    const fd = baseAmount * Math.pow(1.07, years);
    const months = years * 12;
    const dep = baseAmount / months;
    let rd = 0;
    for (let i = 0; i < months; i++) rd = (rd + dep) * (1 + 0.07 / 12);

    const data = [
      { label: 'Savings', sub: '3% p.a.', val: savings, color: '#FFD166', icon: 'wallet' },
      { label: 'FD', sub: '7% Lump', val: fd, color: '#A855F7', icon: 'shield' },
      { label: 'RD', sub: '7% SIP', val: rd, color: '#4ECDC4', icon: 'chart' },
    ];
    const mx = Math.max(...data.map(d => d.val));

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="DEPOSIT" txtM={txtM}>
            <SlRow v={formatCurrency(baseAmount, currency, true)} dec={() => bump(() => setBaseAmount(Math.max(10000, baseAmount - 50000)))} inc={() => bump(() => setBaseAmount(baseAmount + 50000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YEARS" txtM={txtM}>
            <SlRow v={`${years}Y`} dec={() => bump(() => setYears(Math.max(1, years - 1)))} inc={() => bump(() => setYears(Math.min(20, years + 1)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>MATURITY VALUE COMPARISON</Text>
          {data.map((d, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.barIcon, { backgroundColor: d.color + '20' }]}><Icon name={d.icon} size={14} color={d.color} /></View>
                  <View><Text style={{ color: d.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{d.label}</Text><Text style={{ color: txtM, fontSize: 9 }}>{d.sub}</Text></View>
                </View>
                <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 14 }}>{formatCurrency(d.val, currency, true)}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[d.color, d.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(d.val / mx) * 100}%` }]} />
              </View>
            </View>
          ))}
          <Text style={{ color: txtM, fontSize: 10, textAlign: 'center', marginTop: 4 }}>Interest earned: {formatCurrency(fd - baseAmount, currency, true)} (FD) vs {formatCurrency(rd - baseAmount, currency, true)} (RD)</Text>
        </View>

        {scientistMode && (
          <Insight accent={accent} glass1={glass1} border={border} txt2={txt2}>
            FD is like a giant snowball you drop from the peak! ❄️ RD is like building a small snowball every month. Both grow, but the giant one picks up much more snow because it started bigger!
          </Insight>
        )}
      </View>
    );
  };

  // ── MODE B: Compound vs Simple ──
  const renderCompound = () => {
    const pts = 20;
    const principal = 100000;
    const sD = [], cD = [];
    for (let y = 0; y <= pts; y++) {
      sD.push(principal + principal * (cvsRate / 100) * y);
      cD.push(principal * Math.pow(1 + cvsRate / 100, y));
    }
    const mx = cD[pts];
    const path = (arr) => { let d = ''; arr.forEach((v, i) => { const x = (i / pts) * W; const y = (CH - 40) - (v / mx) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };
    const area = (arr) => `${path(arr)} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;
    const gap = cD[pts] - sD[pts];

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="INTEREST RATE" txtM={txtM}>
          <SlRow v={`${cvsRate}%`} dec={() => bump(() => setCvsRate(Math.max(2, cvsRate - 1)))} inc={() => bump(() => setCvsRate(Math.min(20, cvsRate + 1)))} t={txt1} g={glass2} />
        </Ctrl>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="compFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={accent} stopOpacity="0.3" /><Stop offset="1" stopColor={accent} stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            <Path d={area(cD)} fill="url(#compFill)" />
            <Path d={path(sD)} fill="none" stroke="#FFD166" strokeWidth="2" strokeDasharray="6,4" />
            <Path d={path(cD)} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <SvgText x={8} y={CH - 10} fill={txtM} fontSize="9">0Y</SvgText>
            <SvgText x={W - 8} y={CH - 10} fill={txtM} fontSize="9" textAnchor="end">20Y</SvgText>
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={[accent + '18', accent + '05']} style={[styles.resultCard, { borderColor: accent + '40' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>COMPOUND</Text>
            <Text style={[styles.resVal, { color: accent }]}>{formatCurrency(cD[pts], currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFD16618', '#FFD16605']} style={[styles.resultCard, { borderColor: '#FFD16640' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>SIMPLE</Text>
            <Text style={[styles.resVal, { color: '#FFD166' }]}>{formatCurrency(sD[pts], currency, true)}</Text>
          </LinearGradient>
        </View>

        <LinearGradient colors={['#00E5A015', '#00E5A005']} style={[styles.gapCard, { borderColor: '#00E5A040' }]}>
          <Icon name="zap" size={16} color="#00E5A0" />
          <Text style={{ color: '#00E5A0', fontFamily: FONTS.displayBold, fontSize: 13, flex: 1 }}>
            Compound advantage: +{formatCurrency(gap, currency, true)} extra over 20 years on just {formatCurrency(principal, currency, true)}!
          </Text>
        </LinearGradient>
      </View>
    );
  };

  // ── MODE C: EMI Calculator ──
  const renderEMI = () => {
    const P = loanAmt;
    const r = (loanRate / 100) / 12;
    const n = loanYears * 12;
    const EMI = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPay = EMI * n;
    const totalInt = totalPay - P;
    const intPct = (totalInt / totalPay) * 100;

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 2 }} label="LOAN AMOUNT" txtM={txtM}>
            <SlRow v={formatCurrency(loanAmt, currency, true)} dec={() => bump(() => setLoanAmt(Math.max(100000, loanAmt - 100000)))} inc={() => bump(() => setLoanAmt(loanAmt + 100000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="RATE" txtM={txtM}>
            <SlRow v={`${loanRate}%`} dec={() => bump(() => setLoanRate(Math.max(5, loanRate - 1)))} inc={() => bump(() => setLoanRate(Math.min(24, loanRate + 1)))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YEARS" txtM={txtM}>
            <SlRow v={`${loanYears}Y`} dec={() => bump(() => setLoanYears(Math.max(1, loanYears - 1)))} inc={() => bump(() => setLoanYears(Math.min(30, loanYears + 1)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 20, marginTop: 12, alignItems: 'center' }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>MONTHLY EMI</Text>
          <Text style={{ color: '#FF6B9D', fontSize: 36, fontFamily: FONTS.displayBold, marginVertical: 8 }}>{formatCurrency(EMI, currency)}</Text>

          <View style={{ flexDirection: 'row', width: '100%', marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: txtM, fontSize: 10 }}>Principal</Text>
              <Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 16 }}>{formatCurrency(P, currency, true)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: txtM, fontSize: 10 }}>Interest Paid</Text>
              <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 16 }}>{formatCurrency(totalInt, currency, true)}</Text>
            </View>
          </View>

          <View style={[styles.stackedBar, { marginTop: 12 }]}>
            <LinearGradient colors={[accent, accent + '80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${100 - intPct}%`, height: '100%' }} />
            <LinearGradient colors={['#FF4444', '#FF444480']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${intPct}%`, height: '100%' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
            <Text style={{ color: accent, fontSize: 10 }}>Principal {(100 - intPct).toFixed(0)}%</Text>
            <Text style={{ color: '#FF4444', fontSize: 10 }}>Interest {intPct.toFixed(0)}%</Text>
          </View>
        </View>

        <Insight accent="#FF4444" glass1={glass1} border="#FF444420" txt2={txt2}>
          You're paying for TWO houses but only getting ONE! 🏘️ The bank takes almost a second house worth of interest. Prepaying just ONE extra EMI a year can save you a fortune! 💸
        </Insight>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CurrencyToggle currentCurrency={currency} onCurrencyChange={setCurrency} />
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(tab => {
          const a = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} onPress={() => handleTab(tab.id)} style={styles.tab}>
              <LinearGradient colors={a ? [accent + '25', accent + '08'] : ['transparent', 'transparent']} style={[styles.tabInner, a && { borderColor: accent + '60' }]}>
                <Icon name={tab.icon} size={14} color={a ? accent : txtM} />
                <Text style={[styles.tabTxt, { color: a ? accent : txtM }]}>{tab.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        {activeTab === 'A' && renderAccounts()}
        {activeTab === 'B' && renderCompound()}
        {activeTab === 'C' && renderEMI()}
      </View>
    </View>
  );
}

function Ctrl({ children, border, glass1, label, txtM, style = {} }) { return (<View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}><Text style={[styles.cLabel, { color: txtM }]} numberOfLines={1}>{label}</Text>{children}</View>); }
function SlRow({ v, dec, inc, t, g, s = false }) { return (<View style={styles.sliderRow}><TouchableOpacity onPress={dec} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 14 }}>−</Text></TouchableOpacity><Text style={[s ? styles.vSm : styles.vLg, { color: t }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{v}</Text><TouchableOpacity onPress={inc} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 14 }}>+</Text></TouchableOpacity></View>); }
function Insight({ children, accent, glass1, border, txt2 }) { return (<View style={[styles.insightBox, { backgroundColor: glass1, borderColor: border }]}><View style={[styles.insightIcon, { backgroundColor: accent + '15' }]}><Icon name="lightbulb" size={14} color={accent} /></View><Text style={[styles.insightText, { color: txt2 }]}>{children}</Text></View>); }

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16, paddingHorizontal: 12, gap: 6 },
  tab: { flex: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'transparent' },
  tabTxt: { fontFamily: FONTS.displayBold, fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: SPACING.md },
  chartBox: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
  controlBox: { padding: 10, borderWidth: 1, borderRadius: RADIUS.lg, marginBottom: 4, minWidth: 0 },
  cLabel: { fontFamily: FONTS.displayBold, fontSize: 9, letterSpacing: 1, marginBottom: 6 },
  controlGrid: { flexDirection: 'row', gap: 4 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 },
  btn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  vLg: { fontSize: 18, fontFamily: FONTS.displayBold, flexShrink: 1, minWidth: 0, textAlign: 'center' },
  vSm: { fontSize: 11, fontFamily: FONTS.displayMedium, flexShrink: 1, minWidth: 0, textAlign: 'center' },
  resultRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  resultCard: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center', gap: 4 },
  resLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  resVal: { fontFamily: FONTS.displayBold, fontSize: 18 },
  barIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  stackedBar: { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', width: '100%' },
  gapCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
