const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');

// Find all IDs in FACT_REGISTRY (between [ and ])
const registryPart = content.split('export const FACT_REGISTRY = [')[1].split('];')[0];
const idMatches = registryPart.match(/id:\s*["']([^"']+)["']/g);
const registryIds = idMatches.map(m => m.match(/["']([^"']+)["']/)[1]);

console.log(`Registry has ${registryIds.length} topics.`);

const audit = [];

registryIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) {
        audit.push({ id, status: 'MISSING_DIR' });
        return;
    }

    const checkConfig = (fileName, lang) => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) {
            return { status: 'MISSING_FILE' };
        }
        
        // This is a bit hacky but we want to avoid complex parsing
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Try to find facts array
        const factsMatch = fileContent.match(/facts:\s*\[([\s\S]*?)\]/);
        if (!factsMatch) {
            return { status: 'NO_FACTS_ARRAY' };
        }
        
        const factsText = factsMatch[1].trim();
        if (factsText === '') {
            return { status: 'EMPTY_FACTS', count: 0 };
        }
        
        // Count objects in array (crude)
        const count = (factsText.match(/\{/g) || []).length;
        
        // Check for high fidelity (visuals)
        const hasVisuals = fileContent.includes('bgGradient') && fileContent.includes('svgIcon');
        const hasContentField = fileContent.includes('content:');
        
        return { status: 'OK', count, hasVisuals, hasContentField };
    };

    const en = checkConfig('config.js', 'en');
    const hi = checkConfig('config_hi.js', 'hi');
    
    audit.push({ id, en, hi });
});

audit.forEach(item => {
    if (item.status === 'MISSING_DIR') {
        console.log(`[${item.id}] !!! MISSING DIRECTORY !!!`);
    } else {
        const enStatus = item.en.status === 'OK' ? `EN:${item.en.count}${item.en.hasVisuals ? 'V' : ''}${item.en.hasContentField ? 'C' : ''}` : `EN:${item.en.status}`;
        const hiStatus = item.hi.status === 'OK' ? `HI:${item.hi.count}${item.hi.hasVisuals ? 'V' : ''}${item.hi.hasContentField ? 'C' : ''}` : `HI:${item.hi.status}`;
        
        if (item.en.count < 10 || item.hi.count < 10 || item.en.status !== 'OK' || item.hi.status !== 'OK' || !item.en.hasVisuals || !item.hi.hasVisuals) {
            console.log(`[${item.id}] ${enStatus} | ${hiStatus}`);
        }
    }
});
