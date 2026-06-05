# Comprehension & Speed: Evidence-Based Design for Hypersonic Reader

> **Purpose**: Ground every feature decision in peer-reviewed cognitive science. No pseudoscience, no marketing claims.

---

## 1. The Inconvenient Truth About Speed Reading

### The Speed–Comprehension Trade-off Is Real

- **Bottleneck is language processing, not eye mechanics.** Eye movements account for only ~10% of reading time; the rest is lexical access, syntactic parsing, and semantic integration (Rayner, Schotter, Masson, Potter & Treiman, 2016).
- **Skilled adults read ~238 WPM (nonfiction) / ~260 WPM (fiction)** — this is already near-optimal (Brysbaert, 2019; meta-analysis of 190 studies, N > 18,000).
- **RSVP comprehension holds up to ~350 WPM**, degrades significantly 400–500, and is essentially skimming above ~600 (Rubin & Turano, 1992; Schotter, Tran & Rayner, 2014).
- **Nobody reads 1000 WPM with full comprehension.** Rayner et al. (2016) and Schotter et al. (2014) both conclude this definitively.

### What Speed-Reading Apps Actually Do

RSVP removes the reader's ability to:
1. **Regress** — re-read a confusing word/phrase (regressions occur on ~10–15% of fixations in normal reading and are functional, not wasteful — Schotter et al., 2014)
2. **Modulate pace** — slow down for dense passages, speed up for simple ones
3. **Integrate across sentences** — the "sentence wrap-up" effect (Just & Carpenter, 1980; Masson, 1983)

These aren't bugs in human reading — they're features. RSVP strips them, which is why comprehension drops.

---

## 2. Evidence-Based Features Implemented

### Tier 1 (Strongest Evidence)

| Feature | Evidence | Implementation |
|---------|----------|----------------|
| **Free Recall** | #1 learning technique (Dunlosky et al., 2013; d ≈ 0.51 vs. rereading). Roediger & Karpicke (2006): testing > restudying even after 1 week. | `CompletionModal.tsx` — textarea post-reading |
| **Spaced Re-read Scheduler** | #2 technique (Dunlosky 2013). Cepeda et al. (2006, 2008): spacing ≫ massing. | `spacedRepetition.ts` — SM-2 algorithm |
| **Sentence Wrap-Up Pauses** | Masson (1983): inter-sentence pauses of 400–600ms measurably restore RSVP comprehension. | `wordTiming.ts` — 2.5× multiplier at sentence boundaries |
| **Honest WPM Guidance** | Brysbaert (2019), Rayner et al. (2016). | `ControlPanel.tsx` — zone indicator with color coding |
| **Self-Rated Comprehension** | Logs alongside WPM so users track *understanding*, not just speed. | `journal.ts` — stored in localStorage |
| **Readability Scoring** | Coleman & Liau (1975), Flesch (1948), Kincaid et al. (1975). | `readability.ts` — pure arithmetic, suggests WPM |

### What We Reframed

| Existing Feature | Issue | Resolution |
|-----------------|-------|------------|
| **Peripheral "Trainer"** | The perceptual span is cognitively limited, not optically. You can't "train" it wider (Rayner, 1998). | Kept as "show neighboring words" — display preference only |
| **ORP** | Real for isolated word recognition (slightly left of center). No evidence it boosts comprehension in continuous RSVP. | Offered as display preference, not a proven booster |
| **"Up to 1000 WPM"** | Misleading — comprehension is negligible at that speed. | Added zone indicator: >600 = "Scanning" |

---

## 3. The Science by Theme

### 3.1 Eye Movements & RSVP Limits

- **Fixation duration**: ~200–250ms per fixation (Rayner, 1998)
- **Saccade planning**: ~150–175ms
- **Perceptual span**: 3–4 characters left, 14–15 right of fixation (English). This is a *cognitive* limit, not optical
- **Regressions**: ~10–15% of saccades go backwards. These are *functional* — they support comprehension even on easy sentences (Schotter et al., 2014)
- **RSVP serial masking**: costs ~200 WPM because each word masks the previous one before lexical processing completes

### 3.2 Subvocalization & Working Memory

- **Phonological loop** (Baddeley, 1986): inner speech is part of comprehension, not a speed bottleneck to eliminate
- **Cowan's limit**: working memory holds ~4 ± 1 items. Chunking by grammatical boundaries (not arbitrary N-word groups) helps
- **Syntactic chunking**: "The quick brown fox / jumped over / the lazy dog" → 3 meaningful units ≤ 4 words each

### 3.3 Prosody, Pacing & Mind-Wandering

- **Mind-wandering during reading**: 15–50% of reading time (Schooler et al., 2004)
- **RSVP paradox**: enforced pace *reduces* mind-wandering (can't zone out and keep reading) but *also* removes the ability to re-read when you notice you've zoned out
- **Punctuation pauses**: restore some prosodic structure that RSVP strips

### 3.4 Evidence-Based Learning Techniques

From Dunlosky et al. (2013), ranked by utility:
1. **Practice testing** (retrieval practice) — HIGH utility
2. **Distributed practice** (spacing) — HIGH utility
3. **Elaborative interrogation** — MODERATE
4. **Self-explanation** — MODERATE
5. **Interleaved practice** — MODERATE
6. Summarization — LOW
7. Highlighting — LOW
8. Rereading — LOW

Our implementation focuses on #1 and #2 (the two HIGH-utility techniques).

---

## 4. References

1. Baddeley, A. D. (1986). *Working Memory*. Oxford University Press.
2. Brysbaert, M. (2019). How many words do we read per minute? *Journal of Memory and Language*, 109, 104047.
3. Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks. *Review of Educational Psychology*, 96(3), 354–370.
4. Cepeda, N. J., et al. (2008). Spacing effects in learning. *Psychological Science*, 19(11), 1095–1102.
5. Coleman, M., & Liau, T. L. (1975). A computer readability formula. *Journal of Applied Psychology*, 60(2), 283–284.
6. Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences*, 24(1), 87–114.
7. Dunlosky, J., et al. (2013). Improving students' learning with effective techniques. *Psychological Science in the Public Interest*, 14(1), 4–58.
8. Flesch, R. (1948). A new readability yardstick. *Journal of Applied Psychology*, 32(3), 221–233.
9. Just, M. A., & Carpenter, P. A. (1980). A theory of reading. *Psychological Review*, 87(4), 329–354.
10. Kincaid, J. P., et al. (1975). *Derivation of new readability formulas*. Technical report, Naval Air Station Memphis.
11. Masson, M. E. J. (1983). Conceptual processing of text during skimming and rapid sequential reading. *Memory & Cognition*, 11(3), 262–274.
12. Rayner, K. (1998). Eye movements in reading and information processing. *Psychological Bulletin*, 124(3), 372–422.
13. Rayner, K., Schotter, E. R., Masson, M. E. J., Potter, M. C., & Treiman, R. (2016). So much to read, so little time. *Psychological Science in the Public Interest*, 17(1), 4–34.
14. Roediger, H. L., & Karpicke, J. D. (2006). The power of testing memory. *Perspectives on Psychological Science*, 1(3), 181–210.
15. Rubin, G. S., & Turano, K. (1992). Reading without saccadic eye movements. *Vision Research*, 32(5), 895–902.
16. Schooler, J. W., et al. (2004). Zoning out while reading. *Psychonomic Bulletin & Review*, 11(3), 458–463.
17. Schotter, E. R., Tran, R., & Rayner, K. (2014). Don't believe what you read (only once). *Psychological Science*, 25(9), 1778–1786.
18. Wozniak, P. A. (1990). *Optimization of learning*. Master's thesis, University of Technology in Poznan.
