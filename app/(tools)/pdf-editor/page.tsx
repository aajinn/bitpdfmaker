"use client";

import React from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import PdfEditor from "../../components/PdfEditor";

export default function PDFEditorPage() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Advanced PDF Editor - Free Online PDF Editor Tool | BitPDFMaker</title>
                                <meta name="description" content="Edit PDF files online for free with advanced text positioning, color, size, and alignment controls. No registration required. Fast, secure, and easy to use PDF editor tool." />
                                <meta name="keywords" content="pdf editor, edit pdf online, pdf text editor, free pdf editor, edit pdf files, pdf content editor, advanced pdf editor" />
                                <meta name="robots" content="index, follow, max-image-preview:large" />
                                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
                                <meta name="author" content="BitPDFMaker" />
                                <meta name="application-name" content="BitPDFMaker" />
                                {/* Open Graph */}
                                <meta property="og:title" content="Advanced PDF Editor - Free Online PDF Editor Tool | BitPDFMaker" />
                                <meta property="og:description" content="Edit PDF files online for free with advanced text positioning, color, size, and alignment controls. No registration required. Fast, secure, and easy to use PDF editor tool." />
                                <meta property="og:type" content="website" />
                                <meta property="og:url" content="https://bitpdfmaker.pro/pdf-editor" />
                                <meta property="og:site_name" content="BitPDFMaker" />
                                <meta property="og:locale" content="en_US" />
                                {/* Twitter */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Advanced PDF Editor - Free Online PDF Editor Tool | BitPDFMaker" />
                                <meta name="twitter:description" content="Edit PDF files online for free with advanced text positioning, color, size, and alignment controls. No registration required. Fast, secure, and easy to use PDF editor tool." />
                                <meta name="twitter:site" content="@bitpdfmaker" />
                                {/* Canonical */}
                                <link rel="canonical" href="https://bitpdfmaker.pro/pdf-editor" />
                                {/* Structured Data */}
                                <script type="application/ld+json">
                                        {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "WebApplication",
                                                "name": "Advanced PDF Editor Tool",
                                                "description": "Edit PDF files online for free with advanced text positioning, color, size, and alignment controls. No registration required.",
                                                "url": "https://bitpdfmaker.pro/pdf-editor",
                                                "applicationCategory": "UtilityApplication",
                                                "operatingSystem": "Any",
                                                "offers": {
                                                        "@type": "Offer",
                                                        "price": "0",
                                                        "priceCurrency": "USD"
                                                },
                                                "featureList": [
                                                        "Advanced text positioning",
                                                        "Text color and size editing",
                                                        "Text alignment controls",
                                                        "Drag and drop text elements",
                                                        "Multi-page editing",
                                                        "Free to use",
                                                        "No registration required",
                                                        "Browser-side processing"
                                                ]
                                        })}
                                </script>
                        </Head>
                        <ExternalScripts />
                        <Header />
                        <main className="container mx-auto px-4 py-8">
                                <div className="max-w-6xl mx-auto">
                                        {/* Hero Section */}
                                        <div className="text-center mb-8">
                                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                                        Advanced PDF Editor
                                                </h1>
                                                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                                        Edit your PDF files online with advanced text controls. Change text position, color, size, and alignment directly on the PDF.
                                                        No registration required. Fast, secure, and easy to use.
                                                </p>
                                        </div>

                                        {/* Features Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                                </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Positioning</h3>
                                                        <p className="text-gray-600">
                                                                Click and drag text elements to reposition them anywhere on the page with pixel-perfect control.
                                                        </p>
                                                </div>
                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                                </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Controls</h3>
                                                        <p className="text-gray-600">
                                                                Change font size, family, color, and alignment with intuitive controls. Real-time preview of all changes.
                                                        </p>
                                                </div>
                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Free</h3>
                                                        <p className="text-gray-600">
                                                                100% free to use with no registration required. All processing done in your browser for maximum security.
                                                        </p>
                                                </div>
                                        </div>

                                        {/* Advanced PDF Editor Component */}
                                        <PdfEditor className="mb-8" />

                                        {/* Instructions Section */}
                                        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Edit PDFs</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
                                                                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                                                        <li>Click &quot;Load PDF&quot; to upload an existing PDF file (optional)</li>
                                                                        <li>Enter text in the input field and click &quot;Add Text&quot; to place it on the page</li>
                                                                        <li>Click on any text element to select and edit it</li>
                                                                        <li>Drag selected text elements to reposition them</li>
                                                                        <li>Use the formatting controls to change appearance</li>
                                                                        <li>Click &quot;Save PDF&quot; to download your edited document</li>
                                                                </ol>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Advanced Features</h3>
                                                                <ul className="list-disc list-inside space-y-2 text-gray-600">
                                                                        <li>Pixel-perfect text positioning with drag and drop</li>
                                                                        <li>Multiple font sizes from 8px to 72px</li>
                                                                        <li>Six different font families to choose from</li>
                                                                        <li>Full color picker for text customization</li>
                                                                        <li>Left, center, and right text alignment</li>
                                                                        <li>Multi-page document support</li>
                                                                        <li>Real-time preview of all changes</li>
                                                                        <li>Instant PDF generation and download</li>
                                                                </ul>
                                                        </div>
                                                </div>
                                        </section>
                                </div>
                        </main>
                </div>
        );
} 