import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
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
  { id: 'A', label: 'Life Cover', icon: 'shield' },
  { id: 'B', label: 'Health Bill', icon: 'heart' },
  { id: 'C', label: 'Emergency', icon: 'alert' },
];

export default function InsuranceLab({ scientistMode = false }) {
  const { theme, isDark } = useTheme();
  const t = theme || {};
  const accent = '#FF6B9D';
  const txt1 = t.text?.primary || '#FFF';
  const txt2 = t.text?.secondary || '#AAA';
  const txtM = t.text?.muted || '#888';
  const glass1 = t.glass?.light || 'rgba(255,255,255,0.05)';
  const glass2 = t.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = t.glass?.border || 'rgba(255,255,255,0.12)';
  const cardBg = isDark ? 'rgba(8,10,20,0.85)' : 'rgba(240,242,255,0.95)';

  const [currency, setCurrency] = useState('INR');
  const [activeTab, setActiveTab] = useState('A');
  const [annualSalary, setAnnualSalary] = useState(1000000);
  const [yearsLeft, setYearsLeft] = useState(25);
  const [currentCover, setCurrentCover] = useState(5000000);
  const [hospitalBill, setHospitalBill] = useState(1000000);
  const [deductible, setDeductible] = useState(50000);
  const [coPayPct, setCoPayPct] = useState(10);
  const [monthlyExp, setMonthlyExp] = useState(50000);
  const [monthsSaved, setMonthsSaved] = useState(2);

  const handleTab = (tab) => { if (tab !== activeTab) { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); } };
  const bump = (fn) => { soundTap(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); fn(); };

  const renderLifeCover = () => {
    const hlv = annualSalary * yearsLeft;
    const gap = Math.max(0, hlv - currentCover);
    const safe = currentCover >= hlv;
    const mx = Math.max(hlv, currentCover, 1);

    return (
      <View>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 2 }} label="ANNUAL SALARY" txtM={txtM}>
            <SlRow v={formatCurrency(annualSalary, currency, true)} dec={() => bump(() => setAnnualSalary(Math.max(200000, annualSalary - 100000)))} inc={() => bump(() => setAnnualSalary(annualSalary + 100000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="YRS LEFT" txtM={txtM}>
            <SlRow v={`${yearsLeft}Y`} dec={() => bump(() => setYearsLeft(Math.max(5, yearsLeft - 5)))} inc={() => bump(() => setYearsLeft(Math.min(40, yearsLeft + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>
        <Ctrl border={border} glass1={glass1} label="CURRENT LIFE COVERAGE (TERM POLICY)" txtM={txtM}>
          <SlRow v={formatCurrency(currentCover, currency, true)} dec={() => bump(() => setCurrentCover(Math.max(0, currentCover - 5000000)))} inc={() => bump(() => setCurrentCover(currentCover + 5000000))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>HUMAN LIFE VALUE ANALYSIS</Text>
          {[{ label: 'Required HLV', val: hlv, color: '#00D4FF', icon: 'target' }, { label: 'Current Cover', val: currentCover, color: safe ? '#00E5A0' : '#FF4444', icon: safe ? 'shield' : 'alert' }].map((d, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.barIcon, { backgroundColor: d.color + '20' }]}><Icon name={d.icon} size={14} color={d.color} /></View>
                  <Text style={{ color: d.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{d.label}</Text>
                </View>
                <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 14 }}>{formatCurrency(d.val, currency, true)}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[d.color, d.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(d.val / mx) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <LinearGradient colors={safe ? ['#00E5A018', '#00E5A005'] : ['#FF444420', '#FF444408']} style={[styles.alertCard, { borderColor: safe ? '#00E5A040' : '#FF444440' }]}>
          <Icon name={safe ? 'shield' : 'alert'} size={16} color={safe ? '#00E5A0' : '#FF4444'} />
          <Text style={{ color: safe ? '#00E5A0' : '#FF4444', fontFamily: FONTS.displayBold, fontSize: 12, flex: 1 }}>
            {safe ? "🛡️ MISSION COMPLETE: Your family is protected by a solid financial shield!" : `🚨 SHIELD CRACKED: If you vanish today, your family will lose ${formatCurrency(gap, currency, true)} of their future life!` }
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderHealthBill = () => {
    const ded = Math.min(deductible, hospitalBill);
    const rem = hospitalBill - ded;
    const coPay = rem * (coPayPct / 100);
    const insPays = rem - coPay;
    const youPay = ded + coPay;

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="HOSPITAL BILL" txtM={txtM}>
          <SlRow v={formatCurrency(hospitalBill, currency, true)} dec={() => bump(() => setHospitalBill(Math.max(100000, hospitalBill - 100000)))} inc={() => bump(() => setHospitalBill(hospitalBill + 100000))} t={txt1} g={glass2} />
        </Ctrl>
        <View style={styles.controlGrid}>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="DEDUCTIBLE" txtM={txtM}>
            <SlRow v={formatCurrency(deductible, currency, true)} dec={() => bump(() => setDeductible(Math.max(0, deductible - 10000)))} inc={() => bump(() => setDeductible(deductible + 10000))} t={txt1} g={glass2} s />
          </Ctrl>
          <Ctrl border={border} glass1={glass1} style={{ flex: 1 }} label="CO-PAY %" txtM={txtM}>
            <SlRow v={`${coPayPct}%`} dec={() => bump(() => setCoPayPct(Math.max(0, coPayPct - 5)))} inc={() => bump(() => setCoPayPct(Math.min(50, coPayPct + 5)))} t={txt1} g={glass2} s />
          </Ctrl>
        </View>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 16, marginTop: 12 }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1, marginBottom: 16 }}>WHO PAYS WHAT?</Text>
          {[{ label: 'Insurance Pays', val: insPays, color: '#00D4FF', icon: 'shield' }, { label: 'You Pay (Out of Pocket)', val: youPay, color: '#FFD166', icon: 'wallet' }].map((d, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.barIcon, { backgroundColor: d.color + '20' }]}><Icon name={d.icon} size={14} color={d.color} /></View>
                  <Text style={{ color: d.color, fontFamily: FONTS.displayMedium, fontSize: 13 }}>{d.label}</Text>
                </View>
                <Text style={{ color: txt1, fontFamily: FONTS.displayBold, fontSize: 14 }}>{formatCurrency(d.val, currency, true)}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: glass2 }]}>
                <LinearGradient colors={[d.color, d.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(d.val / hospitalBill) * 100}%` }]} />
              </View>
            </View>
          ))}
          <Text style={{ color: txtM, fontSize: 10, textAlign: 'center', marginTop: 4 }}>
            (Deductible: {formatCurrency(ded, currency)} + Co-pay: {formatCurrency(coPay, currency)})
          </Text>
        </View>
      </View>
    );
  };

  const renderEmergency = () => {
    const total = monthlyExp * monthsSaved;
    const safe = monthsSaved >= 6;
    const pct = Math.min(100, (monthsSaved / 6) * 100);

    return (
      <View>
        <Ctrl border={border} glass1={glass1} label="MONTHLY EXPENSES" txtM={txtM}>
          <SlRow v={formatCurrency(monthlyExp, currency)} dec={() => bump(() => setMonthlyExp(Math.max(10000, monthlyExp - 10000)))} inc={() => bump(() => setMonthlyExp(monthlyExp + 10000))} t={txt1} g={glass2} />
        </Ctrl>
        <Ctrl border={border} glass1={glass1} label="MONTHS OF CASH SAVED" txtM={txtM}>
          <SlRow v={`${monthsSaved} Mo`} dec={() => bump(() => setMonthsSaved(Math.max(0, monthsSaved - 1)))} inc={() => bump(() => setMonthsSaved(Math.min(12, monthsSaved + 1)))} t={txt1} g={glass2} />
        </Ctrl>

        <View style={[styles.chartBox, { backgroundColor: cardBg, borderColor: border, padding: 20, alignItems: 'center' }]}>
          <Text style={{ color: txtM, fontSize: 10, fontFamily: FONTS.displayBold, letterSpacing: 1 }}>EMERGENCY FUND</Text>
          <Text style={{ color: txt1, fontSize: 36, fontFamily: FONTS.displayBold, marginVertical: 12 }}>{formatCurrency(total, currency, true)}</Text>
          <View style={[styles.barTrack, { backgroundColor: glass2, width: '100%', height: 14 }]}>
            <LinearGradient colors={safe ? ['#00E5A0', '#00E5A080'] : ['#FFD166', '#FFD16680']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${pct}%`, height: 14 }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
            <Text style={{ color: txtM, fontSize: 9 }}>0</Text>
            <Text style={{ color: '#00E5A0', fontSize: 9, fontFamily: FONTS.displayBold }}>6 Months (Target)</Text>
          </View>
        </View>

        <LinearGradient colors={safe ? ['#00E5A018', '#00E5A005'] : ['#FF444420', '#FF444408']} style={[styles.alertCard, { borderColor: safe ? '#00E5A040' : '#FF444440' }]}>
          <Icon name={safe ? 'shield' : 'alert'} size={16} color={safe ? '#00E5A0' : '#FF4444'} />
          <Text style={{ color: safe ? '#00E5A0' : '#FF4444', fontFamily: FONTS.body, fontSize: 12, flex: 1, lineHeight: 18 }}>
            {safe ? "🏰 THE FORTRESS: You can lose your job today and still eat pizza and pay rent for 6 months! Zero panic." : `🌋 THE VOLCANO: You are only ${monthsSaved} months away from a total financial eruption! Build your wall now.`}
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
        {activeTab === 'A' && renderLifeCover()}
        {activeTab === 'B' && renderHealthBill()}
        {activeTab === 'C' && renderEmergency()}
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
  barIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, marginTop: 12 },
});
