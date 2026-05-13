// scripts/normalize_quiz_options.js
const fs = require('fs');
const path = require('path');

const API_KEYS = [
  'AIzaSy-PLACEHOLDER-KEY-1',
  'AIzaSy-PLACEHOLDER-KEY-2',
  'AIzaSy-PLACEHOLDER-KEY-3'
];
let currentKeyIndex = 0;
function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGeminiBatch(questionsArray, isHindi, attempt = 1) {
  if (questionsArray.length === 0) return [];
  
  const prompt = `You are rewriting multiple-choice quiz options to remove length bias.

Language: ${isHindi ? 'Hindi' : 'English'}

We have a batch of ${questionsArray.length} questions.
For EACH question in the provided JSON array, apply these RULES:
1. Make ALL 4 options SHORT and SIMPLE — ideally 3 to 8 words each.
2. If the correct answer is a long sentence, CONDENSE it to its core idea in a few words.
3. Make the wrong options equally plausible and similar in length to the correct one.
4. Keep the correct answer at its original index. Do NOT move it.
5. Do NOT change the meaning.
6. Return ONLY a valid JSON array of arrays. The outer array must have exactly ${questionsArray.length} elements. Each inner array MUST contain exactly 4 strings (the rewritten options for that question, in the original order). No markdown, no explanation, just the raw JSON.

Questions:
${JSON.stringify(questionsArray.map(q => ({
    question: q.question,
    original_options: q.options,
    correct_answer_index: q.answerIndex
})), null, 2)}`;

  try {
    const apiKey = getNextKey();
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.15 },
      })
    });

    if (!response.ok) {
      const err = await response.text();
      if ((response.status === 503 || response.status === 429 || response.status === 500) && attempt <= 5) {
        const wait = attempt * 5;
        console.log(`  ${response.status} - retrying in ${wait}s (attempt ${attempt}/5)...`);
        await new Promise(r => setTimeout(r, wait * 1000));
        return callGeminiBatch(questionsArray, isHindi, attempt + 1);
      }
      throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up potential markdown formatting
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    
    const parsed = JSON.parse(text.trim());
    if (!Array.isArray(parsed) || parsed.length !== questionsArray.length) {
      throw new Error(`Invalid array returned: expected ${questionsArray.length} items, got ${parsed ? parsed.length : 'unknown'}`);
    }
    return parsed;
  } catch (err) {
    if (err.message?.includes('API Error') || err instanceof SyntaxError) {
      if (attempt <= 5) {
        console.log(`  Parse/API error, retrying in ${attempt * 5}s...`);
        await new Promise(r => setTimeout(r, attempt * 5000));
        return callGeminiBatch(questionsArray, isHindi, attempt + 1);
      }
    }
    throw err;
  }
}

function escapeString(str) {
  return str.replace(/"/g, '\\"');
}

async function processFile(filePath, isHindi) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let quizIdx = content.indexOf('quiz: [');
  if (quizIdx === -1) quizIdx = content.indexOf('"quiz": [');
  if (quizIdx === -1) return;
  
  let collectedQuestions = [];
  let searchIdx = quizIdx;
  
  while (true) {
    let qIdx = content.indexOf('question:', searchIdx);
    if (qIdx === -1) qIdx = content.indexOf('"question":', searchIdx);
    if (qIdx === -1) break;
    
    let relTopIdx = content.indexOf('relatedTopics:', searchIdx);
    if (relTopIdx === -1) relTopIdx = content.indexOf('"relatedTopics":', searchIdx);
    if (relTopIdx !== -1 && qIdx > relTopIdx) break;
    
    // adjust qIdx to start of "question" regardless of quotes
    const slice = content.substring(qIdx, qIdx + 1500); 
    const match = slice.match(/^"?'?question"?'?:\s*(["'])([\s\S]*?)\1[\s\S]*?"?'?options"?'?:\s*(\[(?:[^\]]|\])*?\])[\s\S]*?"?'?answer"?'?:\s*(\d+)/);
    
    if (match) {
      const question = match[2];
      let optString = match[3];
      const answerIndex = parseInt(match[4]);
      
      let optStartInSlice = slice.indexOf('options:');
      if (optStartInSlice === -1) optStartInSlice = slice.indexOf('"options":');
      const bracketStart = slice.indexOf('[', optStartInSlice);
      let bracketCount = 0;
      let bracketEnd = -1;
      for (let i = bracketStart; i < slice.length; i++) {
        if (slice[i] === '[') bracketCount++;
        if (slice[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            bracketEnd = i;
            break;
          }
        }
      }
      
      if (bracketEnd !== -1) {
         optString = slice.substring(bracketStart, bracketEnd + 1);
      }

      let options;
      try {
        options = eval(`(${optString})`);
      } catch (e) {
        searchIdx = qIdx + 10;
        continue;
      }
      
      const optStart = qIdx + slice.indexOf(optString);
      const optEnd = optStart + optString.length;
      
      collectedQuestions.push({
        question,
        options,
        answerIndex,
        optStartMatch: optStart,
        optEndMatch: optEnd
      });
      searchIdx = optEnd;
    } else {
      searchIdx = qIdx + 10;
    }
  }

  if (collectedQuestions.length === 0) return;
  console.log(`\nProcessing ${filePath} (${collectedQuestions.length} questions)...`);

  // Batch process
  try {
    const batchedNewOptions = await callGeminiBatch(collectedQuestions, isHindi);
    
    let updatedCount = 0;
    for (let idx = collectedQuestions.length - 1; idx >= 0; idx--) {
      const q = collectedQuestions[idx];
      const newOptions = batchedNewOptions[idx];
      if (!Array.isArray(newOptions) || newOptions.length !== 4) continue;
      
      const newOptString = `[\n        ${newOptions.map(o => `"${escapeString(o)}"`).join(',\n        ')}\n      ]`;
      
      const before = content.substring(0, q.optStartMatch);
      const after = content.substring(q.optEndMatch);
      
      content = before + newOptString + after;
      updatedCount++;
    }
    
    if (updatedCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Saved ${updatedCount} normalized questions to ${filePath}`);
    } else {
      console.log(`No updates made to ${filePath}`);
    }
    
    // Add a small delay between files to respect limits
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error(`❌ Error processing file ${filePath}: ${e.message}`);
  }
}

async function main() {
  let targetTopics = process.argv.slice(2);
  
  if (targetTopics.length === 0) {
    // Dynamically get all topics if none specified
    const topicsDir = path.join(__dirname, '..', 'topics');
    targetTopics = fs.readdirSync(topicsDir).filter(f => fs.statSync(path.join(topicsDir, f)).isDirectory());
    console.log(`Found ${targetTopics.length} topics. Starting batch processing...`);
  }
  
  for (const topic of targetTopics) {
    if (topic === 'depression') {
      console.log(`Skipping 'depression' as it was already processed.`);
      continue;
    }
    const dir = path.join(__dirname, '..', 'topics', topic);
    await processFile(path.join(dir, 'config.js'), false);
    await processFile(path.join(dir, 'config_hi.js'), true);
  }
}

main().catch(console.error);
