const API_KEYS = [
  'AIzaSyAw7bN-uDs58tsveKUdKfHas7khSnliPVo',
  'AIzaSyDSnEWDRTy5ain5bBqXVLo8qLixnEIrI-M'
];

async function listModels(key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log(`✅ Key ${key.substring(0, 8)}... can list models:`);
      console.log(data.models.map(m => m.name).join(', '));
    } else {
      console.log(`❌ Key ${key.substring(0, 8)}... failed to list:`, data.error?.message || 'Unknown error');
    }
  } catch (e) {
    console.log(`❌ Key ${key.substring(0, 8)}... failed:`, e.message);
  }
}

async function main() {
  await listModels(API_KEYS[0]);
}
main();
