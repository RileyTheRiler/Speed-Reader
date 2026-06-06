/**
 * TTS module barrel + provider factory.
 *
 * `getTTSProvider()` is the single swap point: to adopt a cloud generative
 * voice later, return a different `TTSProvider` implementation here and nothing
 * else in the app changes.
 */

export * from './types';
export * from './boundaryMapping';

import type { TTSProvider } from './types';
import { WebSpeechProvider } from './webSpeechProvider';

let _provider: TTSProvider | null = null;

export function getTTSProvider(): TTSProvider {
    if (!_provider) {
        _provider = new WebSpeechProvider();
    }
    return _provider;
}
