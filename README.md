# Quickie Read

A cognitive science-grounded speed reading web application built with React and TypeScript. Quickie Read optimizes reading pace and comprehension using evidence-based techniques, including Rapid Serial Visual Presentation (RSVP), Optimal Recognition Point (ORP) highlighting, and cognitive integration tools.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg)

---

## 🧠 Evidence-Based Design

Unlike traditional speed reading apps that prioritize speed at the cost of comprehension, **Quickie Read** integrates peer-reviewed cognitive science principles to ensure retention:

1. **Pre-Reading Schema Activation** (Anderson & Pearson, 1984): Generates a paragraph-level outline and prompts prior-knowledge reflection for texts over 100 words before reading begins.
2. **Grammar-Aware Chunker** (Cowan, 2001): Restricts chunks to a maximum of 4 words (Cowan's working-memory limit) and breaks on clause boundaries (commas, semicolons, dashes) or before conjunctions/clause starters (and, but, because) to preserve syntactic units.
3. **Sentence Wrap-Up Pauses** (Masson, 1983): Introduces a 2.5× pause multiplier at the end of sentences, giving the brain crucial integration time before the next sentence begins.
4. **Prominent Re-Read Affordance** (Schotter et al., 2014): Provides an easily accessible "Re-read" button to support regression, which is essential for correcting comprehension failures.
5. **Auto-WPM Suggestion** (Brysbaert, 2019): Analyzes text complexity using the Flesch–Kincaid and Coleman–Liau formulas to suggest and apply an evidence-based WPM (e.g., slower pacing for academic texts).
6. **Free Recall & Retrieval Practice** (Dunlosky et al., 2013; Roediger & Karpicke, 2006): Prompts active recall writing and self-rating post-reading (the #1 ranked learning technique with d ≈ 0.51).
7. **Spaced Repetition Scheduler** (Cepeda et al., 2006/2008): Automatically calculates the next review interval using a local SM-2 algorithm to prompt timely re-reads.
8. **Bimodal Reading** (Wood et al., 2018; Montali & Lewandowski, 1996): Presents text-to-speech audio simultaneously with strict word-level visual highlighting. Processing text through the visual and auditory channels at once reduces "decoding fatigue," freeing working memory for comprehension. A meta-analysis of 22 TTS studies found a positive weighted effect on comprehension (d ≈ 0.35 overall; d ≈ 0.61 between-subjects), and bimodal formats can raise less-skilled readers' comprehension to match that of average readers. For ADHD readers, synchronized audio-visual input acts as an attention stabilizer.

---

## 🛠️ Features

### Core Reading Modes
- **RSVP Mode** - Displays words sequentially at the Optimal Recognition Point (ORP) focal point to eliminate saccadic eye movements.
- **Pacer Mode** - Displays full text with a moving highlight line to guide physical reading.
- **Bimodal (Listen) Mode** - Reads the text aloud and highlights the exact word being spoken in real time (text-to-speech + synchronized highlighting). Includes a voice picker, adjustable pitch, and an optional **Line Focus** that dims surrounding sentences to reduce distraction. Speed follows the WPM control (200–300 WPM is the focus sweet spot). Uses the browser's built-in Web Speech API — no account or network required — behind a provider interface ready for future cloud/AI voices.

### Layout & Customization
- **Dyslexia-Friendly** - Toggle OpenDyslexic font and high-contrast color themes (Midnight, Paper, Solar, Hi-Contrast).
- **Zen Mode** - Removes all distractions to focus entirely on the reading panel.
- **Bionic Reading** - Bolds the initial part of words to guide the eye's fixation path.

### Supported Formats
- **PDF & EPUB Import** - Parse and read e-books or documents directly.
- **Plain Text** - Paste text directly into the dashboard.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `R` | Reset to beginning |
| `←` | Skip back 5 words |
| `→` | Skip forward 5 words |
| `Shift + ←` | Previous sentence |
| `Shift + →` | Next sentence |
| `↑` | Increase speed +10 WPM |
| `↓` | Decrease speed -10 WPM |
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen / Zen mode / Close Library |
| `?` | Show keyboard shortcuts |

---

## 📁 Project Structure

```text
src/
├── components/           # React Components
│   ├── App.tsx           # Application layout and router logic
│   ├── CompletionModal.tsx # Post-reading recall, rating, and review scheduler
│   ├── ControlPanel.tsx  # Interactive playback, WPM, and readability controls
│   ├── DocumentLibrary.tsx # Stored text index with spaced review due badges
│   ├── ErrorBoundary.tsx # Global exception handler
│   ├── FileImport.tsx    # Drag-and-drop file import target
│   ├── PreviewModal.tsx  # Pre-reading outline and schema priming
│   ├── ReaderCanvas.tsx  # Canvas-based RSVP rendering engine
│   ├── SettingsModal.tsx # Dyslexia fonts, bionic reading, and wrap-up settings
│   ├── TextPanel.tsx     # Pacer layout and sidebar text guide
│   └── ui/               # Reusable UI subcomponents (SettingToggle.tsx)
├── store/
│   └── useReaderStore.ts # Zustand state store (deep-merge settings persist)
└── utils/
    ├── errorService.ts   # Error logging and reporting
    ├── fileParser.ts     # PDF and EPUB format parsing
    ├── journal.ts        # Reading journal (localStorage)
    ├── orp.ts            # Optimal Recognition Point calculation
    ├── readability.ts    # Flesch-Kincaid & Coleman-Liau readability formulas
    ├── security.ts       # Input sanitization and limits
    ├── spacedRepetition.ts # SM-2 scheduler utility
    ├── tokenizer.ts      # Grammar-aware and smart RSVP tokenization
    └── wordTiming.ts     # Punctuation & sentence wrap-up delays
```

---

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/RileyTheRiler/Speed-Reader.git
cd Speed-Reader

# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Run Tests
```bash
# Run test suite once
npm run test:run

# Run tests in watch mode
npm run test
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
