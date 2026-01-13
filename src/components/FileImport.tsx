import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { parseFile } from '../utils/fileParser';

export const FileImport: React.FC = () => {
    const { setInputText } = useReaderStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const text = await parseFile(file);
            if (!text.trim()) {
                throw new Error("No readable text found in file.");
            }

            setInputText(text);
            // Automatically switch to reader view? Or just fill the box?
            // Let's just fill the box and let user click Start, but maybe auto-close input if user feels like it?
            // Actually, filling the box and staying there is safer so they can verify.
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to parse file");
        } finally {
            setIsLoading(false);
        }
    }, [setInputText]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt', '.md'],
            'application/pdf': ['.pdf'],
            'application/epub+zip': ['.epub']
        },
        maxFiles: 1
    });

    return (
        <div className="mb-6">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer text-center group
                    ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 bg-[#383838]'}
                    ${error ? 'border-red-500/50 bg-red-900/10' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center gap-3">
                    {isLoading ? (
                        <Loader2 size={32} className="text-blue-400 animate-spin" />
                    ) : error ? (
                        <AlertCircle size={32} className="text-red-400" />
                    ) : (
                        <Upload size={32} className="text-gray-400 group-hover:text-white transition-colors" />
                    )}

                    <div className="space-y-1">
                        {isLoading ? (
                            <p className="text-lg font-medium text-white">Parsing file...</p>
                        ) : error ? (
                            <p className="text-lg font-medium text-red-400">{error}</p>
                        ) : (
                            <>
                                <p className="text-lg font-medium text-gray-200">
                                    {isDragActive ? "Drop to load" : "Drag & drop a file here"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Support for PDF, EPUB, TXT, MD
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
