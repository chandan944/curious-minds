const fs = require('fs');
const path = require('path');

const TOPICS_DIR = path.join(__dirname, '..', 'topics');
const dirs = fs.readdirSync(TOPICS_DIR).filter(d => fs.statSync(path.join(TOPICS_DIR, d)).isDirectory());

const commonVars = ['glass1', 'glass2', 'glass3', 'txt1', 'txt2', 'txtM', 'border', 'borderBr', 'bg', 'accentColor', 'color', 'isDark', 'theme'];

dirs.forEach(dir => {
  const labPath = path.join(TOPICS_DIR, dir, 'LabSimulation.jsx');
  if (!fs.existsSync(labPath)) return;

  const content = fs.readFileSync(labPath, 'utf-8');

  commonVars.forEach(v => {
    // Check if the variable is USED anywhere as a distinct word
    // e.g., { backgroundColor: glass1 } or glass1+
    const usedRegex = new RegExp(`\\b${v}\\b`);
    if (usedRegex.test(content)) {
      // It is used. Is it declared?
      // const v = , let v =, { v } =, function(v) etc.
      const declRegex = new RegExp(`(const|let|var)\\s+${v}\\b|\\{\\s*(\\w+\\s*,\\s*)*${v}(\\s*,\\s*\\w+)*\\s*\\}\\s*=(?!=)|\\b${v}\\s*:`);
      // Warning: this regex might fail for some desctructuring. Let's just do simple checks:
      const hasConst = content.includes(`const ${v}`) || content.includes(`let ${v}`);
      const hasDestruct = content.match(new RegExp(`\\{[^}]*\\b${v}\\b[^}]*\\}\\s*=`));
      const isParam = content.match(new RegExp(`function\\s+\\w+\\s*\\([^)]*\\b${v}\\b[^)]*\\)`)) || content.match(new RegExp(`\\([^)]*\\b${v}\\b[^)]*\\)\\s*=>`));
      
      const isDeclared = hasConst || hasDestruct || isParam;

      if (!isDeclared) {
        console.log(`[!] Missing declaration for '${v}' in ${dir}/LabSimulation.jsx`);
      }
    }
  });
});
