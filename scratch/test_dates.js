
const testTime = (label, iso) => {
  const d = new Date(iso);
  console.log(`${label}: [${iso}] -> ${d.toString()}`);
};

const now = new Date();
console.log(`Current Local Time: ${now.toString()}`);
console.log(`Current ISO (UTC): ${now.toISOString()}`);

testTime('UTC with Z', '2026-05-12T10:00:00Z');
testTime('No suffix (assumes local in many engines)', '2026-05-12T10:00:00');
testTime('With IST offset', '2026-05-12T15:30:00+05:30');
testTime('Manual Z append to No suffix', '2026-05-12T10:00:00' + 'Z');
testTime('Replace T with space', '2026-05-12T10:00:00'.replace('T', ' '));
testTime('Manual Z append to IST offset (CORRUPTED)', '2026-05-12T15:30:00+05:30' + 'Z');
