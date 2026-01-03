import React from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { Play, Pause, RotateCcw, Type, Video } from 'lucide-react';
import { clsx } from 'clsx';

interface ControlPanelProps {
    onToggleInput: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onToggleInput }) => {
    const { isPlaying, play, pause, reset, wpm, setWpm, currentIndex, tokens, isRecording, setIsRecording, settings, updateSettings } = useReaderStore();

    const progress = tokens.length > 0 ? (currentIndex / tokens.length) * 100 : 0;

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-6 bg-[#2a2a2a] rounded-xl border border-gray-800 shadow-lg mt-6">

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-red-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={isPlaying ? pause : play}
                        className={clsx(
                            "p-4 rounded-full text-white transition-colors shadow-lg",
                            isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={reset}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-4xl font-bold font-mono text-white">{wpm}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Words Per Minute</span>
                </div>
            </div>

            {/* Sliders & Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#222] p-4 rounded-lg">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex justify-between text-sm text-gray-400">
                            <span>Speed</span>
                            <span>{wpm} wpm</span>
                        </label>
                        <input
                            type="range"
                            min="100"
                            max="1000"
                            step="10"
                            value={wpm}
                            onChange={(e) => setWpm(Number(e.target.value))}
                            className="w-full accent-red-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Pause at Sentence End</span>
                        <div
                            className={clsx(
                                "w-11 h-6 rounded-full transition-colors relative",
                                settings.pauseAtEndOfSentence ? "bg-red-600" : "bg-gray-600"
                            )}
                            onClick={() => updateSettings({ pauseAtEndOfSentence: !settings.pauseAtEndOfSentence })}
                        >
                            <div
                                className={clsx(
                                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                                    settings.pauseAtEndOfSentence ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </div>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 self-end">
                    <button
                        onClick={onToggleInput}
                        disabled={isRecording}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 disabled:opacity-50"
                    >
                        <Type size={16} />
                        Edit Text
                    </button>

                    <button
                        onClick={() => setIsRecording(true)}
                        disabled={isRecording || tokens.length === 0}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-colors",
                            isRecording ? "bg-red-900 animate-pulse" : "bg-red-700 hover:bg-red-600"
                        )}
                    >
                        <Video size={16} />
                        {isRecording ? "Rec..." : "Export"}
                    </button>
                </div>
            </div>
        </div>
    );
};
