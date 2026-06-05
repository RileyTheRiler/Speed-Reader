import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSpeechProvider } from './webSpeechProvider';

// Typed access to the global mock defined in src/test/setup.ts
const synth = window.speechSynthesis as unknown as {
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    getVoices: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
};

describe('WebSpeechProvider', () => {
    let provider: WebSpeechProvider;

    beforeEach(() => {
        vi.clearAllMocks();
        provider = new WebSpeechProvider();
    });

    it('reports support when the Web Speech globals exist', () => {
        expect(provider.isSupported()).toBe(true);
    });

    it('maps the engine voices to TTSVoice objects', () => {
        const voices = provider.getVoices();
        expect(voices).toHaveLength(2);
        expect(voices[0]).toMatchObject({ voiceURI: 'en-US-1', lang: 'en-US', default: true });
    });

    it('speak() cancels any prior utterance and speaks a configured utterance', () => {
        const onBoundary = vi.fn();
        const onEnd = vi.fn();

        provider.speak({
            text: 'Hello world.',
            voiceURI: 'en-GB-1',
            rate: 1.5,
            pitch: 1.2,
            onBoundary,
            onEnd,
        });

        expect(synth.cancel).toHaveBeenCalled();
        expect(synth.speak).toHaveBeenCalledTimes(1);

        const utt = synth.speak.mock.calls[0][0];
        expect(utt.text).toBe('Hello world.');
        expect(utt.rate).toBe(1.5);
        expect(utt.pitch).toBe(1.2);
        expect(utt.voice).toMatchObject({ voiceURI: 'en-GB-1' });
    });

    it('forwards only word boundary events to onBoundary', () => {
        const onBoundary = vi.fn();
        provider.speak({ text: 'Hello world.', rate: 1, pitch: 1, onBoundary });
        const utt = synth.speak.mock.calls[0][0];

        utt.onboundary({ name: 'word', charIndex: 6 });
        utt.onboundary({ name: 'sentence', charIndex: 0 });

        expect(onBoundary).toHaveBeenCalledTimes(1);
        expect(onBoundary).toHaveBeenCalledWith(6, undefined);
    });

    it('wires onEnd through to the caller', () => {
        const onEnd = vi.fn();
        provider.speak({ text: 'Hi.', rate: 1, pitch: 1, onEnd });
        const utt = synth.speak.mock.calls[0][0];
        utt.onend();
        expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('onVoicesReady calls back immediately when voices exist and unsubscribes cleanly', () => {
        const cb = vi.fn();
        const unsub = provider.onVoicesReady(cb);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0]).toHaveLength(2);
        expect(synth.addEventListener).toHaveBeenCalledWith('voiceschanged', expect.any(Function));

        unsub();
        expect(synth.removeEventListener).toHaveBeenCalledWith('voiceschanged', expect.any(Function));
    });

    it('delegates pause / resume / cancel to the engine', () => {
        provider.pause();
        provider.resume();
        provider.cancel();
        expect(synth.pause).toHaveBeenCalled();
        expect(synth.resume).toHaveBeenCalled();
        expect(synth.cancel).toHaveBeenCalled();
    });
});
