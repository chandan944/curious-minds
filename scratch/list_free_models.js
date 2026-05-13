
async function listModels() {
    const r = await fetch('https://openrouter.ai/api/v1/models');
    const d = await r.json();
    const freeModels = d.data.filter(m => m.id.endsWith(':free') || m.pricing.prompt === '0');
    console.log(freeModels.map(m => m.id).join('\n'));
}
listModels();
