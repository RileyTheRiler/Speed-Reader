import React, { useState } from 'react';
import { X, Sparkles, Key, Loader2, Copy, Check } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { generateSummary } from '../utils/llmService';

export const SummaryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const {
        apiKey,
        setApiKey,
        inputText,
        summary,
        setSummary,
        isGeneratingSummary,
        setIsGeneratingSummary
    } = useReaderStore();

    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleSaveKey = () => {
        if (inputKey.trim().length > 0) {
            setApiKey(inputKey.trim());
        }
    };

    const handleGenerate = async () => {
        if (!apiKey || !inputText) return;

        setIsGeneratingSummary(true);
        setError(null);
        try {
            const result = await generateSummary(inputText, apiKey);
            setSummary(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate summary";
            setError(errorMessage);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="summary-title"
                className="bg-[#1a1a1a] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#222]">
                    <h2 id="summary-title" className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-purple-500" />
                        Auto-Summary
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        aria-label="Close summary"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* API Key Input */}
                    {!apiKey ? (
                        <div className="space-y-4">
                            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                                <p className="text-sm text-blue-200">
                                    To use AI summarization, you need a Google Gemini API Key.
                                    This key is stored locally in your browser.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">API Key</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="password"
                                            value={inputKey}
                                            onChange={(e) => setInputKey(e.target.value)}
                                            placeholder="Enter your Gemini API Key"
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveKey}
                                        disabled={!inputKey}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a>
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Generate / View Summary
                        <div className="space-y-6">
                            {!summary && !isGeneratingSummary && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                                        <Sparkles size={32} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Ready to Summarize</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Generate a concise summary of your current text ({inputText.split(' ').length} words).
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-900/20 flex items-center gap-2 mx-auto"
                                    >
                                        <Sparkles size={18} />
                                        Generate Summary
                                    </button>
                                </div>
                            )}

                            {isGeneratingSummary && (
                                <div className="text-center py-12 space-y-4">
                                    <Loader2 size={40} className="text-purple-500 animate-spin mx-auto" />
                                    <p className="text-gray-300 animate-pulse">Analyzing text...</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-red-200 text-sm text-center">
                                    {error}
                                    <button
                                        onClick={handleGenerate}
                                        className="block mx-auto mt-2 text-red-400 hover:text-red-300 underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {summary && !isGeneratingSummary && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-[#111] border border-gray-800 rounded-lg p-5 relative group">
                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-3 right-3 p-2 rounded-lg bg-[#222] text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        </button>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => setApiKey(null)}
                                            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            Reset API Key
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                                        >
                                            <RotateCcw size={14} /> Regenerate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { RotateCcw } from 'lucide-react';
