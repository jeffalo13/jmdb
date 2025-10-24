// flavorMappings.ts — runtime engine (genres + keywords -> flavors)
// ------------------------------------------------------------

import { KEYWORD_TO_SIGNALS, type Signal } from "../../scripts/keywordIndex.generated";

// ---- Genres (fixed) ----
export type Genre =
  | "action" | "adventure" | "animation" | "comedy" | "crime" | "drama"
  | "family" | "fantasy" | "history" | "horror" | "music" | "mystery"
  | "romance" | "science fiction" | "thriller" | "war" | "western" | "documentary";

// ---- Flavors (subgenres) ----
// (Extensive but still maintainable; expand freely up to ~250)
export type Flavor =
  // Tone / Style
  | "Parody Spoof" | "Anarchic Comedy" | "Dark Comedy" | "Satire" | "Farce"
  | "Noir Neo Noir" | "Mockumentary" | "Giallo" | "Screwball"
  | "Melodrama" | "Psychological Thriller" | "Suspense Thriller" | "Action Thriller"
  | "Erotic Thriller" | "Avant Garde Experimental" | "Buddy Comedy" | "Quirky Comedy"
  // Themes
  | "War And Trauma" | "Addiction Self Destruction" | "Identity Memory"
  | "Time Determinism" | "Language Communication" | "Religion Faith"
  | "Artificial Intelligence" | "Political Corruption" | "Moral Dilemma"
  | "Revenge Vengeance" | "Isolation Madness" | "Power Control"
  | "Family Legacy" | "Love Loss"
  // Sci-Fi & Fantasy
  | "Space Opera" | "Cyberpunk" | "Post Apocalyptic" | "Dystopian Future"
  | "Alien Contact Invasion" | "Time Travel Sci Fi" | "Science Fantasy"
  | "High Fantasy" | "Dark Fantasy" | "Mythic Religious Fantasy" | "Superhero"
  | "Steampunk" | "Fantasy Epic" | "Supernatural Fantasy" | "Sci-Fi Epic"
  // Action / Crime
  | "Espionage Spy Thriller" | "Crime Epic Gangster" | "Heist"
  | "Assassin Hitman" | "Military War Action" | "Police Procedural"
  | "Vigilante Justice" | "Conspiracy Thriller" | "Gun Fu" | "One-Man Army"
  | "Car Action" | "Disaster Action" | "Samurai" | "Wuxia" | "Sword & Sandal"
  | "True Crime" | "Drug Crime" | "Caper" | "Cop Drama" | "Sword & Sorcery"
  | "Legal Thriller" | "Political Thriller"
  // Drama & Character
  | "Biographical Drama" | "Legal Drama Courtroom" | "Coming Of Age"
  | "Romantic Tragedy" | "Music Drama" | "Psychological Character Study"
  | "Family Saga" | "Historical Epic" | "Prison Drama" | "Political Drama"
  | "Medical Drama" | "Workplace Drama" | "Financial Drama" | "Docudrama"
  // Horror
  | "Supernatural Horror" | "Possession Exorcism" | "Slasher"
  | "Folk Horror" | "Body Horror" | "Haunted House" | "Found Footage"
  | "Creature Feature" | "Occult Horror" | "Survival Horror" | "Psychological Horror"
  | "Vampire Horror" | "Werewolf Horror" | "Witch Horror" | "Zombie Horror" | "Teen Horror"
  // Mystery
  | "Whodunnit" | "Cozy Mystery" | "Hardboiled Detective" | "Serial Killer"
  // Setting-Driven
  | "Space Setting" | "Fantasy World" | "War Zone" | "Urban Crime"
  | "Ancient World" | "Rural America" | "Futuristic City"
  | "Sea Adventure" | "Jungle Adventure" | "Desert Adventure" | "Mountain Adventure" | "Quest Adventure" | "Road Trip"
  // Mood
  | "Bleak Somber" | "Philosophical Reflective" | "Tense Paranoid"
  | "Hopeful Uplifting" | "Nostalgic Whimsical" | "Macabre Disturbing"
  | "Romantic Bittersweet" | "Playful Irreverent" | "Cynical Sardonic"
  // Animation / Anime
  | "Adult Animation" | "Hand-Drawn Animation" | "Computer Animation" | "Stop Motion"
  | "Isekai" | "Mecha" | "Seinen" | "Shonen" | "Shojo" | "Slice Of Life"
  // Documentary
  | "Crime Documentary" | "Music Documentary" | "Nature Documentary"
  | "History Documentary" | "Political Documentary" | "Science Documentary"
  | "Sports Documentary" | "Travel Documentary" | "Faith Documentary"
  // Western & War
  | "Classical Western" | "Contemporary Western" | "Spaghetti Western" | "Western Epic"
  // Romance & Musical
  | "Romantic Comedy" | "Feel-Good Romance" | "Steamy Romance" | "Teen Romance"
  | "Classic Musical" | "Jukebox Musical" | "Rock Musical"
  // Comedy
  | "Raunchy Comedy" | "Stoner Comedy" | "Sketch Comedy" | "Stand-Up"

// ---- Public API ----
export function getFlavorsForGenresAndKeywords(
  genresIn: string[] = [],
  keywordsIn: string[] = []
): Flavor[] {
  const genres = normalizeGenres(genresIn);
  const kwNorm = new Set(keywordsIn.map(canonKeyword));

  // roll up all signals from all provided keywords
  const signals = new Set<Signal>();
  for (const k of kwNorm) {
    const sigs = KEYWORD_TO_SIGNALS[k];
    if (sigs) for (const s of sigs) signals.add(s);
  }

  const ctx: Ctx = {
    genres,
    keywords: kwNorm,
    signals,
    hasGenre: (g) => genres.has(g as Genre),
    hasAnyGenre: (gs) => gs.some((g) => genres.has(g as Genre)),
    hasKeyword: (k) => kwNorm.has(canonKeyword(k)),
    hasSignal: (s) => signals.has(s),
    match: (re) => Array.from(kwNorm).some((k) => re.test(k)),
  };

  // Evaluate all rules; aggregate scores; never short-circuit
  const scores = new Map<Flavor, number>();
  const add = (f: Flavor, s: number) => scores.set(f, (scores.get(f) ?? 0) + s);

  for (const r of RULES) {
    if (!rulePasses(ctx, r)) continue;
    const base = r.score ?? 10;
    const bonus = r.bonus ? safeBonus(r.bonus, ctx) : 0;
    for (const f of r.flavors) add(f, base + bonus);
  }

  applyGuardrails(ctx, scores);

  return Array.from(scores.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .map(([f]) => f);
}

// ---- Normalization ----
const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/[’']/g, "'").replace(/[\u2013\u2014]/g, "-").replace(/\s+/g, " ");

const GENRE_ALIASES: Record<string, Genre> = {
  "sci fi": "science fiction",
  "sci-fi": "science fiction",
  "science-fiction": "science fiction",
  "historical": "history",
};

const KEYWORD_ALIASES: Record<string, string> = {
  "ai": "artificial intelligence",
  "a.i.": "artificial intelligence",
  "neo noir": "neo-noir",
  "hand drawn animation": "hand-drawn animation",
  "one man army": "one-man army",
  "gun-fu": "gun fu",
  "serial-killer": "serial killer",
  "body-swap": "body swap",
  "vr": "virtual reality",
};

function canonKeyword(raw: string): string {
  const n = normalize(raw);
  return KEYWORD_ALIASES[n] ?? n;
}

function normalizeGenres(input: string[]): Set<Genre> {
  const out = new Set<Genre>();
  for (const raw of input) {
    const n = normalize(raw);
    const g = (GENRE_ALIASES[n] ?? n) as Genre;
    if (ALL_GENRES.has(g)) out.add(g);
  }
  return out;
}

const ALL_GENRES = new Set<Genre>([
  "action","adventure","animation","comedy","crime","drama","family",
  "fantasy","history","horror","music","mystery","romance",
  "science fiction","thriller","war","western","documentary"
]);

// ---- Rule Engine ----
type Ctx = {
  genres: Set<Genre>;
  keywords: Set<string>;
  signals: Set<Signal>;
  hasGenre: (g: Genre | string) => boolean;
  hasAnyGenre: (g: (Genre | string)[]) => boolean;
  hasKeyword: (k: string) => boolean;
  hasSignal: (s: Signal) => boolean;
  match: (re: RegExp) => boolean;
};

type Rule = {
  flavors: Flavor[];
  score?: number;
  anyGenres?: Genre[];
  allGenres?: Genre[];
  anySignals?: Signal[];
  allSignals?: Signal[];
  anyKeywords?: string[];  // rarely needed now; kept for special cases
  allKeywords?: string[];
  keywordRegex?: RegExp;
  excludeIfGenres?: Genre[];
  excludeIfSignals?: Signal[];
  excludeIfKeywords?: string[];
  bonus?: (ctx: Ctx) => number;
};

function rulePasses(ctx: Ctx, r: Rule): boolean {
  if (r.excludeIfGenres && r.excludeIfGenres.some((g) => ctx.hasGenre(g))) return false;
  if (r.excludeIfSignals && r.excludeIfSignals.some((s) => ctx.hasSignal(s))) return false;
  if (r.excludeIfKeywords && r.excludeIfKeywords.some((k) => ctx.hasKeyword(k))) return false;
  if (r.anyGenres && !r.anyGenres.some((g) => ctx.hasGenre(g))) return false;
  if (r.allGenres && !r.allGenres.every((g) => ctx.hasGenre(g))) return false;
  if (r.anySignals && !r.anySignals.some((s) => ctx.hasSignal(s))) return false;
  if (r.allSignals && !r.allSignals.every((s) => ctx.hasSignal(s))) return false;
  if (r.anyKeywords && !r.anyKeywords.some((k) => ctx.hasKeyword(k))) return false;
  if (r.allKeywords && !r.allKeywords.every((k) => ctx.hasKeyword(k))) return false;
  if (r.keywordRegex && !ctx.match(r.keywordRegex)) return false;
  return true;
}

function safeBonus(fn: (ctx: Ctx) => number, ctx: Ctx) {
  try { return fn(ctx) | 0; } catch { return 0; }
}

// ---- Guardrails ----
function applyGuardrails(ctx: Ctx, scores: Map<Flavor, number>) {
  const isFamily = ctx.hasGenre("family");
  const isAnimation = ctx.hasGenre("animation");

  if (isFamily || isAnimation) {
    const hasExplicitHorror =
      ["vampire","werewolf","zombie","haunted house","ghost","possession","exorcism",
       "witch","witchcraft","demon","monster","slasher","serial killer","found footage",
       "occult","satanic","curse"].some((s) => ctx.hasSignal(s));

    if (!hasExplicitHorror) {
      const HORROR_FLAVORS: Flavor[] = [
        "Supernatural Horror","Possession Exorcism","Slasher","Folk Horror","Body Horror",
        "Haunted House","Found Footage","Creature Feature","Occult Horror",
        "Survival Horror","Psychological Horror","Vampire Horror","Werewolf Horror",
        "Witch Horror","Zombie Horror","Teen Horror","Macabre Disturbing"
      ];
      for (const f of HORROR_FLAVORS) scores.delete(f);
    }
  }

  // Documentary bias: small auto-boost when doc signals present
  if (ctx.hasGenre("documentary")) {
    const docSignals = ["docuseries","interview","archival footage","investigation","narration","true crime","biography"];
    if (docSignals.some((s) => ctx.hasSignal(s))) {
      const DOC_FLAVORS: Flavor[] = [
        "Crime Documentary","Music Documentary","Nature Documentary","History Documentary",
        "Political Documentary","Science Documentary","Sports Documentary","Travel Documentary","Faith Documentary"
      ];
      for (const f of DOC_FLAVORS) scores.set(f, (scores.get(f) ?? 0) + 3);
    }
  }
}

// ---- Rule table (genre × signal -> flavors) ----
// Expand as needed; these already cover a wide range.

const RULES: Rule[] = [
  // ACTION
  { flavors: ["Gun Fu","Action Thriller"], anyGenres: ["action","thriller"], anySignals: ["gun fu"], score: 14 },
  { flavors: ["One-Man Army","Action Thriller"], anyGenres: ["action"], anySignals: ["one-man army"], score: 12 },
  { flavors: ["Car Action","Action Thriller"], anyGenres: ["action"], anySignals: ["car chase","stunt driver"], score: 11 },
  { flavors: ["Assassin Hitman","Noir Neo Noir"], anyGenres: ["action","crime","thriller"], anySignals: ["hitman","assassin"], score: 11 },
  { flavors: ["Heist","Urban Crime"], anyGenres: ["action","crime"], anySignals: ["heist","robbery"], score: 12 },
  { flavors: ["Espionage Spy Thriller","Conspiracy Thriller"], anyGenres: ["action","thriller"], anySignals: ["spy","espionage","cia","mi6","undercover"], score: 12 },
  { flavors: ["Police Procedural"], anyGenres: ["crime","action","thriller"], anySignals: ["police","homicide","forensics","interrogation"], score: 10 },
  { flavors: ["Vigilante Justice","Action Thriller"], anyGenres: ["action","crime","thriller"], anySignals: ["vigilante"], score: 10 },
  { flavors: ["Crime Epic Gangster","Urban Crime"], anyGenres: ["crime","drama"], anySignals: ["mafia","gangster","yakuza","triad","cartel"], score: 12 },
  { flavors: ["Military War Action","War Zone"], anyGenres: ["action","war"], anySignals: ["hostage"], score: 10 },

  // ADVENTURE
  { flavors: ["Quest Adventure","Fantasy World"], anyGenres: ["adventure"], anySignals: ["quest","artifact","chosen one","prophecy"], score: 10 },
  { flavors: ["Sea Adventure"], anyGenres: ["adventure"], anySignals: ["sea voyage","pirate","mutiny"], score: 10 },
  { flavors: ["Jungle Adventure"], anyGenres: ["adventure"], anySignals: ["jungle","expedition","lost city"], score: 10 },
  { flavors: ["Desert Adventure"], anyGenres: ["adventure"], anySignals: ["desert"], score: 9 },
  { flavors: ["Mountain Adventure"], anyGenres: ["adventure"], anySignals: ["mountain"], score: 9 },
  { flavors: ["Road Trip"], anyGenres: ["adventure","comedy","drama"], anySignals: ["road trip","globe-trotting"], score: 9 },

  // ANIMATION / ANIME
  { flavors: ["Adult Animation"], anyGenres: ["animation","comedy"], anyKeywords: ["adult animation"], score: 9, excludeIfGenres: ["family"] },
  { flavors: ["Hand-Drawn Animation"], anyGenres: ["animation"], anyKeywords: ["hand-drawn animation"], score: 8 },
  { flavors: ["Computer Animation"], anyGenres: ["animation"], anyKeywords: ["cgi","computer animation"], score: 8 },
  { flavors: ["Stop Motion"], anyGenres: ["animation"], anyKeywords: ["stop motion"], score: 8 },
  { flavors: ["Isekai","Fantasy World"], anyGenres: ["animation","fantasy"], anySignals: ["chosen one","prophecy"], anyKeywords: ["isekai"], score: 10 },
  { flavors: ["Mecha","Science Fantasy"], anyGenres: ["animation","science fiction"], anySignals: ["mecha"], score: 10 },

  // COMEDY
  { flavors: ["Parody Spoof","Playful Irreverent"], anyGenres: ["comedy"], anySignals: ["parody","spoof"], score: 11 },
  { flavors: ["Anarchic Comedy","Quirky Comedy"], anyGenres: ["comedy"], anySignals: ["quirky","high-concept"], score: 9 },
  { flavors: ["Dark Comedy","Cynical Sardonic"], anyGenres: ["comedy","drama","crime"], anyKeywords: ["dark comedy"], score: 10 },
  { flavors: ["Satire"], anyGenres: ["comedy"], anySignals: ["satire"], score: 9 },
  { flavors: ["Farce"], anyGenres: ["comedy"], anySignals: ["farce"], score: 9 },
  { flavors: ["Buddy Comedy"], anyGenres: ["comedy","action"], anySignals: ["buddy comedy","buddy cop"], score: 9 },
  { flavors: ["Mockumentary"], anyGenres: ["comedy"], anySignals: ["mockumentary"], score: 9 },
  { flavors: ["Raunchy Comedy"], anyGenres: ["comedy"], anySignals: ["raunchy"], score: 8 },
  { flavors: ["Stoner Comedy"], anyGenres: ["comedy"], anySignals: ["stoner"], score: 8 },
  { flavors: ["Screwball"], anyGenres: ["comedy","romance"], anySignals: ["screwball"], score: 8 },
  { flavors: ["Sketch Comedy"], anyGenres: ["comedy"], anySignals: ["sketch"], score: 7 },
  { flavors: ["Stand-Up"], anyGenres: ["comedy"], anySignals: ["stand-up"], score: 7 },

  // CRIME
  { flavors: ["True Crime","Crime Documentary"], anyGenres: ["crime","documentary"], anySignals: ["true crime"], score: 11 },
  { flavors: ["Drug Crime","Urban Crime"], anyGenres: ["crime","drama"], anySignals: ["cartel"], score: 10 },
  { flavors: ["Caper","Heist"], anyGenres: ["crime","comedy","action"], anySignals: ["heist"], score: 9 },
  { flavors: ["Cop Drama","Police Procedural"], anyGenres: ["crime","drama"], anySignals: ["police"], score: 8 },
  { flavors: ["Hardboiled Detective","Noir Neo Noir"], anyGenres: ["crime","mystery"], anySignals: ["private eye","gumshoe","hard-boiled"], score: 10 },

  // DOCUMENTARY
  { flavors: ["Crime Documentary"], anyGenres: ["documentary"], anySignals: ["true crime","investigation"], score: 10 },
  { flavors: ["Music Documentary"], anyGenres: ["documentary","music"], anySignals: ["concert","tour","studio session","composer"], score: 9 },
  { flavors: ["History Documentary"], anyGenres: ["documentary","history"], anySignals: ["oral history","archival footage","interview"], score: 9 },
  { flavors: ["Political Documentary"], anyGenres: ["documentary"], anySignals: ["political scandal"], score: 9 },
  { flavors: ["Science Documentary"], anyGenres: ["documentary"], anySignals: ["artificial intelligence","virtual reality","black hole","wormhole"], score: 8 },
  { flavors: ["Travel Documentary"], anyGenres: ["documentary"], anySignals: ["globe-trotting"], score: 8 },

  // DRAMA
  { flavors: ["Biographical Drama","Psychological Character Study"], anyGenres: ["drama"], anySignals: ["biopic","based on true story"], score: 10 },
  { flavors: ["Legal Drama Courtroom"], anyGenres: ["drama"], anySignals: ["courtroom"], score: 10 },
  { flavors: ["Medical Drama"], anyGenres: ["drama"], anyKeywords: ["hospital","surgeon","diagnosis","emergency room"], score: 9 },
  { flavors: ["Prison Drama"], anyGenres: ["drama","crime"], anySignals: ["prison"], score: 9 },
  { flavors: ["Financial Drama"], anyGenres: ["drama"], anySignals: ["financial crisis"], score: 9 },
  { flavors: ["Political Drama","Political Corruption"], anyGenres: ["drama","history"], anySignals: ["political scandal"], score: 9 },
  { flavors: ["Workplace Drama"], anyGenres: ["drama"], anySignals: ["workplace"], score: 8 },
  { flavors: ["Family Saga"], anyGenres: ["drama"], anyKeywords: ["patriarch","matriarch","multi-generational","dynasty"], score: 10 },
  { flavors: ["Coming Of Age"], anyGenres: ["drama"], anySignals: ["coming-of-age"], score: 9 },
  { flavors: ["Romantic Tragedy","Love Loss"], anyGenres: ["drama","romance"], anySignals: ["grief"], score: 10 },

  // FANTASY
  { flavors: ["High Fantasy","Fantasy World","Fantasy Epic"], anyGenres: ["fantasy"], anySignals: ["wizard","dragon","elf","dwarf","orc","prophecy","chosen one","sword","magic","spell"], score: 12 },
  { flavors: ["Dark Fantasy"], anyGenres: ["fantasy","horror"], anySignals: ["demon","curse","occult"], score: 10 },
  { flavors: ["Sword & Sorcery"], anyGenres: ["fantasy","action"], anySignals: ["sword & sorcery","barbarian"], score: 10 },
  { flavors: ["Supernatural Fantasy"], anyGenres: ["fantasy"], anySignals: ["fae","faerie"], score: 9 },
  { flavors: ["Mythic Religious Fantasy"], anyGenres: ["fantasy","history"], anySignals: ["mythology","pantheon"], score: 9 },
  { flavors: ["Samurai"], anyGenres: ["action","drama"], anySignals: ["samurai"], score: 11 },
  { flavors: ["Wuxia"], anyGenres: ["action","fantasy"], anySignals: ["wuxia"], score: 11 },
  { flavors: ["Sword & Sandal","Historical Epic"], anyGenres: ["action","history"], anySignals: ["sword & sandal"], score: 11 },

  // HISTORY
  { flavors: ["Historical Epic"], anyGenres: ["history","drama"], anyKeywords: ["empire","revolution","chronicle"], score: 10 },
  { flavors: ["Ancient World"], anyGenres: ["history"], anySignals: ["ancient world"], score: 9 },

  // HORROR
  { flavors: ["Slasher","Serial Killer"], anyGenres: ["horror","thriller"], anySignals: ["slasher","serial killer","final girl"], score: 12 },
  { flavors: ["Supernatural Horror","Haunted House"], anyGenres: ["horror"], anySignals: ["haunted house","ghost","possession","exorcism"], score: 12 },
  { flavors: ["Occult Horror","Witch Horror"], anyGenres: ["horror"], anySignals: ["occult","witch","witchcraft","satanic","curse"], score: 11 },
  { flavors: ["Body Horror","Macabre Disturbing"], anyGenres: ["horror"], anySignals: ["body horror","mutation"], score: 11 },
  { flavors: ["Creature Feature"], anyGenres: ["horror","science fiction"], anySignals: ["monster","kaiju"], score: 10 },
  { flavors: ["Found Footage","Survival Horror"], anyGenres: ["horror"], anySignals: ["found footage"], score: 10 },
  { flavors: ["Psychological Horror","Isolation Madness"], anyGenres: ["horror","drama"], anySignals: ["gaslighting","stalker"], score: 10 },
  { flavors: ["Vampire Horror"], anyGenres: ["horror"], anySignals: ["vampire"], score: 10 },
  { flavors: ["Werewolf Horror"], anyGenres: ["horror"], anySignals: ["werewolf"], score: 10 },
  { flavors: ["Zombie Horror"], anyGenres: ["horror"], anySignals: ["zombie"], score: 10 },
  { flavors: ["Teen Horror"], anyGenres: ["horror"], anyKeywords: ["high school"], score: 8 },

  // MYSTERY
  { flavors: ["Whodunnit","Suspense Thriller"], anyGenres: ["mystery","thriller"], anySignals: ["whodunnit","closed circle","country manor"], score: 10 },
  { flavors: ["Cozy Mystery"], anyGenres: ["mystery","comedy"], anySignals: ["cozy mystery","amateur sleuth"], score: 9 },
  { flavors: ["Hardboiled Detective","Noir Neo Noir"], anyGenres: ["mystery","crime"], anySignals: ["private eye","gumshoe","hard-boiled"], score: 10 },

  // ROMANCE / MUSICAL
  { flavors: ["Romantic Comedy"], anyGenres: ["romance","comedy"], anySignals: ["rom-com","meet-cute","enemies to lovers","fake dating","friends to lovers"], score: 10 },
  { flavors: ["Feel-Good Romance"], anyGenres: ["romance"], anySignals: ["holiday romance"], score: 8 },
  { flavors: ["Steamy Romance"], anyGenres: ["romance"], anySignals: ["steamy"], score: 8 },
  { flavors: ["Teen Romance"], anyGenres: ["romance"], anySignals: ["teen romance"], score: 8 },
  { flavors: ["Classic Musical"], anyGenres: ["music","romance","comedy"], anySignals: ["musical"], score: 9 },
  { flavors: ["Jukebox Musical"], anyGenres: ["music"], anySignals: ["jukebox musical"], score: 8 },
  { flavors: ["Music Drama"], anyGenres: ["music","drama"], anySignals: ["concert","tour","studio session","audition","composer"], score: 9 },

  // SCI-FI
  { flavors: ["Cyberpunk","Futuristic City"], anyGenres: ["science fiction"], anySignals: ["cyberpunk"], score: 12 },
  { flavors: ["Dystopian Future","Political Corruption"], anyGenres: ["science fiction","thriller"], anySignals: ["dystopia"], score: 11 },
  { flavors: ["Post Apocalyptic","Bleak Somber"], anyGenres: ["science fiction"], anySignals: ["post-apocalyptic"], score: 11 },
  { flavors: ["Alien Contact Invasion"], anyGenres: ["science fiction"], anySignals: ["space opera","spaceship","alien invasion" as Signal], anyKeywords: ["alien invasion","first contact","mothership"], score: 11 },
  { flavors: ["Time Travel Sci Fi","Time Determinism"], anyGenres: ["science fiction"], anySignals: ["time travel","time loop"], score: 11 },
  { flavors: ["Space Opera","Space Setting","Sci-Fi Epic"], anyGenres: ["science fiction","adventure"], anySignals: ["space opera","spaceship","hyperspace"], score: 12 },
  { flavors: ["Science Fantasy"], anyGenres: ["science fiction","fantasy"], anySignals: ["magic","mythology"], score: 9 },
  { flavors: ["Artificial Intelligence"], anyGenres: ["science fiction"], anySignals: ["artificial intelligence","robot","android","cyborg","virtual reality"], score: 10 },
  { flavors: ["Steampunk"], anyGenres: ["science fiction"], anySignals: ["steampunk"], score: 9 },
  { flavors: ["Creature Feature","Kaiju" as unknown as Flavor], anyGenres: ["science fiction"], anySignals: ["kaiju"], score: 10 },

  // THRILLER
  { flavors: ["Psychological Thriller","Tense Paranoid"], anyGenres: ["thriller","drama"], anySignals: ["amnesia","gaslighting","identity","stalker"], score: 11 },
  { flavors: ["Suspense Thriller"], anyGenres: ["thriller"], anySignals: ["ticking clock","siege","hostage","bomb","ransom","kidnapping"], score: 11 },
  { flavors: ["Conspiracy Thriller"], anyGenres: ["thriller"], anySignals: ["conspiracy","whistleblower","cover-up"], score: 11 },
  { flavors: ["Erotic Thriller"], anyGenres: ["thriller","romance"], anySignals: ["erotic"], score: 9 },
  { flavors: ["Serial Killer"], anyGenres: ["thriller","crime"], anySignals: ["serial killer","forensics","interrogation"], score: 10 },
  { flavors: ["Legal Thriller"], anyGenres: ["thriller","drama"], anyKeywords: ["appeal","death row","jury tampering"], score: 9 },
  { flavors: ["Political Thriller"], anyGenres: ["thriller","drama"], anySignals: ["political scandal"], score: 9 },

  // WAR
  { flavors: ["Military War Action","War Zone"], anyGenres: ["war","action"], anySignals: ["hostage"], score: 11 },
  { flavors: ["War And Trauma","Bleak Somber"], anyGenres: ["war","drama"], anySignals: ["ptsd"], score: 11 },
  { flavors: ["Historical Epic"], anyGenres: ["war","history"], anyKeywords: ["campaign","armistice","occupation"], score: 10 },

  // WESTERN
  { flavors: ["Classical Western"], anyGenres: ["western"], anyKeywords: ["frontier","sheriff","outlaw","posse","duel"], score: 11 },
  { flavors: ["Spaghetti Western"], anyGenres: ["western"], anyKeywords: ["spaghetti western","bounty hunter","gunslinger"], score: 10 },
  { flavors: ["Contemporary Western"], anyGenres: ["western","crime","drama"], anyKeywords: ["neo-western","modern ranch","borderland"], score: 9 },
  { flavors: ["Western Epic"], anyGenres: ["western","history"], anyKeywords: ["railroad","migration","homestead"], score: 9 },

  // MOODS / CROSS-CUTTING
  { flavors: ["Addiction Self Destruction","Psychological Character Study"], anyGenres: ["drama","music","crime"], anySignals: ["addiction"], score: 9 },
  { flavors: ["Identity Memory"], anyGenres: ["thriller","drama","science fiction"], anySignals: ["identity","amnesia"], score: 9 },
  { flavors: ["Religion Faith"], anyGenres: ["drama","history","documentary","horror"], anyKeywords: ["faith","religion","pilgrimage","church"], score: 8 },
  { flavors: ["Moral Dilemma","Philosophical Reflective"], anyGenres: ["drama","thriller"], anyKeywords: ["moral dilemma","ethics"], score: 8 },
  { flavors: ["Revenge Vengeance","Action Thriller"], anyGenres: ["action","thriller","drama"], anyKeywords: ["revenge","vengeance","payback"], score: 9 },
  { flavors: ["Isolation Madness"], anyGenres: ["drama","horror","thriller"], anyKeywords: ["isolation","madness","cabin fever"], score: 8 },
  { flavors: ["Power Control"], anyGenres: ["drama","thriller"], anyKeywords: ["power struggle","manipulation","control"], score: 8 },
  { flavors: ["Family Legacy"], anyGenres: ["drama","crime","history"], anyKeywords: ["legacy","inheritance","lineage","succession"], score: 8 },
  { flavors: ["Love Loss","Romantic Bittersweet"], anyGenres: ["drama","romance"], anySignals: ["grief"], score: 8 },
  { flavors: ["Bleak Somber"], anyGenres: ["drama","war","horror","science fiction"], anyKeywords: ["bleak","somber","grim","nihilistic"], score: 7 },
  { flavors: ["Hopeful Uplifting"], anyGenres: ["drama","family","romance"], anyKeywords: ["hopeful","uplifting","inspirational"], score: 7 },
  { flavors: ["Nostalgic Whimsical"], anyGenres: ["family","animation","comedy","drama"], anyKeywords: ["nostalgic","whimsical","storybook"], score: 7 },
  { flavors: ["Playful Irreverent"], anyGenres: ["comedy","family"], anyKeywords: ["playful","irreverent","wacky"], score: 7 },
  { flavors: ["Cynical Sardonic"], anyGenres: ["comedy","drama"], anyKeywords: ["cynical","sardonic"], score: 7 },
];

// Optional export for inspection
export const ALL_FLAVORS: readonly Flavor[] = Array.from(
  new Set(RULES.flatMap(r => r.flavors))
).sort() as Flavor[];
