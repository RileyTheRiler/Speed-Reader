import { useRef, useEffect, useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useShallow } from 'zustand/react/shallow';

export const ReaderCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const accumulatorRef = useRef<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // ⚡ Bolt: Performance Optimization
    // Exclude currentIndex from the selector to prevent re-renders on every tick.
    // We'll use subscription to handle drawing updates manually.
    const {
        tokens,
        // currentIndex, // Removed to prevent re-renders
        isPlaying,
        isRecording,
        settings,
        play,
        reset,
        setIsRecording
    } = useReaderStore(
        useShallow(state => ({
            tokens: state.tokens,
            isPlaying: state.isPlaying,
            isRecording: state.isRecording,
            settings: state.settings,
            play: state.play,
            reset: state.reset,
            setIsRecording: state.setIsRecording
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

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        if (!token) {
            // Draw status message
            ctx.font = `italic ${settings.fontSize / 2}px Inter, sans-serif`;
            ctx.fillStyle = '#666';
            const msg = tokenIndex >= tokens.length && tokens.length > 0 ? "Done" : "Ready";
            const width = ctx.measureText(msg).width;
            ctx.fillText(msg, centerX - (width / 2), centerY);
            return;
        }

        // Font Settings
        ctx.font = `${settings.fontSize}px Inter, sans-serif`;

        // Calculate Alignment using ORP
        const text = token.text;
        const orpIndex = Math.min(token.orpIndex, text.length - 1);

        const preReticle = text.substring(0, orpIndex);
        const reticleChar = text.substring(orpIndex, orpIndex + 1);
        const postReticle = text.substring(orpIndex + 1);

        const preWidth = ctx.measureText(preReticle).width;
        const reticleWidth = ctx.measureText(reticleChar).width;

        // Center reticleChar at centerX
        const startX = centerX - preWidth - (reticleWidth / 2);

        // Draw text parts
        ctx.fillStyle = settings.textColor;
        ctx.fillText(preReticle, startX, centerY);

        ctx.fillStyle = settings.highlightColor;
        ctx.fillText(reticleChar, startX + preWidth, centerY);

        ctx.fillStyle = settings.textColor;
        ctx.fillText(postReticle, startX + preWidth + reticleWidth, centerY);

    }, [tokens, settings, drawReticle]);

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
                const multiplier = currentToken ? currentToken.delayMultiplier : 1;
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

    // ⚡ Bolt: Performance Optimization
    // Subscribe to currentIndex changes to trigger draw and update progress bar
    // without re-rendering the React component.
    useEffect(() => {
        // Initial draw
        const currentIndex = useReaderStore.getState().currentIndex;
        draw(currentIndex);
        if (progressRef.current && tokens.length > 0) {
            progressRef.current.style.width = `${(currentIndex / tokens.length) * 100}%`;
        }

        const unsubscribe = useReaderStore.subscribe(
            (state) => {
                const newIndex = state.currentIndex;
                draw(newIndex);
                if (progressRef.current && tokens.length > 0) {
                    const progressVal = (newIndex / tokens.length) * 100;
                    progressRef.current.style.width = `${progressVal}%`;
                    progressRef.current.setAttribute('aria-valuenow', progressVal.toString());
                }
                if (containerRef.current) {
                    containerRef.current.setAttribute('aria-label', `Speed reading display showing word ${newIndex + 1} of ${tokens.length}`);
                }
            }
        );

        return () => unsubscribe();
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

    // Calculate initial progress for SSR/hydration (though we update via ref later)
    // We can just default to 0 here or read from store once if needed, but since we update immediately in useEffect, 0 is fine.
    // However, to avoid visual jump on first render if possible, we can read initial state.
    // But since we removed currentIndex from hook, we can't use it here without triggering re-render if we put it in state.
    // Let's just default to a static value and let the effect handle it.

    return (
        <div
            ref={containerRef}
            className={`w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative group transition-all duration-300 mx-auto ${settings.aspectRatio === '9:16' ? 'max-w-[400px] aspect-[9/16]' : 'aspect-video'}`}
            role="img"
            aria-label="Speed reading display"
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
                    ref={progressRef}
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: '0%' }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Reading progress"
                />
            </div>
        </div>
    );
};
