import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinGrad, Stop, Text as SvgText, Rect, G, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS, SPACING } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';
import CurrencyToggle, { formatCurrency } from '../../components/ui/CurrencyToggle';
import Icon from '../../components/ui/Icons';

const { width } = Dimensions.get('window');
const SIM_W = width - 48;
const CHART_H = 260;

const TABS = [
  { id: 'A', label: '50/30/20', icon: 'target' },
  { id: 'B', label: 'Expenses', icon: 'chart' },
  { id: 'C', label: 'Goal', icon: 'flag' },
];

export default function PersonalFinanceLab({ scientistMode = false }) {
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
  const [income, setIncome] = useState(50000);
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Rent', amount: 15000, color: '#FF6B9D', icon: 'home' },
    { id: 2, name: 'Food', amount: 8000, color: '#FFD166', icon: 'heart' },
    { id: 3, name: 'Transport', amount: 3000, color: '#4ECDC4', icon: 'rocket' },
    { id: 4, name: 'Fun', amount: 5000, color: '#A855F7', icon: 'star' },
    { id: 5, name: 'Bills', amount: 4000, color: '#FF9F1C', icon: 'zap' },
  ]);
  const [goalAmount, setGoalAmount] = useState(500000);
  const [monthlySave, setMonthlySave] = useState(10000);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleTab = (tab) => {
    if (tab !== activeTab) {
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
    }
  };

  const bump = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(pulseAnim, { toValue: 0.95, tension: 300, friction: 8, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  // ── SVG helpers ──
  const polar = (cx, cy, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (cx, cy, r, s, e) => {
    const st = polar(cx, cy, r, e), en = polar(cx, cy, r, s);
    const lg = e - s <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${st.x} ${st.y} A ${r} ${r} 0 ${lg} 0 ${en.x} ${en.y} Z`;
  };

  // ── MODE A: 50/30/20 Budget ──
  const renderBudget = () => {
    const needs = income * 0.5, wants = income * 0.3, savings = income * 0.2;
    const data = [
      { pct: 50, color: '#FF6B9D', label: 'Needs', val: needs, icon: 'home', emoji: '🏠' },
      { pct: 30, color: '#FFD166', label: 'Wants', val: wants, icon: 'star', emoji: '🎮' },
      { pct: 20, color: '#00E5A0', label: 'Savings', val: savings, icon: 'shield', emoji: '🐷' },
    ];
    const cx = SIM_W / 2, cy = 120, R = 90, r2 = 55;
    let ang = 0;

    return (
      <View>
        <ControlCard border={border} glass1={glass1}>
          <Label txtM={txtM}>MONTHLY INCOME</Label>
          <SliderRow
            value={formatCurrency(income, currency)}
            onDec={() => { bump(); setIncome(Math.max(10000, income - 5000)); }}
            onInc={() => { bump(); setIncome(income + 5000); }}
            txt1={txt1} glass2={glass2}
          />
        </ControlCard>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <Svg width={SIM_W} height={240}>
            <Defs>
              <SvgLinGrad id="bgGlow" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={accent} stopOpacity="0.08" />
                <Stop offset="1" stopColor={accent} stopOpacity="0" />
              </SvgLinGrad>
            </Defs>
            <Rect x={0} y={0} width={SIM_W} height={240} fill="url(#bgGlow)" />

            {data.map((d, i) => {
              const a = (d.pct / 100) * 360;
              const path = arc(cx, cy, R, ang, ang + a);
              ang += a;
              return <Path key={i} d={path} fill={d.color} fillOpacity={0.85} />;
            })}
            <Circle cx={cx} cy={cy} r={r2} fill={cardBg} />
            <SvgText x={cx} y={cy - 8} fill={txtM} fontSize="10" textAnchor="middle" fontFamily={FONTS.bodyMedium}>INCOME</SvgText>
            <SvgText x={cx} y={cy + 12} fill={txt1} fontSize="16" fontWeight="bold" textAnchor="middle">{formatCurrency(income, currency, true)}</SvgText>
          </Svg>
        </Animated.View>

        <View style={styles.legendRow}>
          {data.map((d, i) => (
            <LinearGradient key={i} colors={[d.color + '18', d.color + '08']} style={[styles.legendCard, { borderColor: d.color + '40' }]}>
              <View style={[styles.legendDot, { backgroundColor: d.color }]} />
              <Icon name={d.icon} size={14} color={d.color} />
              <Text style={[styles.legendLabel, { color: txtM }]}>{d.label}</Text>
              <Text style={[styles.legendPct, { color: d.color }]}>{d.pct}%</Text>
              <Text style={[styles.legendVal, { color: txt1 }]}>{formatCurrency(d.val, currency, true)}</Text>
            </LinearGradient>
          ))}
        </View>

        <InsightCard accent={accent} glass1={glass1} border={border} txt2={txt2} icon="shield">
          🛡️ THE 50/30/20 SHIELD: Think of your income as a fortress. 50% builds the walls (Needs), 30% buys the decorations (Wants), and 20% fills the treasure chest (Savings). Without the chest, the fortress is just an empty shell! 🏰✨
        </InsightCard>

        <InsightCard accent="#A855F7" glass1={glass1} border={'#A855F730'} txt2={txt2} icon="zap">
          🤯 THE XP MULTIPLIER: If you save just {formatCurrency(savings, currency)}/month starting today, you aren't just saving cash — you're buying "Time Freedom." In 10 years, this small habit turns into a massive {formatCurrency(savings * 12 * 10 * 1.5, currency, true)}! 🚀💎
        </InsightCard>
      </View>
    );
  };

  // ── MODE B: Expense Tracker ──
  const renderExpenses = () => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = income - total;

    return (
      <View>
        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16 }]}>
          <View style={styles.expHeader}>
            <View>
              <Text style={[styles.expLabel, { color: txtM }]}>TOTAL SPEND</Text>
              <Text style={[styles.expTotal, { color: '#FF6B9D' }]}>{formatCurrency(total, currency)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.expLabel, { color: txtM }]}>REMAINING</Text>
              <Text style={[styles.expTotal, { color: remaining >= 0 ? '#00E5A0' : '#FF4444' }]}>{formatCurrency(remaining, currency)}</Text>
            </View>
          </View>

          <View style={styles.stackedBar}>
            {expenses.map((e, i) => (
              <View key={i} style={[styles.stackSeg, { width: `${(e.amount / total) * 100}%`, backgroundColor: e.color }]} />
            ))}
          </View>

          <View style={{ gap: 10, marginTop: 16 }}>
            {expenses.map((e, i) => {
              const pct = ((e.amount / total) * 100).toFixed(1);
              return (
                <View key={i} style={styles.expRow}>
                  <View style={styles.expRowLeft}>
                    <View style={[styles.expIcon, { backgroundColor: e.color + '20' }]}>
                      <Icon name={e.icon} size={14} color={e.color} />
                    </View>
                    <Text style={[styles.expName, { color: txt1 }]}>{e.name}</Text>
                  </View>
                  <View style={styles.expRowRight}>
                    <TouchableOpacity onPress={() => { bump(); const n = [...expenses]; n[i].amount = Math.max(1000, n[i].amount - 1000); setExpenses(n); }} style={[styles.miniBtn, { backgroundColor: glass2 }]}>
                      <Text style={{ color: txt1, fontSize: 14 }}>−</Text>
                    </TouchableOpacity>
                    <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                      <Text style={[styles.expAmt, { color: txt1 }]}>{formatCurrency(e.amount, currency, true)}</Text>
                      <Text style={{ color: e.color, fontSize: 10, fontFamily: FONTS.bodyMedium }}>{pct}%</Text>
                    </View>
                    <TouchableOpacity onPress={() => { bump(); const n = [...expenses]; n[i].amount += 1000; setExpenses(n); }} style={[styles.miniBtn, { backgroundColor: glass2 }]}>
                      <Text style={{ color: txt1, fontSize: 14 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <InsightCard accent="#4ECDC4" glass1={glass1} border={'#4ECDC430'} txt2={txt2} icon="droplet">
          💧 THE SLOW LEAK: A tiny hole can sink a giant ship. Your expenses are the same! Rich people don't just earn more; they are masters at plugging the "leaks." Every {formatCurrency(1000, currency)} you save is a brick in your future mansion! 🏗️🏨
        </InsightCard>

        {(total / income) > 0.8 && (
          <InsightCard accent="#FF4444" glass1={glass1} border="#FF444430" txt2={txt2} icon="alert">
            🚨 DANGER ZONE! You're spending {((total / income) * 100).toFixed(0)}% of your income. That's like eating 8 out of 10 cookies and trying to save only 2. Cut any expense by {formatCurrency(Math.max(0, total - income * 0.7), currency)} to breathe easy!
          </InsightCard>
        )}

        {remaining >= 0 && (total / income) <= 0.8 && (
          <InsightCard accent="#00E5A0" glass1={glass1} border="#00E5A030" txt2={txt2} icon="star">
            🏆 GREAT JOB! You're keeping {((remaining / income) * 100).toFixed(0)}% of your money. Warren Buffett says: "Don't save what's left after spending. Spend what's left after saving!"
          </InsightCard>
        )}
      </View>
    );
  };

  // ── MODE C: Savings Goal ──
  const renderGoal = () => {
    const months = monthlySave > 0 ? Math.ceil(goalAmount / monthlySave) : 999;
    const yrs = (months / 12).toFixed(1);
    const pts = [];
    for (let i = 0; i <= months && i <= 120; i += Math.max(1, Math.floor(months / 12))) {
      pts.push(i * monthlySave);
    }
    if (pts[pts.length - 1] < goalAmount) pts.push(goalAmount);

    const getLine = () => {
      let d = '';
      pts.forEach((v, i) => {
        const x = (i / (pts.length - 1)) * SIM_W;
        const y = (CHART_H - 40) - ((v / goalAmount) * (CHART_H - 80));
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      });
      return d;
    };
    const getArea = () => `${getLine()} L ${SIM_W} ${CHART_H - 40} L 0 ${CHART_H - 40} Z`;

    return (
      <View>
        <View style={styles.controlGrid}>
          <ControlCard border={border} glass1={glass1} style={{ flex: 1 }}>
            <Label txtM={txtM}>GOAL AMOUNT</Label>
            <SliderRow
              value={formatCurrency(goalAmount, currency, true)}
              onDec={() => { bump(); setGoalAmount(Math.max(50000, goalAmount - 100000)); }}
              onInc={() => { bump(); setGoalAmount(goalAmount + 100000); }}
              txt1={txt1} glass2={glass2} small
            />
          </ControlCard>
          <ControlCard border={border} glass1={glass1} style={{ flex: 1 }}>
            <Label txtM={txtM}>SAVE / MONTH</Label>
            <SliderRow
              value={formatCurrency(monthlySave, currency, true)}
              onDec={() => { bump(); setMonthlySave(Math.max(1000, monthlySave - 5000)); }}
              onInc={() => { bump(); setMonthlySave(monthlySave + 5000); }}
              txt1={txt1} glass2={glass2} small
            />
          </ControlCard>
        </View>

        <Animated.View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.goalBadge}>
            <Text style={{ color: txtM, fontSize: 11 }}>Time to reach goal</Text>
            <Text style={{ color: accent, fontSize: 28, fontFamily: FONTS.displayBold }}>{yrs} <Text style={{ fontSize: 14, color: txtM }}>Years</Text></Text>
          </View>

          <Svg width={SIM_W} height={CHART_H}>
            <Defs>
              <SvgLinGrad id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={accent} stopOpacity="0.35" />
                <Stop offset="1" stopColor={accent} stopOpacity="0.02" />
              </SvgLinGrad>
              <SvgLinGrad id="goalLine" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFD166" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#FFD166" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#FFD166" stopOpacity="0" />
              </SvgLinGrad>
            </Defs>

            {[0, 1, 2, 3].map(i => (
              <Line key={i} x1={0} y1={40 + i * 55} x2={SIM_W} y2={40 + i * 55} stroke={border} strokeWidth="1" />
            ))}

            <Line x1={0} y1={40} x2={SIM_W} y2={40} stroke="url(#goalLine)" strokeWidth="2" strokeDasharray="6,4" />
            <SvgText x={SIM_W - 8} y={35} fill="#FFD166" fontSize="10" textAnchor="end" fontFamily={FONTS.bodyMedium}>TARGET: {formatCurrency(goalAmount, currency, true)}</SvgText>

            <Path d={getArea()} fill="url(#areaFill)" />
            <Path d={getLine()} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            <SvgText x={8} y={CHART_H - 10} fill={txtM} fontSize="9">Now</SvgText>
            <SvgText x={SIM_W - 8} y={CHART_H - 10} fill={txtM} fontSize="9" textAnchor="end">{months} mo</SvgText>
          </Svg>
        </Animated.View>

        <View style={styles.statRow}>
          <StatPill label="Monthly" value={formatCurrency(monthlySave, currency, true)} color={accent} txtM={txtM} txt1={txt1} />
          <StatPill label="Total Saved" value={formatCurrency(goalAmount, currency, true)} color="#FFD166" txtM={txtM} txt1={txt1} />
          <StatPill label="Months" value={String(months)} color="#4ECDC4" txtM={txtM} txt1={txt1} />
        </View>

        <InsightCard accent="#FF6B9D" glass1={glass1} border={'#FF6B9D30'} txt2={txt2} icon="lightbulb">
          🎯 Think of saving like filling a bucket, drop by drop. It feels slow at first, but one day you look and it's FULL! The hardest part? Starting. The easiest part? NOT stopping.
        </InsightCard>

        {months <= 24 && (
          <InsightCard accent="#FFD166" glass1={glass1} border={'#FFD16630'} txt2={txt2} icon="star">
            ⚡ SPEED SAVER! At this rate, you'll reach your goal in under 2 years. You're saving like a pro! Only 5% of people save this aggressively.
          </InsightCard>
        )}

        {scientistMode && (
          <InsightCard accent={accent} glass1={glass1} border={accent + '30'} txt2={txt2} icon="flask">
            🔬 SCIENTIST MODE: This is a zero-interest projection. If you invested at 12% annual return instead of just saving, you'd hit your goal {Math.round(months * 0.3)} months FASTER! That's the magic of compounding.
          </InsightCard>
        )}
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
              <LinearGradient
                colors={active ? [accent + '25', accent + '08'] : ['transparent', 'transparent']}
                style={[styles.tabInner, active && { borderColor: accent + '60' }]}
              >
                <Icon name={tab.icon} size={14} color={active ? accent : txtM} />
                <Text style={[styles.tabTxt, { color: active ? accent : txtM }]}>{tab.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        {activeTab === 'A' && renderBudget()}
        {activeTab === 'B' && renderExpenses()}
        {activeTab === 'C' && renderGoal()}
      </View>
    </View>
  );
}

// ── Sub-components ──
function ControlCard({ children, border, glass1, style = {} }) {
  return <View style={[styles.controlBox, { borderColor: border, backgroundColor: glass1 }, style]}>{children}</View>;
}
function Label({ children, txtM }) {
  return <Text style={[styles.controlLabel, { color: txtM }]}>{children}</Text>;
}
function SliderRow({ value, onDec, onInc, txt1, glass2, small = false }) {
  return (
    <View style={styles.sliderRow}>
      <TouchableOpacity onPress={onDec} style={[styles.btn, { backgroundColor: glass2 }]}><Text style={{ color: txt1, fontSize: 16 }}>−</Text></TouchableOpacity>
      <Text style={[small ? styles.valSm : styles.val, { color: txt1 }]}>{value}</Text>
      <TouchableOpacity onPress={onInc} style={[styles.btn, { backgroundColor: glass2 }]}><Text style={{ color: txt1, fontSize: 16 }}>+</Text></TouchableOpacity>
    </View>
  );
}
function InsightCard({ children, accent, glass1, border, txt2, icon }) {
  return (
    <View style={[styles.insightBox, { backgroundColor: glass1, borderColor: border }]}>
      <View style={[styles.insightIcon, { backgroundColor: accent + '15' }]}>
        <Icon name={icon || 'lightbulb'} size={14} color={accent} />
      </View>
      <Text style={[styles.insightText, { color: txt2 }]}>{children}</Text>
    </View>
  );
}
function StatPill({ label, value, color, txtM, txt1 }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statLabel, { color: txtM }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16, paddingHorizontal: 12, gap: 6 },
  tab: { flex: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'transparent' },
  tabTxt: { fontFamily: FONTS.displayBold, fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: SPACING.md },
  chartBox: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
  controlBox: { padding: 14, borderWidth: 1, borderRadius: RADIUS.lg, marginBottom: 4 },
  controlLabel: { fontFamily: FONTS.displayBold, fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
  controlGrid: { flexDirection: 'row', gap: 8 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  btn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 20, fontFamily: FONTS.displayBold },
  valSm: { fontSize: 14, fontFamily: FONTS.displayMedium },
  legendRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  legendCard: { flex: 1, padding: 10, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: FONTS.bodyMedium, fontSize: 9 },
  legendPct: { fontFamily: FONTS.displayBold, fontSize: 14 },
  legendVal: { fontFamily: FONTS.body, fontSize: 10 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  expLabel: { fontFamily: FONTS.bodyMedium, fontSize: 10, marginBottom: 2 },
  expTotal: { fontFamily: FONTS.displayBold, fontSize: 20 },
  stackedBar: { height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row' },
  stackSeg: { height: '100%' },
  expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  expIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expName: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  expRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expAmt: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  miniBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  goalBadge: { position: 'absolute', top: 14, left: 16, zIndex: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  statPill: { alignItems: 'center', gap: 2 },
  statLabel: { fontFamily: FONTS.body, fontSize: 10 },
  statValue: { fontFamily: FONTS.displayBold, fontSize: 15 },
  insightBox: { flexDirection: 'row', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 14, gap: 10, alignItems: 'flex-start' },
  insightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18 },
});
