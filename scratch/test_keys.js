const API_KEYS = [
  'AIzaSyBjVi8pW75F1pQopfEI2LweXl4-Z9PXFzg',
  'AIzaSyDmhz8dUpG9TuWRnnUgNSPU-Cyiwg8lHXY',
  'AIzaSyC6AfilGc7iHk_tXVN0AH12acxeX6cvZZ8',
  'AIzaSyC9mjx8LJD3w_vyKQEUXlaezTd0vI290Eg',
  'AIzaSyB9d6e2f3TNeBvTeodk_CFxs5hGBbFTSTo'
];

async function testKey(key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    if (data.candidates) {
      console.log(`✅ Key ${key.substring(0, 8)}... is VALID`);
    } else {
      console.log(`❌ Key ${key.substring(0, 8)}... is INVALID:`, data.error?.message || 'Unknown error');
    }
  } catch (e) {
    console.log(`❌ Key ${key.substring(0, 8)}... failed:`, e.message);
  }
}

async function main() {
  for (const key of API_KEYS) {
    await testKey(key);
  }
}
main();
