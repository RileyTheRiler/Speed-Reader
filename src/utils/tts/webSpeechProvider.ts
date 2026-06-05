/**
 * Browser-native TTS provider built on the Web Speech API
 * (window.speechSynthesis + SpeechSynthesisUtterance).
 *
 * It emits word-level boundary events natively, which is exactly what bimodal
 * reading needs for strict word-level highlight synchronization — for free,
 * with no API key or backend.
 */

import type { SpeakOptions, TTSProvider, TTSVoice } from './types';

const toTTSVoice = (v: SpeechSynthesisVoice): TTSVoice => ({
    voiceURI: v.voiceURI,
    name: v.name,
    lang: v.lang,
    default: v.default,
    localService: v.localService,
});

export class WebSpeechProvider implements TTSProvider {
    private get synth(): SpeechSynthesis | undefined {
        return typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    }

    isSupported(): boolean {
        return (
            typeof window !== 'undefined' &&
            'speechSynthesis' in window &&
            'SpeechSynthesisUtterance' in window
        );
    }

    getVoices(): TTSVoice[] {
        const synth = this.synth;
        if (!synth) return [];
        return synth.getVoices().map(toTTSVoice);
    }

    onVoicesReady(cb: (voices: TTSVoice[]) => void): () => void {
        const synth = this.synth;
        if (!synth) {
            cb([]);
            return () => {};
        }

        const existing = synth.getVoices();
        if (existing.length > 0) {
            cb(existing.map(toTTSVoice));
            // Still listen for late updates (some engines add voices over time).
        }

        const handler = () => cb(synth.getVoices().map(toTTSVoice));
        synth.addEventListener('voiceschanged', handler);
        return () => synth.removeEventListener('voiceschanged', handler);
    }

    speak(options: SpeakOptions): void {
        const synth = this.synth;
        if (!synth) {
            options.onError?.(new Error('speechSynthesis unavailable'));
            return;
        }

        // Never queue: cancel any in-flight utterance first.
        synth.cancel();

        const u = new SpeechSynthesisUtterance(options.text);
        u.rate = options.rate;
        u.pitch = options.pitch;
        u.volume = options.volume ?? 1;

        if (options.voiceURI) {
            const match = synth.getVoices().find((v) => v.voiceURI === options.voiceURI);
            if (match) {
                u.voice = match;
                u.lang = match.lang;
            }
        }

        if (options.onBoundary) {
            u.onboundary = (e: SpeechSynthesisEvent) => {
                // Only word boundaries drive word-level highlighting.
                if (e.name && e.name !== 'word') return;
                options.onBoundary!(e.charIndex, e.charLength);
            };
        }
        if (options.onStart) u.onstart = () => options.onStart!();
        if (options.onEnd) u.onend = () => options.onEnd!();
        u.onerror = (e: SpeechSynthesisErrorEvent) => {
            // "interrupted"/"canceled" are expected when we cancel() to seek; ignore.
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            options.onError?.(e);
        };

        synth.speak(u);
    }

    pause(): void {
        this.synth?.pause();
    }

    resume(): void {
        this.synth?.resume();
    }

    cancel(): void {
        this.synth?.cancel();
    }
}
