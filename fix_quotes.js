// Script to fix single-quote conflicts in Hindi config files
// Replaces the options arrays so that any option containing inner single quotes uses double quotes instead

const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node fix_quotes.js <file>'); process.exit(1); }

let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Find options arrays
  const optMatch = line.match(/options:\s*\[/);
  if (!optMatch) continue;
  
  const optStart = line.indexOf('options: [');
  if (optStart === -1) continue;
  
  // Extract the options array portion - find matching ]
  let bracketDepth = 0;
  let optEnd = -1;
  for (let j = optStart + 9; j < line.length; j++) {
    if (line[j] === '[') bracketDepth++;
    if (line[j] === ']') {
      bracketDepth--;
      if (bracketDepth === 0) { optEnd = j + 1; break; }
    }
  }
  if (optEnd === -1) continue;
  
  const before = line.substring(0, optStart);
  const optSection = line.substring(optStart, optEnd);
  const after = line.substring(optEnd);
  
  // Parse the options manually - split by pattern
  // Strategy: rebuild each option string, switching to double quotes if it contains inner single quotes
  // We need to find each string in the array and check for quote issues
  
  // Simple approach: find all 'text' patterns and check if text contains unescaped '
  // Replace problematic ones with "text"
  
  let fixed = optSection;
  // Match each option string - look for ', ' boundaries between options
  // Actually, let's use a different approach: find the array content and process each element
  
  const arrayContent = optSection.substring(optSection.indexOf('[') + 1, optSection.lastIndexOf(']'));
  
  // Split options properly - we need to handle the fact that some strings contain commas
  // Better approach: manually walk through and find string boundaries
  const options = [];
  let pos = 0;
  const ac = arrayContent.trim();
  
  while (pos < ac.length) {
    // Skip whitespace and commas
    while (pos < ac.length && (ac[pos] === ' ' || ac[pos] === ',')) pos++;
    if (pos >= ac.length) break;
    
    const quoteChar = ac[pos]; // should be ' or "
    if (quoteChar !== "'" && quoteChar !== '"') { pos++; continue; }
    
    // Find the end of this string
    let end = -1;
    if (quoteChar === '"') {
      // For double-quoted strings, find next unescaped "
      for (let j = pos + 1; j < ac.length; j++) {
        if (ac[j] === '\\') { j++; continue; }
        if (ac[j] === '"') { end = j; break; }
      }
    } else {
      // For single-quoted strings, we need to find the CORRECT closing quote
      // The issue is that inner ' breaks things. We need to find where the option actually ends.
      // Heuristic: look for ', ' or '] pattern that indicates option boundary
      // Actually the real content between options is: ', '  (quote-comma-space-quote)
      // So look for patterns like: ', ' or ']
      
      // Better: look for the next "', '" or "']" pattern
      let j = pos + 1;
      while (j < ac.length) {
        // Check if this is a real string terminator
        if (ac[j] === "'") {
          // Check what follows - if it's , ' or , " or ] then this is the real end
          let rest = ac.substring(j + 1).trimStart();
          if (rest.startsWith(',') || rest.startsWith(']') || rest.length === 0 || j === ac.length - 1) {
            end = j;
            break;
          }
          // Check for escaped quotes
          if (ac[j-1] === '\\') { j++; continue; }
        }
        j++;
      }
      if (end === -1) end = ac.length - 1;
    }
    
    const rawContent = ac.substring(pos + 1, end);
    options.push({ start: pos, end: end, content: rawContent, quote: quoteChar });
    pos = end + 1;
  }
  
  // Now rebuild the options array
  let newOptions = [];
  let lineNeedsFix = false;
  for (const opt of options) {
    const text = opt.content;
    // Check if single-quoted string contains unescaped single quotes
    if (opt.quote === "'" && text.includes("'")) {
      // Switch to double quotes
      // Make sure content doesn't have unescaped double quotes
      const escaped = text.replace(/"/g, '\\"');
      newOptions.push(`"${escaped}"`);
      lineNeedsFix = true;
    } else if (opt.quote === "'" && text.includes("\\'")) {
      // Has escaped single quotes - switch to double quotes for cleanliness
      const cleaned = text.replace(/\\'/g, "'");
      const escaped = cleaned.replace(/"/g, '\\"');
      newOptions.push(`"${escaped}"`);
      lineNeedsFix = true;
    } else {
      newOptions.push(`${opt.quote}${text}${opt.quote}`);
    }
  }
  
  if (lineNeedsFix) {
    const newOptSection = `options: [${newOptions.join(', ')}]`;
    lines[i] = before + newOptSection + after;
    fixCount++;
    console.log(`Fixed line ${i + 1}`);
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log(`\nDone! Fixed ${fixCount} lines in ${path}`);
