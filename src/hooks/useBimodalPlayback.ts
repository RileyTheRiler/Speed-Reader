import { useEffect, useRef } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import {
    getTTSProvider,
    buildSpokenSlice,
    charIndexToTokenIndex,
    type SpokenSlice,
} from '../utils/tts';
import { getSentenceRange } from '../utils/sentences';
import { getWordDelay } from '../utils/wordTiming';
import { resolveVoiceURI } from './useVoices';

/**
 * Map WPM to a Web Speech `rate`. 200 wpm ≈ rate 1. We clamp to a sane,
 * intelligible band — and 200–300 wpm (rate 1.0–1.5) is the ADHD "hyper-pacing"
 * sweet spot that occupies the phonological loop and curbs subvocalization.
 */
export const wpmToRate = (wpm: number): number => Math.max(0.5, Math.min(2.5, wpm / 200));

/** If no word-boundary event arrives this soon after speaking, assume the voice
 * doesn't emit them and fall back to an estimated highlight timer. */
const BOUNDARY_WATCHDOG_MS = 450;

/** Cap utterance length (tokens) to dodge Chrome's ~15s long-utterance cutoff
 * for pathological sentences with no terminal punctuation. */
const MAX_SLICE_TOKENS = 40;

/**
 * Headless playback driver for Bimodal reading. Mounted by <BimodalReader />.
 *
 * It bridges the Zustand store and the TTS provider: it speaks the current
 * sentence (one utterance at a time), drives the word highlight from the
 * engine's word-boundary events, and advances sentence-by-sentence. It owns no
 * React state — it subscribes imperatively (like ReaderCanvas) and uses refs,
 * so per-word highlight updates never re-render this hook.
 */
export function useBimodalPlayback(): void {
    const providerRef = useRef(getTTSProvider());

    // Guards / bookkeeping (see comments at each use site).
    const genRef = useRef(0);                 // invalidates stale utterance callbacks
    const internalSeekRef = useRef(false);    // true while WE apply a setCurrentIndex
    const speakingRef = useRef(false);        // an utterance is in flight
    const sliceRef = useRef<SpokenSlice | null>(null);
    const sentenceEndIdxRef = useRef(-1);     // last token index of the spoken slice
    const startTsRef = useRef(0);
    const lastBoundaryAtRef = useRef(0);
    const boundariesSupportedRef = useRef<boolean | null>(null); // null = unknown
    const fallbackTimerRef = useRef<number | null>(null);
    const estTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const provider = providerRef.current;

        const clearFallbackWatchdog = () => {
            if (fallbackTimerRef.current != null) {
                clearTimeout(fallbackTimerRef.current);
                fallbackTimerRef.current = null;
            }
        };
        const clearEstTimer = () => {
            if (estTimerRef.current != null) {
                clearTimeout(estTimerRef.current);
                estTimerRef.current = null;
            }
        };
        const clearAllTimers = () => {
            clearFallbackWatchdog();
            clearEstTimer();
        };

        /** Advance the highlight by our own action without it counting as a seek. */
        const internalSetIndex = (index: number) => {
            internalSeekRef.current = true;
            useReaderStore.getState().setCurrentIndex(index);
        };

        /** Estimated highlight pacing for voices that don't emit boundaries.
         * Steps within the current sentence; sentence advancement is left to onEnd. */
        const startEstimatedTimer = () => {
            clearEstTimer();
            const step = () => {
                const state = useReaderStore.getState();
                if (!state.isPlaying || !speakingRef.current) return;
                if (state.currentIndex >= sentenceEndIdxRef.current) return;

                const token = state.tokens[state.currentIndex];
                // Pace to the *actual* (clamped) audio rate, not raw WPM.
                const effectiveWpm = wpmToRate(state.wpm) * 200;
                const delay = getWordDelay(token, effectiveWpm, {
                    punctuationPause: state.settings.punctuationPause,
                    sentenceWrapUp: state.settings.sentenceWrapUp,
                });

                estTimerRef.current = window.setTimeout(() => {
                    const s = useReaderStore.getState();
                    if (!s.isPlaying || !speakingRef.current) return;
                    internalSetIndex(Math.min(s.currentIndex + 1, sentenceEndIdxRef.current));
                    step();
                }, delay);
            };
            step();
        };

        const handleBoundary = (charIndex: number) => {
            lastBoundaryAtRef.current = performance.now();
            boundariesSupportedRef.current = true;
            clearFallbackWatchdog();
            clearEstTimer(); // real boundaries are authoritative
            const slice = sliceRef.current;
            if (!slice) return;
            const idx = charIndexToTokenIndex(slice, charIndex);
            if (idx !== useReaderStore.getState().currentIndex) {
                internalSetIndex(idx);
            }
        };

        const handleUtteranceEnd = () => {
            speakingRef.current = false;
            clearAllTimers();
            const state = useReaderStore.getState();
            if (!state.isPlaying) return; // ended because we paused/cancelled
            const next = sentenceEndIdxRef.current + 1;
            if (next >= state.tokens.length) {
                state.markCompleted();
            } else {
                internalSetIndex(next);
                speakFromIndex(next);
            }
        };

        const handleError = () => {
            speakingRef.current = false;
            clearAllTimers();
            // Surface a clean stop rather than a frozen highlight.
            useReaderStore.setState({ isPlaying: false });
        };

        /** Speak the sentence starting at `index` (from that word, not necessarily
         * the sentence's first word) as a single utterance. */
        function speakFromIndex(index: number) {
            const { tokens, settings, wpm } = useReaderStore.getState();
            if (tokens.length === 0 || index < 0 || index >= tokens.length) return;

            // Invalidate any in-flight utterance's callbacks BEFORE cancelling, so
            // the cancel-triggered onend/onerror of the old utterance is ignored.
            const myGen = ++genRef.current;
            clearAllTimers();

            const { end: sentenceEnd } = getSentenceRange(tokens, index);
            const cappedEnd = Math.min(sentenceEnd, index + MAX_SLICE_TOKENS - 1, tokens.length - 1);
            const slice = buildSpokenSlice(tokens, index, cappedEnd);

            sliceRef.current = slice;
            sentenceEndIdxRef.current = cappedEnd;
            speakingRef.current = true;
            startTsRef.current = performance.now();

            const voiceURI = resolveVoiceURI(settings.ttsVoiceURI, provider.getVoices());

            provider.speak({
                text: slice.text,
                voiceURI,
                rate: wpmToRate(wpm),
                pitch: settings.ttsPitch,
                onBoundary: (ci) => { if (myGen === genRef.current) handleBoundary(ci); },
                onEnd: () => { if (myGen === genRef.current) handleUtteranceEnd(); },
                onError: () => { if (myGen === genRef.current) handleError(); },
            });

            // Choose fallback strategy based on what we've learned about this voice.
            if (boundariesSupportedRef.current === false) {
                startEstimatedTimer();
            } else if (boundariesSupportedRef.current === null) {
                fallbackTimerRef.current = window.setTimeout(() => {
                    if (speakingRef.current && lastBoundaryAtRef.current < startTsRef.current) {
                        boundariesSupportedRef.current = false;
                        startEstimatedTimer();
                    }
                }, BOUNDARY_WATCHDOG_MS);
            }
        }

        const stopSpeaking = () => {
            genRef.current++; // invalidate in-flight callbacks
            speakingRef.current = false;
            clearAllTimers();
            provider.cancel();
        };

        // If we mount mid-playback (e.g. user switched to bimodal while playing),
        // begin speaking from the current position.
        const initial = useReaderStore.getState();
        if (initial.isPlaying && initial.tokens.length > 0) {
            speakFromIndex(initial.currentIndex);
        }

        const unsub = useReaderStore.subscribe((state, prev) => {
            // Play / pause transitions.
            if (state.isPlaying && !prev.isPlaying) {
                speakFromIndex(state.currentIndex);
            } else if (!state.isPlaying && prev.isPlaying) {
                stopSpeaking();
            }

            // Index changes: distinguish our own boundary-driven updates (ignore)
            // from real external seeks (skip buttons / click-to-jump → re-speak).
            if (state.currentIndex !== prev.currentIndex) {
                if (internalSeekRef.current) {
                    internalSeekRef.current = false;
                } else if (state.isPlaying) {
                    speakFromIndex(state.currentIndex);
                }
            }

            // New text loaded → stop any audio.
            if (state.tokens !== prev.tokens) {
                stopSpeaking();
            }
        });

        return () => {
            unsub();
            stopSpeaking();
        };
        // Mount once: all dynamic values are read via getState(), so no deps needed.
    }, []);
}
