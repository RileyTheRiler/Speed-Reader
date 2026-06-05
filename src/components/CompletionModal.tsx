import React, { useState, useEffect } from 'react';
import { X, Brain, BookCheck, RotateCcw, ArrowRight } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';
import { saveJournalEntry } from '../utils/journal';
import { scheduleReview, createNewItem } from '../utils/spacedRepetition';

interface CompletionModalProps {
    onClose: () => void;
    onRestart: () => void;
    documentId?: string;
    onScheduleReview?: (review: ReturnType<typeof scheduleReview>) => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
    onClose,
    onRestart,
    documentId,
    onScheduleReview,
}) => {
    const { isCompleted, wpm } = useReaderStore(
        useShallow((state) => ({
            isCompleted: state.isCompleted,
            wpm: state.wpm,
        }))
    );

    const [freeRecall, setFreeRecall] = useState('');
    const [rating, setRating] = useState(3);
    const [saved, setSaved] = useState(false);

    // Reset internal state when the modal re-opens for a new reading session
    useEffect(() => {
        if (isCompleted) {
            setFreeRecall('');
            setRating(3);
            setSaved(false);
        }
    }, [isCompleted]);

    if (!isCompleted) return null;

    const ratingLabels = [
        '', // 0 unused
        'Understood almost nothing',
        'Caught a few ideas',
        'Got the main points',
        'Good understanding',
        'Full comprehension',
    ];

    const ratingColors = [
        '',
        'text-red-400',
        'text-orange-400',
        'text-yellow-400',
        'text-green-400',
        'text-emerald-400',
    ];

    const handleSave = () => {
        // Save journal entry
        saveJournalEntry({
            documentId: documentId || 'untitled',
            freeRecall,
            comprehensionRating: rating,
            wpm,
        });

        // Schedule spaced review if callback provided
        if (onScheduleReview) {
            const item = createNewItem();
            const reviewed = scheduleReview(item, rating);
            onScheduleReview(reviewed);
        }

        setSaved(true);
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <BookCheck className="text-emerald-500" size={20} />
                        Reading Complete
                    </h2>
                    <button
                        onClick={handleSkip}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">

                    {!saved ? (
                        <>
                            {/* Free Recall */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="free-recall"
                                    className="text-sm font-medium text-gray-300 flex items-center gap-2"
                                >
                                    <Brain size={16} className="text-purple-400" />
                                    What do you remember?
                                </label>
                                <p className="text-xs text-gray-500">
                                    Retrieval practice is the most effective learning technique — just writing
                                    what you remember strengthens retention more than re-reading.
                                </p>
                                <textarea
                                    id="free-recall"
                                    className="w-full h-[120px] p-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-y text-sm"
                                    placeholder="Write the main ideas, key details, arguments, or anything you recall..."
                                    value={freeRecall}
                                    onChange={(e) => setFreeRecall(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Comprehension Rating */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">
                                    How well did you understand?
                                </label>

                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setRating(n)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                                                rating === n
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 scale-105'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                            }`}
                                            aria-label={`Rate comprehension ${n} out of 5`}
                                            aria-pressed={rating === n}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>

                                <p className={`text-xs text-center font-medium ${ratingColors[rating]}`}>
                                    {ratingLabels[rating]}
                                </p>
                            </div>

                            {/* WPM info */}
                            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                                <span className="text-xs text-gray-500">Reading speed</span>
                                <span className="text-sm font-mono text-white font-semibold">{wpm} WPM</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                                >
                                    <BookCheck size={16} />
                                    Save & Continue
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Saved Confirmation */
                        <div className="text-center py-6 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400">
                                <BookCheck size={32} />
                            </div>
                            <div>
                                <p className="text-white font-semibold">Entry saved!</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {documentId ? 'Review scheduled based on your rating.' : 'Your recall has been recorded.'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onRestart}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    Read Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight size={14} />
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
