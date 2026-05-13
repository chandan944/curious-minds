export default {
  id: 'work_power',
  title: 'Work, Power & Energy',
  subtitle: 'The physics of getting real things done ⚙️',
  emoji: '⚙️',
  category: 'Foundations',
  accentKey: 'speed',

  hook: {
    question: "If you push a concrete wall all day but it doesn't move, how much work have you done? 🧱",
    reveal: "Mathematically, zero! Work only happens if there's displacement. Your muscles feel tired because they are doing internal biological work, but the wall hasn't gained any mechanical energy! 😮",
    emoji: '🏋️',
  },

  theory: [
    { id: '1', title: 'What is Work?', color: '#00D4A0', bgGradient: ['#002A20', '#05050A'], icon: '⚙️', svgIcon: 'lightning', content: "**Work (W)** is defined as a force acting upon an object to cause a displacement. It is measured in **Joules (J)**.\n\nEquation: **Work = Force × Distance × cos(θ)**. If the force is perpendicular to the motion (like carrying a bucket while walking), no work is done on the bucket!", highlight: "No displacement means no work! 🧱" },
    { id: '2', title: 'Mechanical Power', color: '#FFD166', bgGradient: ['#2A2000', '#05050A'], icon: '🏎️', svgIcon: 'zap', content: "**Power (P)** is the rate at which work is performed or energy is transferred. Its unit is the **Watt (W)**.\n\nRunning up stairs requires the same total work as walking, but it takes much more power because the time interval is smaller. Power = Work / Time.", highlight: "Power measures how *fast* you do work! ⏱️" },
    { id: '3', title: 'Mechanical Advantage', color: '#39FF14', bgGradient: ['#0A2A0A', '#05050A'], icon: '🔧', svgIcon: 'grid', content: "Simple machines like levers and ramps provide **Mechanical Advantage**. They allow you to use less force to do the same amount of work by increasing the distance over which that force is applied.", highlight: "Machines trade distance for force! 📐" },
    { id: '4', title: 'Kinetic Energy (KE)', color: '#FF4D6D', bgGradient: ['#2A0A0A', '#05050A'], icon: '🏃', svgIcon: 'pulse', content: "**Kinetic Energy** is the energy of motion. Formula: **KE = ½mv²**.\n\nBecause velocity is squared, doubling your speed doesn't double your energy—it quadruples it! This is why high-speed collisions are so destructive.", highlight: "Speed has an exponential impact on energy! 🚗" },
    { id: '5', title: 'Gravitational Potential Energy', color: '#A855F7', bgGradient: ['#1A0A2A', '#05050A'], icon: '⛰️', svgIcon: 'cube', content: "**Potential Energy (GPE)** is stored energy based on an object's position in a gravitational field. Formula: **GPE = mgh**.\n\nWhen a roller coaster sits at the top of a hill, it has maximum potential energy and zero kinetic energy.", highlight: "Height equals stored energy! ⛰️" },
    { id: '6', title: 'Conservation of Energy', color: '#6C5CE7', bgGradient: ['#1A0A2A', '#05050A'], icon: '♾️', svgIcon: 'link', content: "The **Law of Conservation of Energy** states that energy cannot be created or destroyed, only transformed. \n\nA falling ball converts its Potential Energy into Kinetic Energy. When it hits the ground, that energy turns into sound and heat.", highlight: "Energy is the ultimate universal currency! 🌌" },
    { id: '7', title: 'Efficiency', color: '#FFB347', bgGradient: ['#2A1A00', '#05050A'], icon: '🔋', svgIcon: 'planet', content: "**Efficiency** is the ratio of useful work output to total energy input. No machine is 100% efficient because some energy is always 'lost' as heat due to friction.", highlight: "Friction is the enemy of efficiency! 🌡️" },
    { id: '8', title: 'Elastic Potential', color: '#FF3131', bgGradient: ['#2A000A', '#05050A'], icon: '🏹', svgIcon: 'target', content: "Energy stored in objects that can be compressed or stretched is **Elastic Potential Energy**. Springs and rubber bands store energy when deformed, ready to snap back into their original shape.", highlight: "This is the 'spring' in your step! 🧬" },
    { id: '9', title: 'Conservative Forces', color: '#00D4FF', bgGradient: ['#001A2A', '#05050A'], icon: '⚖️', svgIcon: 'waves', content: "Gravity is a **conservative force**. The work done moving an object between two points depends only on the points themselves, not the path taken. Lifting a box straight up or sliding it up a ramp to the same height takes the same energy!", highlight: "The path doesn't matter, only the start and end! 🎯" },
    { id: '10', title: 'Horsepower vs Watts', color: '#55EFC4', bgGradient: ['#0A2A1A', '#05050A'], icon: '🐎', svgIcon: 'zap', content: "One **Horsepower (hp)** is about 746 Watts. James Watt invented the term to prove that his steam engines could do even more work than the horses people were used to using!", highlight: "Horsepower is a measure of 'work rate'! 🚂" }
  ],

  lab: {
    title: "Incline Plane Master 🏋️",
    description: "Master the mechanics of work and power using a variable-angle ramp. Calculate mechanical advantage, measure friction, and optimize your power output to move heavy loads.",
    hint: "Increase the ramp angle to see how the 'Normal Force' and 'Gravity Component' arrows change.",
    scientistModeHint: "Scientist Mode displays the Free Body Diagram and real-time Joule/Watt calculations.",
  },

  doYouKnowWhy: [
    { id: 'dyk1', question: "Why is it easier to walk up a ramp than stairs? 📐", answer: "A ramp is a simple machine! It increases the distance you travel to reach a certain height, which significantly reduces the force your legs need to exert to lift your body weight.", emoji: '🚶' },
    { id: 'dyk2', question: "Why do brakes get hot? 🔥", answer: "Friction! When you stop a car, the kinetic energy isn't destroyed—it's converted into thermal energy in the brake pads and rotors.", emoji: '♨️' },
    { id: 'dyk3', question: "Why do heavy things fall at the same rate? ⚖️", answer: "In a vacuum, yes! Gravity pulls harder on heavier objects, but they also have more inertia (resistance to motion). These two effects perfectly cancel out, causing everything to accelerate at 9.8 m/s².", emoji: '🌍' },
    { id: 'dyk4', question: "What is 'Latent Heat'? 🌡️", answer: "Energy used to change the state of matter (like melting ice) without changing its temperature. The energy goes into breaking atomic bonds instead of moving atoms faster.", emoji: '🧊' },
    { id: 'dyk5', question: "Why do flywheels store energy? 🎡", answer: "Flywheels are heavy spinning wheels. They store energy as 'Rotational Kinetic Energy'. Once they are spinning, their inertia keeps them moving, allowing the energy to be retrieved later.", emoji: '⚙️' }
  ],

  quiz: [
    { id: 'q1', question: "What is the unit of Work?", options: [
        "Watt",
        "Newton",
        "Joule",
        "Pascal"
      ], answer: 2, explanation: "Work and Energy are both measured in Joules (J)." },
    { id: 'q2', question: "Power is defined as Work divided by:", options: [
        "Distance",
        "Mass",
        "Time",
        "Acceleration"
      ], answer: 2, explanation: "Power is the rate of doing work (P = W/t)." },
    { id: 'q3', question: "If motion is zero, how much work is done?", options: [
        "Infinite",
        "Constant",
        "Zero",
        "Depends on Force"
      ], answer: 2, explanation: "Work = Force × Displacement. No displacement = No work." },
    { id: 'q4', question: "Potential energy depends on height and:", options: [
        "Speed",
        "Mass",
        "Color",
        "Time"
      ], answer: 1, explanation: "PE = mgh. Higher mass or height means more stored energy." },
    { id: 'q5', question: "Kinetic energy depends on mass and:", options: [
        "Height",
        "Volume",
        "Velocity",
        "Charge"
      ], answer: 2, explanation: "KE = ½mv². Moving faster means more energy." },
    { id: 'q6', question: "What happens to KE if you double the velocity?", options: [
        "Doubles",
        "Triples",
        "Quadruples",
        "Stays same"
      ], answer: 2, explanation: "Since v is squared, (2v)² = 4v². Energy quadruples." },
    { id: 'q7', question: "A ramp is which type of simple machine?", options: [
        "Lever",
        "Pulley",
        "Incline Plane",
        "Screw"
      ], answer: 2, explanation: "A ramp is a classic incline plane." },
    { id: 'q8', question: "Energy transformation in a falling apple:", options: [
        "KE to PE",
        "PE to KE",
        "Heat to Light",
        "Mass to Sound"
      ], answer: 1, explanation: "Potential energy at the top turns into Kinetic energy as it falls." },
    { id: 'q9', question: "One Horsepower is approximately how many Watts?", options: [
        "100 W",
        "500 W",
        "746 W",
        "1000 W"
      ], answer: 2, explanation: "1 hp = 746 Watts." },
    { id: 'q10', question: "Why is 100% efficiency impossible?", options: [
        "Lack of gravity",
        "Air pressure",
        "Friction/Heat loss",
        "Quantum effects"
      ], answer: 2, explanation: "Friction always converts some useful energy into waste heat." },
    { id: 'q11', question: "What acts as a conservative force?", options: [
        "Friction",
        "Air Resistance",
        "Gravity",
        "Tension"
      ], answer: 2, explanation: "Gravity's work only depends on displacement, not path." },
    { id: 'q12', question: "Calculate Work: 10N force moves a box 5m.", options: [
        "2 J",
        "5 J",
        "50 J",
        "100 J"
      ], answer: 2, explanation: "W = 10N × 5m = 50 Joules." },
    { id: 'q13', question: "Machine A does 100J in 10s. Machine B does 100J in 5s. Which is more powerful?", options: [
        "Machine A",
        "Machine B",
        "Equal",
        "Neither"
      ], answer: 1, explanation: "Machine B does the same work in less time." },
    { id: 'q14', question: "Normal Force acts in which direction?", options: [
        "Downwards",
        "Towards motion",
        "Perpendicular to surface",
        "Opposite to friction"
      ], answer: 2, explanation: "The surface pushes back perpendicularly." },
    { id: 'q15', question: "What energy is stored in a compressed spring?", options: [
        "Kinetic",
        "Chemical",
        "Elastic Potential",
        "Thermal"
      ], answer: 2, explanation: "Elastic potential energy is stored in deformation." },
    { id: 'q16', question: "If you carry a box horizontally at constant speed, work done by YOU is:", options: [
        "High",
        "Negative",
        "Zero",
        "Infinite"
      ], answer: 2, explanation: "Your force is upward, but motion is horizontal (90°). Cos(90) = 0." },
    { id: 'q17', question: "Total mechanical energy is the sum of:", options: [
        "Power and Work",
        "KE and PE",
        "Mass and Velocity",
        "Heat and Light"
      ], answer: 1, explanation: "Total ME = KE + PE." },
    { id: 'q18', question: "A watt is equal to one joule per:", options: [
        "Meter",
        "Newton",
        "Second",
        "Kilogram"
      ], answer: 2, explanation: "1 W = 1 J/s." },
    { id: 'q19', question: "Mechanical Advantage helps us by:", options: [
        "Creating energy",
        "Reducing total work",
        "Reducing required force",
        "Stopping friction"
      ], answer: 2, explanation: "It makes work 'easier' by using less force over more distance." },
    { id: 'q20', question: "What remains constant in the Conservation of Energy?", options: [
        "Kinetic Energy",
        "Potential Energy",
        "Total Energy",
        "Heat"
      ], answer: 2, explanation: "The total energy stays the same, it just changes forms." }
  ],

  relatedTopics: ['forces_motion', 'energy_types'],
};
