const fs = require('fs');
const path = require('path');

const ROOT = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds';
const TOPICS_DIR = path.join(ROOT, 'topics');

const topics = fs.readdirSync(TOPICS_DIR);

const results = [];

function countItems(sectionContent) {
    if (!sectionContent) return 0;
    // Count objects starting with {
    // This is rough but better
    return (sectionContent.match(/\{[\s\S]*?id:/g) || []).length;
}

topics.forEach(topicId => {
    const configPath = path.join(TOPICS_DIR, topicId, 'config.js');
    if (!fs.existsSync(configPath)) return;

    let content = fs.readFileSync(configPath, 'utf8');
    
    // Split by sections to avoid matching IDs in other sections
    const theoryPart = content.split('theory: [')[1]?.split('],')[0];
    const dykwPart = content.split('doYouKnowWhy: [')[1]?.split('],')[0];
    const quizPart = content.split('quiz: [')[1]?.split('],')[0];

    const theoryCount = countItems(theoryPart);
    const dykwCount = countItems(dykwPart);
    const quizCount = countItems(quizPart);

    const hiConfigPath = path.join(TOPICS_DIR, topicId, 'config_hi.js');
    const hiExists = fs.existsSync(hiConfigPath);

    if (theoryCount < 10 || dykwCount < 5 || quizCount < 20) {
        results.push({
            topicId,
            theory: theoryCount,
            dykw: dykwCount,
            quiz: quizCount,
            hiExists
        });
    }
});

console.log(JSON.stringify(results, null, 2));
