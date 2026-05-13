// ─────────────────────────────────────────────
//  FACT REGISTRY 
//  Standalone ecosystem for "Facts" distinct from Theory topics
// ─────────────────────────────────────────────

export const FACT_CATEGORIES = [
  "Nature & Earth",
  "Universe & Science",
  "Human Being",
  "History & Civilizations",
  "Countries & Cultures",
  "Technology & Innovation",
  "Arts & Culture",
  "Ideas & Thinking",
  "Sports & Games",
  "Mystery & Beyond"
];

export const FACT_REGISTRY = [
  // 🌿 Nature & Earth
  { id: "animals_wildlife", icon: "twitter", category: "Nature & Earth", title: "Animals & Wildlife", subtitle: "Fascinating creature facts" },
  { id: "ocean_sea_creatures", icon: "droplet", category: "Nature & Earth", title: "Ocean & Sea Creatures", subtitle: "Deep blue secrets" },
  { id: "geology_earth_science", icon: "globe", category: "Nature & Earth", title: "Geology & Earth Science", subtitle: "Our dynamic planet" },
  { id: "plants_botany", icon: "feather", category: "Nature & Earth", title: "Plants & Botany", subtitle: "The green world" },
  { id: "insects_bugs", icon: "aperture", category: "Nature & Earth", title: "Insects & Bugs", subtitle: "Tiny but mighty" },
  { id: "weather_climate", icon: "cloud", category: "Nature & Earth", title: "Weather & Climate", subtitle: "Atmospheric phenomena" },
  { id: "mountains_caves", icon: "triangle", category: "Nature & Earth", title: "Mountains & Caves", subtitle: "Peaks and depths" },
  { id: "rivers_lakes", icon: "droplet", category: "Nature & Earth", title: "Rivers & Lakes", subtitle: "Freshwater wonders" },
  { id: "birds_avian_life", icon: "twitter", category: "Nature & Earth", title: "Birds & Avian Life", subtitle: "Feathered friends" },
  { id: "deserts_dry_lands", icon: "sun", category: "Nature & Earth", title: "Deserts & Dry Lands", subtitle: "Life in the extremes" },

  // 🌌 Universe & Science
  { id: "space_astronomy", icon: "star", category: "Universe & Science", title: "Space & Astronomy", subtitle: "The cosmos beyond" },
  { id: "chemistry_elements", icon: "hexagon", category: "Universe & Science", title: "Chemistry & Elements", subtitle: "Building blocks of matter" },
  { id: "atoms_molecules", icon: "loader", category: "Universe & Science", title: "Atoms & Molecules", subtitle: "Building blocks of reality" },
  { id: "acids_bases_ph", icon: "droplet", category: "Universe & Science", title: "Acids, Bases & pH", subtitle: "The power of protons" },
  { id: "physics_forces", icon: "zap", category: "Universe & Science", title: "Physics & Forces", subtitle: "The rules of reality" },
  { id: "genetics_evolution", icon: "git-branch", category: "Universe & Science", title: "Genetics & Evolution", subtitle: "The code of life" },
  { id: "microbiology_cells", icon: "target", category: "Universe & Science", title: "Microbiology & Cells", subtitle: "The unseen world" },
  { id: "electricity_magnetism", icon: "zap", category: "Universe & Science", title: "Electricity & Magnetism", subtitle: "Invisible power" },
  { id: "light_optics", icon: "sun", category: "Universe & Science", title: "Light & Optics", subtitle: "Seeing the spectrum" },
  { id: "temperature_energy", icon: "thermometer", category: "Universe & Science", title: "Temperature & Energy", subtitle: "Heat and motion" },

  // 🧠 Human Being
  { id: "brain_structure", icon: "cpu", category: "Human Being", title: "Brain Structure", subtitle: "The architecture of thought" },
  { id: "human_body_organs", icon: "heart", category: "Human Being", title: "Human Body & Organs", subtitle: "Our biological vessel" },
  { id: "burnout", icon: "zap-off", category: "Human Being", title: "Burnout", subtitle: "The science of exhaustion" },
  { id: "dna_genetics", icon: "git-branch", category: "Human Being", title: "DNA & Genetics", subtitle: "Our genetic code" },
  { id: "human_senses", icon: "eye", category: "Human Being", title: "Human Senses", subtitle: "Perceiving the world" },
  { id: "sleep_dreams", icon: "moon", category: "Human Being", title: "Sleep & Dreams", subtitle: "The nighttime journey" },
  { id: "mental_health_psychology", icon: "smile", category: "Human Being", title: "Mental Health & Psychology", subtitle: "Inner well-being" },
  { id: "addiction", icon: "link", category: "Human Being", title: "Addiction", subtitle: "The hijacked brain" },
  { id: "anger", icon: "zap", category: "Human Being", title: "Anger", subtitle: "The neuroscience of rage" },
  { id: "anxiety", icon: "alert-triangle", category: "Human Being", title: "Anxiety", subtitle: "The mind's false alarm" },

  // 📜 History & Civilizations
  { id: "ancient_history", icon: "clock", category: "History & Civilizations", title: "Ancient History", subtitle: "The dawn of time" },
  { id: "greek_roman", icon: "shield", category: "History & Civilizations", title: "Greek & Roman Civilization", subtitle: "Classical antiquity" },
  { id: "middle_eastern_history", icon: "map", category: "History & Civilizations", title: "Middle Eastern History", subtitle: "Cradle of civilization" },
  { id: "asian_empires", icon: "flag", category: "History & Civilizations", title: "Asian Empires", subtitle: "Dynasties of the East" },
  { id: "wars_battles", icon: "crosshair", category: "History & Civilizations", title: "Wars & Battles", subtitle: "Conflicts that shaped us" },
  { id: "kings_queens", icon: "award", category: "History & Civilizations", title: "Kings & Queens", subtitle: "Royal lineage" },
  { id: "exploration_discovery", icon: "compass", category: "History & Civilizations", title: "Exploration & Discovery", subtitle: "Charting the unknown" },
  { id: "slavery_freedom", icon: "unlock", category: "History & Civilizations", title: "Slavery & Freedom Movements", subtitle: "The fight for liberty" },
  { id: "medieval_history", icon: "home", category: "History & Civilizations", title: "Medieval History", subtitle: "The Middle Ages" },
  { id: "modern_history", icon: "tv", category: "History & Civilizations", title: "Modern History", subtitle: "The recent past" },

  // 🌍 Countries & Cultures
  { id: "african_culture", icon: "globe", category: "Countries & Cultures", title: "African Culture", subtitle: "The mother continent" },
  { id: "asian_culture", icon: "globe", category: "Countries & Cultures", title: "Asian Culture", subtitle: "Diverse traditions" },
  { id: "south_american_culture", icon: "globe", category: "Countries & Cultures", title: "South American Culture", subtitle: "Vibrant societies" },
  { id: "european_countries", icon: "globe", category: "Countries & Cultures", title: "European Countries", subtitle: "Old world charm" },
  { id: "north_american_culture", icon: "globe", category: "Countries & Cultures", title: "North American Culture", subtitle: "The new world" },
  { id: "australia_oceania", icon: "globe", category: "Countries & Cultures", title: "Australia & Oceania", subtitle: "Islands and outback" },
  { id: "flags_meanings", icon: "flag", category: "Countries & Cultures", title: "Flags & Meanings", subtitle: "Symbols of nations" },
  { id: "languages_communication", icon: "message-circle", category: "Countries & Cultures", title: "Languages & Communication", subtitle: "How we speak" },
  { id: "traditions_festivals", icon: "gift", category: "Countries & Cultures", title: "Traditions & Festivals", subtitle: "Global celebrations" },
  { id: "world_cuisines", icon: "coffee", category: "Countries & Cultures", title: "World Cuisines", subtitle: "Global gastronomy" },

  // 💻 Technology & Innovation
  { id: "computers_internet", icon: "monitor", category: "Technology & Innovation", title: "Computers & Internet", subtitle: "The digital age" },
  { id: "artificial_intelligence", icon: "cpu", category: "Technology & Innovation", title: "Artificial Intelligence", subtitle: "Machines that think" },
  { id: "smartphones_gadgets", icon: "smartphone", category: "Technology & Innovation", title: "Smartphones & Gadgets", subtitle: "Pocket computers" },
  { id: "cars_automobiles", icon: "truck", category: "Technology & Innovation", title: "Cars & Automobiles", subtitle: "Wheels of progress" },
  { id: "aviation_aircraft", icon: "navigation", category: "Technology & Innovation", title: "Aviation & Aircraft", subtitle: "Taking flight" },
  { id: "space_technology", icon: "rocket", category: "Technology & Innovation", title: "Space Technology", subtitle: "Reaching the stars" },
  { id: "machines_engineering", icon: "settings", category: "Technology & Innovation", title: "Machines & Engineering", subtitle: "Building the future" },
  { id: "energy_power", icon: "battery-charging", category: "Technology & Innovation", title: "Energy & Power Sources", subtitle: "Fueling the world" },
  { id: "cybersecurity_hacking", icon: "lock", category: "Technology & Innovation", title: "Cybersecurity & Hacking", subtitle: "Digital defense" },
  { id: "scientific_inventions", icon: "tool", category: "Technology & Innovation", title: "Scientific Inventions", subtitle: "World-changing ideas" },

  // 🎭 Arts & Culture
  { id: "theatre_drama", icon: "users", category: "Arts & Culture", title: "Theatre & Drama", subtitle: "The stage is set" },
  { id: "music_instruments", icon: "music", category: "Arts & Culture", title: "Music & Instruments", subtitle: "The universal language" },
  { id: "painting_visual_arts", icon: "image", category: "Arts & Culture", title: "Painting & Visual Arts", subtitle: "Colors and canvas" },
  { id: "photography_film", icon: "camera", category: "Arts & Culture", title: "Photography & Film", subtitle: "Capturing moments" },
  { id: "architecture_buildings", icon: "home", category: "Arts & Culture", title: "Architecture & Buildings", subtitle: "Designing spaces" },
  { id: "literature_books", icon: "book-open", category: "Arts & Culture", title: "Literature & Books", subtitle: "Words that endure" },
  { id: "sculptures_monuments", icon: "triangle", category: "Arts & Culture", title: "Sculptures & Monuments", subtitle: "Carved in stone" },
  { id: "cinema_directors", icon: "video", category: "Arts & Culture", title: "Cinema & Directors", subtitle: "The silver screen" },
  { id: "fashion_clothing", icon: "shopping-bag", category: "Arts & Culture", title: "Fashion & Clothing", subtitle: "Style and trends" },
  { id: "dance_performing_arts", icon: "activity", category: "Arts & Culture", title: "Dance & Performing Arts", subtitle: "Movement and expression" },

  // 🏛️ Ideas & Thinking
  { id: "philosophy_thinkers", icon: "user", category: "Ideas & Thinking", title: "Philosophy & Great Thinkers", subtitle: "The love of wisdom" },
  { id: "absurdism", icon: "help-circle", category: "Ideas & Thinking", title: "Absurdism", subtitle: "Rebelling against the void" },
  { id: "atheism", icon: "slash", category: "Ideas & Thinking", title: "Atheism", subtitle: "The logic of non-belief" },
  { id: "psychology_behavior", icon: "smile", category: "Ideas & Thinking", title: "Psychology & Behavior", subtitle: "Why we do what we do" },
  { id: "mathematics_numbers", icon: "hash", category: "Ideas & Thinking", title: "Mathematics & Numbers", subtitle: "The language of logic" },
  { id: "critical_thinking", icon: "help-circle", category: "Ideas & Thinking", title: "Critical Thinking & Logic", subtitle: "Analyzing truth" },
  { id: "ethics_morality", icon: "check-circle", category: "Ideas & Thinking", title: "Ethics & Morality", subtitle: "Right and wrong" },
  { id: "banking", icon: "briefcase", category: "Ideas & Thinking", title: "Banking", subtitle: "The engine of money" },
  { id: "wealth_loops", icon: "refresh-cw", category: "Ideas & Thinking", title: "Wealth Loops", subtitle: "The secret engines of wealth" },
  { id: "consistency", icon: "target", category: "Ideas & Thinking", title: "Consistency", subtitle: "The science of habits" },

  // ⚽ Sports & Games
  { id: "football_soccer", icon: "aperture", category: "Sports & Games", title: "Football & Soccer", subtitle: "The beautiful game" },
  { id: "cricket_baseball", icon: "play", category: "Sports & Games", title: "Cricket & Baseball", subtitle: "Bat and ball" },
  { id: "basketball_court", icon: "circle", category: "Sports & Games", title: "Basketball & Court Sports", subtitle: "Hoops and nets" },
  { id: "tennis_racket", icon: "share-2", category: "Sports & Games", title: "Tennis & Racket Sports", subtitle: "Aces and volleys" },
  { id: "swimming_water", icon: "droplet", category: "Sports & Games", title: "Swimming & Water Sports", subtitle: "Making a splash" },
  { id: "martial_arts", icon: "shield", category: "Sports & Games", title: "Martial Arts & Combat", subtitle: "Discipline and defense" },
  { id: "video_games", icon: "monitor", category: "Sports & Games", title: "Video Games & Esports", subtitle: "Digital competition" },
  { id: "chess_board", icon: "grid", category: "Sports & Games", title: "Chess & Board Games", subtitle: "Strategy and tactics" },
  { id: "olympics_athletics", icon: "award", category: "Sports & Games", title: "Olympics & Athletics", subtitle: "Faster, higher, stronger" },
  { id: "extreme_adventure", icon: "wind", category: "Sports & Games", title: "Extreme & Adventure Sports", subtitle: "Pushing limits" },

  // 🔮 Mystery & Beyond
  { id: "myths_legends", icon: "book", category: "Mystery & Beyond", title: "Myths & Legends", subtitle: "Stories of old" },
  { id: "paranormal_unexplained", icon: "eye-off", category: "Mystery & Beyond", title: "Paranormal & Unexplained", subtitle: "Things that go bump" },
  { id: "ufo_aliens", icon: "radio", category: "Mystery & Beyond", title: "UFOs & Alien Theories", subtitle: "Are we alone?" },
  { id: "lost_cities", icon: "map-pin", category: "Mystery & Beyond", title: "Lost Cities", subtitle: "Forgotten realms" },
  { id: "ancient_religions", icon: "sun", category: "Mystery & Beyond", title: "Ancient Religions", subtitle: "Early beliefs" },
  { id: "secret_societies", icon: "lock", category: "Mystery & Beyond", title: "Secret Societies", subtitle: "Hidden agendas" },
  { id: "death_afterlife", icon: "cloud", category: "Mystery & Beyond", title: "Death & Afterlife", subtitle: "The final frontier" },
  { id: "afterlife_beliefs", icon: "eye", category: "Mystery & Beyond", title: "Afterlife Beliefs", subtitle: "Cultural visions of beyond" },
  { id: "astrology_zodiac", icon: "star", category: "Mystery & Beyond", title: "Astrology & Zodiac", subtitle: "Written in the stars" },
  { id: "magic_illusions", icon: "aperture", category: "Mystery & Beyond", title: "Magic & Illusions", subtitle: "Tricks of the trade" }
];

// Map of all config files for facts (so Metro Bundler can resolve them)
export const FACT_CONFIGS = {
  // Nature
  "animals_wildlife": () => require("../facts/animals_wildlife/config").default,
  "ocean_sea_creatures": () => require("../facts/ocean_sea_creatures/config").default,
  "geology_earth_science": () => require("../facts/geology_earth_science/config").default,
  "plants_botany": () => require("../facts/plants_botany/config").default,
  "insects_bugs": () => require("../facts/insects_bugs/config").default,
  "weather_climate": () => require("../facts/weather_climate/config").default,
  "mountains_caves": () => require("../facts/mountains_caves/config").default,
  "rivers_lakes": () => require("../facts/rivers_lakes/config").default,
  "birds_avian_life": () => require("../facts/birds_avian_life/config").default,
  "deserts_dry_lands": () => require("../facts/deserts_dry_lands/config").default,

  // Universe
  "space_astronomy": () => require("../facts/space_astronomy/config").default,
  "chemistry_elements": () => require("../facts/chemistry_elements/config").default,
  "atoms_molecules": () => require("../facts/atoms_molecules/config").default,
  "acids_bases_ph": () => require("../facts/acids_bases_ph/config").default,
  "physics_forces": () => require("../facts/physics_forces/config").default,
  "genetics_evolution": () => require("../facts/genetics_evolution/config").default,
  "microbiology_cells": () => require("../facts/microbiology_cells/config").default,
  "electricity_magnetism": () => require("../facts/electricity_magnetism/config").default,
  "light_optics": () => require("../facts/light_optics/config").default,
  "temperature_energy": () => require("../facts/temperature_energy/config").default,

  // Human Being
  "brain_structure": () => require("../facts/brain_structure/config").default,
  "human_body_organs": () => require("../facts/human_body_organs/config").default,
  "burnout": () => require("../facts/burnout/config").default,
  "dna_genetics": () => require("../facts/dna_genetics/config").default,
  "human_senses": () => require("../facts/human_senses/config").default,
  "sleep_dreams": () => require("../facts/sleep_dreams/config").default,
  "mental_health_psychology": () => require("../facts/mental_health_psychology/config").default,
  "addiction": () => require("../facts/addiction/config").default,
  "anger": () => require("../facts/anger/config").default,
  "anxiety": () => require("../facts/anxiety/config").default,

  // History
  "ancient_history": () => require("../facts/ancient_history/config").default,
  "greek_roman": () => require("../facts/greek_roman/config").default,
  "middle_eastern_history": () => require("../facts/middle_eastern_history/config").default,
  "asian_empires": () => require("../facts/asian_empires/config").default,
  "wars_battles": () => require("../facts/wars_battles/config").default,
  "kings_queens": () => require("../facts/kings_queens/config").default,
  "exploration_discovery": () => require("../facts/exploration_discovery/config").default,
  "slavery_freedom": () => require("../facts/slavery_freedom/config").default,
  "medieval_history": () => require("../facts/medieval_history/config").default,
  "modern_history": () => require("../facts/modern_history/config").default,

  // Countries
  "african_culture": () => require("../facts/african_culture/config").default,
  "asian_culture": () => require("../facts/asian_culture/config").default,
  "south_american_culture": () => require("../facts/south_american_culture/config").default,
  "european_countries": () => require("../facts/european_countries/config").default,
  "north_american_culture": () => require("../facts/north_american_culture/config").default,
  "australia_oceania": () => require("../facts/australia_oceania/config").default,
  "flags_meanings": () => require("../facts/flags_meanings/config").default,
  "languages_communication": () => require("../facts/languages_communication/config").default,
  "traditions_festivals": () => require("../facts/traditions_festivals/config").default,
  "world_cuisines": () => require("../facts/world_cuisines/config").default,

  // Tech
  "computers_internet": () => require("../facts/computers_internet/config").default,
  "artificial_intelligence": () => require("../facts/artificial_intelligence/config").default,
  "smartphones_gadgets": () => require("../facts/smartphones_gadgets/config").default,
  "cars_automobiles": () => require("../facts/cars_automobiles/config").default,
  "aviation_aircraft": () => require("../facts/aviation_aircraft/config").default,
  "space_technology": () => require("../facts/space_technology/config").default,
  "machines_engineering": () => require("../facts/machines_engineering/config").default,
  "energy_power": () => require("../facts/energy_power/config").default,
  "cybersecurity_hacking": () => require("../facts/cybersecurity_hacking/config").default,
  "scientific_inventions": () => require("../facts/scientific_inventions/config").default,

  // Arts
  "theatre_drama": () => require("../facts/theatre_drama/config").default,
  "music_instruments": () => require("../facts/music_instruments/config").default,
  "painting_visual_arts": () => require("../facts/painting_visual_arts/config").default,
  "photography_film": () => require("../facts/photography_film/config").default,
  "architecture_buildings": () => require("../facts/architecture_buildings/config").default,
  "literature_books": () => require("../facts/literature_books/config").default,
  "sculptures_monuments": () => require("../facts/sculptures_monuments/config").default,
  "cinema_directors": () => require("../facts/cinema_directors/config").default,
  "fashion_clothing": () => require("../facts/fashion_clothing/config").default,
  "dance_performing_arts": () => require("../facts/dance_performing_arts/config").default,

  // Ideas
  "philosophy_thinkers": () => require("../facts/philosophy_thinkers/config").default,
  "absurdism": () => require("../facts/absurdism/config").default,
  "atheism": () => require("../facts/atheism/config").default,
  "psychology_behavior": () => require("../facts/psychology_behavior/config").default,
  "mathematics_numbers": () => require("../facts/mathematics_numbers/config").default,
  "critical_thinking": () => require("../facts/critical_thinking/config").default,
  "ethics_morality": () => require("../facts/ethics_morality/config").default,
  "banking": () => require("../facts/banking/config").default,
  "wealth_loops": () => require("../facts/wealth_loops/config").default,
  "consistency": () => require("../facts/consistency/config").default,

  // Sports
  "football_soccer": () => require("../facts/football_soccer/config").default,
  "cricket_baseball": () => require("../facts/cricket_baseball/config").default,
  "basketball_court": () => require("../facts/basketball_court/config").default,
  "tennis_racket": () => require("../facts/tennis_racket/config").default,
  "swimming_water": () => require("../facts/swimming_water/config").default,
  "martial_arts": () => require("../facts/martial_arts/config").default,
  "video_games": () => require("../facts/video_games/config").default,
  "chess_board": () => require("../facts/chess_board/config").default,
  "olympics_athletics": () => require("../facts/olympics_athletics/config").default,
  "extreme_adventure": () => require("../facts/extreme_adventure/config").default,

  // Mystery
  "myths_legends": () => require("../facts/myths_legends/config").default,
  "paranormal_unexplained": () => require("../facts/paranormal_unexplained/config").default,
  "ufo_aliens": () => require("../facts/ufo_aliens/config").default,
  "lost_cities": () => require("../facts/lost_cities/config").default,
  "ancient_religions": () => require("../facts/ancient_religions/config").default,
  "secret_societies": () => require("../facts/secret_societies/config").default,
  "death_afterlife": () => require("../facts/death_afterlife/config").default,
  "afterlife_beliefs": () => require("../facts/afterlife_beliefs/config").default,
  "astrology_zodiac": () => require("../facts/astrology_zodiac/config").default,
  "magic_illusions": () => require("../facts/magic_illusions/config").default,
};

export const FACT_CONFIGS_HI = {
  // Nature
  "animals_wildlife": () => require("../facts/animals_wildlife/config_hi").default,
  "ocean_sea_creatures": () => require("../facts/ocean_sea_creatures/config_hi").default,
  "geology_earth_science": () => require("../facts/geology_earth_science/config_hi").default,
  "plants_botany": () => require("../facts/plants_botany/config_hi").default,
  "insects_bugs": () => require("../facts/insects_bugs/config_hi").default,
  "weather_climate": () => require("../facts/weather_climate/config_hi").default,
  "mountains_caves": () => require("../facts/mountains_caves/config_hi").default,
  "rivers_lakes": () => require("../facts/rivers_lakes/config_hi").default,
  "birds_avian_life": () => require("../facts/birds_avian_life/config_hi").default,
  "deserts_dry_lands": () => require("../facts/deserts_dry_lands/config_hi").default,

  // Universe
  "space_astronomy": () => require("../facts/space_astronomy/config_hi").default,
  "chemistry_elements": () => require("../facts/chemistry_elements/config_hi").default,
  "atoms_molecules": () => require("../facts/atoms_molecules/config_hi").default,
  "acids_bases_ph": () => require("../facts/acids_bases_ph/config_hi").default,
  "physics_forces": () => require("../facts/physics_forces/config_hi").default,
  "genetics_evolution": () => require("../facts/genetics_evolution/config_hi").default,
  "microbiology_cells": () => require("../facts/microbiology_cells/config_hi").default,
  "electricity_magnetism": () => require("../facts/electricity_magnetism/config_hi").default,
  "light_optics": () => require("../facts/light_optics/config_hi").default,
  "temperature_energy": () => require("../facts/temperature_energy/config_hi").default,

  // Human Being
  "brain_structure": () => require("../facts/brain_structure/config_hi").default,
  "human_body_organs": () => require("../facts/human_body_organs/config_hi").default,
  "burnout": () => require("../facts/burnout/config_hi").default,
  "dna_genetics": () => require("../facts/dna_genetics/config_hi").default,
  "human_senses": () => require("../facts/human_senses/config_hi").default,
  "sleep_dreams": () => require("../facts/sleep_dreams/config_hi").default,
  "mental_health_psychology": () => require("../facts/mental_health_psychology/config_hi").default,
  "addiction": () => require("../facts/addiction/config_hi").default,
  "anger": () => require("../facts/anger/config_hi").default,
  "anxiety": () => require("../facts/anxiety/config_hi").default,

  // History
  "ancient_history": () => require("../facts/ancient_history/config_hi").default,
  "greek_roman": () => require("../facts/greek_roman/config_hi").default,
  "middle_eastern_history": () => require("../facts/middle_eastern_history/config_hi").default,
  "asian_empires": () => require("../facts/asian_empires/config_hi").default,
  "wars_battles": () => require("../facts/wars_battles/config_hi").default,
  "kings_queens": () => require("../facts/kings_queens/config_hi").default,
  "exploration_discovery": () => require("../facts/exploration_discovery/config_hi").default,
  "slavery_freedom": () => require("../facts/slavery_freedom/config_hi").default,
  "medieval_history": () => require("../facts/medieval_history/config_hi").default,
  "modern_history": () => require("../facts/modern_history/config_hi").default,

  // Countries
  "african_culture": () => require("../facts/african_culture/config_hi").default,
  "asian_culture": () => require("../facts/asian_culture/config_hi").default,
  "south_american_culture": () => require("../facts/south_american_culture/config_hi").default,
  "european_countries": () => require("../facts/european_countries/config_hi").default,
  "north_american_culture": () => require("../facts/north_american_culture/config_hi").default,
  "australia_oceania": () => require("../facts/australia_oceania/config_hi").default,
  "flags_meanings": () => require("../facts/flags_meanings/config_hi").default,
  "languages_communication": () => require("../facts/languages_communication/config_hi").default,
  "traditions_festivals": () => require("../facts/traditions_festivals/config_hi").default,
  "world_cuisines": () => require("../facts/world_cuisines/config_hi").default,

  // Tech
  "computers_internet": () => require("../facts/computers_internet/config_hi").default,
  "artificial_intelligence": () => require("../facts/artificial_intelligence/config_hi").default,
  "smartphones_gadgets": () => require("../facts/smartphones_gadgets/config_hi").default,
  "cars_automobiles": () => require("../facts/cars_automobiles/config_hi").default,
  "aviation_aircraft": () => require("../facts/aviation_aircraft/config_hi").default,
  "space_technology": () => require("../facts/space_technology/config_hi").default,
  "machines_engineering": () => require("../facts/machines_engineering/config_hi").default,
  "energy_power": () => require("../facts/energy_power/config_hi").default,
  "cybersecurity_hacking": () => require("../facts/cybersecurity_hacking/config_hi").default,
  "scientific_inventions": () => require("../facts/scientific_inventions/config_hi").default,

  // Arts
  "theatre_drama": () => require("../facts/theatre_drama/config_hi").default,
  "music_instruments": () => require("../facts/music_instruments/config_hi").default,
  "painting_visual_arts": () => require("../facts/painting_visual_arts/config_hi").default,
  "photography_film": () => require("../facts/photography_film/config_hi").default,
  "architecture_buildings": () => require("../facts/architecture_buildings/config_hi").default,
  "literature_books": () => require("../facts/literature_books/config_hi").default,
  "sculptures_monuments": () => require("../facts/sculptures_monuments/config_hi").default,
  "cinema_directors": () => require("../facts/cinema_directors/config_hi").default,
  "fashion_clothing": () => require("../facts/fashion_clothing/config_hi").default,
  "dance_performing_arts": () => require("../facts/dance_performing_arts/config_hi").default,

  // Ideas
  "philosophy_thinkers": () => require("../facts/philosophy_thinkers/config_hi").default,
  "absurdism": () => require("../facts/absurdism/config_hi").default,
  "atheism": () => require("../facts/atheism/config_hi").default,
  "psychology_behavior": () => require("../facts/psychology_behavior/config_hi").default,
  "mathematics_numbers": () => require("../facts/mathematics_numbers/config_hi").default,
  "critical_thinking": () => require("../facts/critical_thinking/config_hi").default,
  "ethics_morality": () => require("../facts/ethics_morality/config_hi").default,
  "banking": () => require("../facts/banking/config_hi").default,
  "wealth_loops": () => require("../facts/wealth_loops/config_hi").default,
  "consistency": () => require("../facts/consistency/config_hi").default,

  // Sports
  "football_soccer": () => require("../facts/football_soccer/config_hi").default,
  "cricket_baseball": () => require("../facts/cricket_baseball/config_hi").default,
  "basketball_court": () => require("../facts/basketball_court/config_hi").default,
  "tennis_racket": () => require("../facts/tennis_racket/config_hi").default,
  "swimming_water": () => require("../facts/swimming_water/config_hi").default,
  "martial_arts": () => require("../facts/martial_arts/config_hi").default,
  "video_games": () => require("../facts/video_games/config_hi").default,
  "chess_board": () => require("../facts/chess_board/config_hi").default,
  "olympics_athletics": () => require("../facts/olympics_athletics/config_hi").default,
  "extreme_adventure": () => require("../facts/extreme_adventure/config_hi").default,

  // Mystery
  "myths_legends": () => require("../facts/myths_legends/config_hi").default,
  "paranormal_unexplained": () => require("../facts/paranormal_unexplained/config_hi").default,
  "ufo_aliens": () => require("../facts/ufo_aliens/config_hi").default,
  "lost_cities": () => require("../facts/lost_cities/config_hi").default,
  "ancient_religions": () => require("../facts/ancient_religions/config_hi").default,
  "secret_societies": () => require("../facts/secret_societies/config_hi").default,
  "death_afterlife": () => require("../facts/death_afterlife/config_hi").default,
  "afterlife_beliefs": () => require("../facts/afterlife_beliefs/config_hi").default,
  "astrology_zodiac": () => require("../facts/astrology_zodiac/config_hi").default,
  "magic_illusions": () => require("../facts/magic_illusions/config_hi").default,
};
