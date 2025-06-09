"use client";

import { useState, useRef, useCallback, memo } from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Image from "next/image";
import Head from "next/head";
import { jsPDF } from 'jspdf';

// Types
interface Watermark {
        id: string;
        type: 'text' | 'image';
        content: string;
        position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        opacity: number;
        rotation: number;
        scale: number;
        pages: number[];
        color?: string;
}

type CustomJsPDF = jsPDF & {
        setTextColor: { (r: number, g: number, b: number, a?: number): jsPDF };
        setFontSize: { (size: number): jsPDF };
        text: { (text: string, x: number, y: number, options?: { angle: number }): jsPDF };
}

// Memoized components
const WatermarkForm = memo(({ watermark, onUpdate, totalPages }: {
        watermark: Watermark;
        onUpdate: (id: string, updates: Partial<Watermark>) => void;
        totalPages: number;
}) => (
        <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                                {watermark.type === 'text' ? (
                                        <input
                                                type="text"
                                                name="content"
                                                value={watermark.content}
                                                onChange={(e) => onUpdate(watermark.id, { content: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter watermark text"
                                        />
                                ) : (
                                        <div className="relative h-20 w-20">
                                                <Image
                                                        src={watermark.content}
                                                        alt="Watermark preview"
                                                        fill
                                                        className="object-contain"
                                                        sizes="80px"
                                                />
                                        </div>
                                )}
                        </div>
                        <button
                                onClick={() => onUpdate(watermark.id, {})}
                                className="p-1 text-gray-500 hover:text-red-500"
                        >
                                ×
                        </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                </label>
                                <select
                                        name="position"
                                        value={watermark.position}
                                        onChange={(e) => onUpdate(watermark.id, { position: e.target.value as Watermark['position'] })}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                        <option value="top-left">Top Left</option>
                                        <option value="top-right">Top Right</option>
                                        <option value="bottom-left">Bottom Left</option>
                                        <option value="bottom-right">Bottom Right</option>
                                        <option value="center">Center</option>
                                </select>
                        </div>

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Opacity
                                </label>
                                <input
                                        type="range"
                                        name="opacity"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={watermark.opacity}
                                        onChange={(e) => onUpdate(watermark.id, { opacity: parseFloat(e.target.value) })}
                                        className="w-full"
                                />
                        </div>

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rotation (degrees)
                                </label>
                                <input
                                        type="number"
                                        name="rotation"
                                        min="-180"
                                        max="180"
                                        value={watermark.rotation}
                                        onChange={(e) => onUpdate(watermark.id, { rotation: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                        </div>

                        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scale
                                </label>
                                <input
                                        type="number"
                                        name="scale"
                                        min="0.1"
                                        max="2"
                                        step="0.1"
                                        value={watermark.scale}
                                        onChange={(e) => onUpdate(watermark.id, { scale: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                        </div>
                </div>

                {watermark.type === 'text' && (
                        <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Text Color
                                </label>
                                <div className="flex items-center space-x-2">
                                        <input
                                                type="color"
                                                value={watermark.color || '#000000'}
                                                onChange={(e) => onUpdate(watermark.id, { color: e.target.value })}
                                                className="h-8 w-8 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">
                                                {watermark.color || '#000000'}
                                        </span>
                                </div>
                        </div>
                )}

                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pages
                        </label>
                        <div className="flex flex-wrap gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <label key={page} className="inline-flex items-center">
                                                <input
                                                        type="checkbox"
                                                        checked={watermark.pages.includes(page)}
                                                        onChange={(e) => {
                                                                const newPages = e.target.checked
                                                                        ? [...watermark.pages, page]
                                                                        : watermark.pages.filter(p => p !== page);
                                                                onUpdate(watermark.id, { pages: newPages });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{page}</span>
                                        </label>
                                ))}
                        </div>
                </div>
        </div>
));

WatermarkForm.displayName = 'WatermarkForm';

export default function PDFWatermark() {
        const [file, setFile] = useState<File | null>(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [progress, setProgress] = useState(0);
        const [watermarks, setWatermarks] = useState<Watermark[]>([]);
        const [selectedPages, setSelectedPages] = useState<number[]>([]);
        const [totalPages, setTotalPages] = useState(0);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const watermarkImageInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile && selectedFile.type === 'application/pdf') {
                        setFile(selectedFile);
                        setError(null);
                        setWatermarks([]);
                        setSelectedPages([]);

                        try {
                                const arrayBuffer = await selectedFile.arrayBuffer();
                                const uint8Array = new Uint8Array(arrayBuffer);
                                const pdf = await window.pdfjsLib.getDocument({ data: uint8Array }).promise;
                                setTotalPages(pdf.numPages);
                                setSelectedPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
                        } catch (err) {
                                setError('Error loading PDF file');
                                console.error(err);
                        }
                } else {
                        setError('Please select a valid PDF file');
                }
        }, []);

        const addTextWatermark = useCallback(() => {
                const newWatermark: Watermark = {
                        id: Date.now().toString(),
                        type: 'text',
                        content: 'Watermark',
                        position: 'center',
                        opacity: 0.5,
                        rotation: 0,
                        scale: 1,
                        pages: [...selectedPages],
                        color: '#000000'
                };
                setWatermarks(prev => [...prev, newWatermark]);
        }, [selectedPages]);

        const addImageWatermark = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                                const newWatermark: Watermark = {
                                        id: Date.now().toString(),
                                        type: 'image',
                                        content: event.target?.result as string,
                                        position: 'center',
                                        opacity: 0.5,
                                        rotation: 0,
                                        scale: 1,
                                        pages: [...selectedPages]
                                };
                                setWatermarks(prev => [...prev, newWatermark]);
                        };
                        reader.readAsDataURL(file);
                }
        }, [selectedPages]);

        const updateWatermark = useCallback((id: string, updates: Partial<Watermark>) => {
                setWatermarks(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
        }, []);

        const applyWatermarks = useCallback(async () => {
                if (!file || watermarks.length === 0) {
                        setError('Please select a PDF file and add at least one watermark');
                        return;
                }

                setLoading(true);
                setError(null);
                setProgress(0);

                try {
                        const arrayBuffer = await file.arrayBuffer();
                        const uint8Array = new Uint8Array(arrayBuffer);
                        const pdf = await window.pdfjsLib.getDocument({ data: uint8Array }).promise;
                        const newPdf = new jsPDF();

                        for (let i = 0; i < pdf.numPages; i++) {
                                const page = await pdf.getPage(i + 1);
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                if (!context) throw new Error('Could not get canvas context');

                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                await page.render({
                                        canvasContext: context,
                                        viewport: viewport
                                }).promise;

                                if (i > 0) newPdf.addPage();

                                const img = new window.Image();
                                img.src = canvas.toDataURL('image/jpeg', 1.0);
                                await new Promise((resolve) => {
                                        img.onload = resolve;
                                });

                                newPdf.addImage(
                                        img,
                                        'JPEG',
                                        0,
                                        0,
                                        newPdf.internal.pageSize.getWidth(),
                                        newPdf.internal.pageSize.getHeight()
                                );

                                const pageWatermarks = watermarks.filter(w => w.pages.includes(i + 1));
                                for (const watermark of pageWatermarks) {
                                        const { position, opacity, rotation, scale } = watermark;
                                        let x = 0, y = 0;

                                        switch (position) {
                                                case 'top-left':
                                                        x = 20;
                                                        y = 20;
                                                        break;
                                                case 'top-right':
                                                        x = newPdf.internal.pageSize.getWidth() - 20;
                                                        y = 20;
                                                        break;
                                                case 'bottom-left':
                                                        x = 20;
                                                        y = newPdf.internal.pageSize.getHeight() - 20;
                                                        break;
                                                case 'bottom-right':
                                                        x = newPdf.internal.pageSize.getWidth() - 20;
                                                        y = newPdf.internal.pageSize.getHeight() - 20;
                                                        break;
                                                case 'center':
                                                        x = newPdf.internal.pageSize.getWidth() / 2;
                                                        y = newPdf.internal.pageSize.getHeight() / 2;
                                                        break;
                                        }

                                        if (watermark.type === 'text') {
                                                const hex = watermark.color || '#000000';
                                                const r = parseInt(hex.slice(1, 3), 16);
                                                const g = parseInt(hex.slice(3, 5), 16);
                                                const b = parseInt(hex.slice(5, 7), 16);

                                                (newPdf as CustomJsPDF).setTextColor(r, g, b, opacity);
                                                (newPdf as CustomJsPDF).setFontSize(20 * scale);
                                                (newPdf as CustomJsPDF).text(watermark.content, x, y, { angle: rotation });
                                        } else {
                                                const img = new window.Image();
                                                img.src = watermark.content;
                                                await new Promise((resolve, reject) => {
                                                        img.onload = () => {
                                                                try {
                                                                        const maxWidth = 100;
                                                                        const maxHeight = 100;

                                                                        let imgWidth = img.width;
                                                                        let imgHeight = img.height;
                                                                        const aspectRatio = imgWidth / imgHeight;

                                                                        if (imgWidth > maxWidth) {
                                                                                imgWidth = maxWidth;
                                                                                imgHeight = imgWidth / aspectRatio;
                                                                        }
                                                                        if (imgHeight > maxHeight) {
                                                                                imgHeight = maxHeight;
                                                                                imgWidth = imgHeight * aspectRatio;
                                                                        }

                                                                        imgWidth *= scale;
                                                                        imgHeight *= scale;

                                                                        newPdf.addImage(
                                                                                img,
                                                                                'JPEG',
                                                                                x - imgWidth / 2,
                                                                                y - imgHeight / 2,
                                                                                imgWidth,
                                                                                imgHeight
                                                                        );
                                                                        resolve(null);
                                                                } catch (err) {
                                                                        reject(err);
                                                                }
                                                        };
                                                        img.onerror = () => reject(new Error('Failed to load watermark image'));
                                                });
                                        }
                                }

                                setProgress(((i + 1) / pdf.numPages) * 100);
                        }

                        newPdf.save('bitpdfmaker.pro.pdf');
                } catch (err) {
                        setError('Error applying watermarks');
                        console.error(err);
                } finally {
                        setLoading(false);
                        setProgress(0);
                }
        }, [file, watermarks]);

        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Add Watermark to PDF - Free Online PDF Watermark Tool</title>
                                <meta name="description" content="Add text or image watermarks to your PDF files online. Customize watermark position, opacity, rotation, and scale. Free PDF watermark tool, no registration required. Process PDFs securely in your browser." />
                                <meta name="keywords" content="pdf watermark, add watermark to pdf, text watermark, image watermark, pdf editor, free pdf tool, online pdf watermark, pdf customization" />
                                <meta name="robots" content="index, follow" />
                                <meta property="og:title" content="Add Watermark to PDF - Free Online PDF Watermark Tool" />
                                <meta property="og:description" content="Add text or image watermarks to your PDF files online. Customize watermark position, opacity, rotation, and scale. Free PDF watermark tool, no registration required." />
                                <meta property="og:type" content="website" />
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Add Watermark to PDF - Free Online PDF Watermark Tool" />
                                <meta name="twitter:description" content="Add text or image watermarks to your PDF files online. Customize watermark position, opacity, rotation, and scale. Free PDF watermark tool, no registration required." />
                                <link rel="canonical" href="https://bitpdfmaker.pro/pdf-watermark" />
                        </Head>
                        <Header />
                        <ExternalScripts />
                        <main className="container mx-auto px-4 py-8">
                                <div className="max-w-4xl mx-auto">
                                        <article className="bg-white rounded-lg shadow-md p-6">
                                                <header>
                                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Watermark to PDF</h1>
                                                        <p className="text-gray-600 mb-6">
                                                                Add text or image watermarks to your PDF files. Customize the position, opacity, rotation, and scale of each watermark.
                                                                Select specific pages to apply watermarks.
                                                        </p>
                                                </header>

                                                {file && watermarks.length > 0 && (
                                                        <button
                                                                onClick={applyWatermarks}
                                                                disabled={loading}
                                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mb-6"
                                                        >
                                                                {loading ? 'Applying Watermarks...' : 'Apply Watermarks'}
                                                        </button>
                                                )}

                                                <div className="space-y-6">
                                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                                                                <input
                                                                        type="file"
                                                                        ref={fileInputRef}
                                                                        onChange={handleFileChange}
                                                                        accept="application/pdf"
                                                                        className="hidden"
                                                                />
                                                                <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                                >
                                                                        Select PDF
                                                                </button>
                                                                <p className="mt-2 text-sm text-gray-500">
                                                                        Select a PDF file to add watermarks
                                                                </p>
                                                        </div>

                                                        {error && (
                                                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                                                        {error}
                                                                </div>
                                                        )}

                                                        {loading && (
                                                                <div className="space-y-2">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                                <div
                                                                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                                                        style={{ width: `${progress}%` }}
                                                                                ></div>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 text-center">
                                                                                Applying watermarks... {Math.round(progress)}%
                                                                        </p>
                                                                </div>
                                                        )}

                                                        {file && (
                                                                <div className="space-y-4">
                                                                        <div className="flex justify-between items-center">
                                                                                <h2 className="text-lg font-semibold text-gray-900">Watermarks</h2>
                                                                                <div className="space-x-2">
                                                                                        <button
                                                                                                onClick={addTextWatermark}
                                                                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                                                        >
                                                                                                Add Text
                                                                                        </button>
                                                                                        <input
                                                                                                type="file"
                                                                                                ref={watermarkImageInputRef}
                                                                                                onChange={addImageWatermark}
                                                                                                accept="image/*"
                                                                                                className="hidden"
                                                                                        />
                                                                                        <button
                                                                                                onClick={() => watermarkImageInputRef.current?.click()}
                                                                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                                                        >
                                                                                                Add Image
                                                                                        </button>
                                                                                </div>
                                                                        </div>

                                                                        {watermarks.map((watermark) => (
                                                                                <WatermarkForm
                                                                                        key={watermark.id}
                                                                                        watermark={watermark}
                                                                                        onUpdate={updateWatermark}
                                                                                        totalPages={totalPages}
                                                                                />
                                                                        ))}
                                                                </div>
                                                        )}

                                                        <section className="mt-8 space-y-4 text-gray-600" aria-label="Instructions">
                                                                <h2 className="text-xl font-semibold text-gray-900">How to Add Watermarks to PDF</h2>
                                                                <ol className="list-decimal list-inside space-y-2">
                                                                        <li>Select your PDF file using the &quot;Select PDF&quot; button</li>
                                                                        <li>Add text or image watermarks using the respective buttons</li>
                                                                        <li>Customize each watermark&apos;s position, opacity, rotation, and scale</li>
                                                                        <li>Select which pages should display each watermark</li>
                                                                        <li>Click &quot;Apply Watermarks&quot; to process your PDF</li>
                                                                        <li>Your watermarked PDF will be automatically downloaded</li>
                                                                </ol>

                                                                <div className="mt-6">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                                                        <ul className="list-disc list-inside space-y-1">
                                                                                <li>Add text or image watermarks</li>
                                                                                <li>Customize watermark position and appearance</li>
                                                                                <li>Apply watermarks to specific pages</li>
                                                                                <li>Multiple watermarks per document</li>
                                                                                <li>Adjust opacity, rotation, and scale</li>
                                                                                <li>Free to use, no registration required</li>
                                                                                <li>All processing done in your browser</li>
                                                                        </ul>
                                                                </div>
                                                        </section>

                                                        <footer className="mt-8 text-sm text-gray-500">
                                                                <p>All PDF processing is done securely in your browser. Your files are never uploaded to our servers.</p>
                                                        </footer>
                                                </div>
                                        </article>
                                </div>
                        </main>
                </div>
        );
} 