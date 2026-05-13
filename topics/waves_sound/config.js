export default {
  id: 'waves_sound',
  title: 'Waves & Sound',
  subtitle: 'The invisible vibrations of the cosmos 🔊',
  emoji: '🔊',
  category: 'Foundations',
  accentKey: 'sound',

  hook: {
    question: "Did you know that in deep space, there is absolutely zero sound? Even if a massive hypergiant star violently explodes, it occurs in total silence! 🌌",
    reveal: "Sound is a mechanical wave, which strictly requires a physical medium—like air, water, or steel—to travel. It's essentially a chain reaction of trillions of atoms violently bumping into one another. Because outer space is a true vacuum with virtually no atoms, there's absolutely nothing to bump! Mechanical waves transfer energy, not matter, meaning the sound of your own voice is literally just energy moving through the atmosphere. 🗣️",
    emoji: '🎵',
  },

  theory: [
    { id: '1', title: 'What is a Wave?', color: '#FF9F1C', bgGradient: ['#2A1A00', '#05050A'], icon: '🌊', svgIcon: 'waves', content: "A wave is a physical disturbance that **transfers energy** from one place to another without permanently transferring any matter.\n\nThink of a massive stadium wave during a sports game: people stand up and sit right back down (moving locally in place), but the 'wave' travels around the entire giant stadium at high speed!", highlight: "Waves strictly transfer ENERGY, not physical matter. You don't get blown backwards by a loud speaker because the air isn't traveling to you, just the kinetic energy! ⚡" },
    { id: '2', title: 'Transverse vs Longitudinal', color: '#4FC9C0', bgGradient: ['#002A2A', '#05050A'], icon: '〰️', svgIcon: 'link', content: "In a **Transverse Wave** (like light or ripples on water), the particles vibrate perpendicularly to the direction the energy is travelling.\n\nIn a **Longitudinal Wave** (like Sound), the particles vibrate violently back and forth in the EXACT same direction the wave travels. This creates alternating pressure zones called **compressions** (high density) and **rarefactions** (low density).", highlight: "Sound is a longitudinal wave, meaning it literally pushes and pulls the air horizontally like an invisible slinky! 🔊" },
    { id: '3', title: 'Frequency, Pitch & Hertz', color: '#7B6FFF', bgGradient: ['#1A0A2A', '#05050A'], icon: '⏱️', svgIcon: 'chart', content: "**Frequency** is precisely how many wave cycles pass a fixed point per single second, measured in **Hertz (Hz)**.\n\nHigher frequency sounds possess a higher pitch (like a sharp whistle). Lower frequencies possess a deeper, lower pitch (like a heavy bass drum). The human ear can typically detect frequencies ranging from a low rumble of 20 Hz up to a shrill 20,000 Hz.", highlight: "As humans naturally age, the tiny hairs in the inner ear degrade, causing them to slowly lose the ability to hear high-frequency sounds completely! 👴" },
    { id: '4', title: 'Amplitude & Volume', color: '#FF4D6D', bgGradient: ['#2A0A0A', '#05050A'], icon: '📈', svgIcon: 'pulse', content: "**Amplitude** determines the sheer intensity or magnitude of the wave's disturbance. Simply put, it describes the height of the wave!\n\nIn relation to sound, amplitude directly dictates the **Volume** or loudness. A massive explosion pushes air molecules with incredible amplitude, generating a deafening sound. Amplitude is measured in Decibels (dB).", highlight: "The decibel scale is logarithmic—meaning a 20 dB sound is technically 10 times more powerful than a 10 dB sound! 💥" },
    { id: '5', title: 'The Speed of Sound', color: '#00D4FF', bgGradient: ['#001A2A', '#05050A'], icon: '✈️', svgIcon: 'target', content: "Sound travels at approximately **343 meters per second** through air at room temperature. But it's not a universal speed limit like light!\n\nSound travels substantially faster through denser materials where atoms are tightly packed. It travels at 1,500 m/s through water, and a staggering 5,000 m/s through solid steel! You will hear an approaching train through the steel tracks vastly sooner than through the air.", highlight: "If you observe lightning and count 3 seconds before thunder, the physical lightning strike occurred exactly 1 kilometer away! 🌩️" },
    { id: '6', title: 'The Doppler Effect', color: '#FFB347', bgGradient: ['#2A1A00', '#05050A'], icon: '🚑', svgIcon: 'lightning', content: "Have you ever noticed how an ambulance siren drops dramatically in pitch the exact moment it aggressively drives past you?\n\nThis is the **Doppler Effect**! As the vehicle races toward you, it 'catches up' to its own sound waves, physically squishing them together resulting in a higher frequency (pitch). As it leaves, the waves stretch out behind it, artificially lowering the pitch you hear.", highlight: "Police radar guns calculate your exact driving speed using the Doppler Effect, tracking how severely car metal compresses returning invisible radar waves! 🚓" },
    { id: '7', title: 'Resonance', color: '#39FF14', bgGradient: ['#0A2A0A', '#05050A'], icon: '🍷', svgIcon: 'sparkle', content: "Every physical object possesses a **natural frequency** at which it likes to naturally vibrate. \n\nIf you expose the object to external sound waves matching its exact natural frequency, the object absorbs the energy perfectly and begins vibrating violently with massively increasing amplitude. This phenomenon is called **Resonance**.", highlight: "Opera singers flawlessly shattering wine glasses with only their voice are actively wielding the destructive power of acoustic Resonance! 🎤" },
    { id: '8', title: 'Ultrasound & Infrasound', color: '#A855F7', bgGradient: ['#1A0A2A', '#05050A'], icon: '🦇', svgIcon: 'brain', content: "**Ultrasound** refers to frequencies higher than 20,000 Hz, completely inaudible to human ears. Bats and dolphins wield this for extreme echolocation, and doctors utilize it for non-invasive medical acoustic imaging.\n\n**Infrasound** involves deep frequencies below 20 Hz. Massive animals like Blue Whales and Elephants use these extreme low frequencies to communicate secretly across hundreds of miles of ocean or savanna.", highlight: "Elephants can physically 'hear' deep infrasound rumblings through the solid ground using sensitive nerve receptors in their feet! 🐘" },
    { id: '9', title: 'Echo & Reverberation', color: '#FFD166', bgGradient: ['#2A2A00', '#05050A'], icon: '⛰️', svgIcon: 'cube', content: "An **Echo** is a distinct, delayed reflection of sound waves aggressively bouncing off a hard, flat surface (like a canyon face) and returning to your ears.\n\n**Reverberation** is a messier acoustic occurrence. When sound bounces chaotically around a small enclosed room, the hundreds of overlapping rapid reflections blend together, creating a sustained, muddy decay of sound.", highlight: "Architects meticulously design concert halls using specific acoustic materials to perfectly balance echoes and prevent muddy reverberation! 🏛️" },
    { id: '10', title: 'Constructive vs Destructive Interference', color: '#55EFC4', bgGradient: ['#0A2A1A', '#05050A'], icon: '🤫', svgIcon: 'shield', content: "When two distinct waves collide, they mathematically overlap. \n\nIf the peaks align perfectly, they combine into a louder super-wave (**Constructive Interference**). However, if the peak of one wave hits the trough (valley) of another, they perfectly cancel each other out, leaving total silence! (**Destructive Interference**).", highlight: "Active Noise-Cancelling headphones instantly generate inverted soundwaves designed to perfectly cause Destructive Interference, deleting engine noise! 🎧" }
  ],

  lab: {
    title: "Oscilloscope Oscillations Lab 🎛️",
    description: "Welcome to the Acoustic Physics Engine. Master the twin oscilloscopes manipulating Amplitude and Frequency. Synthesize standing waves, study sonic harmonics, and trigger resonant shattering events.",
    hint: "If you push the frequency slider past twenty thousand hertz, what happens to the human bio-receptor?",
    scientistModeHint: "Scientist Mode reveals exact Sine Wave mathematical matrices and instantaneous constructive overlaps.",
  },

  doYouKnowWhy: [
    { id: 'dyk1', question: "Do you know why sound travels significantly faster underwater? 🐬", answer: "Water molecules are physically packed much tighter and closer together than drifting air molecules! Because sound is fundamentally a mechanical wave (atoms forcefully bumping neighboring atoms), the energy transfers far more efficiently when the particles are already touching.", emoji: '💧' },
    { id: 'dyk2', question: "Do you know why inhaling helium makes your voice sound ridiculously high? 🎈", answer: "Helium gas is almost six times lighter (less dense) than normal air! Because sound energy travels much faster through this lighter gas, the resonant frequencies vibrating inside your vocal tract are violently shifted upward, causing the pitch of your voice to artificially skyrocket.", emoji: '💨' },
    { id: 'dyk3', question: "Do you know why you see lighting instantly, but hear thunder seconds later? ⚡", answer: "The speed of light is blindingly fast (300,000 kilometers per second), reaching your eyes with zero perceptible delay. The speed of sound is drastically slower (roughly 343 meters per second). The thunder soundwave literally has to physically travel through the atmosphere to reach you!", emoji: '🌩️' },
    { id: 'dyk4', question: "Do you know why modern stealth fighters are completely silent until they fly past you? 🛩️", answer: "Supersonic jets fly physically faster than the speed of sound themselves (Mach 1)! Because they are outpacing their own acoustic soundwaves, the massive sonic noise trails dragged entirely behind the jet. You cannot hear it approach because the aircraft literally arrives before the noise!", emoji: '🚀' },
    { id: 'dyk5', question: "Do you know why dogs hear whistles that humans cannot? 🐕", answer: "Through millions of years of predatory evolution, canine ear structures developed to detect hyper-high frequencies (up to 45,000 Hz) to aid in hunting squeaky rodents. Humans peak at 20,000 Hz. A dog whistle pushes air at 35,000 Hz—deafening to a hound, total silence to a human!", emoji: '🐾' }
  ],

  quiz: [
    { id: 'q1', question: "What fundamental type of wave is Sound?", options: [
        "Transverse Wave",
        "Longitudinal Wave",
        "Electromagnetic Wave",
        "Gravitational Wave"
      ], answer: 1, explanation: "Sound is a powerful longitudinal wave, composed entirely of physical compressions and rarefactions moving parallel through a given medium." },
    { id: 'q2', question: "Which measurable characteristic of a sound wave directly determines its Pitch?", options: [
        "Amplitude",
        "Frequency",
        "Velocity",
        "Refraction"
      ], answer: 1, explanation: "Frequency (measured in Hertz) controls pitch. High frequency generates shrill high pitches, while low frequency generates deep bass pitches." },
    { id: 'q3', question: "What occurs when a wave fundamentally transfers sheer energy?", options: [
        "Transfers matter permanently",
        "Creates gravity",
        "Transfers energy, not matter",
        "Stops entirely"
      ], answer: 2, explanation: "Waves are the universe's way of moving massive energy across distances without actually picking up matter and relocating it." },
    { id: 'q4', question: "Why is outer space completely, terrifyingly silent?", options: [
        "Stars absorb sound",
        "No medium for sound travel",
        "Sound freezes in gravity",
        "Starlight cancels audio"
      ], answer: 1, explanation: "Sound is atoms painfully bumping into atoms. Since the void of space is a vacuum completely devoid of atoms, there is absolutely no medium to carry the chain reaction." },
    { id: 'q5', question: "What is the standard unit of measurement for Frequency?", options: [
        "Decibels (dB)",
        "Joules (J)",
        "Newtons (N)",
        "Hertz (Hz)"
      ], answer: 3, explanation: "Hertz represents exactly one complete wave cycle per second. A 60 Hz tone oscillates 60 times every single second." },
    { id: 'q6', question: "If you physically increase a wave's Amplitude, what happens to the resulting audio?", options: [
        "It becomes higher pitched",
        "It becomes significantly louder",
        "It becomes quieter",
        "It travels faster"
      ], answer: 1, explanation: "Amplitude is the sheer height/intensity of the physical wave. Larger disturbance amplitude directly equals massive volume." },
    { id: 'q7', question: "Sound waves travel the absolute fastest through which of these states of matter?", options: [
        "A thick Gas",
        "A pool of Liquid",
        "A solid Metal",
        "A perfect Vacuum"
      ], answer: 2, explanation: "Because the atoms in a rigid solid (like steel) are locked exceptionally tightly together, mechanical acoustic vibrations transfer through them instantly." },
    { id: 'q8', question: "What medical technology utilizes extreme sound frequencies above 20,000 Hz to generate internal non-invasive images?", options: [
        "X-Ray Machines",
        "Ultrasound Imaging",
        "MRI Scanning",
        "Electrocardiograms"
      ], answer: 1, explanation: "Ultrasound uses extremely high-frequency sound waves that safely bounce off internal human organs, actively catching the echoes to map an invisible image." },
    { id: 'q9', question: "The dropping pitch of an ambulance siren aggressively driving away is a perfect example of what phenomenon?", options: [
        "The Doppler Effect",
        "Sonic Boom",
        "Destructive Interference",
        "Acoustic Resonance"
      ], answer: 0, explanation: "The Doppler Effect proves that relative rapid movement actively stretches or crushes the outgoing soundwaves, shifting the perceived frequency." },
    { id: 'q10', question: "When two distinct waves violently collide perfectly peak-to-trough (valley), completely silencing each other, this is called:", options: [
        "Constructive Interference",
        "Acoustic Resonance",
        "Destructive Interference",
        "Sonic Voiding"
      ], answer: 2, explanation: "Destructive interference happens when contrasting wave pressures perfectly oppose each other, mathematically canceling to zero. This is the entire foundation for Noise-Cancelling software!" },
    { id: 'q11', question: "Elephants famously communicate secretly utilizing deep extreme low frequencies known formally as:", options: [
        "Ultrasound",
        "Infrasound",
        "Echolocation",
        "Microsound"
      ], answer: 1, explanation: "Infrasound constitutes deep acoustic frequencies below human hearing capability (under 20 Hz), which brilliantly travel massive distances across the earth." },
    { id: 'q12', question: "What is the name of the phenomenon where a singer shatters a delicate wine glass simply by hitting a very specific sustained pitch?", options: [
        "Acoustic Dissonance",
        "Frequency Clipping",
        "Destructive Interference",
        "Resonance"
      ], answer: 3, explanation: "Resonance! Whenever the singer hits the exact natural frequency of the glass, the crystal absorbs the energy perfectly until the massive vibration fractures it." },
    { id: 'q13', question: "If light is a transverse wave, what physical direction do its particles/fields vibrate?", options: [
        "Parallel to wave",
        "Perpendicular to wave direction",
        "In random circles",
        "Only backward"
      ], answer: 1, explanation: "Transverse waves vibrate up and down (perpendicular), while longitudinal waves (like sound) aggressively vibrate forwards and backwards." },
    { id: 'q14', question: "Approximately how fast does normal sound travel through normal air at room temperature?", options: [
        "1,000,000 meters/second",
        "343 meters/second",
        "299,792 meters/second",
        "10 meters/second"
      ], answer: 1, explanation: "Sound cruises at about 343 m/s in air, heavily lagging behind the speed of light, ensuring thunder is always drastically delayed behind the lightning flash." },
    { id: 'q15', question: "What standard logarithmic measurement unit calculates the sheer volume/intensity of a noise?", options: [
        "Watts",
        "Hertz",
        "Decibels",
        "Pascals"
      ], answer: 2, explanation: "The Decibel (dB) expertly measures volume intensity. Anything above 85 dB over prolonged periods can cause permanent architectural ear damage!" },
    { id: 'q16', question: "If you physically shout into a grand canyon and hear your exact voice wildly return seconds later, this is an:", options: [
        "Echo",
        "Oscillation",
        "Doppler Shift",
        "Acoustic Shadow"
      ], answer: 0, explanation: "An Echo is simply the massive soundwave physically bouncing off the distant rock wall and returning safely to your auditory sensors." },
    { id: 'q17', question: "The region in a longitudinal sound wave where particles are violently squeezed tightly together is precisely called a:", options: [
        "Trough",
        "Rarefaction",
        "Compression",
        "Crest"
      ], answer: 2, explanation: "A Compression is the high-pressure zone of a sound wave where the atoms are grouped up heavily, while Rarefactions are the extremely low-pressure gaps." },
    { id: 'q18', question: "What happens to the wavelength of a sound wave if you double its frequency (assuming speed is constant)?", options: [
        "It doubles",
        "It stays the same",
        "It is cut in half",
        "It disappears"
      ], answer: 2, explanation: "Frequency and Wavelength are mathematically inversely proportional! More waves per second strictly means each physical wave must be much shorter." },
    { id: 'q19', question: "Which unique animal explicitly weaponizes profound echolocation to safely navigate total darkness?", options: [
        "Wolves",
        "Eagles",
        "Bats",
        "Pigeons"
      ], answer: 2, explanation: "Bats rapidly emit ultrasonic clicks that aggressively bounce off invisible prey, perfectly calculating location, trajectory, and size entirely in the dark!" },
    { id: 'q20', question: "When an F-22 jet physically outpaces the speed of sound, creating an immense atmospheric pressure wave, the resulting explosion is a:", options: [
        "Sonic Boom",
        "Thunderclap",
        "Acoustic Resonance",
        "Thermal Detonation"
      ], answer: 0, explanation: "A Sonic Boom is the violent consequence of an aircraft crushing all of its own soundwaves into a single, terrifying blast of acoustic shock energy." }
  ],

  relatedTopics: ['light_optics'],
};
