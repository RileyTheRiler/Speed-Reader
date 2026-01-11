import { useReaderStore } from './store/useReaderStore';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ControlPanel } from './components/ControlPanel';
import { TextPanel } from './components/TextPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const {
    tokens,
    inputText,
    setInputText,
    showInput,
    setShowInput,
    isSidePanelOpen,
    toggleSidePanel
  } = useReaderStore();

  const handleStart = () => {
    if (!inputText.trim()) return;
    setShowInput(false);
  };

  const handleBackToInput = () => {
    setShowInput(true);
  };

  const isReading = tokens.length > 0 && !showInput;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#222] text-[#eee] font-sans">
        {/* Navigation */}
        <nav className="flex justify-center gap-4 md:gap-6 py-4 text-gray-400 text-sm">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Settings</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Profile</a>
        </nav>

        {/* Main Content Area */}
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
          <div className="w-full max-w-[800px] bg-[#333] rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-white">
              Hypersonic Reader
            </h1>

            {isReading ? (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={toggleSidePanel}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                    aria-label={isSidePanelOpen ? 'Hide text panel' : 'Show text panel'}
                  >
                    {isSidePanelOpen ? 'Hide Text Panel' : 'Show Text Panel'}
                  </button>
                </div>
                <ReaderCanvas />
                <ControlPanel onToggleInput={handleBackToInput} />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="input-text" className="block mb-2 font-bold text-[#eee]">
                    Input Text
                  </label>
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
        <TextPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;
