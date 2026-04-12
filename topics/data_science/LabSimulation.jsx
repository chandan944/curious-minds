/**
 * Data Science Lab — Linear Regression & Outliers
 * Scientist Mode: Standard deviation boundaries
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Circle, Path, Polygon
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#0A0515',
  panel: '#150B20',
  cyan: '#00D4FF',
  green: '#39FF14',
  red: '#FF4D6D',
  text: '#E8E5F0',
  steel: '#1A1525',
  purple: '#A855F7',
  alert: '#FFB347'
};

// Box-Muller transform for normal distribution
const randn_bm = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

export default function DataLab({ scientistMode = false, accentColor = '#00D4FF', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const discovered = useRef(new Set());

  // Data State
  const [variance, setVariance] = useState(1); // 0.1 to 3
  const [points, setPoints] = useState([]);
  const [outliersIdx, setOutliersIdx] = useState(new Set());
  const [isCleaning, setIsCleaning] = useState(false);

  // Generate Base Data (y = mx + b + noise)
  const generateData = useCallback((v) => {
    const newPts = [];
    const m = 0.6;
    const b = 0.2;
    for(let i=0; i<30; i++) {
        const x = Math.random();
        // Normal distribution noise based on variance
        const noise = randn_bm() * 0.1 * v;
        let y = m * x + b + noise;
        y = Math.max(0, Math.min(1, y)); // clamp
        newPts.push({x, y, isOutlier: false});
    }
    setPoints(newPts);
    setOutliersIdx(new Set());
  }, []);

  // Init Data
  useEffect(() => {
     generateData(variance);
  }, []);

  // Compute Statistics
  const stats = useMemo(() => {
    // Only use non-outlier points or all points if not cleaned
    const validPts = points.filter((_, i) => !outliersIdx.has(i));
    
    // Mean
    let meanY = 0; let meanX = 0;
    validPts.forEach(p => { meanX+=p.x; meanY+=p.y; });
    meanX /= validPts.length; meanY /= validPts.length;

    // Linear Regression (Least Squares)
    let num = 0, den = 0;
    validPts.forEach(p => {
       num += (p.x - meanX)*(p.y - meanY);
       den += (p.x - meanX)*(p.x - meanX);
    });
    const m = den === 0 ? 0 : num/den;
    const b = meanY - m*meanX;

    // Standard Deviation of Y distance from regression line
    let varianceSum = 0;
    validPts.forEach(p => {
       const expectedY = m*p.x + b;
       varianceSum += Math.pow(p.y - expectedY, 2);
    });
    const stdDev = Math.sqrt(varianceSum / validPts.length);

    return { meanX, meanY, m, b, stdDev };
  }, [points, outliersIdx]);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  // Logic Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const loop = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(loop);
  }, []);

  // Actions
  const injectOutliers = () => {
    soundTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newPts = [...points];
    // Inject 3 massive outliers
    for(let i=0; i<3; i++) {
        newPts.push({
            x: Math.random(),
            y: Math.random() > 0.5 ? 0.9 + Math.random()*0.1 : 0.0 + Math.random()*0.1,
            isOutlier: true
        });
    }
    setPoints(newPts);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
    ]).start();

    if (!discovered.current.has('d1')) {
      addLog('d1', {
        title: "Data Corruption (Outliers)",
        entry: "You injected wildly irrational data points into the set. Notice how severely the Linear Regression line violently physically breaks and shifts just to improperly mathematically accommodate the few extreme bad points!",
        color: PALETTE.red
      });
    }
  };

  const cleanData = () => {
    soundTap();
    setIsCleaning(true);
    // Find points where distance from regression > 2 stdDev
    const newOutliers = new Set(outliersIdx);
    
    let caught = 0;
    points.forEach((p, i) => {
       const expectedY = stats.m * p.x + stats.b;
       const dist = Math.abs(p.y - expectedY);
       if (dist > stats.stdDev * 1.5) { // Strict cleaning threshold
          newOutliers.add(i);
          caught++;
       }
    });

    setOutliersIdx(newOutliers);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => setIsCleaning(false), 1000);

    if (caught > 0 && !discovered.current.has('d2')) {
      addLog('d2', {
        title: "Standard Deviation Purge",
        entry: "The algorithm successfully mathematically hunted down any point located beyond 1.5 Standard Deviations from the Mean! It purged them, allowing the Regression curve to miraculously heal.",
        color: PALETTE.cyan
      });
    }
  };

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Layout Viewport Data
  const pad = 40;
  const gw = width - pad * 2;
  const gh = H_VIEWPORT - pad * 2 - 20;

  const mapX = (x) => pad + x * gw;
  const mapY = (y) => pad + gh - y * gh;

  // Draw Regression Line
  const rx1 = 0; const ry1 = stats.m * rx1 + stats.b;
  const rx2 = 1; const ry2 = stats.m * rx2 + stats.b;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#100A20" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />

          {/* Grid */}
          <Line x1={pad} y1={pad + gh} x2={pad + gw + 10} y2={pad + gh} stroke={PALETTE.steel} strokeWidth={2} />
          <Line x1={pad} y1={pad + gh} x2={pad} y2={pad - 10} stroke={PALETTE.steel} strokeWidth={2} />
          <SvgText x={pad + gw - 30} y={pad + gh + 15} fill="#666" fontSize={10}>Feature X</SvgText>
          <SvgText x={pad - 35} y={pad} fill="#666" fontSize={10}>Variable Y</SvgText>

          {/* Scientist Mode: Z-Score Bounds (1 StdDev & 2 StdDev) */}
          {scientistMode && (
             <G>
                {/* 1 StdDev Band */}
                <Polygon 
                   points={`${mapX(0)},${mapY(ry1 + stats.stdDev)} ${mapX(1)},${mapY(ry2 + stats.stdDev)} ${mapX(1)},${mapY(ry2 - stats.stdDev)} ${mapX(0)},${mapY(ry1 - stats.stdDev)}`}
                   fill={PALETTE.purple} opacity={0.15}
                />
                {/* 2 StdDev Band Limits */}
                <Line x1={mapX(rx1)} y1={mapY(ry1 + stats.stdDev*2)} x2={mapX(rx2)} y2={mapY(ry2 + stats.stdDev*2)} stroke={PALETTE.red} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                <Line x1={mapX(rx1)} y1={mapY(ry1 - stats.stdDev*2)} x2={mapX(rx2)} y2={mapY(ry2 - stats.stdDev*2)} stroke={PALETTE.red} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                
                <SvgText x={pad + gw - 40} y={mapY(ry2 + stats.stdDev*2) - 5} fill={PALETTE.red} fontSize={8}>+2σ Bound</SvgText>
             </G>
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
             const dist = Math.abs(pt.y - (stats.m*pt.x + stats.b));
             const isFar = dist > stats.stdDev * 1.5;
             const isDeleted = outliersIdx.has(i);

             if (isDeleted && !isCleaning) return null; // Don't draw if truly deleted

             return (
               <G key={i} x={mapX(pt.x)} y={mapY(pt.y)}>
                  {/* The Point itself */}
                  <Circle cx={0} cy={0} r={5} fill={isDeleted ? '#333' : pt.isOutlier ? PALETTE.alert : PALETTE.cyan} />
                  
                  {/* Warning ring if Discovery Mode is on and it's far */}
                  {discoveryMode && isFar && !isDeleted && (
                     <Circle cx={0} cy={0} r={10 + (tick%5)} fill="none" stroke={PALETTE.red} strokeWidth={1} />
                  )}

                  {/* Laser beam animation during Delete */}
                  {isCleaning && isDeleted && (
                     <Line x1={-10} y1={-10} x2={10} y2={10} stroke={PALETTE.red} strokeWidth={2} />
                  )}
               </G>
             );
          })}

          {/* Linear Regression Line */}
          <Line 
             x1={mapX(rx1)} y1={mapY(ry1)} 
             x2={mapX(rx2)} y2={mapY(ry2)} 
             stroke={PALETTE.green} strokeWidth={3} 
          />

          {scientistMode && (
             <G>
               <SvgText x={15} y={15} fill={PALETTE.green} fontSize={10} fontFamily="monospace">
                  y = {stats.m.toFixed(2)}x + {stats.b.toFixed(2)}
               </SvgText>
               <SvgText x={15} y={30} fill={PALETTE.purple} fontSize={10} fontFamily="monospace">
                  σ (StdDev) = {stats.stdDev.toFixed(3)}
               </SvgText>
             </G>
          )}

        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.cyan : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>DATASET VARIANCE (SCATTER): {variance.toFixed(1)}</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.cyan}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              const v = 0.1 + (x / (width-40)) * 2.9;
              setVariance(v);
              generateData(v);
            }}>
              <View style={[styles.sliderFill, { width: `${((variance-0.1)/2.9)*100}%`, backgroundColor: PALETTE.cyan }]} />
              <View style={[styles.sliderThumb, { left: `${((variance-0.1)/2.9)*100}%` }]} />
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtnHalf} activeOpacity={0.8} onPress={injectOutliers}>
               <Icon name="alert-triangle" size={16} color="#FFF" style={{marginBottom: 4}} />
               <Text style={styles.actionBtnTxt}>INJECT OUTLIERS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtnHalf, {backgroundColor: PALETTE.purple}]} activeOpacity={0.8} onPress={cleanData}>
               <Icon name="check-circle" size={16} color="#FFF" style={{marginBottom: 4}} />
               <Text style={styles.actionBtnTxt}>PULSE CLEAN (±1.5σ)</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Inject outliers into the dataset...'}</Text>
        <View style={[styles.logBadge, { backgroundColor: logs.length > 0 ? PALETTE.green : '#333' }]}><Text style={{ color: logs.length > 0 ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{logs.length}</Text></View>
      </TouchableOpacity>

      {/* Logs Modal */}
      <Modal visible={logsOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.panel }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: PALETTE.text }]}>Research Log</Text>
              <TouchableOpacity onPress={() => { soundTap(); setLogsOpen(false); }}>
                <Icon name="x" size={24} color={PALETTE.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {logs.length === 0 ? (
                <Text style={styles.emptyLog}>No discoveries yet. Trigger a corruption event!</Text>
              ) : (
                logs.map((l, i) => (
                  <View key={i} style={[styles.logCard, { borderLeftColor: l.color }]}>
                    <Text style={styles.logCardTitle}>{l.title}</Text>
                    <Text style={styles.logCardDesc}>{l.entry}</Text>
                  </View>
                ))
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  viewport: { width: '100%', overflow: 'hidden' },
  discoveryBtn: { position: 'absolute', top: 15, right: 15, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PALETTE.steel },
  panel: { backgroundColor: PALETTE.panel, borderTopWidth: 2, borderTopColor: PALETTE.steel },
  panelInner: { flex: 1, padding: 20 },
  sliderWrap: { width: '100%', marginBottom: 20 },
  sliderLabel: { color: PALETTE.text, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  sliderBg: { height: 16, backgroundColor: '#0A0515', borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionBtnHalf: { flex: 1, backgroundColor: PALETTE.red, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnTxt: { color: '#FFF', fontFamily: 'Outfit_700Bold', letterSpacing: 0.5, fontSize: 12, textAlign: 'center' },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#0A0510', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#0A0510', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
