import React, { useEffect, useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import {
    Play,
    Pause,
    RotateCcw,
    Type,
    Video,
    SkipBack,
    SkipForward,
    ChevronLeft,
    ChevronRight,
    Maximize,
    Minimize,
    Eye,
    EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';

interface ControlPanelProps {
    onToggleInput: () => void;
}

const formatTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ onToggleInput }) => {
    const {
        isPlaying,
        play,
        pause,
        togglePlay,
        reset,
        wpm,
        setWpm,
        tokens,
        currentIndex,
        isRecording,
        setIsRecording,
        settings,
        updateSettings,
        isFullscreen,
        setIsFullscreen,
        skipForward,
        skipBackward,
        skipToNextSentence,
        skipToPrevSentence,
        getEstimatedTime,
        getRemainingTime,
        getProgress
    } = useReaderStore();

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, [setIsFullscreen]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                setWpm(wpm + 10);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setWpm(wpm - 10);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    skipToPrevSentence();
                } else {
                    skipBackward(5);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    skipToNextSentence();
                } else {
                    skipForward(5);
                }
                break;
            case 'r':
            case 'R':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    reset();
                }
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    toggleFullscreen();
                }
                break;
            case 'Escape':
                if (isFullscreen) {
                    setIsFullscreen(false);
                }
                break;
        }
    }, [togglePlay, setWpm, wpm, skipForward, skipBackward, skipToNextSentence, skipToPrevSentence, reset, isFullscreen, setIsFullscreen, toggleFullscreen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [setIsFullscreen]);

    const progress = getProgress();
    const remainingTime = getRemainingTime();
    const totalTime = getEstimatedTime();

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#2a2a2a] rounded-xl border border-gray-800 shadow-lg mt-6">

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400 bg-[#222] px-4 py-2 rounded-lg">
                <div className="flex items-center gap-4">
                    <span>
                        Word <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{tokens.length}</strong>
                    </span>
                    <span className="text-gray-600">|</span>
                    <span>
                        <strong className="text-white">{progress.toFixed(0)}%</strong> complete
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span>
                        Remaining: <strong className="text-white">{formatTime(remainingTime)}</strong>
                    </span>
                    <span className="text-gray-600">|</span>
                    <span>
                        Total: <strong className="text-white">{formatTime(totalTime)}</strong>
                    </span>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left: Reset & Skip Controls */}
                <div className="flex-1 flex items-center gap-2">
                    <button
                        onClick={reset}
                        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                        title="Reset to Start (R)"
                        aria-label="Reset to start"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <div className="flex items-center bg-gray-800 rounded-full">
                        <button
                            onClick={skipToPrevSentence}
                            className="p-2 hover:bg-gray-700 rounded-l-full text-gray-400 hover:text-white transition-colors"
                            title="Previous Sentence (Shift+Left)"
                            aria-label="Skip to previous sentence"
                        >
                            <SkipBack size={16} />
                        </button>
                        <button
                            onClick={() => skipBackward(5)}
                            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Back 5 Words (Left)"
                            aria-label="Skip back 5 words"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => skipForward(5)}
                            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Forward 5 Words (Right)"
                            aria-label="Skip forward 5 words"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={skipToNextSentence}
                            className="p-2 hover:bg-gray-700 rounded-r-full text-gray-400 hover:text-white transition-colors"
                            title="Next Sentence (Shift+Right)"
                            aria-label="Skip to next sentence"
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>
                </div>

                {/* Center: Play/Pause */}
                <div className="flex-1 flex justify-center">
                    <button
                        onClick={isPlaying ? pause : play}
                        className={clsx(
                            "p-5 rounded-full text-white transition-all shadow-xl hover:scale-105 active:scale-95",
                            isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                        )}
                        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                {/* Right: WPM Display */}
                <div className="flex-1 flex flex-col items-center md:items-end gap-1">
                    <span className="text-4xl md:text-5xl font-bold font-mono text-white tracking-tighter">{wpm}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Words / Min</span>
                </div>
            </div>

            {/* Speed Control */}
            <div className="bg-[#222] p-4 rounded-lg flex items-center gap-4">
                <button
                    onClick={() => setWpm(wpm - 10)}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                    title="Decrease Speed (Down Arrow)"
                    aria-label="Decrease speed by 10 WPM"
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
                    aria-label="Reading speed in words per minute"
                />

                <button
                    onClick={() => setWpm(wpm + 10)}
                    className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                    title="Increase Speed (Up Arrow)"
                    aria-label="Increase speed by 10 WPM"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#222] p-4 rounded-lg">
                <div className="space-y-6">
                    {/* Format Toggle */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Format</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => updateSettings({ aspectRatio: '16:9' })}
                                className={clsx(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    settings.aspectRatio === '16:9' ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-300"
                                )}
                                aria-pressed={settings.aspectRatio === '16:9'}
                            >
                                16:9
                            </button>
                            <button
                                onClick={() => updateSettings({ aspectRatio: '9:16' })}
                                className={clsx(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    settings.aspectRatio === '9:16' ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-300"
                                )}
                                aria-pressed={settings.aspectRatio === '9:16'}
                            >
                                9:16
                            </button>
                        </div>
                    </div>

                    {/* Pause at Sentence End */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Pause at Sentence End</span>
                        <button
                            role="switch"
                            aria-checked={settings.pauseAtEndOfSentence}
                            onClick={() => updateSettings({ pauseAtEndOfSentence: !settings.pauseAtEndOfSentence })}
                            className={clsx(
                                "w-11 h-6 rounded-full transition-colors relative",
                                settings.pauseAtEndOfSentence ? "bg-blue-600" : "bg-gray-600"
                            )}
                        >
                            <div
                                className={clsx(
                                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                                    settings.pauseAtEndOfSentence ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </label>

                    {/* Show Reticle Toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors flex items-center gap-2">
                            {settings.showReticle ? <Eye size={16} /> : <EyeOff size={16} />}
                            Show Reticle Guides
                        </span>
                        <button
                            role="switch"
                            aria-checked={settings.showReticle}
                            onClick={() => updateSettings({ showReticle: !settings.showReticle })}
                            className={clsx(
                                "w-11 h-6 rounded-full transition-colors relative",
                                settings.showReticle ? "bg-blue-600" : "bg-gray-600"
                            )}
                        >
                            <div
                                className={clsx(
                                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                                    settings.showReticle ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </label>

                    {/* Font Size Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Font Size</label>
                            <span className="text-sm text-white font-mono">{settings.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="32"
                            max="128"
                            step="4"
                            value={settings.fontSize}
                            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                            className="w-full accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            aria-label="Font size in pixels"
                        />
                    </div>

                    {/* Colors */}
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Colors</label>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label htmlFor="bg-color-picker" className="text-xs text-gray-400">Background</label>
                                <input
                                    id="bg-color-picker"
                                    type="color"
                                    value={settings.backgroundColor}
                                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                    aria-label="Background color"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="text-color-picker" className="text-xs text-gray-400">Text</label>
                                <input
                                    id="text-color-picker"
                                    type="color"
                                    value={settings.textColor}
                                    onChange={(e) => updateSettings({ textColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                    aria-label="Text color"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="highlight-color-picker" className="text-xs text-gray-400">Highlight</label>
                                <input
                                    id="highlight-color-picker"
                                    type="color"
                                    value={settings.highlightColor}
                                    onChange={(e) => updateSettings({ highlightColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                                    aria-label="Highlight color"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="flex flex-col justify-between gap-4">
                    {/* Keyboard Shortcuts Help */}
                    <div className="text-xs text-gray-500 space-y-1 bg-gray-800/50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-400 mb-2">Keyboard Shortcuts</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Space</kbd> Play/Pause</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">↑↓</kbd> Adjust Speed</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">←→</kbd> Skip ±5 Words</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Shift+←→</kbd> Skip Sentence</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">R</kbd> Reset</p>
                        <p><kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">F</kbd> Fullscreen</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                            title="Toggle Fullscreen (F)"
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                            {isFullscreen ? 'Exit' : 'Fullscreen'}
                        </button>

                        <button
                            onClick={onToggleInput}
                            disabled={isRecording}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50 transition-colors"
                            aria-label="Edit text"
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
                            aria-label={isRecording ? "Recording in progress" : "Export video"}
                        >
                            <Video size={16} />
                            {isRecording ? "Recording..." : "Export Video"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
