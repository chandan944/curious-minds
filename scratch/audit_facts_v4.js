const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');
const registryPart = content.split('export const FACT_REGISTRY = [')[1].split('];')[0];
const idMatches = registryPart.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

const allDirs = fs.readdirSync(factsDir).filter(f => fs.statSync(path.join(factsDir, f)).isDirectory());

console.log(`Registry has ${registryIds.length} topics.`);
console.log(`Directory has ${allDirs.length} subdirectories.`);

const unregistered = allDirs.filter(d => !registryIds.includes(d));

console.log(`${unregistered.length} subdirectories are NOT in FACT_REGISTRY.`);

unregistered.forEach(id => {
    const dirPath = path.join(factsDir, id);
    const configPath = path.join(dirPath, 'config.js');
    if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const factCount = (fileContent.match(/\{/g) || []).length - 1;
        console.log(`[Unregistered] ${id}: ${factCount} facts`);
    } else {
        console.log(`[Unregistered] ${id}: NO config.js`);
    }
});
