// ─────────────────────────────────────────────────────────────────
//  TRANSLATE ALL TOPICS — Build-Time Script
//  
//  Uses Google Translate (free, unofficial API) to auto-translate
//  every topic config from English → Hindi (or any target language).
//
//  USAGE:
//    cd c:\Users\lenovo\Desktop\curious-brain\curious-minds
//    node scripts/translate.js
//
//  This will generate a `config_hi.js` in every topic directory.
//  It only needs to be run ONCE.
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────
const TARGET_LANG = 'hi';        // Hindi
const TOPICS_DIR = path.join(__dirname, '..', 'topics');
const BATCH_SIZE = 5;            // Translate N strings at once (avoids rate limits)
const DELAY_MS = 1500;           // Pause between batches to avoid rate limiting

// ── Translation function using google-translate-api-x ────────────
let translate;

async function initTranslator() {
  // Dynamic import for ESM module
  const mod = await import('google-translate-api-x');
  translate = mod.default || mod;
}

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;
  
  // Don't translate emojis-only strings, very short strings, or IDs
  if (text.length < 3) return text;
  if (/^[^\w\s]+$/.test(text)) return text; // pure emoji/symbols

  try {
    const result = await translate(text, { 
        to: targetLang,
        client: 'gtx',
        tld: 'co.in',
        fallbackBatch: false, 
    });
    return result.text || text;
  } catch (err) {
    console.error(`  ⚠️  Translation failed for: "${text.substring?.(0, 40) || 'batch'}..." → ${err.message}`);
    return text; // Return original on failure
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// ── Batch translator (with delay to avoid rate limits) ────────────
async function translateBatch(strings, targetLang) {
  const results = [];
  for (let i = 0; i < strings.length; i += BATCH_SIZE) {
    const batch = strings.slice(i, i + BATCH_SIZE);
    
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        // Pre-filter batch
        const toTranslate = [];
        const indices = []; // Keep track of which need translation
        
        for (let j = 0; j < batch.length; j++) {
            const s = batch[j];
            if (!s || typeof s !== 'string' || s.trim() === '' || s.length < 3 || /^[^\w\s]+$/.test(s)) {
                // skip
            } else {
                toTranslate.push(s);
                indices.push(j);
            }
        }

        let translatedArr = [];
        if (toTranslate.length > 0) {
            // Bulk single request with bypass params
            const res = await translate(toTranslate, { 
                to: targetLang,
                client: 'gtx',
                tld: 'co.in'
            });
            // API returns array if input is array
            translatedArr = Array.isArray(res) ? res.map(r => r.text) : [res.text];
        }

        const finalBatch = [...batch];
        for (let k = 0; k < indices.length; k++) {
            finalBatch[indices[k]] = translatedArr[k] || toTranslate[k];
        }

        results.push(...finalBatch);
        success = true;
      } catch (err) {
        if (err.message.includes('Too Many Requests') || err.message.includes('429')) {
          console.log(`\n  ⚠️ Rate limit hit. Cooling down for 2 minutes before retrying...`);
          await delay(120000); // Wait 2 full minutes for rate limit reset
          retries--;
        } else {
           console.log(`\n  ⚠️ Batch error: ${err.message}. Retrying in 10s...`);
           await delay(10000);
           retries--;
        }
      }
    }
    
    if (!success) {
        console.log(`\n  🛑 CRITICAL FAILURE: Topic translation aborted to save remaining topics.`);
        throw new Error("RATE_LIMIT_PERSIST");
    }
    
    // Show progress
    const pct = Math.min(100, Math.round(((i + batch.length) / strings.length) * 100));
    process.stdout.write(`\r    Progress: ${pct}% (${i + batch.length}/${strings.length} strings)`);
    
    // Rate limit delay
    if (i + BATCH_SIZE < strings.length) {
      await delay(DELAY_MS * 2); // Double the delay just in case
    }
  }
  console.log(''); // newline
  return results;
}
function extractStrings(config) {
  const strings = [];
  const paths = [];

  function walk(obj, currentPath) {
    if (typeof obj === 'string') {
      strings.push(obj);
      paths.push(currentPath);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, `${currentPath}[${i}]`));
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        // Skip non-translatable keys
        if (['id', 'color', 'bgGradient', 'icon', 'svgIcon', 'accentKey',
             'category', 'answer', 'relatedTopics'].includes(key)) continue;
        walk(obj[key], `${currentPath}.${key}`);
      }
    }
  }

  walk(config, 'root');
  return { strings, paths };
}

// ── Rebuild the config object with translated strings ────────────
function rebuildConfig(config, paths, translatedStrings) {
  // Deep clone
  const result = JSON.parse(JSON.stringify(config));

  paths.forEach((p, i) => {
    // Parse path like "root.hook.question" or "root.theory[0].title"
    const parts = p.replace('root.', '').split(/\.|\[|\]/).filter(Boolean);
    let ref = result;
    for (let j = 0; j < parts.length - 1; j++) {
      const key = isNaN(parts[j]) ? parts[j] : parseInt(parts[j]);
      ref = ref[key];
    }
    const lastKey = isNaN(parts[parts.length - 1])
      ? parts[parts.length - 1]
      : parseInt(parts[parts.length - 1]);
    ref[lastKey] = translatedStrings[i];
  });

  return result;
}

// ── Generate the config_hi.js file content ───────────────────────
function generateFileContent(config) {
  const json = JSON.stringify(config, null, 2);
  // Convert JSON to a JS module with export default
  return `// ─────────────────────────────────────────────────────────
//  AUTO-GENERATED HINDI TRANSLATION
//  Generated by: scripts/translate.js
//  DO NOT EDIT MANUALLY — Re-run the script to regenerate.
// ─────────────────────────────────────────────────────────

export default ${json};
`;
}

// ── Load a config.js file (handles "export default" syntax) ──────
function loadConfig(configPath) {
  let content = fs.readFileSync(configPath, 'utf-8');
  
  // Strip 'export default' and convert to module.exports
  content = content.replace(/export\s+default\s+/, 'module.exports = ');
  
  // Write to a temp file, require it, then delete
  const tempPath = configPath.replace('config.js', '_config_temp.js');
  fs.writeFileSync(tempPath, content, 'utf-8');
  
  // Clear require cache if it was loaded before
  delete require.cache[require.resolve(tempPath)];
  
  const config = require(tempPath);
  fs.unlinkSync(tempPath); // Clean up
  
  return config;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  🌐 CURIOUS MINDS — Hindi Translation Generator     ║');
  console.log('║  Target Language: Hindi (hi)                        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Initialize the translator
  console.log('⏳ Initializing Google Translate engine...');
  await initTranslator();
  console.log('✅ Translator ready!\n');

  // Get all topic directories
  const topicDirs = fs.readdirSync(TOPICS_DIR)
    .filter(d => {
      const configPath = path.join(TOPICS_DIR, d, 'config.js');
      return fs.statSync(path.join(TOPICS_DIR, d)).isDirectory() && fs.existsSync(configPath);
    });

  console.log(`📂 Found ${topicDirs.length} topics to translate.\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let t = 0; t < topicDirs.length; t++) {
    const dir = topicDirs[t];
    const configPath = path.join(TOPICS_DIR, dir, 'config.js');
    const outputPath = path.join(TOPICS_DIR, dir, `config_${TARGET_LANG}.js`);

    // Skip if already translated
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  [${t + 1}/${topicDirs.length}] ${dir} — Already translated, skipping.`);
      skipCount++;
      continue;
    }

    console.log(`\n🔄 [${t + 1}/${topicDirs.length}] Translating: ${dir}`);

    try {
      // 1. Load the English config
      const config = loadConfig(configPath);
      
      // 2. Extract all translatable strings
      const { strings, paths } = extractStrings(config);
      console.log(`    📝 Found ${strings.length} translatable strings.`);

      // 3. Translate them all
      const translated = await translateBatch(strings, TARGET_LANG);

      // 4. Rebuild the config with Hindi text
      const hindiConfig = rebuildConfig(config, paths, translated);

      // 5. Write the config_hi.js file
      const fileContent = generateFileContent(hindiConfig);
      fs.writeFileSync(outputPath, fileContent, 'utf-8');

      // 6. Dynamically update the map
      require('child_process').execSync('node scripts/generateMap.js');

      console.log(`    ✅ Written: ${dir}/config_${TARGET_LANG}.js`);
      successCount++;
    } catch (err) {
      console.error(`    ❌ FAILED: ${dir} — ${err.message}`);
      errorCount++;
      if (err.message === "RATE_LIMIT_PERSIST") {
          console.log(`\n  😴 Heavy rate limiter tripped. Sleeping for 5 minutes before attempting next topic...`);
          await new Promise(r => setTimeout(r, 300000));
      }
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Done! ${successCount} translated, ${skipCount} skipped, ${errorCount} errors     ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
