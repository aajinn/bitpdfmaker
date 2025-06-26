"use client";

import Header from "../../components/Header";
import ExternalScripts from "../../components/ExternalScripts";
import PdfToImageTool from "./Tool";

export default function PDFToImage() {
        return (
                <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                        <Header />
                        <ExternalScripts />
                        <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                                <PdfToImageTool />
                        </section>
                </main>
        );
} 