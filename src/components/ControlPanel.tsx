import React from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { Play, Pause, RotateCcw, Type, Video } from 'lucide-react';
import { clsx } from 'clsx';

interface ControlPanelProps {
    onToggleInput: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onToggleInput }) => {
    const { isPlaying, play, pause, reset, wpm, setWpm, tokens, isRecording, setIsRecording, settings, updateSettings } = useReaderStore();

    // Remove internal progress calculation as we don't display it here anymore in the old spot.
    // Actually, I moved the progress bar out of `ControlPanel` in the plan?
    // "Move Progress Bar into `ReaderCanvas.tsx` as an overlay at the bottom of the container."
    // Wait, I missed this in the ReaderCanvas update. 
    // I need to add the progress bar to ReaderCanvas first!
    // I will add it to the ReaderCanvas in the NEXT step.
    // For now, I will remove it from here.

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#2a2a2a] rounded-xl border border-gray-800 shadow-lg mt-6">

            {/* Main Controls - Centered Play Button, Big WPM */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left: Stop/Reset */}
                <div className="flex-1 flex justify-start">
                    <button
                        onClick={reset}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                        title="Reset to Start"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                {/* Center: Play/Pause */}
                <div className="flex-1 flex justify-center">
                    <button
                        onClick={isPlaying ? pause : play}
                        className={clsx(
                            "p-5 rounded-full text-white transition-all shadow-xl hover:scale-105 active:scale-95",
                            isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                {/* Right: Big WPM Display */}
                <div className="flex-1 flex flex-col items-center md:items-end gap-1">
                    <span className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tighter">{wpm}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Words / Min</span>
                </div>
            </div>

            {/* Precision Speed Control */}
            <div className="bg-[#222] p-4 rounded-lg flex items-center gap-4">
                <button
                    onClick={() => setWpm(Math.max(100, wpm - 10))}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                >
                    <span className="text-xl font-bold">-</span>
                </button>

                <input
                    type="range"
                    min="100"
                    max="1000"
                    step="10"
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    className="flex-1 accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />

                <button
                    onClick={() => setWpm(Math.min(1000, wpm + 10))}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>

            {/* Toggles & Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#222] p-4 rounded-lg">
                <div className="space-y-6">
                    {/* Aspect Ratio & Pause */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Format</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => updateSettings({ aspectRatio: '16:9' })}
                                className={clsx(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    settings.aspectRatio === '16:9' ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                16:9
                            </button>
                            <button
                                onClick={() => updateSettings({ aspectRatio: '9:16' })}
                                className={clsx(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    settings.aspectRatio === '9:16' ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                9:16
                            </button>
                        </div>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Pause at Sentence End</span>
                        <div
                            className={clsx(
                                "w-11 h-6 rounded-full transition-colors relative",
                                settings.pauseAtEndOfSentence ? "bg-blue-600" : "bg-gray-600"
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

                    {/* Color Settings */}
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Colors</label>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Background</label>
                                <input
                                    type="color"
                                    value={settings.backgroundColor}
                                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Text</label>
                                <input
                                    type="color"
                                    value={settings.textColor}
                                    onChange={(e) => updateSettings({ textColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Highlight</label>
                                <input
                                    type="color"
                                    value={settings.highlightColor}
                                    onChange={(e) => updateSettings({ highlightColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 self-end">
                    <button
                        onClick={onToggleInput}
                        disabled={isRecording}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <Type size={16} />
                        Edit Text
                    </button>

                    <button
                        onClick={() => setIsRecording(true)}
                        disabled={isRecording || tokens.length === 0}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm text-white transition-all font-semibold shadow-lg",
                            isRecording ? "bg-red-900 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20"
                        )}
                    >
                        <Video size={16} />
                        {isRecording ? "Recording..." : "Export Video"}
                    </button>
                </div>
            </div>
        </div>
    );
};
