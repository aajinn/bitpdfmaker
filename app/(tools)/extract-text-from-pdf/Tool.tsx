"use client";

import { useState, useCallback, useEffect } from "react";
import type { TextItem, PDFDocumentLoadingTask, TesseractProgress, WindowWithLibs } from "@/app/types/window";

declare const window: WindowWithLibs;

export default function ExtractTextFromPdfTool() {
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
                                        if (!window.pdfjsLib) {
                                                throw new Error("PDF.js library not loaded");
                                        }
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
                        if (!window.pdfjsLib) {
                                throw new Error("PDF.js library not loaded");
                        }
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
                                        <p className="text-sm text-gray-600">Preserves original layout and formatting</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <h3 className="font-semibold text-gray-900">OCR for Images</h3>
                                        <p className="text-sm text-gray-600">Extracts text from scanned PDFs and images</p>
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
                                        htmlFor="pdf-file-extract"
                                        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2 sm:py-3 text-center font-semibold text-sm sm:text-base transition shadow-md select-none"
                                        tabIndex={0}
                                        onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                document.getElementById("pdf-file-extract")?.click()
                                        }
                                >
                                        {loading ? progress : "Upload PDF"}
                                </label>
                                <input
                                        id="pdf-file-extract"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleUpload}
                                        disabled={loading}
                                        className="hidden"
                                />
                        </div>

                        {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                </div>
                        )}

                        {showOcrOption && !loading && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-center">
                                        <p className="text-sm text-yellow-800 mb-2">
                                                No text was found. This could be an image-based PDF. Would you like to try our OCR (Optical Character Recognition) engine?
                                        </p>
                                        <button
                                                onClick={processWithOcr}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                                Try OCR
                                        </button>
                                </div>
                        )}

                        {text && !loading && (
                                <div className="space-y-4">
                                        <div className="relative">
                                                <textarea
                                                        value={text}
                                                        readOnly
                                                        className="w-full h-64 p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Extracted text will appear here"
                                                ></textarea>
                                                <button
                                                        onClick={copyToClipboard}
                                                        className="absolute top-3 right-3 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                                                >
                                                        {copySuccess ? 'Copied!' : 'Copy'}
                                                </button>
                                        </div>
                                        <div className="flex justify-end">
                                                <button
                                                        onClick={downloadAsTxt}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download .txt
                                                </button>
                                        </div>
                                </div>
                        )}
                </div>
        );
} 