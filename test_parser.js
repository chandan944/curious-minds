const fs = require('fs');

function parseQuestions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const quizIdx = content.indexOf('quiz: [');
  if (quizIdx === -1) return [];
  
  let collectedQuestions = [];
  let searchIdx = quizIdx;
  
  while (true) {
    const qIdx = content.indexOf('question:', searchIdx);
    if (qIdx === -1) break;
    
    // Stop if we hit relatedTopics
    const relTopIdx = content.indexOf('relatedTopics:', searchIdx);
    if (relTopIdx !== -1 && qIdx > relTopIdx) break;
    
    const slice = content.substring(qIdx, qIdx + 1500); 
    
    // Better regex for array
    const match = slice.match(/^question:\s*(["'])([\s\S]*?)\1[\s\S]*?options:\s*(\[(?:[^\]]|\])*?\])[\s\S]*?answer:\s*(\d+)/);
    
    if (match) {
      const question = match[2];
      let optString = match[3];
      const answerIndex = parseInt(match[4]);
      
      // Let's manually find the matching bracket for options to be safe
      const optStartInSlice = slice.indexOf('options:');
      const bracketStart = slice.indexOf('[', optStartInSlice);
      let bracketCount = 0;
      let bracketEnd = -1;
      for (let i = bracketStart; i < slice.length; i++) {
        if (slice[i] === '[') bracketCount++;
        if (slice[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            bracketEnd = i;
            break;
          }
        }
      }
      
      if (bracketEnd !== -1) {
         optString = slice.substring(bracketStart, bracketEnd + 1);
      }

      let options;
      try {
        options = eval(`(${optString})`);
      } catch (e) {
        console.log("Eval failed for", optString, "at qIdx", qIdx);
      }
      
      const optStart = qIdx + slice.indexOf(optString);
      const optEnd = optStart + optString.length;
      
      collectedQuestions.push({
        question,
        options,
        answerIndex,
        optStart,
        optEnd
      });
      searchIdx = optEnd;
    } else {
      console.log("No match for slice at", qIdx);
      searchIdx = qIdx + 10;
    }
  }
  return collectedQuestions;
}

console.log("Life Hacks:", parseQuestions('topics/life_hacks/config.js').length);
console.log("Depression:", parseQuestions('topics/depression/config.js').length);
