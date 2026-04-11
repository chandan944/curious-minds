# 🚀 "Five Pillars" Expansion Mega-Update Completed!

We have successfully executed the massive 5-Topic expansion simultaneously! The application now boasts an additional **50 Theory Cards**, **25 "Do You Know?" facts**, **100 Quiz Questions**, and **20 fully interactive, gamified Lab Simulations**! 

All topics have been beautifully themed using the newly added color tokens (`chemistry`, `evolution`, `space`, `cyberpunk`, `network`) and are currently live and accessible in the app UI.

---

## ⚛️ Topic 1: Atoms & Molecules
**The Physics & Chemistry Foundation**
We dive into the subatomic realm where quantum mechanics ignores the rules of reality. 
- **The 3D Nucleus Builder:** Add Protons and Neutrons. Discover what creates an unstable, vibrating radioactive Isotope.
- **Quantum Shells:** Fill the electron shells (2 in the first, 8 in the second) using 3D visualization.
- **The Molecule Combiner:** Combine volatile Hydrogen and Oxygen correctly to dynamically synthesize liquid Water.
- **Scale of the Micro-Universe:** Zoom from the size of a finger down to the terrifying emptiness of a Quark.

## 🦋 Topic 2: Evolution & Natural Selection
**Deep Biological Time**
Take control of Darwinian mechanics directly.
- **The Galapagos Simulator:** Control rainfall to rapidly "evolve" the structural beak size of finches to survive hard nuts.
- **Peppered Moth Camouflage:** Act as the predator! Eat the moths that don't match the soot-covered trees, and watch as the survivors multiply, shifting the population genetics.
- **Antibiotic Resistance Matrix:** See how one surviving mutant bacteria strain takes over a host after antibiotic application.
- **Phylogenetic Tree:** Tap nodes to discover that humans didn't evolve *from* chimps, but rather *with* them from a shared ancestor.
- **Photosynthesis & Plants** (added theory, 5 why, 10 quiz, and molecular lab simulation with extensive visual features)
- Further enhancements...

## 🪐 Topic 3: The Solar System
**Astrophysics & Orbital Scale**
Experience the unfathomable scale and rules of our neighborhood.
- **The 3D Orrery:** A spinning, multi-axis 3D simulation of heliocentric orbits. Includes a "Time Warp" speed dial.
- **Gravity Slingshot 2D:** Use absolute timing to bounce a satellite intimately close to Jupiter's edge to steal momentum—or crash and burn!
- **The Goldilocks Zone:** Drag the Earth to visually understand why Mars is frozen and Venus is completely boiling.
- **Celestial Scale Math:** Stack arrays to comprehend how 10 Jupiters fit across the Sun!

## 💻 Topic 4: Binary & Computers
**Cyberpunk Electrical Logic**
Peel off the screen to expose the raw math inside the CPU.
- **8-Bit Lightbulb Decoder:** Flip 8 physical registers to calculate the Decimal target of `170`.
- **Live Logic Gates:** Manipulate `AND`/`OR` gates with live-updating SVG wires mapping the flow of electricity.
- **The CPU Half-Adder:** Realize how connecting multiple tiny gates literally allowed a machine to add `1+1` to equal `10`.
- **ASCII Pulse:** Type real words and watch the system spit out the exact binary pulse arrays required by the monitor.

## 🌐 Topic 5: How the Internet Works
**The Physical Web & Security**
The magic of the "Cloud" is destroyed, revealing the beautiful physical reality of submarines, cables, and math.
- **TCP/IP Packet Router:** Send a packet across a mapped network. Cut the main fiber-optic submarine cable and watch the protocol algorithm actively detect and reroute packets south.
- **Submarine Explorer:** Visualize that our wireless data is actually sitting at the bottom of the ocean.
- **DNS Lookup Simulator:** Enter a URL and watch the exact 3-step handshake request needed to turn it into an IP target.
- **HTTPS Encryption Sandbox:** Compare raw credit card data with mathematically scrambled payload packages.

---

### Verification
- **Dynamic Imports Active:** `TopicScreen.jsx` successfully imports all 5 new configurations and lab UI files based on the `targetId`.
- **Registry Activated:** All 5 topics in `topicRegistry.js` have been switched from `'coming'` to `'ready'`, removing their padlock icons.
- **Performance:** 3D Labs use pure `@react-three/fiber` primitives to dodge heavy glTF payload crashes. Haptic motors and synthesized sound effects are deeply integrated across all 20 mini-games to provide premium, tactile feedback.

> [!TIP]
> **Developer Note on Metro Bundler Cache:**
> Because we introduced massive amounts of new code and heavy canvas processing, if Metro complains about missing SVG shapes or Fiber contexts during reload, simply run `npx expo start -c` to obliterate the cache and rebuild the fresh ast.





You are a senior interactive science lab architect. Your job is NOT to build 
the lab yet. Your job is to design the perfect LAB SPECIFICATION DOCUMENT 
that another AI will use to build it.

I will give you ONE topic. You will output a complete, detailed 
photosynthesis that slots into the Master Lab Framework below.

════════════════════════════════════════════════
THE TOPIC I WANT YOU TO DESIGN FOR:
════════════════════════════════════════════════

photosynthesis
e.g: "Immune System" or "Periodic Table" or "Black Holes"

════════════════════════════════════════════════
YOUR THINKING PROCESS (follow this strictly):
════════════════════════════════════════════════

Before writing anything, think through these 6 questions silently,
then use your answers to write the spec:

Q1. HAND ACTION:
    What is the ONE physical thing a student's finger does first?
    (Not "tap to learn" — a real gesture: drag, rotate, pull, tilt)
    It must feel like operating real laboratory equipment.

Q2. LIVING VIEWPORT:
    What is continuously ALIVE in the viewport even before the 
    student touches anything? (atoms orbiting, cells moving, 
    waves propagating, planets drifting — never a static image)

Q3. CAUSE & CONSEQUENCE:
    For each control, what is the IMMEDIATE visual consequence?
    The viewport must react within 16ms of any gesture.
    Think: what changes shape, color, speed, size, glow, or breaks?

Q4. THE SURPRISE:
    What is something the student will discover that they did NOT 
    expect? This must be scientifically accurate and visually dramatic.
    The "wait... WHAT?!" moment.

Q5. THE DANGER STATE:
    What is the one configuration that causes a dramatic breakdown?
    (nucleus decays, immune system overwhelmed, circuit shorts, 
    star collapses) — with particle bursts + haptic + screen shake.

Q6. DISCOVERY MODE (The Hidden Layer):
    What does the student see when they activate the 🔍 lens that is 
    INVISIBLE in normal mode? Must reveal a deeper scientific truth.
    (quantum fields, microscopic detail, invisible forces, etc.)

════════════════════════════════════════════════
OUTPUT FORMAT (write exactly this structure):
════════════════════════════════════════════════

## TOPIC: [Topic Name]
## CORE CONCEPT IN ONE LINE: [What the student will deeply understand 
   after 10 minutes of play]

---

### VIEWPORT — THE LIVING SCENE:
Describe exactly what is rendered in SVG and how it moves at idle.
Include: shapes, colors (use the palette below), animation loops,
layering order (back to front).

Palette reference:
  BACKGROUND: #0A0A0F | PANEL: #12121A | AMBER: #FFB347
  CYAN: #00D4FF | GREEN: #39FF14 | RED: #FF3131 | TEXT: #E8E0D0

### DISCOVERY MODE LAYER:
What SVG layer appears when the 🔍 button is activated?
Describe visually and scientifically what it reveals and why 
it matters.

---

### CONTROL PANEL — 3 TO 4 INSTRUMENTS:

For each instrument write:
  NAME: (all caps)
  TYPE: rotary_dial | vertical_slider | analog_gauge | toggle_switch
  CONTROLS: (what scientific variable it maps to)
  RANGE: (min value → max value, with unit)
  VISUAL CONSEQUENCE: (exactly what changes in viewport)
  HAPTIC MOMENTS: (which values trigger a snap or bump)
  LCD DISPLAY: (what text/number is shown below the instrument)

---

### DISCOVERY MOMENTS — MINIMUM 4:

For each discovery:
  TRIGGER: (exact control configuration that causes it)
  VISUAL EVENT: (what dramatically happens in viewport)
  HAPTIC: Light | Medium | Heavy | None
  LOG MESSAGE: "You discovered [X]! [One-sentence scientific fact.]"
  RARITY: Common | Uncommon | Rare (how hard is it to find)

---

### DANGER STATE:
  TRIGGER: (what configuration causes it)  
  VISUAL: (screen shake + particle burst + color shift — describe exactly)
  HAPTIC: Heavy + pattern (describe rhythm: 3 short pulses, etc.)
  RECOVERY: (what the student must do to fix it)
  SCIENCE: (why this is realistic — 1 sentence)

---

### HINTS SYSTEM (3 hints, amber tooltip, auto-dismiss 3 seconds):
  HINT 1 — On first load: [text]
  HINT 2 — When approaching danger: [text]  
  HINT 3 — When student hasn't moved a control in 20 seconds: [text]

---

### RESEARCH LOG ENTRIES:
List 6 entries the log can record during the session.
Format: [Icon emoji] [Title]: [Scientific insight in plain English]

---

════════════════════════════════════════════════
MASTER LAB FRAMEWORK (the generated spec plugs INTO this)
the AI building the code must follow these rules:
════════════════════════════════════════════════

TECH STACK:
- React Native + Expo (managed workflow)  
- react-native-reanimated v3 → ALL animations
- react-native-svg → ALL custom graphics (no View boxes as visuals)
- react-native-gesture-handler → ALL drag/rotate interactions
- expo-haptics → tactile feedback
- Single file component, export default, no missing imports

LAYOUT (fixed — never change):
  8%  → Header bar: engraved title + amber power LED
  52% → Primary Viewport: dark chamber with vignette edge
  30% → Control Panel: steel surface with SVG instruments
  10% → Research Log bar: tap to expand full screen

INSTRUMENT RULES:
  Rotary Dial → SVG drawn, GestureDetector + Gesture.Pan(), 
    Math.atan2(dy,dx) maps to value, snaps with haptic
  Slider → SVG cylindrical handle, PanGesture maps Y to value
  Gauge → SVG semicircle + animated needle, shakes with withSpring
    when in danger zone
  Toggle → SVG rocker, withTiming(150ms) flip, Heavy haptic

VISUAL RULES:
  - Radial gradient background in viewport (center lighter)
  - Vignette: dark overlay around viewport edges
  - All idle animations loop infinitely with Reanimated
  - Particle burst: 8 SVG circles fly outward + fade in 600ms
  - Discovery Mode: second SVG layer, blur-reveal animation
  - No flat colored rectangle as any instrument or subject

════════════════════════════════════════════════
FINAL INSTRUCTION TO THE SPEC-WRITING AI:
════════════════════════════════════════════════

After writing the full spec above, append this section:

## BUILDER PROMPT (copy-paste ready for the coding AI):

Write a single ready-to-use prompt that:
1. Pastes the entire Master Lab Framework rules above
2. Then inserts the spec you just wrote as the [TOPIC BLOCK]
3. Ends with: "Build the complete single-file React Native component 
   now. No placeholders. No TODOs. Full working code."

The goal: I copy your output, paste it into any coding AI, 
and receive complete working lab code immediately.