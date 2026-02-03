import { useEffect, useState, useCallback } from 'react';
import { useReaderStore } from './store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ControlPanel } from './components/ControlPanel';
import { TextPanel } from './components/TextPanel';
import { SettingsModal } from './components/SettingsModal';
import { SummaryModal } from './components/SummaryModal';
import { FileImport } from './components/FileImport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { ReadingStatsModal, recordSession } from './components/ReadingStats';
import { DocumentLibrary } from './components/DocumentLibrary';
import { PresetProfiles } from './components/PresetProfiles';
import {
  FolderOpen,
  BarChart3,
  Sliders,
  HelpCircle,
  Keyboard,
  Trash2
} from 'lucide-react';

function App() {
  const {
    tokensLength,
    inputText,
    setInputText,
    showInput,
    setShowInput,
    isSidePanelOpen,
    toggleSidePanel,
    isZenMode,
    toggleZenMode,
    setCurrentIndex,
    readingMode,
  } = useReaderStore(
      useShallow((state) => ({
          tokensLength: state.tokens.length,
          inputText: state.inputText,
          setInputText: state.setInputText,
          showInput: state.showInput,
          setShowInput: state.setShowInput,
          isSidePanelOpen: state.isSidePanelOpen,
          toggleSidePanel: state.toggleSidePanel,
          isZenMode: state.isZenMode,
          toggleZenMode: state.toggleZenMode,
          setCurrentIndex: state.setCurrentIndex,
          readingMode: state.settings.readingMode,
      }))
  );

  // Modal states
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Track reading session
  const [sessionStartIndex, setSessionStartIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const handleStart = () => {
    if (!inputText.trim()) return;
    setShowInput(false);
    // Use getState() to access current index without subscription
    setSessionStartIndex(useReaderStore.getState().currentIndex);
    setSessionStartTime(Date.now());
  };

  const handleBackToInput = useCallback(() => {
    // Record the session before going back
    const { currentIndex, wpm, tokens } = useReaderStore.getState();

    if (sessionStartTime && tokens.length > 0) {
      const wordsRead = currentIndex - sessionStartIndex;
      const timeSpent = (Date.now() - sessionStartTime) / 1000;
      const completionRate = (currentIndex / tokens.length) * 100;

      if (wordsRead > 10 && timeSpent > 5) {
        recordSession(wordsRead, timeSpent, wpm, completionRate);
      }
    }

    setShowInput(true);
    setSessionStartTime(null);
  }, [sessionStartTime, sessionStartIndex, setShowInput]);

  const handleSelectFromLibrary = (content: string, position?: number) => {
    setInputText(content);
    if (position && position > 0) {
      setTimeout(() => {
        setCurrentIndex(position);
      }, 100);
    }
    setShowInput(false);
    setSessionStartIndex(position || 0);
    setSessionStartTime(Date.now());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        if (isZenMode) {
          toggleZenMode();
        }
        // Close any open modals
        setIsShortcutsOpen(false);
        setIsStatsOpen(false);
        setIsLibraryOpen(false);
        setIsPresetsOpen(false);
      }

      // ? key opens keyboard shortcuts
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, toggleZenMode]);

  const isReading = tokensLength > 0 && !showInput;

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-[#222] text-[#eee] font-sans ${prefersReducedMotion ? '' : 'transition-colors'}`}>
        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 py-3 px-4 text-gray-400 text-sm border-b border-gray-800">
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open document library"
          >
            <FolderOpen size={16} />
            <span className="hidden sm:inline">Library</span>
          </button>
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open preset profiles"
          >
            <Sliders size={16} />
            <span className="hidden sm:inline">Presets</span>
          </button>
          <button
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="View reading statistics"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Stats</span>
          </button>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard size={16} />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="View tutorial"
          >
            <HelpCircle size={16} />
            <span className="hidden sm:inline">Help</span>
          </button>
        </nav>

        {/* Main Content Area */}
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
          <div className="w-full max-w-[800px] bg-[#333] rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-white">
              Hypersonic Reader
            </h1>

            {isReading ? (
              <div className={`space-y-6 ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={toggleSidePanel}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                    aria-label={isSidePanelOpen ? 'Hide text panel' : 'Show text panel'}
                  >
                    {isSidePanelOpen ? 'Hide Side Panel' : 'Show Side Panel'}
                  </button>
                </div>

                {readingMode === 'pacer' ? (
                  <TextPanel variant="embedded" />
                ) : (
                  <ReaderCanvas />
                )}

                <ControlPanel onToggleInput={handleBackToInput} />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="input-text" className="font-bold text-[#eee]">
                      Input Text
                    </label>
                    <button
                      onClick={() => setIsLibraryOpen(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <FolderOpen size={14} />
                      Open from Library
                    </button>
                  </div>
                  <FileImport />
                  <div className="relative">
                    <textarea
                      id="input-text"
                      className="w-full h-[200px] p-4 bg-[#444] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y font-mono"
                      placeholder="Paste your text here to begin speed reading..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      aria-describedby="input-help"
                    />
                    {inputText.length > 0 && (
                      <button
                        onClick={() => setInputText('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors backdrop-blur-sm"
                        aria-label="Clear input"
                        title="Clear text"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p id="input-help" className="text-xs text-gray-500">
                      Paste any text to start speed reading with optimal recognition point alignment.
                    </p>
                    {inputText.length > 0 && (
                      <span className="text-xs text-gray-500 font-medium">
                        {tokensLength} {tokensLength === 1 ? 'word' : 'words'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!inputText.trim()}
                  className="w-full py-4 bg-[#007bff] hover:bg-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold rounded-lg transition-colors shadow-sm"
                  aria-label="Start reading"
                >
                  Start Reading
                </button>
              </div>
            )}

            <p className="text-center mt-8 text-[#888] text-sm">
              Optimized for Reduced Saccadic Latency
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <TextPanel />

        {/* Modals */}
        <SettingsModal />
        <SummaryModal
          isOpen={useReaderStore.getState().isSummaryOpen}
          onClose={useReaderStore.getState().toggleSummary}
        />
        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
        <ReadingStatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
        />
        <DocumentLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelectDocument={handleSelectFromLibrary}
          currentText={inputText}
        />
        <PresetProfiles
          isOpen={isPresetsOpen}
          onClose={() => setIsPresetsOpen(false)}
        />

        {/* Onboarding Tutorial */}
        <OnboardingTutorial
          onComplete={() => setShowTutorial(false)}
          forceShow={showTutorial}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
