// ─────────────────────────────────────────────
//  TOPIC: ELECTRICITY & CIRCUITS
//  Category: Physics
// ─────────────────────────────────────────────

export default {
  id: 'electricity_circuits',
  title: 'Electricity & Circuits',
  subtitle: "The invisible force that powers our world ⚡",
  emoji: '⚡',
  category: 'Physics',

  // Topic accent color (from theme.js topicColors)
  accentKey: 'electricity',

  // ── CURIOSITY HOOK ────────────────────────
  hook: {
    question: "If electricity travels at nearly the speed of light ⚡ (~300,000 km/s), why does it take a whole minute to charge your phone even 1%? 🤔📱",
    reveal: "The electromagnetic *signal* travels near light-speed, but actual electrons drift incredibly slowly — about 0.025 cm/s, slower than a snail! 🐌 What speeds along is the *push* (voltage wave), not individual electrons. It's like a tube packed with marbles: push one in and one pops out the other end instantly — even though no single marble moved far. Your phone charges slowly because it needs trillions upon trillions of electrons! 🤯",
    emoji: '💭',
  },

  // ── THEORY CARDS ──────────────────────────
  theory: [
    {
      id: 'what_is',
      title: "What is Electricity? ⚡",
      color: '#FFD166',
      bgGradient: ['#201800', '#0D0D1A'],
      icon: '⚡',
      svgIcon: 'lightning',
      content: "Electricity is the flow of electric charge through a conductor 🔌.\n\nAll matter is made of atoms, and atoms have tiny particles called *electrons* whizzing around their nucleus. In conductors like copper, some electrons are 'free' — they can hop between atoms easily ⚡.\n\nWhen a voltage source (like a battery 🔋) creates an electric field, these free electrons drift through the conductor in an orderly flow. This flow is called *electric current*, measured in Amperes (A) 📏.\n\n1 Ampere = 6.242 × 10¹⁸ electrons flowing past a point every second! That's over 6 quintillion electrons! Despite this enormous number, each electron carries a minuscule charge of just 1.602 × 10⁻¹⁹ coulombs ⚛️.\n\nMaterials divide into *conductors* (copper, silver, gold — electrons move freely), *insulators* (rubber, glass, plastic — electrons are locked in place), and *semiconductors* (silicon — can switch between conducting and insulating) 🔬.",
      highlight: "Electric current is the orderly flow of electrons through a conductor — 1 Ampere = 6.24 × 10¹⁸ electrons per second! ⚡",
    },
    {
      id: 'ohms_law',
      title: "Ohm's Law — The Golden Rule 📐",
      color: '#6C63FF',
      bgGradient: ['#1A1040', '#0D0D1A'],
      icon: '📐',
      svgIcon: 'balance',
      content: "In 1827, German physicist Georg Simon Ohm discovered the fundamental relationship between voltage, current, and resistance 📜.\n\nV = I × R\n\nThis elegant equation, Ohm's Law, connects three quantities:\n• *Voltage (V)* in Volts — the electrical 'push' or pressure 💪\n• *Current (I)* in Amperes — the rate of charge flow 🌊\n• *Resistance (R)* in Ohms (Ω) — opposition to current flow 🚧\n\nThink of it like water in pipes: Voltage = water pressure, Current = flow rate, Resistance = how narrow the pipe is 🔧.\n\nDouble the voltage → double the current 📈\nDouble the resistance → halve the current 📉\n\nOhm's work was initially rejected by the scientific establishment! He struggled financially for years before his law was recognized. The unit Ohm (Ω) was named in his honor in 1881 🏆.",
      highlight: "Ohm's Law: V = IR — Voltage equals Current × Resistance. Double the resistance and the current drops to half! 📐",
      formula: 'V = I × R',
    },
    {
      id: 'circuits',
      title: "Series vs Parallel Circuits 🔗",
      color: '#00E5A0',
      bgGradient: ['#0A2620', '#0D0D1A'],
      icon: '🔗',
      svgIcon: 'link',
      content: "There are two fundamental ways to connect components ⚡:\n\n*Series Circuit* 🔗: Components are daisy-chained in a single loop. The SAME current flows through every component.\n• Total Resistance: R_total = R₁ + R₂ + R₃\n• Voltage SPLITS across each component proportionally\n• If one component breaks, the entire circuit dies (like old Christmas lights! 🎄)\n\n*Parallel Circuit* ⚡: Each component sits on its own branch, connected directly to the power source.\n• Total Resistance: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃\n• Voltage is the SAME across every branch\n• Branches work independently — one can fail without affecting the others 💡\n\nGustav Kirchhoff formalized these rules in 1845 with two laws:\n• *KCL*: Total current entering a junction = total current leaving 🔄\n• *KVL*: Total voltage around any closed loop = zero ⭕",
      highlight: "Series: same current everywhere, voltage splits. Parallel: same voltage everywhere, current splits. This one concept underpins ALL of electronics! 🔌",
    },
    {
      id: 'power',
      title: "Electric Power & Energy 💡",
      color: '#FF9F1C',
      bgGradient: ['#201000', '#0D0D1A'],
      icon: '💡',
      svgIcon: 'zap',
      content: "Electric power measures how fast electrical energy converts to heat, light, motion, or sound 💡.\n\nP = I × V\n\nPower (P) is measured in Watts (W), named after Scottish inventor James Watt ⚙️.\n\nUseful rearrangements:\n• P = I²R (using current and resistance)\n• P = V²/R (using voltage and resistance)\n\nReal-world power levels 🌍:\n• Phone charger: ~5W\n• LED bulb: ~10W (replaces a 60W incandescent!)\n• Laptop: ~65W\n• Microwave oven: ~1,000W (1 kW)\n• Electric car motor: ~150,000W (150 kW) 🚗⚡\n\nYour electricity bill uses kilowatt-hours (kWh): consuming 1,000 watts for 1 hour = 1 kWh. Running a 100W bulb for 10 hours costs about the same as a 2,000W heater for 30 minutes 💰.",
      highlight: "P = IV — a humble 100W bulb at 220V draws just 0.45A, yet converts electrical energy to 3,600,000 joules of light and heat every hour! 💡",
      formula: 'P = I × V',
    },
    {
      id: 'beyond',
      title: "AC, DC & Beyond 🔮",
      color: '#4ECDC4',
      bgGradient: ['#091A1A', '#0D0D1A'],
      icon: '🔮',
      svgIcon: 'cpu',
      content: "The world runs on two types of current ⚡:\n\n*DC (Direct Current)* 🔋: Electrons flow in ONE direction. Used in batteries, electronics, USB devices. Thomas Edison championed DC power.\n\n*AC (Alternating Current)* 🌊: Electrons oscillate back and forth 50–60 times per second. Used in power grids worldwide. Nikola Tesla and George Westinghouse championed AC.\n\nThe infamous 'War of Currents' (1880s) was one of history's fiercest technology battles! AC ultimately won because transformers can step voltage UP for efficient long-distance transmission, then step it DOWN for safe home use 🏠.\n\nCutting-edge frontiers 🔬:\n• *Superconductors*: Certain materials cooled below a critical temperature (mercury at 4.2K / −269°C) achieve ZERO electrical resistance — current flows forever with no energy loss! Discovered by Heike Kamerlingh Onnes in 1911 ❄️.\n• *Semiconductors*: Silicon transistors — the atoms of computing — switch on/off billions of times per second. Modern CPUs pack over 10 billion transistors on a chip smaller than your fingernail! 🖥️",
      highlight: "AC won the 'War of Currents' because transformers let us transmit power over hundreds of kilometers with minimal loss — that's why your wall socket delivers AC! 🔌",
    },
  ],

  // ── LAB DESCRIPTION ───────────────────────
  lab: {
    title: "Circuit Playground ⚡🧪",
    description: "Build circuits by choosing topologies & placing components into slots 🔌",
    hint: "Pick a topology (Series, Parallel, Mixed, Voltage Divider, or Wheatstone Bridge), select a component from the palette, then tap empty slots to build your circuit! ⚡",
    scientistModeHint: "In Scientist Mode 🧑‍🔬: add wire resistance and see real-world power losses — plus KCL, KVL, and bridge balance verification!",
  },

  // ── DO YOU KNOW WHY ───────────────────────
  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why birds can perch on power lines carrying 100,000+ volts without getting electrocuted? 🐦⚡",
      answer: "A bird on a single wire has the same voltage everywhere in its body — no voltage *difference* means zero current flows through it! ⚡ It's like standing atop a waterfall — water flows only when there's a height difference. If a bird simultaneously touched two wires (or a wire and a grounded pole), the massive voltage difference would be lethal. That's why large birds like eagles are at greater risk — their wingspan can bridge the gap! 🦅",
      emoji: '🐦',
    },
    {
      id: 'dyk2',
      question: "Do you know why a 20,000-volt static shock from a door handle is harmless, but 120V from a wall outlet can kill you? ⚡😱",
      answer: "Voltage alone doesn't kill — CURRENT does! ☠️ Static electricity has enormous voltage but essentially zero sustained current (~0.001A for mere microseconds). A wall outlet, however, can push 15–20 amps continuously through your body. It takes only 0.1A (100 milliamps) across the heart to trigger fatal ventricular fibrillation. Ohm's Law governs it: your body's resistance limits static current drastically, but a sustained 120V source overcomes that resistance! 🫀",
      emoji: '⚡',
    },
  ],

  // ── QUIZ ──────────────────────────────────
  quiz: [
    {
      id: 'q1',
      question: "What is the SI unit of electric current? ⚡",
      options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
      answer: 1,
      explanation: "Electric current is measured in Amperes (A). 1 Ampere = 6.24 × 10¹⁸ electrons flowing past a point per second. Named after French physicist André-Marie Ampère. ⚡",
    },
    {
      id: 'q2',
      question: "In Ohm's Law (V = IR), what does R represent? 📐",
      options: ['Reactance', 'Resistance', 'Reluctance', 'Resonance'],
      answer: 1,
      explanation: "R stands for Resistance, measured in Ohms (Ω). It quantifies how strongly a material opposes the flow of electric current. Named after Georg Simon Ohm who discovered the law in 1827. 🔧",
    },
    {
      id: 'q3',
      question: "Which of these materials is the best electrical conductor? 🔌",
      options: ['Wood', 'Rubber', 'Copper', 'Glass'],
      answer: 2,
      explanation: "Copper is an excellent conductor — its free electrons move easily between atoms. That's why almost all electrical wiring in your home is copper! Wood, rubber, and glass are insulators. 🏠",
    },
    {
      id: 'q4',
      question: "A 9V battery is connected to a 30Ω resistor. What current flows through the circuit? 🔋",
      options: ['0.1 A', '0.3 A', '3 A', '270 A'],
      answer: 1,
      explanation: "Using Ohm's Law: I = V/R = 9V ÷ 30Ω = 0.3A. The voltage 'pushes' current through the resistance. Higher resistance would mean less current. 🧮",
    },
    {
      id: 'q5',
      question: "Three 60Ω resistors are connected in SERIES. What is the total resistance? 🔗",
      options: ['20 Ω', '60 Ω', '120 Ω', '180 Ω'],
      answer: 3,
      explanation: "In series, resistances simply add up: R_total = 60 + 60 + 60 = 180Ω. Series connections INCREASE total resistance because current must flow through each resistor sequentially. ➕",
    },
    {
      id: 'q6',
      question: "In a parallel circuit, what happens to the total resistance when you add more branches? ⚡",
      options: ['It increases', 'It decreases', 'It stays exactly the same', 'It doubles'],
      answer: 1,
      explanation: "Adding parallel branches DECREASES total resistance! More paths for current = less overall opposition. That's why 1/R_total = 1/R₁ + 1/R₂ + ... — each new branch provides an additional pathway for electrons. 📉",
    },
    {
      id: 'q7',
      question: "A device draws 2A of current at 12V. What power does it consume? 💡",
      options: ['6 W', '14 W', '24 W', '144 W'],
      answer: 2,
      explanation: "Using P = I × V: P = 2A × 12V = 24W. Power measures how fast electrical energy is being converted — in this case, 24 joules every second! ⚡",
    },
    {
      id: 'q8',
      question: "Two 100Ω resistors connected in PARALLEL have a combined resistance of: 🔌",
      options: ['25 Ω', '50 Ω', '100 Ω', '200 Ω'],
      answer: 1,
      explanation: "For parallel: 1/R_total = 1/100 + 1/100 = 2/100. So R_total = 100/2 = 50Ω. Two identical resistors in parallel always give half the resistance of one! A handy shortcut. 🧮",
    },
    {
      id: 'q9',
      question: "In the 'War of Currents' (1880s), who championed AC power that ultimately won for power grids? ⚡",
      options: ['Thomas Edison', 'Benjamin Franklin', 'Nikola Tesla', 'Georg Ohm'],
      answer: 2,
      explanation: "Nikola Tesla (along with George Westinghouse) championed AC power. AC won because transformers allow voltage to be stepped up for efficient long-distance transmission — something impossible with Edison's DC system. 🏆",
    },
    {
      id: 'q10',
      question: "A superconductor achieves which remarkable property below its critical temperature? ❄️",
      options: ['Infinite resistance', 'Zero resistance', 'Negative resistance', 'Variable resistance'],
      answer: 1,
      explanation: "Below the critical temperature, superconductors have ZERO electrical resistance — current flows indefinitely with no energy loss! Heike Kamerlingh Onnes discovered this in mercury at 4.2K (−269°C) in 1911. ❄️",
    },
  ],

  // ── RELATED TOPICS ──────────────────────────
  relatedTopics: ['magnetism', 'energy_types', 'digital_circuits', 'forces_motion'],
};
