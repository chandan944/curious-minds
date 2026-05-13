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
        
        try {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            // Mock export default to module.exports
            fileContent = fileContent.replace(/export\s+default\s+/, 'module.exports = ');
            
            // Temporary file to require
            const tmpFile = path.join(__dirname, 'tmp_eval.js');
            fs.writeFileSync(tmpFile, fileContent);
            
            const config = require(tmpFile);
            delete require.cache[require.resolve(tmpFile)];
            
            const facts = config.facts || [];
            if (facts.length === 0) {
                brokenFiles.push({ id, file: fileName, reason: 'zero_facts' });
            } else {
                const firstFact = facts[0];
                if (!firstFact.content && firstFact.text) {
                     brokenFiles.push({ id, file: fileName, reason: 'text_instead_of_content' });
                } else if (!firstFact.content) {
                     brokenFiles.push({ id, file: fileName, reason: 'missing_content_field' });
                }
                
                if (!firstFact.bgGradient) {
                     brokenFiles.push({ id, file: fileName, reason: 'missing_visuals' });
                }
            }
        } catch (e) {
            brokenFiles.push({ id, file: fileName, reason: 'eval_error', error: e.message });
        }
    });
});

fs.writeFileSync('c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files_v2.json', JSON.stringify(brokenFiles, null, 2));
console.log(`Found ${brokenFiles.length} broken files.`);
