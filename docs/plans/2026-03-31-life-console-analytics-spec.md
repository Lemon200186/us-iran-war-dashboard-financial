# Life Console Analytics Spec

## 1. Goal

This document translates the approved product metrics into implementation-ready analytics requirements for V1.

It answers four questions:

1. What events must the app track?
2. What fields must be attached to each event?
3. How are the agreed metrics computed from those events?
4. What should the first dashboard contain?

## 2. Analytics Principles

1. Track only what helps improve execution and clarity.
2. Prefer event-driven computation over manual reporting.
3. Separate objective behavior from subjective reflection.
4. Keep naming stable so metrics do not drift between app and dashboard.
5. Store enough context to support future AI diagnosis.

## 3. Event Taxonomy

### A. Session and navigation

| Event name | When triggered | Key purpose |
|---|---|---|
| `app_opened` | user opens the app | daily usage, key-priority selection speed |
| `screen_viewed` | user lands on a major screen | screen-level engagement |
| `dashboard_loaded` | Today screen fully loads | starting point for clarity metrics |

### B. Planning and priority setup

| Event name | When triggered | Key purpose |
|---|---|---|
| `key_habit_confirmed` | user confirms today's protect item | decision clarity |
| `key_mission_declared` | user sets today's push item | declared-mission metrics |
| `mission_output_type_selected` | user declares output proof type | output validation |
| `habit_weight_updated` | user marks a habit as phase-critical | dynamic weighting |

### C. Reminders and execution

| Event name | When triggered | Key purpose |
|---|---|---|
| `reminder_sent` | system sends reminder | funnel start |
| `reminder_opened` | user opens reminder | reminder effectiveness |
| `task_started` | user indicates execution has begun | funnel mid-point |
| `task_completed` | user marks task/habit complete | completion tracking |
| `task_minimum_completed` | user logs minimum completion | recovery-sensitive scoring |
| `task_makeup_completed` | user completes after original deadline | makeup logic |
| `task_missed` | task ends as missed | failure diagnosis |

### D. Output and milestone tracking

| Event name | When triggered | Key purpose |
|---|---|---|
| `visible_output_logged` | user logs a visible project output | outcome north-star |
| `visible_output_validated` | system or user validates output evidence | output quality gate |
| `milestone_created` | user defines a milestone | milestone tracking |
| `milestone_progressed` | user advances milestone | milestone progress rate |
| `milestone_completed` | user completes milestone | project throughput |

### E. Journal and reflection

| Event name | When triggered | Key purpose |
|---|---|---|
| `journal_started` | user starts in-app journal | journaling behavior |
| `journal_submitted` | user submits in-app journal | core stability metric |
| `paper_journal_reminder_sent` | system reminds paper journal day | paper-journal supervision |
| `paper_journal_confirmed` | user confirms paper journal completed | core stability metric |
| `main_line_check_answered` | user answers drift question | decision clarity |
| `control_score_self_rated` | user submits weekly control rating | diagnostic support |

### F. AI coaching

| Event name | When triggered | Key purpose |
|---|---|---|
| `ai_setup_suggestion_generated` | AI suggests initial habit rules | setup quality |
| `ai_diagnosis_generated` | AI diagnoses a miss or pattern | AI utility |
| `ai_recommendation_accepted` | user accepts AI suggestion | recommendation effectiveness |
| `ai_recommendation_dismissed` | user dismisses AI suggestion | recommendation tuning |

## 4. Global Event Properties

These fields should be attached to most events when applicable.

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | stable internal ID |
| `session_id` | string | app session grouping |
| `event_time` | ISO datetime | client timestamp |
| `local_date` | date | derived in user timezone |
| `timezone` | string | example: `Asia/Shanghai` |
| `screen_name` | string | if event happens in UI |
| `task_id` | string | habit or mission instance ID |
| `task_type` | enum | `habit`, `mission`, `journal`, `paper_journal` |
| `task_name` | string | human-readable task label |
| `cadence` | enum | `daily`, `weekly`, `every_other_day`, `every_21_days` |
| `enforcement_level` | enum | `hard`, `soft` |
| `completion_state` | enum | `complete`, `minimum`, `makeup`, `missed` |
| `is_core_habit` | boolean | whether counted in core stability |
| `is_observed_habit` | boolean | whether tracked but lower priority |
| `phase_priority_rank` | integer | manual priority rank for current phase |
| `side_project_impact_weight` | float | product logic weight |

## 5. Event-specific Properties

### `key_mission_declared`

| Field | Type | Notes |
|---|---|---|
| `mission_category` | string | ex: onboarding, growth, feature, design |
| `declared_output_type` | enum | `code`, `prototype`, `prd`, `copy`, `research`, `other` |
| `due_time` | ISO datetime | due on same day by default |
| `is_output_eligible` | boolean | should be `true` for key mission |

### `reminder_sent`

| Field | Type | Notes |
|---|---|---|
| `reminder_type` | enum | `prep`, `deadline`, `chase`, `paper_journal` |
| `scheduled_time` | ISO datetime | planned fire time |
| `actual_send_time` | ISO datetime | real send time |
| `is_overdue_context` | boolean | whether triggered after missed state |

### `task_started`

| Field | Type | Notes |
|---|---|---|
| `start_source` | enum | `app`, `notification`, `widget`, `shortcut` |
| `seconds_since_app_open` | integer | for clarity and action latency |
| `seconds_since_reminder` | integer | for reminder-to-start analysis |

### `task_completed`

| Field | Type | Notes |
|---|---|---|
| `completed_on_time` | boolean | strict completion status |
| `evidence_type` | enum | `manual`, `text`, `file`, `photo`, `link`, `health_sync` |
| `seconds_since_start` | integer | task duration proxy when available |

### `visible_output_logged`

| Field | Type | Notes |
|---|---|---|
| `output_type` | enum | `code`, `prototype`, `prd`, `copy`, `research`, `ship` |
| `artifact_title` | string | short human label |
| `artifact_url` | string | optional |
| `validated` | boolean | whether user/system accepts as real output |

### `main_line_check_answered`

| Field | Type | Notes |
|---|---|---|
| `answer` | boolean | yes/no |
| `reason_code` | enum | `right_focus`, `interruption`, `avoidance`, `bad_planning`, `energy_drop`, `other` |

### `control_score_self_rated`

| Field | Type | Notes |
|---|---|---|
| `score_1_to_5` | integer | subjective weekly self-rating |
| `note_length` | integer | optional reflection depth |

## 6. Metric Mapping

### Outcome metrics

| Metric | Source events | Computation |
|---|---|---|
| Weekly visible-output days | `visible_output_validated` | count distinct `local_date` with >=1 validated output |
| Weekly milestone progress rate | `milestone_progressed`, `milestone_completed` | weeks with >=1 milestone progress / observed weeks |
| Declared-mission completion rate | `key_mission_declared`, `task_completed` | completed declared missions / all declared missions |
| Core foundational-habit stability score | `task_completed`, `task_minimum_completed`, `task_makeup_completed`, `task_missed`, `habit_weight_updated` | weighted weekly score based on completion state and dynamic weights |
| Evening shutdown stability | `task_started`, `task_completed` for sleep wind-down task | on-time wind-down days / planned days |

### Diagnostic support

| Metric | Source events | Computation |
|---|---|---|
| Weekly control-score self-rating | `control_score_self_rated` | average score, plus rolling 4-week mean |
| Main-line drift check | `main_line_check_answered` | yes answers / answered days |

### Product health

| Metric | Source events | Computation |
|---|---|---|
| Full-funnel execution conversion | `reminder_sent`, `task_started`, `task_completed`, `visible_output_validated` | weighted blend of start, completion, and output rates |
| Key-priority selection speed | `app_opened`, `key_habit_confirmed`, `key_mission_declared` | median seconds from `app_opened` to both confirmations |
| Main-line alignment rate | `main_line_check_answered` | aligned days / answered days |

## 7. Suggested Derived Tables

### `daily_task_fact`

One row per task instance per day.

Fields:

- `local_date`
- `task_id`
- `task_name`
- `task_type`
- `completion_state`
- `was_reminded`
- `was_started`
- `was_completed`
- `was_output_validated`
- `started_on_time`
- `completed_on_time`
- `dynamic_weight`

### `weekly_user_summary`

One row per user per week.

Fields:

- `week_start`
- `visible_output_days`
- `milestone_progressed_flag`
- `declared_mission_completion_rate`
- `core_foundation_stability_score`
- `evening_shutdown_stability`
- `full_funnel_execution_score`
- `key_priority_selection_speed_median`
- `main_line_alignment_rate`
- `control_score_self_rating_avg`

## 8. Dashboard Structure

### A. Executive strip

Purpose: one-screen answer to `Am I more in control this week?`

Cards:

1. `Visible Output Days`
2. `Foundation Stability`
3. `Execution Funnel`
4. `Main-line Alignment`

### B. Outcome section

#### Module 1: Project progress

- weekly visible-output bar
- artifact feed
- milestone tracker
- declared mission completion ratio

#### Module 2: Life rhythm stability

- core stability score card
- habit-weight breakdown
- evening shutdown trend
- paper journal adherence mini-card

### C. Product-health section

#### Module 3: Execution conversion

- funnel chart:
  - reminded
  - started
  - completed
  - produced output
- hard vs soft comparison
- reminder-type comparison (`prep`, `deadline`, `chase`)

#### Module 4: Decision clarity

- key-priority selection speed trend
- main-line alignment heatmap
- drift reason distribution

### D. Diagnostic section

#### Module 5: Self-perception vs reality

- control self-rating vs stability score
- self-rating vs visible-output days
- list of weeks with largest gap between felt control and actual control

## 9. Dashboard Wireframe

```text
+------------------------------------------------------------------+
| WEEK SUMMARY                                                     |
| Output Days | Foundation Score | Funnel Score | Main-line Align |
+------------------------------------------------------------------+
| PROJECT PROGRESS                                                 |
| 7-day output bar      | Artifact feed                            |
| Milestone tracker     | Declared mission completion              |
+------------------------------------------------------------------+
| RHYTHM STABILITY                                                |
| Foundation score card | Weighted habit breakdown                 |
| Wind-down trend       | Paper journal adherence                  |
+------------------------------------------------------------------+
| EXECUTION CONVERSION                                            |
| Reminder -> Start -> Complete -> Output funnel                  |
| Hard vs Soft | Reminder type comparison                          |
+------------------------------------------------------------------+
| DECISION CLARITY                                                |
| Priority selection speed | Main-line alignment heatmap           |
| Drift reasons distribution                                      |
+------------------------------------------------------------------+
| SELF-PERCEPTION VS REALITY                                      |
| Control self-rating vs actual stability/output                  |
+------------------------------------------------------------------+
```

## 10. Instrumentation Priorities

### P0

- `app_opened`
- `key_habit_confirmed`
- `key_mission_declared`
- `reminder_sent`
- `task_started`
- `task_completed`
- `task_missed`
- `visible_output_logged`
- `visible_output_validated`
- `journal_submitted`
- `paper_journal_confirmed`
- `main_line_check_answered`

### P1

- `task_minimum_completed`
- `task_makeup_completed`
- `milestone_created`
- `milestone_progressed`
- `control_score_self_rated`
- `ai_diagnosis_generated`
- `ai_recommendation_accepted`

### P2

- `reminder_opened`
- `screen_viewed`
- `habit_weight_updated`
- `ai_recommendation_dismissed`

## 11. Open Implementation Questions

1. Should visible outputs require evidence attachment in V1?
2. Should `task_started` be manual, inferred, or both?
3. How should the system infer wind-down start for sleep if the user does not explicitly tap?
4. Should `paper_journal_confirmed` allow optional photo proof later?

## 12. Recommendation

For V1, build the analytics layer around:

- one clean event schema
- one `daily_task_fact` table
- one `weekly_user_summary` table
- one dashboard with five modules

This is enough to support both product learning and AI coaching without overbuilding the data stack.
