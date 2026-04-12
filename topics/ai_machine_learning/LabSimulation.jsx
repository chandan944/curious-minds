/**
 * AI & Machine Learning Lab — Perceptron Gradient Descent
 * Scientist Mode: Sigmoid, MSE computations
 * NO react-native-reanimated — Old Architecture safe
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  PanResponder, Animated, Easing, Modal, ScrollView
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Defs, RadialGradient as SvgRadial, Stop, G, Text as SvgText, Polygon
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { soundTap } from '../../utils/sounds';
import Icon from '../../components/ui/Icons';

const { width, height } = Dimensions.get('window');
const H_VIEWPORT = height * 0.45;
const H_PANEL = height * 0.35;
const H_LOG = height * 0.10;

const PALETTE = {
  bg: '#051015',
  panel: '#0B1A20',
  cyan: '#00D4FF',
  green: '#39FF14',
  red: '#FF3131',
  text: '#E8E0D0',
  steel: '#1A3035',
  purple: '#A855F7',
  pink: '#FF4D6D'
};

// Generate fixed dataset for stability
const DATA_POINTS = [
  // Class 0 (Blue) - Bottom left
  { x: 0.2, y: 0.2, c: 0 }, { x: 0.3, y: 0.4, c: 0 }, { x: 0.1, y: 0.5, c: 0 },
  { x: 0.4, y: 0.2, c: 0 }, { x: 0.2, y: 0.6, c: 0 }, { x: 0.45, y: 0.45, c: 0 },
  // Class 1 (Red) - Top right
  { x: 0.7, y: 0.8, c: 1 }, { x: 0.6, y: 0.9, c: 1 }, { x: 0.9, y: 0.6, c: 1 },
  { x: 0.8, y: 0.7, c: 1 }, { x: 0.55, y: 0.65, c: 1 }, { x: 0.85, y: 0.9, c: 1 }
];

export default function AILab({ scientistMode = false, accentColor = '#00D4FF', onLabBreaker }) {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const discoveryAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Local logs state
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const discovered = useRef(new Set());

  // Weights and Bias (range -10 to 10)
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(-1);
  const [b, setB] = useState(0);

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(1.0);

  // Logic Tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const loop = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(loop);
  }, []);

  const addLog = useCallback((id, entry) => {
    if (!discovered.current.has(id)) {
      discovered.current.add(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLogs(prev => [...prev, entry]);
    }
  }, []);

  // Compute Loss immediately when weights change
  useEffect(() => {
    let currentLoss = 0;
    DATA_POINTS.forEach(pt => {
      // Linear eq: z = x*w1 + y*w2 + b
      const z = pt.x * w1 + pt.y * w2 + b;
      // Sigmoid activation: 1 / (1 + e^-z)
      const a = 1 / (1 + Math.exp(-z));
      // Mean Squared Error component: (target - prediction)^2
      currentLoss += Math.pow(pt.c - a, 2);
    });
    currentLoss = currentLoss / DATA_POINTS.length;
    setLoss(currentLoss);

    // Discoveries
    if (currentLoss < 0.05 && !discovered.current.has('d1')) {
       addLog('d1', {
         title: "Optimal Convergence (0% Error)",
         entry: "You successfully separated the data! The Decision Boundary perfectly isolates the Red dots from the Blue dots. The neural network has learned!",
         color: PALETTE.green
       });
    }

    if (currentLoss > 0.8 && !discovered.current.has('d2')) {
       addLog('d2', {
         title: "Catastrophic Overfitting (High Loss)",
         entry: "The model is completely backwards! The Loss metric is skyrocketing. In a real AI, this mathematically forces the algorithm to immediately reverse its weights to survive.",
         color: PALETTE.red
       });
       // Vibrate intensely if loss is high
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [w1, w2, b, addLog]);

  // Autogradient Descent Loop
  useEffect(() => {
    let trainLoop;
    if (isTraining) {
      trainLoop = setInterval(() => {
        // Simple Gradient Descent
        const lr = 0.5; // learning rate
        let dw1 = 0, dw2 = 0, db = 0;
        
        DATA_POINTS.forEach(pt => {
          const z = pt.x * w1 + pt.y * w2 + b;
          const a = 1 / (1 + Math.exp(-z));
          // Derivative of loss wrt weights
          const dz = a - pt.c;
          dw1 += dz * pt.x;
          dw2 += dz * pt.y;
          db += dz;
        });

        dw1 /= DATA_POINTS.length;
        dw2 /= DATA_POINTS.length;
        db /= DATA_POINTS.length;

        setW1(prev => prev - lr * dw1);
        setW2(prev => prev - lr * dw2);
        setB(prev => prev - lr * db);
        setEpoch(e => e + 1);

        if (loss < 0.02 || epoch > 100) {
          setIsTraining(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (epoch > 100 && !discovered.current.has('d3')) {
            addLog('d3', {
              title: "Gradient Descent Auto-Pilot",
              entry: "The algorithm mathematically rolled down the slope of the error curve to automatically find the perfect Weights! You just witnessed Machine Learning.",
              color: PALETTE.purple
            });
          }
        }
      }, 50); // fast epochs
    }
    return () => clearInterval(trainLoop);
  }, [isTraining, w1, w2, b, loss, epoch, addLog]);

  const toggleDiscovery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !discoveryMode;
    setDiscoveryMode(next);
    Animated.timing(discoveryAnim, {
      toValue: next ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start();
  };

  // Viewport Coordinates mapping
  const pad = 40;
  const gw = width - pad * 2;
  const gh = H_VIEWPORT - pad * 2 - 20;

  // The decision boundary is the line where z = 0
  // x*w1 + y*w2 + b = 0  =>  y = -(w1/w2)x - (b/w2)
  // We need to plot this line.
  
  const getLineY = (x) => {
    if (Math.abs(w2) < 0.01) return -100; // prevent infinity
    return -(w1 / w2) * x - (b / w2);
  };

  const lineX1 = 0; const lineY1 = getLineY(lineX1);
  const lineX2 = 1; const lineY2 = getLineY(lineX2);

  // Map to SVG pixels: y is inverted in SVG
  const mapX = (x) => pad + x * gw;
  const mapY = (y) => pad + gh - y * gh;

  return (
    <View style={styles.root}>
      {/* Viewport */}
      <Animated.View style={[styles.viewport, { height: H_VIEWPORT, transform: [{ translateX: shakeAnim }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadial id="bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0B1A20" />
              <Stop offset="100%" stopColor={PALETTE.bg} />
            </SvgRadial>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
          
          {/* Axis Grid */}
          <Line x1={pad} y1={pad + gh} x2={pad + gw + 10} y2={pad + gh} stroke={PALETTE.steel} strokeWidth={2} />
          <Line x1={pad} y1={pad + gh} x2={pad} y2={pad - 10} stroke={PALETTE.steel} strokeWidth={2} />
          <SvgText x={pad + gw - 20} y={pad + gh + 15} fill="#666" fontSize={10}>Input X₁</SvgText>
          <SvgText x={pad - 35} y={pad} fill="#666" fontSize={10}>Input X₂</SvgText>

          {/* Decision Boundary Line */}
          <Line x1={mapX(lineX1)} y1={mapY(lineY1)} x2={mapX(lineX2)} y2={mapY(lineY2)} stroke={PALETTE.green} strokeWidth={3} strokeDasharray="8 4" opacity={0.8} />

          {/* If scientist mode, show the shading region where Sigmoid > 0.5 */}
          {scientistMode && w2 !== 0 && (
             <Polygon 
               points={`${mapX(0)},${mapY(0)} ${mapX(1)},${mapY(0)} ${mapX(1)},${mapY(1)} ${mapX(0)},${mapY(1)}`}
               fill={w2 > 0 ? PALETTE.red : PALETTE.cyan} opacity={0.05}
             />
          )}

          {/* Data Points */}
          {DATA_POINTS.map((pt, i) => {
            // Is it currently misclassified by the line?
            const z = pt.x * w1 + pt.y * w2 + b;
            const a = 1 / (1 + Math.exp(-z));
            const isWrong = Math.abs(pt.c - a) > 0.5;
            
            return (
              <G key={i} x={mapX(pt.x)} y={mapY(pt.y)}>
                <Circle cx={0} cy={0} r={6} fill={pt.c === 0 ? PALETTE.cyan : PALETTE.red} />
                {isWrong && discoveryMode && (
                  <Circle cx={0} cy={0} r={12 + (tick%5)} fill="none" stroke={PALETTE.pink} strokeWidth={1} />
                )}
                {scientistMode && !isWrong && (
                  <Line x1={0} y1={0} x2={Math.cos(tick*0.1)*5} y2={Math.sin(tick*0.1)*5} stroke="#FFF" strokeWidth={1} />
                )}
              </G>
            );
          })}

          {scientistMode && (
            <G>
              <SvgText x={15} y={25} fill={PALETTE.purple} fontSize={12} fontFamily="monospace">
                z = w₁x₁ + w₂x₂ + b
              </SvgText>
              <SvgText x={15} y={45} fill={PALETTE.cyan} fontSize={10} fontFamily="monospace">
                σ(z) = 1 / (1 + e⁻ᶻ)
              </SvgText>
            </G>
          )}

          {/* Loss HUD (Top Right) */}
          <G x={width - 120} y={15}>
            <Rect x={0} y={0} width={100} height={30} fill="#000" rx={5} stroke={loss > 0.5 ? PALETTE.red : PALETTE.green} strokeWidth={1} />
            <SvgText x={10} y={19} fill={loss > 0.5 ? PALETTE.red : PALETTE.green} fontSize={12} fontFamily="monospace" fontWeight="bold">
              LOSS: {loss.toFixed(3)}
            </SvgText>
          </G>
        </Svg>
        
        <TouchableOpacity style={styles.discoveryBtn} onPress={toggleDiscovery} activeOpacity={0.8}>
          <Icon name="search" size={24} color={discoveryMode ? PALETTE.cyan : PALETTE.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Control Panel */}
      <View style={[styles.panel, { height: H_PANEL }]}>
        <View style={styles.panelInner}>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>WEIGHT 1 (X Axis Pull): {w1.toFixed(2)}</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.cyan}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              if (isTraining) return;
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setW1(-5 + (x / (width-40)) * 10);
            }}>
              <View style={[styles.sliderFill, { width: `${((w1+5)/10)*100}%`, backgroundColor: PALETTE.cyan }]} />
              <View style={[styles.sliderThumb, { left: `${((w1+5)/10)*100}%` }]} />
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>WEIGHT 2 (Y Axis Pull): {w2.toFixed(2)}</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.red}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              if (isTraining) return;
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setW2(-5 + (x / (width-40)) * 10);
            }}>
              <View style={[styles.sliderFill, { width: `${((w2+5)/10)*100}%`, backgroundColor: PALETTE.red }]} />
              <View style={[styles.sliderThumb, { left: `${((w2+5)/10)*100}%` }]} />
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <Text style={styles.sliderLabel}>BIAS (Line Shift): {b.toFixed(2)}</Text>
            <View style={[styles.sliderBg, { borderColor: PALETTE.purple}]} onStartShouldSetResponder={() => true} onResponderMove={e => {
              if (isTraining) return;
              const x = Math.max(0, Math.min(width-40, e.nativeEvent.locationX));
              setB(-5 + (x / (width-40)) * 10);
            }}>
              <View style={[styles.sliderFill, { width: `${((b+5)/10)*100}%`, backgroundColor: PALETTE.purple }]} />
              <View style={[styles.sliderThumb, { left: `${((b+5)/10)*100}%` }]} />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, isTraining && { backgroundColor: PALETTE.red }]} 
            activeOpacity={0.8} 
            onPress={() => { soundTap(); setIsTraining(!isTraining); setEpoch(0); }}
          >
            <Text style={styles.actionBtnTxt}>{isTraining ? 'HALT TRAINING' : 'START GRADIENT DESCENT (EPOCH)'}</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Research Log Bar */}
      <TouchableOpacity style={[styles.logBar, { height: H_LOG }]} activeOpacity={0.8} onPress={() => { soundTap(); setLogsOpen(true); }}>
        <Icon name="search" size={20} color={PALETTE.text} />
        <Text style={styles.logHintText} numberOfLines={1}>{logs.length > 0 ? `Log: ${logs[logs.length - 1].title}` : 'Adjust weights to separate the data...'}</Text>
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
                <Text style={styles.emptyLog}>No discoveries yet. Try hitting 0% Error, or triggering Overfitting!</Text>
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
  sliderWrap: { width: '100%', marginBottom: 12 },
  sliderLabel: { color: PALETTE.text, fontSize: 10, fontFamily: 'monospace', marginBottom: 4 },
  sliderBg: { height: 16, backgroundColor: '#051015', borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: '100%', borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', marginLeft: -10 },
  actionBtn: { marginTop: 10, backgroundColor: PALETTE.purple, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnTxt: { color: '#FFF', fontFamily: 'Outfit_700Bold', letterSpacing: 1, fontSize: 13 },
  logBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#051015', borderTopWidth: 1, borderTopColor: '#111', gap: 10 },
  logHintText: { flex: 1, color: '#888', fontSize: 12, fontFamily: 'monospace', fontStyle: 'italic' },
  logBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: height * 0.7, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', fontFamily: 'Outfit_700Bold' },
  emptyLog: { color: '#555', textAlign: 'center', marginTop: 40, fontFamily: 'monospace', fontSize: 13 },
  logCard: { backgroundColor: '#051015', padding: 14, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3 },
  logCardTitle: { color: PALETTE.text, fontWeight: 'bold', fontSize: 14, marginBottom: 5, fontFamily: 'Outfit_500Medium' },
  logCardDesc: { color: '#AAA', fontSize: 13, lineHeight: 19 }
});
