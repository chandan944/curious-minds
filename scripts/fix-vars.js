const fs = require('fs');
const path = require('path');

const TOPICS_DIR = path.join(__dirname, '..', 'topics');
const dirs = fs.readdirSync(TOPICS_DIR).filter(d => fs.statSync(path.join(TOPICS_DIR, d)).isDirectory());

const varDefinitions = {
  glass1: "const glass1 = theme?.glass?.light || 'rgba(255,255,255,0.05)';",
  glass2: "const glass2 = theme?.glass?.medium || 'rgba(255,255,255,0.1)';",
  glass3: "const glass3 = theme?.glass?.strong || 'rgba(255,255,255,0.15)';",
  txt1: "const txt1 = theme?.text?.primary || '#FFF';",
  txt2: "const txt2 = theme?.text?.secondary || '#AAA';",
  txtM: "const txtM = theme?.text?.muted || '#888';",
  border: "const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';",
  borderBr: "const borderBr = theme?.glass?.borderBright || 'rgba(255,255,255,0.2)';",
  bg: "const bg = theme?.bg?.base || '#0A0A0A';",
  accentColor: "const accentColor = theme?.accent?.primary || '#A855F7';",
  color: "const color = theme?.accent?.primary || '#A855F7';",
};

dirs.forEach(dir => {
  const labPath = path.join(TOPICS_DIR, dir, 'LabSimulation.jsx');
  if (!fs.existsSync(labPath)) return;

  let content = fs.readFileSync(labPath, 'utf-8');
  const missing = [];

  Object.keys(varDefinitions).forEach(v => {
    // Look for exact word match, not inside another word.
    const usedRegex = new RegExp(`(?<![a-zA-Z0-9_$])${v}(?![a-zA-Z0-9_$])`);
    if (usedRegex.test(content)) {
      // Is it declared?
      const hasConst = new RegExp(`(const|let|var)\\s+${v}\\b`).test(content);
      const hasDestruct = new RegExp(`\\{\\s*([^}]*,\\s*)?${v}(\\s*,[^}]*)?\\s*\\}\\s*=`).test(content);
      const isParam = new RegExp(`function\\s+\\w+\\s*\\([^)]*\\b${v}\\b[^)]*\\)`).test(content) || new RegExp(`\\([^)]*\\b${v}\\b[^)]*\\)\\s*=>`).test(content);
      
      const isDeclared = hasConst || hasDestruct || isParam;

      if (!isDeclared) {
        missing.push({ varName: v, def: varDefinitions[v] });
      }
    }
  });

  if (missing.length > 0) {
    console.log(`Fixing ${dir} - missing: ${missing.map(m => m.varName).join(', ')}`);
    
    // Check if `useTheme` is called
    let injectPosition = -1;
    const useThemeRegex = /const\s+\{.*\}\s*=\s*useTheme\(\s*\)\s*;/;
    const match = useThemeRegex.exec(content);
    
    if (match) {
        injectPosition = match.index + match[0].length;
        
        // Also ensure `theme` is destuctured if not present
        if (!content.includes('theme') && missing.some(m => m.def.includes('theme?'))) {
           // wait if theme isn't there, we could just replace the match!
           // but let's just stick to standard. If it lacks 'theme' inside useTheme, that's complex to regex replace safely.
           // actually, the missing refs script earlier showed 'theme' was missing.
        }

        const injectContent = '\n  const _themeObj = typeof theme !== "undefined" ? theme : {};\n  ' + missing.map(m => m.def.replace(/theme\?/g, '(_themeObj || {})')).join('\n  ');
        content = content.slice(0, injectPosition) + injectContent + content.slice(injectPosition);
        fs.writeFileSync(labPath, content, 'utf-8');
    } else {
        // Look for the main function component start
        const funcMatch = content.match(/export default function\s+\w+\s*\([^)]*\)\s*\{/);
        if (funcMatch) {
            injectPosition = funcMatch.index + funcMatch[0].length;
            const injectContent = '\n  const { theme } = useTheme();\n  const _themeObj = typeof theme !== "undefined" ? theme : {};\n  ' + missing.map(m => m.def.replace(/theme\?/g, '(_themeObj || {})')).join('\n  ');
            content = content.slice(0, injectPosition) + injectContent + content.slice(injectPosition);
            
            if (!content.includes('import { useTheme }')) {
               content = "import { useTheme } from '../../context/ThemeContext';\n" + content;
            }
            fs.writeFileSync(labPath, content, 'utf-8');
        }
    }
  }
});
console.log("✅ Fixed all missing theme references!");
