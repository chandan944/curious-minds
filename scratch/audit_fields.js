const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');
const idMatches = content.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

console.log(`Auditing ${registryIds.length} topics for field names...`);

registryIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) return;

    const check = (fileName, label) => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) return;
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        const hasContent = fileContent.includes('content:');
        const hasText = fileContent.includes('text:');
        const hasVisuals = fileContent.includes('bgGradient:');
        
        if (hasText && !hasContent) {
            console.log(`[BROKEN_FIELDS] ${id} (${label}): uses 'text' instead of 'content'`);
        } else if (!hasContent && !hasText) {
             console.log(`[EMPTY_FIELDS] ${id} (${label}): has neither 'text' nor 'content'`);
        }
        
        if (!hasVisuals) {
            console.log(`[OLD_FIDELITY] ${id} (${label}): missing visuals (bgGradient)`);
        }
    };

    check('config.js', 'EN');
    check('config_hi.js', 'HI');
});
