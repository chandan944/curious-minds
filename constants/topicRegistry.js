// ─────────────────────────────────────────────────────────────────
//  TOPIC REGISTRY - 60 MOST IMPORTANT & DEMANDING TOPICS
//  Priority order: High-demand skills + Foundational knowledge
//  Status: 'ready' = launch ready, 'coming' = roadmap
// ─────────────────────────────────────────────────────────────────

export const TOPIC_REGISTRY = [
  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 1: FOUNDATIONS (Must-know for EVERYTHING else) - 12 topics
  // ═══════════════════════════════════════════════════════════════
   { id: 'gravity',               category: 'Foundations', emoji: '🍎', title: 'Gravity & Gravitation',           priority: 1, status: 'ready' },
  { id: 'scientific_method',     category: 'Foundations', emoji: '🔬', title: 'Scientific Method',                priority: 1, status: 'coming' },
  { id: 'measurement_units',     category: 'Foundations', emoji: '📏', title: 'Measurement & SI Units',           priority: 1, status: 'coming' },
  { id: 'matter_states',         category: 'Foundations', emoji: '🧊', title: 'States of Matter',                 priority: 1, status: 'coming' },
  { id: 'atoms_molecules',       category: 'Foundations', emoji: '⚛️', title: 'Atoms & Molecules',                priority: 1, status: 'coming' },
  { id: 'periodic_table',        category: 'Foundations', emoji: '📊', title: 'Periodic Table Basics',           priority: 1, status: 'coming' },
  { id: 'energy_types',          category: 'Foundations', emoji: '⚡', title: 'Energy Types & Conservation',      priority: 1, status: 'coming' },
  { id: 'forces_motion',         category: 'Foundations', emoji: '🏃', title: 'Forces & Motion',                  priority: 1, status: 'coming' },
  { id: 'work_power',            category: 'Foundations', emoji: '💪', title: 'Work, Power & Energy',            priority: 1, status: 'coming' },
  { id: 'heat_temperature',      category: 'Foundations', emoji: '🌡️', title: 'Heat & Temperature',              priority: 1, status: 'coming' },
  { id: 'waves_sound',           category: 'Foundations', emoji: '🔊', title: 'Waves & Sound',                   priority: 1, status: 'coming' },
  { id: 'light_optics',          category: 'Foundations', emoji: '💡', title: 'Light & Optics',                  priority: 1, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 2: PHYSICS (High demand - Engineering & Tech) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'electricity_circuits',  category: 'Physics',    emoji: '⚡', title: 'Electricity & Circuits',           priority: 2, status: 'coming' },
  { id: 'magnetism',             category: 'Physics',    emoji: '🧲', title: 'Magnetism & Electromagnetism',     priority: 2, status: 'coming' },
  { id: 'thermodynamics_laws',   category: 'Physics',    emoji: '🔥', title: 'Thermodynamics (Laws of Heat)',    priority: 2, status: 'coming' },
  { id: 'momentum_collisions',   category: 'Physics',    emoji: '🎱', title: 'Momentum & Collisions',            priority: 2, status: 'coming' },
  { id: 'pressure_fluids',       category: 'Physics',    emoji: '🌀', title: 'Pressure & Fluid Mechanics',      priority: 2, status: 'coming' },
  { id: 'relativity_basics',     category: 'Physics',    emoji: '🚀', title: 'Einstein\'s Relativity (Intro)',   priority: 3, status: 'coming' },
  { id: 'quantum_basics',        category: 'Physics',    emoji: '🌀', title: 'Quantum Mechanics (Intro)',        priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 3: CHEMISTRY (High demand - Medicine & Materials) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'chemical_bonding',      category: 'Chemistry',  emoji: '🔗', title: 'Chemical Bonding (Ionic/Covalent)', priority: 2, status: 'coming' },
  { id: 'chemical_reactions',    category: 'Chemistry',  emoji: '🧪', title: 'Chemical Reactions & Equations',   priority: 2, status: 'coming' },
  { id: 'acids_bases_ph',        category: 'Chemistry',  emoji: '🧫', title: 'Acids, Bases & pH Scale',         priority: 2, status: 'coming' },
  { id: 'periodic_trends',       category: 'Chemistry',  emoji: '📈', title: 'Periodic Trends (Reactivity etc.)', priority: 2, status: 'coming' },
  { id: 'stoichiometry',         category: 'Chemistry',  emoji: '⚖️', title: 'Stoichiometry (Mole Math)',       priority: 2, status: 'coming' },
  { id: 'organic_chemistry',     category: 'Chemistry',  emoji: '🌿', title: 'Organic Chemistry (Carbon Compds)', priority: 3, status: 'coming' },
  { id: 'electrochemistry',      category: 'Chemistry',  emoji: '🔋', title: 'Electrochemistry (Batteries)',     priority: 3, status: 'coming' },
  { id: 'solutions_concentration', category: 'Chemistry', emoji: '💧', title: 'Solutions & Concentration',      priority: 2, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 4: BIOLOGY (High demand - Health & Life Sciences) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'cell_structure',        category: 'Biology',    emoji: '🔬', title: 'Cell Structure & Function',       priority: 2, status: 'coming' },
  { id: 'dna_genetics',          category: 'Biology',    emoji: '🧬', title: 'DNA, Genes & Genetics',           priority: 2, status: 'coming' },
  { id: 'evolution_natural',     category: 'Biology',    emoji: '🦕', title: 'Evolution & Natural Selection',   priority: 2, status: 'coming' },
  { id: 'human_body_systems',    category: 'Biology',    emoji: '🧍', title: 'Human Body Systems Overview',     priority: 2, status: 'coming' },
  { id: 'nervous_system_brain',  category: 'Biology',    emoji: '🧠', title: 'Nervous System & Brain',          priority: 2, status: 'coming' },
  { id: 'immune_system',         category: 'Biology',    emoji: '🛡️', title: 'Immune System & Vaccines',        priority: 2, status: 'coming' },
  { id: 'photosynthesis',        category: 'Biology',    emoji: '🌱', title: 'Photosynthesis & Plants',         priority: 2, status: 'coming' },
  { id: 'ecosystems',            category: 'Biology',    emoji: '🌍', title: 'Ecosystems & Food Chains',        priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 5: PSYCHOLOGY (High demand - Self improvement & UX) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'brain_structure',       category: 'Psychology', emoji: '🧠', title: 'Brain Anatomy & Functions',       priority: 2, status: 'coming' },
  { id: 'memory_how_it_works',   category: 'Psychology', emoji: '📚', title: 'How Memory Works (Learning Hack)', priority: 2, status: 'coming' },
  { id: 'cognitive_biases',      category: 'Psychology', emoji: '🎯', title: 'Cognitive Biases (Think Better)',  priority: 2, status: 'coming' },
  { id: 'emotions_motivation',   category: 'Psychology', emoji: '❤️', title: 'Emotions & Motivation',           priority: 2, status: 'coming' },
  { id: 'learning_behavior',     category: 'Psychology', emoji: '🎓', title: 'Learning & Behaviorism',          priority: 3, status: 'coming' },
  { id: 'mental_health_basics',  category: 'Psychology', emoji: '🌱', title: 'Mental Health Basics (Anxiety/Depression)', priority: 2, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 6: HISTORY (High demand - Understanding today's world) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'ancient_civilizations', category: 'History',   emoji: '🏛️', title: 'Ancient Civilizations (Egypt, Indus, Rome)', priority: 3, status: 'coming' },
  { id: 'industrial_revolution', category: 'History',   emoji: '🏭', title: 'Industrial Revolution (How World Changed)', priority: 2, status: 'coming' },
  { id: 'world_wars',            category: 'History',   emoji: '💣', title: 'World Wars (WW1 & WW2)',           priority: 2, status: 'coming' },
  { id: 'colonization',          category: 'History',   emoji: '🌏', title: 'Colonization & Independence',      priority: 2, status: 'coming' },
  { id: 'cold_war',              category: 'History',   emoji: '❄️', title: 'Cold War (US vs USSR)',            priority: 3, status: 'coming' },
  { id: 'indian_freedom',        category: 'History',   emoji: '🇮🇳', title: 'Indian Freedom Struggle (Gandhi, Nehru)', priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 7: SPACE & FUTURE (High demand - Curiosity & Careers) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'solar_system',          category: 'Space',     emoji: '🌌', title: 'Solar System (Planets & Moons)',   priority: 2, status: 'coming' },
  { id: 'stars_lifecycle',       category: 'Space',     emoji: '⭐', title: 'Stars & Their Life Cycles',        priority: 2, status: 'coming' },
  { id: 'black_holes',           category: 'Space',     emoji: '🕳️', title: 'Black Holes (Mind-Blowing)',       priority: 2, status: 'coming' },
  { id: 'big_bang',              category: 'Space',     emoji: '💥', title: 'Big Bang Theory (Origin of Universe)', priority: 2, status: 'coming' },
  { id: 'space_exploration',     category: 'Space',     emoji: '🚀', title: 'Space Exploration (NASA, ISRO, SpaceX)', priority: 2, status: 'coming' },
  { id: 'exoplanets',            category: 'Space',     emoji: '🪐', title: 'Exoplanets & Alien Life Search',  priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 8: TECH & AI (HIGHEST DEMAND - Careers & Future) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'binary_computers',      category: 'Technology', emoji: '0️⃣', title: 'Binary & How Computers Work',    priority: 2, status: 'coming' },
  { id: 'internet_how_it_works', category: 'Technology', emoji: '🌐', title: 'How the Internet Works',          priority: 2, status: 'coming' },
  { id: 'ai_machine_learning',   category: 'Technology', emoji: '🤖', title: 'AI & Machine Learning (Intro)',   priority: 2, status: 'coming' },
  { id: 'digital_circuits',      category: 'Technology', emoji: '💾', title: 'Digital Circuits & Logic Gates',  priority: 3, status: 'coming' },
  { id: 'cryptography',          category: 'Technology', emoji: '🔐', title: 'Cryptography (Passwords & Security)', priority: 2, status: 'coming' },
  { id: 'data_science',          category: 'Technology', emoji: '📊', title: 'Data Science & Statistics Basics', priority: 2, status: 'coming' },
];

// ═══════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════
export const CATEGORIES = [...new Set(TOPIC_REGISTRY.map(t => t.category))];

export const getTopicById = (id) => TOPIC_REGISTRY.find(t => t.id === id);
export const getTopicsByCategory = (cat) => TOPIC_REGISTRY.filter(t => t.category === cat);
export const getTopicsByPriority = (priority) => TOPIC_REGISTRY.filter(t => t.priority === priority);
export const getReadyTopics = () => TOPIC_REGISTRY.filter(t => t.status === 'ready');

// Priority 1 = Absolute must-know (Launch these FIRST)
// Priority 2 = High demand (Launch in Phase 2)
// Priority 3 = Advanced/Niche (Launch in Phase 3)