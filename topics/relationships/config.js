// ─────────────────────────────────────────────────────────
//  TOPIC: RELATIONSHIPS
//  Category: Personal Development
//  Standard: v3.0 Extreme (10 Cards, 5 Facts, 20 Questions, Scientist Lab)
// ─────────────────────────────────────────────────────────

export default {
  id: 'relationships',
  title: 'Science of Relationships',
  subtitle: 'Attachment Styles, Emotional Bids, and the Gottman Method 🤝',
  emoji: '🤝',
  category: 'Personal Development',
  accentKey: 'relationships', // Use a blue or pinkish hue, we'll map it to primary if needed

  hook: {
    question: "Can mathematics predict with 94% accuracy whether a couple will break up within 3 years just by watching them talk for 15 minutes? 📊💔",
    reveal: "Yes! Dr. John Gottman observed thousands of couples in a 'Love Lab' and discovered that failed relationships all share the exact same toxic communication patterns (The Four Horsemen). Furthermore, how we act in relationships is deeply programmed by our childhood 'Attachment Style.' Let's decode the profound science of human connection. 🧠🤝",
    emoji: '🔬',
  },

  theory: [
    {
      id: 'attachment_theory_intro',
      title: 'Attachment Theory 🧩',
      color: '#4ECDC4',
      bgGradient: ['#002020', '#000A0A'],
      icon: '🧩',
      svgIcon: 'users',
      content: "Psychologist John Bowlby discovered that our brains wire their 'blueprint for love' based on our relationship with our caregivers before age 3.\n\nThis is **Attachment Theory**. It dictates how you perceive intimacy and how you react to emotional distance. There are three main styles: Secure, Anxious, and Avoidant.\n\nYour attachment style acts as a lens. It determines whether you view a partner's need for space as healthy, or as a terrifying threat of abandonment. 🔍",
      highlight: "Your adult romantic relationships are heavily influenced by the survival programming established in your childhood.",
    },
    {
      id: 'anxious_attachment',
      title: 'Anxious Attachment 🌪️',
      color: '#FF9F1C',
      bgGradient: ['#302000', '#0A0500'],
      icon: '🌪️',
      svgIcon: 'flame',
      content: "**Anxious Attachment** develops when a caregiver's attention is inconsistent. \n\nAs adults, Anxious individuals are hyper-vigilant to signs of rejection. If a partner takes 4 hours to text back, their brain triggers a literal 'panic/abandonment' response. They require constant reassurance and closeness to feel safe.\n\nThe tragedy of the Anxious style is that their desperate pursuit of closeness often smothers the partner, ironically causing the exact abandonment they fear. 🏃‍♂️💨",
      highlight: "Anxious individuals constantly need proof that they are loved and will not be abandoned.",
    },
    {
      id: 'avoidant_attachment',
      title: 'Avoidant Attachment 🧊',
      color: '#A855F7',
      bgGradient: ['#150025', '#05000A'],
      icon: '🧊',
      svgIcon: 'shield',
      content: "**Avoidant Attachment** develops when a caregiver is emotionally unavailable or dismissive. The child learns: 'I must rely only on myself.'\n\nAs adults, Avoidant individuals value extreme independence. When a partner gets 'too close' or emotional, the Avoidant's brain registers it as a threat to their freedom. They physically deactivate—shutting down, pulling away, and requiring intense alone time.\n\nThey aren't heartless; they are terrified of being trapped or relied upon. 🚪",
      highlight: "Avoidant individuals equate intimacy with a loss of independence.",
    },
    {
      id: 'secure_attachment',
      title: 'Secure Attachment ⚓',
      color: '#81C784',
      bgGradient: ['#0A200A', '#050A05'],
      icon: '⚓',
      svgIcon: 'heartbeat',
      content: "**Secure Attachment** develops when caregivers are consistently responsive and safe.\n\nSecure adults are comfortable with both intimacy and independence. They don't panic when their partner needs space, and they don't feel suffocated when their partner needs affection. They assume their partner loves them, communicate needs clearly without playing games, and don't assume malice when mistakes happen.\n\nAround 50% of people are Secure. They are the anchors of the dating world. 🛳️",
      highlight: "Secure individuals communicate their needs directly without anger or fear.",
    },
    {
      id: 'anxious_avoidant_trap',
      title: 'The Anxious-Avoidant Trap 🪤',
      color: '#FF4444',
      bgGradient: ['#300000', '#0A0000'],
      icon: '🪤',
      svgIcon: 'hash',
      content: "The most common and painful relationship dynamic is the **Anxious-Avoidant Trap**.\n\nThe Anxious person desires deep fusion and moves closer. The Avoidant person feels suffocated by the closeness and pulls away. \nThe Anxious person panics at the distance and pursues aggressively. \nThe Avoidant person is overwhelmed by the pursuit and builds thicker walls.\n\nThey are locked in a relentless dance where neither gets what they want. 💃🕺",
      highlight: "Anxious and Avoidant individuals are magnetically drawn to each other because they tragically confirm each other's deepest fears.",
    },
    {
      id: 'emotional_bids',
      title: 'Emotional Bids 💬',
      color: '#00E5FF',
      bgGradient: ['#002025', '#000A0A'],
      icon: '💬',
      svgIcon: 'sparkle',
      content: "Dr. John Gottman discovered that modern romance isn't built on massive gestures, but on micro-interactions called **Emotional Bids**.\n\nA bid is an attempt to connect. (e.g., 'Look at this funny bird outside').\n\nYou can respond in 3 ways:\n1. **Turn Toward:** ('Oh wow, what kind of bird is it?') - Builds trust.\n2. **Turn Away:** (Ignore them and keep looking at phone) - Destroys trust.\n3. **Turn Against:** ('Can't you see I'm busy?') - Creates active hostility.\n\nMaster couples 'Turn Toward' 86% of the time! 📈",
      highlight: "Love is built or destroyed in micro-moments of attention.",
    },
    {
      id: 'four_horsemen_1',
      title: 'The 4 Horsemen: Criticism & Contempt 🐎',
      color: '#FF007F',
      bgGradient: ['#300015', '#0A0005'],
      icon: '🐎',
      svgIcon: 'radiation',
      content: "Gottman identified 4 communication styles that guarantee a breakup—The Four Horsemen:\n\n1. **Criticism:** Attacking the partner's character instead of the behavior. ('You NEVER help' instead of 'I am stressed about the dishes').\n2. **Contempt:** The deadliest horseman. Acting morally superior through sarcasm, eye-rolling, or name-calling. Contempt is sulfuric acid to a relationship.\n\n*Antidote:* Use 'I' statements, and build a culture of appreciation. 🛡️",
      highlight: "Contempt is the single greatest predictor of divorce.",
    },
    {
      id: 'four_horsemen_2',
      title: 'The 4 Horsemen: Defensiveness & Stonewalling 🧱',
      color: '#D4A74A',
      bgGradient: ['#201500', '#050500'],
      icon: '🧱',
      svgIcon: 'box',
      content: "3. **Defensiveness:** Playing the victim and making excuses to avoid taking responsibility. ('I wouldn't have yelled if you weren't late!').\n4. **Stonewalling:** Totally withdrawing from the interaction, shutting down, and refusing to respond (often because the heart rate has spiked over 100 BPM and the body is flooded with stress).\n\n*Antidote:* Take ownership of at least a small part of the problem, and take a 20-minute timeout to calm the nervous system. 🧘‍♂️",
      highlight: "Stonewalling is not a lack of caring; it is biological emotional flooding.",
    },
  ],

  lab: {
    title: "Attachment Dynamics Lab 🤝",
    description: "Manage the 'Trust Tether' between an Anxious and an Avoidant partner! As the Anxious partner 'Chases Closeness', the Avoidant partner's Anxiety violently spikes, causing them to pull away. If the tether stretches too far, it snaps! You must use 'Secure Vulnerability' to build lasting trust and stabilize the dance. 💃🕺",
    hint: "Aggressive 'Pursuit' or 'Ignoring' will cause immediate panic in one of the partners. The only way to win is slow, consistent communication to build the 'Secure Base'.",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Analyze the Tether Tension Coefficient, Avoidant Deactivation Threshold, and Anxious Hyper-activation metrics.",
  },

  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why we often attract partners who have the complete opposite communication style as us? 🧲",
      answer: "We unconsciously seek out what is 'familiar' from childhood. Anxious people often pursue Avoidant people because the chase and the emotional unavailability trigger the exact same neural pathways of the inconsistent love they experienced as children. It feels like 'home'. 🏠",
      emoji: '🧠',
    },
    {
      id: 'dyk2',
      question: "Do you know why eye-rolling is mathematically extremely dangerous to a marriage? 🙄",
      answer: "Eye-rolling is a physical expression of 'Contempt' (viewing your partner as beneath you). Dr. Gottman found that contempt not only predicts divorce with over 90% accuracy, but the targets of contempt actually suffer from more infectious illnesses due to destroyed immune systems! 🦠",
      emoji: '☠️',
    },
    {
      id: 'dyk3',
      question: "Do you know why arguments suddenly become impossible to resolve after 15 minutes? ⏱️",
      answer: "Due to a phenomenon called 'Diffuse Physiological Arousal' (Flooding). During a heated argument, your heart rate exceeds 100 BPM, and the body pumps adrenaline. The Prefrontal Cortex shuts down, meaning logical problem-solving is biologically impossible. You MUST take a 20-minute break! 🛑",
      emoji: '🫀',
    },
    {
      id: 'dyk4',
      question: "Do you know why 'You never do the dishes' is fundamentally different from 'I feel overwhelmed when the dishes aren't done'? 🍽️",
      answer: "The first is 'Criticism'—it attacks the person's character with absolute words ('never', 'always'), instantly triggering defensiveness. The second is an 'I-statement'—it describes a personal feeling and an objective fact, keeping the partner's ego safe so they can help! 🛡️",
      emoji: '🗣️',
    },
    {
      id: 'dyk5',
      question: "Do you know why scrolling on your phone when your partner points out something interesting is highly destructive? 📱",
      answer: "They are making an 'Emotional Bid' for connection. By 'Turning Away' (ignoring), you signal to their primitive brain: 'You are not important to me.' A relationship is not ruined by one huge betrayal, but by the slow erosion of a thousand ignored bids! 📉",
      emoji: '💬',
    },
  ],

  quiz: [
    { id: 'q1', question: "What is the core premise of 'Attachment Theory'?", options: ["It is about how we attach files to emails", "Our adult romantic habits are deeply shaped by the survival bonds we formed with our caregivers before age 3", "It is about muscle attachment to bones", "Love is completely random"], answer: 1, explanation: "If your caregivers were inconsistent, your brain wired itself to view love as dangerous or unstable! 🧩" },
    { id: 'q2', question: "A person who is hyper-vigilant, fears abandonment, and needs constant reassurance likely has which attachment style?", options: ["Secure", "Anxious", "Avoidant", "Disorganized"], answer: 1, explanation: "Anxious attachers pursue closeness aggressively because distance feels like a literal survival threat! 🌪️" },
    { id: 'q3', question: "If someone values extreme independence, views intense intimacy as a trap, and physically pulls away when things get 'too close', they likely have which attachment style?", options: ["Anxious", "Avoidant", "Secure", "Clingy"], answer: 1, explanation: "Avoidants learned early on that they could only rely on themselves, so intimacy feels like a loss of freedom. 🧊" },
    { id: 'q4', question: "Which statement best describes the 'Anxious-Avoidant Trap'?", options: ["They never meet", "The Anxious person pursues closeness, causing the Avoidant to feel suffocated and pull away, which causes the Anxious person to panic and pursue harder", "They instantly fall in love", "They ignore each other"], answer: 1, explanation: "It is a painful dance where one chases entirely out of fear, and the other runs entirely out of fear! 💃🕺" },
    { id: 'q5', question: "What is an 'Emotional Bid' according to Dr. John Gottman?", options: ["Bidding money at an auction", "A micro-attempt to connect, such as sighing, asking a question, or pointing at a funny bird", "A demand for a gift", "A threat to leave"], answer: 1, explanation: "Bids are the tiny building blocks of trust. They are constantly happening all day long! 💬" },
    { id: 'q6', question: "If your partner says 'Look at that dog!' and you ignore them and keep looking at your phone, you are:", options: ["Turning Toward", "Turning Away", "Turning Against", "Being efficient"], answer: 1, explanation: "Turning Away signals to the partner's brain that they are not worthy of your attention, eroding trust over time. 📉" },
    { id: 'q7', question: "Dr. Gottman found that successful couples 'Turn Toward' emotional bids what percentage of the time?", options: ["33%", "50%", "86%", "100%"], answer: 2, explanation: "Masters of relationships engage with their partner's attempts at connection 86% of the time! 📈" },
    { id: 'q8', question: "Which of 'The Four Horsemen' involves attacking your partner's character using words like 'always' or 'never'?", options: ["Contempt", "Criticism", "Stonewalling", "Defensiveness"], answer: 1, explanation: "Criticism attacks the PERSON. A complaint attacks the BEHAVIOR. Big difference! 🗣️" },
    { id: 'q9', question: "Which is the deadliest Horseman, predicting divorce with the highest accuracy?", options: ["Criticism", "Defensiveness", "Contempt (acting morally superior, eye-rolling, mocking)", "Stonewalling"], answer: 2, explanation: "Contempt is sulfuric acid to love. It tells the partner: 'I am better than you, and you are disgusting.' ☠️" },
    { id: 'q10', question: "What is 'Defensiveness' in the context of an argument?", options: ["Holding a shield", "Playing the victim and making excuses to avoid taking any responsibility for the problem", "Apologizing", "Leaving the room"], answer: 1, explanation: "Defensiveness says: 'The problem isn't me, it's YOU!' The antidote is to take ownership of even 1% of the issue. 🧱" },
    { id: 'q11', question: "When a partner totally withdraws, shuts down, and gives the 'silent treatment' during an argument, this is called:", options: ["Winning", "Stonewalling", "Contempt", "Secure Attachment"], answer: 1, explanation: "Stonewalling usually happens because the person is biologically 'Flooded' with stress hormones and cannot process data. 🗿" },
    { id: 'q12', question: "What should you immediately do if an argument causes your heart rate to spike over 100 BPM (Flooding)?", options: ["Yell louder", "Take a strict 20-minute timeout to let the nervous system calm down before continuing", "Cry", "Throw objects"], answer: 1, explanation: "Logic is biologically impossible when flooded. Take a break, do not ruminate, and come back calm! 🛑" },
    { id: 'q13', question: "Secure attachers make up roughly what percentage of the population?", options: ["10%", "50%", "90%", "0%"], answer: 1, explanation: "They don't often show up in dating pools for long, because they find healthy partners and stay with them. ⚓" },
    { id: 'q14', question: "Why do Anxious individuals often misinterpret 'quiet time' from their partner?", options: ["They love quiet time", "Their hyper-vigilant brains interpret silence as an impending threat of abandonment", "They are deaf", "They think the partner is sleeping"], answer: 1, explanation: "Anxious brains require high amounts of verbal reassurance that 'everything is okay.' 🌪️" },
    { id: 'q15', question: "What is an excellent 'Antidote' to Criticism?", options: ["Criticize them back", "Use 'I' statements that describe your feelings rather than attacking their character (e.g., 'I feel frustrated when...')", "Ignore them", "Scream"], answer: 1, explanation: "An 'I' statement bypasses the partner's Ego, preventing them from automatically becoming defensive! 🛡️" },
    { id: 'q16', question: "A fundamental belief of an Avoidant attacher is:", options: ["I must fuse with my partner completely", "I can only truly rely on myself, and relying on others is dangerous", "Everyone is trustworthy", "I hate being alone"], answer: 1, explanation: "They view independence as ultimate survival, causing them to flinch when intimacy feels 'heavy.' 🧊" },
    { id: 'q17', question: "The tragedy of the Anxious attachment style is that their desperate pursuit of closeness often:", options: ["Makes them rich", "Ironically smothers the partner, causing the exact abandonment they were terrified of", "Makes the partner love them immediately", "Cures anxiety"], answer: 1, explanation: "By holding on too tightly, they accidentally crush the relationship they are trying to save! 🏃‍♂️💨" },
    { id: 'q18', question: "What happens to the immune system of someone who is constantly subjected to Contempt by their partner?", options: ["It becomes super strong", "It crashes profoundly due to constant cortisol, leaving them prone to infectious diseases", "Nothing", "It heals allergies"], answer: 1, explanation: "Toxic communication isn't just emotionally painful; it is physically destructive to human biology. 🦠" },
    { id: 'q19', question: "Which action is an example of 'Turning Against' an emotional bid?", options: ["Smiling at them", "Looking at your phone silently", "Snapping 'Can't you see I'm busy right now?!'", "Buying flowers"], answer: 2, explanation: "Turning Against isn't just ignoring them; it's actively creating hostility in response to a bid for connection. ⚔️" },
    { id: 'q20', question: "If you want to heal an Anxious-Avoidant dynamic, the goal should be for both partners to move toward:", options: ["Complete isolation", "Earned Secure Attachment (through therapy, boundaries, and safe communication)", "More arguing", "Ignoring attachment theory"], answer: 1, explanation: "Attachment styles CAN change! Neuroplasticity allows us to build 'Secure' patterns with conscious effort! 🌱" },
  ],

  relatedTopics: ['science_of_emotion', 'manipulation_tactics', 'anger'],
};
