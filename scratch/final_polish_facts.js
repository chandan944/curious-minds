const fs = require('fs');
const path = require('path');

const brokenFilesPath = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/scratch/broken_files_v2.json';
const brokenFiles = JSON.parse(fs.readFileSync(brokenFilesPath, 'utf8'));
const uniqueBrokenFiles = [...new Set(brokenFiles.map(f => `${f.id}/${f.file}`))];

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

uniqueBrokenFiles.forEach((fileKey, index) => {
    const [id, file] = fileKey.split('/');
    const filePath = path.join(factsDir, id, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the comma mess (e.g., source: ",National Geographic")
    content = content.replace(/:\s*,\s*/g, ': ');
    content = content.replace(/:\s*"\s*,\s*/g, ': "');
    content = content.replace(/:\s*'\s*,\s*/g, ": '");

    // 2. Identify Category
    const catMatch = content.match(/category:\s*["']([^"']+)["']/);
    const category = catMatch ? catMatch[1] : "Nature & Earth";
    const visuals = CATEGORY_VISUALS[category] || CATEGORY_VISUALS["Nature & Earth"];

    // 3. Robust Fact Object Injection
    // We'll find the facts array content
    const factsArrayMatch = content.match(/facts:\s*\[([\s\S]*?)\]\s*[,;]?\s*\}/);
    if (factsArrayMatch) {
        let factsArrayContent = factsArrayMatch[1];
        
        // Split by fact objects
        const factObjects = factsArrayContent.split(/(?=\{)/);
        const processedObjects = factObjects.map(obj => {
            if (obj.trim().startsWith('{') && !obj.includes('bgGradient')) {
                // Find the first field ending (e.g., id: "...",)
                // or just inject after the opening {
                const injection = `\n      color: "${visuals.color}",\n      bgGradient: ["${visuals.gradient[0]}", "${visuals.gradient[1]}"],\n      svgIcon: "${visuals.icon}",`;
                return obj.replace(/\{/, '{' + injection);
            }
            return obj;
        });
        
        const newFactsArrayContent = processedObjects.join('');
        content = content.replace(factsArrayMatch[1], newFactsArrayContent);
    }

    fs.writeFileSync(filePath, content);
});

console.log('Final Polish Done!');
