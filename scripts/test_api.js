const keys = [
  'sk-or-v1-PLACEHOLDER_KEY_1',
  'sk-or-v1-PLACEHOLDER_KEY_2',
  'sk-or-v1-PLACEHOLDER_KEY_3',
  'sk-or-v1-PLACEHOLDER_KEY_4',
  'sk-or-v1-PLACEHOLDER_KEY_5'
];
const models = [
  'minimax/minimax-m2.5:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
];

async function test(model, key, ki) {
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Say hello in 5 words.' }], max_tokens: 50 })
    });
    const d = await r.json();
    const ok = d.choices && d.choices[0];
    console.log(`${ok ? '✅' : '❌'} key${ki} | ${model.padEnd(50)} -> ${ok ? 'WORKS' : (d.error?.metadata?.raw || d.error?.message || 'err').substring(0, 60)}`);
    return ok;
  } catch (e) {
    console.log(`❌ key${ki} | ${model.padEnd(50)} -> ${e.message}`);
    return false;
  }
}

// Test each model with key 0
Promise.all(models.map(m => test(m, keys[0], 0))).then(() => {
  console.log('\nDone! Use the models marked ✅');
});
