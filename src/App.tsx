import { useEffect, useState, useCallback } from 'react';
import { useReaderStore } from './store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ControlPanel } from './components/ControlPanel';
import { TextPanel } from './components/TextPanel';
import { SettingsModal } from './components/SettingsModal';
import { FileImport } from './components/FileImport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DocumentLibrary } from './components/DocumentLibrary';
import { CompletionModal } from './components/CompletionModal';
import { PreviewModal } from './components/PreviewModal';
import {
  FolderOpen
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
    isCompleted,
    reset,
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
          isCompleted: state.isCompleted,
          reset: state.reset,
      }))
  );

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleStart = () => {
    if (!inputText.trim()) return;
    // Show preview for substantial text (>100 words)
    const wordCount = inputText.trim().split(/\s+/).length;
    if (wordCount > 100) {
      setShowPreview(true);
    } else {
      setShowInput(false);
    }
  };

  const handlePreviewStart = useCallback(() => {
    setShowPreview(false);
    setShowInput(false);
  }, [setShowInput]);

  const handlePreviewClose = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleBackToInput = useCallback(() => {
    setShowInput(true);
  }, [setShowInput]);

  const handleCompletionClose = useCallback(() => {
    useReaderStore.setState({ isCompleted: false });
  }, []);

  const handleRestart = useCallback(() => {
    useReaderStore.setState({ isCompleted: false });
    reset();
  }, [reset]);

  const handleSelectFromLibrary = (content: string, position?: number) => {
    setInputText(content);
    if (position && position > 0) {
      setTimeout(() => {
        setCurrentIndex(position);
      }, 100);
    }
    setShowInput(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        if (isZenMode) {
          toggleZenMode();
        }
        setIsLibraryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, toggleZenMode]);

  const isReading = tokensLength > 0 && !showInput;

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
        </nav>

        {/* Main Content Area */}
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
          <div className="w-full max-w-[800px] bg-[#333] rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-white">
              Quickie Read
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
                  <textarea
                    id="input-text"
                    className="w-full h-[200px] p-4 bg-[#444] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y font-mono"
                    placeholder="Paste your text here to begin speed reading..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    aria-describedby="input-help"
                  />
                  <p id="input-help" className="text-xs text-gray-500 mt-1">
                    Paste any text to start speed reading with optimal recognition point alignment.
                  </p>
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
        <DocumentLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onSelectDocument={handleSelectFromLibrary}
          currentText={inputText}
        />
        {isCompleted && (
          <CompletionModal
            onClose={handleCompletionClose}
            onRestart={handleRestart}
          />
        )}
        {showPreview && (
          <PreviewModal
            text={inputText}
            onClose={handlePreviewClose}
            onStartReading={handlePreviewStart}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
