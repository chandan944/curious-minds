/**
 * scripts/regenerate_facts.js
 * 
 * REGENERATES all fact configs with SHORT, PUNCHY, MIND-BLOWING facts
 * Skips the 10 hand-crafted Nature & Earth topics that are already good.
 * Uses OpenRouter API with 5-key rotation.
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const API_KEYS = [
  'AIzaSy-PLACEHOLDER-KEY-1',
  'AIzaSy-PLACEHOLDER-KEY-2',
  'AIzaSy-PLACEHOLDER-KEY-3',
  'AIzaSy-PLACEHOLDER-KEY-4',
  'AIzaSy-PLACEHOLDER-KEY-5',
  'AIzaSy-PLACEHOLDER-KEY-6',
  'AIzaSy-PLACEHOLDER-KEY-7',
  'AIzaSy-PLACEHOLDER-KEY-8',
  'AIzaSy-PLACEHOLDER-KEY-9',
  'AIzaSy-PLACEHOLDER-KEY-10'
];

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const FACTS_DIR = path.join(__dirname, '..', 'facts');

// These 10 Nature & Earth topics are already hand-crafted and GOOD — skip them
const SKIP_TOPICS = new Set([
  'animals_wildlife',
  'ocean_sea_creatures',
  'geology_earth_science',
  'plants_botany',
  'insects_bugs',
  'weather_climate',
  'mountains_caves',
  'rivers_lakes',
  'birds_avian_life',
  'deserts_dry_lands',
  'demo_facts'
]);

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

const ICON_POOL = [
  'heart', 'star', 'zap', 'globe', 'sun', 'moon', 'cloud', 'eye',
  'flame', 'lightning', 'rocket', 'atom', 'brain', 'sparkle', 'target',
  'shield', 'leaf', 'earth', 'water', 'galaxy', 'lightbulb', 'clock',
  'compass', 'flask', 'book', 'flag', 'key', 'diamond', 'cube'
];

const COLOR_POOL = [
  { color: '#3B82F6', bg: ['#0B1E36', '#040A14'] },
  { color: '#F59E0B', bg: ['#36220B', '#140A04'] },
  { color: '#8B5CF6', bg: ['#1D0B36', '#0A0414'] },
  { color: '#10B981', bg: ['#0B361B', '#041409'] },
  { color: '#EF4444', bg: ['#360B0B', '#140404'] },
  { color: '#6366F1', bg: ['#12132B', '#05050A'] },
  { color: '#EC4899', bg: ['#360B24', '#14040D'] },
  { color: '#14B8A6', bg: ['#0B3632', '#041412'] },
  { color: '#F43F5E', bg: ['#360B16', '#140408'] },
  { color: '#A855F7', bg: ['#250B36', '#0E0414'] },
  { color: '#06B6D4', bg: ['#0B2D36', '#041214'] },
  { color: '#D946EF', bg: ['#300B36', '#120414'] },
  { color: '#F97316', bg: ['#361E0B', '#140B04'] },
  { color: '#84CC16', bg: ['#1B360B', '#0A1404'] },
  { color: '#6D28D9', bg: ['#1A0B36', '#090414'] },
];

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    
    const response = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, response_mime_type: "application/json" }
      })
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      if ((response.status === 429 || response.status === 503) && attempt <= 6) {
        console.log(`  ⏳ Rate limited (${response.status}). Retrying in 10s...`);
        await delay(10000);
        return callAI(prompt, attempt + 1);
      }
      throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error(`Invalid response format: ${JSON.stringify(data).substring(0, 100)}`);
    }
    const text = data.candidates[0].content.parts[0].text.trim();
    
    return JSON.parse(text);
  } catch (err) {
    if (attempt <= 4) {
      console.log(`  ⚠️ ${err.message}. Retry ${attempt}/4...`);
      await delay(5000);
      return callAI(prompt, attempt + 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────
//  GENERATION PROMPTS
// ─────────────────────────────────────────────────────────────────

async function generateEnglishFacts(topic) {
  const prompt = `Generate 10 FACTS (NOT theory) for the topic: "${topic.title}" (${topic.subtitle}).

RULES — READ CAREFULLY:
1. Each fact must be a SHORT, mind-blowing one-liner (1-2 sentences MAX, under 180 characters).
2. VOX/KURZGESAGT STYLE: Use a sophisticated yet conversational voice. High-end curiosity, not trivia.
3. ANTI-WIKI: Strictly forbid "common knowledge". If a fact is something most people learned in school, REJECT it and find something deeper.
4. SPECIFICITY: Include a specific NUMBER, STAT, or COMPARISON that makes people go "WOW".
5. BOLDING: Use **bold** markdown for the MOST shocking part (1-2 bold phrases per fact).
6. DIVERSITY: Ensure facts are varied. If the topic is Finance, don't just talk about inflation. Talk about wealth loops, dark history of money, or extreme banking stats.
7. NO definitions, NO explanations, NO academic fluff.
8. Facts must be REAL and VERIFIED.

GOOD EXAMPLES (The "WOW" Factor):
✅ "A blue whale's heart is the size of a **golf cart**, and you can hear it beating from over **2 miles away**."
✅ "If you removed all the 'empty space' from the atoms that make up every human on Earth, the entire world population would fit inside a **single apple**."
✅ "There is enough **gold in Earth's core** to coat the entire surface of the planet in a knee-deep layer of 24-karat gold."
✅ "The oldest known living tree is over **4,800 years old**—it was already ancient when the Great Pyramid was being built."
✅ "You share **50% of your DNA** with a banana."

BAD EXAMPLES (The "Boring/Wiki" Factor):
❌ "General Relativity posits that gravity is not a force, but a manifestation of curvature." (Too academic)
❌ "Inflation is the rate at which the general level of prices for goods and services is rising." (Too dictionary-like)
❌ "The sun is a star at the center of the Solar System." (Too common knowledge)

Return ONLY this JSON structure:
{
  "facts": [
    "fact text with **bold** markup",
    "another fact...",
    ... (exactly 10)
  ]
}`;

  return callAI(prompt);
}

async function translateToHindi(facts, topicTitle) {
  const prompt = `Translate these 10 facts to Hindi (Devanagari script).

Topic: "${topicTitle}"

Rules:
1. Keep it SHORT and punchy — same vibe as the English
2. Keep **bold** markdown formatting
3. Keep numbers and specific stats as-is
4. Use natural Hindi, not Google Translate style
5. Keep technical terms in brackets: "प्रकाश संश्लेषण (Photosynthesis)"

English facts:
${JSON.stringify(facts)}

Return ONLY this JSON:
{
  "facts": [
    "Hindi fact with **bold** markup",
    ... (exactly 10)
  ]
}`;

  return callAI(prompt);
}

// ─────────────────────────────────────────────────────────────────
//  BUILD CONFIG FILE
// ─────────────────────────────────────────────────────────────────

function buildConfigFile(topic, factsArray, lang = 'en') {
  const accent = CATEGORY_ACCENT_MAP[topic.category] || "default";
  const facts = factsArray.map((content, i) => {
    const colorSet = COLOR_POOL[i % COLOR_POOL.length];
    const icon = ICON_POOL[i % ICON_POOL.length];
    return {
      id: `${topic.id}_f${i + 1}`,
      content: content,
      color: colorSet.color,
      bgGradient: colorSet.bg,
      svgIcon: icon
    };
  });

  const config = {
    id: topic.id,
    title: topic.title,
    subtitle: topic.subtitle,
    category: topic.category,
    accentKey: accent,
    facts: facts
  };

  return `export default ${JSON.stringify(config, null, 2)};\n`;
}

// ─────────────────────────────────────────────────────────────────
//  GET TOPICS LIST FROM EXISTING DIRS
// ─────────────────────────────────────────────────────────────────

function getTopicsToRegenerate() {
  // Read the registry to get metadata
  const registryPath = path.join(__dirname, '..', 'constants', 'factRegistry.js');
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  const registryMatch = registryContent.match(/export const FACT_REGISTRY = (\[[\s\S]*?\]);/);
  if (!registryMatch) throw new Error("Could not find FACT_REGISTRY");
  
  let registryJson = registryMatch[1].replace(/\/\/.*$/gm, '');
  const allTopics = eval(registryJson);

  return allTopics.filter(t => !SKIP_TOPICS.has(t.id));
}

// ─────────────────────────────────────────────────────────────────
//  MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────

async function main() {
  const topics = getTopicsToRegenerate();
  console.log(`\n🚀 REGENERATING ${topics.length} fact topics with PUNCHY content\n`);
  console.log(`   Skipping ${SKIP_TOPICS.size} good hand-crafted topics`);
  console.log(`   Using ${API_KEYS.length} OpenRouter keys\n`);
  console.log('─'.repeat(60));

  let success = 0;
  let failed = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const topicDir = path.join(FACTS_DIR, topic.id);
    const engPath = path.join(topicDir, 'config.js');
    const hinPath = path.join(topicDir, 'config_hi.js');

    console.log(`\n[${i + 1}/${topics.length}] 📦 ${topic.title} (${topic.id})`);

    try {
      if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

      if (fs.existsSync(engPath) && fs.existsSync(hinPath)) {
        console.log(`  ⏭️ Already exists. Skipping.`);
        success++;
        continue;
      }

      // 1. Generate English facts
      console.log('  🔵 Generating English...');
      const engResult = await generateEnglishFacts(topic);
      const engFacts = engResult.facts;
      
      if (!engFacts || engFacts.length < 10) {
        console.log(`  ⚠️ Got ${engFacts?.length || 0} facts, expected 10. Skipping.`);
        failed++;
        continue;
      }

      // Write English config
      const engContent = buildConfigFile(topic, engFacts, 'en');
      fs.writeFileSync(engPath, engContent);
      console.log(`  ✅ English done (${engFacts.length} facts)`);

      // 2. Translate to Hindi
      console.log('  🟠 Translating to Hindi...');
      await delay(1500);
      const hinResult = await translateToHindi(engFacts, topic.title);
      const hinFacts = hinResult.facts;

      if (!hinFacts || hinFacts.length < 10) {
        console.log(`  ⚠️ Hindi got ${hinFacts?.length || 0} facts. Using English as fallback.`);
        const hinContent = buildConfigFile(topic, engFacts, 'hi');
        fs.writeFileSync(hinPath, hinContent);
      } else {
        const hinContent = buildConfigFile(topic, hinFacts, 'hi');
        fs.writeFileSync(hinPath, hinContent);
        console.log(`  ✅ Hindi done (${hinFacts.length} facts)`);
      }

      success++;
      console.log(`  🎉 Complete! (${success} done, ${failed} failed)`);
      
      // Delay between topics to respect Gemini quotas (15 RPM)
      await delay(4000);
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\n🏁 REGENERATION COMPLETE`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   ⏭️  Skipped: ${SKIP_TOPICS.size} (already good)\n`);
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
