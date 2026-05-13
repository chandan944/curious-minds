import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLG, Stop, Text as SvgText, Rect, Line, G } from 'react-native-svg';
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
  { id: 'A', label: 'SIP vs Lump', icon: 'chart' },
  { id: 'B', label: 'Allocation', icon: 'target' },
  { id: 'C', label: 'Early Start', icon: 'clock' },
];

const PRESETS = [
  { label: 'Safe', eq: 20, color: '#4ECDC4' },
  { label: 'Balanced', eq: 60, color: '#FFD166' },
  { label: 'Aggressive', eq: 90, color: '#FF6B9D' },
];

export default function InvestingLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#FF9F1C';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [totalInvest, setTotalInvest] = useState(1200000);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [equityPct, setEquityPct] = useState(60);
  const [sipMonthly, setSipMonthly] = useState(10000);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); Animated.sequence([Animated.spring(pulseAnim, { toValue: 0.96, tension: 300, friction: 8, useNativeDriver: true }), Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true })]).start(); };

  const polar = (cx, cy, r, deg) => { const rad = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; };
  const arcPath = (cx, cy, r, s, e) => { const st = polar(cx, cy, r, e), en = polar(cx, cy, r, s); return `M ${cx} ${cy} L ${st.x} ${st.y} A ${r} ${r} 0 ${e - s <= 180 ? '0' : '1'} 0 ${en.x} ${en.y} Z`; };

  // ── MODE A: SIP vs Lumpsum ──
  const renderSIP = () => {
    const months = years * 12;
    const mr = (returnRate / 100) / 12;
    const mSip = totalInvest / months;
    const sipD = [], lumpD = [];
    let cS = 0, cL = totalInvest;
    for (let m = 0; m <= months; m++) {
      if (m % 12 === 0) { sipD.push(cS); lumpD.push(cL); }
      cS = (cS + mSip) * (1 + mr);
      cL = cL * (1 + mr);
    }
    const mx = Math.max(lumpD[years], sipD[years]);
    const path = (arr, color) => {
      let d = '';
      arr.forEach((v, i) => {
        const x = (i / years) * W;
        const y = (CH - 40) - ((v / mx) * (CH - 70));
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      });
      return d;
    };
    const area = (arr) => `${path(arr)} L ${W} ${CH - 40} L 0 ${CH - 40} Z`;

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="TOTAL INVEST" txtM={txtM}>
            <SlRow v={formatCurrency(totalInvest, currency, true)} dec={() => bump(() => setTotalInvest(Math.max(120000, totalInvest - 120000)))} inc={() => bump(() => setTotalInvest(totalInvest + 120000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YEARS" txtM={txtM}>
            <SlRow v={`${years}Y`} dec={() => bump(() => setYears(Math.max(1, years - 1)))} inc={() => bump(() => setYears(Math.min(30, years + 1)))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="RATE" txtM={txtM}>
            <SlRow v={`${returnRate}%`} dec={() => bump(() => setReturnRate(Math.max(1, returnRate - 1)))} inc={() => bump(() => setReturnRate(Math.min(20, returnRate + 1)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="sipFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#4ECDC4" stopOpacity="0.3" /><Stop offset="1" stopColor="#4ECDC4" stopOpacity="0" /></SvgLG>
              <SvgLG id="lumpFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={accent} stopOpacity="0.2" /><Stop offset="1" stopColor={accent} stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            <Path d={area(lumpD)} fill="url(#lumpFill)" />
            <Path d={area(sipD)} fill="url(#sipFill)" />
            <Path d={path(lumpD)} fill="none" stroke={accent} strokeWidth="2.5" strokeDasharray="6,4" />
            <Path d={path(sipD)} fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={[accent + '18', accent + '05']} style={[styles.resultCard, { borderColor: accent + '40' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>LUMPSUM</Text>
            <Text style={[styles.resVal, { color: accent }]}>{formatCurrency(lumpD[years], currency, true)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#4ECDC418', '#4ECDC405']} style={[styles.resultCard, { borderColor: '#4ECDC440' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>SIP</Text>
            <Text style={[styles.resVal, { color: '#4ECDC4' }]}>{formatCurrency(sipD[years], currency, true)}</Text>
          </LinearGradient>
        </View>

        <Insight accent={accent} glass1={glass1} border={border} txt2={txt2}>
          SIP is the "Anti-Panic" button! 🛡️ While Lumpsum math is faster, SIP makes you buy MORE when the market crashes (on sale). It turns a scary crash into a wealth-building holiday! 🏖️
        </Insight>
      </View>
    );
  };

  // ── MODE B: Asset Allocation ──
  const renderAllocation = () => {
    const debtPct = 100 - equityPct;
    const expRet = (equityPct * 0.12 + debtPct * 0.06) / 100;
    const expRetPct = expRet * 100;
    const eqVol = 20, dVol = 5;
    const vol = Math.sqrt(Math.pow((equityPct / 100) * eqVol, 2) + Math.pow((debtPct / 100) * dVol, 2));
    const worst = expRetPct - 2 * vol;
    const cx = W / 2, cy = 110, R = 85;

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="EQUITY ALLOCATION" txtM={txtM}>
          <SlRow v={`${equityPct}%`} dec={() => bump(() => setEquityPct(Math.max(0, equityPct - 10)))} inc={() => bump(() => setEquityPct(Math.min(100, equityPct + 10)))} t={txt1} g={glass2} />
        </Ctrl>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 10, paddingHorizontal: 4 }}>
          {PRESETS.map(p => (
            <TouchableOpacity key={p.label} onPress={() => bump(() => setEquityPct(p.eq))}>
              <LinearGradient colors={equityPct === p.eq ? [p.color + '25', p.color + '10'] : [glass2, glass1]} style={[styles.preset, { borderColor: equityPct === p.eq ? p.color + '70' : border }]}>
                <Text style={{ color: equityPct === p.eq ? p.color : txtM, fontFamily: FONTS.displayMedium, fontSize: 12 }}>{p.label} ({p.eq}%)</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={W} height={220}>
            {equityPct > 0 && <Path d={arcPath(cx, cy, R, 0, (equityPct / 100) * 360)} fill="#00D4FF" fillOpacity={0.85} />}
            {debtPct > 0 && <Path d={arcPath(cx, cy, R, (equityPct / 100) * 360, 360)} fill="#A855F7" fillOpacity={0.85} />}
            <Circle cx={cx} cy={cy} r={R - 28} fill={cardBg} />
            <SvgText x={cx} y={cy - 5} fill={txtM} fontSize="10" textAnchor="middle">EQUITY</SvgText>
            <SvgText x={cx} y={cy + 14} fill="#00D4FF" fontSize="20" fontWeight="bold" textAnchor="middle">{equityPct}%</SvgText>
          </Svg>
        </Animated.View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00FF7F15', '#00FF7F05']} style={[styles.resultCard, { borderColor: '#00FF7F40' }]}>
            <Icon name="chart" size={14} color="#00FF7F" />
            <Text style={[styles.resLabel, { color: txtM }]}>Expected Return</Text>
            <Text style={[styles.resVal, { color: '#00FF7F' }]}>{expRetPct.toFixed(1)}%</Text>
          </LinearGradient>
          <LinearGradient colors={['#FF444415', '#FF444405']} style={[styles.resultCard, { borderColor: '#FF444440' }]}>
            <Icon name="alert" size={14} color="#FF4444" />
            <Text style={[styles.resLabel, { color: txtM }]}>Worst Year</Text>
            <Text style={[styles.resVal, { color: '#FF4444' }]}>{worst.toFixed(1)}%</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  // ── MODE C: Early Start ──
  const renderEarlyStart = () => {
    const rate = (12 / 100) / 12;
    const getFV = (startAge) => { let b = 0; for (let a = startAge; a < 60; a++) for (let m = 0; m < 12; m++) b = (b + sipMonthly) * (1 + rate); return b; };
    const v20 = getFV(20), v25 = getFV(25), v30 = getFV(30);
    const mx = v20;
    const bars = [
      { label: 'Start at 20', val: v20, color: '#00E5A0', icon: 'rocket' },
      { label: 'Start at 25', val: v25, color: '#FFD166', icon: 'clock' },
      { label: 'Start at 30', val: v30, color: '#FF4444', icon: 'alert' },
    ];

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="MONTHLY SIP (TILL AGE 60)" txtM={txtM}>
          <SlRow v={formatCurrency(sipMonthly, currency, true)} dec={() => bump(() => setSipMonthly(Math.max(1000, sipMonthly - 5000)))} inc={() => bump(() => setSipMonthly(sipMonthly + 5000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 11, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>WEALTH AT AGE 60</Text>
          {bars.map((b, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.barIcon, { backgroundColor: b.color + '20' }]}><Icon name={b.icon} size={14} color={b.color} /></View>
                  <Text style={{ color: b.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{b.label}</Text>
                </View>
                <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 14 }}>{formatCurrency(b.val, currency, true)}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[b.color, b.color + '80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(b.val / mx) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <LinearGradient colors={['#FF444420', '#FF444408']} style={[styles.lostCard, { borderColor: '#FF444440' }]}>
          <Icon name="alert" size={16} color="#FF4444" />
          <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 13, flex: 1 }}>
            Waiting 10 years costs you {formatCurrency(v20 - v30, currency, true)}!
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CurrencyToggle currentCurrency={currency} onCurrencyChange={setCurrency} />
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} onPress={() => handleTab(tab.id)} style={styles.tab}>
              <LinearGradient colors={active ? [accent + '25', accent + '08'] : ['transparent', 'transparent']} style={[styles.tabInner, active && { borderColor: accent + '60' }]}>
                <Icon name={tab.icon} size={14} color={active ? accent : txtM} />
                <Text style={[styles.tabTxt, { color: active ? accent : txtM }]}>{tab.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        {activeTab === 'A' && renderSIP()}
        {activeTab === 'B' && renderAllocation()}
        {activeTab === 'C' && renderEarlyStart()}
      </View>
    </View>
  );
}

function Ctrl({ children, border, glass1, label, txtM, style = {} }) {
  return (<View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}><Text style={[styles.cLabel, { color: txtM }]}>{label}</Text>{children}</View>);
}
function SlRow({ v, dec, inc, t, g, s = false }) {
  return (<View style={styles.sliderRow}><TouchableOpacity onPress={dec} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 14 }}>−</Text></TouchableOpacity><Text style={[s ? styles.vSm : styles.vLg, { color: t }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{v}</Text><TouchableOpacity onPress={inc} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 14 }}>+</Text></TouchableOpacity></View>);
}
function Insight({ children, accent, glass1, border, txt2 }) {
  return (<View style={[styles.insightBox, { backgroundColor: glass1, borderColor: border }]}><View style={[styles.insightIcon, { backgroundColor: accent + '15' }]}><Icon name="lightbulb" size={14} color={accent} /></View><Text style={[styles.insightText, { color: txt2 }]}>{children}</Text></View>);
}

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
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1 },
  barIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  lostCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
