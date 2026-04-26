const fs = require('fs');
const path = require('path');

const ROOT = 'c:/Users/lenovo/Desktop/curious-brain/curious-minds';

// 1. Get Registry IDs
const registryContent = fs.readFileSync(path.join(ROOT, 'constants/topicRegistry.js'), 'utf8');
const registryIds = [...registryContent.matchAll(/id:\s*[\"'](.*?)[\"']/g)].map(m => m[1]);

// 2. Get Topic Folders
const topicDirs = fs.readdirSync(path.join(ROOT, 'topics')).filter(d => fs.statSync(path.join(ROOT, 'topics', d)).isDirectory());

// 3. Get TopicScreen Configs
const screenContent = fs.readFileSync(path.join(ROOT, 'screens/TopicScreen.jsx'), 'utf8');
const configsMatch = screenContent.match(/const TOPIC_CONFIGS = \{([\s\S]*?)\};\n\/\//)[1];
const screenConfigs = [...configsMatch.matchAll(/^\s*([a-z_0-9]+)\s*:/gm)].map(m => m[1]);

const labsMatch = screenContent.match(/const LAB_COMPONENTS = \{([\s\S]*?)\};\n\nconst STEPS/)[1];
const labConfigs = [...labsMatch.matchAll(/^\s*([a-z_0-9]+)\s*:/gm)].map(m => m[1]);

// 4. Get Translation Mapping
const transContent = fs.readFileSync(path.join(ROOT, 'constants/topicTranslationsMap.js'), 'utf8');
const transConfigs = [...transContent.matchAll(/^\s*([a-z_0-9]+)\s*:/gm)].map(m => m[1]);

console.log(JSON.stringify({
    registryCount: registryIds.length,
    foldersCount: topicDirs.length,
    screenConfigsCount: screenConfigs.length,
    labConfigsCount: labConfigs.length,
    transConfigsCount: transConfigs.length,
    missingInScreen: registryIds.filter(id => !screenConfigs.includes(id)),
    folderButNoRegistry: topicDirs.filter(d => !registryIds.includes(d)),
    registryButNoFolder: registryIds.filter(id => !topicDirs.includes(id)),
    missingLabs: screenConfigs.filter(id => !labConfigs.includes(id)),
    missingTrans: screenConfigs.filter(id => !transConfigs.includes(id))
}, null, 2));
