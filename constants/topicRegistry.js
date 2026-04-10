// ─────────────────────────────────────────────
//  TOPIC REGISTRY
//  To add a new topic: create /topics/<id>/config.js + LabSimulation.jsx
//  then add one entry here. That's it.
// ─────────────────────────────────────────────

export const TOPIC_REGISTRY = [
  // ── PHYSICS ──────────────────────────────
  { id: 'gravity',        category: 'Physics',   emoji: '🍎', title: 'Gravity',             status: 'ready'  },
  { id: 'light',          category: 'Physics',   emoji: '💡', title: 'Light & Optics',      status: 'coming' },
  { id: 'sound',          category: 'Physics',   emoji: '🔊', title: 'Sound Waves',         status: 'coming' },
  { id: 'electricity',    category: 'Physics',   emoji: '⚡', title: 'Electricity',         status: 'coming' },
  { id: 'magnetism',      category: 'Physics',   emoji: '🧲', title: 'Magnetism',           status: 'coming' },
  { id: 'thermodynamics', category: 'Physics',   emoji: '🔥', title: 'Thermodynamics',      status: 'coming' },
  { id: 'momentum',       category: 'Physics',   emoji: '🎱', title: 'Momentum',            status: 'coming' },
  { id: 'waves',          category: 'Physics',   emoji: '🌊', title: 'Waves',               status: 'coming' },
  { id: 'pressure',       category: 'Physics',   emoji: '🌀', title: 'Pressure',            status: 'coming' },
  { id: 'relativity',     category: 'Physics',   emoji: '🚀', title: 'Relativity',          status: 'coming' },

  // ── CHEMISTRY ────────────────────────────
  { id: 'atoms',          category: 'Chemistry', emoji: '⚛️', title: 'Atoms & Elements',   status: 'coming' },
  { id: 'bonding',        category: 'Chemistry', emoji: '🔗', title: 'Chemical Bonding',    status: 'coming' },
  { id: 'reactions',      category: 'Chemistry', emoji: '🧪', title: 'Chemical Reactions',  status: 'coming' },
  { id: 'acids_bases',    category: 'Chemistry', emoji: '🧫', title: 'Acids & Bases',       status: 'coming' },
  { id: 'periodic',       category: 'Chemistry', emoji: '📊', title: 'Periodic Table',      status: 'coming' },
  { id: 'solutions',      category: 'Chemistry', emoji: '💧', title: 'Solutions',           status: 'coming' },
  { id: 'oxidation',      category: 'Chemistry', emoji: '🦀', title: 'Oxidation',           status: 'coming' },
  { id: 'organics',       category: 'Chemistry', emoji: '🌿', title: 'Organic Chemistry',   status: 'coming' },
  { id: 'electrochemistry', category: 'Chemistry', emoji: '🔋', title: 'Electrochemistry', status: 'coming' },
  { id: 'stoichiometry',  category: 'Chemistry', emoji: '⚖️', title: 'Stoichiometry',      status: 'coming' },

  // ── BIOLOGY ──────────────────────────────
  { id: 'cells',          category: 'Biology',   emoji: '🔬', title: 'Cell Biology',        status: 'coming' },
  { id: 'dna',            category: 'Biology',   emoji: '🧬', title: 'DNA & Genetics',      status: 'coming' },
  { id: 'evolution',      category: 'Biology',   emoji: '🦕', title: 'Evolution',           status: 'coming' },
  { id: 'photosynthesis', category: 'Biology',   emoji: '🌱', title: 'Photosynthesis',      status: 'coming' },
  { id: 'ecosystems',     category: 'Biology',   emoji: '🌍', title: 'Ecosystems',          status: 'coming' },
  { id: 'nervous_system', category: 'Biology',   emoji: '🧠', title: 'Nervous System',      status: 'coming' },
  { id: 'heart',          category: 'Biology',   emoji: '❤️', title: 'Cardiovascular',      status: 'coming' },
  { id: 'digestion',      category: 'Biology',   emoji: '🍽️', title: 'Digestion',          status: 'coming' },
  { id: 'immunity',       category: 'Biology',   emoji: '🛡️', title: 'Immune System',       status: 'coming' },
  { id: 'respiration',    category: 'Biology',   emoji: '💨', title: 'Respiration',         status: 'coming' },

  // ── EARTH & SPACE ─────────────────────────
  { id: 'solar_system',   category: 'Space',     emoji: '🌌', title: 'Solar System',        status: 'coming' },
  { id: 'black_holes',    category: 'Space',     emoji: '🕳️', title: 'Black Holes',         status: 'coming' },
  { id: 'stars',          category: 'Space',     emoji: '⭐', title: 'Stars & Life Cycles', status: 'coming' },
  { id: 'plate_tectonics',category: 'Earth',     emoji: '🌋', title: 'Plate Tectonics',     status: 'coming' },
  { id: 'atmosphere',     category: 'Earth',     emoji: '🌤️', title: 'Atmosphere',          status: 'coming' },
  { id: 'climate',        category: 'Earth',     emoji: '🌡️', title: 'Climate Science',     status: 'coming' },
  { id: 'rocks',          category: 'Earth',     emoji: '🪨', title: 'Rocks & Minerals',    status: 'coming' },
  { id: 'water_cycle',    category: 'Earth',     emoji: '💧', title: 'Water Cycle',         status: 'coming' },
  { id: 'big_bang',       category: 'Space',     emoji: '💥', title: 'The Big Bang',        status: 'coming' },
  { id: 'tides',          category: 'Space',     emoji: '🌊', title: 'Tides',               status: 'coming' },

  // ── MATHS / LOGIC ────────────────────────
  { id: 'probability',    category: 'Maths',     emoji: '🎲', title: 'Probability',         status: 'coming' },
  { id: 'geometry',       category: 'Maths',     emoji: '📐', title: 'Geometry',            status: 'coming' },
  { id: 'fractions',      category: 'Maths',     emoji: '½',  title: 'Fractions',           status: 'coming' },
  { id: 'graphs',         category: 'Maths',     emoji: '📈', title: 'Graphs',              status: 'coming' },
  { id: 'statistics',     category: 'Maths',     emoji: '📊', title: 'Statistics',          status: 'coming' },
  { id: 'vectors',        category: 'Maths',     emoji: '➡️', title: 'Vectors',             status: 'coming' },

  // ── TECH / CS ─────────────────────────────
  { id: 'binary',         category: 'Tech',      emoji: '0️⃣', title: 'Binary & Code',      status: 'coming' },
  { id: 'internet',       category: 'Tech',      emoji: '🌐', title: 'How Internet Works',  status: 'coming' },
  { id: 'ai_basics',      category: 'Tech',      emoji: '🤖', title: 'AI Basics',           status: 'coming' },
  { id: 'circuits',       category: 'Tech',      emoji: '💾', title: 'Digital Circuits',    status: 'coming' },
];

export const CATEGORIES = [...new Set(TOPIC_REGISTRY.map(t => t.category))];

export const getTopicById = (id) => TOPIC_REGISTRY.find(t => t.id === id);
export const getTopicsByCategory = (cat) => TOPIC_REGISTRY.filter(t => t.category === cat);
export const getReadyTopics = () => TOPIC_REGISTRY.filter(t => t.status === 'ready');
