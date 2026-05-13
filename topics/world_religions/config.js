// ─────────────────────────────────────────────────────────
//  TOPIC: WORLD RELIGIONS COMPARED
//  Category: Religion & God
//  Standard: v2.0 Extreme (15 Cards, 5 Facts, 20 Questions)
// ─────────────────────────────────────────────────────────

export default {
  id: 'world_religions',
  title: 'World Religions Compared',
  subtitle: 'An honest, side-by-side map of humanity\'s deepest beliefs 🌍🕊️',
  emoji: '🌍',
  category: 'Religion & God',
  accentKey: 'world_religions',

  hook: {
    question: "If you were born in Saudi Arabia, you'd almost certainly be Muslim. In India, Hindu. In Brazil, Christian. In Japan, Buddhist/Shinto. Every person on Earth is absolutely CONVINCED their religion is the right one — so how can they all be right?",
    reveal: "They can't — at least not in the literal, factual sense. If Christianity says Jesus is God, and Islam says he's just a prophet, both claims cannot simultaneously be true.\n\nBUT — virtually every major religion shares the SAME deep ethical core: Don't kill, don't steal, help the weak, be honest, practice compassion. The 'Golden Rule' appears in EVERY religion independently.\n\nThis suggests that religions may be different LANGUAGES describing the same fundamental human moral instinct — like different maps of the same mountain, drawn from different sides. 🗺️⛰️",
    emoji: '🤔',
  },

  theory: [
    {
      id: 'christianity',
      title: "Christianity — Largest Religion on Earth ✝️",
      color: '#2196F3',
      bgGradient: ['#001530', '#00050A'],
      icon: 'globe',
      svgIcon: 'star',
      content: "**Followers**: 2.4 billion (31% of humanity)\n**Founded**: ~30 CE by followers of Jesus of Nazareth\n**Core Belief**: Jesus Christ is the Son of God who died for humanity's sins and was resurrected. Salvation comes through faith in Jesus.\n**Holy Book**: The Bible (Old + New Testaments)\n**Branches**: Catholic (1.3B), Protestant (~900M), Orthodox (~260M)\n**Afterlife**: Heaven or Hell based on faith/deeds\n**Key Strength**: Universal message of unconditional love and forgiveness\n**Key Criticism**: Historical violence (Crusades, Inquisition), internal division into 45,000+ denominations",
      highlight: "Christianity grew from 120 people to 2.4 billion — the most successful 'startup' in human history. 📈",
    },
    {
      id: 'islam',
      title: "Islam — Fastest Growing Religion 🌙",
      color: '#4CAF50',
      bgGradient: ['#0A1F0A', '#050A05'],
      icon: 'moon',
      svgIcon: 'globe',
      content: "**Followers**: 1.9 billion (24% of humanity)\n**Founded**: 610 CE by Prophet Muhammad in Mecca\n**Core Belief**: There is only one God (Allah), and Muhammad is His final prophet. Complete submission (Islam = 'submission') to God's will.\n**Holy Book**: The Quran (believed to be God's literal, unaltered word)\n**Branches**: Sunni (~87%), Shia (~13%)\n**Five Pillars**: Shahada (declaration), Salat (prayer 5x daily), Zakat (charity), Sawm (Ramadan fasting), Hajj (pilgrimage)\n**Afterlife**: Jannah (Paradise) or Jahannam (Hell)\n**Key Strength**: Simplicity, equality (no clergy hierarchy), strong community\n**Key Criticism**: Perceived rigidity on social issues, Islamophobia conflates extremism with mainstream faith",
      highlight: "Muslims pray 5 times a day, always facing Mecca — meaning 1.9 billion people simultaneously orient themselves to one point on Earth. 🧭",
    },
    {
      id: 'hinduism',
      title: "Hinduism — World's Oldest Living Religion 🕉️",
      color: '#FF9800',
      bgGradient: ['#1F1500', '#0A0800'],
      icon: 'sun',
      svgIcon: 'flame',
      content: "**Followers**: 1.2 billion (15% of humanity)\n**Founded**: ~2000–1500 BCE (no single founder)\n**Core Belief**: One ultimate reality (**Brahman**) manifests in infinite forms. The soul (**Atman**) is eternal and undergoes reincarnation until it achieves liberation (**Moksha**).\n**Holy Texts**: Vedas, Upanishads, Bhagavad Gita, Mahabharata, Ramayana\n**Key Concepts**: Karma (actions have consequences), Dharma (duty/righteousness), Samsara (cycle of rebirth)\n**Multiple Paths**: Bhakti (devotion), Jnana (knowledge), Karma (action), Raja (meditation)\n**Key Strength**: Extraordinary flexibility — can be monotheistic, polytheistic, pantheistic, or even atheistic\n**Key Criticism**: Caste system (historically oppressive, now legally abolished but socially persistent)",
      highlight: "Hinduism has no single founder, no single scripture, no single creed, and no centralized authority — yet 1.2 billion people identify with it. 🌊",
    },
    {
      id: 'buddhism',
      title: "Buddhism — Religion Without a God? 🧘",
      color: '#FF5722',
      bgGradient: ['#1F0A00', '#0A0500'],
      icon: 'lotus',
      svgIcon: 'eye',
      content: "**Followers**: 500 million (7% of humanity)\n**Founded**: ~500 BCE by Siddhartha Gautama (the Buddha) in India\n**Core Belief**: Life is suffering (Dukkha). Suffering is caused by desire/attachment. Suffering can end. The path to ending it is the **Eightfold Path**.\n**Key Concepts**: Four Noble Truths, Eightfold Path, Nirvana (liberation from suffering), Anatta (no permanent self)\n**Branches**: Theravada (oldest, Southeast Asia), Mahayana (East Asia), Vajrayana (Tibet)\n**Holy Texts**: Tipitaka (Pali Canon), Sutras\n**Key Strength**: Entirely focused on reducing suffering through mental discipline — compatible with science\n**Key Criticism**: Can be perceived as passive or world-denying",
      highlight: "The Buddha explicitly refused to answer whether God exists — he considered it an unhelpful distraction from ending suffering. 🤫",
    },
    {
      id: 'judaism',
      title: "Judaism — Mother of Monotheism ✡️",
      color: '#6366F1',
      bgGradient: ['#0A0A30', '#050010'],
      icon: 'star',
      svgIcon: 'scroll',
      content: "**Followers**: 15 million (~0.2% of humanity)\n**Founded**: ~2000 BCE by Abraham (traditionally)\n**Core Belief**: There is ONE God who made a covenant (contract) with the Jewish people. They must follow His law (Torah) in exchange for being His 'chosen' people.\n**Holy Book**: Torah (first 5 books), Talmud (rabbinic commentary)\n**Branches**: Orthodox, Conservative, Reform\n**Key Concepts**: Covenant, Torah law (613 commandments), Tikkun Olam (repairing the world)\n**Key Strength**: Emphasis on education, debate, questioning (even arguing with God is acceptable!)\n**Key Criticism**: Exclusivist 'chosen people' concept can seem elitist\n\nDisproportionate cultural influence: Jews (~0.2% of population) have won ~22% of Nobel Prizes.",
      highlight: "Judaism encourages questioning and debating God — the name 'Israel' literally means 'one who struggles with God'. 💪",
    },
    {
      id: 'sikhism',
      title: "Sikhism — Equality Above All ☬",
      color: '#FFC107',
      bgGradient: ['#1F1800', '#0A0A00'],
      icon: 'shield',
      svgIcon: 'users',
      content: "**Followers**: 30 million\n**Founded**: 1469 CE by Guru Nanak in Punjab, India\n**Core Belief**: One God for all people regardless of caste, creed, or gender. Service to others is the highest form of worship.\n**Holy Book**: Guru Granth Sahib (considered a living Guru)\n**Key Concepts**: Seva (selfless service), Langar (free community kitchen open to ALL), Equality of ALL humans\n**Five Ks**: Kesh (uncut hair), Kanga (comb), Kara (steel bracelet), Kachera (shorts), Kirpan (ceremonial sword)\n**Key Strength**: Radical egalitarianism — Sikh temples feed anyone regardless of race, religion, or wealth\n**Key Criticism**: Often mistaken for Muslims or Hindus due to turbans, leading to discrimination",
      highlight: "Sikh temples feed over 100,000 people DAILY for free at the Golden Temple in Amritsar alone! 🍽️",
    },
    {
      id: 'golden_rule',
      title: "The Golden Rule — Universal Ethics 🌐",
      color: '#E91E63',
      bgGradient: ['#1F0010', '#0A0008'],
      icon: 'heart',
      svgIcon: 'heart',
      content: "Every major religion independently discovered the same core ethical principle:\n\n• **Christianity**: 'Do unto others as you would have them do unto you.' (Matthew 7:12)\n• **Islam**: 'No one of you is a believer until he desires for his brother what he desires for himself.' (Hadith)\n• **Hinduism**: 'This is the sum of duty: do not do to others what would cause pain if done to you.' (Mahabharata 5:1517)\n• **Buddhism**: 'Hurt not others with that which pains yourself.' (Udanavarga 5:18)\n• **Judaism**: 'What is hateful to you, do not do to your neighbor.' (Talmud, Shabbat 31a)\n• **Sikhism**: 'I am a stranger to no one, and no one is a stranger to me.' (Guru Granth Sahib)\n\nThis convergence suggests a universal human moral instinct that transcends any one religion.",
      highlight: "The Golden Rule appears in every civilisation Earth has ever produced — it may be hardwired into human DNA. 🧬",
    },
    {
      id: 'creation_myths',
      title: "Creation Stories — Different Maps, Same Mountain? 🌋",
      color: '#9C27B0',
      bgGradient: ['#1A0025', '#0A0010'],
      icon: 'galaxy',
      svgIcon: 'planet',
      content: "Every religion answers: 'How did we get here?'\n\n• **Christianity/Islam/Judaism**: God created the universe from nothing ('Let there be light')\n• **Hinduism**: Brahma creates, Vishnu preserves, Shiva destroys in infinite cycles\n• **Buddhism**: The universe has no beginning — it's an endless cycle of arising and passing\n• **Indigenous Australian**: Dreamtime — ancestral beings sang the world into existence\n• **Norse**: The world formed from the body of the giant Ymir\n• **Modern Science**: Big Bang, 13.8 billion years ago\n\nNotice: Almost ALL include creation from chaos/nothing, and most describe cyclical or purposeful creation — not random accident.",
      highlight: "The Hindu concept of cyclical cosmic creation/destruction mirrors the scientific model of an oscillating universe. 🔄",
    },
    {
      id: 'god_concepts',
      title: "Concepts of God — How Different? 🎭",
      color: '#00BCD4',
      bgGradient: ['#001520', '#000A0A'],
      icon: 'eye',
      svgIcon: 'eye',
      content: "Religions imagine God in fundamentally different ways:\n\n• **Personal God** (Christianity, Islam, Judaism): God is a conscious being who hears prayers, has a will, judges, and intervenes\n• **Impersonal Absolute** (Hinduism — Brahman): God is the fundamental reality underlying everything, like an ocean; individual souls are waves\n• **No God Needed** (Buddhism, Jainism): The universe operates on natural laws (karma, cause-and-effect); a creator is unnecessary\n• **Pantheism** (Spinoza, some Hinduism): God IS the universe — nature and God are identical\n• **Deism**: God created the universe then stepped back; no intervention or miracles\n\nThese are not minor variations — they are fundamentally incompatible worldviews.",
      highlight: "The Christian God is deeply personal ('Our Father'). The Hindu Brahman is beyond personality. Same word 'God' — completely different concepts. 🏷️",
    },
    {
      id: 'worship_practices',
      title: "Worship Practices — How Humans Connect 🙏",
      color: '#FF9800',
      bgGradient: ['#1F1500', '#0A0800'],
      icon: 'users',
      svgIcon: 'star',
      content: "**Christianity**: Sunday church services, communion, baptism, prayer, hymns\n**Islam**: 5 daily prayers (salat), Friday Jummah, Ramadan fasting, Hajj pilgrimage\n**Hinduism**: Puja (shrine worship), temple visits, festivals (Diwali, Holi), mantras, yoga\n**Buddhism**: Meditation, chanting, mindfulness, temple offerings, retreats\n**Judaism**: Shabbat (Saturday rest), synagogue services, kosher diet, festivals (Passover, Yom Kippur)\n**Sikhism**: Gurdwara services, communal singing (Kirtan), Langar (free meals)\n\nCommon elements across ALL:\n• Gathered community\n• Rhythmic repetition (chanting, prayer, singing)\n• Dietary restrictions\n• Pilgrimage to sacred sites\n• Rites of passage (birth, marriage, death)",
      highlight: "Rhythmic group activities (chanting, singing) release oxytocin — the same 'bonding hormone' released during hugs. Faith literally chemically bonds communities. 🧪",
    },
    {
      id: 'women_religion',
      title: "Women in World Religions — A Complex Legacy 👩",
      color: '#E91E63',
      bgGradient: ['#1F0010', '#0A0008'],
      icon: 'users',
      svgIcon: 'shield',
      content: "Every major religion has a complicated relationship with gender:\n\n• **Early Christianity**: Women like Mary Magdalene were leaders. Later, the Church excluded them from priesthood.\n• **Islam**: The Quran gave women property rights 1,400 years before Europe did. Cultural practices later restricted women beyond Quranic mandates.\n• **Hinduism**: Goddesses (Durga, Lakshmi, Saraswati) are central. Yet patriarchal practices like sati (widow burning) existed.\n• **Buddhism**: The Buddha hesitantly ordained nuns. Some Buddhist societies restricted women's roles.\n• **Sikhism**: Guru Nanak explicitly declared men and women equal — revolutionary for the 15th century.\n\nPattern: Most founders preached equality; later followers restricted it.",
      highlight: "Khadijah, Prophet Muhammad's first wife, was a wealthy businesswoman who proposed marriage to HIM — a detail often overlooked in discussions of Islam and women. 💼",
    },
    {
      id: 'violence_peace',
      title: "Violence & Peace — The Dark Side ⚔️",
      color: '#F44336',
      bgGradient: ['#1F0505', '#0A0000'],
      icon: 'alert',
      svgIcon: 'alert',
      content: "Every religion preaches peace. Every religion has been used to justify violence:\n\n• **Christianity**: Crusades, Inquisition, witch trials, colonization justified by 'saving souls'\n• **Islam**: Jihad misinterpreted; vast majority of Islamic history was scholarly and tolerant (Islamic Golden Age)\n• **Hinduism**: Caste violence, communal riots, Hindutva nationalism\n• **Buddhism**: Rohingya genocide in Myanmar by Buddhist-majority military\n• **Judaism**: Israeli-Palestinian conflict involves religious territorial claims\n\nThe uncomfortable truth: Religion doesn't CAUSE violence. HUMANS cause violence — and they use whatever ideology is available (religion, nationalism, communism) to justify it.",
      highlight: "The 20th century's deadliest regimes (Stalin, Mao, Pol Pot) were ATHEIST — proving that humans commit atrocities with or without God. 💀",
    },
    {
      id: 'mysticism',
      title: "Mysticism — Where All Religions Converge 🌀",
      color: '#9C27B0',
      bgGradient: ['#1A0025', '#0A0010'],
      icon: 'sparkle',
      svgIcon: 'eye',
      content: "At the mystical level, religions converge in astonishing ways:\n\n• **Christian Mystics** (Meister Eckhart): 'The eye through which I see God is the same eye through which God sees me.'\n• **Sufi Islam** (Rumi): 'You are not a drop in the ocean. You are the entire ocean in a drop.'\n• **Hindu Vedanta**: 'Tat Tvam Asi' — 'You ARE that [ultimate reality].'\n• **Zen Buddhism**: 'Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.'\n• **Jewish Kabbalah**: God contracted Himself to create space for the world (Tzimtzum).\n\nMystics from completely unconnected traditions describe the SAME experience: dissolution of self, unity with everything, infinite love.",
      highlight: "Aldous Huxley called this convergence 'The Perennial Philosophy' — one universal truth expressed in different cultural costumes. 🎭",
    },
    {
      id: 'demographics',
      title: "Religion by the Numbers — Who Believes What? 📊",
      color: '#2196F3',
      bgGradient: ['#001530', '#00050A'],
      icon: 'chart',
      svgIcon: 'chart',
      content: "Global religious demographics (2024):\n\n• **Christianity**: 2.4 billion (31.1%)\n• **Islam**: 1.9 billion (24.9%)\n• **No Religion**: 1.2 billion (15.6%)\n• **Hinduism**: 1.2 billion (15.2%)\n• **Buddhism**: 500 million (6.6%)\n• **Folk Religions**: 430 million (5.6%)\n• **Other**: 61 million (0.8%)\n• **Judaism**: 15 million (0.2%)\n• **Sikhism**: 30 million (0.4%)\n\nProjection by 2050:\n• Islam will nearly equal Christianity in followers\n• 'Nones' will grow in the West but SHRINK globally (religious populations have higher birth rates)\n• Christianity will shift its center from Europe to Africa and Asia",
      highlight: "Africa will contain more Christians than Europe and North America COMBINED by 2050. 🌍",
    },
    {
      id: 'can_all_be_right',
      title: "Can All Religions Be True? 🤷",
      color: '#8BC34A',
      bgGradient: ['#0A1F05', '#050A02'],
      icon: 'question',
      svgIcon: 'compass',
      content: "Three philosophical positions address this:\n\n1. **Exclusivism**: Only ONE religion is true. All others are wrong. (Most traditional believers)\n2. **Inclusivism**: One religion is MOST correct, but others contain partial truths. (Vatican II's position)\n3. **Pluralism**: All religions are different paths to the same ultimate reality — like blind men touching different parts of an elephant. (John Hick)\n\nThe pluralist view is comforting but philosophically problematic: Christianity says Jesus is God; Islam says he's not. These are binary, mutually exclusive claims.\n\nPerhaps the most honest answer: All religions accurately identify the same HUMAN needs (meaning, morality, community, death) — but their specific truth-claims cannot all be simultaneously correct.",
      highlight: "The parable of the Blind Men and the Elephant originated in Buddhist and Jain texts — ironically making even the 'all religions are equal' metaphor come from a specific religion. 🐘",
    },
  ],

  lab: {
    title: "The Belief Spectrum Analyzer 🌐📊",
    description: "Explore what religions agree and disagree on! Swipe through core questions (God, afterlife, morality, purpose) and see how each religion answers. Discover where they converge and where they diverge.",
    hint: "Pay attention to how MYSTICAL traditions agree even when mainstream theologies diverge! The deeper you go, the more they converge.",
    scientistModeHint: "Scientist Mode 🧑‍🔬: Unlocks comparative theology overlap scores, Venn diagram coefficients, and demographic growth projections.",
  },

  doYouKnowWhy: [
    { id: 'dyk1', question: "Do you know why Christmas is on December 25th even though Jesus was probably NOT born then? 🎄", answer: "December 25th was the Roman festival of Sol Invictus (the Unconquered Sun) — celebrating the winter solstice when days start getting longer. When Christianity became Rome's state religion, Church leaders strategically placed Jesus's birthday on the most popular pagan holiday to make conversion easier. The actual birth date of Jesus is unknown — likely spring or fall based on shepherd references. 🐑", emoji: '☀️' },
    { id: 'dyk2', question: "Do you know why Islam prohibits images of Prophet Muhammad? 🖼️", answer: "Islam forbids depicting Muhammad (and often any living being) to prevent IDOLATRY — the worship of images instead of God. The reasoning: If people create images of the Prophet, they might start worshipping the image instead of God. This is why Islamic art evolved into the most sophisticated geometric and calligraphic art in human history — impossibly beautiful, without a single human face. 🔷", emoji: '📐' },
    { id: 'dyk3', question: "Do you know why Hindus worship cows as sacred? 🐄", answer: "In ancient agrarian India, cows provided EVERYTHING: milk, butter, ghee (fuel), dung (fertilizer and building material), and oxen (plowing). Killing a cow was economic suicide — it was destroying your tractor, dairy, fuel source, and fertilizer factory in one act. Over millennia, this practical survival rule became sacralized into a religious commandment. Economics became theology. 🌾", emoji: '🥛' },
    { id: 'dyk4', question: "Do you know why Jewish Kosher and Islamic Halal dietary laws are almost identical? 🥩", answer: "Both Judaism and Islam descended from the same Abrahamic tradition and share the same patriarch (Abraham/Ibrahim). Both prohibit pork, require animal slaughter by throat-cutting with a prayer, and ban blood consumption. Originally, these rules were likely hygienic — undercooked pork carried trichinosis, and proper slaughter drains blood (reducing bacteria). Hygiene became holy law. 🧬", emoji: '🍖' },
    { id: 'dyk5', question: "Do you know why Buddhism has NO concept of God yet is still considered a 'religion'? 🧘", answer: "The Buddha explicitly avoided metaphysical questions about God, creation, and the afterlife — calling them 'unanswerable distractions' from the practical project of ending suffering. Buddhism is technically a philosophy of mind. It became classified as a 'religion' because it developed temples, rituals, monks, sacred texts, and communal practices — the social STRUCTURES of religion, even without the usual theological content. 🏛️", emoji: '🤔' },
  ],

  quiz: [
    { id: 'q1', question: "The world's LARGEST religion by number of followers is:", options: [
        "Islam",
        "Hinduism",
        "Christianity",
        "Buddhism"
      ], answer: 2, explanation: "Christianity has been the largest religion for centuries — though Islam is the fastest growing. ✝️" },
    { id: 'q2', question: "The world's OLDEST living major religion is:", options: [
        "Christianity",
        "Islam",
        "Hinduism",
        "Buddhism"
      ], answer: 2, explanation: "Hinduism has no single founding date — it evolved organically over millennia. 🕉️" },
    { id: 'q3', question: "Unlike most religions, Buddhism is unique because:", options: [
        "It has no temples",
        "Founder avoided the God question",
        "It has no followers",
        "It was founded in Europe"
      ], answer: 1, explanation: "The Buddha called metaphysical questions 'unanswerable distractions' from practical suffering-reduction. 🧘" },
    { id: 'q4', question: "The Golden Rule ('Treat others as you want to be treated') appears in:", options: [
        "Only Christianity",
        "Only Eastern religions",
        "Every major religion independently",
        "No religion"
      ], answer: 2, explanation: "This suggests a universal human moral instinct, not exclusive divine revelation. 🌐" },
    { id: 'q5', question: "Islam's Five Pillars are:", options: [
        "Five holy books",
        "Faith, prayer, charity, fasting, pilgrimage",
        "Five prophets",
        "Five temples"
      ], answer: 1, explanation: "These five simple, concrete practices give Islam extraordinary clarity and accessibility. 🌙" },
    { id: 'q6', question: "The Hindu concept of Karma means:", options: [
        "Luck",
        "Actions have consequences for lives",
        "Punishment",
        "A type of yoga"
      ], answer: 1, explanation: "Karma is a cosmic cause-and-effect law — not reward/punishment from a deity. ⚖️" },
    { id: 'q7', question: "Judaism is disproportionately influential because:", options: [
        "It has the most followers",
        "Spawned Christianity/Islam; high Nobel Prize winners",
        "It is the newest religion",
        "It controls the media"
      ], answer: 1, explanation: "Judaism's emphasis on education and debate created extraordinary intellectual output. ✡️" },
    { id: 'q8', question: "Sikhism's Langar practice is:", options: [
        "A form of meditation",
        "Free community kitchens for all",
        "A type of prayer",
        "A pilgrimage"
      ], answer: 1, explanation: "The Golden Temple in Amritsar feeds over 100,000 people daily — for free. ☬" },
    { id: 'q9', question: "Christmas was placed on December 25th to:", options: [
        "Celebrate Jesus's exact birthday",
        "Align with Roman pagan festival",
        "Honor the winter",
        "Celebrate snow"
      ], answer: 1, explanation: "Jesus was likely born in spring/fall. The date was strategic marketing. 🎄" },
    { id: 'q10', question: "Hindu sacred cow veneration originated from:", options: [
        "A divine commandment",
        "Cows' practical economic value",
        "Random tradition",
        "Buddhist influence"
      ], answer: 1, explanation: "Killing your tractor-dairy-fuel-factory was economic suicide. Practicality became theology. 🐄" },
    { id: 'q11', question: "The 20th century's DEADLIEST regimes (Stalin, Mao) prove that:", options: [
        "Atheism is evil",
        "Violence is a human problem",
        "Religion prevents violence",
        "Communism is a religion"
      ], answer: 1, explanation: "Humans use ANY available ideology to justify violence — religious or not. ⚔️" },
    { id: 'q12', question: "At the MYSTICAL level (Sufi, Vedanta, Zen, Kabbalah), religions:", options: [
        "Completely disagree",
        "Mystics describe similar experiences",
        "Don't have mystics",
        "Only disagree more"
      ], answer: 1, explanation: "Rumi, Meister Eckhart, and Upanishadic sages all describe dissolution of self and unity with everything. 🌀" },
    { id: 'q13', question: "Islam prohibits images of Prophet Muhammad to:", options: [
        "Hide his appearance",
        "Prevent idolatry of images",
        "Save on art costs",
        "Remain mysterious"
      ], answer: 1, explanation: "This drove Islamic art into breathtaking geometric and calligraphic masterpieces instead. 🔷" },
    { id: 'q14', question: "Jewish Kosher and Islamic Halal dietary laws are similar because:", options: [
        "Coincidence",
        "Shared Abrahamic, hygienic origins",
        "They copied each other",
        "All religions ban pork"
      ], answer: 1, explanation: "Abraham/Ibrahim is the shared patriarch. Practical hygiene rules became sacralized. 🥩" },
    { id: 'q15', question: "By 2050, the CENTER of global Christianity will shift to:", options: [
        "North America",
        "Europe",
        "Africa and Asia",
        "Australia"
      ], answer: 2, explanation: "Africa will have more Christians than Europe and North America combined. 🌍" },
    { id: 'q16', question: "Religious Pluralism argues that:", options: [
        "Only one religion is right",
        "All paths to ultimate reality",
        "Religion is false",
        "Science replaces religion"
      ], answer: 1, explanation: "Like blind men touching different parts of an elephant — each perceives a different truth. 🐘" },
    { id: 'q17', question: "The practical PROBLEM with religious pluralism is:", options: [
        "It's too optimistic",
        "Mutually exclusive truth-claims exist",
        "It's too complicated",
        "Religions refuse to communicate"
      ], answer: 1, explanation: "Ethical convergence is real. Theological convergence is logically impossible on some claims. 🏷️" },
    { id: 'q18', question: "Rhythmic group worship (chanting, singing) across ALL religions works because:", options: [
        "God prefers music",
        "It releases oxytocin, bonding communities",
        "It sounds nice",
        "Ancient tradition"
      ], answer: 1, explanation: "Religion is biologically effective — shared rhythm literally changes brain chemistry. 🧪" },
    { id: 'q19', question: "The FASTEST growing 'religious' category in Western countries is:", options: [
        "Islam",
        "Christianity",
        "Nones (no affiliation)",
        "Buddhism"
      ], answer: 2, explanation: "Many 'Nones' still believe in God — they reject institutions, not spirituality itself. 📉" },
    { id: 'q20', question: "If you were born in Saudi Arabia instead of where you actually were born, you would most likely be:", options: [
        "The same religion you are now",
        "Muslim; geography predicts religion",
        "Atheist",
        "Buddhist"
      ], answer: 1, explanation: "This geographical coincidence is one of the most challenging facts for any claim of religious exclusivism. 🗺️" },
  ],

  relatedTopics: ['how_religion_evolved', 'god_arguments', 'spirituality_vs_religion', 'eastern_philosophy'],
};
