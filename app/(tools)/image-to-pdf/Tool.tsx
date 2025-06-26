"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageFile {
        file: File;
        preview: string;
}

export default function Tool() {
        const [images, setImages] = useState<ImageFile[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [progress, setProgress] = useState(0);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(e.target.files || []);
                const validFiles = files.filter(file => file.type.startsWith('image/'));

                if (validFiles.length === 0) {
                        setError('Please select valid image files');
                        return;
                }

                const newImages = validFiles.map(file => ({
                        file,
                        preview: URL.createObjectURL(file)
                }));

                setImages(prev => [...prev, ...newImages]);
                setError(null);
        };

        const removeImage = (index: number) => {
                setImages(prev => {
                        const newImages = [...prev];
                        URL.revokeObjectURL(newImages[index].preview);
                        newImages.splice(index, 1);
                        return newImages;
                });
        };

        const moveImage = (index: number, direction: 'up' | 'down') => {
                setImages(prev => {
                        const newImages = [...prev];
                        const newIndex = direction === 'up' ? index - 1 : index + 1;
                        if (newIndex < 0 || newIndex >= newImages.length) return newImages;
                        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
                        return newImages;
                });
        };

        const convertToPDF = async () => {
                if (images.length === 0) {
                        setError('Please select at least one image');
                        return;
                }

                setLoading(true);
                setError(null);
                setProgress(0);

                try {
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF();
                        let isFirstPage = true;

                        for (let i = 0; i < images.length; i++) {
                                const image = images[i];
                                if (!isFirstPage) {
                                        pdf.addPage();
                                }
                                isFirstPage = false;

                                const img = new window.Image();
                                img.src = image.preview;
                                await new Promise((resolve, reject) => {
                                        img.onload = () => {
                                                try {
                                                        const imgProps = pdf.getImageProperties(img);
                                                        const pdfWidth = pdf.internal.pageSize.getWidth();
                                                        const pdfHeight = pdf.internal.pageSize.getHeight();
                                                        const imgWidth = imgProps.width;
                                                        const imgHeight = imgProps.height;
                                                        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                                                        const width = imgWidth * ratio;
                                                        const height = imgHeight * ratio;
                                                        const x = (pdfWidth - width) / 2;
                                                        const y = (pdfHeight - height) / 2;
                                                        pdf.addImage(img, 'JPEG', x, y, width, height);
                                                        setProgress(((i + 1) / images.length) * 100);
                                                        resolve(null);
                                                } catch (err) {
                                                        reject(err);
                                                }
                                        };
                                        img.onerror = () => reject(new Error('Failed to load image'));
                                });
                        }

                        pdf.save('bitpdfmaker.pro.pdf');
                } catch (err) {
                        setError('Error converting images to PDF');
                        console.error(err);
                } finally {
                        setLoading(false);
                        setProgress(0);
                }
        };

        return (
                <main className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                                <article className="bg-white rounded-lg shadow-md p-6">
                                        <header>
                                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Convert Images to PDF</h1>
                                                <p className="text-gray-600 mb-6">
                                                        Convert your images to PDF format easily. Supports JPG, PNG, and GIF files.
                                                        Arrange images in any order before converting.
                                                </p>
                                        </header>

                                        {images.length > 0 && (
                                                <button
                                                        onClick={convertToPDF}
                                                        disabled={loading}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mb-6"
                                                >
                                                        {loading ? 'Converting...' : 'Convert to PDF'}
                                                </button>
                                        )}

                                        <div className="space-y-6">
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                                                        <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                onChange={handleFileChange}
                                                                accept="image/*"
                                                                multiple
                                                                className="hidden"
                                                        />
                                                        <button
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                        >
                                                                Select Images
                                                        </button>
                                                        <p className="mt-2 text-sm text-gray-500">
                                                                Supported formats: JPG, PNG, GIF
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
                                                                        Converting images to PDF... {Math.round(progress)}%
                                                                </p>
                                                        </div>
                                                )}

                                                {images.length > 0 && (
                                                        <div className="space-y-4">
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {images.map((image, index) => (
                                                                                <div key={index} className="relative group">
                                                                                        <div className="h-48 relative bg-gray-100 rounded-lg overflow-hidden">
                                                                                                <Image
                                                                                                        src={image.preview}
                                                                                                        alt={`Image ${index + 1}`}
                                                                                                        fill
                                                                                                        className="object-contain rounded-lg"
                                                                                                />
                                                                                        </div>
                                                                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                                                                                <button
                                                                                                        onClick={() => moveImage(index, 'up')}
                                                                                                        disabled={index === 0}
                                                                                                        className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                                                                                                        title="Move up"
                                                                                                >
                                                                                                        ↑
                                                                                                </button>
                                                                                                <button
                                                                                                        onClick={() => moveImage(index, 'down')}
                                                                                                        disabled={index === images.length - 1}
                                                                                                        className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                                                                                                        title="Move down"
                                                                                                >
                                                                                                        ↓
                                                                                                </button>
                                                                                                <button
                                                                                                        onClick={() => removeImage(index)}
                                                                                                        className="p-1 bg-white rounded-full hover:bg-gray-100"
                                                                                                        title="Remove image"
                                                                                                >
                                                                                                        ×
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>

                                                                <div className="flex justify-between items-center">
                                                                        <p className="text-sm text-gray-500">
                                                                                {images.length} image{images.length !== 1 ? 's' : ''} selected
                                                                        </p>
                                                                </div>
                                                        </div>
                                                )}

                                                <section className="mt-8 space-y-4 text-gray-600" aria-label="Instructions">
                                                        <h2 className="text-xl font-semibold text-gray-900">How to Convert Images to PDF</h2>
                                                        <ol className="list-decimal list-inside space-y-2">
                                                                <li>Click the &quot;Select Images&quot; button to choose your image files</li>
                                                                <li>Arrange the images in your preferred order using the up/down arrows</li>
                                                                <li>Remove any unwanted images using the remove button</li>
                                                                <li>Click &quot;Convert to PDF&quot; to create your PDF file</li>
                                                                <li>Your PDF will be automatically downloaded when ready</li>
                                                        </ol>

                                                        <div className="mt-6">
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                                                <ul className="list-disc list-inside space-y-1">
                                                                        <li>Convert multiple images to a single PDF</li>
                                                                        <li>Support for JPG, PNG, and GIF formats</li>
                                                                        <li>Arrange images in any order</li>
                                                                        <li>Preview images before conversion</li>
                                                                        <li>Free to use, no registration required</li>
                                                                        <li>All processing done in your browser</li>
                                                                </ul>
                                                        </div>
                                                </section>

                                                <footer className="mt-8 text-sm text-gray-500">
                                                        <p>All image processing is done securely in your browser. Your files are never uploaded to our servers.</p>
                                                </footer>
                                        </div>
                                </article>
                        </div>
                </main>
        );
} 