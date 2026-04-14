# Life Console Quote Selection Logic

## 1. Purpose

This document defines how the app should choose one quote from the production-ready quote library for a given AI card.

It is designed to work with:

- `/data/life-console-quotes-v1-approved.json`

## 2. Inputs

The selector should receive:

- `cardType`
  - `strategy` or `review`
- `scene`
  - `start_day`
  - `protect_line`
  - `ship_today`
  - `drift_recovery`
  - `honest_review`
  - `reset_tomorrow`
- `languagePreference`
  - `zh`
  - `en`
  - `balanced`
  - `original_language_first`
- `strictnessTarget`
  - integer `1-5`
- `tonePreferences`
  - optional preferred tone tags
- `recentQuoteIds`
  - recently used quote ids to avoid repetition
- `allowFallbackSceneExpansion`
  - whether to widen matching when exact scene fit is poor

## 3. Hard Rules

1. Only select quotes from the `approved` production file.
2. Only select quotes for `strategy` and `review` cards.
3. Do not reuse the same quote within the recent suppression window.
4. Prefer scene fit over language fit.
5. Prefer exact tone match over author diversity.

## 4. Recommended Selection Order

### Step 1: Start with production-ready pool

Input source:

- `life-console-quotes-v1-approved.json`

### Step 2: Filter by card type compatibility

- strategy cards should prefer:
  - `start_day`
  - `protect_line`
  - `ship_today`
- review cards should prefer:
  - `honest_review`
  - `reset_tomorrow`
  - `drift_recovery`

### Step 3: Score by scene match

Scene match should receive the highest weight.

Suggested scoring:

- exact scene match: `+100`
- related scene fallback: `+50`
- no scene match: reject unless fallback pool is empty

### Step 4: Score by tone match

Suggested scoring:

- exact tone match per tone: `+20`
- compatible tone family: `+10`

### Step 5: Score by strictness distance

Suggested scoring:

- `strictnessDelta = abs(quote.strictness_level - strictnessTarget)`
- add `max(0, 15 - strictnessDelta * 5)`

### Step 6: Score by language preference

Suggested scoring:

- exact preferred language: `+10`
- balanced mode: `+5` to both languages
- original_language_first: `+0`, because both are acceptable

### Step 7: Penalize repetition

- quote used in recent window: reject
- same author used last turn: `-10`

### Step 8: Sort and sample

- sort descending by score
- take top `3`
- choose randomly among top `3` with weighted probability

This keeps output stable but not robotic.

## 5. Fallback Logic

If no quote survives the exact scene filter:

### For `strategy`

Fallback order:

1. `start_day`
2. `protect_line`
3. `ship_today`

### For `review`

Fallback order:

1. `honest_review`
2. `reset_tomorrow`
3. `drift_recovery`

If still empty:

- ignore tone preference
- keep repetition filter if possible
- select the highest-ranked quote for the card type family

## 6. Suggested Runtime Inputs by Mode

### Strategy card

- `cardType = "strategy"`
- scene from current moment:
  - morning open -> `start_day`
  - protecting discipline -> `protect_line`
  - project emphasis -> `ship_today`
- strictness target:
  - hard-day startup -> `4`
  - calmer day -> `2-3`

### Review card

- `cardType = "review"`
- scene from review outcome:
  - honest miss review -> `honest_review`
  - tomorrow reset -> `reset_tomorrow`
  - drift recovery -> `drift_recovery`
- strictness target:
  - weak failure -> `4-5`
  - stable close -> `2-3`

## 7. Output Shape

The selector should return:

```ts
type SelectedQuote = {
  quoteId: string;
  textSurface: string;
  textFull: string;
  language: "zh" | "en";
  author: string;
  sourceWork: string;
  sourceRef: string;
  sceneTags: string[];
  toneTags: string[];
  strictnessLevel: number;
};
```

## 8. Recommendation

For V1:

- use deterministic scoring
- add only light randomness at the very end
- do not over-personalize too early

The main job of the selector is not novelty. It is reliable scene fit.
