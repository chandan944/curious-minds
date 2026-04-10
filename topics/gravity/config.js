// ─────────────────────────────────────────────
//  TOPIC: GRAVITY
//  Category: Physics
//  Template for all future topics
// ─────────────────────────────────────────────

export default {
  id: 'gravity',
  title: 'Gravity',
  subtitle: "The force that shapes the universe",
  emoji: '🍎',
  category: 'Physics',

  // Topic accent color (from theme.js topicColors)
  accentKey: 'gravity',

  // ── CURIOSITY HOOK ────────────────────────
  hook: {
    question: "If you drop a feather and a cannonball from the same height at the same time — which one hits the ground first?",
    reveal: "On Earth, the feather — because of air resistance. But on the Moon, where there's NO air, they hit at the EXACT same time. Every time. Galileo proved this 400 years ago and it still blows minds.",
    emoji: '💭',
  },

  // ── THEORY CARDS ──────────────────────────
  // Each card = one scrollable screen with colorful styling
  theory: [
    {
      id: 'what_is',
      title: "What is Gravity?",
      color: '#6C63FF',
      bgGradient: ['#1A1040', '#0D0D1A'],
      icon: '🌍',
      content: `Gravity is the invisible force that pulls every object with mass toward every other object with mass.\n\nThe more massive an object, the stronger its pull. Earth is so massive it pulls you firmly to the ground — that pull is what we call your *weight*.\n\nBut here's the wild part: you're also pulling Earth toward YOU. Right now. Earth is just so much more massive that you can't notice its movement.`,
      highlight: "Every object in the universe pulls every other object toward itself.",
    },
    {
      id: 'newton',
      title: "Newton's Big Idea",
      color: '#00E5A0',
      bgGradient: ['#0A2620', '#0D0D1A'],
      icon: '🍎',
      content: `In 1687, Isaac Newton published the Law of Universal Gravitation.\n\nHis formula was elegant:\n\nF = G × (m₁ × m₂) / r²\n\nTranslation: The gravitational force between two objects depends on their masses multiplied together, divided by the square of the distance between them.\n\nDouble the distance → Force drops to ¼\nTriple the distance → Force drops to ⅑`,
      highlight: "Distance matters HUGELY — move twice as far away and gravity gets 4× weaker.",
      formula: 'F = G × (m₁ × m₂) / r²',
    },
    {
      id: 'freefall',
      title: "Free Fall & Acceleration",
      color: '#FF9F1C',
      bgGradient: ['#201000', '#0D0D1A'],
      icon: '🎯',
      content: `On Earth's surface, gravity accelerates ALL objects at the same rate: 9.8 m/s² (meters per second, per second).\n\nThis means every second you fall, you go 9.8 m/s faster:\n• After 1s: 9.8 m/s\n• After 2s: 19.6 m/s\n• After 3s: 29.4 m/s\n\nThis constant is called "g". On Mars, g = 3.7 m/s². On Jupiter, g = 24.8 m/s² — you'd feel almost 2.5× heavier!`,
      highlight: "g = 9.8 m/s² — Earth's gravitational acceleration. Same for a marble and a car.",
    },
    {
      id: 'orbits',
      title: "Why Do Planets Orbit?",
      color: '#FF6B9D',
      bgGradient: ['#200A14', '#0D0D1A'],
      icon: '🌌',
      content: `Here's a mind-bender: the Moon is constantly FALLING toward Earth. It just never hits because it's also moving sideways fast enough that Earth curves away beneath it.\n\nOrbiting = falling + missing the planet continuously.\n\nNewton imagined firing a cannonball from a very tall mountain. Fire it slow → it falls. Fire it faster → it travels further. Fire it fast enough → it falls around the curve of Earth forever. That's an orbit.`,
      highlight: "An orbit is just falling sideways fast enough to keep missing the ground.",
    },
    {
      id: 'einstein',
      title: "Einstein Went Further",
      color: '#4ECDC4',
      bgGradient: ['#091A1A', '#0D0D1A'],
      icon: '🚀',
      content: `Newton's gravity was great, but Einstein's General Relativity (1915) revealed something deeper:\n\nGravity isn't really a force — it's the *curvature of space and time* caused by mass.\n\nImagine a bowling ball on a rubber sheet. It dips the sheet. Roll a marble nearby — it curves toward the bowling ball, not because of a force, but because the sheet is curved.\n\nMass warps spacetime itself. That curvature IS gravity.`,
      highlight: "Mass bends spacetime. Gravity is the curvature — not a force being 'shot' at you.",
    },
  ],

  // ── LAB DESCRIPTION ───────────────────────
  lab: {
    title: "Gravity Lab",
    description: "Drop objects, change gravity, watch what happens",
    hint: "Try setting gravity to 0 to simulate space — then crank it to Jupiter! What happens to the fall time?",
    scientistModeHint: "In Scientist Mode: adjust air resistance, object mass, and see the math in real time.",
  },

  // ── DO YOU KNOW WHY ───────────────────────
  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why astronauts are 'weightless' on the International Space Station — even though Earth's gravity is still very strong up there?",
      answer: "The ISS is in free fall around Earth! It's moving sideways so fast (28,000 km/h) that it keeps 'missing' the ground. The astronauts inside are also falling at the same rate, so they feel no normal force — that floating feeling IS falling. Gravity up there is still about 90% of what it is on the surface.",
      emoji: '🧑‍🚀',
    },
    {
      id: 'dyk2',
      question: "Do you know why the Moon doesn't crash into Earth, but also doesn't fly away?",
      answer: "It's a perfect balance! The Moon's sideways speed exactly matches the rate at which Earth's gravity curves space beneath it. It's been in this sweet spot for 4.5 billion years. If the Moon slowed down slightly, it'd spiral inward. If it sped up, it'd escape. Right now: it's just right.",
      emoji: '🌙',
    },
  ],

  // ── QUIZ ──────────────────────────────────
  quiz: [
    {
      id: 'q1',
      question: "What is the approximate gravitational acceleration on Earth's surface?",
      options: ['4.9 m/s²', '9.8 m/s²', '14.7 m/s²', '19.6 m/s²'],
      answer: 1,
      explanation: "g = 9.8 m/s² is Earth's gravitational acceleration. Every second in free fall, your speed increases by 9.8 m/s.",
    },
    {
      id: 'q2',
      question: "If you double the distance between two objects, what happens to the gravitational force?",
      options: ['It doubles', 'It halves', 'It drops to ¼', 'It drops to ⅛'],
      answer: 2,
      explanation: "Newton's inverse-square law: F ∝ 1/r². Double the distance → force becomes 1/2² = 1/4 of original.",
    },
    {
      id: 'q3',
      question: "A feather and a hammer are dropped from the same height in a vacuum. Which lands first?",
      options: ['The hammer', 'The feather', 'They land at the same time', 'Depends on their size'],
      answer: 2,
      explanation: "In vacuum (no air resistance), all objects fall with the same acceleration g = 9.8 m/s², regardless of mass. Apollo 15 astronaut David Scott demonstrated this on the Moon!",
    },
    {
      id: 'q4',
      question: "According to Einstein, what IS gravity?",
      options: [
        'A force transmitted by gravitons',
        'The curvature of spacetime caused by mass',
        'Magnetic attraction between masses',
        'A repulsion force at large scales',
      ],
      answer: 1,
      explanation: "General Relativity describes gravity as the curvature of spacetime. Massive objects bend the fabric of spacetime, and other objects follow those curves.",
    },
    {
      id: 'q5',
      question: "Why do planets orbit the Sun instead of flying off into space?",
      options: [
        'The Sun generates a magnetic field',
        'Space is too cold to escape',
        "The Sun's gravity continuously pulls them inward while they move sideways",
        'Planets are attached by dark matter strings',
      ],
      answer: 2,
      explanation: "An orbit is a balance between forward velocity and gravitational pull. The planet constantly 'falls' toward the Sun but its sideways speed keeps it from ever hitting it.",
    },
    {
      id: 'q6',
      question: "What would happen to your weight on a planet with twice Earth's mass but the same size?",
      options: [
        'You would weigh the same',
        'You would weigh twice as much',
        'You would weigh half as much',
        'You would float',
      ],
      answer: 1,
      explanation: "F = G × m₁ × m₂ / r². Double the planet's mass (m₁) → double the force. Since weight = gravitational force, you'd weigh 2× more.",
    },
    {
      id: 'q7',
      question: "What is an orbit, simply described?",
      options: [
        'A perfectly circular path',
        'Falling sideways fast enough to keep missing the planet',
        'Being pulled equally from all directions',
        'Escaping gravity completely',
      ],
      answer: 1,
      explanation: "Newton's mountain thought experiment: fire a cannonball fast enough horizontally and Earth curves away beneath it as fast as it falls. That continuous 'missing' is an orbit.",
    },
    {
      id: 'q8',
      question: "Why do astronauts on the ISS experience weightlessness?",
      options: [
        "They're too far from Earth for gravity to reach",
        "The ISS shields them from gravity",
        "They're in continuous free fall around Earth",
        "Space has no mass to create gravity",
      ],
      answer: 2,
      explanation: "Gravity at ISS altitude (400km) is still ~90% of surface strength. But both the ISS and astronauts are in free fall together — so there's no normal force pushing on them. That's weightlessness.",
    },
    {
      id: 'q9',
      question: "Gravitational force between two objects depends on:",
      options: [
        'Their colors and temperatures',
        'Their masses and the distance between them',
        'Only their masses',
        'Only the distance between them',
      ],
      answer: 1,
      explanation: "F = G × (m₁ × m₂) / r². Both masses AND distance matter. More mass = more force. More distance = less force (inverse square law).",
    },
    {
      id: 'q10',
      question: "On which celestial body would you feel HEAVIEST?",
      options: ['Mars (g = 3.7)', 'Moon (g = 1.6)', 'Jupiter (g = 24.8)', 'Venus (g = 8.9)'],
      answer: 2,
      explanation: "Jupiter's gravitational acceleration is 24.8 m/s² — over 2.5× Earth's. A 70kg person would 'weigh' about 175kg there! Its massive size and density create enormous gravity.",
    },
  ],

  // ── RELATED TOPICS (suggested after completion) ──
  relatedTopics: ['momentum', 'solar_system', 'relativity', 'black_holes'],
};
