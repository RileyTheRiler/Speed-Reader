import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { BimodalReader } from './BimodalReader';
import { useReaderStore } from '../store/useReaderStore';

// The global speechSynthesis mock (src/test/setup.ts). speak() is a vi.fn that
// captures the utterance; we drive its callbacks manually to simulate the engine.
const synth = window.speechSynthesis as unknown as {
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
};

describe('BimodalReader (integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useReaderStore.getState().setInputText('Hello world today.');
        useReaderStore.getState().updateSettings({ readingMode: 'bimodal' });
        useReaderStore.setState({ currentIndex: 0, isPlaying: false });
    });

    afterEach(() => {
        act(() => {
            useReaderStore.getState().pause();
        });
        cleanup();
    });

    it('renders all words as clickable spans', () => {
        render(<BimodalReader />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
        // "world" / "today." are rendered too
        expect(screen.getByLabelText('Word 2: world')).toBeInTheDocument();
    });

    it('speaks the current sentence on play and advances the highlight on a word boundary', () => {
        render(<BimodalReader />);

        act(() => {
            useReaderStore.getState().play();
        });

        // The driver asked the engine to speak the current sentence.
        expect(synth.speak).toHaveBeenCalled();
        const utt = synth.speak.mock.calls.at(-1)![0] as { text: string; onboundary: (e: { name: string; charIndex: number }) => void };
        expect(utt.text).toBe('Hello world today.');

        // Simulate the engine reaching the word "world".
        const worldCharIndex = utt.text.indexOf('world');
        act(() => {
            utt.onboundary({ name: 'word', charIndex: worldCharIndex });
        });

        expect(useReaderStore.getState().currentIndex).toBe(1);
        const active = screen.getByRole('button', { current: true });
        expect(active).toHaveTextContent('world');
    });

    it('does not advance the highlight for non-word (sentence) boundaries', () => {
        render(<BimodalReader />);
        act(() => {
            useReaderStore.getState().play();
        });
        const utt = synth.speak.mock.calls.at(-1)![0] as { onboundary: (e: { name: string; charIndex: number }) => void };

        act(() => {
            utt.onboundary({ name: 'sentence', charIndex: 6 });
        });

        // Still on the first word.
        expect(useReaderStore.getState().currentIndex).toBe(0);
    });
});
