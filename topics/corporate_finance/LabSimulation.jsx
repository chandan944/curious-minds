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
  { id: 'A', label: 'Break Even', icon: 'chart' },
  { id: 'B', label: 'Runway', icon: 'clock' },
  { id: 'C', label: 'Dilution', icon: 'target' },
];

export default function CorporateFinanceLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#00E5A0';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [fixedCosts, setFixedCosts] = useState(100000);
  const [pricePerUnit, setPricePerUnit] = useState(1000);
  const [costPerUnit, setCostPerUnit] = useState(400);
  const [cashInBank, setCashInBank] = useState(5000000);
  const [monthlyBurn, setMonthlyBurn] = useState(500000);
  const [vcStake, setVcStake] = useState(20);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); };

  const polar = (cx, cy, r, deg) => { const rad = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; };
  const arcP = (cx, cy, r, s, e) => { const st = polar(cx, cy, r, e), en = polar(cx, cy, r, s); return `M ${cx} ${cy} L ${st.x} ${st.y} A ${r} ${r} 0 ${e - s <= 180 ? '0' : '1'} 0 ${en.x} ${en.y} Z`; };

  const renderBreakEven = () => {
    const cm = pricePerUnit - costPerUnit;
    const bep = cm > 0 ? fixedCosts / cm : 0;
    const maxU = bep === 0 ? 100 : Math.ceil(bep * 2);
    const costD = [], revD = [];
    for (let i = 0; i <= maxU; i += Math.max(1, Math.floor(maxU / 12))) { costD.push({ u: i, v: fixedCosts + costPerUnit * i }); revD.push({ u: i, v: pricePerUnit * i }); }
    costD.push({ u: maxU, v: fixedCosts + costPerUnit * maxU }); revD.push({ u: maxU, v: pricePerUnit * maxU });
    const mx = Math.max(costD[costD.length - 1].v, revD[revD.length - 1].v);
    const path = (arr) => { let d = ''; arr.forEach((pt, i) => { const x = (pt.u / maxU) * W; const y = (CH - 40) - (pt.v / mx) * (CH - 70); d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`; }); return d; };

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="FIXED MONTHLY COSTS" txtM={txtM}>
          <SlRow v={formatCurrency(fixedCosts, currency, true)} dec={() => bump(() => setFixedCosts(Math.max(10000, fixedCosts - 10000)))} inc={() => bump(() => setFixedCosts(fixedCosts + 10000))} t={txt1} g={glass2} />
        </Ctrl>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="SELL PRICE" txtM={txtM}>
            <SlRow v={formatCurrency(pricePerUnit, currency)} dec={() => bump(() => setPricePerUnit(Math.max(costPerUnit + 10, pricePerUnit - 100)))} inc={() => bump(() => setPricePerUnit(pricePerUnit + 100))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="COST TO MAKE" txtM={txtM}>
            <SlRow v={formatCurrency(costPerUnit, currency)} dec={() => bump(() => setCostPerUnit(Math.max(10, costPerUnit - 100)))} inc={() => bump(() => setCostPerUnit(Math.min(pricePerUnit - 10, costPerUnit + 100)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Svg width={W} height={CH}>
            <Defs>
              <SvgLG id="profitZ" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#00E5A0" stopOpacity="0.15" /><Stop offset="1" stopColor="#00E5A0" stopOpacity="0" /></SvgLG>
            </Defs>
            {[0,1,2,3].map(i => <Line key={i} x1={0} y1={30+i*55} x2={W} y2={30+i*55} stroke={border} />)}
            {bep > 0 && bep <= maxU && <Line x1={(bep / maxU) * W} y1={0} x2={(bep / maxU) * W} y2={CH} stroke="#FFD166" strokeWidth="2" strokeDasharray="6,4" />}
            <Path d={path(costD)} fill="none" stroke="#FF4444" strokeWidth="2.5" />
            <Path d={path(revD)} fill="none" stroke="#00E5A0" strokeWidth="3" strokeLinecap="round" />
            {bep > 0 && <SvgText x={Math.min((bep / maxU) * W + 5, W - 60)} y={CH - 15} fill="#FFD166" fontSize="10" fontWeight="bold">BEP: {Math.ceil(bep)} units</SvgText>}
          </Svg>
        </View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00E5A018', '#00E5A005']} style={[styles.resultCard, { borderColor: '#00E5A040' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>Margin/Unit</Text>
            <Text style={[styles.resVal, { color: '#00E5A0' }]}>{formatCurrency(cm, currency)}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFD16618', '#FFD16605']} style={[styles.resultCard, { borderColor: '#FFD16640' }]}>
            <Text style={[styles.resLabel, { color: txtM }]}>Break Even</Text>
            <Text style={[styles.resVal, { color: '#FFD166' }]}>{Math.ceil(bep)} units</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderRunway = () => {
    const runway = cashInBank / monthlyBurn;
    const months = [];
    let rem = cashInBank;
    for (let m = 1; m <= 12; m++) { rem -= monthlyBurn; months.push(Math.max(0, rem)); }
    const isDanger = runway < 6;

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="CASH IN BANK (VC FUNDING)" txtM={txtM}>
          <SlRow v={formatCurrency(cashInBank, currency, true)} dec={() => bump(() => setCashInBank(Math.max(1000000, cashInBank - 1000000)))} inc={() => bump(() => setCashInBank(cashInBank + 1000000))} t={txt1} g={glass2} />
        </Ctrl>
        <Ctrl border={border} glass1={glass1} label="MONTHLY BURN RATE" txtM={txtM}>
          <SlRow v={`${formatCurrency(monthlyBurn, currency, true)}/mo`} dec={() => bump(() => setMonthlyBurn(Math.max(100000, monthlyBurn - 100000)))} inc={() => bump(() => setMonthlyBurn(monthlyBurn + 100000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 20, alignItems: 'center' }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>TIME UNTIL ZERO CASH</Text>
          <Text style={{ color: isDanger ? '#FF4444' : '#00E5A0', fontSize: 44, fontFamily: FONTS.displayBold, marginVertical: 8 }}>{runway.toFixed(1)}</Text>
          <Text style={{ color: isDanger ? '#FF4444' : '#00E5A0', fontFamily: FONTS.displayBold, fontSize: 14 }}>MONTHS</Text>

          <View style={{ flexDirection: 'row', gap: 3, width: '100%', height: 36, marginTop: 20 }}>
            {months.map((bal, i) => {
              const dead = bal === 0;
              return (
                <LinearGradient key={i} colors={dead ? [glass2, glass2] : [accent, accent + '60']} style={{ flex: 1, borderRadius: 4, opacity: dead ? 0.3 : 0.4 + (bal / cashInBank) * 0.6 }} />
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
            <Text style={{ color: txtM, fontSize: 9 }}>Now</Text>
            <Text style={{ color: txtM, fontSize: 9 }}>12 Months</Text>
          </View>
        </View>

        {isDanger && (
          <LinearGradient colors={['#FF444420', '#FF444408']} style={[styles.alertCard, { borderColor: '#FF444440' }]}>
            <Icon name="alert" size={16} color="#FF4444" />
            <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
              MAYDAY! 🚨 Your rocket is falling out of the sky! With less than 6 months of fuel (Runway), you must find a gas station (Investors) or make the engines more efficient (Cut Costs) right now! 🚀💥
            </Text>
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderDilution = () => {
    const founder = 100 - vcStake;
    const cx = W / 2, cy = 110, R = 85;
    const lostControl = founder <= 50;

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="% SOLD TO INVESTORS (VCs)" txtM={txtM}>
          <SlRow v={`${vcStake}%`} dec={() => bump(() => setVcStake(Math.max(5, vcStake - 5)))} inc={() => bump(() => setVcStake(Math.min(95, vcStake + 5)))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border }]}>
          <Svg width={W} height={220}>
            {founder > 0 && <Path d={arcP(cx, cy, R, 0, (founder / 100) * 360)} fill="#00E5A0" fillOpacity={0.85} />}
            {vcStake > 0 && <Path d={arcP(cx, cy, R, (founder / 100) * 360, 360)} fill="#FFD166" fillOpacity={0.85} />}
            <Circle cx={cx} cy={cy} r={R - 28} fill={cardBg} />
            <SvgText x={cx} y={cy - 8} fill={txtM} fontSize="10" textAnchor="middle">FOUNDER</SvgText>
            <SvgText x={cx} y={cy + 14} fill={lostControl ? '#FF4444' : '#00E5A0'} fontSize="22" fontWeight="bold" textAnchor="middle">{founder}%</SvgText>
          </Svg>
        </View>

        <View style={styles.resultRow}>
          <LinearGradient colors={['#00E5A018', '#00E5A005']} style={[styles.resultCard, { borderColor: '#00E5A040' }]}>
            <View style={[styles.dot, { backgroundColor: '#00E5A0' }]} />
            <Text style={[styles.resLabel, { color: txtM }]}>Founders</Text>
            <Text style={[styles.resVal, { color: '#00E5A0' }]}>{founder}%</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFD16618', '#FFD16605']} style={[styles.resultCard, { borderColor: '#FFD16640' }]}>
            <View style={[styles.dot, { backgroundColor: '#FFD166' }]} />
            <Text style={[styles.resLabel, { color: txtM }]}>Investors</Text>
            <Text style={[styles.resVal, { color: '#FFD166' }]}>{vcStake}%</Text>
          </LinearGradient>
        </View>

        {lostControl && (
          <LinearGradient colors={['#FF444420', '#FF444408']} style={[styles.alertCard, { borderColor: '#FF444440' }]}>
            <Icon name="alert" size={16} color="#FF4444" />
            <Text style={{ color: '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
              GHOST IN THE MACHINE! 👻 You own less than half of your own company. The investors can now legally fire YOU from the business you started! You've traded your "Kingdom" for their "Gold." 👑💰
            </Text>
          </LinearGradient>
        )}
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
        {activeTab === 'A' && renderBreakEven()}
        {activeTab === 'B' && renderRunway()}
        {activeTab === 'C' && renderDilution()}
      </View>
    </View>
  );
}

function Ctrl({ children, border, glass1, label, txtM, style = {} }) { return (<View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}><Text style={[styles.cLabel, { color: txtM }]}>{label}</Text>{children}</View>); }
function SlRow({ v, dec, inc, t, g, s = false }) { return (<View style={styles.sliderRow}><TouchableOpacity onPress={dec} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>−</Text></TouchableOpacity><Text style={[s ? styles.vSm : styles.vLg, { color: t }]}>{v}</Text><TouchableOpacity onPress={inc} style={[styles.btn, { backgroundColor: g }]}><Text style={{ color: t, fontSize: 16 }}>+</Text></TouchableOpacity></View>); }

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
  resVal: { fontFamily: FONTS.displayBold, fontSize: 18 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
});
