const fs = require('fs');
const path = require('path');

const termsToReplace = {
  "Agnostic Atheist": "अज्ञेयवादी नास्तिक",
  "The Übermensch": "उबरमेंश (महामानव)",
  "The Absurd": "निरर्थकता",
  "Amor Fati": "अमोर फती",
  "The Puddle Analogy": "गड्ढे का उदाहरण",
  "Overview Effect": "समग्र दृष्टिकोण प्रभाव",
  "ओवरव्यू इफ़ेक्ट": "समग्र दृष्टिकोण प्रभाव",
  "ओवरमैन": "महामानव",
  "उबरमेंश": "महामानव",
  "एग्नोस्टिक एथिएस्ट": "अज्ञेयवादी नास्तिक",
  "एंटी-थीस्ट": "ईश्वर-विरोधी",
  "एंटी-थीज़्म": "ईश्वर-विरोध",
  "ऑब्जेक्टिव": "वस्तुनिष्ठ",
  "सब्जेक्टिव": "व्यक्तिपरक",
  "हार्डवेयर": "क्षमता",
  "न्यूरोलॉजिकली": "स्नायविक रूप से",
  "मिरर न्यूरॉन्स": "मिरर न्यूरॉन्स (प्रतिबिंब तंत्रिकाएं)",
  "फाइन-ट्यून": "अनुकूलित",
  "कस्टम-मेड": "विशेष रूप से निर्मित",
  "बायोलॉजी": "जीव विज्ञान",
  "डिलीट": "नष्ट",
  "डिफ़ॉल्ट स्थिति": "मूल स्थिति",
  "डिफ़ॉल्ट": "मूल",
  "हाइपरएक्टिव एजेंसी डिटेक्शन डिवाइस": "अतिसक्रिय अभिकरण पहचान तंत्र",
  "एजेंसी": "अभिकरण",
  "स्केल रिलेटिविटी": "सापेक्षिक पैमाना",
  "प्रीफ्रंटल कॉर्टेक्स": "प्रीफ्रंटल कॉर्टेक्स (मस्तिष्क का अग्र भाग)",
  "इटरनल रिकरेंस": "अनन्त पुनरावृत्ति",
  "ऑब्जेक्टिव रूप से": "वस्तुनिष्ठ रूप से",
  "सब्जेक्टिव रूप से": "व्यक्तिपरक रूप से",
  "हार्डवायर्ड": "स्वाभाविक रूप से प्रवृत्त",
  "A-Dragonist": "ड्रैगन-नास्तिक"
};

const topics = ['atheism', 'nihilism', 'absurdism', 'stoicism', 'existentialism', 'enlightenment', 'greatest_philosophers', 'ethics_morality', 'free_will', 'consciousness', 'eastern_philosophy'];
const basePath = path.join(process.cwd(), 'topics');

topics.forEach(topic => {
  const filePath = path.join(basePath, topic, 'config_hi.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace terms safely
    for (const [eng, hin] of Object.entries(termsToReplace)) {
      // Escape special regex characters in the search term if any, though none of ours have them right now except maybe hyphens
      const escapedEng = eng.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedEng, 'gi');
      content = content.replace(regex, hin);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translated terms in ${topic}`);
  }
});
