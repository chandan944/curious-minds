import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
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
const CH = 260;
const TABS = [
  { id: 'A', label: 'Compounding', icon: 'chart' },
  { id: 'B', label: 'Asset Loop', icon: 'target' },
  { id: 'C', label: 'Skill ROI', icon: 'rocket' },
];

export default function WealthLoopsLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#A855F7';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);
  const [monthlyAdd, setMonthlyAdd] = useState(10000);
  const [skillCost, setSkillCost] = useState(50000);
  const [salaryBump, setSalaryBump] = useState(20);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); Animated.sequence([Animated.spring(pulseAnim, { toValue: 0.96, tension: 300, friction: 8, useNativeDriver: true }), Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true })]).start(); };

  const renderCompounding = () => {
    const compD = [], linD = [];
    for (let y = 0; y <= years; y++) {
      compD.push(principal * Math.pow(1 + rate / 100, y));
      linD.push(principal + principal * (rate / 100) * y);
    }
    const mx = compD[years];
    const path = (arr) => { let d = ''; arr.forEach((v, i) => { const x = (i / years) * W; const y = (CH - 40) - (v / mx) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };
    const area = (arr) => `${path(arr)} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;
    const compGain = compD[years] - linD[years];

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 2 }} label="START AMOUNT" txtM={txtM}>
            <SlRow v={formatCurrency(principal, currency, true)} dec={() => bump(() => setPrincipal(Math.max(10000, principal - 50000)))} inc={() => bump(() => setPrincipal(principal + 50000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="RATE" txtM={txtM}>
            <SlRow v={`${rate}%`} dec={() => bump(() => setRate(Math.max(2, rate - 2)))} inc={() => bump(() => setRate(Math.min(24, rate + 2)))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YEARS" txtM={txtM}>
            <SlRow v={`${years}Y`} dec={() => bump(() => setYears(Math.max(2, years - 5)))} inc={() => bump(() => setYears(Math.min(40, years + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="compF" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={accent} stopOpacity="0.35" /><Stop offset="1" stopColor={accent} stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            <Path d={area(compD)} fill="url(#compF)" />
            <Path d={path(linD)} fill="none" stroke="#FFD166" strokeWidth="2" strokeDasharray="6,4" />
            <Path d={path(compD)} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <SvgText x={8} y={CH - 10} fill={txtM} fontSize="9">0</SvgText>
            <SvgText x={W - 8} y={CH - 10} fill={txtM} fontSize="9" textAnchor="end">{years}Y</SvgText>
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={[accent + '18', accent + '05']} style={[styles.resultCard, { borderColor: accent + '40' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>COMPOUND</Text>
            <Text style={[styles.resVal, { color: accent }]}>{formatCurrency(compD[years], currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFD16618', '#FFD16605']} style={[styles.resultCard, { borderColor: '#FFD16640' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>LINEAR</Text>
            <Text style={[styles.resVal, { color: '#FFD166' }]}>{formatCurrency(linD[years], currency, true)}</Text>
          </LinearGradient>
        </View>

        <LinearGradient colors={['#00E5A015', '#00E5A005']} style={[styles.alertCard, { borderColor: '#00E5A040' }]}>
          <Icon name="zap" size={16} color="#00E5A0" />
          <Text style={{ color: '#00E5A0', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
            The Magic Snowball! ⛄ Compounding is like a snowball that gets bigger as it rolls. Linear growth is just adding one snowflake at a time. After {years} years, the snowball is {((compGain / linD[years]) * 100).toFixed(0)}% BIGGER than the pile of snowflakes! ❄️🚀
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderAssetLoop = () => {
    const mr = (rate / 100) / 12;
    let noAdd = principal, withAdd = principal;
    const noD = [principal], wiD = [principal];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) { noAdd = noAdd * (1 + mr); withAdd = (withAdd + monthlyAdd) * (1 + mr); }
      noD.push(noAdd); wiD.push(withAdd);
    }
    const mx = wiD[years];
    const path = (arr) => { let d = ''; arr.forEach((v, i) => { const x = (i / years) * W; const y = (CH - 40) - (v / mx) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };
    const area = (arr) => `${path(arr)} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="MONTHLY ADDITION (ACTIVE LOOP)" txtM={txtM}>
          <SlRow v={formatCurrency(monthlyAdd, currency, true)} dec={() => bump(() => setMonthlyAdd(Math.max(0, monthlyAdd - 5000)))} inc={() => bump(() => setMonthlyAdd(monthlyAdd + 5000))} t={txt1} g={glass2} />
        </Ctrl>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="loopF" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#00E5A0" stopOpacity="0.3" /><Stop offset="1" stopColor="#00E5A0" stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            <Path d={area(wiD)} fill="url(#loopF)" />
            <Path d={path(noD)} fill="none" stroke="#FFD166" strokeWidth="2" strokeDasharray="6,4" />
            <Path d={path(wiD)} fill="none" stroke="#00E5A0" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00E5A018', '#00E5A005']} style={[styles.resultCard, { borderColor: '#00E5A040' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>WITH LOOP</Text>
            <Text style={[styles.resVal, { color: '#00E5A0' }]}>{formatCurrency(wiD[years], currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFD16618', '#FFD16605']} style={[styles.resultCard, { borderColor: '#FFD16640' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>WITHOUT</Text>
            <Text style={[styles.resVal, { color: '#FFD166' }]}>{formatCurrency(noD[years], currency, true)}</Text>
          </LinearGradient>
        </View>

        <Insight accent="#00E5A0" glass1={glass1} border={border} txt2={txt2}>
          Feeding the Engine! ⚙️ Each monthly addition is like dropping high-grade fuel into your wealth machine. By the end, the extra fuel creates a massive {formatCurrency(wiD[years] - noD[years], currency, true)} of wealth that wouldn't exist otherwise! ⛽📈
        </Insight>
      </View>
    );
  };

  const renderSkillROI = () => {
    const baseSalary = 600000;
    const bumpedSalary = baseSalary * (1 + salaryBump / 100);
    const extraPerYear = bumpedSalary - baseSalary;
    const bars = [1, 2, 3, 5, 10];
    const mx = extraPerYear * 10;

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="SKILL COST" txtM={txtM}>
            <SlRow v={formatCurrency(skillCost, currency, true)} dec={() => bump(() => setSkillCost(Math.max(5000, skillCost - 10000)))} inc={() => bump(() => setSkillCost(skillCost + 10000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="SALARY BUMP" txtM={txtM}>
            <SlRow v={`+${salaryBump}%`} dec={() => bump(() => setSalaryBump(Math.max(5, salaryBump - 5)))} inc={() => bump(() => setSalaryBump(Math.min(100, salaryBump + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 4 }}>CUMULATIVE EXTRA INCOME (ROI ON SKILL)</Text>
          <Text style={{ color: txt2, fontSize: 11, marginBottom: 16 }}>Base: ₹6L/yr → With skill: {formatCurrency(bumpedSalary, currency, true)}/yr</Text>

          {bars.map((y, i) => {
            const gain = extraPerYear * y;
            const roi = ((gain - skillCost) / skillCost * 100).toFixed(0);
            const positive = gain > skillCost;
            return (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: accent, fontFamily: FONTS.displayMedium, fontSize: 12 }}>Year {y}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 12 }}>{formatCurrency(gain, currency, true)}</Text>
                    <Text style={{ color: positive ? '#00E5A0' : '#FF4444', fontSize: 10, fontFamily: FONTS.displayBold }}>{positive ? '+' : ''}{roi}% ROI</Text>
                  </View>
                </View>
                <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                  <LinearGradient colors={positive ? ['#00E5A0', '#00E5A060'] : ['#FF4444', '#FF444460']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${Math.max(3, (gain / mx) * 100)}%` }]} />
                </View>
              </View>
            );
          })}

          <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 12, marginTop: 4, alignItems: 'center' }}>
            <Text style={{ color: accent, fontFamily: FONTS.displayBold, fontSize: 14 }}>10-Year Total: {formatCurrency(extraPerYear * 10, currency)}</Text>
            <Text style={{ color: txtM, fontSize: 11 }}>on a {formatCurrency(skillCost, currency)} investment</Text>
          </View>
        </View>

        <LinearGradient colors={[accent + '18', accent + '05']} style={[styles.alertCard, { borderColor: accent + '40' }]}>
          <Icon name="rocket" size={16} color={accent} />
          <Text style={{ color: txt2, fontSize: 12, flex: 1, lineHeight: 18 }}>
            The Ultimate Money Tree! 🌳 While a stock might give you 10% profit, a new skill can give you a 500% raise! Your brain is the most powerful wealth-loop in the world. Invest in yourself first! 🧠💎
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
        {activeTab === 'A' && renderCompounding()}
        {activeTab === 'B' && renderAssetLoop()}
        {activeTab === 'C' && renderSkillROI()}
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
  resVal: { fontFamily: FONTS.displayBold, fontSize: 16 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
