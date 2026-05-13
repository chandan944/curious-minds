const fs = require('fs');
const path = require('path');

const projectRoot = '.';
const factRegistryPath = path.join(projectRoot, 'curious-minds', 'constants', 'factRegistry.js');
const factsDir = path.join(projectRoot, 'curious-minds', 'facts');

const content = fs.readFileSync(factRegistryPath, 'utf8');

// 1. Get all IDs from FACT_REGISTRY
const registryMatch = content.match(/export const FACT_REGISTRY = \[([\s\S]*?)\];/);
const allIds = [];
const idRegex = /id:\s*['"]([a-z0-9_]+)['"]/g;
let m;
while ((m = idRegex.exec(registryMatch[1])) !== null) {
    allIds.push(m[1]);
}

// 2. Get registered IDs from FACT_CONFIGS
const configsMatch = content.match(/export const FACT_CONFIGS = \{([\s\S]*?)\};/);
const registered = new Set();
const regRegex = /['"]([a-z0-9_]+)['"]:\s*\(\)\s*=>/g;
while ((m = regRegex.exec(configsMatch[1])) !== null) {
    registered.add(m[1]);
}

// 3. Find missing IDs that have a folder
const missing = allIds.filter(id => !registered.has(id));
const toAdd = [];

missing.forEach(id => {
    const p = path.join(factsDir, id, 'config.js');
    if (fs.existsSync(p)) {
        toAdd.push(id);
    } else {
        console.warn(`Missing folder for ID: ${id}`);
    }
});

// 4. Generate the strings
const enLines = toAdd.map(id => `  "${id}": () => require("../facts/${id}/config").default,`).join('\n');
const hiLines = toAdd.map(id => `  "${id}": () => require("../facts/${id}/config_hi").default,`).join('\n');

console.log("EN LINES:\n" + enLines);
console.log("\nHI LINES:\n" + hiLines);
