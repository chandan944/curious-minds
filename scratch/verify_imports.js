const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const registryContent = fs.readFileSync(registryFile, 'utf8');

// Regex to find the require paths in FACT_CONFIGS and FACT_CONFIGS_HI
const requireRegex = /require\("([^"]+)"\)/g;
let match;
const missingFiles = [];

while ((match = requireRegex.exec(registryContent)) !== null) {
    const relPath = match[1];
    // Path is like "../facts/animals_wildlife/config"
    // Convert to absolute
    const absPath = path.resolve(path.dirname(registryFile), relPath + '.js');
    
    if (!fs.existsSync(absPath)) {
        missingFiles.push({ relPath, absPath });
    }
}

console.log(`Found ${missingFiles.length} missing files in registry imports.`);
if (missingFiles.length > 0) {
    console.log(JSON.stringify(missingFiles, null, 2));
}
