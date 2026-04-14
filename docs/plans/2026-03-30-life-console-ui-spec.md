# Life Console UI Spec

## 1. UI Intent

The interface should not look like a cheerful productivity toy. It should feel like a private control room: calm, premium, sharp, and slightly demanding.

Desired emotional sequence:

1. `Clarity`: what matters right now
2. `Containment`: life is not chaos, it is structured
3. `Understanding`: the system knows where I am slipping

## 2. Aesthetic Direction

- Style: `editorial command desk`
- Mood: `warm paper + emergency signal accents`
- Contrast: soft base surfaces with high-contrast action chips
- Typography pairing:
  - display: high-character serif
  - body: calm readable sans or humanist serif
- Visual metaphor:
  - one part luxury notebook
  - one part mission control panel

## 3. Core Screen Hierarchy

### Today

Top area:

- date
- `Control Score`
- short AI line

Primary stack:

- `Protect Today` card
- `Push Today` card

Secondary stack:

- hard commitments
- soft commitments
- missed / at-risk strip

Footer:

- quick log bar
- bottom nav

### Coach

- drift summary
- diagnosis tags
- one tactical recommendation
- chat entry point

### Journal

- daily in-app journal composer
- paper journal supervision card
- emotional trend mini-chart

### Progress

- weekly score trend
- habit grid
- mission output history
- review snapshots

## 4. Today Screen Wireframe

```text
+--------------------------------------------------+
| Mar 30 Mon                         Control 78    |
| AI: Keep the day simple. Protect sleep, ship 1.  |
|--------------------------------------------------|
| PROTECT TODAY                                    |
| Sleep before 23:00                               |
| Wind-down starts 22:15          HARD             |
| [Start wind-down] [Log complete]                 |
|--------------------------------------------------|
| PUSH TODAY                                       |
| Ship one visible side-project output             |
| Acceptable proof: code / prototype / PRD         |
| [Declare output] [Mark shipped]                  |
|--------------------------------------------------|
| HARD COMMITMENTS                                 |
| Podcast  Read  Paper Journal (due tomorrow)      |
|--------------------------------------------------|
| SOFT COMMITMENTS                                 |
| Exercise  French  In-app Journal                 |
|--------------------------------------------------|
| RISK STRIP                                       |
| You missed reading twice this week after 22:30.  |
+--------------------------------------------------+
```

## 5. Key Components

### A. Control Score Dial

- prominent but elegant
- should feel earned, not gamified for children
- use segmented ring or stacked bar

### B. Key Habit Card

- visually stronger than other habits
- contains:
  - goal
  - deadline
  - enforcement level
  - action buttons

### C. Key Mission Card

- must emphasize output
- contains:
  - today's target
  - acceptable proof
  - progress note

### D. Risk Strip

- thin but noticeable
- shows pattern-based warnings from AI
- should be readable in under 2 seconds

### E. Paper Journal Card

- displayed in Journal tab daily
- elevated on scheduled days
- supports simple confirmation first

## 6. Color System

- `Background`: parchment / oat / fog neutrals
- `Ink`: deep graphite or dark navy
- `Hard mode`: rust red / ember / oxblood
- `Soft mode`: sage / muted green
- `AI`: midnight blue with pale glow
- `Progress`: antique gold

Suggested token ideas:

- `--bg`: warm off-white
- `--surface`: translucent ivory
- `--ink`: deep slate
- `--danger`: ember red
- `--success`: forest green
- `--signal`: antique gold
- `--coach`: storm blue

## 7. Motion Principles

- load sequence should reveal cards with staggered rise
- urgency states should pulse softly, not aggressively shake
- score changes should animate with weight and restraint

## 8. iOS Patterns

- bottom tab bar for the five core areas
- large title treatment on top-level screens
- sheet presentation for:
  - AI coaching detail
  - completion logging
  - end-of-day review
- haptic feedback on:
  - marking hard tasks complete
  - recovering from a miss

## 9. UI States to Design

- normal day
- at-risk hard habit
- overdue mission
- successful day close
- recovery after miss
- scheduled paper journal day

## 10. First Prototype Recommendation

Build first:

1. Today dashboard
2. Coach sheet
3. Journal tab
4. Progress snapshot

Reason:

These screens express the whole product thesis with the least implementation effort.
