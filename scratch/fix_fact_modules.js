const fs = require('fs');
const path = require('path');

const brokenFilesPath = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files_v2.json';
const brokenFiles = JSON.parse(fs.readFileSync(brokenFilesPath, 'utf8'));

// Unique the files (previous script pushed twice for multiple issues)
const fileMap = {};
brokenFiles.forEach(item => {
    const key = `${item.id}/${item.file}`;
    fileMap[key] = item;
});
const uniqueBrokenFiles = Object.values(fileMap);

console.log(`Starting refactor for ${uniqueBrokenFiles.length} files...`);

const CATEGORY_VISUALS = {
    "Nature & Earth": { color: "#10B981", gradient: ["#0B311B", "#031208"], icon: "leaf" },
    "Universe & Science": { color: "#8B5CF6", gradient: ["#1B0B31", "#090312"], icon: "atom" },
    "Human Being": { color: "#EF4444", gradient: ["#310B0B", "#120303"], icon: "brain" },
    "History & Civilizations": { color: "#F59E0B", gradient: ["#31210B", "#120B03"], icon: "scroll" },
    "Countries & Cultures": { color: "#3B82F6", gradient: ["#0B1931", "#030812"], icon: "globe" },
    "Technology & Innovation": { color: "#06B6D4", gradient: ["#0B2B31", "#031012"], icon: "cpu" },
    "Arts & Culture": { color: "#EC4899", gradient: ["#310B22", "#12030B"], icon: "image" },
    "Ideas & Thinking": { color: "#FCD34D", gradient: ["#312A0B", "#120F03"], icon: "lightbulb" },
    "Sports & Games": { color: "#F43F5E", gradient: ["#310B16", "#120307"], icon: "activity" },
    "Mystery & Beyond": { color: "#6366F1", gradient: ["#12132B", "#05050A"], icon: "sparkle" }
};

const factsDir = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';

uniqueBrokenFiles.forEach((item, index) => {
    const filePath = path.join(factsDir, item.id, item.file);
    if (!fs.existsSync(filePath)) return;

    console.log(`[${index+1}/${uniqueBrokenFiles.length}] Fixing ${item.id}/${item.file}...`);

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Rename 'text' to 'content' (handling both quoted and unquoted)
    content = content.replace(/(\s+)text:/g, '$1content:');
    content = content.replace(/"text":/g, '"content":');

    // 2. Add ✨ NEW_FIDELITY tag if missing
    if (!content.includes('✨ NEW_FIDELITY')) {
        content = '// ✨ NEW_FIDELITY\n' + content;
    }

    // 3. Inject visual fields into each fact object if missing
    // We'll use a more robust approach: find the category from the file or use a default
    const catMatch = content.match(/category:\s*["']([^"']+)["']/);
    const category = catMatch ? catMatch[1] : "Nature & Earth"; // fallback
    const visuals = CATEGORY_VISUALS[category] || CATEGORY_VISUALS["Nature & Earth"];

    // We'll use a regex to find fact objects that don't have bgGradient
    // A simple way is to find each fact object and check its content
    
    // Split into facts array
    const parts = content.split(/\{/);
    let newContent = parts[0];
    
    for(let i=1; i<parts.length; i++) {
        let part = parts[i];
        // Check if this is a fact object (contains id: ..._f or id: ...-1)
        if (part.includes('id:') && !part.includes('bgGradient')) {
            // Find a good place to inject. Before the closing brace.
            // But we need to be careful with the trailing comma.
            
            const injection = `\n      color: "${visuals.color}",\n      bgGradient: ["${visuals.gradient[0]}", "${visuals.gradient[1]}"],\n      svgIcon: "${visuals.icon}",`;
            
            // Inject after the first field (usually id or content)
            if (part.includes('content:')) {
                part = part.replace(/(content:\s*["'].*?["'],?)/, `$1${injection}`);
            } else if (part.includes('id:')) {
                part = part.replace(/(id:\s*["'].*?["'],?)/, `$1${injection}`);
            }
        }
        newContent += '{' + part;
    }

    fs.writeFileSync(filePath, newContent);
});

console.log('Done!');
