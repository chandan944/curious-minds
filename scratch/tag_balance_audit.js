const fs = require('fs');
const path = require('path');

const topicsDir = 'topics';
const folders = fs.readdirSync(topicsDir);

folders.forEach(topic => {
    const labPath = path.join(topicsDir, topic, 'LabSimulation.jsx');
    if (fs.existsSync(labPath)) {
        const content = fs.readFileSync(labPath, 'utf8');
        
        const openers = (content.match(/<AnimatedG/g) || []).length;
        const closers = (content.match(/<\/AnimatedG>/g) || []).length;

        if (openers !== closers) {
            console.log(`[!] Tag mismatch in ${labPath}: ${openers} openers, ${closers} closers.`);
        }

        const svgs = (content.match(/<Svg/g) || []).length;
        const svgClosers = (content.match(/<\/Svg>/g) || []).length;
        if (svgs !== svgClosers) {
            console.log(`[!] Svg mismatch in ${labPath}: ${svgs} openers, ${svgClosers} closers.`);
        }

        const views = (content.match(/<View/g) || []).length;
        const viewClosers = (content.match(/<\/View>/g) || []).length;
        if (views !== viewClosers) {
             // Views are common, might be false positive if not in return block, but still a good signal
             console.log(`[!] View mismatch in ${labPath}: ${views} openers, ${viewClosers} closers.`);
        }
    }
});
