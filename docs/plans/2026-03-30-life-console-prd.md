# Life Console iOS PRD

## 1. Product Definition

- Product name: `Life Console`
- One-line definition: A personal control console that protects life fundamentals and pushes visible progress on meaningful work through structured reminders, honest tracking, and AI coaching.
- Product type: `Habit system + project execution system`
- Initial audience: `single-user`, designed for the founder's own daily use
- Primary platform: `iOS`

## 2. Why This Product Exists

The core problem is not a lack of goals. The user already knows what matters. The real problem is:

- rhythm breaks first
- execution breaks second
- self-trust breaks last

Current habit apps are too soft, too generic, or too focused on streak decoration. They record behavior, but they do not actively help the user regain control when they drift.

`Life Console` should feel less like a tracker and more like a personal operating system:

- one line protects the user's physical and mental baseline
- one line pushes one visible output on meaningful work
- AI interprets failure patterns instead of merely logging them

## 3. Product Goals

### Primary goals

1. Increase daily visible progress on important work, especially `side project` building and iteration.
2. Stabilize a small set of foundational habits that supply execution energy.
3. Restore a durable sense of control through clear priorities, honest records, and adaptive coaching.

### Non-goals for V1

- not a social network
- not a community challenge app
- not a meditation or wellness-first app
- not a generic to-do list replacement
- not a medical or therapy product

## 4. Product Principles

1. Clarity before motivation.
2. Honest tracking over fake completion.
3. Strong pressure only on a few high-leverage behaviors.
4. Visible output matters more than "time spent" for important work.
5. Daily use must stay lightweight enough to survive bad days.
6. AI must diagnose and coach, not generate empty encouragement.

## 5. User Insight Summary

The user explicitly wants:

- a `life control console`, not a simple habit checker
- two parallel daily priorities:
  - `1 key habit`
  - `1 key project action`
- mixed push style:
  - mostly supportive
  - but hard enforcement for selected behaviors
- reminders that work before deadline and after missed deadlines
- AI that can:
  - turn vague goals into measurable rules
  - detect why execution failed
  - coach the user back into motion

Important hidden needs surfaced during the interview:

- the user does not want to be fooled by "productive feeling" without visible output
- journaling serves as both an emotional release valve and a failure-diagnosis mechanism
- the app should include `daily in-app journaling`
- the app should also supervise `every-other-day physical paper journaling`

## 6. Success Metrics

### Outcome metrics

#### North-star outcome group A: Side project progress

- `Weekly visible-output days`
  - definition: number of days in a week where the user produced a visible side-project output
  - valid output examples: code commit, prototype screen, PRD block, tested iteration, shipped copy
  - formula: `count(distinct days with >=1 validated visible output)`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `5-7` days
    - yellow: `3-4` days
    - red: `0-2` days
  - dashboard display:
    - weekly bar with `7-day` fill
    - supporting list of output artifacts
  - target use: core outcome metric
- `Weekly milestone progress rate`
  - definition: whether at least one meaningful milestone moved forward during the week
  - milestone examples: new screen, onboarding step, feature module, validated iteration, product spec section
  - formula: `weeks with >=1 milestone advanced / total observed weeks`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `>=75%` of weeks
    - yellow: `50-74%`
    - red: `<50%`
  - dashboard display:
    - milestone tracker with current-week status
    - rolling `4-week` trend
  - target use: core outcome metric
- `Declared-mission completion rate`
  - definition: percentage of declared daily key missions that were completed on the same day
  - formula: `completed declared missions / all declared missions`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `>=80%`
    - yellow: `60-79%`
    - red: `<60%`
  - dashboard display:
    - compact ratio chip
    - drill-down list of declared vs missed missions
  - target use: supporting outcome metric

#### North-star outcome group B: Life rhythm stability

- `Core foundational-habit stability score`
  - definition: weighted stability score of the user's core habits
  - core included habits:
    - sleep before 23:00
    - reading
    - in-app journaling
    - every-other-day paper journaling
  - observed habits:
    - podcast listening
    - exercise or `13,000` walking steps
    - French lesson
    - weekly home cleaning
  - weighting logic:
    - highest priority: habits with strongest effect on side-project performance
    - second priority: habits manually marked as most important for the current phase
    - third priority: habits with recent repeated misses
  - formula:
    - per habit weekly score = `on-time completions * 1.0 + minimum completions * 0.6 + makeup completions * 0.4`
    - weighted stability score = `sum(habit score * dynamic weight) / sum(max possible score * dynamic weight) * 100`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `>=85`
    - yellow: `70-84`
    - red: `<70`
  - dashboard display:
    - main stability score card
    - weighted radar or stacked-pill breakdown
    - visible split between `core included` and `observed habits`
  - target use: core outcome metric
- `Evening shutdown stability`
  - definition: number of days per week where the user entered the planned wind-down routine on time
  - formula: `on-time wind-down days / planned wind-down days`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `>=80%`
    - yellow: `60-79%`
    - red: `<60%`
  - dashboard display:
    - evening timeline strip
    - `7-day` consistency sparkline
  - target use: supporting outcome metric

### Diagnostic support metrics

- `Weekly control-score self-rating`
  - definition: lightweight weekly self-assessment of perceived control
  - formula: user rates `1-5`, system stores rolling `4-week` average
  - dashboard display:
    - trend line beside objective metrics
  - target use: diagnostic only, not a core success metric
- `Main-line drift check`
  - definition: end-of-day response to the prompt `Was the most important thing I did today still the thing I most needed to do?`
  - formula: `yes days / answered days`
  - warning threshold:
    - green: `>=80%`
    - yellow: `60-79%`
    - red: `<60%`
  - dashboard display:
    - daily yes/no strip
    - weekly drift summary
  - target use: diagnostic only, used to interpret clarity and focus drift

### Product health metrics

#### A. Execution conversion

- `Full-funnel execution conversion`
  - definition: percentage of tracked commitments that move across the full chain:
    - reminder sent
    - action started
    - task completed
    - visible output produced when applicable
  - formula:
    - start rate = `started / reminded`
    - completion rate = `completed / started`
    - output rate = `visible outputs / completed output-eligible tasks`
    - full-funnel score = weighted blend of the three rates
  - primary observation window: `daily / weekly`
  - warning threshold:
    - green: `>=75`
    - yellow: `55-74`
    - red: `<55`
  - dashboard display:
    - funnel chart
    - breakpoints by hard vs soft commitments
  - target use: primary product-health metric
- `Declared-mission completion rate`
  - definition: percentage of daily declared key missions completed on time
  - primary observation window: `weekly`
  - target use: secondary product-health metric

#### B. Decision clarity

- `Key-priority selection speed`
  - definition: time taken after opening the app to confirm today's key habit and key mission
  - formula: `median seconds from app open to both key items confirmed`
  - primary observation window: `daily / weekly`
  - warning threshold:
    - green: `<=90s`
    - yellow: `91-180s`
    - red: `>180s`
  - dashboard display:
    - median time chip
    - trend over last `7` and `30` days
  - target use: primary clarity metric
- `Main-line alignment rate`
  - definition: percentage of days where the user confirms at night that the day's actual effort stayed aligned with the intended main line
  - formula: `aligned days / answered days`
  - primary observation window: `weekly`
  - warning threshold:
    - green: `>=80%`
    - yellow: `60-79%`
    - red: `<60%`
  - dashboard display:
    - weekly alignment score
    - paired view with mission completion for interpretation
  - target use: secondary clarity metric

#### C. Measurement design principles

- product-health metrics should be `system-calculated by default`
- limited `user confirmation` is allowed when the signal is inherently subjective
- subjective inputs are mainly used for:
  - control self-rating
  - main-line drift check
  - end-of-day alignment confirmation

## 7. Core Object Model

### A. Habit

Recurring behavior with a schedule and measurable definition.

Fields:

- title
- category
- cadence: `daily / weekly / every 21 days / every other day`
- completion rule
- minimum completion rule
- evidence type
- hard-or-soft enforcement
- reminder plan
- recovery logic

### B. Mission

A high-priority project action tied to meaningful output, not simple activity.

Fields:

- mission title
- target output
- due window
- completion evidence
- status
- impact weight

### C. Journal

Two journal modes:

- `Daily in-app journal`
- `Paper journal supervision` with every-other-day rhythm

Fields:

- mode
- prompt
- completion proof
- detected mood
- execution blockers
- AI summary

### D. Review

Structured reflection across day and week.

## 8. Habit Inventory for V1

Below is the founder's initial habit set, rewritten to be more measurable.

| Habit | Cadence | Standard Completion | Minimum Completion | Enforcement |
|---|---|---|---|---|
| Sleep before 23:00 | Daily | In bed and lights-out by `23:00` | Wind-down started by `22:40` | Hard |
| Podcast learning | Daily | Listen `20+ min` in approved themes | Listen `10+ min` | Hard |
| Exercise | Daily | `30 min` total movement or `13,000` walking steps | `15 min` walk/stretch | Soft |
| Reading | Daily | `1 paper book chapter + 15 min ebook` | One of the two completed | Hard |
| French lesson | Daily | Complete `1 full lesson` | `10 min` active practice | Soft |
| Build/iterate side project with AI | Daily | Visible output shipped or produced | No minimum shortcut by default | Hard |
| In-app journal | Daily | Complete guided daily journal | `3-sentence quick journal` | Soft |
| Paper journal | Every other day | Complete physical journal entry and confirm in app | None | Hard |
| Home cleaning | Weekly | Complete one meaningful full-home cleaning session | One focused cleaning block for one major area | Soft |

Notes:

- `Build/iterate side project` must default to output-based completion, not time-based completion.
- Paper journaling should be supervised inside the app, but the writing itself happens offline.
- Podcast topics should emphasize `AI`, `consumer`, `healthcare`, and `investing`, with three selected listens per cycle treated as the stronger observation layer.

## 9. Product Scope

### V1 MVP

1. Onboarding with AI-assisted habit setup
2. Daily dashboard with two anchors:
   - today's key habit
   - today's key mission
3. Reminder engine
   - pre-reminder
   - missed-deadline chase
4. Completion logging with strict / minimum / makeup states
5. In-app daily journaling
6. Paper journal supervision flow
7. AI coach
   - setup assistant
   - failure diagnosis
   - end-of-day coaching
8. Weekly review dashboard
9. Basic gamification
   - score
   - streaks
   - recovery
   - rank tiers

### V1.5

- calendar heatmap
- smarter suggestion engine
- pattern clustering across failures
- contextual recommendation by time-of-day and weekday

### V2

- accountability partner mode
- expert plans or templates marketplace
- shared challenge rooms
- commercialization experiments

## 10. Main User Flows

### Flow 1: Initial setup

1. User states goals in natural language.
2. AI converts them into measurable habits and missions.
3. User approves or edits:
   - cadence
   - completion criteria
   - hard vs soft push
   - reminder timing
4. System builds first dashboard.

### Flow 2: Daily use

1. User opens app and sees:
   - `Protect Today`: key habit
   - `Push Today`: key mission
2. User receives pre-reminders.
3. User logs completion or marks partial.
4. If overdue, app escalates based on enforcement level.
5. End of day:
   - in-app daily journal
   - AI reflection
   - score update

### Flow 3: Missed behavior recovery

1. System detects miss.
2. App asks:
   - failed completely?
   - minimum completed?
   - makeup planned?
3. AI diagnoses likely reason:
   - timing
   - overload
   - ambiguity
   - resistance
4. System suggests adjustment without lowering standards too early.

### Flow 4: Paper journal supervision

1. On scheduled days, app issues reminder: `Do paper journal tonight`.
2. User confirms after writing.
3. Optional evidence:
   - checkbox only
   - timestamp
   - photo proof in later versions
4. If skipped, app records a miss and triggers review prompt next day.

## 11. Reminder System Design

### Reminder layers

1. Prep reminder
   - example: `22:15 Start closing the day. You still need a 23:00 sleep landing.`
2. Deadline reminder
   - example: `22:45 You are 15 minutes from missing today's sleep rule.`
3. Chase reminder
   - example: `23:08 Sleep target missed. Log failure honestly or enter recovery mode.`

### Escalation behavior

- Soft habit:
  - fewer reminders
  - gentler copy
  - downgrade path shown early
- Hard habit:
  - repeat reminders
  - consequence language
  - no silent dismissal

## 12. Completion States

Every task or habit can end the day in one of the following states:

- `Complete`
- `Minimum Complete`
- `Missed`
- `Made Up`
- `Excused` only for manual exceptional cases

Rules:

- hard habits default to strict failure if standard completion is not reached
- minimum completion exists to preserve momentum for selected habits
- side project mission does not get an easy minimum by default because the user wants visible output
- makeup can recover score partially, but must remain visibly different from on-time completion

## 13. AI Features

### A. AI Setup Assistant

Turns vague goals into operational definitions.

Example:

- input: `I want to read more and work on my project every day`
- output:
  - measurable behavior
  - cadence
  - deadline
  - evidence type
  - minimum acceptable version

### B. AI Failure Diagnosis

After misses, AI classifies the most likely reason:

- rule too vague
- reminder too late
- task too large
- emotional resistance
- energy collapse
- schedule conflict

Then it suggests one narrow correction.

### C. AI Coach

Daily coaching behavior:

- short check-in when user is drifting
- pressure with empathy on hard commitments
- reflective summary at night

Tone:

- clear
- honest
- non-cheesy
- slightly demanding on high-leverage commitments

### D. AI Weekly Review

At the end of each week, AI answers:

- what improved?
- where did you repeatedly fail?
- which rule is poorly designed?
- which habit is actually driving side project success?

## 14. Gamification System

Goal: create pressure and momentum without turning the product childish.

### Core mechanics

- `Control Score`: daily score based on key habit, key mission, and overall completion
- `Stability Meter`: weighted by sleep, journaling, and reading consistency
- `Builder Rank`: weighted by side project visible outputs
- streaks for:
  - key habit
  - key mission
  - weekly review
- recovery tokens:
  - rare, earned through consistent weeks
  - can protect one streak without erasing the miss record

### Tone of game layer

- elegant
- premium
- serious
- progress-oriented

Avoid:

- cartoon badges
- childish celebrations
- noisy confetti after every tap

## 15. Information Architecture

### Bottom navigation

1. `Today`
2. `Coach`
3. `Journal`
4. `Progress`
5. `Settings`

### Today tab structure

- top summary
- `Protect Today` card
- `Push Today` card
- remaining commitments
- friction alerts
- quick log actions

### Coach tab

- AI daily brief
- diagnosis cards
- adjustment suggestions
- ask-AI composer

### Journal tab

- daily in-app journal
- paper journal supervision tracker
- emotional trends

### Progress tab

- daily score
- habit completion trends
- mission output history
- weekly reviews

## 16. Screen List

### Screen 1: Onboarding

- define goals
- AI-generated setup
- choose hard vs soft habits

### Screen 2: Today Dashboard

- date and control score
- key habit card
- key mission card
- fast completion logging
- overdue warnings

### Screen 3: AI Coach

- current drift diagnosis
- recommendation stack
- mini conversation

### Screen 4: Daily Journal

- mood
- what moved forward
- what blocked execution
- what to protect tomorrow

### Screen 5: Paper Journal Check

- scheduled day badge
- reminder state
- confirm completion

### Screen 6: Progress

- 7-day and 30-day trends
- score breakdown
- streak and recovery history

## 17. UX Requirements

- opening the app should create `clarity` first and `being understood` second
- the user should know the top two priorities within `3 seconds`
- completion logging should require at most `1-2 taps`
- journaling should support both quick and deep modes
- hard habits must feel different from soft habits visually and behaviorally

## 18. Visual Direction

Recommended visual language:

- not playful productivity
- not clinical wellness
- not corporate dashboard

Instead:

- editorial control room
- refined but firm
- tactile and premium
- warm neutrals with sharp high-contrast alerts

The product should feel like a private command desk for rebuilding self-trust.

## 19. Risks

1. Over-pressure may create avoidance if too many habits are set to hard mode.
2. AI coaching may feel repetitive if it does not use behavior history well.
3. Too much tracking could make the product feel like a moral ledger instead of support.
4. If visible output is defined poorly, side project progress may still degrade into fake work.

## 20. Open Product Decisions

These are good candidates for the next design round:

- whether paper journal proof needs photo confirmation
- how much manual edit power the user should have after AI setup
- whether sleep should rely only on self-report in V1
- how recovery tokens are earned and capped

## 21. Recommended Build Sequence

### Sprint 1

- onboarding
- habit and mission model
- today dashboard
- basic reminders

### Sprint 2

- completion states
- in-app journal
- paper journal supervision
- progress dashboard

### Sprint 3

- AI setup assistant
- AI diagnosis
- AI daily coach
- weekly review

## 22. North Star

`Life Console helps the user end more days feeling: I protected my baseline, I pushed something meaningful forward, and I know exactly why today worked or failed.`
