"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { jsPDF as JsPDFType } from "jspdf";
import Image from "next/image";

interface PageThumb {
        pageNumber: number;
        dataUrl: string;
}

export default function Tool() {
        const [file, setFile] = useState<File | null>(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [progress, setProgress] = useState("");
        const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
        const [numPages, setNumPages] = useState<number | null>(null);
        const [selectedPages, setSelectedPages] = useState<number[]>([]);
        const [splits, setSplits] = useState<number[][]>([]);
        const [splitBlobs, setSplitBlobs] = useState<{ name: string; blob: Blob }[]>([]);
        const [zipping, setZipping] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const [pageThumbs, setPageThumbs] = useState<PageThumb[]>([]);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const splitsListRef = useRef<HTMLDivElement>(null);
        const downloadBoxRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                const checkPdfJsLoaded = () => {
                        if (window.pdfjsLib && window.jspdf) {
                                setIsPdfJsLoaded(true);
                        } else {
                                setTimeout(checkPdfJsLoaded, 100);
                        }
                };
                checkPdfJsLoaded();
        }, []);

        const generateThumbnails = async (file: File, numPages: number) => {
                if (!window.pdfjsLib) return;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const thumbs: PageThumb[] = [];
                for (let i = 1; i <= numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 0.25 });
                        let canvas = canvasRef.current;
                        if (!canvas) {
                                canvas = document.createElement("canvas");
                        }
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) throw new Error("Could not get canvas context");
                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                        thumbs.push({ pageNumber: i, dataUrl });
                }
                setPageThumbs(thumbs);
        };

        const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.type !== "application/pdf") {
                        setError("Please upload a valid PDF file.");
                        return;
                }
                setLoading(true);
                setFile(file);
                setError("");
                setProgress("");
                setNumPages(null);
                setSelectedPages([]);
                setSplits([]);
                setSplitBlobs([]);
                setPageThumbs([]);
                const reader = new FileReader();
                reader.onload = async () => {
                        try {
                                const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                                const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
                                setNumPages(pdf.numPages);
                                await generateThumbnails(file, pdf.numPages);
                        } catch {
                                setError("Failed to read PDF file.");
                        } finally {
                                setLoading(false);
                        }
                };
                reader.readAsArrayBuffer(file);
        }, []);

        const handlePageCheckbox = (page: number) => {
                setSelectedPages((prev) =>
                        prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
                );
        };
        const handleSelectAll = () => {
                if (numPages) setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
        };
        const handleClearSelection = () => setSelectedPages([]);
        const handleAddSplit = () => {
                if (selectedPages.length === 0) return;
                setSplits((prev) => {
                        const newSplits = [...prev, [...selectedPages].sort((a, b) => a - b)];
                        setTimeout(() => {
                                if (splitsListRef.current) {
                                        splitsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                        }, 100);
                        return newSplits;
                });
                setSelectedPages([]);
        };
        const handleRemoveSplit = (idx: number) => {
                setSplits((prev) => prev.filter((_, i) => i !== idx));
        };
        const handleAutoSplit = (n: number) => {
                if (!numPages || n < 1) return;
                const newSplits: number[][] = [];
                for (let i = 1; i <= numPages; i += n) {
                        newSplits.push(Array.from({ length: Math.min(n, numPages - i + 1) }, (_, j) => i + j));
                }
                setSplits(newSplits);
                setSelectedPages([]);
        };

        const handleSplit = useCallback(async () => {
                if (!file || !isPdfJsLoaded || !numPages) return;
                if (!splits.length) {
                        setError("Please add at least one split group.");
                        return;
                }
                setLoading(true);
                setError("");
                setProgress("Splitting PDF...");
                setSplitBlobs([]);
                try {
                        const reader = new FileReader();
                        reader.onload = async () => {
                                try {
                                        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
                                        const pdfDoc = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
                                        const blobs: { name: string; blob: Blob }[] = [];
                                        for (let i = 0; i < splits.length; i++) {
                                                setProgress(`Processing split ${i + 1} of ${splits.length}...`);
                                                const pages = splits[i];
                                                const doc = new window.jspdf.jsPDF() as JsPDFType;
                                                for (let j = 0; j < pages.length; j++) {
                                                        const p = pages[j];
                                                        const page = await pdfDoc.getPage(p);
                                                        const viewport = page.getViewport({ scale: 2 });
                                                        const canvas = document.createElement("canvas");
                                                        canvas.width = viewport.width;
                                                        canvas.height = viewport.height;
                                                        const ctx = canvas.getContext("2d");
                                                        if (!ctx) throw new Error("Could not get canvas context");
                                                        await page.render({ canvasContext: ctx, viewport }).promise;
                                                        const imgData = canvas.toDataURL("image/jpeg", 1.0);
                                                        if (j !== 0) doc.addPage();
                                                        (doc as { addImage: (img: string, format: string, x: number, y: number, w: number, h: number) => void }).addImage(
                                                                imgData, "JPEG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()
                                                        );
                                                }
                                                const blob = (doc as { output: (type: string) => Blob }).output("blob");
                                                blobs.push({ name: `split-part-${i + 1}.pdf`, blob });
                                        }
                                        setSplitBlobs(blobs);
                                        setProgress("Done!");
                                } catch (e) {
                                        setError("Failed to split PDF. " + (e instanceof Error ? e.message : ""));
                                } finally {
                                        setLoading(false);
                                }
                        };
                        reader.readAsArrayBuffer(file);
                } catch {
                        setError("Failed to split PDF.");
                        setLoading(false);
                        setProgress("");
                }
        }, [file, isPdfJsLoaded, numPages, splits]);

        const handleDownloadZip = async () => {
                const win = window as unknown as { JSZip: new () => { file: (name: string, blob: Blob) => void; generateAsync: (opts: { type: string }) => Promise<Blob>; }; saveAs: (blob: Blob, name: string) => void };
                if (!splitBlobs.length || !win.JSZip || !win.saveAs) return;
                setZipping(true);
                try {
                        const zip = new win.JSZip();
                        splitBlobs.forEach(({ name, blob }) => {
                                zip.file(name, blob);
                        });
                        const content = await zip.generateAsync({ type: "blob" });
                        win.saveAs(content, "split-pdfs.zip");
                } catch {
                        setError("Failed to create ZIP file.");
                } finally {
                        setZipping(false);
                }
        };

        useEffect(() => {
                if (splitBlobs.length > 0 && downloadBoxRef.current) {
                        downloadBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
        }, [splitBlobs]);

        return (
                <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-3 sm:p-8 flex flex-col gap-3 sm:gap-6 border border-indigo-200">
                                <div className="text-center mb-4">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                                Split PDF Files Online
                                        </h1>
                                        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                                                Easily split your PDF into multiple files. Extract specific pages or custom page ranges and save as separate PDFs. Fast, secure, and free.
                                        </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="font-semibold text-gray-900">Custom Page Ranges</h3>
                                                <p className="text-sm text-gray-600">Split by any pages or ranges you want</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <h3 className="font-semibold text-gray-900">No Registration</h3>
                                                <p className="text-sm text-gray-600">100% free, no signup required</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <h3 className="font-semibold text-gray-900">Secure & Fast</h3>
                                                <p className="text-sm text-gray-600">All processing in your browser</p>
                                        </div>
                                </div>
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
                                                ref={fileInputRef}
                                        />
                                </div>
                                {numPages && pageThumbs.length === numPages && (
                                        <div className="flex flex-col gap-2 mt-2">
                                                <label className="font-medium text-gray-700 mb-1">Select pages for a split</label>
                                                <div className="relative">
                                                        <div className="sticky top-0 z-10 bg-white/90 border-b border-indigo-100 flex flex-wrap gap-2 py-2 px-1 mb-2 rounded-t-lg shadow-sm">
                                                                <button type="button" className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm" onClick={handleSelectAll} disabled={loading}>Select All</button>
                                                                <button type="button" className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm" onClick={handleClearSelection} disabled={loading}>Clear</button>
                                                                <button type="button" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" onClick={handleAddSplit} disabled={loading || selectedPages.length === 0}>Add Split</button>
                                                                <button type="button" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm" onClick={() => handleAutoSplit(2)} disabled={loading}>Auto Split (2 pages)</button>
                                                                <button type="button" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm" onClick={() => handleAutoSplit(5)} disabled={loading}>Auto Split (5 pages)</button>
                                                                <button
                                                                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold text-sm disabled:opacity-60"
                                                                        onClick={handleSplit}
                                                                        disabled={loading || splits.length === 0}
                                                                >
                                                                        {loading ? "Splitting..." : "Split PDF"}
                                                                </button>
                                                                {splits.length > 0 && (
                                                                        <div ref={splitsListRef} className="flex items-center gap-2 overflow-x-auto py-2 px-1 mb-2 bg-indigo-50 rounded-b-lg border-b border-indigo-100">
                                                                                <span className="font-medium text-indigo-700 mr-2">Splits:</span>
                                                                                {splits.map((group, idx) => (
                                                                                        <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-white border border-indigo-200 rounded-lg shadow-sm">
                                                                                                <span className="text-sm text-indigo-700 whitespace-nowrap">Pages: {group.join(", ")}</span>
                                                                                                <button type="button" className="ml-2 text-red-500 hover:text-red-700 text-xs" onClick={() => handleRemoveSplit(idx)} title="Remove split">&times;</button>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-2">
                                                                {pageThumbs.map(({ pageNumber, dataUrl }) => (
                                                                        <label key={pageNumber} className={`relative group cursor-pointer border rounded-lg overflow-hidden ${selectedPages.includes(pageNumber) ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-gray-300'}`}>
                                                                                <Image
                                                                                        src={dataUrl}
                                                                                        alt={`Page ${pageNumber}`}
                                                                                        width={120}
                                                                                        height={160}
                                                                                        className="w-full aspect-[3/4] object-contain bg-gray-50"
                                                                                        unoptimized
                                                                                />
                                                                                <input
                                                                                        type="checkbox"
                                                                                        checked={selectedPages.includes(pageNumber)}
                                                                                        onChange={() => handlePageCheckbox(pageNumber)}
                                                                                        className="absolute top-2 left-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white bg-opacity-80"
                                                                                        disabled={loading}
                                                                                />
                                                                                <span className="absolute bottom-1 left-1 bg-white bg-opacity-80 text-xs px-1 rounded text-gray-700">{pageNumber}</span>
                                                                        </label>
                                                                ))}
                                                        </div>
                                                </div>
                                                <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                )}
                                {progress && (
                                        <p className="text-center text-indigo-700 font-medium text-sm sm:text-base">
                                                {progress}
                                        </p>
                                )}
                                {error && (
                                        <p className="text-center text-red-600 font-semibold text-sm sm:text-base">
                                                {error}
                                        </p>
                                )}
                                {splitBlobs.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-4" ref={downloadBoxRef}>
                                                <h2 className="text-lg font-semibold text-gray-800">Download Split PDFs</h2>
                                                <div className="flex flex-wrap gap-3">
                                                        {splitBlobs.map(({ name, blob }, i) => (
                                                                <a
                                                                        key={i}
                                                                        href={URL.createObjectURL(blob)}
                                                                        download={name}
                                                                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold transition"
                                                                >
                                                                        {name}
                                                                </a>
                                                        ))}
                                                </div>
                                                <button
                                                        className="mt-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 font-semibold w-fit disabled:opacity-60"
                                                        onClick={handleDownloadZip}
                                                        disabled={zipping}
                                                >
                                                        {zipping ? "Creating ZIP..." : "Download All as ZIP"}
                                                </button>
                                        </div>
                                )}
                        </div>
                </section>
        );
} 