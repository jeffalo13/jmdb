// ---- 1) Flavor taxonomy ----
export type Flavor =
  // Tone / Style
  | "Parody Spoof"
  | "Anarchic Comedy"
  | "Noir Neo Noir"
  | "Satire"
  | "Melodrama"
  | "Psychological Thriller"
  | "Suspense Thriller"
  | "Action Thriller"
  | "Epic Grand Drama"
  | "Inspirational Drama"
  | "Existential Drama"
  | "Avant Garde Experimental"
  | "Dark Comedy"

  // Theme / Focus
  | "War And Trauma"
  | "Addiction Self Destruction"
  | "Identity Memory"
  | "Time Determinism"
  | "Language Communication"
  | "Religion Faith"
  | "Artificial Intelligence"
  | "Political Corruption"
  | "Moral Dilemma"
  | "Revenge Vengeance"
  | "Isolation Madness"
  | "Power Control"
  | "Family Legacy"
  | "Love Loss"

  // Sci-Fi & Fantasy
  | "Space Opera"
  | "Cyberpunk"
  | "Post Apocalyptic"
  | "Dystopian Future"
  | "Alien Contact Invasion"
  | "Time Travel Sci Fi"
  | "Science Fantasy"
  | "High Fantasy"
  | "Dark Fantasy"
  | "Superhero"
  | "Mythic Religious Fantasy"

  // Action / Crime
  | "Espionage Spy Thriller"
  | "Crime Epic Gangster"
  | "Heist"
  | "Assassin Hitman"
  | "Military War Action"
  | "Police Procedural"
  | "Vigilante Justice"
  | "Conspiracy Thriller"

  // Drama & Character Study
  | "Biographical Drama"
  | "Legal Drama Courtroom"
  | "Coming Of Age"
  | "Romantic Tragedy"
  | "Music Drama"
  | "Psychological Character Study"
  | "Family Saga"
  | "Historical Epic"

  // Horror & Suspense
  | "Supernatural Horror"
  | "Possession Exorcism"
  | "Slasher"
  | "Folk Horror"
  | "Body Horror"
  | "Haunted House"
  | "Found Footage"
  | "Creature Feature"
  | "Occult Horror"
  | "Survival Horror"
  | "Psychological Horror"

  // Setting-Driven
  | "Space Setting"
  | "Fantasy World"
  | "War Zone"
  | "Urban Crime"
  | "Ancient World"
  | "Rural America"
  | "Futuristic City"

  // Mood / Emotion
  | "Bleak Somber"
  | "Philosophical Reflective"
  | "Tense Paranoid"
  | "Hopeful Uplifting"
  | "Nostalgic Whimsical"
  | "Macabre Disturbing"
  | "Romantic Bittersweet"
  | "Playful Irreverent"
  | "Cynical Sardonic";

// Optional: export the full list if needed elsewhere
export const ALL_FLAVORS: readonly Flavor[] = [
  "Parody Spoof","Anarchic Comedy","Noir Neo Noir","Satire","Melodrama","Psychological Thriller",
  "Suspense Thriller","Action Thriller","Epic Grand Drama","Inspirational Drama","Existential Drama",
  "Avant Garde Experimental","Dark Comedy",

  "War And Trauma","Addiction Self Destruction","Identity Memory","Time Determinism","Language Communication",
  "Religion Faith","Artificial Intelligence","Political Corruption","Moral Dilemma","Revenge Vengeance",
  "Isolation Madness","Power Control","Family Legacy","Love Loss",

  "Space Opera","Cyberpunk","Post Apocalyptic","Dystopian Future","Alien Contact Invasion","Time Travel Sci Fi",
  "Science Fantasy","High Fantasy","Dark Fantasy","Superhero","Mythic Religious Fantasy",

  "Espionage Spy Thriller","Crime Epic Gangster","Heist","Assassin Hitman","Military War Action","Police Procedural",
  "Vigilante Justice","Conspiracy Thriller",

  "Biographical Drama","Legal Drama Courtroom","Coming Of Age","Romantic Tragedy","Music Drama",
  "Psychological Character Study","Family Saga","Historical Epic",

  "Supernatural Horror","Possession Exorcism","Slasher","Folk Horror","Body Horror","Haunted House",
  "Found Footage","Creature Feature","Occult Horror","Survival Horror",

  "Space Setting","Fantasy World","War Zone","Urban Crime","Ancient World","Rural America","Futuristic City",

  "Bleak Somber","Philosophical Reflective","Tense Paranoid","Hopeful Uplifting","Nostalgic Whimsical",
  "Macabre Disturbing","Romantic Bittersweet","Playful Irreverent","Cynical Sardonic",
] as const;

// ---- 2) Normalization helpers ----
const normalize = (s: string) =>
  s.trim().toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ");

// Some light aliasing for plurals / hyphenation / common variants
const ALIASES: Record<string, string> = {
  "ai": "artificial intelligence",
  "a.i.": "artificial intelligence",
  "u.s.": "us",
  "u.s": "us",
  "sci fi": "sci-fi",
  "science fiction": "sci-fi",
  "super hero": "superhero",
  "neo noir": "neo-noir",
  "crime epic": "gangster",
  "gangsters": "gangster",
  "assassins": "assassin",
  "hitmen": "hitman",
  "vigilante": "vigilantism",
  "possessions": "possession",
  "exorcisms": "exorcism",
  "witch craft": "witchcraft",
};

// ---- 3) Keyword → Flavors mapping ----
// NOTE: Keep keywords lowercase & singular where possible. Add liberally as you iterate.
export const KEYWORD_TO_FLAVORS: Record<string, Flavor[]> = {
  // Tone / Style
  "parody": ["Parody Spoof","Playful Irreverent"],
  "spoof": ["Parody Spoof","Playful Irreverent"],
  "anarchic comedy": ["Anarchic Comedy","Playful Irreverent"],
  "satire": ["Satire"],
  "neo-noir": ["Noir Neo Noir","Urban Crime"],
  "noir": ["Noir Neo Noir","Urban Crime"],
  "melodrama": ["Melodrama"],
  "psychological thriller": ["Psychological Thriller","Tense Paranoid"],
  "dark comedy": ["Dark Comedy","Cynical Sardonic"],
  "suspenseful": ["Suspense Thriller","Tense Paranoid"],
  "suspense thriller": ["Suspense Thriller","Tense Paranoid"],
  "action thriller": ["Action Thriller"],
  "epic": ["Epic Grand Drama","Historical Epic"],
  "existential": ["Existential Drama","Philosophical Reflective"],
  "avant garde": ["Avant Garde Experimental"],
  "experimental": ["Avant Garde Experimental"],

  // Theme / Focus
  "ptsd": ["War And Trauma","Psychological Character Study"],
  "trauma": ["War And Trauma","Psychological Character Study"],
  "vietnam veteran": ["War And Trauma","Psychological Character Study"],
  "war": ["War And Trauma","Military War Action"],
  "addiction": ["Addiction Self Destruction","Psychological Character Study"],
  "alcoholism": ["Addiction Self Destruction","Psychological Character Study"],
  "identity": ["Identity Memory"],
  "amnesia": ["Identity Memory","Psychological Thriller"],
  "double life": ["Identity Memory","Noir Neo Noir"],
  "memory": ["Identity Memory"],
  "time": ["Time Determinism"],
  "time manipulation": ["Time Determinism","Time Travel Sci Fi"],
  "language": ["Language Communication"],
  "linguistics": ["Language Communication","Philosophical Reflective"],
  "religion": ["Religion Faith"],
  "faith": ["Religion Faith"],
  "artificial intelligence": ["Artificial Intelligence","Dystopian Future"],
  "political corruption": ["Political Corruption","Conspiracy Thriller"],
  "moral dilemma": ["Moral Dilemma","Philosophical Reflective"],
  "revenge": ["Revenge Vengeance","Action Thriller"],
  "isolation": ["Isolation Madness","Bleak Somber"],
  "madness": ["Isolation Madness","Psychological Horror"],
  "power": ["Power Control"],
  "family": ["Family Legacy"],
  "love": ["Love Loss","Romantic Bittersweet"],
  "grief": ["Love Loss","Bleak Somber"],

  // Sci-Fi & Fantasy
  "space opera": ["Space Opera","Space Setting"],
  "space": ["Space Setting","Science Fantasy"],
  "spaceship": ["Space Setting","Space Opera"],
  "spacecraft": ["Space Setting","Space Opera"],
  "cyberpunk": ["Cyberpunk","Futuristic City"],
  "post-apocalyptic": ["Post Apocalyptic","Bleak Somber"],
  "dystopia": ["Dystopian Future","Political Corruption"],
  "time travel": ["Time Travel Sci Fi","Time Determinism"],
  "alien": ["Alien Contact Invasion","Creature Feature","Space Setting"],
  "alien contact": ["Alien Contact Invasion","Philosophical Reflective"],
  "science fantasy": ["Science Fantasy"],
  "superhero": ["Superhero","Action Thriller"],
  "high fantasy": ["High Fantasy","Fantasy World"],
  "dark fantasy": ["Dark Fantasy","Fantasy World"],
  "mythic": ["Mythic Religious Fantasy","Fantasy World"],
  "wizard": ["High Fantasy","Fantasy World"],
  "ring": ["High Fantasy","Fantasy World"],
  "sword": ["High Fantasy","Fantasy World"],

  // Action / Crime
  "espionage": ["Espionage Spy Thriller","Conspiracy Thriller"],
  "spy": ["Espionage Spy Thriller"],
  "cia": ["Espionage Spy Thriller","Conspiracy Thriller"],
  "mi6": ["Espionage Spy Thriller"],
  "assassin": ["Assassin Hitman","Action Thriller"],
  "hitman": ["Assassin Hitman","Action Thriller"],
  "police": ["Police Procedural","Urban Crime"],
  "police officer": ["Police Procedural"],
  "undercover": ["Police Procedural","Espionage Spy Thriller","Urban Crime"],
  "heist": ["Heist","Urban Crime"],
  "robbery": ["Heist","Urban Crime"],
  "gangster": ["Crime Epic Gangster","Urban Crime"],
  "mafia": ["Crime Epic Gangster"],
  "vigilantism": ["Vigilante Justice","Action Thriller"],
  "conspiracy": ["Conspiracy Thriller","Tense Paranoid"],
  "military": ["Military War Action","War Zone"],
  "delta force": ["Military War Action"],
  "swat": ["Police Procedural","Action Thriller"],

  // Drama & Character Study
  "biography": ["Biographical Drama","Psychological Character Study"],
  "based on true story": ["Biographical Drama"],
  "legal": ["Legal Drama Courtroom"],
  "courtroom": ["Legal Drama Courtroom"],
  "coming of age": ["Coming Of Age"],
  "romance": ["Romantic Tragedy","Romantic Bittersweet"],
  "music": ["Music Drama"],
  "musician": ["Music Drama","Psychological Character Study"],
  "character study": ["Psychological Character Study"],
  "family saga": ["Family Saga","Epic Grand Drama"],
  "historical": ["Historical Epic","Epic Grand Drama"],

  // Horror & Suspense
  "supernatural horror": ["Supernatural Horror"],
  "possession": ["Possession Exorcism","Supernatural Horror"],
  "exorcism": ["Possession Exorcism","Supernatural Horror"],
  "slasher": ["Slasher"],
  "folk horror": ["Folk Horror"],
  "body horror": ["Body Horror","Macabre Disturbing"],
  "haunted house": ["Haunted House","Supernatural Horror"],
  "ghost": ["Haunted House","Supernatural Horror"],
  "found footage": ["Found Footage","Survival Horror"],
  "creature feature": ["Creature Feature","Survival Horror"],
  "occult": ["Occult Horror","Supernatural Horror"],
  "survival horror": ["Survival Horror","Tense Paranoid"],

  // Setting-Driven
  "space setting": ["Space Setting"],
  "fantasy world": ["Fantasy World"],
  "war zone": ["War Zone","Bleak Somber"],
  "urban crime": ["Urban Crime"],
  "ancient world": ["Ancient World","Historical Epic"],
  "futuristic city": ["Futuristic City","Cyberpunk"],
  "rural": ["Rural America"],

  // Mood / Emotion
  "bleak": ["Bleak Somber"],
  "somber": ["Bleak Somber"],
  "philosophical": ["Philosophical Reflective"],
  "reflective": ["Philosophical Reflective"],
  "tense": ["Tense Paranoid"],
  "paranoid": ["Tense Paranoid"],
  "hopeful": ["Hopeful Uplifting"],
  "uplifting": ["Hopeful Uplifting"],
  "nostalgic": ["Nostalgic Whimsical"],
  "whimsical": ["Nostalgic Whimsical","Playful Irreverent"],
  "macabre": ["Macabre Disturbing"],
  "disturbing": ["Macabre Disturbing"],
  "bittersweet": ["Romantic Bittersweet"],
  "playful": ["Playful Irreverent"],
  "irreverent": ["Playful Irreverent"],
  "cynical": ["Cynical Sardonic"],
  "sardonic": ["Cynical Sardonic"],

  // Common concrete terms from your list → broad flavors
  "airplane": ["Action Thriller","Parody Spoof"],
  "pilot": ["Action Thriller"],
  "fear of flying": ["Psychological Thriller","Action Thriller"],
  "food poisoning": ["Dark Comedy","Parody Spoof"],
  "android": ["Science Fantasy","Artificial Intelligence","Dystopian Future"],
  "space marine": ["Space Opera","Military War Action"],
  "parasite": ["Body Horror","Creature Feature","Science Fantasy"],
  "linguist": ["Language Communication","Philosophical Reflective"],
  "first contact": ["Alien Contact Invasion","Philosophical Reflective"],
  "superheroine": ["Superhero","Action Thriller"],
  "vigilante": ["Vigilante Justice","Noir Neo Noir"],
  "masked superhero": ["Superhero","Noir Neo Noir"],
  "serial killer": ["Psychological Thriller","Urban Crime"],
  "nihilism": ["Existential Drama","Dark Comedy","Noir Neo Noir"],
  "drug cartel": ["Urban Crime","Crime Epic Gangster","Action Thriller"],
  "cartel": ["Urban Crime","Crime Epic Gangster"],
  "helicopter crash": ["Military War Action","Action Thriller"],
  "rescue operation": ["Military War Action","Action Thriller"],
  "ballet": ["Psychological Character Study","Psychological Thriller","Melodrama"],
  "vampire": ["Supernatural Horror","Dark Fantasy","Action Thriller"],
  "sword fight": ["High Fantasy","Action Thriller"],
  "amnesia patient": ["Identity Memory","Psychological Thriller"],
  "spycraft": ["Espionage Spy Thriller","Conspiracy Thriller"],
  "cia agent": ["Espionage Spy Thriller"],
  "interpol": ["Espionage Spy Thriller","Police Procedural"],
  "torture": ["Macabre Disturbing"],
  "casino": ["Heist","Urban Crime"],
  "terrorism": ["Action Thriller","Conspiracy Thriller"],
  "bounty hunter": ["Action Thriller","Vigilante Justice"],
  "planet invasion": ["Alien Contact Invasion","Space Opera"],
  "multiverse": ["Science Fantasy","Time Travel Sci Fi"],
  "clone": ["Science Fantasy","Dystopian Future"],
  "quantum physics": ["Time Travel Sci Fi","Philosophical Reflective"],
  "hostage": ["Action Thriller","Suspense Thriller","Police Procedural"],
  "contract killer": ["Assassin Hitman","Noir Neo Noir"],
  "undercover cop": ["Police Procedural","Urban Crime","Noir Neo Noir"],
  "mayoral election": ["Political Corruption","Noir Neo Noir"],
  "time bomb": ["Action Thriller","Suspense Thriller"],
  "hacking": ["Cyberpunk","Conspiracy Thriller","Action Thriller"],
  "nuclear weapons": ["Action Thriller","Conspiracy Thriller"],
  "chernobyl": ["Historical Epic","Bleak Somber"],
  "plantation": ["Historical Epic","Family Saga"],
  "slavery": ["Historical Epic","Bleak Somber","Moral Dilemma"],
  "stunt driver": ["Action Thriller","Noir Neo Noir"],
  "prophecy": ["High Fantasy","Mythic Religious Fantasy"],
  "desert": ["Science Fantasy","Epic Grand Drama"],
  "chosen one": ["High Fantasy","Science Fantasy","Epic Grand Drama"],
  "cyborg": ["Science Fantasy","Cyberpunk"],
  "ancient evil": ["Occult Horror","Dark Fantasy","Supernatural Horror"],
  "gladiator": ["Historical Epic","Epic Grand Drama"],
  "mafia war": ["Crime Epic Gangster"],
  "court case": ["Legal Drama Courtroom"],
  "electric chair": ["Legal Drama Courtroom","Bleak Somber"],
  "mythology": ["Mythic Religious Fantasy","Fantasy World"],
  "witchcraft": ["Folk Horror","Occult Horror","Supernatural Horror"],
  "bomb squad": ["Action Thriller","Military War Action"],
  "virtual reality": ["Cyberpunk","Science Fantasy"],
  "dream": ["Psychological Thriller","Existential Drama"],
  "nazi": ["Historical Epic","War And Trauma","Macabre Disturbing"],
  "black hole": ["Science Fantasy","Philosophical Reflective"],
  "astronaut": ["Space Setting","Space Opera"],
  "monolith": ["Philosophical Reflective","Science Fantasy"],
  "lion": ["Mythic Religious Fantasy","Family Saga"],
  "war hero": ["War And Trauma","Historical Epic"],
  "hand drawn animation": ["Nostalgic Whimsical"],
  "polar night": ["Survival Horror","Bleak Somber"],
  "haunted hotel": ["Haunted House","Psychological Horror"],
  "snuff": ["Macabre Disturbing","Psychological Thriller"],
  "demonic": ["Possession Exorcism","Occult Horror","Supernatural Horror"],
  "body-swap": ["Science Fantasy","Romantic Bittersweet"],
  "anime": ["Nostalgic Whimsical","Science Fantasy"],
  "mossad": ["Espionage Spy Thriller"],
  "al qaeda": ["Conspiracy Thriller","Military War Action"],
  "terrorist attack": ["Action Thriller","Conspiracy Thriller"],
  "super computer": ["Artificial Intelligence","Cyberpunk"],
  "ai rebellion": ["Artificial Intelligence","Dystopian Future"],
  "hyena": ["Mythic Religious Fantasy"],
  "puzzle": ["Psychological Thriller", "Suspense Thriller"],

  // Horror brand anchors
  "the conjuring universe": ["Supernatural Horror","Possession Exorcism","Occult Horror"],
  "jigsaw": ["Survival Horror","Macabre Disturbing","Psychological Thriller"],
  "haunted doll": ["Supernatural Horror","Occult Horror","Haunted House"],
  "satanic cult": ["Occult Horror","Folk Horror"],

  // Crime/action anchors
  "hostage negotiator": ["Action Thriller","Police Procedural"],
  "heist crew": ["Heist","Urban Crime"],
  "parkour": ["Action Thriller"],
  "algorithm": ["Cyberpunk","Conspiracy Thriller"],

  // Music / fame
  "jazz": ["Music Drama","Psychological Character Study"],
  "drummer": ["Music Drama","Psychological Character Study"],
  "addiction (music)": ["Music Drama","Addiction Self Destruction"],

  // Folk / occult anchors
  "goat": ["Folk Horror","Occult Horror"],
  "puritan": ["Folk Horror","Historical Epic"],

  // Found footage anchors
  "found footage tape": ["Found Footage","Survival Horror"],

  // Family / legacy anchors
  "patriarch": ["Family Saga","Historical Epic"],

  // Legal / moral anchors
  "murder trial": ["Legal Drama Courtroom","Psychological Thriller"],
};

// ---- 4) Public API ----

/** Returns the canonical keyword key (after normalization + alias mapping). */
export function canonicalizeKeyword(raw: string): string {
  const n = normalize(raw);
  return ALIASES[n] ?? n;
}

/** Look up flavors for a single keyword. Returns [] for unknown / too-specific terms. */
export function getFlavorsForKeyword(keyword: string): Flavor[] {
  const key = canonicalizeKeyword(keyword);
  return KEYWORD_TO_FLAVORS[key] ?? [];
}

/** Aggregate unique flavors for a set of keywords. */
export function getFlavorsForKeywords(keywords: string[]): Flavor[] {
  const set = new Set<Flavor>();
  for (const k of keywords) {
    for (const f of getFlavorsForKeyword(k)) set.add(f);
  }
  return Array.from(set);
}

/** Add or extend a mapping at runtime (useful while iterating in dev tools). */
export function upsertKeywordMapping(keyword: string, flavors: Flavor[]) {
  const key = canonicalizeKeyword(keyword);
  const existing = KEYWORD_TO_FLAVORS[key] ?? [];
  const merged = Array.from(new Set<Flavor>([...existing, ...flavors]));
  KEYWORD_TO_FLAVORS[key] = merged;
}

/** Replace mapping for a keyword entirely (be careful). */
export function setKeywordMapping(keyword: string, flavors: Flavor[]) {
  const key = canonicalizeKeyword(keyword);
  KEYWORD_TO_FLAVORS[key] = Array.from(new Set(flavors));
}
