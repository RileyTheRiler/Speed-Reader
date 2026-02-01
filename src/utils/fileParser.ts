import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';
import { MAX_INPUT_LENGTH, sanitizeInput } from './security';

// Types for EPUB.js
interface SpineItem {
    href: string;
    idref?: string;
    linear?: string;
    index?: number;
}

interface Spine {
    items: SpineItem[];
}

interface EpubDocument {
    body?: {
        textContent: string | null;
    };
    textContent?: string | null;
}

// Configure PDF.js worker
// We need to point to the worker file. In a Vite setup, we usually import the worker script URL or rely on a CDN if local worker causes issues.
// Ideally, we import the worker entry point directly if supported by the bundler, or use the conditional CDN fallback.
// For simplicity in this Vite setup, we will use the CDN version matching the installed version to avoid complex vite config changes for worker loading.
// NOTE: In a production app, bundling the worker is better.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
        if (fullText.length >= MAX_INPUT_LENGTH) break;

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => ('str' in item ? (item as { str: string }).str : ''))
            .join(' ');
        fullText += pageText + '\n\n';

        if (fullText.length > MAX_INPUT_LENGTH) {
            fullText = fullText.slice(0, MAX_INPUT_LENGTH);
            break;
        }
    }

    return sanitizeInput(fullText);
};

export const parseEpub = async (file: File): Promise<string> => {
    // ePub.js takes an ArrayBuffer or a URL
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);

    // Iterate through key sections (spine) and extract text
    let fullText = '';

    await book.ready;
    const spine = book.spine as unknown as Spine;

    const spineItems = spine.items || [];

    for (const item of spineItems) {
        if (fullText.length >= MAX_INPUT_LENGTH) break;

        try {
            const doc = await book.load(item.href) as unknown as EpubDocument;
            // doc is a DOM Document / XML Document
            if (doc && doc.body) {
                fullText += (doc.body.textContent || '') + '\n\n';
            } else if (doc && doc.textContent) {
                fullText += (doc.textContent || '') + '\n\n';
            }

            if (fullText.length > MAX_INPUT_LENGTH) {
                fullText = fullText.slice(0, MAX_INPUT_LENGTH);
                break;
            }
        } catch (err) {
            console.warn(`Failed to parse chapter ${item.href}:`, err);
        }
    }

    return sanitizeInput(fullText);
};

export const parseFile = async (file: File): Promise<string> => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return parsePdf(file);
    }

    if (type === 'application/epub+zip' || name.endsWith('.epub')) {
        return parseEpub(file);
    }

    // Default: Text
    const text = await file.text();
    // sanitizeInput will handle truncation
    return sanitizeInput(text);
};
