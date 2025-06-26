"use client";

import Header from "../../components/Header";
import PdfViewerTool from "./Tool";

export default function PDFViewer() {
        return (
                <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-100 font-sans flex flex-col">
                        <Header />

                        <section className="flex-grow flex flex-col items-center p-2 sm:p-6">
                                <PdfViewerTool />
                        </section>
                </main>
        );
}
