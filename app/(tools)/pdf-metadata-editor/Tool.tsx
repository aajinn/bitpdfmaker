"use client";

import React, { useState, useRef } from "react";

interface PDFMetadata {
        title: string;
        author: string;
        subject: string;
        keywords: string;
        creator: string;
        producer: string;
}

export default function PdfMetadataEditorTool() {
        const [pdfFile, setPdfFile] = useState<File | null>(null);
        const [metadata, setMetadata] = useState<PDFMetadata>({
                title: "",
                author: "",
                subject: "",
                keywords: "",
                creator: "",
                producer: "",
        });
        const [isLoading, setIsLoading] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPdfFile(file);
                setIsLoading(true);
                try {
                        const arrayBuffer = await file.arrayBuffer();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pdf: any = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                        // Use the public getMetadata() API
                        const meta = await pdf.getMetadata();
                        setMetadata({
                                title: meta.info.Title || "",
                                author: meta.info.Author || "",
                                subject: meta.info.Subject || "",
                                keywords: meta.info.Keywords || "",
                                creator: meta.info.Creator || "",
                                producer: meta.info.Producer || "",
                        });
                } catch {
                        alert("Failed to read PDF metadata.");
                } finally {
                        setIsLoading(false);
                }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setMetadata((prev) => ({ ...prev, [name]: value }));
        };

        const handleSave = async () => {
                if (!pdfFile) return;
                setIsLoading(true);
                try {
                        // jsPDF is loaded from CDN and not typed
                        const { jsPDF } = window.jspdf;
                        const arrayBuffer = await pdfFile.arrayBuffer();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pdf: any = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                        // Create new PDF and copy pages
                        const newPdf = new jsPDF();
                        const numPages = pdf.numPages;
                        for (let i = 1; i <= numPages; i++) {
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvas = document.createElement("canvas");
                                const context = canvas.getContext("2d");
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;
                                await page.render({ canvasContext: context!, viewport }).promise;
                                const imgData = canvas.toDataURL("image/jpeg", 0.9);
                                if (i > 1) newPdf.addPage();
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                newPdf.addImage(imgData as any, "JPEG", 0, 0, 210, 297);
                        }
                        // Set metadata
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (newPdf as any).setProperties({
                                title: metadata.title,
                                author: metadata.author,
                                subject: metadata.subject,
                                keywords: metadata.keywords,
                                creator: metadata.creator,
                                producer: metadata.producer,
                        });
                        newPdf.save("edited-metadata.pdf");
                } catch {
                        alert("Failed to edit PDF metadata.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (
                <article className="bg-white rounded-lg shadow-md p-6">
                        <header>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">PDF Metadata Editor</h1>
                                <p className="text-gray-600 mb-6 text-center">
                                        Edit PDF properties: title, author, keywords, and more. 100% free and privacy-friendly.
                                </p>
                        </header>
                        <div className="flex flex-col items-center mb-6">
                                <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                />
                                <button
                                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-2"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
                                >
                                        {pdfFile ? "Change PDF" : "Select PDF"}
                                </button>
                                {pdfFile && (
                                        <span className="text-sm text-gray-500 mb-2">{pdfFile.name}</span>
                                )}
                        </div>
                        {pdfFile && (
                                <form className="space-y-4 mt-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                                        <input type="text" name="title" value={metadata.title} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Author</label>
                                                        <input type="text" name="author" value={metadata.author} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                                                        <input type="text" name="subject" value={metadata.subject} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Keywords</label>
                                                        <input type="text" name="keywords" value={metadata.keywords} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Creator</label>
                                                        <input type="text" name="creator" value={metadata.creator} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700">Producer</label>
                                                        <input type="text" name="producer" value={metadata.producer} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                                </div>
                                        </div>
                                        <button
                                                type="submit"
                                                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 mt-4"
                                                disabled={isLoading}
                                        >
                                                {isLoading ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Saving...
                                                        </span>
                                                ) : (
                                                        "Save & Download PDF"
                                                )}
                                        </button>
                                </form>
                        )}
                        <section className="mt-8 space-y-4 text-gray-600" aria-label="Instructions">
                                <h2 className="text-xl font-semibold text-gray-900">How to Edit PDF Metadata</h2>
                                <ol className="list-decimal list-inside space-y-2">
                                        <li>Select your PDF file by clicking &quot;Select PDF&quot;</li>
                                        <li>View and edit the metadata fields as needed</li>
                                        <li>Click &quot;Save &amp; Download PDF&quot; to download the updated file</li>
                                </ol>
                                <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                        <ul className="list-disc list-inside space-y-1">
                                                <li>Edit PDF title, author, subject, keywords, creator, and producer</li>
                                                <li>Drag and drop support for easy file selection (coming soon)</li>
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