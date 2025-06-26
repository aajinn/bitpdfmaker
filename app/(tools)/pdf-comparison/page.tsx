"use client";

import React from "react";
import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import PdfComparisonTool from "./Tool";

export default function PDFComparison() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Compare PDFs - PDF Difference Tool | BitPDFMaker</title>
                                <meta name="description" content="Compare two PDF files side by side, highlight differences, and track changes. Free online PDF comparison tool by BitPDFMaker." />
                                <meta name="keywords" content="compare pdf, pdf diff, pdf comparison, highlight pdf differences, pdf change tracking, free pdf tool" />
                                <meta name="robots" content="index, follow, max-image-preview:large" />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
                                <meta name="author" content="BitPDFMaker" />
                                <meta name="application-name" content="BitPDFMaker" />
                                {/* Open Graph */}
                                <meta property="og:title" content="Compare PDFs - PDF Difference Tool | BitPDFMaker" />
                                <meta property="og:description" content="Compare two PDF files side by side, highlight differences, and track changes. Free online PDF comparison tool by BitPDFMaker." />
                                <meta property="og:type" content="website" />
                                <meta property="og:url" content="https://bitpdfmaker.pro/pdf-comparison" />
                                <meta property="og:site_name" content="BitPDFMaker" />
                                <meta property="og:locale" content="en_US" />
                                {/* Twitter */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Compare PDFs - PDF Difference Tool | BitPDFMaker" />
                                <meta name="twitter:description" content="Compare two PDF files side by side, highlight differences, and track changes. Free online PDF comparison tool by BitPDFMaker." />
                                <meta name="twitter:site" content="@bitpdfmaker" />
                                {/* Canonical */}
                                <link rel="canonical" href="https://bitpdfmaker.pro/pdf-comparison" />
                                {/* Structured Data */}
                                <script type="application/ld+json">
                                        {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "WebApplication",
                                                "name": "PDF Comparison Tool",
                                                "description": "Compare two PDF files side by side, highlight differences, and track changes. Free online PDF comparison tool.",
                                                "url": "https://bitpdfmaker.pro/pdf-comparison",
                                                "applicationCategory": "UtilityApplication",
                                                "operatingSystem": "Any",
                                                "offers": {
                                                        "@type": "Offer",
                                                        "price": "0",
                                                        "priceCurrency": "USD"
                                                },
                                                "featureList": [
                                                        "Side-by-side PDF comparison",
                                                        "Highlight differences",
                                                        "Change tracking",
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
                                        <PdfComparisonTool />
                                </div>
                        </main>
                </div>
        );
} 