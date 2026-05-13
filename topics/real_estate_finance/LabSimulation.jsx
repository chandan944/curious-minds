import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLG, Stop, Text as SvgText, Line, G } from 'react-native-svg';
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
  { id: 'A', label: 'Loan Cost', icon: 'home' },
  { id: 'B', label: 'Rent v Buy', icon: 'balance' },
  { id: 'C', label: 'Yield', icon: 'chart' },
];

export default function RealEstateLab({ scientistMode = false }) {
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
  const [housePrice, setHousePrice] = useState(10000000);
  const [downPct, setDownPct] = useState(20);
  const [loanYears, setLoanYears] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(30000);
  const [rentIncome, setRentIncome] = useState(40000);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); };

  const polar = (cx, cy, r, deg) => { const rad = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; };
  const arcP = (cx, cy, r, s, e) => { const st = polar(cx, cy, r, e), en = polar(cx, cy, r, s); return `M ${cx} ${cy} L ${st.x} ${st.y} A ${r} ${r} 0 ${e - s <= 180 ? '0' : '1'} 0 ${en.x} ${en.y} Z`; };

  const renderLoanCost = () => {
    const rate = 8.5, dp = housePrice * downPct / 100, loan = housePrice - dp;
    const r = (rate / 100) / 12, n = loanYears * 12;
    const EMI = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPaid = EMI * n, totalInt = totalPaid - loan, totalCost = dp + loan + totalInt;
    const data = [
      { label: 'Down Payment', val: dp, color: '#00E5A0', icon: 'shield' },
      { label: 'Loan Principal', val: loan, color: '#00D4FF', icon: 'home' },
      { label: 'Bank Interest', val: totalInt, color: '#FF4444', icon: 'alert' },
    ];
    const cx = W / 2, cy = 110, R = 85;
    let ang = 0;

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 2 }} label="HOUSE PRICE" txtM={txtM}>
            <SlRow v={formatCurrency(housePrice, currency, true)} dec={() => bump(() => setHousePrice(Math.max(2000000, housePrice - 1000000)))} inc={() => bump(() => setHousePrice(housePrice + 1000000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="DOWN %" txtM={txtM}>
            <SlRow v={`${downPct}%`} dec={() => bump(() => setDownPct(Math.max(5, downPct - 5)))} inc={() => bump(() => setDownPct(Math.min(50, downPct + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Svg width={W} height={220}>
            {data.map((d, i) => { const a = (d.val / totalCost) * 360; const path = arcP(cx, cy, R, ang, ang + a); ang += a; return <Path key={i} d={path} fill={d.color} fillOpacity={0.85} />; })}
            <Circle cx={cx} cy={cy} r={R - 28} fill={cardBg} />
            <SvgText x={cx} y={cy - 5} fill={txtM} fontSize="10" textAnchor="middle">TRUE COST</SvgText>
            <SvgText x={cx} y={cy + 14} fill={txt1} fontSize="14" fontWeight="bold" textAnchor="middle">{formatCurrency(totalCost, currency, true)}</SvgText>
          </Svg>
        </View>

        <View style={styles.legendRow}>
          {data.map((d, i) => (
            <LinearGradient key={i} colors={[d.color + '15', d.color + '05']} style={[styles.legendCard, { borderColor: d.color + '40' }]}>
              <Icon name={d.icon} size={14} color={d.color} />
              <Text style={{ color: txtM, fontSize: 9, fontFamily: FONTS.bodyMedium }}>{d.label}</Text>
              <Text style={{ color: d.color, fontFamily: FONTS.displayBold, fontSize: 13 }}>{formatCurrency(d.val, currency, true)}</Text>
            </LinearGradient>
          ))}
        </View>

        <LinearGradient colors={['#FF444418', '#FF444405']} style={[styles.alertCard, { borderColor: '#FF444440' }]}>
          <Icon name="alert" size={16} color="#FF4444" />
          <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
            The Sticker Price is a Lie! 🛑 Between interest and taxes, you're actually paying {formatCurrency(totalCost, currency, true)} for this house. That's {((totalCost / housePrice - 1) * 100).toFixed(0)}% extra! Make sure your investment can grow faster than the bank's appetite! 📈
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderRentVsBuy = () => {
    const rate = 8.5, dp = housePrice * downPct / 100, loan = housePrice - dp;
    const r = (rate / 100) / 12, n = loanYears * 12;
    const EMI = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const maint = housePrice * 0.002, totalBuy = EMI + maint;
    const diff = totalBuy - monthlyRent;
    const buyD = [], rentD = [];
    let rW = dp;
    for (let y = 0; y <= loanYears; y++) {
      const hV = housePrice * Math.pow(1.05, y);
      const mP = y * 12;
      const rem = mP >= n ? 0 : loan * (Math.pow(1 + r, n) - Math.pow(1 + r, mP)) / (Math.pow(1 + r, n) - 1);
      buyD.push(hV - rem);
      if (y > 0) for (let m = 0; m < 12; m++) rW = (rW + Math.max(0, diff)) * (1 + 0.10 / 12);
      rentD.push(rW);
    }
    const mx = Math.max(buyD[loanYears], rentD[loanYears]);
    const path = (arr) => { let d = ''; arr.forEach((v, i) => { const x = (i / loanYears) * W; const y = (CH - 40) - (v / mx) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };
    const area = (arr) => `${path(arr)} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;
    const buyWins = buyD[loanYears] > rentD[loanYears];

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="MONTHLY RENT" txtM={txtM}>
          <SlRow v={formatCurrency(monthlyRent, currency)} dec={() => bump(() => setMonthlyRent(Math.max(5000, monthlyRent - 5000)))} inc={() => bump(() => setMonthlyRent(monthlyRent + 5000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="buyF" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#00D4FF" stopOpacity="0.25" /><Stop offset="1" stopColor="#00D4FF" stopOpacity="0" /></SvgLG>
              <SvgLG id="rentF" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#A855F7" stopOpacity="0.2" /><Stop offset="1" stopColor="#A855F7" stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            <Path d={area(buyD)} fill="url(#buyF)" />
            <Path d={area(rentD)} fill="url(#rentF)" />
            <Path d={path(buyD)} fill="none" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" />
            <Path d={path(rentD)} fill="none" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="6,4" />
            <SvgText x={8} y={CH - 10} fill={txtM} fontSize="9">Now</SvgText>
            <SvgText x={W - 8} y={CH - 10} fill={txtM} fontSize="9" textAnchor="end">{loanYears}Y</SvgText>
          </Svg>
        </View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00D4FF18', '#00D4FF05']} style={[styles.resultCard, { borderColor: '#00D4FF40' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>BUY (Equity)</Text>
            <Text style={[styles.resVal, { color: '#00D4FF' }]}>{formatCurrency(buyD[loanYears], currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#A855F718', '#A855F705']} style={[styles.resultCard, { borderColor: '#A855F740' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>RENT+INVEST</Text>
            <Text style={[styles.resVal, { color: '#A855F7' }]}>{formatCurrency(rentD[loanYears], currency, true)}</Text>
          </LinearGradient>
        </View>

        <Insight accent={buyWins ? '#00D4FF' : '#A855F7'} glass1={glass1} border={border} txt2={txt2}>
          {buyWins ? 'The Landlord Wins! 🏠 Your "Empire" is growing faster than the stock market could ever dream. The mix of rent and appreciation is unbeatable! 🏰' : 'The Nomad Wins! 💻 Renting and investing the difference in the Stock Market actually builds MORE wealth than owning the bricks. Freedom and profit! 🚀'}
        </Insight>
      </View>
    );
  };

  const renderYield = () => {
    const annRent = rentIncome * 12;
    const grossY = (annRent / housePrice) * 100;
    const netRent = rentIncome * 10;
    const netY = (netRent / housePrice) * 100;
    const benchmarks = [{ label: 'Bank FD', val: 7, color: '#FFD166' }, { label: 'Index Fund', val: 10, color: '#00E5A0' }];

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="MONTHLY RENT COLLECTED" txtM={txtM}>
          <SlRow v={formatCurrency(rentIncome, currency)} dec={() => bump(() => setRentIncome(Math.max(5000, rentIncome - 5000)))} inc={() => bump(() => setRentIncome(rentIncome + 5000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>YIELD ON {formatCurrency(housePrice, currency, true)} PROPERTY</Text>
          {[{ label: 'Gross Yield', val: grossY, color: '#FFD166' }, { label: 'Net Yield (After costs)', val: netY, color: '#00E5A0' }].map((d, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: d.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{d.label}</Text>
                <Text style={{ color: d.color, fontFamily: FONTS.displayBold, fontSize: 16 }}>{d.val.toFixed(2)}%</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[d.color, d.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${Math.min(100, d.val * 8)}%` }]} />
              </View>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 12, marginTop: 4 }}>
            <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, marginBottom: 8 }}>VS BENCHMARKS</Text>
            {benchmarks.map((b, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: b.color, fontSize: 11 }}>{b.label}</Text>
                  <Text style={{ color: b.color, fontFamily: FONTS.displayBold, fontSize: 12 }}>{b.val}%</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                  <LinearGradient colors={[b.color, b.color + '40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${b.val * 8}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <Insight accent={accent} glass1={glass1} border={border} txt2={txt2}>
          Is the "Headache" worth it? 🤕 A 2-3% yield is lower than a boring bank FD (7%)! Unless the land price triples, you might be working harder for less money. Sometimes, being a "passive" investor is smarter than being a busy landlord! 🧠
        </Insight>
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
        {activeTab === 'A' && renderLoanCost()}
        {activeTab === 'B' && renderRentVsBuy()}
        {activeTab === 'C' && renderYield()}
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
  resLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  resVal: { fontFamily: FONTS.displayBold, fontSize: 16 },
  legendRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  legendCard: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', gap: 4 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
