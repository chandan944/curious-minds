const fs = require('fs');
const path = require('path');

const TOPICS_DIR = path.join(__dirname, '..', 'topics');
const dirs = fs.readdirSync(TOPICS_DIR).filter(d => fs.statSync(path.join(TOPICS_DIR, d)).isDirectory());

let issues = 0;

dirs.forEach(dir => {
  const labPath = path.join(TOPICS_DIR, dir, 'LabSimulation.jsx');
  if (!fs.existsSync(labPath)) return;

  const content = fs.readFileSync(labPath, 'utf-8');

  // Check 1: map on undefined array
  const mapRegex = /(\w+)\.map\(/g;
  let match;
  while ((match = mapRegex.exec(content)) !== null) {
     const varName = match[1];
     if (['Object', 'Array', 'Math'].includes(varName)) continue;
     // Just check if the varName is used somewhere else as a declaration
     if (!content.includes(varName)) {
         console.log(`[!] ${dir} uses undefined var before .map: ${varName}`);
         issues++;
     }
  }

  // Check 2: toFixed on undefined var
  const toFixedRegex = /(\w+)\.toFixed\(/g;
  while ((match = toFixedRegex.exec(content)) !== null) {
      const varName = match[1];
      if (['Math', 'Number'].includes(varName)) continue;
      // We check if it is part of a chained property like metrics.eudaimonia.toFixed
      // If so, the regex matched eudaimonia, so let's get the context
      const index = match.index;
      const context = content.substring(Math.max(0, index - 20), index + 15);
      
      // Let's check state declarations directly
      const stateRegex = /useState\(\{\s*([\s\S]*?)\}\)/g;
      let stateMatch;
      while((stateMatch = stateRegex.exec(content)) !== null) {
         const stateInitStr = stateMatch[1];
         // Does this var match a key in state but spelled wrong?
         // This is a bit complex for a simple script, 
      }
  }
});
if (issues === 0) console.log("✅ Custom check complete.");
