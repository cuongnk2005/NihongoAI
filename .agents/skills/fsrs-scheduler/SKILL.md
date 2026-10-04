---
name: fsrs-scheduler
description: >-
  Provides implementation guidelines, formulas, and state transition rules for
  Free Spaced Repetition Scheduler (FSRS) in NihongoAI. Use when designing,
  implementing, or testing card review algorithms, intervals, stability, difficulty
  calculations, or review state persistence.
---

# FSRS (Free Spaced Repetition Scheduler) Skill

## 1. Overview & Core Philosophy

In NihongoAI, spaced repetition is powered by the **FSRS** model rather than legacy SM-2.
The scheduler determines when a card should next be reviewed to maintain a desired level of retention (default: 90% or `0.90`).

### Golden Rules:
1. **Never mutate past history:** `ReviewLog` is append-only. Recalculations or scheduler changes must never erase or overwrite historical review entries.
2. **Strict separation:**
   - `Card`: Content, template, deck reference, and direction.
   - `ReviewState`: Current scheduling state (state, stability, difficulty, due date, last review).
   - `ReviewLog`: Audit trail of each review event (rating, elapsed days, scheduled days, timestamp).
3. **Deterministic logic:** FSRS is purely mathematical and deterministic. Never use AI to compute scheduling intervals.

---

## 2. Core Variables & Concepts

### Variables
- **$S$ (Stability):** The number of days for memory retention to drop from 100% to Target Retention ($R$).
- **$D$ (Difficulty):** A measure of how difficult the card is to remember (scale 1 to 10).
- **$R$ (Retrievability):** Probability of recall at time $t$:
  $$R(t, S) = (1 + \text{FACTOR} \cdot \frac{t}{S})^{\text{DECAY}}$$
  *(Standard FSRS v4/v5 default decay parameters)*
- **Rating ($G$ - Grade):**
  - `1`: **Again** (Complete blackout, wrong answer)
  - `2`: **Hard** (Recalled with intense effort or hesitation)
  - `3`: **Good** (Recalled with normal effort, expected response)
  - `4`: **Easy** (Recalled effortlessly, immediate response)
- **Card States:**
  - `0`: **New** (Card has never been reviewed)
  - `1`: **Learning** (Card is in initial learning steps)
  - `2`: **Review** (Card is graduated and subject to standard interval expansion)
  - `3`: **Relearning** (Card lapsed on "Again" after being in Review state)

---

## 3. Step-by-Step Review Transaction Flow

When a learner answers a flashcard:

1. **Input Validation:**
   - Card ID exists and belongs to the user/deck.
   - Rating is valid (`1 = AGAIN`, `2 = HARD`, `3 = GOOD`, `4 = EASY`).
   - Review timestamp (`now`) is recorded.

2. **Load Current State:**
   - Fetch `ReviewState` for the card. If none exists, initialize default `New` state.
   - Calculate elapsed days ($t$) since `lastReviewDate`.

3. **Calculate Next State via FSRS:**
   - If card is **New** ($State = 0$):
     - Compute initial stability $S_0(G)$ and initial difficulty $D_0(G)$ using base parameters.
     - Determine initial interval (e.g. Again: 1m/10m, Good: 1d, Easy: 3-4d depending on parameters).
   - If card is **Review** ($State = 2$):
     - Calculate current retrievability $R(t, S)$.
     - Update difficulty: $D' = \text{clamp}(D + \Delta D(G), 1, 10)$.
     - If $G = 1$ (Again): Card lapses $\rightarrow$ State transitions to `Relearning`, calculate post-lapse stability $S_r(D, S, R)$.
     - If $G \ge 2$: Calculate post-recall stability $S'_r(D, S, R, G)$.
     - Compute next interval $I = \text{round}(S / \text{factor} \cdot \dots)$ targeting desired retention.

4. **Persist Transactionally (`@Transactional` in Spring Boot):**
   - Update `ReviewState`:
     - `stability = S'`
     - `difficulty = D'`
     - `due = now + Interval`
     - `lastReviewedAt = now`
     - `reps = reps + 1`
     - `lapses = (G == 1 ? lapses + 1 : lapses)`
     - `state = newState`
   - Insert new `ReviewLog`:
     - `cardId = card.getId()`
     - `rating = G`
     - `state = previousState`
     - `due = previousDue`
     - `stability = S'`
     - `difficulty = D'`
     - `elapsedDays = t`
     - `scheduledDays = Interval`
     - `reviewedAt = now`

---

## 4. Default FSRS Parameters (v4 baseline reference)

When initializing standard weights ($w_0$ to $w_{18}$):
```
w = [
  0.4072, 1.1827, 3.1262, 15.4722,  // Initial stabilities for ratings 1..4
  7.2102, 0.5316, 1.0651, 0.0234,   // Difficulty parameters
  1.616, 0.1544, 1.0824,            // Recall stability parameters
  1.9813, 0.0953, 0.2975,           // Forget stability parameters
  0.2204, 0.2407, 2.9466, 0.5034    // Additional adjustment weights
]
Desired Retention: 0.90
Maximum Interval: 36500 (100 years)
```

---

## 5. Verification Checklist

When reviewing or writing FSRS code:
- [ ] Are `ReviewState` and `ReviewLog` kept in separate tables?
- [ ] Is the update operation enclosed in a `@Transactional` block?
- [ ] Does selecting "Again" increment the `lapses` counter?
- [ ] Are interval bounds properly clamped (minimum 1 day for graduated cards, maximum cap enforced)?
- [ ] Are unit tests written for all 4 ratings (Again, Hard, Good, Easy) verifying calculated intervals match expectations?
- [ ] Does the Daily Review Queue (`/api/reviews/next`) query only cards where `ReviewState.due <= now` or `ReviewState.state = NEW` within daily limits?
