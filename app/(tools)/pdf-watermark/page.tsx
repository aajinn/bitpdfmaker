"use client";

import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import PdfWatermarkTool from "./Tool";

export default function PDFWatermark() {
        return (
                <div className="min-h-screen bg-gray-100">
                        <Head>
                                <title>Add Watermark to PDF - Free Online PDF Watermarking Tool</title>
                                <meta name="description" content="Easily add text or image watermarks to your PDF files online for free. Customize position, opacity, rotation, and apply to specific pages." />
                                <meta name="keywords" content="pdf watermark, add watermark to pdf, watermark pdf online, free pdf watermark tool, text watermark, image watermark" />
                                <meta property="og:title" content="Add Watermark to PDF - Free Online PDF Watermarking Tool" />
                                <meta property="og:description" content="Easily add text or image watermarks to your PDF files online for free. Customize position, opacity, rotation, and apply to specific pages." />
                                <meta property="og:type" content="website" />
                                <link rel="canonical" href="https://bitpdfmaker.pro/pdf-watermark" />
                        </Head>
                        <Header />
                        <ExternalScripts />
                        <main className="container mx-auto px-4 py-8">
                                <div className="max-w-4xl mx-auto">
                                        <PdfWatermarkTool />
                                </div>
                        </main>
                </div>
        );
} 