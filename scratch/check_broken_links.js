const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const factRegistryPath = path.join(projectRoot, 'curious-minds', 'constants', 'factRegistry.js');
const factsDir = path.join(projectRoot, 'curious-minds', 'facts');

const content = fs.readFileSync(factRegistryPath, 'utf8');

const getIds = (regex) => {
    const match = content.match(regex);
    if (!match) return [];
    const ids = [];
    const idRegex = /['"]([a-z0-9_]+)['"]:\s*\(\)\s*=>/g;
    let m;
    while ((m = idRegex.exec(match[1])) !== null) {
        ids.push(m[1]);
    }
    return ids;
};

const enIds = getIds(/export const FACT_CONFIGS = \{([\s\S]*?)\};/);
const hiIds = getIds(/export const FACT_CONFIGS_HI = \{([\s\S]*?)\};/);

console.log("Checking EN configs...");
enIds.forEach(id => {
    const p = path.join(factsDir, id, 'config.js');
    if (!fs.existsSync(p)) {
        console.log(`MISSING: ${id} (config.js)`);
    } else if (fs.statSync(p).size === 0) {
        console.log(`EMPTY: ${id} (config.js)`);
    }
});

console.log("\nChecking HI configs...");
hiIds.forEach(id => {
    const p = path.join(factsDir, id, 'config_hi.js');
    if (!fs.existsSync(p)) {
        console.log(`MISSING: ${id} (config_hi.js)`);
    } else if (fs.statSync(p).size === 0) {
        console.log(`EMPTY: ${id} (config_hi.js)`);
    }
});
