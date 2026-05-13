const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const factRegistryPath = path.join(projectRoot, 'constants', 'factRegistry.js');
const topicsDir = path.join(projectRoot, 'topics');
const factsDir = path.join(projectRoot, 'facts');

const content = fs.readFileSync(factRegistryPath, 'utf8');

// Extract registered IDs from FACT_CONFIGS
const registeredConfigs = content.match(/['"]([a-z0-9_]+)['"]:\s*\(\)\s*=>/g) || [];
const registeredIds = registeredConfigs.map(m => m.match(/['"]([a-z0-9_]+)['"]/)[1]);

const allTopics = fs.readdirSync(topicsDir).filter(f => fs.lstatSync(path.join(topicsDir, f)).isDirectory());

const missingFacts = allTopics.filter(topic => {
    const factConfigPath = path.join(factsDir, topic, 'config.js');
    // If it doesn't exist OR it's not registered
    return !fs.existsSync(factConfigPath) || !registeredIds.includes(topic);
});

console.log(JSON.stringify(missingFacts, null, 2));
