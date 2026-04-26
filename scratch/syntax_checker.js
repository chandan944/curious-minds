import fs from 'fs';
import path from 'path';

function checkFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Simple regex to check for common export default objects in these files
        if (content.includes('export default {')) {
             // We can't easily eval ESM without a server, but we can check basic syntax
             // by stripping 'export default' and trying to parse as an object literal.
             // However, that's complex.
             // Instead, let's just use a basic JS syntax check by wrapping in a function.
             const script = `(function() { ${content.replace('export default', 'const x =')} })()`;
             new Function(script);
        }
        return null;
    } catch (e) {
        return e.message;
    }
}

const topicsDir = './topics';
const files = [];

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.js')) {
            files.push(fullPath);
        }
    });
}

walk(topicsDir);

files.forEach(file => {
    const error = checkFile(file);
    if (error) {
        console.log(`Error in ${file}: ${error}`);
    }
});
