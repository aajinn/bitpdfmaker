"use client";

import React, { useRef, useState, useEffect } from "react";
import type { PDFDocumentProxy, WindowWithLibs } from "../../types/window";

declare const window: WindowWithLibs;

export default function PdfComparisonTool() {
        const [pdfA, setPdfA] = useState<File | null>(null);
        const [pdfB, setPdfB] = useState<File | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const fileInputA = useRef<HTMLInputElement>(null);
        const fileInputB = useRef<HTMLInputElement>(null);

        // Placeholder for difference data
        const [diffInfo, setDiffInfo] = useState<string>("");

        const [pdfADoc, setPdfADoc] = useState<PDFDocumentProxy | null>(null);
        const [pdfBDoc, setPdfBDoc] = useState<PDFDocumentProxy | null>(null);
        const [loadingA, setLoadingA] = useState(false);
        const [loadingB, setLoadingB] = useState(false);
        const [errorA, setErrorA] = useState("");
        const [errorB, setErrorB] = useState("");
        const canvasARef = useRef<HTMLCanvasElement>(null);
        const canvasBRef = useRef<HTMLCanvasElement>(null);

        // TODO: Implement PDF.js-based rendering and diffing
        const handleCompare = async () => {
                if (!pdfA || !pdfB) return;
                setIsLoading(true);
                setDiffInfo("Comparing PDFs... (feature coming soon)");
                // Here you would use PDF.js to render and compare
                setTimeout(() => {
                        setDiffInfo("Differences highlighted here (demo placeholder)");
                        setIsLoading(false);
                }, 1500);
        };

        // Load and render PDF A
        useEffect(() => {
                if (!pdfA) return;
                let cancelled = false;
                const load = async () => {
                        setLoadingA(true);
                        setErrorA("");
                        try {
                                const arrayBuffer = await pdfA.arrayBuffer();
                                const typedArray = new Uint8Array(arrayBuffer);
                                const pdf = await window.pdfjsLib?.getDocument({ data: typedArray }).promise;
                                if (!pdf) throw new Error("Failed to load PDF");
                                if (!cancelled) setPdfADoc(pdf);
                        } catch {
                                setErrorA("Failed to load PDF");
                                setPdfADoc(null);
                        } finally {
                                setLoadingA(false);
                        }
                };
                load();
                return () => { cancelled = true; };
        }, [pdfA]);

        // Load and render PDF B
        useEffect(() => {
                if (!pdfB) return;
                let cancelled = false;
                const load = async () => {
                        setLoadingB(true);
                        setErrorB("");
                        try {
                                const arrayBuffer = await pdfB.arrayBuffer();
                                const typedArray = new Uint8Array(arrayBuffer);
                                const pdf = await window.pdfjsLib?.getDocument({ data: typedArray }).promise;
                                if (!pdf) throw new Error("Failed to load PDF");
                                if (!cancelled) setPdfBDoc(pdf);
                        } catch {
                                setErrorB("Failed to load PDF");
                                setPdfBDoc(null);
                        } finally {
                                setLoadingB(false);
                        }
                };
                load();
                return () => { cancelled = true; };
        }, [pdfB]);

        // Render first page of PDF A
        useEffect(() => {
                const render = async () => {
                        if (!pdfADoc || !canvasARef.current) return;
                        try {
                                const page = await pdfADoc.getPage(1);
                                const viewport = page.getViewport({ scale: 1.2 });
                                const canvas = canvasARef.current;
                                const context = canvas.getContext("2d");
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({ canvasContext: context!, viewport }).promise;
                        } catch {
                                setErrorA("Failed to render PDF preview");
                        }
                };
                render();
        }, [pdfADoc]);

        // Render first page of PDF B
        useEffect(() => {
                const render = async () => {
                        if (!pdfBDoc || !canvasBRef.current) return;
                        try {
                                const page = await pdfBDoc.getPage(1);
                                const viewport = page.getViewport({ scale: 1.2 });
                                const canvas = canvasBRef.current;
                                const context = canvas.getContext("2d");
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({ canvasContext: context!, viewport }).promise;
                        } catch {
                                setErrorB("Failed to render PDF preview");
                        }
                };
                render();
        }, [pdfBDoc]);

        return (
                <article className="bg-white rounded-lg shadow-md p-6">
                        <header>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">PDF Comparison Tool</h1>
                                <p className="text-gray-600 mb-6 text-center">
                                        Compare two PDF files side by side, highlight differences, and track changes. 100% free and privacy-friendly.
                                </p>
                        </header>
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-start mb-6">
                                <div className="flex-1 flex flex-col items-center">
                                        <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                ref={fileInputA}
                                                onChange={e => setPdfA(e.target.files?.[0] || null)}
                                        />
                                        <button
                                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-2"
                                                onClick={() => fileInputA.current?.click()}
                                                disabled={isLoading}
                                        >
                                                {pdfA ? "Change PDF A" : "Select PDF A"}
                                        </button>
                                        {pdfA && <span className="text-sm text-gray-500 mb-2">{pdfA.name}</span>}
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                        <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                ref={fileInputB}
                                                onChange={e => setPdfB(e.target.files?.[0] || null)}
                                        />
                                        <button
                                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-2"
                                                onClick={() => fileInputB.current?.click()}
                                                disabled={isLoading}
                                        >
                                                {pdfB ? "Change PDF B" : "Select PDF B"}
                                        </button>
                                        {pdfB && <span className="text-sm text-gray-500 mb-2">{pdfB.name}</span>}
                                </div>
                        </div>
                        <div className="flex justify-center mb-6">
                                <button
                                        className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                                        onClick={handleCompare}
                                        disabled={!pdfA || !pdfB || isLoading}
                                >
                                        {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Comparing...
                                                </span>
                                        ) : (
                                                "Compare PDFs"
                                        )}
                                </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 bg-gray-50 border rounded p-2 min-h-[400px] flex flex-col items-center">
                                        <span className="font-semibold mb-2">PDF A Preview</span>
                                        {loadingA ? (
                                                <div className="w-full h-96 flex items-center justify-center text-gray-600">Loading...</div>
                                        ) : errorA ? (
                                                <div className="w-full h-96 flex items-center justify-center text-red-500">{errorA}</div>
                                        ) : (
                                                <canvas ref={canvasARef} className="w-full h-96" />
                                        )}
                                </div>
                                <div className="flex-1 bg-gray-50 border rounded p-2 min-h-[400px] flex flex-col items-center">
                                        <span className="font-semibold mb-2">PDF B Preview</span>
                                        {loadingB ? (
                                                <div className="w-full h-96 flex items-center justify-center text-gray-600">Loading...</div>
                                        ) : errorB ? (
                                                <div className="w-full h-96 flex items-center justify-center text-red-500">{errorB}</div>
                                        ) : (
                                                <canvas ref={canvasBRef} className="w-full h-96" />
                                        )}
                                </div>
                        </div>
                        <div className="mt-6 text-center text-indigo-700 font-semibold">
                                {diffInfo}
                        </div>
                        <section className="mt-8 space-y-4 text-gray-600" aria-label="Instructions">
                                <h2 className="text-xl font-semibold text-gray-900">How to Compare PDFs</h2>
                                <ol className="list-decimal list-inside space-y-2">
                                        <li>Select your first PDF file (PDF A)</li>
                                        <li>Select your second PDF file (PDF B)</li>
                                        <li>Click &quot;Compare PDFs&quot; to see the differences</li>
                                </ol>
                                <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                        <ul className="list-disc list-inside space-y-1">
                                                <li>Side-by-side PDF comparison</li>
                                                <li>Highlight differences (coming soon)</li>
                                                <li>Change tracking (coming soon)</li>
                                                <li>Free to use, no registration required</li>
                                                <li>All processing done in your browser</li>
                                                <li>Privacy-friendly: your files never leave your device</li>
                                        </ul>
                                </div>
                        </section>
                        <footer className="mt-8 text-sm text-gray-500 text-center">
                                <p>All PDF processing is done securely in your browser. Your files are never uploaded to our servers.</p>
                        </footer>
                </article>
        );
} 