// ─────────────────────────────────────────────────────────
//  TOPIC: GREED
//  Category: Personal Development
//  Standard: v3.0 Extreme (10 Cards, 5 Facts, 20 Questions, Scientist Lab)
// ─────────────────────────────────────────────────────────

export default {
  id: 'greed',
  title: 'Greed',
  subtitle: 'The Scarcity Trap & The Hedonic Treadmill 💎',
  emoji: '💎',
  category: 'Personal Development',
  accentKey: 'success', // Gold/Green

  hook: {
    question: "Why is it that billionaires, who have more money than they could spend in 100 lifetimes, still wake up every day trying to make more? 💰",
    reveal: "Because humans don't actually desire 'money' or 'things'; we desire the *chemical hit* of acquiring them. Our ancestors survived the brutal winters by endlessly hoarding calories. Today, that survival mechanism has mutated into the 'Hedonic Treadmill'—a psychological trap where 'enough' mathematically does not exist. Let's learn how to escape the scarcity trap. 🧠🏃‍♂️",
    emoji: '🏆',
  },

  theory: [
    {
      id: 'evolution_scarcity',
      title: 'The Scarcity Instinct ❄️',
      color: '#FF9F1C',
      bgGradient: ['#302000', '#0A0500'],
      icon: '❄️',
      svgIcon: 'snowflake',
      content: "For 99% of human history, winter meant starvation. The individuals who survived were the ones who hoarded as much food, fur, and shelter as humanly possible during the summer.\n\nEvolution programmed our brains to panic at the thought of 'not having enough.'\n\nGreed was originally a highly successful survival strategy. The problem? We now live in a world of abundance, but we still have a 'scarcity brain' that constantly whispers: *'You don't have enough to survive.'* 🧠",
      highlight: "Greed isn't evil; it is an outdated biological defense mechanism.",
    },
    {
      id: 'hedonic_treadmill',
      title: 'The Hedonic Treadmill 🏃‍♂️',
      color: '#FF4444',
      bgGradient: ['#300000', '#0A0000'],
      icon: '🏃‍♂️',
      svgIcon: 'refresh',
      content: "The **Hedonic Treadmill** is a psychological phenomenon where humans rapidly adapt to new levels of wealth or success.\n\nWhen you get a raise, you feel immense joy. But within 3 months, your brain adjusts. The new salary becomes the 'new normal.' To get that joy again, you now need an *even bigger* raise.\n\nYou are running on a treadmill: constantly moving, exhausting yourself, but emotionally staying in the exact same spot. 📉",
      highlight: "As your income grows, your desires grow equally. You never actually 'arrive'.",
    },
    {
      id: 'relative_wealth',
      title: 'Relative vs Absolute Wealth 📊',
      color: '#00E5FF',
      bgGradient: ['#002025', '#000A0A'],
      icon: '📊',
      svgIcon: 'eye',
      content: "Studies show humans care very little about **Absolute Wealth** (how much you actually have). We care almost entirely about **Relative Wealth** (how much you have *compared to your neighbor*).\n\nIf you make $100,000 but all your friends make $200,000, you feel poor and greedy for more. If you make $50,000 but all your friends make $25,000, you feel rich and satisfied.\n\nGreed is largely driven by status anxiety, not actual physical need. 👑",
      highlight: "We don't want to be rich; we want to be richer than the people around us.",
    },
    {
      id: 'zero_sum',
      title: 'Zero-Sum vs Positive-Sum 🥧',
      color: '#D4A74A',
      bgGradient: ['#201500', '#050500'],
      icon: '🥧',
      svgIcon: 'hash',
      content: "There are two ways to view the world:\n\n1. **Zero-Sum (The Greedy Mindset):** The world is a pie. For me to get a bigger slice, I have to take it from you. \n2. **Positive-Sum (The Abundance Mindset):** The world is an oven. We can bake more pies! If we invent new technology or skills, we *both* win.\n\nGreedy people operate in a Zero-Sum reality. They hoard, lie, and cheat because they believe wealth is limited. Visionary people operate in Positive-Sum realities. 🤝",
      highlight: "Wealth is not finite. It is created through human innovation.",
    },
    {
      id: 'diminishing_returns',
      title: 'The Law of Diminishing Returns 📉',
      color: '#A855F7',
      bgGradient: ['#150025', '#05000A'],
      icon: '📉',
      svgIcon: 'chart',
      content: "Economics defines **Marginal Utility** as the joy you get from *one more unit* of something.\n\n• The first slice of pizza is amazing (10/10 joy) 🍕.\n• The second is good (7/10) 🍕.\n• The 5th slice makes you sick (-2/10) 🤢.\n\nMoney works the same way. Moving from $20k to $60k a year changes your life completely. Moving from $1M to $2M changes almost nothing. Greed is the irrational pursuit of the 5th slice of pizza. 💸",
      highlight: "After your basic needs are met, the psychological ROI of money plummets.",
    },
    {
      id: 'endowment_effect',
      title: 'The Endowment Effect 📦',
      color: '#4ECDC4',
      bgGradient: ['#002020', '#000A0A'],
      icon: '📦',
      svgIcon: 'box',
      content: "Why is it so hard to give things away, even if we don't use them?\n\nThe **Endowment Effect** is a cognitive bias where we value an item *higher* simply because we own it. We feel the pain of losing $100 about twice as intensely as the joy of finding $100 (Loss Aversion).\n\nGreed isn't just about getting more; it's the sheer biological terror of losing what we already hold. 🛑",
      highlight: "The fear of losing what you have is stronger than the desire to get more.",
    },
    {
      id: 'scarcity_mindset',
      title: 'The Scarcity Tax 🧠',
      color: '#FF007F',
      bgGradient: ['#300015', '#0A0005'],
      icon: '🧠',
      svgIcon: 'brain',
      content: "Psychologists point out that having a 'Scarcity Mindset' literally lowers your IQ.\n\nWhen you are stressed about money or obsessed with hoarding, your brain constantly runs background anxiety processes. This 'bandwidth tax' makes you worse at making long-term decisions.\n\nGreed traps you in short-term thinking. You steal \$1 today, destroying the trust that would have made you \$1,000 tomorrow. 📉",
      highlight: "Greedy people actually make less money long-term because they destroy trust.",
    },
    {
      id: 'the_antidote',
      title: 'The Antidote: Generosity 🕊️',
      color: '#81C784',
      bgGradient: ['#0A200A', '#050A05'],
      icon: '🕊️',
      svgIcon: 'heartbeat',
      content: "The biological antidote to the Scarcity Trap is Generosity.\n\nWhen you give something away—time, money, or knowledge—you are sending a powerful signal to your own subconscious brain: *'I have enough.'*\n\nThis shuts down the 'survive winter' alarm in the Amygdala. It lowers cortisol, spikes oxytocin, and pulls you entirely off the Hedonic Treadmill. It is the ultimate psychological hack. 💡",
      highlight: "Generosity is the ultimate proof to your own brain that you have survived.",
    },
    {
      id: 'wealth_paradox',
      title: 'The Wealth Paradox 🧩',
      color: '#F39C12',
      bgGradient: ['#2A1A00', '#05050A'],
      icon: 'help-circle',
      svgIcon: 'eye',
      content: "We assume that getting richer will solve all our problems. But psychologists have discovered the **Wealth Paradox**: as your wealth increases, your problems don't disappear; they just change form.\n\nInstead of worrying about paying rent, you worry about inflation, taxes, lawsuits, and whether your friends actually like you or just like your money.\n\nGreed promises an endpoint of 'zero stress', but this endpoint is a mathematical impossibility. Wealth buys comfort, but it does not buy peace.",
      highlight: "Money buys you a better class of problems, but it doesn't eliminate problems."
    },
    {
      id: 'freedom_metric',
      title: 'The Freedom Metric ⏳',
      color: '#9B59B6',
      bgGradient: ['#1A0B2E', '#05050A'],
      icon: 'clock',
      svgIcon: 'star',
      content: "The ultimate cure for greed is redefining how you measure wealth.\n\nMost people measure wealth in dollars. The truly wealthy measure it in **Time and Freedom**.\n\nIf you make $500,000 a year but work 80 hours a week and hate your life, you are time-poor. If you make $60,000 a year but control your own schedule, have dinner with your family, and sleep 8 hours, you are infinitely wealthier.\n\nStop hoarding paper and start hoarding your own time.",
      highlight: "True wealth is waking up and saying: 'I can do whatever I want today.' ⏳"
    }
  ],

  lab: {
    title: "The Hedonic Treadmill Lab 🏃‍♂️",
    description: "Manage a growing portfolio! As you acquire 'Wealth', your 'Expectation Baseline' rises to meet it. If your wealth doesn't grow fast enough to beat your expectations, you lose Happiness! Will you hoard purely for status, or engage in 'Positive Sum' actions to reset your treadmill? 💎📈",
    hint: "Use the 'Give to Others' button. Even though it costs you Wealth, it violently lowers your 'Expectation Baseline', bringing massive Happiness!",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Exposes the exact Marginal Utility Diminishment factor and the algorithm linking Relative Status to baseline shifts.",
  },

  doYouKnowWhy: [
    {
      id: 'dyk1',
      question: "Do you know why winning the lottery often ruins people's lives? 🎰",
      answer: "The Hedonic Treadmill! By skipping directly to infinite wealth, their baseline 'normal' instantly skyrockets. Now, normal things—a good cup of coffee, a standard vacation, hanging out with friends—provide absolutely zero dopamine because the brain's expectation is so ridiculously high. 📉",
      emoji: '🎢',
    },
    {
      id: 'dyk2',
      question: "Do you know why dragons in mythology are always sitting on a pile of gold? 🐉",
      answer: "Ancient cultures used dragons to symbolize Greed. A dragon hoards gold, yet it has completely no use for it (it doesn't buy things or eat gold). The symbolism is that raw greed turns humans into monsters who hoard resources violently purely for the sake of hoarding, killing the community. 🛡️",
      emoji: '🐉',
    },
    {
      id: 'dyk3',
      question: "Do you know why you feel poorer when using Instagram, even if your bank account hasn't changed? 📱",
      answer: "Relative Wealth Bias. Evolution wires us to constantly assess our rank in the 'tribe'. But your 'tribe' used to be 50 normal people. Today, Instagram shows you the top 0.01% richest, most beautiful humans on earth. Your brain calculates 'I am at the bottom of the tribe' and triggers massive status anxiety. 📉",
      emoji: '👁️',
    },
    {
      id: 'dyk4',
      question: "Do you know why 'Buy One Get One Free' makes us buy things we don't even like? 🛒",
      answer: "Greed and Loss Aversion. The brain's 'scarcity scanner' views 'Free' not as a bonus, but as an absolute necessity for survival. Skipping something 'free' registers in the ancient brain as a foolish, dangerous loss of winter supplies! ❄️",
      emoji: '🎁',
    },
    {
      id: 'dyk5',
      question: "Do you know why giving money away is proven to make people happier than spending it on themselves? 💡",
      answer: "Evolution rewards community survival! When you share, your brain releases a massive dose of oxytocin to encourage tribal bonding. Furthermore, it tricks your amygdala into deep safety: 'If I am giving food away, winter must be over, and we must be safe!' 🕊️",
      emoji: '🧬',
    },
  ],

  quiz: [
    { id: 'q1', question: "From an evolutionary perspective, what is the origin of greed?", options: ["Preference for shiny objects", "Survival mechanism for hoarding resources", "Disease invented in the 1800s", "Desire to impress wild animals"], answer: 1, explanation: "Greed kept our ancestors alive when resources were completely uncertain! ❄️" },
    { id: 'q2', question: "What is the 'Hedonic Treadmill'?", options: ["Exercise equipment for gyms", "Returning to baseline happiness levels", "Type of complex financial fraud", "Method for making unlimited money"], answer: 1, explanation: "You adjust to your new 'normal' incredibly fast, leaving you constantly running for the 'next' hit. 🏃‍♂️" },
    { id: 'q3', question: "What do humans generally care about more when assessing their social standing?", options: ["Total amount of personal wealth", "Wealth compared to social peers", "Physical weight of a house", "Specific color of paper currency"], answer: 1, explanation: "Status anxiety is relative. We want to be higher on the ladder than the guy next to us. 📊" },
    { id: 'q4', question: "A 'Zero-Sum' mindset believes:", options: ["Nobody should possess any money", "Wealth is infinite for everyone", "Fixed pie where others lose", "Mathematical concepts are totally irrelevant"], answer: 2, explanation: "Zero-Sum thinking leads to hoarding, cheating, and backstabbing because 'there isn't enough.' 🥧" },
    { id: 'q5', question: "What does the 'Law of Diminishing Marginal Utility' mean regarding money?", options: ["Currency bills grow with wealth", "Every dollar brings equal joy", "Extra money brings less joy", "Wealth makes people physically invisible"], answer: 2, explanation: "The first slice of pizza is amazing. The 5th makes you sick. Money follows the exact same curve! 📉" },
    { id: 'q6', question: "What is the 'Endowment Effect'?", options: ["Valuing items because you own them", "Receiving a regular monthly salary", "Preferring expensive luxury brand names", "Donating money to local charities"], answer: 0, explanation: "Once we 'own' it, our brain is terrified of losing it, making us irrationally greedy to keep it! 📦" },
    { id: 'q7', question: "What is a proven biological 'antidote' that shuts down the brain's scarcity alarm?", options: ["Drinking large amounts of coffee", "Checking a digital bank app", "Practicing acts of raw generosity", "Purchasing a very fast car"], answer: 2, explanation: "Generosity hacks the brain, signaling 'We have enough to share, we are inherently safe.' 🕊️" },
    { id: 'q8', question: "How does a 'Scarcity Mindset' affect your cognitive abilities?", options: ["Increasing overall cognitive genius levels", "Lowering IQ and short-term focus", "Improving complex mathematical skills", "Improving quality of nightly sleep"], answer: 1, explanation: "The 'bandwidth tax' of constantly worrying about scarcity makes you terrible at long-term decisions. 🧠" },
    { id: 'q9', question: "Why do lottery winners often return to their original baseline of happiness (or lower) within a year?", options: ["The prize money is counterfeit", "Adapting to higher expectation levels", "Forgetting where money is stored", "Government seizure of all winnings"], answer: 1, explanation: "By skipping the 'climb', they destroy their ability to enjoy normal daily rewards. 🎢" },
    { id: 'q10', question: "In mythology, a dragon hoarding gold it cannot use is a symbol representing:", options: ["Effective personal financial management", "Destructive greed harming the community", "Possessing a strong immune system", "Natural desire to fly high"], answer: 1, explanation: "The dragon is the ultimate warning: hoarding without purpose turns you into a monster. 🐉" },
    { id: 'q11', question: "If you receive a 20% pay raise, the Hedonic Treadmill predicts that:", options: ["Permanent twenty percent happiness increase", "Feeling sad about the raise", "Adapting to the new amount", "Quitting the current job immediately"], answer: 2, explanation: "Your 'enough' target just moved 20% further away! 🏃‍♂️" },
    { id: 'q12', question: "A 'Positive-Sum' thinker believes:", options: ["Stealing from others to win", "Creating value for everyone's benefit", "Winning only when others lose", "Believing the total pie shrinks"], answer: 1, explanation: "Abundance mindsets build companies and technology that grows the pie for everyone! 🤝" },
    { id: 'q13', question: "Why does social media make us intuitively feel poorer?", options: ["High cost of mobile phones", "Constant comparison to elite wealth", "Theft of personal user data", "Spending money on mobile apps"], answer: 1, explanation: "Your ancient brain thinks the people on Instagram are in your local 'tribe', destroying your perceived status. 👁️" },
    { id: 'q14', question: "Loss Aversion means:", options: ["Misplacing your house keys", "Equal joy and pain levels", "Loss hurts more than gain", "Enjoying the act of losing"], answer: 2, explanation: "Our brains evolved to desperately avoid loss, because in winter, a loss meant death! ❄️" },
    { id: 'q15', question: "What happens to your dopamine system when you act greedily and 'win' in a zero-sum game?", options: ["Feeling eternally peaceful and calm", "Short spikes requiring repeated action", "Stopping all dopamine production entirely", "Growing physical wings on back"], answer: 1, explanation: "Taking from others provides the 'hit', but it relies entirely on the treadmill mechanic. 📉" },
    { id: 'q16', question: "Which hormone is associated with the 'antidote' of generosity?", options: ["The hormone cortisol", "The hormone adrenaline", "The hormone oxytocin", "The hormone melatonin"], answer: 2, explanation: "Oxytocin creates warmth, bonding, and a deep sense of peaceful security replacing the anxiety of greed. 🧬" },
    { id: 'q17', question: "According to behavioral economics, true psychological wealth is achieved when:", options: ["Possessing one billion dollars", "Purchasing a private tropical island", "Desiring less than you possess", "Owning many luxury sports cars"], answer: 2, explanation: "Wealth is a ratio: What you have / What you desire. To get rich, you can either get more Money, or desire less! 💡" },
    { id: 'q18', question: "Why do 'Buy One Get One Free' deals hack the brain so easily?", options: ["Hating all free items", "Triggering ancient survival hoarding instincts", "Finding mathematics fun and easy", "Hypnotic effects of red colors"], answer: 1, explanation: "Your brain views passing up a 'free' resource as a dangerous failure to hoard! 🛒" },
    { id: 'q19', question: "What is the primary danger of operating entirely out of a 'Scarcity Mindset'?", options: ["Becoming far too generous", "Sacrificing trust for short-term gain", "Becoming a religious monk", "Losing significant body weight"], answer: 1, explanation: "Greed forces you to betray others, which ultimately destroys your ability to succeed in society. 🛑" },
    { id: 'q20', question: "What does the phrase 'Comparison is the thief of joy' relate to?", options: ["Concept of loss aversion", "The Hedonic Treadmill effect", "Relative Wealth bias theory", "Positive sum game strategy"], answer: 2, explanation: "When you compare (Relative Wealth), you always find someone doing better, instantly destroying your happiness. 📊" },
  ],

  relatedTopics: ['happiness_science', 'manipulation_tactics', 'earn_money'],
};
