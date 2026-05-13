const API_KEYS = [
  'AIzaSyBjVi8pW75F1pQopfEI2LweXl4-Z9PXFzg',
  'AIzaSyDmhz8dUpG9TuWRnnUgNSPU-Cyiwg8lHXY',
  'AIzaSyC6AfilGc7iHk_tXVN0AH12acxeX6cvZZ8',
  'AIzaSyC9mjx8LJD3w_vyKQEUXlaezTd0vI290Eg',
  'AIzaSyB9d6e2f3TNeBvTeodk_CFxs5hGBbFTSTo'
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
