// ─────────────────────────────────────────────────────────
//  TOPIC: PHYSICS MASTER LAB (Unified Engineering)
//  Category: Physics
//  Standard: v2.0 Extreme (Unified Lab Suite)
// ─────────────────────────────────────────────────────────

export default {
  id: 'physics_multi_lab',
  title: 'Physics Master Lab',
  subtitle: 'The ultimate sanctuary for laws of the universe 🌌⚙️',
  emoji: '⚛️',
  category: 'Physics',
  accentKey: 'physics',

  hook: {
    question: "Is there a single set of rules that governs everything from the hum of a bee's wing to the explosion of a star? 🔊💥",
    reveal: "Yes! Beneath the chaos of the world lie the elegant mathematical laws of Physics. Whether it's light bending through a prism, heat driving an engine, or a ball thrown in zero-g, everything follows predictable patterns. Welcome to the Master Lab, where you control the core variables of reality itself! 🛠️🔬",
    emoji: '🧪',
  },

  theory: [
    {
      id: 'unified_physics',
      title: 'The Unified Language 🔢',
      color: '#00D4FF',
      bgGradient: ['#001A20', '#050D0A'],
      icon: '🔢',
      svgIcon: 'activity',
      content: "Physics isn't a collection of random facts; it's a unified language of math. Energy isn't created or destroyed—it just changes hats! \n\nIn this Master Lab, we explore 5 pillars of the physical world: \n1. **Optics** (Light behavior)\n2. **Acoustics** (Sound & Waves)\n3. **Thermodynamics** (Heat & Energy)\n4. **Mechanics** (Work & Power)\n5. **Dynamics** (Gravity & Motion).",
      highlight: "Change one variable, and the whole universe reacts. 🌎",
    },
    {
      id: 'the_critical_angle',
      title: 'Optics: The Critical Angle 🌈',
      color: '#FFD166',
      bgGradient: ['#1A1505', '#050D0A'],
      icon: '🌈',
      svgIcon: 'search',
      content: "When light travels from glass to air, it usually bends (refraction). But at a specific angle—the **Critical Angle** (about 42°)—the light stops escaping and reflects back perfectly inside the glass! \n\nThis is called **Total Internal Reflection**. It's the reason diamonds sparkle so intensely and how fiber-optic cables carry high-speed internet across the ocean! 💎🌐",
      highlight: "Light can be trapped inside a transparent material simply by its angle. 📐",
    },
    {
      id: 'resonance_power',
      title: 'Acoustics: Resonance 🔊',
      color: '#4ECDC4',
      bgGradient: ['#0A1A1A', '#050D0A'],
      icon: '🔊',
      svgIcon: 'waves',
      content: "Every object has a 'Natural Frequency' it likes to vibrate at. If you hit it with energy at that exact frequency, you cause **Resonance**. \n\nThe amplitude of the vibration explodes. This is how opera singers break wine glasses, and how a small wind can collapse a giant bridge if it hits the resonance frequency! 🌉🎻",
      highlight: "Timing is everything. Small forces at the right frequency create massive power. ⚡",
    }
  ],

  lab: {
    title: "The Multiverse Viewport 🔭",
    description: "Welcome to the Unified Physics Engine. You have control over 5 distinct experimental zones. Use the Dials to adjust the Prism Angle and Chamber Heat. Use the Switch-Bank to toggle Gravity, Friction, and Air Resistance. \n\nYour Goal: Discover all 5 'Physical Breakthroughs' hidden in the instruments! 🏆🔍",
    hint: "Try hitting exactly 440Hz for Resonance, or 42° for Total Internal Reflection. Scientist Mode reveals the hidden math!",
  },

  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why fiber optic cables are better than copper wires? 🌐",
      answer: "Total Internal Reflection! Light pulses travel inside the glass core with almost zero loss of signal, allowing data to travel at near the speed of light for thousands of miles. Copper signals slow down due to electrical resistance! ⚡",
      emoji: '💎',
    },
    {
      id: 'dyk2',
      question: "Do you know why we use 'Concert A' at 440 Hz to tune orchestras? 🎻",
      answer: "Standardization! Before 1939, different countries tuned to different frequencies. By standardizing at 440Hz, every instrument on Earth can finally play in perfect resonance with each other! 🎼",
      emoji: '🎵',
    }
  ],

  quiz: [
    { id: 'q1', question: "What happens to light above the 'Critical Angle' in a glass prism?", options: ['It disappears', 'Total Internal Reflection', 'It slows down', 'It changes color'], answer: 1, explanation: "Above the critical angle, light is trapped inside the material! 🌈" },
    { id: 'q2', question: "The phenomenon where energy builds up because input frequency matches natural frequency is:", options: ['Interference', 'Resonance', 'Diffraction', 'Silence'], answer: 1, explanation: "Resonance causes systems to vibrate with explosive amplitude! 🔊" },
    { id: 'q3', question: "In Physics, Work (W) is calculated as:", options: ['Force / Time', 'Force x Distance', 'Mass x Gravity', 'Heat x Speed'], answer: 1, explanation: "Work is energy transferred by a force acting over a distance. ⚙️" }
  ],

  relatedTopics: ['light_optics', 'waves_sound', 'thermodynamics_laws', 'forces_motion'],
};
