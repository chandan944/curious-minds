export default {
  id: "addiction",
  title: "Addiction & The Brain",
  subtitle: "Dopamine, dependency, and taking back control ⛓️",
  emoji: "⛓️",
  category: "Mental Health",
  accentKey: "rose",
  hook: {
    question: "Did you know that scrolling social media uses the exact same brain circuitry as pulling a slot machine lever? 🎰",
    reveal: "Both trigger massive spikes of Dopamine—the brain's 'craving' molecule. Addiction isn't a lack of willpower; it's a physical hijacking of the brain's reward system. Over time, your brain literally deletes its own dopamine receptors to protect itself from the overload, leaving you numb to everyday joys. 📉",
    emoji: "🎰"
  },
  theory: [
    {
      id: "the_dopamine_myth",
      title: "The Dopamine Myth 🍔",
      color: "#E74C3C",
      bgGradient: ["#2C0B0E", "#05050A"],
      icon: "zap",
      svgIcon: "sparkle",
      content: "Most people think dopamine is the 'pleasure' chemical. **This is false.**\n\nDopamine is the **craving, motivation, and anticipation** chemical. It's the neurochemical that makes you *want* things, not necessarily *like* them once you get them.\n\nEvolution designed dopamine to keep us alive. When early humans found a berry bush, dopamine spiked to say: *\"Remember this! Do whatever it takes to get this again!\"*\n\nToday, we aren't foraging for berries. We are bombarded with supernormal stimuli: TikTok, junk food, porn, video games, and drugs. These trigger dopamine spikes 10x to 100x higher than anything found in nature, completely overwhelming the brain's evolutionary hardware.",
      highlight: "Dopamine doesn't give you pleasure. It gives you the DRIVE to seek pleasure. 🚀"
    },
    {
      id: "tolerance_downregulation",
      title: "Down-Regulation (Why things get boring) 📉",
      color: "#9B59B6",
      bgGradient: ["#1A0B2E", "#05050A"],
      icon: "chart",
      svgIcon: "brain",
      content: "Your brain strives for a state of balance called **Homeostasis**.\n\nWhen you constantly flood your brain with cheap dopamine (e.g., scrolling for 3 hours), the brain panics. To protect itself from the toxic overload, it physically removes dopamine receptors.\n\nThis is called **Down-Regulation** or **Tolerance**. \n\nBecause you now have fewer receptors, normal, healthy activities (like reading a book, taking a walk, or talking to a friend) no longer register. They feel incredibly boring because they don't produce enough dopamine to activate your depleted receptors. \n\nYou now *need* the extreme stimulus just to feel normal. This is the physiological definition of addiction.",
      highlight: "Addiction is the brain deleting its own joy receptors to survive an overdose of cheap pleasure. 📉"
    },
    {
      id: "the_habit_loop",
      title: "The Cue, Routine, Reward Loop 🔄",
      color: "#F39C12",
      bgGradient: ["#2E1D00", "#05050A"],
      icon: "repeat",
      svgIcon: "target",
      content: "Addiction is a hijacked habit. In his book *The Power of Habit*, Charles Duhigg explains that every habit has three parts:\n\n**1. The Cue (Trigger):** A feeling, time, or place. (e.g., You feel stressed or bored).\n**2. The Routine (Action):** The behavior itself. (e.g., You open Instagram or eat junk food).\n**3. The Reward:** The dopamine hit that tells the brain, \"Yes, that relieved the stress. Remember this for next time.\"\n\n**How to break it:** You cannot easily delete a habit loop. Instead, you must **replace the routine**. When the Cue happens (Stress), you must consciously force a new Routine (e.g., 10 pushups, deep breathing) to get a natural Reward.",
      highlight: "You can't just 'stop' a bad habit. You have to overwrite it with a new routine when the trigger hits. 🔄"
    },
    {
      id: "dopamine_detox",
      title: "The Dopamine Detox & Recovery 🌅",
      color: "#2ECC71",
      bgGradient: ["#0B2415", "#05050A"],
      icon: "leaf",
      svgIcon: "shield",
      content: "The good news about the brain's neuroplasticity is that down-regulation is reversible. If you remove the supernormal stimuli, the brain will slowly rebuild its dopamine receptors.\n\nThis process is often called a **Dopamine Detox** or Fast.\n\n**How it works:**\nBy enduring the initial boredom and withdrawal (which is just the brain crying out for its artificial high), you force the brain to adapt back to baseline.\n\nAfter 2-4 weeks of abstaining from a high-dopamine bad habit, the receptors regenerate. Suddenly, a simple walk outside, reading a book, or a quiet conversation feels deeply satisfying and joyful again. You reclaim your motivation and your life.",
      highlight: "Boredom is not the enemy; it is the cure. Boredom is the feeling of your dopamine receptors healing. 🌅"
    }
  ],
  lab: {
    title: "Dopamine Receptor Simulator 🧠",
    description: "Simulate how your brain's reward system adapts to different activities. See how 'Cheap Dopamine' destroys your baseline, and how a 'Detox' rebuilds it.",
    hint: "Notice how mashing the 'Cheap Dopamine' button quickly burns out the receptors, making the 'Healthy Activity' button useless.",
    scientistModeHint: "Scientist Mode: Real-time receptor count, dopamine saturation levels, and homeostasis recovery rate."
  },
  doYouKnowWhy: [
    {
      id: "dykw1",
      question: "Do you know why social media apps use 'Pull to Refresh'? 📱",
      answer: "It mimics the exact physical motion and psychological anticipation of a casino slot machine. You don't know what you're going to get—a 'jackpot' (a highly engaging post) or nothing. This unpredictable reward schedule is the most addictive reinforcement system known to psychology.",
      emoji: "📱"
    },
    {
      id: "dykw2",
      question: "Do you know why the first time doing a drug (or playing a great game) always feels the best? 🎢",
      answer: "Because the very first time, your brain has 100% of its dopamine receptors intact. Immediately after that first massive spike, the brain down-regulates (removes) receptors. Every subsequent time, you are 'chasing the dragon'—trying to get the same high, but physically possessing fewer receptors to feel it.",
      emoji: "🎢"
    },
    {
      id: "dykw3",
      question: "Do you know why addiction often leads to depression? 🌧️",
      answer: "When a severe addiction severely down-regulates your dopamine system, your baseline dopamine drops below normal. Because dopamine drives motivation and joy, a crashed baseline leaves you in a state of 'Anhedonia'—the literal inability to feel pleasure from anything, which is a core symptom of clinical depression.",
      emoji: "🌧️"
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "What is the primary psychological function of Dopamine?",
      options: [
        "To make us feel relaxed and sleepy",
        "To provide a feeling of deep satisfaction after a meal",
        "To drive craving, motivation, and the pursuit of a reward",
        "To numb physical pain"
      ],
      answer: 2,
      explanation: "Dopamine is the molecule of 'more'. It creates craving and anticipation, driving you to seek out the reward."
    },
    {
      id: "q2",
      question: "What does the brain do when exposed to unnatural, massive spikes of dopamine over time?",
      options: [
        "It builds new receptors to handle the extra dopamine",
        "It removes (down-regulates) dopamine receptors to protect itself",
        "It permanently shuts down dopamine production",
        "It converts the dopamine into serotonin"
      ],
      answer: 1,
      explanation: "To maintain balance (homeostasis), the brain protects itself from overload by deleting receptors. This is called Down-Regulation or Tolerance."
    },
    {
      id: "q3",
      question: "According to the Habit Loop, what are the three components of a habit?",
      options: [
        "Thought, Emotion, Action",
        "Cue, Routine, Reward",
        "Desire, Action, Guilt",
        "Trigger, Reaction, Consequence"
      ],
      answer: 1,
      explanation: "Charles Duhigg outlines the habit loop as: The Cue (trigger), the Routine (the behavior), and the Reward (the dopamine hit)."
    },
    {
      id: "q4",
      question: "Why do healthy activities (like reading) feel boring when you are addicted to cheap dopamine (like TikTok)?",
      options: [
        "Because reading is objectively boring",
        "Because healthy activities produce zero dopamine",
        "Because your depleted receptors require a massive stimulus to activate, and reading doesn't provide enough",
        "Because blue light destroys the optic nerve"
      ],
      answer: 2,
      explanation: "Your receptors are down-regulated. Normal, healthy activities produce a normal amount of dopamine, but you don't have enough receptors left to 'catch' it and feel the joy."
    },
    {
      id: "q5",
      question: "How does a 'Dopamine Detox' help cure addiction?",
      options: [
        "It completely removes dopamine from your brain forever",
        "It punishes the brain so you fear the addiction",
        "By removing massive stimuli, it forces the brain to regenerate dopamine receptors, restoring normal sensitivity",
        "It distracts you until you forget the habit"
      ],
      answer: 2,
      explanation: "By enduring the boredom of a detox, you give your brain the time and environment it needs to regrow receptors, allowing you to find joy in normal things again."
    }
  ],
  relatedTopics: ["social_media_trap", "happiness_science", "mental_health_basics", "brain_structure"]
};
