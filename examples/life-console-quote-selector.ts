export type QuoteLanguage = "zh" | "en";
export type QuoteCardType = "strategy" | "review";

export type QuoteScene =
  | "start_day"
  | "protect_line"
  | "ship_today"
  | "drift_recovery"
  | "honest_review"
  | "reset_tomorrow";

export type QuoteTone =
  | "austere"
  | "clear"
  | "steady"
  | "severe"
  | "encouraging"
  | "disciplining"
  | "resetting";

export type QuoteStatus = "approved" | "review_needed";

export type QuoteLibraryItem = {
  quote_id: string;
  text_surface: string;
  text_full: string;
  language: QuoteLanguage;
  author: string;
  source_work: string;
  source_ref: string;
  source_type: string;
  scene_tags: QuoteScene[];
  tone_tags: QuoteTone[];
  strictness_level: number;
  status: QuoteStatus;
};

export type QuoteLibrary = {
  library_id: string;
  version: string;
  quotes: QuoteLibraryItem[];
};

export type LanguagePreference = "zh" | "en" | "balanced" | "original_language_first";

export type QuoteSelectionInput = {
  cardType: QuoteCardType;
  scene: QuoteScene;
  languagePreference?: LanguagePreference;
  strictnessTarget?: number;
  tonePreferences?: QuoteTone[];
  recentQuoteIds?: string[];
  recentAuthors?: string[];
  allowFallbackSceneExpansion?: boolean;
};

export type SelectedQuote = {
  quoteId: string;
  textSurface: string;
  textFull: string;
  language: QuoteLanguage;
  author: string;
  sourceWork: string;
  sourceRef: string;
  sceneTags: QuoteScene[];
  toneTags: QuoteTone[];
  strictnessLevel: number;
};

type ScoredQuote = {
  quote: QuoteLibraryItem;
  score: number;
};

const STRATEGY_SCENE_FALLBACKS: QuoteScene[] = ["start_day", "protect_line", "ship_today"];
const REVIEW_SCENE_FALLBACKS: QuoteScene[] = ["honest_review", "reset_tomorrow", "drift_recovery"];

export function selectQuote(library: QuoteLibrary, input: QuoteSelectionInput): SelectedQuote | null {
  const recentQuoteIds = new Set(input.recentQuoteIds ?? []);
  const recentAuthors = new Set(input.recentAuthors ?? []);
  const strictnessTarget = clamp(input.strictnessTarget ?? 3, 1, 5);
  const tonePreferences = input.tonePreferences ?? [];

  let candidates = library.quotes.filter((quote) => quote.status === "approved");

  if (!candidates.length) return null;

  candidates = candidates.filter((quote) => !recentQuoteIds.has(quote.quote_id));
  if (!candidates.length) return null;

  let scored = scoreQuotes(candidates, input, strictnessTarget, tonePreferences, recentAuthors);
  scored = scored.filter((item) => item.score > 0);

  if (!scored.length && input.allowFallbackSceneExpansion !== false) {
    const fallbackScenes = getFallbackScenes(input.cardType);
    scored = scoreQuotes(
      candidates.filter((quote) => quote.scene_tags.some((scene) => fallbackScenes.includes(scene))),
      {
        ...input,
        scene: fallbackScenes[0],
      },
      strictnessTarget,
      tonePreferences,
      recentAuthors
    ).filter((item) => item.score > 0);
  }

  if (!scored.length) return null;

  scored.sort((a, b) => b.score - a.score);
  const topPool = scored.slice(0, 3);
  const chosen = weightedPick(topPool);

  return {
    quoteId: chosen.quote.quote_id,
    textSurface: chosen.quote.text_surface,
    textFull: chosen.quote.text_full,
    language: chosen.quote.language,
    author: chosen.quote.author,
    sourceWork: chosen.quote.source_work,
    sourceRef: chosen.quote.source_ref,
    sceneTags: chosen.quote.scene_tags,
    toneTags: chosen.quote.tone_tags,
    strictnessLevel: chosen.quote.strictness_level,
  };
}

function scoreQuotes(
  quotes: QuoteLibraryItem[],
  input: QuoteSelectionInput,
  strictnessTarget: number,
  tonePreferences: QuoteTone[],
  recentAuthors: Set<string>
): ScoredQuote[] {
  return quotes.map((quote) => {
    let score = 0;

    score += scoreSceneMatch(quote, input.scene);
    score += scoreToneMatch(quote, tonePreferences);
    score += scoreStrictness(quote, strictnessTarget);
    score += scoreLanguage(quote, input.languagePreference ?? "original_language_first");

    if (recentAuthors.has(quote.author)) {
      score -= 10;
    }

    return { quote, score };
  });
}

function scoreSceneMatch(quote: QuoteLibraryItem, scene: QuoteScene): number {
  if (quote.scene_tags.includes(scene)) return 100;
  return 0;
}

function scoreToneMatch(quote: QuoteLibraryItem, tonePreferences: QuoteTone[]): number {
  if (!tonePreferences.length) return 0;

  let score = 0;
  for (const tone of tonePreferences) {
    if (quote.tone_tags.includes(tone)) {
      score += 20;
    }
  }
  return score;
}

function scoreStrictness(quote: QuoteLibraryItem, strictnessTarget: number): number {
  const delta = Math.abs(quote.strictness_level - strictnessTarget);
  return Math.max(0, 15 - delta * 5);
}

function scoreLanguage(quote: QuoteLibraryItem, preference: LanguagePreference): number {
  switch (preference) {
    case "zh":
      return quote.language === "zh" ? 10 : 0;
    case "en":
      return quote.language === "en" ? 10 : 0;
    case "balanced":
      return 5;
    case "original_language_first":
    default:
      return 0;
  }
}

function getFallbackScenes(cardType: QuoteCardType): QuoteScene[] {
  return cardType === "strategy" ? STRATEGY_SCENE_FALLBACKS : REVIEW_SCENE_FALLBACKS;
}

function weightedPick(items: ScoredQuote[]): ScoredQuote {
  const total = items.reduce((sum, item) => sum + Math.max(item.score, 1), 0);
  let cursor = Math.random() * total;

  for (const item of items) {
    cursor -= Math.max(item.score, 1);
    if (cursor <= 0) return item;
  }

  return items[0];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Example usage:
//
// import quoteLibrary from "../data/life-console-quotes-v1-approved.json";
//
// const quote = selectQuote(quoteLibrary, {
//   cardType: "strategy",
//   scene: "start_day",
//   languagePreference: "balanced",
//   strictnessTarget: 4,
//   tonePreferences: ["austere", "clear"],
//   recentQuoteIds: ["en_ma_001"],
//   recentAuthors: ["Marcus Aurelius"],
// });
