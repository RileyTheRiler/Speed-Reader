import React, { useMemo } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { TokenSpan } from './TokenSpan';
import { useBimodalPlayback } from '../hooks/useBimodalPlayback';
import { useVoices } from '../hooks/useVoices';
import { getTTSProvider } from '../utils/tts';
import { getSentenceRange } from '../utils/sentences';
import { Volume2, AlertTriangle } from 'lucide-react';

/**
 * Bimodal reading view: the full text is displayed and read aloud while the
 * exact spoken word is highlighted in real time (strict word-level sync). When
 * "Line Focus" is on, sentences other than the one being read are dimmed to
 * reduce visual distraction (Immersive Reader style). Click any word to jump.
 */
export const BimodalReader: React.FC = () => {
    // Mount the headless playback driver (speech engine ↔ store bridge).
    useBimodalPlayback();

    const tokens = useReaderStore((s) => s.tokens);
    const currentIndex = useReaderStore((s) => s.currentIndex);
    const settings = useReaderStore((s) => s.settings);
    const setCurrentIndex = useReaderStore((s) => s.setCurrentIndex);
    const play = useReaderStore((s) => s.play);
    const updateSettings = useReaderStore((s) => s.updateSettings);

    const voices = useVoices();
    const ttsSupported = useMemo(() => getTTSProvider().isSupported(), []);

    const { backgroundColor, textColor, fontFamily, ttsLineFocus, highlightColor } = settings;

    // Range of the sentence currently being read (for Line Focus dimming).
    const range = useMemo(() => getSentenceRange(tokens, currentIndex), [tokens, currentIndex]);

    const handleTokenClick = (index: number) => {
        setCurrentIndex(index);
        play();
    };

    const fontStack = fontFamily === 'serif' ? 'font-serif'
        : fontFamily === 'mono' ? 'font-mono' : 'font-sans';
    const dysFont = fontFamily === 'dyslexic' ? 'OpenDyslexic' : undefined;

    if (tokens.length === 0) {
        return (
            <div
                className="w-full max-w-4xl mx-auto rounded-xl border border-[#444] shadow-xl flex items-center justify-center h-[500px]"
                style={{ backgroundColor, color: textColor }}
            >
                <span className="text-lg opacity-50">No text loaded</span>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-4xl mx-auto rounded-xl border border-[#444] shadow-xl flex flex-col h-[500px]"
            style={{ backgroundColor, color: textColor }}
            role="region"
            aria-label="Bimodal reading: text read aloud with synchronized highlighting"
        >
            {/* Top bar: quick voice + Line Focus controls */}
            <div className="p-3 border-b border-[#444] bg-black/20 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                    <Volume2 size={16} /> Read Aloud
                </span>

                <label className="sr-only" htmlFor="bimodal-voice">Voice</label>
                <select
                    id="bimodal-voice"
                    value={settings.ttsVoiceURI}
                    onChange={(e) => updateSettings({ ttsVoiceURI: e.target.value })}
                    disabled={!ttsSupported || voices.length === 0}
                    className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none max-w-[220px] disabled:opacity-50"
                    title="Choose a voice"
                >
                    <option value="">Auto (default voice)</option>
                    {voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => updateSettings({ ttsLineFocus: !ttsLineFocus })}
                    className={`ml-auto text-xs px-3 py-1 rounded-full border transition-colors ${
                        ttsLineFocus
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-transparent text-gray-300 border-gray-600 hover:bg-white/10'
                    }`}
                    role="switch"
                    aria-checked={ttsLineFocus}
                    title="Dim sentences other than the one being read"
                >
                    Line Focus {ttsLineFocus ? 'On' : 'Off'}
                </button>
            </div>

            {!ttsSupported && (
                <div className="px-4 py-2 bg-amber-900/40 text-amber-200 text-xs flex items-center gap-2 border-b border-amber-800/40">
                    <AlertTriangle size={14} />
                    Audio isn't available in this browser, but you can still read and click words to navigate.
                </div>
            )}

            {/* Text with synchronized highlighting */}
            <div
                className={`flex-1 overflow-y-auto p-6 leading-loose text-lg ${fontStack}`}
                style={{ fontFamily: dysFont }}
            >
                <div className="flex flex-wrap gap-1" role="list" aria-label="Words">
                    {tokens.map((token, index) => (
                        <TokenSpan
                            key={token.id}
                            token={token}
                            index={index}
                            isActive={index === currentIndex}
                            onTokenClick={handleTokenClick}
                            sentenceDimmed={ttsLineFocus && (index < range.start || index > range.end)}
                            activeColor={highlightColor}
                        />
                    ))}
                </div>
            </div>

            <div className="p-3 border-t border-[#444] bg-black/20 text-xs opacity-50">
                Click any word to jump and read aloud from there. Tip: 200–300 WPM keeps focus and reduces subvocalization.
            </div>
        </div>
    );
};
