const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const factRegistryPath = path.join(projectRoot, 'curious-minds', 'constants', 'factRegistry.js');
const factsDir = path.join(projectRoot, 'curious-minds', 'facts');

const content = fs.readFileSync(factRegistryPath, 'utf8');
const registryMatch = content.match(/export const FACT_REGISTRY = \[([\s\S]*?)\];/);

const itemRegex = /\{ id:\s*['"]([a-z0-9_]+)['"].*?category:\s*['"]([^'"]+)['"]/gs;
let match;
const stats = {};

while ((match = itemRegex.exec(registryMatch[1])) !== null) {
    const id = match[1];
    const cat = match[2];
    if (!stats[cat]) stats[cat] = { total: 0, done: 0 };
    stats[cat].total++;

    const p = path.join(factsDir, id, 'config.js');
    if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8');
        if (text.includes('// ✨ NEW_FIDELITY')) {
            stats[cat].done++;
        }
    }
}

console.log(JSON.stringify(stats, null, 2));
