const fs = require('fs');
const path = require('path');

const CATEGORY_ACCENT_MAP = {
  "Nature & Earth": "nature",
  "Universe & Science": "science",
  "Human Being": "human",
  "History & Civilizations": "history",
  "Countries & Cultures": "culture",
  "Technology & Innovation": "tech",
  "Arts & Culture": "art",
  "Ideas & Thinking": "ideas",
  "Sports & Games": "sports",
  "Mystery & Beyond": "mystery"
};

const FACTS_DIR = path.join(__dirname, '..', 'facts');

function fixAccents() {
  const dirs = fs.readdirSync(FACTS_DIR);
  for (const dir of dirs) {
    const engPath = path.join(FACTS_DIR, dir, 'config.js');
    const hinPath = path.join(FACTS_DIR, dir, 'config_hi.js');

    if (fs.existsSync(engPath)) {
      let content = fs.readFileSync(engPath, 'utf8');
      const categoryMatch = content.match(/"category":\s*"(.*?)"/);
      if (categoryMatch) {
        const cat = categoryMatch[1];
        const accent = CATEGORY_ACCENT_MAP[cat];
        if (accent) {
          content = content.replace(/"accentKey":\s*"(.*?)"/, `"accentKey": "${accent}"`);
          fs.writeFileSync(engPath, content);
          console.log(`✅ Fixed accent for ${dir} (${accent})`);
        }
      }
    }
    
    if (fs.existsSync(hinPath)) {
      let content = fs.readFileSync(hinPath, 'utf8');
      const categoryMatch = content.match(/"category":\s*"(.*?)"/);
      if (categoryMatch) {
        const cat = categoryMatch[1];
        const accent = CATEGORY_ACCENT_MAP[cat];
        if (accent) {
          content = content.replace(/"accentKey":\s*"(.*?)"/, `"accentKey": "${accent}"`);
          fs.writeFileSync(hinPath, content);
          console.log(`✅ Fixed Hindi accent for ${dir} (${accent})`);
        }
      }
    }
  }
}

fixAccents();
