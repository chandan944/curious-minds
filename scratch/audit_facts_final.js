const path = require('path');
const fs = require('fs');

// We can't easily 'require' because of ES modules and relative paths in the registry.
// But we can parse the files as JS objects if we are careful, or just use a better regex.

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');
const idMatches = content.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

console.log(`Auditing ${registryIds.length} topics...`);

registryIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) {
        console.log(`[EMPTY] ${id}: Directory missing`);
        return;
    }

    const check = (fileName, label) => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) {
            console.log(`[EMPTY] ${id}: ${label} file missing`);
            return;
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Count occurrences of 'id:' inside the facts array
        // We'll look for things like 'id: "something_f1"' or '"id": "something_f1"'
        const factMatches = fileContent.match(/id:\s*["'][^"']+_f\d+["']/g) || 
                            fileContent.match(/"id":\s*["'][^"']+_f\d+["']/g) ||
                            fileContent.match(/id:\s*["'][^"']+-?\d+["']/g) ||
                            fileContent.match(/"id":\s*["'][^"']+-?\d+["']/g);
        
        const count = factMatches ? factMatches.length : 0;
        
        if (count === 0) {
            console.log(`[EMPTY] ${id}: ${label} has 0 facts`);
        } else if (count < 10) {
            console.log(`[LOW] ${id}: ${label} has only ${count} facts`);
        }
    };

    check('config.js', 'EN');
    check('config_hi.js', 'HI');
});
