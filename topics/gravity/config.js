// ─────────────────────────────────────────────
//  TOPIC: GRAVITY
//  Category: Physics
//  Template for all future topics
// ─────────────────────────────────────────────

export default {
  id: 'gravity',
  title: 'Gravity',
  subtitle: "The force that shapes the universe 🌌",
  emoji: '🍎',
  category: 'Physics',

  // Topic accent color (from theme.js topicColors)
  accentKey: 'gravity',

  // ── CURIOSITY HOOK ────────────────────────
  hook: {
    question: "If you drop a feather 🪶 and a cannonball 🎳 from the same height at the same time — which one hits the ground first?",
    reveal: "On Earth, the cannonball wins because air resistance catches the feather! But on the Moon 🌕, where there's perfectly empty vacuum, they hit the ground at the EXACT same time. Apollo 15 astronauts demonstrated this live in 1971! 🤯",
    emoji: '💭',
  },

  // ── THEORY CARDS ──────────────────────────
  // Each card = one scrollable screen with colorful styling
  theory: [
    {
      id: 'what_is',
      title: "What is Gravity? 🌍",
      color: '#6C63FF',
      bgGradient: ['#1A1040', '#0D0D1A'],
      icon: '🌍',
      svgIcon: 'earth',
      content: "Gravity is a fundamental interaction that causes mutual attraction between all things with mass or energy 🌌.\n\nEarth is so massive it pulls you firmly toward its center — that downward force is called your *weight* ⚖️.\n\nBut here's the wild part: Newton's Third Law states forces occur in equal and opposite pairs. This means you're pulling Earth toward YOU with the exact same magnitude of force! 🌍 It's just that Earth is 6×10²⁴ kg, so its acceleration toward you is practically zero.",
      highlight: "Every object in the universe pulls every other object toward itself with an equal and opposite force. 🧲",
    },
    {
      id: 'newton',
      title: "Newton's Big Idea 🍎",
      color: '#00E5A0',
      bgGradient: ['#0A2620', '#0D0D1A'],
      icon: '🍎',
      svgIcon: 'atom',
      content: "In 1687, Isaac Newton published the Law of Universal Gravitation 📜.\n\nF = G × (m₁ × m₂) / r²\n\nTranslation: The gravitational force depends directly on the product of two masses, and inversely on the *square* of the distance between their centers 📏.\n\nDouble the distance → Force drops to ¼ (25%) 📉\nTriple the distance → Force drops to ⅑ (11%)!",
      highlight: "Distance matters HUGELY — move twice as far away and gravity gets 4× weaker! 📏",
      formula: 'F = G × (m₁ × m₂) / r²',
    },
    {
      id: 'freefall',
      title: "Free Fall & Acceleration ⏱️",
      color: '#FF9F1C',
      bgGradient: ['#201000', '#0D0D1A'],
      icon: '🎯',
      svgIcon: 'target',
      content: "On Earth's surface, gravity accelerates freely falling objects at roughly 9.8 m/s² ⏱️.\n\nIgnoring air resistance, your speed increases by 9.8 m/s every passing second:\n• After 1s: 9.8 m/s (~35 km/h)\n• After 2s: 19.6 m/s (~70 km/h)\n• After 3s: 29.4 m/s (~105 km/h) 🏎️💨\n\nBecause of Jupiter's immense mass, its surface gravity is ~24.8 m/s². You would feel almost 2.5× heavier there! 🪐",
      highlight: "g = 9.8 m/s² — Earth's constant gravitational acceleration. A marble and a car fall at the exact same rate in a vacuum! 🌠",
    },
    {
      id: 'orbits',
      title: "Why Do Planets Orbit? 🛰️",
      color: '#FF6B9D',
      bgGradient: ['#200A14', '#0D0D1A'],
      icon: '🌌',
      svgIcon: 'planet',
      content: "Here's a mind-bender: the Moon 🌔 is constantly FALLING toward Earth. It just never hits because it has immense perpendicular velocity (sideways speed) 🚀.\n\nOrbiting = free-falling + moving sideways so fast that the ground curves away from you 🌍.\n\nFire a cannonball slow → it falls. Fire it at 8 km/s → its downward fall exactly matches the curvature of the Earth. It's in perpetual orbit! 🛰️",
      highlight: "An orbit is just falling sideways fast enough to continuously miss the ground. 🔄",
    },
    {
      id: 'einstein',
      title: "Einstein Went Further 🤯",
      color: '#4ECDC4',
      bgGradient: ['#091A1A', '#0D0D1A'],
      icon: '🚀',
      svgIcon: 'rocket',
      content: "Newton's gravity was great, but in 1915 Einstein flipped physics on its head with General Relativity 🤯.\n\nHe revealed gravity isn't really a 'pulling force' — it's the *warping of space and time* itself caused by mass and energy 🌀.\n\nImagine a heavy bowling ball resting on a trampoline. It severely dips the fabric. Roll a marble nearby — it curves toward the heavy ball, not because of an invisible magnet, but because the fabric itself is curved 🌌.",
      highlight: "Mass tells spacetime how to curve, and curved spacetime tells mass how to move. 🕰️",
    },
    {
      id: 'tides',
      title: "Tidal Forces 🌊",
      color: '#3498DB',
      bgGradient: ['#001828', '#0D0D1A'],
      icon: '🌊',
      svgIcon: 'waves',
      content: "Gravity doesn't just pull you; it stretches you! Because the Moon is closer to one side of Earth than the other, it pulls harder on the near-side water than the far-side water.\n\nThis creates a 'bulge' of water on both sides of the planet. As Earth rotates through these bulges, we experience **High Tide** and **Low Tide** 🌊.\n\nThe Sun also helps, but because it's so much further away, its tidal force is only about 44% as strong as the Moon's.",
      highlight: "The oceans are literally being stretched by the Moon's gravitational hands. 🌙",
    },
    {
      id: 'escape_velocity',
      title: "Escape Velocity 🚀",
      color: '#E74C3C',
      bgGradient: ['#2C0B0E', '#0D0D1A'],
      icon: '🚀',
      svgIcon: 'target',
      content: "To leave a planet and never come back, you must reach **Escape Velocity**. This is the speed where your kinetic energy matches the planet's gravitational potential energy.\n\nOn Earth, that speed is a staggering **11.2 km/s** (~40,320 km/h) 🏎️💨.\n\nOn the Moon, it's only 2.4 km/s. On Jupiter, it's 59.5 km/s! If you don't hit this speed, gravity will eventually win and pull you back down.",
      highlight: "11.2 km/s is the magic number to break free from Earth's embrace forever. 🌌",
    },
    {
      id: 'black_holes',
      title: "Black Holes: Gravity's Limit 🕳️",
      color: '#9B59B6',
      bgGradient: ['#1A0B2E', '#0D0D1A'],
      icon: '🕳️',
      svgIcon: 'star',
      content: "What happens if you crush a star into a tiny point? You get a **Black Hole** 🕳️.\n\nGravity becomes so intense that the escape velocity exceeds the speed of light. Since nothing moves faster than light, nothing can escape — not even light itself.\n\nThe 'point of no return' is called the **Event Horizon**. Inside, the laws of physics as we know them break down into a 'Singularity' of infinite density.",
      highlight: "A black hole is a region of space where gravity has won the battle against all other forces. 🌌",
    },
    {
      id: 'grav_waves',
      title: "Gravitational Waves 🔊",
      color: '#00D4A0',
      bgGradient: ['#001A1A', '#0D0D1A'],
      icon: '🔊',
      svgIcon: 'activity',
      content: "Einstein predicted that when massive objects (like black holes) collide, they send 'ripples' through the fabric of spacetime itself 🌊.\n\nThink of it like a drum skin vibrating. These **Gravitational Waves** were finally detected in 2015 by LIGO. They allow us to 'hear' the universe, even when we can't see it with light.\n\nWhen a wave passes through you, you actually get a tiny bit taller and thinner, then shorter and wider! But the change is smaller than the width of an atom.",
      highlight: "Gravity isn't just a curve; it's a vibration that travels at the speed of light. ⚡",
    },
    {
      id: 'dark_matter',
      title: "The Invisible Glue 🌌",
      color: '#FFD166',
      bgGradient: ['#1A1505', '#0D0D1A'],
      icon: '🌌',
      svgIcon: 'sparkle',
      content: "When we look at galaxies, they are spinning much faster than they should. Based on the visible stars, they should fly apart like a broken merry-go-round 🎡.\n\nThere must be some 'Invisible Glue' providing extra gravity. We call this **Dark Matter**.\n\nIt doesn't emit light, heat, or radiation. We can't see it, but we know it's there because we see its massive gravitational pull on everything else. It makes up 85% of all matter in the universe!",
      highlight: "Most of the 'stuff' in the universe is invisible matter we only know through its gravity. 🕵️‍♂️",
    }
  ],

  // ── LAB DESCRIPTION ───────────────────────
  lab: {
    title: "Gravity Lab 🧪",
    description: "Drop objects, change gravity, watch what happens 🌠",
    hint: "Try setting gravity to 0 to simulate deep space 🚀 — then crank it to Jupiter! What happens to the fall time?",
    scientistModeHint: "In Scientist Mode 🧑‍🔬: adjust air resistance, object mass, and see the complex physics math in real time.",
  },

  // ── DO YOU KNOW WHY ───────────────────────
  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why astronauts are 'weightless' on the International Space Station — even though Earth's gravity is still 90% as strong up there? 🧑‍🚀",
      answer: "The ISS and the astronauts are entirely in continuous free-fall around Earth! 🎢 Since they are falling at the exact same rate (28,000 km/h sideways), they experience zero contact forces (no floor pushing up on them). That lack of 'normal force' creates the sensation of pristine weightlessness! 🛰️",
      emoji: '🧑‍🚀',
    },
    {
      id: 'dyk2',
      question: "Do you know why the Moon doesn't crash into Earth, but also doesn't fly away into deep space? 🌔",
      answer: "It's a delicate dance of inertia and gravity ⚖️! The Moon's tremendous sideways velocity (about 3,680 km/h) wants to carry it off in a straight line, but Earth's gravitational curvature continuously bends its path into a near-perfect circle. It's been in this sweet spot for 4.5 billion years! 🔄",
      emoji: '🌙',
    },
    {
      id: 'dyk3',
      question: "Do you know why you weigh slightly LESS at the Equator than at the North Pole? 🌍",
      answer: "Two reasons! 1. Earth's rotation flings you outward slightly (centrifugal force). 2. Earth isn't a perfect sphere; it bulges at the middle, so at the Equator, you are actually 21km further away from Earth's center of mass! ⚖️",
      emoji: '⚖️',
    },
    {
      id: 'dyk4',
      question: "Do you know why time runs slower at sea level than on top of Mount Everest? 🏔️",
      answer: "This is called **Gravitational Time Dilation**. According to Einstein, gravity warps time. The closer you are to a massive object (like Earth's core), the slower time ticks. An atomic clock at sea level will lose about 1 second every 30,000 years compared to one on a mountain! ⏰",
      emoji: '⏰',
    },
    {
      id: 'dyk5',
      question: "Do you know why the Sun's gravity doesn't steal the Moon away from Earth? ☀️",
      answer: "The Sun's pull on the Moon is actually 2x stronger than Earth's pull! However, the Moon is inside Earth's **Hill Sphere** — the region where Earth's gravity dominates the 'relative' motion. Because both Earth and Moon are falling toward the Sun together, the Sun's pull 'cancels out' in their local relationship. 🛸",
      emoji: '☀️',
    },
  ],

  // ── QUIZ ──────────────────────────────────
  quiz: [
    {
      id: 'q1',
      question: "What is the approximate rate of gravitational acceleration on Earth's surface? 🌍",
      options: ['4.9 m/s²', '9.8 m/s²', '14.7 m/s²', '19.6 m/s²'],
      answer: 1,
      explanation: "g = 9.8 m/s² is Earth's gravitational acceleration. Every second in free fall, an object's downward speed increases by 9.8 m/s. 📉",
    },
    {
      id: 'q2',
      question: "If you double the distance between two massive objects, what happens to the gravitational force between them? 📏",
      options: ['It doubles', 'It halves', 'It drops to ¼', 'It drops to ⅛'],
      answer: 2,
      explanation: "Newton's inverse-square law state F ∝ 1/r². If you double the distance, the new force becomes 1/2² = 1/4 of the original force! 🧮",
    },
    {
      id: 'q3',
      question: "A feather and a solid iron hammer are dropped from the same height in a perfect vacuum. Which hits the ground first? 🪶🔨",
      options: ['The hammer', 'The feather', 'They land at the exact same time', 'It depends on their surface area'],
      answer: 2,
      explanation: "In a perfect vacuum (ignoring air resistance), all objects accelerate downward at the exact same rate (g), regardless of their mass. Apollo 15 astronaut David Scott famously proved this on the Moon! 🌕",
    },
    {
      id: 'q4',
      question: "According to Einstein's Theory of General Relativity, what truly IS gravity? 💡",
      options: [
        'A magnetic force transmitted by gravitons',
        'The physical curvature of spacetime caused by mass and energy',
        'A quantum entanglement phenomenon',
        'An illusion created by Earth spinning',
      ],
      answer: 1,
      explanation: "General Relativity describes gravity not as a traditional 'pulling force', but as the curvature of the four-dimensional fabric of spacetime! Massive objects create deep curves that other objects follow. 🌌",
    },
    {
      id: 'q5',
      question: "Why do planets continuously orbit the Sun instead of flying off into deep space? 🪐",
      options: [
        'The Sun generates a powerful magnetic field',
        'Space is a frictionless vacuum',
        "The Sun's gravity continuously pulls them inward while their inertia carries them sideways",
        'Planets are attached to the Sun by dark matter strings',
      ],
      answer: 2,
      explanation: "An orbit represents a perfect balance. The planet's forward momentum wants to carry it in a straight line, but the Sun's immense gravity acts as a centripetal force constantly bending its path into an orbit! 🔄",
    },
    {
      id: 'q6',
      question: "What would happen to your weight on a fictional planet identical in size to Earth, but with twice its mass? ⚖️",
      options: [
        'You would weigh the same',
        'You would weigh twice as much',
        'You would weigh half as much',
        'You would float away',
      ],
      answer: 1,
      explanation: "Because F = G × m₁ × m₂ / r². If you double the planet's mass (m₁), you directly double the gravitational force. Since your weight literally IS the force of gravity, you'd weigh 2× more! 🏋️‍♂️",
    },
    {
      id: 'q7',
      question: "What is an orbital path, when described simply? 🛰️",
      options: [
        'A perfectly circular geometric path',
        'Falling sideways fast enough to continuously miss the planet',
        'Being pulled equally from all possible directions',
        'Completely escaping the gravitational field',
      ],
      answer: 1,
      explanation: "Newton's canonical mountain thought experiment: fire a cannonball fast enough horizontally, and the Earth curves away beneath it exactly as fast as the cannonball falls. That continuous 'missing' is an orbit! 🌍",
    },
    {
      id: 'q8',
      question: "Why do astronauts on the International Space Station (ISS) experience absolute weightlessness? 🧑‍🚀",
      options: [
        "They are too far from Earth for gravity to reach them",
        "The ISS hull shields them from gravitational waves",
        "They are in a state of continuous free-fall around Earth",
        "Space is a vacuum with no mass to create gravity",
      ],
      answer: 2,
      explanation: "Gravity at ISS altitude (400km) is still ~90% of its surface strength! Weightlessness occurs because both the ISS and the astronauts are in uninterrupted free-fall together, meaning there's no contact force pushing them up. 🎢",
    },
    {
      id: 'q9',
      question: "The exact gravitational force between any two objects primarily depends on: 🧲",
      options: [
        'Their absolute densities and velocities',
        'Their masses and the precise distance between them',
        'Only their sheer masses',
        'Only the distance between their centers',
      ],
      answer: 1,
      explanation: "The equation F = G × (m₁ × m₂) / r² shows that both mass AND distance are critical. Increasing the mass increases the pull, while increasing the distance drastically decreases it! 📏",
    },
    {
      id: 'q10',
      question: "On which of these celestial bodies would a 70kg human feel the HEAVIEST? 🪐",
      options: ['Mars (g = 3.7 m/s²)', 'Earth Moon (g = 1.6 m/s²)', 'Jupiter (g = 24.8 m/s²)', 'Venus (g = 8.9 m/s²)'],
      answer: 2,
      explanation: "Jupiter's colossal size and density create an enormous gravitational pull of 24.8 m/s² (over 2.5× Earth's). Our 70kg human would feel like they 'weighed' approximately 175kg! 🤯",
    },
    {
      id: 'q11',
      question: "What is the 'Escape Velocity' required to leave Earth's gravity forever? 🚀",
      options: ['1.2 km/s', '5.5 km/s', '11.2 km/s', '29.8 km/s'],
      answer: 2,
      explanation: "To break free from Earth's gravitational pull without further propulsion, you must hit 11.2 km/s (~40,000 km/h). 🏎️",
    },
    {
      id: 'q12',
      question: "What is the main cause of ocean tides on Earth? 🌊",
      options: ["Earth's magnetic field", "The Moon's gravitational pull stretching the oceans", "Undersea earthquakes", "The wind"],
      answer: 1,
      explanation: "The Moon's gravity pulls harder on the side of Earth facing it, creating a tidal bulge. We pass through these bulges twice a day. 🌙",
    },
    {
      id: 'q13',
      question: "What is the 'Event Horizon' of a Black Hole? 🕳️",
      options: ['The very center of the hole', 'The point of no return where escape velocity exceeds light speed', 'The bright ring of gas around it', 'The exit to another universe'],
      answer: 1,
      explanation: "Once you cross the Event Horizon, not even light is fast enough to escape the gravitational pull. 💡",
    },
    {
      id: 'q14',
      question: "According to Einstein, how does gravity affect the passage of time? ⏰",
      options: ['It has no effect', 'Stronger gravity makes time run faster', 'Stronger gravity makes time run slower', 'Gravity stops time entirely'],
      answer: 2,
      explanation: "Gravitational Time Dilation means clocks tick slower in stronger gravitational fields. Time literally moves slower on Earth than in deep space. 🛰️",
    },
    {
      id: 'q15',
      question: "What are Gravitational Waves? 🔊",
      options: ['Sound waves in space', 'Ripples in the fabric of spacetime caused by massive collisions', 'Ocean waves caused by gravity', 'Light waves from the Sun'],
      answer: 1,
      explanation: "Gravitational waves are ripples in spacetime that travel at the speed of light, caused by violent cosmic events like merging black holes. 🌊",
    },
    {
      id: 'q16',
      question: "At what speed does the force of gravity travel? ⚡",
      options: ['Instantaneously', 'The speed of sound', 'The speed of light', 'It depends on the mass'],
      answer: 2,
      explanation: "If the Sun vanished, Earth would continue orbiting for 8 minutes (the time it takes for gravity ripples to reach us at the speed of light). ☀️",
    },
    {
      id: 'q17',
      question: "Why do we believe 'Dark Matter' exists? 🌌",
      options: ['We can see it with telescopes', 'Galaxies spin much faster than their visible mass allows', 'It makes the sky dark at night', 'It causes black holes'],
      answer: 1,
      explanation: "Visible matter isn't enough to hold galaxies together. Dark Matter provides the extra 'invisible' gravity needed to stop them from flying apart. 🕵️‍♂️",
    },
    {
      id: 'q18',
      question: "Where would you weigh the MOST on Earth? 🌍",
      options: ['At the Equator', 'On top of Mt. Everest', 'At the North or South Pole', 'In an airplane'],
      answer: 2,
      explanation: "At the poles, you are closer to the center of Earth (no bulge) and there is no centrifugal force pushing you out. You weigh about 0.5% more! ⚖️",
    },
    {
      id: 'q19',
      question: "What would happen to your MASS if you went to the Moon? 🌑",
      options: ['It would decrease by 1/6th', 'It would stay exactly the same', 'It would increase', 'It would disappear'],
      answer: 1,
      explanation: "Mass is the amount of 'stuff' you are made of, which never changes. Only your WEIGHT (the pull of gravity) changes! 🧠",
    },
    {
      id: 'q20',
      question: "Who mathematically proved that gravity is the curvature of spacetime? 📖",
      options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'],
      answer: 1,
      explanation: "Einstein's General Relativity (1915) replaced Newton's 'pulling force' with the idea of curved spacetime. 🚀",
    }
  ],

  // ── RELATED TOPICS (suggested after completion) ──
  relatedTopics: ['momentum', 'solar_system', 'relativity', 'black_holes'],
};
