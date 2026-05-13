import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, Platform, Modal, 
  TextInput, KeyboardAvoidingView, ScrollView, Animated, Dimensions, Keyboard, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../components/ui/Icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONTS, RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../services/api';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
//  Generates the inline HTML that uses PDF.js to render pages as <canvas>.
//  ✓ No file saved to disk — everything lives in WebView JS heap
//  ✓ Renders first 3 pages ASAP, rest lazily in background
//  ✓ Disables download, print, text-selection, right-click
//  ✓ Pinch-to-zoom via CSS touch-action + viewport meta
// ─────────────────────────────────────────────────────────────────────────────
function buildPdfViewerHtml(pdfUrl, fallbackUrl) {
  // Use the legacy (non-module) PDF.js build — works reliably in all WebViews
  // Module scripts fail in Android WebView's null origin due to CORS restrictions
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=4,user-scalable=yes"/>
<title>PDF Viewer</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-user-select:none;user-select:none;}
  html,body{width:100%;height:100%;overflow-x:hidden;background:#1a1a2e;font-family:system-ui,sans-serif;}
  body{overflow-y:auto;-webkit-overflow-scrolling:touch;}
  
  /* Loading screen */
  #loader{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a2e;transition:opacity .4s ease;}
  #loader.hide{opacity:0;pointer-events:none;}
  .spinner{width:48px;height:48px;border:4px solid rgba(123,111,255,.2);border-top-color:#7B6FFF;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .load-text{color:rgba(255,255,255,.7);font-size:14px;margin-top:16px;letter-spacing:.5px;}
  .load-progress{width:200px;height:4px;background:rgba(255,255,255,.08);border-radius:2px;margin-top:12px;overflow:hidden;}
  .load-progress-bar{height:100%;width:0%;background:linear-gradient(90deg,#7B6FFF,#A78BFA);border-radius:2px;transition:width .3s ease;}

  /* Page container */
  #pages{display:flex;flex-direction:column;align-items:center;padding:8px 0 60px 0;gap:6px;}
  .page-wrap{width:100%;display:flex;justify-content:center;position:relative;}
  .page-wrap canvas{display:block;width:100% !important;height:auto !important;background:#fff;box-shadow:0 2px 20px rgba(0,0,0,.35);border-radius:2px;}
  
  /* Page number pill */
  .page-num{position:absolute;bottom:8px;right:12px;background:rgba(0,0,0,.55);color:rgba(255,255,255,.8);font-size:11px;padding:3px 10px;border-radius:12px;backdrop-filter:blur(4px);}
  
  /* Skeleton placeholder */
  .skeleton{width:calc(100% - 16px);margin:0 8px;aspect-ratio:0.707;background:linear-gradient(110deg,#1e1e3a 8%,#2a2a4a 18%,#1e1e3a 33%);background-size:200% 100%;animation:shimmer 1.4s linear infinite;border-radius:2px;}
  @keyframes shimmer{to{background-position:-200% 0}}


  /* Prevent any form of content extraction */
  img,canvas{-webkit-touch-callout:none;pointer-events:auto;}
  body{-webkit-touch-callout:none;}
</style>
</head>
<body oncontextmenu="return false" ondragstart="return false">
<div id="loader">
  <div class="spinner"></div>
  <div class="load-text" id="loadText">Preparing your book...</div>
  <div class="load-progress"><div class="load-progress-bar" id="progressBar"></div></div>
</div>
<div id="pages"></div>


<!-- Legacy PDF.js build (non-module) — no import needed, exposes global pdfjsLib -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
// Wait for PDF.js to load, then start rendering
(function() {
  // Only block the UI for the FIRST page to ensure instant loading. 
  // Remaining pages will gracefully render in the background.
  var PRIORITY_PAGES = 1;
  var DEVICE_PX = ${width};
  var pixelRatio = window.devicePixelRatio || 2;
  // Use a higher scale factor relative to the screen's pixel density 
  // so text remains crisp when users pinch-to-zoom. Capped at 4.0 to prevent OOM.
  var SCALE_FACTOR = Math.min(pixelRatio * 1.75, 4.0);
  var pdfUrl = ${JSON.stringify(pdfUrl)};
  var pagesDiv = document.getElementById('pages');
  var loader = document.getElementById('loader');
  var loadText = document.getElementById('loadText');
  var progressBar = document.getElementById('progressBar');

  function sendProgress(pct, msg) {
    progressBar.style.width = pct + '%';
    if (msg) loadText.textContent = msg;
    try { window.ReactNativeWebView.postMessage(JSON.stringify({type:'progress',pct:pct,msg:msg})); } catch(e){}
  }

  // Disable keyboard shortcuts (Ctrl+S, Ctrl+P, etc.)
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); e.stopPropagation(); return false; }
  });

  function renderPage(pdf, pageNum, container) {
    return pdf.getPage(pageNum).then(function(page) {
      var unscaledViewport = page.getViewport({ scale: 1 });
      var scale = (DEVICE_PX * SCALE_FACTOR) / unscaledViewport.width;
      var viewport = page.getViewport({ scale: scale });

      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      var ctx = canvas.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
        var wrap = document.createElement('div');
        wrap.className = 'page-wrap';
        wrap.appendChild(canvas);

        var pill = document.createElement('div');
        pill.className = 'page-num';
        pill.textContent = pageNum + ' / ' + pdf.numPages;
        wrap.appendChild(pill);

        container.replaceWith(wrap);
      });
    });
  }

  // Fallback to Google Docs viewer if PDF.js fails (e.g. CORS on the PDF file)
  function fallbackToGoogleDocs() {
    try { window.ReactNativeWebView.postMessage(JSON.stringify({type:'fallback'})); } catch(e){}
  }

  function renderRemainingPages(pdf, placeholders, startIdx) {
    if (startIdx >= pdf.numPages) return;
    // Yield the main thread for 150ms between background page renders 
    // to ensure scrolling remains buttery smooth while zooming/reading.
    setTimeout(function() {
      renderPage(pdf, startIdx + 1, placeholders[startIdx]).then(function() {
        renderRemainingPages(pdf, placeholders, startIdx + 1);
      }).catch(function() {
        renderRemainingPages(pdf, placeholders, startIdx + 1);
      });
    }, 150);
  }

  function startViewer() {
    if (typeof pdfjsLib === 'undefined') {
      // PDF.js failed to load from CDN — use fallback
      sendProgress(50, 'Switching to fallback viewer...');
      fallbackToGoogleDocs();
      return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    sendProgress(5, 'Connecting to server...');

    var loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      disableAutoFetch: false,
      disableStream: false
    });

    loadingTask.onProgress = function(p) {
      if (p.total > 0) {
        var pct = Math.min(Math.round((p.loaded / p.total) * 60), 60);
        sendProgress(pct, 'Downloading... ' + Math.round(p.loaded / 1024) + ' KB');
      }
    };

    loadingTask.promise.then(function(pdf) {
      var totalPages = pdf.numPages;
      sendProgress(65, 'Rendering pages...');

      // Create skeleton placeholders for ALL pages immediately
      var placeholders = [];
      for (var i = 0; i < totalPages; i++) {
        var sk = document.createElement('div');
        sk.className = 'skeleton';
        pagesDiv.appendChild(sk);
        placeholders.push(sk);
      }

      // PHASE 1: Render first 3 pages as fast as possible (parallel)
      var priorityCount = Math.min(PRIORITY_PAGES, totalPages);
      var promises = [];
      for (var j = 0; j < priorityCount; j++) {
        promises.push(renderPage(pdf, j + 1, placeholders[j]));
      }

      Promise.all(promises).then(function() {
        // Hide loader immediately after first pages visible
        sendProgress(100, 'Ready!');
        loader.classList.add('hide');
        setTimeout(function() { loader.style.display = 'none'; }, 400);
        try { window.ReactNativeWebView.postMessage(JSON.stringify({type:'loaded',pages:totalPages})); } catch(e){}

        // PHASE 2: Render remaining pages lazily in background
        renderRemainingPages(pdf, placeholders, priorityCount);
      }).catch(function(err) {
        // First pages failed — fallback
        sendProgress(50, 'Switching to fallback...');
        fallbackToGoogleDocs();
      });

    }).catch(function(err) {
      // PDF fetch/parse failed (likely CORS) — fallback to Google Docs
      sendProgress(50, 'Switching to fallback viewer...');
      fallbackToGoogleDocs();
    });
  }

  // Start as soon as possible
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(startViewer, 10);
  } else {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(startViewer, 10); });
  }
})();
</script>
</body>
</html>`;
}

export default function PdfViewerScreen({ url, title, id, onBack }) {
  const { theme, isDark } = useTheme();
  const { isCompleted, toggleCompletion } = useProgress();
  const { token } = useAuth();

  const isDone = isCompleted(id);

  // ----- STATES -----
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);
  
  // Stopwatch & Pomodoro State
  const [timeSpent, setTimeSpent] = useState(0); 
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 mins
  const [isTiming, setIsTiming] = useState(true);
  
  // Eye-Care State
  const [isEyeCare, setIsEyeCare] = useState(false);
  
  // Notes State
  const [notesVisible, setNotesVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [editorHeight, setEditorHeight] = useState(250);
  const richText = useRef();

  const bg = theme?.bg?.base || '#08090F';
  const txt = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  const cardBg = theme?.bg?.card || '#1C1D26';

  // Build the HTML source once — baseUrl 'file:///' gives it a file origin, 
  // which combined with allowUniversalAccessFromFileURLs completely bypasses CORS!
  const htmlSource = useMemo(() => ({
    html: buildPdfViewerHtml(url, url),
    baseUrl: 'file:///',
  }), [url]);

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  const webViewSource = useGoogleFallback ? { uri: googleDocsUrl } : htmlSource;

  const googleDocsHidePopoutScript = `
    (function() {
      function hidePopout() {
        var popoutBtn = document.querySelector('.ndfHFb-c4YZDc-Wrql6b');
        if (popoutBtn) popoutBtn.style.display = 'none';
        
        var allDivs = document.querySelectorAll('div[title="Pop-out"], a[target="_blank"]');
        for (var i = 0; i < allDivs.length; i++) {
          allDivs[i].style.display = 'none';
        }
      }
      setInterval(hidePopout, 500);
      hidePopout();
    })();
    true;
  `;

  // ----- EFFECTS -----
  useEffect(() => {
    loadNotes();
  }, [title]);

  useEffect(() => {
    let interval;
    if (isTiming) {
      interval = setInterval(() => {
        if (isPomodoro) {
          setPomodoroTime((prev) => {
            if (prev <= 1) {
              setIsTiming(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimeSpent((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming, isPomodoro]);

  // ----- HANDLERS -----
  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(`@notes_${title}`);
      if (saved !== null) {
        setNotes(saved);
        setLastSaved('Loaded');
      }
    } catch(e) {}
  };

  const saveNotes = async (text) => {
    setNotes(text);
    try {
      await AsyncStorage.setItem(`@notes_${title}`, text);
      const now = new Date();
      setLastSaved(`Saved at ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    } catch(e) {}
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleTimer = () => setIsTiming(!isTiming);

  // Handle messages from WebView (progress, loaded, error)
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setPdfReady(true);
        setTotalPages(data.pages || 0);
      } else if (data.type === 'fallback') {
        setUseGoogleFallback(true);
      }
    } catch (_) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      
      {/* HEADER */}
      {!isFullscreen && (
        <View style={[styles.header, { borderBottomColor: border, backgroundColor: bg }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="back" size={24} color={txt} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            {totalPages > 0 && !useGoogleFallback && (
              <Text style={[styles.pageCount, { color: txtM }]}>{totalPages} pages</Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsEyeCare(!isEyeCare)} style={[styles.headerIconBtn, { borderColor: border, backgroundColor: cardBg }]}>
              <Text style={{ fontSize: 16 }}>{isEyeCare ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
                        <TouchableOpacity onPress={() => setNotesVisible(true)} style={[styles.headerIconBtn, { borderColor: border, backgroundColor: accent }]}>
               <Icon name="edit" size={16} color="#fffefeff" />
             
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsFullscreen(true)} style={[styles.headerIconBtn, { borderColor: border, backgroundColor: cardBg }]}>
              
               <Text style={[styles.headerIconText, { color: txtM }]}>Focus</Text>
            </TouchableOpacity>

            

            {/* Stopwatch */}
            <TouchableOpacity 
              style={[
                styles.stopwatchBtn, 
                { backgroundColor: isTiming ? accent + '20' : cardBg, borderColor: border }
              ]}
              onPress={toggleTimer}
              onLongPress={() => {
                setIsPomodoro(!isPomodoro);
                if (!isPomodoro) setPomodoroTime(25 * 60);
              }}
            >
              <Icon name="clock" size={14} color={isTiming ? accent : txtM} />
              <Text style={[styles.timerText, { color: isTiming ? accent : txt }]}>
                {isPomodoro ? formatTime(pomodoroTime) : formatTime(timeSpent)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PDF VIEWER — Native PDF.js rendering in WebView */}
      <View style={styles.webviewContainer}>
        {isEyeCare && (
          <View style={styles.eyeCareOverlay} pointerEvents="none" />
        )}
        <WebView
          source={webViewSource}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={true}
          cacheEnabled={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          mixedContentMode="compatibility"
          onMessage={handleWebViewMessage}
          injectedJavaScript={useGoogleFallback ? googleDocsHidePopoutScript : undefined}
          // Block any navigation away (prevents opening PDF in browser)
          onShouldStartLoadWithRequest={(request) => {
            if (useGoogleFallback) {
              if (request.url.includes('docs.google.com') && !request.url.includes('embedded=true')) {
                return false;
              }
              return true;
            }
            // Allow the initial about:blank/data load and CDN resources
            if (request.url === 'about:blank' || 
                request.url.startsWith('data:') ||
                request.url.startsWith('https://cdnjs.cloudflare.com/') ||
                request.mainDocumentURL) {
              return true;
            }
            // Block everything else (download attempts, external links)
            return false;
          }}
        />
      </View>

      {isFullscreen && (
        <TouchableOpacity 
          style={[styles.fabExitFullscreen, { backgroundColor: cardBg, borderColor: border }]}
          onPress={() => setIsFullscreen(false)}
        >
          <Icon name="cross" size={20} color={txt} />
        </TouchableOpacity>
      )}

      {/* PREMIUM SMART NOTES MODAL */}
      <Modal
        visible={notesVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotesVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <BlurView intensity={isDark ? 90 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { Keyboard.dismiss(); setNotesVisible(false); }} />
          
          <View style={[styles.notesPanel, { backgroundColor: bg, borderColor: border }]}>
            
            {/* Notes Header */}
            <View style={[styles.notesHeader, { borderBottomColor: border }]}>
              <View style={styles.notesHeaderLeft}>
                
                <View>
                  <Text style={[styles.notesTitle, { color: txt }]}>Smart Notes</Text>
                  <Text style={[styles.notesSub, { color: txtM }]}>{lastSaved || 'Start typing...'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setNotesVisible(false); }} style={[styles.closeBtn, { backgroundColor: cardBg }]}>
                <Icon name="cross" size={14} color={txt} />
              </TouchableOpacity>
            </View>

            {/* Rich Input Area */}
            <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: border }}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={true}>
                <RichEditor
                  ref={richText}
                  initialContentHTML={notes}
                  onChange={saveNotes}
                  placeholder="Capture your brilliant thoughts here..."
                  style={{ minHeight: Math.max(250, editorHeight) }}
                  scrollEnabled={false}
                  onHeightChange={setEditorHeight}
                  editorStyle={{
                    backgroundColor: bg,
                    color: txt,
                    placeholderColor: txtM,
                    contentCSSText: `font-family: sans-serif; font-size: 16px;`,
                  }}
                />
              </ScrollView>
            </View>

            {/* Dynamic Color Palette */}
            {showPalette && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: bg, paddingVertical: 12, borderTopColor: border, borderTopWidth: 1 }}>
                {['#1cdd0aff', '#7B6FFF', '#eb0e0eff', '#FBBF24', '#fc56a3ff', '#60A5FA'].map(c => (
                  <TouchableOpacity 
                    key={c}
                    style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                    onPress={() => {
                      richText.current?.commandDOM(`document.execCommand('foreColor', false, '${c}')`);
                      setShowPalette(false);
                    }}
                  />
                ))}
              </View>
            )}

            {/* Quick Format Toolbar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderTopColor: border, borderTopWidth: 1, height: 50 ,marginBottom:20}}>
              <RichToolbar
                editor={richText}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.checkboxList,
                  actions.undo,
                  actions.redo,
                ]}
                iconTint={txtM}
                selectedIconTint={accent}
                disabledIconTint="rgba(255,255,255,0.2)"
                style={{ flex: 1, backgroundColor: 'transparent', borderTopWidth: 0 }}
              />
              <View style={{ width: 1, height: 24, backgroundColor: border, marginHorizontal: 4 }} />
              <TouchableOpacity 
                style={{ paddingHorizontal: 12, height: '100%', justifyContent: 'center' }}
                onPress={() => setShowPalette(!showPalette)}
              >
                <Text style={{ color: showPalette ? accent : txtM, fontSize: 18, fontFamily: FONTS.displayBold }}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ paddingHorizontal: 12, marginRight: 8, height: '100%', justifyContent: 'center' }}
                onPress={() => richText.current?.commandDOM("document.execCommand('hiliteColor', false, '#eecd86ff')")}
              >
                <Icon name="edit" size={18} color={accent} />
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  pageCount: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  headerIconText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 12,
  },
  stopwatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
    marginLeft: 4,
  },
  timerText: {
    fontFamily: FONTS.displayMedium,
    fontSize: 14,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  fabExitFullscreen: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
    width: 20,
    height: 20,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    opacity: 0.8,
  },
  
  // Premium Notes Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  notesPanel: {
    height: height * 0.60, // Taller for better writing
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    marginBottom: 2,
  },
  notesSub: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  richToolbar: {
    height: 50,
    borderTopWidth: 1,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  toolText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  inputScroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  notesInput: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
    paddingBottom: 40,
    paddingTop: SPACING.sm,
  },
  
  // Premium Features Additions
  eyeCareOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 147, 41, 0.15)', // Warm orange tint
    zIndex: 5,
  },

});
