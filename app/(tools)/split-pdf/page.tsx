"use client";

import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import Head from "next/head";
import Tool from "./Tool";

export default function SplitPDFPage() {
        return (
                <>
                        <Head>
                                <title>Split PDF - Free Online PDF Splitter | BitMakerPdf</title>
                                <meta name="description" content="Split PDF files into multiple documents. Extract specific pages or custom page ranges and save as separate PDFs. 100% free, no registration required." />
                                <meta name="keywords" content="split pdf, pdf splitter, extract pdf pages, split pdf online, free pdf splitter, custom page ranges" />
                                <meta property="og:title" content="Split PDF - Free Online PDF Splitter" />
                                <meta property="og:description" content="Split PDF files into multiple documents. Extract specific pages or custom page ranges and save as separate PDFs. 100% free, no registration required." />
                                <meta property="og:type" content="website" />
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content="Split PDF - Free Online PDF Splitter" />
                                <meta name="twitter:description" content="Split PDF files into multiple documents. Extract specific pages or custom page ranges and save as separate PDFs. 100% free, no registration required." />
                        </Head>
                        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                                <Header />
                                <ExternalScripts />
                                <Tool />
                        </main>
                </>
        );
} 