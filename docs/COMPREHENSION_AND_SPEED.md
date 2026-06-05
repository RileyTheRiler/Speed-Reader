# Reading Faster *and* Understanding More — Without AI

**An evidence-based design plan for Hypersonic Reader**

This document answers one question: *How can this app support both speed reading and genuine
reading comprehension/retention, using only deterministic, client-side features — no AI/LLM?*

It is grounded in peer-reviewed cognitive neuroscience and learning science. Every
recommendation is tied to (a) specific evidence and (b) a concrete place in this codebase.
Full citations are in [References](#references).

> **TL;DR.** The science is blunt: there is an unavoidable **speed–accuracy trade-off** in
> reading, and the bottleneck is *language processing*, not eye movements (Rayner et al., 2016).
> No app can make you read 1000 WPM with full comprehension. But an app *can* do three things
> that are strongly supported by evidence and need zero AI:
> 1. **Stop sabotaging comprehension** — keep the speed honest, restore the integration time and
>    re-reading that RSVP removes, and chunk along grammar instead of arbitrary word counts.
> 2. **Pace to the text and the reader** — compute difficulty locally and suggest a sane speed.
> 3. **Turn reading into learning** — the two highest-utility study techniques in the literature
>    (retrieval practice and spaced practice) are simple, deterministic features, not AI features.

---

## Contents

1. [The core scientific reality](#1-the-core-scientific-reality)
2. [What the evidence says, by theme](#2-what-the-evidence-says-by-theme)
3. [Honest audit of existing features](#3-honest-audit-of-existing-features)
4. [Proposed non-AI features (prioritized)](#4-proposed-non-ai-features-prioritized)
5. [Implementation roadmap](#5-implementation-roadmap)
6. [Honest caveats](#6-honest-caveats)
7. [References](#references)

---

## 1. The core scientific reality

**Skilled adults already read at ~238 WPM for non-fiction and ~260 WPM for fiction** (silent
reading), per a meta-analysis of 190 studies and 18,573 participants (Brysbaert, 2019). The
landmark review *"So Much to Read, So Little Time"* (Rayner, Schotter, Masson, Potter & Treiman,
2016, *Psychological Science in the Public Interest*) concludes:

- Reading speed is limited by **word recognition and sentence/discourse integration**, not by the
  eyes. Eye movements account for **~10% of reading time**, so "saving" them yields little.
- There is a **trade-off between speed and accuracy** — spend less time, understand less.
- Doubling or tripling speed (250 → 500–750 WPM) **while keeping comprehension is improbable**;
  1000+ WPM "with full comprehension" is effectively a marketing fiction. What happens past
  ~500–600 WPM is **skimming** (gist at the cost of detail and inference).
- The durable way to read faster is **better language skill** — vocabulary and background
  knowledge — plus **strategic skimming** when full comprehension isn't the goal.

This is not a reason to abandon a speed reader. It is a reason to build one that is *honest* and
that actively protects comprehension. The design philosophy that follows from the evidence:

> **Speed is a setting; comprehension is the goal. The app's job is to help the user pick an
> appropriate speed, preserve the cognitive processes that fast presentation tends to strip out,
> and convert reading into retention.**

---

## 2. What the evidence says, by theme

Confidence ratings reflect convergence across independent sources. **High** = replicated across
labs/decades or confirmed by meta-analysis; **Medium** = solid but fewer/younger studies or
contested mechanism.

### 2.1 Eye movements and the limits of "speed reading"  *(High)*

- Fixations average **200–250 ms**; forward saccades span **7–9 characters**; **10–15% of
  saccades are regressions** (re-reading) (Rayner, 1998).
- The **perceptual span** is asymmetric — about **3–4 characters left** and **14–15 right** of
  fixation in English (McConkie & Rayner, 1975; Rayner, 1998). It is **cognitively bottlenecked,
  not optically limited**: when the fixated word is hard, the span *shrinks* (Henderson &
  Ferreira, 1990). When foveal load is high, you get *tunnel vision*, the opposite of what
  "peripheral training" promises.
- **Reading whole lines/blocks via peripheral vision is not supported.** Acuity falls off with
  eccentricity and **crowding** degrades flanked letters; peripheral-vision training does not
  transfer to faster normal reading (Rayner et al., 2016; crowding literature).

> **Myth flagged:** "Expand your peripheral vision to read multiple lines at once." Debunked.

### 2.2 RSVP — what it helps and what it costs  *(High)*

RSVP (one word at a time at a fixed point) removes saccades and return sweeps — but that is the
~10% that didn't matter much, and it strips out things that *do*:

- **No regressions / re-reading.** When re-reading is experimentally blocked (mask each word once
  the eye passes), comprehension drops — for *ordinary* sentences, not just ambiguous ones
  (Schotter, Tran & Rayner, 2014). Regressions are a routine comprehension-monitoring tool.
- **Serial / backward masking.** In a stream, each word masks its neighbours in working memory;
  this alone is estimated to cost **~200 WPM** of effective rate, and an **attentional blink** can
  drop important words spaced 200–500 ms apart (Acosta-Mendoza et al., 2016, *PLOS ONE*).
- **No "sentence wrap-up" time.** Readers normally dwell longer at clause/sentence ends to
  integrate meaning; Masson (1983) showed that **inserting pauses between sentences improves RSVP
  comprehension**.
- **Empirical breakdown:** RSVP is roughly comparable to normal reading up to **~300–350 WPM**,
  declines significantly by **~400–450 WPM**, and at **700–1000 WPM** static text beats it badly
  (Benedetto et al., 2015; Aulner et al., 2020; Acklin & Papesh, 2017). Topic familiarity pushes
  the threshold up a bit.

### 2.3 Subvocalization and working memory  *(High)*

- The **phonological loop** (Baddeley) — the "inner voice" — is part of working memory and
  **supports comprehension**, especially on difficult/complex text. Articulatory suppression
  (forcing the inner voice off) *degrades* comprehension of demanding material (Coltheart et al.,
  1990; Norris et al., 2017).
- Working-memory capacity is small — Cowan's **~4 chunks** in the focus of attention — and it
  **predicts reading comprehension**, more so on hard text (Cowan, 2001/2010; Daneman & Merikle,
  1996).

> **Myth flagged:** "Kill your inner voice to read 2× faster." Unsupported and, on hard text,
> harmful. EMG shows it can't even be fully eliminated.

### 2.4 Chunking — only if it follows grammar  *(High → Medium)*

- Skilled readers naturally group words into **syntactic chunks** (phrases/clauses); reading times
  fluctuate at chunk boundaries (Lo et al., 2023).
- **Clause/phrase-aligned** segmentation lowers cognitive load and improves comprehension,
  especially for developing/L2 readers (Liu, 2024; Levasseur et al., 2006; Rasinski, 1994).
- **Arbitrary N-word chunks that split phrases are harmful** — they force readers to hold
  incomplete syntactic units in a 4-slot working memory.

### 2.5 Prosody, punctuation, and pausing  *(High)*

- Silent readers project **implicit prosody**; commas elicit the same neural boundary signal
  (Closure Positive Shift) as spoken prosodic breaks and shift parsing (Drury et al., 2016).
- **Wrap-up effects** at clause/sentence ends are among the most replicated findings in reading
  (Just & Carpenter, 1980; Warren, White & Reichle, 2009). Removing that time (fast RSVP) hurts;
  re-adding it (Masson, 1983) helps.

### 2.6 Pacing, guided reading, and mind-wandering  *(Mixed → High)*

- The moving-pointer/hand "pacer" works as a **metronome (rhythm/attention anchor), not a spatial
  guide** — the eye doesn't actually track the hand (Masson, cited in Rayner et al., 2016). There
  is **no controlled evidence** that a pacer raises speed while preserving comprehension. *(Medium)*
- **Self-paced reading beats forced-pace** for comprehension. *(High)*
- **Mind-wandering** consumes ~30% of reading time, is invisible to the reader ("eyes on, mind
  off"), and reliably lowers comprehension (meta-analytic **r ≈ −0.21**) (Schooler et al., 2004;
  Reichle et al., 2010; Bonifacci et al., 2022). **Active check-ins / self-explanation reduce the
  damage** (D'Mello & Mills, 2021). *(High / Medium)*

### 2.7 Matching speed to text difficulty  *(High formulas; Medium interaction)*

- **Readability formulas are pure arithmetic — no AI.** They use only counts of
  sentences/words/syllables/characters:
  - **Flesch Reading Ease** = `206.835 − 1.015 × (words/sentences) − 84.6 × (syllables/words)`
  - **Flesch–Kincaid Grade** = `0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59`
  - **Coleman–Liau** = `0.0588 × L − 0.296 × S − 15.8`  (L = letters per 100 words, S = sentences
    per 100 words) — needs **no syllable counting**, so it is the most robust to implement.
- They measure **surface features only** (word/sentence length), miss cohesion and vocabulary
  familiarity, and correlate with tested comprehension at **r ≈ 0.57–0.68** — a useful signal, not
  truth. Communicate that honestly.
- Harder text **slows skilled readers naturally** and **increases mind-wandering** (Francis et al.,
  2019; Kahmann et al., 2021), supporting lower suggested speeds for complex text.

### 2.8 The "Optimal Recognition Point" (ORP)  *(established science vs. marketing)*

- **Established:** the **Optimal Viewing Position** is **slightly left of a word's center** for
  fastest *isolated-word* recognition (O'Regan & Jacobs, 1992), and it shifts with word length.
- **Overstated:** Spritz-style claims that a red "ORP" pivot **boosts comprehension at high speed
  in continuous reading** are **not backed by any peer-reviewed RCT**; isolated-word findings don't
  transfer cleanly to discourse (Berns/Benedetto et al., 2015; Henderson, 2014). Offer ORP as a
  *display preference*, not a proven booster.

### 2.9 Turning reading into retention — the highest-utility learning science  *(High)*

From Dunlosky et al. (2013), *"Improving Students' Learning With Effective Learning Techniques"*
(the field's benchmark review of 10 techniques):

- **HIGH utility:** **practice testing (retrieval practice)** and **distributed practice
  (spacing)**.
- **LOW utility:** **highlighting, rereading, and (unaided) summarization** — the very things most
  reading tools lean on.

Supporting specifics:

- **Testing effect:** retrieving beats re-reading for durable memory; re-reading only feels
  productive (Roediger & Karpicke, 2006; meta-analytic **d ≈ 0.51** vs. restudy, Adesope et al.,
  2017). **Free recall** ("write everything you remember") is the strongest, simplest form.
- **Spacing:** spread review over time; optimal gap scales with how long you want to remember
  (Cepeda et al., 2006, 2008). **SM-2 and Leitner are deterministic formulas** driven by one
  self-rated number — **not AI**.
- **Generation effect:** producing an answer beats reading it (Slamecka & Graf, 1978).
- **Self-explanation / elaborative interrogation:** "explain why/how" prompts help (Chi et al.,
  1994) — *moderate*, prior-knowledge dependent.
- **Pre-reading** (previewing, advance organizers, the Survey/Question of SQ3R) activates schema —
  *moderate, mixed* evidence, but cheap.

**The crucial point for a no-AI app:** every one of these is operationalized by *prompting the
user to do the cognitive work themselves* — a blank recall box, a self-rating slider, a scheduled
reminder. **The app never has to generate or grade content.** The user's effort is the active
ingredient.

---

## 3. Honest audit of existing features

What the app already does, scored against the evidence above.

| Feature (code) | Verdict | Evidence |
|---|---|---|
| **Punctuation pausing** (`tokenizer.ts` `PUNCTUATION_DELAYS`, applied in `ReaderCanvas` loop) | ✅ **Keep & extend.** Well-grounded; add a true sentence wrap-up dwell. | Masson 1983; Just & Carpenter 1980 |
| **Pause at sentence end** (`settings.pauseAtEndOfSentence`) | ✅ **Keep.** Gives integration time. | Masson 1983; wrap-up effects |
| **Smart Rewind** (rewind 5 words on pause) | ✅ **Keep.** Partially restores re-reading. | Schotter et al. 2014 |
| **Sentence-context overlay on pause** (`TextPanel` pause overlay shows `getCurrentSentence()`) | ✅ **Keep — underrated.** Restores context RSVP strips. | Schotter 2014; wrap-up |
| **Pacer / Highlighter mode** (`TextPanel` variant) | ✅ **Keep**, frame as *rhythm/attention aid* (not a speed booster). Self-paced reading is good. | Rayner 2016; Masson metronome finding |
| **Manual Chunk Size 1–5** (`tokenizer.ts`, `chunkSize`) | ⚠️ **Rework.** Fixed N-word chunks split phrases. Make chunking clause-aware and cap at ~4 words. | Lo 2023; Liu 2024; Cowan 4±1 |
| **Smart Chunking** (`smartChunking` heuristics) | ⚠️ **Improve.** Good instinct, but it breaks after word counts/"glue" words; bias breaks to punctuation/clause boundaries instead. | Levasseur 2006; Rasinski 1994 |
| **WPM up to 1000** (`setWpm` clamp 100–1000; slider) | ⚠️ **Add honesty.** Keep the range, but warn >400 and >600; default near ~250–300. | Brysbaert 2019; RSVP thresholds |
| **ORP highlighting** (`orp.ts`, `ReaderCanvas`) | ⚠️ **Reframe + refine.** Real for isolated words; not a proven comprehension booster. Honest tooltip; align nearer "slightly left of center." | O'Regan & Jacobs 1992; Benedetto 2015 |
| **Peripheral "Trainer"** (`peripheralMode`) | ❌ **Rename / drop the "trainer" claim.** Peripheral training doesn't transfer; perceptual span is cognitively limited. Keep only as an optional "show neighbouring words for context." | Rayner 2016; Henderson & Ferreira 1990 |
| **AI Summary** (`llmService.ts`, Gemini) | ➖ **Out of scope.** Pre-existing; the new comprehension features below are deliberately **AI-free** and don't touch it. | — |
| **Stats: WPM/streaks** (`ReadingStats.tsx`) | ⚠️ **Augment.** Tracking speed-only nudges users the wrong way; add a comprehension dimension. | Rayner 2016 framing |

---

## 4. Proposed non-AI features (prioritized)

Each feature lists **evidence**, **where it plugs in**, and a **sketch**. All are deterministic and
client-side. Tiers reflect evidence strength × value.

### Tier 1 — Highest evidence, build first

#### F1. Post-reading **free-recall** prompt  *(retrieval + generation effect — HIGH)*
- **Evidence:** Roediger & Karpicke 2006; Adesope 2017 (d≈0.51); Slamecka & Graf 1978; Dunlosky
  HIGH utility.
- **Where:** New `RecallModal.tsx` (mirror `SummaryModal.tsx`'s structure, but a plain `<textarea>`
  and **no API**). Trigger when the reader finishes — the `ReaderCanvas` rAF loop already detects
  completion (`nextIndex >= tokens.length → state.pause()`), and `App.tsx` already has a
  session-end hook (`handleBackToInput`). Store responses in `localStorage` keyed by document id.
- **Sketch:** On completion show *"Without looking back, write everything you remember."* → free
  text → *"Now scroll back — what did you miss?"* The app **never grades it**; the act of recall is
  the point. Save into a per-document "reading journal".

#### F2. **Spaced re-read scheduler**  *(distributed practice — HIGH)*
- **Evidence:** Cepeda et al. 2006/2008; Dunlosky HIGH utility. SM-2/Leitner are deterministic.
- **Where:** Extend `SavedDocument` in `DocumentLibrary.tsx` with `repetitions`, `interval`,
  `easeFactor`, `nextReviewAt`. New `src/utils/spacedRepetition.ts` implementing SM-2:
  - intervals 1 day → 6 days → `round(interval × EF)`; `EF' = EF + (0.1 − (5−q)(0.08 + (5−q)0.02))`,
    floor 1.3; `q` is the user's 0–5 self-rating.
- **Sketch:** A **"Due for review"** badge/section in the Library; finishing a review asks
  *"How well did you remember this? (0–5)"* → schedule next date. Pure arithmetic; no server, no AI.

#### F3. **Sentence wrap-up + clause pauses**  *(integration time — HIGH)*
- **Evidence:** Masson 1983; Just & Carpenter 1980; Warren et al. 2009; Drury et al. 2016.
- **Where:** `tokenizer.ts` already tags `isSentenceEnd` and per-token `delayMultiplier`; the
  `ReaderCanvas` loop computes `requiredDelay`. Add settings: `clausePause`, `sentencePause`
  (multipliers) and a **hard minimum dwell** (e.g. 300–500 ms) on sentence-final tokens that
  overrides high WPM. Surface as a **"Comprehension pauses"** group in settings.
- **Sketch:** Independent, labelled multipliers for comma/clause vs. sentence/paragraph. Frame as
  *"helps comprehension at boundaries,"* not *"faster."*

#### F4. Honest **WPM guidance + comprehension-mode default**  *(speed–accuracy trade-off — HIGH)*
- **Evidence:** Brysbaert 2019; Rayner 2016; RSVP thresholds.
- **Where:** `ControlPanel.tsx` WPM slider; `store` default `wpm`. Add inline warnings at **>400**
  ("comprehension typically declines") and **>600** ("skimming territory"). Offer a one-tap
  **"Comprehension mode"** preset (~250–300 WPM + wrap-up pauses on).
- **Sketch:** Non-blocking labels under the slider; keep the user in control (self-pacing is good).

#### F5. **Self-rated comprehension** logging  *(metacognition; feeds F2 — HIGH/Medium)*
- **Evidence:** Counters speed-only optimization (Rayner 2016); supplies SM-2's `q` for F2.
- **Where:** Add `comprehension?: number` to `ReadingSession` in `ReadingStats.tsx`; prompt at
  session end; show a **comprehension-over-time** stat next to WPM.
- **Sketch:** `<input type="range" min=1 max=5>` at session end; one number to `localStorage`.

### Tier 2 — Strong evidence, moderate effort

#### S1. **Readability badge + suggested WPM**  *(difficulty matching)*
- **Evidence:** deterministic formulas; Francis 2019; Kahmann 2021. *(formulas High; mapping Medium)*
- **Where:** New `src/utils/readability.ts` (Coleman–Liau primary — no syllables; Flesch–Kincaid
  optional). Compute in `setInputText` (store a `readability` field). Show an **Easy/Standard/
  Challenging/Academic** badge on the input screen and a *"Suggested start: ~N WPM"* with an honest
  tooltip about formula limits.

#### S2. **Grammar-aware chunking**  *(syntactic chunks, capped size)*
- **Evidence:** Lo 2023; Liu 2024; Levasseur 2006; Cowan 4±1.
- **Where:** `tokenizer.ts`. Prefer breaks at punctuation/clause boundaries; never exceed ~4 words;
  avoid splitting across a clause. Reframe the Chunk Size control as *"max words per group."*

#### S3. **Prominent re-read affordance**  *(restore regressions)*
- **Evidence:** Schotter et al. 2014.
- **Where:** Skip-back logic already exists (`skipBackward`, `skipToPrevSentence`,
  `getCurrentSentence`). Make **"re-read last sentence"** a first-class, always-visible control in
  RSVP, plus an optional trailing **"last few words"** strip under the canvas.

#### S4. **Pre-reading preview / prior-knowledge activation**  *(advance organizer, SQ3R Survey/Q)*
- **Evidence:** Ausubel 1960 (mixed); previewing; SQ3R components. *(Medium)*
- **Where:** A step before `handleStart` in `App.tsx`: show title, word count, est. time, difficulty
  badge, and the first sentence of each paragraph as an outline; two optional prompts — *"What do
  you already know?"* / *"What do you want to learn?"* (free text, stored). Skippable.

#### S5. **Honest reframing** of claims (no code-behavior change, big trust win)
- **Evidence:** Rayner 2016; Henderson 2014; crowding literature.
- **Where:** `README.md`, in-app tooltips, settings copy, `OnboardingTutorial.tsx`. Soften "1000
  WPM," reframe Peripheral "Trainer," add an honest ORP tooltip, drop "faster comprehension"
  language where unsupported.

### Tier 3 — Useful, lower/younger or contested evidence

- **T1. Mid-reading check-ins (mind-wandering nudges)** — optional auto-pause every ~N words with a
  *"What was the main idea?"* prompt. *(Schooler 2004; Reichle 2010; D'Mello & Mills 2021 — Medium;
  default OFF to respect flow.)* Plugs into the `ReaderCanvas` loop counter.
- **T2. Phrase-cued / prosodic emphasis in Pacer mode** — subtle stress on clause-level words or
  clause-aligned line breaks, aimed at developing/L2 readers. *(Palmović 2025; Rasinski 1994 —
  Medium; must be togglable.)*
- **T3. Structured SQ3R reading template** — optional checklist sidebar (Survey/Question/Read/
  Recite/Review) reusing F1's recall field for "Recite." *(Components supported; whole-method
  evidence weak.)*

---

## 5. Implementation roadmap

**Phase 1 — Protect comprehension (mostly tokenizer/loop/store; small surface area)**
F3 wrap-up pauses · F4 honest WPM guidance + Comprehension mode · S3 re-read affordance ·
S5 reframing copy.

**Phase 2 — Turn reading into retention (new modal + localStorage schema)**
F1 free-recall + reading journal · F5 self-rated comprehension · F2 spaced re-read scheduler
(builds on F5's rating).

**Phase 3 — Pace to the text & the reader**
S1 readability badge + suggested WPM · S2 grammar-aware chunking · S4 pre-reading preview.

**Phase 4 — Engagement extras (opt-in, lower confidence)**
T1 check-ins · T2 phrase cueing · T3 SQ3R template.

Each item is independently shippable and additive (no breaking changes). Existing tests
(`tokenizer.test.ts`, `orp.test.ts`, `useReaderStore.test.ts`) constrain the engine changes;
add tests for `readability.ts` and `spacedRepetition.ts`.

---

## 6. Honest caveats

- **No feature breaks the trade-off.** These features help users pick a sane speed and *retain*
  what they read; they do not deliver 1000 WPM with full comprehension. Marketing otherwise would
  contradict the evidence (Rayner et al., 2016).
- **Readability formulas are signals, not truth** (r ≈ 0.57–0.68; surface features only). Always
  frame suggestions as suggestions.
- **Some areas are genuinely contested:** the exact WPM where RSVP breaks (≈250 vs ≈350, moderated
  by topic familiarity); whether harder text increases or decreases mind-wandering; the precise
  mechanism of wrap-up. Recommendations above prefer the convergent, conservative reading.
- **ORP / pacer are aids, not proven boosters** — offer them, don't oversell them.
- **Retrieval/spacing/generation are the heavy hitters,** and they're the *least* "speed-reader-y"
  features. That's the point: comprehension and retention come from effortful processing and
  revisiting, which the app can scaffold without any AI.

---

## References

*Confidence and cross-verification were assessed across independent sources; primary papers and
authoritative reviews are listed.*

**Eye movements, perceptual span, speed limits**
- Rayner, K. (1998). Eye movements in reading and information processing: 20 years of research.
  *Psychological Bulletin*, 124(3), 372–422.
- McConkie, G. W., & Rayner, K. (1975). The span of the effective stimulus during a fixation in
  reading. *Perception & Psychophysics*, 17, 578–586.
- Henderson, J. M., & Ferreira, F. (1990). Effects of foveal processing difficulty on the
  perceptual span. *JEP: LMC*.
- Rayner, Schotter, Masson, Potter, & Treiman (2016). So Much to Read, So Little Time. *Psych.
  Science in the Public Interest*, 17(1), 4–34. https://journals.sagepub.com/doi/10.1177/1529100615623267
- Brysbaert, M. (2019). How many words do we read per minute? *Journal of Memory and Language*, 109.
- Acosta-Mendoza et al. (2016). Perceptual and cognitive factors imposing "speed limits" on
  reading rate (RSVP). *PLOS ONE*, 11(4), e0153786.

**RSVP / regressions / wrap-up**
- Schotter, E. R., Tran, R., & Rayner, K. (2014). Don't believe what you read (only once):
  comprehension is supported by regressions. *Psychological Science*, 25(6), 1218–1226.
- Masson, M. E. J. (1983). Conceptual processing of text during skimming and rapid sequential
  reading. *Memory & Cognition*, 11, 262–274.
- Just, M. A., & Carpenter, P. A. (1980). A theory of reading: from eye fixations to comprehension.
  *Psychological Review*, 87(4), 329–354.
- Warren, T., White, S. J., & Reichle, E. D. (2009). Investigating the causes of wrap-up effects.
  *Cognition*, 110(2), 174–193.
- Benedetto, S., et al. (2015). RSVP in reading: the case of Spritz. *Computers in Human Behavior*,
  45, 352–358.
- Acklin, D., & Papesh, M. H. (2017). Modern speed-reading apps do not foster reading
  comprehension. *American Journal of Psychology*, 130(2), 183–199.
- Aulner et al. (2020). Speed reading using Spritz has a cost. *IJHFE*, 7(2), 161–173.

**Subvocalization / working memory / chunking**
- Coltheart, V., Avons, S. E., & Trollope, J. (1990). Articulatory suppression and phonological
  codes in reading for meaning. *QJEP A*, 42(2), 375–399.
- Norris, D., et al. (2017). Phonological recoding under articulatory suppression. *Memory &
  Cognition*, 46(2), 173–180.
- Cowan, N. (2001/2010). The magical number 4 in short-term memory. *BBS* / *Current Directions*.
- Daneman, M., & Merikle, P. M. (1996). Working memory and language comprehension: a meta-analysis.
  *Psychonomic Bulletin & Review*, 3(4), 422–433.
- Lo, C. W., et al. (2023). Periodic fluctuations in reading times reflect multi-word chunking.
  *Scientific Reports*, 13, 18522.
- Liu, D. (2024). Effects of segmentation on cognitive load, vocabulary, and comprehension. *BMC
  Psychology*, 12(4).
- Levasseur et al. (2006). Syntactically cued text facilitates oral reading fluency. *Applied
  Psycholinguistics*, 27(3). · Rasinski, T. (1994). Phrase-cued texts. *Intervention in School and
  Clinic*, 29(3).

**Prosody / punctuation / pacing / mind-wandering**
- Drury, J. E., et al. (2016). Punctuation and implicit prosody (CPS). *Frontiers in Psychology*, 7,
  1375.
- Schooler, Reichle, & Halpern (2004). Zoning out while reading. MIT Press.
- Reichle, Reineberg, & Schooler (2010). Eye movements during mindless reading. *Psychological
  Science*, 21(9), 1300–1310.
- Bonifacci, P., et al. (2022). Mind wandering and reading comprehension: a meta-analysis (r ≈
  −0.21). *Psychonomic Bulletin & Review*.
- Kahmann, R., et al. (2021). Mind wandering increases linearly with text difficulty. *Psychological
  Research*.
- D'Mello, S., & Mills, C. (2021). Mind wandering during reading. *Language and Linguistics
  Compass*, 15(4).

**Readability / OVP / ORP**
- Kincaid et al. (1975) — Flesch–Kincaid; Coleman & Liau (1975); McLaughlin (1969) SMOG; Senter &
  Smith (1967) ARI. (Formulas are public-domain arithmetic.)
- Francis et al. (2019). Text complexity and reading speed. (PMC6455959.)
- O'Regan, J. K., & Jacobs, A. M. (1992). Optimal viewing position effect in word recognition.
  *JEP: HPP*, 18(1), 185–197.
- Henderson, J. M. (2014). Critique of Spritz/ORP marketing (vclab blog).

**Learning science**
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving
  students' learning with effective learning techniques. *Psych. Science in the Public Interest*,
  14(1), 4–58.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*, 17(3),
  249–255. · Adesope, Trevisan, & Sundararajan (2017). Meta-analysis of practice testing. *Review
  of Educational Research*, 87(3), 659–701.
- Cepeda, N. J., et al. (2006). Distributed practice: a review and quantitative synthesis.
  *Psychological Bulletin*, 132(3), 354–380. · Cepeda et al. (2008). Spacing effects: a temporal
  ridgeline. *Psychological Science*, 19(11), 1095–1102.
- Slamecka, N. J., & Graf, P. (1978). The generation effect. *JEP: HLM*, 4(6), 592–604.
- Chi, M. T. H., et al. (1994). Eliciting self-explanations improves understanding. *Cognitive
  Science*, 18(3), 439–477.
- Ausubel, D. P. (1960). The use of advance organizers. *Journal of Educational Psychology*, 51(5),
  267–272. · Robinson, F. P. (1946). *Effective Study* (SQ3R).
- SM-2 algorithm: Woźniak, P. (1987), SuperMemo (deterministic spaced-repetition formula).

---

*Prepared as an evidence-based design plan. All proposed features are deterministic and
client-side; none require AI/LLM inference, server calls, or grading of user content.*
