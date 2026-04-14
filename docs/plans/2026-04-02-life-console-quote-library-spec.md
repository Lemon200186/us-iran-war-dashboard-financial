# Life Console Quote Library Spec

## 1. Goal

This document defines the first version of the quote library used by the AI Coach.

The library is intended to:

- support emotional steadiness without becoming sentimental
- reinforce clarity and control
- provide scene-matched language for strategy cards and review cards
- avoid generic AI-sounding motivation

## 2. Product Rules

### Quotes should appear only in:

- strategy cards
- end-of-day review cards

### Quotes should not appear by default in:

- avoidance interruption cards
- Take Over Today cards

### Selection rules

1. scene fit comes first
2. source quality comes second
3. author prestige comes third

### Source-quality rules

- prefer widely recognized authors
- prefer texts with relatively clear sources
- avoid internet-only motivational fragments with unstable attribution
- prefer exact wording over product-friendly rewriting

## 3. V1 Scope

Recommended first version:

- total size target: `30-50` quotes
- recommendation: start with `36` quotes

Suggested scene split:

- `start_day`: 12
- `honest_review`: 10
- `drift_recovery`: 8
- `reset_tomorrow`: 6

Language mix:

- `50% Chinese`
- `50% English`

Tone mix:

- `70-80%` austere / stoic / restrained
- `20-30%` stronger or warmer, but still disciplined

## 4. Author Strategy

### Core cluster

Use these authors as the main spine:

- Marcus Aurelius
- Epictetus
- Seneca
- Confucius / Analects
- Mencius
- Laozi / Dao De Jing

### Secondary cluster

Use sparingly to add texture:

- Ralph Waldo Emerson
- The Great Learning / Da Xue
- The Doctrine of the Mean / Zhong Yong

### Distribution rule

- core authors may have `3-5` quotes each
- secondary authors should usually have `1-2` quotes each

## 5. Metadata Schema

Each quote should store:

| Field | Type | Notes |
|---|---|---|
| `quote_id` | string | stable ID |
| `text_surface` | string | shorter display version |
| `text_full` | string | fuller original wording |
| `language` | enum | `zh`, `en` |
| `author` | string | displayed author |
| `source_work` | string | work title |
| `source_ref` | string | book / chapter / section reference |
| `source_type` | enum | `philosophy`, `business`, `literature`, `classical_chinese` |
| `scene_tags` | string[] | product use scenes |
| `tone_tags` | string[] | emotional / tonal fit |
| `strictness_level` | integer | `1-5` |
| `status` | enum | `approved`, `review_needed` |

## 6. Scene Tag System

Recommended scene tags:

- `start_day`
- `protect_line`
- `ship_today`
- `drift_recovery`
- `honest_review`
- `reset_tomorrow`

## 7. Tone Tag System

Recommended tone tags:

- `austere`
- `clear`
- `steady`
- `severe`
- `encouraging`
- `disciplining`
- `resetting`

## 8. Usage Rules

### Strategy card

Prefer quotes tagged:

- `start_day`
- `protect_line`
- `ship_today`

Avoid quotes that are:

- too mournful
- too grand
- too literary for quick morning use

### Review card

Prefer quotes tagged:

- `honest_review`
- `reset_tomorrow`
- `drift_recovery`

Avoid quotes that:

- sound like congratulations when the day was objectively weak
- feel moralizing without helping reset

## 9. Starter Pack

This starter pack is intended as the first curation batch for V1. It favors source clarity and scene fit over volume.

### English

#### 1. Marcus Aurelius

- `quote_id`: `en_ma_001`
- `text_surface`: `Put an end once for all to this discussion of what a good man should be, and be one.`
- `text_full`: `Put an end once for all to this discussion of what a good man should be, and be one.`
- `author`: `Marcus Aurelius`
- `source_work`: `Meditations`
- `source_ref`: `Book 10, Section 16 (Haines translation on Wikisource)`
- `scene_tags`: `["start_day", "ship_today", "honest_review"]`
- `tone_tags`: `["austere", "disciplining", "clear"]`

- `quote_id`: `en_ma_002`
- `text_surface`: `The happiness of your life depends upon the quality of your thoughts.`
- `text_full`: `The Happiness of your Life depends upon the Quality of your Thoughts, therefore guard accordingly.`
- `author`: `Marcus Aurelius`
- `source_work`: `The Emperor Marcus Antoninus: His Conversation with Himself`
- `source_ref`: `Book 3, Section 9`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["steady", "clear"]`

- `quote_id`: `en_ma_003`
- `text_surface`: `Thou shouldest have these two readinesses always at hand...`
- `text_full`: `Thou shouldest have these two readinesses always at hand; the one... to do only what thy reason... shall suggest for the good of mankind; the other to change thy mind, if one be near to set thee right.`
- `author`: `Marcus Aurelius`
- `source_work`: `Meditations`
- `source_ref`: `Book 4, Section 12 (Haines translation on Wikisource)`
- `scene_tags`: `["honest_review", "reset_tomorrow"]`
- `tone_tags`: `["steady", "resetting"]`

#### 2. Epictetus

- `quote_id`: `en_ep_001`
- `text_surface`: `First say to yourself Who you wish to be: then do accordingly what you are doing.`
- `text_full`: `First say to yourself Who you wish to be: then do accordingly what you are doing.`
- `author`: `Epictetus`
- `source_work`: `Discourses`
- `source_ref`: `Book 3, Chapter 23`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["austere", "clear"]`

- `quote_id`: `en_ep_002`
- `text_surface`: `It is not the things themselves that disturb men, but their judgements about these things.`
- `text_full`: `It is not the things themselves that disturb men, but their judgements about these things.`
- `author`: `Epictetus`
- `source_work`: `Encheiridion`
- `source_ref`: `Section 5`
- `scene_tags`: `["honest_review", "drift_recovery"]`
- `tone_tags`: `["steady", "clear"]`

- `quote_id`: `en_ep_003`
- `text_surface`: `Some things are under our control, while others are not under our control.`
- `text_full`: `Some things are under our control, while others are not under our control.`
- `author`: `Epictetus`
- `source_work`: `Encheiridion`
- `source_ref`: `Section 1`
- `scene_tags`: `["start_day", "reset_tomorrow"]`
- `tone_tags`: `["austere", "steady"]`

- `quote_id`: `en_ep_004`
- `text_surface`: `Man, if you are worth anything, you must walk alone.`
- `text_full`: `Man, if you are worth anything, you must walk alone, and talk to yourself and not hide in the chorus.`
- `author`: `Epictetus`
- `source_work`: `Discourses`
- `source_ref`: `Book 3, Chapter 14`
- `scene_tags`: `["drift_recovery", "ship_today"]`
- `tone_tags`: `["severe", "disciplining"]`

#### 3. Seneca

- `quote_id`: `en_se_001`
- `text_surface`: `Life is long, if we know how to use it.`
- `text_full`: `Life is long, if we know how to use it.`
- `author`: `Seneca`
- `source_work`: `De Brevitate Vitae`
- `source_ref`: `quoted in Comenius, The Great Didactic, Chapter 15`
- `scene_tags`: `["start_day", "ship_today"]`
- `tone_tags`: `["clear", "steady"]`

- `quote_id`: `en_se_002`
- `text_surface`: `While we are postponing, life speeds by.`
- `text_full`: `While we are postponing, life speeds by.`
- `author`: `Seneca`
- `source_work`: `On the Shortness of Life`
- `source_ref`: `Chapter 1`
- `scene_tags`: `["drift_recovery", "honest_review"]`
- `tone_tags`: `["severe", "disciplining"]`
- `status`: `review_needed`

- `quote_id`: `en_se_003`
- `text_surface`: `Begin at once to live, and count each separate day as a separate life.`
- `text_full`: `Begin at once to live, and count each separate day as a separate life.`
- `author`: `Seneca`
- `source_work`: `Letters from a Stoic`
- `source_ref`: `Letter 101`
- `scene_tags`: `["start_day", "reset_tomorrow"]`
- `tone_tags`: `["steady", "encouraging"]`
- `status`: `review_needed`

#### 4. Emerson

- `quote_id`: `en_em_001`
- `text_surface`: `Finish each day and be done with it.`
- `text_full`: `Finish each day and be done with it. You have done what you could.`
- `author`: `Ralph Waldo Emerson`
- `source_work`: `Journals`
- `source_ref`: `widely cited journal entry`
- `scene_tags`: `["honest_review", "reset_tomorrow"]`
- `tone_tags`: `["steady", "resetting"]`
- `status`: `review_needed`

- `quote_id`: `en_em_002`
- `text_surface`: `What lies behind us and what lies before us are tiny matters compared to what lies within us.`
- `text_full`: `What lies behind us and what lies before us are tiny matters compared to what lies within us.`
- `author`: `Ralph Waldo Emerson`
- `source_work`: `attributed saying`
- `source_ref`: `requires source verification before production use`
- `scene_tags`: `["reset_tomorrow", "drift_recovery"]`
- `tone_tags`: `["encouraging", "steady"]`
- `status`: `review_needed`

### Chinese

#### 5. 《論語》

- `quote_id`: `zh_lu_001`
- `text_surface`: `君子求諸己，小人求諸人。`
- `text_full`: `君子求諸己，小人求諸人。`
- `author`: `孔子`
- `source_work`: `《論語》`
- `source_ref`: `衛靈公`
- `scene_tags`: `["honest_review", "reset_tomorrow"]`
- `tone_tags`: `["austere", "clear"]`

- `quote_id`: `zh_lu_002`
- `text_surface`: `欲速則不達。`
- `text_full`: `無欲速，無見小利。欲速則不達，見小利則大事不成。`
- `author`: `孔子`
- `source_work`: `《論語》`
- `source_ref`: `子路`
- `scene_tags`: `["start_day", "protect_line", "ship_today"]`
- `tone_tags`: `["clear", "disciplining"]`
- `status`: `review_needed`

- `quote_id`: `zh_lu_003`
- `text_surface`: `己欲立而立人，己欲達而達人。`
- `text_full`: `夫仁者，己欲立而立人，己欲達而達人。`
- `author`: `孔子`
- `source_work`: `《論語》`
- `source_ref`: `雍也`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["steady", "clear"]`

- `quote_id`: `zh_lu_004`
- `text_surface`: `過而不改，是謂過矣。`
- `text_full`: `過而不改，是謂過矣。`
- `author`: `孔子`
- `source_work`: `《論語》`
- `source_ref`: `衛靈公`
- `scene_tags`: `["honest_review", "reset_tomorrow"]`
- `tone_tags`: `["austere", "disciplining"]`

#### 6. 《孟子》

- `quote_id`: `zh_mz_001`
- `text_surface`: `道在邇而求諸遠，事在易而求之難。`
- `text_full`: `道在邇而求諸遠，事在易而求之難。`
- `author`: `孟子`
- `source_work`: `《孟子》`
- `source_ref`: `離婁上`
- `scene_tags`: `["drift_recovery", "ship_today"]`
- `tone_tags`: `["clear", "disciplining"]`

- `quote_id`: `zh_mz_002`
- `text_surface`: `自暴者，不可與有言也；自棄者，不可與有為也。`
- `text_full`: `自暴者，不可與有言也；自棄者，不可與有為也。`
- `author`: `孟子`
- `source_work`: `《孟子》`
- `source_ref`: `離婁上`
- `scene_tags`: `["honest_review", "drift_recovery"]`
- `tone_tags`: `["severe", "austere"]`

- `quote_id`: `zh_mz_003`
- `text_surface`: `仁，人之安宅也；義，人之正路也。`
- `text_full`: `仁，人之安宅也；義，人之正路也。`
- `author`: `孟子`
- `source_work`: `《孟子》`
- `source_ref`: `離婁上`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["steady", "clear"]`

#### 7. 《道德經》

- `quote_id`: `zh_ddj_001`
- `text_surface`: `千里之行，始於足下。`
- `text_full`: `合抱之木，生於毫末；九層之臺，起於累土；千里之行，始於足下。`
- `author`: `老子`
- `source_work`: `《道德經》`
- `source_ref`: `第六十四章`
- `scene_tags`: `["start_day", "ship_today"]`
- `tone_tags`: `["steady", "encouraging"]`

- `quote_id`: `zh_ddj_002`
- `text_surface`: `慎終如始，則無敗事。`
- `text_full`: `民之從事，常於幾成而敗之。慎終如始，則無敗事。`
- `author`: `老子`
- `source_work`: `《道德經》`
- `source_ref`: `第六十四章`
- `scene_tags`: `["honest_review", "reset_tomorrow"]`
- `tone_tags`: `["steady", "disciplining"]`

- `quote_id`: `zh_ddj_003`
- `text_surface`: `為之於未有，治之於未亂。`
- `text_full`: `為之於未有，治之於未亂。`
- `author`: `老子`
- `source_work`: `《道德經》`
- `source_ref`: `第六十四章`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["clear", "steady"]`

#### 8. 《大學》與《中庸》

- `quote_id`: `zh_dx_001`
- `text_surface`: `苟日新，日日新，又日新。`
- `text_full`: `苟日新，日日新，又日新。`
- `author`: `《大學》`
- `source_work`: `《大學》`
- `source_ref`: `傳二章`
- `scene_tags`: `["start_day", "reset_tomorrow"]`
- `tone_tags`: `["encouraging", "steady"]`
- `status`: `review_needed`

- `quote_id`: `zh_zy_001`
- `text_surface`: `凡事豫則立，不豫則廢。`
- `text_full`: `凡事豫則立，不豫則廢。`
- `author`: `《中庸》`
- `source_work`: `《禮記·中庸》`
- `source_ref`: `第二十章`
- `scene_tags`: `["start_day", "protect_line"]`
- `tone_tags`: `["clear", "disciplining"]`
- `status`: `review_needed`

## 10. Notes on Verification

This starter pack is meant to balance speed and quality.

Recommended release process:

1. keep `approved` quotes available for immediate product use
2. keep `review_needed` quotes out of production until exact source wording is confirmed
3. expand only after scene coverage is stable

## 11. Recommendation

For V1 product use:

- launch with `12-16` approved quotes
- keep another `10-20` quotes in review
- build the library toward `36` total only after scene performance is observed

This keeps the first version disciplined, coherent, and trustworthy.
