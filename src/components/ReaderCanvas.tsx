import React, { useRef, useEffect, useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';

export const ReaderCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const accumulatorRef = useRef<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const {
        tokens,
        currentIndex,
        isRecording,
        settings,
        play,
        reset,
        setIsRecording
    } = useReaderStore();

    // Start Recording Helper
    const startRecording = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 60 FPS capture
        const stream = canvas.captureStream(60);

        // Check supported MIME types
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        try {
            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000 // 5Mbps for high quality
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
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                setIsRecording(false);
            };

            recorder.start();
        } catch (e) {
            console.error("Failed to start recording:", e);
            setIsRecording(false);
        }
    }, [setIsRecording]);


    // Handle Recording State Changes (Trigger)
    useEffect(() => {
        if (isRecording) {
            // Sequence: Reset -> Wait -> Start Rec -> Play
            reset();
            // Small delay to ensure render is clean and reset
            const timeout = setTimeout(() => {
                startRecording();
                play();
            }, 300);
            return () => clearTimeout(timeout);
        } else {
            // Stop logic
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }
    }, [isRecording, reset, play, startRecording]);


    // Drawing Logic
    const draw = useCallback((tokenIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = settings.backgroundColor; // Dynamic background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // We can't include drawRedicle in dependencies because it's not a callback/memoized
        // so we define it inside or move it out of the component.
        // For now, I will keep it but ignore the lint warning about missing dependency
        // since drawRedicle doesn't depend on state other than what is passed to it.
        // Actually, drawRedicle uses settings.showRedicle.

        const drawRedicle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, fontSize: number) => {
            if (!settings.showRedicle) return;

            // Context Box
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            const boxHeight = fontSize * 3;
            ctx.fillRect(0, centerY - (boxHeight / 2), width, boxHeight);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#333'; // Slightly lighter than black/gray for visibility

            const gap = 35;
            const length = 25;
            const crossWidth = 20;

            // Top Guide
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - gap - length);
            ctx.lineTo(centerX, centerY - gap);
            // Top Crossbar
            ctx.moveTo(centerX - crossWidth, centerY - gap - length);
            ctx.lineTo(centerX + crossWidth, centerY - gap - length);
            ctx.stroke();

            // Bottom Guide
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + gap);
            ctx.lineTo(centerX, centerY + gap + length);
            // Bottom Crossbar
            ctx.moveTo(centerX - crossWidth, centerY + gap + length);
            ctx.lineTo(centerX + crossWidth, centerY + gap + length);
            ctx.stroke();
        };

        drawRedicle(ctx, centerX, centerY, canvas.width, settings.fontSize);

        const token = tokens[tokenIndex];

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        if (!token) {
            // Draw "Ready" or "Done"
            ctx.font = `italic ${settings.fontSize / 2}px Inter, sans-serif`;
            ctx.fillStyle = '#444';
            const msg = tokenIndex >= tokens.length && tokens.length > 0 ? "Doubled." : "Ready";
            const width = ctx.measureText(msg).width;
            ctx.fillText(msg, centerX - (width / 2), centerY);
            return;
        }

        // Font Settings
        ctx.font = `${settings.fontSize}px Inter, sans-serif`;

        // Calculate Alignment using ORP
        const text = token.text;
        const orpIndex = token.orpIndex;

        const preRedicle = text.substring(0, orpIndex);
        const redicleChar = text.substring(orpIndex, orpIndex + 1);
        const postRedicle = text.substring(orpIndex + 1);

        const preWidth = ctx.measureText(preRedicle).width;
        const redicleWidth = ctx.measureText(redicleChar).width;

        // Target: Center of redicleChar is at centerX
        const startX = centerX - preWidth - (redicleWidth / 2);

        // Draw Left
        ctx.fillStyle = settings.textColor;
        ctx.fillText(preRedicle, startX, centerY);

        // Draw Redicle
        ctx.fillStyle = settings.highlightColor;
        ctx.fillText(redicleChar, startX + preWidth, centerY);

        // Draw Right
        ctx.fillStyle = settings.textColor;
        ctx.fillText(postRedicle, startX + preWidth + redicleWidth, centerY);

    }, [tokens, settings]); // Removed wpm form dependencies as it is not used in draw anymore

    // Animation Loop
    useEffect(() => {
        const loop = (time: number) => {
            const state = useReaderStore.getState();

            if (!previousTimeRef.current) previousTimeRef.current = time;
            const deltaTime = time - previousTimeRef.current;
            previousTimeRef.current = time;

            if (state.isPlaying && state.tokens.length > 0 && state.currentIndex < state.tokens.length) {
                accumulatorRef.current += deltaTime;

                const currentToken = state.tokens[state.currentIndex];
                const baseDelay = 60000 / state.wpm;
                const multiplier = currentToken ? currentToken.delayMultiplier : 1;
                const requiredDelay = baseDelay * multiplier;

                if (accumulatorRef.current >= requiredDelay) {
                    accumulatorRef.current -= requiredDelay;
                    if (accumulatorRef.current > 500) accumulatorRef.current = 0;

                    const nextIndex = state.currentIndex + 1;

                    if (nextIndex >= state.tokens.length) {
                        state.pause();
                        if (state.isRecording) {
                            // Stop recording logic via state change
                            state.setIsRecording(false);
                        }
                    } else {
                        state.setCurrentIndex(nextIndex);

                        // Pause at end of sentence if enabled
                        if (state.settings.pauseAtEndOfSentence && currentToken.isSentenceEnd) {
                            state.pause();
                        }
                    }
                }
            } else {
                accumulatorRef.current = 0;
                previousTimeRef.current = time;
            }
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Trigger Draw on index change
    useEffect(() => {
        draw(currentIndex);
    }, [currentIndex, draw]);

    // Resize Handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Set actual canvas size (resolution)
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                draw(useReaderStore.getState().currentIndex);
            }
        };
        window.addEventListener('resize', resize);
        resize(); // Initial

        return () => window.removeEventListener('resize', resize);
    }, [draw, settings.aspectRatio]); // Add aspect ratio to dependency to re-trigger

    // Progress Calculation
    const progress = tokens.length > 0 ? (currentIndex / tokens.length) * 100 : 0;

    return (
        <div
            className={`w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative group transition-all duration-300 mx-auto ${settings.aspectRatio === '9:16' ? 'max-w-[400px] aspect-[9/16]' : 'aspect-video'}`}
        >
            <div className="absolute top-0 left-0 px-2 py-1 bg-black/50 text-[10px] text-gray-500 font-mono pointer-events-none uppercase tracking-wider z-10">
                Preview
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full block"
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
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
