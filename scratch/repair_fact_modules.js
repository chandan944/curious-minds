const fs = require('fs');
const path = require('path');

const brokenFilesPath = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files_v2.json';
const brokenFiles = JSON.parse(fs.readFileSync(brokenFilesPath, 'utf8'));

const fileMap = {};
brokenFiles.forEach(item => {
    const key = `${item.id}/${item.file}`;
    fileMap[key] = item;
});
const uniqueBrokenFiles = Object.values(fileMap);

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';

uniqueBrokenFiles.forEach((item, index) => {
    const filePath = path.join(factsDir, item.id, item.file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Repair the "damaged" strings where injection happened mid-string
    // Look for: " ... color: "..." ... svgIcon: "...", ... "
    // Note: The injection was: `\n      color: "${visuals.color}",\n      bgGradient: ["${visuals.gradient[0]}", "${visuals.gradient[1]}"],\n      svgIcon: "${visuals.icon}",`
    
    const repairRegex = /content:\s*(["'])([\s\S]*?)(\n\s+color: "[^"]+",\n\s+bgGradient: \[[^\]]+\],\n\s+svgIcon: "[^"]+",)([\s\S]*?)\1/g;
    
    let repairedContent = content.replace(repairRegex, (match, quote, p1, injection, p2) => {
        // Move the injection AFTER the closing quote
        return `content: ${quote}${p1}${p2}${quote},${injection}`;
    });

    // 2. Fix the case where it injected into 'id' as well
    const idRepairRegex = /id:\s*(["'])([\s\S]*?)(\n\s+color: "[^"]+",\n\s+bgGradient: \[[^\]]+\],\n\s+svgIcon: "[^"]+",)([\s\S]*?)\1/g;
    repairedContent = repairedContent.replace(idRepairRegex, (match, quote, p1, injection, p2) => {
         return `id: ${quote}${p1}${p2}${quote},${injection}`;
    });

    // 3. Clean up double injections (if any) or misplaced commas
    repairedContent = repairedContent.replace(/,\s*,\s*/g, ',\n      ');

    fs.writeFileSync(filePath, repairedContent);
});

console.log('Repair done!');
