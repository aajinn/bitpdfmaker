"use client";

import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import ExtractTextFromPdfTool from "./Tool";

export default function ExtractTextFromPDF() {
        return (
                <>
                        <Head>
                                <title>Extract Text from PDF - Free Online PDF Text Extractor | BitMakerPdf</title>
                                <meta name="description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results. No registration required." />
                                <meta name="keywords" content="PDF text extractor, PDF to text, extract text from PDF, PDF OCR, image PDF to text, free PDF converter" />
                                <meta property="og:title" content="Extract Text from PDF - Free Online PDF Text Extractor" />
                                <meta property="og:description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results." />
                                <meta property="og:type" content="website" />
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Extract Text from PDF - Free Online PDF Text Extractor" />
                                <meta name="twitter:description" content="Extract text from PDF files easily with our free online tool. Convert PDF to text with high accuracy, support for image-based PDFs with OCR, and instant results." />
                        </Head>
                        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                                <Header />
                                <ExternalScripts />
                                <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                                        <ExtractTextFromPdfTool />
                                </section>
                        </main>
                </>
        );
} 