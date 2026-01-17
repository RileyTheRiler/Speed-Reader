# Hypersonic Reader

A powerful, feature-rich speed reading web application built with React and TypeScript. Master the art of speed reading with scientifically-backed techniques like RSVP (Rapid Serial Visual Presentation) and Optimal Recognition Point (ORP) highlighting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg)

## Features

### Core Reading Modes

- **RSVP Mode** - Rapid Serial Visual Presentation displays words one at a time with ORP (Optimal Recognition Point) highlighting to reduce eye movement
- **Highlighter/Pacer Mode** - Full text view with a moving highlight guide for a more traditional reading experience

### Speed & Control

- **Adjustable WPM** - Read from 100 to 1000 words per minute
- **Smart Chunking** - Group words by natural phrases for faster comprehension
- **Punctuation Pausing** - Automatic pauses at sentence boundaries for better understanding
- **Smart Rewind** - Automatically rewind 5 words when pausing for context

### Accessibility Features

- **Bionic Reading** - Bold the first part of each word to guide your eyes
- **OpenDyslexic Font** - Dyslexia-friendly typeface option
- **High Contrast Themes** - Multiple color themes including high contrast options
- **Keyboard Navigation** - Full keyboard control for all features
- **Reduced Motion Support** - Respects system preferences for reduced motion

### File Support

- **PDF Import** - Extract and read text from PDF documents
- **EPUB Import** - Read e-books directly in the app
- **Plain Text** - Paste or import any text file

### AI Features

- **AI Summary** - Get AI-powered summaries using Google Gemini
- **Key Insights** - Quick comprehension check before or after reading

### Progress & Statistics

- **Reading Statistics** - Track words read, time spent, and average WPM
- **Streak Tracking** - Build and maintain reading streaks
- **Session History** - Review your recent reading sessions
- **Progress Persistence** - Resume where you left off

### Organization

- **Document Library** - Save documents locally for quick access
- **Preset Profiles** - Save and load custom reading configurations
- **Import/Export** - Share your presets with others

### Export & Recording

- **Video Export** - Record and export your reading session as WebM video
- **60fps Capture** - High-quality video output for sharing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Speed-Reader.git
cd Speed-Reader

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Keyboard Shortcuts

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
| `Esc` | Exit fullscreen / Zen mode |
| `?` | Show keyboard shortcuts |

## Project Structure

```
src/
├── components/           # React components
│   ├── App.tsx           # Main app container
│   ├── ControlPanel.tsx  # Playback controls
│   ├── ReaderCanvas.tsx  # RSVP display with ORP highlighting
│   ├── TextPanel.tsx     # Highlighter mode view
│   ├── SettingsModal.tsx # Settings interface
│   ├── SummaryModal.tsx  # AI summary interface
│   ├── KeyboardShortcutsModal.tsx
│   ├── OnboardingTutorial.tsx
│   ├── ReadingStats.tsx
│   ├── DocumentLibrary.tsx
│   ├── PresetProfiles.tsx
│   ├── FileImport.tsx
│   └── ErrorBoundary.tsx
├── store/
│   └── useReaderStore.ts # Zustand state management
├── utils/
│   ├── tokenizer.ts      # Text tokenization with ORP
│   ├── orp.ts            # ORP calculation algorithm
│   ├── fileParser.ts     # PDF/EPUB parsing
│   ├── llmService.ts     # AI integration
│   └── errorService.ts   # Error handling
├── test/
│   └── setup.ts          # Test configuration
└── index.css             # Global styles
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with fast HMR
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **PDF.js** - PDF parsing
- **EPUB.js** - EPUB parsing
- **Google Generative AI** - AI summaries
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

## How ORP Works

The Optimal Recognition Point (ORP) is the position within a word where the eye naturally focuses for fastest recognition. Hypersonic Reader calculates and highlights this point:

- 1-4 characters: ORP at position 1
- 5-9 characters: ORP at position 2
- 10-13 characters: ORP at position 3
- 14+ characters: ORP at position 4

By centering each word on its ORP, your eyes stay fixed while words flow past, dramatically reducing saccadic eye movements.

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Configuration

### Environment Variables

For AI summaries, you'll need a Google Gemini API key. Enter it in the Summary modal when prompted (stored locally in your browser).

### Customization

The app supports extensive customization through the Settings modal:

- **Themes**: Midnight, Paper, Solar, Hi-Contrast
- **Fonts**: Sans Serif, Serif, Monospace, OpenDyslexic
- **Colors**: Custom background, text, and highlight colors
- **Reading Features**: Bionic reading, peripheral trainer, smart chunking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by speed reading research and RSVP techniques
- Thanks to the open-source community for the amazing libraries

---

**Start reading faster today!**
