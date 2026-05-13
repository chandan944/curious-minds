
const key = 'AIzaSyAw7bN-uDs58tsveKUdKfHas7khSnliPVo';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`;

async function test() {
    try {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello.' }] }] })
        });
        const d = await r.json();
        console.log(JSON.stringify(d, null, 2));
    } catch (e) {
        console.log(e.message);
    }
}
test();
