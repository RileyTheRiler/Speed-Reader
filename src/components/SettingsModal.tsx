import React from 'react';
import { X, Eye, Zap, BookOpen, Layers, Accessibility } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { clsx } from 'clsx';
import { SettingToggle } from './ui/SettingToggle';

export const SettingsModal: React.FC = () => {
    const {
        isSettingsOpen,
        toggleSettings,
        settings,
        updateSettings
    } = useReaderStore();

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#222]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-blue-500" />
                        Reader Settings
                    </h2>
                    <button
                        onClick={toggleSettings}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        aria-label="Close settings"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Section: Reading Mode */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={16} /> Reading Experience
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mode Selection */}
                            <div className="col-span-full bg-gray-800/50 p-4 rounded-lg space-y-3">
                                <label className="text-sm text-gray-300 font-medium">Reading Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => updateSettings({ readingMode: 'rsvp' })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-transparent transition-all",
                                            settings.readingMode === 'rsvp'
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                        )}
                                    >
                                        <Eye size={18} />
                                        RSVP (Speed)
                                    </button>
                                    <button
                                        onClick={() => updateSettings({ readingMode: 'pacer' })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-transparent transition-all",
                                            settings.readingMode === 'pacer'
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                        )}
                                    >
                                        <BookOpen size={18} />
                                        Highlighter (Pacer)
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {settings.readingMode === 'rsvp'
                                        ? "Rapid Serial Visual Presentation: Words flash one by one."
                                        : "Full text view with a moving highlight guide."}
                                </p>
                            </div>

                            {/* RSVP Options */}
                            {settings.readingMode === 'rsvp' && (
                                <>
                                    <SettingToggle
                                        label="Peripheral Trainer"
                                        description="Show previous & next words faded out"
                                        checked={settings.peripheralMode}
                                        onChange={(v) => updateSettings({ peripheralMode: v })}
                                    />
                                    <SettingToggle
                                        label="Smart Chunking"
                                        description="Group words by natural phrasing"
                                        checked={settings.smartChunking}
                                        onChange={(v) => updateSettings({ smartChunking: v })}
                                    />
                                </>
                            )}
                        </div>
                    </section>

                    {/* Section: Color Themes */}
                    <section className="space-y-4 pt-6 border-t border-gray-800">
                        <h3 id="theme-heading" className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={16} /> Color Theme
                        </h3>
                        <div
                            role="radiogroup"
                            aria-labelledby="theme-heading"
                            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                        >
                            {[
                                { name: 'Midnight', bg: '#1a1a1a', text: '#e5e5e5', highlight: '#ff4444' },
                                { name: 'Paper', bg: '#f5f5f5', text: '#333333', highlight: '#d32f2f' },
                                { name: 'Solar', bg: '#002b36', text: '#839496', highlight: '#b58900' },
                                { name: 'Hi-Contrast', bg: '#000000', text: '#ffff00', highlight: '#ff00ff' },
                            ].map((theme) => {
                                const isSelected = settings.backgroundColor === theme.bg;
                                return (
                                    <button
                                        key={theme.name}
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => updateSettings({
                                            backgroundColor: theme.bg,
                                            textColor: theme.text,
                                            highlightColor: theme.highlight
                                        })}
                                        className={clsx(
                                            "p-2 rounded-lg border transition-all bg-[#444] flex flex-col items-center gap-1 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                            isSelected
                                                ? "border-blue-500 ring-2 ring-blue-500/20"
                                                : "border-[#555] hover:border-[#777]"
                                        )}
                                        aria-label={theme.name}
                                    >
                                        <div
                                            className="w-full h-8 rounded border border-white/10 relative overflow-hidden"
                                            style={{ backgroundColor: theme.bg }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs" style={{ color: theme.text }}>
                                                Abc
                                            </div>
                                        </div>
                                        <span className={clsx(
                                            "text-xs group-hover:text-white transition-colors",
                                            isSelected ? "text-white font-medium" : "text-gray-300"
                                        )}>
                                            {theme.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section: Accessibility & Typography */}
                    <section className="space-y-4 pt-6 border-t border-gray-800">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Accessibility size={16} /> Accessibility
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Font Family */}
                            <div className="col-span-full md:col-span-1 bg-gray-800/30 p-4 rounded-lg space-y-3">
                                <label htmlFor="font-family-select" className="text-sm text-gray-300 font-medium">Typeface</label>
                                <select
                                    id="font-family-select"
                                    value={settings.fontFamily}
                                    onChange={(e) => updateSettings({ fontFamily: e.target.value as 'sans' | 'serif' | 'mono' | 'dyslexic' })}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                                >
                                    <option value="sans">Sans Serif (Inter)</option>
                                    <option value="serif">Serif (Merriweather)</option>
                                    <option value="mono">Monospace (JetBrains)</option>
                                    <option value="dyslexic">OpenDyslexic</option>
                                </select>
                            </div>

                            {/* Bionic Reading */}
                            <SettingToggle
                                label="Bionic Reading"
                                description="Bold initial letters for focus"
                                checked={settings.bionicReading}
                                onChange={(v) => updateSettings({ bionicReading: v })}
                            />
                        </div>
                    </section>

                    {/* Section: Tools */}
                    <section className="space-y-4 pt-6 border-t border-gray-800">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={16} /> Tools
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingToggle
                                label="Smart Rewind"
                                description="Rewind 5 words when pausing"
                                checked={settings.smartRewind}
                                onChange={(v) => updateSettings({ smartRewind: v })}
                            />
                            <SettingToggle
                                label="Punctuation Pausing"
                                description="Pause slightly at periods & commas"
                                checked={settings.punctuationPause}
                                onChange={(v) => updateSettings({ punctuationPause: v })}
                            />
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-[#222] flex justify-end">
                    <button
                        onClick={toggleSettings}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
