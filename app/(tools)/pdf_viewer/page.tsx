"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";

declare const window: WindowWithLibs;

export default function PDFViewer() {
        const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
        const [currentPage, setCurrentPage] = useState(1);
        const [numPages, setNumPages] = useState(0);
        const [scale, setScale] = useState(1.0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const renderTaskRef = useRef<{ promise: Promise<void> } | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        // Render current page
        const renderPage = async (pageNum: number) => {
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
        };

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
        }, [currentPage, pdfDoc, scale]);

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
                <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                        <Header />

                        <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                                <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200 h-[calc(100vh-120px)] sm:h-[calc(100vh-200px)]">
                                        {/* File Upload */}
                                        {!pdfDoc ? (
                                                <label
                                                        htmlFor="pdf-upload"
                                                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2 sm:py-3 text-center font-semibold text-sm sm:text-lg transition shadow-md select-none"
                                                        tabIndex={0}
                                                        onKeyDown={(e) =>
                                                                e.key === "Enter" &&
                                                                document.getElementById("pdf-upload")?.click()
                                                        }
                                                >
                                                        {loading ? "Loading PDF..." : "Upload PDF"}
                                                </label>
                                        ) : (
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                                                        <label
                                                                htmlFor="pdf-upload"
                                                                className="w-full sm:w-auto cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg py-2 px-3 text-center font-medium text-sm transition shadow-sm select-none border border-indigo-200"
                                                                tabIndex={0}
                                                                onKeyDown={(e) =>
                                                                        e.key === "Enter" &&
                                                                        document.getElementById("pdf-upload")?.click()
                                                                }
                                                        >
                                                                Change PDF
                                                        </label>
                                                        <span className="text-indigo-700 font-medium text-sm sm:text-base">
                                                                {numPages} pages
                                                        </span>
                                                </div>
                                        )}
                                        <input
                                                type="file"
                                                id="pdf-upload"
                                                accept="application/pdf"
                                                onChange={handleFileUpload}
                                                disabled={loading}
                                                className="hidden"
                                        />

                                        {error && (
                                                <p className="text-center text-red-600 font-semibold text-sm sm:text-base select-none">
                                                        {error}
                                                </p>
                                        )}

                                        {/* PDF Controls */}
                                        {pdfDoc && (
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                                                        {/* Pagination */}
                                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                                                                <button
                                                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                                        disabled={currentPage === 1}
                                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition text-sm sm:text-base"
                                                                >
                                                                        Previous
                                                                </button>
                                                                <span className="text-indigo-700 font-semibold text-sm sm:text-base whitespace-nowrap">
                                                                        Page {currentPage} of {numPages}
                                                                </span>
                                                                <button
                                                                        onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                                                                        disabled={currentPage === numPages}
                                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition text-sm sm:text-base"
                                                                >
                                                                        Next
                                                                </button>
                                                        </div>

                                                        {/* Zoom Controls */}
                                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                                                <button
                                                                        onClick={() => handleZoom(scale - 0.1)}
                                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base touch-manipulation"
                                                                >
                                                                        -
                                                                </button>
                                                                <span className="text-indigo-700 font-semibold text-sm sm:text-base whitespace-nowrap">
                                                                        {Math.round(scale * 100)}%
                                                                </span>
                                                                <button
                                                                        onClick={() => handleZoom(scale + 0.1)}
                                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base touch-manipulation"
                                                                >
                                                                        +
                                                                </button>
                                                        </div>
                                                </div>
                                        )}

                                        {/* PDF Canvas Container */}
                                        <div
                                                ref={containerRef}
                                                className="flex-1 overflow-auto bg-gray-50 rounded-lg"
                                                onTouchMove={handleTouchZoom}
                                        >
                                                <div className="flex justify-center min-h-full p-2">
                                                        <canvas
                                                                ref={canvasRef}
                                                                className="shadow-lg rounded-lg max-w-full h-auto touch-manipulation"
                                                        />
                                                </div>
                                        </div>
                                </div>
                        </section>

                        {/* Page Navigation Menu */}
                        {pdfDoc && (
                                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
                                        <div className="max-w-4xl mx-auto px-4">
                                                <div className="relative">
                                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                                                                Pages
                                                        </div>
                                                        <div className="flex overflow-x-auto gap-2 p-4 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
                                                                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                                                                        <button
                                                                                key={pageNum}
                                                                                onClick={() => setCurrentPage(pageNum)}
                                                                                className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 transition-all ${currentPage === pageNum
                                                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                                                        : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400'
                                                                                        }`}
                                                                        >
                                                                                <span className="text-sm font-medium">{pageNum}</span>
                                                                        </button>
                                                                ))}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        )}

                        <footer className="text-bg-indigo-400 py-4 sm:py-6 text-center select-none text-sm sm:text-base">
                                &copy; {new Date().getFullYear()} BitMakerPdf. All rights reserved.
                        </footer>
                </main>
        );
}
