const fs = require('fs');
const path = require('path');

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';
const registryFile = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';

const content = fs.readFileSync(registryFile, 'utf8');
const registryPart = content.split('export const FACT_REGISTRY = [')[1].split('];')[0];
const idMatches = registryPart.match(/id:\s*["']([^"']+)["']/g);
const registryIds = [...new Set(idMatches.map(m => m.match(/["']([^"']+)["']/)[1]))];

console.log(`Auditing ${registryIds.length} topics...`);

const results = [];

registryIds.forEach(id => {
    const dirPath = path.join(factsDir, id);
    if (!fs.existsSync(dirPath)) {
        results.push({ id, status: 'MISSING_DIR' });
        return;
    }

    const auditFile = (fileName) => {
        const filePath = path.join(dirPath, fileName);
        if (!fs.existsSync(filePath)) return { status: 'MISSING_FILE' };
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Count { id: " to find fact objects
        const factCount = (fileContent.match(/id:\s*["'][^"']+_f\d+["']/g) || 
                           fileContent.match(/id:\s*["'][^"']+-?\d+["']/g) || []).length;
        
        const isNewFidelity = fileContent.includes('NEW_FIDELITY') || (fileContent.includes('bgGradient') && fileContent.includes('svgIcon'));
        const isEmpty = factCount === 0 || fileContent.includes('facts: []') || fileContent.includes('"facts": []');
        
        return { factCount, isNewFidelity, isEmpty };
    };

    const en = auditFile('config.js');
    const hi = auditFile('config_hi.js');
    
    results.push({ id, en, hi });
});

results.forEach(r => {
    if (r.status === 'MISSING_DIR') {
        console.log(`${r.id}: MISSING DIRECTORY`);
        return;
    }
    
    const enInfo = r.en.status || `${r.en.factCount} facts${r.en.isNewFidelity ? ' (NEW)' : ' (OLD)'}${r.en.isEmpty ? ' EMPTY' : ''}`;
    const hiInfo = r.hi.status || `${r.hi.factCount} facts${r.hi.isNewFidelity ? ' (NEW)' : ' (OLD)'}${r.hi.isEmpty ? ' EMPTY' : ''}`;
    
    if (r.en.factCount < 10 || r.hi.factCount < 10 || !r.en.isNewFidelity || !r.hi.isNewFidelity || r.en.isEmpty || r.hi.isEmpty) {
        console.log(`${r.id}: EN[${enInfo}] | HI[${hiInfo}]`);
    }
});
