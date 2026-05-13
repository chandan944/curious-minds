import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView, Switch } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLG, Stop, Text as SvgText, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import CurrencyToggle, { formatCurrency } from '../../components/ui/CurrencyToggle';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const W = width - 48;
const CH = 240;
const TABS = [
  { id: 'A', label: 'Tax Slabs', icon: 'chart' },
  { id: 'B', label: 'Optimizer', icon: 'settings' },
  { id: 'C', label: 'The Curve', icon: 'target' },
  { id: 'D', label: 'Wealth Loop', icon: 'rocket' },
];

export default function TaxationLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#FFD166';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [income, setIncome] = useState(1200000);
  const [has80C, setHas80C] = useState(false);
  const [has80D, setHas80D] = useState(false);
  const [hasHra, setHasHra] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); };

  const calcTax = (amt, isNew = true, ded = 0) => {
    let taxable = Math.max(0, amt - ded), tax = 0;
    const slabs = [];
    if (isNew) {
      const brackets = [[1500000, 0.30], [1200000, 0.20], [900000, 0.15], [600000, 0.10], [300000, 0.05]];
      brackets.forEach(([thresh, rate]) => { if (taxable > thresh) { const a = taxable - thresh; tax += a * rate; slabs.unshift({ label: `${rate * 100}%`, tax: a * rate, income: a }); taxable = thresh; } });
      if (taxable > 0) slabs.unshift({ label: '0%', tax: 0, income: taxable });
      if (amt <= 700000) { tax = 0; slabs.forEach(s => s.tax = 0); }
    } else {
      const brackets = [[1000000, 0.30], [500000, 0.20], [250000, 0.05]];
      brackets.forEach(([thresh, rate]) => { if (taxable > thresh) { const a = taxable - thresh; tax += a * rate; slabs.unshift({ label: `${rate * 100}%`, tax: a * rate, income: a }); taxable = thresh; } });
      if (taxable > 0) slabs.unshift({ label: '0%', tax: 0, income: taxable });
      if ((amt - ded) <= 500000) { tax = 0; slabs.forEach(s => s.tax = 0); }
    }
    return { totalTax: tax * 1.04, baseTax: tax, slabs, cess: tax * 0.04 };
  };

  const renderSlabs = () => {
    const { slabs, totalTax } = calcTax(income);
    const effRate = income > 0 ? ((totalTax / income) * 100).toFixed(1) : '0';
    const colors = ['#00E5A0', '#4ECDC4', '#FFD166', '#FF9F1C', '#FF6B9D', '#FF4444'];
    const mx = Math.max(...slabs.map(s => s.income), 1);

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="ANNUAL INCOME" txtM={txtM}>
          <SlRow v={formatCurrency(income, currency, true)} dec={() => bump(() => setIncome(Math.max(300000, income - 100000)))} inc={() => bump(() => setIncome(income + 100000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>MARGINAL TAX SLABS (NEW REGIME)</Text>
          {slabs.map((s, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors[i] || txtM, fontFamily: FONTS.displayMedium, fontSize: 12 }}>{s.label} slab</Text>
                <Text style={{ color: s.tax === 0 ? '#00E5A0' : '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12 }}>{formatCurrency(s.tax, currency, true)}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[colors[i] || '#888', (colors[i] || '#888') + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(s.income / mx) * 100}%` }]} />
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: border, paddingTop: 12, marginTop: 8 }}>
            <View><Text style={{ color: txtM, fontSize: 10 }}>TOTAL TAX</Text><Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 20 }}>{formatCurrency(totalTax, currency)}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ color: txtM, fontSize: 10 }}>EFFECTIVE RATE</Text><Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 20 }}>{effRate}%</Text></View>
          </View>
        </View>
      </View>
    );
  };

  const renderOptimizer = () => {
    let ded = 0;
    if (has80C) ded += 150000;
    if (has80D) ded += 50000;
    if (hasHra) ded += 200000;
    const noOpt = calcTax(income, false, 0).totalTax;
    const withOpt = calcTax(income, false, ded).totalTax;
    const saved = noOpt - withOpt;
    const deductions = [
      { label: '80C Investments', sub: 'PPF, ELSS, EPF (Max ₹1.5L)', val: has80C, set: setHas80C, color: '#00E5A0' },
      { label: '80D Health', sub: 'Health Insurance (Max ₹50k)', val: has80D, set: setHas80D, color: '#4ECDC4' },
      { label: 'HRA Rent', sub: 'House Rent Allowance (~₹2L)', val: hasHra, set: setHasHra, color: '#A855F7' },
    ];

    return (
      <View>
        <Text style={{ color: txt2, fontSize: 12, marginBottom: 12 }}>Income: {formatCurrency(income, currency)} — Old Regime</Text>
        {deductions.map((d, i) => (
          <LinearGradient key={i} colors={d.val ? [d.color + '15', d.color + '05'] : [glass1, glass1]} style={[styles.deductCard, { borderColor: d.val ? d.color + '50' : border }]}>
            <View style={[styles.barIcon, { backgroundColor: d.color + '20' }]}><Icon name="shield" size={14} color={d.color} /></View>
            <View style={{ flex: 1 }}><Text style={{ color: txt1, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{d.label}</Text><Text style={{ color: txtM, fontSize: 10 }}>{d.sub}</Text></View>
            <Switch value={d.val} onValueChange={v => { soundTap(); d.set(v); }} trackColor={{ true: d.color, false: glass2 }} thumbColor="#FFF" />
          </LinearGradient>
        ))}

        <View style={styles.resultRow}>
          <LinearGradient colors={['#FF444418', '#FF444405']} style={[styles.resultCard, { borderColor: '#FF444440' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>No Planning</Text>
            <Text style={[styles.resVal, { color: '#FF4444' }]}>{formatCurrency(noOpt, currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#00E5A018', '#00E5A005']} style={[styles.resultCard, { borderColor: '#00E5A040' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>Optimized</Text>
            <Text style={[styles.resVal, { color: '#00E5A0' }]}>{formatCurrency(withOpt, currency, true)}</Text>
          </LinearGradient>
        </View>

        {saved > 0 && (
          <LinearGradient colors={[accent + '18', accent + '05']} style={[styles.savedCard, { borderColor: accent + '40' }]}>
            <Icon name="star" size={16} color={accent} />
            <Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 14, flex: 1 }}>You saved {formatCurrency(saved, currency)}!</Text>
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderCurve = () => {
    const pts = [];
    for (let inc = 300000; inc <= 3000000; inc += 100000) pts.push({ inc, eff: (calcTax(inc, true, 0).totalTax / inc) * 100 });
    const maxEff = 30;
    const line = () => { let d = ''; pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * W; const y = (CH - 40) - (p.eff / maxEff) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };
    const area = () => `${line()} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;

    return (
      <View>
        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Svg width={W} height={CH}>
            <Defs><SvgLG id="curveF" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={accent} stopOpacity="0.35" /><Stop offset="1" stopColor={accent} stopOpacity="0" /></SvgLG></Defs>
            {[10, 20].map(v => { const y = (CH - 40) - (v / maxEff) * (CH - 70); return (<Line key={v} x1={0} y1={y} x2={W} y2={y} stroke={border} strokeDasharray="4,4" />); })}
            <Path d={area()} fill="url(#curveF)" />
            <Path d={line()} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <SvgText x={8} y={CH - 10} fill={txtM} fontSize="9">₹3L</SvgText>
            <SvgText x={W / 2} y={CH - 10} fill={txtM} fontSize="9" textAnchor="middle">₹15L</SvgText>
            <SvgText x={W - 8} y={CH - 10} fill={txtM} fontSize="9" textAnchor="end">₹30L</SvgText>
          </Svg>
        </Animated.View>
        <Insight accent={accent} glass1={glass1} border={border} txt2={txt2}>
          The 'Bucket' system protects you! 🪣 Because your bottom money is always free or cheap, it takes a massive salary to even reach a 20% total tax rate. The government only bites the money that spills into the top buckets! 🏛️
        </Insight>
      </View>
    );
  };

  const renderWealthLoop = () => {
    const annSav = 150000 * 0.30;
    const rate = 0.12;
    const calcFV = y => annSav * ((Math.pow(1 + rate, y) - 1) / rate);
    const yrs = [0, 5, 10, 15, 20];
    const mx = calcFV(20);

    return (
      <View>
        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16 }]}>
          <Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>THE WEALTH LOOP</Text>
          <Text style={{ color: txt2, fontSize: 11, marginBottom: 16 }}>Invest your ₹45,000/yr tax savings into Index Fund @ 12%:</Text>
          {yrs.map((y, i) => {
            const val = calcFV(y);
            return (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#00E5A0', fontFamily: FONTS.displayMedium, fontSize: 12 }}>{y} Years</Text>
                  <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 12 }}>{y === 0 ? '₹0' : formatCurrency(val, currency, true)}</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                  <LinearGradient colors={['#00E5A0', '#00E5A060']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${Math.max(2, (val / mx) * 100)}%` }]} />
                </View>
              </View>
            );
          })}
          <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 12, marginTop: 8 }}>
            <Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 16, textAlign: 'center' }}>20-Year Result: {formatCurrency(calcFV(20), currency)}</Text>
          </View>
        </View>
        <LinearGradient colors={['#FF6B9D18', '#FF6B9D05']} style={[styles.savedCard, { borderColor: '#FF6B9D40' }]}>
          <Icon name="zap" size={16} color="#FF6B9D" />
          <Text style={{ color: txt2, fontSize: 12, flex: 1, lineHeight: 18 }}>Turning a Bill into a Fortune! 💸 Instead of treating a tax refund like a bonus, use it to buy more 'Money Trees.' This loop creates a <Text style={{ color: '#FF6B9D', fontFamily: FONTS.displayBold }}>tax-funded retirement</Text>! 🌳</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CurrencyToggle currentCurrency={currency} onCurrencyChange={setCurrency} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabScroll, { borderBottomColor: border }]}>
        <View style={styles.tabBar}>
          {TABS.map(tab => { const a = activeTab === tab.id; return (
            <TouchableOpacity key={tab.id} onPress={() => handleTab(tab.id)}>
              <LinearGradient colors={a ? [accent + '25', accent + '08'] : ['transparent', 'transparent']} style={[styles.tabInner, a && { borderColor: accent + '60' }]}>
                <Icon name={tab.icon} size={14} color={a ? accent : txtM} />
                <Text style={[styles.tabTxt, { color: a ? accent : txtM }]}>{tab.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ); })}
        </View>
      </ScrollView>
      <View style={styles.content}>
        {activeTab === 'A' && renderSlabs()}
        {activeTab === 'B' && renderOptimizer()}
        {activeTab === 'C' && renderCurve()}
        {activeTab === 'D' && renderWealthLoop()}
      </View>
    </View>
  );
}

function Ctrl({ children, border, glass1, label, txtM, style = {} }) { return (<View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}><Text style={[styles.cLabel, { color: txtM }]}>{label}</Text>{children}</View>); }
function SlRow({ v, dec, inc, t, g, s = false }) { return (<View style={styles.sliderRow}><TouchableOpacity onPress={dec} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>−</Text></TouchableOpacity><Text style={[s ? styles.vSm : styles.vLg, { color: t }]}>{v}</Text><TouchableOpacity onPress={inc} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>+</Text></TouchableOpacity></View>); }
function Insight({ children, accent, glass1, border, txt2 }) { return (<View style={[styles.insightBox, { backgroundColor: glass1, borderColor: border }]}><View style={[styles.insightIcon, { backgroundColor: accent + '15' }]}><Icon name="lightbulb" size={14} color={accent} /></View><Text style={[styles.insightText, { color: txt2 }]}>{children}</Text></View>); }

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  tabScroll: { borderBottomWidth: 1, marginBottom: 16 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 12, gap: 6 },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'transparent' },
  tabTxt: { fontFamily: FONTS.displayBold, fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: SPACING.md },
  chartBox: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
  controlBox: { padding: 14, borderWidth: 1, borderRadius: RADIUS.lg, marginBottom: 4 },
  cLabel: { fontFamily: FONTS.displayBold, fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  btn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  vLg: { fontSize: 20, fontFamily: FONTS.displayBold },
  vSm: { fontSize: 13, fontFamily: FONTS.displayMedium },
  resultRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  resultCard: { flex: 1, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center', gap: 4 },
  resLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10 },
  resVal: { fontFamily: FONTS.displayBold, fontSize: 18 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deductCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 6 },
  savedCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
