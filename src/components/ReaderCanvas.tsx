import { useRef, useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useReaderStore } from '../store/useReaderStore';

export const ReaderCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const accumulatorRef = useRef<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Optimized: Select only stable state, exclude currentIndex to prevent re-renders on every word
    const {
        tokens,
        isPlaying,
        isRecording,
        settings,
        play,
        reset,
        setIsRecording
    } = useReaderStore(
        useShallow((state) => ({
            tokens: state.tokens,
            isPlaying: state.isPlaying,
            isRecording: state.isRecording,
            settings: state.settings,
            play: state.play,
            reset: state.reset,
            setIsRecording: state.setIsRecording,
        }))
    );

    // Start Recording Helper
    const startRecording = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const stream = canvas.captureStream(60);

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        try {
            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000
            });

            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (blob.size === 0) return;

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `hypersonic-read-${new Date().getTime()}.webm`;
                document.body.appendChild(a);
                a.click();

                // Clean up with proper error handling
                setTimeout(() => {
                    try {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } catch {
                        // Element may already be removed
                    }
                }, 100);

                setIsRecording(false);
            };

            recorder.onerror = () => {
                console.error("Recording error occurred");
                setIsRecording(false);
            };

            recorder.start();
        } catch (e) {
            console.error("Failed to start recording:", e);
            setIsRecording(false);
        }
    }, [setIsRecording]);

    // Handle Recording State Changes
    useEffect(() => {
        if (isRecording) {
            reset();
            const timeout = setTimeout(() => {
                startRecording();
                play();
            }, 300);
            return () => clearTimeout(timeout);
        } else {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }
    }, [isRecording, reset, play, startRecording]);

    // Draw Reticle Guide
    const drawReticle = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, fontSize: number) => {
        if (!settings.showReticle) return;

        // Context Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const boxHeight = fontSize * 3;
        ctx.fillRect(0, centerY - (boxHeight / 2), width, boxHeight);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';

        const gap = 35;
        const length = 25;
        const crossWidth = 20;

        // Top Guide
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - gap - length);
        ctx.lineTo(centerX, centerY - gap);
        ctx.moveTo(centerX - crossWidth, centerY - gap - length);
        ctx.lineTo(centerX + crossWidth, centerY - gap - length);
        ctx.stroke();

        // Bottom Guide
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + gap);
        ctx.lineTo(centerX, centerY + gap + length);
        ctx.moveTo(centerX - crossWidth, centerY + gap + length);
        ctx.lineTo(centerX + crossWidth, centerY + gap + length);
        ctx.stroke();
    }, [settings.showReticle]);

    // Font mapping helper
    const getFontStack = useCallback((family: string) => {
        switch (family) {
            case 'serif': return '"Merriweather", "Times New Roman", serif';
            case 'mono': return '"JetBrains Mono", "Courier New", monospace';
            case 'dyslexic': return '"OpenDyslexic", "Comic Sans MS", sans-serif';
            case 'sans':
            default: return '"Inter", system-ui, sans-serif';
        }
    }, []);

    // Bionic Reading Helper
    const drawBionicText = useCallback((ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, baseFont: string) => {
        if (!settings.bionicReading || text.length < 2) {
            ctx.font = baseFont;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            return ctx.measureText(text).width;
        }

        // Split word: First 40-50% bold
        const splitIndex = Math.ceil(text.length * 0.4);
        const boldPart = text.substring(0, splitIndex);
        const normalPart = text.substring(splitIndex);

        // Draw Bold Part
        ctx.font = `bold ${baseFont}`;
        ctx.fillStyle = color;
        ctx.fillText(boldPart, x, y);
        const boldWidth = ctx.measureText(boldPart).width;

        // Draw Normal Part
        ctx.font = baseFont; // Reset to normal weight
        ctx.fillText(normalPart, x + boldWidth, y);
        const normalWidth = ctx.measureText(normalPart).width;

        return boldWidth + normalWidth;
    }, [settings.bionicReading]);

    // Drawing Logic
    const draw = useCallback((tokenIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear with background color
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        drawReticle(ctx, centerX, centerY, canvas.width, settings.fontSize);

        const token = tokens[tokenIndex];
        const fontStack = getFontStack(settings.fontFamily);
        const baseFont = `${settings.fontSize}px ${fontStack}`;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        if (!token) {
            // Draw status message
            ctx.font = `italic ${settings.fontSize / 2}px ${fontStack}`;
            ctx.fillStyle = '#666';
            const msg = tokenIndex >= tokens.length && tokens.length > 0 ? "Done" : "Ready";
            const width = ctx.measureText(msg).width;
            ctx.fillText(msg, centerX - (width / 2), centerY);
            return;
        }

        // --- Calculate Center Word Metrics ---
        ctx.font = baseFont; // Standard font for measurement
        const text = token.text;
        const orpIndex = Math.min(token.orpIndex, text.length - 1);

        const preReticle = text.substring(0, orpIndex);
        const reticleChar = text.substring(orpIndex, orpIndex + 1);
        const postReticle = text.substring(orpIndex + 1);

        const preWidth = ctx.measureText(preReticle).width;
        const reticleWidth = ctx.measureText(reticleChar).width;
        const totalWidth = ctx.measureText(text).width;

        // Center reticleChar at centerX
        const startX = centerX - preWidth - (reticleWidth / 2);

        // --- Draw Peripheral Words (if enabled) ---
        if (settings.peripheralMode) {
            ctx.globalAlpha = 0.3; // Fade out peripheral words

            // Previous Word
            const prevToken = tokens[tokenIndex - 1];
            if (prevToken) {
                const margin = settings.fontSize; // Gap between words
                const prevTextWidth = ctx.measureText(prevToken.text).width;
                // Position to the left of the startX of current word
                drawBionicText(ctx, prevToken.text, startX - margin - prevTextWidth, centerY, settings.textColor, baseFont);
            }

            // Next Word
            const nextToken = tokens[tokenIndex + 1];
            if (nextToken) {
                const margin = settings.fontSize;
                // Position to the right of the end of current word
                // Current word ends at startX + totalWidth
                // Actually need to consider Bionic width calculation if bionic is on, but measureText is close enough
                drawBionicText(ctx, nextToken.text, startX + totalWidth + margin, centerY, settings.textColor, baseFont);
            }

            ctx.globalAlpha = 1.0; // Reset alpha
        }

        // --- Draw Center Word ---
        if (settings.bionicReading) {
            // Draw Bionic - Custom implementation to preserve ORP highlight

            // 1. Pre-Reticle (Apply Bionic Bolding)
            const splitIndex = Math.ceil(text.length * 0.4);

            let currentX = startX;

            // Pre-Reticle
            // We need to split preReticle into bold and normal parts
            const splitIndex = Math.ceil(text.length * 0.4);
            const preSplit = Math.min(splitIndex, preReticle.length);
            const preBold = preReticle.substring(0, preSplit);
            const preNormal = preReticle.substring(preSplit);

            ctx.font = `bold ${baseFont}`;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(preBold, currentX, centerY);
            currentX += ctx.measureText(preBold).width;

            ctx.font = baseFont;
            ctx.fillText(preNormal, currentX, centerY);
            currentX += ctx.measureText(preNormal).width;

            // Reticle Char
            // Reticle Char (Always Red, Always Normal weight to maintain readability)
            ctx.fillStyle = settings.highlightColor;
            ctx.fillText(reticleChar, currentX, centerY);
            currentX += ctx.measureText(reticleChar).width;

            // Post-Reticle (Usually normal)
            ctx.fillStyle = settings.textColor;
            ctx.font = baseFont;
            ctx.fillText(postReticle, currentX, centerY);

        } else {
            // Standard Rendering
            ctx.fillStyle = settings.textColor;
            ctx.fillText(preReticle, startX, centerY);

            ctx.fillStyle = settings.highlightColor;
            ctx.fillText(reticleChar, startX + preWidth, centerY);

            ctx.fillStyle = settings.textColor;
            ctx.fillText(postReticle, startX + preWidth + reticleWidth, centerY);
        }

    }, [tokens, settings, drawReticle, drawBionicText, getFontStack]);

    // Optimized Animation Loop - only runs when playing
    useEffect(() => {
        if (!isPlaying) {
            // Reset timing refs when paused
            previousTimeRef.current = 0;
            accumulatorRef.current = 0;
            return;
        }

        const loop = (time: number) => {
            const state = useReaderStore.getState();

            // Exit if no longer playing
            if (!state.isPlaying) {
                previousTimeRef.current = 0;
                accumulatorRef.current = 0;
                return;
            }

            if (!previousTimeRef.current) previousTimeRef.current = time;
            const deltaTime = time - previousTimeRef.current;
            previousTimeRef.current = time;

            if (state.tokens.length > 0 && state.currentIndex < state.tokens.length) {
                accumulatorRef.current += deltaTime;

                const currentToken = state.tokens[state.currentIndex];
                const baseDelay = 60000 / state.wpm;
                const multiplier = (currentToken && state.settings.punctuationPause) ? currentToken.delayMultiplier : 1;
                const requiredDelay = baseDelay * multiplier;

                if (accumulatorRef.current >= requiredDelay) {
                    accumulatorRef.current -= requiredDelay;
                    // Prevent accumulator from getting too large
                    if (accumulatorRef.current > 500) accumulatorRef.current = 0;

                    const nextIndex = state.currentIndex + 1;

                    if (nextIndex >= state.tokens.length) {
                        state.pause();
                        if (state.isRecording) {
                            state.setIsRecording(false);
                        }
                    } else {
                        state.setCurrentIndex(nextIndex);

                        // Pause at end of sentence if enabled
                        if (state.settings.pauseAtEndOfSentence && currentToken?.isSentenceEnd) {
                            state.pause();
                        }
                    }
                }
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying]);

    // Direct Store Subscription for High-Frequency Updates (Canvas + Progress Bar)
    useEffect(() => {
        // Initial sync of UI
        const state = useReaderStore.getState();
        draw(state.currentIndex);

        if (progressBarRef.current) {
            const progress = state.tokens.length > 0 ? (state.currentIndex / state.tokens.length) * 100 : 0;
            progressBarRef.current.style.width = `${progress}%`;
            progressBarRef.current.setAttribute('aria-valuenow', progress.toString());
        }

        // Subscribe to store changes
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (state.currentIndex !== prevState.currentIndex) {
                draw(state.currentIndex);

                // Update progress bar
                if (progressBarRef.current) {
                    const progress = state.tokens.length > 0 ? (state.currentIndex / state.tokens.length) * 100 : 0;
                    progressBarRef.current.style.width = `${progress}%`;
                    progressBarRef.current.setAttribute('aria-valuenow', progress.toString());
                }
            }
        });

        return unsub;
    }, [draw]); // draw changes when settings or tokens change, triggering re-subscribe which is correct
    }, [draw, tokens.length]);

    // Resize Handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                draw(useReaderStore.getState().currentIndex);
            }
        };

        window.addEventListener('resize', resize);
        resize();

        return () => window.removeEventListener('resize', resize);
    }, [draw, settings.aspectRatio]);

    const initialIndex = useReaderStore.getState().currentIndex;
    const initialProgress = 0;

    return (
        <div
            ref={containerRef}
            className={`w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative group transition-all duration-300 mx-auto ${settings.aspectRatio === '9:16' ? 'max-w-[400px] aspect-[9/16]' : 'aspect-video'}`}
            role="img"
            aria-label="Speed reading display"
            aria-label={`Speed reading display showing word ${initialIndex + 1} of ${tokens.length}`}
        >
            <div className="absolute top-0 left-0 px-2 py-1 bg-black/50 text-[10px] text-gray-500 font-mono pointer-events-none uppercase tracking-wider z-10">
                Preview
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                aria-hidden="true"
            />

            {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-900/80 rounded-full animate-pulse z-10">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-mono text-red-100">REC</span>
                </div>
            )}

            {/* Progress Bar Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50">
                <div
                    ref={progressBarRef}
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${initialProgress}%` }}
                    role="progressbar"
                    aria-valuenow={initialProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Reading progress"
                />
            </div>
        </div>
    );
};
