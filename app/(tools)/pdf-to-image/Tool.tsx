"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Image from "next/image";
import { PDFPageProxy } from "pdfjs-dist";

interface PageImage {
        pageNumber: number;
        dataUrl: string;
        blob: Blob;
}

export default function PdfToImageTool() {
        const [file, setFile] = useState<File | null>(null);
        const [loading, setLoading] = useState(false);
        const [progress, setProgress] = useState(0);
        const [error, setError] = useState<string | null>(null);
        const [pageImages, setPageImages] = useState<PageImage[]>([]);
        const [selectedPages, setSelectedPages] = useState<number[]>([]);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile && selectedFile.type === 'application/pdf') {
                        setFile(selectedFile);
                        setError(null);
                        setPageImages([]);
                        setSelectedPages([]);
                        // Automatically start processing when file is selected
                        processPDF(selectedFile);
                } else {
                        setError('Please select a valid PDF file');
                }
        };

        const convertPageToImage = async (page: PDFPageProxy, pageNumber: number): Promise<PageImage> => {
                const canvas = canvasRef.current;
                if (!canvas) throw new Error('Canvas not initialized');

                const viewport = page.getViewport({ scale: 2 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d');
                if (!context) throw new Error('Could not get canvas context');

                await page.render({
                        canvasContext: context,
                        viewport: viewport
                }).promise;

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const blob = await (await fetch(dataUrl)).blob();

                return {
                        pageNumber,
                        dataUrl,
                        blob
                };
        };

        const processPDF = async (selectedFile?: File) => {
                const fileToProcess = selectedFile || file;
                if (!fileToProcess || !window.pdfjsLib) return;

                try {
                        setLoading(true);
                        setProgress(0);
                        setError(null);

                        const arrayBuffer = await fileToProcess.arrayBuffer();
                        const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                        const totalPages = pdf.numPages;
                        const images: PageImage[] = [];

                        for (let i = 1; i <= totalPages; i++) {
                                const page = await pdf.getPage(i);
                                const image = await convertPageToImage(page, i);
                                images.push(image);
                                setProgress((i / totalPages) * 100);
                        }

                        setPageImages(images);
                        setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
                } catch (err) {
                        setError('Error processing PDF: ' + (err instanceof Error ? err.message : String(err)));
                } finally {
                        setLoading(false);
                }
        };

        const handlePageSelection = (pageNumber: number) => {
                setSelectedPages(prev =>
                        prev.includes(pageNumber)
                                ? prev.filter(p => p !== pageNumber)
                                : [...prev, pageNumber]
                );
        };

        const downloadImages = async () => {
                if (selectedPages.length === 0) return;

                try {
                        setLoading(true);
                        const zip = new JSZip();

                        for (const pageNumber of selectedPages) {
                                const image = pageImages.find(img => img.pageNumber === pageNumber);
                                if (image) {
                                        zip.file(`page-${pageNumber}.jpg`, image.blob);
                                }
                        }

                        const content = await zip.generateAsync({ type: 'blob' });
                        saveAs(content, 'pdf-images.zip');
                } catch (err) {
                        setError('Error creating zip file: ' + (err instanceof Error ? err.message : String(err)));
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200">
                        {/* Marketing Header */}
                        <div className="text-center mb-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                        PDF to Image Converter
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                                        Convert your PDF pages into high-quality images. Select specific pages or convert all at once.
                                        Download as individual images or as a ZIP file.
                                </p>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <h2 className="sr-only">Features</h2>
                                <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <h3 className="font-semibold text-gray-900">High Quality</h3>
                                        <p className="text-sm text-gray-600">Convert to JPG or PNG with adjustable quality</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="font-semibold text-gray-900">Select Pages</h3>
                                        <p className="text-sm text-gray-600">Choose which pages to convert</p>
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
                                        htmlFor="pdf-file"
                                        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-2 sm:py-3 text-center font-semibold text-sm sm:text-base transition shadow-md select-none"
                                        tabIndex={0}
                                        onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                document.getElementById("pdf-file")?.click()
                                        }
                                >
                                        {loading ? "Processing PDF..." : "Upload PDF"}
                                </label>
                                <input
                                        id="pdf-file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                        className="hidden"
                                />
                        </div>

                        {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                </div>
                        )}

                        {loading && (
                                <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 text-center">
                                                Processing... {Math.round(progress)}%
                                        </p>
                                </div>
                        )}

                        {pageImages.length > 0 && (
                                <div className="space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {pageImages.map((image) => (
                                                        <div key={image.pageNumber} className="relative">
                                                                <div className="relative w-full aspect-[3/4] border rounded-lg overflow-hidden bg-gray-50">
                                                                        <Image
                                                                                src={image.dataUrl}
                                                                                alt={`Page ${image.pageNumber}`}
                                                                                fill
                                                                                className="object-contain"
                                                                        />
                                                                        <div className="absolute top-2 left-2">
                                                                                <input
                                                                                        type="checkbox"
                                                                                        checked={selectedPages.includes(image.pageNumber)}
                                                                                        onChange={() => handlePageSelection(image.pageNumber)}
                                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <p className="text-sm text-center mt-1 text-gray-600">
                                                                        Page {image.pageNumber}
                                                                </p>
                                                        </div>
                                                ))}
                                        </div>

                                        <div className="flex justify-end">
                                                <button
                                                        onClick={downloadImages}
                                                        disabled={selectedPages.length === 0 || loading}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download Selected Pages
                                                </button>
                                        </div>
                                </div>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
        );
} 