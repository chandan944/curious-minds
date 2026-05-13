const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const topicsDir = path.join(__dirname, '..', 'topics');
const allTopics = fs.readdirSync(topicsDir).filter(f => fs.statSync(path.join(topicsDir, f)).isDirectory());

// Get modified topics from git
const gitStatus = cp.execSync('git status --porcelain').toString();
const modifiedTopics = gitStatus.split('\n')
    .filter(line => line.includes('topics/'))
    .map(line => line.split('topics/')[1].split('/')[0])
    .filter((val, index, self) => self.indexOf(val) === index); // Unique

const remainingTopics = allTopics.filter(t => t !== 'depression' && !modifiedTopics.includes(t));

console.log(`Found ${modifiedTopics.length} modified topics.`);
console.log(`Resuming for ${remainingTopics.length} remaining topics...`);

if (remainingTopics.length === 0) {
    console.log("No more topics to process!");
    process.exit(0);
}

// Spawn the original script with the remaining topics
const child = cp.spawn('node', [path.join(__dirname, 'normalize_quiz_options.js'), ...remainingTopics], {
    stdio: 'inherit'
});

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
});
