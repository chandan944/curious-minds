// ─────────────────────────────────────────────────────────────────
//  TOPIC REGISTRY - 60 MOST IMPORTANT & DEMANDING TOPICS
//  Priority order: High-demand skills + Foundational knowledge
//  Status: 'ready' = launch ready, 'coming' = roadmap
// ─────────────────────────────────────────────────────────────────

export const TOPIC_REGISTRY = [
  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 1: FOUNDATIONS (Must-know for EVERYTHING else) - 12 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'gravity',               icon: 'planet',      category: 'Foundations', title: 'Gravity & Gravitation',           priority: 1, status: 'ready'  },
  { id: 'scientific_method',     icon: 'microscope',  category: 'Foundations', title: 'Scientific Method',               priority: 1, status: 'ready'  },
  { id: 'measurement_units',     icon: 'ruler',       category: 'Foundations', title: 'Measurement & SI Units',          priority: 1, status: 'ready'  },
  { id: 'matter_states',         icon: 'snowflake',   category: 'Foundations', title: 'States of Matter',                priority: 1, status: 'ready'  },
  { id: 'atoms_molecules',       icon: 'atom',        category: 'Foundations', title: 'Atoms & Molecules',               priority: 1, status: 'ready' },
  { id: 'periodic_table',        icon: 'grid',        category: 'Foundations', title: 'Periodic Table Basics',           priority: 1, status: 'ready'  },
  { id: 'energy_types',          icon: 'zap',         category: 'Foundations', title: 'Energy Types & Conservation',     priority: 1, status: 'ready'  },
  { id: 'forces_motion',         icon: 'target',      category: 'Foundations', title: 'Forces & Motion',                 priority: 1, status: 'ready' },
  { id: 'work_power',            icon: 'lightning',   category: 'Foundations', title: 'Work, Power & Energy',            priority: 1, status: 'ready' },
  { id: 'heat_temperature',      icon: 'thermometer', category: 'Foundations', title: 'Heat & Temperature',              priority: 1, status: 'ready' },
  { id: 'waves_sound',           icon: 'waves',       category: 'Foundations', title: 'Waves & Sound',                   priority: 1, status: 'ready' },
  { id: 'light_optics',          icon: 'lightbulb',   category: 'Foundations', title: 'Light & Optics',                  priority: 1, status: 'ready' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 2: PHYSICS (High demand - Engineering & Tech) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'electricity_circuits',  icon: 'lightning',   category: 'Physics',     title: 'Electricity & Circuits',          priority: 2, status: 'ready' },
  { id: 'magnetism',             icon: 'magnet',      category: 'Physics',     title: 'Magnetism & Electromagnetism',    priority: 2, status: 'coming' },
  { id: 'thermodynamics_laws',   icon: 'fire',        category: 'Physics',     title: 'Thermodynamics (Laws of Heat)',   priority: 2, status: 'coming' },
  { id: 'momentum_collisions',   icon: 'target',      category: 'Physics',     title: 'Momentum & Collisions',           priority: 2, status: 'coming' },
  { id: 'pressure_fluids',       icon: 'pressure',    category: 'Physics',     title: 'Pressure & Fluid Mechanics',      priority: 2, status: 'coming' },
  { id: 'relativity_basics',     icon: 'rocket',      category: 'Physics',     title: "Einstein's Relativity (Intro)",   priority: 3, status: 'coming' },
  { id: 'quantum_basics',        icon: 'atom',        category: 'Physics',     title: 'Quantum Mechanics (Intro)',        priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 3: CHEMISTRY (High demand - Medicine & Materials) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'chemical_bonding',      icon: 'link',        category: 'Chemistry',   title: 'Chemical Bonding (Ionic/Covalent)', priority: 2, status: 'ready' },
  { id: 'chemical_reactions',    icon: 'flask',       category: 'Chemistry',   title: 'Chemical Reactions & Equations',  priority: 2, status: 'coming' },
  { id: 'acids_bases_ph',        icon: 'beaker',      category: 'Chemistry',   title: 'Acids, Bases & pH Scale',         priority: 2, status: 'coming' },
  { id: 'periodic_trends',       icon: 'chart',       category: 'Chemistry',   title: 'Periodic Trends (Reactivity etc.)', priority: 2, status: 'coming' },
  { id: 'stoichiometry',         icon: 'balance',     category: 'Chemistry',   title: 'Stoichiometry (Mole Math)',        priority: 2, status: 'coming' },
  { id: 'organic_chemistry',     icon: 'molecule',    category: 'Chemistry',   title: 'Organic Chemistry (Carbon Compds)', priority: 3, status: 'coming' },
  { id: 'electrochemistry',      icon: 'battery',     category: 'Chemistry',   title: 'Electrochemistry (Batteries)',     priority: 3, status: 'coming' },
  { id: 'solutions_concentration', icon: 'water',     category: 'Chemistry',   title: 'Solutions & Concentration',        priority: 2, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 4: BIOLOGY (High demand - Health & Life Sciences) - 8 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'cell_structure',        icon: 'microscope',  category: 'Biology',     title: 'Cell Structure & Function',        priority: 2, status: 'ready'  },
  { id: 'dna_genetics',          icon: 'hash',        category: 'Biology',     title: 'DNA & Genetics (The Code of Life)',priority: 3, status: 'ready' },
  { id: 'evolution_natural',     icon: 'dna',         category: 'Biology',     title: 'Evolution & Natural Selection',    priority: 2, status: 'ready' },
  { id: 'human_body_systems',    icon: 'person',      category: 'Biology',     title: 'Human Body Systems Overview',      priority: 2, status: 'ready'  },
  { id: 'nervous_system_brain',  icon: 'brain',       category: 'Biology',     title: 'Nervous System & Brain',           priority: 2, status: 'coming' },
  { id: 'immune_system',         icon: 'shield',      category: 'Biology',     title: 'Immune System & Vaccines',         priority: 2, status: 'ready'  },
  { id: 'photosynthesis',        icon: 'leaf',        category: 'Biology',     title: 'Photosynthesis & Plants',          priority: 2, status: 'ready' },
  { id: 'ecosystems',            icon: 'earth',       category: 'Biology',     title: 'Ecosystems & Food Chains',         priority: 3, status: 'ready'  },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 5: PSYCHOLOGY (High demand - Self improvement & UX) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'brain_structure',       icon: 'brain',       category: 'Psychology',  title: 'Brain Anatomy & Functions',        priority: 2, status: 'ready' },
  { id: 'memory_how_it_works',   icon: 'book',        category: 'Psychology',  title: 'How Memory Works (Learning Hack)', priority: 2, status: 'coming' },
  { id: 'cognitive_biases',      icon: 'target',      category: 'Psychology',  title: 'Cognitive Biases (Think Better)', priority: 2, status: 'coming' },
  { id: 'emotions_motivation',   icon: 'heart',       category: 'Psychology',  title: 'Emotions & Motivation',            priority: 2, status: 'coming' },
  { id: 'learning_behavior',     icon: 'sparkle',     category: 'Psychology',  title: 'Learning & Behaviorism',           priority: 3, status: 'coming' },
  { id: 'mental_health_basics',  icon: 'leaf',        category: 'Psychology',  title: 'Mental Health Basics (Anxiety/Depression)', priority: 2, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 6: HISTORY (High demand - Understanding today's world) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'ancient_civilizations', icon: 'history',     category: 'History',     title: 'Ancient Civilizations (Egypt, Indus, Rome)', priority: 3, status: 'ready' },
  { id: 'industrial_revolution', icon: 'factory',     category: 'History',     title: 'Industrial Revolution (How World Changed)', priority: 2, status: 'ready' },
  { id: 'world_wars',            icon: 'bomb',        category: 'History',     title: 'World Wars (WW1 & WW2)',           priority: 2, status: 'ready' },
  { id: 'colonization',          icon: 'globe',       category: 'History',     title: 'Colonization & Independence',      priority: 2, status: 'coming' },
  { id: 'cold_war',              icon: 'snowflake',   category: 'History',     title: 'Cold War (US vs USSR)',            priority: 3, status: 'coming' },
  { id: 'indian_freedom',        icon: 'flag',        category: 'History',     title: 'Indian Freedom Struggle (Gandhi, Nehru)', priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 7: SPACE & FUTURE (High demand - Curiosity & Careers) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'solar_system',          icon: 'planet',      category: 'Space',       title: 'Solar System (Planets & Moons)',  priority: 2, status: 'ready' },
  { id: 'stars_lifecycle',       icon: 'star',        category: 'Space',       title: 'Stars & Their Life Cycles',       priority: 2, status: 'coming' },
  { id: 'black_holes',           icon: 'blackhole',   category: 'Space',       title: 'Black Holes (Mind-Blowing)',       priority: 2, status: 'coming' },
  { id: 'big_bang',              icon: 'galaxy',      category: 'Space',       title: 'Big Bang Theory (Origin of Universe)', priority: 2, status: 'coming' },
  { id: 'space_exploration',     icon: 'rocket',      category: 'Space',       title: 'Space Exploration (NASA, ISRO, SpaceX)', priority: 2, status: 'coming' },
  { id: 'exoplanets',            icon: 'telescope',   category: 'Space',       title: 'Exoplanets & Alien Life Search',  priority: 3, status: 'coming' },

  // ═══════════════════════════════════════════════════════════════
  //  BLOCK 8: TECH & AI (HIGHEST DEMAND - Careers & Future) - 6 topics
  // ═══════════════════════════════════════════════════════════════
  { id: 'binary_computers',      icon: 'binary',      category: 'Technology',  title: 'Binary & How Computers Work',     priority: 2, status: 'ready' },
  { id: 'internet_how_it_works', icon: 'wifi',        category: 'Technology',  title: 'How the Internet Works',          priority: 2, status: 'ready' },
  { id: 'ai_machine_learning',   icon: 'robot',       category: 'Technology',  title: 'AI & Machine Learning (Intro)',   priority: 2, status: 'ready' },
  { id: 'digital_circuits',      icon: 'cpu',         category: 'Technology',  title: 'Digital Circuits & Logic Gates',  priority: 3, status: 'ready' },
  { id: 'cryptography',          icon: 'key',         category: 'Technology',  title: 'Cryptography (Passwords & Security)', priority: 2, status: 'ready' },
  { id: 'data_science',          icon: 'data',        category: 'Technology',  title: 'Data Science & Statistics Basics', priority: 2, status: 'ready' },
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