// buildFlavorMap.ts
// ------------------------------------------------------------
// Build step: reads ./keywordIndex.json and emits ./keywordIndex.generated.ts
// - Normalizes/aliases the ~70k keyword names
// - Assigns them to "signals" via exact + regex rules
// - Outputs a compact, treeshakeable TS module for runtime use
//
// Usage:
//   npm i -D ts-node
//   npx ts-node buildFlavorMap.ts
//
// Input shape (keywordIndex.json):
//   [{ "name": "vampires" }, { "name": "time travel" }, ...]
//
// Output:
//   ./keywordIndex.generated.ts
//     export const KEYWORD_TO_SIGNALS: Record<string, Signal[]> = { ... };
//     export const ALL_SIGNALS: readonly Signal[] = [...];
//     export type Signal = typeof ALL_SIGNALS[number];
import * as fs from "fs";
import * as path from "path";
// ---------- Helpers ----------
const normalize = (s) => s.trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ");
const ALIASES = {
    "ai": "artificial intelligence",
    "a.i.": "artificial intelligence",
    "neo noir": "neo-noir",
    "sci fi": "science fiction",
    "sci-fi": "science fiction",
    "hand drawn": "hand-drawn",
    "one man army": "one-man army",
    "gun-fu": "gun fu",
    "serial-killer": "serial killer",
    "body-swap": "body swap",
    "vr": "virtual reality",
    "docu series": "docuseries",
};
function canonKeyword(raw) {
    const n = normalize(raw);
    return ALIASES[n] ?? n;
}
// A light stoplist to ignore extremely low-signal tokens.
// (Keep this conservative; expand later if needed.)
const STOPWORDS = new Set([
    "",
    "a", "an", "the",
    "new york", "los angeles", "london", "paris", "tokyo", "berlin", "rome",
    "washington", "california", "texas", "florida", "ohio", "toronto",
    "monday", "tuesday", "wednesday", "thursday", "friday",
    "saturday", "sunday",
    "red", "blue", "green", "yellow", "black", "white",
    "man", "woman", "boy", "girl", "people", "person",
]);
// Utility: wraps pattern string into a word-boundary regex unless you set raw=true
const re = (pat, flags = "i", raw = false) => new RegExp(raw ? pat : `(?:^|\\b)${pat}(?:\\b|$)`, flags);
// Define signals by families (add freely — total can be ~150–200).
// Keep names noun-ish/verb-noun-ish and singular if possible.
const SIGNALS_BY_FAMILY = {
    horror: [
        "vampire", "werewolf", "zombie", "haunted house", "ghost", "possession", "exorcism",
        "witch", "witchcraft", "demon", "monster", "slasher", "serial killer", "found footage",
        "occult", "satanic", "curse", "poltergeist", "final girl", "body horror", "folk horror",
    ],
    scifi: [
        "cyberpunk", "time travel", "time loop", "parallel universe", "multiverse",
        "space opera", "spaceship", "robot", "android", "cyborg", "artificial intelligence",
        "clone", "kaiju", "dystopia", "post-apocalyptic", "black hole", "wormhole", "hyperspace",
        "mecha", "steampunk", "virtual reality",
    ],
    crime_action: [
        "heist", "robbery", "mafia", "gangster", "yakuza", "triad", "cartel", "hitman", "assassin",
        "vigilante", "undercover", "cia", "mi6", "spy", "espionage", "hostage", "car chase", "gun fu",
        "police", "homicide", "forensics", "interrogation", "bounty hunter", "stunt driver",
        "one-man army",
    ],
    fantasy: [
        "wizard", "sorcerer", "dragon", "elf", "dwarf", "orc", "prophecy", "chosen one",
        "magic", "spell", "mythology", "pantheon", "sword", "barbarian", "fae", "faerie", "goblin",
        "wuxia", "samurai", "sword & sandal", "sword and sandal", "sword and sorcery", "sword & sorcery",
    ],
    thriller: [
        "conspiracy", "cover-up", "whistleblower", "amnesia", "gaslighting", "identity", "stalker",
        "ticking clock", "siege", "bomb", "ransom", "kidnapping", "erotic", "serial stalking",
    ],
    drama_themes: [
        "biopic", "biography", "based on true story", "courtroom", "trial", "jury",
        "ptsd", "addiction", "alcoholism", "grief", "widow", "workplace", "coming-of-age",
        "financial crisis", "prison", "parole", "warden", "political scandal", "lobbyist",
    ],
    adventure: [
        "treasure map", "lost city", "expedition", "jungle", "desert", "mountain", "pirate", "sea voyage",
        "mutiny", "privateer", "artifact", "road trip", "quest", "globe-trotting", "swashbuckler",
    ],
    documentary: [
        "true crime", "interview", "archival footage", "docuseries", "investigation", "narration",
        "oral history", "biography",
    ],
    romance_comedy: [
        "meet-cute", "enemies to lovers", "fake dating", "friends to lovers", "holiday romance",
        "steamy", "teen romance", "rom-com", "screwball", "parody", "spoof", "mockumentary", "satire",
        "farce", "raunchy", "stoner", "sketch", "stand-up", "buddy comedy", "buddy cop", "quirky",
        "high-concept",
    ],
    music_musical: [
        "musical", "song-and-dance", "jukebox musical", "studio session", "tour", "concert",
        "audition", "composer",
    ],
    mystery_detective: [
        "whodunnit", "closed circle", "country manor", "cozy mystery", "amateur sleuth",
        "private eye", "gumshoe", "hard-boiled",
    ],
    setting_tokens: [
        "space", "spaceship", "sea", "ocean", "jungle", "desert", "mountain", "rural", "urban",
        "ancient world", "futuristic city", "war zone", "fantasy world",
    ],
};
// Flatten for type-safety in the generated file:
const ALL_SIGNALS = Array.from(new Set(Object.values(SIGNALS_BY_FAMILY).flat())).sort();
const P = [
    // Horror
    { signal: "vampire", patterns: [re("vampir(?:e|ic|ism|es)")] },
    { signal: "werewolf", patterns: [re("werewolf|lycan(?:thrope|thropy)")] },
    { signal: "zombie", patterns: [re("zombie|undead|walker")] },
    { signal: "haunted house", patterns: [re("haunted house|haunted hotel|haunted (?:mansion|manor)")] },
    { signal: "ghost", patterns: [re("ghost|poltergeist|specter|spirit")] },
    { signal: "possession", patterns: [re("possession|possessed")] },
    { signal: "exorcism", patterns: [re("exorcis(?:m|t|ts)")] },
    { signal: "witch", patterns: [re("witch(?:es)?\\b")] },
    { signal: "witchcraft", patterns: [re("witchcraft|coven")] },
    { signal: "demon", patterns: [re("demon|demonic|hellspawn|devil worship")] },
    { signal: "monster", patterns: [re("monster|creature|beast|abomination")] },
    { signal: "slasher", patterns: [re("slasher|mask(?:ed)? killer|final girl")] },
    { signal: "serial killer", patterns: [re("serial killer|serial-killer|profil(?:e|ing)")] },
    { signal: "found footage", patterns: [re("found footage|camcorder|handheld tape")] },
    { signal: "occult", patterns: [re("occult|arcana|ritual|summoning")] },
    { signal: "satanic", patterns: [re("satanic|satanism")] },
    { signal: "curse", patterns: [re("curse|cursed")] },
    { signal: "final girl", patterns: [re("final girl")] },
    { signal: "body horror", patterns: [re("body horror|mutation|gore|parasit(?:e|ic)")] },
    { signal: "folk horror", patterns: [re("folk horror|pagan rite|harvest ritual")] },
    // Sci-Fi
    { signal: "cyberpunk", patterns: [re("cyberpunk|neon city|megacorp")] },
    { signal: "time travel", patterns: [re("time travel|temporal (?:loop|paradox)|timeline")] },
    { signal: "time loop", patterns: [re("time loop|groundhog day")] },
    { signal: "parallel universe", patterns: [re("parallel universe|alternate timeline")] },
    { signal: "multiverse", patterns: [re("multiverse")] },
    { signal: "space opera", patterns: [re("space opera|galactic war|hyperspace")] },
    { signal: "spaceship", patterns: [re("spaceship|starship|spacecraft")] },
    { signal: "robot", patterns: [re("robot|automat(?:a|on)")] },
    { signal: "android", patterns: [re("android|replicant")] },
    { signal: "cyborg", patterns: [re("cyborg")] },
    { signal: "artificial intelligence", patterns: [re("artificial intelligence|sentient ai|supercomputer|ai rebellion")] },
    { signal: "clone", patterns: [re("clone|cloning")] },
    { signal: "kaiju", patterns: [re("kaiju|giant monster")] },
    { signal: "dystopia", patterns: [re("dystopia|police state|surveillance state")] },
    { signal: "post-apocalyptic", patterns: [re("post[- ]?apocalyptic|wasteland|nuclear winter")] },
    { signal: "black hole", patterns: [re("black hole")] },
    { signal: "wormhole", patterns: [re("wormhole")] },
    { signal: "hyperspace", patterns: [re("hyperspace")] },
    { signal: "mecha", patterns: [re("mecha|giant robot suit|pilot suit")] },
    { signal: "steampunk", patterns: [re("steampunk|clockwork")] },
    { signal: "virtual reality", patterns: [re("virtual reality|vr|simulated world|metaverse")] },
    // Crime/Action
    { signal: "heist", patterns: [re("heist|vault job|bank job")] },
    { signal: "robbery", patterns: [re("robbery|armed robbery")] },
    { signal: "mafia", patterns: [re("mafia|capo|cosa nostra")] },
    { signal: "gangster", patterns: [re("gangster|gangland")] },
    { signal: "yakuza", patterns: [re("yakuza")] },
    { signal: "triad", patterns: [re("triad")] },
    { signal: "cartel", patterns: [re("cartel")] },
    { signal: "hitman", patterns: [re("hitman|contract killer")] },
    { signal: "assassin", patterns: [re("assassin|assassination")] },
    { signal: "vigilante", patterns: [re("vigilante|vigilantism|takes the law")] },
    { signal: "undercover", patterns: [re("undercover|deep cover")] },
    { signal: "cia", patterns: [re("\\bcia\\b")] },
    { signal: "mi6", patterns: [re("\\bmi6\\b")] },
    { signal: "spy", patterns: [re("spy|spymaster|dead drop|handler")] },
    { signal: "espionage", patterns: [re("espionage")] },
    { signal: "hostage", patterns: [re("hostage|hostage rescue")] },
    { signal: "car chase", patterns: [re("car chase|street race|pursuit")] },
    { signal: "gun fu", patterns: [re("gun fu|gun kata|balletic violence|double pistols")] },
    { signal: "police", patterns: [re("police|precinct|patrol|beat cop")] },
    { signal: "homicide", patterns: [re("homicide unit|major crimes")] },
    { signal: "forensics", patterns: [re("forensics|lab tech")] },
    { signal: "interrogation", patterns: [re("interrogation|interrogation room")] },
    { signal: "bounty hunter", patterns: [re("bounty hunter")] },
    { signal: "stunt driver", patterns: [re("stunt driver|wheelman")] },
    { signal: "one-man army", patterns: [re("one[- ]?man army|single operative|lone wolf")] },
    // Fantasy
    { signal: "wizard", patterns: [re("wizard|warlock|mage|magus")] },
    { signal: "sorcerer", patterns: [re("sorcerer|sorceress")] },
    { signal: "dragon", patterns: [re("dragon|wyrm")] },
    { signal: "elf", patterns: [re("elf|elven")] },
    { signal: "dwarf", patterns: [re("dwarf|dwarven")] },
    { signal: "orc", patterns: [re("orc|orcs")] },
    { signal: "prophecy", patterns: [re("prophecy|prophetic")] },
    { signal: "chosen one", patterns: [re("chosen one")] },
    { signal: "magic", patterns: [re("magic|magical|sorcery|wizardry")] },
    { signal: "spell", patterns: [re("spell|incantation")] },
    { signal: "mythology", patterns: [re("mythology|mythic|pantheon|deity")] },
    { signal: "pantheon", patterns: [re("pantheon")] },
    { signal: "sword", patterns: [re("sword|blade|katana")] },
    { signal: "barbarian", patterns: [re("barbarian")] },
    { signal: "fae", patterns: [re("\\bfae\\b")] },
    { signal: "faerie", patterns: [re("faerie|fairy|fairies")] },
    { signal: "goblin", patterns: [re("goblin|goblins")] },
    { signal: "wuxia", patterns: [re("wuxia|jianghu")] },
    { signal: "samurai", patterns: [re("samurai|ronin|bushido|shogun")] },
    { signal: "sword & sandal", patterns: [re("sword (?:&|and) sandal|gladiator|colosseum|arena combat|legion|centurion")] },
    { signal: "sword & sorcery", patterns: [re("sword (?:&|and) sorcery")] },
    // Thriller
    { signal: "conspiracy", patterns: [re("conspiracy|cover-up|coverup")] },
    { signal: "whistleblower", patterns: [re("whistleblower")] },
    { signal: "amnesia", patterns: [re("amnesia|amnesiac")] },
    { signal: "gaslighting", patterns: [re("gaslighting|gaslight")] },
    { signal: "identity", patterns: [re("identity|double life")] },
    { signal: "stalker", patterns: [re("stalker|stalking")] },
    { signal: "ticking clock", patterns: [re("ticking clock|race against time")] },
    { signal: "siege", patterns: [re("siege|barricade")] },
    { signal: "bomb", patterns: [re("bomb|time bomb|explosive device")] },
    { signal: "ransom", patterns: [re("ransom|ransom note|ransomware")] },
    { signal: "kidnapping", patterns: [re("kidnap|kidnapping|abduction")] },
    { signal: "erotic", patterns: [re("erotic|seduction|fatal attraction")] },
    // Drama / themes
    { signal: "biopic", patterns: [re("biopic|biographical film|biography")] },
    { signal: "based on true story", patterns: [re("based on true story|true story")] },
    { signal: "courtroom", patterns: [re("courtroom|trial|jury|prosecution|defense attorney")] },
    { signal: "ptsd", patterns: [re("\\bptsd\\b|shell shock")] },
    { signal: "addiction", patterns: [re("addiction|alcoholism|self-destruction")] },
    { signal: "grief", patterns: [re("grief|mourning|widow|bereaved")] },
    { signal: "workplace", patterns: [re("workplace|office politics|downsizing|promotion")] },
    { signal: "coming-of-age", patterns: [re("coming[- ]of[- ]age|rite of passage")] },
    { signal: "financial crisis", patterns: [re("financial crisis|crash|short squeeze|wall street")] },
    { signal: "prison", patterns: [re("prison|incarceration|parole|warden")] },
    { signal: "political scandal", patterns: [re("scandal|corruption|lobbyist")] },
    // Adventure
    { signal: "treasure map", patterns: [re("treasure map")] },
    { signal: "lost city", patterns: [re("lost city|el dorado|atlantis")] },
    { signal: "expedition", patterns: [re("expedition|explor(?:e|ation)")] },
    { signal: "jungle", patterns: [re("jungle|rainforest")] },
    { signal: "desert", patterns: [re("desert|oasis|dune|caravan")] },
    { signal: "mountain", patterns: [re("mountain|summit|alpine|avalanche")] },
    { signal: "pirate", patterns: [re("pirate|buccaneer|privateer")] },
    { signal: "sea voyage", patterns: [re("sea voyage|voyage at sea|ocean crossing")] },
    { signal: "mutiny", patterns: [re("mutiny")] },
    { signal: "artifact", patterns: [re("artifact|relic")] },
    { signal: "road trip", patterns: [re("road trip|cross[- ]country")] },
    { signal: "quest", patterns: [re("\\bquest\\b|chosen one|prophecy")] },
    { signal: "globe-trotting", patterns: [re("globe[- ]trott(?:er|ing)")] },
    { signal: "swashbuckler", patterns: [re("swashbuckler|rapier duel")] },
    // Documentary
    { signal: "true crime", patterns: [re("true crime|crime documentary")] },
    { signal: "interview", patterns: [re("interview|sit-down interview|talking heads")] },
    { signal: "archival footage", patterns: [re("archival footage|archive footage")] },
    { signal: "docuseries", patterns: [re("docuseries|docu-series")] },
    { signal: "investigation", patterns: [re("investigation|investigative report")] },
    { signal: "narration", patterns: [re("narration|voice-over|voiceover")] },
    { signal: "oral history", patterns: [re("oral history")] },
    // Romance/Comedy
    { signal: "meet-cute", patterns: [re("meet[- ]cute")] },
    { signal: "enemies to lovers", patterns: [re("enemies to lovers")] },
    { signal: "fake dating", patterns: [re("fake dating|pretend dating")] },
    { signal: "friends to lovers", patterns: [re("friends to lovers")] },
    { signal: "holiday romance", patterns: [re("holiday romance|christmas romance|seasonal romance")] },
    { signal: "steamy", patterns: [re("steamy|spicy")] },
    { signal: "teen romance", patterns: [re("teen romance|high school romance")] },
    { signal: "rom-com", patterns: [re("rom[- ]?com|romantic comedy")] },
    { signal: "screwball", patterns: [re("screwball")] },
    { signal: "parody", patterns: [re("parody|spoof")] },
    { signal: "spoof", patterns: [re("spoof")] },
    { signal: "mockumentary", patterns: [re("mockumentary|fake documentary")] },
    { signal: "satire", patterns: [re("satire|satirical")] },
    { signal: "farce", patterns: [re("farce|bedroom farce|doors slamming")] },
    { signal: "raunchy", patterns: [re("raunchy|gross-out|sex comedy")] },
    { signal: "stoner", patterns: [re("stoner|weed comedy|cannabis")] },
    { signal: "sketch", patterns: [re("sketch comedy|sketches")] },
    { signal: "stand-up", patterns: [re("stand[- ]?up")] },
    { signal: "buddy comedy", patterns: [re("buddy comedy")] },
    { signal: "buddy cop", patterns: [re("buddy cop")] },
    { signal: "quirky", patterns: [re("quirky|offbeat|deadpan")] },
    { signal: "high-concept", patterns: [re("high[- ]concept")] },
    // Music/Musical
    { signal: "musical", patterns: [re("musical|song[- ]and[- ]dance|show tune")] },
    { signal: "jukebox musical", patterns: [re("jukebox musical|catalog songs")] },
    { signal: "studio session", patterns: [re("studio session|recording studio")] },
    { signal: "tour", patterns: [re("tour|world tour")] },
    { signal: "concert", patterns: [re("concert|live performance")] },
    { signal: "audition", patterns: [re("audition")] },
    { signal: "composer", patterns: [re("composer|composition")] },
    // Mystery/Detective
    { signal: "whodunnit", patterns: [re("whodunnit|who dunnit|who done it")] },
    { signal: "closed circle", patterns: [re("closed circle")] },
    { signal: "country manor", patterns: [re("country manor|country house")] },
    { signal: "cozy mystery", patterns: [re("cozy mystery")] },
    { signal: "amateur sleuth", patterns: [re("amateur sleuth|amateur detective")] },
    { signal: "private eye", patterns: [re("private eye|private investigator|pi\\b")] },
    { signal: "gumshoe", patterns: [re("gumshoe")] },
    { signal: "hard-boiled", patterns: [re("hard[- ]boiled")] },
    // Settings (multimap to setting-driven flavors later)
    { signal: "space", patterns: [re("space\\b|outer space"), re("spaceship|starship|spacecraft")] },
    { signal: "sea", patterns: [re("\\bsea\\b|ocean|naval|pirate|privateer")] },
    { signal: "jungle", patterns: [re("jungle|rainforest")] },
    { signal: "desert", patterns: [re("desert|dune|oasis|caravan")] },
    { signal: "mountain", patterns: [re("mountain|alpine|summit|avalanche")] },
    { signal: "rural", patterns: [re("rural|countryside|farm town")] },
    { signal: "urban", patterns: [re("urban|inner city|downtown")] },
    { signal: "ancient world", patterns: [re("ancient world|pharaoh|rome|greece|sparta|pyramids")] },
    { signal: "futuristic city", patterns: [re("futuristic city|arcology|neon city")] },
    { signal: "war zone", patterns: [re("war zone|front line|occupied city")] },
    { signal: "fantasy world", patterns: [re("fantasy world|fae realm|otherworldly kingdom")] },
];
// ---------- Build pipeline ----------
const INPUT = path.resolve(process.cwd(), "./scripts/keywordIndex.json");
console.log(INPUT);
const OUT = path.resolve(process.cwd(), "./scripts/keywordIndex.generated.ts");
console.log(OUT);
if (!fs.existsSync(INPUT)) {
    console.error(`ERROR: Cannot find ${INPUT}. Place your big keyword file there (array of {name}).`);
    process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const names = new Set();
for (const item of raw) {
    const rawName = typeof item === "string" ? item : (item?.name ?? "");
    const k = canonKeyword(rawName);
    if (!k || STOPWORDS.has(k))
        continue;
    names.add(k);
}
// For each canonical keyword, collect the signals matched by pattern rules:
const mapKWtoSignals = new Map();
const add = (kw, sig) => {
    let set = mapKWtoSignals.get(kw);
    if (!set) {
        set = new Set();
        mapKWtoSignals.set(kw, set);
    }
    set.add(sig);
};
// Run the pattern matcher
for (const kw of names) {
    for (const pat of P) {
        if (pat.patterns.some((rx) => rx.test(kw))) {
            add(kw, pat.signal);
        }
        if (pat.alsoExact?.includes(kw)) {
            add(kw, pat.signal);
        }
    }
}
// Emit TS
const allSignalsSorted = ALL_SIGNALS; // already sorted
const entries = Array.from(mapKWtoSignals.entries())
    .map(([k, s]) => [k, Array.from(s).sort()])
    .sort((a, b) => a[0].localeCompare(b[0]));
const file = `/* AUTO-GENERATED by buildFlavorMap.ts — DO NOT EDIT BY HAND */
export const ALL_SIGNALS = ${JSON.stringify(allSignalsSorted)} as const;
export type Signal = typeof ALL_SIGNALS[number];

export const KEYWORD_TO_SIGNALS: Record<string, Signal[]> = {
${entries.map(([k, arr]) => `  ${JSON.stringify(k)}: ${JSON.stringify(arr)} as Signal[],`).join("\n")}
};
`;
fs.writeFileSync(OUT, file, "utf8");
console.log(`Generated ${OUT} with ${entries.length} mapped keywords and ${allSignalsSorted.length} signals.`);
