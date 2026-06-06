/**
 * Text-to-Speech provider abstraction.
 *
 * Bimodal reading speaks the text aloud while highlighting the exact word
 * being spoken. We hide the concrete speech engine behind this interface so
 * the current browser-native engine (Web Speech API) can later be swapped for
 * a cloud generative-voice provider (e.g. Speechify / ElevenLabs / Azure
 * Neural) without touching the component or the playback driver.
 */

export interface TTSVoice {
    voiceURI: string;
    name: string;
    lang: string;
    default: boolean;
    localService: boolean;
}

export interface SpeakOptions {
    /** The exact string to speak. Boundary char indices are offsets into THIS string. */
    text: string;
    /** Selected voice; empty/undefined => engine default. */
    voiceURI?: string;
    /** Playback rate. ~1 is normal; we map WPM => rate (clamped 0.5–2.5). */
    rate: number;
    /** Voice pitch, 0–2, default 1. */
    pitch: number;
    /** Volume 0–1, default 1. */
    volume?: number;
    /**
     * Fires as each word boundary is reached. `charIndex` is an offset into
     * `text`; `charLength` is omitted by some engines, so callers must not
     * depend on it.
     */
    onBoundary?: (charIndex: number, charLength?: number) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
}

export interface TTSProvider {
    /** Whether this engine is usable in the current environment. */
    isSupported(): boolean;
    /** Speak one utterance. Returns immediately; progress arrives via callbacks. */
    speak(options: SpeakOptions): void;
    pause(): void;
    resume(): void;
    cancel(): void;
    getVoices(): TTSVoice[];
    /**
     * Invoke `cb` once voices are available (the Web Speech voice list is often
     * empty until the async `voiceschanged` event). Calls back immediately if
     * voices already exist. Returns an unsubscribe function.
     */
    onVoicesReady(cb: (voices: TTSVoice[]) => void): () => void;
}
