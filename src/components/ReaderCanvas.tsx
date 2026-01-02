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
        isPlaying,
        isRecording,
        wpm,
        settings,
        setCurrentIndex,
        play,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pause,
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
        ctx.fillStyle = '#1a1a1a'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Guides (Redicle)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (settings.showRedicle) {
            // Top marker
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 60);
            ctx.lineTo(centerX, centerY - 35);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#222';
            ctx.stroke();

            // Bottom marker
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 35);
            ctx.lineTo(centerX, centerY + 60);
            ctx.stroke();

            // Center thin line (optional, maybe too distracting)
            // ctx.globalAlpha = 0.1;
            // ctx.moveTo(centerX, 0);
            // ctx.lineTo(centerX, canvas.height);
            // ctx.stroke();
            // ctx.globalAlpha = 1.0;
        }

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

            // Draw WPM Watermark
            ctx.font = '16px Inter, sans-serif';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'right';
            ctx.fillText(`${wpm} wpm`, canvas.width - 20, canvas.height - 20);
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
        ctx.fillStyle = '#e5e5e5';
        ctx.fillText(preRedicle, startX, centerY);

        // Draw Redicle
        ctx.fillStyle = '#ff4444';
        ctx.fillText(redicleChar, startX + preWidth, centerY);

        // Draw Right
        ctx.fillStyle = '#e5e5e5';
        ctx.fillText(postRedicle, startX + preWidth + redicleWidth, centerY);

        // Watermark (bottom right)
        ctx.font = 'italic 20px Inter, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.fillText(`${wpm} wpm`, canvas.width - 20, canvas.height - 20);

    }, [tokens, settings, wpm]);

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
                        // Optional: Reset to 0? Or stay at end?
                        // state.setCurrentIndex(0); 
                    } else {
                        state.setCurrentIndex(nextIndex);
                    }
                }
            } else {
                accumulatorRef.current = 0;
                previousTimeRef.current = time;
            }
            // Always draw
            const currentIdx = useReaderStore.getState().currentIndex;
            // We call draw here to ensure it aligns with the animation frame, 
            // but we might need to throttle if React renders are enough.
            // Actually, for Canvas, explicit draw in rAF is better than useEffect if we want 60fps animations.
            // But since our `draw` depends on React State `currentIndex`, let's just let the `useEffect[currentIndex]` trigger the draw
            // IF we were purely updating state. 
            // HOWEVER: We want to draw even if state doesn't change (e.g. cursors, or smoother animations). 
            // Since we are just text flashing, `useEffect` is fine.
            // But for video export, the browser might throttle `useEffect` if it's tied to React render cycle? 
            // No, the recorder records the canvas. As long as canvas updates, it's fine.
            // Safest: Call `draw` explicitly here? 
            // `draw` uses props trapped in closure. We need fresh props.
            // For now, let's stick to the React Effect for drawing to avoid desync/closure issues.
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
    }, [draw]);

    return (
        <div className="w-full aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative group">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />
            {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-900/80 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-mono text-red-100">REC</span>
                </div>
            )}
        </div>
    );
};
