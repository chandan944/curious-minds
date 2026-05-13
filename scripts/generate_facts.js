/**
 * scripts/generate_facts.js
 * 
 * AUTOMATED FACT GENERATOR (English & Hindi)
 * Uses Gemini API to generate high-fidelity fact modules.
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const API_KEYS = [
  'AIzaSy-PLACEHOLDER-KEY-1',
  'AIzaSy-PLACEHOLDER-KEY-2'
];

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const FACTS_DIR = path.join(__dirname, '..', 'facts');
const REGISTRY_PATH = path.join(__dirname, '..', 'constants', 'factRegistry.js');

let keyIndex = 0;
function getNextKey() {
  if (API_KEYS.length === 0) throw new Error("No API keys provided!");
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

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

// ─────────────────────────────────────────────────────────────────
//  GEMINI API WRAPPER
// ─────────────────────────────────────────────────────────────────

async function callGemini(prompt, attempt = 1) {
  try {
    const key = getNextKey();
    const response = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, response_mime_type: "application/json" },
      })
    });

    if (!response.ok) {
      const err = await response.text();
      if ((response.status === 429 || response.status === 503) && attempt <= 5) {
        console.log(`  Rate limited (${response.status}). Retrying in ${attempt * 60}s...`);
        await delay(attempt * 60000);
        return callGemini(prompt, attempt + 1);
      }
      throw new Error(`Gemini API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text.trim();
    return JSON.parse(text);
  } catch (err) {
    if (attempt <= 5) {
      console.log(`  Error: ${err.message}. Retrying...`);
      await delay(5000);
      return callGemini(prompt, attempt + 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────
//  GENERATION LOGIC
// ─────────────────────────────────────────────────────────────────

async function generateEnglishConfig(topic) {
  const accent = CATEGORY_ACCENT_MAP[topic.category] || "default";
  const prompt = `
    Generate a premium educational fact configuration for the topic: "${topic.title}".
    Standard: v2.0 Extreme (10 high-fidelity facts).
    Aesthetic: Academic, deep, "First Principles" focused. No generic or trivial facts.
    
    Structure:
    {
      "id": "${topic.id}",
      "title": "${topic.title}",
      "subtitle": "${topic.subtitle}",
      "category": "${topic.category}",
      "accentKey": "${accent}",
      "facts": [
        {
          "id": "${topic.id}_f1",
          "content": "A deep, insightful fact in Markdown. Use **bold** for key terms. Maximum 3 sentences.",
          "color": "A premium HSL color string (e.g. #3B82F6)",
          "bgGradient": ["Dark variant of color", "#05050A"],
          "svgIcon": "One of: heart, wind, circle, loader, zap, radio, users, refresh-cw, smile, moon, star, map, globe, eye, sun, cloud, etc."
        },
        ... (generate exactly 10)
      ]
    }
    
    Return ONLY raw JSON.
  `;
  return callGemini(prompt);
}

async function translateToHindi(englishConfig) {
  const prompt = `
    Translate the following fact configuration to Hindi.
    Topic: ${englishConfig.title}
    
    Rules:
    1. Maintain academic rigor. Avoid cheap marketing-heavy phrasing.
    2. Ensure natural-sounding Hindi (Devanagari script).
    3. Keep technical terms in brackets if necessary, e.g., "प्रकाश संश्लेषण (Photosynthesis)".
    4. Keep the exact same structure and IDs.
    
    Input JSON:
    ${JSON.stringify(englishConfig)}
    
    Return ONLY raw JSON.
  `;
  return callGemini(prompt);
}

// ─────────────────────────────────────────────────────────────────
//  MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────

async function main() {
  // 1. Read Registry
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
  // Simple extraction of FACT_REGISTRY array (fragile but works for this structure)
  const registryMatch = registryContent.match(/export const FACT_REGISTRY = (\[[\s\S]*?\]);/);
  if (!registryMatch) throw new Error("Could not find FACT_REGISTRY in registry file.");
  
  // Clean up code-specific tokens for eval
  let registryJson = registryMatch[1].replace(/\/\/.*$/gm, '');
  const factRegistry = eval(registryJson);

  console.log(`🚀 Starting fact generation for ${factRegistry.length} topics...\n`);

  for (const topic of factRegistry) {
    const topicDir = path.join(FACTS_DIR, topic.id);
    const engPath = path.join(topicDir, 'config.js');
    const hinPath = path.join(topicDir, 'config_hi.js');

    if (fs.existsSync(engPath) && fs.existsSync(hinPath)) {
      console.log(`⏭️  Skipping ${topic.id} (already exists)`);
      continue;
    }

    console.log(`📦 Generating: ${topic.title} (${topic.id})...`);

    try {
      if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

      // Generate English
      let engConfig;
      if (!fs.existsSync(engPath)) {
        engConfig = await generateEnglishConfig(topic);
        const engContent = `export default ${JSON.stringify(engConfig, null, 2)};\n`;
        fs.writeFileSync(engPath, engContent);
        console.log(`  ✅ English generated.`);
      } else {
        // Load existing for translation
        const existingRaw = fs.readFileSync(engPath, 'utf8');
        // Strip 'export default' and trailing semicolon
        let cleaned = existingRaw.replace(/export\s+default\s+/, '').trim();
        if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);
        try {
          engConfig = eval(`(${cleaned})`);
        } catch (e) {
          console.error(`  ❌ Eval failed for ${topic.id}: ${e.message}`);
          continue;
        }
      }

      // Generate Hindi
      if (!fs.existsSync(hinPath)) {
        const hinConfig = await translateToHindi(engConfig);
        const hinContent = `export default ${JSON.stringify(hinConfig, null, 2)};\n`;
        fs.writeFileSync(hinPath, hinContent);
        console.log(`  🇮🇳 Hindi translation complete.`);
      }

      // Update Registry Map (Optional but helpful)
      updateRegistryMap(topic.id);

      // Wait between topics to avoid aggressive rate limiting
      await delay(15000);
    } catch (err) {
      console.error(`  ❌ Failed ${topic.id}: ${err.message}`);
    }
  }

  console.log(`\n🎉 All topics processed!`);
}

function updateRegistryMap(topicId) {
  let content = fs.readFileSync(REGISTRY_PATH, 'utf8');
  
  // Update English Map
  if (!content.includes(`  "${topicId}": () => require("../facts/${topicId}/config").default,`)) {
    const engLine = `  "${topicId}": () => require("../facts/${topicId}/config").default,\n`;
    const engInsertIndex = content.indexOf('// Remaining 90');
    if (engInsertIndex !== -1) {
      content = content.slice(0, engInsertIndex) + engLine + content.slice(engInsertIndex);
    }
  }

  // Update Hindi Map
  if (!content.includes(`  "${topicId}": () => require("../facts/${topicId}/config_hi").default,`)) {
    const hiLine = `  "${topicId}": () => require("../facts/${topicId}/config_hi").default,\n`;
    const hiInsertIndex = content.indexOf('// Remaining HI');
    if (hiInsertIndex !== -1) {
      content = content.slice(0, hiInsertIndex) + hiLine + content.slice(hiInsertIndex);
    }
  }

  fs.writeFileSync(REGISTRY_PATH, content);
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
