import { calculateORP } from './orp';

export interface Token {
    id: string;
    text: string;           // Display text (e.g. "Hello,")
    cleanText: string;      // Text for ORP (e.g. "Hello")
    orpIndex: number;       // Index of the "Redicle" character
    delayMultiplier: number;// Multiplier for duration (1.0 = base)
    isChunk: boolean;
    isSentenceEnd: boolean;
    hasSpaceAfter: boolean;
}

const PUNCTUATION_DELAYS: Record<string, number> = {
    '.': 3.0,
    ',': 1.5,
    ';': 2.0,
    ':': 2.0,
    '!': 3.0,
    '?': 3.0,
    '—': 2.0,
    '-': 1.2,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const tokenize = (text: string, _chunkSize: number = 1): Token[] => {
    // 1. Basic splitting by whitespace, preserving newlines as separate logic if needed
    // For now, treat newlines as spaces or sentence breaks
    const rawWords = text.trim().split(/\s+/);

    const tokens: Token[] = [];

    for (let i = 0; i < rawWords.length; i++) {
        const word = rawWords[i];
        if (!word) continue;

        // Detect punctuation at the end
        const lastChar = word.slice(-1);
        let multiplier = 1.0;
        let isSentenceEnd = false;

        if (PUNCTUATION_DELAYS[lastChar]) {
            multiplier = PUNCTUATION_DELAYS[lastChar];
            if (['.', '!', '?'].includes(lastChar)) {
                isSentenceEnd = true;
            }
        } else if (word.length > 10) {
            multiplier = 1.2; // Slight delay for long words
        }

        // Paragraph breaks (double newline in raw text) might be handled by pre-processing
        // but for simple split, we rely on punctuation.

        const cleanText = word.replace(/^['"(]+|['")]+$/g, '');
        // ^ Remove leading/trailing quotes/parens for ORP alignment, 
        // but keep them in 'text' for display.

        // Fallback if cleanText matches nothing (e.g. just a symbol)
        const orpBase = cleanText || word;

        const token: Token = {
            id: `${i}-${word}`,
            text: word,
            cleanText: orpBase,
            orpIndex: calculateORP(orpBase),
            delayMultiplier: multiplier,
            isChunk: false,
            isSentenceEnd,
            hasSpaceAfter: true, // simplified for now
        };

        tokens.push(token);
    }

    // TODO: Implement chunking logic here if chunkSize > 1
    // For MVP, we pass chunkSize logic later or refactor this to return chunks.

    return tokens;
};
