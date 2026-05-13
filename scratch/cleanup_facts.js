const fs = require('fs');
const path = require('path');

const brokenFilesPath = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files_v2.json';
const brokenFiles = JSON.parse(fs.readFileSync(brokenFilesPath, 'utf8'));

const uniqueBrokenFiles = [...new Set(brokenFiles.map(f => `${f.id}/${f.file}`))];

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';

uniqueBrokenFiles.forEach((fileKey, index) => {
    const [id, file] = fileKey.split('/');
    const filePath = path.join(factsDir, id, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the bad injections
    const badInjectionPattern = /\n\s+color: "[^"]+",\n\s+bgGradient: \[[^\]]+\],\n\s+svgIcon: "[^"]+",/g;
    content = content.replace(badInjectionPattern, '');
    
    // Remove the misplaced commas (comma followed by something that isn't a newline)
    // Wait, let's just remove all commas that were added.
    // My script added `content:` + ` injection`.
    // Actually, it was: `part.replace(/(content:\s*["'].*?["'],?)/, `$1${injection}`)`
    // So it was: `content: "text",` + `injection`.
    
    // Re-run the rename text to content just in case
    content = content.replace(/(\s+)text:/g, '$1content:');
    content = content.replace(/"text":/g, '"content":');

    fs.writeFileSync(filePath, content);
});

console.log('Cleanup done!');
