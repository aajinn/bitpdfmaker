"use client";

import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import MergePdfTool from "./Tool";

export default function MergePDF() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker</title>
                                <meta name="description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta name="keywords" content="merge pdf, combine pdf, pdf merger, free pdf tool, pdf combiner, merge pdf online, combine pdf files, pdf joiner, merge multiple pdfs" />
                                <meta name="robots" content="index, follow, max-image-preview:large" />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
                                <meta name="author" content="BitPDFMaker" />
                                <meta name="application-name" content="BitPDFMaker" />

                                {/* Open Graph */}
                                <meta property="og:title" content="Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker" />
                                <meta property="og:description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta property="og:type" content="website" />
                                <meta property="og:url" content="https://bitpdfmaker.pro/merge-pdf" />
                                <meta property="og:site_name" content="BitPDFMaker" />
                                <meta property="og:locale" content="en_US" />

                                {/* Twitter */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Merge PDF Files Online - Free PDF Merger Tool | BitPDFMaker" />
                                <meta name="twitter:description" content="Merge multiple PDF files into one document online for free. No registration required. Fast, secure, and easy to use PDF merger tool with drag & drop support." />
                                <meta name="twitter:site" content="@bitpdfmaker" />

                                {/* Canonical */}
                                <link rel="canonical" href="https://bitpdfmaker.pro/merge-pdf" />

                                {/* Structured Data */}
                                <script type="application/ld+json">
                                        {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "WebApplication",
                                                "name": "PDF Merger Tool",
                                                "description": "Merge multiple PDF files into one document online for free. No registration required.",
                                                "url": "https://bitpdfmaker.pro/merge-pdf",
                                                "applicationCategory": "UtilityApplication",
                                                "operatingSystem": "Any",
                                                "offers": {
                                                        "@type": "Offer",
                                                        "price": "0",
                                                        "priceCurrency": "USD"
                                                },
                                                "featureList": [
                                                        "Merge multiple PDF files",
                                                        "Drag and drop support",
                                                        "Arrange files in any order",
                                                        "Free to use",
                                                        "No registration required",
                                                        "Browser-side processing"
                                                ]
                                        })}
                                </script>
                        </Head>
                        <Header />
                        <ExternalScripts />
                        <main className="container mx-auto px-4 py-8">
                                <div className="max-w-4xl mx-auto">
                                        <MergePdfTool />
                                </div>
                        </main>
                </div>
        );
} 