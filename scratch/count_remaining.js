const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const factRegistryPath = path.join(projectRoot, 'curious-minds', 'constants', 'factRegistry.js');
const factsDir = path.join(projectRoot, 'curious-minds', 'facts');

const content = fs.readFileSync(factRegistryPath, 'utf8');
const registryMatch = content.match(/export const FACT_REGISTRY = \[([\s\S]*?)\];/);

if (!registryMatch) {
    console.error("Could not find FACT_REGISTRY");
    process.exit(1);
}

const items = [];
const itemRegex = /id:\s*['"]([a-z0-9_]+)['"]/g;
let match;
while ((match = itemRegex.exec(registryMatch[1])) !== null) {
    items.push(match[1]);
}

let completed = 0;
let remaining = [];

items.forEach(id => {
    const p = path.join(factsDir, id, 'config.js');
    if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8');
        if (text.includes('// ✨ NEW_FIDELITY')) {
            completed++;
        } else {
            remaining.push(id);
        }
    } else {
        remaining.push(id);
    }
});

console.log(JSON.stringify({
    totalInRegistry: items.length,
    completedCount: completed,
    remainingCount: remaining.length,
    remainingList: remaining
}, null, 2));
