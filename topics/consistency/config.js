export default {
  id: "consistency",
  title: "The Science of Consistency",
  subtitle: "How to build habits that actually stick 🔁",
  emoji: "🔁",
  category: "Personal Development",
  accentKey: "emerald",
  hook: {
    question: "Did you know that relying on 'motivation' is the #1 reason people fail at their goals? 📉",
    reveal: "Motivation is an emotion, and like all emotions, it fluctuates based on your sleep, blood sugar, and stress levels. Consistency isn't about having high motivation every day—it's about designing your environment so that doing the right thing requires almost zero willpower. 🧠",
    emoji: "🎯"
  },
  theory: [
    {
      id: "the_willpower_trap",
      title: "The Willpower Trap 🪫",
      color: "#E74C3C",
      bgGradient: ["#2C0B0E", "#05050A"],
      icon: "battery",
      svgIcon: "sparkle",
      content: "Most people approach a new goal (like working out or studying) by saying: *'I just need to try harder.'*\n\nThis relies on **Willpower**, which neuroscientists compare to a battery. Every decision you make during the day—what to wear, dealing with annoying coworkers, resisting a donut—drains this battery. \n\nThis is called **Decision Fatigue**. By the time you get home at 6 PM, your willpower battery is at 0%. This is why you skip the gym and order pizza, even though you 'want' to be healthy. \n\n**The Rule:** Never rely on willpower for a long-term goal. It will always fail you.",
      highlight: "Willpower is for emergencies. Habits are for everyday life. 🪫"
    },
    {
      id: "friction",
      title: "The Physics of Habits: Friction 🧊",
      color: "#3498DB",
      bgGradient: ["#001828", "#05050A"],
      icon: "ice",
      svgIcon: "target",
      content: "If willpower is the force pushing you forward, **Friction** is the resistance holding you back.\n\nHumans are biologically wired for the 'Law of Least Effort'. We naturally gravitate toward whatever is easiest.\n\n**To build a good habit: Reduce Friction to Zero.**\nIf you want to read more, put the book directly on your pillow in the morning. If you want to run, sleep in your gym clothes. Make it so easy that it takes more effort to *not* do it.\n\n**To break a bad habit: Maximize Friction.**\nIf you want to stop scrolling, delete the app, or put a 15-character randomized password on it that is stored in another room. Make it annoying to do the wrong thing.",
      highlight: "Don't try to increase your willpower. Just decrease the friction. 🧊"
    },
    {
      id: "the_two_minute_rule",
      title: "The 2-Minute Rule ⏱️",
      color: "#F39C12",
      bgGradient: ["#2E1D00", "#05050A"],
      icon: "clock",
      svgIcon: "leaf",
      content: "Popularized by James Clear in *Atomic Habits*, the 2-Minute Rule states: **'When you start a new habit, it should take less than two minutes to do.'**\n\n- 'Read a book a week' becomes 'Read one page'.\n- 'Do a 45-minute workout' becomes 'Put on my running shoes'.\n\n**Why this works psychologically:**\nA habit must be established before it can be improved. You are casting a 'vote' for your new identity. By just showing up and putting on your running shoes every day for a week, you wire the neural pathway of 'I am someone who gets ready for the gym'. \n\nOnce the pathway exists, you can scale the habit up.",
      highlight: "A habit must be established before it can be improved. Master the art of showing up. ⏱️"
    },
    {
      id: "compounding",
      title: "The Math of Compounding 📈",
      color: "#2ECC71",
      bgGradient: ["#0B2415", "#05050A"],
      icon: "chart",
      svgIcon: "brain",
      content: "The human brain struggles to comprehend exponential growth. We expect linear progress (I worked out for 3 days, I should see 3 days of muscle).\n\nWhen we don't see immediate results, we fall into the **Valley of Disappointment** and quit.\n\nBut habits are the compound interest of self-improvement. If you get 1% better every day for one year, you won't be 365% better—due to compounding, you will be **37 times better** by the time you are done.\n\nThe most powerful outcomes are always delayed. You must focus on the system (the daily action) rather than the goal (the final result).",
      highlight: "You do not rise to the level of your goals. You fall to the level of your systems. 📈"
    }
  ],
  lab: {
    title: "Willpower vs. Friction Simulator 🧊",
    description: "Experience the math of habit building. Adjust your 'Friction' and 'Motivation' to see if your habit survives a 30-day timeline.",
    hint: "Notice how high friction causes your habit to crash the moment your motivation drops. Lower the friction!",
    scientistModeHint: "Scientist Mode: Viewing probabilistic decay curves and decision-fatigue coefficients."
  },
  doYouKnowWhy: [
    {
      id: "dykw1",
      question: "Do you know why forming a habit takes roughly 66 days, not 21? 🗓️",
      answer: "The '21 days' myth came from a plastic surgeon in the 1960s noticing patients took 21 days to get used to their new faces. However, a major 2009 study at University College London tracking real people building habits found the average time it takes for a new behavior to become automatic is exactly 66 days.",
      emoji: "🗓️"
    },
    {
      id: "dykw2",
      question: "Do you know why 'Identity-Based' habits are the strongest? 🪞",
      answer: "If your goal is 'I want to quit smoking', you are a smoker trying to stop. If your goal is 'I am not a smoker', you have fundamentally shifted your identity. Your brain works highly to align your actions with your core identity to avoid cognitive dissonance.",
      emoji: "🪞"
    },
    {
      id: "dykw3",
      question: "Do you know why missing one day doesn't ruin your progress? 📉",
      answer: "Neurologically, the brain's pathways don't instantly decay. The rule of consistency is 'Never miss twice'. Missing one day is an accident; missing two days is the start of a new habit.",
      emoji: "📉"
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "Why is relying on 'Willpower' a bad strategy for long-term consistency?",
      options: [
        "Willpower is a myth; it doesn't actually exist",
        "Willpower acts like a battery that drains throughout the day due to decision fatigue",
        "Using willpower causes physical damage to the brain",
        "Willpower only works for physical tasks, not mental ones"
      ],
      answer: 1,
      explanation: "Willpower is finite. Every decision drains it, leaving you with no defense at the end of the day when you are tired."
    },
    {
      id: "q2",
      question: "According to the Law of Least Effort, what is the best way to build a good habit?",
      options: [
        "Watch motivational videos every morning",
        "Reduce the friction of doing the habit to near zero",
        "Punish yourself heavily if you fail",
        "Tell everyone on social media what you are doing"
      ],
      answer: 1,
      explanation: "By reducing friction (e.g., sleeping in your gym clothes), you make doing the right thing easier than doing the wrong thing."
    },
    {
      id: "q3",
      question: "What is the primary goal of the '2-Minute Rule'?",
      options: [
        "To get a full workout done in exactly two minutes",
        "To establish the neural pathway and 'master the art of showing up' before trying to improve",
        "To trick your brain into thinking time is moving faster",
        "To save time during your lunch break"
      ],
      answer: 1,
      explanation: "A habit must be established before it can be improved. Doing a habit for just 2 minutes casts a vote for your new identity."
    },
    {
      id: "q4",
      question: "What happens if you get 1% better every day for a full year?",
      options: [
        "You get 365% better",
        "You get 12 times better",
        "You get 37 times better due to compound interest",
        "You plateau after 30 days"
      ],
      answer: 2,
      explanation: "Because of the math of compounding (1.01^365), a tiny 1% daily improvement yields a massive 37x return over a year."
    },
    {
      id: "q5",
      question: "What is the golden rule of consistency when you inevitably mess up?",
      options: [
        "Quit and start over next year",
        "Double your workout the next day to punish yourself",
        "Never miss twice. Missing once is a mistake; missing twice starts a new habit.",
        "Change your goal completely"
      ],
      answer: 2,
      explanation: "Perfection is impossible. The key to consistency is simply getting right back on track so a mistake doesn't compound into failure."
    }
  ],
  relatedTopics: ["addiction", "study_tips", "mastery_expertise", "emotions_motivation"]
};
