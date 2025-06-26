"use client";

import { useState, useRef, useCallback, memo } from "react";
import Image from "next/image";
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

export default function PdfWatermarkTool() {
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
                setWatermarks(prev =>
                        prev.map(w => (w.id === id ? { ...w, ...updates } : w))
                );
        }, []);

        const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                } : null;
        };

        const handleApplyWatermarks = async () => {
                if (!file || watermarks.length === 0) return;
                setLoading(true);
                setError(null);
                setProgress(0);

                try {
                        const existingPdfBytes = await file.arrayBuffer();
                        const pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(existingPdfBytes) }).promise;
                        const newPdf = new jsPDF() as CustomJsPDF;

                        for (let i = 1; i <= pdfDoc.numPages; i++) {
                                if (i > 1) newPdf.addPage();
                                const page = await pdfDoc.getPage(i);
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                await page.render({ canvasContext: context!, viewport }).promise;
                                const imgData = canvas.toDataURL('image/jpeg');
                                newPdf.addImage(imgData, 'JPEG', 0, 0, newPdf.internal.pageSize.getWidth(), newPdf.internal.pageSize.getHeight());

                                for (const watermark of watermarks) {
                                        if (watermark.pages.includes(i)) {
                                                // @ts-ignore
                                                newPdf.setGState(new newPdf.GState({ opacity: watermark.opacity }));

                                                const pageWidth = newPdf.internal.pageSize.getWidth();
                                                const pageHeight = newPdf.internal.pageSize.getHeight();

                                                if (watermark.type === 'text') {
                                                        const color = hexToRgb(watermark.color || '#000000');
                                                        if (color) {
                                                                newPdf.setTextColor(color.r, color.g, color.b);
                                                        }
                                                        newPdf.setFontSize(48 * watermark.scale);
                                                        const textWidth = newPdf.getStringUnitWidth(watermark.content) * newPdf.getFontSize() / newPdf.internal.scaleFactor;
                                                        const textHeight = newPdf.getLineHeight() / newPdf.internal.scaleFactor;

                                                        let x = 0, y = 0;
                                                        switch (watermark.position) {
                                                                case 'top-left': x = 10; y = textHeight; break;
                                                                case 'top-right': x = pageWidth - textWidth - 10; y = textHeight; break;
                                                                case 'bottom-left': x = 10; y = pageHeight - 10; break;
                                                                case 'bottom-right': x = pageWidth - textWidth - 10; y = pageHeight - 10; break;
                                                                case 'center': x = (pageWidth - textWidth) / 2; y = pageHeight / 2; break;
                                                        }

                                                        newPdf.text(watermark.content, x, y, { angle: watermark.rotation });
                                                } else if (watermark.type === 'image') {
                                                        const image = new window.Image();
                                                        image.onload = () => {
                                                                const imgWidth = image.width * watermark.scale;
                                                                const imgHeight = image.height * watermark.scale;

                                                                let x = 0, y = 0;
                                                                switch (watermark.position) {
                                                                        case 'top-left': x = 10; y = 10; break;
                                                                        case 'top-right': x = pageWidth - imgWidth - 10; y = 10; break;
                                                                        case 'bottom-left': x = 10; y = pageHeight - imgHeight - 10; break;
                                                                        case 'bottom-right': x = pageWidth - imgWidth - 10; y = pageHeight - imgHeight - 10; break;
                                                                        case 'center': x = (pageWidth - imgWidth) / 2; y = (pageHeight - imgHeight) / 2; break;
                                                                }

                                                                // Rotation requires canvas manipulation for images
                                                                const rotatedCanvas = document.createElement('canvas');
                                                                const rotatedContext = rotatedCanvas.getContext('2d');
                                                                const angle = watermark.rotation * Math.PI / 180;
                                                                rotatedCanvas.width = imgWidth;
                                                                rotatedCanvas.height = imgHeight;

                                                                rotatedContext?.translate(imgWidth / 2, imgHeight / 2);
                                                                rotatedContext?.rotate(angle);
                                                                rotatedContext?.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

                                                                newPdf.addImage(rotatedCanvas.toDataURL(), 'PNG', x, y, imgWidth, imgHeight);
                                                        };
                                                        image.src = watermark.content;
                                                }

                                                // @ts-ignore
                                                newPdf.setGState(new newPdf.GState({ opacity: 1 }));
                                        }
                                }
                                setProgress(((i) / pdfDoc.numPages) * 100);
                        }

                        newPdf.save('watermarked.pdf');
                } catch (err) {
                        setError('Error applying watermarks. Please try again.');
                        console.error(err);
                } finally {
                        setLoading(false);
                }
        };

        return (
                <article className="bg-white p-6 rounded-lg shadow-md">
                        <header>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Watermark</h1>
                                <p className="text-gray-600 mb-6">
                                        Add text or image watermarks to your PDF files. Customize position, opacity, rotation, and more.
                                </p>
                        </header>

                        <div className="space-y-6">
                                {/* File Input */}
                                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                        <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                ref={fileInputRef}
                                        />
                                        <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-3 bg-blue-100 rounded-full">
                                                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a4 4 0 01-4 4H7z" />
                                                        </svg>
                                                </div>
                                                <p className="text-gray-600">
                                                        {file ? `Selected: ${file.name}` : 'Drag & drop a PDF file here, or click to select'}
                                                </p>
                                                <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                        Select PDF
                                                </button>
                                        </div>
                                </div>

                                {error && <div className="text-red-500 text-center">{error}</div>}

                                {file && (
                                        <>
                                                {/* Watermark Controls */}
                                                <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                                <h2 className="text-xl font-semibold text-gray-800">Watermarks</h2>
                                                                <div className="flex gap-2">
                                                                        <button
                                                                                onClick={addTextWatermark}
                                                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                                                        >
                                                                                Add Text
                                                                        </button>
                                                                        <button
                                                                                onClick={() => watermarkImageInputRef.current?.click()}
                                                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                                                        >
                                                                                Add Image
                                                                        </button>
                                                                        <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={addImageWatermark}
                                                                                className="hidden"
                                                                                ref={watermarkImageInputRef}
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                                {watermarks.map(w => (
                                                                        <WatermarkForm
                                                                                key={w.id}
                                                                                watermark={w}
                                                                                onUpdate={updateWatermark}
                                                                                totalPages={totalPages}
                                                                        />
                                                                ))}
                                                        </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                        onClick={handleApplyWatermarks}
                                                        disabled={loading || watermarks.length === 0}
                                                        className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center justify-center gap-2"
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        <span>Applying Watermarks... ({progress.toFixed(0)}%)</span>
                                                                </>
                                                        ) : (
                                                                'Apply Watermarks & Download'
                                                        )}
                                                </button>
                                        </>
                                )}
                        </div>
                </article>
        );
} 