export default {
  // ── IDENTITY ────────────────────────────────
  id: 'chemical_bonding',
  title: 'Chemical Bonding',
  subtitle: 'Ionic, Covalent & Metallic — the glue of matter 🔗',
  emoji: '🔗',
  category: 'Chemistry',
  accentKey: 'chemical',

  // ── CURIOSITY HOOK ──────────────────────────
  hook: {
    question: "Why doesn't the diamond on a ring just crumble into pencil dust? 💎 After all, diamond and pencil lead are BOTH made of pure carbon atoms — literally the same element!",
    reveal: "Diamond has each carbon atom covalently bonded to 4 neighbors in a rigid 3D tetrahedral lattice — one of the strongest structures in nature! Each C-C bond releases 346 kJ/mol of energy. Breaking every bond in a 1-carat diamond would need enough energy to lift a car 2 meters off the ground! Gilbert Lewis first drew these 'shared-electron' dot diagrams in 1916. Meanwhile, pencil graphite has weak van der Waals forces between flat carbon sheets — that's why it slides right off onto paper. Same atoms, wildly different bonds! 🤯",
    emoji: '💭',
  },

  // ── THEORY CARDS ────────────────────────────
  theory: [
    {
      id: 'what_is_bonding',
      title: 'What is Chemical Bonding? 🔗',
      color: '#4ECDC4',
      bgGradient: ['#143430', '#0D0D1A'],
      icon: '🔗',
      svgIcon: 'link',
      content: "Atoms are almost never found alone in nature. They join together through *chemical bonds* — forces of attraction that hold atoms together in molecules and compounds. 🧲\n\nBut *why* do atoms bond? The answer lies in their electrons. In 1916, Gilbert Newton Lewis proposed that atoms bond to achieve a *stable electron configuration* — typically 8 valence electrons, known as the *octet rule*. 🎯\n\nThink of it like everyone wanting a full pizza 🍕 — atoms with incomplete outer shells 'share' or 'trade' electron slices with other atoms until everyone is satisfied!\n\nThere are three main types of chemical bonds:\n\n⚡ *Ionic bonds* — electrons are transferred from one atom to another (metals → nonmetals)\n🤝 *Covalent bonds* — electrons are shared between atoms (nonmetal + nonmetal)\n🌊 *Metallic bonds* — electrons form a delocalized 'sea' (metal + metal)\n\nThe type of bond formed depends on the *electronegativity* difference between the atoms — a concept Linus Pauling quantified in the 1930s on a scale from 0.7 (Cesium) to 3.98 (Fluorine). 📊",
      highlight: "Atoms bond by transferring, sharing, or delocalizing electrons to reach a stable configuration — the octet rule! 🎯",
    },
    {
      id: 'octet_lewis',
      title: 'Lewis Structures & the Octet Rule 📝',
      color: '#6C63FF',
      bgGradient: ['#1A1040', '#0D0D1A'],
      icon: '📝',
      svgIcon: 'molecule',
      content: "A *Lewis dot structure* shows how valence electrons are arranged around atoms in a molecule. Each dot represents one valence electron. 🔵\n\nTo draw a Lewis structure:\n1️⃣ Count total valence electrons from all atoms\n2️⃣ Place bonding pairs (shared) between bonded atoms\n3️⃣ Fill remaining as lone pairs to satisfy the octet\n\nThe *shared pairs formula* helps:\n*Shared e⁻ = Needed − Available*\nwhere Needed = 8 per atom (2 for H), Available = sum of valence electrons.\n\nFor water (H₂O): Needed = 8 + 2 + 2 = 12, Available = 6 + 1 + 1 = 8.\nShared = 12 − 8 = 4 electrons = 2 bonding pairs ✅\n\nSome atoms break the octet rule:\n🔹 *Expanded octets*: P, S, Xe can hold >8 electrons (d-orbitals)\n🔹 *Incomplete octets*: B, Be are stable with <8\n🔹 *Odd electrons*: NO has 11 valence e⁻ (free radical!)\n\nLewis structures also show *double bonds* (4 shared e⁻, like O₂) and *triple bonds* (6 shared e⁻, like N₂ — one of the strongest bonds at 945 kJ/mol!). ⚡",
      highlight: "Lewis structures reveal bonding: Shared pairs = Needed electrons − Available electrons! 📐",
      formula: 'Shared e⁻ = N − A',
    },
    {
      id: 'bond_types',
      title: 'Ionic vs Covalent vs Metallic ⚡',
      color: '#FF9F1C',
      bgGradient: ['#2A1800', '#0D0D1A'],
      icon: '⚡',
      svgIcon: 'lightning',
      content: "The *electronegativity difference* (ΔEN) between two atoms determines the bond type. Linus Pauling's scale tells us: 📏\n\n🔴 *ΔEN ≥ 1.7 → Ionic bond*\nOne atom steals electrons completely. Sodium (EN=0.93) meets Chlorine (EN=3.16): ΔEN = 2.23 → Na⁺Cl⁻. NaCl forms a crystal lattice with a lattice energy of 787 kJ/mol! 💎\n\n🟡 *0.4 < ΔEN < 1.7 → Polar covalent*\nElectrons are shared but pulled toward the more electronegative atom. In HF: ΔEN = 1.78 → the electron cloud shifts toward Fluorine, creating partial charges δ⁺H—Fδ⁻. 🧲\n\n🟢 *ΔEN ≤ 0.4 → Nonpolar covalent*\nElectrons are shared equally. In H₂: ΔEN = 0, perfectly symmetrical sharing! O₂ and N₂ are also nonpolar. ⚖️\n\n🔵 *Metal + Metal → Metallic bond*\nValence electrons don't belong to any single atom — they form a delocalized 'electron sea' that all atoms share. This is why metals conduct electricity, are malleable, and shine (free electrons reflect light!). 🌊\n\n*Pauling's ionic character formula*: % ionic = [1 − e^(−0.25×ΔEN²)] × 100. For NaCl: 55.5% ionic, 44.5% covalent — no bond is purely one type! 🤯",
      highlight: "ΔEN determines the bond: <0.4 = nonpolar covalent, 0.4-1.7 = polar covalent, >1.7 = ionic! ⚡",
    },
    {
      id: 'vsepr_geometry',
      title: 'Molecular Shape: VSEPR Theory 🏗️',
      color: '#FF6B9D',
      bgGradient: ['#2A0D18', '#0D0D1A'],
      icon: '🏗️',
      svgIcon: 'atom',
      content: "The *shape* of a molecule determines its properties — polarity, reactivity, smell, and even taste! VSEPR theory (Valence Shell Electron Pair Repulsion) predicts geometry by saying: *electron pairs around a central atom repel each other and arrange as far apart as possible*. 🎯\n\nKey geometries:\n\n📐 *Linear* (180°): 2 bonding pairs, 0 lone pairs. Examples: CO₂, BeCl₂\n📐 *Trigonal planar* (120°): 3 bonding pairs. Example: BF₃\n📐 *Tetrahedral* (109.5°): 4 bonding pairs. Example: CH₄\n📐 *Bent* (104.5°): 2 bonding + 2 lone pairs. Example: H₂O\n📐 *Trigonal pyramidal* (107°): 3 bonding + 1 lone pair. Example: NH₃\n\n*Why does shape = polarity?*\nCO₂ has two polar C=O bonds, but they point in opposite directions → cancel out → *nonpolar molecule*! H₂O has two polar O-H bonds at 104.5° → they DON'T cancel → *polar molecule*! This is why water dissolves salt but CO₂ doesn't. 💧\n\nLone pairs take up MORE space than bonding pairs (they're held closer), which *squeezes* bond angles: methane (CH₄) = 109.5°, water (H₂O) = 104.5°. 📏",
      highlight: "VSEPR: electron pairs repel to max distance — this determines molecular geometry and polarity! 🏗️",
    },
    {
      id: 'intermolecular',
      title: 'Beyond Bonds: Intermolecular Forces 🌐',
      color: '#C3B1E1',
      bgGradient: ['#1A1028', '#0D0D1A'],
      icon: '🌐',
      svgIcon: 'globe',
      content: "Chemical bonds hold atoms within a molecule, but *intermolecular forces* (IMFs) hold molecules to each other. They're much weaker (1-40 kJ/mol vs 150-1000 kJ/mol for bonds) but they determine boiling point, solubility, and state of matter! 🌡️\n\n*Types of IMFs (weakest → strongest):*\n\n💨 *London dispersion forces* (0.05-40 kJ/mol): Present in ALL molecules. Caused by instantaneous dipoles from random electron movement. Stronger with more electrons → why I₂ is solid but F₂ is gas!\n\n🧲 *Dipole-dipole forces* (5-25 kJ/mol): Between polar molecules. HCl...HCl attract through δ⁺H pointing toward δ⁻Cl on the next molecule.\n\n💧 *Hydrogen bonds* (10-40 kJ/mol): Special dipole-dipole when H is bonded to F, O, or N. These make water liquid at room temperature (boiling point 100°C vs H₂S at −60°C!), enable DNA's double helix, and make ice less dense than water (rare for a solid!). 🧊\n\n*Why water is weird:* H₂O's bent shape + strong H-bonds give it a boiling point 160°C higher than expected for its molecular weight. Without hydrogen bonds, life as we know it could NOT exist! 🌍",
      highlight: "Intermolecular forces (London, dipole-dipole, H-bonds) determine melting/boiling points and the states of matter! 🌐",
    },
  ],

  // ── LAB DESCRIPTION ─────────────────────────
  lab: {
    title: "Bond Builder Lab 🧪🔗",
    description: "Build molecules, explore bond types, predict properties & graph relationships 🔬",
    hint: "Try Explore mode to see ionic vs covalent bonding, then switch to Build mode to construct molecules like H₂O or CH₄. Use Graph mode to discover the ΔEN vs ionic character relationship! ⚡",
    scientistModeHint: "In Scientist Mode 🧑‍🔬: adjust temperature to see bond vibration energy and study how intermolecular force strength changes — plus Pauling ionic character calculations!",
  },

  // ── DO YOU KNOW WHY ─────────────────────────
  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why water (H₂O) is liquid at room temperature while methane (CH₄), which is nearly the same size, is a gas down to −161°C? 💧",
      answer: "Water has strong hydrogen bonds (H bonded to electronegative O) that 'glue' molecules together — each H₂O can make up to 4 hydrogen bonds! Methane has only weak London dispersion forces because C-H bonds are nearly nonpolar (ΔEN = 0.35). H-bonds in water are about 20× stronger! 🧊",
      emoji: '🤔',
    },
    {
      id: 'dyk2',
      question: "Do you know why you can bend a metal spoon but a salt crystal shatters when you hit it? 🥄💥",
      answer: "In metallic bonds, the 'electron sea' lets atom layers slide past each other — that's malleability! In ionic crystals like NaCl, shifting one layer puts same-charged ions right next to each other → massive repulsion → CRACK! The rigid lattice can't flex. 🔮",
      emoji: '🌟',
    },
    {
      id: 'dyk3',
      question: "Do you know why noble gases (He, Ne, Ar) almost never form bonds with anything? 🎈",
      answer: "Noble gases already have a complete outer shell — 8 valence electrons (or 2 for He). They have NO motivation to share, steal, or give away electrons! Their ionization energies are among the highest of all elements. Neil Bartlett shocked the world in 1962 by making XePtF₆ — the first noble gas compound! ⚡",
      emoji: '💡',
    },
  ],

  // ── QUIZ ────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      question: "What happens to electrons in an ionic bond? 🔋",
      options: ['They are shared equally', 'They are transferred from one atom to another', 'They are destroyed', 'They form a delocalized sea'],
      answer: 1,
      explanation: "In ionic bonds, electrons transfer from metal (low EN) to nonmetal (high EN), creating oppositely charged ions that attract! ⚡",
    },
    {
      id: 'q2',
      question: "What is the electronegativity difference threshold for ionic bonds? 📏",
      options: ['ΔEN > 0.4', 'ΔEN > 1.0', 'ΔEN > 1.7', 'ΔEN > 3.0'],
      answer: 2,
      explanation: "Pauling's scale: ΔEN ≥ 1.7 = ionic bond. Between 0.4 and 1.7 = polar covalent. Below 0.4 = nonpolar covalent. 📊",
    },
    {
      id: 'q3',
      question: "How many valence electrons does a carbon atom have? 🔵",
      options: ['2', '4', '6', '8'],
      answer: 1,
      explanation: "Carbon (group 14) has 4 valence electrons, letting it form 4 bonds — the basis of all organic chemistry and life! 🧬",
    },
    {
      id: 'q4',
      question: "Which molecule is polar: CO₂, H₂O, or CH₄? 💧",
      options: ['CO₂ only', 'H₂O only', 'CH₄ only', 'All three are polar'],
      answer: 1,
      explanation: "H₂O's bent shape (104.5°) means its polar O-H bond dipoles DON'T cancel. CO₂ is linear → dipoles cancel. CH₄ is tetrahedral → dipoles cancel! 📐",
    },
    {
      id: 'q5',
      question: "What is the bond angle in a perfect tetrahedral molecule like CH₄? 📐",
      options: ['90°', '104.5°', '109.5°', '120°'],
      answer: 2,
      explanation: "Tetrahedral geometry from 4 bonding pairs gives 109.5° angles. Water is LESS (104.5°) because lone pairs squeeze the angle! 🏗️",
    },
    {
      id: 'q6',
      question: "Which bond is strongest: single bond (C-C), double bond (C=C), or triple bond (C≡C)? 💪",
      options: ['Single bond (346 kJ/mol)', 'Double bond (614 kJ/mol)', 'Triple bond (839 kJ/mol)', 'They are all equal'],
      answer: 2,
      explanation: "More shared electrons = shorter + stronger bond! Triple > Double > Single. N≡N is 945 kJ/mol — one of the strongest! ⚡",
    },
    {
      id: 'q7',
      question: "In NaCl, which atom becomes the positive ion (cation)? ⚡",
      options: ['Chlorine (Cl)', 'Sodium (Na)', 'Both become positive', 'Neither — they share electrons'],
      answer: 1,
      explanation: "Na (metal, EN=0.93) LOSES its valence electron to Cl (EN=3.16), becoming Na⁺. Cl gains it, becoming Cl⁻. ΔEN = 2.23 → ionic! 🧲",
    },
    {
      id: 'q8',
      question: "A central atom has 3 bonding pairs and 1 lone pair. What is its geometry? 🏗️",
      options: ['Tetrahedral', 'Trigonal planar', 'Trigonal pyramidal', 'Bent'],
      answer: 2,
      explanation: "3 bonding + 1 lone pair = trigonal pyramidal (like NH₃, 107°). The lone pair pushes bonds closer together! ⬇️",
    },
    {
      id: 'q9',
      question: "Using Shared e⁻ = N − A, how many bonding pairs does H₂O have? (N=12, A=8) 🔢",
      options: ['1 pair', '2 pairs', '3 pairs', '4 pairs'],
      answer: 1,
      explanation: "Shared = 12 − 8 = 4 electrons = 2 bonding pairs. Each O-H bond is one pair. The remaining 4 electrons form 2 lone pairs on O! 📝",
    },
    {
      id: 'q10',
      question: "Which has the HIGHEST boiling point: H₂O, H₂S, or H₂Se? 🌡️",
      options: ['H₂Se (heaviest)', 'H₂S (middle size)', 'H₂O (lightest)', 'All the same'],
      answer: 2,
      explanation: "H₂O has hydrogen bonds (H bonded to very electronegative O). H₂S and H₂Se only have weaker London forces despite being heavier! H₂O boils at 100°C vs H₂S at −60°C! 💧",
    },
    {
      id: 'q11',
      question: "What is the approximate ionic character of HCl? (ΔEN = 0.96, use Pauling formula) 📊",
      options: ['5%', '10%', '21%', '55%'],
      answer: 2,
      explanation: "% ionic = [1 − e^(−0.25×0.96²)]×100 = [1 − e^(−0.23)]×100 ≈ 20.6%. HCl is mostly covalent with some ionic character! 📈",
    },
    {
      id: 'q12',
      question: "Why do metals conduct electricity while ionic solids (like NaCl crystals) do NOT? ⚡",
      options: ['Metals weigh more', 'Metals have delocalized electrons that move freely', 'Ionic solids have no electrons', 'Ionic solids are too dense'],
      answer: 1,
      explanation: "Metallic bonds have an 'electron sea' — free-moving delocalized electrons carry current. In solid NaCl, ions are locked in a rigid lattice and can't move! Melt NaCl → ions move → conducts! 🌊",
    },
  ],

  // ── RELATED TOPICS ──────────────────────────
  relatedTopics: ['chemical_reactions', 'periodic_trends', 'acids_bases_ph', 'organic_chemistry'],
};
