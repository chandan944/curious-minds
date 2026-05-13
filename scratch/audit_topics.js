const fs = require('fs');
const path = require('path');

const topicsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/topics';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/topicRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');
const idMatches = content.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

console.log(`Topic Registry has ${registryIds.length} topics.`);

registryIds.forEach(id => {
    const dirPath = path.join(topicsDir, id);
    if (!fs.existsSync(dirPath)) {
        console.log(`[TOPIC] ${id}: MISSING DIRECTORY`);
        return;
    }

    const checkConfig = (fileName) => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) return 'MISSING';
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.length < 500) return 'TOO_SMALL';
        
        // Count theory blocks
        const theoryCount = (fileContent.match(/id:\s*["'][^"']+["']/g) || []).length;
        if (theoryCount < 3) return `LOW_CONTENT(${theoryCount})`;
        
        return 'OK';
    };

    const en = checkConfig('config.js');
    const hi = checkConfig('config_hi.js');
    
    if (en !== 'OK' || hi !== 'OK') {
        console.log(`[TOPIC] ${id}: EN[${en}] | HI[${hi}]`);
    }
});
