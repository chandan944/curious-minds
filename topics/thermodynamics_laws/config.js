export default {
  id: "thermodynamics_laws",
  title: "Thermodynamics",
  subtitle: "The rules of heat, chaos, and absolute zero 🔥",
  emoji: "🔥",
  category: "Physics",
  accentKey: "physics",

  hook: {
    question: "Why is it physically impossible to build a 'Perpetual Motion Machine' that runs forever? ⚙️",
    reveal: "The reality of the 2nd Law of Thermodynamics! Every time energy is used, a portion of it escapes as 'waste' heat. You cannot break even! The universe always 'taxes' energy transfers, guaranteeing that everything eventually moves toward a state of total equilibrium and chaos. 🛑",
    emoji: "🔥",
  },

  theory: [
    {
      id: "td_0",
      title: "The Zeroth Law: Thermal Balance ⚖️",
      color: "#00E5FF",
      bgGradient: ["#001A20", "#050D0A"],
      icon: "⚖️",
      svgIcon: "thermometer",
      content: "The Zeroth Law states that if two systems are each in thermal equilibrium with a third system, they are in thermal equilibrium with each other. \n\nThis simple principle is the foundation of temperature measurement. It's why we can use a thermometer to compare the heat of two different objects! 🌡️",
      highlight: "Thermal Equilibrium dictates that heat moves until temperatures exactly match! 🌡️",
    },
    {
      id: "td_1",
      title: "The 1st Law: Conservation ♻️",
      color: "#FFD166",
      bgGradient: ["#2A2A00", "#050D0A"],
      icon: "♻️",
      svgIcon: "zap",
      content: "Energy can neither be created nor destroyed, only transformed. This is the First Law. ♻️\n\nWhen you eat food, your body converts chemical energy into kinetic energy (movement) and thermal energy (body heat). The total energy in a closed system always remains constant. You are powered by re-purposed energy from the Big Bang!",
      highlight: "Energy is the ultimate universal currency — it only changes form! 🌟",
    },
    {
      id: "td_2",
      title: "The 2nd Law: Entropy & Chaos 🌪️",
      color: "#FF3131",
      bgGradient: ["#200A1A", "#050D0A"],
      icon: "🌪️",
      svgIcon: "alert-triangle",
      content: "The Second Law states that the total entropy of an isolated system can never decrease over time. \n\n**Entropy** is a measure of disorder. This law is why heat always flows from hot to cold, and why it's impossible to perfectly convert heat back into work without wasting some energy. It gives time its 'arrow'! 🍳",
      highlight: "The universe naturally trends toward disorder and chaos! 🌪️",
    },
    {
      id: "td_3",
      title: "The 3rd Law: Absolute Zero 🧊",
      color: "#3B82F6",
      bgGradient: ["#0A1220", "#050D0A"],
      icon: "🧊",
      svgIcon: "snowflake",
      content: "As a system approaches absolute zero (0 Kelvin or -273.15°C), its entropy reaches a minimum constant value. \n\nAt this limit, all atomic motion almost entirely ceases. While we can get incredibly close to absolute zero (within billionths of a degree), the law dictates we can never actually reach it! 🚫",
      highlight: "Absolute zero is the theoretical limit of total stillness! 🧊",
    },
    {
      id: "td_4",
      title: "Conduction: Atomic Collisions 🔥",
      color: "#FF9F1C",
      bgGradient: ["#201000", "#050D0A"],
      icon: "🔥",
      svgIcon: "activity",
      content: "Heat is the kinetic energy of vibrating atoms. In **Conduction**, this energy is transferred through direct contact. \n\nWhen you touch a hot handle, the fast-moving atoms in the metal collide with the atoms in your hand, passing the energy along. Metals are great conductors because they have free electrons that help zip heat through the material! 🥄",
      highlight: "Direct contact allows atoms to 'hand off' thermal energy! ⚡",
    },
    {
      id: "td_5",
      title: "Convection: Fluid Cycles 🌊",
      color: "#39FF14",
      bgGradient: ["#0A200A", "#050D0A"],
      icon: "🌊",
      svgIcon: "wind",
      content: "Convection is heat transfer through the movement of fluids (liquids or gases). \n\nAs a fluid heats up, it expands and becomes less dense, causing it to rise. Cooler, denser fluid then sinks to take its place. This creates a continuous cycle called a **Convection Current**, which drives everything from boiling water to global weather patterns! 🌪️",
      highlight: "Hot fluid rises and cold fluid sinks in a never-ending loop! 🔄",
    },
    {
      id: "td_6",
      title: "Radiation: Light Energy ☢️",
      color: "#A855F7",
      bgGradient: ["#1A0A1F", "#050D0A"],
      icon: "☢️",
      svgIcon: "sun",
      content: "Thermal Radiation is heat transfer via electromagnetic waves (like infrared light). \n\nUnlike conduction or convection, radiation doesn't need a medium to travel through. This is how the Sun's energy reaches Earth through the vacuum of space. Every object, including you, is constantly radiating infrared energy! 📸",
      highlight: "Heat can travel through the void of space as light! ☀️",
    },
    {
      id: "td_7",
      title: "Specific Heat: Thermal Storage 💧",
      color: "#00E5FF",
      bgGradient: ["#001A20", "#050D0A"],
      icon: "💧",
      svgIcon: "droplet",
      content: "Specific Heat Capacity is the amount of heat energy required to raise the temperature of a substance. \n\nWater has an exceptionally high specific heat, meaning it can absorb a lot of energy without a large change in temperature. This property allows the oceans to act as a massive thermal battery, regulating Earth's climate! 🌍",
      highlight: "Different materials 'hold' heat differently! 🔋",
    },
    {
      id: "td_8",
      title: "Heat Engines: Making Work 🚂",
      color: "#FF4D6D",
      bgGradient: ["#2A0A1A", "#050D0A"],
      icon: "🚂",
      svgIcon: "cpu",
      content: "A Heat Engine converts thermal energy into mechanical work ($W$). \n\nBy taking energy from a 'hot reservoir' and allowing it to flow to a 'cold reservoir,' we can capture part of that energy to push a piston or spin a turbine. No engine can be 100% efficient because some heat must always be rejected to the cold side! 🏎️",
      highlight: "Engines harness the natural flow of heat from hot to cold! ⚙️",
    },
    {
      id: "td_9",
      title: "The Heat Death of the Universe 💀",
      color: "#6C5CE7",
      bgGradient: ["#100A20", "#050D0A"],
      icon: "💀",
      svgIcon: "blackhole",
      content: "The Second Law suggests a final fate for our universe: The Heat Death. \n\nAs entropy increases, energy will eventually be spread so evenly that no more work can be performed. The stars will go out, and the universe will reach a state of maximum disorder and uniform temperature. At this point, time essentially loses its meaning. ⏳",
      highlight: "The ultimate state of cosmic equilibrium. 🌌",
    },
  ],

  lab: {
    title: "The Adiabatic Engine 🔥",
    description: "Welcome to the Thermodynamic Chamber. Manipulate pistons, adjust heat reservoirs, and observe the relationship between Pressure ($P$), Volume ($V$), and Temperature ($T$!).",
    hint: "Compress the gas quickly to observe an 'Adiabatic' temperature spike without adding external heat!",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Displays real-time $P$-$V$ diagrams and calculates the Work done ($W$) per cycle.",
  },

  doYouKnowWhy: [
    {
      id: "dyk1",
      question: "Do you know why rubbing your hands makes them hot? 👏",
      answer: "Friction! The microscopic irregularities on your skin catch and pull on each other, converting the kinetic energy of your movement into heat energy! 🔥",
      emoji: "🔥",
    },
    {
      id: "dyk2",
      question: "Do you know why we sweat? 💦",
      answer: "Evaporative Cooling! Water requires a significant amount of heat energy to turn into a gas. When sweat evaporates from your skin, it takes your body's excess thermal energy with it, cooling you down! 🧊",
      emoji: "🥶",
    },
    {
      id: "dyk3",
      question: "Do you know why a blanket warms you up? 🛌",
      answer: "Blankets don't 'create' heat. They act as insulators, trapping the thermal radiation and convection of air coming off your own body. YOU are the heater; the blanket is the cage for your heat! 🩸",
      emoji: "🔥",
    },
    {
      id: "dyk4",
      question: "Do you know why ice floats on water? 🧊",
      answer: "Density anomaly! When water freezes, its molecules form a crystal lattice that actually takes up more space than in the liquid form. This makes ice less dense than water, allowing it to float! 🌊",
      emoji: "⚖️",
    },
    {
      id: "dyk5",
      question: "Do you know why you can't cool a room by opening the fridge? ❄️",
      answer: "A refrigerator is a heat pump. It removes heat from the inside and releases it through the coils on the back. If you open the door, the heat it removes simply cycles back into the room, along with extra heat generated by the fridge's motor! 🛑",
      emoji: "🚫",
    },
  ],

  quiz: [
    {
      id: "q1",
      question: "The 1st Law of Thermodynamics states that energy...",
      options: [
        "Is always disappearing",
        "Can never be created or destroyed",
        "Is an illusion",
        "Only exists as heat"
      ],
      answer: 1,
      explanation: "Total energy in any closed system remains constant — the Law of Conservation of Energy! ⚛️",
    },
    {
      id: "q2",
      question: "What is 'Entropy' in thermodynamics?",
      options: [
        "Pure, raw energy",
        "A measure of disorder and chaos",
        "A type of magnetic pull",
        "The total mass"
      ],
      answer: 1,
      explanation: "Entropy represents the unavailability of a system's thermal energy for conversion into mechanical work! 🌪️",
    },
    {
      id: "q3",
      question: "What happens at Absolute Zero (0 Kelvin)?",
      options: [
        "Atoms move at light speed",
        "Almost all atomic motion stops",
        "Ice boils spontaneously",
        "An object's mass doubles"
      ],
      answer: 1,
      explanation: "At absolute zero, the system reaches its minimum possible energy and stillness! 🧊",
    },
    {
      id: "q4",
      question: "Touching a hot stove is an example of heat transfer via...",
      options: [
        "Convection",
        "Radiation",
        "Conduction",
        "Induction"
      ],
      answer: 2,
      explanation: "Conduction is the direct transfer of energy through molecular collisions! 🔥",
    },
    {
      id: "q5",
      question: "How does the Sun heat the Earth across the vacuum of space?",
      options: [
        "Conduction",
        "Convection",
        "Thermal Radiation",
        "Magnetic Waves"
      ],
      answer: 2,
      explanation: "Energy travels through space as electromagnetic waves (primarily infrared light)! ☀️",
    },
    {
      id: "q6",
      question: "In convection, why does hot fluid rise?",
      options: [
        "It becomes less dense when heated",
        "It becomes magnetic",
        "Gravity forgets about it",
        "It wants to reach the sun"
      ],
      answer: 0,
      explanation: "Heated molecules spread out, making the fluid lighter than its cooler surroundings! 🌊",
    },
    {
      id: "q7",
      question: "What is the 'Zeroth' Law primarily about?",
      options: [
        "Total Energy",
        "Thermal Equilibrium",
        "Maximum Chaos",
        "Zero Gravity"
      ],
      answer: 1,
      explanation: "It defines the concept of temperature balance between systems! ⚖️",
    },
    {
      id: "q8",
      question: "Why are house heaters usually placed near the floor?",
      options: [
        "To save wall space",
        "Hot air naturally rises via convection",
        "To stay away from the ceiling",
        "For easier repair"
      ],
      answer: 1,
      explanation: "Heating air at the bottom causes it to rise and circulate through the whole room! 🌬️",
    },
    {
      id: "q9",
      question: "The theoretical final state of the universe is often called...",
      options: [
        "The Big Rip",
        "The Heat Death",
        "The Big Crunch",
        "Absolute Vacuum"
      ],
      answer: 1,
      explanation: "Maximum entropy would mean energy is too spread out to support life or movement! 💀",
    },
    {
      id: "q10",
      question: "What does 'Specific Heat Capacity' measure?",
      options: [
        "The weight of an object",
        "Resistance to temperature change",
        "An object's melting speed",
        "Its overall brightness"
      ],
      answer: 1,
      explanation: "It's the energy needed to raise the temperature of 1kg of a substance by 1 degree! 💧",
    },
    {
      id: "q11",
      question: "Why do bridges have metal expansion joints?",
      options: [
        "To hold them together",
        "To allow for thermal expansion",
        "To prevent gravity leaks",
        "To look modern"
      ],
      answer: 1,
      explanation: "Materials physically expand as their atoms vibrate more intensely in the heat! 🏗️",
    },
    {
      id: "q12",
      question: "Why can't a heat engine be 100% efficient?",
      options: [
        "Friction is too high",
        "Heat must be lost to cold reservoir",
        "Fuels aren't pure enough",
        "Computers aren't fast enough"
      ],
      answer: 1,
      explanation: "The 2nd Law requires a temperature difference to perform work, resulting in waste heat! 💸",
    },
    {
      id: "q13",
      question: "What is a 'Heat Sink' designed to do?",
      options: [
        "To generate heat",
        "To block light",
        "Absorb and dissipate unwanted heat",
        "To store oxygen"
      ],
      answer: 2,
      explanation: "Heat sinks protect devices by moving thermal energy away from sensitive components! 💻",
    },
    {
      id: "q14",
      question: "Which scale is the 'absolute' temperature scale in science?",
      options: [
        "Celsius",
        "Fahrenheit",
        "Kelvin",
        "Rankine"
      ],
      answer: 2,
      explanation: "The Kelvin scale is built directly on the laws of thermodynamics! 📏",
    },
    {
      id: "q15",
      question: "Heat will naturally flow in which direction?",
      options: [
        "Cold to Hot",
        "Hot to Cold",
        "Always Upward",
        "Always Downward"
      ],
      answer: 1,
      explanation: "Energy naturally moves to occupy less-energized areas until balance is reached! 🚪",
    },
    {
      id: "q16",
      question: "An 'Adiabatic' process occurs when...",
      options: [
        "The system is frozen",
        "No heat exchanged with surroundings",
        "The system is a vacuum",
        "A catalyst is added"
      ],
      answer: 1,
      explanation: "In an adiabatic change, energy stays entirely within the substance being manipulated! 🛡️",
    },
    {
      id: "q17",
      question: "How do oceans help regulate planetary temperature?",
      options: [
        "They reflect all light",
        "High specific heat stores massive energy",
        "They generate cold air",
        "They have high salt content"
      ],
      answer: 1,
      explanation: "The oceans absorb solar energy during the day and release it slowly at night! 🌍",
    },
    {
      id: "q18",
      question: "What does a Heat Engine primarily convert thermal energy into?",
      options: [
        "Electricity",
        "Mechanical Work",
        "Visual Light",
        "Nuclear Fusion"
      ],
      answer: 1,
      explanation: "It uses the expansion of hot gases to provide motion and force! ⚙️",
    },
    {
      id: "q19",
      question: "Why are some rooftops painted white or silver?",
      options: [
        "To be more visible",
        "To reflect thermal radiation and stay cool",
        "To prevent birds from landing",
        "To increase weight"
      ],
      answer: 1,
      explanation: "Light colors reflect more solar energy, reducing the 'Heat Island' effect! 🪞",
    },
    {
      id: "q20",
      question: "Compressing a gas inside a piston quickly will usually...",
      options: [
        "Decrease its temperature",
        "Increase its temperature",
        "Have no thermal effect",
        "Turn it into a metal"
      ],
      answer: 1,
      explanation: "Doing work on the gas adds internal energy, making its atoms vibrate faster! 💨",
    },
  ],

  relatedTopics: ["atoms_molecules", "energy_types", "physics_basics"],
};
