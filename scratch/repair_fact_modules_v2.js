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
    
    // The injection block
    const injectionBlockPattern = /\n\s+color: "[^"]+",\n\s+bgGradient: \[[^\]]+\],\n\s+svgIcon: "[^"]+",/g;
    
    // Find any quote-wrapped string that contains the injection block
    // We'll use a regex that matches "..." or '...' and then look for the block inside it
    const stringRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
    
    let repairedContent = content.replace(stringRegex, (match) => {
        if (match.match(injectionBlockPattern)) {
            // Found a damaged string. 
            // 1. Extract the block
            const block = match.match(injectionBlockPattern)[0];
            // 2. Remove block from string
            let cleanedString = match.replace(injectionBlockPattern, '');
            // 3. Return string + comma + block
            // Handle the case where there's already a comma after the string in the parent content?
            // Actually, we'll just return the cleaned string and the block.
            return cleanedString + ',' + block;
        }
        return match;
    });

    // Clean up misplaced commas after the fix
    repairedContent = repairedContent.replace(/",\n\s+color:/g, '",\n      color:');
    repairedContent = repairedContent.replace(/',\n\s+color:/g, "',\n      color:");
    
    // Fix double commas
    repairedContent = repairedContent.replace(/,\s*,/g, ',');

    fs.writeFileSync(filePath, repairedContent);
});

console.log('Robust Repair done!');
