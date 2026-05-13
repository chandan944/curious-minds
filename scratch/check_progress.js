
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/constants/factRegistry.js';
const FACTS_DIR = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds/facts';

function checkProgress() {
    const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const registryMatch = registryContent.match(/export const FACT_REGISTRY = (\[[\s\S]*?\]);/);
    if (!registryMatch) throw new Error("Could not find FACT_REGISTRY in registry file.");
    
    let registryJson = registryMatch[1].replace(/\/\/.*$/gm, '');
    // Simple way to parse if it's mostly JSON-like
    const factRegistry = eval(registryJson);

    const totalTopics = factRegistry.length;
    let completedEnglish = 0;
    let completedHindi = 0;
    let bothCompleted = 0;
    const remainingTopics = [];

    for (const topic of factRegistry) {
        const topicDir = path.join(FACTS_DIR, topic.id);
        const engPath = path.join(topicDir, 'config.js');
        const hinPath = path.join(topicDir, 'config_hi.js');

        const engExists = fs.existsSync(engPath);
        const hinExists = fs.existsSync(hinPath);

        if (engExists) completedEnglish++;
        if (hinExists) completedHindi++;
        if (engExists && hinExists) {
            bothCompleted++;
        } else {
            remainingTopics.push({
                id: topic.id,
                title: topic.title,
                eng: engExists,
                hin: hinExists
            });
        }
    }

    console.log(`Total Topics in Registry: ${totalTopics}`);
    console.log(`Completed English: ${completedEnglish}`);
    console.log(`Completed Hindi: ${completedHindi}`);
    console.log(`Fully Completed (Eng & Hin): ${bothCompleted}`);
    console.log(`Remaining: ${totalTopics - bothCompleted}`);
    console.log('\n--- Remaining Topics ---');
    remainingTopics.forEach(t => {
        let status = '';
        if (!t.eng && !t.hin) status = 'None';
        else if (!t.eng) status = 'Hindi Only';
        else if (!t.hin) status = 'English Only';
        console.log(`- ${t.title} (${t.id}): ${status}`);
    });
}

checkProgress();
