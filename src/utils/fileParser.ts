import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';
import { MAX_INPUT_LENGTH } from './security';

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
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n\n';

        if (fullText.length > MAX_INPUT_LENGTH) break;
    }

    return fullText.slice(0, MAX_INPUT_LENGTH);
};

export const parseEpub = async (file: File): Promise<string> => {
    // ePub.js takes an ArrayBuffer or a URL
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);

    // Iterate through key sections (spine) and extract text
    let fullText = '';

    await book.ready;
    const spine = book.spine;

    // The type definition for spine might be loose, but .each() iterates sections
    // Note: older epubjs versions used .each(), newer might use for-loop on spine.items
    // Let's safe-guard this.

    // We can just load the entire book text? No, that's heavy.
    // Let's iterate spine items.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spineItems = (spine as any).items || [];

    for (const item of spineItems) {
        // Load the chapter
        // item can be loaded
        // Be careful: 'book.load' might load the whole thing into DOM.
        // We want the text content.
        // 'item.load(book.load.bind(book))' returns a document?

        try {
            // Using the raw section load method if available, or just book.load(item.href)
            // But we have the ArrayBuffer book here.
            // Let's stick to the official API: book.load(item.href) returns a Promise<Document>

            // Wait, we passed ArrayBuffer to ePub(), so it's "opened".
            // We can just iterate the spine and get content.

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = await book.load(item.href) as any;
            // doc is a DOM Document / XML Document
            if (doc && doc.body) {
                fullText += doc.body.textContent + '\n\n';
            } else if (doc && doc.textContent) {
                fullText += doc.textContent + '\n\n';
            }

            if (fullText.length > MAX_INPUT_LENGTH) break;
        } catch (err) {
            console.warn(`Failed to parse chapter ${item.href}:`, err);
        }
    }

    return fullText.slice(0, MAX_INPUT_LENGTH);
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
    return text.slice(0, MAX_INPUT_LENGTH);
};
