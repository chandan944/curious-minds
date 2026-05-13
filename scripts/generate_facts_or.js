/**
 * scripts/generate_facts_or.js
 * 
 * AUTOMATED FACT GENERATOR (English & Hindi)
 * Uses OpenRouter API (Gemini 1.5 Flash) to bypass direct Google quotas.
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const API_KEYS = [
  'sk-or-v1-PLACEHOLDER_KEY_1',
  'sk-or-v1-PLACEHOLDER_KEY_2',
  'sk-or-v1-PLACEHOLDER_KEY_3',
  'sk-or-v1-PLACEHOLDER_KEY_4',
  'sk-or-v1-PLACEHOLDER_KEY_5'
];

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free'; // Fast and confirmed free model

const FACTS_DIR = path.join(__dirname, '..', 'facts');
const REGISTRY_PATH = path.join(__dirname, '..', 'constants', 'factRegistry.js');

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

let keyIndex = 0;
function getNextKey() {
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────
//  OPENROUTER API WRAPPER
// ─────────────────────────────────────────────────────────────────

async function callAI(prompt, attempt = 1) {
  try {
    const key = getNextKey();
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://github.com/google/curious-brain',
        'X-Title': 'Curious Minds'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      if ((response.status === 429 || response.status === 503 || response.status === 401) && attempt <= 10) {
        console.log(`  Issue (${response.status}). Retrying in ${attempt * 5}s...`);
        await delay(attempt * 5000);
        return callAI(prompt, attempt + 1);
      }
      throw new Error(`OpenRouter API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      if (attempt <= 10) {
        console.log(`  Empty response. Retrying...`);
        await delay(5000);
        return callAI(prompt, attempt + 1);
      }
      throw new Error(`OpenRouter returned no choices: ${JSON.stringify(data)}`);
    }
    const text = data.choices[0].message.content.trim();
    return JSON.parse(text);
  } catch (err) {
    if (attempt <= 10) {
      console.log(`  Error: ${err.message}. Retrying...`);
      await delay(5000);
      return callAI(prompt, attempt + 1);
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
    Generate 10 premium, mindblowing educational facts for the topic: "${topic.title}".
    Standard: v2.0 Extreme.
    
    CRITICAL QUALITY RULES:
    1. WOW FACTOR: Every fact must be "mindblowing" or deeply surprising. Avoid common knowledge.
    2. BREVITY: Keep each fact VERY SHORT (1-2 sentences max). 
    3. FIRST PRINCIPLES: Focus on deep insights, paradoxical truths, or counter-intuitive science/history.
    4. FORMATTING: Use **bold** for the most impactful keywords.
    
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
          "content": "A short, mindblowing fact. Maximum 2 sentences.",
          "color": "A vibrant premium HSL color string",
          "bgGradient": ["Darker shade of color", "#05050A"],
          "svgIcon": "One of: zap, activity, eye, globe, moon, sun, star, award, heart, wind, shield, cpu, tool, rocket, etc."
        }
      ]
    }
    
    Return ONLY raw JSON with exactly 10 facts.
  `;
  return callAI(prompt);
}

async function translateToHindi(englishConfig) {
  const prompt = `
    Translate the following fact configuration to Hindi while preserving the "MIND-BLOWING WOW" impact.
    Topic: ${englishConfig.title}
    
    Rules:
    1. Maintain the "wow factor". Use powerful Hindi vocabulary that sounds academic yet surprising.
    2. Keep it SHORT and punchy (1-2 sentences).
    3. Ensure natural-sounding Hindi (Devanagari script).
    4. Keep technical terms in brackets if helpful, e.g., "नसों (Nerves)".
    5. Maintain the exact same structure, colors, and IDs.
    
    Input JSON:
    ${JSON.stringify(englishConfig)}
    
    Return ONLY raw JSON.
  `;
  return callAI(prompt);
}

// ─────────────────────────────────────────────────────────────────
//  MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────

async function main() {
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const registryMatch = registryContent.match(/export const FACT_REGISTRY = (\[[\s\S]*?\]);/);
  if (!registryMatch) throw new Error("Could not find FACT_REGISTRY in registry file.");
  
  let registryJson = registryMatch[1].replace(/\/\/.*$/gm, '');
  const factRegistry = eval(registryJson);

  console.log(`🚀 Starting fact generation with OpenRouter (${factRegistry.length} topics)...\n`);

  for (const topic of factRegistry) {
    const topicDir = path.join(FACTS_DIR, topic.id);
    const engPath = path.join(topicDir, 'config.js');
    const hinPath = path.join(topicDir, 'config_hi.js');

    if (fs.existsSync(engPath) && fs.existsSync(hinPath)) {
      // console.log(`⏭️  Skipping ${topic.id} (already exists)`);
      continue;
    }

    console.log(`📦 Generating: ${topic.title} (${topic.id})...`);

    try {
      if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

      let engConfig;
      if (!fs.existsSync(engPath)) {
        engConfig = await generateEnglishConfig(topic);
        const engContent = `export default ${JSON.stringify(engConfig, null, 2)};\n`;
        fs.writeFileSync(engPath, engContent);
        console.log(`  ✅ English generated.`);
      } else {
        const existingRaw = fs.readFileSync(engPath, 'utf8');
        let cleaned = existingRaw.replace(/export\s+default\s+/, '').trim();
        if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);
        try {
          engConfig = eval(`(${cleaned})`);
        } catch (e) {
          console.error(`  ❌ Eval failed for ${topic.id}: ${e.message}`);
          continue;
        }
      }

      if (!fs.existsSync(hinPath)) {
        const hinConfig = await translateToHindi(engConfig);
        const hinContent = `export default ${JSON.stringify(hinConfig, null, 2)};\n`;
        fs.writeFileSync(hinPath, hinContent);
        console.log(`  🇮🇳 Hindi translation complete.`);
      }

      updateRegistryMap(topic.id);
      await delay(2000); // OpenRouter handles high volume better
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
