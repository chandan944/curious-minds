const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const factRegistryPath = path.join(projectRoot, 'curious-minds', 'constants', 'factRegistry.js');
const factsDir = path.join(projectRoot, 'curious-minds', 'facts');
const topicsDir = path.join(projectRoot, 'curious-minds', 'topics');

const content = fs.readFileSync(factRegistryPath, 'utf8');
const registryMatch = content.match(/export const FACT_REGISTRY = \[([\s\S]*?)\];/);

const items = [];
const itemRegex = /id:\s*['"]([a-z0-9_]+)['"]/g;
let match;
while ((match = itemRegex.exec(registryMatch[1])) !== null) {
    items.push(match[1]);
}

let topicRelatedTotal = 0;
let topicRelatedDone = 0;
let remainingList = [];

items.forEach(id => {
    if (fs.existsSync(path.join(topicsDir, id))) {
        topicRelatedTotal++;
        const p = path.join(factsDir, id, 'config.js');
        if (fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes('// ✨ NEW_FIDELITY')) {
            topicRelatedDone++;
        } else {
            remainingList.push(id);
        }
    }
});

console.log(JSON.stringify({
    topicRelatedTotal,
    topicRelatedDone,
    remainingCount: topicRelatedTotal - topicRelatedDone,
    remainingList
}, null, 2));
