"use client";

import React from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import PdfMetadataEditorTool from "./Tool";

export default function PDFMetadataEditor() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Edit PDF Metadata - Free PDF Metadata Editor | BitPDFMaker</title>
                                <meta name="description" content="Edit PDF metadata properties like title, author, keywords, and more online for free. No registration required. Fast, secure, and easy to use PDF metadata editor tool." />
                                <meta name="keywords" content="edit pdf metadata, pdf properties, pdf info, pdf title, pdf author, pdf keywords, pdf editor, free pdf tool, pdf metadata editor" />
                                <meta name="robots" content="index, follow, max-image-preview:large" />
                                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
                                <meta name="author" content="BitPDFMaker" />
                                <meta name="application-name" content="BitPDFMaker" />
                                {/* Open Graph */}
                                <meta property="og:title" content="Edit PDF Metadata - Free PDF Metadata Editor | BitPDFMaker" />
                                <meta property="og:description" content="Edit PDF metadata properties like title, author, keywords, and more online for free. No registration required. Fast, secure, and easy to use PDF metadata editor tool." />
                                <meta property="og:type" content="website" />
                                <meta property="og:url" content="https://bitpdfmaker.pro/pdf-metadata-editor" />
                                <meta property="og:site_name" content="BitPDFMaker" />
                                <meta property="og:locale" content="en_US" />
                                {/* Twitter */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Edit PDF Metadata - Free PDF Metadata Editor | BitPDFMaker" />
                                <meta name="twitter:description" content="Edit PDF metadata properties like title, author, keywords, and more online for free. No registration required. Fast, secure, and easy to use PDF metadata editor tool." />
                                <meta name="twitter:site" content="@bitpdfmaker" />
                                {/* Canonical */}
                                <link rel="canonical" href="https://bitpdfmaker.pro/pdf-metadata-editor" />
                                {/* Structured Data */}
                                <script type="application/ld+json">
                                        {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "WebApplication",
                                                "name": "PDF Metadata Editor Tool",
                                                "description": "Edit PDF metadata properties like title, author, keywords, and more online for free. No registration required.",
                                                "url": "https://bitpdfmaker.pro/pdf-metadata-editor",
                                                "applicationCategory": "UtilityApplication",
                                                "operatingSystem": "Any",
                                                "offers": {
                                                        "@type": "Offer",
                                                        "price": "0",
                                                        "priceCurrency": "USD"
                                                },
                                                "featureList": [
                                                        "Edit PDF title, author, subject, keywords, creator, producer",
                                                        "Drag and drop support",
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
                                <div className="max-w-3xl mx-auto">
                                        <PdfMetadataEditorTool />
                                </div>
                        </main>
                </div>
        );
}