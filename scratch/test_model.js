
const key = 'sk-or-v1-YOUR_KEY_HERE';
const model = 'google/gemini-flash-1.5:free';

async function test() {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Say hello.' }] })
    });
    const d = await r.json();
    console.log(JSON.stringify(d, null, 2));
}
test();
