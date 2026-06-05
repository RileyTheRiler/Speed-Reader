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

    // --- Grammar-Aware Chunking Mode ---
    // Breaks on clause boundaries and caps at 4 words (Cowan's 4±1 working-memory limit).
    // Uses clause-boundary punctuation and conjunction/clause-start words as break points
    // rather than arbitrary N-word groups, which hurt comprehension.
    if (smartChunking) {
        let currentChunk: string[] = [];

        // Words that START a new clause — break BEFORE these when chunk is non-empty
        const CLAUSE_STARTERS = new Set([
            'and', 'but', 'or', 'nor', 'yet', 'so',           // coordinating conjunctions
            'because', 'although', 'though', 'unless', 'while', // subordinating conjunctions
            'when', 'where', 'if', 'since', 'until', 'after',
            'before', 'that', 'which', 'who', 'whom', 'whose',
            'however', 'therefore', 'moreover', 'furthermore',  // conjunctive adverbs
            'nevertheless', 'meanwhile', 'otherwise', 'then',
        ]);

        // Maximum chunk size — Cowan's working-memory limit
        const MAX_CHUNK_WORDS = 4;

        const flushChunk = () => {
            if (currentChunk.length === 0) return;

            const chunkText = currentChunk.join(' ');
            const chunkWords = [...currentChunk];
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

            const maxMultiplier = Math.max(...wordInfos.map(w => w.multiplier));
            const chunkDurationMult = maxMultiplier * (1 + (chunkWords.length - 1) * 0.15);

            const lastWord = chunkWords[chunkWords.length - 1];
            const hasSentenceEnd = /[.!?]/.test(lastWord.slice(-1));

            tokens.push({
                id: `smart-${tokens.length}-${chunkWords[0]}`,
                text: chunkText,
                cleanText: chunkCleanText,
                orpIndex: orpPosition,
                delayMultiplier: chunkDurationMult,
                isChunk: chunkWords.length > 1,
                isSentenceEnd: hasSentenceEnd,
                hasSpaceAfter: true,
            });

            currentChunk = [];
        };

        for (let i = 0; i < rawWords.length; i++) {
            const word = rawWords[i];
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
            const hasPunctuation = /[.!?,;:—]$/.test(word);

            // Break BEFORE clause starters (if current chunk is non-empty)
            if (currentChunk.length > 0 && CLAUSE_STARTERS.has(cleanWord)) {
                flushChunk();
            }

            currentChunk.push(word);

            // Break AFTER punctuation (clause boundary)
            if (hasPunctuation) {
                flushChunk();
            }
            // Break at Cowan's limit
            else if (currentChunk.length >= MAX_CHUNK_WORDS) {
                flushChunk();
            }
        }

        // Flush any remaining words
        flushChunk();

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
