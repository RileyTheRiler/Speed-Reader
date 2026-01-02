import React, { useState } from 'react';
import { useReaderStore } from './store/useReaderStore';
import { ReaderCanvas } from './components/ReaderCanvas';
import { ControlPanel } from './components/ControlPanel';
import { BookOpen, FileText } from 'lucide-react';

function App() {
  const { tokens, setInputText } = useReaderStore();
  const [showInput, setShowInput] = useState(true);
  const [text, setText] = useState('');

  const handleStart = () => {
    if (!text.trim()) return;
    setInputText(text);
    setShowInput(false);
  };

  const handleBackToInput = () => {
    setShowInput(true);
  };

  // If we have tokens but input view is false, show reader
  const isReading = tokens.length > 0 && !showInput;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-4 font-sans">
      <header className="mb-8 mt-4 flex items-center gap-3">
        <div className="p-2 bg-red-600 rounded-lg">
          <BookOpen size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-200">
          Hypersonic <span className="text-red-500">Reader</span>
        </h1>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
        {isReading ? (
          <div className="w-full animate-fade-in">
            <ReaderCanvas />
            <ControlPanel onToggleInput={handleBackToInput} />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-[#1e1e1e] p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-gray-400" size={20} />
              <h2 className="text-xl font-semibold text-gray-300">Input Text</h2>
            </div>

            <textarea
              className="w-full h-64 bg-[#121212] border border-gray-700 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none font-mono text-sm leading-relaxed"
              placeholder="Paste your text here to begin speed reading..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={handleStart}
                disabled={!text.trim()}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all transform active:scale-95 shadow-lg shadow-red-900/20"
              >
                Start Reading
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-gray-600 text-sm py-6">
        <p>Optimized for Reduced Saccadic Latency</p>
      </footer>
    </div>
  );
}

export default App;
