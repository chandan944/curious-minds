const API_KEY = 'sk-or-v1-YOUR_KEY_HERE';

async function listModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  const data = await res.json();
  console.log(data.data.filter(m => m.pricing.prompt === '0').map(m => m.id).join(', '));
}
listModels();
