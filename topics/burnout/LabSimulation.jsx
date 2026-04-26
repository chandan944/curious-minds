import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function BurnoutLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [gameState, setGameState] = useState('playing'); // playing, busted, won
  const [battery, setBattery] = useState(100);
  const [workDone, setWorkDone] = useState(0); 
  const [cynicism, setCynicism] = useState(0); // Rises when battery is very low

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  // Constant battery drain
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setBattery(prev => {
          const next = prev - 4; // Constant drain
          if (next <= 0) {
            setGameState('busted');
            clearInterval(interval);
            return 0;
          }
          return next;
        });

        // If battery is critically low, cynicism rises
        if (battery < 20) {
           setCynicism(prev => {
             const next = prev + 5;
             if (next >= 100) {
               setGameState('busted');
               clearInterval(interval);
               return 100;
             }
             return next;
           });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, battery]);

  const handleAction = (type) => {
    if (gameState !== 'playing') return;

    if (type === 'work') {
      // Working drains heavily but is required to win
      setBattery(prev => Math.max(0, prev - 15));
      setWorkDone(prev => {
         const next = prev + 10;
         if (next >= 100) {
           setGameState('won');
           if (onComplete) setTimeout(onComplete, 2000);
         }
         return next;
      });
    } else if (type === 'passive') {
      // Passive rest (doomscrolling) gives a tiny bit of battery back but raises cynicism slightly because it feels meaningless
      setBattery(prev => Math.min(100, prev + 5));
      setCynicism(prev => Math.min(100, prev + 2));
    } else if (type === 'active') {
      // Active rest (nature, hobby) highly recharges battery and lowers cynicism
      setBattery(prev => Math.min(100, prev + 30));
      setCynicism(prev => Math.max(0, prev - 20));
    }
  };

  const restart = () => {
    setBattery(100);
    setWorkDone(0);
    setCynicism(0);
    setGameState('playing');
  };

  const getBatteryColor = () => {
    if (battery > 60) return '#4CAF50';
    if (battery > 25) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* HUD System */}
      <View style={styles.hud}>
        <Text style={[styles.hudLabel, { color: textColor }]}>
          {isHindi ? 'प्रीफ्रंटल बैटरी' : 'Prefrontal Battery:'} {Math.ceil(battery)}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${battery}%`, backgroundColor: getBatteryColor() }]} />
        </View>

        <Text style={[styles.hudLabel, { color: textColor, marginTop: 12 }]}>
          {isHindi ? 'परियोजना की प्रगति' : 'Project Progress:'} {Math.ceil(workDone)}%
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${workDone}%`, backgroundColor: '#2196F3' }]} />
        </View>

        <Text style={[styles.hudLabel, { color: textColor, marginTop: 12 }]}>
          {isHindi ? 'सनकपन (Cynicism) / डिपर्सनलाइज़ेशन:' : 'Cynicism / Depersonalization:'} {Math.ceil(cynicism)}%
        </Text>
        <View style={styles.barContainer}>
           <View style={[styles.barFill, { width: `${cynicism}%`, backgroundColor: '#9C27B0' }]} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'playing' && (
          <View>
            <View style={styles.iconCenter}>
               <Feather 
                 name={battery < 20 ? "battery" : "battery-charging"} 
                 size={64} 
                 color={getBatteryColor()} 
               />
               {battery < 20 && (
                 <Text style={styles.warningText}>
                   {isHindi ? 'चेतावनी: कम ऊर्जा!' : 'WARNING: LOW ENERGY!'}
                 </Text>
               )}
            </View>

            <View style={styles.controls}>
              
              <TouchableOpacity style={[styles.btn, styles.workBtn]} onPress={() => handleAction('work')}>
                <Feather name="briefcase" size={20} color="#FFF" />
                <Text style={styles.btnText}>{isHindi ? 'काम करें (-15%)' : 'Work (-15%)'}</Text>
              </TouchableOpacity>
              
              <View style={styles.row}>
                 <TouchableOpacity style={[styles.btn, styles.passiveBtn, { flex: 1, marginRight: 8 }]} onPress={() => handleAction('passive')}>
                   <Feather name="smartphone" size={20} color="#FFF" />
                   <Text style={[styles.btnText, { fontSize: 12 }]}>{isHindi ? 'फ़ोन चलाएँ (+5%)' : 'Scroll Phone (+5%)'}</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={[styles.btn, styles.activeBtn, { flex: 1, marginLeft: 8 }]} onPress={() => handleAction('active')}>
                   <Feather name="sun" size={20} color="#FFF" />
                   <Text style={[styles.btnText, { fontSize: 12 }]}>{isHindi ? 'सक्रिय आराम (+30%)' : 'Active Rest (+30%)'}</Text>
                 </TouchableOpacity>
              </View>

            </View>
          </View>
        )}

        {gameState === 'busted' && (
          <View style={styles.centerContent}>
            <Feather name="alert-triangle" size={64} color="#F44336" style={styles.iconMargin} />
            <Text style={[styles.feedbackTitle, { color: '#F44336' }]}>
              {isHindi ? 'सिस्टम क्रैश (बर्नआउट)' : 'System Crash (Burnout)'}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {cynicism >= 100 
                ? (isHindi ? "सनकपन चरम पर पहुँच गया। आपने लोगों की परवाह करना बंद कर दिया और छोड़ दिया।" : "Cynicism hit 100%. You completely detached from the project and quit.") 
                : (isHindi ? "आपकी बैटरी खत्म हो गई। शरीर ने 'ज़बरन शटडाउन' शुरू कर दिया।" : "Battery depleted totally. Your body initiated a physiological forced shutdown.")}
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#FF9800' }]} onPress={restart}>
              <Text style={styles.btnText}>{isHindi ? 'पुनः प्रयास करें' : 'Attempt Re-Entry'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'won' && (
          <View style={styles.centerContent}>
            <Feather name="check-circle" size={64} color="#4CAF50" style={styles.iconMargin} />
            <Text style={[styles.feedbackTitle, { color: '#4CAF50' }]}>
              {isHindi ? 'प्रोजेक्ट सुरक्षित रूप से पूरा हुआ!' : 'Project Safely Delivered!'}
            </Text>
            <Text style={[styles.feedbackText, { color: textColor }]}>
              {isHindi 
                ? 'आपने मांग और आराम (Rest) को सफलतापूर्वक संतुलित किया। आपने फेक रेस्ट (फ़ोन) से बचकर सक्रिय आराम का उपयोग किया।' 
                : 'You successfully balanced performance and recovery. By prioritizing Active Rest, you kept the stress cycle complete without burning out.'}
            </Text>
          </View>
        )}

      </View>
      <Text style={[styles.hint, { color: textColor }]}>
        {isHindi ? 'टिप: केवल फ़ोन चलाना (Passive) काफी नहीं है। आपको सक्रिय आराम चाहिए।' : 'Insight: Passive scrolling halts drain but doesn’t recover energy. You need Active Rest.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  hud: {
    marginBottom: 24,
  },
  hudLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  barContainer: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 300,
    justifyContent: 'center',
  },
  iconCenter: {
    alignItems: 'center',
    marginBottom: 30,
  },
  warningText: {
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  controls: {
    width: '100%',
  },
  btn: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workBtn: {
    backgroundColor: '#3F51B5', // Indigo
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passiveBtn: {
    backgroundColor: '#607D8B', // Grey Blue
  },
  activeBtn: {
    backgroundColor: '#4CAF50', // Green
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconMargin: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  }
});
