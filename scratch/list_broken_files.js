const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const registryContent = fs.readFileSync(registryFile, 'utf8');
const idMatches = registryContent.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

const brokenFiles = [];

registryIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) return;

    ['config.js', 'config_hi.js'].forEach(fileName => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) return;
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        const hasContentField = fileContent.includes('content:') || fileContent.includes('"content":');
        const hasTextField = fileContent.includes('text:') || fileContent.includes('"text":');
        const hasVisuals = fileContent.includes('bgGradient:');
        
        if ((hasTextField && !hasContentField) || !hasVisuals) {
            brokenFiles.push({
                id,
                file: fileName,
                path: filePath,
                reason: (hasTextField && !hasContentField) ? 'text_to_content' : 'missing_visuals'
            });
        }
    });
});

fs.writeFileSync('c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files.json', JSON.stringify(brokenFiles, null, 2));
console.log(`Found ${brokenFiles.length} broken files.`);
