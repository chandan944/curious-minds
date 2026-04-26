export default {
  id: "politics",
  title: "The Psychology of Politics",
  subtitle: "Echo chambers, bias, and figuring out who is right ⚖️",
  emoji: "⚖️",
  category: "Society",
  accentKey: "slate",
  hook: {
    question: "Did you know that viewing political facts that contradict your beliefs actually activates the physical pain center of your brain? 🧠💥",
    reveal: "When presented with evidence that a deeply held political belief is wrong, the amygdala (the brain's threat center) fires as if you are being physically attacked. Your brain literally defends your political identity with the same intensity it would use to defend you from a tiger. This is why political debates so rarely change anyone's mind! 🐅",
    emoji: "🛡️"
  },
  theory: [
    {
      id: "confirmation_bias",
      title: "Confirmation Bias 🔍",
      color: "#3498DB",
      bgGradient: ["#001828", "#05050A"],
      icon: "eye",
      svgIcon: "sparkle",
      content: "**Confirmation Bias** is the brain's tendency to search for, interpret, and remember information that confirms our pre-existing beliefs, while ignoring or instantly dismissing evidence that contradicts them.\n\nImagine wearing tinted glasses. If you believe the world is red, you will only notice the red objects. \n\nIn politics, if you believe a certain leader is corrupt, you will eagerly read and share every article that proves it. If an article praises that leader, your brain will instantly look for reasons to call the article 'fake news' or biased. You aren't being objective; your brain is just protecting its worldview.",
      highlight: "We don't see the world as it is; we see the world as WE are. 🔍"
    },
    {
      id: "echo_chambers",
      title: "The Algorithm & Echo Chambers 📱",
      color: "#9B59B6",
      bgGradient: ["#1A0B2E", "#05050A"],
      icon: "wifi",
      svgIcon: "target",
      content: "Social media algorithms have one goal: to keep you scrolling so they can show you ads.\n\nHow do they keep you scrolling? By showing you content that makes you feel validated or outraged.\n\nIf you click on a left-wing article, the algorithm will show you 10 more left-wing articles. If you click on a right-wing video, you get 10 more right-wing videos. \n\nThis creates an **Echo Chamber**—an environment where you only hear voices that agree with you. You start to assume that *everyone* thinks like you, and anyone who disagrees must be crazy, evil, or stupid. The algorithm doesn't care about the truth; it cares about engagement.",
      highlight: "The internet was supposed to connect us to diverse ideas, but algorithms turned it into a mirror that only reflects our own opinions back at us. 🪞"
    },
    {
      id: "the_political_spectrum",
      title: "The Political Spectrum (Left vs. Right) 🧭",
      color: "#F39C12",
      bgGradient: ["#2E1D00", "#05050A"],
      icon: "compass",
      svgIcon: "sun",
      content: "To understand 'who is right', you must understand what both sides value.\n\nPsychologist Jonathan Haidt found that political differences often stem from biological personality differences:\n\n🔵 **The Left (Progressives):** Generally score higher in 'Openness to Experience'. They prioritize *Care* and *Equality*. They want to dismantle old systems to fix unfairness, even if it risks instability.\n\n🔴 **The Right (Conservatives):** Generally score higher in 'Conscientiousness'. They prioritize *Order*, *Loyalty*, and *Authority*. They want to preserve systems that have worked historically, fearing that tearing them down will lead to chaos.\n\nWho is right? Society needs both. A car needs an accelerator (Progressives driving change) and a brake (Conservatives ensuring safety).",
      highlight: "Society needs both the accelerator of change and the brakes of caution. One without the other leads to disaster. 🚗"
    },
    {
      id: "how_to_be_objective",
      title: "Steel-Manning: How to Actually Be Right ⚔️",
      color: "#2ECC71",
      bgGradient: ["#0B2415", "#05050A"],
      icon: "shield",
      svgIcon: "brain",
      content: "If you want to escape the echo chamber, you must practice **Steel-Manning**.\n\nA 'Straw Man' is a logical fallacy where you misrepresent your opponent's argument to make it easy to defeat. \n\nA 'Steel Man' is the opposite. You must articulate your opponent's argument so well that *they* say, \"Yes, that is exactly what I believe.\" \n\nOnly when you can perfectly explain *why* a smart, well-intentioned person would hold the opposite political view, have you earned the right to disagree with them. This destroys tribalism and leads to actual truth.",
      highlight: "You have not earned the right to hold your opinion until you can argue the opposite side better than they can. ⚔️"
    }
  ],
  lab: {
    title: "Echo Chamber Simulator 📱",
    description: "Experience how quickly an algorithm traps you in a filter bubble. Make a few choices and watch how your feed—and your perception of reality—changes.",
    hint: "Notice how clicking on 'Outrage' content maximizes your engagement score, but drives your 'Echo Chamber' meter to 100%.",
    scientistModeHint: "Scientist Mode: Viewing underlying recommendation weights and bias reinforcement loops."
  },
  doYouKnowWhy: [
    {
      id: "dykw1",
      question: "Do you know why political news makes us so angry? 😡",
      answer: "Media companies know that 'Outrage' is the most engaging human emotion. An article that makes you angry is 30% more likely to be shared than an article that makes you happy. They intentionally write polarizing headlines to trigger your amygdala and keep you clicking.",
      emoji: "😡"
    },
    {
      id: "dykw2",
      question: "Do you know why we label the political sides 'Left' and 'Right'? 🏛️",
      answer: "The terms originated during the French Revolution in 1789. In the National Assembly, supporters of the King (conservatives wanting to maintain the old order) sat to the President's right, while supporters of the revolution (progressives wanting drastic change) sat to his left.",
      emoji: "🏛️"
    },
    {
      id: "dykw3",
      question: "Do you know why people fall for fake news so easily? 🎣",
      answer: "Because of 'Cognitive Ease'. If a fake headline perfectly aligns with your confirmation bias (e.g., proving your political rival did something bad), your brain accepts it effortlessly without spending the energy to fact-check it. Your brain prioritizes feeling 'right' over being accurate.",
      emoji: "🎣"
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "What happens in the brain when a deeply held political belief is challenged?",
      options: [
        "The logic center immediately starts calculating a new opinion",
        "The brain releases dopamine because it loves learning",
        "The amygdala (threat center) fires as if you are being physically attacked",
        "The brain shuts down and you fall asleep"
      ],
      answer: 2,
      explanation: "Challenging a core belief triggers the same biological threat response as a physical attack, which is why political arguments get so heated."
    },
    {
      id: "q2",
      question: "What is Confirmation Bias?",
      options: [
        "The ability to confirm if a news article is true",
        "The tendency to only notice and accept information that supports what we already believe",
        "The habit of agreeing with whatever the majority of people think",
        "The process of fact-checking everything you read"
      ],
      answer: 1,
      explanation: "Confirmation Bias is the brain's way of filtering reality so that it matches our existing worldview, ignoring contrary evidence."
    },
    {
      id: "q3",
      question: "What is a Social Media 'Echo Chamber'?",
      options: [
        "A feature where you can hear your friends' voices",
        "An algorithm that shows you completely random content",
        "An environment where algorithms only show you content that agrees with you, making you think everyone shares your opinion",
        "A political debate forum"
      ],
      answer: 2,
      explanation: "Algorithms feed you what you already like. Over time, you are trapped in a bubble of your own opinions, an 'echo chamber'."
    },
    {
      id: "q4",
      question: "What is 'Steel-Manning'?",
      options: [
        "Ignoring your opponent completely",
        "Misrepresenting your opponent's argument to make it look stupid",
        "Articulating your opponent's argument so perfectly and fairly that they agree with your summary",
        "Yelling louder until the other person gives up"
      ],
      answer: 2,
      explanation: "Steel-Manning is the ultimate tool for objective truth. You must build the strongest possible version of the opposing argument before you try to dismantle it."
    },
    {
      id: "q5",
      question: "Why do news organizations frequently use 'Outrage' in their headlines?",
      options: [
        "Because it is illegal to write happy news",
        "Because anger is the most engaging emotion, making people 30% more likely to share the article and generate ad revenue",
        "Because they want to educate the public",
        "Because outrage makes people calm down"
      ],
      answer: 1,
      explanation: "Outrage drives engagement. The angrier you are, the more you click, comment, and share, which makes the platform more money."
    }
  ],
  relatedTopics: ["cognitive_biases", "manipulation_tactics", "social_media_trap", "critical_thinking"]
};
