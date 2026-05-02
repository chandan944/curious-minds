const fs = require('fs');
const path = require('path');

const topicsDir = path.join(__dirname, 'topics');
const topics = fs.readdirSync(topicsDir);

let needsExpansion = [];

topics.forEach(topic => {
  const configPath = path.join(topicsDir, topic, 'config.js');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      
      // Simple string matching to count items (not perfect but good enough for a quick check)
      const theoryMatches = content.match(/id:\s*['"][a-zA-Z0-9_]+['"],\s*title:/g);
      const dykwMatches = content.match(/id:\s*['"]dyk[w]?[0-9]+['"],/g) || content.match(/question:\s*['"].*?['"],\s*answer:/g);
      const quizMatches = content.match(/id:\s*['"]q[0-9]+['"],/g);

      // Adjust these thresholds based on the exact definitions in the file
      let theoryCount = 0;
      let dykwCount = 0;
      let quizCount = 0;

      // Extract array contents using a simple parsing approach or just count specific markers
      // A more robust way is to just require it, but we have to handle ES modules.
      // Since it's 'export default', we can replace it and eval it.
      let jsCode = content.replace('export default', 'module.exports = ');
      
      // Sometimes there are other imports, so we need to be careful
      // We will just use the regex counting for a rough estimate
      
      // Let's try to parse it as a module
      const tempPath = path.join(__dirname, `temp_config_${topic}.js`);
      fs.writeFileSync(tempPath, jsCode);
      
      try {
        const config = require(tempPath);
        theoryCount = config.theory ? config.theory.length : 0;
        dykwCount = config.doYouKnowWhy ? config.doYouKnowWhy.length : 0;
        quizCount = config.quiz ? config.quiz.length : 0;
        
        if (theoryCount < 10 || dykwCount < 5 || quizCount < 15) {
          needsExpansion.push({
            topic,
            theory: theoryCount,
            dykw: dykwCount,
            quiz: quizCount
          });
        }
      } catch (e) {
        // Fallback to regex if parsing fails
      }
      
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
    } catch (err) {
      console.error(`Error reading ${topic}:`, err);
    }
  }
});

console.log(`Found ${needsExpansion.length} topics that need expansion:`);
needsExpansion.forEach(t => {
  console.log(`- ${t.topic}: Theory (${t.theory}/10), DYKW (${t.dykw}/5), Quiz (${t.quiz}/15)`);
});
