// scripts/buildFlavorMap.ts  (ESM-friendly; compiled with NodeNext)
// Goal: read ./keywordIndex.json (array of {name} or strings) and emit
//       ./src/data/keywordIndex.generated.ts with an exhaustive KEYWORD_TO_SIGNALS map.
// Also writes coverage + unmatched JSON for auditing.
import * as fs from "fs";
import * as path from "path";
// ---------- Paths ----------
const INPUT = path.resolve(process.cwd(), "./scripts/keywordIndex.json");
const OUT = path.resolve(process.cwd(), "./scripts/keywordIndex.generated.ts");
const REPORT_DIR = path.resolve(process.cwd(), "scripts-dist");
// ---------- Utils ----------
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const normalize = (s) => s
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
const ALIASES = {
    "sci fi": "science fiction",
    "sci-fi": "science fiction",
    "neo noir": "neo-noir",
    "hand drawn": "hand-drawn",
    "one man army": "one-man army",
    "docu series": "docuseries",
    "vr": "virtual reality",
    "ai": "artificial intelligence",
    "a.i.": "artificial intelligence",
};
function canon(raw) {
    const n = normalize(raw);
    return ALIASES[n] ?? n;
}
// expand a seed phrase into common variants (plural, hyphen/space, etc.)
function* expand(seed) {
    const base = canon(seed);
    yield base;
    // hyphen/space toggles
    if (base.includes("-"))
        yield base.replace(/-/g, " ");
    if (base.includes(" "))
        yield base.replace(/ /g, "-");
    // simple plurals (best-effort)
    if (!/\b(of|and|to|the|a|an)\b/.test(base)) {
        if (/\b\w+$/.test(base)) {
            yield base.replace(/\b([a-z]{3,})\b$/i, "$1s");
            yield base.replace(/\b([a-z]{3,})\b$/i, "$1es");
            yield base.replace(/\b([a-z]{3,})y\b$/i, "$1ies");
            yield base.replace(/\b([a-z]{3,})man\b$/i, "$1men");
        }
    }
    // common prefixes/suffix variants
    yield base.replace(/\bon the run\b/g, "on-the-run");
    yield base.replace(/\bsuper max\b/g, "supermax");
}
// fast regex helper – word boundaries
const re = (pat, flags = "i") => new RegExp(`(?:^|\\b)${pat}(?:\\b|$)`, flags);
// Big, genre-spanning seed tables. (We’re adding a lot; you can keep growing these.)
// Each entry auto-expands dozens of variants, so total matches end up in the thousands.
// === ACTION ===
const ACTION_SEEDS = [
    { signal: "bounty hunter", phrases: ["bounty hunter", "bounty", "hunter for hire"], genres: ["action", "thriller", "science fiction", "western"] },
    { signal: "manhunt", phrases: ["manhunt", "fugitive", "on the run", "escaped convict", "prison escape", "super max prison"], genres: ["action", "thriller", "crime", "drama", "science fiction"] },
    { signal: "rescue mission", phrases: ["rescue mission", "hostage rescue", "extraction mission", "exfiltration"], genres: ["action", "thriller"] },
    { signal: "siege", phrases: ["siege", "siege warfare", "compound assault", "breach", "barricade"], genres: ["action", "thriller", "war", "western"] },
    { signal: "infiltration", phrases: ["infiltration", "deep cover", "black ops", "covert op"], genres: ["action", "thriller"] },
    { signal: "mercenary", phrases: ["mercenary", "pmc", "soldier of fortune"], genres: ["action", "thriller", "war"] },
    { signal: "special forces", phrases: ["special forces", "spec ops", "delta force", "navy seals", "rangers"], genres: ["action", "war", "thriller"] },
    { signal: "sniper", phrases: ["sniper", "sharpshooter", "marksman"], genres: ["action", "thriller", "war"] },
    { signal: "hand-to-hand", phrases: ["hand-to-hand", "close quarters", "cqc", "cqb", "fistfight", "brawl"], genres: ["action", "thriller"] },
    { signal: "gunfight", phrases: ["gunfight", "shootout", "firefight", "crossfire", "double tap"], genres: ["action", "thriller", "crime", "western"] },
    { signal: "car chase", phrases: ["car chase", "high-speed pursuit", "vehicle pursuit", "motorcycle chase", "foot chase", "run and gun"], genres: ["action", "thriller"] },
    { signal: "explosives", phrases: ["explosive", "detonator", "c4", "semtex", "improvised explosive", "ied"], genres: ["action", "thriller", "war", "crime"] },
    { signal: "one-man army", phrases: ["one-man army", "lone wolf operative", "unstoppable hero"], genres: ["action", "thriller"] },
    { signal: "revenge", phrases: ["revenge", "vengeance", "payback", "retribution"], genres: ["action", "thriller", "drama"] },
    { signal: "heist", phrases: ["heist", "bank job", "vault", "safecracker", "diamond heist", "art theft", "casino job"], genres: ["crime", "action", "thriller"] },
    { signal: "prison", phrases: ["prison", "penitentiary", "supermax", "warden", "lockdown"], genres: ["crime", "drama", "thriller", "action"] },
    { signal: "martial arts", phrases: ["martial arts", "kung fu", "karate", "taekwondo", "muay thai", "dojo"], genres: ["action"] },
    { signal: "samurai", phrases: ["samurai", "ronin", "bushido", "shogun"], genres: ["action", "drama", "history"] },
    { signal: "ninja", phrases: ["ninja", "shinobi"], genres: ["action"] },
    { signal: "parkour", phrases: ["parkour", "free running"], genres: ["action"] },
    { signal: "stunt driving", phrases: ["stunt driver", "stunt driving", "precision driving"], genres: ["action"] },
];
// === THRILLER ===
const THRILLER_SEEDS = [
    { signal: "conspiracy", phrases: ["conspiracy", "cover-up", "shadowy cabal", "secret organization", "deep state"], genres: ["thriller"] },
    { signal: "political intrigue", phrases: ["political intrigue", "government scandal", "corruption", "coup"], genres: ["thriller", "drama"] },
    { signal: "espionage", phrases: ["spy", "spycraft", "espionage", "cia", "mi6", "kgb", "mossad", "interpol"], genres: ["thriller", "action"] },
    { signal: "hacker/cyber", phrases: ["hacker", "hacking", "cyber attack", "malware", "ransomware", "surveillance state"], genres: ["thriller", "science fiction", "crime"] },
    { signal: "hostage", phrases: ["hostage", "kidnapping", "ransom"], genres: ["thriller", "action", "crime"] },
    { signal: "ticking clock", phrases: ["ticking clock", "bomb", "time bomb", "countdown", "deadline"], genres: ["thriller", "action"] },
    { signal: "stalker", phrases: ["stalker", "obsession", "fixation", "watching you"], genres: ["thriller"] },
    { signal: "serial killer", phrases: ["serial killer", "profiling", "manhunter"], genres: ["thriller", "crime", "horror"] },
    { signal: "amnesia/identity", phrases: ["amnesia", "memory loss", "double life", "false identity"], genres: ["thriller", "drama"] },
    { signal: "erotic", phrases: ["erotic thriller", "seduction", "deadly affair"], genres: ["thriller", "romance"] },
];
// === SCIENCE FICTION ===
const SCIFI_SEEDS = [
    { signal: "dystopia", phrases: ["dystopia", "dystopian future", "oppressive regime", "totalitarian"], genres: ["science fiction"] },
    { signal: "post-apocalyptic", phrases: ["post-apocalyptic", "wasteland", "after the bomb", "nuclear winter"], genres: ["science fiction", "action"] },
    { signal: "space travel", phrases: ["space travel", "astronaut", "intergalactic travel", "hyperspace", "wormhole"], genres: ["science fiction", "adventure"] },
    { signal: "space opera", phrases: ["space opera", "galactic empire", "space war", "interstellar conflict"], genres: ["science fiction", "action", "adventure"] },
    { signal: "alien contact", phrases: ["alien contact", "alien race", "first contact", "extraterrestrial"], genres: ["science fiction"] },
    { signal: "alien invasion", phrases: ["alien invasion", "planet invasion", "invasion from space"], genres: ["science fiction", "action"] },
    { signal: "cyberpunk", phrases: ["cyberpunk", "megacorporation", "augmented reality", "neon city", "future noir"], genres: ["science fiction", "thriller"] },
    { signal: "time travel", phrases: ["time travel", "time loop", "temporal paradox"], genres: ["science fiction"] },
    { signal: "artificial intelligence", phrases: ["artificial intelligence", "super computer", "ai rebellion", "android", "cyborg", "robot uprising"], genres: ["science fiction", "thriller"] },
    { signal: "multiverse", phrases: ["multiverse", "parallel universe", "alternate timeline"], genres: ["science fiction"] },
    { signal: "x-ray vision", phrases: ["x-ray vision"], genres: ["science fiction", "action"] },
];
// === FANTASY ===
const FANTASY_SEEDS = [
    { signal: "high fantasy", phrases: ["high fantasy", "sword and sorcery", "sword & sorcery", "barbarian", "wizard", "dragon", "elf", "orc", "prophecy", "chosen one"], genres: ["fantasy", "adventure"] },
    { signal: "dark fantasy", phrases: ["dark fantasy", "ancient evil", "demonic realm"], genres: ["fantasy", "horror"] },
    { signal: "urban fantasy", phrases: ["urban fantasy", "hidden magical world"], genres: ["fantasy"] },
    { signal: "mythic", phrases: ["mythology", "pantheon", "gods", "demigod"], genres: ["fantasy", "history"] },
    { signal: "wuxia", phrases: ["wuxia", "jianghu", "martial world"], genres: ["fantasy", "action"] },
    { signal: "sword & sandal", phrases: ["sword & sandal", "sword and sandal", "gladiator"], genres: ["fantasy", "history", "action"] },
];
// === HORROR ===
const HORROR_SEEDS = [
    { signal: "supernatural", phrases: ["ghost", "haunting", "poltergeist", "haunted house", "haunted hotel"], genres: ["horror"] },
    { signal: "possession", phrases: ["possession", "exorcism", "demonic"], genres: ["horror"] },
    { signal: "occult", phrases: ["occult", "witch", "witchcraft", "coven", "satanic"], genres: ["horror"] },
    { signal: "slasher", phrases: ["slasher", "masked killer", "final girl"], genres: ["horror", "thriller"] },
    { signal: "body horror", phrases: ["body horror", "mutation", "parasite", "grotesque"], genres: ["horror"] },
    { signal: "zombie", phrases: ["zombie", "undead", "walker"], genres: ["horror"] },
    { signal: "vampire", phrases: ["vampire", "bloodsucker"], genres: ["horror", "fantasy"] },
    { signal: "werewolf", phrases: ["werewolf", "lycanthrope"], genres: ["horror", "fantasy"] },
    { signal: "folk horror", phrases: ["folk horror", "pagan ritual", "harvest rite"], genres: ["horror"] },
    { signal: "found footage", phrases: ["found footage", "tape found", "camcorder"], genres: ["horror"] },
];
// === CRIME / MYSTERY ===
const CRIME_MYSTERY_SEEDS = [
    { signal: "film noir", phrases: ["film noir", "noir detective", "femme fatale"], genres: ["crime", "drama", "thriller"] },
    { signal: "neo-noir", phrases: ["neo-noir", "modern noir", "future noir"], genres: ["crime", "thriller", "science fiction"] },
    { signal: "police procedural", phrases: ["police procedural", "forensics", "homicide unit"], genres: ["crime", "drama"] },
    { signal: "heist", phrases: ["heist", "caper", "robbery"], genres: ["crime", "action", "thriller"] },
    { signal: "gangster", phrases: ["gangster", "mafia", "yakuza", "triad", "cartel"], genres: ["crime", "drama", "action"] },
    { signal: "detective mystery", phrases: ["whodunnit", "whodunit", "detective", "private eye", "gumshoe", "closed circle"], genres: ["mystery", "crime"] },
    { signal: "true crime", phrases: ["true crime", "crime documentary", "based on true crime"], genres: ["documentary", "drama", "crime"] },
    { signal: "prison", phrases: ["prison", "escape", "warden", "parole"], genres: ["crime", "drama", "thriller"] },
];
// === ROMANCE / DRAMA ===
const ROMANCE_DRAMA_SEEDS = [
    { signal: "rom-com", phrases: ["romantic comedy", "rom com", "meet-cute", "opposites attract", "enemies to lovers", "fake dating"], genres: ["romance", "comedy"] },
    { signal: "romantic drama", phrases: ["romantic drama", "tragic romance", "star-crossed lovers"], genres: ["romance", "drama"] },
    { signal: "coming of age", phrases: ["coming of age", "growing up", "rite of passage"], genres: ["drama"] },
    { signal: "biopic", phrases: ["biopic", "biographical", "based on true story"], genres: ["drama", "music", "documentary"] },
    { signal: "legal", phrases: ["courtroom", "trial", "appeal", "jury", "prosecutor", "defense attorney"], genres: ["drama", "thriller"] },
    { signal: "medical", phrases: ["medical drama", "hospital", "surgeon", "er"], genres: ["drama"] },
    { signal: "workplace", phrases: ["workplace drama", "office politics"], genres: ["drama", "comedy"] },
    { signal: "family saga", phrases: ["family saga", "generational feud", "patriarch", "matriarch"], genres: ["drama"] },
    { signal: "grief", phrases: ["grief", "loss", "bereavement"], genres: ["drama"] },
    { signal: "addiction", phrases: ["addiction", "alcoholism", "self-destruction"], genres: ["drama"] },
];
// === COMEDY ===
const COMEDY_SEEDS = [
    { signal: "parody/spoof", phrases: ["parody", "spoof"], genres: ["comedy"] },
    { signal: "satire", phrases: ["satire", "satirical"], genres: ["comedy"] },
    { signal: "slapstick", phrases: ["slapstick", "pratfall", "physical comedy"], genres: ["comedy"] },
    { signal: "screwball", phrases: ["screwball", "madcap", "fast-talking"], genres: ["comedy"] },
    { signal: "farce", phrases: ["farce", "mistaken identity", "door slamming"], genres: ["comedy"] },
    { signal: "black comedy", phrases: ["black comedy", "dark comedy"], genres: ["comedy"] },
    { signal: "stoner", phrases: ["stoner", "weed comedy", "pothead"], genres: ["comedy"] },
    { signal: "mockumentary", phrases: ["mockumentary", "fake documentary"], genres: ["comedy"] },
    { signal: "teen comedy", phrases: ["teen comedy", "high school hijinks"], genres: ["comedy"] },
];
// === DOCUMENTARY ===
const DOC_SEEDS = [
    { signal: "docuseries", phrases: ["docuseries"], genres: ["documentary"] },
    { signal: "nature doc", phrases: ["nature documentary", "wildlife", "animals"], genres: ["documentary"] },
    { signal: "music doc", phrases: ["music documentary", "concert film", "backstage"], genres: ["documentary", "music"] },
    { signal: "sports doc", phrases: ["sports documentary", "athlete profile"], genres: ["documentary", "sport"] },
    { signal: "history doc", phrases: ["history documentary", "archive footage", "oral history"], genres: ["documentary", "history"] },
    { signal: "true crime doc", phrases: ["true crime documentary", "crime doc"], genres: ["documentary"] },
    { signal: "political doc", phrases: ["political documentary", "policy documentary"], genres: ["documentary"] },
];
// === HISTORY / WAR / WESTERN / ADVENTURE / SPORTS / MUSIC / FAMILY / ANIMATION ===
const OTHER_SEEDS = [
    // History / War
    { signal: "historical epic", phrases: ["historical epic", "period epic", "lavish period"], genres: ["history", "drama"] },
    { signal: "costume drama", phrases: ["costume drama", "period drama", "regency", "victorian"], genres: ["history", "drama"] },
    { signal: "war epic", phrases: ["war epic", "massive battle"], genres: ["war", "history"] },
    { signal: "anti-war", phrases: ["anti-war", "war is hell"], genres: ["war", "drama"] },
    { signal: "ww1", phrases: ["world war i", "wwi", "trench warfare"], genres: ["war", "history"] },
    { signal: "ww2", phrases: ["world war ii", "wwii", "nazi", "third reich"], genres: ["war", "history", "drama"] },
    // Western
    { signal: "classical western", phrases: ["old west", "gunslinger", "sheriff", "outlaw"], genres: ["western"] },
    { signal: "spaghetti western", phrases: ["spaghetti western", "italian western"], genres: ["western"] },
    { signal: "revisionist western", phrases: ["revisionist western", "anti-western"], genres: ["western"] },
    { signal: "neo-western", phrases: ["neo-western", "modern western"], genres: ["western"] },
    // Adventure
    { signal: "treasure/quest", phrases: ["treasure hunt", "quest", "artifact", "lost city", "expedition", "globe-trotting", "swashbuckler", "sea adventure", "jungle adventure", "desert adventure", "mountain adventure", "road trip"], genres: ["adventure"] },
    // Sports
    { signal: "baseball", phrases: ["baseball"], genres: ["sport"] },
    { signal: "basketball", phrases: ["basketball"], genres: ["sport"] },
    { signal: "football", phrases: ["football"], genres: ["sport"] },
    { signal: "boxing", phrases: ["boxing"], genres: ["sport"] },
    { signal: "soccer", phrases: ["soccer", "football (soccer)"], genres: ["sport"] },
    { signal: "motorsport", phrases: ["motorsport", "formula one", "nascar", "rally"], genres: ["sport"] },
    { signal: "extreme sport", phrases: ["extreme sport", "x games"], genres: ["sport"] },
    { signal: "water sport", phrases: ["surfing", "sailing", "rowing", "swimming"], genres: ["sport"] },
    // Music
    { signal: "jukebox musical", phrases: ["jukebox musical"], genres: ["music"] },
    { signal: "rock musical", phrases: ["rock musical"], genres: ["music"] },
    { signal: "pop musical", phrases: ["pop musical"], genres: ["music"] },
    { signal: "classic musical", phrases: ["classic musical", "song-and-dance"], genres: ["music"] },
    // Family / Animation
    { signal: "family friendly", phrases: ["family film", "family friendly", "kids movie"], genres: ["family", "animation", "comedy"] },
    { signal: "animation style", phrases: ["hand-drawn", "stop motion", "computer animation"], genres: ["animation"] },
];
// Combine
const SEED_BANK = [
    ...ACTION_SEEDS,
    ...THRILLER_SEEDS,
    ...SCIFI_SEEDS,
    ...FANTASY_SEEDS,
    ...HORROR_SEEDS,
    ...CRIME_MYSTERY_SEEDS,
    ...ROMANCE_DRAMA_SEEDS,
    ...COMEDY_SEEDS,
    ...DOC_SEEDS,
    ...OTHER_SEEDS,
];
const COMPILED = [];
for (const row of SEED_BANK) {
    const tests = [];
    if (row.phrases) {
        for (const phrase of row.phrases) {
            for (const v of expand(phrase)) {
                const clean = canon(v);
                if (clean)
                    tests.push(re(clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
            }
        }
    }
    if (row.regexes)
        tests.push(...row.regexes);
    // de-dup tests
    const seen = new Set();
    const uniq = tests.filter((rx) => {
        const key = rx.source + "||" + rx.flags;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    if (uniq.length)
        COMPILED.push({ signal: row.signal, tests: uniq });
}
// ---------- Load & normalize keywords ----------
ensureDir(path.dirname(OUT));
ensureDir(REPORT_DIR);
if (!fs.existsSync(INPUT)) {
    const placeholder = `// placeholder; overwritten by buildFlavorMap
export const ALL_SIGNALS: readonly string[] = [];
export type Signal = string;
export const KEYWORD_TO_SIGNALS: Record<string, readonly string[]> = {};
`;
    fs.writeFileSync(OUT, placeholder, "utf8");
    console.log(`(no keywordIndex.json) wrote placeholder to ${OUT}`);
    process.exit(0);
}
const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const KW = new Set();
for (const item of raw) {
    const name = typeof item === "string" ? item : item?.name;
    if (!name)
        continue;
    const k = canon(name);
    if (!k)
        continue;
    KW.add(k);
}
// ---------- Match pass ----------
const mapKWtoSignals = new Map();
const add = (kw, sig) => {
    let s = mapKWtoSignals.get(kw);
    if (!s) {
        s = new Set();
        mapKWtoSignals.set(kw, s);
    }
    s.add(sig);
};
let matched = 0;
for (const kw of KW) {
    let hit = false;
    for (const { signal, tests } of COMPILED) {
        if (tests.some((rx) => rx.test(kw))) {
            add(kw, signal);
            hit = true;
        }
    }
    if (hit)
        matched++;
}
// ---------- Heuristic fallbacks (catch many remaining) ----------
// If a keyword contains generic action/thriller/horror/etc tokens, tag it.
const GENRE_HEURISTICS = [
    // Action-ish verbs
    { tokens: re("chase|pursuit|escape|ambush|raid|assault|siege|rescue|hunt|brawl|duel"), signal: "action-beat" },
    { tokens: re("gun|rifle|pistol|sniper|bomb|grenade|explosive|mine|rocket|missile"), signal: "firepower" },
    { tokens: re("martial|karate|kung fu|taekwondo|dojo|ninja|samurai|sword|blade"), signal: "martial-weaponry" },
    // Thriller
    { tokens: re("conspiracy|cover[- ]?up|whistleblower|stalker|obsession|amnesia|identity|ransom|hostage"), signal: "thriller-beat" },
    // Sci-Fi
    { tokens: re("space|planet|galaxy|interstellar|hyperspace|wormhole|android|robot|cyborg|ai|clone|dystopi|apocalypse|post[- ]?apocalyptic|multiverse|x-ray"), signal: "sci-fi-beat" },
    // Fantasy
    { tokens: re("magic|wizard|sorcer|spell|dragon|elf|orc|prophecy|chosen one|fairy|fae|demon|cursed"), signal: "fantasy-beat" },
    // Horror
    { tokens: re("haunt|ghost|demon|posses|exorcis|witch|slasher|zombie|vampire|werewolf|body horror|gore|curse"), signal: "horror-beat" },
    // Crime/Mystery
    { tokens: re("detective|whodun|whodit|private eye|forensic|police|gang|mafia|yakuza|triad|cartel|heist|robbery"), signal: "crime-beat" },
    // Romance/Drama
    { tokens: re("romance|love|affair|heartbreak|tragic love|star[- ]?crossed|coming[- ]?of[- ]?age|biopic|courtroom|trial|grief|addiction"), signal: "drama-beat" },
    // Comedy
    { tokens: re("comedy|parody|spoof|satire|farce|screwball|mockumentary|slapstick"), signal: "comedy-beat" },
    // Documentary
    { tokens: re("documentary|docuseries|archive footage|interview|true crime"), signal: "doc-beat" },
    // War/History/Western/Adventure/Sport
    { tokens: re("world war|trench|battlefield|campaign|front line|tank|battalion"), signal: "war-beat" },
    { tokens: re("ancient|medieval|regency|victorian|renaissance|historical"), signal: "history-beat" },
    { tokens: re("cowboy|sheriff|gunslinger|outlaw|frontier|ranch"), signal: "western-beat" },
    { tokens: re("treasure|expedition|voyage|sail|jungle|desert|mountain|quest|swashbuck"), signal: "adventure-beat" },
    { tokens: re("baseball|basketball|football|soccer|boxing|motorsport|skate|surf|swim|olympic"), signal: "sport-beat" },
];
for (const kw of KW) {
    if (mapKWtoSignals.has(kw))
        continue;
    for (const h of GENRE_HEURISTICS) {
        if (h.tokens.test(kw)) {
            add(kw, h.signal);
        }
    }
}
// ---------- Emit TS file ----------
const ALL_SIGNALS = Array.from(new Set(Array.from(mapKWtoSignals.values()).flatMap((s) => Array.from(s)))).sort();
const entries = Array.from(mapKWtoSignals.entries())
    .map(([k, s]) => [k, Array.from(s).sort()])
    .sort((a, b) => a[0].localeCompare(b[0]));
const outFile = `/* AUTO-GENERATED — DO NOT EDIT BY HAND
   * Built from keywordIndex.json
   * Mapped keywords: ${entries.length} | distinct signals: ${ALL_SIGNALS.length}
   */
export const ALL_SIGNALS = ${JSON.stringify(ALL_SIGNALS)} as const;
export type Signal = typeof ALL_SIGNALS[number];

export const KEYWORD_TO_SIGNALS: Record<string, Signal[]> = {
${entries.map(([k, arr]) => `  ${JSON.stringify(k)}: ${JSON.stringify(arr)} as Signal[],`).join("\n")}
};
`;
fs.writeFileSync(OUT, outFile, "utf8");
// ---------- Reports ----------
const total = KW.size;
const withSignals = entries.length;
const without = total - withSignals;
ensureDir(REPORT_DIR);
// sample some unmatched for inspection
const unmatched = [];
for (const kw of KW)
    if (!mapKWtoSignals.has(kw))
        unmatched.push(kw);
const sample = unmatched.slice(0, 5000);
fs.writeFileSync(path.join(REPORT_DIR, "coverage-report.json"), JSON.stringify({
    totalKeywords: total,
    mappedKeywords: withSignals,
    unmatchedKeywords: without,
    distinctSignals: ALL_SIGNALS.length
}, null, 2));
fs.writeFileSync(path.join(REPORT_DIR, "unmatched-sample.json"), JSON.stringify(sample, null, 2));
console.log(`✅ Generated ${OUT}`);
console.log(`   Coverage: ${withSignals}/${total} mapped (${((withSignals / total) * 100) | 0}% approx)`);
console.log(`   Reports: ${path.join(REPORT_DIR, "coverage-report.json")}`);
