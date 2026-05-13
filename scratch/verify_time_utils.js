
// Copy of logic from timeUtils.js
const parseSafe = (isoString) => {
  if (!isoString) return new Date();
  if (isoString.includes('Z') || isoString.includes('+')) {
    return new Date(isoString);
  }
  if (isoString.includes('-') && isoString.includes('T')) {
    try {
      const parts = isoString.split(/[-T:.Z+]/);
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const day = parseInt(parts[2], 10);
      const hour = parseInt(parts[3] || 0, 10);
      const minute = parseInt(parts[4] || 0, 10);
      const second = parseInt(parts[5] || 0, 10);
      const d = new Date(year, month, day, hour, minute, second);
      if (!isNaN(d.getTime())) return d;
    } catch (e) {}
  }
  return new Date(isoString);
};

const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const then = parseSafe(isoString);
  const diffMs = now - then;
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toDateString();
};

const testDates = [
  { label: 'Local (No Z)', iso: '2026-05-12T14:16:44' },
  { label: 'UTC (With Z)', iso: '2026-05-12T14:16:44Z' },
  { label: 'With Offset',  iso: '2026-05-12T14:16:44+05:30' },
];

console.log('--- parseSafe Test ---');
testDates.forEach(t => {
  const d = parseSafe(t.iso);
  console.log(`${t.label.padEnd(15)}: [${t.iso}] -> ${d.toString()}`);
});

console.log('\n--- formatTimeAgo Test ---');
const now = new Date();
const justNow = now.toISOString();
const tenMinAgo = new Date(now.getTime() - 10 * 60000).toISOString();
console.log('Just now:    ', formatTimeAgo(justNow));
console.log('10 min ago:  ', formatTimeAgo(tenMinAgo));
