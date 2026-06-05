import React, { useState, useMemo } from 'react';
import { X, Eye, Brain, ArrowRight } from 'lucide-react';
import { analyzeReadability } from '../utils/readability';

interface PreviewModalProps {
    text: string;
    onClose: () => void;
    onStartReading: () => void;
}

/**
 * Pre-reading preview — activates prior knowledge (schema activation).
 *
 * Shows a text outline (first sentence of each paragraph) and prompts
 * the user with "What do you already know about this topic?" to prime
 * their working memory before reading begins.
 *
 * Evidence: Prior knowledge activation is a well-established comprehension
 * strategy (Pressley & Afflerbach, 1995; Anderson & Pearson, 1984).
 * It helps the reader build mental models faster during reading.
 */
export const PreviewModal: React.FC<PreviewModalProps> = ({
    text,
    onClose,
    onStartReading,
}) => {
    const [priorKnowledge, setPriorKnowledge] = useState('');

    // Extract first sentence of each paragraph as an outline
    const outline = useMemo(() => {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        return paragraphs.map(p => {
            const trimmed = p.trim();
            // Get first sentence (split on .!? followed by space or end)
            const match = trimmed.match(/^[^.!?]*[.!?]/);
            return match ? match[0].trim() : trimmed.slice(0, 100) + (trimmed.length > 100 ? '…' : '');
        }).slice(0, 8); // Max 8 paragraphs in preview
    }, [text]);

    const readability = useMemo(() => analyzeReadability(text), [text]);

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedMinutes = Math.max(1, Math.round(wordCount / readability.suggestedWpm));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Eye className="text-blue-400" size={20} />
                        Preview & Prepare
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                    {/* Text Stats */}
                    <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                        <div className="flex-1">
                            <span className="text-xs text-gray-500">Length</span>
                            <p className="text-sm text-white font-medium">{wordCount.toLocaleString()} words · ~{estimatedMinutes} min</p>
                        </div>
                        <div className="flex-1">
                            <span className="text-xs text-gray-500">Difficulty</span>
                            <p className="text-sm text-white font-medium flex items-center gap-1.5">
                                <span className={`inline-block w-2 h-2 rounded-full ${
                                    readability.badge === 'Easy' ? 'bg-emerald-400' :
                                    readability.badge === 'Moderate' ? 'bg-yellow-400' :
                                    readability.badge === 'Challenging' ? 'bg-orange-400' : 'bg-red-400'
                                }`} />
                                {readability.badge} · Grade {readability.gradeLevel}
                            </p>
                        </div>
                    </div>

                    {/* Text Outline */}
                    {outline.length > 1 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Text Outline
                            </h3>
                            <div className="space-y-1.5">
                                {outline.map((sentence, i) => (
                                    <div key={i} className="flex gap-2 text-xs">
                                        <span className="text-gray-600 font-mono shrink-0 mt-0.5">{i + 1}.</span>
                                        <span className="text-gray-300 leading-relaxed">{sentence}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prior Knowledge Activation */}
                    <div className="space-y-2">
                        <label
                            htmlFor="prior-knowledge"
                            className="text-sm font-medium text-gray-300 flex items-center gap-2"
                        >
                            <Brain size={16} className="text-blue-400" />
                            What do you already know about this topic?
                        </label>
                        <p className="text-xs text-gray-500">
                            Activating prior knowledge helps you connect new information to what you already understand.
                        </p>
                        <textarea
                            id="prior-knowledge"
                            className="w-full h-[80px] p-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y text-sm"
                            placeholder="What comes to mind about this topic? Any related concepts, experiences, or questions..."
                            value={priorKnowledge}
                            onChange={(e) => setPriorKnowledge(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                    >
                        Skip Preview
                    </button>
                    <button
                        onClick={onStartReading}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={16} />
                        Start Reading
                    </button>
                </div>
            </div>
        </div>
    );
};
