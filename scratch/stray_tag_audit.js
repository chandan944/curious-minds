const fs = require('fs');
const path = require('path');

const topicsDir = 'topics';
const files = fs.readdirSync(topicsDir);

let strayFound = false;

files.forEach(topic => {
    const labPath = path.join(topicsDir, topic, 'LabSimulation.jsx');
    if (fs.existsSync(labPath)) {
        const content = fs.readFileSync(labPath, 'utf8');
        
        // Find the main return block
        const returnMatch = content.match(/return\s*\(\s*<View[\s\S]*?\n\s*\);/);
        if (returnMatch) {
            const returnBlock = returnMatch[0];
            const strayG = returnBlock.match(/<\/AnimatedG>/g);
            if (strayG) {
                console.log(`[!] Stray </AnimatedG> found in ${labPath} within main return block.`);
                strayFound = true;
            }
        }
    }
});

if (!strayFound) console.log("No obvious stray </AnimatedG> tags found in main return blocks.");
