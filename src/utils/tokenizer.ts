import { calculateORP } from './orp';

export interface Token {
    id: string;
    text: string;           // Display text (e.g. "Hello," or "Hello world" for chunks)
    cleanText: string;      // Text for ORP calculation
    orpIndex: number;       // Index of the "Reticle" character in display text
    delayMultiplier: number;// Multiplier for duration (1.0 = base)
    isChunk: boolean;       // True if this token contains multiple words
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

interface WordInfo {
    word: string;
    cleanText: string;
    leadingOffset: number;
    multiplier: number;
    isSentenceEnd: boolean;
}

const processWord = (word: string): WordInfo => {
    const lastChar = word.slice(-1);
    let multiplier = 1.0;
    let isSentenceEnd = false;

    if (PUNCTUATION_DELAYS[lastChar]) {
        multiplier = PUNCTUATION_DELAYS[lastChar];
        if (['.', '!', '?'].includes(lastChar)) {
            isSentenceEnd = true;
        }
    } else if (word.length > 10) {
        multiplier = 1.2;
    }

    const leadingMatch = word.match(/^['" (]+/);
    const leadingOffset = leadingMatch ? leadingMatch[0].length : 0;
    const cleanText = word.replace(/^['" (]+|['" )]+$/g, '') || word;

    return { word, cleanText, leadingOffset, multiplier, isSentenceEnd };
};

export const tokenize = (text: string, chunkSize: number = 1, smartChunking: boolean = false): Token[] => {
    // Basic word splitting
    const rawWords = text.trim().split(/\s+/).filter(w => w.length > 0);

    if (rawWords.length === 0) return [];

    const tokens: Token[] = [];

    // --- Smart Chunking Mode ---
    if (smartChunking) {
        let currentChunk: string[] = [];
        let currentChunkLength = 0;

        // "Glue" words that shouldn't end a chunk if possible
        const GLUE_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'is', 'are', 'was', 'were']);

        // Common phrases to try and keep together (simple heuristic lookahead could be added later)
        // For now, we rely on "don't break after glue words" and "extend if short"

        for (let i = 0; i < rawWords.length; i++) {
            const word = rawWords[i];
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

            currentChunk.push(word);
            currentChunkLength += word.length;

            const hasPunctuation = /[.!?,;:]$/.test(word);
            const isGlue = GLUE_WORDS.has(cleanWord);

            // Heuristics for breaking a chunk:
            // 1. Hard break: Punctuation (always break)
            // 2. Soft break: 
            //    - At least 3 words OR > 20 chars
            //    - AND not a glue word (unless chunk is getting too long > 4 words)
            //    - AND next word indicates a new Start? (Capitalized? - maybe too aggressive)

            let shouldBreak = false;

            if (hasPunctuation) {
                shouldBreak = true;
            } else if (currentChunk.length >= 3) {
                if (currentChunk.length >= 5 || currentChunkLength > 25) {
                    // Force break if too long
                    shouldBreak = true;
                } else if (!isGlue) {
                    // Break if acceptable length and not ending on a connector
                    shouldBreak = true;
                }
            }

            if (shouldBreak || i === rawWords.length - 1) {
                // Flush chunk
                const chunkText = currentChunk.join(' ');
                const chunkWords = currentChunk;
                const wordInfos = chunkWords.map(processWord);
                const chunkCleanText = wordInfos.map(w => w.cleanText).join(' ');

                // ORP: Middle of chunk
                const middleWordIndex = Math.floor(chunkWords.length / 2);
                let orpPosition = 0;
                for (let j = 0; j < middleWordIndex; j++) {
                    orpPosition += chunkWords[j].length + 1;
                }
                const midInfo = wordInfos[middleWordIndex];
                orpPosition += calculateORP(midInfo.cleanText) + midInfo.leadingOffset;

                // Max Multiplier + length bonus
                const maxMultiplier = Math.max(...wordInfos.map(w => w.multiplier));

                // Slightly longer delay for longer chunks
                const chunkDurationMult = maxMultiplier * (1 + (chunkWords.length - 1) * 0.15);

                tokens.push({
                    id: `smart-${tokens.length}-${chunkWords[0]}`,
                    text: chunkText,
                    cleanText: chunkCleanText,
                    orpIndex: orpPosition,
                    delayMultiplier: chunkDurationMult,
                    isChunk: true,
                    isSentenceEnd: hasPunctuation && /[.!?]/.test(word),
                    hasSpaceAfter: true,
                });

                currentChunk = [];
                currentChunkLength = 0;
            }
        }
        return tokens;
    }

    // --- Standard Chunking Mode ---
    if (chunkSize <= 1) {
        // ... (Existing Single Word Logic)
        for (let i = 0; i < rawWords.length; i++) {
            const wordInfo = processWord(rawWords[i]);
            const cleanOrpIndex = calculateORP(wordInfo.cleanText);
            const displayOrpIndex = cleanOrpIndex + wordInfo.leadingOffset;

            tokens.push({
                id: `${i}-${wordInfo.word}`,
                text: wordInfo.word,
                cleanText: wordInfo.cleanText,
                orpIndex: displayOrpIndex,
                delayMultiplier: wordInfo.multiplier,
                isChunk: false,
                isSentenceEnd: wordInfo.isSentenceEnd,
                hasSpaceAfter: true,
            });
        }
        return tokens;
    }

    // ... (Existing Manual Chunking logic)
    for (let i = 0; i < rawWords.length; i += chunkSize) {
        const chunkWords = rawWords.slice(i, Math.min(i + chunkSize, rawWords.length));
        const wordInfos = chunkWords.map(processWord);

        // Combine words into a chunk
        const chunkText = chunkWords.join(' ');
        const chunkCleanText = wordInfos.map(w => w.cleanText).join(' ');

        // Use highest multiplier from any word in the chunk
        const maxMultiplier = Math.max(...wordInfos.map(w => w.multiplier));

        // Sentence ends if any word in chunk ends a sentence
        const isSentenceEnd = wordInfos.some(w => w.isSentenceEnd);

        // Calculate ORP for the combined chunk
        // For chunks, focus on the middle word's ORP position
        const middleWordIndex = Math.floor(chunkWords.length / 2);
        let orpPosition = 0;

        // Calculate character offset to middle word
        for (let j = 0; j < middleWordIndex; j++) {
            orpPosition += chunkWords[j].length + 1; // +1 for space
        }

        // Add the ORP position within the middle word
        const middleWordInfo = wordInfos[middleWordIndex];
        const middleWordOrp = calculateORP(middleWordInfo.cleanText);
        orpPosition += middleWordOrp + middleWordInfo.leadingOffset;

        tokens.push({
            id: `chunk-${i}-${chunkText.substring(0, 20)}`,
            text: chunkText,
            cleanText: chunkCleanText,
            orpIndex: orpPosition,
            delayMultiplier: maxMultiplier * (1 + (chunkWords.length - 1) * 0.3), // Scale delay for chunk size
            isChunk: chunkWords.length > 1,
            isSentenceEnd,
            hasSpaceAfter: true,
        });
    }

    return tokens;
};
