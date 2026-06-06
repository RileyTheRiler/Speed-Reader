import { useEffect, useState } from 'react';
import { getTTSProvider, type TTSVoice } from '../utils/tts';

/**
 * Reactively expose the available TTS voices. The Web Speech voice list is
 * frequently empty on first paint and populated asynchronously via the
 * `voiceschanged` event, so we subscribe through the provider's onVoicesReady.
 */
export function useVoices(): TTSVoice[] {
    const [voices, setVoices] = useState<TTSVoice[]>(() => getTTSProvider().getVoices());

    useEffect(() => {
        const provider = getTTSProvider();
        const unsub = provider.onVoicesReady(setVoices);
        return unsub;
    }, []);

    return voices;
}

/**
 * Choose the voiceURI to actually speak with. If the user picked one and it's
 * still available, use it; otherwise prefer the default English voice, then any
 * English voice, then the first voice, then '' (engine default).
 */
export function resolveVoiceURI(preferredURI: string, voices: TTSVoice[]): string {
    if (preferredURI && voices.some((v) => v.voiceURI === preferredURI)) {
        return preferredURI;
    }
    const englishDefault = voices.find((v) => v.lang?.startsWith('en') && v.default);
    if (englishDefault) return englishDefault.voiceURI;

    const anyEnglish = voices.find((v) => v.lang?.startsWith('en'));
    if (anyEnglish) return anyEnglish.voiceURI;

    return voices[0]?.voiceURI ?? '';
}
