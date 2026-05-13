// ─────────────────────────────────────────────────────────
//  TOPIC: SLOTH
//  Category: Personal Development
//  Standard: v3.0 Extreme (10 Cards, 5 Facts, 20 Questions, Scientist Lab)
// ─────────────────────────────────────────────────────────

export default {
  id: 'sloth',
  title: 'Sloth & Procrastination',
  subtitle: 'The Path of Least Resistance: Hacking the Lazy Brain 🦥',
  emoji: '🦥',
  category: 'Personal Development',
  accentKey: 'warning', // Amber/Yellowish

  hook: {
    question: "Why can you play video games for 6 hours straight with perfect focus, but staring at a math textbook for 10 minutes feels like physical torture? 🎮📚",
    reveal: "Because your brain is biologically hardwired to be lazy! For 200,000 years, conserving energy meant surviving the winter. Today, 'procrastination' isn't a modern time-management problem; it is an ancient emotional-regulation problem. Let's decode the neuroscience of laziness and learn how to trick your brain into taking action. 🧠⚡",
    emoji: '🛋️',
  },

  theory: [
    {
      id: 'evolutionary_laziness',
      title: 'Built to Conserve Energy 🔋',
      color: '#FF9F1C',
      bgGradient: ['#302000', '#0A0500'],
      icon: '🔋',
      svgIcon: 'zap',
      content: "For ancient humans, calories were incredibly rare. If you ran around burning energy for no reason, you would starve when winter came.\n\nEvolution rewarded animals that rested whenever they weren't hunting or fleeing. True laziness is literally an evolutionary survival mechanism designed to conserve your most precious resource: biological energy.\n\nYour brain's default state is: *'Do nothing unless absolutely necessary.'* 🦥",
      highlight: "You aren't broken for feeling lazy. Your body is functioning exactly as evolution designed it.",
    },
    {
      id: 'emotional_regulation',
      title: 'Procrastination is Not About Time ⏰',
      color: '#FF4444',
      bgGradient: ['#300000', '#0A0000'],
      icon: '⏰',
      svgIcon: 'brain',
      content: "Most people think procrastination is a time-management issue. Science says it is an **Emotional Regulation** issue.\n\nWhen you look at a difficult task (like writing an essay or paying taxes), your brain predicts negative emotions: boredom, frustration, or fear of failure. To escape these bad feelings, your brain instantly seeks a mood-repairing distraction (like watching a YouTube video).\n\nYou aren't avoiding the task; you are avoiding the *feeling* associated with the task. 🛡️",
      highlight: "Procrastination is the brain's defense mechanism against negative emotions.",
    },
    {
      id: 'activation_energy',
      title: 'Activation Energy ⛰️',
      color: '#A855F7',
      bgGradient: ['#150025', '#05000A'],
      icon: '⛰️',
      svgIcon: 'hash',
      content: "In chemistry, **Activation Energy** is the spark required to start a reaction. Once started, the reaction runs itself.\n\nHuman psychology works exactly the same way. The hardest part of going to the gym is putting on your shoes. The hardest part of writing a report is typing the first sentence.\n\nThe brain requires a massive amount of 'Activation Energy' to transition from rest to work. But once in motion, it tends to stay in motion ( momentum). 🏃‍♂️",
      highlight: "Do not focus on completing the task. Focus entirely on starting it for just 2 minutes.",
    },
    {
      id: 'limbic_vs_pfc',
      title: 'The Neural Tug-of-War 🪢',
      color: '#00E5FF',
      bgGradient: ['#002025', '#000A0A'],
      icon: '🪢',
      svgIcon: 'eye',
      content: "Right now, two parts of your brain are fighting:\n\n1. **The Limbic System:** The ancient, emotional brain. It wants instant gratification, comfort, and zero pain right now.\n2. **The Prefrontal Cortex (PFC):** The logical, modern brain. It understands long-term goals, consequences, and planning.\n\nThe Limbic system reacts instantly. The PFC requires active conscious effort to engage. When you are tired or stressed, the PFC shuts down, and the lazy Limbic system wins by default. 🧠",
      highlight: "Procrastination happens when the emotional brain overpowers the logical brain.",
    },
    {
      id: 'hyperbolic_discounting',
      title: 'Hyperbolic Discounting 📉',
      color: '#FF007F',
      bgGradient: ['#300015', '#0A0005'],
      icon: '📉',
      svgIcon: 'chart',
      content: "Your brain is terrible at understanding the future.\n\n**Hyperbolic Discounting** is a cognitive bias where we choose a smaller, immediate reward over a massive, delayed reward. \n\nGiven the choice between eating a donut *right now* (instant dopamine) or having a six-pack *in 6 months* (delayed reward), the primitive brain almost always chooses the donut. It cannot accurately value rewards that far in the future. 🍩",
      highlight: "The brain discounts the value of future rewards. 'Future You' feels like a stranger.",
    },
    {
      id: 'two_minute_rule',
      title: 'Hack 1: The 2-Minute Rule ⏱️',
      color: '#4ECDC4',
      bgGradient: ['#002020', '#000A0A'],
      icon: '⏱️',
      svgIcon: 'refresh',
      content: "How do you bypass Activation Energy? You trick the Limbic system by making the task infinitesimally small.\n\nIf you need to read a book, tell yourself: *'I am only going to read for 2 minutes, and then I will quit.'*\n\nThe emotional brain does not fear 2 minutes; it feels safe. But once you cross that 2-minute threshold, Physics takes over. You have overcome inertia, and you will almost always keep going. 🚂",
      highlight: "Make the starting step so small it feels impossible to fail.",
    },
    {
      id: 'environment_design',
      title: 'Hack 2: Environment Design 🛋️',
      color: '#D4A74A',
      bgGradient: ['#201500', '#050500'],
      icon: '🛋️',
      svgIcon: 'box',
      content: "'Willpower' is a myth designed to make you feel bad. The most productive people do not have more willpower; they just have better environments.\n\nIf you want to stop playing video games, unplug the console and put it in a closet. To play, you now have to spend 10 minutes setting it up. You have artificially added *Friction*.\n\nDesign your environment so that doing the *right* thing is the path of least resistance, and the *wrong* thing requires effort. 🏗️",
      highlight: "Don't rely on willpower. Rely on designing an environment that makes being lazy productive.",
    },
    {
      id: 'forgiveness',
      title: 'Hack 3: The Forgiveness Loop 🕊️',
      color: '#81C784',
      bgGradient: ['#0A200A', '#050A05'],
      icon: '🕊️',
      svgIcon: 'heartbeat',
      content: "When we fail and procrastinate, we usually beat ourselves up: *'I am so lazy. I am a failure.'*\n\nStudies show that guilt and shame actually *increase* future procrastination! Why? Because guilt is a massive negative emotion. And what does the brain do when facing negative emotions? It seeks instant distraction!\n\nForgiving yourself instantly removes the negative emotion, breaking the cycle and allowing the logical brain to resume control. 💡",
      highlight: "Beating yourself up for being lazy guarantees you will be lazy again tomorrow.",
    },
    {
      id: 'parkinsons_law',
      title: "Hack 4: Parkinson's Law ⏳",
      color: '#E84393',
      bgGradient: ['#2E001A', '#05050A'],
      icon: 'hourglass',
      svgIcon: 'target',
      content: "Have you ever noticed that if you have a week to write an essay, it takes a week. But if you have 3 hours until the deadline, you finish it in 3 hours?\n\nThis is **Parkinson's Law**: *'Work expands to fill the time available for its completion.'*\n\nIf you give yourself too much time, your brain will introduce procrastination and overthinking to fill the space. \n\n**The Hack:** Set aggressive, artificial deadlines. Give yourself exactly half the time you think you need. The artificial time constraint forces the brain into deep focus and eliminates perfectionism.",
      highlight: "If you give yourself 30 days to clean your room, it takes 30 days. Give yourself 30 minutes, and it takes 30 minutes. ⌛"
    },
    {
      id: 'decision_fatigue',
      title: 'Decision Fatigue 🧠🔋',
      color: '#3498DB',
      bgGradient: ['#001828', '#05050A'],
      icon: 'battery',
      svgIcon: 'shield',
      content: "Every choice you make—from what to wear to what to eat—drains a tiny bit of your Prefrontal Cortex's energy. This is **Decision Fatigue**.\n\nBy 6:00 PM, your PFC is 'empty,' and the lazy Limbic system takes full control. This is why it's so easy to study at 9:00 AM but almost impossible at 9:00 PM.\n\n**The Hack:** Do your hardest, most anxiety-inducing work in the first 2 hours of your day. Save the easy, automatic tasks for when your 'willpower battery' is low. 🌅",
      highlight: "Your willpower is a finite resource. Use it on your most important task before the battery runs out."
    }
  ],

  lab: {
    title: "Procrastination Engine Lab ⚙️",
    description: "Manage the battle between your Prefrontal Cortex and your Limbic System! Staring at 'Hard Work' generates massive Anxiety, dropping your energy. Will you succumb to 'Instant Doomscrolling' for cheap relief, or can you generate enough 'Activation Energy' to break through the wall of resistance? 🧠💥",
    hint: "If Anxiety gets too high, you literally cannot do Hard Work. Use 'The 2-Minute Rule' to bypass the Anxiety spike and generate slow but steady Momentum!",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Analyze the real-time hyperbolic discounting multiplier, the exact Activation Energy threshold (Joules), and the Limbic dominance percentage.",
  },

  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why we suddenly want to clean our entire room right before a major exam? 🧹",
      answer: "It's called 'Productive Procrastination.' Your brain wants the dopamine hit of 'feeling productive' without facing the intense anxiety of the actual hard task (studying). It tricks you into doing easier chores so you feel justified in avoiding the terrifying work! 📚",
      emoji: '🧽',
    },
    {
      id: 'dyk2',
      question: "Do you know why procrastination is often linked to perfectionism, not laziness? 🎯",
      answer: "A perfectionist is terrified of producing something flawed. Because the standard is set to '100% perfect', the task feels incredibly heavy and anxiety-inducing. The brain, seeking to avoid this massive fear of failure, decides it's safer to just do nothing at all! 🛑",
      emoji: '📏',
    },
    {
      id: 'dyk3',
      question: "Do you know why the snooze button is the worst possible way to wake up? ⏰",
      answer: "When you hit snooze and fall back asleep, your brain restarts a full 90-minute sleep cycle. When the alarm rings 9 minutes later, it rudely rips you out of the deepest phase of sleep, resulting in 'Sleep Inertia'—a groggy, physically painful laziness that can last for hours! 🛌",
      emoji: '😴',
    },
    {
      id: 'dyk4',
      question: "Do you know why tasks magically expand to fill the exact amount of time you give them? 📆",
      answer: "This is Parkinson’s Law! If you give yourself a week to write a 1-page paper, the brain's Limbic system realizes there is no immediate threat, creating zero adrenaline. You will procrastinate for 6 days. If you give yourself 2 hours, the panic creates adrenaline, hyper-focusing the brain. ⏳",
      emoji: '🏃‍♂️',
    },
    {
      id: 'dyk5',
      question: "Do you know why we always assume 'Future Me' will have more energy and discipline? 🔮",
      answer: "Brain scans show that when we think about our 'Future Self', the brain uses the exact same neural networks it uses to think about *a complete stranger*. Your brain literally does not care about Future You, which is why it constantly dumps stressful tasks on them! 👤",
      emoji: '🧠',
    },
  ],

  quiz: [
    { id: 'q1', question: "From an evolutionary perspective, why is the brain naturally 'lazy'?", options: ["To avoid physical exhaustion", "To conserve energy for survival", "To prevent mental burnout", "To minimize metabolic heat"], answer: 1, explanation: "Laziness is a brilliantly successful survival strategy when calories are incredibly scarce! 🔋" },
    { id: 'q2', question: "Modern psychology classifies procrastination primarily as a problem of:", options: ["Poor time management skills", "Lack of self-discipline", "Difficulty regulating negative emotions", "Low cognitive processing speed"], answer: 2, explanation: "You aren't avoiding the task itself; you are avoiding the anxiety, boredom, or fear associated with the task! 🛡️" },
    { id: 'q3', question: "What acts as the 'emotional brain' that demands instant comfort and distraction?", options: ["The Cerebellum region", "The Limbic System", "The Prefrontal Cortex", "The Occipital Lobe"], answer: 1, explanation: "The Limbic system is the ancient, primal brain that wants pizza and video games RIGHT NOW. 🧠" },
    { id: 'q4', question: "What is 'Activation Energy' in the context of habit formation?", options: ["Energy needed for focus", "Effort required to start tasks", "Mental boost from stimulants", "Physical power for movement"], answer: 1, explanation: "Getting off the couch is the hardest part. Once you are running, momentum takes over! ⛰️" },
    { id: 'q5', question: "Why does relying purely on 'Willpower' usually lead to failure?", options: ["Willpower is an illusion", "It depletes throughout the day", "It causes emotional distress", "It only works during mornings"], answer: 1, explanation: "This is why you eat perfectly healthy all day, but binge on junk food at 11 PM! 🔋" },
    { id: 'q6', question: "What is the key principle behind 'Environment Design'?", options: ["Changing your wall colors", "Relocating to new spaces", "Modifying surroundings to reduce friction", "Working in outdoor settings"], answer: 2, explanation: "Make being productive the path of least resistance. Unplug the TV and put the book on your pillow! 🛋️" },
    { id: 'q7', question: "What is the psychological trick behind the '2-Minute Rule'?", options: ["Taking frequent short breaks", "Reducing fear of starting", "Using timers for efficiency", "Repeating tasks for mastery"], answer: 1, explanation: "The Limbic system is terrified of 'running for an hour', but it isn't scared of 'running for two minutes'. ⏱️" },
    { id: 'q8', question: "What is 'Hyperbolic Discounting'?", options: ["Retail price reduction strategies", "Preferring immediate over future rewards", "Ignoring long-term consequences", "Processing numerical data quickly"], answer: 1, explanation: "The brain cannot effectively value an award that is 6 months away, so it chooses the donut right now! 🍩" },
    { id: 'q9', question: "How does the brain geometrically view your 'Future Self'?", options: ["As a superior being", "As an improved version", "As a complete stranger", "As a hostile enemy"], answer: 2, explanation: "This is why we easily pawn off massive amounts of hard work to 'Future Me'—we literally don't care about them! 👤" },
    { id: 'q10', question: "What happens when you intensely guilt-trip and hate yourself for procrastinating?", options: ["Productivity increases immediately", "Guilt triggers more procrastination", "Physical health improves slightly", "Sleep quality becomes better"], answer: 1, explanation: "The 'Forgiveness Loop' is critical; guilt just fuels the negative emotional cycle that causes procrastination! 🕊️" },
    { id: 'q11', question: "Suddenly deciding to deeply clean your room when you should be studying for finals is called:", options: ["Productive procrastination", "Irrational cleaning behavior", "A specific tidying bias", "The general cleaning effect"], answer: 0, explanation: "You get the dopamine of 'doing work' without facing the sheer terror of the actual difficult task! 🧽" },
    { id: 'q12', question: "Parkinson’s Law states that:", options: ["Aging slows work speed", "Work expands to fill time", "Distance affects completion", "Deadlines are irrelevant"], answer: 1, explanation: "If you give yourself a week to do a 2-hour task, your brain will stretch it (and the anxiety) across the entire week. ⏳" },
    { id: 'q13', question: "Why do perfectionists often severely struggle with procrastination?", options: ["General lack of motivation", "Dislike for strict rules", "Fear of making mistakes", "Slow physical typing speed"], answer: 2, explanation: "Perfectionism is just fear in a fancy suit. The brain avoids starting because starting means risking failure. 🎯" },
    { id: 'q14', question: "What physical state directly impairs the Prefrontal Cortex, allowing the lazy Limbic system to take total control?", options: ["Excessive water intake", "Sleep deprivation and stress", "High vegetable consumption", "Maintaining upright posture"], answer: 1, explanation: "When you are exhausted, the logical brain literally loses power, leaving the emotional brain holding the steering wheel. 🧟‍♂️" },
    { id: 'q15', question: "Hitting the snooze button makes you feel profoundly lethargic all morning because of a phenomenon called:", options: ["The morning blues", "Experiencing sleep inertia", "Feeling bed gravity", "Suffering dream trapping"], answer: 1, explanation: "Going back to sleep starts a 90-minute sleep cycle that the alarm brutally interrupts 9 minutes later! 🛌" },
    { id: 'q16', question: "According to physics and psychology, an object at rest tends to __________, while an object in motion tends to __________.", options: ["Break or explode", "Stay still or moving", "Heat up or cool", "Shrink or grow"], answer: 1, explanation: "This is why starting is the only hard part. Once you are studying, momentum carries you! 🚂" },
    { id: 'q17', question: "If you drastically want to stop eating junk food, 'Environment Design' dictates you should:", options: ["Practice visual self-control", "Use negative reminder notes", "Remove junk food from home", "Consume the food faster"], answer: 2, explanation: "Add massive friction to the bad habit. Willpower fails; physics (distance) does not. 🏗️" },
    { id: 'q18', question: "The brain's default state of operating is:", options: ["Maximizing total output", "Path of least resistance", "Seeking extreme danger", "Calculating complex numbers"], answer: 1, explanation: "We will always naturally gravitate toward whatever burns the least amount of biological energy! 🦥" },
    { id: 'q19', question: "When trying to start a dreadful task, what should your mental focus be entirely fixed upon?", options: ["Total time required", "Long-term future rewards", "The first small step", "Potential for failure"], answer: 2, explanation: "Focusing on the mountain causes panic. Focusing on tying your shoes bypasses the panic. 👟" },
    { id: 'q20', question: "What happens to the level of anxiety you feel toward a task once you finally bypass the Activation Energy and start doing it?", options: ["It increases significantly", "It decreases rapidly", "It remains constant", "It causes physical pain"], answer: 1, explanation: "The fear of the task is almost always worse than the actual task itself! 📉" },
  ],

  relatedTopics: ['brain_structure', 'happiness_science', 'learning_behavior'],
};
