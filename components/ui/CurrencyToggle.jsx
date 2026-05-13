import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, RADIUS } from '../../constants/theme';
import { soundTap } from '../../utils/sounds';
import * as Haptics from 'expo-haptics';

export const CURRENCIES = {
  INR: { id: 'INR', symbol: '₹', rate: 1, name: 'Rupee' }, // Base currency
  USD: { id: 'USD', symbol: '$', rate: 0.012, name: 'Dollar' },
  EUR: { id: 'EUR', symbol: '€', rate: 0.011, name: 'Euro' },
  GBP: { id: 'GBP', symbol: '£', rate: 0.0095, name: 'Pound' },
  JPY: { id: 'JPY', symbol: '¥', rate: 1.82, name: 'Yen' },
};

export const formatCurrency = (value, currencyId = 'INR', compact = false) => {
  const currency = CURRENCIES[currencyId] || CURRENCIES.INR;
  // Calculate converted value (base is INR)
  // If value is inherently in the base unit, we multiply by the rate.
  const converted = value * currency.rate;
  
  if (compact) {
    if (Math.abs(converted) >= 10000000 && currencyId === 'INR') {
      return currency.symbol + (converted / 10000000).toFixed(2) + 'Cr';
    } else if (Math.abs(converted) >= 100000 && currencyId === 'INR') {
      return currency.symbol + (converted / 100000).toFixed(2) + 'L';
    } else if (Math.abs(converted) >= 1000000) {
      return currency.symbol + (converted / 1000000).toFixed(2) + 'M';
    } else if (Math.abs(converted) >= 1000) {
      return currency.symbol + (converted / 1000).toFixed(1) + 'k';
    }
    return currency.symbol + converted.toFixed(0);
  }
  
  return currency.symbol + converted.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export default function CurrencyToggle({ currentCurrency = 'INR', onCurrencyChange }) {
  const { theme } = useTheme();
  const _themeObj = typeof theme !== "undefined" && theme ? theme : {};
  const accent = _themeObj.accent?.primary || '#7B6FFF';
  const glass2 = _themeObj.glass?.medium || 'rgba(255,255,255,0.1)';
  const border = _themeObj.glass?.border || 'rgba(255,255,255,0.15)';
  const txt1 = _themeObj.text?.primary || '#FFFFFF';
  const txtM = _themeObj.text?.muted || 'rgba(255,255,255,0.6)';

  const handleSelect = (curId) => {
    if (curId !== currentCurrency) {
      soundTap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCurrencyChange(curId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.toggleBar, { backgroundColor: glass2, borderColor: border }]}>
          {Object.values(CURRENCIES).map((cur) => {
            const isActive = currentCurrency === cur.id;
            return (
              <TouchableOpacity
                key={cur.id}
                onPress={() => handleSelect(cur.id)}
                style={[
                  styles.toggleBtn,
                  isActive && { backgroundColor: accent }
                ]}
              >
                <Text style={[
                  styles.toggleText,
                  { color: isActive ? '#FFF' : txtM, fontWeight: isActive ? 'bold' : 'normal' }
                ]}>
                  {cur.symbol} {cur.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  toggleBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  toggleText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  }
});
