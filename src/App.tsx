import { useState } from 'react';
import { useReaderStore } from './store/useReaderStore';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ControlPanel } from './components/ControlPanel';

function App() {
  const { tokens, setInputText } = useReaderStore();
  const [showInput, setShowInput] = useState(true);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 100000; // Limit to 100k characters to prevent DoS

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_CHARS) {
      setError(`Text exceeds maximum limit of ${MAX_CHARS.toLocaleString()} characters.`);
      // Allow them to see the text but maybe warn? Or just truncate?
      // Let's just limit the state update to the max.
      setText(newText.slice(0, MAX_CHARS));
    } else {
      setError(null);
      setText(newText);
    }
  };

  const handleStart = () => {
    if (!text.trim()) return;

    // Basic sanitization: remove potentially dangerous control characters
    // Keep: alphanumeric, punctuation, whitespace, and common symbols
    // Remove: null bytes, control chars (except newlines/tabs)
    // This is defense-in-depth as we render to canvas, but good practice.
    // eslint-disable-next-line no-control-regex
    const sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    setInputText(sanitized);
    setShowInput(false);
  };

  const handleBackToInput = () => {
    setShowInput(true);
  };

  // If we have tokens but input view is false, show reader
  const isReading = tokens.length > 0 && !showInput;

  return (
    <div className="min-h-screen bg-[#222] text-[#eee] font-sans">
      {/* Navigation (Placeholder based on user image) */}
      <nav className="flex justify-center gap-6 py-4 text-gray-400 text-sm">
        <a href="#" className="hover:text-white transition-colors">Home</a>
        <a href="#" className="hover:text-white transition-colors">Settings</a>
        <a href="#" className="hover:text-white transition-colors">About</a>
        <a href="#" className="hover:text-white transition-colors">Profile</a>
      </nav>

      {/* Main Content Area */}
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
        <div className="w-full max-w-[800px] bg-[#333] rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] p-10">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">
            Hypersonic Reader
          </h1>

          {isReading ? (
            <div className="animate-fade-in space-y-6">
              <ReaderCanvas />
              <ControlPanel onToggleInput={handleBackToInput} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-bold text-[#eee]">Input Text</label>
                {error && <div className="mb-2 text-red-400 text-sm">{error}</div>}
                <textarea
                  className="w-full h-[200px] p-4 bg-[#444] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y font-mono"
                  placeholder="Paste your text here to begin speed reading..."
                  value={text}
                  onChange={handleTextChange}
                  maxLength={MAX_CHARS}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!text.trim() || !!error}
                className="w-full py-4 bg-[#007bff] hover:bg-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold rounded-lg transition-colors shadow-sm"
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
    </div>
  );
}

export default App;
