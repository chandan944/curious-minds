export default {
  id: "life_hacks",
  title: "Science-Backed Life Hacks",
  subtitle: "Optimize your brain, sleep, and productivity ⚡",
  emoji: "⚡",
  category: "Personal Development",
  accentKey: "gold",
  hook: {
    question: "Did you know that drinking coffee immediately after waking up actually makes you MORE tired in the afternoon? ☕",
    reveal: "When you wake up, your brain is full of adenosine (the 'sleepy' molecule). If you drink coffee immediately, the caffeine blocks the adenosine receptors, but your body keeps producing it. When the caffeine wears off at 2 PM, all that built-up adenosine floods your brain at once, causing a massive crash. Waiting 90 minutes before your first coffee prevents this entirely! 🕒",
    emoji: "☕"
  },
  theory: [
    {
      id: "the_90_minute_coffee_rule",
      title: "The 90-Minute Coffee Delay ☕",
      color: "#F39C12",
      bgGradient: ["#2E1D00", "#05050A"],
      icon: "coffee",
      svgIcon: "sun",
      content: "As mentioned in the hook, adenosine is the neurochemical that makes you feel sleepy. It builds up while you are awake and clears out while you sleep.\n\nWhen you wake up, you still have some residual adenosine. Cortisol (your natural waking hormone) spikes in the first hour to clear it out.\n\nIf you drink caffeine immediately, it artificially blocks the adenosine receptors, stopping your body's natural waking process. \n\n**The Hack:** Delay your morning caffeine intake by 90 to 120 minutes. Let your natural cortisol spike wake you up. Your afternoon energy crash will disappear completely.",
      highlight: "Let your body wake itself up first. Save the caffeine for when you actually need a boost. ☕"
    },
    {
      id: "the_pomodoro_technique",
      title: "The Pomodoro Technique & Ultradian Rhythms 🍅",
      color: "#E74C3C",
      bgGradient: ["#2C0B0E", "#05050A"],
      icon: "clock",
      svgIcon: "target",
      content: "Just as we have a 24-hour sleep cycle (Circadian Rhythm), we also have 90-minute focus cycles during the day, known as **Ultradian Rhythms**.\n\nYour brain can only maintain peak focus for about 90 minutes before it needs a rest to replenish glucose and oxygen in the prefrontal cortex.\n\n**The Hack:** Use the Pomodoro Technique or time-blocking. \nWork with intense focus for 25-50 minutes, then take a strict 5-10 minute break. \n\n*Crucial:* A real break means staring out a window or walking. Looking at your phone is NOT a break for your brain—it requires just as much visual and cognitive processing as your work.",
      highlight: "Scrolling Instagram is not a break for your brain. To actually recharge, you must disconnect visually and cognitively. 🚶‍♂️"
    },
    {
      id: "the_temperature_sleep_hack",
      title: "The Temperature Sleep Hack 🥶",
      color: "#3498DB",
      bgGradient: ["#001828", "#05050A"],
      icon: "snowflake",
      svgIcon: "moon",
      content: "Having trouble falling asleep? It might be the temperature, not your thoughts.\n\nTo initiate sleep, your core body temperature must drop by about 1 to 3 degrees Fahrenheit. If your room is too warm, or you are wearing heavy clothes, your brain physically struggles to trigger the sleep sequence.\n\n**The Hack:** \n1. Keep your bedroom cold (around 65°F or 18°C).\n2. Take a *hot* shower 1 hour before bed. Paradoxically, the hot shower brings blood to the surface of your skin. When you step out, that heat dumps into the environment, rapidly dropping your core body temperature and triggering a massive wave of sleepiness.",
      highlight: "A cold room and a hot pre-sleep shower is the ultimate biological recipe for deep sleep. 🥶"
    },
    {
      id: "feynman_technique",
      title: "The Feynman Technique (Learn Anything) 🧠",
      color: "#9B59B6",
      bgGradient: ["#1A0B2E", "#05050A"],
      icon: "brain",
      svgIcon: "sparkle",
      content: "Named after Nobel Prize-winning physicist Richard Feynman, this is the ultimate hack for learning complex information.\n\nWe often fool ourselves into thinking we understand something just because we read it.\n\n**The Hack:**\n1. Learn the concept.\n2. **Teach it to a 5-year-old** (or a piece of paper). Explain it using zero jargon or complex words.\n3. Identify the gaps. Whenever you get stuck or have to use a complex word to hide your ignorance, go back to the source material.\n4. Simplify and tell the story.\n\nIf you can't explain it simply, you don't understand it well enough.",
      highlight: "True understanding is the ability to simplify, not the ability to use big words. 🧠"
    }
  ],
  lab: {
    title: "24-Hour Energy Optimizer ⚡",
    description: "Apply science-backed life hacks to a simulated 24-hour day. Can you keep the avatar's energy and focus levels in the optimal zone without crashing?",
    hint: "Don't use the coffee immediately upon waking! Save it for the 90-minute mark to prevent the afternoon crash.",
    scientistModeHint: "Scientist Mode: Viewing Adenosine buildup curves and Cortisol spike algorithms."
  },
  doYouKnowWhy: [
    {
      id: "dykw1",
      question: "Do you know why looking at your phone in bed ruins your sleep? 📱",
      answer: "It's not just the stimulation of the content. Screens emit blue light, which mimics the exact wavelength of the midday sun. When this hits your retina, it signals the pineal gland in your brain to completely halt the production of Melatonin (the sleep hormone).",
      emoji: "📱"
    },
    {
      id: "dykw2",
      question: "Do you know why cold showers wake you up so effectively? 🚿",
      answer: "Cold exposure triggers a massive release of adrenaline and noradrenaline in the brain and body. It also triggers a prolonged release of dopamine (up to a 250% increase) that lasts for hours, providing a natural, jitter-free focus boost.",
      emoji: "🚿"
    },
    {
      id: "dykw3",
      question: "Do you know why chewing gum helps you focus during a test? 🍬",
      answer: "Evolutionarily, humans don't eat when they are in extreme danger (like running from a lion). Therefore, the physical act of chewing signals to the brain's amygdala that you are safe, reducing anxiety. Additionally, the chewing motion increases blood flow to the brain, improving memory recall.",
      emoji: "🍬"
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "Why should you wait 90 minutes after waking up to drink coffee?",
      options: [
        "To let your stomach digest breakfast",
        "To allow natural cortisol to clear out residual adenosine, preventing an afternoon crash",
        "To avoid burning your tongue",
        "Because caffeine doesn't work in the morning"
      ],
      answer: 1,
      explanation: "Waiting allows your body's natural waking mechanism to work, preventing the massive wave of fatigue that hits when early-morning caffeine wears off."
    },
    {
      id: "q2",
      question: "According to Ultradian Rhythms, what is the maximum amount of time the brain can maintain peak intense focus?",
      options: [
        "30 minutes",
        "90 minutes",
        "4 hours",
        "8 hours"
      ],
      answer: 1,
      explanation: "The brain operates in 90-minute cycles. After 90 minutes of intense focus, it requires a biological break to replenish resources."
    },
    {
      id: "q3",
      question: "What physical change MUST happen in your body to initiate sleep?",
      options: [
        "Your heart rate must hit 0",
        "Your core body temperature must drop by 1 to 3 degrees",
        "Your eyes must be closed for 20 minutes",
        "Your blood pressure must spike"
      ],
      answer: 1,
      explanation: "A drop in core body temperature is the biological trigger for sleep. This is why a cold room and a hot pre-bed shower work so well."
    },
    {
      id: "q4",
      question: "What is the core principle of the Feynman Technique?",
      options: [
        "Read a textbook three times",
        "Highlight the most important sentences",
        "Explain the concept as simply as possible, as if to a 5-year-old",
        "Listen to classical music while studying"
      ],
      answer: 2,
      explanation: "The Feynman Technique proves that if you can't explain a concept in extremely simple terms, you don't actually understand it yet."
    },
    {
      id: "q5",
      question: "Why does chewing gum help reduce anxiety?",
      options: [
        "The sugar provides instant energy",
        "It distracts the brain with a sweet taste",
        "The act of eating signals to the brain's survival center that you are not in immediate physical danger",
        "It releases serotonin from the jaw muscles"
      ],
      answer: 2,
      explanation: "Evolutionarily, if you are chewing, you are not running for your life. This biological signal helps quiet the fear center (amygdala) of the brain."
    }
  ],
  relatedTopics: ["study_tips", "mastery_expertise", "brain_structure", "consistency"]
};
