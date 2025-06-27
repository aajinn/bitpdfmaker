"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PDFDocumentProxy, WindowWithLibs } from "@/app/types/window";

declare const window: WindowWithLibs;

export default function PdfViewerTool() {
        const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
        const [currentPage, setCurrentPage] = useState(1);
        const [numPages, setNumPages] = useState(0);
        const [scale, setScale] = useState(1.0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const renderTaskRef = useRef<{ promise: Promise<void> } | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        // Render current page
        const renderPage = useCallback(async (pageNum: number) => {
                if (!pdfDoc || !canvasRef.current) return;

                try {
                        const page = await pdfDoc.getPage(pageNum);
                        const canvas = canvasRef.current;
                        const context = canvas.getContext("2d");
                        if (!context) return;

                        const viewport = page.getViewport({ scale });
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        const renderContext = {
                                canvasContext: context,
                                viewport: viewport,
                        };

                        const task = page.render(renderContext);
                        renderTaskRef.current = task;
                        await task.promise;
                } catch (err) {
                        console.error("Error rendering page:", err);
                        setError("Failed to render page");
                }
        }, [pdfDoc, scale]);

        // Handle file upload
        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.type !== "application/pdf") {
                        setError("Please upload a valid PDF file");
                        return;
                }

                setLoading(true);
                setError("");

                try {
                        const arrayBuffer = await file.arrayBuffer();
                        const typedArray = new Uint8Array(arrayBuffer);
                        const pdf = await window.pdfjsLib?.getDocument({ data: typedArray }).promise;

                        if (!pdf) {
                                throw new Error("Failed to load PDF");
                        }

                        setPdfDoc(pdf);
                        setNumPages(pdf.numPages);
                        setCurrentPage(1);
                        setScale(1.0);
                } catch (err) {
                        console.error("Error loading PDF:", err);
                        setError("Failed to load PDF");
                } finally {
                        setLoading(false);
                }
        };

        // Handle page change
        useEffect(() => {
                if (pdfDoc) {
                        renderPage(currentPage);
                }
        }, [currentPage, pdfDoc, scale, renderPage]);

        // Cleanup on unmount
        useEffect(() => {
                return () => {
                        renderTaskRef.current = null;
                };
        }, []);

        // Handle zoom with touch events
        const handleTouchZoom = (e: React.TouchEvent) => {
                if (e.touches.length === 2) {
                        e.preventDefault();
                        const touch1 = e.touches[0];
                        const touch2 = e.touches[1];
                        const distance = Math.hypot(
                                touch2.clientX - touch1.clientX,
                                touch2.clientY - touch1.clientY
                        );

                        if (distance > 100) {
                                handleZoom(scale + 0.1);
                        } else if (distance < 50) {
                                handleZoom(scale - 0.1);
                        }
                }
        };

        // Handle zoom
        const handleZoom = (newScale: number) => {
                const clampedScale = Math.max(0.5, Math.min(3, newScale));
                setScale(clampedScale);
        };

        return (
                <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200 h-[calc(100vh-120px)] sm:h-[calc(100vh-200px)]">
                        {/* Hero Content - Only shown when no PDF is loaded */}
                        {!pdfDoc && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4">
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6 text-indigo-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                        </div>
                                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                                                PDF Viewer
                                        </h1>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8 max-w-md">
                                                Upload your PDF file to view, zoom, and navigate through its pages.
                                                Our viewer supports all PDF formats and provides a smooth reading experience.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
                                                <label
                                                        htmlFor="pdf-upload-viewer"
                                                        className="w-full sm:w-auto cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 text-center font-semibold text-base sm:text-lg transition shadow-md select-none"
                                                        tabIndex={0}
                                                        onKeyDown={(e) =>
                                                                e.key === "Enter" &&
                                                                document.getElementById("pdf-upload-viewer")?.click()
                                                        }
                                                >
                                                        {loading ? "Loading PDF..." : "Upload PDF"}
                                                </label>
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                        or drag and drop your file here
                                                </span>
                                        </div>
                                        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                                                <h2 className="sr-only">Features</h2>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Zoom Control</h3>
                                                        <p className="text-xs sm:text-sm text-gray-600">Pinch to zoom or use the zoom controls</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Page Navigation</h3>
                                                        <p className="text-xs sm:text-sm text-gray-600">Easy navigation through page numbers</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Mobile Friendly</h3>
                                                        <p className="text-xs sm:text-sm text-gray-600">Works perfectly on all devices</p>
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* File Upload - Only shown when no PDF is loaded */}
                        {!pdfDoc && (
                                <input
                                        type="file"
                                        id="pdf-upload-viewer"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        disabled={loading}
                                        className="hidden"
                                />
                        )}

                        {/* PDF Content - Only shown when PDF is loaded */}
                        {pdfDoc && (
                                <>
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                                                <label
                                                        htmlFor="pdf-upload-viewer"
                                                        className="w-full sm:w-auto cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg py-2 px-3 text-center font-medium text-sm transition shadow-sm select-none border border-indigo-200"
                                                        tabIndex={0}
                                                        onKeyDown={(e) =>
                                                                e.key === "Enter" &&
                                                                document.getElementById("pdf-upload-viewer")?.click()
                                                        }
                                                >
                                                        Change PDF
                                                </label>
                                                <span className="text-indigo-700 font-medium text-sm">
                                                        {numPages} pages
                                                </span>
                                        </div>

                                        {/* File Upload Input - Always present but hidden */}
                                        <input
                                                type="file"
                                                id="pdf-upload-viewer"
                                                accept="application/pdf"
                                                onChange={handleFileUpload}
                                                disabled={loading}
                                                className="hidden"
                                        />

                                        {error && (
                                                <p className="text-center text-red-600 font-semibold text-sm select-none">
                                                        {error}
                                                </p>
                                        )}

                                        {/* PDF Controls */}
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                                                {/* Pagination */}
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                                                        <button
                                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                                disabled={currentPage === 1}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition text-sm"
                                                        >
                                                                Previous
                                                        </button>
                                                        <span className="text-indigo-700 font-semibold text-sm whitespace-nowrap">
                                                                Page {currentPage} of {numPages}
                                                        </span>
                                                        <button
                                                                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                                                                disabled={currentPage === numPages}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition text-sm"
                                                        >
                                                                Next
                                                        </button>
                                                </div>

                                                {/* Zoom Controls */}
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                                        <button
                                                                onClick={() => handleZoom(scale - 0.1)}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm touch-manipulation"
                                                        >
                                                                Zoom Out
                                                        </button>
                                                        <span className="text-indigo-700 font-semibold text-sm whitespace-nowrap">
                                                                {Math.round(scale * 100)}%
                                                        </span>
                                                        <button
                                                                onClick={() => handleZoom(scale + 0.1)}
                                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm touch-manipulation"
                                                        >
                                                                Zoom In
                                                        </button>
                                                </div>
                                        </div>

                                        {/* Canvas Container */}
                                        <div
                                                ref={containerRef}
                                                className="flex-1 overflow-auto bg-gray-100 rounded-lg mt-2 sm:mt-4 border border-indigo-200"
                                                onTouchMove={handleTouchZoom}
                                        >
                                                <canvas ref={canvasRef} />
                                        </div>
                                </>
                        )}
                </div>
        );
} 