"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import type { TextItem, PDFDocumentLoadingTask, TesseractProgress, WindowWithLibs } from "@/app/types/window";
import Head from "next/head";

declare const window: WindowWithLibs;

export default function ExtractTextFromPDF() {
        const [text, setText] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [progress, setProgress] = useState("");
        const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
        const [copySuccess, setCopySuccess] = useState(false);
        const [currentFileName, setCurrentFileName] = useState("");
        const [showOcrOption, setShowOcrOption] = useState(false);
        const [currentPdfFile, setCurrentPdfFile] = useState<File | null>(null);

        useEffect(() => {
                const checkPdfJsLoaded = () => {
                        if (window.pdfjsLib) {
                                setIsPdfJsLoaded(true);
                        } else {
                                setTimeout(checkPdfJsLoaded, 100);
                        }
                };
                checkPdfJsLoaded();
        }, []);

        const extractText = useCallback(async (file: File) => {
                if (!isPdfJsLoaded) {
                        setError("PDF.js library is still loading. Please try again in a moment.");
                        return;
                }

                setError("");
                setLoading(true);
                setText("");
                setProgress("Starting PDF processing...");

                try {
                        const reader = new FileReader();

                        reader.onload = async () => {
                                try {
                                        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                                        const loadingTask: PDFDocumentLoadingTask = window.pdfjsLib.getDocument({ data: typedArray });
                                        const pdf = await loadingTask.promise;
                                        let fullText = "";

                                        if (pdf.numPages === 0) {
                                                setError("The PDF appears to be empty or corrupted.");
                                                setLoading(false);
                                                return;
                                        }

                                        for (let i = 1; i <= pdf.numPages; i++) {
                                                setProgress(`Extracting text from page ${i} of ${pdf.numPages}...`);
                                                const page = await pdf.getPage(i);
                                                const textContent = await page.getTextContent();
                                                const pageText = textContent.items
                                                        .map((item: TextItem) => item.str)
                                                        .join(" ");
                                                fullText += pageText + "\n\n";
                                        }

                                        setProgress("Text extraction completed!");
                                        const trimmedText = fullText.trim();
                                        if (!trimmedText) {
                                                setError("No text content found in the PDF. This might be an image-based PDF.");
                                                setShowOcrOption(true);
                                        } else {
                                                setText(trimmedText);
                                        }
                                } catch (err) {
                                        console.error("PDF processing error:", err);
                                        setError("Failed to process PDF. " + (err instanceof Error ? err.message : ""));
                                } finally {
                                        setLoading(false);
                                }
                        };

                        reader.onerror = () => {
                                setError("Failed to read the file");
                                setLoading(false);
                        };

                        reader.readAsArrayBuffer(file);
                } catch (err) {
                        console.error("Extract text error:", err);
                        setError("Failed to extract text from PDF.");
                        setLoading(false);
                        setProgress("");
                }
        }, [isPdfJsLoaded]);

        const handleUpload = useCallback(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.type !== "application/pdf") {
                                setError("Please upload a valid PDF file.");
                                return;
                        }

                        // Store the original filename without extension
                        setCurrentFileName(file.name.replace(/\.pdf$/i, ''));
                        setCurrentPdfFile(file);

                        // Clear old progress and data when new PDF is uploaded
                        setProgress("");
                        setError("");
                        setLoading(false);
                        setText("");
                        setShowOcrOption(false);

                        extractText(file);
                },
                [extractText]
        );

        const copyToClipboard = useCallback(() => {
                navigator.clipboard.writeText(text).then(() => {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
                });
        }, [text]);

        const downloadAsTxt = useCallback(() => {
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentFileName || 'extracted-text'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
        }, [text, currentFileName]);

        const processWithOcr = useCallback(async () => {
                if (!currentPdfFile || !window.Tesseract) {
                        setError("OCR library not loaded. Please try again shortly.");
                        return;
                }

                setError("");
                setLoading(true);
                setText("");
                setProgress("Starting OCR processing...");

                try {
                        const arrayBuffer = await currentPdfFile.arrayBuffer();
                        const typedArray = new Uint8Array(arrayBuffer);
                        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
                        let fullText = "";

                        for (let i = 1; i <= pdf.numPages; i++) {
                                setProgress(`Processing page ${i} of ${pdf.numPages} with OCR...`);
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

                                // Create canvas for the page
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                if (!context) {
                                        throw new Error("Could not get canvas context");
                                }
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                // Render PDF page to canvas
                                await page.render({
                                        canvasContext: context,
                                        viewport: viewport
                                }).promise;

                                // Convert canvas to image data
                                const imageData = canvas.toDataURL('image/png');

                                // Process with Tesseract
                                const result = await window.Tesseract.recognize(
                                        imageData,
                                        'eng',
                                        {
                                                logger: (m: TesseractProgress) => {
                                                        if (m.status === 'recognizing text') {
                                                                setProgress(`OCR processing page ${i}: ${Math.round(m.progress * 100)}%`);
                                                        }
                                                }
                                        }
                                );

                                fullText += result.data.text + "\n\n";
                        }

                        setProgress("OCR processing completed!");
                        setText(fullText.trim());
                } catch (err) {
                        setError("Failed to process PDF with OCR. " + (err instanceof Error ? err.message : ""));
                } finally {
                        setLoading(false);
                }
        }, [currentPdfFile]);

        return (
                <>
                        <Head>
                                <title>Extract Text from PDF - Free Online PDF Text Extractor | BitMakerPdf</title>
                                <meta name="description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results. No registration required." />
                                <meta name="keywords" content="PDF text extractor, PDF to text, extract text from PDF, PDF OCR, image PDF to text, free PDF converter" />
                                <meta property="og:title" content="Extract Text from PDF - Free Online PDF Text Extractor" />
                                <meta property="og:description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results." />
                                <meta property="og:type" content="website" />
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Extract Text from PDF - Free Online PDF Text Extractor" />
                                <meta name="twitter:description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results." />
                        </Head>
                        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                                <Header />
                                <ExternalScripts />
                                <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                                        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200">
                                                {/* Marketing Header */}
                                                <div className="text-center mb-4">
                                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                                                Extract Text from PDF Files
                                                        </h1>
                                                        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                                                                Transform your PDF documents into editable text with our powerful extraction tool.
                                                                Perfect for research, data analysis, and content reuse.
                                                                Supports both text-based and image-based PDFs with advanced OCR technology.
                                                        </p>
                                                </div>

                                                {/* Features List */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <h3 className="font-semibold text-gray-900">High Accuracy</h3>
                                                                <p className="text-sm text-gray-600">Precise text extraction with perfect formatting</p>
                                                        </div>
                                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <h3 className="font-semibold text-gray-900">OCR Support</h3>
                                                                <p className="text-sm text-gray-600">Extract text from image-based PDFs</p>
                                                        </div>
                                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                                <h3 className="font-semibold text-gray-900">Secure & Free</h3>
                                                                <p className="text-sm text-gray-600">100% free, no registration required</p>
                                                        </div>
                                                </div>

                                                {/* File Upload */}
                                                <div className="flex flex-col gap-3">
                                                        <label
                                                                htmlFor="pdf-upload"
                                                                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2 sm:py-3 text-center font-semibold text-sm sm:text-base transition shadow-md select-none"
                                                                tabIndex={0}
                                                                onKeyDown={(e) =>
                                                                        e.key === "Enter" &&
                                                                        document.getElementById("pdf-upload")?.click()
                                                                }
                                                        >
                                                                {loading ? "Processing PDF..." : "Upload PDF"}
                                                        </label>
                                                        <input
                                                                type="file"
                                                                id="pdf-upload"
                                                                accept="application/pdf"
                                                                onChange={handleUpload}
                                                                disabled={loading}
                                                                className="hidden"
                                                        />
                                                </div>

                                                {/* Progress and Error Messages */}
                                                {progress && (
                                                        <p className="text-center text-indigo-700 font-medium text-sm sm:text-base">
                                                                {progress}
                                                        </p>
                                                )}
                                                {error && (
                                                        <div className="flex flex-col items-center gap-2">
                                                                <p className="text-center text-red-600 font-semibold text-sm sm:text-base">
                                                                        {error}
                                                                </p>
                                                                {showOcrOption && (
                                                                        <button
                                                                                onClick={processWithOcr}
                                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm sm:text-base flex items-center gap-2"
                                                                                disabled={loading}
                                                                        >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                                                                                </svg>
                                                                                Process with OCR
                                                                        </button>
                                                                )}
                                                        </div>
                                                )}

                                                {/* Text Preview */}
                                                {text && (
                                                        <div className="flex flex-col gap-3">
                                                                <div className="flex flex-wrap justify-between items-center gap-2">
                                                                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                                                                Extracted Text
                                                                        </h2>
                                                                        <div className="flex gap-2">
                                                                                <button
                                                                                        onClick={copyToClipboard}
                                                                                        className={`px-4 py-2 ${copySuccess
                                                                                                ? 'bg-green-700'
                                                                                                : 'bg-green-600 hover:bg-green-700'
                                                                                                } text-white rounded-lg transition text-sm sm:text-base flex items-center gap-2`}
                                                                                >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                                {copySuccess ? (
                                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                                ) : (
                                                                                                        <>
                                                                                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                                                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                                                                        </>
                                                                                                )}
                                                                                        </svg>
                                                                                        {copySuccess ? 'Copied!' : 'Copy'}
                                                                                </button>
                                                                                <button
                                                                                        onClick={downloadAsTxt}
                                                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm sm:text-base flex items-center gap-2"
                                                                                >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                        Download
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                                <div className="relative w-full">
                                                                        <textarea
                                                                                value={text}
                                                                                readOnly
                                                                                className="w-full h-64 sm:h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base resize-none bg-gray-50 font-mono"
                                                                                style={{ minHeight: '16rem' }}
                                                                        />
                                                                </div>
                                                        </div>
                                                )}
                                        </div>
                                </section>

                                <footer className="text-bg-indigo-400 py-4 sm:py-6 text-center select-none text-sm sm:text-base">
                                        &copy; {new Date().getFullYear()} BitMakerPdf. All rights reserved.
                                </footer>
                        </main>
                </>
        );
} 