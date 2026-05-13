export default {
  id: "acids_bases_ph",
  title: "Acids & Bases",
  subtitle: "The power of the Protons 🍋",
  emoji: "🍋",
  category: "Chemistry",
  accentKey: "chemistry",

  hook: {
    question: "Why does Lemon juice sting your eyes, but Soap feels slippery on your skin? 🧼",
    reveal: "It's all about the protons! Acids (like Lemon juice) are aggressive proton donors — they have extra $H^{+}$ ions ready to attack. Bases (like Soap) are proton stealers — they have $OH^{-}$ ions that love to grab protons. This battle for hydrogen ions is what makes chemicals caustic, sour, or slippery! 🧪",
    emoji: "🧼",
  },

  theory: [
    {
      id: "ph_0",
      title: "The pH Scale 📏",
      color: "#F59E0B",
      bgGradient: ["#201500", "#050D0A"],
      icon: "📏",
      svgIcon: "target",
      content: "The pH scale ranges from 0 to 14. It measures the concentration of Hydrogen ions ($H^{+}$) in a solution. \n\npH 7 is perfectly neutral (Pure Water). Anything BELOW 7 is an Acid (the lower the number, the stronger it is). Anything ABOVE 7 is a Base (the higher the number, the stronger it is)! ⚖️",
      highlight: "Lower pH = Higher acidity! 🧪",
    },
    {
      id: "ph_1",
      title: "Acids: Proton Donors 🍋",
      color: "#FFD166",
      bgGradient: ["#202000", "#050D0A"],
      icon: "🍋",
      svgIcon: "zap",
      content: "According to the Bronsted-Lowry theory, acids are substances that 'donate' protons ($H^{+}$). 🍋\n\nStrong acids, like HCl in your stomach, dissociate completely in water to release a massive flood of protons. These ions are highly reactive and can dissolve metals by stripping away their electrons! 🛡️",
      highlight: "Acids are ready-to-fire proton cannons! ⚡",
    },
    {
      id: "ph_2",
      title: "Bases: Proton Acceptors 🧼",
      color: "#34D399",
      bgGradient: ["#002015", "#050D0A"],
      icon: "🧼",
      svgIcon: "droplet",
      content: "Bases (Alkalines) are substances that 'accept' protons. They often contain Hydroxide ions ($OH^{-}$). \n\nBases feel slippery because they undergo **Saponification** — they literally react with the fats and oils on your skin and turn them into a thin layer of soap! This is why bleach feels oily on your fingers. 🧴",
      highlight: "Bases are the 'Proton Vacuums' of chemistry! 🧹",
    },
    {
      id: "ph_3",
      title: "Neutralization: The Balance 🤝",
      color: "#10B981",
      bgGradient: ["#0A2010", "#050D0A"],
      icon: "🤝",
      svgIcon: "check",
      content: "What happens if you mix a strong Acid and a strong Base? They cancel each other out! ⚓\n\nThe Acid's $H^{+}$ and the Base's $OH^{-}$ find each other and combine to form $H_2O$ (Pure Water). The left-over ions form a Salt. This is why you take Antacids for heartburn! 🌊",
      highlight: "Acid + Base $\rightarrow$ Water + Salt! 🌊",
    },
    {
      id: "ph_4",
      title: "Logarithmic Scale 📉",
      color: "#3B82F6",
      bgGradient: ["#0A1220", "#050D0A"],
      icon: "📉",
      svgIcon: "activity",
      content: "The pH scale isn't linear — it's logarithmic! The formula is $pH = -\log[H^{+}]$. 📉\n\nThis means a soda with pH 3 is **10 times** more acidic than tomato juice (pH 4), and **100 times** more acidic than black coffee (pH 5). Small shifts in pH mean massive changes in chemistry! 😵",
      highlight: "One pH step = 10x shift in power! 🔢",
    },
    {
      id: "ph_5",
      title: "Indicators: The Rainbow 🌈",
      color: "#A855F7",
      bgGradient: ["#150A20", "#050D0A"],
      icon: "🌈",
      svgIcon: "sun",
      content: "Indicators are molecules that change shape (and color) depending on the proton concentration. 🎨\n\nPhenolphthalein turns bright pink in bases but stays clear in acids. Universal Indicator provides a full spectrum of colors, letting scientists 'see' the exact acidity of a liquid at a glance! 🖌️",
      highlight: "Color is the visual language of protons! 🖌️",
    },
    {
      id: "ph_6",
      title: "Amphoteric Chameleons 🦎",
      color: "#F472B6",
      bgGradient: ["#200A1A", "#050D0A"],
      icon: "🦎",
      svgIcon: "repeat",
      content: "Some substances can act as BOTH an acid and a base. These are called **Amphoteric**. 🦎\n\nWater is the most famous example. It can donate a proton to become $OH^{-}$ or accept one to become $H_3O^{+}$. This dual-nature is why water is the perfect solvent for the complex reactions of life! 🌊",
      highlight: "Water is the ultimate chemical mediator! ⚖️",
    },
    {
      id: "ph_7",
      title: "Buffers: Shock Absorbers 🛡️",
      color: "#6366F1",
      bgGradient: ["#0F0A20", "#050D0A"],
      icon: "🛡️",
      svgIcon: "shield",
      content: "Buffers resist changes in pH by neutralizing small amounts of added acid or base. 🛡️\n\nYour blood is a precisely tuned buffer at pH 7.4. If it shifted by more than 0.5 points, your proteins would lose their shape and you would die instantly. Buffers keep the internal 'ocean' of your body stable. ❤️",
      highlight: "Buffers prevent internal chemical chaos! 🧘",
    },
    {
      id: "ph_8",
      title: "Acid Rain & Pollution ⛈️",
      color: "#888888",
      bgGradient: ["#151515", "#050D0A"],
      icon: "⛈️",
      svgIcon: "cloud",
      content: "When sulfur and nitrogen oxides from factories mix with clouds, they create Sulfuric and Nitric acids. 🌫️\n\nThis 'Acid Rain' erodes limestone statues, kills aquatic life, and leaches toxic metals like Aluminum into the soil. It is a slow-motion attack on both nature and architecture! 🏛️",
      highlight: "Pollution can turn the sky into an acid bath! 🌫️",
    },
    {
      id: "ph_9",
      title: "Titration Precision 🎯",
      color: "#EC4899",
      bgGradient: ["#200A15", "#050D0A"],
      icon: "🎯",
      svgIcon: "layers",
      content: "Titration is a technique used to find the concentration of an unknown solution. 🧪\n\nYou slowly drip a 'Titrant' into the sample until a color change indicates the **Equivalence Point**. One single drop can be the difference between a successful measurement and an 'overshot' failure! 💧",
      highlight: "The ultimate test of lab precision! 🧪",
    },
  ],

  lab: {
    title: "The Titration Station 🌈",
    description: "Welcome to the Precision Analysis Bench. Control the burette, find the equivalence point, and neutralize high-intensity acids and bases!",
    hint: "Drip slowly as you approach pH 7! One single drop can flip the indicator color instantly. 💧",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Displays real-time Logarithmic $[H+]$ mapping and titration curve analytics.",
  },

  doYouKnowWhy: [
    {
      id: "dyk1",
      question: "Do you know why soda can dissolve teeth? 🦷",
      answer: "Soda has a pH around 2.5. This high acidity aggressively reacts with the 'Calcium' in your tooth enamel, literally dissolving the mineral structure into the liquid! 🥤",
      emoji: "🥤",
    },
    {
      id: "dyk2",
      question: "Do you know why bases feel slippery? 🧴",
      answer: "Saponification! The base reacts with the natural fats on your skin, turning them into a tiny layer of soap. You are literally feeling your skin turn into lubricant! 🧼",
      emoji: "🧴",
    },
    {
      id: "dyk3",
      question: "Do you know why we put lime on lawns? 🪴",
      answer: "Lime (Calcium Carbonate) is a base. It neutralizes 'sour' acidic soil, helping plants access nutrients that were locked away by the acid! 🌾",
      emoji: "🚜",
    },
    {
      id: "dyk4",
      question: "Do you know why antacids stop heartburn? 💊",
      answer: "Antacids are weak bases like Calcium Carbonate. They 'soak up' the excess Hydrochloric acid in your stomach, neutralizing it into harmless water and salts! 🧘",
      emoji: "🧬",
    },
    {
      id: "dyk5",
      question: "Do you know what 'Free Radicals' have to do with pH? 🧬",
      answer: "While distinct, an acidic environment in the body can stress cellular structures, making them more vulnerable to oxidative damage from radicals! 🍎",
      emoji: "🧬",
    },
  ],

  quiz: [
    {
      id: "q1",
      question: "What is the pH of pure water?",
      options: [
        "0",
        "7",
        "14",
        "1"
      ],
      answer: 1,
      explanation: "pH 7 is neutral — the perfect balance point between acid and base! 🌊",
    },
    {
      id: "q2",
      question: "Which of these is a strong acid?",
      options: [
        "Soap",
        "Lemon Juice",
        "Drain Cleaner",
        "Sea Water"
      ],
      answer: 1,
      explanation: "Lemon juice contains Citric acid with a potent pH of about 2! 🍋",
    },
    {
      id: "q3",
      question: "Bases typically taste...",
      options: [
        "Sour",
        "Sweet",
        "Bitter",
        "Salty"
      ],
      answer: 2,
      explanation: "Bases like soap or baking soda have a distinctively bitter taste! 🧼",
    },
    {
      id: "q4",
      question: "What is the primary function of an indicator?",
      options: [
        "To neutralize acids",
        "To explode in water",
        "To change color based on pH",
        "To increase reaction speed"
      ],
      answer: 2,
      explanation: "Indicators use color changes to signal the concentration of protons in a liquid! 🌈",
    },
    {
      id: "q5",
      question: "A liquid with a pH of 13 is a...",
      options: [
        "Strong Acid",
        "Strong Base",
        "Neutral Salt",
        "Weak Acid"
      ],
      answer: 1,
      explanation: "Values high on the scale (12-14) are high-intensity alkaline solutions! 🧴",
    },
    {
      id: "q6",
      question: "A solution with pH 4 is how much stronger than pH 5?",
      options: [
        "2 times",
        "10 times",
        "100 times",
        "1,000 times"
      ],
      answer: 1,
      explanation: "The pH scale is logarithmic — every single step is a 10x power jump! 🔢",
    },
    {
      id: "q7",
      question: "What are the products of a neutralization reaction?",
      options: [
        "Oxygen + Hydrogen",
        "Water + Salt",
        "Oil + Sugar",
        "Metal + Gas"
      ],
      answer: 1,
      explanation: "Mixing acid and base cancels both out, creating pure water and a salt! ⚓",
    },
    {
      id: "q8",
      question: "Which ion defines the strength of an ACID?",
      options: [
        "$OH^{-}$",
        "$H^{+}$ (Proton)",
        "$NaCl$",
        "$O_2$"
      ],
      answer: 1,
      explanation: "Acids are proton donors — their strength comes from releasing $H^{+}$ ions! 🧪",
    },
    {
      id: "q9",
      question: "What do we call substances that resist pH changes?",
      options: [
        "Neutralizers",
        "Acidifiers",
        "Buffers",
        "Solvents"
      ],
      answer: 2,
      explanation: "Buffers like the chemicals in your blood prevent lethal pH spikes! 🩸",
    },
    {
      id: "q10",
      question: "Potent acids feel...",
      options: [
        "Slippery",
        "Bitter",
        "Stinging or burning",
        "Gritty"
      ],
      answer: 2,
      explanation: "Strong acids sting because they are aggressively attacking tissue proteins! 🍋",
    },
    {
      id: "q11",
      question: "What is the precise pH of human blood?",
      options: [
        "2.0",
        "7.0 (Neutral)",
        "7.4 (Slightly Basic)",
        "12.0"
      ],
      answer: 2,
      explanation: "Human blood is precisely buffered to be slightly alkaline (7.4)! 🩸",
    },
    {
      id: "q12",
      question: "Which of these is a household BASE?",
      options: [
        "Vinegar",
        "Battery Acid",
        "Baking Soda",
        "Coffee"
      ],
      answer: 2,
      explanation: "Baking soda is Sodium Bicarbonate, a reliable weak base! 🥮",
    },
    {
      id: "q13",
      question: "A pH of 0 would most likely belong to...",
      options: [
        "Pure Water",
        "Battery Acid",
        "Black Coffee",
        "Ammonia"
      ],
      answer: 1,
      explanation: "Zero is the absolute maximum acidic intensity on the standard scale! 🔋",
    },
    {
      id: "q14",
      question: "What is the scientific term for 'Basic'?",
      options: [
        "Corrosive",
        "Reactive",
        "Alkaline",
        "Metallic"
      ],
      answer: 2,
      explanation: "Alkaline refers to any substance with a pH higher than 7! 🧴",
    },
    {
      id: "q15",
      question: "Saponification is the process of making...",
      options: [
        "Rust",
        "Soap",
        "Gas",
        "Acid"
      ],
      answer: 1,
      explanation: "When a base reacts with organic fats, it chemically creates soap! 🧼",
    },
    {
      id: "q16",
      question: "In a base, red litmus paper will turn...",
      options: [
        "Red",
        "Yellow",
        "Blue",
        "Clear"
      ],
      answer: 2,
      explanation: "Base = Blue! Litmus changes color to signal the alkalinity! 🌈",
    },
    {
      id: "q17",
      question: "What is the typical pH range of stomach acid?",
      options: [
        "1.5 to 3.5",
        "7.0",
        "8.5 to 10.0",
        "14.4"
      ],
      answer: 0,
      explanation: "Stomach acid (HCl) is incredibly potent to break down tough proteins! 🥩",
    },
    {
      id: "q18",
      question: "A pH of 14 represents...",
      options: [
        "Neutrality",
        "Potent Acid",
        "Extreme Base",
        "Liquid Metal"
      ],
      answer: 2,
      explanation: "14 is the maximum alkaline/basic value on the standard scale! 🧴",
    },
    {
      id: "q19",
      question: "Which lab tool is required for a titration?",
      options: [
        "Beaker",
        "Burette",
        "Graduated Cylinder",
        "Bunsen Burner"
      ],
      answer: 1,
      explanation: "A Burette allows for precise, drop-by-drop delivery of titration fluids! 💧",
    },
    {
      id: "q20",
      question: "What is an 'Amphoteric' substance? 🦎",
      options: [
        "Acts only as an acid",
        "Acts as both acid and base",
        "Is a frozen substance",
        "Does not react"
      ],
      answer: 1,
      explanation: "Amphoteric substances (like Water!) are chemical chameleons — they can give OR take protons depending on the situation! 🦎",
    },
    
  ],

  relatedTopics: ["chemical_reactions", "periodic_table"],
};
