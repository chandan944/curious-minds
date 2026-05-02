import React from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from '../components/ui/Icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONTS } from '../constants/theme';

export default function PdfViewerScreen({ url, title, onBack }) {
  const { theme } = useTheme();

  const bg = theme?.bg?.base || '#08090F';
  const txt = theme?.text?.primary || '#FFFFFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';

  // On Android, we use Google Docs Viewer to render the PDF inside the WebView
  // On iOS, WebView renders PDF natively.
  const viewerUrl = Platform.OS === 'android' 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : url;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={txt} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: txt }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* PDF View */}
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={true}
        // Disable long press to prevent downloads/sharing
        onContextMenu={(event) => event.preventDefault()}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
});
