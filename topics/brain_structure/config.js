export default {
  // ── IDENTITY ────────────────────────────────
  id: 'brain_structure',
  title: 'Brain Anatomy & Functions',
  subtitle: 'Map your mind — lobes, neurons & signals 🧠',
  emoji: '🧠',
  category: 'Psychology',
  accentKey: 'brain',

  // ── CURIOSITY HOOK ──────────────────────────
  hook: {
    question: "You're using your brain right now to try to understand… your brain 🧠🤯 Isn't that the most meta thing ever? Can the brain TRULY understand itself?",
    reveal: "Your brain has *86 billion neurons*, each connected to up to 10,000 others — that's over 100 TRILLION connections, more than stars in the Milky Way! 🌌 Despite being only 2% of your body weight, it devours 20% of all your energy. And here's the wildest part: the brain *named itself*. The word 'brain' is what the brain decided to call itself! Santiago Ramón y Cajal first drew individual neurons in 1888 — winning the 1906 Nobel Prize and founding modern neuroscience. 🤯",
    emoji: '💭',
  },

  // ── THEORY CARDS ────────────────────────────
  theory: [
    {
      id: 'what_is_brain',
      title: 'The Incredible Brain 🧠',
      color: '#A855F7',
      bgGradient: ['#1A0830', '#0D0D1A'],
      icon: '🧠',
      svgIcon: 'brain',
      content: "The human brain weighs about *1.4 kg* (3 lbs) and is roughly 73% water 💧. It has the consistency of firm jelly and is protected by the skull, three layers of membranes (meninges), and cerebrospinal fluid.\n\nDespite its modest size (2% of body weight), the brain consumes *20% of your oxygen and energy* — about 12-25 watts of electricity, enough to power a dim LED bulb! 💡\n\nThe brain is divided into two hemispheres connected by the *corpus callosum* — a bundle of 200 million nerve fibers. The surface is covered in wrinkles called *gyri* (ridges) and *sulci* (grooves). These folds increase the cortex's surface area to about 2,500 cm² — the size of a pillowcase! 🛏️\n\nThe cortex is only 2-4mm thick but contains 16 billion of the brain's 86 billion neurons. It handles all conscious thought, language, reasoning, and voluntary movement. Below the cortex lie deeper structures that manage emotions, memory, and survival functions.",
      highlight: "86 billion neurons, 100 trillion connections, 2% of body weight but 20% of energy — the brain is the most complex object in the known universe! 🧠",
    },
    {
      id: 'lobes_regions',
      title: 'Lobes & Key Regions 🗺️',
      color: '#6C63FF',
      bgGradient: ['#1A1040', '#0D0D1A'],
      icon: '🗺️',
      svgIcon: 'globe',
      content: "The brain's cortex is divided into *4 main lobes*, each specializing in different functions:\n\n🔵 *Frontal lobe* (behind your forehead): Planning, decision-making, personality, speech production (*Broca's area*, discovered by Paul Broca in 1861). Contains the *motor cortex* — a strip that controls voluntary movement.\n\n🟡 *Parietal lobe* (top-center): Processes touch, temperature, pain, and spatial awareness. London taxi drivers have *enlarged parietal lobes* from years of navigation!\n\n🟢 *Temporal lobe* (above ears): Handles hearing, language comprehension (*Wernicke's area*), and memory. The *hippocampus* sits inside — your memory-formation center.\n\n🔴 *Occipital lobe* (back of head): Dedicated entirely to vision. Processes 10 million bits of visual data per second! 👁️\n\nBelow these: the *cerebellum* (coordination, houses 50% of all neurons!), *brainstem* (heartbeat, breathing), and *amygdala* (fear, emotions).",
      highlight: "Four lobes (Frontal, Parietal, Temporal, Occipital) plus deep structures form the brain's functional architecture! 🗺️",
      formula: 'v = d / t (nerve conduction velocity)',
    },
    {
      id: 'neurons_synapses',
      title: 'Neurons & Synapses ⚡',
      color: '#FF9F1C',
      bgGradient: ['#2A1800', '#0D0D1A'],
      icon: '⚡',
      svgIcon: 'lightning',
      content: "Neurons are the brain's information processors. Each one has:\n\n🔸 *Cell body (soma)* — the control center, ~10-25 μm across\n🔸 *Dendrites* — branch-like receivers that collect signals\n🔸 *Axon* — a long cable (up to 1 meter!) that transmits signals\n🔸 *Myelin sheath* — fatty insulation that speeds signals up to *120 m/s* (268 mph!) ⚡\n\nWhen a neuron fires, it generates an *action potential* — a voltage spike from −70mV to +40mV lasting just 1-2 milliseconds. This is an all-or-nothing event: the neuron either fires completely or not at all.\n\nAt the end of the axon, the signal reaches a *synapse* — a tiny gap (20 nm) between neurons. Chemical messengers called *neurotransmitters* carry the signal across. Each neuron has about *7,000 synaptic connections*.\n\nWith 86 billion neurons × 7,000 synapses each = over *600 trillion synapses* in your brain! 🤯 Your brain performs about *10¹⁶ operations per second* — roughly 10x faster than the best supercomputers.",
      highlight: "Neurons fire at −70mV to +40mV, signals travel at 120 m/s, and your brain has 600 trillion synaptic connections! ⚡",
    },
    {
      id: 'neurotransmitters',
      title: 'Neurotransmitters — Chemical Messengers 💬',
      color: '#4ECDC4',
      bgGradient: ['#0A2520', '#0D0D1A'],
      icon: '💬',
      svgIcon: 'flask',
      content: "Neurotransmitters are the chemicals that carry messages between neurons. There are over 100 known types, but these are the superstars:\n\n🟣 *Dopamine* — The 'reward molecule.' Released when you achieve goals, eat tasty food, or get likes on social media. Too little → Parkinson's disease. Too much activity in certain pathways → schizophrenia.\n\n🔵 *Serotonin* — The 'mood stabilizer.' Regulates happiness, sleep, appetite. Low levels linked to depression. SSRIs (antidepressants) work by blocking serotonin re-absorption.\n\n🟢 *GABA* — The brain's 'brake pedal.' The main inhibitory neurotransmitter. Calms neural activity. Anti-anxiety drugs boost GABA. Without it, neurons fire uncontrollably → seizures.\n\n🔴 *Glutamate* — The brain's 'gas pedal.' The main excitatory neurotransmitter. Essential for learning and memory. Too much → excitotoxicity (brain damage).\n\n🟡 *Acetylcholine* — Controls muscles and attention. The first neurotransmitter ever discovered (1914 by Henry Dale). Low levels → Alzheimer's disease.",
      highlight: "Dopamine (reward), Serotonin (mood), GABA (calm), Glutamate (excite) — these four chemicals run your mind! 💬",
    },
    {
      id: 'neuroplasticity',
      title: 'Neuroplasticity & the Future 🔮',
      color: '#FF6B9D',
      bgGradient: ['#2A0D18', '#0D0D1A'],
      icon: '🔮',
      svgIcon: 'sparkle',
      content: "Your brain is NOT fixed — it rewires itself constantly. This is called *neuroplasticity*. Every experience, thought, and habit physically changes your brain's structure! 🏗️\n\nStunning examples:\n\n🎻 Violinists have *enlarged motor cortex areas* for their left hand from years of practice\n🚕 London taxi drivers develop *bigger hippocampi* from memorizing 25,000 streets\n🧘 Meditators show *thicker prefrontal cortex* and shrunk amygdalae — literally less reactive to stress\n🕹️ Action gamers have *faster visual processing* in their occipital lobes\n\nThe brain can even *reassign* damaged areas. If the visual cortex is damaged early in life, those neurons can be recruited for hearing or touch — blind people often have enhanced hearing because their occipital lobe processes sound instead!\n\nCutting-edge research includes *Brain-Computer Interfaces* (BCIs): Neuralink (2023) implanted a chip letting a paralyzed patient control a cursor with thought alone. The future may include direct brain-to-brain communication. 🤖\n\nThe Human Brain Project and the BRAIN Initiative are mapping every connection — the *connectome*. We may fully understand consciousness within our lifetime! 🌟",
      highlight: "Neuroplasticity means your brain rewires with every experience — London cabbies literally grow bigger hippocampi! 🔮",
    },
  ],

  // ── LAB DESCRIPTION ─────────────────────────
  lab: {
    title: "Brain Explorer Lab 🧠🔬",
    description: "Tap brain regions, scan activities, test YOUR reaction time & visualize brain waves! 🧪",
    hint: "Try the Reaction Test mode — it measures YOUR actual neural processing speed in milliseconds! Then explore the Brain Map to see which regions made that reaction possible ⚡",
    scientistModeHint: "In Scientist Mode 🧑‍🔬: unlock neural signal speed calculations, synaptic delay modeling, and myelination effects on conduction velocity!",
  },

  // ── DO YOU KNOW WHY ─────────────────────────
  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why you 'see stars' when you bump the back of your head? ⭐",
      answer: "The occipital lobe (vision center) is at the back of your skull. A bump there mechanically stimulates neurons in the visual cortex — your brain interprets these false signals as flashes of light! These are called 'phosphenes' and prove that vision isn't in your eyes, it's in your brain! 👁️🧠",
      emoji: '🤔',
    },
    {
      id: 'dyk2',
      question: "Do you know why you can ride a bike after not riding for 20 years? 🚲",
      answer: "Motor memories are stored in the cerebellum, not the hippocampus! The cerebellum uses a different storage system (long-term depression of Purkinje cells) that is incredibly durable. That's why 'it's like riding a bike' = permanent motor memory! Unlike facts (hippocampus), skills (cerebellum) barely fade. 🧠",
      emoji: '🌟',
    },
    {
      id: 'dyk3',
      question: "Do you know why time seems to slow down during scary moments? ⏰",
      answer: "Your amygdala (fear center) activates, flooding your brain with adrenaline and triggering hyper-encoding — your brain records WAY more detail than normal. When you recall the event, the dense memory feels longer. Time didn't slow — your brain just took more snapshots per second, like switching from 30fps to 120fps video! 📸",
      emoji: '💡',
    },
  ],

  // ── QUIZ ────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      question: "How many neurons does the human brain contain? 🧠",
      options: ['8.6 million', '860 million', '86 billion', '860 billion'],
      answer: 2,
      explanation: "The brain has about 86 billion neurons — that's 86,000,000,000! Santiago Ramón y Cajal first identified individual neurons in the 1890s. 🔬",
    },
    {
      id: 'q2',
      question: "Which lobe is primarily responsible for vision? 👁️",
      options: ['Frontal lobe', 'Parietal lobe', 'Temporal lobe', 'Occipital lobe'],
      answer: 3,
      explanation: "The occipital lobe at the back of your head processes all visual information — that's why you 'see stars' when you bump the back of your head! 👁️",
    },
    {
      id: 'q3',
      question: "What percentage of body energy does the brain consume? ⚡",
      options: ['5%', '10%', '20%', '50%'],
      answer: 2,
      explanation: "Despite being only 2% of body weight, the brain uses 20% of all energy — about 12-25 watts of power! 💡",
    },
    {
      id: 'q4',
      question: "Broca's area controls which function? 🗣️",
      options: ['Vision', 'Hearing', 'Speech production', 'Balance'],
      answer: 2,
      explanation: "Broca's area (frontal lobe) controls speech PRODUCTION. Damage causes 'Broca's aphasia' — understanding speech but unable to speak fluently. Discovered by Paul Broca in 1861! 🗣️",
    },
    {
      id: 'q5',
      question: "What is the resting membrane potential of a neuron? ⚡",
      options: ['+70 mV', '−70 mV', '0 mV', '−40 mV'],
      answer: 1,
      explanation: "Neurons rest at −70 mV (inside negative relative to outside). During an action potential, voltage spikes to +40 mV — a 110 mV swing in just 1 ms! ⚡",
    },
    {
      id: 'q6',
      question: "Which neurotransmitter is called the 'reward molecule'? 🏆",
      options: ['Serotonin', 'GABA', 'Dopamine', 'Glutamate'],
      answer: 2,
      explanation: "Dopamine drives reward, motivation, and pleasure. It's released during achievements, good food, and social media likes — making you want to repeat the behavior! 🏆",
    },
    {
      id: 'q7',
      question: "What connects the left and right brain hemispheres? 🌉",
      options: ['Brain stem', 'Corpus callosum', 'Hippocampus', 'Thalamus'],
      answer: 1,
      explanation: "The corpus callosum is a bridge of 200 million nerve fibers connecting the hemispheres, allowing them to communicate and coordinate! 🌉",
    },
    {
      id: 'q8',
      question: "Which brain structure is the 'fear center'? 😨",
      options: ['Hippocampus', 'Cerebellum', 'Amygdala', 'Frontal lobe'],
      answer: 2,
      explanation: "The amygdala processes fear and triggers fight-or-flight in just 12 ms — before your conscious brain even knows why you're scared! 😨",
    },
    {
      id: 'q9',
      question: "How fast do myelinated nerve signals travel? ⚡",
      options: ['1 m/s', '12 m/s', '120 m/s', '1,200 m/s'],
      answer: 2,
      explanation: "Myelinated axons conduct at up to 120 m/s (268 mph). Without myelin, speed drops to 0.5-2 m/s — that's why MS (myelin damage) causes movement problems! ⚡",
    },
    {
      id: 'q10',
      question: "What happens in Wernicke's aphasia? 🗣️",
      options: ['Can\'t speak at all', 'Speaks fluently but words are meaningless', 'Can\'t see', 'Can\'t hear'],
      answer: 1,
      explanation: "Wernicke's area (temporal lobe) handles language comprehension. Damage causes fluent but nonsensical speech — the person speaks smoothly but the words make no sense! 🗣️",
    },
    {
      id: 'q11',
      question: "Approximately how many synapses does each neuron have? 🔗",
      options: ['70', '700', '7,000', '70,000'],
      answer: 2,
      explanation: "Each neuron has about 7,000 synaptic connections. With 86 billion neurons, that's roughly 600 TRILLION synapses in your brain! 🤯",
    },
    {
      id: 'q12',
      question: "What is neuroplasticity? 🔄",
      options: ['The brain\'s inability to change', 'The brain\'s ability to rewire and change structure', 'A brain disease', 'A type of brain surgery'],
      answer: 1,
      explanation: "Neuroplasticity = the brain physically rewires itself based on experience. London taxi drivers grow larger hippocampi, violinists enlarge their motor cortex — your brain shape changes with practice! 🧠",
    },
  ],

  // ── RELATED TOPICS ──────────────────────────
  relatedTopics: ['memory_how_it_works', 'cognitive_biases', 'emotions_motivation', 'nervous_system_brain'],
};
