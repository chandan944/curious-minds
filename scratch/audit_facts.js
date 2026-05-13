const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');

// Rough regex to find IDs in FACT_REGISTRY
const idMatches = content.match(/id:\s*["']([^"']+)["']/g);
const ids = idMatches.map(m => m.match(/["']([^"']+)["']/)[1]);

console.log(`Found ${ids.length} unique IDs in registry (including duplicates in maps).`);

const uniqueIds = [...new Set(ids)];
console.log(`Found ${uniqueIds.length} unique IDs.`);

uniqueIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) {
        console.log(`MISSING DIRECTORY: ${id}`);
    } else {
        const configPath = path.join(dirPath, 'config.js');
        const configHiPath = path.join(dirPath, 'config_hi.js');
        
        if (!fs.existsSync(configPath)) {
            console.log(`MISSING config.js: ${id}`);
        } else {
            const configContent = fs.readFileSync(configPath, 'utf8');
            if (configContent.includes('facts: []')) {
                console.log(`EMPTY facts array in config.js: ${id}`);
            }
        }
        
        if (!fs.existsSync(configHiPath)) {
            console.log(`MISSING config_hi.js: ${id}`);
        } else {
            const configHiContent = fs.readFileSync(configHiPath, 'utf8');
            if (configHiContent.includes('facts: []')) {
                console.log(`EMPTY facts array in config_hi.js: ${id}`);
            }
        }
    }
});
