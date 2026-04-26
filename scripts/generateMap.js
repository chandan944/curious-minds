const fs = require('fs');
const path = require('path');

const TOPICS_DIR = path.join(__dirname, '..', 'topics');
const OUTPUT_FILE = path.join(__dirname, '..', 'constants', 'topicTranslationsMap.js');

const topicDirs = fs.readdirSync(TOPICS_DIR).filter(d => fs.statSync(path.join(TOPICS_DIR, d)).isDirectory());

let fileContent = `// ─────────────────────────────────────────────────────────
//  AUTO-GENERATED HINDI MAP
//  Run node scripts/generateMap.js to update
// ─────────────────────────────────────────────────────────

export const TOPIC_CONFIGS_HI = {
`;

topicDirs.forEach(dir => {
  const configHiPath = path.join(TOPICS_DIR, dir, 'config_hi.js');
  if (fs.existsSync(configHiPath)) {
    fileContent += `  ${dir}: () => require("../topics/${dir}/config_hi").default,\n`;
  }
});

fileContent += `};\n`;

fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
console.log('✅ Generated constants/topicTranslationsMap.js successfully.');
