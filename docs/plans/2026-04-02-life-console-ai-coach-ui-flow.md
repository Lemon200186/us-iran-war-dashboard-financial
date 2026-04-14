# Life Console AI Coach UI Flow

## 1. Goal

This document defines the first UI flow for the AI Coach product surface.

It focuses on three screens:

1. Coach page
2. Take Over Today page
3. End-of-day Review page

The purpose of these screens is not to display AI content for its own sake. The purpose is to move the user from confusion to action, and from failure to honest reset.

## 2. Design Principles

1. Coach UI should prioritize movement over explanation.
2. The page should feel like a control room, not a chat transcript.
3. The most important action should always be obvious.
4. Explanations should be near actions, but secondary to them.
5. Bottom-page clutter should be avoided.

## 3. Coach Page

## Primary purpose

Help the user know what to do now.

## Success condition

Within a few seconds, the user should be able to:

- see today's project action
- see today's floor action
- start execution immediately

## Information hierarchy

### Layer 1: Action control panel

This is the first screen and the highest-priority block.

The panel should contain exactly two actions:

1. project action
2. floor action

Order rule:

- project action always appears first
- floor action always appears second

### Project action card

Should show:

- action title
- short reason line
- current risk state
- latest meaningful deadline

Primary button:

- `Start Now`

Secondary button:

- `Why this`

Important rule:

- the project action must feel operational, not reflective

### Floor action card

Should show:

- minimal baseline action
- why it matters today
- urgency state

Its role is to protect the day from total collapse.

## Layer 2: Dual dashboard block

Immediately after the action panel, the page should show two parallel blocks:

- AI judgement
- Today record

These should be treated as sibling modules.

On mobile:

- they may stack vertically
- but should still feel like one grouped dashboard zone

### AI judgement block

Purpose:

- explain the current situation in one glance

Should include:

- current risk diagnosis
- likely blocker
- why today's top action is the right move

### Today record block

Purpose:

- show what has already happened today

Should include:

- today's completed actions
- what's still pending
- whether key mission has started
- whether output has been logged

## Layer 3: Take Over Today presence

Take Over Today should exist in two places:

1. a lightweight entry in the top action area
2. a fuller module in the mid-to-lower page

### Full Take Over Today module

Its default purpose is not to sell the feature.

Its default purpose is to answer:

- `Are you now at the point where takeover is more appropriate?`

Default system phrasing:

- `You are better off entering Take Over Today now.`

This should feel measured, not dramatic.

## Layer 4: No bottom-content clutter

Do not add:

- quote section
- AI history feed
- old recommendations log
- decorative content

The page should end once action and judgment are clear.

## 4. Coach Page Wireframe

```text
+--------------------------------------------------+
| COACH                                            |
| AI Action Console                                |
|--------------------------------------------------|
| PROJECT ACTION                                   |
| Ship onboarding wireframe state 1                |
| Why now: highest leverage for side-project push  |
| Risk: drifting into planning instead of output   |
| Deadline: 21:30                                  |
| [Start Now]   [Why this]                         |
|--------------------------------------------------|
| FLOOR ACTION                                     |
| Protect 23:00 sleep boundary                     |
| Why today: prevents tomorrow collapse            |
| Status: at risk                                  |
| [Start routine]                                  |
|--------------------------------------------------|
| AI JUDGEMENT          | TODAY RECORD             |
| Task too large        | Mission not started      |
| Drift risk rising     | Reading pending          |
| Best move: ship 1     | Exercise done            |
|--------------------------------------------------|
| TAKE OVER TODAY                                  |
| You are better off entering Take Over Today now. |
| [Enter Take Over Today]                          |
+--------------------------------------------------+
```

## 5. Take Over Today Page

## Primary purpose

Compress a failing day into a recoverable version.

## Success condition

The user should leave this screen with:

- one clear minimum visible deliverable
- one clear baseline floor
- no uncertainty about what counts as done

## Information hierarchy

### Layer 1: State judgement

At the top, show:

- a single line declaring whether takeover is appropriate

This should be short and firm.

### Layer 2: Diagnosis summary

Default diagnosis priority:

1. task problem
2. rhythm problem
3. emotional problem

The diagnosis area should answer:

- what is failing first

It should not become a long analysis page.

### Layer 3: Takeover card

The central unit of the page.

Must contain:

1. command
2. reason
3. acceptance criteria

This is the most important area of the whole page.

### Layer 4: Today's floor

A small list of minimal things still worth protecting today.

This list should stay short.

Examples:

- sleep boundary
- in-app journal

### Layer 5: Action row

Primary button:

- `Start this version`

Secondary button:

- `Compress once more`

Important rule:

- this page should move the user into action, not trap them in adjusting forever

## 6. Take Over Today Wireframe

```text
+--------------------------------------------------+
| TAKE OVER TODAY                                  |
| You are better off entering takeover mode now.   |
|--------------------------------------------------|
| DIAGNOSIS                                        |
| Today's plan is too large for your current state |
|--------------------------------------------------|
| YOUR MINIMUM VISIBLE DELIVERABLE                 |
| Command: Ship one onboarding wireframe state.    |
| Reason: restore output, not fantasy planning.    |
| Done when:                                       |
| - 1 screen finished                              |
| - 3 states labeled                               |
| - exported before 21:30                          |
|--------------------------------------------------|
| TODAY'S FLOOR                                    |
| - Protect sleep boundary                         |
| - Complete in-app journal tonight                |
|--------------------------------------------------|
| [Start this version]  [Compress once more]       |
+--------------------------------------------------+
```

## 7. End-of-day Review Page

## Primary purpose

Turn the day into an honest conclusion.

## Success condition

The user should leave knowing:

- what the day actually became
- whether the failure was design or avoidance
- what tomorrow should change

## Information hierarchy

### Layer 1: Day verdict

The page should open with a plain-language verdict:

- success
- partial success
- failed day

This gives emotional and cognitive closure quickly.

### Layer 2: What happened

Short summary of the day:

- what moved
- what failed
- where the main line broke

### Layer 3: Failure classification

Answer one question clearly:

- was this task design failure or avoidance failure?

This is the decisive reflective layer.

### Layer 4: Main-line check

Must include the user question:

- `Was the most important thing I did today still the thing I most needed to do?`

This should remain lightweight.

### Layer 5: Tomorrow adjustment

If needed, show:

- one rule to change tomorrow

Not:

- an entire rewritten life plan

### Layer 6: Closing quote

One quote appears at the end.

Purpose:

- emotional closure
- reset signal
- not celebration

## 8. End-of-day Review Wireframe

```text
+--------------------------------------------------+
| END-OF-DAY REVIEW                                |
| Verdict: Partial day. Output did not close.      |
|--------------------------------------------------|
| WHAT HAPPENED                                    |
| You stayed active, but the key mission stayed    |
| too large and never became a real output.        |
|--------------------------------------------------|
| FAILURE TYPE                                     |
| Primary: task design failure                     |
| Secondary: mild avoidance                        |
|--------------------------------------------------|
| MAIN-LINE CHECK                                  |
| Was the most important thing you did today still |
| the thing you most needed to do?                 |
| [Yes] [No]                                       |
|--------------------------------------------------|
| TOMORROW CHANGE                                  |
| Tomorrow's mission must be one screen, not the   |
| whole onboarding flow.                           |
|--------------------------------------------------|
| QUOTE                                            |
| "Put an end once for all..."                     |
| Marcus Aurelius                                  |
+--------------------------------------------------+
```

## 9. Cross-screen Journey

### Normal use

1. user opens Coach page
2. sees project action + floor action
3. taps `Start Now`

### Drift path

1. user opens Coach page
2. sees AI judgement + rising risk
3. sees Take Over Today recommendation
4. enters takeover page
5. starts compressed plan

### Failed-day path

1. user reaches evening
2. opens review page
3. sees day verdict
4. answers main-line check
5. reads one tomorrow adjustment
6. closes the day

## 10. Recommendation

For the first prototype:

1. build these three screens first
2. keep them card-based and short
3. protect the action hierarchy
4. avoid adding conversational clutter

The AI Coach should feel like a disciplined operating interface, not a diary with AI sprinkled on top.
