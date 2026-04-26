const fs = require('fs');
const path = require('path');

const ROOT = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds';

const screenContent = fs.readFileSync(path.join(ROOT, 'screens/TopicScreen.jsx'), 'utf8');

// Extract TOPIC_CONFIGS
const configsMatch = screenContent.match(/const TOPIC_CONFIGS = \{([\s\S]*?)\};\n\/\//)[1];
const configs = [...configsMatch.matchAll(/^\s*([a-z_0-9]+)\s*:\s*\(\)\s*=>\s*require\([\"'`](.*?)[\"'`]\)\.default/gm)];

// Extract LAB_COMPONENTS
const labsMatch = screenContent.match(/const LAB_COMPONENTS = \{([\s\S]*?)\};\n\nconst STEPS/)[1];
const labs = [...labsMatch.matchAll(/^\s*([a-z_0-9]+)\s*:\s*\(\)\s*=>\s*require\([\"'`](.*?)[\"'`]\)\.default/gm)];

let issues = [];

configs.forEach(m => {
    const id = m[1];
    const relPath = m[2];
    const fullPath = path.join(ROOT, 'screens', relPath + '.js');
    if (!fs.existsSync(fullPath)) {
        issues.push(`Config Missing: ${id} at ${fullPath}`);
    }
});

labs.forEach(m => {
    const id = m[1];
    const relPath = m[2];
    const fullPathJsx = path.join(ROOT, 'screens', relPath + '.jsx');
    const fullPathJs = path.join(ROOT, 'screens', relPath + '.js');
    if (!fs.existsSync(fullPathJsx) && !fs.existsSync(fullPathJs)) {
        issues.push(`Lab Missing: ${id} at ${fullPathJsx} (or .js)`);
    }
});

console.log(JSON.stringify(issues, null, 2));
