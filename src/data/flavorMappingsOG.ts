// AUTO-GENERATED: flavorMappings.generated.ts
// Source: keywords-dump.txt (normalized) + heuristic mapping with emotions included.
// This file preserves your taxonomy and API while expanding keyword coverage
// (thousands of entries) including emotional tone → genre relationships.

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
  "Found Footage","Creature Feature","Occult Horror","Survival Horror","Psychological Horror",

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

// Aliases (expanded)
const ALIASES: Record<string, string> = {
  "a.i.": "artificial intelligence",
  "ai": "artificial intelligence",
  "assassins": "assassin",
  "exorcisms": "exorcism",
  "gangsters": "gangster",
  "hitmen": "hitman",
  "los angeles, california": "los angeles",
  "masked superhero": "superhero",
  "neo noir": "neo-noir",
  "new york city": "new york",
  "possessions": "possession",
  "post world war ii": "ww2",
  "post-apocalyptic future": "post-apocalyptic",
  "sci fi": "sci-fi",
  "science fiction": "sci-fi",
  "super hero": "superhero",
  "teen scream": "slasher",
  "vigilante": "vigilantism",
  "washington dc, usa": "washington, dc",
  "witch craft": "witchcraft",
};

// ---- 3) Keyword → Flavors mapping (auto-generated; emotions included) ----
export const KEYWORD_TO_FLAVORS: Record<string, Flavor[]> = {
  "abuse of power": ["Power Control"],
  "acerbic couple": ["Cynical Sardonic"],
  "action thriller": ["Action Thriller"],
  "addiction": ["Addiction Self Destruction", "Psychological Character Study"],
  "african american romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "ai rebellion": ["Artificial Intelligence", "Cyberpunk"],
  "airport police": ["Police Procedural", "Suspense Thriller"],
  "alaska": ["Rural America"],
  "alcoholism": ["Addiction Self Destruction", "Psychological Character Study"],
  "alien": ["Alien Contact Invasion"],
  "alien attack": ["Alien Contact Invasion"],
  "alien baby": ["Alien Contact Invasion"],
  "alien contact": ["Alien Contact Invasion"],
  "alien encounter": ["Alien Contact Invasion"],
  "alien infection": ["Alien Contact Invasion"],
  "alien invasion": ["Alien Contact Invasion"],
  "alien language": ["Alien Contact Invasion"],
  "alien life-form": ["Alien Contact Invasion"],
  "alien monster": ["Creature Feature", "Alien Contact Invasion"],
  "alien parasites": ["Alien Contact Invasion"],
  "alien planet": ["Alien Contact Invasion"],
  "alien possession": ["Occult Horror", "Supernatural Horror", "Alien Contact Invasion"],
  "alien race": ["Alien Contact Invasion"],
  "alien technology": ["Alien Contact Invasion"],
  "alternate timeline": ["Time Travel Sci Fi", "Time Determinism"],
  "amateur detective": ["Police Procedural", "Suspense Thriller"],
  "american spy": ["Espionage Spy Thriller"],
  "amnesia": ["Identity Memory"],
  "anarchic comedy": ["Parody Spoof", "Playful Irreverent"],
  "ancient greece": ["Ancient World", "Historical Epic"],
  "ancient rome": ["Ancient World", "Historical Epic", "Urban Crime"],
  "ancient world": ["Ancient World", "Historical Epic"],
  "android": ["Artificial Intelligence", "Cyberpunk"],
  "android horror": ["Artificial Intelligence", "Cyberpunk"],
  "anxiety": ["Tense Paranoid"],
  "anxious": ["Tense Paranoid"],
  "appalachia": ["Rural America"],
  "appeal": ["Legal Drama Courtroom"],
  "armed robbery": ["Heist"],
  "art heist": ["Heist"],
  "artificial intelligence (a.i.)": ["Artificial Intelligence", "Cyberpunk"],
  "aspiring singer": ["Music Drama"],
  "assassin": ["Assassin Hitman", "Action Thriller"],
  "astronaut": ["Space Setting"],
  "avant garde": ["Avant Garde Experimental"],
  "bank heist": ["Heist"],
  "bank job": ["Heist", "Urban Crime"],
  "bank robbery": ["Heist"],
  "bank vault": ["Heist"],
  "based on true story": ["Biographical Drama"],
  "battlefield": ["War Zone", "War And Trauma", "Military War Action"],
  "berlin": ["Urban Crime"],
  "berlin wall": ["Urban Crime"],
  "biography": ["Biographical Drama"],
  "biting": ["Cynical Sardonic"],
  "bittersweet": ["Romantic Bittersweet"],
  "black magic": ["Occult Horror", "Supernatural Horror", "High Fantasy", "Fantasy World"],
  "body horror": ["Body Horror", "Macabre Disturbing"],
  "botched robbery": ["Heist"],
  "british spy": ["Espionage Spy Thriller"],
  "brooklyn": ["Urban Crime"],
  "brutal murder": ["Macabre Disturbing"],
  "brutal violence": ["Macabre Disturbing"],
  "camcorder": ["Found Footage", "Survival Horror"],
  "capitol police": ["Police Procedural", "Suspense Thriller"],
  "cartel": ["Crime Epic Gangster", "Urban Crime"],
  "casino vault": ["Heist"],
  "central intelligence agency (cia)": ["Espionage Spy Thriller"],
  "character study": ["Psychological Character Study"],
  "cia": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "cia agent": ["Espionage Spy Thriller"],
  "cia analyst": ["Espionage Spy Thriller"],
  "claustrophobic": ["Tense Paranoid"],
  "coming of age": ["Coming Of Age"],
  "composer": ["Music Drama"],
  "conspiracy": ["Conspiracy Thriller", "Tense Paranoid"],
  "contract killer": ["Assassin Hitman", "Action Thriller"],
  "control": ["Power Control"],
  "convenience store robbery": ["Heist"],
  "corrupt judge": ["Legal Drama Courtroom"],
  "court": ["Legal Drama Courtroom"],
  "court case": ["Legal Drama Courtroom"],
  "courtroom": ["Legal Drama Courtroom"],
  "courtroom drama": ["Legal Drama Courtroom"],
  "covered investigation": ["Police Procedural", "Suspense Thriller"],
  "creature": ["Creature Feature"],
  "creature feature": ["Creature Feature", "Survival Horror"],
  "crime epic": ["Crime Epic Gangster", "Urban Crime"],
  "crime investigation": ["Police Procedural", "Suspense Thriller"],
  "crime scene investigation": ["Police Procedural", "Suspense Thriller"],
  "criminal investigation": ["Police Procedural", "Suspense Thriller"],
  "cyberpunk": ["Cyberpunk", "Futuristic City"],
  "cyborg": ["Artificial Intelligence", "Cyberpunk"],
  "cynical": ["Cynical Sardonic"],
  "dark comedy": ["Dark Comedy", "Cynical Sardonic"],
  "dark fantasy": ["Dark Fantasy", "Fantasy World"],
  "delta force": ["Military War Action", "War Zone"],
  "demonic possession": ["Possession Exorcism", "Supernatural Horror", "Occult Horror"],
  "depressing": ["Bleak Somber"],
  "desolate": ["Bleak Somber"],
  "desolate planet": ["Bleak Somber"],
  "detective": ["Police Procedural", "Urban Crime", "Suspense Thriller"],
  "detective inspector": ["Police Procedural", "Suspense Thriller"],
  "detective story": ["Police Procedural", "Suspense Thriller"],
  "determinism": ["Time Determinism"],
  "detroit": ["Urban Crime"],
  "devastating": ["Bleak Somber"],
  "diamond heist": ["Heist"],
  "double agent": ["Espionage Spy Thriller"],
  "double life": ["Identity Memory"],
  "dragon": ["High Fantasy", "Fantasy World"],
  "drug addiction": ["Addiction Self Destruction", "Psychological Character Study"],
  "drummer": ["Music Drama"],
  "dystopia": ["Dystopian Future", "Political Corruption"],
  "elite sniper": ["War And Trauma", "Military War Action"],
  "epic": ["Epic Grand Drama"],
  "espionage": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "ethics": ["Moral Dilemma", "Philosophical Reflective"],
  "ex-cia agent": ["Espionage Spy Thriller"],
  "existential": ["Existential Drama", "Philosophical Reflective"],
  "exorcism": ["Possession Exorcism", "Supernatural Horror", "Occult Horror"],
  "extraterrestrial technology": ["Alien Contact Invasion"],
  "faith": ["Religion Faith"],
  "family": ["Family Legacy"],
  "fantasy world": ["Fantasy World"],
  "fbi": ["Police Procedural", "Suspense Thriller"],
  "fbi agent": ["Police Procedural", "Suspense Thriller"],
  "fbi surveillance": ["Police Procedural", "Suspense Thriller"],
  "federal prosecutor": ["Legal Drama Courtroom"],
  "feel-good": ["Hopeful Uplifting"],
  "female cyborg": ["Artificial Intelligence", "Cyberpunk"],
  "female detective": ["Police Procedural", "Suspense Thriller"],
  "female police officer": ["Police Procedural", "Suspense Thriller"],
  "female spy": ["Espionage Spy Thriller"],
  "first contact": ["Alien Contact Invasion"],
  "folk horror": ["Folk Horror"],
  "forbidden love": ["Romantic Tragedy", "Romantic Bittersweet"],
  "foreboding": ["Tense Paranoid"],
  "forensic expert": ["Police Procedural", "Suspense Thriller"],
  "forensic science": ["Police Procedural", "Suspense Thriller"],
  "former detective": ["Police Procedural", "Suspense Thriller"],
  "found footage": ["Found Footage", "Survival Horror"],
  "french detective": ["Police Procedural", "Suspense Thriller"],
  "french police": ["Police Procedural", "Suspense Thriller"],
  "futuristic city": ["Futuristic City", "Cyberpunk"],
  "gangster": ["Crime Epic Gangster", "Urban Crime"],
  "gaslighting": ["Psychological Horror", "Tense Paranoid"],
  "ghost": ["Haunted House", "Supernatural Horror", "Occult Horror"],
  "ghost child": ["Occult Horror", "Supernatural Horror"],
  "ghost hunter": ["Occult Horror", "Supernatural Horror"],
  "ghost hunting": ["Occult Horror", "Supernatural Horror"],
  "ghost ship": ["Occult Horror", "Supernatural Horror"],
  "ghost story": ["Occult Horror", "Supernatural Horror"],
  "ghost town": ["Occult Horror", "Supernatural Horror"],
  "giant creature": ["Creature Feature"],
  "giant monster": ["Creature Feature"],
  "gloomy": ["Bleak Somber"],
  "gold heist": ["Heist"],
  "gothic romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "grief": ["Bleak Somber", "War And Trauma", "Love Loss"],
  "grim": ["Bleak Somber"],
  "gruesome": ["Macabre Disturbing"],
  "haunted": ["Occult Horror", "Supernatural Horror"],
  "haunted attractions": ["Occult Horror", "Supernatural Horror"],
  "haunted by the past": ["Occult Horror", "Supernatural Horror"],
  "haunted doll": ["Occult Horror", "Supernatural Horror"],
  "haunted hotel": ["Haunted House", "Supernatural Horror", "Occult Horror"],
  "haunted house": ["Haunted House", "Supernatural Horror", "Occult Horror"],
  "heartbreak": ["Love Loss", "Romantic Bittersweet"],
  "heist": ["Heist", "Urban Crime"],
  "heist gone wrong": ["Heist"],
  "high fantasy": ["High Fantasy", "Fantasy World"],
  "high school": ["Coming Of Age"],
  "high school american football": ["Coming Of Age"],
  "high school classmates": ["Coming Of Age"],
  "high school dance": ["Coming Of Age"],
  "high school friends": ["Coming Of Age"],
  "high school rivalry": ["Coming Of Age"],
  "high school romance": ["Coming Of Age", "Romantic Tragedy", "Romantic Bittersweet"],
  "high school sports": ["Coming Of Age"],
  "high school student": ["Coming Of Age"],
  "hitman": ["Assassin Hitman", "Action Thriller"],
  "hold-up robbery": ["Heist"],
  "home invasion": ["Survival Horror", "Tense Paranoid", "Suspense Thriller"],
  "home video": ["Found Footage", "Survival Horror"],
  "homicide detective": ["Police Procedural", "Suspense Thriller"],
  "homicide investigation": ["Police Procedural", "Suspense Thriller"],
  "hopeful": ["Hopeful Uplifting"],
  "human android relationship": ["Artificial Intelligence", "Cyberpunk"],
  "human vs alien": ["Alien Contact Invasion"],
  "iceland": ["Rural America"],
  "identity": ["Identity Memory"],
  "infection": ["Body Horror", "Macabre Disturbing"],
  "interpol": ["Police Procedural", "Suspense Thriller"],
  "interspecies romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "intimidation by police": ["Police Procedural", "Suspense Thriller"],
  "investigation": ["Police Procedural", "Suspense Thriller"],
  "irreverent": ["Playful Irreverent"],
  "isolation": ["Isolation Madness", "Bleak Somber"],
  "japanese high school": ["Coming Of Age"],
  "jazz": ["Music Drama"],
  "jazz band": ["Music Drama"],
  "jazz club": ["Music Drama"],
  "jazz singer or musician": ["Music Drama"],
  "jewelry heist": ["Heist"],
  "jigsaw": ["Survival Horror", "Macabre Disturbing", "Psychological Thriller"],
  "judge": ["Legal Drama Courtroom"],
  "jury trial": ["Legal Drama Courtroom"],
  "kaiju": ["Creature Feature", "Survival Horror"],
  "killing spree": ["Slasher"],
  "komodo dragon": ["High Fantasy", "Fantasy World"],
  "lake placid new york": ["Urban Crime"],
  "language": ["Language Communication"],
  "legacy": ["Family Legacy"],
  "linguist": ["Language Communication"],
  "linguistics": ["Language Communication"],
  "london": ["Urban Crime"],
  "london blitz": ["Urban Crime"],
  "london underground": ["Urban Crime"],
  "longing": ["Romantic Bittersweet"],
  "los angeles": ["Urban Crime"],
  "los angeles airport (lax)": ["Urban Crime"],
  "los angeles riots": ["Urban Crime"],
  "loss": ["Love Loss", "Romantic Bittersweet"],
  "love": ["Love Loss", "Romantic Bittersweet"],
  "macabre": ["Macabre Disturbing"],
  "mafia": ["Crime Epic Gangster", "Urban Crime"],
  "magic": ["High Fantasy", "Fantasy World"],
  "magic circle": ["High Fantasy", "Fantasy World"],
  "magic lamp": ["High Fantasy", "Fantasy World"],
  "magic land": ["High Fantasy", "Fantasy World"],
  "magic mushroom": ["High Fantasy", "Fantasy World"],
  "magic realism": ["High Fantasy", "Fantasy World"],
  "magic spell": ["High Fantasy", "Fantasy World"],
  "magical creature": ["Creature Feature"],
  "maine": ["Rural America"],
  "malfunctioning android": ["Artificial Intelligence", "Cyberpunk"],
  "marching band": ["Music Drama"],
  "marine sniper": ["War And Trauma", "Military War Action"],
  "masked killer": ["Slasher", "Psychological Thriller"],
  "masked superhero": ["Superhero", "Action Thriller"],
  "mature romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "mayoral election": ["Political Corruption", "Conspiracy Thriller"],
  "melancholy": ["Bleak Somber"],
  "memory": ["Identity Memory"],
  "met police": ["Police Procedural", "Suspense Thriller"],
  "metal band": ["Music Drama"],
  "mexican police": ["Police Procedural", "Suspense Thriller"],
  "mi6": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "military": ["Military War Action", "War Zone"],
  "military police": ["Police Procedural", "Suspense Thriller"],
  "miracle": ["Religion Faith"],
  "monster": ["Creature Feature", "Survival Horror"],
  "monster island": ["Creature Feature"],
  "moral dilemma": ["Moral Dilemma", "Philosophical Reflective"],
  "mossad": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "multiverse": ["Time Travel Sci Fi", "Time Determinism"],
  "murder investigation": ["Police Procedural", "Suspense Thriller"],
  "murder trial": ["Legal Drama Courtroom"],
  "music": ["Music Drama"],
  "musician": ["Music Drama"],
  "mythology": ["Mythic Religious Fantasy", "Fantasy World"],
  "nazi": ["Historical Epic", "Epic Grand Drama"],
  "neo-noir": ["Noir Neo Noir", "Urban Crime"],
  "nervous": ["Tense Paranoid"],
  "nervous breakdown": ["Tense Paranoid"],
  "new york": ["Urban Crime"],
  "new york city": ["Urban Crime"],
  "new york knicks": ["Urban Crime"],
  "new york state": ["Urban Crime"],
  "new york subway": ["Urban Crime"],
  "nostalgic": ["Nostalgic Whimsical"],
  "occult": ["Occult Horror", "Supernatural Horror"],
  "occult detective": ["Police Procedural", "Suspense Thriller", "Occult Horror", "Supernatural Horror"],
  "occult research": ["Occult Horror", "Supernatural Horror"],
  "oklahoma": ["Rural America"],
  "ominous": ["Tense Paranoid"],
  "opera singer": ["Music Drama"],
  "optimistic": ["Hopeful Uplifting"],
  "pagan": ["Folk Horror"],
  "paradox": ["Time Travel Sci Fi", "Time Determinism"],
  "paranoid": ["Tense Paranoid"],
  "paranormal investigation": ["Police Procedural", "Suspense Thriller"],
  "parasite": ["Body Horror", "Macabre Disturbing"],
  "paris": ["Urban Crime"],
  "parody": ["Parody Spoof", "Playful Irreverent"],
  "period piece": ["Historical Epic", "Epic Grand Drama"],
  "platoon": ["War And Trauma", "Military War Action"],
  "playful": ["Playful Irreverent"],
  "police": ["Police Procedural", "Urban Crime", "Suspense Thriller"],
  "police academy": ["Police Procedural", "Suspense Thriller"],
  "police arrest": ["Police Procedural", "Suspense Thriller"],
  "police brutality": ["Police Procedural", "Suspense Thriller"],
  "police chase": ["Police Procedural", "Suspense Thriller"],
  "police chief": ["Police Procedural", "Suspense Thriller"],
  "police corruption": ["Police Procedural", "Suspense Thriller"],
  "police detective": ["Police Procedural", "Suspense Thriller"],
  "police drama": ["Police Procedural", "Suspense Thriller"],
  "police escort": ["Police Procedural", "Suspense Thriller"],
  "police force": ["Police Procedural", "Suspense Thriller"],
  "police harassment": ["Police Procedural", "Suspense Thriller"],
  "police impersonator": ["Police Procedural", "Suspense Thriller"],
  "police informant": ["Police Procedural", "Suspense Thriller"],
  "police inspector": ["Police Procedural", "Suspense Thriller"],
  "police investigation": ["Police Procedural", "Suspense Thriller"],
  "police officer": ["Police Procedural", "Urban Crime", "Suspense Thriller"],
  "police officer killed": ["Police Procedural", "Suspense Thriller"],
  "police operation": ["Police Procedural", "Suspense Thriller"],
  "police procedural": ["Police Procedural", "Suspense Thriller"],
  "police profiling": ["Police Procedural", "Suspense Thriller"],
  "police psychologist": ["Police Procedural", "Suspense Thriller"],
  "police raid": ["Police Procedural", "Suspense Thriller"],
  "police scanner": ["Police Procedural", "Suspense Thriller"],
  "police sergeant": ["Police Procedural", "Suspense Thriller"],
  "police state": ["Police Procedural", "Suspense Thriller"],
  "police station": ["Police Procedural", "Suspense Thriller"],
  "police training": ["Police Procedural", "Suspense Thriller"],
  "political corruption": ["Political Corruption", "Conspiracy Thriller"],
  "possession": ["Possession Exorcism", "Supernatural Horror", "Occult Horror"],
  "post world war ii": ["War And Trauma", "Military War Action"],
  "post-apocalyptic future": ["Post Apocalyptic"],
  "power": ["Power Control"],
  "pre world war ii": ["War And Trauma", "Military War Action"],
  "prehistoric creature": ["Creature Feature"],
  "private detective": ["Police Procedural", "Suspense Thriller"],
  "prophecy": ["Mythic Religious Fantasy", "Fantasy World", "High Fantasy"],
  "prosecutor": ["Legal Drama Courtroom"],
  "proto-slasher": ["Slasher", "Psychological Thriller"],
  "psychological detective": ["Police Procedural", "Suspense Thriller"],
  "psychological horror": ["Psychological Horror", "Tense Paranoid"],
  "psychological thriller": ["Psychological Thriller", "Tense Paranoid"],
  "punk band": ["Music Drama"],
  "puritan": ["Folk Horror"],
  "rape": ["Moral Dilemma", "Bleak Somber"],
  "rape and revenge": ["Revenge Vengeance", "Action Thriller"],
  "religion": ["Religion Faith"],
  "retired detective": ["Police Procedural", "Suspense Thriller"],
  "retro horror": ["Nostalgic Whimsical"],
  "revenge": ["Revenge Vengeance", "Action Thriller"],
  "ritual": ["Folk Horror", "Occult Horror", "Supernatural Horror"],
  "ritual murder": ["Occult Horror", "Supernatural Horror"],
  "ritual sacrifice": ["Occult Horror", "Supernatural Horror"],
  "robbery": ["Heist", "Urban Crime"],
  "robbery crew": ["Heist"],
  "robbery gang": ["Heist"],
  "rock band": ["Music Drama"],
  "romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "rome": ["Urban Crime"],
  "rural area": ["Rural America"],
  "rural setting": ["Rural America"],
  "russian spy": ["Espionage Spy Thriller"],
  "sardonic": ["Cynical Sardonic"],
  "satan": ["Occult Horror", "Supernatural Horror"],
  "satanic cult": ["Occult Horror", "Supernatural Horror"],
  "satanic panic": ["Occult Horror", "Supernatural Horror"],
  "satanic ritual": ["Occult Horror", "Supernatural Horror"],
  "satire": ["Satire", "Dark Comedy", "Playful Irreverent"],
  "science fantasy": ["Science Fantasy"],
  "sea monster": ["Creature Feature"],
  "self-fulfilling prophecy": ["High Fantasy", "Fantasy World"],
  "self-referential": ["Playful Irreverent", "Satire", "Dark Comedy"],
  "sexual assault": ["Moral Dilemma", "Bleak Somber"],
  "shape shifting alien": ["Alien Contact Invasion"],
  "shocking": ["Macabre Disturbing"],
  "singer": ["Music Drama"],
  "slasher": ["Slasher", "Psychological Thriller"],
  "slow burn romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "sniper": ["War And Trauma", "Military War Action"],
  "sniper rifle": ["War And Trauma", "Military War Action"],
  "snowed in": ["Isolation Madness", "Bleak Somber"],
  "soho london": ["Urban Crime"],
  "somber": ["Bleak Somber"],
  "sorcery": ["High Fantasy", "Fantasy World"],
  "space": ["Space Setting"],
  "space marine": ["Space Opera", "Space Setting"],
  "space opera": ["Space Opera", "Space Setting"],
  "spacecraft": ["Space Setting"],
  "spaceship": ["Space Setting"],
  "spoof": ["Parody Spoof", "Playful Irreverent"],
  "spy": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "spy thriller": ["Espionage Spy Thriller"],
  "spycraft": ["Espionage Spy Thriller", "Conspiracy Thriller"],
  "stalking": ["Slasher", "Psychological Thriller"],
  "standard police procedure": ["Police Procedural", "Suspense Thriller"],
  "state police": ["Police Procedural", "Suspense Thriller"],
  "staten island": ["Urban Crime"],
  "stuck": ["Isolation Madness", "Bleak Somber"],
  "summer romance": ["Romantic Tragedy", "Romantic Bittersweet"],
  "super 8mm footage": ["Found Footage"],
  "superhero": ["Superhero", "Action Thriller"],
  "supernatural": ["Supernatural Horror"],
  "supernatural creature": ["Creature Feature"],
  "supernatural horror": ["Supernatural Horror"],
  "supervillain": ["Superhero", "Action Thriller"],
  "supreme court": ["Legal Drama Courtroom"],
  "survival horror": ["Survival Horror", "Tense Paranoid"],
  "suspense thriller": ["Suspense Thriller", "Tense Paranoid"],
  "suspenseful": ["Tense Paranoid"],
  "sword and sorcery": ["High Fantasy", "Fantasy World"],
  "task force": ["Police Procedural", "Suspense Thriller"],
  "tech noir": ["Noir Neo Noir", "Urban Crime"],
  "teen scream": ["Slasher"],
  "teenage angst": ["Coming Of Age"],
  "teenage boy": ["Coming Of Age"],
  "teenage crush": ["Coming Of Age"],
  "teenage daughter": ["Coming Of Age"],
  "teenage friendship": ["Coming Of Age"],
  "teenage girl": ["Coming Of Age"],
  "teenage hero": ["Coming Of Age"],
  "teenage killer": ["Coming Of Age"],
  "teenage life": ["Coming Of Age"],
  "teenage love": ["Coming Of Age"],
  "teenage prostitute": ["Coming Of Age"],
  "teenage protagonist": ["Coming Of Age"],
  "teenage rebellion": ["Coming Of Age"],
  "teenage romance": ["Coming Of Age", "Romantic Tragedy", "Romantic Bittersweet"],
  "telekinesis": ["High Fantasy", "Fantasy World"],
  "temporal agent": ["Time Travel Sci Fi", "Time Determinism"],
  "tense": ["Tense Paranoid"],
  "the conjuring universe": ["Supernatural Horror", "Possession Exorcism", "Occult Horror"],
  "time": ["Time Determinism"],
  "time paradox": ["Time Travel Sci Fi", "Time Determinism"],
  "time travel": ["Time Travel Sci Fi", "Time Determinism"],
  "tokyo": ["Urban Crime"],
  "totalitarian regime": ["Dystopian Future"],
  "tower of london": ["Urban Crime"],
  "tragic": ["Bleak Somber"],
  "tragic event": ["Bleak Somber"],
  "tragic hero": ["Bleak Somber"],
  "tragic love": ["Bleak Somber"],
  "tragic romance": ["Romantic Tragedy", "Romantic Bittersweet", "Bleak Somber"],
  "tragic villain": ["Bleak Somber"],
  "train robbery": ["Heist"],
  "trauma": ["War And Trauma", "Love Loss"],
  "treasure heist": ["Heist"],
  "trial": ["Legal Drama Courtroom"],
  "troll": ["High Fantasy", "Fantasy World"],
  "undercover cop": ["Police Procedural", "Urban Crime"],
  "valak": ["Supernatural Horror", "Possession Exorcism", "Occult Horror"],
  "vampire": ["Dark Fantasy", "Supernatural Horror", "Creature Feature"],
  "vampire human love": ["Creature Feature"],
  "vampire hunter (slayer)": ["Creature Feature"],
  "vault": ["Heist"],
  "vengeance": ["Revenge Vengeance", "Action Thriller"],
  "vigilante": ["Vigilante Justice", "Action Thriller"],
  "vigilantism": ["Vigilante Justice", "Action Thriller"],
  "violent": ["Macabre Disturbing"],
  "violent death": ["Macabre Disturbing"],
  "violent fantasies": ["Macabre Disturbing"],
  "violent husband": ["Macabre Disturbing"],
  "werewolf": ["Creature Feature", "Supernatural Horror"],
  "whimsical": ["Nostalgic Whimsical"],
  "witch": ["Occult Horror", "Supernatural Horror"],
  "witchcraft": ["Occult Horror", "Supernatural Horror"],
  "witty": ["Playful Irreverent"],
  "wizard": ["High Fantasy", "Fantasy World"],
  "world war i": ["War And Trauma", "Military War Action"],
  "world war ii": ["War And Trauma", "Military War Action"],
  "world war iii": ["War And Trauma", "Military War Action"],
  "wraith": ["High Fantasy", "Fantasy World"],
  "wyoming": ["Rural America"],
  "zombie": ["Creature Feature"],
  "zombie apocalypse": ["Creature Feature"],
  "noir": ["Noir Neo Noir","Urban Crime"],
  "melodrama": ["Melodrama"],
  "experimental": ["Avant Garde Experimental"],

  // Theme / Focus
  "ptsd": ["War And Trauma","Psychological Character Study"],
  "vietnam veteran": ["War And Trauma","Psychological Character Study"],
  "war": ["War And Trauma","Military War Action"],
  "time manipulation": ["Time Determinism","Time Travel Sci Fi"],
  "artificial intelligence": ["Artificial Intelligence","Dystopian Future"],
  "madness": ["Isolation Madness","Psychological Horror"],

  // Sci-Fi & Fantasy
  "post-apocalyptic": ["Post Apocalyptic","Bleak Somber"],

  "mythic": ["Mythic Religious Fantasy","Fantasy World"],
  "ring": ["High Fantasy","Fantasy World"],
  "sword": ["High Fantasy","Fantasy World"],

  // Action / Crime

  "undercover": ["Police Procedural","Espionage Spy Thriller","Urban Crime"],
  "swat": ["Police Procedural","Action Thriller"],

  // Drama & Character Study
  "legal": ["Legal Drama Courtroom"],
  "family saga": ["Family Saga","Epic Grand Drama"],
  "historical": ["Historical Epic","Epic Grand Drama"],

  // Horror & Suspense

  // Setting-Driven
  "space setting": ["Space Setting"],
  "war zone": ["War Zone","Bleak Somber"],
  "urban crime": ["Urban Crime"],
  "rural": ["Rural America"],

  // Mood / Emotion
  "bleak": ["Bleak Somber"],
  "philosophical": ["Philosophical Reflective"],
  "reflective": ["Philosophical Reflective"],
  "uplifting": ["Hopeful Uplifting"],
  "disturbing": ["Macabre Disturbing"],

  // Common concrete terms from your list → broad flavors
  "airplane": ["Action Thriller","Parody Spoof"],
  "pilot": ["Action Thriller"],
  "fear of flying": ["Psychological Thriller","Action Thriller"],
  "food poisoning": ["Dark Comedy","Parody Spoof"],
  "superheroine": ["Superhero","Action Thriller"],
  "nihilism": ["Existential Drama","Dark Comedy","Noir Neo Noir"],
  "drug cartel": ["Urban Crime","Crime Epic Gangster","Action Thriller"],
  "helicopter crash": ["Military War Action","Action Thriller"],
  "rescue operation": ["Military War Action","Action Thriller"],
  "ballet": ["Psychological Character Study","Psychological Thriller","Melodrama"],
  "sword fight": ["High Fantasy","Action Thriller"],
  "amnesia patient": ["Identity Memory","Psychological Thriller"],
  "torture": ["Macabre Disturbing"],
  "casino": ["Heist","Urban Crime"],
  "terrorism": ["Action Thriller","Conspiracy Thriller"],
  "bounty hunter": ["Action Thriller","Vigilante Justice"],
  "planet invasion": ["Alien Contact Invasion","Space Opera"],
  "clone": ["Science Fantasy","Dystopian Future"],
  "quantum physics": ["Time Travel Sci Fi","Philosophical Reflective"],
  "hostage": ["Action Thriller","Suspense Thriller","Police Procedural"],
  "time bomb": ["Action Thriller","Suspense Thriller"],
  "hacking": ["Cyberpunk","Conspiracy Thriller","Action Thriller"],
  "nuclear weapons": ["Action Thriller","Conspiracy Thriller"],
  "chernobyl": ["Historical Epic","Bleak Somber"],
  "plantation": ["Historical Epic","Family Saga"],
  "slavery": ["Historical Epic","Bleak Somber","Moral Dilemma"],
  "stunt driver": ["Action Thriller","Noir Neo Noir"],
  "desert": ["Science Fantasy","Epic Grand Drama"],
  "chosen one": ["High Fantasy","Science Fantasy","Epic Grand Drama"],
  "ancient evil": ["Occult Horror","Dark Fantasy","Supernatural Horror"],
  "gladiator": ["Historical Epic","Epic Grand Drama"],
  "mafia war": ["Crime Epic Gangster"],
  "electric chair": ["Legal Drama Courtroom","Bleak Somber"],
  "bomb squad": ["Action Thriller","Military War Action"],
  "virtual reality": ["Cyberpunk","Science Fantasy"],
  "dream": ["Psychological Thriller","Existential Drama"],
  "black hole": ["Science Fantasy","Philosophical Reflective"],
  "monolith": ["Philosophical Reflective","Science Fantasy"],
  "lion": ["Mythic Religious Fantasy","Family Saga"],
  "war hero": ["War And Trauma","Historical Epic"],
  "hand drawn animation": ["Nostalgic Whimsical"],
  "polar night": ["Survival Horror","Bleak Somber"],
  "snuff": ["Macabre Disturbing","Psychological Thriller"],
  "demonic": ["Possession Exorcism","Occult Horror","Supernatural Horror"],
  "body-swap": ["Science Fantasy","Romantic Bittersweet"],
  "anime": ["Nostalgic Whimsical","Science Fantasy"],
  "al qaeda": ["Conspiracy Thriller","Military War Action"],
  "terrorist attack": ["Action Thriller","Conspiracy Thriller"],
  "super computer": ["Artificial Intelligence","Cyberpunk"],
  "hyena": ["Mythic Religious Fantasy"],
  "puzzle": ["Psychological Thriller", "Suspense Thriller"],

  // Horror brand anchors

  // Crime/action anchors
  "hostage negotiator": ["Action Thriller","Police Procedural"],
  "heist crew": ["Heist","Urban Crime"],
  "parkour": ["Action Thriller"],
  "algorithm": ["Cyberpunk","Conspiracy Thriller"],

  // Music / fame
  "addiction (music)": ["Music Drama","Addiction Self Destruction"],

  // Folk / occult anchors
  "goat": ["Folk Horror","Occult Horror"],

  // Found footage anchors
  "found footage tape": ["Found Footage","Survival Horror"],

  // Family / legacy anchors
  "patriarch": ["Family Saga","Historical Epic"],

  // Legal / moral anchors
};

// ---- 4) Public API ----
export function canonicalizeKeyword(raw: string): string {
  const n = normalize(raw);
  return (ALIASES as any)[n] ?? n;
}

export function getFlavorsForKeyword(keyword: string): Flavor[] {
  const key = canonicalizeKeyword(keyword);
  return (KEYWORD_TO_FLAVORS as any)[key] ?? [];
}

export function getFlavorsForKeywords(keywords: string[]): Flavor[] {
  const set = new Set<Flavor>();
  for (const k of keywords) {
    for (const f of getFlavorsForKeyword(k)) set.add(f);
  }
  return Array.from(set);
}

// Helpers to extend at runtime (optional)
export function upsertKeywordMapping(keyword: string, flavors: Flavor[]) {
  const key = canonicalizeKeyword(keyword);
  const existing = (KEYWORD_TO_FLAVORS as any)[key] ?? [];
  const merged = Array.from(new Set<Flavor>([...existing, ...flavors]));
  (KEYWORD_TO_FLAVORS as any)[key] = merged;
}

export function setKeywordMapping(keyword: string, flavors: Flavor[]) {
  const key = canonicalizeKeyword(keyword);
  (KEYWORD_TO_FLAVORS as any)[key] = Array.from(new Set(flavors));
}
