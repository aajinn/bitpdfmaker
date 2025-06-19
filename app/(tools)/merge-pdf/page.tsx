"use client";

import React from "react";
import { useState, useRef, DragEvent, useCallback, memo } from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";

interface PDFFile {
        file: File;
        preview: string;
        name: string;
}

// Memoized file item component
const FileItem = memo(({ file, index, onMove, onRemove, isFirst, isLast }: {
        file: PDFFile;
        index: number;
        onMove: (index: number, direction: 'up' | 'down') => void;
        onRemove: (index: number) => void;
        isFirst: boolean;
        isLast: boolean;
}) => (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 text-sm text-gray-600 truncate">{file.name}</span>
                <div className="flex gap-2">
                        <button
                                onClick={() => onMove(index, 'up')}
                                disabled={isFirst}
                                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 rounded hover:bg-gray-200 transition-colors"
                                title="Move up"
                        >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                        </button>
                        <button
                                onClick={() => onMove(index, 'down')}
                                disabled={isLast}
                                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 rounded hover:bg-gray-200 transition-colors"
                                title="Move down"
                        >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                        </button>
                        <button
                                onClick={() => onRemove(index)}
                                className="p-1.5 text-red-600 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                                title="Remove file"
                        >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                        </button>
                </div>
        </div>
));

FileItem.displayName = 'FileItem';

export default function MergePDF() {
        const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
        const [isConverting, setIsConverting] = useState(false);
        const [isDragging, setIsDragging] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const addFiles = useCallback((files: File[]) => {
                const newFiles = files.filter(file => file.type === 'application/pdf');
                const newPdfFiles = newFiles.map(file => ({
                        file,
                        preview: URL.createObjectURL(file),
                        name: file.name
                }));

                setPdfFiles(prev => [...prev, ...newPdfFiles]);
        }, []);

        const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
                const files = event.target.files;
                if (!files) return;
                addFiles(Array.from(files));
        }, [addFiles]);

        const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDragging(true);
        }, []);

        const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDragging(false);
        }, []);

        const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                addFiles(files);
        }, [addFiles]);

        const removeFile = useCallback((index: number) => {
                setPdfFiles(prev => {
                        const newFiles = [...prev];
                        URL.revokeObjectURL(newFiles[index].preview);
                        newFiles.splice(index, 1);
                        return newFiles;
                });
        }, []);

        const moveFile = useCallback((index: number, direction: 'up' | 'down') => {
                setPdfFiles(prev => {
                        const newFiles = [...prev];
                        const newIndex = direction === 'up' ? index - 1 : index + 1;
                        [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
                        return newFiles;
                });
        }, []);

        const processPDF = async (file: File, index: number, total: number) => {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                return { pdf, index, total };
        };

        const handleConvert = async () => {
                if (pdfFiles.length === 0) return;
                setIsConverting(true);

                try {
                        const { jsPDF } = window.jspdf;
                        const mergedPdf = new jsPDF();
                        const batchSize = 3; // Process 3 PDFs at a time

                        for (let i = 0; i < pdfFiles.length; i += batchSize) {
                                const batch = pdfFiles.slice(i, i + batchSize);
                                const batchPromises = batch.map((pdfFile, idx) =>
                                        processPDF(pdfFile.file, i + idx, pdfFiles.length)
                                );

                                const results = await Promise.all(batchPromises);

                                for (const { pdf, index } of results) {
                                        for (let j = 1; j <= pdf.numPages; j++) {
                                                if (index > 0 || j > 1) {
                                                        mergedPdf.addPage();
                                                }
                                                const page = await pdf.getPage(j);
                                                const viewport = page.getViewport({ scale: 1.5 });
                                                const canvas = document.createElement('canvas');
                                                const context = canvas.getContext('2d');
                                                canvas.height = viewport.height;
                                                canvas.width = viewport.width;

                                                await page.render({
                                                        canvasContext: context!,
                                                        viewport: viewport
                                                }).promise;

                                                const imgData = canvas.toDataURL('image/jpeg', 0.8); // Reduced quality for better performance
                                                const img = new Image();
                                                img.src = imgData;
                                                await new Promise(resolve => img.onload = resolve);
                                                mergedPdf.addImage(img, 'JPEG', 0, 0, 210, 297);
                                        }
                                }
                        }

                        mergedPdf.save('merged.pdf');
                } catch (error) {
                        console.error('Error merging PDFs:', error);
                        alert('Error merging PDFs. Please try again.');
                } finally {
                        setIsConverting(false);
                }
        };

        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker</title>
                                <meta name="description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta name="keywords" content="merge pdf, combine pdf, pdf merger, free pdf tool, pdf combiner, merge pdf online, combine pdf files, pdf joiner, merge multiple pdfs" />
                                <meta name="robots" content="index, follow, max-image-preview:large" />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
                                <meta name="author" content="BitPDFMaker" />
                                <meta name="application-name" content="BitPDFMaker" />

                                {/* Open Graph */}
                                <meta property="og:title" content="Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker" />
                                <meta property="og:description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta property="og:type" content="website" />
                                <meta property="og:url" content="https://bitpdfmaker.pro/merge-pdf" />
                                <meta property="og:site_name" content="BitPDFMaker" />
                                <meta property="og:locale" content="en_US" />

                                {/* Twitter */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker" />
                                <meta name="twitter:description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta name="twitter:site" content="@bitpdfmaker" />

                                {/* Canonical */}
                                <link rel="canonical" href="https://bitpdfmaker.pro/merge-pdf" />

                                {/* Structured Data */}
                                <script type="application/ld+json">
                                        {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "WebApplication",
                                                "name": "PDF Merger Tool",
                                                "description": "Merge multiple PDF files into one document online for free. No registration required.",
                                                "url": "https://bitpdfmaker.pro/merge-pdf",
                                                "applicationCategory": "UtilityApplication",
                                                "operatingSystem": "Any",
                                                "offers": {
                                                        "@type": "Offer",
                                                        "price": "0",
                                                        "priceCurrency": "USD"
                                                },
                                                "featureList": [
                                                        "Merge multiple PDF files",
                                                        "Drag and drop support",
                                                        "Arrange files in any order",
                                                        "Free to use",
                                                        "No registration required",
                                                        "Browser-side processing"
                                                ]
                                        })}
                                </script>
                        </Head>
                        <Header />
                        <ExternalScripts />
                        <main className="container mx-auto px-4 py-8">
                                <div className="max-w-4xl mx-auto">
                                        <article className="bg-white rounded-lg shadow-md p-6">
                                                <header>
                                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Merge PDF Files</h1>
                                                        <p className="text-gray-600 mb-6">
                                                                Combine multiple PDF files into one document. Arrange files in any order before merging.
                                                        </p>
                                                </header>

                                                <div className="space-y-4">
                                                        <div
                                                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-300 hover:border-blue-400'
                                                                        }`}
                                                                onDragOver={handleDragOver}
                                                                onDragLeave={handleDragLeave}
                                                                onDrop={handleDrop}
                                                        >
                                                                <div className="space-y-4">
                                                                        <div className="text-gray-600">
                                                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                                </svg>
                                                                                <p className="mt-2">Drag and drop your PDF files here</p>
                                                                                <p className="text-sm text-gray-500">or</p>
                                                                        </div>
                                                                        <button
                                                                                onClick={() => fileInputRef.current?.click()}
                                                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={isConverting}
                                                                        >
                                                                                Select PDF Files
                                                                        </button>
                                                                        <input
                                                                                type="file"
                                                                                ref={fileInputRef}
                                                                                onChange={handleFileSelect}
                                                                                accept=".pdf"
                                                                                multiple
                                                                                className="hidden"
                                                                        />
                                                                </div>
                                                        </div>

                                                        {pdfFiles.length > 0 && (
                                                                <div className="mt-6">
                                                                        <div className="flex justify-between items-center mb-4">
                                                                                <h2 className="text-lg font-semibold text-gray-900">Selected Files ({pdfFiles.length})</h2>
                                                                                <button
                                                                                        onClick={handleConvert}
                                                                                        disabled={isConverting}
                                                                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                                >
                                                                                        {isConverting ? (
                                                                                                <>
                                                                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                                        </svg>
                                                                                                        Merging...
                                                                                                </>
                                                                                        ) : (
                                                                                                <>
                                                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                                                        </svg>
                                                                                                        Merge PDFs
                                                                                                </>
                                                                                        )}
                                                                                </button>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                                {pdfFiles.map((file, index) => (
                                                                                        <FileItem
                                                                                                key={index}
                                                                                                file={file}
                                                                                                index={index}
                                                                                                onMove={moveFile}
                                                                                                onRemove={removeFile}
                                                                                                isFirst={index === 0}
                                                                                                isLast={index === pdfFiles.length - 1}
                                                                                        />
                                                                                ))}
                                                                        </div>
                                                                </div>
                                                        )}
                                                </div>

                                                <section className="mt-8 space-y-4 text-gray-600" aria-label="Instructions">
                                                        <h2 className="text-xl font-semibold text-gray-900">How to Merge PDF Files</h2>
                                                        <ol className="list-decimal list-inside space-y-2">
                                                                <li>Drag and drop your PDF files or click &quot;Select PDF Files&quot;</li>
                                                                <li>Arrange the files in your preferred order using the up/down arrows</li>
                                                                <li>Remove any unwanted files using the remove button</li>
                                                                <li>Click &quot;Merge PDFs&quot; to combine your files</li>
                                                                <li>Your merged PDF will be automatically downloaded when ready</li>
                                                        </ol>

                                                        <div className="mt-6">
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                                                <ul className="list-disc list-inside space-y-1">
                                                                        <li>Merge multiple PDF files into one document</li>
                                                                        <li>Drag and drop support for easy file selection</li>
                                                                        <li>Arrange files in any order</li>
                                                                        <li>Preview file names before merging</li>
                                                                        <li>Free to use, no registration required</li>
                                                                        <li>All processing done in your browser</li>
                                                                </ul>
                                                        </div>
                                                </section>

                                                <footer className="mt-8 text-sm text-gray-500">
                                                        <p>All PDF processing is done securely in your browser. Your files are never uploaded to our servers.</p>
                                                </footer>
                                        </article>
                                </div>
                        </main>
                </div>
        );
} 