import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Slider from '@react-native-community/slider';

// Because expo/react-native might not have Slider built-in in older versions, 
// using generic touchable bars if Slider is problematic, but let's assume standard Slider or build a custom one to be safe and beautiful.

// We will build a Custom Slider for better UI/UX without dependencies.
const CustomSlider = ({ value, onValueChange, color, label, icon }) => {
  return (
    <View style={styles.sliderContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name={icon} size={16} color={color} style={{ marginRight: 6 }} />
          <Text style={[styles.sliderLabel, { color }]}>{label}</Text>
        </View>
        <Text style={[styles.sliderValue, { color }]}>{Math.round(value)}%</Text>
      </View>
      
      {/* Custom Draggable Bar - simplified to just tap/set or segmented control for reliability in this env */}
      <View style={styles.segmentedControl}>
         {[10, 30, 50, 70, 90].map(val => (
           <TouchableOpacity 
             key={val}
             style={[
               styles.segmentNode, 
               { 
                 backgroundColor: value >= val ? color : '#333',
                 transform: [{ scale: value === val ? 1.3 : 1 }]
               }
             ]}
             onPress={() => onValueChange(val)}
             activeOpacity={0.7}
           />
         ))}
      </View>
    </View>
  );
};

export default function EnlightenmentLab({ onComplete, isHindi }) {
  const { isDarkMode } = useTheme();
  
  const [executive, setExecutive] = useState(90); // Starts as absolute monarchy
  const [legislative, setLegislative] = useState(10);
  const [judicial, setJudicial] = useState(10);
  
  const [gameState, setGameState] = useState('drafting'); // drafting, won, lose
  const [feedback, setFeedback] = useState(null);

  const bgColor = isDarkMode ? '#121212' : '#F5F5FA';
  const textColor = isDarkMode ? '#FFF' : '#333';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFF';

  const calculateState = () => {
    // Check for Tyranny
    if (executive > 70) {
      setFeedback({
        type: 'tyranny',
        titleEn: "Executive Tyranny",
        titleHi: "कार्यकारी अत्याचार (Dictatorship)",
        msgEn: "The King/President has too much power. He ignores the laws and executes his critics. The nation falls into a dictatorship.",
        msgHi: "राजा/राष्ट्रपति के पास बहुत अधिक शक्ति है। वह कानूनों की अनदेखी करता है और आलोचकों को फांसी देता है। राष्ट्र तानाशाही में गिर जाता है।"
      });
      setGameState('lose');
      return;
    }
    if (legislative > 70) {
      setFeedback({
        type: 'tyranny',
        titleEn: "Mob Rule",
        titleHi: "भीड़तंत्र (Mob Rule)",
        msgEn: "The legislature has absolute power, leading to the 'Tyranny of the Majority'. Minority rights are crushed by endless chaotic voting.",
        msgHi: "विधायिका (संसद) के पास पूर्ण शक्ति है, जिससे 'बहुमत का अत्याचार' होता है। अंतहीन अराजक मतदान से अल्पसंख्यकों के अधिकार कुचल दिए जाते हैं।"
      });
      setGameState('lose');
      return;
    }
    if (judicial > 70) {
      setFeedback({
        type: 'tyranny',
        titleEn: "Judicial Oligarchy",
        titleHi: "न्यायिक कुलीनतंत्र (Oligarchy)",
        msgEn: "Unelected judges hold all the power, striking down every law the people vote for. The nation is trapped in legal gridlock.",
        msgHi: "चयनित नहीं किए गए न्यायाधीशों (Judges) के पास सारी शक्ति है, वे जनता द्वारा चुने गए हर कानून को रद्द कर देते हैं। राष्ट्र कानूनी गतिरोध में फंसा है।"
      });
      setGameState('lose');
      return;
    }

    // Check for weakness (Anarchy)
    if (executive < 20 && legislative < 20 && judicial < 20) {
      setFeedback({
        type: 'anarchy',
        titleEn: "Anarchy",
        titleHi: "अराजकता (Anarchy)",
        msgEn: "The government has no power to enforce laws, collect taxes, or protect natural rights. The nation dissolves into chaotic violence.",
        msgHi: "सरकार के पास कानून लागू करने, कर (tax) वसूलने या प्राकृतिक अधिकारों की रक्षा करने की कोई शक्ति नहीं है। राष्ट्र अराजक हिंसा में विलीन हो जाता है।"
      });
      setGameState('lose');
      return;
    }

    // Checking Equilibrium (Roughly equal power, e.g., all between 30 and 50)
    const ext = executive >= 30 && executive <= 50;
    const leg = legislative >= 30 && legislative <= 50;
    const jud = judicial >= 30 && judicial <= 50;

    if (ext && leg && jud) {
      setFeedback({
        type: 'success',
        titleEn: "Montesquieu's Equilibrium",
        titleHi: "मोंटेस्क्यू का संतुलन (Equilibrium)",
        msgEn: "Perfect Separation of Powers! Ambition counteracts ambition. The branches check and balance each other, protecting the Natural Rights of the citizens.",
        msgHi: "शक्तियों का पूर्ण पृथक्करण (विभाजन)! एक शाखा की 'महत्वाकांक्षा' दूसरी शाखा से कटती है। सभी शाखाएं एक-दूसरे को संतुलित करती हैं, जिससे नागरिकों के मानवाधिकार सुरक्षित हैं।"
      });
      setGameState('won');
      if (onComplete) setTimeout(onComplete, 4000);
    } else {
       // Not quite there but not dying yet.
       alert(isHindi ? "शक्तियां अभी 'संतुलित' (Balanced) नहीं हैं। फिर से प्रयास करें।" : "Powers are not checked and balanced yet. Keep adjusting.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      <View style={styles.hud}>
         <Text style={[styles.title, { color: textColor }]}>
            {isHindi ? "संविधान निर्माण उपकरण" : "Constitutional Forge"}
         </Text>
         <Text style={[styles.subtitle, { color: textColor }]}>
            {isHindi 
              ? "सिद्धांत: शक्तियों का 'एक' व्यक्ति के हाथ में होना 'अत्याचार' है। शक्तियों को संतुलित (Balance) करें।" 
              : "Rule: Concentrated power is tyranny. Create a balance of power."}
         </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBgColor }]}>
        
        {gameState === 'drafting' && (
          <View style={styles.interactBox}>
             
             <CustomSlider 
               label={isHindi ? "कार्यकारी (Executive/King/President)" : "Executive"} 
               value={executive} 
               onValueChange={setExecutive} 
               color="#F44336" 
               icon="user-check"
             />

             <CustomSlider 
               label={isHindi ? "विधायी (Legislature/Parliament)" : "Legislature"} 
               value={legislative} 
               onValueChange={setLegislative} 
               color="#2196F3" 
               icon="users"
             />

             <CustomSlider 
               label={isHindi ? "न्यायिक (Judicial/Courts)" : "Judicial"} 
               value={judicial} 
               onValueChange={setJudicial} 
               color="#4CAF50" 
               icon="briefcase"
             />

             <TouchableOpacity style={styles.ratifyBtn} onPress={calculateState}>
                <Text style={styles.ratifyText}>{isHindi ? "संविधान स्थापित करें" : "RATIFY CONSTITUTION"}</Text>
             </TouchableOpacity>

          </View>
        )}

        {(gameState === 'lose' || gameState === 'won') && feedback && (
          <View style={styles.feedbackBox}>
             <Feather 
               name={gameState === 'won' ? "award" : "alert-triangle"} 
               size={60} 
               color={gameState === 'won' ? "#FFC107" : "#F44336"} 
               style={{ marginBottom: 16 }}
             />
             <Text style={[styles.feedbackTitle, { color: gameState === 'won' ? '#FFC107' : '#F44336' }]}>
               {isHindi ? feedback.titleHi : feedback.titleEn}
             </Text>
             <Text style={[styles.feedbackMsg, { color: textColor }]}>
               {isHindi ? feedback.msgHi : feedback.msgEn}
             </Text>
             
             {gameState === 'lose' && (
               <TouchableOpacity 
                 style={[styles.ratifyBtn, { backgroundColor: '#333', marginTop: 24 }]} 
                 onPress={() => {
                   setExecutive(90); setLegislative(10); setJudicial(10); setGameState('drafting');
                 }}
               >
                  <Text style={styles.ratifyText}>{isHindi ? "नई क्रांति (फिर से प्रयास करें)" : "START REVOLUTION (TRY AGAIN)"}</Text>
               </TouchableOpacity>
             )}
          </View>
        )}

      </View>
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
    marginBottom: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 350,
  },
  interactBox: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between'
  },
  sliderContainer: {
    marginBottom: 20,
    backgroundColor: '#0000000AA',
    padding: 16,
    borderRadius: 12,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 10,
    marginTop: 10
  },
  segmentNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  ratifyBtn: {
    backgroundColor: '#795548',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10
  },
  ratifyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  feedbackBox: {
    padding: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackMsg: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  }
});
