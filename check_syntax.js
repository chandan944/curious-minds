const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('config_hi.js')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'topics'));
let errors = [];
for (const file of files) {
  try {
    execSync(`node --check "${file}"`, { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    errors.push({ file, error: err.stderr || err.message });
  }
}
console.log(JSON.stringify(errors, null, 2));
